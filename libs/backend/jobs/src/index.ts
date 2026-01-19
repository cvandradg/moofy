import puppeteer, { Browser, CookieParam } from 'puppeteer';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import fs from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, DocumentReference, DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import fetch from 'node-fetch';

export { ingestSms } from './ingestSms.js';

function parseApiTimestamp(raw: string): Timestamp {
  const ms = Number(raw.match(/\/Date\((\d+)\)\//)?.[1]);
  if (isNaN(ms)) throw new Error(`Invalid API date format: ${raw}`);
  return Timestamp.fromMillis(ms);
}

function parseDateSafe(str: string): Timestamp | null {
  const s = (str || '').trim();
  if (!s) return null;
  const [m, d, y] = s.split('/').map(Number);
  if (!m || !d || !y) return null;
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return null;
  return Timestamp.fromDate(dt);
}

// --- Project config (avoid "wrong project" surprises, but DON'T crash locally) ---
const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT_ID;

console.log('PROJECT ENV:', {
  GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
  GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
  GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
});

initializeApp(projectId ? { projectId } : undefined);
const db = getFirestore();
const storage = new Storage(projectId ? { projectId } : undefined);

// --- Tunables ---
const EXISTS_READ_BATCH_SIZE = Number(process.env.EXISTS_READ_BATCH_SIZE || '500');
const CONCURRENCY = Number(process.env.CONCURRENCY || '5');

const MAX_ATTEMPTS = 6;
const SCREENSHOT_BUCKET = 'purchase-orders-screenshots';
const MAILBOX_ID = '51619';

// creds (you said keep them for now)
const USERNAME = 'candradeg9182@gmail.com';
const PASSWORD = 'PastryFactory20260116';
const BOT_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJsb2dpbklkIjoiY2FuZHJhZGVnOTE4MkBnbWFpbC5jb20iLCJpc3MiOiJrcmFrZW4iLCJleHAiOjE3NzM4NzUyMDQsImlhdCI6MTc2ODY5MTIwNCwianRpIjoiNTE2NDUzODEtZjYwYy00YzZkLWJhMjEtZGM2ZjQyMjllYWM1In0.SI9CxQlX-UhChabXy7Cp8swCsPKY30OcwXdaV8NJaVsJ35vy3KYdp-kJXl98nvUhAW3-M3LSEIg4NhdtxGQ4jn8yq6RKGeSCb_QifL7nVdStpwJuolrdpX3CsjZWuRgg8MPJLN9XjDrF11i_Sl6DjVOG_Iviop9Ol6ZMuoYsauDD9UAa5TfDGp57j1tnqYp5IcIUIWx56GVonf1XreL66r2Eph7LIJ2xHSajE19wiQczBlsl1xjLRfOfPD4roEBXvuln1gK0U0KfBfANoEXQppf6sDBYFwZ9EiE5KVT0OSUmr5SN9op1PTSgfV8mtZKapC80WS9k_QfjQVwLewrdvA';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const screenshotsDir = path.resolve('screenshots');
function ensureScreenshotsDir() {
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
}

interface InboundDoc {
  DocumentId: number;
  DocumentNumber: string;
  Location: string;
  createdAtTs: Timestamp;
}

interface PurchaseOrderDetails {
  DocumentId: number;
  location: string;
  purchaseOrderNumber: string;
  purchaseOrderDate: Timestamp | null;
  shipDate: Timestamp | null;
  cancelDate: Timestamp | null;
  additionalDetails: Record<string, string>;
  items: Array<Record<string, string>>;
  totals: {
    totalAmount: string;
    totalItems: string;
    totalUnits: string;
  };
  createdAtTs?: Timestamp;
}

function cookieHeaderFrom(cookies: CookieParam[]): string {
  // IMPORTANT: keep empty values (e.g., RLSESSION=) because they are part of the "pristine" set-cookie result.
  return cookies.map((c) => `${c.name}=${c.value ?? ''}`).join('; ');
}

function cloneCookies(cookies: CookieParam[]): CookieParam[] {
  return cookies.map((c) => ({
    name: c.name,
    value: c.value ?? '',
    domain: c.domain || '.wal-mart.com',
    path: c.path || '/',
  }));
}

function parseSetCookieLineToCookieParam(line: string): CookieParam | null {
  const first = String(line || '').split(';', 1)[0] || '';
  const eq = first.indexOf('=');
  if (eq <= 0) return null;

  const name = first.slice(0, eq).trim();
  const value = first.slice(eq + 1); // keep as-is (may contain '=')

  if (!name) return null;
  return { name, value, domain: '.wal-mart.com', path: '/' };
}

function ensureLangCookie(cookies: CookieParam[]): CookieParam[] {
  const hasLang = cookies.some((c) => c.name === 'lang');
  if (hasLang) return cookies;

  // Append lang=en if missing (do not mutate input array)
  return [...cookies, { name: 'lang', value: 'en', domain: '.wal-mart.com', path: '/' }];
}

function mergeCookiesByName(...lists: CookieParam[][]): CookieParam[] {
  const map = new Map<string, CookieParam>();
  for (const list of lists) {
    for (const c of list) {
      if (!c?.name) continue;
      // preserve insertion order; overwrite value if repeated
      map.set(c.name, {
        name: c.name,
        value: c.value ?? '',
        domain: c.domain || '.wal-mart.com',
        path: c.path || '/',
      });
    }
  }
  return Array.from(map.values());
}

// ------------------------------
//  COOKIE PERSISTENCE (STORE ONLY ONCE)
//  - Always login each run to mint "fresh" cookies.
//  - Store cookies in Firestore only if the doc does NOT exist.
//  - For the rest of the calls, prefer stored cookies (validated).
//  - Never overwrite the stored doc (so it remains "pristine").
// ------------------------------
const COOKIES_DOC = db.collection('cookies').doc('cookies');

type StoredCookiesDoc = {
  createdAt: Date;
  createdBy: 'login';
  cookieCount: number;
  userAgent: string;
  // Raw set-cookie headers exactly as received (pristine)
  preSetCookieRaw: string[];
  loginSetCookieRaw: string[];
  // Parsed cookies (also stored for convenience)
  cookies: Array<{ name: string; value: string; domain: string; path: string }>;
};

async function readStoredCookies(): Promise<CookieParam[] | null> {
  const snap = await COOKIES_DOC.get();
  if (!snap.exists) return null;

  const data = snap.data() as Partial<StoredCookiesDoc> | undefined;
  if (!data) return null;

  // Prefer raw (most pristine)
  const raw = (Array.isArray(data.preSetCookieRaw) ? data.preSetCookieRaw : []).concat(
    Array.isArray(data.loginSetCookieRaw) ? data.loginSetCookieRaw : []
  );

  if (raw.length) {
    const parsed = raw.map(parseSetCookieLineToCookieParam).filter((c): c is CookieParam => !!c);

    const merged = ensureLangCookie(mergeCookiesByName(parsed));
    return merged.length ? merged : null;
  }

  // Fallback if raw not present
  const arr = Array.isArray(data.cookies) ? data.cookies : [];
  if (!arr.length) return null;

  const cookies = arr
    .map((c) => ({
      name: String((c as any)?.name || ''),
      value: String((c as any)?.value ?? ''), // keep empty string if any
      domain: String((c as any)?.domain || '.wal-mart.com'),
      path: String((c as any)?.path || '/'),
    }))
    .filter((c) => c.name);

  const merged = ensureLangCookie(mergeCookiesByName(cookies));
  return merged.length ? merged : null;
}

async function storeCookiesOnce(input: {
  cookies: CookieParam[];
  preSetCookieRaw: string[];
  loginSetCookieRaw: string[];
}) {
  const payload: StoredCookiesDoc = {
    createdAt: new Date(),
    createdBy: 'login',
    cookieCount: input.cookies.length,
    userAgent: UA,
    preSetCookieRaw: input.preSetCookieRaw,
    loginSetCookieRaw: input.loginSetCookieRaw,
    cookies: input.cookies.map((c) => ({
      name: c.name,
      value: c.value ?? '',
      domain: c.domain || '.wal-mart.com',
      path: c.path || '/',
    })),
  };

  try {
    // IMPORTANT: create() fails if doc already exists -> ensures "store only once"
    await COOKIES_DOC.create(payload);
    console.log(`✅ Stored cookies ONCE at cookies/cookies (count=${payload.cookieCount})`);
  } catch (e: any) {
    // Already exists -> do nothing (this is expected on subsequent runs)
    const msg = String(e?.message || e);
    if (msg.toLowerCase().includes('already exists')) {
      console.log('ℹ️ cookies/cookies already exists. Not overwriting (as requested).');
      return;
    }
    // Firestore sometimes uses numeric codes; still fail loudly if not an "exists" case.
    if (String(e?.code) === '6') {
      console.log('ℹ️ cookies/cookies already exists. Not overwriting (as requested).');
      return;
    }
    throw e;
  }
}

// Validate cookies against an authenticated endpoint
async function cookiesStillWork(cookies: CookieParam[]): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      documentNumber: '',
      documentType: '',
      vendorNumber: '',
      store: '',
      taSlipNumber: '',
      mailboxId: MAILBOX_ID,
      readStatus: '',
      documentCountry: '',
      newSearch: 'true',
      pageNum: '0',
      pageSize: '1',
      sortDataField: 'CreatedTimestamp',
      sortOrder: 'desc',
      skipWork: 'true',
    });

    const url = `https://retaillink2.wal-mart.com/Webedi2/Inbound/GetInboundDocuments/${MAILBOX_ID}?${params}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': UA,
        Accept: 'application/json, text/plain, */*',
        Referer: 'https://retaillink2.wal-mart.com/',
        cookie: cookieHeaderFrom(cookies),
        'x-bot-token': BOT_TOKEN,
      },
      redirect: 'manual' as any,
    });

    const ct = res.headers.get('content-type') || '';
    const text = await res.text();

    if (res.status !== 200) return false;
    if (ct.includes('text/html')) return false;

    const t = text.trim();
    if (!(t.startsWith('[') || t.startsWith('{'))) return false;

    JSON.parse(t);
    return true;
  } catch {
    return false;
  }
}

function diffCookieNames(a: CookieParam[], b: CookieParam[]) {
  const A = new Set(a.map((c) => c.name));
  const B = new Set(b.map((c) => c.name));
  const onlyA = [...A].filter((x) => !B.has(x));
  const onlyB = [...B].filter((x) => !A.has(x));
  return { onlyA, onlyB };
}

// Login + extract cookies (ALWAYS runs every execution)
async function loginAndGetCookiesAlways(): Promise<{
  cookies: CookieParam[];
  preSetCookieRaw: string[];
  loginSetCookieRaw: string[];
}> {
  console.log('🔑 Performing login (always)…');

  // Preflight to mint any baseline cookies (lang, anti-bot, etc.)
  const pre = await fetch('https://retaillink.login.wal-mart.com/', {
    method: 'GET',
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  const preRaw: string[] = ((pre.headers as any).raw?.()['set-cookie'] || []) as string[];

  const preCookies = preRaw.map(parseSetCookieLineToCookieParam).filter((c): c is CookieParam => !!c);

  // Build cookie header for login request (keep these pristine too)
  const preCookieHeader = preCookies.length ? cookieHeaderFrom(preCookies) : '';
  const loginReqCookieHeader = [preCookieHeader, 'lang=en'].filter(Boolean).join('; ');

  const res = await fetch('https://retaillink.login.wal-mart.com/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      Origin: 'https://retaillink.login.wal-mart.com',
      Referer: 'https://retaillink.login.wal-mart.com/',
      'User-Agent': UA,
      cookie: loginReqCookieHeader,
      'x-bot-token': BOT_TOKEN,
    },
    body: JSON.stringify({
      username: USERNAME,
      password: PASSWORD,
      language: 'en',
    }),
  }).catch((err: unknown) => {
    console.error('LOGIN network error:', err);
    throw err;
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('LOGIN failed:', res.status, res.statusText, text);
    throw new Error(`Login failed: ${text}`);
  }

  const loginRaw: string[] = ((res.headers as any).raw?.()['set-cookie'] || []) as string[];

  const loginCookies = loginRaw.map(parseSetCookieLineToCookieParam).filter((c): c is CookieParam => !!c);

  // Merge pre + login; login wins on duplicates
  const merged = ensureLangCookie(mergeCookiesByName(preCookies, loginCookies));
  console.log(`🍪 Login minted cookies (merged): ${merged.length}`);

  return {
    cookies: merged,
    preSetCookieRaw: preRaw,
    loginSetCookieRaw: loginRaw,
  };
}

/**
 * ✅ Your requested behavior:
 * - Always perform login each run (to mint fresh cookies).
 * - Store cookies to Firestore ONLY if cookies/cookies does not exist (never overwrite).
 * - For all other calls in this run, use the STORED cookies if they validate.
 * - If stored cookies fail validation, use the fresh login cookies for this run (but STILL do not overwrite stored).
 */
async function resolveCookiesForThisRun(): Promise<{
  cookiesForWork: CookieParam[];
  source: 'stored' | 'loginFreshFallback';
}> {
  // Always login (as requested)
  const login = await loginAndGetCookiesAlways();

  // Ensure Firestore doc exists (store only once, never overwrite)
  const stored = await readStoredCookies();
  if (!stored) {
    console.log('🧠 No stored cookies found at cookies/cookies. Storing ONCE…');
    await storeCookiesOnce({
      cookies: login.cookies,
      preSetCookieRaw: login.preSetCookieRaw,
      loginSetCookieRaw: login.loginSetCookieRaw,
    });
    // Use the now-canonical login cookies for this run
    return { cookiesForWork: cloneCookies(login.cookies), source: 'stored' };
  }

  // Validate stored cookies before using them
  console.log(`🧠 Found stored cookies: ${stored.length}. Validating...`);
  const ok = await cookiesStillWork(stored);

  // Optional sanity: compare cookie-name sets (helps detect "messed" storage)
  const diff = diffCookieNames(stored, login.cookies);
  if (diff.onlyA.length || diff.onlyB.length) {
    console.warn('⚠️ Cookie name set differs between stored vs fresh login:', {
      onlyInStored: diff.onlyA.slice(0, 20),
      onlyInFreshLogin: diff.onlyB.slice(0, 20),
    });
  }

  if (ok) {
    console.log('✅ Stored cookies are valid. Using stored cookies for all calls.');
    return { cookiesForWork: cloneCookies(stored), source: 'stored' };
  }

  console.warn(
    '❌ Stored cookies are NOT valid. For safety, using FRESH login cookies for this run (but NOT overwriting stored doc).'
  );
  return { cookiesForWork: cloneCookies(login.cookies), source: 'loginFreshFallback' };
}

async function uploadScreenshot(localPath: string, destFilename: string) {
  await storage.bucket(SCREENSHOT_BUCKET).upload(localPath, {
    destination: destFilename,
  });
  fs.unlinkSync(localPath);
}

async function fetchInboundDocs(browser: Browser, cookies: CookieParam[]): Promise<InboundDoc[]> {
  console.log('📥 Fetching inbound documents…');

  const page = await browser.newPage();
  try {
    page.setDefaultNavigationTimeout(120_000);
    page.setDefaultTimeout(120_000);

    await page.setCookie(...cloneCookies(cookies));
    await page.setExtraHTTPHeaders({ 'x-bot-token': BOT_TOKEN });

    const params = new URLSearchParams({
      documentNumber: '',
      documentType: '',
      vendorNumber: '',
      store: '',
      taSlipNumber: '',
      mailboxId: MAILBOX_ID,
      readStatus: '',
      documentCountry: '',
      newSearch: 'true',
      pageNum: '0',
      pageSize: '1000',
      sortDataField: 'CreatedTimestamp',
      sortOrder: 'desc',
      skipWork: 'true',
    });

    const url = `https://retaillink2.wal-mart.com/Webedi2/Inbound/GetInboundDocuments/${MAILBOX_ID}?${params}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('pre', { timeout: 120_000 });
    const content = await page.$eval('pre', (el) => el.textContent || '[]');

    const docs = JSON.parse(content) as any[];
    console.log(`📄 Fetched ${docs.length} inbound documents`);

    return docs.map((d) => ({
      DocumentId: Number(d.DocumentId),
      DocumentNumber: String(d.DocumentNumber || ''),
      Location: String(d.Location || ''),
      createdAtTs: parseApiTimestamp(String(d.CreatedTimestamp || '')),
    }));
  } finally {
    await page.close().catch(() => {});
  }
}

async function fetchOrderDetails(
  browser: Browser,
  cookies: CookieParam[],
  docId: number,
  location: string
): Promise<PurchaseOrderDetails> {
  console.log(`🔍 Fetching details for PO ${docId}@${location}`);

  const page = await browser.newPage();
  try {
    page.setDefaultNavigationTimeout(120_000);
    page.setDefaultTimeout(120_000);

    await page.setCookie(...cloneCookies(cookies));
    await page.setExtraHTTPHeaders({ 'x-bot-token': BOT_TOKEN });

    const url = `https://retaillink2.wal-mart.com/Webedi2/inbound/purchaseorder/${MAILBOX_ID}/${docId}/${location}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    ensureScreenshotsDir();

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const anchor = await page.waitForSelector('#poNumber', {
          visible: true,
          timeout: 30_000,
        });
        if (!anchor) throw new Error('🛑 #poNumber never appeared');

        const box = await anchor.boundingBox();
        if (!box) throw new Error('🛑 Could not compute bounding box for #poNumber');
        const startY = Math.round(box.y);

        const mainEl = await page.$('main.container-fluid');
        if (!mainEl) throw new Error('🛑 <main> wrapper vanished');
        const mainBox = await mainEl.boundingBox();
        if (!mainBox) throw new Error('🛑 Could not compute bounding box for <main>');
        const mainX = Math.round(mainBox.x);
        const mainW = Math.round(mainBox.width);

        const fullHeight = await page.evaluate(() =>
          Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
        );

        const TOP_MARGIN = 5;
        const clipY = Math.max(0, startY - TOP_MARGIN);
        const clipHeight = Math.round(fullHeight - clipY);

        const clip = { x: mainX, y: clipY, width: mainW, height: clipHeight };

        const successPath = path.join(screenshotsDir, `po-${docId}.png`);
        await page.screenshot({ path: successPath, clip });
        await uploadScreenshot(successPath, `purchase-orders/po-${docId}.png`);

        break;
      } catch (err) {
        console.warn(`⚠️ Attempt ${attempt} failed for PO ${docId}@${location}:`, err);

        if (attempt === MAX_ATTEMPTS) {
          const initPath = path.join(screenshotsDir, `start-po-${docId}.png`);
          await page.screenshot({ path: initPath });
          await uploadScreenshot(initPath, `failed-fetch/start-po-${docId}.png`);

          const missPath = path.join(screenshotsDir, `missing-po-${docId}.png`);
          await page.screenshot({ path: missPath });
          await uploadScreenshot(missPath, `failed-fetch/missing-po-${docId}.png`);

          console.warn(`⚠️ PO number element missing after ${MAX_ATTEMPTS} attempts for ${docId}@${location}`);
        }
      }
    }

    const html = await page.content();
    const $ = cheerio.load(html);

    const poNumber = $('#poNumber').text().trim() || '';

    return {
      DocumentId: docId,
      location,
      purchaseOrderNumber: poNumber,
      purchaseOrderDate: parseDateSafe($('#poDate').text()),
      shipDate: parseDateSafe($('#shipDate').text()),
      cancelDate: parseDateSafe($('#cancelDate').text()),
      additionalDetails: Object.fromEntries(
        ['Order Type', 'Currency', 'Department', 'Payment Terms', 'Carrier'].map((label) => [
          label,
          $(`label:contains("${label}")+div span`).text().trim(),
        ])
      ),
      items: $('table.table tr')
        .slice(1)
        .toArray()
        .map((row: any) => {
          const c = $(row).find('td');
          return {
            line: c.eq(0).text().trim(),
            itemNumber: c.eq(1).text().trim(),
            gtin: c.eq(2).text().trim(),
            supplierStock: c.eq(3).text().trim(),
            color: c.eq(4).text().trim(),
            size: c.eq(5).text().trim(),
            quantityOrdered: c.eq(6).text().trim(),
            uom: c.eq(7).text().trim(),
            pack: c.eq(8).text().trim(),
            cost: c.eq(9).text().trim(),
            extendedCost: c.eq(10).text().trim(),
          };
        }),
      totals: {
        totalAmount: $('td:contains("Total Order Amount")+td').text().trim(),
        totalItems: $('td:contains("Total Line Items")+td').text().trim(),
        totalUnits: $('td:contains("Total Units Ordered")+td').text().trim(),
      },
    };
  } finally {
    await page.close().catch(() => {});
  }
}

async function scrapeAll(): Promise<void> {
  // ✅ New behavior per your request:
  // - Always login at start (fresh cookies minted)
  // - Store cookies only if cookies/cookies does NOT exist (never overwrite)
  // - Use stored cookies for all puppeteer calls (if validated), otherwise fallback to fresh login cookies for this run
  const { cookiesForWork, source } = await resolveCookiesForThisRun();
  console.log(`🍪 Cookie source for this run: ${source}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1265,1754'],
    defaultViewport: null,
  });

  try {
    let inbound: InboundDoc[];

    // Extra safety: if browser calls fail with the chosen cookie set,
    // retry ONCE with a fresh login cookie set (still not overwriting stored doc).
    try {
      inbound = await fetchInboundDocs(browser, cookiesForWork);
    } catch (e) {
      console.warn('⚠️ fetchInboundDocs failed with primary cookies. Re-login + retry once.', e);
      const fresh = await loginAndGetCookiesAlways();
      inbound = await fetchInboundDocs(browser, fresh.cookies);
      // Use fresh for the rest of this run to avoid partial auth issues
      cookiesForWork.splice(0, cookiesForWork.length, ...cloneCookies(fresh.cookies));
    }

    if (inbound.length) {
      const writer = db.bulkWriter();
      writer.onWriteError((err) => {
        console.error('BulkWriter inboundOrders write error:', err.documentRef.path, err.message);
        return err.failedAttempts < 5;
      });

      for (const d of inbound) {
        const ref = db.collection('inboundOrders').doc(d.DocumentId.toString());
        writer.set(ref, {
          DocumentId: d.DocumentId,
          DocumentNumber: d.DocumentNumber,
          Location: d.Location,
          createdAtTs: d.createdAtTs,
        });
      }

      await writer.close();
      console.log(`✅ Stored ${inbound.length} docs in inboundOrders`);
    }

    const createdTsMap = new Map<number, Timestamp>(inbound.map((d) => [d.DocumentId, d.createdAtTs]));

    const existing = new Set<string>();
    for (let i = 0; i < inbound.length; i += EXISTS_READ_BATCH_SIZE) {
      const chunkDocs = inbound.slice(i, i + EXISTS_READ_BATCH_SIZE);
      const refs: DocumentReference[] = chunkDocs.map((d) =>
        db.collection('purchaseOrderDetails2').doc(d.DocumentId.toString())
      );
      const snaps: DocumentSnapshot[] = await db.getAll(...refs);
      snaps.forEach((s) => {
        if (s.exists) existing.add(s.id);
      });
    }

    const toFetch = inbound.filter((d) => !existing.has(d.DocumentId.toString()));
    console.log(`🔄 Will fetch ${toFetch.length} new POs (of ${inbound.length} inbound)`);

    const limit = pLimit(CONCURRENCY);
    let remaining = toFetch.length;

    const detailPromises = toFetch.map((d) =>
      limit(async () => {
        try {
          const detail = await fetchOrderDetails(browser, cookiesForWork, d.DocumentId, d.Location);
          remaining--;
          console.log(`✅ Fetched details for PO ${d.DocumentId}. ${remaining} remaining.`);
          return detail;
        } catch (err) {
          remaining--;
          console.error(`❌ Error fetching details for PO ${d.DocumentId}:`, err);
          console.log(`${remaining} remaining after error.`);
          return null;
        }
      })
    );

    const details = (await Promise.all(detailPromises)).filter((d): d is PurchaseOrderDetails => d !== null);

    if (details.length) {
      const writer = db.bulkWriter();
      writer.onWriteError((err) => {
        console.error('BulkWriter purchaseOrderDetails2 write error:', err.documentRef.path, err.message);
        return err.failedAttempts < 5;
      });

      for (const o of details) {
        const createdAtTs = createdTsMap.get(o.DocumentId);
        const docData: PurchaseOrderDetails = {
          ...o,
          ...(createdAtTs ? { createdAtTs } : {}),
        };
        writer.set(db.collection('purchaseOrderDetails2').doc(o.DocumentId.toString()), docData);
      }

      await writer.close();
      console.log(`✅ Stored ${details.length} docs in purchaseOrderDetails2`);
    }

    console.log('✅ DONE scrapeAll()');
  } finally {
    await browser.close().catch(() => {});
  }
}

// Run-once entrypoint for Cloud Run Jobs
(async () => {
  try {
    console.log(`🚀 Starting scraper. projectId=${projectId || '(auto)'} bucket=${SCREENSHOT_BUCKET}`);
    await scrapeAll();
    process.exit(0);
  } catch (e) {
    console.error('FATAL:', e);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (e) => console.error('UNHANDLED REJECTION', e));
process.on('uncaughtException', (e) => console.error('UNCAUGHT EXCEPTION', e));

/*

gcloud config set project moofy-firebase
TAG=$(date +%Y%m%d-%H%M%S)
gcloud builds submit --tag gcr.io/moofy-firebase/us-central1/moofy-scraper-job:$TAG

gcloud run jobs update moofy-scraper-job \
  --region us-central1 \
  --image gcr.io/moofy-firebase/us-central1/moofy-scraper-job:$TAG \
  --task-timeout=168h \
  --cpu=8 --memory=16Gi

*/
// # 4) Execute it
// gcloud run jobs execute moofy-scraper-job --region us-central1 --wait

// gcloud builds submit --tag gcr.io/moofy-firebase/us-central1/moofy-scraper-job
// gcloud beta run jobs update moofy-scraper-job --region us-central1 --task-timeout=168h --cpu=8 --memory=16Gi
// gcloud run jobs executions list --job moofy-scraper-job --region us-central1

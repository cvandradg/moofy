import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import puppeteer, { Browser, CookieParam } from 'puppeteer';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import fs from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, DocumentReference, DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';

/**
 * IMPORTANT:
 * - Prefer env vars in Cloud Run / Cloud Run Jobs:
 *   WMT_USERNAME, WMT_PASSWORD, WMT_BOT_TOKEN, WMT_MAILBOX_ID (optional)
 *
 * Cookie persistence (sensitive):
 * - This stores cookie VALUES in Firestore so your job can reuse sessions.
 * - Make sure Firestore rules + IAM restrict access tightly.
 */

function parseApiTimestamp(raw: string): Timestamp {
  const ms = Number(raw.match(/\/Date\((\d+)\)\//)?.[1]);
  if (isNaN(ms)) {
    throw new Error(`Invalid API date format: ${raw}`);
  }
  return Timestamp.fromMillis(ms);
}

function parseDate(str: string): Timestamp {
  const [m, d, y] = str.split('/').map(Number);
  return Timestamp.fromDate(new Date(y, m - 1, d));
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

initializeApp();
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const storage = new Storage();
const SCREENSHOT_BUCKET = 'purchase-orders-screenshots';

const MAX_ATTEMPTS = 6;
const MAILBOX_ID = process.env.WMT_MAILBOX_ID || '51619';

// Use env vars if present; otherwise you can paste your values here (not recommended)
const USERNAME = 'candradeg9182@gmail.com';
const PASSWORD = 'PastryFactory20260103';
const BOT_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJsb2dpbklkIjoiY2FuZHJhZGVnOTE4MkBnbWFpbC5jb20iLCJpc3MiOiJrcmFrZW4iLCJleHAiOjE3NzI2ODUwMzgsImlhdCI6MTc2NzUwMTAzOCwianRpIjoiMDRiMmZkNzItMDA1Ny00YTYwLWFhNTUtYjQzMGE5ZjVlYTJiIn0.TXP8S_blNb160qS-f1McTBK_tcuruXplI0lwk7m0CMDpwUakiHEAg9LmK7BBd-T33DgQfgn7F_lNeLOdnCWfYSl3CO__JgdQ8a5Sb4KslUNFGnK5LsyUEA7jzTZ7n8f4neQnF7SvqXEZmwjDKedr3x3abJbZGunzP9u8msc8K7pyfVS8tUqvLFxYVN8tB0zUAAU53sI-KhIHOf-kOmteDpTe_X8BkiB-mXKGmDvd8IUTXeDVHK4eM-6ODmnC9QEZiQcgnvmviJibFF4dIv9t53Dbv85yZUbQ1PGWRjRbYMgca-YPO8CjKVeqi7IMmikzGIVA7lf9-fuoRRlUVqG7WA';

const STORED_COOKIE_INBOUND_TRIES = 2; // try stored cookies twice
const LOGIN_COOKIE_INBOUND_TRIES = 2; // try login cookies twice

// Firestore cookie storage
const COOKIE_DOC_REF = db.collection('walmartCookieState').doc('current');
const COOKIE_LOG_COL = db.collection('walmartCookieStateLog');
const INBOUND_ATTEMPTS_COL = db.collection('inboundFetchAttempts');

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
  [key: string]: any;
}

type CookieRecord = {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
};

function recordToCookieParam(r: CookieRecord): CookieParam {
  return {
    name: r.name,
    value: r.value,
    ...(r.domain ? { domain: r.domain } : {}),
    ...(r.path ? { path: r.path } : {}),
    ...(typeof r.expires === 'number' ? { expires: r.expires } : {}),
    ...(typeof r.httpOnly === 'boolean' ? { httpOnly: r.httpOnly } : {}),
    ...(typeof r.secure === 'boolean' ? { secure: r.secure } : {}),
    ...(r.sameSite ? { sameSite: r.sameSite } : {}),
  } as CookieParam;
}

function cookieParamToRecord(c: CookieParam): CookieRecord {
  const domain = (c as any).domain;
  const p = (c as any).path;
  const expires = (c as any).expires;
  const httpOnly = (c as any).httpOnly;
  const secure = (c as any).secure;
  const sameSite = (c as any).sameSite;

  return {
    name: c.name,
    value: c.value,
    ...(domain ? { domain } : {}),
    ...(p ? { path: p } : {}),
    ...(typeof expires === 'number' ? { expires } : {}),
    ...(typeof httpOnly === 'boolean' ? { httpOnly } : {}),
    ...(typeof secure === 'boolean' ? { secure } : {}),
    ...(sameSite ? { sameSite } : {}),
  };
}

function sanitizeCookiesForStorage(cookies: CookieParam[]): CookieParam[] {
  return cookies.filter((c) => {
    const d = String((c as any).domain || '');
    return d.includes('wal-mart.com');
  });
}

function approxBytes(obj: unknown): number {
  return Buffer.byteLength(JSON.stringify(obj), 'utf8');
}

function trimCookieRecordsToFitFirestore(records: CookieRecord[]): { records: CookieRecord[]; bytes: number } {
  // Firestore doc limit is 1 MiB (1,048,576 bytes). Keep a safety margin.
  const LIMIT = 900_000;

  let list = [...records];
  let bytes = approxBytes(list);

  if (bytes <= LIMIT) return { records: list, bytes };

  // Remove biggest cookies first until we fit
  list.sort((a, b) => (b.value?.length || 0) - (a.value?.length || 0));

  while (list.length > 0 && bytes > LIMIT) {
    list.shift();
    bytes = approxBytes(list);
  }

  return { records: list, bytes };
}

async function uploadScreenshot(localPath: string, destFilename: string) {
  await storage.bucket(SCREENSHOT_BUCKET).upload(localPath, { destination: destFilename });
  fs.unlinkSync(localPath);
}

async function loadCookiesFromDb(): Promise<CookieParam[] | null> {
  const snap = await COOKIE_DOC_REF.get();
  if (!snap.exists) return null;

  const data = snap.data() as any;
  const list = Array.isArray(data?.cookies) ? (data.cookies as CookieRecord[]) : [];
  if (!list.length) return null;

  return list.map(recordToCookieParam);
}

async function saveCookiesToDb(args: {
  cookies: CookieParam[];
  source: 'loginCookies';
  inboundCount: number;
  diag: { status: number; finalUrl: string; ct: string };
}) {
  const raw = sanitizeCookiesForStorage(args.cookies).map(cookieParamToRecord);
  const trimmed = trimCookieRecordsToFitFirestore(raw);

  const payload = {
    updatedAt: Timestamp.now(),
    source: args.source,
    inboundCount: args.inboundCount,
    diag: args.diag,
    cookieCount: trimmed.records.length,
    approxBytes: trimmed.bytes,
    cookies: trimmed.records,
  };

  await COOKIE_DOC_REF.set(payload, { merge: true });
  await COOKIE_LOG_COL.add(payload);
}

async function loginAndGetCookies(): Promise<CookieParam[]> {
  if (!USERNAME || !PASSWORD || !BOT_TOKEN) {
    throw new Error('Missing env vars. Set WMT_USERNAME, WMT_PASSWORD, WMT_BOT_TOKEN.');
  }

  console.log('🔑 Performing login (always, for logs + in-memory fallback cookies)…');

  const res = await fetch('https://retaillink.login.wal-mart.com/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Referer: 'https://retaillink.login.wal-mart.com/',
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

  const raw = (res.headers as any)?.raw?.()['set-cookie'] || [];
  const setCookieCount = Array.isArray(raw) ? raw.length : 0;

  await db.collection('loginResults').add({
    at: Timestamp.now(),
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    setCookieCount,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('LOGIN failed:', res.status, res.statusText, text);
    throw new Error(`Login failed: ${res.status} ${res.statusText}`);
  }

  const cookies = (raw as string[]).map((str) => {
    const [nv] = str.split(';');
    const [name, value] = nv.split('=');
    return { name, value, domain: '.wal-mart.com', path: '/' } as CookieParam;
  });

  console.log(`🍪 Login minted cookies: ${cookies.length}`);
  return cookies;
}

async function fetchInboundDocs(
  browser: Browser,
  cookies: CookieParam[],
  source: 'storedCookies' | 'loginCookies',
  attempt: number
): Promise<{
  ok: boolean;
  docs: InboundDoc[];
  harvestedCookies: CookieParam[];
  diag: { status: number; finalUrl: string; ct: string; head: string };
}> {
  console.log(`📥 Fetching inbound documents… (source=${source}, attempt=${attempt})`);

  const page = await browser.newPage();

  // Hard stop so we never hang forever here
  const NAV_TIMEOUT_MS = 75_000;
  page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);

  // Reduce background noise that can prevent "idle" conditions
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const rt = req.resourceType();
    if (rt === 'image' || rt === 'stylesheet' || rt === 'font') return req.abort();
    return req.continue();
  });

  try {
    // 1) Warm up the domain context first (important for cookie domain rules)
    await page
      .goto('https://retaillink2.wal-mart.com/', {
        waitUntil: 'domcontentloaded',
        timeout: NAV_TIMEOUT_MS,
      })
      .catch(() => {
        // ok to ignore; we just want a domain context
      });

    // 2) Apply cookies (best effort)
    try {
      if (cookies?.length) {
        await page.setCookie(...cookies);
      }
    } catch (e) {
      console.warn('⚠️ page.setCookie failed (continuing):', e);
    }

    // 3) Bot token header
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
      pageSize: '6000',
      sortDataField: 'CreatedTimestamp',
      sortOrder: 'desc',
      skipWork: 'true',
    });

    const url = `https://retaillink2.wal-mart.com/Webedi2/Inbound/GetInboundDocuments/${MAILBOX_ID}?${params}`;

    // 4) DO NOT use networkidle0 (it can hang forever). Use domcontentloaded + timeout.
    const resp = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: NAV_TIMEOUT_MS,
    });

    const status = resp?.status?.() ?? 0;
    const headers = resp?.headers?.() ?? {};
    const ct = String(headers['content-type'] || '');
    const finalUrl = resp?.url?.() || page.url();

    // Ensure we have some content (but don’t hang forever)
    await page
      .waitForFunction(
        () => {
          const pre = document.querySelector('pre');
          const raw = (pre?.textContent || document.body?.innerText || '').trim();
          return raw.length > 0;
        },
        { timeout: 15_000 }
      )
      .catch(() => {
        // ok; we’ll still attempt to read whatever is there
      });

    const text = await page.evaluate(() => {
      const pre = document.querySelector('pre');
      const raw = (pre?.textContent || document.body?.innerText || '').trim();
      return raw;
    });

    const head = text.slice(0, 300);
    const looksJson =
      ct.includes('application/json') || head.startsWith('[') || head.startsWith('{') || text.trim().startsWith('[');

    // Log attempt (no cookies)
    await INBOUND_ATTEMPTS_COL.add({
      at: Timestamp.now(),
      source,
      attempt,
      status,
      ct,
      finalUrl,
      head,
      looksJson,
      usedCookieCount: cookies?.length || 0,
    });

    if (!resp || status !== 200 || !looksJson) {
      return { ok: false, docs: [], harvestedCookies: [], diag: { status, finalUrl, ct, head } };
    }

    let parsed: any[] = [];
    try {
      parsed = JSON.parse(text) as any[];
    } catch (_e) {
      return {
        ok: false,
        docs: [],
        harvestedCookies: [],
        diag: { status, finalUrl, ct, head: `JSON_PARSE_FAILED: ${head}` },
      };
    }

    const docs = parsed.map((d) => ({
      ...d,
      DocumentId: d.DocumentId,
      DocumentNumber: d.DocumentNumber,
      Location: d.Location,
      createdAtTs: parseApiTimestamp(d.CreatedTimestamp),
    })) as InboundDoc[];

    // Harvest cookie jar AFTER success
    const harvestedAll = await page.browserContext().cookies();
    const harvestedCookies = sanitizeCookiesForStorage(
      harvestedAll.map((c: any) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        expires: c.expires,
        httpOnly: c.httpOnly,
        secure: c.secure,
        sameSite: c.sameSite,
      })) as unknown as CookieParam[]
    );

    console.log(`📄 Fetched ${docs.length} inbound documents (source=${source})`);
    return { ok: true, docs, harvestedCookies, diag: { status, finalUrl, ct, head } };
  } catch (e) {
    const finalUrl = page.url();
    console.error('❌ fetchInboundDocs crashed:', e && ((e as any).stack || e));
    return {
      ok: false,
      docs: [],
      harvestedCookies: [],
      diag: { status: 0, finalUrl, ct: '', head: 'FETCH_INBOUND_CRASH' },
    };
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
  await page.setDefaultNavigationTimeout(0);

  await page.setCookie(...cookies);
  await page.setExtraHTTPHeaders({ 'x-bot-token': BOT_TOKEN });

  const url = `https://retaillink2.wal-mart.com/Webedi2/inbound/purchaseorder/${MAILBOX_ID}/${docId}/${location}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });

  ensureScreenshotsDir();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const anchor = await page.waitForSelector('#poNumber', { visible: true, timeout: 30_000 });
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

      if (attempt < MAX_ATTEMPTS) {
        console.log(`⏳ Retrying screenshot (${attempt + 1}/${MAX_ATTEMPTS})…`);
      } else {
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
  await page.close();

  return {
    DocumentId: docId,
    location,
    purchaseOrderNumber: poNumber,
    purchaseOrderDate: parseDate($('#poDate').text().trim()),
    shipDate: parseDate($('#shipDate').text().trim()),
    cancelDate: parseDate($('#cancelDate').text().trim()),
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
}

async function scrapeAll(): Promise<void> {
  // 1) Login ALWAYS runs (for logs + in-memory fallback cookies)
  const loginCookies = await loginAndGetCookies();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1265,1754'],
    defaultViewport: null,
  });

  try {
    const storedCookies = await loadCookiesFromDb();
    console.log(`🧠 Stored cookie count: ${storedCookies?.length || 0}`);

    let inbound: InboundDoc[] = [];
    let sessionCookies: CookieParam[] = [];
    let usedSource: 'storedCookies' | 'loginCookies' = 'storedCookies';
    let lastInboundDiag: { status: number; finalUrl: string; ct: string } | null = null;

    let storedSucceeded = false;

    // 2) Try stored cookies first (if any)
    if (storedCookies && storedCookies.length) {
      for (let attempt = 1; attempt <= STORED_COOKIE_INBOUND_TRIES; attempt++) {
        const res = await fetchInboundDocs(browser, storedCookies, 'storedCookies', attempt);
        if (res.ok) {
          inbound = res.docs;
          sessionCookies = res.harvestedCookies.length ? res.harvestedCookies : storedCookies;
          usedSource = 'storedCookies';
          storedSucceeded = true;
          lastInboundDiag = { status: res.diag.status, finalUrl: res.diag.finalUrl, ct: res.diag.ct };
          break;
        }
        if (attempt < STORED_COOKIE_INBOUND_TRIES) await sleep(750);
      }
    }

    // 3) If stored cookies fail, fallback to login cookies
    if (!storedSucceeded) {
      console.warn('⚠️ Stored cookies failed (or missing). Falling back to login cookies in memory…');

      for (let attempt = 1; attempt <= LOGIN_COOKIE_INBOUND_TRIES; attempt++) {
        const res = await fetchInboundDocs(browser, loginCookies, 'loginCookies', attempt);
        if (res.ok) {
          inbound = res.docs;
          sessionCookies = res.harvestedCookies.length ? res.harvestedCookies : loginCookies;
          usedSource = 'loginCookies';
          lastInboundDiag = { status: res.diag.status, finalUrl: res.diag.finalUrl, ct: res.diag.ct };

          // 4) Persist cookie state ONLY after inbound success using login cookies
          try {
            console.log('🧪 About to write cookie state to Firestore...');
            await saveCookiesToDb({
              cookies: sessionCookies,
              source: 'loginCookies',
              inboundCount: inbound.length,
              diag: lastInboundDiag,
            });
            console.log('✅ Cookie state write succeeded.');
          } catch (e) {
            console.error('❌ Cookie state write FAILED:', e && ((e as any).stack || e));
            // IMPORTANT: keep the run going
          }

          break;
        }
        if (attempt < LOGIN_COOKIE_INBOUND_TRIES) await sleep(750);
      }
    }

    if (!inbound.length || !sessionCookies.length) {
      throw new Error(
        'Inbound fetch failed using both stored cookies and login cookies. Check Firestore: inboundFetchAttempts.'
      );
    }

    console.log(`✅ Inbound fetch success. Source used: ${usedSource}. Proceeding normally…`);

    // Store inbound docs
    if (inbound.length) {
      const batch = db.batch();
      inbound.forEach((d) => {
        const ref = db.collection('inboundOrders').doc(d.DocumentId.toString());
        batch.set(ref, d);
      });
      await batch.commit();
      console.log(`✅ Stored ${inbound.length} docs in inboundOrders`);
    }

    const createdTsMap = new Map<number, Timestamp>(inbound.map((d) => [d.DocumentId, d.createdAtTs]));

    // Determine which details are new
    const existing = new Set<string>();
    const batchSize = 500;

    for (let i = 0; i < inbound.length; i += batchSize) {
      const chunk = inbound.slice(i, i + batchSize);
      const refs: DocumentReference[] = chunk.map((d) =>
        db.collection('purchaseOrderDetails2').doc(d.DocumentId.toString())
      );
      const snaps: DocumentSnapshot[] = await db.getAll(...refs);
      snaps.forEach((s) => {
        if (s.exists) existing.add(s.id);
      });
    }

    const toFetch = inbound.filter((d) => !existing.has(d.DocumentId.toString()));
    console.log(`🔄 Will fetch ${toFetch.length} new POs (of ${inbound.length} inbound)`);

    const limit = pLimit(5);
    let remaining = toFetch.length;

    const detailPromises = toFetch.map((d) =>
      limit(async () => {
        try {
          const detail = await fetchOrderDetails(browser, sessionCookies, d.DocumentId, d.Location);
          remaining--;
          console.log(`✅ Fetched details for PO ${d.DocumentId}. ${remaining} remaining to fetch.`);
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

    // Write details
    for (let i = 0; i < details.length; i += batchSize) {
      const chunk = details.slice(i, i + batchSize);
      console.log(`📥 Writing batch ${Math.floor(i / batchSize) + 1} with ${chunk.length} docs to Firestore`);

      const batch = db.batch();
      chunk.forEach((o) => {
        const createdAtTs = createdTsMap.get(o.DocumentId);
        const docData = {
          ...o,
          ...(createdAtTs && { createdAtTs }),
        };
        batch.set(db.collection('purchaseOrderDetails2').doc(o.DocumentId.toString()), docData);
      });

      await batch.commit();
      console.log(`📤 Committed batch ${Math.floor(i / batchSize) + 1}`);
    }
  } finally {
    await browser.close();
  }
}

const app = express();
app.use(cors({ origin: true }));

app.post('/run-scrape', async (_req, res) => {
  try {
    await scrapeAll();
    console.log('DONE');
    res.status(200).send('Scrape completed');
  } catch (err) {
    console.error('FATAL scrape error:', err && ((err as any).stack || err));
    res.status(500).send('Scrape failed');
  }
});

const PORT = parseInt(process.env.PORT || '8080', 10);
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  scrapeAll()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('FATAL scrapeAll error:', e && ((e as any).stack || e));
      process.exit(1);
    });
}

process.on('unhandledRejection', (e) => console.error('UNHANDLED REJECTION', e));
process.on('uncaughtException', (e) => console.error('UNCAUGHT EXCEPTION', e));

export default app;

// TAG=$(date +%Y%m%d-%H%M%S)
// gcloud builds submit --tag gcr.io/moofy-firebase/us-central1/moofy-scraper-job:$TAG

// gcloud run jobs update moofy-scraper-job --region us-central1 --image gcr.io/moofy-firebase/us-central1/moofy-scraper-job:$TAG --task-timeout=168h --cpu=8 --memory=16Gi

// # 4) Execute it
// gcloud run jobs execute moofy-scraper-job --region us-central1 --wait

// gcloud builds submit --tag gcr.io/moofyvip-firebase/us-central1/moofy-scraper-job
// gcloud beta run jobs update moofy-scraper-job --region us-central1 --task-timeout=168h --cpu=8 --memory=16Gi
// gcloud run jobs executions list --job moofy-scraper-job --region us-central1

/*
PROJECT="moofy-firebase"
REGION="us-central1"
REPO="moofy-scraper"
JOB="moofy-scraper-job"
IMAGE_NAME="moofy-scraper-job"
TAG="$(date +%Y%m%d-%H%M%S)"

IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${IMAGE_NAME}:${TAG}"

# 1) Build + push the new container image
gcloud builds submit --project "$PROJECT" --tag "$IMAGE"

# 2) Update the Cloud Run Job to use the new image
gcloud run jobs update "$JOB" \
  --project "$PROJECT" \
  --region "$REGION" \
  --image "$IMAGE"
*/

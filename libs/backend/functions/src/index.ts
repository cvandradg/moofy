import puppeteer, { Browser, CookieParam } from 'puppeteer';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';
import fs from 'fs';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, DocumentReference, DocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import fetch from 'node-fetch';

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
const projectId =
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GCLOUD_PROJECT ||
  process.env.GCP_PROJECT_ID;

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
const PASSWORD = 'PastryFactory20260114';
const BOT_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJsb2dpbklkIjoiY2FuZHJhZGVnOTE4MkBnbWFpbC5jb20iLCJpc3MiOiJrcmFrZW4iLCJleHAiOjE3NzM2MzI4ODAsImlhdCI6MTc2ODQ0ODg4MCwianRpIjoiNTFlZDdmODYtM2MwYy00ZWNhLThhNTAtNGUzMjBkZTYwMmNmIn0.MDEdkyobG26sq_TuZ9cdqQthpqtLb78XXDIwI1uGfUxpbTQmjmrDbnNIDkdVg2kHk0NGpBehMaDEWUu9l6fRhlzj5fYixi21IZxAEkulxPNklTtz3VADoEpO1sFuCu6NJmYtDMqGbaQoAuMf6gupIEgcNlMHd7WHfiFLMO6FkVxx03eCEhCCDy-ZFuVnftKih7_BAZdWpPxKSV45-oEuJ5OFsEccEg9w16Em5sA0CnZwNXs-IFlAz4S20-T48p_kRuTY_K4sZBaq6dP6ho3FXGRW5hfois2WIe8bzz5mbcfvjAbrFUl3mI6mpJveZTH9NLjKgA5PjqRctBLqiO2X8A';

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
  return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
}

function sanitizeCookieForFirestore(c: CookieParam) {
  return {
    name: c.name,
    value: c.value,
    domain: c.domain || '.wal-mart.com',
    path: c.path || '/',
    expires: (c as any).expires ?? null,
    httpOnly: (c as any).httpOnly ?? null,
    secure: (c as any).secure ?? null,
    sameSite: (c as any).sameSite ?? null,
  };
}

function normalizeCookieParam(c: any): CookieParam {
  return {
    name: String(c?.name || ''),
    value: String(c?.value || ''),
    domain: String(c?.domain || '.wal-mart.com'),
    path: String(c?.path || '/'),
  };
}

// ------------------------------
//  COOKIE PERSISTENCE (LATEST + HISTORY)
// ------------------------------
const LATEST_COOKIES_DOC = db.collection('loginResults').doc('latest');
const HISTORY_COOKIES_COL = db.collection('loginResultsHistory');

async function readLatestStoredCookies(): Promise<CookieParam[] | null> {
  const snap = await LATEST_COOKIES_DOC.get();
  if (!snap.exists) return null;

  const data = snap.data() as any;
  const arr = Array.isArray(data?.cookies) ? data.cookies : [];
  if (!arr.length) return null;

  const cookies = arr.map(normalizeCookieParam).filter((c: CookieParam) => c.name && c.value);
  if (!cookies.length) return null;

  return cookies;
}

async function storeLatestCookies(cookies: CookieParam[], meta: Record<string, any>) {
  const safeCookies = cookies.map(sanitizeCookieForFirestore);

  await LATEST_COOKIES_DOC.set(
    {
      updatedAt: new Date(),
      cookieCount: safeCookies.length,
      cookies: safeCookies,
      ...meta,
    },
    { merge: true }
  );

  await HISTORY_COOKIES_COL.add({
    createdAt: new Date(),
    cookieCount: safeCookies.length,
    ...meta,
  });
}

// Test cookies against an authenticated endpoint BEFORE we launch puppeteer work
async function storedCookiesStillWork(cookies: CookieParam[]): Promise<boolean> {
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
      pageSize: '1', // keep it tiny; we just need auth validation
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

    JSON.parse(t); // must parse
    return true;
  } catch {
    return false;
  }
}

// Login + extract cookies (this runs ONLY when stored cookies fail)
async function loginAndGetCookies(): Promise<CookieParam[]> {
  console.log('🔑 Performing login…');

  // Preflight to mint any baseline cookies (lang, anti-bot, etc.)
  const pre = await fetch('https://retaillink.login.wal-mart.com/', {
    method: 'GET',
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  const preRaw = (pre.headers as any).raw?.()['set-cookie'] || [];
  const preCookieHeader = preRaw.map((c: string) => c.split(';')[0]).join('; ');
  const cookieHeader = [preCookieHeader, 'lang=en'].filter(Boolean).join('; ');

  const res = await fetch('https://retaillink.login.wal-mart.com/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      Origin: 'https://retaillink.login.wal-mart.com',
      Referer: 'https://retaillink.login.wal-mart.com/',
      'User-Agent': UA,
      cookie: cookieHeader,
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

  const raw = (res.headers as any).raw?.()['set-cookie'] || [];
  const cookies: CookieParam[] = raw.map((str: string) => {
    const [nv] = str.split(';');
    const [name, value] = nv.split('=');
    return { name, value, domain: '.wal-mart.com', path: '/' };
  });

  console.log(`🍪 Login minted cookies: ${cookies.length}`);

  // Store as "last successful"
  await storeLatestCookies(cookies, {
    ok: true,
    source: 'login',
    scheduled: true,
  });

  return cookies;
}

// The behavior you asked for: use last successful stored cookies until they fail
async function getWorkingCookies(): Promise<CookieParam[]> {
  const stored = await readLatestStoredCookies();

  if (stored && stored.length) {
    console.log(`🧠 Found stored cookies: ${stored.length}. Testing...`);
    const ok = await storedCookiesStillWork(stored);

    if (ok) {
      console.log('✅ Stored cookies are valid. Using them.');
      return stored;
    }

    console.log('⚠️ Stored cookies are NOT valid anymore. Will login and store fresh cookies.');
  } else {
    console.log('ℹ️ No stored cookies found. Will login and store cookies.');
  }

  return await loginAndGetCookies();
}

async function uploadScreenshot(localPath: string, destFilename: string) {
  await storage.bucket(SCREENSHOT_BUCKET).upload(localPath, { destination: destFilename });
  fs.unlinkSync(localPath);
}

async function fetchInboundDocs(browser: Browser, cookies: CookieParam[]): Promise<InboundDoc[]> {
  console.log('📥 Fetching inbound documents…');

  const page = await browser.newPage();
  try {
    page.setDefaultNavigationTimeout(120_000);
    page.setDefaultTimeout(120_000);

    await page.setCookie(...cookies);
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

    await page.setCookie(...cookies);
    await page.setExtraHTTPHeaders({ 'x-bot-token': BOT_TOKEN });

    const url = `https://retaillink2.wal-mart.com/Webedi2/inbound/purchaseorder/${MAILBOX_ID}/${docId}/${location}`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

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
  // ✅ This is the behavior you asked for:
  // - use last successful cookies from Firestore
  // - if they fail, login and store new "latest"
  let cookies = await getWorkingCookies();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1265,1754'],
    defaultViewport: null,
  });

  try {
    let inbound: InboundDoc[];

    // Extra safety: if browser calls fail (cookies got invalidated between test and puppeteer),
    // do one forced re-login and retry.
    try {
      inbound = await fetchInboundDocs(browser, cookies);
    } catch (e) {
      console.warn('⚠️ fetchInboundDocs failed with current cookies. Re-login + retry once.', e);
      cookies = await loginAndGetCookies();
      inbound = await fetchInboundDocs(browser, cookies);
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
          const detail = await fetchOrderDetails(browser, cookies, d.DocumentId, d.Location);
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
        const docData: PurchaseOrderDetails = { ...o, ...(createdAtTs ? { createdAtTs } : {}) };
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


//gcloud config set project moofy-firebase
// TAG=$(date +%Y%m%d-%H%M%S)
// gcloud builds submit --tag gcr.io/moofy-firebase/us-central1/moofy-scraper-job:$TAG

// gcloud run jobs update moofy-scraper-job \
//   --region us-central1 \
//   --image gcr.io/moofy-firebase/us-central1/moofy-scraper-job:$TAG \
//   --task-timeout=168h \
//   --cpu=8 --memory=16Gi

// # 4) Execute it
// gcloud run jobs execute moofy-scraper-job --region us-central1 --wait

// gcloud builds submit --tag gcr.io/moofy-firebase/us-central1/moofy-scraper-job
// gcloud beta run jobs update moofy-scraper-job --region us-central1 --task-timeout=168h --cpu=8 --memory=16Gi
// gcloud run jobs executions list --job moofy-scraper-job --region us-central1

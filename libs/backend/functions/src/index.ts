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

function parseDate(str: string): Timestamp {
  const [m, d, y] = str.split('/').map(Number);
  return Timestamp.fromDate(new Date(y, m - 1, d));
}

// — Initialize Firebase Admin SDK ——————————————————————————
initializeApp();
const db = getFirestore();

// — Initialize Cloud Storage client for screenshots ——————————
const storage = new Storage();
const SCREENSHOT_BUCKET = 'purchase-orders-screenshots';
const USERNAME = 'candradeg9182@gmail.com';
const PASSWORD = 'PastryFactory202506';
const MAILBOX_ID = '51619';
const BOT_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJsb2dpbklkIjoiY2FuZHJhZGVnOTE4MkBnbWFpbC5jb20iLCJpc3MiOiJrcmFrZW4iLCJleHAiOjE3NTUxOTMwOTYsImlhdCI6MTc1MDAwOTA5NiwianRpIjoiNmRjZWE2ZWYtMzBmNi00Nzc5LTk2MzktOTg5YjE3NzFhM2E3In0.KfWTg97hH77NriVD-iXgHQhJgRrkIjByMQifmpdt8WXCpbtSDuD-2g-hMoaTfpMjASSdjRb5E_3J1qYvG7gcZX3UiX9YSCYSSP2pR08B52jlA5u2R1zlsC8DNKX-zWlwi-kIcMxq8WWjI1AlFoHB8PW_mRg_jIIsds5XSgoz0rRqNqObAdCkheZXHMJKb9bsNNmRW7wt2ksQOGZLBs0qXZVypC0QLtXH6y5jWubLZ40im9Lf-YwWDDu53spwSzTbNUaa-5DTW2JWI30g4qM8tj12uCycS310ohjZn2Bc-5WRHhpTR5KXjuxThYyu76RLyhY6OAJPW1lKvQ7Q-WWHdw';

// — Prepare local screenshots directory ——————————————————————————
const screenshotsDir = path.resolve('screenshots');
function ensureScreenshotsDir() {
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
}

// — Types —————————————————————————————————————————————————————
interface InboundDoc {
  DocumentId: number;
  DocumentNumber: string;
  Location: string;
}
interface PurchaseOrderDetails {
  DocumentId: number;
  [key: string]: any;
}

// — Helper: upload screenshot to GCS —————————————————————————
async function uploadScreenshot(localPath: string, destFilename: string) {
  await storage.bucket(SCREENSHOT_BUCKET).upload(localPath, { destination: destFilename });
  fs.unlinkSync(localPath);
}

// — Login helper —————————————————————————————————————————————
async function loginAndGetCookies(): Promise<CookieParam[]> {
  console.log('🔑 Performing login…');
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
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${text}`);
  }
  const raw = res.headers.raw()['set-cookie'] || [];
  const cookies = raw.map((str) => {
    const [nv] = str.split(';');
    const [name, value] = nv.split('=');
    return { name, value, domain: '.wal-mart.com', path: '/' };
  });
  await db.collection('loginResults').add({ timestamp: new Date(), cookies, scheduled: false });
  return cookies;
}

// — Fetch inbound docs ————————————————————————————————————————————
async function fetchInboundDocs(browser: Browser, cookies: CookieParam[]): Promise<InboundDoc[]> {
  console.log('📥 Fetching inbound documents…');
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
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
    pageSize: '500',
    sortDataField: 'CreatedTimestamp',
    sortOrder: 'desc',
    skipWork: 'true',
  });
  const url = `https://retaillink2.wal-mart.com/Webedi2/Inbound/GetInboundDocuments/${MAILBOX_ID}?${params}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
  const content = await page.$eval('pre', (el) => el.textContent || '[]');
  await page.close();
  const docs = JSON.parse(content) as any[];
  console.log(`📄 Fetched ${docs.length} inbound documents`);
  return docs.map((d) => ({
    DocumentId: d.DocumentId,
    DocumentNumber: d.DocumentNumber,
    Location: d.Location,
  }));
}

// — Fetch PO details —————————————————————————————————————————————
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

  try {
    // wait for the PO number element
    await page.waitForSelector('#poNumber', { timeout: 20000 });

    const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const vp = page.viewport() ?? { width: 1920 };
    const HEADER_HEIGHT = 600;
    const BOTTOM_CROP = 100;

    const successPath = path.join(screenshotsDir, `po-${docId}.png`);
    await page.screenshot({
      path: successPath,
      clip: {
        x: 0,
        y: HEADER_HEIGHT,
        width: vp.width,
        height: fullHeight - HEADER_HEIGHT - BOTTOM_CROP,
      },
    });
    await uploadScreenshot(successPath, `purchase-orders/po-${docId}.png`);
  } catch {
    // your existing error-case screenshots
    const initPath = path.join(screenshotsDir, `start-po-${docId}.png`);
    await page.screenshot({ path: initPath });
    await uploadScreenshot(initPath, `failed-fetch/start-po-${docId}.png`);

    console.warn(`⚠️ PO number element missing for ${docId}@${location}`);

    const missPath = path.join(screenshotsDir, `missing-po-${docId}.png`);
    await page.screenshot({ path: missPath });
    await uploadScreenshot(missPath, `failed-fetch/missing-po-${docId}.png`);
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
      .map((row) => {
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

// — Core scraping flow with batched existence check —————————————————————
async function scrapeAll(): Promise<void> {
  const cookies = await loginAndGetCookies();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1265,1754'],
    defaultViewport: null,
  });
  try {
    const inbound = await fetchInboundDocs(browser, cookies);

    // Batch-check existing PO docs in Firestore by DocumentId
    const existing = new Set<string>();
    const batchSize = 500;
    for (let i = 0; i < inbound.length; i += batchSize) {
      const chunk = inbound.slice(i, i + batchSize);
      const refs: DocumentReference[] = chunk.map((d) =>
        db.collection('purchaseOrderDetails').doc(d.DocumentId.toString())
      );
      const snaps: DocumentSnapshot[] = await db.getAll(...refs);
      snaps.forEach((s) => {
        if (s.exists) existing.add(s.id);
      });
    }

    // Only fetch details for new orders
    const toFetch = inbound.filter((d) => !existing.has(d.DocumentId.toString()));
    console.log(`🔄 Will fetch ${toFetch.length} new POs (of ${inbound.length} inbound)`);

    const limit = pLimit(5);
    let remaining = toFetch.length;
    const detailPromises = toFetch.map((d) =>
      limit(async () => {
        try {
          const detail = await fetchOrderDetails(browser, cookies, d.DocumentId, d.Location);
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

    // Commit in 500-size batches, using DocumentId as the doc ID
    for (let i = 0; i < details.length; i += batchSize) {
      const chunk = details.slice(i, i + batchSize);
      console.log(`📥 Writing batch ${Math.floor(i / batchSize) + 1} with ${chunk.length} docs to Firestore`);
      const batch = db.batch();
      chunk.forEach((o) => {
        batch.set(db.collection('purchaseOrderDetails').doc(o.DocumentId.toString()), o);
      });
      await batch.commit();
      console.log(`📤 Committed batch ${Math.floor(i / batchSize) + 1}`);
    }
  } finally {
    await browser.close();
  }
}

// — Express app for Cloud Run ————————————————————————————————————
const app = express();
app.use(cors({ origin: true }));
app.post('/run-scrape', async (_req, res) => {
  try {
    await scrapeAll();
    res.status(200).send('Scrape completed');
    process.exit(0);
  } catch (err) {
    console.error(err);
    res.status(500).send('Scrape failed');
    process.exit(1);
  }
});

const PORT = parseInt(process.env.PORT || '8080', 10);
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// — Run as script guard —————————————————————————————————————
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  scrapeAll()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default app;

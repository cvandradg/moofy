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

initializeApp();
const db = getFirestore();

const storage = new Storage();
const SCREENSHOT_BUCKET = 'purchase-orders-screenshots';
const USERNAME = 'candradeg9182@gmail.com';
const PASSWORD = 'PastryFactory202508';
const MAX_ATTEMPTS = 6;
const MAILBOX_ID = '51619';
const BOT_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJsb2dpbklkIjoiY2FuZHJhZGVnOTE4MkBnbWFpbC5jb20iLCJpc3MiOiJrcmFrZW4iLCJleHAiOjE3NjA4MTYzOTksImlhdCI6MTc1NTYzMjM5OSwianRpIjoiMDY4YzUyYWUtNjE4NC00MzE0LWE3NDQtNjY1YWIzNmQ4NTEzIn0.q7zmqTYFiE9Um2IQKAdMGs93-LAF7K9SrWpSkjNn_vVjHGkky2owPqxuRR6zumXIgwjyx2AAQUJKH8AUwjldquh9m7C9J72XaM6Bkt9kDpQN10214iKOW0rLFT68VHbJMwkkMBDypNlbTvTOwpacdf0yeEbUqQhQoggdVH8d1lhk8gDwrVRETDu0Gqfw8sIWZff3I3x1an-4iXGOF0Ijawi2A3erRzWscvxgbeNpoffpICVpxvNqRyBOvmmHZFl1wkokyXN9qsMABE7Z6M90XRMr_ErTJxXfYQo7Q-3tgLiHVPLmqS73h9JMNgrfYRpDY8JrBuXIm6DebVGKlusN_g';

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

async function uploadScreenshot(localPath: string, destFilename: string) {
  await storage.bucket(SCREENSHOT_BUCKET).upload(localPath, { destination: destFilename });
  fs.unlinkSync(localPath);
}

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
  }).catch((err: unknown) => {
    console.error('LOGIN network error:', err);
    throw err;
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('LOGIN failed:', res.status, res.statusText, text);
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
    pageSize: '6000',
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
    ...d,
    DocumentId: d.DocumentId,
    DocumentNumber: d.DocumentNumber,
    Location: d.Location,
    createdAtTs: parseApiTimestamp(d.CreatedTimestamp),
  }));
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

      const clip = {
        x: mainX,
        y: clipY,
        width: mainW,
        height: clipHeight,
      };

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
  const cookies = await loginAndGetCookies();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1265,1754'],
    defaultViewport: null,
  });
  try {
    const inbound = await fetchInboundDocs(browser, cookies);

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
    await scrapeAll()
      .then(() => {
        console.log('DONE');
        process.exit(0);
      })
      .catch((e) => {
        console.error('FATAL scrape error:', e && (e.stack || e));
        process.exit(1);
      });
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

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  scrapeAll()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

process.on('unhandledRejection', (e) => console.error('UNHANDLED REJECTION', e));
process.on('uncaughtException', (e) => console.error('UNCAUGHT EXCEPTION', e));

export default app;

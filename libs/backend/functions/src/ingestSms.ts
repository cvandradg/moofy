import * as functions from 'firebase-functions';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (getApps().length === 0) initializeApp();
const db = getFirestore();

export const ingestSms = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const key = req.header('x-ingest-key');
    if (!key || key !== process.env.INGEST_KEY) {
      res.status(401).send('Unauthorized');
      return;
    }

    const { body } = req.body || {};
    if (typeof body !== 'string' || !body.trim()) {
      res.status(400).send('Missing body');
      return;
    }

    await db.collection('sms_logs').add({
      body,
      createdAt: FieldValue.serverTimestamp(),
      source: 'shortcuts',
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});



/* to deploy changes use this url */

/*

npx firebase-tools deploy --only "functions:functions:ingestSms" --project moofy-firebase

*/
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const ingestSms = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    // Simple shared secret so random people can’t spam your endpoint
    const key = req.header("x-ingest-key");
    if (!key || key !== process.env.INGEST_KEY) {
      return res.status(401).send("Unauthorized");
    }

    const { sender, body, receivedAt } = req.body || {};
    if (!sender || typeof sender !== "string") return res.status(400).send("Missing sender");
    if (typeof body !== "string") return res.status(400).send("Missing body");

    await admin.firestore().collection("sms_logs").add({
      sender,
      body,
      receivedAt: receivedAt ? admin.firestore.Timestamp.fromMillis(Number(receivedAt)) : admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "shortcuts",
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return res.status(500).send("Server error");
  }
});

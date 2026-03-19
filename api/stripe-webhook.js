import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

export const config = { runtime: "nodejs" };

function initAdmin() {
  if (getApps().length > 0) return;
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  initAdmin();
  const db = getFirestore();
  const getUid = (obj) => obj?.metadata?.uid;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const uid = getUid(session);
        if (!uid) break;
        if (session.mode === "subscription" && session.payment_status === "paid") {
          await db.doc(`users/${uid}`).set(
            { isPro: true, proExpiresAt: null, stripeSubscriptionId: session.subscription },
            { merge: true }
          );
        }
        break;
      }
      case "invoice.paid": {
        const uid = getUid(event.data.object.subscription_details);
        if (!uid) break;
        await db.doc(`users/${uid}`).set({ isPro: true, proExpiresAt: null }, { merge: true });
        break;
      }
      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        const obj = event.data.object;
        const uid = getUid(obj.metadata ? obj : obj.subscription_details);
        if (!uid) break;
        await db.doc(`users/${uid}`).set({ isPro: false }, { merge: true });
        break;
      }
    }
  } catch (err) {
    return res.status(500).end();
  }

  res.json({ received: true });
}

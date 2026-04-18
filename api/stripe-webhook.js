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

async function sendWelcomeEmail(email) {
  // Send via Resend (free tier: 3000 emails/month)
  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Evidstack <hello@evidstack.com>",
        to: email,
        subject: "Welcome to Evidstack Pro",
        html: `
          <div style="font-family:'Helvetica Neue',sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
            <div style="margin-bottom:32px;">
              <span style="font-size:11px;font-weight:800;letter-spacing:.14em;color:#6b7280;">EVIDSTACK</span>
            </div>
            <h1 style="font-size:28px;font-weight:900;line-height:1.1;margin:0 0 16px;letter-spacing:-.02em;">
              You're now a Pro member.
            </h1>
            <p style="font-size:14px;color:#6b7280;line-height:1.8;margin:0 0 32px;">
              Full access to all 175+ compounds, peptides, GLP-1 agents, and the AI Stack Builder is now unlocked.
            </p>
            <a href="https://evidstack.com/stack-builder" style="display:inline-block;padding:14px 28px;background:#0a0a0a;color:#ffffff;font-size:13px;font-weight:800;text-decoration:none;letter-spacing:.04em;">
              Build My Stack
            </a>
            <hr style="margin:40px 0;border:none;border-top:1px solid #e8e5df;" />
            <p style="font-size:11px;color:#9ca3af;line-height:1.6;">
              Evidstack Pro - $9.99/month. Cancel anytime at <a href="https://evidstack.com" style="color:#9ca3af;">evidstack.com</a>.<br/>
              Questions? hello@evidstack.com
            </p>
          </div>
        `,
      }),
    });
  } catch(e) {
    console.error("Email send failed:", e.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await getRawBody(req);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
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
            {
              isPro: true,
              proExpiresAt: null,
              stripeSubscriptionId: session.subscription,
              stripeCustomerId: session.customer,
            },
            { merge: true }
          );
          // Send welcome email
          if (session.customer_email) {
            await sendWelcomeEmail(session.customer_email);
          }
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
    console.error("Webhook handler error:", err);
    return res.status(500).end();
  }

  res.json({ received: true });
}

import { database, secure } from "../server/access.js";
export const config = { runtime: "nodejs" };

async function handler(req, context) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { uid, email, plan } = await req.json();
  if (!["monthly", "annual"].includes(plan)) return Response.json({ error: "Choose a valid plan." }, { status: 400 });
  if (context.account.isPro) return Response.json({ error: "Use Manage subscription to change your existing plan." }, { status: 409 });
  if (!uid || !email) return new Response("Missing uid or email", { status: 400 });

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const PRICE_ID = plan === "annual"
    ? process.env.STRIPE_PRICE_ANNUAL
    : process.env.STRIPE_PRICE_MONTHLY;
  const APP_URL = process.env.APP_URL || "https://evidstack.com";
  const db = database();
  const lockRef = db.doc(`_billingCheckoutLocks/${uid}`);
  const lockNow = Date.now();
  const lockExpiry = lockNow + 10 * 60 * 1000;
  let existingLock = null;

  // A browser double-click or a retried request must not create two subscriptions.
  await db.runTransaction(async tx => {
    const snap = await tx.get(lockRef);
    const current = snap.exists ? snap.data() : null;
    if (current?.expiresAt > lockNow) {
      existingLock = current;
      return;
    }
    tx.set(lockRef, { plan, createdAt: lockNow, expiresAt: lockExpiry, status: "pending" });
  });
  if (existingLock?.sessionUrl) {
    return new Response(JSON.stringify({ url: existingLock.sessionUrl, reused: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (existingLock) {
    return new Response(JSON.stringify({ error: "A checkout is already being prepared. Please wait a moment and try again." }), { status: 409, headers: { "Content-Type": "application/json" } });
  }

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      signal: AbortSignal.timeout(25000),
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `evidstack-checkout-${uid}-${plan}-${Math.floor(lockNow / 600000)}`,
      },
      body: new URLSearchParams({
        mode: "subscription",
        
        "line_items[0][price]": PRICE_ID,
        "line_items[0][quantity]": "1",
        customer_email: email,
        "metadata[uid]": uid,
        success_url: `${APP_URL}?upgrade=success`,
        cancel_url: `${APP_URL}?upgrade=cancel`,
        "subscription_data[metadata][uid]": uid,
      }),
    });
    const session = await res.json();
    if (!res.ok) throw new Error(session.error?.message || "Stripe error");
    await lockRef.set({ plan, createdAt: lockNow, expiresAt: lockExpiry, status: "created", sessionId: session.id, sessionUrl: session.url }, { merge: true });
    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    try {
      await db.runTransaction(async tx => {
        const snap = await tx.get(lockRef);
        if (snap.exists && snap.data()?.status === "pending") tx.delete(lockRef);
      });
    } catch {}
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


export default secure(handler, {"billing":true});


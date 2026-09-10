import { secure } from "../server/access.js";
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

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      signal: AbortSignal.timeout(25000),
      headers: { Authorization: `Bearer ${STRIPE_SECRET}`, "Content-Type": "application/x-www-form-urlencoded" },
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
    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}


export default secure(handler, {"billing":true});

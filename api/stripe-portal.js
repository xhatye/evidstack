export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { uid } = await req.json();
  if (!uid) return new Response(JSON.stringify({ error: "Missing uid" }), { status: 400, headers: { "Content-Type": "application/json" } });

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const APP_URL = process.env.APP_URL || "https://evidstack.com";

  try {
    // 1. Get the stripeCustomerId from Firestore via a simple fetch
    // We use the Firebase REST API since this is an Edge function
    const FIREBASE_PROJECT = process.env.FIREBASE_PROJECT_ID;
    const firestoreRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}/databases/(default)/documents/users/${uid}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const firestoreData = await firestoreRes.json();
    const customerId = firestoreData?.fields?.stripeCustomerId?.stringValue;

    if (!customerId) {
      return new Response(
        JSON.stringify({ error: "No billing account found. Contact evidstack@protonmail.com to manage your subscription." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Create a Stripe Customer Portal session
    const portalRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: customerId,
        return_url: `${APP_URL}?portal=return`,
      }),
    });

    const session = await portalRes.json();
    if (!portalRes.ok) throw new Error(session.error?.message || "Failed to create portal session");

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

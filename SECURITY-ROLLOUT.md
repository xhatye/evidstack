# Security patch rollout

This branch is not ready for an automatic production rollout.

1. Revoke and replace the Stripe API and webhook signing credentials previously committed in `.env.example`. Treat them as exposed even after deletion. Update the server environment and webhook endpoint signing secret together. Never test or reuse the exposed values. Historical Git cleanup does not replace rotation.
2. Review and apply Firestore rules before enabling the API patch. The candidate `firestore.rules` protects billing fields and quotas but intentionally denies every other collection. Merge legitimate lead capture and shared-stack policies after reviewing their data. Do not blindly deploy this candidate to production. Audit existing `users` billing fields against Stripe because the previous rules were not verified.
3. Configure server-only Firebase Admin credentials in the preview environment. Never prefix them with `VITE_`. Deploy the functions on Node, with at least 30 seconds allowed for AI requests.
4. In Stripe test mode, check signup, monthly and annual checkout, webhook delivery, Pro access, cancellation and portal access using two separate accounts. Confirm one account cannot access the other's billing portal. The webhook lifecycle and duplicate-checkout handling still need a separate patch before the relaunch.
5. Confirm quotas: one free Advisor request per account, 100 Pro AI attempts per UTC day, 10 requests per minute across API tools. Failed upstream attempts count toward quota. Billing is exempt from the daily AI limit. Update pricing copy before rollout; do not advertise unlimited AI.
6. Check the authenticated UI, mobile screens and deployed Node functions in preview. The local tests use mocked identity and storage; they do not prove production permissions, quota concurrency or Stripe configuration.

Tax configuration remains unchanged. Enable automatic tax only after confirming the required registrations.

The static research catalogue and medical accuracy, broader dependency upgrades, clinical output validation and webhook reconciliation remain separate audit findings. This patch is not a certification of those areas.

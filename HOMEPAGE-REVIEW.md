# Homepage, onboarding and SEO update

The homepage now uses a quiet editorial layout, a compact research index, native links and a searchable catalogue. The catalogue starts with fundamentals and displays 16 records at a time, with goal, collection and sort controls. Comparison remains a Pro action.

First visits no longer trigger the onboarding modal, exit popup or email-capture interruption. An optional inline guide explains how to read a record. Account CTAs open Firebase signup, and signup/Google login no longer force a health-profile form. Auth dialogs focus the email input, trap keyboard focus and close with Escape. Fundamental compound records are now readable without an account; Pro records retain their existing gate.

The build emits route-specific HTML metadata for 438 paths, canonical URLs, social titles/descriptions and a generated sitemap. Goal/guide canonicals preserve their real IDs. Personal tools are marked noindex. The rendered research body remains client-side; this is not full server rendering and does not promise search rankings. Generated metadata follows [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics); public links use real href attributes. Route handling uses [Vercel rewrites](https://vercel.com/docs/routing/rewrites).

Validated locally:

- Production build and 20 tests, including initial HTML metadata and guide IDs.
- Desktop and 390/320-pixel mobile layouts, with no horizontal overflow in the checked mobile views.
- Search, search-field focus, goal selection, pagination and optional guide.
- Real signup form entry, initial focus and Escape dismissal; no account was created.
- Direct Creatine record and matching canonical, with no signup wall.
- No browser console errors during the checked flows.

Before production: validate generated HTML routing in Vercel Preview and check authenticated and paid-account flows with test accounts. The existing security patch's Stripe rotation and Firebase review requirements still apply. This design update does not resolve the scientific-content audit or the existing large JavaScript bundle warning.

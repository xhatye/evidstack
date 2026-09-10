# Homepage revision

Preserves the original EVIDSTACK logo, Montserrat typography, cream/gold/charcoal palette, navigation, compound cards and monetization gates. Tier 2-4 cards remain Pro-only; the original four-card anonymous preview and signup requirement for full fundamental records are restored. No compound data or PubMed citations were edited.

Changes the hero copy and presentation: a charcoal background with gold orbital lines and a subtle grid, shorter product description, direct search and Pro actions, and clear Free/Pro access copy. Removes the black announcement strip and repeated hero statistics. The goal quiz is optional.

No automatic onboarding or exit popup. A small non-modal Pro suggestion appears after scrolling to the sixth rendered compound card, at most once per tab session. It does not take focus or block reading, has two dismissal controls, hides while account/upgrade/menu dialogs are open, and never appears for Pro members. It waits until the cookie banner is dismissed. Repeated scrolling after dismissal does not reopen it.

Retains the SEO metadata generator, canonical fixes, sitemap and robots settings from the preceding work. Page bodies remain client-rendered. Retains actual signup CTAs and the improved signup dialog.

Checked locally: original locked cards visible, no initial Pro suggestion, scroll-triggered suggestion and persistent dismissal; production build and existing tests. No purchases or account creation performed. Production deployment still depends on the security rollout in PR #1 and a Vercel Preview routing check.

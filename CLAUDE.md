# EVIDSTACK — Project Brief for Claude Code

## Project Overview
Evidstack is an evidence-based supplement and compound database SaaS.
- **URL:** evidstack.com
- **Repo:** github.com/xhatye/evidstack
- **Local path:** C:\Users\eytha\SUPRAI\
- **Stack:** React + Vite, Firebase Auth + Firestore, Stripe, Groq AI (llama-3.3-70b-versatile), Vercel Edge Functions
- **Contact:** evidstack@protonmail.com

## Pricing
- Pro Monthly: $9.99/month (`price_1TJwkRCxobeP7sziy7bKUK5u`)
- Pro Annual: $79/year (`price_1TJwlpCxobeP7sziqitWtDwC`)

## File Structure
```
SUPRAI/
├── src/
│   ├── App.jsx          — entire frontend (~6000 lines, single file)
│   ├── data.js          — 371 compounds with sideEffects arrays
│   ├── AuthContext.jsx  — Firebase auth, isPro, userProfile
│   ├── firebase.js      — Firebase config
│   └── main.jsx         — entry point with Vercel Analytics
├── api/
│   ├── symptom-advisor.js      — Groq AI compound advisor (Edge)
│   ├── stack-audit.js          — Groq AI stack audit (Edge)
│   ├── interaction-checker.js  — Groq AI interaction checker (Edge)
│   ├── bloodwork-analyzer.js   — Groq AI bloodwork analysis (Edge)
│   ├── ai-stack.js             — Groq AI stack builder (Edge)
│   ├── weekly-protocol.js      — Groq AI weekly protocol (Edge)
│   ├── stripe-checkout.js      — Stripe checkout session (Edge)
│   ├── stripe-webhook.js       — Stripe webhook (Node runtime)
│   └── stripe-portal.js        — Stripe customer portal (Edge)
├── public/
│   └── sitemap.xml
├── index.html
├── vite.config.js
└── vercel.json
```

## Design System (C object in App.jsx)
```js
C = {
  gold: "#e2c97e",
  ink: "#1a1a1a",
  bg: "#f4f2ee",
  white: "#ffffff",
  gray: "#6b7280",
  border: "#e8e5df",
  green: "#16a34a",
  blue: "#2563eb",
  amber: "#f59e0b",
  red: "#dc2626"
}
```
Font: Montserrat 900 for headings, Montserrat for all UI.

## Hard Rules — NEVER violate these
1. **Zero French text** anywhere on the site
2. **Zero em dashes (—)** anywhere in JSX or copy — use hyphen (-) or colon (:)
3. **Zero `</div>` outside return() closing** — causes "Unterminated regular expression" build error
4. **Always validate div balance** after editing components
5. App.jsx is a single file — all components live inside it
6. All API files use `export const config = { runtime: "edge" }` except stripe-webhook.js which uses Node

## Validation Script (run after every App.jsx edit)
```python
import re
with open('src/App.jsx') as f:
    code = f.read()

o=code.count('{'); c=code.count('}')
print(f"Braces OK: {o==c} ({o}/{c})")
print(f"Em dashes: {code.count(chr(0x2014))}")
print(f"Lines: {len(code.splitlines())}")

# Check div balance for a component
def check(func, end_marker):
    lines = code.split('\n')
    start = end = None
    for i,l in enumerate(lines):
        if f'function {func}' in l and start is None: start = i
        if end_marker in l and start: end = i; break
    if not start or not end: return f"? {func}"
    text = '\n'.join(lines[start:end])
    sc = len(re.findall(r'<div[^>]*/>', text))
    o = text.count('<div'); c = text.count('</div>') + sc
    return f"{'OK' if o==c else 'BAD'} {func}: net={o-c}"
```

## Database Structure (data.js)
Each compound entry:
```js
{
  id: "creatine-monohydrate",
  name: "Creatine Monohydrate",
  aliases: ["Creatine"],
  tier: 1,  // 1=Fundamentals, 2=Advanced, 3=Expert, 4=Biohacking
  tags: [],
  safety: 5,  // 1-5
  legal: "Legal worldwide",
  cost: "$10-30/month",
  effects: [{
    goal: "force",  // sleep|focus|memory|mood|force|recovery|energy|hormones|stress|longevity|skin|cardio|weight|hair|liver|recomp|eyes
    efficacy: 5,    // 1-5
    evidence: 5,    // 1-5
    study_count: 500,
    study_type: "Meta-analysis",
    summary: "..."
  }],
  dosage: { amount: "5g/day", timing: "Any time", note: "..." },
  interactions: ["Caffeine may reduce creatine uptake"],
  sideEffects: [{
    effect: "Mild GI discomfort",
    severity: "mild",    // mild|moderate|severe
    frequency: "common", // common|uncommon|rare
    note: "More likely above 10g/day"
  }]
}
```

## Goals (17 total)
```
all, sleep, focus, memory, mood, force, recovery, energy,
hormones, stress, longevity, skin, cardio, weight, hair, liver, recomp, eyes
```

## Current Routes
```
/                   → supplements (homepage)
/supplements        → supplements
/advisor            → AI Compound Advisor
/pricing            → PricingPage
/about              → AboutPage
/affiliate          → AffiliatePage
/legal              → LegalPage
/guides             → GuidesIndexPage
/goal/:id           → GoalPage (17 goal pages)
/guide/:id          → GuidePage (8 protocol guides)
/compound/:id       → CompoundPage
/stack/:shareId     → SharedStackPage
/stack-builder      → StackBuilder
/interactions       → InteractionChecker
/weekly-protocol    → WeeklyProtocolAI
/tracker            → MyTracker
/cycle-alerts       → CycleAlertsScreen
/stack-optimizer    → StackOptimizerScreen
/bloodwork          → BloodWorkScreen
/interaction-checker → InteractionCheckerPro
/stack-audit        → StackAuditScreen
/bloodwork-history  → BloodworkHistoryScreen
```

## Pro Features (gated behind isPro)
- All Tier 2/3/4 compounds in database
- AI Compound Advisor (unlimited queries, 1 free for non-Pro)
- Interaction Checker
- Stack Audit AI (score 0-100)
- Bloodwork History (16 biomarkers)
- AI Bloodwork Analyzer
- My Tracker
- Cycle Alerts
- Stack Builder (save stacks)
- Compare compounds
- Goal pages: show top 6 free, rest gated
- Guide pages: Advanced tier compounds gated

## Firebase Structure
```
users/{uid}: {
  isPro: boolean,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  proExpiresAt: null,
  profile: {
    age: number,
    weightKg: number,
    heightCm: number,
    sex: "Male" | "Female"
  }
}
shared_stacks/{id}: { ... }
```

## Environment Variables (Vercel)
```
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_MONTHLY     = price_1TJwkRCxobeP7sziy7bKUK5u
STRIPE_PRICE_ANNUAL      = price_1TJwlpCxobeP7sziqitWtDwC
GROQ_API_KEY
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
RESEND_API_KEY
APP_URL                  = https://evidstack.com
```

## Key Components (all in App.jsx)
- `CompoundPage` — individual compound pages with evidence, dosing, side effects, interactions
- `GoalPage` — ranks all compounds for a goal with A-F grades, Pro paywall at 6
- `GuidePage` — step-by-step protocol with Primary/Secondary/Advanced tiers
- `GuidesIndexPage` — index of all guides and goal pages
- `CompoundAdvisorScreen` — AI compound advisor with profile calibration
- `InteractionCheckerPro` — AI interaction analysis
- `StackAuditScreen` — AI stack scoring
- `BloodworkHistoryScreen` — 16 biomarker tracker
- `PricingPage` — includes competitor comparison table
- `AboutPage` — includes "What others won't cover" section
- `AccountCenter` — billing, profile, security tabs
- `ManageSubButton` — calls /api/stripe-portal for customer portal
- `LooksmaxxPage` — DELETED (was removed)

## Autocomplete Search
Live autocomplete dropdown on homepage:
- Prefix match first, then contains match
- Semantic goal match: typing "sleep" filters by sleep goal
- Click suggestion → sets search and scrolls to #compounds-grid
- Click-outside dismisses dropdown

## Aesthetic Classes
```css
.evid-shimmer-btn  — gold shimmer animation on CTAs
.evid-pulse-pro    — PRO badge pulse animation
.evid-reveal       — scroll-reveal fade-up (add .visible to trigger)
```

## Content Rules
- Zero French text anywhere
- No em dashes — use hyphens or colons
- Neutral, factual tone — no marketing hype, no "AI-esque" phrases
- "Not medical advice" disclaimer on all AI outputs and compound pages
- Looksmaxxing audience acknowledged via search placeholders and AI Advisor suggestions

## Current Business State (April 2026)
- 1 paying subscriber
- Target: $5k MRR (~500 subscribers at $9.99)
- Growth channel: TikTok organic (@evidstack, ~69 followers)
- Best performing video: Sam Altman + Armodafinil (44.5K views, format: celebrity clip + evidence breakdown + Evidstack screen recording)
- Reddit communities: r/nootropics, r/biohacking, r/looksmaxxing, r/HubermanLab, r/JoeRogan

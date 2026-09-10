import { SUPPLEMENTS, GOALS } from './data.js';

export const SITE = 'https://evidstack.com';
export const HOME_DESCRIPTION = 'Explore the Evidstack supplement database. Find compound research summaries, dosage information, side effects and interactions, and read the limitations.';
export const GUIDE_IDS = ['sleep','focus','hormones','force','longevity','skin','weight','recovery'];
const pages = {
  '/': ['Supplement & Compound Research | Evidstack', HOME_DESCRIPTION],
  '/supplements': ['Supplement & Compound Research | Evidstack', HOME_DESCRIPTION],
  '/about': ['About Evidstack | Supplement Research', 'Learn about Evidstack, its supplement database, research approach and limitations.'],
  '/guides': ['Supplement Research Guides | Evidstack', 'Explore supplement guides organized by goal. Read compound summaries, cautions and research limitations before making a decision.'],
  '/pricing': ['Pricing | Evidstack Free and Pro', 'Compare Evidstack Free and Pro. Browse the database for free, or explore paid research tools and their usage limits.'],
  '/legal': ['Terms and Privacy | Evidstack', 'Read the terms, privacy information and informational-use limitations for Evidstack.'],
  '/affiliate': ['Affiliate Information | Evidstack', 'Learn about the Evidstack affiliate program.'],
  '/changelog': ['Product Updates | Evidstack', 'Read recent Evidstack product updates.'],
};
export function getPageSeo(pathname) {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const canonical = SITE + (path === '/supplements' ? '/' : path);
  let title, description, indexable = true;
  if (pages[path]) [title, description] = pages[path];
  else if (path.startsWith('/compound/')) {
    const compound = SUPPLEMENTS.find(s => `/compound/${s.id}` === path);
    if (compound) { title = `${compound.name}: Research, Dosage and Cautions | Evidstack`; description = `Explore ${compound.name} on Evidstack: study summaries, dosage information, side effects and interactions. Read the research limitations and cautions.`; }
  } else if (path.startsWith('/goal/')) {
    const goal = GOALS.find(g => g.id !== 'all' && `/goal/${g.id}` === path);
    if (goal) { title = `${goal.label}: Supplement Research | Evidstack`; description = `Explore compounds related to ${goal.label.toLowerCase()}. Compare research summaries and review side effects, interactions and evidence limitations.`; }
  } else if (path.startsWith('/guide/')) {
    const id = path.slice(7);
    if (GUIDE_IDS.includes(id)) { const name=id.replace(/-/g,' ').replace(/^./,s=>s.toUpperCase()); title=`${name} Supplement Guide | Evidstack`; description=`Read the Evidstack ${name.toLowerCase()} guide, with compound information, research context and cautions. For information, not a personal prescription.`; }
  }
  if (!title) { title = 'Research Tools | Evidstack'; description = 'Sign in to access your Evidstack research tools and account.'; indexable = false; }
  return { title, description, canonical, robots: indexable ? 'index,follow' : 'noindex,follow' };
}
export function applyPageSeo(seo) {
  document.title = seo.title;
  for (const [selector, attr, value] of [
    ['meta[name="description"]','content',seo.description],['meta[name="robots"]','content',seo.robots],
    ['meta[property="og:title"]','content',seo.title],['meta[property="og:description"]','content',seo.description],
    ['meta[property="og:url"]','content',seo.canonical],['meta[name="twitter:title"]','content',seo.title],
    ['meta[name="twitter:description"]','content',seo.description],['link[rel="canonical"]','href',seo.canonical],
  ]) document.querySelector(selector)?.setAttribute(attr,value);
}
export function publicPaths() {
  return [...Object.keys(pages).filter(p=>!['/supplements','/legal','/affiliate','/changelog'].includes(p)),
    ...GOALS.filter(g=>g.id!=='all').map(g=>`/goal/${g.id}`), ...GUIDE_IDS.map(id=>`/guide/${id}`),
    ...SUPPLEMENTS.map(s=>`/compound/${s.id}`)];
}

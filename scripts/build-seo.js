import fs from 'node:fs';
import path from 'node:path';
import { getPageSeo, publicPaths, SITE } from '../src/seo.js';

const escape = text => text.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const template = fs.readFileSync('dist/index.html','utf8');
const routes=[...new Set([...publicPaths(),'/supplements','/legal','/affiliate','/changelog','/advisor','/tracker','/bloodwork','/stack-audit','/interaction-checker','/bloodwork-history','/stack-builder','/stack-optimizer','/weekly-protocol','/cycle-alerts','/interactions'])];
for (const route of routes) {
  const seo=getPageSeo(route);
  let html=template.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(seo.title)}</title>`);
  for(const [attribute,key,value] of [['name','description',seo.description],['name','robots',seo.robots],['property','og:title',seo.title],['property','og:description',seo.description],['property','og:url',seo.canonical],['name','twitter:title',seo.title],['name','twitter:description',seo.description]]) {
    html=html.replace(new RegExp(`<meta ${attribute}="${key}"[^>]*>`),`<meta ${attribute}="${key}" content="${escape(value)}" />`);
  }
  html=html.replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="${escape(seo.canonical)}" />`);
  const destination=route==='/'?'dist/index.html':path.join('dist',route.slice(1),'index.html');
  fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,html);
}
fs.writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths().map(route=>`  <url><loc>${escape(SITE+route)}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Generated route-specific HTML metadata for ${routes.length} pages and a canonical sitemap.`);

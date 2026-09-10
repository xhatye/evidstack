import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getPageSeo, GUIDE_IDS } from '../src/seo.js';

test('guide sitemap IDs correspond to actual guide definitions',()=>{
  const source=fs.readFileSync('src/App.jsx','utf8').split('const GUIDES={')[1].split('function GuidePage')[0];
  for(const id of GUIDE_IDS)assert.ok(source.includes(`  ${id}:{title:`),id);
});
test('production HTML has route-specific metadata before JavaScript', {skip:!fs.existsSync('dist/index.html')},()=>{
  for(const route of ['/','/goal/sleep','/guide/force','/compound/creatine-monohydrate','/tracker']){
    const html=fs.readFileSync(route==='/'?'dist/index.html':`dist${route}/index.html`,'utf8');
    const seo=getPageSeo(route);
    assert.ok(html.includes(`href="${seo.canonical}"`),route);
    assert.ok(html.includes(`content="${seo.robots}"`),route);
    assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  }
});

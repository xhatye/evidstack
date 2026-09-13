import test from 'node:test';
import assert from 'node:assert/strict';
import { getPageSeo,publicPaths } from '../src/seo.js';
test('goal and guide URLs retain their actual canonical path',()=>{
  assert.equal(getPageSeo('/goal/sleep').canonical,'https://evidstack.com/goal/sleep');
  assert.equal(getPageSeo('/guide/sleep').canonical,'https://evidstack.com/guide/sleep');
  assert.notEqual(getPageSeo('/goal/sleep').title,getPageSeo('/goal/focus').title);
});
test('home alias and tracking parameters do not create duplicate canonicals',()=>{
  assert.equal(getPageSeo('/supplements/?utm_source=test').canonical,'https://evidstack.com/');
});
test('unknown compounds and personal tools are not indexed',()=>{
  for(const path of ['/compound/not-real','/goal/not-real','/guide/not-real','/stack/private-share','/tracker'])assert.equal(getPageSeo(path).robots,'noindex,follow');
});
test('sitemap includes only unique indexable canonical pages',()=>{
  const routes=publicPaths();assert.equal(routes.length,new Set(routes).size);
  for(const route of routes){const seo=getPageSeo(route);assert.equal(seo.robots,'index,follow');assert.equal(seo.canonical,`https://evidstack.com${route}`);}
});

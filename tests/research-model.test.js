import test from 'node:test';
import assert from 'node:assert/strict';
import {TIRZEPATIDE,CREATINE,FADOGIA,RESEARCH_PROFILES} from '../src/research/profiles.js';
import {researchCounts,filterSources,uniqueSources,validateResearch,interactionSelection} from '../src/research/model.js';

test('pilot provenance validates, contrast records remain deliberately partial',()=>{
  for(const profile of Object.values(RESEARCH_PROFILES)) assert.deepEqual(validateResearch(profile),[]);
  assert.equal(CREATINE.sources[0].dose,null);
  assert.equal(FADOGIA.sources[0].sampleSize,null);
  assert.equal(FADOGIA.outcomes[0].status,'not_found');
});
test('official documents and reviews are not trial counts',()=>{
  assert.deepEqual(researchCounts(TIRZEPATIDE),{references:8,publications:5,trials:5,reviews:0,preclinical:0,official:3,latestPublication:2025});
  assert.equal(researchCounts(CREATINE).trials,0);
  assert.equal(researchCounts(CREATINE).reviews,1);
  assert.equal(researchCounts(FADOGIA).trials,0);
  assert.equal(researchCounts(FADOGIA).preclinical,1);
});
test('same trial in distinct publications counted once; duplicate DOI/PMID counted once',()=>{
  const original=TIRZEPATIDE.sources[0];
  const followup={...original,id:'followup',pmid:'other',doi:'other',url:'https://example.test/followup'};
  assert.equal(researchCounts({sources:[original,followup]}).trials,1);
  assert.equal(researchCounts({sources:[original,followup]}).publications,2);
  assert.equal(uniqueSources([original,{...original,id:'duplicate',pmid:null,doi:original.doi.toUpperCase()}]).length,1);
});
test('filters combine and unknown terms return no matches',()=>{
  assert.deepEqual(filterSources(TIRZEPATIDE.sources,{query:'40353578',kind:'Randomized trial',goal:'Weight',year:'2025',population:'Adults without diabetes'}).map(s=>s.id),['surmount5']);
  assert.equal(filterSources(TIRZEPATIDE.sources,{query:'no-such-publication'}).length,0);
  assert.equal(filterSources(TIRZEPATIDE.sources,{kind:'Official document'}).length,3);
});
test('invalid claim provenance and impossible confidence intervals are rejected',()=>{
  const copy=structuredClone(TIRZEPATIDE);copy.outcomes[0].sourceIds=['missing'];copy.charts[0].arms[0].ci=[-1,1];
  assert.ok(validateResearch(copy).includes('Missing source: missing'));
  assert.ok(validateResearch(copy).includes('Invalid chart estimate'));
});
test('interaction handoff resolves catalogue IDs and rejects arbitrary names',()=>{
  assert.deepEqual(interactionSelection('?compounds=tirzepatide,unknown,tirzepatide,semaglutide',[{id:'tirzepatide',name:'Tirzepatide (Mounjaro / Zepbound)'},{id:'semaglutide',name:'Semaglutide'}]),['Tirzepatide (Mounjaro / Zepbound)','Semaglutide']);
});

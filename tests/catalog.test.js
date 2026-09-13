import test from 'node:test';
import assert from 'node:assert/strict';
import { GOALS, SUPPLEMENTS } from '../src/catalog-data.js';
import { SCIENTIFIC_SOURCE_REPAIRS } from '../src/scientific-sources.js';
import { validateCatalog } from '../scripts/validate-catalog.js';

test('catalog validation passes for the current scientific dataset', () => {
  const result = validateCatalog(SUPPLEMENTS, SCIENTIFIC_SOURCE_REPAIRS);
  assert.deepEqual(result.errors, []);
  assert.equal(result.supplementCount, SUPPLEMENTS.length);
  assert.ok(result.effectCount > 700);
  assert.ok(result.warnings.some((warning) => warning.includes('needs-review')));
});

test('catalog validation rejects malformed records and sources', () => {
  const result = validateCatalog([
    { id: 'broken', name: 'Broken', tier: 5, safety: 0, effects: [{ goal: GOALS[1].id, efficacy: 6, evidence: -1, summary: '' }] },
  ], {});
  assert.ok(result.errors.some((error) => error.includes('tier')));
  assert.ok(result.errors.some((error) => error.includes('safety')));
  assert.ok(result.errors.some((error) => error.includes('efficacy')));
  assert.ok(result.errors.some((error) => error.includes('evidence')));
  assert.ok(result.errors.some((error) => error.includes('summary')));
});


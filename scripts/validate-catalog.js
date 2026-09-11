import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GOALS, SUPPLEMENTS } from '../src/data.js';
import { SCIENTIFIC_SOURCE_REPAIRS } from '../src/scientific-sources.js';

const SOURCE_PATTERNS = [
  /^PMID:[0-9]+$/,
  /^Cochrane:\S+$/i,
  /^Study:\S+$/i,
];

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const hasValidSource = (value) => isNonEmptyString(value) && SOURCE_PATTERNS.some((pattern) => pattern.test(value.trim()));

/**
 * Validate the catalog shape without pretending that an absent source is a
 * validated claim. Missing sources are reported as warnings because the
 * product intentionally exposes unresolved effects as "needs review".
 */
export function validateCatalog(supplements = SUPPLEMENTS, repairs = SCIENTIFIC_SOURCE_REPAIRS) {
  const errors = [];
  const warnings = [];
  const goalIds = new Set(GOALS.filter((goal) => goal.id !== 'all').map((goal) => goal.id));
  const ids = new Set();
  let effectCount = 0;
  let effectsWithoutSources = 0;

  if (!Array.isArray(supplements) || supplements.length === 0) {
    errors.push('SUPPLEMENTS must be a non-empty array.');
  }

  for (const supplement of supplements) {
    const label = supplement?.id || supplement?.name || '<unknown supplement>';
    if (!isNonEmptyString(supplement?.id)) errors.push(`${label}: missing id.`);
    else if (ids.has(supplement.id)) errors.push(`${label}: duplicate id.`);
    else ids.add(supplement.id);
    if (!isNonEmptyString(supplement?.name)) errors.push(`${label}: missing name.`);
    if (!Number.isInteger(supplement?.tier) || supplement.tier < 1 || supplement.tier > 4) {
      errors.push(`${label}: tier must be an integer from 1 to 4.`);
    }
    if (!Number.isInteger(supplement?.safety) || supplement.safety < 1 || supplement.safety > 5) {
      errors.push(`${label}: safety must be an integer from 1 to 5.`);
    }
    if (!Array.isArray(supplement?.effects) || supplement.effects.length === 0) {
      errors.push(`${label}: effects must be a non-empty array.`);
      continue;
    }

    supplement.effects.forEach((effect, index) => {
      effectCount += 1;
      const location = `${label} effect ${index}`;
      if (!goalIds.has(effect?.goal)) errors.push(`${location}: unknown goal "${effect?.goal ?? ''}".`);
      if (!Number.isFinite(effect?.efficacy) || effect.efficacy < -5 || effect.efficacy > 5) {
        errors.push(`${location}: efficacy must be a number from -5 to 5.`);
      }
      if (!Number.isFinite(effect?.evidence) || effect.evidence < 0 || effect.evidence > 5) {
        errors.push(`${location}: evidence must be a number from 0 to 5.`);
      }
      const studyCount = effect?.studies ?? effect?.study_count;
      if (studyCount !== undefined && (!Number.isFinite(studyCount) || studyCount < 0)) {
        errors.push(`${location}: studies must be a non-negative number.`);
      }
      const studyType = effect?.type ?? effect?.study_type;
      if (studyType !== undefined && !isNonEmptyString(studyType)) errors.push(`${location}: study type must be text.`);
      if (!isNonEmptyString(effect?.summary)) errors.push(`${location}: missing summary.`);

      if (!Array.isArray(effect?.sources) || effect.sources.length === 0) {
        effectsWithoutSources += 1;
        return;
      }
      effect.sources.forEach((source) => {
        if (!hasValidSource(source)) errors.push(`${location}: malformed source "${source}".`);
      });
    });
  }

  for (const [key, repair] of Object.entries(repairs || {})) {
    const separator = key.lastIndexOf(':');
    const supplementId = separator === -1 ? key : key.slice(0, separator);
    const effectIndex = separator === -1 ? NaN : Number(key.slice(separator + 1));
    const supplement = supplements.find((item) => item.id === supplementId);
    if (!supplement || !Number.isInteger(effectIndex) || !supplement.effects?.[effectIndex]) {
      errors.push(`Source repair ${key}: does not point to an existing effect.`);
      continue;
    }
    if (!Array.isArray(repair?.sources)) errors.push(`Source repair ${key}: sources must be an array.`);
    else repair.sources.forEach((source) => {
      if (!hasValidSource(source)) errors.push(`Source repair ${key}: malformed source "${source}".`);
    });
    if (!['validated', 'needs-review', 'replaced-mismatch', 'auto-linked'].includes(repair?.status)) {
      errors.push(`Source repair ${key}: unknown status "${repair?.status ?? ''}".`);
    }
  }

  if (effectsWithoutSources > 0) {
    warnings.push(`${effectsWithoutSources} of ${effectCount} effects have no attached source and remain marked for review.`);
  }
  const needsReview = supplements.flatMap((item) => item.effects || []).filter((effect) => effect.sourceStatus === 'needs-review').length;
  if (needsReview > 0) warnings.push(`${needsReview} effects are explicitly marked needs-review.`);

  return { errors, warnings, supplementCount: supplements.length, effectCount, effectsWithoutSources };
}

function run() {
  const result = validateCatalog();
  if (result.errors.length) {
    console.error(`Catalog validation failed with ${result.errors.length} error(s):`);
    result.errors.slice(0, 25).forEach((error) => console.error(`- ${error}`));
    if (result.errors.length > 25) console.error(`- ...and ${result.errors.length - 25} more.`);
    process.exitCode = 1;
    return;
  }
  console.log(`Catalog validation passed: ${result.supplementCount} supplements, ${result.effectCount} effects.`);
  result.warnings.forEach((warning) => console.log(`Warning: ${warning}`));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();


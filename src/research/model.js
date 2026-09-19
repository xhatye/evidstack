// Publications, trials and claims are separate entities. Missing data stays null.
export const EVIDENCE_STATES = Object.freeze({
  unrecorded: 'Not recorded', identified: 'Reference identified',
  supported: 'Supported by reviewed sources', uncertain: 'Uncertain or conflicting',
  not_found: 'No eligible human evidence found in this review', no_effect: 'No effect on this outcome in the cited study',
});

export function uniqueSources(sources = []) {
  const seen = new Set();
  return sources.filter(s => {
    const keys = [s.pmid && `pmid:${s.pmid}`, s.doi && `doi:${s.doi.toLowerCase()}`, s.url && `url:${s.url}`].filter(Boolean);
    if (!keys.length) throw new Error(`Source ${s.id} has no identity`);
    const duplicate = keys.some(k => seen.has(k));
    keys.forEach(k => seen.add(k));
    return !duplicate;
  });
}

export function researchCounts(profile) {
  const sources = uniqueSources(profile.sources);
  const publications = sources.filter(s => s.kind !== 'Official document');
  const clinical = publications.filter(s => s.level === 'Human' && s.kind === 'Randomized trial');
  const years = publications.map(s => s.year).filter(Number.isInteger);
  return {
    references: sources.length, publications: publications.length,
    trials: new Set(clinical.flatMap(s => s.trialIds || [])).size,
    reviews: publications.filter(s => s.kind === 'Systematic review').length,
    preclinical: publications.filter(s => s.level === 'Animal').length,
    official: sources.length - publications.length,
    latestPublication: years.length ? Math.max(...years) : null,
  };
}

export function filterSources(sources, {query = '', kind = '', goal = '', year = '', population = ''} = {}) {
  const q = query.trim().toLowerCase();
  return uniqueSources(sources).filter(s => (!q || [s.title,s.authors,s.journal,s.pmid,s.doi,s.label].join(' ').toLowerCase().includes(q))
    && (!kind || s.kind === kind) && (!goal || s.goals.includes(goal))
    && (!year || String(s.year) === String(year)) && (!population || s.populationGroup === population));
}

export function validateResearch(profile) {
  const errors = [];
  const ids = new Set(profile.sources.map(s => s.id));
  if (ids.size !== profile.sources.length || uniqueSources(profile.sources).length !== profile.sources.length) errors.push('Duplicate source');
  for (const claim of profile.outcomes) {
    if (!(claim.status in EVIDENCE_STATES)) errors.push(`Unknown status: ${claim.id}`);
    if (claim.status === 'supported' && !claim.sourceIds.length) errors.push(`Unsupported claim: ${claim.id}`);
    for (const id of claim.sourceIds) if (!ids.has(id)) errors.push(`Missing source: ${id}`);
  }
  for (const group of ['risks', 'mechanisms', 'regulation']) for (const claim of profile[group] || []) {
    if (!claim.sourceIds?.length || claim.sourceIds.some(id => !ids.has(id))) errors.push(`Missing ${group} provenance`);
  }
  for (const s of profile.sources) {
    if (!s.reviewScope || !s.checkedAt || !s.limitations) errors.push(`Incomplete provenance: ${s.id}`);
    if (s.kind === 'Randomized trial' && !s.trialIds?.length) errors.push(`Missing trial identity: ${s.id}`);
  }
  for (const chart of profile.charts || []) {
    if (!ids.has(chart.sourceId) || !chart.unit || !chart.population || !chart.duration) errors.push('Untraceable chart');
    if (chart.arms.some(a => !Number.isFinite(a.value) || !Array.isArray(a.ci) || a.ci[0] > a.value || a.ci[1] < a.value)) errors.push('Invalid chart estimate');
  }
  return errors;
}

export function interactionSelection(search, catalogue) {
  const ids = new URLSearchParams(search).get('compounds')?.split(',') || [];
  return [...new Set(ids)].map(id => catalogue.find(s => s.id === id)?.name).filter(Boolean).slice(0,8);
}

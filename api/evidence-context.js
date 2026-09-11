import { SUPPLEMENTS } from "../src/data.js";

function matchesCompound(query, supplement) {
  const terms = [supplement.name, supplement.id, ...(supplement.aliases || [])]
    .map(value => String(value).toLowerCase())
    .filter(term => term.length >= 3);
  return terms.some(term => query.includes(term));
}

function compactSupplement(supplement) {
  return {
    name: supplement.name,
    tier: supplement.tier,
    safety: supplement.safety,
    legal: supplement.legal,
    dosage: supplement.dosage || null,
    interactions: (supplement.interactions || []).slice(0, 8),
    effects: (supplement.effects || []).slice(0, 12).map(effect => ({
      goal: effect.goal,
      efficacy: effect.efficacy,
      evidence: effect.evidence,
      studies: effect.studies ?? effect.study_count ?? null,
      studyType: effect.type || effect.study_type || null,
      summary: effect.summary,
      sources: (effect.sources || []).slice(0, 8),
    })),
  };
}

export function contextForStack(stack) {
  const query = String(stack || "").toLowerCase();
  return SUPPLEMENTS.filter(s => matchesCompound(query, s))
    .slice(0, 20)
    .map(compactSupplement);
}

export function contextForCompounds(compounds) {
  const query = (compounds || []).map(value => String(value).toLowerCase()).join(" | ");
  return SUPPLEMENTS.filter(s => matchesCompound(query, s))
    .slice(0, 20)
    .map(compactSupplement);
}

export function contextBlock(entries) {
  if (!entries.length) return "No matching entry was found in the verified Evidstack database.";
  return JSON.stringify(entries).slice(0, 16000);
}


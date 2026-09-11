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

const GOAL_ALIASES = {
  strength: "force",
  muscle: "force",
  testosterone: "hormones",
  anxiety: "stress",
  cognition: "focus",
  "weight loss": "weight",
};

function goalKey(value) {
  const normalized = String(value || "").toLowerCase().trim();
  return GOAL_ALIASES[normalized] || normalized.replace(/[^a-z0-9]+/g, "-");
}

export function contextForGoals(goals) {
  const raw = (goals || []).map(value => String(value || "").toLowerCase()).join(" | ");
  const knownGoals = [...new Set(SUPPLEMENTS.flatMap(s => (s.effects || []).map(effect => goalKey(effect.goal))))];
  const query = knownGoals.filter(goal => raw.includes(goal.replace(/-/g, " ")));
  query.push(...Object.keys(GOAL_ALIASES).filter(alias => raw.includes(alias)).map(alias => GOAL_ALIASES[alias]));
  for (const value of goals || []) {
    const key = goalKey(value);
    if (key && SUPPLEMENTS.some(s => (s.effects || []).some(effect => goalKey(effect.goal) === key))) query.push(key);
  }
  const wanted = [...new Set(query)].filter(Boolean);
  if (!wanted.length) return [];
  return SUPPLEMENTS.filter(s => (s.effects || []).some(effect => wanted.includes(goalKey(effect.goal))))
    .sort((a, b) => {
      const score = supplement => (supplement.effects || [])
        .filter(effect => wanted.includes(goalKey(effect.goal)))
        .reduce((sum, effect) => sum + Number(effect.evidence || 0) + Number(effect.efficacy || 0), 0);
      return score(b) - score(a);
    })
    .slice(0, 40)
    .map(compactSupplement);
}

export function contextForQuery(query) {
  const direct = contextForCompounds([query]);
  const goals = contextForGoals([query]);
  const merged = new Map([...direct, ...goals].map(entry => [entry.name, entry]));
  return [...merged.values()].slice(0, 40);
}

export function contextBlock(entries) {
  if (!entries.length) return "No matching entry was found in the verified Evidstack database.";
  return JSON.stringify(entries).slice(0, 16000);
}


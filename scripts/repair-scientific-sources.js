import fs from "node:fs";
import { SUPPLEMENTS } from "../src/catalog-data.js";

const OUT = new URL("../scientific-source-repair.json", import.meta.url);
const API = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const EPMC = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";
const GOAL_TERMS = {
  sleep: ["sleep", "insomnia", "circadian", "jet lag"],
  focus: ["attention", "alertness", "executive", "focus", "cognition"],
  memory: ["memory", "cognition", "learning", "recall"],
  mood: ["depression", "anxiety", "mood", "psychiatric"],
  stress: ["stress", "cortisol", "anxiety"],
  force: ["strength", "muscle", "resistance", "power"],
  recovery: ["recovery", "muscle damage", "doms", "exercise"],
  endurance: ["endurance", "aerobic", "exercise", "running", "cycling"],
  energy: ["fatigue", "energy", "mitochondrial", "exercise"],
  hormones: ["testosterone", "hormone", "estrogen", "thyroid", "fertility"],
  longevity: ["mortality", "aging", "ageing", "inflammation", "cancer"],
  skin: ["skin", "dermatology", "acne", "eczema", "psoriasis"],
  cardio: ["cardiovascular", "blood pressure", "lipid", "triglyceride", "heart", "vascular"],
  weight: ["weight", "obesity", "adiposity", "fat", "body composition"],
  hair: ["hair", "alopecia"],
  liver: ["liver", "hepatic", "detoxification"],
  recomp: ["muscle", "body composition", "fat", "resistance"],
  eyes: ["eye", "vision", "retina"],
};
const STOP = new Set(["the", "and", "for", "with", "from", "into", "after", "during", "effects", "effect", "role", "use", "using", "clinical", "trial", "trials", "study", "studies", "supplementation", "supplement", "randomized", "systematic", "meta", "analysis", "review", "placebo", "controlled", "double", "blind", "healthy", "adults", "patients", "health", "risk", "data", "based", "plus", "form", "extract", "powder", "root", "leaf", "oil", "acid", "complex", "salt", "hydrochloride", "monohydrate", "bisglycinate", "glycinate"]);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function words(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/ +/).filter(word => word.length >= 4 && !STOP.has(word));
}
function quote(value) {
  return `"${String(value).replace(/"/g, "")}"`;
}
function compoundTerms(supplement) {
  const values = [supplement.name, ...(supplement.aliases || [])];
  return [...new Set(values.flatMap(words))];
}
function hasWord(text, term) {
  return new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\]/g, "\\\\$&")}\\b`, "i").test(text);
}
function sourceIds(sources) {
  return (sources || []).map(source => /^PMID:(\d+)$/.exec(source)?.[1]).filter(Boolean);
}
async function getJson(path, params) {
  const url = `${API}/${path}?${new URLSearchParams({ db: "pubmed", retmode: "json", ...params })}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`PubMed ${response.status}`);
  return response.json();
}
async function summary(ids) {
  if (!ids.length) return {};
  const data = await getJson("esummary.fcgi", { id: ids.join(",") });
  return Object.fromEntries(ids.map(id => [id, data.result?.[id] || null]));
}
async function search(supplement, goal) {
  const name = String(supplement.name).replace(/[+\-/:()]/g, " ").replace(/\s+/g, " ").trim();
  const terms = (GOAL_TERMS[goal] || [goal]).slice(0, 5).map(quote).join(" OR ");
  const query = `${quote(name)} AND (${terms}) AND (clinical trial[pt] OR randomized controlled trial[pt] OR meta-analysis[pt] OR systematic review[pt])`;
  const response = await fetch(`${EPMC}?format=json&pageSize=100&sort=CITED%20desc&query=${encodeURIComponent(`${name} AND (${(GOAL_TERMS[goal] || [goal]).slice(0, 2).join(" OR ")})`)}`);
  if (!response.ok) throw new Error(`Europe PMC ${response.status}`);
  const result = await response.json();
  return { query, results: (result.resultList?.result || []).filter(item => item.pmid).slice(0, 20) };
}
function score(meta, supplement, goal) {
  if (!meta?.title) return { score: 0, compoundHit: false, goalHit: false };
  const title = meta.title.toLowerCase();
  const compoundHit = compoundTerms(supplement).some(term => hasWord(title, term));
  const goalHit = (GOAL_TERMS[goal] || [goal]).some(term => title.includes(term));
  const typeText = (meta.pubtype || []).join(" ").toLowerCase();
  const animalOnly = /\b(mouse|mice|rat|rats|rodent|ovariectomized|castrated|murine|zebrafish|drosophila|rabbit|steer|livestock|in vitro|cell line|cell culture|cancer cells?)\b/.test(title);
  const humanHint = /\b(human|men|women|patients|adults|volunteers|participants|subjects|people|clinical|trial|randomized|systematic|meta-analysis)\b/.test(`${title} ${typeText}`);
  const humanEvidence = !animalOnly && humanHint;
  const studyBonus = /clinical trial|randomized|meta-analysis|systematic review/.test(`${title} ${typeText}`) ? 2 : 0;
  return { score: (compoundHit ? 5 : 0) + (goalHit ? 3 : 0) + studyBonus, compoundHit, goalHit, humanEvidence };
}
async function mapWithConcurrency(items, concurrency, worker) {
  const output = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      output[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  return output;
}

const allEffects = SUPPLEMENTS.flatMap(supplement => (supplement.effects || []).map((effect, effectIndex) => ({ supplement, effect, effectIndex })));
const existingIds = [...new Set(allEffects.flatMap(({ effect }) => sourceIds(effect.sources)))];
const existingMetadata = await summary(existingIds);
const candidates = await mapWithConcurrency(allEffects, 3, async ({ supplement, effect, effectIndex }) => {
  const ids = sourceIds(effect.sources);
  const existing = ids.map(id => {
    const meta = existingMetadata[id];
    return { id, title: meta?.title || null, ...score(meta, supplement, effect.goal) };
  });
  const existingMismatch = existing.filter(item => !item.compoundHit);
  const shouldSearch = !ids.length || existingMismatch.length > 0;
  let query = null;
  let searched = [];
  if (shouldSearch) {
    try {
      const result = await search(supplement, effect.goal);
      query = result.query;
      searched = result.results.map(item => ({ id: item.pmid, title: item.title || null, pubtype: String(item.pubType || "").split(";"), ...score(item, supplement, effect.goal) })).filter(item => item.compoundHit && item.goalHit && item.humanEvidence).sort((a, b) => b.score - a.score);
    } catch (error) {
      searched = [];
      query = `ERROR: ${error.message}`;
    }
    await sleep(350);
  }
  const selected = (shouldSearch ? searched : existing.filter(item => item.compoundHit)).slice(0, 3);
  return {
    key: `${supplement.id}:${effectIndex}`,
    compound: supplement.name,
    goal: effect.goal,
    summary: effect.summary,
    previousSources: effect.sources || [],
    previousTitles: existing.map(item => ({ id: item.id, title: item.title, compoundHit: item.compoundHit, goalHit: item.goalHit })),
    query,
    sources: selected.map(item => `PMID:${item.id}`),
    titles: selected.map(item => item.title),
    status: selected.length ? (existingMismatch.length ? "replaced-mismatch" : ids.length ? "validated" : "auto-linked") : "needs-review",
  };
});

const repairs = Object.fromEntries(candidates.map(candidate => [candidate.key, { sources: candidate.sources, status: candidate.status }]));
const report = {
  generatedAt: new Date().toISOString(),
  stats: {
    compounds: SUPPLEMENTS.length,
    effects: allEffects.length,
    effectsWithSources: allEffects.filter(({ effect }) => sourceIds(effect.sources).length).length,
    replacedMismatches: candidates.filter(candidate => candidate.status === "replaced-mismatch").length,
    autoLinked: candidates.filter(candidate => candidate.status === "auto-linked").length,
    validated: candidates.filter(candidate => candidate.status === "validated").length,
    needsReview: candidates.filter(candidate => candidate.status === "needs-review").length,
  },
  repairs,
  candidates,
};
fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.stats));


import fs from "node:fs";
import { SUPPLEMENTS } from "../src/catalog-data.js";

const output = process.argv[2] || "scientific-audit.json";
const effects = SUPPLEMENTS.flatMap((compound) => (compound.effects || []).map((effect, index) => ({
  compoundId: compound.id,
  compoundName: compound.name,
  effectIndex: index,
  goal: effect.goal,
  summary: effect.summary || "",
  sources: effect.sources || [],
})));
const pmids = [...new Set(effects.flatMap((effect) => effect.sources).filter((source) => /^PMID:\d+$/i.test(source)).map((source) => source.replace(/^PMID:/i, "")))];
const records = new Map();

for (let start = 0; start < pmids.length; start += 200) {
  const ids = pmids.slice(start, start + 200);
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
  const response = await fetch(url, { headers: { "user-agent": "Evidstack scientific audit (contact unavailable)" } });
  if (!response.ok) throw new Error(`PubMed request failed: ${response.status}`);
  const payload = await response.json();
  for (const id of ids) records.set(id, payload.result?.[id] || null);
}

const report = effects.map((effect) => ({
  ...effect,
  references: effect.sources.map((source) => {
    const match = /^PMID:(\d+)$/i.exec(source);
    if (!match) return { source, status: "non-pmid" };
    const record = records.get(match[1]);
    return { source, status: record ? "found" : "missing", title: record?.title || null, pubdate: record?.pubdate || null, url: `https://pubmed.ncbi.nlm.nih.gov/${match[1]}/` };
  }),
}));
const stats = {
  compounds: SUPPLEMENTS.length,
  effects: effects.length,
  effectsWithoutSources: effects.filter((effect) => effect.sources.length === 0).length,
  uniquePmids: pmids.length,
  missingPmids: [...records.entries()].filter(([, record]) => !record).map(([id]) => id),
  nonPmidSources: [...new Set(effects.flatMap((effect) => effect.sources).filter((source) => !/^PMID:\d+$/i.test(source)))],
};
fs.writeFileSync(output, JSON.stringify({ generatedAt: new Date().toISOString(), stats, effects: report }, null, 2));
console.log(JSON.stringify(stats));


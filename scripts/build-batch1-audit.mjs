import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd());
const rows = JSON.parse(fs.readFileSync(path.join(root, "batch1-audit.json"), "utf8"));

const catalogIds = [
  "magnesium-bisglycinate", "creatine-monohydrate", "vitamine-d3-k2", "zinc-bisglycinate", "omega-3",
  "ashwagandha-ksm66", "l-theanine", "caffeine", "lions-mane", "nmn", "vitamin-c", "vitamin-b12",
  "taurine", "glycine", "melatonin", "spirulina", "rhodiola-rosea", "berberine", "collagen", "curcumin",
  "bacopa-monnieri", "coq10", "citrulline", "tongkat-ali", "boron", "probiotics", "nac", "beta-alanine",
  "ginseng", "maca", "resveratrol", "huperzine-a", "sulforaphane", "apigenin", "alpha-gpc", "fadogia-agrestis",
  "bpc-157", "cerebrolysin", "semax", "methylene-blue", "whey-protein", "bcaa", "cbd", "dhea", "l-carnitine",
  "l-tyrosine", "nattokinase", "tb-500", "ipamorelin", "cjc-1295",
];

const sourceKeys = [
  "pmid", "doi", "title", "year", "journal", "study_design", "population", "sample_size", "dose_studied",
  "duration", "comparator", "outcomes", "adverse_events", "limitations", "source_url",
];

function parseSourceRecords(raw) {
  if (typeof raw !== "string" || !raw.trim().startsWith("[")) return [];
  const objects = [];
  let objectStart = -1;
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === "'" && /[,}]/.test(raw.slice(i + 1).match(/^\s*(.)/)?.[1] ?? "")) quoted = false;
      continue;
    }
    const previous = raw.slice(0, i).match(/(\S)\s*$/)?.[1] ?? "";
    if (char === "'" && /[\[\{,:]/.test(previous)) {
      quoted = true;
      continue;
    }
    if (char === "{") {
      if (depth === 0) objectStart = i;
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0 && objectStart >= 0) {
        objects.push(raw.slice(objectStart, i + 1));
        objectStart = -1;
      }
    }
  }
  return objects.map((objectText) => {
    const result = {};
    const pattern = new RegExp(`'(${sourceKeys.join("|")})'\\s*:\\s*'`, "g");
    const matches = [...objectText.matchAll(pattern)];
    matches.forEach((match, index) => {
      const valueStart = match.index + match[0].length;
      const nextStart = index + 1 < matches.length ? matches[index + 1].index : objectText.length - 1;
      let value = objectText.slice(valueStart, nextStart).replace(/\s*,\s*$/, "").replace(/'\s*$/, "");
      value = value.replace(/\\'/g, "'").replace(/\\\\/g, "\\").trim();
      result[match[1]] = value;
    });
    return result;
  });
}

function firstNumber(value) {
  const match = String(value ?? "").match(/^\s*(-?\d+(?:\.\d+)?)/);
  return match ? Number(match[0]) : null;
}

function text(value) {
  const normalized = String(value ?? "").trim();
  return normalized && !/^not reported\.?$/i.test(normalized) ? normalized : null;
}

function sourceRecord(record) {
  const pmid = String(record.pmid ?? "").match(/\b\d{5,9}\b/)?.[0] ?? null;
  const doi = String(record.doi ?? "").match(/10\.\d{4,9}\/[A-Za-z0-9.()/:;,_-]+/)?.[0] ?? null;
  const sourceUrl = String(record.source_url ?? "").match(/https?:\/\/\S+/)?.[0]?.replace(/[),.;]+$/, "") ?? null;
  return {
    pmid,
    doi,
    title: text(record.title),
    year: firstNumber(record.year),
    journal: text(record.journal),
    studyDesign: text(record.study_design),
    population: text(record.population),
    sampleSize: text(record.sample_size),
    doseStudied: text(record.dose_studied),
    duration: text(record.duration),
    comparator: text(record.comparator),
    outcomes: text(record.outcomes),
    adverseEvents: text(record.adverse_events),
    limitations: text(record.limitations),
    sourceUrl,
  };
}

const audits = rows.map((row, index) => ({
  recordNumber: Number(row["Record Number"]),
  catalogId: catalogIds[index],
  inputName: text(row["Input Name"]),
  canonicalName: text(row["Canonical Name"]),
  aliases: text(row.Aliases),
  category: text(row.Category),
  latestVerifiedPublicationYear: firstNumber(row["Latest Verified Publication Year"]),
  humanStudyCount: firstNumber(row["Human Study Count"]),
  totalStudyCount: firstNumber(row["Total Study Count"]),
  evidenceByGoal: text(row["Evidence By Goal"]),
  efficacyScore: firstNumber(row["Efficacy Score"]),
  evidenceQualityScore: firstNumber(row["Evidence Quality Score"]),
  safetySummary: text(row["Safety Summary"]),
  knownInteractions: text(row["Known Interactions"]),
  regulatoryStatus: text(row["Regulatory Status"]),
  limitations: text(row.Limitations),
  missingFields: text(row["Missing Fields"]),
  editorialReviewRequired: /^true$/i.test(String(row["Editorial Review Required"] ?? "")),
  sources: parseSourceRecords(row.Sources).map(sourceRecord),
}));

if (audits.length !== 50 || audits.some((audit) => !audit.catalogId)) {
  throw new Error(`Expected 50 mapped audit records, received ${audits.length}`);
}

const output = `// Generated from the Batch 1 audit export. These records are an editorial audit layer.\n// They do not replace the catalogue's linked evidence until each reference is verified.\nexport const BATCH1_EVIDENCE_AUDITS = ${JSON.stringify(audits, null, 2)};\n\nexport const BATCH1_EVIDENCE_AUDIT_BY_ID = Object.fromEntries(\n  BATCH1_EVIDENCE_AUDITS.map((audit) => [audit.catalogId, audit]),\n);\n`;
fs.writeFileSync(path.join(root, "src", "batch1-audit.js"), output);
console.log(`Wrote ${audits.length} records to src/batch1-audit.js`);


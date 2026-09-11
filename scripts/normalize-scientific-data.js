import fs from "node:fs";

const file = new URL("../src/data.js", import.meta.url);
let source = fs.readFileSync(file, "utf8");

// Keep the public goal taxonomy aligned with the records. "strength" was an
// obsolete key; "endurance" is a real outcome and is kept as its own goal.
source = source.replace(/goal:\s*["']strength["']/g, 'goal: "force"');

// Replace malformed or non-specific references with the primary records used
// by the corrected summaries below. This script is intentionally deterministic
// so the audit can be rerun after future catalogue edits.
source = source.replace(
  'summary: "Reduces sleep onset latency and increases deep sleep (delta waves). Particularly effective in magnesium-deficient individuals.", sources: ["PMID:32369677","PMID:17172008","PMID:46587"]',
  'summary: "Small trials and a meta-analysis in older adults with primary insomnia suggest modest improvements in sleep measures; evidence is limited and may depend on baseline magnesium status.", sources: ["PMID:23853635","PMID:33865376"]',
);
source = source.replace(
  'summary: "Improves mild to moderate depression scores. Effect comparable to some antidepressants in deficient subgroups.", sources: ["PMID:28150351"]',
  'summary: "A small SSRI-resistant cohort found improvement with magnesium orotate combined with a probiotic; this is preliminary evidence and does not establish magnesium as an antidepressant.", sources: ["PMID:28155119"]',
);
source = source.replace(
  'summary: "Correlation between magnesium deficiency and cognitive difficulties. Limited RCT data in healthy subjects.", sources: ["PMID:30987086"]',
  'summary: "Magnesium status may relate to cognition, but evidence for magnesium bisglycinate in healthy adults is insufficient to support a clear cognitive benefit.", sources: []',
);
source = source.replace(
  'summary: "Slightly reduces muscle cramps. Limited effects on DOMS.", sources: ["PMID:31896752"]',
  'summary: "No reliable, directly relevant clinical reference is attached to this recovery claim; treat the effect as unestablished pending review.", sources: []',
);
source = source.replace(
  'summary: "Supplementation in deficient individuals: +25% testosterone on average. Reduced effects when levels are already normal.", sources: ["PMID:21154195","PMID:30873843"]',
  'summary: "A small trial found higher testosterone after vitamin D supplementation in men, but the result should not be generalized to people with sufficient vitamin D or to the D3+K2 combination.", sources: ["PMID:21154195"]',
);
source = source.replace(
  'summary: "Reduces all-cause mortality by ~10%, cardiovascular mortality, and cancer risk. Solid observational data.", sources: ["PMID:29635313"]',
  'summary: "Broad mortality or cancer-prevention benefits are not established for the D3+K2 combination; effects vary by baseline status and K2-specific vascular outcomes remain uncertain.", sources: ["PMID:24953955"]',
);
source = source.replace(
  'summary: "The most researched sports supplement. Increases strength by +8% and power by +14% on average. Incontestable.", sources: ["PMID:12945830","PMID:28615996","Cochrane:2003"]',
  'summary: "Creatine plus resistance training improves strength and power in many trials; the size of benefit varies by training programme and participant.", sources: ["PMID:12945830","PMID:28615996"]',
);
source = source.replace(
  'summary: "Reduces triglycerides by 20-30%. Cardiovascular risk reduction confirmed. EPA is the priority form for cardiac effects.", sources: ["PMID:30019766","REDUCE-IT trial"]',
  'summary: "Prescription-dose EPA can lower triglycerides, and the REDUCE-IT trial found cardiovascular risk reduction with icosapent ethyl in a selected high-risk population; these findings do not apply automatically to all fish-oil supplements.", sources: ["PMID:30019766","PMID:30415628"]',
);
source = source.replace(
  'summary: "Reduces sleep onset latency by 7-12 min. Particularly effective for jet lag and circadian phase shift.", sources: ["Cochrane:2002","PMID:17172008"]',
  'summary: "Meta-analyses suggest a modest reduction in sleep-onset latency for some sleep disorders; the strongest use case is circadian timing and jet lag, with variable effects by population.", sources: ["PMID:16423108","PMID:16473858"]',
);
source = source.replace(
  'summary: "Promotes mitochondrial biogenesis via PGC-1alpha activation. Improves energy metabolism and reduces fatigue. RCT showed improved sleep and reduced fatigue in middle-aged adults.", sources: ["PMID:23) 78698"]',
  'summary: "Small randomized trials have evaluated PQQ for cognition and mitochondrial biomarkers, but evidence for general energy or fatigue benefits remains preliminary.", sources: ["PMID:34415830","PMID:36807425","PMID:38908296"]',
);

fs.writeFileSync(file, source);
console.log("Scientific data normalization complete.");


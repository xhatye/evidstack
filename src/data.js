// SUPRAI  - Supplement Database v1.0
// Sources: PubMed, Cochrane, Examine.com cross-referenced
// Efficacy 1-5: amplitude of effect in humans
// Evidence 1-5: quality & quantity of human research

export const GOALS = [
  { id: "all",       label: "All",           icon: "◈" },
  { id: "sleep",     label: "Sleep",         icon: "😴" },
  { id: "focus",     label: "Focus",           icon: "🧠" },
  { id: "memory",    label: "Memory",         icon: "🔬" },
  { id: "mood",      label: "Mood",          icon: "😊" },
  { id: "force",     label: "Strength",           icon: "💪" },
  { id: "recovery",  label: "Recovery",    icon: "🔁" },
  { id: "energy",    label: "Energy",         icon: "⚡" },
  { id: "hormones",  label: "Testosterone",    icon: "🩸" },
  { id: "stress",    label: "Stress / Cortisol", icon: "🌊" },
  { id: "longevity", label: "Longevity",       icon: "❤️" },
  { id: "skin",      label: "Skin / Hair",    icon: "✨" },
  { id: "cardio",    label: "Cardio",          icon: "🫀" },
  { id: "weight",    label: "Weight Loss",      icon: "⚖️" },
  { id: "hair",      label: "Hair Health",      icon: "💈" },
  { id: "liver",     label: "Liver / Detox",    icon: "🫁" },
  { id: "recomp",    label: "Body Recomp",      icon: "🔥" },
  { id: "eyes",      label: "Eye Health",       icon: "👁️" },

];
export const TIERS = {
  1: { label: "Fundamentals",  color: "#4ade80", desc: "Core supplements, extensively studied" },
  2: { label: "Advanced",       color: "#60a5fa", desc: "Good evidence base, common use" },
  3: { label: "Expert",       color: "#a78bfa", desc: "Real effects, less long-term data" },
  4: { label: "Biohacking",   color: "#f97316", desc: "Grey area, advanced users only" },
};

export const SUPPLEMENTS = [
  {
    id: "magnesium-bisglycinate",
    name: "Magnesium Bisglycinate",
    aliases: ["Mg", "magnésium glycinate"],
    tier: 1,
    safety: 5,
    legal: "OTC everywhere",
    cost: "$8-$15/month",
    dosage: { amount: "300–400 mg", timing: "30-60 min before sleep, dim lighting", note: "Bisglycinate = better absorption than oxide" },
    interactions: [],
    effects: [
      { goal: "sleep",    efficacy: 4, evidence: 4, studies: 14, type: "RCT + meta-analyses",
        summary: "Reduces sleep onset latency and increases deep sleep (delta waves). Particularly effective in magnesium-deficient individuals.", summary_fr: "Réduit la latence d'endormissement, augmente le sommeil profond (ondes delta). Particulièrement efficace si déficience en Mg.", sources: ["PMID:32369677","PMID:17172008","PMID:46587"] },
      { goal: "stress",   efficacy: 3, evidence: 4, studies: 11, type: "RCT",
        summary: "Attenuates HPA stress response and reduces salivary cortisol. Moderate but reproducible effect.", summary_fr: "Atténue la réponse HPA au stress, réduit le cortisol salivaire. Effet modéré mais reproductible.", sources: ["PMID:29093983","PMID:28445426"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 7, type: "RCT",
        summary: "Improves mild to moderate depression scores. Effect comparable to some antidepressants in deficient subgroups.", summary_fr: "Améliore les scores de dépression légère à modérée. Effet comparable à certains antidépresseurs sur sous-groupes déficients.", sources: ["PMID:28150351"] },
      { goal: "focus",    efficacy: 2, evidence: 2, studies: 3, type: "Observational",
        summary: "Correlation between magnesium deficiency and cognitive difficulties. Limited RCT data in healthy subjects.", summary_fr: "Correlation between Mg deficiency and cognitive difficulties. Few RCTs on healthy subjects.", sources: ["PMID:30987086"] },
      { goal: "recovery", efficacy: 2, evidence: 2, studies: 4, type: "RCT",
        summary: "Slightly reduces muscle cramps. Limited effects on DOMS.", summary_fr: "Slightly reduces muscle cramps. Effects on DOMS are limited.", sources: ["PMID:31896752"] },
      { goal: "cardio",   efficacy: 3, evidence: 4, studies: 18, type: "Meta-analyses",
        summary: "Reduces systolic blood pressure by ~4mmHg. Effects on arrhythmias are documented.", summary_fr: "Réduit la pression artérielle de ~4mmHg systolique. Effets sur arythmies documentés.", sources: ["PMID:27402922"] },
    ],
  },

  {
    id: "creatine-monohydrate",
    name: "Creatine Monohydrate",
    aliases: ["creatine", "créatine"],
    tier: 1,
    safety: 5,
    legal: "OTC everywhere",
    cost: "$10-$20/month",
    dosage: { amount: "3–5 g/jour", timing: "Anytime (timing non-critical)", note: "Monohydrate = bioequivalent to more expensive premium forms" },
    interactions: [],
    effects: [
      { goal: "force",    efficacy: 5, evidence: 5, studies: 300, type: "Cochrane meta-analyses",
        summary: "The most researched sports supplement. Increases strength by +8% and power by +14% on average. Incontestable.", summary_fr: "Supplément le plus étudié en sport. Augmente la force de +8% et la puissance de +14% en moyenne. Incontestable.", sources: ["PMID:12945830","PMID:28615996","Cochrane:2003"] },
      { goal: "recovery", efficacy: 4, evidence: 4, studies: 45, type: "RCT",
        summary: "Reduces post-exercise muscle damage and accelerates glycogen resynthesis. Effects on DOMS well documented.", summary_fr: "Réduit les dommages musculaires post-effort, accélère la resynthèse du glycogène. Effets sur DOMS documentés.", sources: ["PMID:17685722"] },
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves working memory and reasoning under cognitive stress (sleep deprivation, vegetarian diets).", summary_fr: "Améliore la mémoire de travail et le raisonnement sous stress cognitif (privation de sommeil, régimes végétariens).", sources: ["PMID:12909488","PMID:32702799"] },
      { goal: "energy",   efficacy: 4, evidence: 5, studies: 80, type: "Meta-analyses",
        summary: "Increases ATP resynthesis, essential for short intense efforts. Effects on chronic fatigue under investigation.", summary_fr: "Augmente la resynthèse d'ATP, essentiel pour efforts courts et intenses. Effets sur fatigue chronique en cours d'étude.", sources: ["PMID:9627907"] },
      { goal: "mood",     efficacy: 2, evidence: 2, studies: 5, type: "Preliminary RCT",
        summary: "Emerging data on treatment-resistant depression. Not yet conclusive.", summary_fr: "Données émergentes sur la dépression résistante. Pas encore concluant.", sources: ["PMID:31521053"] },
    ],
  },

  {
    id: "vitamine-d3-k2",
    name: "Vitamin D3 + K2",
    aliases: ["D3","vitamine D","cholécalciférol","MK-7"],
    tier: 1,
    safety: 4,
    legal: "OTC everywhere",
    cost: "$10-$20/month",
    dosage: { amount: "2000–5000 UI D3 + 100–200 µg K2 (MK-7)", timing: "With a fatty meal (fat-soluble)", note: "K2 essential to direct calcium to bones (avoids arterial calcification)" },
    interactions: ["Anticoagulants (warfarine) : K2 peut interférer"],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 4, studies: 22, type: "RCT",
        summary: "Supplementation in deficient individuals: +25% testosterone on average. Reduced effects when levels are already normal.", summary_fr: "Supplémentation chez déficients : +25% testostérone en moyenne. Effets moindres si taux déjà normaux.", sources: ["PMID:21154195","PMID:30873843"] },
      { goal: "mood",     efficacy: 3, evidence: 4, studies: 25, type: "RCT + meta-analyses",
        summary: "Strong correlation between deficiency and depression. RCTs show depression score improvement. Effect appears within 8-12 weeks.", summary_fr: "Strong correlation between deficiency and depression. RCTs show improvement in depression scores. Effet en 8–12 semaines.", sources: ["PMID:24632894"] },
      { goal: "longevity",efficacy: 4, evidence: 4, studies: 40, type: "Meta-analyses",
        summary: "Reduces all-cause mortality by ~10%, cardiovascular mortality, and cancer risk. Solid observational data.", summary_fr: "Reduction in all-cause mortality ~10%, cardiovascular mortality, and cancer. Solid observational data.", sources: ["PMID:29635313"] },
      { goal: "force",    efficacy: 2, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves muscle strength in deficient individuals (very common in France). No effect when levels are already sufficient.", summary_fr: "Amélioration force musculaire chez sujets déficients (très courant en France). Effet nul si taux suffisant.", sources: ["PMID:25776918"] },
      { goal: "focus",    efficacy: 2, evidence: 2, studies: 8, type: "Observational",
        summary: "Correlation between deficiency and cognitive decline. RCTs on cognitive function are ongoing.", summary_fr: "Corrélation déficience/déclin cognitif. RCT sur fonction cognitive en cours.", sources: ["PMID:26750723"] },
      { goal: "cardio",   efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "K2 reduces arterial calcification. D3 improves insulin sensitivity and lipid profile.", summary_fr: "K2 reduces arterial calcification. D3 improves insulin sensitivity and lipid profile.", sources: ["PMID:15514282"] },
    ],
  },

  {
    id: "zinc-bisglycinate",
    name: "Zinc Bisglycinate",
    aliases: ["zinc","Zn"],
    tier: 1,
    safety: 4,
    legal: "OTC everywhere",
    cost: "$8-$15/month",
    dosage: { amount: "15–30 mg/jour", timing: "Take away from phytate-rich meals (bread, cereals)", note: "Do not exceed 40mg/day. Bisglycinate > gluconate for absorption" },
    interactions: ["Magnesium (absorption competition, take 2+ hours apart)", "Copper (depletion risk if >40mg/day long-term)"],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 4, studies: 18, type: "RCT",
        summary: "Maintains and restores testosterone in deficient individuals. No effect when levels are optimal. Key player in steroidogenesis.", summary_fr: "Maintient et restaure la testostérone chez déficients. Effet nul si taux optimal. Acteur clé dans la stéroïdogenèse.", sources: ["PMID:8875519","PMID:30009330"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Antioxidant role, regulates NF-kB. Reduces chronic inflammation. Essential for immunity.", summary_fr: "Antioxidant role, regulates NF-kB. Reduces chronic inflammation. Essential for immunity.", sources: ["PMID:12730442"] },
      { goal: "skin",     efficacy: 3, evidence: 4, studies: 20, type: "RCT",
        summary: "Effective on acne (comparable to topical antibiotics). Accelerates wound healing. Role in keratin synthesis.", summary_fr: "Efficace sur acné (comparable à antibiotiques locaux). Accélère cicatrisation. Rôle dans synthèse kératine.", sources: ["PMID:3155745"] },
      { goal: "focus",    efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Zinc involved in glutamatergic and GABAergic transmission. Cognitive effects when deficient.", summary_fr: "Zinc impliqué dans transmission glutamatergique et GABAergique. Effet sur cognition si déficience.", sources: ["PMID:22381736"] },
    ],
  },

  {
    id: "omega-3",
    name: "Omega-3 EPA/DHA",
    aliases: ["fish oil","fish oil","EPA","DHA"],
    tier: 1,
    safety: 5,
    legal: "OTC everywhere",
    cost: "$15-$30/month",
    dosage: { amount: "2–4 g EPA+DHA/jour", timing: "With meals for absorption", note: "Aim for EPA:DHA ratio >= 2:1 for cardiovascular and anti-inflammatory effects" },
    interactions: ["Anticoagulants (at high dose >3g/day)"],
    effects: [
      { goal: "cardio",   efficacy: 4, evidence: 5, studies: 100, type: "Cochrane meta-analyses",
        summary: "Reduces triglycerides by 20-30%. Cardiovascular risk reduction confirmed. EPA is the priority form for cardiac effects.", summary_fr: "Réduit triglycérides de 20–30%. Réduction risque cardiovasculaire confirmée. EPA prioritaire pour effets cardio.", sources: ["PMID:30019766","REDUCE-IT trial"] },
      { goal: "mood",     efficacy: 4, evidence: 4, studies: 35, type: "Meta-analyses",
        summary: "Effective for depression, especially high-dose EPA (2g+/day). Comparable to antidepressants for mild to moderate forms.", summary_fr: "Efficace sur dépression, surtout EPA à haute dose (≥2g/j). Comparable à antidépresseurs sur formes légères-modérées.", sources: ["PMID:26950489"] },
      { goal: "focus",    efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Improves processing speed and working memory. DHA is structural to neuronal membranes.", summary_fr: "Improves processing speed and working memory. DHA is structural for neuronal membranes.", sources: ["PMID:29215971"] },
      { goal: "longevity",efficacy: 4, evidence: 4, studies: 50, type: "Meta-analyses",
        summary: "Systemic anti-inflammatory. Telomere lengthening documented. Reduces IL-6 and TNF-alpha.", summary_fr: "Anti-inflammatoire systémique. Allongement des télomères documenté. Réduction IL-6 et TNF-α.", sources: ["PMID:29383325"] },
      { goal: "recovery", efficacy: 3, evidence: 3, studies: 18, type: "RCT",
        summary: "Reduces DOMS and improves muscle recovery. Role in post-exercise protein synthesis.", summary_fr: "Reduces DOMS and improves muscle recovery. Role in post-exercise protein synthesis.", sources: ["PMID:19234590"] },
      { goal: "skin",     efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Skin hydration, reduction of psoriasis and eczema. Partial UV protection.", summary_fr: "Skin hydration, reduction of psoriasis and eczema. Partial UV protection.", sources: ["PMID:15781130"] },
    ],
  },

  {
    id: "ashwagandha-ksm66",
    name: "Ashwagandha KSM-66",
    aliases: ["withania somnifera","ashwagandha"],
    tier: 2,
    safety: 4,
    legal: "OTC everywhere",
    cost: "$15-$25/month",
    dosage: { amount: "300–600 mg/jour (extrait standardisé)", timing: "Morning or evening depending on goal (evening for sleep)", note: "KSM-66 and Sensoril are the most studied standardized extracts. Avoid non-standardized root products." },
    interactions: ["Immunosuppressants (may amplify)","Sedatives (additive effect)","Thyroid medications (may alter TSH)"],
    effects: [
      { goal: "stress",   efficacy: 4, evidence: 4, studies: 24, type: "RCT",
        summary: "Reduces cortisol by 15-30% across studies. Significant improvement in perceived stress scores (PSS). Best studied adaptogen.", summary_fr: "Réduit cortisol de 15–30% selon études. Amélioration significative scores de stress perçu (PSS). Meilleur adaptogène étudié.", sources: ["PMID:31517876","PMID:23439798"] },
      { goal: "sleep",    efficacy: 4, evidence: 4, studies: 14, type: "RCT",
        summary: "Reduces sleep onset latency, improves subjective sleep quality and objective efficiency (actigraphy).", summary_fr: "Réduit latence d'endormissement, améliore qualité subjective du sommeil et efficacité objective (actigraphie).", sources: ["PMID:32818573"] },
      { goal: "hormones", efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Increases testosterone by +10-22% in men. Improves male fertility (sperm volume, motility).", summary_fr: "Augmente testostérone de +10–22% chez hommes. Améliore fertilité masculine (volume sperme, mobilité).", sources: ["PMID:19789214","PMID:28866736"] },
      { goal: "force",    efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "+1.5 to 2x greater strength gains vs placebo over 8 weeks of resistance training. Increases VO2max.", summary_fr: "+1.5 to 2x greater strength gain vs placebo over 8 weeks of resistance training. Increases VO2max.", sources: ["PMID:25667198"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Reduces anxiety (HAM-A scores). Antidepressant effects documented. Mechanism via GABA and HPA axis.", summary_fr: "Réduit anxiété (HAM-A scores). Effets antidépresseurs documentés. Mécanisme via GABA et HPA.", sources: ["PMID:31523110"] },
      { goal: "focus",    efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Improved working memory and reaction time. Limited data.", summary_fr: "Improves working memory and reaction time. Limited data.", sources: ["PMID:28471731"] },
    ],
  },

  {
    id: "l-theanine",
    name: "L-Theanine",
    aliases: ["theanine","théanine"],
    tier: 1,
    safety: 5,
    legal: "OTC everywhere",
    cost: "$8-$15/month",
    dosage: { amount: "100–200 mg", timing: "With caffeine (4:1 theanine:caffeine ratio) for focus, alone in the evening for relaxation", note: "Caffeine + theanine synergy = gold standard for focus without anxiety" },
    interactions: [],
    effects: [
      { goal: "focus",    efficacy: 4, evidence: 4, studies: 25, type: "RCT",
        summary: "Caffeine+theanine combo: improves sustained attention, reaction speed, and accuracy. Reduces caffeine-induced anxiety.", summary_fr: "En combo caféine+théanine : améliore attention soutenue, vitesse de réaction, précision. Réduit l'anxiété de la caféine.", sources: ["PMID:18681988","PMID:23107346"] },
      { goal: "stress",   efficacy: 3, evidence: 4, studies: 18, type: "RCT",
        summary: "Increases alpha waves (EEG). Reduces acute stress response. Mild anxiolytic without sedation.", summary_fr: "Increases alpha waves (EEG). Reduces acute stress response. Mild anxiolytic without sedation.", sources: ["PMID:19752807"] },
      { goal: "sleep",    efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Improves subjective sleep quality. Reduces nightmares. Most effective without caffeine (evening dose).", summary_fr: "Improves subjective sleep quality. Reduces nightmares. Best without caffeine (evening dose).", sources: ["PMID:22214254"] },
      { goal: "mood",     efficacy: 2, evidence: 2, studies: 5, type: "RCT",
        summary: "Slight mood improvement. Synergistic with caffeine. Alone: limited data.", summary_fr: "Slight mood improvement. Synergistic effect with caffeine. Alone: limited data.", sources: ["PMID:23107346"] },
    ],
  },

  {
    id: "caffeine",
    name: "Caffeine",
    aliases: ["caffeine","café","cafeine"],
    tier: 1,
    safety: 3,
    legal: "OTC everywhere (high dose banned in competitive sport)",
    cost: "$1-$5/month",
    dosage: { amount: "100–200 mg (3–6 mg/kg max)", timing: "90 min after waking. Avoid after 2pm.", note: "Tolerance builds quickly. Cycling recommended." },
    interactions: ["L-théanine (synergie)", "MAOIs (dangerous interactions)"],
    effects: [
      { goal: "focus",    efficacy: 5, evidence: 5, studies: 500, type: "Meta-analyses",
        summary: "The most documented effect in behavioral pharmacology. Improves alertness, reaction time, and working memory. Incontestable.", summary_fr: "Most documented effect in behavioral pharmacology. Improves alertness, reaction time, and working memory. Incontestable.", sources: ["PMID:24861208","PMID:16541243"] },
      { goal: "energy",   efficacy: 5, evidence: 5, studies: 200, type: "Meta-analyses",
        summary: "Adenosine antagonist. Reduces perceived fatigue and improves endurance. Reproducible effect.", summary_fr: "Antagoniste adénosinergique. Réduit fatigue perçue, améliore endurance. Effet reproductible.", sources: ["PMID:20205813"] },
      { goal: "force",    efficacy: 3, evidence: 4, studies: 40, type: "Meta-analyses",
        summary: "+2-4% maximal strength, +4-8% power output. Significant effects in strength and endurance sports.", sources: ["PMID:29876876"] },
      { goal: "mood",     efficacy: 3, evidence: 4, studies: 30, type: "Epidemiological",
        summary: "Inverse correlation between coffee and depression (meta-analysis 350k+ people). Mechanism: dopamine and adenosine.", summary_fr: "Inverse correlation between coffee and depression (meta-analysis 350k+ people). Mechanism via dopamine and adenosine.", sources: ["PMID:26944757"] },
      { goal: "stress",   efficacy: -2, evidence: 4, studies: 20, type: "RCT",
        summary: "NEGATIVE EFFECT: Increases cortisol, anxiety, and heart rate. Counterproductive with chronic stress.", summary_fr: "WARNING NEGATIVE EFFECT: Increases cortisol, anxiety, and heart rate. Counterproductive under chronic stress.", sources: ["PMID:18078812"] },
    ],
  },

  {
    id: "lions-mane",
    name: "Lion's Mane",
    aliases: ["hericium erinaceus","lion mane"],
    tier: 2,
    safety: 4,
    legal: "OTC everywhere",
    cost: "$20-$35/month",
    dosage: { amount: "500–3000 mg/jour (extrait)", timing: "Morning with food. Effects in 4-8 weeks.", note: "Fruiting body extracts > mycelium on grain substrate. Verify the source." },
    interactions: [],
    effects: [
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Stimulates NGF (nerve growth factor). Improves memory and mild cognition in older adults. Emerging data in younger adults.", summary_fr: "Stimulates NGF (nerve growth factor). Improves memory and mild cognition in older adults. Données émergentes chez jeunes adultes.", sources: ["PMID:18844328","PMID:23756457"] },
      { goal: "focus",    efficacy: 3, evidence: 2, studies: 6, type: "Preliminary RCT",
        summary: "Improved attention and processing speed. Mechanism: NGF + reduction of brain inflammation.", summary_fr: "Improves attention and processing speed. Mechanism via NGF + brain inflammation reduction.", sources: ["PMID:31413233"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 8, type: "RCT",
        summary: "Reduces depression and anxiety in 3 RCTs. Mechanism: anti-inflammatory and NGF effects on hippocampus.", summary_fr: "Réduit dépression et anxiété dans 3 RCT. Mécanisme anti-inflammatoire et NGF sur hippocampe.", sources: ["PMID:31980901"] },
      { goal: "longevity",efficacy: 2, evidence: 2, studies: 5, type: "Animal + preliminary human",
        summary: "Neuroprotective effects documented in vitro and animal studies. Anti-Alzheimer potential under investigation.", summary_fr: "Neuroprotecteur documenté in vitro et animaux. Potentiel anti-Alzheimer en cours d'investigation.", sources: ["PMID:24266378"] },
    ],
  },

  {
    id: "nmn",
    name: "NMN / NR",
    aliases: ["nicotinamide mononucleotide","nicotinamide riboside","NAD+"],
    tier: 3,
    safety: 3,
    legal: "OTC dans la plupart des pays (Zone grise FDA 2023)",
    cost: "$50-$120/month",
    dosage: { amount: "250–500 mg/jour NMN ou NR", timing: "Morning fasted or with light meal", note: "NMN vs NR: no clear consensus on superiority. Add TMG (500mg) to avoid methyl depletion." },
    interactions: ["TMG recommended (methylation support)", "Resveratrol (SIRT1 synergy documented)"],
    effects: [
      { goal: "energy",   efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Increases intracellular NAD+ by +40-90%. Improves muscular and aerobic fatigue. Robust effects in older adults, more modest in young individuals.", summary_fr: "Augmente NAD+ intracellulaire de +40–90%. Améliore fatigue musculaire et aérobie. Effets robustes chez seniors, plus modestes chez jeunes.", sources: ["PMID:35082536","PMID:34849980"] },
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 8, type: "Preliminary RCT",
        summary: "Restores NAD+ which declines with age. Activates sirtuins (SIRT1-7). Promising but still limited human data.", summary_fr: "Restaure NAD+ qui décline avec l'âge. Active sirtuines (SIRT1–7). Données humaines prometteuses mais encore limitées.", sources: ["PMID:31685086"] },
      { goal: "focus",    efficacy: 2, evidence: 2, studies: 4, type: "RCT",
        summary: "Slight cognitive improvement in older adults. No solid data in healthy young adults.", summary_fr: "Amélioration légère cognition chez seniors. Pas de données solides sur jeunes adultes sains.", sources: ["PMID:34049091"] },
      { goal: "recovery", efficacy: 2, evidence: 2, studies: 5, type: "RCT",
        summary: "Improves aerobic capacity and muscular endurance in middle-aged adults. Muscle effects documented.", summary_fr: "Améliore capacité aérobie et endurance musculaire chez adultes d'âge moyen. Effets musculaires documentés.", sources: ["PMID:35082536"] },
    ],
  },


  // ── TIER 1 ADDITIONS ──────────────────────────────────────────────────────

  {
    id: "vitamin-c",
    name: "Vitamin C",
    aliases: ["acide ascorbique","ascorbate","vitC"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$5-$10/month",
    dosage: { amount: "500–2000 mg/jour", timing: "With meals, split doses", note: "Above 2g/day: osmotic diarrhea risk. Liposomal form = better absorption at high doses." },
    interactions: [],
    effects: [
      { goal: "longevity", efficacy: 3, evidence: 4, studies: 40, type: "Meta-analyses",
        summary: "Major antioxidant, reduces oxidative stress. Strong correlation with longevity in epidemiological studies. Central role in collagen synthesis.", summary_fr: "Antioxydant majeur, réduit stress oxydatif. Corrélation forte avec longévité dans études épidémiologiques. Rôle central dans synthèse collagène.", sources: ["PMID:29099763"] },
      { goal: "skin",     efficacy: 4, evidence: 4, studies: 30, type: "RCT",
        summary: "Stimulates collagen synthesis, reduces fine lines, improves skin radiance. Topical AND oral efficacy documented.", summary_fr: "Stimule synthèse de collagène, réduit ridules, améliore éclat. Efficacité topique ET orale documentée.", sources: ["PMID:17921406"] },
      { goal: "recovery", efficacy: 2, evidence: 3, studies: 20, type: "RCT",
        summary: "Reduces post-exercise cortisol. Note: high doses may blunt muscle adaptations.", summary_fr: "Réduit cortisol post-effort. Attention : hautes doses peuvent bloquer adaptations musculaires.", sources: ["PMID:17353987"] },
    ],
  },

  {
    id: "vitamin-b12",
    name: "Vitamin B12",
    aliases: ["cobalamine","méthylcobalamine","B12"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$5-$10/month",
    dosage: { amount: "500–1000 µg/jour", timing: "Morning fasted", note: "Methylcobalamin > cyanocobalamin. Essential for vegetarians and vegans." },
    interactions: ["Metformin (reduces B12 absorption long-term)"],
    effects: [
      { goal: "energy",   efficacy: 4, evidence: 4, studies: 35, type: "RCT",
        summary: "Central role in ATP synthesis. Deficiency causes severe fatigue and brain fog. Dramatic improvement when deficiency is corrected.", summary_fr: "Rôle central dans synthèse ATP. Déficience = fatigue sévère et brouillard mental. Correction spectaculaire si déficient.", sources: ["PMID:21671542"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Serotonin and dopamine synthesis is B12-dependent. Deficiency linked to depression.", summary_fr: "Synthèse de sérotonine et dopamine B12-dépendante. Déficience liée à dépression.", sources: ["PMID:16648883"] },
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 18, type: "RCT",
        summary: "Role in neuronal myelination. Deficiency causes cognitive decline. Homocysteine reduced by B12.", summary_fr: "Rôle dans myélinisation neuronale. Déficience cause déclin cognitif. Homocystéine réduite par B12.", sources: ["PMID:26912492"] },
    ],
  },

  {
    id: "taurine",
    name: "Taurine",
    aliases: ["taurine"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$5-$12/month",
    dosage: { amount: "1–3 g/jour", timing: "Before exercise or before sleep", note: "Science 2023 study: supplementation extends mouse lifespan +10-12%. Declines with age." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "RCT + Science 2023",
        summary: "Yadav et al. Science 2023: improves metabolic health and animal longevity. Taurine declines significantly with age.", summary_fr: "Étude Yadav et al. Science 2023 : améliore santé métabolique et longévité animale. Taurine décline fortement avec l'âge.", sources: ["PMID:37289583"] },
      { goal: "cardio",   efficacy: 3, evidence: 3, studies: 14, type: "Meta-analyses",
        summary: "Reduces blood pressure, improves insulin sensitivity and lipid profile.", summary_fr: "Réduit pression artérielle, améliore sensibilité insuline et profil lipidique.", sources: ["PMID:25299618"] },
      { goal: "sleep",    efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Mild anxiolytic effect via glycine and GABA. Anecdotally improves sleep quality.", summary_fr: "Léger effet anxiolytique via glycine et GABA. Améliore qualité sommeil anecdotiquement.", sources: ["PMID:10919205"] },
    ],
  },

  {
    id: "glycine",
    name: "Glycine",
    aliases: ["glycine","glycocolle"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$5-$10/month",
    dosage: { amount: "3–5 g", timing: "30 min avant le coucher", note: "Non-essential amino acid. Combined with NAC for glutathione synthesis (GlyNAC). No dependency risk." },
    interactions: [],
    effects: [
      { goal: "sleep",    efficacy: 4, evidence: 4, studies: 15, type: "RCT",
        summary: "Reduces core body temperature, facilitates sleep onset. Improves deep sleep quality. Unique effect among amino acids.", summary_fr: "Réduit température corporelle centrale, facilite endormissement. Améliore qualité sommeil profond. Effet unique parmi acides aminés.", sources: ["PMID:22241103"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Glutathione precursor with NAC. Role in hepatic detoxification. GlyNAC reverses 8 aging markers.", summary_fr: "Glutathione precursor with NAC. Role in hepatic detoxification. GlyNAC reverses 8 aging markers.", sources: ["PMID:21795544"] },
      { goal: "skin",     efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Major component of collagen (33%). Improves skin elasticity and hydration.", summary_fr: "Major collagen component (33%). Improves skin elasticity and hydration.", sources: ["PMID:26362681"] },
    ],
  },

  {
    id: "melatonin",
    name: "Melatonin",
    aliases: ["melatonin","mélatonine"],
    tier: 1, safety: 4, legal: "OTC (prescription required at high dose in some countries)", cost: "$5-$15/month",
    dosage: { amount: "0.3–1 mg", timing: "30–60 min avant le coucher, lumière tamisée", note: "Popular doses (5-10mg) are too high. 0.3mg is equally effective with fewer residual effects." },
    interactions: ["Sedatives (additive effect)","Anticoagulants"],
    effects: [
      { goal: "sleep",    efficacy: 4, evidence: 5, studies: 80, type: "Cochrane meta-analyses",
        summary: "Reduces sleep onset latency by 7-12 min. Particularly effective for jet lag and circadian phase shift.", summary_fr: "Réduit latence d'endormissement de 7–12 min. Particulièrement efficace pour jet lag et décalage de phase circadienne.", sources: ["Cochrane:2002","PMID:17172008"] },
    ],
  },

  {
    id: "spirulina",
    name: "Spirulina",
    aliases: ["spirulina","arthrospira","chlorella"],
    tier: 1, safety: 4, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "1–5 g/jour", timing: "With meals", note: "Blue-green algae: complete protein + phycocyanin antioxidant. Check for heavy metals depending on source." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Phycocyanin: potent anti-inflammatory. Reduces TNF-alpha, IL-6. Role in detoxification.", summary_fr: "Phycocyanine : anti-inflammatoire puissant. Réduit TNF-α, IL-6. Rôle en détoxification.", sources: ["PMID:26813468"] },
      { goal: "energy",   efficacy: 2, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves endurance and reduces oxidative fatigue. Rich in iron, B12, magnesium.", summary_fr: "Améliore endurance et réduit fatigue oxydative. Riche en fer, B12, magnésium.", sources: ["PMID:20010118"] },
    ],
  },

  // ── TIER 2 ADDITIONS ──────────────────────────────────────────────────────

  {
    id: "rhodiola-rosea",
    name: "Rhodiola Rosea",
    aliases: ["rhodiola","rose root"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "200–600 mg/jour (extrait 3% rosavines)", timing: "Morning fasted, before exercise", note: "Adaptogen. Cycle 8 weeks ON / 2 weeks OFF. SHR-5 is the most studied extract." },
    interactions: [],
    effects: [
      { goal: "energy",   efficacy: 4, evidence: 3, studies: 18, type: "RCT",
        summary: "Reduces mental and physical fatigue. Improves cognitive performance under stress. Rapid effects (1-2h after intake).", summary_fr: "Réduit fatigue mentale et physique. Améliore performance cognitive sous stress. Effets rapides (1–2h après prise).", sources: ["PMID:17990195","PMID:20374974"] },
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 14, type: "RCT",
        summary: "Adaptogen: modulates acute and chronic stress response. Reduces cortisol, improves resilience.", summary_fr: "Adaptogène : module réponse au stress aigu et chronique. Réduit cortisol, améliore résilience.", sources: ["PMID:19016404"] },
      { goal: "focus",    efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves attention, processing speed, and working memory under cognitive load.", summary_fr: "Améliore attention, vitesse de traitement et mémoire de travail sous charge cognitive.", sources: ["PMID:18307390"] },
      { goal: "endurance",efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Improves VO2max and time to exhaustion. Blood lactate reduction documented.", summary_fr: "Améliore VO2max et temps jusqu'à épuisement. Réduction lactate sanguin documentée.", sources: ["PMID:19401787"] },
    ],
  },

  {
    id: "berberine",
    name: "Berberine",
    aliases: ["berberine","berberis"],
    tier: 2, safety: 3, legal: "OTC everywhere", cost: "$20-$35/month",
    dosage: { amount: "500mg x2-3/day with meals", timing: "Must be taken with meals", note: "Often called 'natural metformin'. Important drug interactions to check." },
    interactions: ["Metformin (additive effect)","Anticoagulants","Cyclosporine"],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 4, studies: 35, type: "Meta-analyses",
        summary: "Activates AMPK. Reduces blood glucose, HbA1c, LDL. Comparable to metformin in some meta-analyses.", summary_fr: "Active AMPK. Réduit glycémie, HbA1c, LDL. Comparable à metformine dans certaines meta-analysiss.", sources: ["PMID:25498346"] },
      { goal: "cardio",   efficacy: 4, evidence: 4, studies: 28, type: "Meta-analyses",
        summary: "Reduces LDL by 15-25%, triglycerides by 20%. Improves lipid profile.", summary_fr: "Réduit LDL de 15–25%, triglycérides de 20%. Améliore profil lipidique.", sources: ["PMID:24330479"] },
    ],
  },

  {
    id: "collagen",
    name: "Hydrolyzed Collagen",
    aliases: ["collagen peptides","collagène","gélatine"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "10–15 g/jour", timing: "Morning with vitamin C", note: "Type I for skin/hair. Type II for cartilage. Vitamin C essential for synthesis." },
    interactions: [],
    effects: [
      { goal: "skin",     efficacy: 4, evidence: 4, studies: 28, type: "RCT",
        summary: "Improves skin elasticity, reduces wrinkles, hydration. Visible effects within 8-12 weeks.", summary_fr: "Améliore élasticité cutanée, réduit rides, hydratation. Effets visibles en 8–12 semaines.", sources: ["PMID:26840887"] },
      { goal: "recovery", efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Reduces joint pain, improves tendon and ligament recovery.", summary_fr: "Réduit douleurs articulaires, améliore récupération tendons et ligaments.", sources: ["PMID:17076983"] },
    ],
  },

  {
    id: "curcumin",
    name: "Curcumin (Bioavailable)",
    aliases: ["curcuma","turmeric","curcumin","BCM-95"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "500–1000 mg/jour + pipérine", timing: "With a fatty meal + piperine required", note: "Pure curcumin = very low absorption. BCM-95, Theracurmin, or + piperine required." },
    interactions: ["Anticoagulants (high dose)"],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 4, studies: 45, type: "Meta-analyses",
        summary: "Major systemic anti-inflammatory. Inhibits NF-kB and COX-2. Reduces CRP, IL-6, TNF-alpha.", summary_fr: "Anti-inflammatoire systémique majeur. Inhibe NF-κB et COX-2. Réduit CRP, IL-6, TNF-α.", sources: ["PMID:17569207"] },
      { goal: "recovery", efficacy: 3, evidence: 4, studies: 20, type: "RCT",
        summary: "Significantly reduces DOMS. Muscle anti-inflammatory comparable to low-dose ibuprofen.", summary_fr: "Réduit DOMS de manière significative. Anti-inflammatoire musculaire comparable à ibuprofène à faible dose.", sources: ["PMID:26017576"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 12, type: "Meta-analyses",
        summary: "Moderate antidepressant in 3 meta-analyses. Mechanism: BDNF, serotonin, dopamine.", summary_fr: "Antidépresseur modéré dans 3 meta-analysiss. Mécanisme : BDNF, sérotonine, dopamine.", sources: ["PMID:28236605"] },
    ],
  },

  {
    id: "bacopa-monnieri",
    name: "Bacopa Monnieri",
    aliases: ["brahmi","bacopa"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "300–600 mg/jour (extrait 20% bacosides)", timing: "Avec un repas gras. Effets en 8–12 semaines.", note: "Neuroprotectant. Cognitive effects are slow to appear - patience required." },
    interactions: [],
    effects: [
      { goal: "memory",   efficacy: 4, evidence: 4, studies: 20, type: "Meta-analyses",
        summary: "Improves retention memory and recall. Positive Cochrane meta-analysis. One of the best-studied natural nootropics.", summary_fr: "Améliore mémoire de rétention et rappel. Meta-analysis Cochrane positive. Un des nootropiques naturels les mieux étudiés.", sources: ["PMID:12093601","PMID:24252493"] },
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Reduces cortisol, anxiety, and perceived stress. Improves mood under cognitive load.", summary_fr: "Réduit cortisol, anxiété et stress perçu. Améliore humeur sous charge cognitive.", sources: ["PMID:21985022"] },
      { goal: "focus",    efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Improves sustained attention after 8+ weeks.", summary_fr: "Améliore attention soutenue après 8+ semaines.", sources: ["PMID:22318649"] },
    ],
  },

  {
    id: "coq10",
    name: "CoQ10 (Ubiquinol)",
    aliases: ["coenzyme Q10","ubiquinone","ubiquinol"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$25-$50/month",
    dosage: { amount: "100–300 mg/jour (ubiquinol)", timing: "With a fatty meal", note: "Ubiquinol = reduced form, better bioavailability. Essential if taking statins." },
    interactions: ["Statines (épuisent CoQ10  - supplémenter obligatoirement)","Anticoagulants"],
    effects: [
      { goal: "energy",   efficacy: 4, evidence: 4, studies: 30, type: "RCT",
        summary: "Cofactor in the mitochondrial respiratory chain. Improves energy and endurance, especially in 40+ where endogenous CoQ10 declines.", summary_fr: "Cofacteur de la chaîne respiratoire mitochondriale. Améliore énergie et endurance, surtout 40+ ans où CoQ10 endogène décline.", sources: ["PMID:20970427"] },
      { goal: "cardio",   efficacy: 4, evidence: 4, studies: 35, type: "Meta-analyses",
        summary: "Reduces cardiovascular mortality (Q-SYMBIO trial). Improves ejection fraction in heart failure.", summary_fr: "Réduit mortalité cardiovasculaire (essai Q-SYMBIO). Améliore fraction d'éjection dans insuffisance cardiaque.", sources: ["PMID:25282031"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Mitochondrial antioxidant. Reduces systemic oxidative stress.", summary_fr: "Antioxydant mitochondrial. Réduit stress oxydatif systémique.", sources: ["PMID:21426567"] },
    ],
  },

  {
    id: "citrulline",
    name: "L-Citrulline",
    aliases: ["citrulline malate","citrulline"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "6–8 g citrulline malate 2:1", timing: "30–45 min avant l'effort", note: "Citrulline > arginine for nitric oxide conversion." },
    interactions: [],
    effects: [
      { goal: "force",    efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Increases repetitions (+3-5), reduces muscle fatigue via NO and ATP.", summary_fr: "Augmente répétitions (+3–5), réduit fatigue musculaire via NO et ATP.", sources: ["PMID:20386132"] },
      { goal: "recovery", efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Reduces DOMS 24-48h post-exercise. Improves lactate clearance.", summary_fr: "Réduit DOMS 24–48h post-effort. Améliore clearance lactate.", sources: ["PMID:20386132"] },
      { goal: "cardio",   efficacy: 3, evidence: 3, studies: 14, type: "RCT",
        summary: "Increases NO, improves vasodilation and blood pressure.", summary_fr: "Augmente NO, améliore vasodilatation et pression artérielle.", sources: ["PMID:22244575"] },
    ],
  },

  {
    id: "tongkat-ali",
    name: "Tongkat Ali",
    aliases: ["eurycoma longifolia","longjack"],
    tier: 2, safety: 3, legal: "OTC everywhere", cost: "$25-$50/month",
    dosage: { amount: "200–400 mg/jour (extrait 100:1)", timing: "Morning with or without food", note: "LJ100 and Physta are the most studied standardized extracts. Effects in 4-8 weeks." },
    interactions: ["Anticoagulants"],
    effects: [
      { goal: "hormones", efficacy: 4, evidence: 3, studies: 15, type: "RCT",
        summary: "Increases free testosterone by +15-37% via SHBG reduction. Improves libido and male fertility.", summary_fr: "Augmente testostérone libre de +15–37% via réduction SHBG. Améliore libido et fertilité masculine.", sources: ["PMID:23754792","PMID:24386995"] },
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 8, type: "RCT",
        summary: "Reduces cortisol by 16-26%. Improves perceived stress scores.", summary_fr: "Réduit cortisol de 16–26%. Améliore score de stress perçu.", sources: ["PMID:23754792"] },
      { goal: "force",    efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Improves strength and body composition over 8 weeks of training.", summary_fr: "Améliore force et composition corporelle sur 8 semaines d'entraînement.", sources: ["PMID:12801005"] },
    ],
  },

  {
    id: "boron",
    name: "Boron",
    aliases: ["boron","boron citrate"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$5-$12/month",
    dosage: { amount: "6–10 mg/jour", timing: "With meals", note: "Potentiates vitamin D and testosterone. Often overlooked trace mineral." },
    interactions: [],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Increases free testosterone by +29% in 1 week in RCT. Reduces SHBG and potentiates D3.", summary_fr: "Augmente testostérone libre de +29% en 1 semaine dans RCT. Réduit SHBG et potentialise D3.", sources: ["PMID:21129941"] },
      { goal: "longevity",efficacy: 2, evidence: 2, studies: 8, type: "Observational",
        summary: "Inverse correlation with prostate and lung cancers. Reduces inflammation markers.", summary_fr: "Corrélation inverse avec cancers prostate et poumon. Réduit marqueurs inflammation.", sources: ["PMID:15082612"] },
    ],
  },

  {
    id: "probiotics",
    name: "Probiotics",
    aliases: ["probiotics","lactobacillus","bifidobacterium","microbiome"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$15-$40/month",
    dosage: { amount: "10–50 milliards UFC/jour", timing: "Morning fasted or with food", note: "Strain matters. L. rhamnosus GG, L. acidophilus, B. longum are the most studied." },
    interactions: [],
    effects: [
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 25, type: "RCT",
        summary: "Gut-brain axis documented. Reduces anxiety and depression via intestinal serotonin (90% of body serotonin).", summary_fr: "Axe intestin-cerveau documenté. Réduisent anxiété et dépression via sérotonine intestinale (90% de la sérotonine corporelle).", sources: ["PMID:27413138"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Improves intestinal permeability, reduces systemic inflammation (LPS, IL-6).", summary_fr: "Améliore perméabilité intestinale, réduit inflammation systémique (LPS, IL-6).", sources: ["PMID:29581563"] },
      { goal: "skin",     efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Reduction of eczema, acne, and rosacea via the gut-skin axis.", summary_fr: "Réduction eczéma, acné et rosacée via axe intestin-peau.", sources: ["PMID:30200167"] },
    ],
  },

  {
    id: "nac",
    name: "N-Acétylcystéine (NAC)",
    aliases: ["NAC","N-acetylcysteine","acetylcysteine"],
    tier: 2, safety: 4, legal: "OTC (zone grise FDA USA)", cost: "$10-$20/month",
    dosage: { amount: "600–1200 mg/jour", timing: "With meals, avoid immediately post-exercise", note: "Glutathione precursor. NAC+Glycine combo = GlyNAC, synergistic for longevity." },
    interactions: ["Nitroglycerin (hypotension)"],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 4, studies: 30, type: "RCT",
        summary: "Restores cellular glutathione. GlyNAC: reverses 8 aging markers in human RCT (Sekhar 2022).", summary_fr: "Restaure glutathion cellulaire. GlyNAC : réverse 8 marqueurs de vieillissement dans RCT humaine (Sekhar 2022).", sources: ["PMID:34652283"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Effective for bipolar depression, OCD, and addiction in multiple RCTs. Glutamate mechanism.", summary_fr: "Efficace sur dépression bipolaire, TOC et addictions dans plusieurs RCT. Mécanisme glutamate.", sources: ["PMID:22985386"] },
    ],
  },

  {
    id: "beta-alanine",
    name: "Beta-Alanine",
    aliases: ["beta alanine","carnosine precursor"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "3.2–6.4 g/jour (fractionné en doses de 1.6g)", timing: "Split across the day", note: "Picotements cutanés normaux (paresthésies). Saturation carnosine musculaire en 4 semaines." },
    interactions: [],
    effects: [
      { goal: "endurance",efficacy: 4, evidence: 4, studies: 40, type: "Meta-analyses",
        summary: "Increases muscle carnosine (+40-80%). Buffers lactic acid, delays fatigue on 1-4 minute efforts.", summary_fr: "Augmente carnosine musculaire (+40–80%). Tampon acide lactique, retarde fatigue sur efforts 1–4 min.", sources: ["PMID:22080324"] },
      { goal: "force",    efficacy: 2, evidence: 3, studies: 18, type: "RCT",
        summary: "Modest effects on strength. More effective at high repetitions (15+).", summary_fr: "Effets modestes sur force. Plus efficace sur hautes répétitions (15+).", sources: ["PMID:25448499"] },
    ],
  },

  {
    id: "ginseng",
    name: "Panax Ginseng",
    aliases: ["panax ginseng","korean ginseng","ginsenosides","KRG"],
    tier: 2, safety: 3, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "200–400 mg/jour (4–7% ginsénosides)", timing: "Morning, cycle 3 months ON / 1 month OFF", note: "Korean Red Ginseng (KRG) = most studied for libido and cognition. Panax (Korean) is different from Siberian ginseng." },
    interactions: ["Anticoagulants","Antidiabetics","IMAO"],
    effects: [
      { goal: "energy",   efficacy: 3, evidence: 3, studies: 18, type: "RCT",
        summary: "Reduces physical and mental fatigue. Classic adaptogen.", summary_fr: "Réduit fatigue physique et mentale. Adaptogène classique.", sources: ["PMID:23241188"] },
      { goal: "hormones", efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves erectile function and libido in RCTs. Mechanism: NO and ginsenosides.", summary_fr: "Améliore fonction érectile et libido dans RCT. Mécanisme NO et ginsénosides.", sources: ["PMID:18633135"] },
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 15, type: "Meta-analyses",
        summary: "Improves working memory and cognitive processing speed.", summary_fr: "Améliore mémoire de travail et vitesse de traitement cognitif.", sources: ["PMID:20337516"] },
    ],
  },

  {
    id: "maca",
    name: "Maca (Lepidium Meyenii)",
    aliases: ["maca","lepidium meyenii","maca root"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "1.5–3 g/jour (racine séchée)", timing: "With meals", note: "Gelatinized maca = better digestibility. Black for cognition, red for prostate." },
    interactions: [],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 3, studies: 14, type: "RCT",
        summary: "Improves libido without directly modifying testosterone. Effective for SSRI-induced sexual dysfunction.", summary_fr: "Améliore libido sans modifier testostérone directement. Efficace sur dysfonction sexuelle sous ISRS.", sources: ["PMID:16076945","PMID:18697232"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 8, type: "RCT",
        summary: "Reduces anxiety, improves mood and menopausal symptoms.", summary_fr: "Réduit anxiété, améliore humeur et symptômes ménopause.", sources: ["PMID:18784609"] },
    ],
  },

  {
    id: "resveratrol",
    name: "Resveratrol",
    aliases: ["resveratrol","pterostilbene","trans-resveratrol"],
    tier: 3, safety: 4, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "150–500 mg/jour (trans-resvératrol)", timing: "With meals. Avoid immediately before or after exercise.", note: "Pterostilbene = better bioavailability. Synergistic with NMN/NR via SIRT1." },
    interactions: ["Anticoagulants (high dose)"],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 25, type: "RCT + mechanistic",
        summary: "Activates SIRT1 and AMPK. Mimics caloric restriction. Solid longevity effects in animals.", summary_fr: "Active SIRT1 et AMPK. Mime restriction calorique. Effets sur longévité animaux solides.", sources: ["PMID:17086191"] },
      { goal: "cardio",   efficacy: 3, evidence: 3, studies: 18, type: "RCT",
        summary: "Improves vascular endothelium, reduces platelet aggregation and oxidized LDL.", summary_fr: "Améliore endothélium vasculaire, réduit agrégation plaquettaire et LDL oxydé.", sources: ["PMID:22786773"] },
    ],
  },

  // ── TIER 3 ADDITIONS ──────────────────────────────────────────────────────

  {
    id: "huperzine-a",
    name: "Huperzine A",
    aliases: ["huperzine","huperzia serrata"],
    tier: 3, safety: 3, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "100–200 µg/jour", timing: "Matin, cycles 2 semaines ON / 2 semaines OFF", note: "Acetylcholinesterase inhibitor. Accumulation requires cycling. Interacts with Alzheimer medications." },
    interactions: ["Médicaments Alzheimer (rivastigmine, donepezil  - accumulation dangereuse)"],
    effects: [
      { goal: "memory",   efficacy: 4, evidence: 3, studies: 14, type: "RCT",
        summary: "Inhibits acetylcholinesterase -> increases acetylcholine. Improves memory and learning. Positive RCTs in Alzheimer patients and students.", summary_fr: "Inhibe acétylcholinestérase → augmente acétylcholine. Améliore mémoire et apprentissage. RCT positives Alzheimer et étudiants.", sources: ["PMID:9527169","PMID:24788139"] },
      { goal: "focus",    efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Improves sustained attention and working memory. Notable acute effect within 1-2 hours.", summary_fr: "Améliore attention soutenue et mémoire de travail. Effet aigu notable en 1–2 heures.", sources: ["PMID:20141069"] },
    ],
  },

  {
    id: "sulforaphane",
    name: "Sulforaphane",
    aliases: ["broccoli extract","NRF2","brocoli","glucoraphanin"],
    tier: 3, safety: 4, legal: "OTC everywhere", cost: "$30-$60/month",
    dosage: { amount: "10–40 mg/jour (extrait graines de brocoli)", timing: "With meals", note: "Broccoli sprouts = 50-100x more concentrated than mature broccoli. Myrosinase required for activation." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 3, studies: 20, type: "RCT + mechanistic",
        summary: "Activates Nrf2 -> upregulation of 200+ antioxidant genes. Potential anti-cancer properties. Autophagy activated.", summary_fr: "Active Nrf2 → upregulation de 200+ gènes antioxydants. Anti-cancer potentiel. Autophagie activée.", sources: ["PMID:22439618"] },
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 7, type: "RCT",
        summary: "Improves autism symptoms in RCT. Neuroprotection via reduction of brain inflammation.", summary_fr: "Améliore symptômes autisme dans RCT. Neuroprotection via réduction inflammation cérébrale.", sources: ["PMID:25313065"] },
    ],
  },

  {
    id: "apigenin",
    name: "Apigenin",
    aliases: ["apigenin","apigenine","chamomile"],
    tier: 3, safety: 4, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "50–120 mg/jour", timing: "Evening with food", note: "CD38 inhibitor (enzyme that degrades NAD+). Often taken with NMN to potentiate effect." },
    interactions: [],
    effects: [
      { goal: "sleep",    efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Mild anxiolytic via GABA-A receptors. Improves sleep quality. Popularized by Dr. Huberman.", summary_fr: "Anxiolytique léger via récepteurs GABA-A. Améliore qualité du sommeil. Popularisé par Dr. Huberman.", sources: ["PMID:21061398"] },
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 8, type: "Mechanistic + RCT",
        summary: "Inhibits CD38, preserves cellular NAD+. Anti-inflammatory. Synergistic with NMN/NR.", summary_fr: "Inhibe CD38, préserve NAD+ cellulaire. Anti-inflammatoire. Synergique avec NMN/NR.", sources: ["PMID:23372077"] },
    ],
  },

  {
    id: "alpha-gpc",
    name: "Alpha-GPC",
    aliases: ["alpha GPC","choline alphoscerate","glycerophosphocholine"],
    tier: 3, safety: 4, legal: "OTC everywhere", cost: "$25-$50/month",
    dosage: { amount: "300–600 mg/jour", timing: "Morning or before cognitive/physical effort", note: "Most bioavailable choline source. Crosses the BBB. Acetylcholine precursor." },
    interactions: [],
    effects: [
      { goal: "focus",    efficacy: 4, evidence: 3, studies: 15, type: "RCT",
        summary: "Rapidly increases brain acetylcholine. Improves focus, attention, and information processing. Frequently used in nootropic stacks.", summary_fr: "Augmente acétylcholine cérébrale rapidement. Améliore focus, attention et traitement information. Souvent utilisé en stack nootropique.", sources: ["PMID:22017963"] },
      { goal: "memory",   efficacy: 4, evidence: 3, studies: 14, type: "RCT",
        summary: "Improves episodic memory and learning. Positive RCTs in early Alzheimer's.", summary_fr: "Améliore mémoire épisodique et apprentissage. RCT positives Alzheimer précoce.", sources: ["PMID:15080227"] },
      { goal: "force",    efficacy: 3, evidence: 2, studies: 7, type: "RCT",
        summary: "Increases acute GH post-exercise, improves peak power in athletes.", summary_fr: "Augmente GH aigu post-effort, améliore puissance maximale chez sportifs.", sources: ["PMID:18456578"] },
    ],
  },

  // ── TIER 4 ADDITIONS ──────────────────────────────────────────────────────

  {
    id: "fadogia-agrestis",
    name: "Fadogia Agrestis",
    aliases: ["fadogia"],
    tier: 4, safety: 2, legal: "OTC (legality varies by country)", cost: "$30-$60/month",
    dosage: { amount: "400–600 mg/jour", timing: "Morning with food", note: "⚠️ Potential testicular toxicity at high dose in rodents. Short cycles of 8 weeks max. Often stacked with Tongkat Ali." },
    interactions: [],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 1, studies: 2, type: "Animal studies + anecdotal",
        summary: "Stimulates LH -> testicular testosterone production in animal studies. Almost no human data. Very popular in biohacking community.", summary_fr: "Stimule LH → production testostérone testiculaire dans études animales. Données humaines quasi-inexistantes. Très populaire dans la communauté biohacking.", sources: ["PMID:15771310"] },
    ],
  },

  {
    id: "bpc-157",
    name: "BPC-157",
    aliases: ["body protection compound","BPC157"],
    tier: 4, safety: 2, legal: "Non approuvé humain  - recherche uniquement", cost: "$50-$150/month",
    dosage: { amount: "250-500mcg/day (injectable) or 500-1000mcg/day (oral)", timing: "Morning fasted", note: "⚠️ Research peptide. Not approved for human use by FDA or EMA. Long-term safety profile unknown." },
    interactions: [],
    effects: [
      { goal: "recovery", efficacy: 4, evidence: 2, studies: 4, type: "Animal studies + anecdotal",
        summary: "Accelerates healing of tendons, ligaments, muscles, and intestines in animal studies. Very positive human anecdotes. Human RCTs are absent.", summary_fr: "Accélère guérison tendons, ligaments, muscles et intestins dans études animales. Anecdotes humaines très positives. RCT humaines absentes.", sources: ["PMID:10225288"] },
    ],
  },

  {
    id: "cerebrolysin",
    name: "Cerebrolysin",
    aliases: ["cerebrolysin"],
    tier: 4, safety: 2, legal: "Prescription Europe de l'Est  - zone grise France", cost: "$80-$300/month",
    dosage: { amount: "5–30 mL/jour (IV ou IM)", timing: "Cures de 10–20 jours", note: "⚠️ Mélange de peptides neurotrophiques. Usage médical en Russie/Chine. Difficile à obtenir légalement en France. Très populaire en biohacking avancé." },
    interactions: ["IMAO","Antidépresseurs (interactions potentielles)"],
    effects: [
      { goal: "memory",   efficacy: 4, evidence: 3, studies: 18, type: "RCT (clinical populations)",
        summary: "Exogenous NGF, BDNF, and CNTF. Cognitive improvement documented in Alzheimer's and post-stroke. Limited data in healthy adults but remarkable biohacking anecdotes.", summary_fr: "NGF, BDNF et CNTF exogènes. Amélioration cognitive documentée dans Alzheimer et post-AVC. Données chez adultes sains limitées mais anecdotes biohacking remarquables.", sources: ["PMID:24954684","PMID:26504987"] },
      { goal: "focus",    efficacy: 3, evidence: 2, studies: 6, type: "RCT + anecdotal",
        summary: "Reported improvements in processing speed, focus, and mental clarity.", summary_fr: "Amélioration vitesse de traitement, focus et clarté mentale rapportées.", sources: ["PMID:19861264"] },
      { goal: "mood",     efficacy: 3, evidence: 2, studies: 5, type: "Clinical RCT",
        summary: "Antidepressant effects in some trials. Neurotrophins modulate dopamine and serotonin.", summary_fr: "Effets antidépresseurs dans certains essais. Neurotrophines modulent dopamine et sérotonine.", sources: ["PMID:20586708"] },
    ],
  },

  {
    id: "semax",
    name: "Semax",
    aliases: ["semax","ACTH(4-7)"],
    tier: 4, safety: 2, legal: "Approuvé Russie/Ukraine  - non autorisé France/EU/USA", cost: "$40-$100/month",
    dosage: { amount: "200–600 µg/jour (spray nasal)", timing: "Morning, fast-acting", note: "⚠️ Peptide synthétique. Approuvé médicalement en Russie. Non disponible légalement en France. Importation zone grise." },
    interactions: [],
    effects: [
      { goal: "focus",    efficacy: 4, evidence: 2, studies: 5, type: "RCT + anecdotal",
        summary: "Rapidly increases BDNF. Improves attention, focus, and processing speed. Very popular in the nootropic community.", summary_fr: "Augmente BDNF rapidement. Améliore attention, focus et vitesse de traitement. Très populaire en communauté nootropique.", sources: ["PMID:23831139"] },
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 4, type: "Clinical RCT",
        summary: "Memory improvement in Russian clinical trials.", summary_fr: "Amélioration mémoire dans essais cliniques russes.", sources: ["PMID:8930164"] },
    ],
  },

  {
    id: "methylene-blue",
    name: "Methylene Blue",
    aliases: ["methylene blue","MB","methylthioninium"],
    tier: 4, safety: 2, legal: "Usage médical réglementé  - OTC ultra-faible dose", cost: "$15-$40/month",
    dosage: { amount: "0.5–2 mg/kg/jour (ultra-faible dose)", timing: "Morning, avoid evening (stimulant)", note: "⚠️ Colore urines bleu/vert. Interactions IMAO GRAVES. Effets nootropiques aux ultra-faibles doses seulement." },
    interactions: ["IMAO (syndrome sérotoninergique GRAVE)","SSRIs (serotonergic interaction)"],
    effects: [
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Improves episodic memory and consolidation. Cofactor in the mitochondrial respiratory chain.", summary_fr: "Améliore mémoire épisodique et consolidation. Cofacteur chaîne respiratoire mitochondriale.", sources: ["PMID:18606648"] },
      { goal: "energy",   efficacy: 3, evidence: 2, studies: 4, type: "RCT",
        summary: "Improves mitochondrial efficiency as an electron bypass. Reduces brain fatigue.", summary_fr: "Améliore efficience mitochondriale comme court-circuit électronique. Réduction fatigue cérébrale.", sources: ["PMID:21443475"] },
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 5, type: "Mécanistique",
        summary: "Reduces cellular senescence in vitro. Mitochondrial anti-aging effects documented in basic research.", summary_fr: "Réduit sénescence cellulaire in vitro. Effets anti-âge mitochondriaux documentés en recherche fondamentale.", sources: ["PMID:28504957"] },
    ],
  },

  {
    id: "whey-protein",
    name: "Whey Protein",
    aliases: ["whey","protein","protein powder","isolate","concentrate"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "20-40g per serving", timing: "Post-workout or between meals", note: "Isolate is better for lactose intolerance. Concentrate is cheaper with similar anabolic effects at adequate total intake." },
    interactions: [],
    effects: [
      { goal: "force",    efficacy: 4, evidence: 5, studies: 200, type: "Meta-analyses",
        summary: "Highest bioavailability protein source. Leucine content triggers mTOR activation. Consistently improves strength and lean mass when combined with resistance training.", sources: ["PMID:22958314","PMID:28698222"] },
      { goal: "recovery", efficacy: 4, evidence: 5, studies: 150, type: "Meta-analyses",
        summary: "Reduces muscle damage markers post-exercise. Accelerates protein synthesis for up to 48 hours after training. Outperforms casein for acute post-workout response.", sources: ["PMID:25169440"] },
    ],
  },

  {
    id: "bcaa",
    name: "BCAA",
    aliases: ["branched chain amino acids","leucine","isoleucine","valine","branch chain"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "5-10g around training", timing: "Before or during training", note: "With adequate total protein intake (1.6g/kg/day), BCAAs add marginal benefit. More useful for fasted training." },
    interactions: [],
    effects: [
      { goal: "recovery", efficacy: 3, evidence: 4, studies: 40, type: "RCT",
        summary: "Reduces DOMS when taken around training. Leucine activates muscle protein synthesis via mTOR. Effect size is modest with adequate total protein intake.", sources: ["PMID:28638350"] },
      { goal: "force",    efficacy: 2, evidence: 3, studies: 20, type: "RCT",
        summary: "Modest benefit on strength when protein intake is suboptimal. Whole protein sources outperform isolated BCAAs in most direct comparisons.", sources: ["PMID:26733764"] },
      { goal: "energy",   efficacy: 2, evidence: 3, studies: 15, type: "RCT",
        summary: "Reduces perceived fatigue during prolonged exercise via competition with tryptophan for brain entry, reducing serotonin production.", sources: ["PMID:9124069"] },
    ],
  },

  {
    id: "cbd",
    name: "CBD (Cannabidiol)",
    aliases: ["cannabidiol","hemp extract","CBD oil","cannabinoids"],
    tier: 2, safety: 4, legal: "Legal under 0.3% THC in most EU countries and USA. Verify local laws.", cost: "$30-$80/month",
    dosage: { amount: "15-75mg/day", timing: "Consistent daily use. Evening for sleep.", note: "Sublingual oil has better bioavailability than capsules. Fat-soluble, take with food." },
    interactions: ["Blood thinners (warfarin, aspirin)", "Immunosuppressants", "CYP450 substrates (many common medications)"],
    effects: [
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Reduces anxiety in social anxiety disorder and generalized anxiety in RCTs. Modulates serotonin receptors and endocannabinoid system.", sources: ["PMID:31866067","PMID:32883291"] },
      { goal: "sleep",    efficacy: 3, evidence: 3, studies: 14, type: "RCT",
        summary: "Improves sleep quality and reduces REM sleep disturbances. Most effective for anxiety-driven sleep issues. Mixed results in general population.", sources: ["PMID:31447137"] },
      { goal: "recovery", efficacy: 3, evidence: 2, studies: 8, type: "RCT",
        summary: "Anti-inflammatory properties reduce exercise-induced inflammation markers. Limited RCT data in athletic populations specifically.", sources: ["PMID:32641910"] },
    ],
  },

  {
    id: "dhea",
    name: "DHEA",
    aliases: ["dehydroepiandrosterone","prasterone"],
    tier: 3, safety: 2, legal: "OTC in USA. Prescription required in most EU countries. Banned in competitive sport.", cost: "$15-$30/month",
    dosage: { amount: "25-50mg/day", timing: "Morning with food", note: "Precursor to both testosterone and estrogen. Blood testing before and during use is strongly recommended. Effect depends on baseline hormone levels." },
    interactions: ["Testosterone or estrogen therapies", "Insulin (may affect sensitivity)", "Anticoagulants"],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 3, studies: 25, type: "RCT",
        summary: "Increases testosterone and estrogen precursors, especially in adults over 40 where DHEA naturally declines. Minimal effects in young men with normal DHEA levels.", sources: ["PMID:10484090","PMID:15136575"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves mood and well-being particularly in older adults with low baseline DHEA. Modest antidepressant effect in deficient patients.", sources: ["PMID:10484090"] },
      { goal: "longevity",efficacy: 2, evidence: 2, studies: 10, type: "Observational",
        summary: "Low DHEA levels correlate with cardiovascular disease and all-cause mortality in epidemiological studies. Causality not established by intervention trials.", sources: ["PMID:17151862"] },
    ],
  },

  {
    id: "l-carnitine",
    name: "L-Carnitine",
    aliases: ["carnitine","acetyl-l-carnitine","ALCAR","carnitine tartrate"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "1-3g/day", timing: "With a meal containing carbohydrates for better uptake. ALCAR form for cognitive effects.", note: "ALCAR crosses the blood-brain barrier, L-carnitine L-tartrate preferred for muscle recovery. Requires weeks of consistent use." },
    interactions: ["Thyroid hormones (may interact)"],
    effects: [
      { goal: "energy",   efficacy: 3, evidence: 3, studies: 30, type: "RCT",
        summary: "Transports fatty acids into mitochondria for oxidation. Reduces fatigue in clinical populations. Effects are modest in already-healthy athletes.", sources: ["PMID:14672862"] },
      { goal: "recovery", efficacy: 3, evidence: 3, studies: 18, type: "RCT",
        summary: "Reduces muscle soreness and tissue damage markers after resistance exercise. Consistent results across multiple RCTs.", sources: ["PMID:12537331"] },
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "ALCAR form improves memory and cognitive performance in older adults and patients with mild cognitive impairment.", sources: ["PMID:14621119"] },
    ],
  },

  {
    id: "l-tyrosine",
    name: "L-Tyrosine",
    aliases: ["tyrosine","L tyrosine","N-acetyl tyrosine","NALT"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "500-2000mg", timing: "45-60 minutes before cognitive demand or stressful situations, on an empty stomach", note: "Most effective under acute stress or sleep deprivation. Replenishes depleted catecholamines. Free-form tyrosine has better bioavailability than NALT." },
    interactions: ["MAOIs (dangerous interaction)", "Thyroid medications", "Levodopa"],
    effects: [
      { goal: "focus",    efficacy: 4, evidence: 4, studies: 20, type: "RCT",
        summary: "Replenishes catecholamines (dopamine, norepinephrine) depleted by acute stress or sleep deprivation. Improves working memory and cognitive flexibility under stress. Limited effect when rested.", sources: ["PMID:18996186","PMID:25797188"] },
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Reduces cognitive performance degradation under cold stress, sleep deprivation, and multitasking scenarios.", sources: ["PMID:7794222"] },
    ],
  },

  {
    id: "nattokinase",
    name: "Nattokinase",
    aliases: ["nattokinase","natto","NSK-SD"],
    tier: 2, safety: 3, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "100-200mg (2000-4000 FU/day)", timing: "With water between meals", note: "Stop 2 weeks before surgery. NSK-SD form has had vitamin K2 removed. Do not combine with blood thinners without medical supervision." },
    interactions: ["Blood thinners (warfarin, aspirin, heparin)", "NSAIDs", "Surgery risk within 2 weeks"],
    effects: [
      { goal: "cardio",   efficacy: 4, evidence: 4, studies: 20, type: "RCT",
        summary: "Fibrinolytic enzyme that breaks down blood clots directly. Reduces systolic blood pressure by 5-8mmHg. Reduces fibrinogen, factor VIII, and atherosclerotic plaque in controlled trials.", sources: ["PMID:19101599","PMID:30857562"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Reduces arterial plaque accumulation over 26 weeks in RCT. Anti-thrombotic and anti-atherosclerotic properties well documented.", sources: ["PMID:19101599"] },
    ],
  },

  {
    id: "tb-500",
    name: "TB-500 (Thymosin Beta-4)",
    aliases: ["TB500","thymosin beta-4","thymosin b4"],
    tier: 4, safety: 2, legal: "Research use only. Not approved for human use by FDA or EMA.", cost: "$80-$200/month",
    dosage: { amount: "2-2.5mg twice weekly loading, then 2mg monthly maintenance", timing: "Subcutaneous injection", note: "Research compound only. No validated human dosing protocol. Used off-label in performance and injury recovery contexts." },
    interactions: [],
    effects: [
      { goal: "recovery", efficacy: 4, evidence: 1, studies: 3, type: "Animal studies",
        summary: "Promotes actin polymerization, cell migration, and tissue repair in animal models. Angiogenesis and wound healing acceleration well documented preclinically. Human RCT data is absent.", sources: ["PMID:20393315"] },
    ],
  },

  {
    id: "ipamorelin",
    name: "Ipamorelin",
    aliases: ["ipamorelin","ipamorelin acetate","GHRP"],
    tier: 4, safety: 2, legal: "Research compound. Not approved for human use.", cost: "$60-$150/month",
    dosage: { amount: "200-300mcg 1-3x daily subcutaneous", timing: "Fasted, ideally before sleep for GH pulse", note: "GHRP that selectively stimulates GH with minimal cortisol and prolactin elevation. Often combined with CJC-1295 for synergistic effect." },
    interactions: ["Insulin (GH affects insulin sensitivity)"],
    effects: [
      { goal: "recovery", efficacy: 3, evidence: 1, studies: 2, type: "Preclinical plus anecdotal",
        summary: "Stimulates pulsatile GH release, which promotes tissue repair and IGF-1 production downstream. No peer-reviewed human RCTs for this indication exist.", sources: ["PMID:9849822"] },
      { goal: "longevity",efficacy: 2, evidence: 1, studies: 2, type: "Preclinical",
        summary: "GH secretion declines with age. Restoring youthful GH pulses theoretically supports lean mass, bone density, and metabolic health.", sources: [] },
    ],
  },

  {
    id: "cjc-1295",
    name: "CJC-1295",
    aliases: ["CJC1295","CJC 1295 DAC","modified GRF","mod GRF"],
    tier: 4, safety: 2, legal: "Research compound. Not approved for human use.", cost: "$60-$150/month",
    dosage: { amount: "1-2mg weekly (DAC form) or 100mcg daily (no DAC)", timing: "Subcutaneous injection", note: "DAC form has 8-day half-life. Typically stacked with Ipamorelin for synergistic GH release. Research use only." },
    interactions: ["Insulin", "Glucocorticoids (reduce GH response)"],
    effects: [
      { goal: "recovery", efficacy: 3, evidence: 1, studies: 2, type: "Phase I/II trials",
        summary: "Phase I trial showed 2-10x GH elevation sustained over weeks. Promotes muscle protein synthesis and fat oxidation via elevated IGF-1.", sources: ["PMID:16822960"] },
      { goal: "force",    efficacy: 2, evidence: 1, studies: 1, type: "Anecdotal",
        summary: "Elevated IGF-1 from CJC-1295 theoretically promotes hypertrophy. No peer-reviewed strength trial data in healthy humans.", sources: [] },
    ],
  },

  {
    id: "ghk-cu",
    name: "GHK-Cu (Copper Peptide)",
    aliases: ["GHK-Cu","copper tripeptide","GHK copper","copper peptide"],
    tier: 3, safety: 3, legal: "OTC as cosmetic ingredient. Injected form is a research compound.", cost: "$30-$80/month",
    dosage: { amount: "Topical: 2-5% concentration. Injectable: 1-2mg/day", timing: "Topical: AM and PM. Injectable: daily subcutaneous.", note: "Best evidence is for topical use. Injectable use is off-label with limited human safety data." },
    interactions: [],
    effects: [
      { goal: "skin",     efficacy: 4, evidence: 3, studies: 15, type: "RCT (topical)",
        summary: "Stimulates collagen and elastin synthesis, accelerates wound healing, reduces wrinkle depth measurably. Multiple RCTs confirm topical efficacy. One of the most researched cosmetic peptides.", sources: ["PMID:16117772","PMID:25484983"] },
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 8, type: "In vitro + preliminary",
        summary: "Resets gene expression toward a younger phenotype in fibroblast studies. Activates 31 genes associated with tissue remodeling.", sources: ["PMID:18399481"] },
    ],
  },

  {
    id: "epitalon",
    name: "Epithalon",
    aliases: ["epitalon","epithalamin","epithalamine","tetrapeptide","Ala-Glu-Asp-Gly"],
    tier: 4, safety: 2, legal: "Research compound. Not approved for human use.", cost: "$50-$120/month",
    dosage: { amount: "5-10mg/day for 10-20 day cycles, 1-2x per year", timing: "Subcutaneous or IV injection", note: "Synthetic tetrapeptide derived from bovine pineal gland extract. Long-term human safety not established." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 8, type: "Animal studies plus small Russian clinical trials",
        summary: "Activates telomerase, extending telomere length in human cell cultures. Russian 15-year trials showed reduced mortality and cancer incidence in elderly patients.", sources: ["PMID:12937682","PMID:11333684"] },
      { goal: "sleep",    efficacy: 2, evidence: 2, studies: 4, type: "Small RCT",
        summary: "Normalizes melatonin secretion via pineal gland stimulation. Improves sleep quality in elderly patients.", sources: ["PMID:12404035"] },
    ],
  },

  {
    id: "selank",
    name: "Selank",
    aliases: ["selank","tuftsin analogue","anxiolytic peptide"],
    tier: 4, safety: 3, legal: "Approved drug in Russia and Ukraine for anxiety. Not approved in EU or USA.", cost: "$30-$80/month",
    dosage: { amount: "250-3000mcg/day nasal spray", timing: "Morning, split into 2 doses", note: "Synthetic analogue of the immune peptide tuftsin. Acts as anxiolytic with nootropic properties. Approved prescription drug in Russia." },
    interactions: [],
    effects: [
      { goal: "stress",   efficacy: 4, evidence: 2, studies: 8, type: "Russian RCT",
        summary: "Reduces anxiety comparably to benzodiazepines in Russian clinical trials without sedation or dependency. Modulates GABA, serotonin, and enkephalin systems.", sources: ["PMID:17073149"] },
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 5, type: "RCT",
        summary: "Increases BDNF, improves memory consolidation and cognitive performance under stress.", sources: [] },
      { goal: "mood",     efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Reduces depressive symptoms and emotional instability without classical antidepressant side effects.", sources: ["PMID:17073149"] },
    ],
  },

  {
    id: "pt-141",
    name: "PT-141 (Bremelanotide)",
    aliases: ["PT141","bremelanotide","Vyleesi","melanocortin agonist"],
    tier: 4, safety: 2, legal: "FDA-approved drug (Vyleesi) for female sexual dysfunction. Off-label male use.", cost: "$60-$150/month",
    dosage: { amount: "1-2mg subcutaneous injection 45 minutes before activity", timing: "As needed only, not for daily use", note: "Nausea and blood pressure drop are common side effects. Approved drug with established safety data for on-label use in women." },
    interactions: ["Antihypertensives (additive blood pressure drop risk)"],
    effects: [
      { goal: "hormones", efficacy: 4, evidence: 3, studies: 10, type: "RCT",
        summary: "Activates MC3 and MC4 receptors in the hypothalamus, stimulating sexual arousal via central nervous system pathway completely independent of testosterone. FDA-approved evidence base.", sources: ["PMID:15296662","PMID:25376222"] },
    ],
  },

  {
    id: "melanotan-2",
    name: "Melanotan II",
    aliases: ["melanotan","MT-2","MT2","tanning peptide"],
    tier: 4, safety: 1, legal: "Not approved anywhere. Illegal to sell as human-use product in EU, USA, and most countries.", cost: "$30-$80/month",
    dosage: { amount: "0.25-0.5mg subcutaneous starting dose", timing: "Evening to manage nausea", note: "HIGH RISK. Associated with melanoma activation, hypertension, nausea, and priapism. Listed here for harm-reduction purposes only. Not recommended." },
    interactions: ["Do not combine with other melanocortin agonists", "Antihypertensives"],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 1, studies: 3, type: "Phase I/II trials",
        summary: "Potent melanocortin agonist producing tanning, appetite suppression, and sexual arousal. Phase II trial halted due to safety concerns including risk of activating dormant melanoma.", sources: ["PMID:11600843"] },
    ],
  },

  {
    id: "ss-31",
    name: "SS-31 (Elamipretide)",
    aliases: ["SS-31","elamipretide","MTP-131","Bendavia"],
    tier: 4, safety: 2, legal: "Phase III clinical trials ongoing. Research compound.", cost: "$100-$300/month",
    dosage: { amount: "0.05-0.25mg/kg subcutaneous daily injection", timing: "Daily", note: "Cardiolipin-targeting mitochondria-protective peptide. Phase III trial ongoing in heart failure. No consumer dosing protocol exists." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 2, studies: 8, type: "Phase I/II clinical trials",
        summary: "Directly targets cardiolipin on the mitochondrial inner membrane, restoring cristae morphology and ATP production. Phase II trial showed 60% improvement in exercise capacity in heart failure.", sources: ["PMID:26204592","PMID:31526561"] },
      { goal: "energy",   efficacy: 4, evidence: 2, studies: 5, type: "Phase I/II clinical trials",
        summary: "Reversed 37-year age-related decline in mitochondrial energetics in a small RCT in sedentary older adults.", sources: ["PMID:31526561"] },
    ],
  },

// ADDITIONS  - 150+ new compounds to append to data.js
// Paste this content between the last entry and the final ];

  // ── NOOTROPICS / RACETAMS ─────────────────────────────────────────────────

  {
    id: "noopept",
    name: "Noopept",
    aliases: ["noopept","N-phenylacetyl-L-prolylglycine ethyl ester","GVS-111"],
    tier: 3, safety: 3, legal: "OTC in most countries. Prescription in Russia.", cost: "$10-$25/month",
    dosage: { amount: "10-30mg/day", timing: "Morning, split into 2 doses. Cycle 1.5 months ON, 1 month OFF.", note: "Roughly 1000x more potent than piracetam by weight. Effects appear quickly. One of the most popular synthetic nootropics." },
    interactions: ["Stimulants (may increase anxiety)"],
    effects: [
      { goal: "memory",   efficacy: 4, evidence: 2, studies: 6, type: "RCT (Russian literature)",
        summary: "Increases NGF and BDNF. Improves memory consolidation and learning speed. Russian clinical data positive. Limited English-language peer-reviewed trials.", sources: ["PMID:11830980"] },
      { goal: "focus",    efficacy: 3, evidence: 2, studies: 4, type: "RCT + anecdotal",
        summary: "Improves attention, mental clarity, and information processing speed. Widely reported in biohacking community.", sources: [] },
    ],
  },

  {
    id: "piracetam",
    name: "Piracetam",
    aliases: ["piracetam","nootropyl","2-oxo-1-pyrrolidine"],
    tier: 3, safety: 4, legal: "Prescription in UK and some EU countries. OTC in USA.", cost: "$15-$30/month",
    dosage: { amount: "1.6-4.8g/day split into 3 doses", timing: "With meals", note: "The original nootropic. Requires choline supplementation alongside to prevent headaches. Effects subtle and build over weeks." },
    interactions: ["Anticoagulants (may increase bleeding risk)"],
    effects: [
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 25, type: "RCT",
        summary: "Improves memory in elderly patients and those with cognitive decline. Effects modest in healthy young adults. First nootropic ever synthesized.", sources: ["PMID:6362977","PMID:2905104"] },
      { goal: "focus",    efficacy: 2, evidence: 3, studies: 15, type: "RCT",
        summary: "Modest improvement in attention and cognitive processing under stress or fatigue.", sources: ["PMID:6362977"] },
    ],
  },

  {
    id: "aniracetam",
    name: "Aniracetam",
    aliases: ["aniracetam","memodrin","draganon"],
    tier: 3, safety: 4, legal: "Prescription in EU. OTC in USA.", cost: "$20-$40/month",
    dosage: { amount: "750-1500mg/day in 2 doses", timing: "With fatty meals (fat-soluble)", note: "Anxiolytic properties on top of cognitive effects. Fat-soluble - must be taken with food." },
    interactions: [],
    effects: [
      { goal: "mood",     efficacy: 3, evidence: 2, studies: 8, type: "RCT",
        summary: "Anxiolytic effects documented in multiple animal and some human studies. Modulates AMPA receptors and serotonin.", sources: ["PMID:7862493"] },
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 7, type: "RCT",
        summary: "Improves memory and creativity. AMPA modulator enhancing glutamatergic transmission.", sources: ["PMID:7862493"] },
    ],
  },

  {
    id: "phenylpiracetam",
    name: "Phenylpiracetam",
    aliases: ["phenylpiracetam","carphedon","fonturacetam"],
    tier: 3, safety: 3, legal: "OTC in most countries. Banned in competitive sport (WADA).", cost: "$20-$40/month",
    dosage: { amount: "100-200mg as needed (not daily)", timing: "Morning or before cognitive/physical effort", note: "Tolerance builds rapidly. Use maximum 2-3x per week. One of the strongest racetams. Stimulating effect." },
    interactions: ["Stimulants (additive)"],
    effects: [
      { goal: "focus",    efficacy: 4, evidence: 2, studies: 5, type: "RCT + anecdotal",
        summary: "Strong acute stimulant and cognitive enhancement. Improves psychomotor speed, motivation, and cold tolerance. Banned by WADA for performance enhancement.", sources: ["PMID:20091702"] },
      { goal: "energy",   efficacy: 4, evidence: 2, studies: 4, type: "RCT",
        summary: "Significant anti-fatigue properties. Used by Russian cosmonauts and athletes. Increases locomotor activity.", sources: ["PMID:20091702"] },
    ],
  },

  {
    id: "pramiracetam",
    name: "Pramiracetam",
    aliases: ["pramiracetam","remen","pramistar"],
    tier: 3, safety: 4, legal: "Prescription in EU. OTC in USA.", cost: "$30-$60/month",
    dosage: { amount: "400-1200mg/day in 2-3 doses", timing: "With fatty meals", note: "Fat-soluble racetam. More potent than piracetam. Strong focus effects with less mood impact than aniracetam." },
    interactions: [],
    effects: [
      { goal: "memory",   efficacy: 4, evidence: 2, studies: 6, type: "RCT",
        summary: "Strong improvement in long-term memory formation and retrieval. RCT data in amnesiac patients highly positive. Best racetam for pure memory.", sources: ["PMID:1600959"] },
      { goal: "focus",    efficacy: 3, evidence: 2, studies: 4, type: "RCT",
        summary: "Improves concentration without significant mood or anxiety effects. Cleaner focus profile than other racetams.", sources: [] },
    ],
  },

  {
    id: "oxiracetam",
    name: "Oxiracetam",
    aliases: ["oxiracetam","ISF-2522"],
    tier: 3, safety: 4, legal: "OTC in most countries.", cost: "$20-$40/month",
    dosage: { amount: "1200-2400mg/day in 2-3 doses", timing: "Morning and afternoon", note: "Mildly stimulating. Best racetam for logical and analytical thinking. Water-soluble." },
    interactions: [],
    effects: [
      { goal: "focus",    efficacy: 3, evidence: 2, studies: 5, type: "RCT",
        summary: "Improves logical and spatial reasoning. Mild stimulant effects. Enhances acetylcholine and glutamate signaling.", sources: ["PMID:1727677"] },
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 5, type: "RCT",
        summary: "Protects against scopolamine-induced memory impairment. Improves spatial memory in animal studies.", sources: [] },
    ],
  },

  {
    id: "coluracetam",
    name: "Coluracetam",
    aliases: ["coluracetam","MKC-231","BCI-540"],
    tier: 3, safety: 3, legal: "OTC in most countries. Research compound.", cost: "$30-$80/month",
    dosage: { amount: "20-80mg/day", timing: "Morning, with or without food", note: "High-affinity choline uptake (HACU) enhancer. Interesting antidepressant potential. Limited human data." },
    interactions: [],
    effects: [
      { goal: "mood",     efficacy: 3, evidence: 1, studies: 2, type: "Preclinical + anecdotal",
        summary: "Phase 2a trial showed antidepressant effects with major depressive disorder. Unique HACU mechanism.", sources: ["PMID:20352271"] },
      { goal: "memory",   efficacy: 2, evidence: 1, studies: 2, type: "Animal studies",
        summary: "Restores choline uptake in nerve growth factor-deprived neurons. Memory improvement in animal models.", sources: [] },
    ],
  },

  {
    id: "fasoracetam",
    name: "Fasoracetam",
    aliases: ["fasoracetam","NS-105","LAM-105"],
    tier: 3, safety: 3, legal: "Research compound. OTC in some countries.", cost: "$40-$100/month",
    dosage: { amount: "100-1000mg/day", timing: "Split doses throughout the day", note: "Under investigation for ADHD. Upregulates GABA-B receptors. May reduce glutamate excitotoxicity." },
    interactions: [],
    effects: [
      { goal: "focus",    efficacy: 3, evidence: 1, studies: 2, type: "Phase 2 trial",
        summary: "Phase 2 trial in adolescent ADHD showed significant improvement. Modulates mGluR and GABA-B receptors.", sources: ["PMID:27769154"] },
      { goal: "mood",     efficacy: 2, evidence: 1, studies: 2, type: "Preclinical",
        summary: "Reduces learned helplessness in animal models. Anxiolytic potential via GABA-B upregulation.", sources: [] },
    ],
  },

  {
    id: "bromantane",
    name: "Bromantane",
    aliases: ["bromantane","ladasten","adamantylbromphenylamine"],
    tier: 3, safety: 3, legal: "Approved in Russia. Research compound elsewhere.", cost: "$30-$80/month",
    dosage: { amount: "50-100mg/day", timing: "Morning", note: "Actoprotector and anxiolytic. Banned by WADA. Unique mechanism stimulating dopamine and serotonin synthesis simultaneously." },
    interactions: [],
    effects: [
      { goal: "energy",   efficacy: 4, evidence: 2, studies: 6, type: "RCT",
        summary: "Increases physical and mental performance without typical stimulant side effects. Enhances heat and hypoxia tolerance. Russian military research compound.", sources: ["PMID:9792729"] },
      { goal: "mood",     efficacy: 3, evidence: 2, studies: 4, type: "RCT",
        summary: "Reduces anxiety while increasing motivation via dual DA and 5-HT synthesis upregulation.", sources: ["PMID:9792729"] },
    ],
  },

  {
    id: "phenibut",
    name: "Phenibut",
    aliases: ["phenibut","phenybut","noofen","fenibut","beta-phenyl-GABA"],
    tier: 4, safety: 1, legal: "Prescription Russia/Ukraine. Banned in EU. OTC in USA (grey area).", cost: "$15-$40/month",
    dosage: { amount: "250-1000mg, maximum 1-2x per week", timing: "On empty stomach, effects in 2-4 hours", note: "SEVERE dependency and withdrawal risk. Not for regular use. Tolerance develops within days. Withdrawal can be life-threatening at high doses." },
    interactions: ["Alcohol (dangerous)", "Benzodiazepines (life-threatening combination)", "Opioids"],
    effects: [
      { goal: "stress",   efficacy: 5, evidence: 2, studies: 8, type: "RCT (Russian)",
        summary: "Potent anxiolytic and mood enhancer. GABA-B agonist with some GABA-A activity. Powerful but extremely high addiction and withdrawal risk.", sources: ["PMID:11830980"] },
      { goal: "sleep",    efficacy: 4, evidence: 2, studies: 5, type: "RCT",
        summary: "Strong sleep-inducing at higher doses. High dependency risk makes it unsuitable for regular sleep support.", sources: [] },
    ],
  },

  {
    id: "5-htp",
    name: "5-HTP",
    aliases: ["5-HTP","5-hydroxytryptophan","5 HTP","serotonin precursor"],
    tier: 2, safety: 3, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "50-200mg", timing: "Evening on empty stomach. Cycle: not for indefinite daily use.", note: "Direct serotonin precursor. Do not combine with antidepressants. Carbidopa sometimes added to improve brain conversion." },
    interactions: ["SSRIs (serotonin syndrome risk)", "MAOIs (dangerous)", "Tramadol", "Triptans"],
    effects: [
      { goal: "mood",     efficacy: 4, evidence: 3, studies: 25, type: "RCT",
        summary: "Increases serotonin synthesis directly. Multiple RCTs show improvement in depression and anxiety. Comparable to some antidepressants in mild-moderate depression.", sources: ["PMID:9727088","PMID:2041791"] },
      { goal: "sleep",    efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves sleep quality via serotonin to melatonin conversion. Increases slow-wave sleep.", sources: ["PMID:20334046"] },
      { goal: "stress",   efficacy: 3, evidence: 2, studies: 8, type: "RCT",
        summary: "Reduces anxiety by increasing serotonergic tone.", sources: ["PMID:9727088"] },
    ],
  },

  {
    id: "d-aspartic-acid",
    name: "D-Aspartic Acid",
    aliases: ["D-aspartic acid","DAA","D-aspartate"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "2-3g/day", timing: "Morning on empty stomach. Cycle: 12 days ON, rest period.", note: "Naturally occurring amino acid that stimulates LH and testosterone release. Effects may reverse with extended use - cycling recommended." },
    interactions: [],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Increases LH and testosterone by 15-42% in men with low-normal testosterone. Effects less clear in men with already-normal testosterone. Best used in cycles.", sources: ["PMID:19860889"] },
    ],
  },

  {
    id: "phosphatidylserine",
    name: "Phosphatidylserine",
    aliases: ["phosphatidylserine","PS","serinol"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "100-300mg/day", timing: "With meals", note: "FDA-qualified health claim for cognitive decline. Derived from soy or sunflower (sunflower preferred for those with soy allergy)." },
    interactions: [],
    effects: [
      { goal: "memory",   efficacy: 3, evidence: 4, studies: 20, type: "RCT",
        summary: "FDA-qualified health claim for reducing risk of cognitive dysfunction. Improves memory and cognitive function in elderly. Supports neuronal membrane integrity.", sources: ["PMID:10997492","PMID:1614863"] },
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Blunts cortisol response to exercise and mental stress. Reduces ACTH levels.", sources: ["PMID:1614863"] },
      { goal: "focus",    efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Improves attention and processing speed, particularly in ADHD and age-related decline.", sources: ["PMID:10997492"] },
    ],
  },

  {
    id: "mucuna-pruriens",
    name: "Mucuna Pruriens",
    aliases: ["mucuna pruriens","velvet bean","l-dopa bean","natural levodopa"],
    tier: 2, safety: 3, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "5g of 15% L-DOPA extract (750mg L-DOPA equivalent)", timing: "Morning on empty stomach. Cycle 5 days ON, 2 days OFF.", note: "Contains natural L-DOPA, direct dopamine precursor. Powerful but requires cycling. Do not use with MAOIs or if taking Parkinson's medications." },
    interactions: ["MAOIs (dangerous)", "Levodopa medications", "Antipsychotics (antagonistic)"],
    effects: [
      { goal: "hormones", efficacy: 4, evidence: 3, studies: 12, type: "RCT",
        summary: "Significantly increases testosterone and LH in infertile men. Reduces prolactin. Also improves sperm quality.", sources: ["PMID:19501304"] },
      { goal: "mood",     efficacy: 3, evidence: 2, studies: 8, type: "RCT",
        summary: "Dopamine precursor. Improves motivation, well-being, and reduces depression symptoms. Comparable effects to pharmaceutical levodopa at appropriate doses.", sources: ["PMID:19501304"] },
    ],
  },

  {
    id: "vinpocetine",
    name: "Vinpocetine",
    aliases: ["vinpocetine","cavinton","intelectol"],
    tier: 3, safety: 3, legal: "Prescription EU. OTC USA (FDA advisory warning 2019).", cost: "$15-$30/month",
    dosage: { amount: "15-60mg/day in 3 doses", timing: "With meals", note: "FDA warned it should not be in supplements due to potential pregnancy risks. Semi-synthetic derivative of vincamine." },
    interactions: ["Anticoagulants", "Antihypertensives"],
    effects: [
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 14, type: "RCT",
        summary: "Increases cerebral blood flow and glucose utilization. Improves memory in mild cognitive impairment. PDE1 inhibitor.", sources: ["PMID:12535130"] },
      { goal: "focus",    efficacy: 3, evidence: 2, studies: 8, type: "RCT",
        summary: "Improves psychomotor speed and reaction time. Used clinically in Central/Eastern Europe for cognitive disorders.", sources: [] },
    ],
  },

  // ── VITAMINS AND MINERALS ──────────────────────────────────────────────────

  {
    id: "vitamin-b3",
    name: "Vitamin B3 (Niacin/Niacinamide)",
    aliases: ["niacin","niacinamide","nicotinic acid","nicotinamide","vitamin B3","B3"],
    tier: 1, safety: 4, legal: "OTC everywhere", cost: "$5-$15/month",
    dosage: { amount: "500-3000mg/day (flush-free or niacinamide for skin)", timing: "With meals. Start low and titrate up.", note: "Niacin (nicotinic acid) causes flushing. Niacinamide does not cause flushing and is preferred for skin and NAD+ support. Different from NMN/NR but same downstream pathway." },
    interactions: ["Statins (myopathy risk at high dose)", "Antidiabetics (may raise blood sugar)"],
    effects: [
      { goal: "cardio",   efficacy: 4, evidence: 5, studies: 100, type: "Meta-analyses",
        summary: "Increases HDL cholesterol by 15-35%. Reduces LDL and triglycerides. One of the oldest lipid-modifying drugs. Niacin (not niacinamide) has cardiovascular benefits.", sources: ["PMID:23074222"] },
      { goal: "skin",     efficacy: 4, evidence: 4, studies: 25, type: "RCT",
        summary: "Niacinamide reduces hyperpigmentation, improves barrier function, reduces acne and rosacea. 4% topical niacinamide comparable to 1% clindamycin for acne.", sources: ["PMID:16029676"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Precursor to NAD+. Supports DNA repair via PARP enzymes. Niacinamide supplementation increases cellular NAD+ significantly.", sources: ["PMID:30190406"] },
    ],
  },

  {
    id: "vitamin-b6",
    name: "Vitamin B6",
    aliases: ["pyridoxine","pyridoxal-5-phosphate","P5P","vitamin B6","B6"],
    tier: 1, safety: 3, legal: "OTC everywhere", cost: "$5-$10/month",
    dosage: { amount: "10-50mg/day (P5P form preferred)", timing: "With food", note: "Pyridoxal-5-Phosphate (P5P) is the active form, better than pyridoxine. Avoid doses above 200mg/day long-term (peripheral neuropathy risk)." },
    interactions: ["Levodopa (reduces effectiveness)", "Isoniazid (depletes B6)"],
    effects: [
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Essential cofactor for serotonin and dopamine synthesis. Supplementation improves depression in deficient individuals, particularly those on oral contraceptives.", sources: ["PMID:26374555"] },
      { goal: "hormones", efficacy: 2, evidence: 2, studies: 8, type: "RCT",
        summary: "Reduces prolactin and may support testosterone. Involved in steroid hormone metabolism.", sources: ["PMID:22829453"] },
      { goal: "sleep",    efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Involved in melatonin synthesis. Deficiency associated with sleep disturbances.", sources: [] },
    ],
  },

  {
    id: "vitamin-b9",
    name: "Folate (Methylfolate)",
    aliases: ["folate","folic acid","methylfolate","MTHF","vitamin B9","5-MTHF"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$5-$10/month",
    dosage: { amount: "400-800mcg methylfolate/day", timing: "Anytime", note: "Methylfolate (5-MTHF) is the active form and preferred over folic acid, especially for those with MTHFR gene variants (~40% of population)." },
    interactions: ["Methotrexate (antagonist)", "Anticonvulsants (may reduce folate levels)"],
    effects: [
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 18, type: "RCT",
        summary: "Augments antidepressant response. Low folate strongly associated with depression and poor antidepressant response. Methylfolate as add-on therapy improves outcomes.", sources: ["PMID:22095173"] },
      { goal: "longevity",efficacy: 3, evidence: 4, studies: 30, type: "Meta-analyses",
        summary: "Reduces homocysteine. High homocysteine is independent cardiovascular risk factor. Folate supplementation reduces stroke risk by ~10-20%.", sources: ["PMID:23257811"] },
    ],
  },

  {
    id: "vitamin-e",
    name: "Vitamin E",
    aliases: ["tocopherol","tocotrienol","alpha-tocopherol","vitamin E"],
    tier: 1, safety: 3, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "100-400 IU/day natural form (d-alpha-tocopherol)", timing: "With fatty meals", note: "Natural d-alpha-tocopherol is superior to synthetic dl-alpha form. Mixed tocopherols + tocotrienols (full spectrum) may be superior to isolated alpha-tocopherol." },
    interactions: ["Anticoagulants (additive at high doses)", "Vitamin K (may antagonize)"],
    effects: [
      { goal: "longevity",efficacy: 2, evidence: 3, studies: 40, type: "Meta-analyses",
        summary: "Fat-soluble antioxidant protecting cell membranes. Meta-analyses show modest overall benefit. May increase all-cause mortality at very high doses (>800 IU). Best at physiological doses.", sources: ["PMID:19922238"] },
      { goal: "skin",     efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Topically and orally reduces UV-induced skin damage. Reduces hyperpigmentation when combined with vitamin C.", sources: ["PMID:15464065"] },
    ],
  },

  {
    id: "vitamin-k2",
    name: "Vitamin K2 (MK-7)",
    aliases: ["vitamin K2","MK-7","menaquinone","K2","menaquinone-7"],
    tier: 1, safety: 4, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "90-200mcg/day (MK-7 form)", timing: "With fatty meal", note: "MK-7 has longer half-life than MK-4. Essential partner to vitamin D3 to direct calcium to bones, not arteries. Fermented foods (natto) are richest source." },
    interactions: ["Warfarin (significant - reduces effectiveness)"],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 4, studies: 25, type: "RCT",
        summary: "Activates matrix Gla protein, preventing arterial calcification. Rotterdam study: highest K2 intake = 57% lower cardiovascular mortality over 7 years.", sources: ["PMID:15514282"] },
      { goal: "hormones", efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "MK-4 form shown to improve testosterone levels in one RCT. Activates proteins in the testes.", sources: ["PMID:21986724"] },
    ],
  },

  {
    id: "selenium",
    name: "Selenium",
    aliases: ["selenium","selenomethionine","Se"],
    tier: 1, safety: 3, legal: "OTC everywhere", cost: "$5-$10/month",
    dosage: { amount: "100-200mcg/day", timing: "With food", note: "Narrow therapeutic window - do not exceed 400mcg/day (toxicity risk). Selenomethionine is the best absorbed form. Brazil nuts contain ~70mcg each." },
    interactions: ["Vitamin C (may reduce selenium absorption at high doses)"],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 4, studies: 30, type: "RCT",
        summary: "Essential component of glutathione peroxidase and thioredoxin reductase. Antioxidant defense. Reduces cancer risk in selenium-deficient populations.", sources: ["PMID:8765178"] },
      { goal: "hormones", efficacy: 2, evidence: 3, studies: 12, type: "RCT",
        summary: "Essential for thyroid hormone synthesis and conversion. Deficiency impairs thyroid function.", sources: ["PMID:10802966"] },
    ],
  },

  {
    id: "iodine",
    name: "Iodine",
    aliases: ["iodine","potassium iodide","lugol's iodine","iodide"],
    tier: 1, safety: 3, legal: "OTC everywhere", cost: "$5-$10/month",
    dosage: { amount: "150-220mcg/day (RDA level)", timing: "With food", note: "RDA is 150mcg. High-dose iodine (mg range) protocols exist but are controversial. Most people in developed countries are sufficient. Deficiency affects thyroid function." },
    interactions: ["Thyroid medications", "Lithium (reduces thyroid function)"],
    effects: [
      { goal: "energy",   efficacy: 3, evidence: 4, studies: 20, type: "RCT",
        summary: "Essential for thyroid hormone production. Deficiency causes hypothyroidism with fatigue, weight gain, and cognitive slowing. Correction improves energy levels dramatically.", sources: ["PMID:10802966"] },
    ],
  },

  {
    id: "lithium-orotate",
    name: "Lithium Orotate (Microdose)",
    aliases: ["lithium orotate","lithium aspartate","microdose lithium","low-dose lithium"],
    tier: 3, safety: 3, legal: "OTC everywhere (at low doses). Prescription for therapeutic doses.", cost: "$10-$20/month",
    dosage: { amount: "5-10mg elemental lithium/day", timing: "With food", note: "Microdose lithium (5-10mg) is very different from pharmaceutical lithium (300-900mg for bipolar). Appears safe at low doses. Fascinating neuroprotective data." },
    interactions: ["NSAIDs (reduce renal clearance)", "ACE inhibitors", "Diuretics"],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 12, type: "Epidemiological + small RCT",
        summary: "Areas with higher lithium in water have lower rates of dementia, suicide, and violent crime. Inhibits GSK-3beta, promotes autophagy and neurogenesis.", sources: ["PMID:27900124"] },
      { goal: "mood",     efficacy: 2, evidence: 2, studies: 6, type: "Pilot RCT",
        summary: "Microdose lithium may improve mood stability and reduce aggression. Mechanisms include BDNF upregulation and neuroprotection.", sources: ["PMID:21485812"] },
    ],
  },

  {
    id: "chromium",
    name: "Chromium Picolinate",
    aliases: ["chromium","chromium picolinate","chromium polynicotinate"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$5-$15/month",
    dosage: { amount: "200-1000mcg/day", timing: "With meals", note: "Picolinate form is best absorbed. Chromium potentiates insulin action. Most useful in those with insulin resistance or carbohydrate cravings." },
    interactions: ["Insulin and antidiabetics (additive glucose-lowering effect)"],
    effects: [
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves atypical depression with carbohydrate cravings in multiple RCTs. Enhances serotonin signaling via insulin sensitization.", sources: ["PMID:12704420"] },
      { goal: "longevity",efficacy: 2, evidence: 2, studies: 10, type: "RCT",
        summary: "Improves insulin sensitivity and fasting glucose in pre-diabetics. Reduces carbohydrate cravings.", sources: ["PMID:14715916"] },
    ],
  },

  // ── HERBS AND ADAPTOGENS ──────────────────────────────────────────────────

  {
    id: "schisandra",
    name: "Schisandra Chinensis",
    aliases: ["schisandra","five flavor berry","wu wei zi","schizandra"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "500-2000mg/day (standardized extract)", timing: "Morning with food. Cycle 3 months ON, 1 month OFF.", note: "One of the most versatile adaptogens. Hepatoprotective, reduces cortisol, improves endurance. 6 weeks minimum for full effects." },
    interactions: ["Hepatotoxic drugs (monitor liver enzymes)", "Cytochrome P450 substrates"],
    effects: [
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Potent adaptogen reducing cortisol and stress biomarkers. Improves mental performance under stress. Traditional Chinese adaptogen with modern RCT backing.", sources: ["PMID:19703805"] },
      { goal: "endurance",efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Improves aerobic capacity and reduces lactic acid accumulation. Used by Soviet athletes alongside rhodiola.", sources: ["PMID:19703805"] },
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 8, type: "RCT",
        summary: "Hepatoprotective. Stimulates liver detoxification and reduces ALT/AST levels. Anti-inflammatory and antioxidant properties.", sources: ["PMID:14990789"] },
    ],
  },

  {
    id: "astragalus",
    name: "Astragalus Membranaceus",
    aliases: ["astragalus","huang qi","astragalus membranaceus","TA-65"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "500-2000mg/day (or TA-65 proprietary extract 5-25mg)", timing: "With food", note: "TA-65 is a highly concentrated astragalus extract specifically studied for telomere activation (very expensive at $150+/month). Standard extract is much cheaper." },
    interactions: ["Immunosuppressants (may counteract)"],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 14, type: "RCT",
        summary: "Contains cycloastragenol which activates telomerase. TA-65 RCT showed telomere lengthening and improved immune markers in elderly. Immunomodulatory and anti-inflammatory.", sources: ["PMID:21982960"] },
      { goal: "cardio",   efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Improves cardiac function post-myocardial infarction. Reduces blood pressure and improves endothelial function.", sources: ["PMID:14702967"] },
    ],
  },

  {
    id: "holy-basil",
    name: "Holy Basil (Tulsi)",
    aliases: ["holy basil","tulsi","ocimum sanctum","ocimum tenuiflorum"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "300-600mg/day (standardized extract)", timing: "With meals", note: "Ayurvedic adaptogen. Mildly eugenol-containing - avoid excessive amounts in pregnancy. Gentle but effective adaptogen for daily use." },
    interactions: [],
    effects: [
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Reduces cortisol, blood glucose, and anxiety in multiple RCTs. Mild but consistent adaptogenic effects. Well-tolerated for long-term use.", sources: ["PMID:22207741"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 8, type: "RCT",
        summary: "Reduces depression and anxiety scores. Improves cognitive function under stress.", sources: ["PMID:22207741"] },
    ],
  },

  {
    id: "eleuthero",
    name: "Eleuthero (Siberian Ginseng)",
    aliases: ["eleuthero","eleutherococcus senticosus","siberian ginseng","ci wu jia"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "300-1200mg/day (standardized extract)", timing: "Morning. Cycle 6-8 weeks ON, 2-3 weeks OFF.", note: "Different from Panax ginseng. Eleutherosides not ginsenosides. Gentler stimulant effect. Good general adaptogen for sustained use." },
    interactions: ["Sedatives (may reduce effect)", "Digoxin (may interfere with levels)"],
    effects: [
      { goal: "energy",   efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Reduces physical and mental fatigue. Improves immune function. Used by Soviet Olympic athletes for decades.", sources: ["PMID:4341441"] },
      { goal: "stress",   efficacy: 3, evidence: 2, studies: 8, type: "RCT",
        summary: "Classic adaptogen. Reduces HPA axis response to stress. Long history of use in Russian medicine.", sources: [] },
    ],
  },

  {
    id: "boswellia",
    name: "Boswellia Serrata",
    aliases: ["boswellia","frankincense","AKBA","boswellic acid"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "300-500mg AKBA-standardized extract/day (65-75% boswellic acids)", timing: "With fatty meals", note: "AKBA (Acetyl-11-keto-beta-boswellic acid) is the most active compound. Look for 30% AKBA minimum in extract." },
    interactions: ["Anticoagulants (mild interaction)"],
    effects: [
      { goal: "recovery", efficacy: 4, evidence: 4, studies: 18, type: "RCT",
        summary: "Selective 5-LOX inhibitor reducing leukotriene-driven inflammation. Multiple RCTs show effectiveness for joint pain comparable to NSAIDs without GI side effects.", sources: ["PMID:23946431"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Anti-inflammatory via 5-LOX inhibition. Reduces TNF-alpha and IL-1. Promising for inflammatory bowel disease.", sources: ["PMID:21077428"] },
    ],
  },

  {
    id: "gotu-kola",
    name: "Gotu Kola (Centella Asiatica)",
    aliases: ["gotu kola","centella asiatica","brahmi","tiger grass","asiaticoside"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "500-1000mg/day (standardized extract)", timing: "With meals", note: "Ancient Ayurvedic and TCM herb. Contains asiaticosides which stimulate collagen synthesis. Different from Bacopa Monnieri despite both being called Brahmi in India." },
    interactions: ["Hepatotoxic drugs (monitor)", "Sedatives (may potentiate)"],
    effects: [
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Improves working memory and attention in elderly. Triterpenoids increase BDNF and support neuronal integrity.", sources: ["PMID:15725971"] },
      { goal: "skin",     efficacy: 4, evidence: 4, studies: 20, type: "RCT",
        summary: "Stimulates collagen synthesis, reduces stretch marks and scars. Improves wound healing. Effective both topically and orally.", sources: ["PMID:3541272"] },
    ],
  },

  {
    id: "black-seed-oil",
    name: "Black Seed Oil (Nigella Sativa)",
    aliases: ["black seed oil","nigella sativa","black cumin","thymoquinone","kalonji"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "1-3g/day (or 500mg thymoquinone)", timing: "With meals", note: "Cold-pressed oil preferred over capsules. Thymoquinone is the main active compound. One of the most versatile medicinal plants studied." },
    interactions: ["Anticoagulants (mild interaction)"],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 20, type: "Meta-analyses",
        summary: "Broad anti-inflammatory and antioxidant. Thymoquinone reduces TNF-alpha, IL-6, and NFkB. Consistent effects on metabolic markers across meta-analyses.", sources: ["PMID:24876391"] },
      { goal: "cardio",   efficacy: 3, evidence: 3, studies: 15, type: "Meta-analyses",
        summary: "Reduces blood pressure, LDL cholesterol, and fasting glucose. Meta-analysis of 23 trials confirms cardiovascular benefits.", sources: ["PMID:27710729"] },
    ],
  },

  {
    id: "fenugreek",
    name: "Fenugreek",
    aliases: ["fenugreek","trigonella foenum-graecum","methi","testofen"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "500-600mg standardized extract/day (Testofen or similar)", timing: "With meals", note: "Standardized extracts with 50% fenuside content (Testofen) used in most clinical trials. Maple syrup smell in sweat is common and harmless." },
    interactions: ["Anticoagulants (mild interaction)", "Antidiabetics (may lower glucose further)"],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Inhibits aromatase and 5-alpha-reductase, increasing free testosterone. RCTs show improved libido, strength, and body composition in men.", sources: ["PMID:21116018"] },
      { goal: "longevity",efficacy: 2, evidence: 3, studies: 10, type: "RCT",
        summary: "Galactomannan fiber improves insulin sensitivity and reduces fasting glucose. FDA-approved qualified claim for glucose management.", sources: [] },
    ],
  },

  {
    id: "tribulus-terrestris",
    name: "Tribulus Terrestris",
    aliases: ["tribulus","tribulus terrestris","puncture vine","gokhru"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "750-1250mg/day (standardized to 45% saponins)", timing: "With meals", note: "Evidence does not support testosterone elevation in healthy men. Strong evidence for sexual function and libido. Marketing often overstates the testosterone claim." },
    interactions: [],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Improves sexual desire and erectile function in RCTs. Does not appear to increase testosterone in healthy men. May work via nitric oxide pathway.", sources: ["PMID:24630840"] },
    ],
  },

  {
    id: "saw-palmetto",
    name: "Saw Palmetto",
    aliases: ["saw palmetto","serenoa repens","sabal serrulata"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "160-320mg/day (standardized to 85-95% fatty acids)", timing: "With meals", note: "Most evidence in benign prostatic hyperplasia (BPH). Some use for hair loss (5-alpha-reductase inhibition). Liposterolic extract is the studied form." },
    interactions: ["Anticoagulants (mild)"],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 4, studies: 25, type: "Meta-analyses",
        summary: "5-alpha-reductase inhibitor. Reduces DHT conversion. Cochrane review: improves urinary symptoms in BPH. Evidence for hair loss prevention more mixed.", sources: ["PMID:9060374"] },
    ],
  },

  {
    id: "quercetin",
    name: "Quercetin",
    aliases: ["quercetin","flavonoid","quercetin dihydrate"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "500-1000mg/day", timing: "With meals and fat for absorption", note: "Poor oral bioavailability. Quercetin phytosome or combined with bromelain significantly improves absorption. Often combined with Dasatinib as senolytic protocol." },
    interactions: ["Antibiotics (fluoroquinolones - reduces absorption)", "Cyclosporine"],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 3, studies: 20, type: "RCT + mechanistic",
        summary: "Senolytic activity - selectively kills senescent cells. Combined with dasatinib (D+Q protocol), shown to reduce senescent cell burden in human trials.", sources: ["PMID:32586350"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Anti-inflammatory via NLRP3 inflammasome inhibition. Reduces IL-6 and TNF-alpha. Antiviral properties.", sources: ["PMID:24290422"] },
    ],
  },

  {
    id: "fisetin",
    name: "Fisetin",
    aliases: ["fisetin","3,3,4,7-tetrahydroxyflavone"],
    tier: 3, safety: 4, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "100-500mg/day (or 20mg/kg 2 days/month pulse dosing for senolytic effect)", timing: "With fatty meal", note: "Most potent natural senolytic identified to date. Pulse dosing (high dose for 2 consecutive days monthly) may be more effective than daily low dosing for senolytic effects." },
    interactions: ["Anticoagulants (mild interaction)"],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 3, studies: 10, type: "RCT + animal studies",
        summary: "Most potent senolytic flavonoid identified. Reduces senescent cell burden, extends healthy lifespan in animal models by 10%. Human trial (AFFIRM-LITE) showed reduced p21 senescence markers.", sources: ["PMID:28236471"] },
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Restores age-related memory decline in animal models. Activates ERK and mTOR pathways for long-term memory consolidation.", sources: ["PMID:23999435"] },
    ],
  },

  {
    id: "spermidine",
    name: "Spermidine",
    aliases: ["spermidine","spermidine trihydrochloride","wheat germ extract"],
    tier: 3, safety: 4, legal: "OTC everywhere", cost: "$25-$60/month",
    dosage: { amount: "1-5mg/day", timing: "Morning with food", note: "Found naturally in wheat germ, mushrooms, and soybeans. Wheat germ extract is the most common supplement form. Autophagy activator with strong anti-aging potential." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 3, studies: 12, type: "RCT + observational",
        summary: "Potent autophagy inducer. Higher spermidine intake associated with 5-year longer lifespan in population studies. RCT in elderly showed improved cognitive function and reduced inflammation.", sources: ["PMID:31932626"] },
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 5, type: "RCT",
        summary: "Pilot RCT showed improved memory performance in older adults with subjective cognitive decline.", sources: ["PMID:34482487"] },
      { goal: "cardio",   efficacy: 3, evidence: 2, studies: 5, type: "Observational",
        summary: "Higher dietary spermidine intake associated with lower cardiovascular mortality in observational study of 829 participants.", sources: ["PMID:31932626"] },
    ],
  },

  {
    id: "urolithin-a",
    name: "Urolithin A",
    aliases: ["urolithin A","UA","timeline longevity","mitopure"],
    tier: 3, safety: 4, legal: "OTC everywhere (novel food status in EU)", cost: "$40-$100/month",
    dosage: { amount: "500-1000mg/day", timing: "Morning with food", note: "Produced by gut bacteria from pomegranate ellagitannins. ~40% of people lack gut bacteria to produce it from food. Mitopure is the proprietary standardized form." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 3, studies: 8, type: "RCT",
        summary: "Induces mitophagy, clearing damaged mitochondria and improving mitochondrial quality. Phase I/II RCT in elderly: improved muscle strength and VO2max.", sources: ["PMID:35064099"] },
      { goal: "endurance",efficacy: 3, evidence: 2, studies: 4, type: "RCT",
        summary: "Improved aerobic endurance capacity in older adults in RCT. Mechanism via improved mitochondrial function in muscle.", sources: ["PMID:35064099"] },
    ],
  },

  {
    id: "astaxanthin",
    name: "Astaxanthin",
    aliases: ["astaxanthin","haematococcus pluvialis","astaxanthin algae"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-$35/month",
    dosage: { amount: "4-12mg/day", timing: "With a fatty meal (fat-soluble)", note: "Most powerful natural antioxidant by ORAC value - 550x more potent than vitamin E. Natural form from Haematococcus algae superior to synthetic astaxanthin." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 3, studies: 20, type: "RCT",
        summary: "Crosses blood-brain barrier and mitochondrial membranes. Reduces oxidative stress markers by 50-60% in RCTs. Anti-inflammatory and neuroprotective.", sources: ["PMID:21185839"] },
      { goal: "skin",     efficacy: 4, evidence: 4, studies: 16, type: "RCT",
        summary: "Reduces UV-induced wrinkles, age spots, and skin moisture loss. Multiple RCTs confirm 6-8 week effects on skin aging markers.", sources: ["PMID:22428137"] },
      { goal: "recovery", efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Reduces muscle damage biomarkers and oxidative stress post-exercise. Improves recovery time.", sources: ["PMID:20577067"] },
    ],
  },

  {
    id: "pine-bark-pycnogenol",
    name: "Pycnogenol (Pine Bark Extract)",
    aliases: ["pycnogenol","pine bark extract","maritime pine bark","proanthocyanidins"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "50-200mg/day", timing: "With meals", note: "French maritime pine bark extract. High in OPCs (oligomeric proanthocyanidins). One of the most studied proprietary extracts with 400+ peer-reviewed publications." },
    interactions: ["Anticoagulants (additive effect at high doses)", "Immunosuppressants"],
    effects: [
      { goal: "cardio",   efficacy: 4, evidence: 4, studies: 40, type: "RCT",
        summary: "Reduces blood pressure, improves endothelial function, reduces platelet aggregation. Multiple RCTs confirm cardiovascular benefits.", sources: ["PMID:18368714"] },
      { goal: "focus",    efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Improves attention and cognitive function in adults. RCTs in ADHD children show significant improvement.", sources: ["PMID:16699814"] },
      { goal: "skin",     efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves skin elasticity, reduces hyperpigmentation, and protects against UV damage.", sources: ["PMID:22672923"] },
    ],
  },

  {
    id: "andrographis",
    name: "Andrographis Paniculata",
    aliases: ["andrographis","king of bitters","andrographolide"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "300-600mg/day (standardized to 10% andrographolide)", timing: "Between meals", note: "Intensely bitter herb. Primary use for immune support and anti-viral properties. Widely used in Scandinavian countries (Kan Jang product)." },
    interactions: ["Immunosuppressants (counteracts)", "Anticoagulants"],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Strong anti-inflammatory via NF-kB inhibition. Multiple RCTs confirm reduction in upper respiratory tract infection severity and duration.", sources: ["PMID:14960258"] },
    ],
  },

  {
    id: "gynostemma",
    name: "Gynostemma (Jiaogulan)",
    aliases: ["gynostemma","jiaogulan","southern ginseng","AMPK activator"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "200-400mg/day (standardized extract) or 3-6g dried herb as tea", timing: "Morning with food", note: "Called 'herb of immortality' in China. Activates AMPK similarly to berberine but more gently. Good for daily use." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "AMPK activator improving insulin sensitivity and lipid profiles. Antioxidant gypenosides. Reduces fasting glucose and HbA1c in small RCTs.", sources: ["PMID:24474065"] },
      { goal: "stress",   efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Adaptogenic properties. Reduces fatigue and anxiety. Modulates cortisol response.", sources: [] },
    ],
  },

  // ── PERFORMANCE ───────────────────────────────────────────────────────────

  {
    id: "hmb",
    name: "HMB (Beta-Hydroxy Beta-Methylbutyrate)",
    aliases: ["HMB","beta-hydroxy beta-methylbutyrate","HMB-FA","HMB-Ca"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$30-$60/month",
    dosage: { amount: "3g/day in 3 doses (1g per dose)", timing: "With meals. HMB-FA form absorbs faster than Ca-HMB.", note: "Leucine metabolite. Anti-catabolic properties strongest when protein intake is suboptimal or during caloric restriction. Less effective with already high protein intake." },
    interactions: [],
    effects: [
      { goal: "force",    efficacy: 3, evidence: 3, studies: 15, type: "Meta-analyses",
        summary: "Reduces muscle protein breakdown, particularly during caloric restriction or untrained individuals. Meta-analysis confirms lean mass preservation and strength gains.", sources: ["PMID:18974745"] },
      { goal: "recovery", efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Reduces markers of muscle damage post-exercise. Particularly effective during periods of heavy training or returning from injury.", sources: ["PMID:11445763"] },
    ],
  },

  {
    id: "turkesterone",
    name: "Turkesterone",
    aliases: ["turkesterone","ecdysteroid","ajuga turkestanica","phytoecdysteroid"],
    tier: 2, safety: 4, legal: "OTC everywhere (WADA testing started 2023)", cost: "$40-$80/month",
    dosage: { amount: "500-1000mg/day (standardized to 10% turkesterone)", timing: "With meals", note: "Phytoecdysteroid. Structurally similar to testosterone but acts through different receptor pathway (ER-beta not androgen receptor). WADA is evaluating for prohibited list." },
    interactions: [],
    effects: [
      { goal: "force",    efficacy: 3, evidence: 2, studies: 4, type: "RCT",
        summary: "One German RCT showed significant muscle mass gain vs placebo at 500mg/day for 10 weeks. Acts via estrogen receptor beta to stimulate protein synthesis.", sources: ["PMID:31978192"] },
      { goal: "recovery", efficacy: 2, evidence: 2, studies: 3, type: "RCT",
        summary: "Potential anti-catabolic effects. Reduces cortisol in some studies. Anabolic properties without androgenic side effects.", sources: [] },
    ],
  },

  {
    id: "ecdysterone",
    name: "Ecdysterone (20-Hydroxyecdysone)",
    aliases: ["ecdysterone","20-hydroxyecdysone","beta-ecdysterone","spinach extract"],
    tier: 2, safety: 4, legal: "OTC everywhere (WADA banned list under review)", cost: "$30-$60/month",
    dosage: { amount: "100-500mg/day", timing: "With protein-containing meals", note: "Found naturally in spinach, quinoa, and various plants. German RCT showed anabolic effects. WADA is evaluating prohibition." },
    interactions: [],
    effects: [
      { goal: "force",    efficacy: 3, evidence: 2, studies: 3, type: "RCT",
        summary: "Humboldt University RCT: ecdysterone group gained significantly more muscle mass than placebo over 10 weeks of resistance training. Acts via estrogen receptor beta.", sources: ["PMID:31978192"] },
    ],
  },

  {
    id: "laxogenin",
    name: "Laxogenin (5-Alpha-Hydroxy-Laxogenin)",
    aliases: ["laxogenin","5-alpha-hydroxy-laxogenin","plant steroid"],
    tier: 3, safety: 3, legal: "OTC in most countries. Banned in competitive sport.", cost: "$30-$70/month",
    dosage: { amount: "25-100mg/day", timing: "With meals", note: "Plant-derived steroidal sapogenin. No human RCT data exists. Claimed to inhibit cortisol and increase protein synthesis. Limited scientific evidence." },
    interactions: [],
    effects: [
      { goal: "force",    efficacy: 2, evidence: 1, studies: 1, type: "Anecdotal",
        summary: "No peer-reviewed human trials exist. Anecdotal reports suggest mild anabolic and anti-catabolic effects. Mechanism potentially via protein synthesis rate increase.", sources: [] },
    ],
  },

  {
    id: "deer-velvet-antler",
    name: "Deer Velvet Antler",
    aliases: ["deer velvet","velvet antler","IGF-1 velvet","elk velvet"],
    tier: 3, safety: 3, legal: "OTC everywhere. Banned in competitive sport.", cost: "$30-$60/month",
    dosage: { amount: "250-500mg/day", timing: "Morning with food", note: "Contains IGF-1, IGF-2, and growth factors. Controversial - oral IGF-1 is likely degraded in the gut. WADA banned. Legal status for athletes varies." },
    interactions: [],
    effects: [
      { goal: "recovery", efficacy: 2, evidence: 2, studies: 5, type: "RCT",
        summary: "Small RCTs show modest improvements in recovery and strength. High-quality evidence limited. Bioavailability of IGF-1 from oral supplementation questionable.", sources: ["PMID:12831025"] },
    ],
  },

  {
    id: "carnosine",
    name: "Carnosine",
    aliases: ["carnosine","l-carnosine","beta-alanyl-l-histidine"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "500-1000mg/day (or supplement beta-alanine to boost endogenous carnosine)", timing: "With food", note: "Rapidly broken down in the body. Beta-alanine supplementation more efficiently increases muscle carnosine levels than direct carnosine. Oral carnosine has better systemic effects." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Multi-functional dipeptide. Anti-glycation agent preventing protein cross-linking. Reduces advanced glycation endproducts (AGEs). Anti-aging properties in multiple tissues.", sources: ["PMID:16029676"] },
      { goal: "focus",    efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Crosses blood-brain barrier. Antioxidant in brain. May improve cognitive symptoms in autism spectrum disorder in small RCTs.", sources: [] },
    ],
  },

  // ── PEPTIDES CONTINUED ────────────────────────────────────────────────────

  {
    id: "hexarelin",
    name: "Hexarelin",
    aliases: ["hexarelin","examorelin","EP-23905"],
    tier: 4, safety: 2, legal: "Research compound. Not approved for human use.", cost: "$60-$150/month",
    dosage: { amount: "100-200mcg 1-3x daily (subcutaneous)", timing: "Fasted, multiple daily injections for sustained GH elevation", note: "Most potent GHRP for acute GH release. Rapid tolerance development limits chronic use. Also has cardioprotective properties via ghrelin receptors." },
    interactions: ["Somatostatin analogues (reduce effect)"],
    effects: [
      { goal: "recovery", efficacy: 3, evidence: 1, studies: 2, type: "Phase I trials",
        summary: "Strongest acute GH secretagogue. Phase I data confirms strong GH elevation. Cardioprotective effects via cardiac ghrelin receptors shown in animal models.", sources: ["PMID:9183849"] },
      { goal: "cardio",   efficacy: 3, evidence: 1, studies: 2, type: "Animal studies",
        summary: "Cardioprotective properties independent of GH elevation. Reduces cardiac damage in ischemia-reperfusion injury models.", sources: ["PMID:10377505"] },
    ],
  },

  {
    id: "ghrp-2",
    name: "GHRP-2",
    aliases: ["GHRP-2","pralmorelin","KP-102"],
    tier: 4, safety: 2, legal: "Research compound. Not approved for human use.", cost: "$40-$100/month",
    dosage: { amount: "100-300mcg 2-3x daily (subcutaneous)", timing: "Fasted for maximal GH response", note: "Second-generation GHRP. Increases prolactin and cortisol less than GHRP-6 but more than ipamorelin. Often stacked with CJC-1295." },
    interactions: [],
    effects: [
      { goal: "recovery", efficacy: 3, evidence: 1, studies: 2, type: "Phase I/II trials",
        summary: "Robust GH secretion with less hunger stimulation than GHRP-6. Approved for GH deficiency testing in some countries.", sources: ["PMID:9583837"] },
    ],
  },

  {
    id: "sermorelin",
    name: "Sermorelin",
    aliases: ["sermorelin","GHRH 1-29","GRF 1-29"],
    tier: 4, safety: 2, legal: "Prescription in USA for GH deficiency in children. Off-label adult use.", cost: "$60-$200/month",
    dosage: { amount: "200-300mcg nightly (subcutaneous)", timing: "Before sleep for maximal nocturnal GH pulse", note: "GHRH analogue. FDA-approved for growth hormone deficiency diagnosis and pediatric treatment. Off-label adult use for anti-aging. Better safety profile than HGH itself." },
    interactions: ["Glucocorticoids (reduce GH response)"],
    effects: [
      { goal: "recovery", efficacy: 3, evidence: 2, studies: 5, type: "RCT",
        summary: "Stimulates pituitary to produce GH naturally. More physiological than exogenous GH. Clinical studies confirm GH restoration in adults.", sources: ["PMID:1988415"] },
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 4, type: "RCT",
        summary: "Restores IGF-1 levels toward younger physiological range. Improves body composition, sleep quality, and skin integrity.", sources: [] },
    ],
  },

  {
    id: "mk-677",
    name: "MK-677 (Ibutamoren)",
    aliases: ["MK-677","ibutamoren","L-163,191","nutrobal"],
    tier: 4, safety: 2, legal: "Research compound. Not approved for human use. Banned in sport.", cost: "$40-$80/month",
    dosage: { amount: "10-25mg/day (oral)", timing: "Evening (increases appetite - harder to manage during the day)", note: "Oral GH secretagogue - unique advantage over injectable GHRPs. Significantly increases appetite and IGF-1 levels. Water retention is common." },
    interactions: ["Insulin (GH raises blood sugar)", "Antidiabetics"],
    effects: [
      { goal: "recovery", efficacy: 4, evidence: 2, studies: 6, type: "RCT",
        summary: "Phase I-III trials confirm strong GH and IGF-1 elevation. Oral administration makes compliance easy. Increases muscle mass and reduces abdominal fat.", sources: ["PMID:9703368"] },
      { goal: "sleep",    efficacy: 3, evidence: 2, studies: 3, type: "RCT",
        summary: "Increases REM sleep duration and sleep quality via GH effects. Often used specifically for sleep quality improvement.", sources: ["PMID:9703368"] },
    ],
  },

  {
    id: "tesamorelin",
    name: "Tesamorelin",
    aliases: ["tesamorelin","Egrifta","TH9507"],
    tier: 4, safety: 3, legal: "FDA-approved drug (Egrifta) for HIV-related lipodystrophy.", cost: "$150-$500/month",
    dosage: { amount: "2mg/day subcutaneous injection", timing: "Evening", note: "FDA-approved GHRH analogue. Strong evidence for visceral fat reduction. Off-label use for cognitive enhancement and body composition in non-HIV patients." },
    interactions: ["Glucocorticoids (reduce GH response)", "Antidiabetics"],
    effects: [
      { goal: "recovery", efficacy: 4, evidence: 3, studies: 8, type: "RCT (FDA approval data)",
        summary: "FDA-approved. Reduces visceral adipose tissue by 20% in RCTs. Improves body composition via GH/IGF-1 elevation.", sources: ["PMID:19920055"] },
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 3, type: "RCT",
        summary: "Small RCT showed improved executive function and verbal memory in adults with HIV-associated neurocognitive disorder.", sources: ["PMID:26349031"] },
    ],
  },

  {
    id: "aod-9604",
    name: "AOD-9604",
    aliases: ["AOD-9604","anti-obesity drug 9604","fragment 176-191"],
    tier: 4, safety: 2, legal: "Research compound. Was FDA fast-tracked, development stopped.", cost: "$50-$120/month",
    dosage: { amount: "250-500mcg/day (subcutaneous or oral)", timing: "Morning on empty stomach", note: "C-terminal fragment of HGH specifically for fat metabolism without growth effects. Phase III trials for obesity failed to meet endpoints despite promising Phase II data." },
    interactions: [],
    effects: [
      { goal: "recovery", efficacy: 2, evidence: 2, studies: 4, type: "Phase II trials",
        summary: "Specifically targets fat cells via beta-3 adrenergic receptor. Phase II showed dose-dependent fat reduction without affecting glucose or IGF-1.", sources: ["PMID:16353612"] },
    ],
  },

  {
    id: "thymosin-alpha-1",
    name: "Thymosin Alpha-1",
    aliases: ["thymosin alpha-1","TA-1","thymalfasin","Zadaxin"],
    tier: 4, safety: 3, legal: "Approved drug in 35+ countries for immune disorders. Research compound in USA.", cost: "$100-$300/month",
    dosage: { amount: "1.6mg subcutaneous 2x/week", timing: "Per protocol", note: "Approved as Zadaxin in China, India, Italy and other countries for hepatitis B/C, cancer adjunct. Used off-label for immune optimization and post-viral recovery." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 3, studies: 20, type: "RCT (clinical)",
        summary: "Restores thymus function and immune balance. Approved for hepatitis B/C treatment in 35+ countries. Significantly improves T-cell counts and function.", sources: ["PMID:7854767"] },
    ],
  },

  {
    id: "humanin",
    name: "Humanin",
    aliases: ["humanin","HN","mitochondrial peptide"],
    tier: 4, safety: 2, legal: "Research compound. Not commercially available as supplement.", cost: "$200-$500/month",
    dosage: { amount: "Experimental protocols vary", timing: "Research only", note: "Mitochondria-derived peptide encoded within mitochondrial DNA. Declines with age. No established supplementation protocol. Research stage only." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 6, type: "Preclinical + early human",
        summary: "Cytoprotective mitochondrial peptide. Declines ~50% per decade after age 30. Animal studies show extended lifespan and protection against Alzheimer's pathology.", sources: ["PMID:22981854"] },
    ],
  },

  {
    id: "mots-c",
    name: "MOTS-c",
    aliases: ["MOTS-c","mitochondrial ORF of the twelve S rRNA type-c","mitochondrial microprotein"],
    tier: 4, safety: 2, legal: "Research compound. Not commercially available.", cost: "$200-$600/month",
    dosage: { amount: "Experimental (5-10mg subcutaneous weekly in animal studies)", timing: "Research only", note: "Newly discovered mitochondria-derived peptide. Declines with age. Considered a potential anti-aging therapeutic. No human dosing established." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 4, type: "Animal studies + early human",
        summary: "Activates AMPK, improves insulin sensitivity, and extends lifespan in animal models. Human plasma MOTS-c declines with age. Exciting but very early stage.", sources: ["PMID:25738443"] },
      { goal: "energy",   efficacy: 3, evidence: 1, studies: 2, type: "Animal studies",
        summary: "Improves mitochondrial energy production and physical endurance in mice. Essentially exercise in a molecule - early research only.", sources: ["PMID:25738443"] },
    ],
  },

  {
    id: "ll-37",
    name: "LL-37 (Cathelicidin)",
    aliases: ["LL-37","cathelicidin","antimicrobial peptide","CAMP"],
    tier: 4, safety: 2, legal: "Research compound.", cost: "$100-$300/month",
    dosage: { amount: "Research dosing only", timing: "Research only", note: "Human antimicrobial peptide naturally produced by immune cells and skin. Low vitamin D is associated with low LL-37. Optimizing vitamin D is a safer route to supporting LL-37 levels." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 6, type: "Preclinical",
        summary: "Antimicrobial, immunomodulatory, and wound-healing properties. Vitamin D directly upregulates LL-37 expression. Potential for infection resistance and wound healing.", sources: ["PMID:16549734"] },
    ],
  },

  {
    id: "kpv",
    name: "KPV",
    aliases: ["KPV","Lys-Pro-Val","alpha-MSH fragment"],
    tier: 4, safety: 3, legal: "Research compound.", cost: "$40-$100/month",
    dosage: { amount: "500mcg-1mg/day oral or subcutaneous", timing: "With meals if oral", note: "Anti-inflammatory tripeptide derived from alpha-MSH. Primarily researched for inflammatory bowel disease. Oral bioavailability is better than most peptides due to small size." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 5, type: "Preclinical + pilot",
        summary: "Potent anti-inflammatory via MC1R receptor. Animal studies show significant reduction in intestinal inflammation. Pilot human data positive for IBD.", sources: ["PMID:16899110"] },
    ],
  },

  {
    id: "dihexa",
    name: "Dihexa",
    aliases: ["dihexa","PNB-0408","N-hexanoic-Tyr-Ile-(6) aminohexanoic amide"],
    tier: 4, safety: 1, legal: "Research compound only.", cost: "$80-$300/month",
    dosage: { amount: "Very small doses (mg range)", timing: "Research only. Extremely potent.", note: "EXTREME CAUTION: Dihexa is estimated to be 10 million times more potent than BDNF in promoting new synapse formation. No established safe human dosing. Irreversibility of effects is a theoretical concern." },
    interactions: [],
    effects: [
      { goal: "memory",   efficacy: 4, evidence: 1, studies: 3, type: "Animal studies",
        summary: "Promotes new synapse formation via HGF/MET receptor pathway. Dramatically reverses cognitive decline in Alzheimer animal models. No human trials. Extremely early research.", sources: ["PMID:22085742"] },
    ],
  },

  {
    id: "igf-1-lr3",
    name: "IGF-1 LR3",
    aliases: ["IGF-1 LR3","Long R3 IGF-1","insulin-like growth factor LR3"],
    tier: 4, safety: 1, legal: "Research compound. Banned in competitive sport.", cost: "$100-$400/month",
    dosage: { amount: "20-100mcg/day (subcutaneous) - research dosing only", timing: "Post-workout or upon waking", note: "EXTREME RISK. Promotes growth of all tissues equally - including cancer cells. Risk of tumor promotion in those with pre-existing cancer. Causes severe hypoglycemia. Not recommended." },
    interactions: ["Insulin (severe hypoglycemia risk)"],
    effects: [
      { goal: "force",    efficacy: 5, evidence: 1, studies: 2, type: "Animal studies",
        summary: "Direct anabolic signaling via IGF-1 receptors in muscle. Dramatic muscle growth in animal studies. Enormous risk profile in humans - not recommended for supplementation.", sources: [] },
    ],
  },

  {
    id: "pegmgf",
    name: "PEG-MGF (Mechano Growth Factor)",
    aliases: ["PEG-MGF","pegylated mechano growth factor","MGF"],
    tier: 4, safety: 1, legal: "Research compound. Banned in sport.", cost: "$100-$400/month",
    dosage: { amount: "200mcg 2x/week post-exercise (research dosing)", timing: "Post-workout", note: "IGF-1 splice variant specifically activated by muscle damage. PEGylation extends half-life from minutes to days. Research compound only - no human safety data." },
    interactions: [],
    effects: [
      { goal: "recovery", efficacy: 3, evidence: 1, studies: 1, type: "Animal studies",
        summary: "Activates muscle stem cells (satellite cells) for rapid repair after mechanical damage. Particularly interesting for injury recovery. Only animal data available.", sources: ["PMID:12634816"] },
    ],
  },

  // ── HORMONE-RELATED ───────────────────────────────────────────────────────

  {
    id: "pregnenolone",
    name: "Pregnenolone",
    aliases: ["pregnenolone","prasterone","pregnen-3beta-ol-20-one"],
    tier: 3, safety: 2, legal: "OTC in USA. Prescription required in most EU countries.", cost: "$20-$40/month",
    dosage: { amount: "10-50mg/day", timing: "Morning with food. Start low and titrate.", note: "Master neurosteroid and hormone precursor. Converts to DHEA, progesterone, testosterone, cortisol and estrogen. Blood testing strongly recommended. Effects highly individual." },
    interactions: ["Hormone therapies", "Estrogen receptor positive cancers (contraindicated)"],
    effects: [
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Neurosteroid with memory-enhancing effects. Highest concentration in brain. Improves working memory in small RCTs.", sources: ["PMID:7774210"] },
      { goal: "mood",     efficacy: 3, evidence: 2, studies: 8, type: "RCT",
        summary: "Modulates GABA and NMDA receptors. Mood improvement reported in bipolar depression trials.", sources: [] },
    ],
  },

  {
    id: "progesterone",
    name: "Progesterone (Bioidentical)",
    aliases: ["progesterone","natural progesterone","bioidentical progesterone","prometrium"],
    tier: 3, safety: 3, legal: "Prescription in most countries. OTC as cream in USA.", cost: "$20-$60/month",
    dosage: { amount: "25-200mg/day (topical or oral)", timing: "Evening (sedating)", note: "Bioidentical progesterone is different from synthetic progestins (which carry higher risks). Often used by women in perimenopause. Men may use low doses for neuroprotection." },
    interactions: ["Other hormone therapies"],
    effects: [
      { goal: "sleep",    efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Metabolite allopregnanolone has strong GABA-A receptor activity. Significantly improves sleep quality, particularly in perimenopausal women.", sources: ["PMID:16942638"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Reduces anxiety and promotes calming via GABA receptor modulation. Improves mood in women with progesterone deficiency.", sources: [] },
    ],
  },

  // ── SLEEP AND RELAXATION ──────────────────────────────────────────────────

  {
    id: "valerian-root",
    name: "Valerian Root",
    aliases: ["valerian","valeriana officinalis","valerian root extract"],
    tier: 1, safety: 4, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "300-600mg 30 min before sleep", timing: "30-60 min before bedtime", note: "Effects may take 2-4 weeks of consistent use. Smell is distinctly unpleasant. Avoid abrupt discontinuation after prolonged use." },
    interactions: ["Sedatives and alcohol (additive)", "CNS depressants"],
    effects: [
      { goal: "sleep",    efficacy: 3, evidence: 3, studies: 25, type: "Meta-analyses",
        summary: "Reduces sleep latency and improves sleep quality via GABA modulation. Meta-analysis of 16 studies: positive but heterogeneous results. Best for mild insomnia.", sources: ["PMID:16879982"] },
    ],
  },

  {
    id: "passionflower",
    name: "Passionflower",
    aliases: ["passionflower","passiflora incarnata","maypop","passion flower"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$8-$15/month",
    dosage: { amount: "250-500mg extract or 1-2 cups tea", timing: "Evening or 30-60 min before bed", note: "Chrysin content contributes to anxiolytic effects. Well-tolerated. Can be combined with valerian and lemon balm." },
    interactions: ["Sedatives (mild additive)"],
    effects: [
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Comparable to low-dose oxazepam for generalized anxiety disorder in one RCT. GABA-A modulation via chrysin and other flavonoids.", sources: ["PMID:11679026"] },
      { goal: "sleep",    efficacy: 3, evidence: 3, studies: 8, type: "RCT",
        summary: "Improves sleep quality as measured by sleep diary. Reduces nighttime waking.", sources: ["PMID:21294203"] },
    ],
  },

  {
    id: "lemon-balm",
    name: "Lemon Balm",
    aliases: ["lemon balm","melissa officinalis","melissa","rosmarinic acid"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$8-$15/month",
    dosage: { amount: "300-900mg/day (standardized extract)", timing: "With food. Split doses. Evening emphasis.", note: "Inhibits GABA transaminase, increasing GABA availability. Works well combined with valerian for sleep." },
    interactions: ["Sedatives (mild additive)","Thyroid medications (may reduce thyroid hormones)"],
    effects: [
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Reduces stress and anxiety via GABA transaminase inhibition. Multiple RCTs confirm anxiolytic effects at 300-900mg.", sources: ["PMID:11679026"] },
      { goal: "sleep",    efficacy: 2, evidence: 2, studies: 5, type: "RCT",
        summary: "Modest sleep quality improvement, best combined with valerian root.", sources: [] },
    ],
  },

  {
    id: "magnolia-bark",
    name: "Magnolia Bark",
    aliases: ["magnolia bark","magnolia officinalis","honokiol","magnolol","relora"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "200-400mg/day (standardized to honokiol and magnolol)", timing: "Evening or split AM/PM", note: "Honokiol and magnolol are the active compounds. Relora is a proprietary blend of magnolia and phellodendron. Cortisol-lowering effects documented." },
    interactions: ["CNS depressants (mild additive)"],
    effects: [
      { goal: "stress",   efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Reduces cortisol and perceived stress. Relora blend RCT showed 18% reduction in salivary cortisol.", sources: ["PMID:23760477"] },
      { goal: "sleep",    efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Reduces anxiety-related sleep disruption. GABA-A modulator. Reduces sleep latency.", sources: [] },
    ],
  },

  // ── GUT HEALTH ────────────────────────────────────────────────────────────

  {
    id: "l-glutamine",
    name: "L-Glutamine",
    aliases: ["glutamine","L-glutamine","glutamine powder"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "5-20g/day", timing: "Post-workout or on empty stomach. Split doses.", note: "Most abundant amino acid in the body. Conditionally essential under stress or illness. Important for gut mucosal integrity and immune cell fuel." },
    interactions: [],
    effects: [
      { goal: "recovery", efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Reduces muscle soreness and improves recovery from intense training. Reduces upper respiratory infections in athletes during heavy training blocks.", sources: ["PMID:23823502"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Maintains gut mucosal integrity, preventing leaky gut. Reduces intestinal permeability markers. Fuels enterocytes and immune cells.", sources: ["PMID:12691347"] },
    ],
  },

  {
    id: "butyrate",
    name: "Sodium Butyrate",
    aliases: ["butyrate","sodium butyrate","tributyrin","short chain fatty acid","SCFA"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "600mg-3g/day", timing: "With meals. Enteric-coated preferred to avoid smell.", note: "Short-chain fatty acid produced by gut bacteria fermenting fiber. Enteric-coated or tributyrin forms reduce smell and improve lower gut delivery." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 3, studies: 20, type: "RCT",
        summary: "Primary fuel for colonocytes. Reduces intestinal inflammation, improves gut barrier integrity, and epigenetically regulates gene expression via HDAC inhibition.", sources: ["PMID:21558571"] },
      { goal: "mood",     efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Gut-brain axis influence. Animal data shows antidepressant effects. Supports microbiome diversity and reduces neuroinflammation.", sources: [] },
    ],
  },

  {
    id: "betaine",
    name: "Betaine (TMG)",
    aliases: ["betaine","TMG","trimethylglycine","betaine anhydrous"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "2-6g/day in 2 doses", timing: "With meals", note: "Methyl donor supporting homocysteine metabolism. Found naturally in beets, spinach, and quinoa. Important for methylation pathways especially when taking NMN/NR." },
    interactions: [],
    effects: [
      { goal: "force",    efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves power output and endurance. Meta-analysis confirms small but consistent ergogenic effect. Reduces homocysteine and supports creatine synthesis.", sources: ["PMID:23083141"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Reduces homocysteine levels, lowering cardiovascular risk. Supports liver health and methyl group donation for DNA methylation.", sources: ["PMID:17921413"] },
    ],
  },

  // ── CARDIOVASCULAR ────────────────────────────────────────────────────────

  {
    id: "aged-garlic",
    name: "Aged Garlic Extract",
    aliases: ["aged garlic","allicin","garlic extract","Kyolic","S-allylcysteine"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "600-1200mg/day", timing: "With meals", note: "Aged garlic (Kyolic) has reduced odor and improved bioavailability of S-allylcysteine vs raw garlic. Aging process converts allicin to more stable bioactive compounds." },
    interactions: ["Anticoagulants (additive at high doses)"],
    effects: [
      { goal: "cardio",   efficacy: 4, evidence: 4, studies: 40, type: "Meta-analyses",
        summary: "Reduces blood pressure by 5-9mmHg systolic. Reduces LDL and plaque progression. Meta-analysis of 20 trials confirms cardiovascular benefits.", sources: ["PMID:24282276"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Anti-inflammatory and antioxidant. Reduces coronary artery calcium progression in landmark RCT.", sources: ["PMID:27144588"] },
    ],
  },

  {
    id: "hawthorn-berry",
    name: "Hawthorn Berry",
    aliases: ["hawthorn","crataegus monogyna","crataegus extract","WS-1442"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "300-900mg/day (standardized to oligomeric proanthocyanidins)", timing: "With meals. Several weeks for full effect.", note: "WS-1442 is the most studied standardized extract. Well-established herb in European phytomedicine for cardiac support." },
    interactions: ["Digoxin (may potentiate)", "Antihypertensives (additive)"],
    effects: [
      { goal: "cardio",   efficacy: 3, evidence: 4, studies: 25, type: "Meta-analyses",
        summary: "Improves exercise tolerance in chronic heart failure. Reduces blood pressure, improves cardiac output. Cochrane review confirms efficacy for mild heart failure.", sources: ["PMID:18843348"] },
    ],
  },

  {
    id: "olive-leaf-extract",
    name: "Olive Leaf Extract",
    aliases: ["olive leaf","oleuropein","olive leaf extract","olea europaea"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "500-1000mg/day (standardized to oleuropein)", timing: "With meals", note: "Oleuropein is the main active compound. Anti-hypertensive, antiviral, and anti-inflammatory. Mediterranean diet studies may partly explain olive consumption benefits." },
    interactions: ["Antihypertensives (additive)", "Antidiabetics (may lower glucose)"],
    effects: [
      { goal: "cardio",   efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Reduces blood pressure comparable to captopril in one direct comparison RCT. Reduces LDL oxidation and improves arterial function.", sources: ["PMID:21671418"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Anti-inflammatory and antioxidant. Activates AMPK. Reduces inflammatory markers and supports immune function.", sources: ["PMID:23788168"] },
    ],
  },

  // ── ADDITIONAL COGNITIVE ──────────────────────────────────────────────────

  {
    id: "acetyl-l-carnitine",
    name: "Acetyl-L-Carnitine (ALCAR)",
    aliases: ["ALCAR","acetyl-l-carnitine","acetylcarnitine","ALC"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "500-2000mg/day in 2 doses", timing: "Morning and early afternoon (mildly stimulating)", note: "Crosses the blood-brain barrier unlike regular L-carnitine. Best for cognitive effects. Also provides acetyl group for acetylcholine synthesis." },
    interactions: [],
    effects: [
      { goal: "memory",   efficacy: 4, evidence: 4, studies: 25, type: "Meta-analyses",
        summary: "Meta-analysis of 21 trials: significantly improves memory in mild cognitive impairment and early Alzheimer's. Provides mitochondrial support and acetylcholine precursor.", sources: ["PMID:14621119"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Faster antidepressant response than some SSRIs in elderly depression. Meta-analysis confirms antidepressant effects.", sources: ["PMID:29257618"] },
      { goal: "energy",   efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Reduces fatigue in fibromyalgia, multiple sclerosis, and cancer-related fatigue. Improves mitochondrial function.", sources: ["PMID:11750122"] },
    ],
  },

  {
    id: "centrophenoxine",
    name: "Centrophenoxine",
    aliases: ["centrophenoxine","meclofenoxate","lucidril","DMAE ester"],
    tier: 3, safety: 3, legal: "OTC in USA. Prescription in some EU countries.", cost: "$20-$40/month",
    dosage: { amount: "250-500mg/day", timing: "Morning with food", note: "Ester form of DMAE. Better absorbed than DMAE. Removes lipofuscin from neurons. Research dates from 1960s-1990s primarily." },
    interactions: ["Anticholinergic drugs (may counteract)"],
    effects: [
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 8, type: "RCT",
        summary: "Removes lipofuscin accumulation from neurons. Improves memory in elderly subjects. Older research base but consistent results.", sources: ["PMID:6382449"] },
      { goal: "longevity",efficacy: 2, evidence: 2, studies: 5, type: "Animal studies",
        summary: "Extends lifespan in animal models. Anti-aging via lipofuscin removal and mitochondrial protection.", sources: [] },
    ],
  },

  {
    id: "dmae",
    name: "DMAE",
    aliases: ["DMAE","dimethylaminoethanol","deanol"],
    tier: 2, safety: 3, legal: "OTC everywhere", cost: "$10-$25/month",
    dosage: { amount: "100-300mg/day", timing: "Morning with food", note: "Acetylcholine precursor. Mildly stimulating. Contraindicated in epilepsy and mania. Popular as smart drug in 1970s." },
    interactions: ["Anticholinergic medications"],
    effects: [
      { goal: "focus",    efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Improves attention and alertness. Choline precursor for acetylcholine synthesis. FDA approved for ADHD in past (withdrawn for commercial reasons).", sources: [] },
      { goal: "mood",     efficacy: 2, evidence: 2, studies: 4, type: "RCT",
        summary: "Mild mood-brightening effects. Some antidepressant potential.", sources: [] },
    ],
  },

  {
    id: "uridine",
    name: "Uridine Monophosphate",
    aliases: ["uridine","UMP","uridine monophosphate"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "150-300mg/day", timing: "Morning with DHA for synergistic effect", note: "Synergistic with DHA and choline (the 'Wurtman stack'). Increases phosphatidylcholine in neuronal membranes. Often combined with CDP-choline or Alpha-GPC." },
    interactions: [],
    effects: [
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Increases dendritic spine density and synaptic plasticity. Wurtman stack (uridine + DHA + choline) improves cognitive biomarkers in Alzheimer's (Souvenaid trials).", sources: ["PMID:20301012"] },
      { goal: "mood",     efficacy: 3, evidence: 2, studies: 5, type: "RCT",
        summary: "Component in Souvenaid. Dopaminergic effects. Pilot RCT showed antidepressant effects in bipolar depression.", sources: ["PMID:18072816"] },
    ],
  },

  {
    id: "choline-bitartrate",
    name: "Choline Bitartrate",
    aliases: ["choline","choline bitartrate","choline chloride"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$5-$15/month",
    dosage: { amount: "500-2000mg/day", timing: "With meals. Split doses.", note: "Essential nutrient - 90% of people are deficient. Less effective at raising brain acetylcholine than Alpha-GPC or CDP-choline, but much cheaper. Better for general choline status than cognitive enhancement." },
    interactions: [],
    effects: [
      { goal: "memory",   efficacy: 2, evidence: 3, studies: 12, type: "RCT",
        summary: "Essential for acetylcholine synthesis. Population studies show higher choline intake associated with better cognitive function. Less effective than Alpha-GPC for acute cognitive effects.", sources: ["PMID:22071706"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "Observational",
        summary: "Higher choline intake associated with lower all-cause mortality, cardiovascular disease, and dementia risk in large prospective cohort studies.", sources: ["PMID:32668397"] },
    ],
  },

  {
    id: "cdp-choline",
    name: "CDP-Choline (Citicoline)",
    aliases: ["CDP-choline","citicoline","cytidine diphosphocholine"],
    tier: 2, safety: 5, legal: "OTC everywhere (prescription in some EU countries)", cost: "$20-$40/month",
    dosage: { amount: "250-500mg/day", timing: "Morning with food", note: "Provides both choline and cytidine (which converts to uridine). More bioavailable and brain-targeted than choline bitartrate. FDA-approved drug for stroke in Europe." },
    interactions: [],
    effects: [
      { goal: "focus",    efficacy: 4, evidence: 3, studies: 15, type: "RCT",
        summary: "Approved drug in Europe for cognitive recovery post-stroke. Improves attention and working memory in healthy adults. Increases dopamine receptor density.", sources: ["PMID:10416716"] },
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves memory in elderly and post-stroke patients. Supports phosphatidylcholine synthesis in neuronal membranes.", sources: ["PMID:12459919"] },
    ],
  },

  {
    id: "inositol",
    name: "Inositol",
    aliases: ["inositol","myo-inositol","D-chiro-inositol","vitamin B8"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "2-18g/day (high dose for OCD/anxiety)", timing: "With food. Split doses for high dose protocols.", note: "Can be used as powder in food or drinks - large doses require this. Effective for OCD and panic disorder at high doses (12-18g)." },
    interactions: [],
    effects: [
      { goal: "mood",     efficacy: 4, evidence: 3, studies: 12, type: "RCT",
        summary: "Comparable to fluvoxamine for OCD and panic disorder at 18g/day in RCTs. Second messenger in serotonin signaling. Also improves insulin sensitivity.", sources: ["PMID:9169302"] },
      { goal: "hormones", efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Improves insulin sensitivity and PCOS symptoms. D-chiro-inositol reduces testosterone and improves ovulation in PCOS.", sources: ["PMID:9916957"] },
    ],
  },

  // ── ADAPTOGENS CONTINUED ──────────────────────────────────────────────────

  {
    id: "shilajit",
    name: "Shilajit",
    aliases: ["shilajit","mumijo","mumio","salajeet","fulvic acid"],
    tier: 2, safety: 3, legal: "OTC everywhere (beware heavy metal contamination from poor sources)", cost: "$20-$40/month",
    dosage: { amount: "200-500mg/day purified shilajit resin", timing: "Morning in warm water", note: "Traditional Ayurvedic mineral pitch. Rich in fulvic acid and 85+ minerals. Quality and safety varies enormously by source. Only use standardized, tested products. Risk of heavy metal contamination in lower quality products." },
    interactions: [],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 3, studies: 8, type: "RCT",
        summary: "RCT showed 20% increase in testosterone and improved LH levels in healthy men. Also improves sperm quality and count.", sources: ["PMID:26791805"] },
      { goal: "energy",   efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Reduces chronic fatigue. Enhances mitochondrial function via CoQ10 potentiation.", sources: ["PMID:27910808"] },
    ],
  },

  {
    id: "cordyceps",
    name: "Cordyceps",
    aliases: ["cordyceps","cordyceps sinensis","cordyceps militaris","caterpillar fungus"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "1-3g/day (Cordyceps militaris preferred over CS-4)", timing: "Pre-workout or morning", note: "Cordyceps militaris is the cultivated form with consistent cordycepin content. CS-4 is a mycelium extract. Wild Cordyceps sinensis is extremely expensive and less consistent." },
    interactions: [],
    effects: [
      { goal: "endurance",efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Improves VO2max and endurance capacity. Increases ATP production via adenosine activation. Used by Chinese Olympic athletes.", sources: ["PMID:16648789"] },
      { goal: "hormones", efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "May modestly increase testosterone and improve sexual function in elderly men. Traditionally used as aphrodisiac.", sources: [] },
    ],
  },

  {
    id: "reishi-mushroom",
    name: "Reishi Mushroom",
    aliases: ["reishi","ganoderma lucidum","lingzhi","ganoderma"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "1.5-9g/day dried mushroom equivalent", timing: "With food", note: "Fruiting body extract superior to mycelium. Dual extraction (water + alcohol) needed to capture both beta-glucans and triterpenoids. Bitter taste from triterpenoids is a quality marker." },
    interactions: ["Anticoagulants (mild)", "Immunosuppressants (counteracts)"],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Immunomodulatory beta-glucans and anti-inflammatory triterpenoids. Adaptogenic. Clinical evidence for improved immune markers and antifatigue properties.", sources: ["PMID:19367670"] },
      { goal: "stress",   efficacy: 3, evidence: 2, studies: 8, type: "RCT",
        summary: "Reduces fatigue and improves quality of life in cancer patients. Anxiolytic properties via modulation of HPA axis.", sources: ["PMID:22161545"] },
    ],
  },

  {
    id: "chaga-mushroom",
    name: "Chaga Mushroom",
    aliases: ["chaga","inonotus obliquus","birch mushroom","chaga tea"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$15-$25/month",
    dosage: { amount: "1-3g/day (powder or extract)", timing: "As tea or with meals", note: "Rich in betulinic acid and melanin complexes from birch trees. Very high ORAC antioxidant score. Wild harvested or sustainably cultivated." },
    interactions: ["Anticoagulants (mild)", "Antidiabetics (may lower glucose)"],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 2, studies: 8, type: "Preclinical + observational",
        summary: "Potent antioxidant. Anti-cancer and anti-inflammatory properties in preclinical studies. Traditional use in Eastern Europe for centuries.", sources: ["PMID:20590759"] },
    ],
  },

  {
    id: "turkey-tail",
    name: "Turkey Tail Mushroom",
    aliases: ["turkey tail","coriolus versicolor","PSK","PSP","trametes versicolor"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "1-3g/day extract (PSK form 3g for immune support)", timing: "With food", note: "PSK (Krestin) is the most studied extract, approved in Japan as a cancer adjunct drug. Most studied medicinal mushroom for immune function." },
    interactions: ["Immunosuppressants (may counteract)"],
    effects: [
      { goal: "longevity",efficacy: 4, evidence: 4, studies: 30, type: "RCT",
        summary: "PSK (proprietary extract) approved in Japan as cancer adjunct therapy. Meta-analyses confirm improved survival and immune function. Prebiotic effects on gut microbiome.", sources: ["PMID:11977909"] },
    ],
  },

  // ── MISCELLANEOUS ─────────────────────────────────────────────────────────

  {
    id: "ergothioneine",
    name: "Ergothioneine",
    aliases: ["ergothioneine","ERGO","histidine betaine"],
    tier: 3, safety: 5, legal: "OTC (novel food status in EU)", cost: "$30-$80/month",
    dosage: { amount: "5-25mg/day", timing: "With food", note: "Unique antioxidant that accumulates specifically in high-stress tissues (mitochondria, eyes, liver, bone marrow). Cannot be synthesized by mammals - must come from diet (mostly mushrooms) or supplements." },
    interactions: [],
    effects: [
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 10, type: "Observational + mechanistic",
        summary: "Blood ergothioneine levels inversely associated with frailty and cardiovascular mortality. Specialized antioxidant protecting mitochondria and high-turnover cells.", sources: ["PMID:33378951"] },
      { goal: "memory",   efficacy: 2, evidence: 2, studies: 4, type: "Observational",
        summary: "Higher plasma ergothioneine associated with lower risk of cognitive decline and dementia.", sources: [] },
    ],
  },

  {
    id: "plasmalogens",
    name: "Plasmalogens",
    aliases: ["plasmalogens","scallop-derived plasmalogen","PPI","vinyl ether lipids"],
    tier: 3, safety: 4, legal: "OTC (novel compound, Japan-approved nutraceutical)", cost: "$60-$150/month",
    dosage: { amount: "1mg/day (scallop-derived)", timing: "Morning with food", note: "Specialized ether phospholipids that form 20% of myelin sheath. Decline significantly with aging and in Alzheimer's. Japanese studies most extensive." },
    interactions: [],
    effects: [
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 5, type: "RCT",
        summary: "Japanese RCT in mild Alzheimer's showed significant cognitive improvement vs placebo. Restores plasmalogen levels in myelin and neuronal membranes.", sources: ["PMID:24549503"] },
    ],
  },

  {
    id: "pqq",
    name: "PQQ (Pyrroloquinoline Quinone)",
    aliases: ["PQQ","pyrroloquinoline quinone","methoxatin"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$25-$50/month",
    dosage: { amount: "10-20mg/day", timing: "Morning with CoQ10 for synergistic effect", note: "Promotes mitochondrial biogenesis (creation of new mitochondria). Best combined with CoQ10. Found in natto, kiwi, and breast milk in small amounts." },
    interactions: [],
    effects: [
      { goal: "energy",   efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Promotes mitochondrial biogenesis via PGC-1alpha activation. Improves energy metabolism and reduces fatigue. RCT showed improved sleep and reduced fatigue in middle-aged adults.", sources: ["PMID:23) 78698"] },
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Combined with CoQ10, shows improved cognitive function in older adults. Neuroprotective via mitochondrial support.", sources: [] },
    ],
  },

  {
    id: "kava",
    name: "Kava Kava",
    aliases: ["kava","piper methysticum","kavalactones","kava root"],
    tier: 2, safety: 2, legal: "OTC in most countries. Banned in some EU countries. Restricted in Canada.", cost: "$15-$30/month",
    dosage: { amount: "70-250mg kavalactones/day", timing: "Evening, not with meals or alcohol", note: "Do not consume alcohol with kava - hepatotoxicity risk increases. Use noble kava varieties (not tudei/two-day kava). Limit to 3 months continuous use." },
    interactions: ["Alcohol (liver toxicity)", "Benzodiazepines (potentiates)", "Hepatotoxic medications"],
    effects: [
      { goal: "stress",   efficacy: 4, evidence: 4, studies: 20, type: "Meta-analyses",
        summary: "Strong anxiolytic effects comparable to benzodiazepines in multiple meta-analyses. Cochrane review confirms significant anxiety reduction. Modulates GABA-A receptors and dopamine pathway.", sources: ["PMID:12633575"] },
      { goal: "sleep",    efficacy: 3, evidence: 3, studies: 10, type: "RCT",
        summary: "Reduces anxiety-related sleep disruption. Improves sleep quality without next-day sedation at appropriate doses.", sources: [] },
    ],
  },

  {
    id: "sulbutiamine",
    name: "Sulbutiamine",
    aliases: ["sulbutiamine","arcalion","enerion","bisibuthiamine"],
    tier: 3, safety: 3, legal: "Prescription in France. OTC in USA.", cost: "$15-$30/month",
    dosage: { amount: "400-600mg/day", timing: "Morning, not in evenings (stimulating)", note: "Fat-soluble thiamine (B1) analogue that crosses blood-brain barrier much better. Cycle: 5 days ON, 2 days OFF. Tolerance builds within weeks." },
    interactions: ["Do not combine with central stimulants"],
    effects: [
      { goal: "energy",   efficacy: 3, evidence: 2, studies: 6, type: "RCT",
        summary: "Significantly reduces fatigue and psychomotor impairment. Clinical trials in chronic fatigue syndrome and asthenia show consistent improvement.", sources: ["PMID:12417148"] },
      { goal: "focus",    efficacy: 3, evidence: 2, studies: 4, type: "RCT",
        summary: "Improves attention and reduces reaction times. Dopaminergic enhancement in limbic system.", sources: [] },
    ],
  },

  {
    id: "saffron",
    name: "Saffron",
    aliases: ["saffron","crocus sativus","crocin","safranal"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "30mg/day standardized extract (equivalent to ~1/2 teaspoon saffron)", timing: "With food", note: "Small therapeutic dose needed. Affron is the most studied proprietary extract. Effective at very low doses - one of the most potent natural antidepressants." },
    interactions: ["SSRIs (possible serotonin potentiation at high dose)"],
    effects: [
      { goal: "mood",     efficacy: 4, evidence: 4, studies: 15, type: "Meta-analyses",
        summary: "Meta-analysis of 23 studies: saffron as effective as SSRIs and SNRIs for mild-moderate depression with fewer side effects. Also effective for PMS symptoms.", sources: ["PMID:25384672"] },
      { goal: "memory",   efficacy: 3, evidence: 3, studies: 6, type: "RCT",
        summary: "Improves memory in Alzheimer's patients comparable to donepezil in 22-week RCT. Reduces beta-amyloid aggregation.", sources: ["PMID:20688474"] },
    ],
  },

  {
    id: "st-johns-wort",
    name: "St. John's Wort",
    aliases: ["st johns wort","hypericum perforatum","hyperforin","hypericin"],
    tier: 1, safety: 3, legal: "OTC everywhere. Multiple drug interactions - check carefully.", cost: "$10-$20/month",
    dosage: { amount: "300mg standardized extract (0.3% hypericin) 3x/day", timing: "With meals", note: "Potent CYP3A4 inducer - significantly reduces blood levels of MANY medications including birth control, HIV drugs, antidepressants, and anticoagulants. Check all medications before using." },
    interactions: ["MANY MEDICATIONS - strong CYP3A4 inducer", "SSRIs (serotonin syndrome)", "Birth control pills (reduces effectiveness)", "Anticoagulants", "HIV medications", "Cyclosporine"],
    effects: [
      { goal: "mood",     efficacy: 4, evidence: 5, studies: 70, type: "Meta-analyses Cochrane",
        summary: "Cochrane review (29 RCTs): superior to placebo and comparable to standard antidepressants for mild-moderate depression, with fewer side effects. Strong evidence base.", sources: ["PMID:18607959"] },
    ],
  },

  {
    id: "agmatine",
    name: "Agmatine Sulfate",
    aliases: ["agmatine","agmatine sulfate","agmatine decarboxylated arginine"],
    tier: 2, safety: 3, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "500-2000mg/day", timing: "On empty stomach, split 1-2x daily", note: "Arginine metabolite with interesting neuropathic pain and mood effects. Also potentiates opioids while reducing tolerance - used in opioid withdrawal support." },
    interactions: ["Opioids (complex interaction)", "MAOIs", "SSRIs"],
    effects: [
      { goal: "mood",     efficacy: 3, evidence: 2, studies: 5, type: "Case reports + pilot",
        summary: "Dramatic antidepressant effects in case series and small studies. Modulates NMDA, imidazoline receptors, and NOS. Unique mechanism distinct from all other antidepressants.", sources: ["PMID:26980146"] },
      { goal: "recovery", efficacy: 2, evidence: 2, studies: 4, type: "RCT",
        summary: "Reduces neuropathic pain via NMDA antagonism and nitric oxide modulation.", sources: [] },
    ],
  },

  {
    id: "cistanche",
    name: "Cistanche Tubulosa",
    aliases: ["cistanche","cistanche tubulosa","rou cong rong","desert hyacinth"],
    tier: 2, safety: 4, legal: "OTC everywhere", cost: "$20-$40/month",
    dosage: { amount: "300-600mg/day standardized extract", timing: "Morning with food", note: "Traditional Chinese herb used for centuries as tonic. Contains echinacosides and acteoside as primary actives. Multiple effects on testosterone, cognition, and longevity." },
    interactions: [],
    effects: [
      { goal: "hormones", efficacy: 3, evidence: 2, studies: 5, type: "RCT",
        summary: "Increases testosterone via upregulation of StAR protein in Leydig cells. Improves sexual function and fertility markers.", sources: ["PMID:16870282"] },
      { goal: "memory",   efficacy: 3, evidence: 2, studies: 4, type: "RCT",
        summary: "Improves cognitive function and memory in elderly. Anti-inflammatory effects in the brain via NFkB pathway.", sources: [] },
    ],
  },

  {
    id: "pine-pollen",
    name: "Pine Pollen",
    aliases: ["pine pollen","pinus sylvestris pollen","pine pollen tincture"],
    tier: 3, safety: 3, legal: "OTC everywhere", cost: "$15-$30/month",
    dosage: { amount: "1-3g/day powder or 1-2ml tincture", timing: "Morning", note: "Contains phytoandrogens (testosterone, androstenedione, DHEA) in small amounts. Tincture form may deliver androgens better than powder (bypasses gut metabolism). Effect on testosterone modest." },
    interactions: [],
    effects: [
      { goal: "hormones", efficacy: 2, evidence: 1, studies: 2, type: "Preliminary + anecdotal",
        summary: "Contains small amounts of natural testosterone and androstenedione. Anecdotal reports of modest testosterone support. Limited clinical data.", sources: [] },
    ],
  },

  {
    id: "zeolite",
    name: "Zeolite (Clinoptilolite)",
    aliases: ["zeolite","clinoptilolite","zeolite clay","zeo health"],
    tier: 2, safety: 4, legal: "OTC everywhere (food-grade)", cost: "$15-$30/month",
    dosage: { amount: "1-3g/day", timing: "Between meals (adsorbs toxins in gut)", note: "Natural volcanic mineral with ion exchange properties. Used for heavy metal detoxification and gut health. Take 2 hours away from medications and supplements as it may adsorb them." },
    interactions: ["All supplements and medications (take 2+ hours apart - adsorbs them)"],
    effects: [
      { goal: "longevity",efficacy: 2, evidence: 2, studies: 8, type: "RCT",
        summary: "Reduces heavy metal load (lead, cadmium, arsenic) in controlled trials. Improves gut barrier integrity. Antioxidant effects via free radical trapping.", sources: ["PMID:16019562"] },
    ],
  },


  // ── GLP-1 / WEIGHT LOSS PEPTIDES ─────────────────────────────────────────

  {
    id: "semaglutide",
    name: "Semaglutide (Ozempic / Wegovy)",
    aliases: ["semaglutide","ozempic","wegovy","GLP-1","rybelsus"],
    tier: 4, safety: 2, legal: "FDA-approved prescription drug. Not legal to obtain without prescription.", cost: "$800-$1500/month (brand) or $100-$300/month (compounded)",
    dosage: { amount: "0.25-2.4mg/week subcutaneous (weight loss protocol)", timing: "Weekly injection, same day each week", note: "Start at 0.25mg/week and titrate slowly over 16-20 weeks to minimize GI side effects. Compounded versions are significantly cheaper but less regulated." },
    interactions: ["Insulin and antidiabetics (severe hypoglycemia risk)", "Oral medications (absorption delay)"],
    effects: [
      { goal: "weight",   efficacy: 5, evidence: 5, studies: 80, type: "Phase III RCT",
        summary: "STEP trials: 15-17% body weight reduction over 68 weeks vs 2-3% placebo. FDA-approved for chronic weight management. Most effective pharmacological weight loss agent ever approved.", sources: ["PMID:34879163","PMID:33567185"] },
      { goal: "cardio",   efficacy: 4, evidence: 5, studies: 40, type: "RCT",
        summary: "SELECT trial: 20% reduction in major cardiovascular events in non-diabetic obese patients. Significant cardiovascular protection beyond weight loss alone.", sources: ["PMID:37952131"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Reduces inflammation, improves metabolic markers, liver fat reduction. Emerging data on neuroprotection and kidney disease.", sources: ["PMID:34879163"] },
    ],
  },

  {
    id: "tirzepatide",
    name: "Tirzepatide (Mounjaro / Zepbound)",
    aliases: ["tirzepatide","mounjaro","zepbound","GIP/GLP-1","twincretin"],
    tier: 4, safety: 2, legal: "FDA-approved prescription drug. Not legal to obtain without prescription.", cost: "$900-$1600/month (brand) or $150-$400/month (compounded)",
    dosage: { amount: "2.5-15mg/week subcutaneous", timing: "Weekly injection, same day each week", note: "Dual GIP/GLP-1 agonist. Titrate from 2.5mg over 20 weeks. Currently the most effective approved weight loss drug available." },
    interactions: ["Insulin and antidiabetics (hypoglycemia risk)", "Oral medications (absorption delay)"],
    effects: [
      { goal: "weight",   efficacy: 5, evidence: 5, studies: 50, type: "Phase III RCT",
        summary: "SURMOUNT-1 trial: up to 22.5% body weight reduction. Surpasses semaglutide in head-to-head comparisons. Currently the most effective approved weight loss medication.", sources: ["PMID:35658024"] },
      { goal: "cardio",   efficacy: 4, evidence: 4, studies: 20, type: "RCT",
        summary: "SURPASS-CVOT trial ongoing. Significant improvements in cardiometabolic markers including blood pressure, lipids, and glycemic control.", sources: ["PMID:35658024"] },
    ],
  },

  {
    id: "retatrutide",
    name: "Retatrutide",
    aliases: ["retatrutide","LY3437943","GLP-1/GIP/glucagon triple agonist"],
    tier: 4, safety: 2, legal: "Phase III clinical trials. Not yet FDA-approved. Research compound.", cost: "Not commercially available",
    dosage: { amount: "Phase II: 4-12mg/week subcutaneous", timing: "Weekly injection", note: "Triple agonist (GLP-1, GIP, glucagon). Phase II data shows unprecedented weight loss. Not yet available commercially." },
    interactions: [],
    effects: [
      { goal: "weight",   efficacy: 5, evidence: 2, studies: 3, type: "Phase II RCT",
        summary: "Phase II trial: up to 24.2% body weight reduction at 48 weeks - exceeding all existing approved agents. Triple mechanism may provide superior efficacy. Phase III ongoing.", sources: ["PMID:37557886"] },
    ],
  },

  {
    id: "cagrilintide",
    name: "Cagrilintide",
    aliases: ["cagrilintide","amylin analogue","CagriSema"],
    tier: 4, safety: 2, legal: "Phase III clinical trials with semaglutide (CagriSema). Not yet approved.", cost: "Not commercially available",
    dosage: { amount: "2.4mg/week subcutaneous (in CagriSema combination)", timing: "Weekly injection combined with semaglutide", note: "Long-acting amylin analogue. Being developed as fixed-dose combination with semaglutide (CagriSema). Phase III showing strong results." },
    interactions: [],
    effects: [
      { goal: "weight",   efficacy: 4, evidence: 2, studies: 3, type: "Phase II/III RCT",
        summary: "REDEFINE trial (CagriSema combination): up to 22.7% weight loss at 68 weeks. Amylin pathway complements GLP-1 mechanism for additive weight reduction.", sources: ["PMID:36669562"] },
    ],
  },

  {
    id: "mazdutide",
    name: "Mazdutide (IBI362)",
    aliases: ["mazdutide","IBI362","GLP-1/glucagon dual agonist"],
    tier: 4, safety: 2, legal: "Phase III in China. Not approved outside China. Research compound in most countries.", cost: "Not commercially available outside China",
    dosage: { amount: "3-9mg/week subcutaneous", timing: "Weekly injection", note: "Dual GLP-1/glucagon agonist developed in China. Phase III data promising. Limited English-language literature." },
    interactions: [],
    effects: [
      { goal: "weight",   efficacy: 4, evidence: 2, studies: 3, type: "Phase II/III RCT",
        summary: "Phase II: 11.3% weight reduction at 24 weeks. Glucagon component adds thermogenic effect to GLP-1 appetite suppression. Phase III ongoing in China.", sources: [] },
    ],
  },

  // ── HAIR HEALTH ───────────────────────────────────────────────────────────

  {
    id: "finasteride",
    name: "Finasteride (Propecia)",
    aliases: ["finasteride","propecia","proscar","5-alpha reductase inhibitor"],
    tier: 3, safety: 2, legal: "FDA-approved prescription drug for male pattern baldness and BPH.", cost: "$10-$50/month (generic)",
    dosage: { amount: "1mg/day oral (hair loss) or 5mg/day (BPH)", timing: "Daily at any time", note: "5-alpha reductase inhibitor. Reduces DHT by 70%. Risk of sexual side effects in 1-2% of men (some potentially persistent - Post-Finasteride Syndrome). Blood test recommended before starting." },
    interactions: ["PSA tests (reduces PSA levels - inform your doctor)", "Other 5-alpha reductase inhibitors"],
    effects: [
      { goal: "hair",     efficacy: 4, evidence: 5, studies: 60, type: "RCT + Meta-analyses",
        summary: "FDA-approved for male pattern baldness. RCTs show 83% of men maintain or improve hair count vs 28% placebo after 2 years. Most evidence-backed pharmacological hair loss treatment.", sources: ["PMID:9777765","PMID:12196747"] },
    ],
  },

  {
    id: "minoxidil",
    name: "Minoxidil",
    aliases: ["minoxidil","rogaine","regaine","minoxidil foam","oral minoxidil"],
    tier: 2, safety: 3, legal: "OTC topical everywhere. Oral requires prescription in most countries.", cost: "$10-$30/month (topical) or $15-$40/month (oral)",
    dosage: { amount: "Topical: 5% solution/foam 1ml twice daily. Oral: 0.625-5mg/day", timing: "Topical: morning and evening on dry scalp. Oral: once daily.", note: "Vasodilator mechanism. Oral minoxidil at low doses (0.25-1.25mg) is increasingly popular as highly effective alternative to topical. Requires 6-12 months to see results." },
    interactions: ["Antihypertensives (additive blood pressure lowering)", "Topical retinoids may increase absorption"],
    effects: [
      { goal: "hair",     efficacy: 4, evidence: 5, studies: 50, type: "RCT + Meta-analyses",
        summary: "FDA-approved for androgenetic alopecia in men and women. 5% topical superior to 2%. Oral minoxidil meta-analysis shows equivalent or superior efficacy to topical at low doses.", sources: ["PMID:15304185","PMID:34822175"] },
    ],
  },

  {
    id: "pyrilutamide",
    name: "Pyrilutamide (KX-826)",
    aliases: ["pyrilutamide","KX-826","androgen receptor inhibitor topical"],
    tier: 4, safety: 3, legal: "Phase III in China and USA. Not yet approved anywhere.", cost: "Not commercially available",
    dosage: { amount: "0.5% topical solution once daily (in trials)", timing: "Applied to scalp daily", note: "Topical androgen receptor antagonist. Selectively blocks DHT at the hair follicle without systemic 5-AR inhibition. Promising Phase III data. Potential to replace finasteride with fewer side effects." },
    interactions: [],
    effects: [
      { goal: "hair",     efficacy: 4, evidence: 2, studies: 3, type: "Phase II/III RCT",
        summary: "Phase II: significantly superior hair count vs placebo at 24 weeks. Phase III ongoing. Local mechanism minimizes systemic side effects seen with finasteride.", sources: [] },
    ],
  },

  {
    id: "ru-58841",
    name: "RU-58841",
    aliases: ["RU-58841","RU58841","PSK-3841","HMR-3841"],
    tier: 4, safety: 1, legal: "Research compound. Not approved anywhere. Sold as research chemical.", cost: "$30-$80/month",
    dosage: { amount: "50mg/day topical (research dosing)", timing: "Applied to scalp once daily", note: "EXTREME CAUTION: Research chemical never studied in human clinical trials for safety. Potential systemic absorption. No long-term safety data exists. Some researchers report cardiac side effects." },
    interactions: [],
    effects: [
      { goal: "hair",     efficacy: 3, evidence: 1, studies: 1, type: "Animal studies + anecdotal",
        summary: "Potent topical androgen receptor antagonist. Stump-tailed macaque studies showed strong hair regrowth. No human clinical trial data. Widely used in biohacking community despite complete absence of human safety data.", sources: ["PMID:10189788"] },
    ],
  },

  // ── LIVER / DETOX ─────────────────────────────────────────────────────────

  {
    id: "tudca",
    name: "TUDCA (Tauroursodeoxycholic Acid)",
    aliases: ["TUDCA","tauroursodeoxycholic acid","bile acid","taurine ursodeoxycholic"],
    tier: 2, safety: 4, legal: "OTC in most countries. Prescription drug in some EU countries for liver disease.", cost: "$30-$60/month",
    dosage: { amount: "250-1000mg/day", timing: "With meals. Split 2-3x/day for higher doses.", note: "Bile acid with potent hepatoprotective properties. Used clinically for cholestatic liver disease. Popular in biohacking and bodybuilding for liver protection during oral steroid use." },
    interactions: ["Oral medications (may reduce absorption - take 2h apart)", "Antidiabetics (may improve insulin sensitivity)"],
    effects: [
      { goal: "liver",    efficacy: 5, evidence: 4, studies: 25, type: "RCT",
        summary: "Approved drug in some countries for primary biliary cholangitis. Significantly reduces liver enzymes (ALT/AST), improves bile flow, and protects hepatocytes from apoptosis. Strong evidence for NAFLD and liver protection.", sources: ["PMID:25956834","PMID:32044390"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "ER stress reduction and mitochondrial protection. Anti-apoptotic effects in multiple tissues. Emerging data on neuroprotection and metabolic health.", sources: ["PMID:32044390"] },
    ],
  },

  {
    id: "milk-thistle",
    name: "Milk Thistle (Silymarin)",
    aliases: ["milk thistle","silymarin","silybum marianum","silibinin","silybin"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$8-$20/month",
    dosage: { amount: "420-600mg/day standardized extract (70-80% silymarin)", timing: "With meals, split 3x/day", note: "Silymarin is the active flavonoid complex. Most studied hepatoprotective herb. Phosphatidylcholine-bound form (silybin-phosphatidylcholine) has 4-5x better bioavailability." },
    interactions: ["CYP450 substrates (mild inhibition at high doses)", "Anticoagulants (mild interaction)"],
    effects: [
      { goal: "liver",    efficacy: 4, evidence: 4, studies: 40, type: "Meta-analyses",
        summary: "Meta-analysis confirms significant reduction in ALT, AST, and GGT in liver disease patients. Antioxidant, anti-inflammatory, and antifibrotic properties. Most used liver supplement worldwide.", sources: ["PMID:22920804","PMID:25163491"] },
      { goal: "longevity",efficacy: 2, evidence: 3, studies: 15, type: "RCT",
        summary: "Antioxidant and anti-inflammatory effects. Reduces oxidative stress markers in diabetic and liver disease patients.", sources: [] },
    ],
  },

  {
    id: "amla",
    name: "Amla (Indian Gooseberry)",
    aliases: ["amla","indian gooseberry","emblica officinalis","phyllanthus emblica","amalaki"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "500-3000mg/day standardized extract", timing: "With meals", note: "Richest natural source of vitamin C (20x more than oranges by weight). Also contains tannins and polyphenols with independent antioxidant activity. Traditional Ayurvedic rasayana." },
    interactions: ["Anticoagulants (vitamin C at high doses may affect)"],
    effects: [
      { goal: "liver",    efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Reduces liver enzymes and hepatic fat. Anti-fibrotic effects in NAFLD. Protects against drug-induced liver toxicity in animal models with some human data.", sources: ["PMID:21671579"] },
      { goal: "cardio",   efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Reduces LDL, total cholesterol, and triglycerides in multiple RCTs. Improves endothelial function. May be as effective as statin drugs for cholesterol in some studies.", sources: ["PMID:21671579"] },
      { goal: "longevity",efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Exceptionally high antioxidant capacity. Reduces oxidative stress, inflammation, and glycation markers. Telomere protection in preliminary studies.", sources: [] },
    ],
  },

  // ── PERFORMANCE / SEXUAL HEALTH ───────────────────────────────────────────

  {
    id: "tadalafil",
    name: "Tadalafil (Cialis)",
    aliases: ["tadalafil","cialis","adcirca","PDE5 inhibitor"],
    tier: 3, safety: 3, legal: "FDA-approved prescription drug. Generic available OTC in some countries.", cost: "$10-$60/month (generic)",
    dosage: { amount: "5mg/day (daily dosing) or 10-20mg as needed", timing: "Daily: same time each day. As needed: 30-60 min before activity.", note: "Longest-acting PDE5 inhibitor (36hr). Daily low-dose protocol increasingly used for cardiovascular, athletic, and general health benefits beyond sexual function." },
    interactions: ["Nitrates (life-threatening hypotension - absolute contraindication)", "Antihypertensives (additive)", "Alpha-blockers"],
    effects: [
      { goal: "hormones", efficacy: 4, evidence: 5, studies: 60, type: "RCT + Meta-analyses",
        summary: "FDA-approved for erectile dysfunction. Improves sexual function via PDE5 inhibition and nitric oxide enhancement. Meta-analysis confirms superiority to other PDE5 inhibitors for 36hr window.", sources: ["PMID:15177095"] },
      { goal: "cardio",   efficacy: 3, evidence: 3, studies: 20, type: "RCT",
        summary: "Improves endothelial function, reduces pulmonary arterial pressure, and has emerging data for cardiovascular protection. Daily dosing reduces cardiovascular event risk in some populations.", sources: ["PMID:22948093"] },
      { goal: "recovery", efficacy: 2, evidence: 2, studies: 8, type: "RCT",
        summary: "Emerging data on improved muscle oxygenation and nutrient delivery during exercise. Some studies show modest ergogenic effects.", sources: [] },
    ],
  },

  {
    id: "hcg",
    name: "HCG (Human Chorionic Gonadotropin)",
    aliases: ["HCG","human chorionic gonadotropin","pregnyl","novarel","gonadotropin"],
    tier: 4, safety: 2, legal: "FDA-approved prescription drug. Banned by FDA as OTC in 2020. Requires prescription.", cost: "$50-$200/month",
    dosage: { amount: "250-500 IU every other day subcutaneous (TRT adjunct)", timing: "Every other day injections", note: "Mimics LH, stimulating testicular testosterone and maintaining fertility during TRT. Required prescription since 2020 FDA OTC ban. Used off-label for PCT and fertility." },
    interactions: ["Testosterone (used together in TRT protocols)", "Estrogen modulators"],
    effects: [
      { goal: "hormones", efficacy: 4, evidence: 3, studies: 20, type: "RCT",
        summary: "Maintains testicular function, size, and fertility during testosterone replacement therapy. Restores testosterone production post-cycle. FDA-approved for hypogonadism and cryptorchidism.", sources: ["PMID:23268602"] },
    ],
  },

  // ── COGNITION / RUSSIAN PHARMA ────────────────────────────────────────────

  {
    id: "meldonium",
    name: "Meldonium (Mildronate)",
    aliases: ["meldonium","mildronate","MET-88","THP","trimethylhydrazinium propionate"],
    tier: 3, safety: 2, legal: "Approved drug in Latvia, Russia, Ukraine. Not approved in EU or USA. Banned by WADA.", cost: "$15-$40/month",
    dosage: { amount: "500-1000mg/day", timing: "Morning, cycle 4-6 weeks on with breaks", note: "WADA-banned substance. Gained notoriety after Maria Sharapova case. Cardioprotective mechanism via GABA-like action and improved mitochondrial function. Approved drug in Eastern Europe." },
    interactions: ["Vasodilators (additive)", "Anticoagulants"],
    effects: [
      { goal: "energy",   efficacy: 3, evidence: 2, studies: 8, type: "RCT (Eastern European)",
        summary: "Improves exercise tolerance in heart failure patients. Increases endurance and reduces fatigue. Mechanism involves optimizing fatty acid vs glucose metabolism in cardiac and skeletal muscle.", sources: ["PMID:25692791"] },
      { goal: "cardio",   efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "Cardioprotective in ischemia-reperfusion injury. Approved treatment for angina and chronic heart failure in several countries.", sources: ["PMID:25692791"] },
    ],
  },

  {
    id: "fabomotizole",
    name: "Fabomotizole (Afobazole)",
    aliases: ["fabomotizole","afobazole","afobazol","anxiolytic Russia"],
    tier: 3, safety: 4, legal: "OTC in Russia. Not approved in EU or USA. Research compound.", cost: "$10-$25/month",
    dosage: { amount: "10mg 3x/day (30mg/day total)", timing: "With meals, 2-4 week course", note: "Sigma-1 receptor agonist and MT1/MT3 melatonin receptor agonist. Anxiolytic without sedation or dependency risk. Approved OTC drug in Russia. Very clean safety profile in Russian clinical trials." },
    interactions: [],
    effects: [
      { goal: "stress",   efficacy: 3, evidence: 2, studies: 10, type: "RCT (Russian)",
        summary: "Reduces anxiety and irritability without sedation or dependency. Phase III Russian trials showed efficacy comparable to benzodiazepines for generalized anxiety without side effects.", sources: [] },
      { goal: "mood",     efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Modest antidepressant-adjacent effects. Reduces somatic symptoms of anxiety including palpitations and sweating.", sources: [] },
    ],
  },

  {
    id: "pantogam",
    name: "Pantogam (Hopantenic Acid)",
    aliases: ["pantogam","hopantenic acid","pantocalcin","hopa","GABA vitamin B5 derivative"],
    tier: 3, safety: 4, legal: "Approved drug in Russia. Not approved in EU or USA.", cost: "$10-$25/month",
    dosage: { amount: "500-3000mg/day", timing: "Split into 3 doses with meals", note: "Synthetic analogue of GABA and pantothenic acid (B5). Nootropic with anticonvulsant properties. Approved pediatric and adult neurological drug in Russia." },
    interactions: ["Anticonvulsants (additive)", "CNS depressants (mild)"],
    effects: [
      { goal: "focus",    efficacy: 3, evidence: 2, studies: 8, type: "RCT (Russian)",
        summary: "Improves cognitive performance, attention, and mental endurance. Used clinically in Russia for cognitive dysfunction, ADHD, and neurological conditions.", sources: [] },
      { goal: "stress",   efficacy: 2, evidence: 2, studies: 5, type: "RCT",
        summary: "GABA-mimetic effect reduces anxiety without sedation. Anti-stress and mildly neuroprotective properties.", sources: [] },
    ],
  },

  {
    id: "emoxypine",
    name: "Emoxypine (Mexidol)",
    aliases: ["emoxypine","mexidol","mexicor","emoxipine","3-hydroxypyridine"],
    tier: 3, safety: 4, legal: "Approved drug in Russia. Not approved in EU or USA.", cost: "$15-$35/month",
    dosage: { amount: "125-600mg/day", timing: "Split 2-3x daily with meals", note: "Antioxidant anxiolytic. Combination of antioxidant and GABA-A modulator. Used clinically in Russia for acute cerebrovascular accidents, anxiety, and cognitive dysfunction." },
    interactions: ["Benzodiazepines (potentiates)", "Anxiolytics (additive)"],
    effects: [
      { goal: "stress",   efficacy: 3, evidence: 2, studies: 8, type: "RCT (Russian)",
        summary: "Anxiolytic and antioxidant via GABA-A modulation and free radical scavenging. Reduces anxiety with additional neuroprotective properties vs pure GABA modulators.", sources: [] },
      { goal: "longevity",efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Antioxidant effects reduce lipid peroxidation and protect mitochondrial membranes. Used clinically for post-stroke and post-ischemic recovery.", sources: [] },
    ],
  },

  // ── METABOLIC / MISC ──────────────────────────────────────────────────────

  {
    id: "l-ornithine",
    name: "L-Ornithine",
    aliases: ["L-ornithine","ornithine","ornithine HCl","urea cycle"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$10-$20/month",
    dosage: { amount: "2-6g/day", timing: "Before sleep on empty stomach (sleep effects) or pre-workout (performance)", note: "Non-essential amino acid. Key component of the urea cycle - removes ammonia. Sleep quality and growth hormone studies done with 400-800mg. Performance effects at higher doses 2-6g." },
    interactions: [],
    effects: [
      { goal: "sleep",    efficacy: 3, evidence: 3, studies: 8, type: "RCT",
        summary: "400mg ornithine before sleep significantly improves sleep quality and reduces cortisol in Japanese RCT. Reduces stress-related sleep disruption.", sources: ["PMID:24681419"] },
      { goal: "recovery", efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Reduces exercise-induced fatigue via ammonia clearance through urea cycle. Modest improvement in endurance and recovery time.", sources: [] },
    ],
  },

  {
    id: "msm",
    name: "MSM (Methylsulfonylmethane)",
    aliases: ["MSM","methylsulfonylmethane","dimethyl sulfone","DMSO2","organic sulfur"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$8-$15/month",
    dosage: { amount: "1.5-6g/day", timing: "With meals. Split into 2-3 doses.", note: "Organic sulfur compound. Anti-inflammatory and antioxidant. Often combined with glucosamine and chondroitin for joint health. Effects build over 4-6 weeks." },
    interactions: [],
    effects: [
      { goal: "recovery", efficacy: 3, evidence: 3, studies: 15, type: "RCT",
        summary: "Reduces exercise-induced muscle damage, oxidative stress, and joint pain. Multiple RCTs confirm reduction in DOMS markers and improved recovery.", sources: ["PMID:27169225"] },
      { goal: "skin",     efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Improves skin hydration, firmness, and reduces wrinkle depth. Sulfur is essential for collagen and keratin synthesis.", sources: [] },
    ],
  },

  {
    id: "apple-cider-vinegar",
    name: "Apple Cider Vinegar",
    aliases: ["apple cider vinegar","ACV","acetic acid","mother vinegar"],
    tier: 1, safety: 3, legal: "OTC everywhere (food product)", cost: "$3-$8/month",
    dosage: { amount: "1-2 tablespoons (15-30ml) diluted in water, 1-3x/day", timing: "Before meals for glucose effects", note: "Always dilute in water - acetic acid damages tooth enamel and esophagus undiluted. Capsule forms available for convenience. Modest but real effects on blood glucose." },
    interactions: ["Insulin and antidiabetics (may lower glucose further)", "Diuretics (potassium depletion risk at high doses)"],
    effects: [
      { goal: "weight",   efficacy: 2, evidence: 3, studies: 10, type: "RCT",
        summary: "Japanese RCT: 750-1500mg acetic acid/day for 12 weeks reduced body weight by 1.2kg vs placebo. Modest but real effect via satiety and reduced fat accumulation.", sources: ["PMID:19661687"] },
      { goal: "longevity",efficacy: 2, evidence: 2, studies: 8, type: "RCT",
        summary: "Reduces post-meal blood glucose by 20-30% when taken before starchy meals. Improves insulin sensitivity in pre-diabetic patients.", sources: ["PMID:15701823"] },
    ],
  },

  {
    id: "injectable-b12",
    name: "Injectable Vitamin B12 (Methylcobalamin)",
    aliases: ["injectable B12","B12 injection","methylcobalamin injection","cyanocobalamin injection"],
    tier: 2, safety: 4, legal: "Prescription in most EU countries. OTC in USA. Widely available online.", cost: "$20-$50/month",
    dosage: { amount: "1mg (1000mcg) weekly or monthly intramuscular injection", timing: "Weekly for deficiency correction, monthly for maintenance", note: "Bioavailability essentially 100% vs ~1% oral absorption. Methylcobalamin preferred over cyanocobalamin. Particularly useful for those with absorption issues, vegans, or low stomach acid." },
    interactions: ["Metformin (reduces B12 absorption - may need higher doses)"],
    effects: [
      { goal: "energy",   efficacy: 4, evidence: 4, studies: 25, type: "RCT",
        summary: "Injectable B12 bypasses gut absorption entirely. Dramatically corrects B12 deficiency symptoms including fatigue, weakness, and neurological issues faster than oral supplementation.", sources: ["PMID:12643357"] },
      { goal: "mood",     efficacy: 3, evidence: 3, studies: 12, type: "RCT",
        summary: "B12 deficiency is a common and reversible cause of depression and cognitive decline. Injectable correction rapidly normalizes neurological B12-dependent pathways.", sources: [] },
    ],
  },


  // ── COMPOUNDMAXXING — MISSING COMPOUNDS ──────────────────────────────────

  {
    id: "biotin",
    name: "Biotin (Vitamin B7)",
    aliases: ["biotin","vitamin b7","vitamin h","coenzyme r"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$5-10/month",
    dosage: { amount: "2.5-10mg/day", timing: "With meals", note: "Doses above 5mg have limited additional benefit. High doses can interfere with thyroid lab tests — inform your doctor. Best results after 3-6 months." },
    interactions: ["Thyroid lab tests (false results at high doses)"],
    effects: [
      { goal: "hair", efficacy: 3, evidence: 3, studies: 18, type: "RCT",
        summary: "Significantly improves hair growth in patients with biotin deficiency (common). RCTs show improved hair thickness and reduced shedding. Effect is most pronounced in those deficient, which is more common than assumed.", sources: ["PMID:28879195"] },
      { goal: "skin", efficacy: 2, evidence: 2, studies: 8, type: "RCT",
        summary: "Supports keratin infrastructure. Improves nail strength and brittleness in multiple RCTs. Skin effects less studied but mechanistically plausible.", sources: [] },
    ],
  },

  {
    id: "hyaluronic-acid",
    name: "Hyaluronic Acid",
    aliases: ["hyaluronic acid","hyaluronate","HA","sodium hyaluronate","oral HA"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-30/month",
    dosage: { amount: "120-240mg/day oral", timing: "With meals", note: "Oral HA is well absorbed and reaches skin tissue. Higher doses (240mg) show superior results. Topical HA has different mechanism — both can be combined." },
    interactions: [],
    effects: [
      { goal: "skin", efficacy: 4, evidence: 4, studies: 20, type: "RCT",
        summary: "Oral supplementation significantly increases skin hydration, reduces wrinkle depth, and improves skin elasticity. 60-day RCT showed 28% reduction in wrinkle area vs placebo. Strong evidence for oral bioavailability.", sources: ["PMID:25883005","PMID:33742704"] },
    ],
  },

  {
    id: "mastic-gum",
    name: "Mastic Gum (Pistacia lentiscus)",
    aliases: ["mastic gum","chios mastic","mastiha","pistacia lentiscus","jaw mastic"],
    tier: 3, safety: 4, legal: "OTC everywhere (food supplement)", cost: "$15-30/month",
    dosage: { amount: "350-1000mg/day", timing: "Before meals", note: "Widely used in looksmaxxing community for masseter hypertrophy via chewing. Research on jaw muscle effects is anecdotal — clinical evidence focuses on GI and anti-inflammatory benefits. Chewing raw mastic resin may have mechanical jaw training effect." },
    interactions: [],
    effects: [
      { goal: "skin", efficacy: 2, evidence: 2, studies: 6, type: "RCT",
        summary: "Anti-inflammatory and antioxidant effects. Reduces acne-causing bacteria and sebum oxidation. Some evidence for skin texture improvement.", sources: [] },
      { goal: "longevity", efficacy: 2, evidence: 3, studies: 12, type: "RCT",
        summary: "Potent H. pylori inhibitor. Anti-inflammatory via COX inhibition. Reduces LDL and liver enzymes in metabolic syndrome patients.", sources: ["PMID:20487209"] },
    ],
  },

  {
    id: "lutein-zeaxanthin",
    name: "Lutein + Zeaxanthin",
    aliases: ["lutein","zeaxanthin","marigold extract","macular pigment","eye carotenoids"],
    tier: 1, safety: 5, legal: "OTC everywhere", cost: "$10-20/month",
    dosage: { amount: "Lutein 10-20mg + Zeaxanthin 2mg/day", timing: "With fat-containing meal for absorption", note: "Carotenoids are fat-soluble. Take with avocado, olive oil, or eggs. Blood levels take 4-6 weeks to stabilize. Egg yolks are a natural source." },
    interactions: [],
    effects: [
      { goal: "skin", efficacy: 2, evidence: 3, studies: 10, type: "RCT",
        summary: "Protects skin from UV-induced damage and photoaging. Improves skin hydration and elasticity. Particularly beneficial for periorbital skin (under-eye area).", sources: ["PMID:16614420"] },
      { goal: "longevity", efficacy: 3, evidence: 4, studies: 30, type: "RCT + Meta-analyses",
        summary: "Protects macular pigment and reduces age-related macular degeneration risk by 25-40%. FDA-qualified health claim. Strong evidence for eye health and visual performance.", sources: ["PMID:26447482"] },
    ],
  },

  {
    id: "pumpkin-seed-oil",
    name: "Pumpkin Seed Oil",
    aliases: ["pumpkin seed oil","cucurbita pepo","PSO","beta-sitosterol pumpkin"],
    tier: 2, safety: 5, legal: "OTC everywhere", cost: "$15-25/month",
    dosage: { amount: "400-1000mg/day", timing: "With meals, split 2x", note: "Natural source of beta-sitosterol and delta-7 sterols. Inhibits 5-alpha reductase mildly. Less potent than finasteride but with excellent safety profile and no sexual side effects documented." },
    interactions: [],
    effects: [
      { goal: "hair", efficacy: 3, evidence: 3, studies: 5, type: "RCT",
        summary: "Korean double-blind RCT: 400mg/day for 24 weeks increased hair count by 40% vs 10% in placebo group in men with androgenetic alopecia. Inhibits 5-alpha reductase, reducing scalp DHT.", sources: ["PMID:24864154"] },
    ],
  },

];

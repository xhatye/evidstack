import { useState } from "react";
import { usePeptideTrial, PEPTIDE_TRIAL_LIMIT } from "./peptide-access.js";
import "./peptide-tools.css";

export const PEPTIDE_TOOL_PATHS = [
  { id: "peptide-calculator", label: "Peptide Calculator", eyebrow: "CALCULATE", description: "Check reconstitution maths, target volume and syringe units.", route: "/tools/peptide-calculator", icon: "÷" },
  { id: "peptide-interaction-checker", label: "Interaction Checker", eyebrow: "CHECK", description: "Review recorded interaction notes before you combine compounds.", route: "/tools/peptide-interaction-checker", icon: "↔" },
  { id: "peptide-dosage", label: "Dosage Guide", eyebrow: "READ", description: "Separate published exposure from protocols and assumptions.", route: "/guides/peptide-dosage", icon: "◌" },
  { id: "peptide-reconstitution", label: "Reconstitution", eyebrow: "PREPARE", description: "Understand concentration, dilution and the limits of conversion maths.", route: "/guides/peptide-reconstitution", icon: "⌁" },
  { id: "peptide-safety", label: "Safety Guide", eyebrow: "PROTECT", description: "Review product quality, contraindications, interactions and monitoring.", route: "/guides/peptide-safety", icon: "!" },
  { id: "peptide-half-life", label: "Half-Life Guide", eyebrow: "INTERPRET", description: "Read half-life, accumulation and study timing without overclaiming.", route: "/guides/peptide-half-life", icon: "◷" },
];

const PEPTIDE_GUIDE_CONTENT = {
  "peptide-reconstitution": {
    label: "Peptide Reconstitution",
    title: "Peptide reconstitution: understand the maths before the method",
    description: "Learn how vial amount, liquid volume, concentration and syringe units relate, with clear limits around sterility and product instructions.",
    preview: "Reconstitution changes concentration, not the amount in the vial. The right calculation depends on the labelled amount, the liquid volume and the scale printed on the syringe.",
    facts: ["Concentration = amount ÷ liquid volume", "Target volume = desired quantity ÷ concentration", "Syringe units are volume units, not mg or mcg"],
    sections: [
      ["What the calculation can tell you", "A calculator can translate a labelled amount into mg/mL, then translate a stated quantity into mL or syringe units. It cannot confirm whether a product is authentic, sterile, compatible with a liquid or appropriate for a person."],
      ["A simple maths example", "A 5 mg vial with 2 mL of liquid gives 2.5 mg/mL. A 250 mcg quantity is 0.1 mL, which corresponds to 10 units on a U-100 scale. This is an arithmetic example, not a treatment instruction."],
      ["Before using a result", "Check the product label, the liquid and syringe instructions, the units and the route with a qualified professional. Do not infer sterility, stability or absorption from a volume conversion."],
    ],
    faq: [["Does reconstitution create a dose?", "No. It only changes concentration and volume. A clinically appropriate quantity must be established separately."], ["Are U-100 units universal?", "U-100 describes one volume scale. Confirm the scale printed on the syringe you are using."]],
  },
  "peptide-safety": {
    label: "Peptide Safety",
    title: "Peptide safety: a context-first checklist",
    description: "Review the safety questions that sit behind a peptide claim: evidence quality, product quality, interactions, contraindications and monitoring.",
    preview: "A promising mechanism or an online protocol is not a safety assessment. Start with the population, route, formulation, legal status and the quality of the underlying evidence.",
    facts: ["Separate approved, investigational and anecdotal use", "Check interactions and contraindications", "Treat missing safety data as uncertainty"],
    sections: [
      ["Evidence is part of safety", "Human trials, animal studies and anecdotal reports answer different questions. A result from one population or route cannot automatically be transferred to another."],
      ["Product and route matter", "Identity, sterility, storage, excipients and route can change risk. A database page cannot test a vial or verify a compounding process."],
      ["Build a review record", "Write down medicines, conditions, allergies, the exact product, route, timing, source links and the monitoring plan you will discuss with a clinician or pharmacist."],
    ],
    faq: [["Does no listed interaction mean safe?", "No. It means no note is recorded in the current catalogue, not that the combination is safe."], ["Can a peptide safety guide replace a clinician?", "No. It helps organize questions for qualified clinical review."]],
  },
  "peptide-half-life": {
    label: "Peptide Half-Life",
    title: "Peptide half-life: what the number does and does not mean",
    description: "Understand half-life, exposure, accumulation and study timing without turning one pharmacokinetic value into a dosing plan.",
    preview: "Half-life describes how a measured amount changes over time in a defined context. It does not by itself tell you the right dose, frequency, route or clinical outcome.",
    facts: ["Half-life is context-specific", "Terminal half-life is not always the full effect window", "Repeated exposure can accumulate"],
    sections: [
      ["The basic relationship", "In a simplified one-compartment model, the remaining amount is often represented as C(t) = C₀ × (1/2)^(t ÷ half-life). Real products and people may not follow this simple curve."],
      ["Why studies disagree", "Formulation, route, assay timing, tissue distribution, renal or hepatic function and the study population can all change the reported value."],
      ["Do not equate persistence with benefit", "A compound can remain measurable after the main outcome changes, and a short measured half-life does not prove that a frequent schedule is useful or safe."],
    ],
    faq: [["Does half-life tell me how often to take something?", "No. Frequency depends on the indication, formulation, route, evidence and prescribing information."], ["Is half-life the same as duration of effect?", "No. They can be related, but they measure different things and should not be treated as interchangeable."]],
  },
};

function navigate(href) {
  if (typeof window === "undefined") return;
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "instant" });
}

function PeptideLink({ href, children, onNavigate, className = "" }) {
  return <a className={className} href={href} onClick={(event) => { event.preventDefault(); onNavigate ? onNavigate(href.replace(/^\//, "")) : navigate(href); }}>{children}</a>;
}

export function PeptideTrialStatus({ trial, isPro, label = "this tool" }) {
  return <div className="peptide-trial-status"><span className="peptide-trial-dot" aria-hidden="true" />{isPro ? <span>Pro access · unlimited {label}</span> : trial.locked ? <span>Free previews used · Pro unlocks unlimited access</span> : <span>{trial.remaining} free preview{trial.remaining === 1 ? "" : "s"} remaining for {label}</span>}</div>;
}

export function PeptideTrialPaywall({ onUpgrade, onNavigate, title = "Keep the full peptide workspace open." }) {
  return <section className="peptide-trial-paywall" aria-label="Peptide Tools Pro access"><div><p className="peptide-eyebrow">PEPTIDE TOOLS · PRO</p><h2>{title}</h2><p>Keep exploring with unlimited calculations, checks and guides at your own pace. The first two previews are free and no card is required to try them.</p></div><div className="peptide-paywall-actions"><button className="peptide-button peptide-button-primary" onClick={onUpgrade}>Unlock Peptide Tools · $9.99/month ↗</button><PeptideLink href="/pricing" onNavigate={onNavigate} className="peptide-button peptide-button-secondary">See Free vs Pro ↗</PeptideLink></div></section>;
}

function GuideToolWidget({ kind }) {
  const [vialAmount, setVialAmount] = useState("5");
  const [vialUnit, setVialUnit] = useState("mg");
  const [liquid, setLiquid] = useState("2");
  const [target, setTarget] = useState("250");
  const [targetUnit, setTargetUnit] = useState("mcg");
  const [scale, setScale] = useState("100");
  const [halfLife, setHalfLife] = useState("12");
  const [elapsed, setElapsed] = useState("24");
  const [startingAmount, setStartingAmount] = useState("100");
  const [safetyReview, setSafetyReview] = useState({ product: "", route: "", evidence: "", monitoring: "" });
  const [safetyCopied, setSafetyCopied] = useState(false);

  if (kind === "peptide-reconstitution") {
    const vial = Number(vialAmount), volume = Number(liquid), desired = Number(target);
    const vialMg = vialUnit === "g" ? vial * 1000 : vialUnit === "mcg" ? vial / 1000 : vial;
    const targetMg = targetUnit === "g" ? desired * 1000 : targetUnit === "mcg" ? desired / 1000 : desired;
    const concentration = vial > 0 && volume > 0 ? vialMg / volume : 0;
    const targetMl = concentration > 0 && desired > 0 ? targetMg / concentration : 0;
    return <section className="peptide-guide-tool" aria-labelledby="reconstitution-tool-title"><div className="peptide-guide-tool-heading"><div><p className="peptide-eyebrow">WORKED MATHS</p><h2 id="reconstitution-tool-title">Translate a labelled amount into volume.</h2></div><span className="peptide-tool-chip">ARITHMETIC ONLY</span></div><div className="peptide-guide-tool-grid"><label>Vial amount<input inputMode="decimal" value={vialAmount} onChange={(e) => setVialAmount(e.target.value)} /><select value={vialUnit} onChange={(e) => setVialUnit(e.target.value)}><option value="mcg">mcg</option><option value="mg">mg</option><option value="g">g</option></select></label><label>Liquid added (mL)<input inputMode="decimal" value={liquid} onChange={(e) => setLiquid(e.target.value)} /></label><label>Desired quantity<input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} /><select value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)}><option value="mcg">mcg</option><option value="mg">mg</option><option value="g">g</option></select></label><label>Syringe scale<select value={scale} onChange={(e) => setScale(e.target.value)}><option value="100">U-100</option><option value="40">U-40</option></select></label></div><div className="peptide-guide-tool-results"><div><span>Concentration</span><strong>{concentration > 0 ? `${concentration.toFixed(3)} mg/mL` : "—"}</strong></div><div><span>Target volume</span><strong>{targetMl > 0 ? `${targetMl.toFixed(3)} mL` : "—"}</strong></div><div><span>Scale units</span><strong>{targetMl > 0 ? `${(targetMl * Number(scale)).toFixed(1)} units` : "—"}</strong></div></div><p className="peptide-tool-note">Confirm the label, liquid, syringe scale and professional instructions separately. This widget cannot assess sterility, compatibility, route or an appropriate quantity.</p></section>;
  }
  if (kind === "peptide-safety") {
    const fields = [
      { key: "product", label: "Product identity", options: [["recorded", "Label, batch and source recorded"], ["uncertain", "Source or identity is uncertain"]] },
      { key: "route", label: "Route and formulation", options: [["recorded", "Route, formulation and storage recorded"], ["uncertain", "Route or formulation is unclear"]] },
      { key: "evidence", label: "Evidence context", options: [["human", "Human or approved context"], ["early", "Preclinical or anecdotal context"]] },
      { key: "monitoring", label: "Monitoring plan", options: [["planned", "Baseline and follow-up questions planned"], ["missing", "No monitoring plan yet"]] },
    ];
    const completed = Object.values(safetyReview).filter(Boolean).length;
    const openQuestions = [];
    if (safetyReview.product === "uncertain") openQuestions.push("Verify product identity, batch details and storage conditions.");
    if (safetyReview.route === "uncertain") openQuestions.push("Confirm the route, formulation and handling requirements.");
    if (safetyReview.evidence === "early") openQuestions.push("Keep preclinical or anecdotal findings separate from human evidence.");
    if (safetyReview.monitoring === "missing") openQuestions.push("Write down baseline measures, follow-up timing and stop questions.");
    const reviewReady = completed === fields.length && openQuestions.length === 0;
    const copyBrief = async () => {
      const lines = ["Evidstack peptide safety review", ...fields.map((field) => `${field.label}: ${field.options.find(([value]) => value === safetyReview[field.key])?.[1] || "Not recorded"}`), "", openQuestions.length ? "Open questions:" : "No open questions recorded.", ...openQuestions.map((question) => `- ${question}`)];
      try { await navigator.clipboard.writeText(lines.join("\n")); setSafetyCopied(true); window.setTimeout(() => setSafetyCopied(false), 1800); } catch { setSafetyCopied(false); }
    };
    return <section className="peptide-guide-tool peptide-safety-review" aria-labelledby="safety-tool-title"><div className="peptide-guide-tool-heading"><div><p className="peptide-eyebrow">SAFETY REVIEW BUILDER</p><h2 id="safety-tool-title">Turn unknowns into useful questions.</h2><p className="peptide-tool-note">Choose the statement that matches the record you are reviewing. The output is a review brief, never a safety clearance.</p></div><span className="peptide-tool-chip">{completed}/4 RECORDED</span></div><div className="peptide-safety-field-grid">{fields.map((field) => <label className="peptide-safety-field" key={field.key}>{field.label}<select value={safetyReview[field.key]} onChange={(event) => { setSafetyReview((current) => ({ ...current, [field.key]: event.target.value })); setSafetyCopied(false); }}><option value="">Choose one</option>{field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div><div className={`peptide-safety-result ${reviewReady ? "is-ready" : ""}`}><strong>{reviewReady ? "Review brief is ready." : `${openQuestions.length || 4 - completed} open question${(openQuestions.length || 4 - completed) === 1 ? "" : "s"} to resolve.`}</strong><p>{reviewReady ? "You have recorded the core context to discuss with a qualified clinician or pharmacist." : "A missing or early record should stay visible until it can be checked against the product, route, evidence and monitoring context."}</p>{openQuestions.length > 0 && <ul className="peptide-safety-questions">{openQuestions.map((question) => <li key={question}>{question}</li>)}</ul>}</div><div className="peptide-safety-actions"><button className="peptide-button peptide-button-secondary" type="button" onClick={copyBrief}>{safetyCopied ? "Copied review brief" : "Copy review brief ↗"}</button><button className="peptide-button peptide-button-outline" type="button" onClick={() => { setSafetyReview({ product: "", route: "", evidence: "", monitoring: "" }); setSafetyCopied(false); }}>Reset</button></div></section>;
  }
  const h = Number(halfLife), t = Number(elapsed), start = Number(startingAmount);
  const remaining = h > 0 && t >= 0 && start >= 0 ? start * Math.pow(0.5, t / h) : 0;
  return <section className="peptide-guide-tool" aria-labelledby="half-life-tool-title"><div className="peptide-guide-tool-heading"><div><p className="peptide-eyebrow">PHARMACOKINETIC VIEW</p><h2 id="half-life-tool-title">See the simplified decay curve.</h2></div><span className="peptide-tool-chip">MODELLED VIEW</span></div><div className="peptide-guide-tool-grid peptide-half-life-grid"><label>Half-life (hours)<input inputMode="decimal" value={halfLife} onChange={(e) => setHalfLife(e.target.value)} /></label><label>Elapsed time (hours)<input inputMode="decimal" value={elapsed} onChange={(e) => setElapsed(e.target.value)} /></label><label>Starting amount (arbitrary units)<input inputMode="decimal" value={startingAmount} onChange={(e) => setStartingAmount(e.target.value)} /></label></div><div className="peptide-half-life-result"><div className="peptide-half-life-ring" style={{ "--remaining": `${Math.max(0, Math.min(100, start > 0 ? (remaining / start) * 100 : 0))}%` }}><strong>{start > 0 ? `${((remaining / start) * 100).toFixed(1)}%` : "—"}</strong><span>remaining</span></div><div><span>Modelled amount after {t || 0} h</span><strong>{remaining > 0 ? remaining.toFixed(2) : "—"}</strong><p>This is a simplified one-compartment calculation, not a dosing schedule or a promise about duration of effect.</p></div></div><p className="peptide-tool-note">Reported half-life depends on product, route, population, assay and study design. Do not infer frequency or benefit from this number alone.</p></section>;
}

export function PeptideToolsPage({ isPro, onUpgrade, onNavigate, onAuth }) {
  const [showHow, setShowHow] = useState(false);
  return <main className="peptide-tools-page">
    <section className="peptide-tools-hero"><div className="peptide-hero-copy"><p className="peptide-eyebrow">PEPTIDE TOOLS</p><h1>One calm workspace for peptide research.</h1><p className="peptide-hero-lede">Calculate the maths, check the context and read the limits before a peptide claim turns into a decision.</p><div className="peptide-hero-actions"><button className="peptide-button peptide-button-primary" onClick={() => document.getElementById("peptide-tools-grid")?.scrollIntoView({ behavior: "smooth", block: "start" })}>{isPro ? "Open the peptide workspace ↓" : "Try the free previews ↓"}</button>{!isPro && <button className="peptide-button peptide-button-outline" onClick={onUpgrade}>Explore Pro access ↗</button>}{!isPro && onAuth && <button className="peptide-text-link" onClick={() => onAuth("signup")}>Create a free account</button>}</div></div><div className="peptide-hero-visual"><img src="/peptide-tools-hero.png?v=2" alt="Researcher holding an amber peptide vial at a bright desk" width="716" height="716" /><div className="peptide-hero-mark" aria-hidden="true"><span>PEPTIDE</span><strong>06</strong><small>connected tools</small><i /></div></div></section>
    <section className="peptide-tools-stats" aria-label="Peptide Tools access"><div><strong>6</strong><span>connected tools</span></div><div><strong>{isPro ? "∞" : "2"}</strong><span>{isPro ? "unlimited use" : "free previews per tool"}</span></div><div><strong>{isPro ? "PRO" : "$0"}</strong><span>{isPro ? "full access" : "no card to try"}</span></div></section>
    <section id="peptide-tools-grid" className="peptide-tools-section"><div className="peptide-section-heading"><div><p className="peptide-eyebrow">THE RESEARCH LOOP</p><h2>Choose the next useful question.</h2></div><p>{isPro ? "All six tools stay connected to the same source-first Evidstack catalogue with unlimited Pro access." : "Each tool keeps the same source-first language as the Evidstack catalogue, with two free previews before Pro access."}</p></div><div className="peptide-tool-grid">{PEPTIDE_TOOL_PATHS.map((tool) => <article className="peptide-tool-card" key={tool.id} role="link" tabIndex="0" onClick={() => onNavigate(tool.route.replace(/^\//, ""))} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onNavigate(tool.route.replace(/^\//, "")); } }}><div className="peptide-tool-card-top"><span className="peptide-tool-icon" aria-hidden="true">{tool.icon}</span><span className="peptide-tool-label">{tool.eyebrow}</span></div><h3>{tool.label}</h3><p>{tool.description}</p><div className="peptide-tool-card-footer"><span>{isPro ? "Pro · unlimited" : "2 free previews"}</span><button onClick={(event) => { event.stopPropagation(); onNavigate(tool.route.replace(/^\//, "")); }}>Open {isPro ? "tool" : "preview"} <span aria-hidden="true">↗</span></button></div></article>)}</div></section>
    <section className="peptide-comparison-strip" aria-labelledby="peptide-comparison-title"><div><p className="peptide-eyebrow">COMPARE THE RECORD</p><h2 id="peptide-comparison-title">Put two peptide profiles side by side.</h2><p>Review recorded evidence, context and limits for commonly searched comparisons.</p></div><div className="peptide-comparison-links"><PeptideLink href="/compare/tesamorelin-vs-sermorelin" onNavigate={onNavigate}>Tesamorelin vs Sermorelin ↗</PeptideLink><PeptideLink href="/compare/ghk-cu-vs-bpc-157" onNavigate={onNavigate}>GHK-Cu vs BPC-157 ↗</PeptideLink></div></section>
    <section className="peptide-access-panel"><div><p className="peptide-eyebrow">{isPro ? "PRO ACCESS" : "HOW ACCESS WORKS"}</p><h2>{isPro ? "Keep every tool connected." : "Try the useful part first."}</h2><p>{isPro ? "Use all six calculators, checkers and guides without preview limits, with the same Evidstack research context throughout." : "Use each calculator, checker or guide twice for free. Pro removes the limit and keeps your peptide research in the same Evidstack workspace."}</p></div><div className="peptide-access-steps"><div><span>01</span><b>Open a tool</b><small>{isPro ? "Start with any research question." : "Start without a card."}</small></div><div><span>02</span><b>{isPro ? "Connect the context" : "Use two previews"}</b><small>{isPro ? "Keep evidence and maths together." : "Enough to see if it fits."}</small></div><div><span>03</span><b>{isPro ? "Keep decisions visible" : "Unlock when useful"}</b><small>{isPro ? "Return to the full workspace." : "One calm $9.99/month plan."}</small></div></div><button className="peptide-collapse-link" onClick={() => setShowHow((value) => !value)}>{showHow ? "Hide access details" : "Read the access details"} ↗</button>{showHow && <div className="peptide-access-details"><p>{isPro ? "Pro access includes unlimited use of every Peptide Tool. Results remain arithmetic or research context only and do not validate a product or provide a treatment plan." : "Free previews are tracked in this browser for each tool. Pro members get unlimited access, plus the wider Evidstack research workspace. Your free previews are not a medical recommendation and do not save or validate a dosing protocol."}</p></div>}</section>
    {!isPro && <PeptideTrialPaywall onUpgrade={onUpgrade} onNavigate={onNavigate} title="Keep the peptide tools connected." />}
    <p className="peptide-disclaimer">Peptide Tools are for research literacy and arithmetic review. They do not diagnose, prescribe, verify a product or replace a clinician, pharmacist or official prescribing information.</p>
  </main>;
}

export function PeptideKnowledgePage({ kind, isPro, onUpgrade, onNavigate }) {
  const content = PEPTIDE_GUIDE_CONTENT[kind];
  const trial = usePeptideTrial(kind, isPro);
  const [fullGuide, setFullGuide] = useState(Boolean(isPro));
  const openGuide = () => {
    if (isPro || trial.consume()) setFullGuide(true);
  };
  if (!content) return <main className="peptide-tools-page"><h1>Peptide guide not found</h1></main>;
  const faqId = `${kind}-faq`;
  return <main className="peptide-tools-page peptide-knowledge-page"><nav className="peptide-breadcrumbs" aria-label="Breadcrumb"><PeptideLink href="/peptide-tools" onNavigate={onNavigate}>Peptide Tools</PeptideLink><span aria-hidden="true">/</span><strong>{content.label}</strong></nav><header className="peptide-guide-hero"><div><p className="peptide-eyebrow">PEPTIDE TOOLS · GUIDE</p><h1>{content.title}</h1><p className="peptide-hero-lede">{content.description}</p><PeptideTrialStatus trial={trial} isPro={isPro} label="this guide" /></div><div className="peptide-guide-hero-badge"><span>{isPro ? "PRO ACCESS" : "FREE PREVIEW"}</span><strong>{isPro ? "PRO" : `${trial.remaining}/${PEPTIDE_TRIAL_LIMIT}`}</strong><small>{isPro ? "Unlimited use" : "previews left"}</small></div></header>{(kind === "peptide-reconstitution" || kind === "peptide-safety" || kind === "peptide-half-life") && <GuideToolWidget kind={kind} />}<section className="peptide-guide-preview"><p className="peptide-eyebrow">QUICK READ</p><h2>{content.preview}</h2><ul>{content.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>{!fullGuide && <button className="peptide-button peptide-button-primary" onClick={trial.locked ? onUpgrade : openGuide}>{trial.locked ? "Unlock the full guide ↗" : "Read the full guide · free preview ↗"}</button>}</section>{fullGuide ? <><section className="peptide-guide-sections">{content.sections.map(([title, body], index) => <article key={title}><span className="peptide-guide-number">{String(index + 1).padStart(2, "0")}</span><h2>{title}</h2><p>{body}</p></article>)}</section><section className="peptide-guide-faq" aria-labelledby={faqId}><p className="peptide-eyebrow">FAQ</p><h2 id={faqId}>Questions people ask</h2>{content.faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section></> : <section className="peptide-guide-locked"><p className="peptide-eyebrow">FULL GUIDE</p><h2>Open the source-first checklist when you are ready.</h2><p>The full guide adds worked context, caveats and questions to take into a professional review.</p></section>}<section className="peptide-guide-links"><p className="peptide-eyebrow">CONTINUE THE LOOP</p><div><PeptideLink href="/tools/peptide-calculator" onNavigate={onNavigate}>Peptide Calculator ↗</PeptideLink><PeptideLink href="/tools/peptide-interaction-checker" onNavigate={onNavigate}>Interaction Checker ↗</PeptideLink><PeptideLink href="/guides/peptide-dosage" onNavigate={onNavigate}>Dosage Guide ↗</PeptideLink></div></section>{!isPro && trial.locked && <PeptideTrialPaywall onUpgrade={onUpgrade} onNavigate={onNavigate} title="You have used the two free guide previews." />}<p className="peptide-disclaimer">This guide is informational. It does not provide a personal dosage, treatment schedule or product validation.</p></main>;
}


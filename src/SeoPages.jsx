import { useMemo, useState } from "react";
import { SUPPLEMENTS } from "./data.js";
import { PEPTIDE_COMPOUNDS } from "./peptide-catalog.js";
import { usePeptideTrial } from "./peptide-access.js";
import { PeptideTrialStatus, PeptideTrialPaywall } from "./PeptideTools.jsx";
import "./seo-pages.css";

export const SEO_DOSAGE_IDS = ["ghk-cu", "kpv", "mots-c", "sermorelin", "bpc-157", "tesamorelin"];

const DOSAGE_COPY = {
  "ghk-cu": {
    summary: "GHK-Cu is a copper-binding peptide studied in skin and tissue-remodelling contexts. The strongest catalogue evidence is route-specific and does not establish a general injectable protocol.",
    status: "Mixed evidence; topical cosmetic research is more established than injectable use.",
    context: "Human and laboratory research is concentrated on topical or tissue-repair outcomes. A numeric self-use range is not presented here without an indication and a source-backed protocol.",
    pharmacology: "A small copper-binding peptide. Its effects depend on route, formulation and the population studied.",
    route: "Route-specific; topical and injectable records should not be treated as interchangeable.",
    duration: "Not established as a general duration across indications.",
    faq: [
      ["Is there a universal GHK-Cu dose?", "No. The route and indication change the research context, and Evidstack does not present a universal self-dosing protocol."],
      ["Does topical GHK-Cu equal injectable GHK-Cu?", "No. Absorption, exposure and safety questions differ by route."],
    ],
  },
  kpv: {
    summary: "KPV is a short peptide fragment studied mainly in inflammatory and gastrointestinal models. The available record is early and does not validate a general human dosing schedule.",
    status: "Preclinical and limited pilot evidence; no established general human range in the current record.",
    context: "Most signals come from laboratory or preclinical work. Any human exposure must be read in the context of the specific study, formulation and oversight.",
    pharmacology: "A fragment related to alpha-MSH signalling. Route and formulation may materially change exposure.",
    route: "Not reliably established for general use.",
    duration: "Not established.",
    faq: [
      ["Can a KPV animal-study amount be copied to a person?", "No. Animal exposure cannot be converted into a validated human protocol by a simple unit conversion."],
      ["Is KPV approved for a general indication?", "The current Evidstack record labels it as a research compound."],
    ],
  },
  "mots-c": {
    summary: "MOTS-c is a mitochondria-derived peptide investigated in metabolic, exercise and ageing models. Human dosing remains an open research question.",
    status: "Early-stage research; no established human dosing range in the current record.",
    context: "The catalogue includes animal and early human signals, but these do not define a validated protocol for self-use.",
    pharmacology: "A mitochondria-derived micropeptide associated with metabolic signalling in laboratory research. Context and species matter.",
    route: "Research route only; no general clinical route is established here.",
    duration: "Not established.",
    faq: [
      ["Does MOTS-c have an approved dose?", "No approved general dose is recorded in Evidstack."],
      ["Why are animal amounts not shown as a protocol?", "Animal-study exposure is not a human recommendation and cannot be safely generalized."],
    ],
  },
  sermorelin: {
    summary: "Sermorelin is a growth-hormone-releasing hormone analogue with prescription clinical history. Adult or performance-oriented use is indication-specific and requires clinical oversight.",
    status: "Prescription and indication-specific; adult off-label claims should be separated from studied clinical use.",
    context: "Human studies exist, but the appropriate exposure depends on the indication, age, diagnostic context and prescribing information.",
    pharmacology: "A GHRH analogue that acts through the pituitary growth-hormone axis. The response is context-dependent.",
    route: "Prescriber-directed route and formulation only.",
    duration: "Indication-specific; not a general wellness schedule.",
    faq: [
      ["Is sermorelin a general anti-ageing treatment?", "Evidstack does not make that claim. Evidence and approval status depend on the specific indication."],
      ["Can a catalogue amount replace prescribing information?", "No. Use the official product information and a qualified clinician for prescription decisions."],
    ],
  },
  "bpc-157": {
    summary: "BPC-157 is an investigational peptide with substantial preclinical discussion and limited human clinical evidence. A validated human dosing protocol is not established.",
    status: "Investigational; the current record is dominated by preclinical or anecdotal claims.",
    context: "Animal findings and anecdotal reports should not be presented as human dose evidence. The current record does not support a general self-use range.",
    pharmacology: "A peptide studied in tissue-repair and angiogenesis models. Mechanistic hypotheses are not clinical proof.",
    route: "No approved general route for human self-use.",
    duration: "Not established.",
    faq: [
      ["Is BPC-157 approved for human use?", "The current Evidstack record labels it as research-only and not approved for human use."],
      ["Why does the internet show many BPC-157 protocols?", "Online protocols are not the same as controlled human evidence and may omit important risks."],
    ],
  },
  tesamorelin: {
    summary: "Tesamorelin is a prescription growth-hormone-releasing factor analogue with a narrow approved indication. Evidence for that indication must not be generalized to other goals.",
    status: "Approved only for a specific prescription indication; other uses are off-label or investigational.",
    context: "Human trial data exist, but interpretation depends on the approved population, contraindications, monitoring and product information.",
    pharmacology: "A GHRH analogue that increases growth-hormone signalling. Effects and risks are indication- and patient-dependent.",
    route: "Prescription product information and clinician direction determine route and schedule.",
    duration: "Indication-specific and monitoring-dependent.",
    faq: [
      ["Can the approved tesamorelin indication be applied to weight loss?", "No. An approved indication does not automatically support other goals or populations."],
      ["Should I use a catalogue amount as a prescription instruction?", "No. Follow current prescribing information and clinician guidance."],
    ],
  },
};

const PAGE_STYLE = { maxWidth: 1040, margin: "0 auto", padding: "52px 24px 100px" };

function navigate(href) {
  if (typeof window === "undefined") return;
  window.history.pushState({}, "", href);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "instant" });
}

function InternalLink({ href, children, className = "", onNavigate }) {
  return <a className={className} href={href} onClick={(event) => { event.preventDefault(); (onNavigate ? onNavigate(href.replace(/^\//, "")) : navigate(href)); }}>{children}</a>;
}

function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function Breadcrumbs({ items }) {
  const data = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, ...(item.href ? { item: `https://evidstack.com${item.href}` } : {}) })) };
  return <><nav className="seo-breadcrumbs" aria-label="Breadcrumb"><InternalLink href="/">Home</InternalLink>{items.map((item) => <span key={item.name}><span aria-hidden="true">/</span>{item.href ? <InternalLink href={item.href}>{item.name}</InternalLink> : <strong>{item.name}</strong>}</span>)}</nav><JsonLd data={data} /></>;
}

function SeoCta({ onUpgrade, onNavigate }) {
  return <div className="seo-cta-row"><InternalLink href="/tools/peptide-calculator" className="seo-button seo-button-dark" onNavigate={onNavigate}>Open the peptide calculator</InternalLink><InternalLink href="/tools/peptide-interaction-checker" className="seo-button seo-button-light" onNavigate={onNavigate}>Check interactions</InternalLink><InternalLink href="/evidence-answer" className="seo-button seo-button-light" onNavigate={onNavigate}>Ask Evidstack AI</InternalLink>{onUpgrade && <button className="seo-button seo-button-gold" onClick={onUpgrade}>Explore Pro ↗</button>}</div>;
}

function FaqSection({ items, id = "faq" }) {
  const data = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  return <section className="seo-section" aria-labelledby={id}><h2 id={id}>Frequently asked questions</h2><div className="seo-faq-list">{items.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div><JsonLd data={data} /></section>;
}

export function PeptideCalculatorPage({ isPro, onUpgrade, onNavigate }) {
  const [vialAmount, setVialAmount] = useState("10");
  const [vialUnit, setVialUnit] = useState("mg");
  const [liquid, setLiquid] = useState("2");
  const [desired, setDesired] = useState("250");
  const [desiredUnit, setDesiredUnit] = useState("mcg");
  const [syringeScale, setSyringeScale] = useState("100");
  const trial = usePeptideTrial("peptide-calculator", isPro);
  const [hasCalculated, setHasCalculated] = useState(Boolean(isPro));
  const runCalculation = () => {
    if (isPro || trial.consume()) setHasCalculated(true);
    else onUpgrade?.();
  };
  const values = useMemo(() => {
    const vial = Number(vialAmount);
    const liquidMl = Number(liquid);
    const target = Number(desired);
    if (![vial, liquidMl, target].every((value) => Number.isFinite(value) && value > 0)) return null;
    const vialMg = vialUnit === "g" ? vial * 1000 : vialUnit === "mcg" ? vial / 1000 : vial;
    const targetMg = desiredUnit === "g" ? target * 1000 : desiredUnit === "mcg" ? target / 1000 : target;
    const concentration = vialMg / liquidMl;
    const doseMl = targetMg / concentration;
    return { concentration, doseMl, units: doseMl * Number(syringeScale), vialMg, targetMg };
  }, [vialAmount, vialUnit, liquid, desired, desiredUnit, syringeScale]);
  const faq = [["What does this calculator do?", "It converts a stated vial amount, reconstitution volume and desired quantity into concentration, liquid volume and syringe units."], ["Does it recommend a peptide dose?", "No. It performs arithmetic only. The desired quantity must come from an appropriate, source-backed decision and qualified clinical advice."], ["What does U-100 mean?", "U-100 insulin syringes are marked so 100 units represent 1 mL. Always confirm the scale printed on the syringe you are using."]];
  return <main className="seo-page peptide-tool-surface" style={PAGE_STYLE}><Breadcrumbs items={[{ name: "Tools" }, { name: "Peptide calculator" }]} /><header className="seo-hero"><p className="seo-eyebrow">RESEARCH TOOL</p><h1>Peptide calculator: reconstitution and unit conversion</h1><p className="seo-lede">Convert vial concentration into liquid volume and syringe units while keeping the maths separate from medical recommendations.</p><PeptideTrialStatus trial={trial} isPro={isPro} label="calculations" /><SeoCta onUpgrade={onUpgrade} onNavigate={onNavigate} /></header>
    <section className="seo-calculator-grid" aria-labelledby="calculator-title"><div className="seo-calculator-card"><h2 id="calculator-title">Calculate the volume</h2><div className="seo-form-grid"><label>Vial amount<input inputMode="decimal" value={vialAmount} onChange={(e) => setVialAmount(e.target.value)} /><select value={vialUnit} onChange={(e) => setVialUnit(e.target.value)}><option value="mcg">mcg</option><option value="mg">mg</option><option value="g">g</option></select></label><label>Liquid added (mL)<input inputMode="decimal" value={liquid} onChange={(e) => setLiquid(e.target.value)} /></label><label>Desired quantity<input inputMode="decimal" value={desired} onChange={(e) => setDesired(e.target.value)} /><select value={desiredUnit} onChange={(e) => setDesiredUnit(e.target.value)}><option value="mcg">mcg</option><option value="mg">mg</option><option value="g">g</option></select></label><label>Syringe scale<select value={syringeScale} onChange={(e) => setSyringeScale(e.target.value)}><option value="100">U-100 (100 units/mL)</option><option value="40">U-40 (40 units/mL)</option></select></label></div><button className="seo-run-button" onClick={runCalculation}>{trial.locked && !isPro ? "Unlock unlimited calculations ↗" : "Run conversion ↗"}</button><div className="seo-results" aria-live="polite">{hasCalculated && values ? <><div><span>Target concentration</span><strong>{values.concentration.toFixed(3)} mg/mL</strong></div><div><span>Liquid volume for target quantity</span><strong>{values.doseMl.toFixed(3)} mL</strong></div><div><span>Syringe units</span><strong>{values.units.toFixed(1)} units</strong></div></> : <p>Run the conversion to see the arithmetic preview.</p>}</div><p className="seo-math-note">Math only: concentration = vial amount ÷ liquid volume; target volume = desired quantity ÷ concentration.</p></div><aside className="seo-callout"><strong>Use the result carefully</strong><p>This tool does not choose a dose, route, frequency or treatment. Confirm units, product instructions and syringe scale with a qualified professional.</p><InternalLink href="/guides/peptide-dosage" onNavigate={onNavigate}>Read the dosage guide ↗</InternalLink></aside></section>
    <section className="seo-section"><h2>How to read the conversion</h2><div className="seo-two-col"><div><h3>Concentration</h3><p>The vial amount and the liquid volume determine how much compound is present in each millilitre. Changing the liquid volume changes concentration; it does not change the amount in the vial.</p></div><div><h3>Unit conversion</h3><p>Syringe units are a volume scale. They are not milligrams or micrograms. The calculator uses the scale you select and shows the equivalent mL.</p></div></div></section>
    <section className="seo-section"><h2>Explore the evidence around a compound</h2><div className="seo-link-grid">{SEO_DOSAGE_IDS.map((id) => { const item = SUPPLEMENTS.find((supplement) => supplement.id === id); return item ? <InternalLink key={id} href={`/compounds/${id}/dosage`} onNavigate={onNavigate}><strong>{item.name}</strong><span>Research context and limits ↗</span></InternalLink> : null; })}</div></section>
    <FaqSection items={faq} />{!isPro && trial.locked && <PeptideTrialPaywall onUpgrade={onUpgrade} onNavigate={onNavigate} title="Keep unlimited peptide calculations open." />}<section className="seo-disclaimer"><strong>Safety and limitations.</strong> This calculator is an arithmetic aid for reviewing published or prescribed context. It is not medical advice, does not validate a product, and cannot account for formulation, sterility, absorption or individual risk.</section>
  </main>;
}

export function PeptideInteractionCheckerPage({ isPro, onUpgrade, onNavigate }) {
  const options = useMemo(() => [...PEPTIDE_COMPOUNDS].sort((a, b) => a.name.localeCompare(b.name)), []);
  const [first, setFirst] = useState("bpc-157");
  const [second, setSecond] = useState("tesamorelin");
  const [firstQuery, setFirstQuery] = useState(() => PEPTIDE_COMPOUNDS.find((item) => item.id === "bpc-157")?.name || "");
  const [secondQuery, setSecondQuery] = useState(() => PEPTIDE_COMPOUNDS.find((item) => item.id === "tesamorelin")?.name || "");
  const [openField, setOpenField] = useState(null);
  const a = options.find((item) => item.id === first);
  const b = options.find((item) => item.id === second);
  const notes = [...new Set([...(Array.isArray(a?.interactions) ? a.interactions : []), ...(Array.isArray(b?.interactions) ? b.interactions : [])])];
  const trial = usePeptideTrial("peptide-interaction-checker", isPro);
  const [hasChecked, setHasChecked] = useState(Boolean(isPro));
  const peptideMatches = (query) => {
    const needle = query.trim().toLowerCase();
    return options.filter((item) => {
      if (!needle) return true;
      return [item.name, ...(item.aliases || [])].join(" ").toLowerCase().includes(needle);
    }).slice(0, 8);
  };
  const choosePeptide = (field, item) => {
    if (field === "first") {
      setFirst(item.id);
      setFirstQuery(item.name);
    } else {
      setSecond(item.id);
      setSecondQuery(item.name);
    }
    setOpenField(null);
    setHasChecked(false);
  };
  const updatePeptideQuery = (field, value) => {
    if (field === "first") {
      setFirstQuery(value);
      setFirst("");
    } else {
      setSecondQuery(value);
      setSecond("");
    }
    setHasChecked(false);
    setOpenField(field);
  };
  const runCheck = () => {
    if (!a || !b || first === second) return;
    if (isPro || trial.consume()) setHasChecked(true);
    else onUpgrade?.();
  };
  const faq = [["Does a blank interaction result mean a combination is safe?", "No. It means no interaction note is recorded in the current catalogue. Absence of a note is not proof of safety."], ["What information should I bring to a review?", "Bring the exact products, amounts, routes, timing, medicines, conditions and the sources you want to discuss."], ["Can the checker replace a pharmacist or clinician?", "No. It is a research navigation tool and cannot assess your personal risk or prescribe a combination."]];
  const renderPeptidePicker = (field, label, query, selected) => {
    const matches = peptideMatches(query);
    const isOpen = openField === field && matches.length > 0;
    return <div className="seo-peptide-picker"><label>{label}<div className="seo-peptide-picker-input"><input value={query} onChange={(event) => updatePeptideQuery(field, event.target.value)} onFocus={() => setOpenField(field)} onBlur={() => window.setTimeout(() => setOpenField(null), 140)} onKeyDown={(event) => { if (event.key === "Escape") setOpenField(null); if (event.key === "Enter" && matches[0]) { event.preventDefault(); choosePeptide(field, matches[0]); } }} placeholder="Type a peptide name..." role="combobox" aria-autocomplete="list" aria-expanded={isOpen} aria-controls={`${field}-peptide-suggestions`} /></div></label>{isOpen && <div id={`${field}-peptide-suggestions`} className="seo-peptide-suggestions" role="listbox">{matches.map((item) => <button type="button" key={item.id} role="option" onMouseDown={(event) => event.preventDefault()} onClick={() => choosePeptide(field, item)}><strong>{item.name}</strong><span>{item.aliases?.slice(0, 2).join(" · ") || "Peptide record"}</span></button>)}</div>}</div>;
  };
  return <main className="seo-page peptide-tool-surface" style={PAGE_STYLE}><Breadcrumbs items={[{ name: "Tools" }, { name: "Peptide interaction checker" }]} /><header className="seo-hero"><p className="seo-eyebrow">RESEARCH TOOL</p><h1>Peptide interaction checker</h1><p className="seo-lede">Review interaction notes recorded for two peptide records, then take the source trail to a clinician or pharmacist for a decision.</p><PeptideTrialStatus trial={trial} isPro={isPro} label="interaction checks" /><SeoCta onUpgrade={onUpgrade} onNavigate={onNavigate} /></header>
    <section className="seo-checker-card" aria-labelledby="checker-title"><div className="seo-checker-heading"><div><h2 id="checker-title">Compare two peptide records</h2><p>{options.length} peptide records audited from the Evidstack catalogue.</p></div><span className="seo-tool-chip">PEPTIDES ONLY</span></div><div className="seo-form-grid seo-peptide-picker-grid">{renderPeptidePicker("first", "First peptide", firstQuery, first)}{renderPeptidePicker("second", "Second peptide", secondQuery, second)}</div>{(!a || !b || first === second) && <p className="seo-picker-hint">Choose two different peptides from the suggestions to run the check.</p>}<button className="seo-run-button" onClick={runCheck} disabled={!a || !b || first === second}>{trial.locked && !isPro ? "Unlock unlimited checks ↗" : "Run interaction check ↗"}</button>{hasChecked ? <div className={`seo-interaction-result ${notes.length ? "is-warning" : "is-neutral"}`}><strong>{notes.length ? "Catalogue notes to review" : "No interaction note recorded for this pair"}</strong>{notes.length ? <ul>{notes.map((note) => <li key={note}>{note}</li>)}</ul> : <p>No listed note is not a safety clearance. Check medicines, conditions, route and timing with a qualified professional.</p>}</div> : <div className="seo-interaction-result is-neutral"><strong>Run a preview to compare the selected records</strong><p>The result will surface recorded interaction notes for this peptide pair.</p></div>}<div className="seo-selected-links">{a && <InternalLink href={`/compound/${first}`} onNavigate={onNavigate}>Open {a.name} profile ↗</InternalLink>}{b && <InternalLink href={`/compound/${second}`} onNavigate={onNavigate}>Open {b.name} profile ↗</InternalLink>}</div></section>
    <section className="seo-section"><h2>What the checker can and cannot show</h2><div className="seo-two-col"><div><h3>Recorded signals</h3><p>The result surfaces interaction notes attached to the selected catalogue records. Each note still needs source and patient-context review.</p></div><div><h3>Missing context</h3><p>It cannot infer contraindications, lab values, product quality, contamination risk, allergies or the effect of a prescribed medicine.</p></div></div></section><FaqSection items={faq} />{!isPro && trial.locked && <PeptideTrialPaywall onUpgrade={onUpgrade} onNavigate={onNavigate} title="Keep unlimited interaction checks open." />}<section className="seo-disclaimer"><strong>Safety and limitations.</strong> This page is informational and does not diagnose, prescribe or confirm that a combination is safe.</section>
  </main>;
}

export function CompoundDosagePage({ compoundId, onUpgrade, onNavigate }) {
  const compound = SUPPLEMENTS.find((item) => item.id === compoundId);
  const copy = DOSAGE_COPY[compoundId];
  if (!compound || !copy) return <main className="seo-page peptide-tool-surface" style={PAGE_STYLE}><h1>Dosage page not found</h1><p>Return to the <InternalLink href="/guides/peptide-dosage" onNavigate={onNavigate}>peptide dosage guide</InternalLink>.</p></main>;
  const refs = [...new Set((compound.effects || []).flatMap((effect) => effect.sources || []))];
  const faq = [...copy.faq, ["Where can I verify the underlying studies?", "Use the linked PubMed references on this page and compare the population, route, duration and outcome before drawing a conclusion."]];
  const approval = compound.legal || "Status is not recorded in this entry.";
  return <main className="seo-page peptide-tool-surface" style={PAGE_STYLE}><Breadcrumbs items={[{ name: "Compounds", href: "/supplements" }, { name: compound.name }, { name: "Dosage" }]} /><article><header className="seo-hero"><p className="seo-eyebrow">COMPOUND DOSAGE RESEARCH</p><h1>{compound.name} dosage: published research and safety context</h1><p className="seo-lede">{copy.summary}</p><div className="seo-badge-row"><span>{copy.status}</span><span>{approval}</span></div><SeoCta onUpgrade={onUpgrade} onNavigate={onNavigate} /></header>
    <section className="seo-section"><h2>What is established</h2><div className="seo-fact-grid"><div><span>Human dosage range</span><strong>Not established as a general protocol</strong></div><div><span>Route and frequency</span><strong>{copy.route}</strong></div><div><span>Duration</span><strong>{copy.duration}</strong></div><div><span>Catalogue status</span><strong>{copy.status}</strong></div></div><p className="seo-note">A numeric amount from a catalogue field is not reproduced as an instruction here. Any legitimate exposure range must be read from the original study or current prescribing information for its exact indication.</p></section>
    <section className="seo-section"><h2>Study context</h2><p>{copy.context}</p><div className="seo-table-wrap"><table><thead><tr><th>Goal</th><th>Study type</th><th>Studies</th><th>Evidence score</th></tr></thead><tbody>{(compound.effects || []).map((effect) => <tr key={effect.goal}><td>{effect.goal}</td><td>{effect.type || "Not recorded"}</td><td>{effect.studies ?? effect.study_count ?? "Not recorded"}</td><td>{effect.evidence ?? "Not recorded"}/5</td></tr>)}</tbody></table></div></section>
    <section className="seo-section"><h2>Pharmacology and safety signals</h2><div className="seo-two-col"><div><h3>Pharmacology</h3><p>{copy.pharmacology}</p></div><div><h3>Adverse effects and interactions</h3>{(compound.sideEffects || []).length ? <ul className="seo-signal-list">{compound.sideEffects.slice(0, 6).map((item) => <li key={item.effect}><strong>{item.effect}</strong>{item.note ? ` — ${item.note}` : ""}</li>)}</ul> : <p>No signal is recorded in this entry. That is not proof of absence.</p>}{(compound.interactions || []).length > 0 && <p><strong>Interaction notes:</strong> {compound.interactions.join("; ")}</p>}</div></div></section>
    <section className="seo-section"><h2>References and source limits</h2>{refs.length ? <ul className="seo-reference-list">{refs.map((ref) => <li key={ref}><a href={`https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(ref.replace(/^PMID:/i, ""))}/`} target="_blank" rel="noopener noreferrer">{ref} on PubMed ↗</a></li>)}</ul> : <p>No linked reference is currently recorded for this entry. Treat the evidence record as incomplete.</p>}<p className="seo-note">The study summaries and scores above reflect the current Evidstack catalogue. They are navigation aids, not independent clinical validation.</p></section>
    <FaqSection items={faq} /><section className="seo-section"><h2>Continue the review</h2><div className="seo-link-grid"><InternalLink href={`/compound/${compound.id}`} onNavigate={onNavigate}><strong>Open the full {compound.name} profile</strong><span>See the catalogue record ↗</span></InternalLink><InternalLink href="/guides/peptide-dosage" onNavigate={onNavigate}><strong>Read the peptide dosage guide</strong><span>Learn how to interpret exposure ranges ↗</span></InternalLink></div></section><section className="seo-disclaimer"><strong>Safety and limitations.</strong> This page does not prescribe a dose. Do not convert animal, anecdotal or off-label protocols into personal treatment without qualified medical oversight.</section>
  </article></main>;
}

function DosageGuideWidget() {
  const [evidence, setEvidence] = useState("human");
  const [route, setRoute] = useState("route-specific");
  const [duration, setDuration] = useState("not-recorded");
  const [reviewed, setReviewed] = useState(false);
  const evidenceLabel = { approved: "Approved prescribing information", human: "Human research", preclinical: "Preclinical or animal research", anecdotal: "Anecdotal or protocol claim" }[evidence];
  const routeLabel = { "route-specific": "Route recorded in the source", topical: "Topical route", injectable: "Injectable route", unknown: "Route not recorded" }[route];
  const durationLabel = { short: "Short study window", medium: "Multi-week study window", long: "Longer follow-up", "not-recorded": "Duration not recorded" }[duration];
  return <section className="seo-guide-tool" aria-labelledby="dosage-tool-title"><div className="seo-guide-tool-heading"><div><p className="seo-eyebrow">CONTEXT BUILDER</p><h2 id="dosage-tool-title">Turn a study into a review record.</h2></div><span className="seo-tool-chip">NO PERSONAL DOSE</span></div><div className="seo-form-grid"><label>Evidence type<select value={evidence} onChange={(e) => setEvidence(e.target.value)}><option value="approved">Approved prescribing information</option><option value="human">Human research</option><option value="preclinical">Preclinical or animal research</option><option value="anecdotal">Anecdotal or protocol claim</option></select></label><label>Route<select value={route} onChange={(e) => setRoute(e.target.value)}><option value="route-specific">Route recorded in the source</option><option value="topical">Topical route</option><option value="injectable">Injectable route</option><option value="unknown">Route not recorded</option></select></label><label>Duration<select value={duration} onChange={(e) => setDuration(e.target.value)}><option value="short">Short study window</option><option value="medium">Multi-week study window</option><option value="long">Longer follow-up</option><option value="not-recorded">Duration not recorded</option></select></label></div><div className="seo-guide-tool-summary"><div><span>Evidence label</span><strong>{evidenceLabel}</strong></div><div><span>Route context</span><strong>{routeLabel}</strong></div><div><span>Timing context</span><strong>{durationLabel}</strong></div></div><button className="seo-run-button" onClick={() => setReviewed(true)}>{reviewed ? "Record reviewed ↗" : "Review this context ↗"}</button>{reviewed && <p className="seo-guide-tool-result">The record is ready to compare against population, formulation, outcomes, adverse events and the original source. It is not a recommendation.</p>}</section>;
}

export function PeptideDosageGuidePage({ isPro, onUpgrade, onNavigate }) {
  const faq = [["What is the difference between a study dose and a recommendation?", "A study dose describes what researchers administered to a defined population under a defined protocol. It is not automatically suitable for another person."], ["Can I use the peptide calculator to choose a dose?", "No. The calculator only converts quantities and volumes after a dose has been established elsewhere."], ["What should I record when reading a study?", "Record the population, route, formulation, amount, frequency, duration, comparator, outcome and adverse events."], ["Why are some dosage pages missing a number?", "Evidstack leaves a number out when the current record does not support a clear, indication-specific human range."]];
  const trial = usePeptideTrial("peptide-dosage", isPro);
  const [opened, setOpened] = useState(Boolean(isPro));
  const openGuide = () => { if (isPro || trial.consume()) setOpened(true); else onUpgrade?.(); };
  return <main className="seo-page peptide-tool-surface" style={PAGE_STYLE}><Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Peptide dosage" }]} /><header className="seo-hero"><p className="seo-eyebrow">EVIDENCE GUIDE</p><h1>Peptide dosage guide: how to read research safely</h1><p className="seo-lede">Learn how to separate published study exposure from animal work, anecdotal protocols and approved prescribing information.</p><PeptideTrialStatus trial={trial} isPro={isPro} label="guide previews" /><SeoCta onUpgrade={onUpgrade} onNavigate={onNavigate} /></header>{!opened && <section className="seo-guide-preview"><h2>Read the context-first checklist before opening the full guide.</h2><p>Use two free previews to see how Evidstack separates study exposure from personal recommendations.</p><button className="seo-run-button" onClick={trial.locked ? onUpgrade : openGuide}>{trial.locked ? "Unlock the full guide ↗" : "Open a free preview ↗"}</button></section>}{opened && <><DosageGuideWidget /><section className="seo-section"><h2>Start with context, not a number</h2><p>A dose only has meaning alongside a population, route, formulation, timing, duration and outcome. A conversion tool can check arithmetic, but it cannot decide whether an exposure is appropriate or safe.</p><div className="seo-step-grid"><div><span>01</span><h3>Classify the evidence</h3><p>Mark the record as approved, human research, preclinical or anecdotal.</p></div><div><span>02</span><h3>Capture the protocol</h3><p>Record the exact route, frequency, duration and units used in the source.</p></div><div><span>03</span><h3>Check risk</h3><p>Review adverse effects, interactions, contraindications and monitoring.</p></div></div></section><section className="seo-section"><h2>Six compound dosage pages</h2><div className="seo-link-grid">{SEO_DOSAGE_IDS.map((id) => { const item = SUPPLEMENTS.find((supplement) => supplement.id === id); return item ? <InternalLink key={id} href={`/compounds/${id}/dosage`} onNavigate={onNavigate}><strong>{item.name} dosage</strong><span>Evidence status, study context and limits ↗</span></InternalLink> : null; })}</div></section><section className="seo-section"><h2>Tools for the research loop</h2><div className="seo-link-grid"><InternalLink href="/tools/peptide-calculator" onNavigate={onNavigate}><strong>Peptide calculator</strong><span>Reconstitution and unit conversion ↗</span></InternalLink><InternalLink href="/tools/peptide-interaction-checker" onNavigate={onNavigate}><strong>Peptide interaction checker</strong><span>Review recorded interaction notes ↗</span></InternalLink><InternalLink href="/evidence-answer" onNavigate={onNavigate}><strong>Evidence Answer</strong><span>Ask a cited research question ↗</span></InternalLink></div></section><FaqSection items={faq} /></>}{!isPro && trial.locked && <PeptideTrialPaywall onUpgrade={onUpgrade} onNavigate={onNavigate} title="Keep the full dosage guide open." />}<section className="seo-disclaimer"><strong>Safety and limitations.</strong> This guide is for research literacy. It does not provide personal dosage instructions or replace a clinician, pharmacist or official prescribing information.</section></main>;
}

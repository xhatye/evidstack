import { useMemo, useState } from "react";
import { SUPPLEMENTS } from "./data.js";
import { trackEvent } from "./analytics.js";
import { useIsMobile } from "./BodyAtlasHooks.js";
import "./body-atlas.css";

const PALETTE = {
  bg: "#f4f2ee",
  paper: "#ffffff",
  ink: "#1a1a1a",
  muted: "#6b7280",
  border: "#d4d0c8",
  gold: "#e2c97e",
  green: "#16a34a",
  blue: "#2563eb",
  purple: "#7c3aed",
};

const REGIONS = [
  { id: "brain", label: "Brain & cognition", shortLabel: "Brain", goals: ["focus", "memory", "mood", "stress"], copy: "Compounds studied for attention, memory, mood and the stress response." },
  { id: "eyes", label: "Eyes & vision", shortLabel: "Eyes", goals: ["eyes", "longevity"], copy: "Research context for visual health and age-related eye outcomes." },
  { id: "heart", label: "Heart & circulation", shortLabel: "Heart", goals: ["cardio", "longevity"], copy: "Evidence related to cardiovascular markers and circulation." },
  { id: "lungs", label: "Lungs & breathing", shortLabel: "Lungs", goals: ["recovery", "longevity"], copy: "Compounds with relevant recovery or respiratory research in the catalogue." },
  { id: "thyroid", label: "Thyroid & metabolism", shortLabel: "Thyroid", goals: ["energy", "hormones", "weight"], copy: "Research linked to energy, thyroid-related hormones and metabolism." },
  { id: "liver", label: "Liver", shortLabel: "Liver", goals: ["liver", "longevity"], copy: "A cautious view of compounds studied in liver and detoxification contexts." },
  { id: "gut", label: "Digestion & gut", shortLabel: "Gut", goals: ["recovery", "mood", "weight"], copy: "Evidence connected to digestion, gut comfort and the gut-brain axis." },
  { id: "kidneys", label: "Kidneys & hydration", shortLabel: "Kidneys", goals: ["recovery", "cardio"], copy: "Only evidence recorded in the catalogue is shown here." },
  { id: "muscles", label: "Muscles & performance", shortLabel: "Muscles", goals: ["force", "recovery", "energy"], copy: "Compounds studied for strength, power, training recovery and energy." },
  { id: "joints", label: "Joints & connective tissue", shortLabel: "Joints", goals: ["recovery", "longevity"], copy: "Research summaries related to mobility, recovery and connective tissue." },
  { id: "skin", label: "Skin & hair", shortLabel: "Skin", goals: ["skin", "hair", "longevity"], copy: "Evidence for skin barrier, hair-related goals and healthy ageing." },
  { id: "reproductive", label: "Reproductive health", shortLabel: "Reproductive", goals: ["hormones"], copy: "Hormone and fertility research is shown only where it is explicitly recorded." },
];

const REGION_BY_ID = Object.fromEntries(REGIONS.map(region => [region.id, region]));

function safeStorageGet(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function safeStorageSet(key, value) {
  try { window.localStorage.setItem(key, value); } catch {}
}

function safeSessionGet(key) {
  try { return window.sessionStorage.getItem(key) === "1"; } catch { return false; }
}

function sourceList(effect) {
  return (effect?.sources || []).filter(Boolean).slice(0, 4);
}

function evidenceColor(value) {
  return Number(value) >= 4 ? PALETTE.green : Number(value) === 3 ? PALETTE.blue : PALETTE.purple;
}

function regionCompounds(region) {
  if (!region) return [];
  return SUPPLEMENTS
    .map(supplement => {
      const effects = (supplement.effects || [])
        .filter(effect => region.goals.includes(effect.goal))
        .sort((a, b) => (Number(b.evidence || 0) + Number(b.efficacy || 0)) - (Number(a.evidence || 0) + Number(a.efficacy || 0)));
      return { supplement, effect: effects[0] };
    })
    .filter(item => item.effect)
    .sort((a, b) => (Number(b.effect.evidence || 0) + Number(b.effect.efficacy || 0)) - (Number(a.effect.evidence || 0) + Number(a.effect.efficacy || 0)));
}

function ModelChoice({ onChoose }) {
  return (
    <div className="body-atlas-choice" role="dialog" aria-labelledby="body-atlas-choice-title">
      <div className="body-atlas-choice-inner">
        <p className="body-atlas-kicker">EVIDSTACK BODY ATLAS</p>
        <h1 id="body-atlas-choice-title">Choose your view.</h1>
        <p className="body-atlas-choice-copy">Pick the silhouette that feels most useful for your exploration. This only changes the visual model. It does not diagnose or personalize medical advice.</p>
        <div className="body-atlas-choice-grid">
          <button className="body-atlas-choice-card" onClick={() => onChoose("male")}>
            <span className="body-atlas-choice-art body-atlas-choice-art-male" aria-hidden="true"><span /></span>
            <strong>Masculine model</strong>
            <small>Explore the evidence map</small>
          </button>
          <button className="body-atlas-choice-card" onClick={() => onChoose("female")}>
            <span className="body-atlas-choice-art body-atlas-choice-art-female" aria-hidden="true"><span /></span>
            <strong>Feminine model</strong>
            <small>Explore the evidence map</small>
          </button>
        </div>
        <button className="body-atlas-skip" onClick={() => onChoose("neutral")}>Use a neutral view</button>
      </div>
    </div>
  );
}

function BodySilhouette({ model, selectedId, onSelect }) {
  const torsoPath = model === "female"
    ? "M154 166 C137 197 129 246 136 302 L145 374 C149 407 160 433 170 456 L190 456 C198 430 203 410 205 380 L208 300 C211 246 202 199 188 166 Z"
    : "M151 166 C132 196 126 244 133 300 L142 375 C146 409 159 432 169 456 L191 456 C202 431 213 409 218 375 L227 300 C234 244 228 196 209 166 Z";
  const pelvisPath = model === "female"
    ? "M147 366 C158 352 199 352 211 366 L204 432 C194 452 164 452 154 432 Z"
    : "M141 366 C159 351 216 351 229 366 L216 432 C203 451 166 451 153 432 Z";

  const regionShape = (id, children, className = "") => (
    <g
      key={id}
      className={`body-atlas-hotspot ${selectedId === id ? "is-selected" : ""} ${className}`}
      role="button"
      tabIndex="0"
      aria-label={`Explore ${REGION_BY_ID[id]?.label || id}`}
      onClick={() => onSelect(id)}
      onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(id); } }}
    >{children}</g>
  );

  return (
    <svg className="body-atlas-svg" viewBox="0 0 360 760" role="img" aria-labelledby="body-atlas-svg-title body-atlas-svg-desc">
      <title id="body-atlas-svg-title">Interactive human body evidence map</title>
      <desc id="body-atlas-svg-desc">Select a body region to explore related compound research in Evidstack.</desc>
      <defs>
        <linearGradient id="body-atlas-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1d3b9"/><stop offset="1" stopColor="#d9aa8d"/></linearGradient>
        <filter id="body-atlas-shadow" x="-25%" y="-15%" width="150%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#1a1a1a" floodOpacity=".15"/></filter>
      </defs>
      <g className="body-atlas-shadow" filter="url(#body-atlas-shadow)">
        <circle cx="180" cy="91" r="47" fill="url(#body-atlas-skin)" />
        <path d="M162 130 L162 169 L198 169 L198 130" fill="url(#body-atlas-skin)" />
        <path d={torsoPath} fill="url(#body-atlas-skin)" />
        <path d="M151 166 L117 186 L83 315 L105 322 L146 247" fill="url(#body-atlas-skin)" />
        <path d="M209 166 L243 186 L277 315 L255 322 L214 247" fill="url(#body-atlas-skin)" />
        <path d={pelvisPath} fill="url(#body-atlas-skin)" />
        <path d="M157 424 L162 626 L180 626 L184 456 L198 626 L216 626 L205 424 Z" fill="url(#body-atlas-skin)" />
        <path d="M83 315 L101 315 L91 335 L76 335 Z M277 315 L259 315 L269 335 L284 335 Z" fill="url(#body-atlas-skin)" />
      </g>

      {regionShape("brain", <circle cx="180" cy="89" r="32" />)}
      {regionShape("eyes", <path d="M153 92 Q166 82 177 92 Q166 102 153 92 M183 92 Q194 82 207 92 Q194 102 183 92" />)}
      {regionShape("thyroid", <path d="M172 147 Q180 138 188 147 L188 164 Q180 171 172 164 Z" />)}
      {regionShape("heart", <path d="M174 203 C161 188 143 204 153 221 L180 246 L207 221 C217 204 199 188 186 203 L180 210 Z" />)}
      {regionShape("lungs", <path d="M176 197 Q146 190 145 248 Q158 263 177 245 Z M184 197 Q214 190 215 248 Q202 263 183 245 Z" />)}
      {regionShape("liver", <path d="M183 259 Q223 250 219 283 Q195 298 174 280 Z" />)}
      {regionShape("gut", <ellipse cx="180" cy="318" rx="32" ry="39" />)}
      {regionShape("kidneys", <path d="M151 300 Q136 308 148 331 Q159 334 164 318 Q161 303 151 300 Z M209 300 Q224 308 212 331 Q201 334 196 318 Q199 303 209 300 Z" />)}
      {regionShape("muscles", <path d="M111 198 L137 190 L145 283 L119 300 Z M249 198 L223 190 L215 283 L241 300 Z M160 385 L177 383 L173 486 L156 486 Z M200 385 L183 383 L187 486 L204 486 Z" />)}
      {regionShape("joints", <g><circle cx="103" cy="318" r="15" /><circle cx="257" cy="318" r="15" /><circle cx="157" cy="487" r="15" /><circle cx="203" cy="487" r="15" /></g>)}
      {regionShape("skin", <path className="body-atlas-outline-hotspot" d="M137 50 Q180 18 223 50 L238 180 L277 315 L216 432 L216 626 L144 626 L144 432 L83 315 L122 180 Z" />)}
      {regionShape("reproductive", <path d="M161 386 Q180 373 199 386 L201 421 Q180 441 159 421 Z" />)}

      <path className="body-atlas-centerline" d="M180 141 L180 369" aria-hidden="true" />
    </svg>
  );
}

function EvidenceCard({ item }) {
  const { supplement, effect } = item;
  const sources = sourceList(effect);
  return (
    <article className="body-atlas-evidence-card">
      <div className="body-atlas-evidence-card-head">
        <div>
          <span className="body-atlas-tier">T{supplement.tier}</span>
          <h3>{supplement.name}</h3>
        </div>
        <div className="body-atlas-score" style={{ color: evidenceColor(effect.evidence) }}>
          <strong>{effect.evidence || "-"}</strong><small>/5 evidence</small>
        </div>
      </div>
      <p className="body-atlas-effect">{effect.summary || "No concise summary is recorded for this effect."}</p>
      <div className="body-atlas-evidence-meta">
        <span>Effect {effect.efficacy || "-"}/5</span>
        <span>{effect.studies ?? effect.study_count ?? "Study count not recorded"} studies</span>
        {sources.length > 0 && <span>{sources.length} source{sources.length === 1 ? "" : "s"}</span>}
      </div>
      <div className="body-atlas-evidence-footer">
        <span>{supplement.sideEffects?.length ? `${supplement.sideEffects.length} recorded cautions` : "Cautions not recorded"}</span>
        <button type="button" onClick={() => { window.history.pushState({}, "", `/compound/${supplement.id}`); window.dispatchEvent(new PopStateEvent("popstate")); }}>View profile ↗</button>
      </div>
    </article>
  );
}

function BodyAtlasPaywall({ onUpgrade, onAuth, onClose }) {
  return (
    <div className="body-atlas-paywall-backdrop" role="dialog" aria-modal="true" aria-labelledby="body-atlas-paywall-title">
      <div className="body-atlas-paywall">
        <button className="body-atlas-paywall-close" onClick={onClose} aria-label="Close Pro offer">×</button>
        <p className="body-atlas-kicker">YOUR FREE EXPLORATION IS USED</p>
        <h2 id="body-atlas-paywall-title">Explore the full evidence map.</h2>
        <p>Pro unlocks every body region, both views, full source trails, comparisons and connections to My Stack, Advisor and Interaction Checker.</p>
        <div className="body-atlas-paywall-actions">
          <button className="body-atlas-button body-atlas-button-gold" onClick={onUpgrade}>Discover Pro — $9.99/month</button>
          <button className="body-atlas-button body-atlas-button-ghost" onClick={onAuth}>Create a free account</button>
        </div>
        <small>Cancel anytime. Informational research context only.</small>
      </div>
    </div>
  );
}

export default function BodyAtlasPage({ isPro, onUpgrade, onAuth, onNavigate }) {
  const isMobile = useIsMobile();
  const [model, setModel] = useState(() => safeStorageGet("evid_body_atlas_model"));
  const [selectedId, setSelectedId] = useState(null);
  const [demoUsed, setDemoUsed] = useState(() => !isPro && safeSessionGet("evid_body_atlas_demo_used"));
  const [showPaywall, setShowPaywall] = useState(false);
  const [view, setView] = useState("front");
  const selectedRegion = REGION_BY_ID[selectedId];
  const compounds = useMemo(() => regionCompounds(selectedRegion), [selectedRegion]);

  const chooseModel = nextModel => {
    setModel(nextModel);
    safeStorageSet("evid_body_atlas_model", nextModel);
    trackEvent("body_atlas_model_selected", { model: nextModel });
  };

  const selectRegion = id => {
    if (!isPro && demoUsed && id !== selectedId) {
      setShowPaywall(true);
      trackEvent("body_atlas_paywall_viewed", { region: id });
      return;
    }
    setSelectedId(id);
    if (!isPro && !demoUsed) {
      setDemoUsed(true);
      try { window.sessionStorage.setItem("evid_body_atlas_demo_used", "1"); } catch {}
    }
    trackEvent("body_atlas_region_viewed", { region: id, model });
  };

  if (!model) return <ModelChoice onChoose={chooseModel} />;

  return (
    <main className="body-atlas-page">
      <section className="body-atlas-hero">
        <div>
          <p className="body-atlas-kicker">EVIDSTACK BODY ATLAS</p>
          <h1>Explore the body.<br /><span>Follow the evidence.</span></h1>
          <p className="body-atlas-hero-copy">Select a region to see which compounds are studied for related goals, how strong the evidence is and where the record remains uncertain.</p>
          <div className="body-atlas-hero-actions">
            <button className="body-atlas-button body-atlas-button-dark" onClick={() => { setModel(null); safeStorageSet("evid_body_atlas_model", ""); }}>Change model</button>
            <button className="body-atlas-button body-atlas-button-ghost" onClick={() => onNavigate?.("supplements")}>Browse the catalogue</button>
          </div>
        </div>
        <div className="body-atlas-hero-stat"><strong>{isPro ? "12" : "1"}</strong><span>{isPro ? "regions to explore" : "free region to explore"}</span></div>
      </section>

      <section className="body-atlas-workspace" aria-label="Interactive body atlas">
        <div className="body-atlas-canvas-wrap">
          <div className="body-atlas-canvas-topline">
            <span>{model === "neutral" ? "Neutral model" : `${model === "female" ? "Feminine" : "Masculine"} model`}</span>
            <div className="body-atlas-view-toggle" role="group" aria-label="Body view">
              {['front', 'back'].map(nextView => <button key={nextView} className={view === nextView ? "is-active" : ""} onClick={() => setView(nextView)}>{nextView}</button>)}
            </div>
          </div>
          <div className={`body-atlas-canvas body-atlas-canvas-${view}`}>
            <BodySilhouette model={model} selectedId={selectedId} onSelect={selectRegion} />
            <span className="body-atlas-canvas-hint">Select a highlighted region</span>
          </div>
          <div className="body-atlas-region-pills">
            {REGIONS.slice(0, isMobile ? 6 : 12).map(region => <button key={region.id} className={selectedId === region.id ? "is-active" : ""} onClick={() => selectRegion(region.id)}>{region.shortLabel}</button>)}
          </div>
        </div>

        <aside className="body-atlas-detail-panel" aria-live="polite">
          {!selectedRegion ? (
            <div className="body-atlas-empty-state"><span className="body-atlas-empty-mark">+</span><p>Select a region on the model.</p><small>The map connects anatomy-inspired exploration with the existing Evidstack evidence catalogue.</small></div>
          ) : (
            <>
              <p className="body-atlas-kicker">SELECTED REGION</p>
              <h2>{selectedRegion.label}</h2>
              <p className="body-atlas-region-copy">{selectedRegion.copy}</p>
              {compounds.length === 0 ? <div className="body-atlas-no-data">No sufficiently documented compound is linked to this region in the current database.</div> : (
                <>
                  <div className="body-atlas-result-heading"><span>Evidence-linked compounds</span><small>{isPro ? compounds.length : Math.min(3, compounds.length)} shown</small></div>
                  <div className="body-atlas-evidence-list">{compounds.slice(0, isPro ? 8 : 3).map(item => <EvidenceCard key={item.supplement.id} item={item} />)}</div>
                  {!isPro && <div className="body-atlas-inline-upgrade"><strong>Want the complete region?</strong><span>Pro shows all linked compounds, source trails, interactions and comparison tools.</span><button onClick={onUpgrade}>Unlock Body Atlas</button></div>}
                </>
              )}
            </>
          )}
        </aside>
      </section>

      <section className="body-atlas-note"><p><strong>How to read this map.</strong> Body Atlas is a research navigation tool. It connects body regions to goals already recorded in Evidstack. It does not diagnose, prescribe or prove that a compound will change a body part.</p><span>Current model: {model === "neutral" ? "neutral" : model === "female" ? "feminine" : "masculine"}</span></section>
      {showPaywall && <BodyAtlasPaywall onUpgrade={() => { trackEvent("body_atlas_upgrade_clicked"); setShowPaywall(false); onUpgrade(); }} onAuth={() => { setShowPaywall(false); onAuth?.("signup"); }} onClose={() => setShowPaywall(false)} />}
    </main>
  );
}


import { useId, useMemo, useState } from "react";
import { SUPPLEMENTS } from "./data.js";
import { trackEvent } from "./analytics.js";
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
            <span className="body-atlas-model-preview" aria-hidden="true"><BodySilhouette model="male" decorative /></span>
            <strong>Masculine model</strong>
            <small>Explore the evidence map</small>
          </button>
          <button className="body-atlas-choice-card" onClick={() => onChoose("female")}>
            <span className="body-atlas-model-preview" aria-hidden="true"><BodySilhouette model="female" decorative /></span>
            <strong>Feminine model</strong>
            <small>Explore the evidence map</small>
          </button>
        </div>
        <button className="body-atlas-skip" onClick={() => onChoose("neutral")}>Use a neutral view</button>
      </div>
    </div>
  );
}

function BodySilhouette({ model, view = "front", selectedId, hoveredId, onHover, onSelect, decorative = false }) {
  const uid = useId().replace(/:/g, "");
  const female = model === "female";
  const back = view === "back";
  const torso = female
    ? "M165 112 C163 128 147 132 132 137 Q118 144 121 165 C124 188 140 209 143 231 Q146 252 132 280 C121 304 125 329 142 348 Q161 360 180 344 Q199 360 218 348 C235 329 239 304 228 280 Q214 252 217 231 C220 209 236 188 239 165 Q242 144 228 137 C213 132 197 128 195 112 Z"
    : "M164 112 C162 130 145 133 124 137 Q105 143 112 174 C120 204 133 223 139 250 Q142 268 135 290 Q128 314 140 340 Q156 356 180 342 Q204 356 220 340 Q232 314 225 290 Q218 268 221 250 C227 223 240 204 248 174 Q255 143 236 137 C215 133 198 130 196 112 Z";
  const arm = female
    ? "M131 139 Q111 135 104 157 C96 182 92 207 84 229 Q77 245 75 261 L83 303 Q87 311 92 306 L105 260 Q103 247 110 232 Q121 205 128 183 Z"
    : "M121 140 Q101 134 94 158 Q83 184 85 205 L77 231 Q70 249 72 263 L80 307 Q85 314 90 306 L104 260 Q101 246 109 230 Q122 209 125 183 Z";
  const hand = female
    ? "M84 298 C78 299 74 304 70 311 L56 326 C52 331 54 337 59 338 C63 339 68 333 72 328 L66 342 C64 348 68 351 72 347 L78 335 L75 350 C75 356 80 358 83 352 L86 338 L86 350 C87 355 92 355 93 349 L93 322 C94 312 91 303 84 298 Z"
    : "M82 300 C76 301 72 306 68 313 L54 328 C50 333 52 339 57 340 C61 341 66 335 70 330 L64 344 C62 350 66 353 70 349 L76 337 L73 352 C73 358 78 360 81 354 L84 340 L84 352 C85 357 90 357 91 351 L91 325 C92 315 89 305 82 300 Z";
  const foot = female
    ? "M143 602 Q151 608 164 607 L169 625 Q173 634 166 639 L143 639 Q136 635 142 628 Q148 620 143 602 Z"
    : "M143 602 Q151 608 164 607 L169 625 Q173 634 166 639 L143 639 Q136 635 142 628 Q148 620 143 602 Z";
  const leg = female
    ? "M136 310 Q124 337 134 376 L146 443 Q141 468 145 487 Q149 522 153 552 L153 604 Q151 617 143 626 Q138 634 145 638 L166 638 Q177 636 173 626 L168 608 L172 550 Q181 512 174 484 L169 458 Q176 407 180 353 L174 321 Z"
    : "M138 309 Q126 340 134 375 L143 442 Q138 461 142 483 Q140 510 151 548 L153 604 Q151 617 142 625 Q137 634 144 638 L166 638 Q177 636 173 626 L168 607 L172 550 Q185 511 176 484 L169 456 Q181 402 180 350 L173 320 Z";
  const shape = (id, children) => decorative ? null : (
    <g key={id} className={`body-atlas-hotspot ${selectedId === id ? "is-selected" : ""} ${hoveredId === id ? "is-hovered" : ""}`}
      role="button" tabIndex={0} aria-label={`Explore ${REGION_BY_ID[id].label}`} aria-pressed={selectedId === id}
      onMouseEnter={() => onHover?.(id)} onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(id)} onBlur={() => onHover?.(null)} onClick={() => onSelect(id)}
      onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(id); } }}>
      <title>{REGION_BY_ID[id].label}</title>{children}
    </g>
  );
  return (
    <svg className="body-atlas-svg" viewBox="0 0 360 680" role={decorative ? undefined : "group"} aria-label={decorative ? undefined : `${female ? "Female" : "Male"} body, ${view} view. Choose a region.`} aria-hidden={decorative || undefined}>
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" x2="1"><stop stopColor="#825c54"/><stop offset=".18" stopColor="#c38b72"/><stop offset=".42" stopColor="#f0c1a1"/><stop offset=".55" stopColor="#f7d3b4"/><stop offset=".76" stopColor="#d69a7a"/><stop offset="1" stopColor="#8a6258"/></linearGradient>
        <radialGradient id={`${uid}-halo`}><stop stopColor="#dfc77c" stopOpacity=".24"/><stop offset="1" stopColor="#dfc77c" stopOpacity="0"/></radialGradient>
        <clipPath id={`${uid}-model-clip`}><rect x="0" y="0" width="360" height="680" rx="8" /></clipPath>
      </defs>
      <g className="atlas-rendered-model" clipPath={`url(#${uid}-model-clip)`} transform={back ? "translate(360 0) scale(-1 1)" : undefined}>
        <image href="/body-atlas-models.png" x={female ? -360 : 0} y="0" width="720" height="680" preserveAspectRatio="none" />
      </g>
      <ellipse className="atlas-legacy-body" cx="180" cy="330" rx="159" ry="302" fill={`url(#${uid}-halo)`}/>
      <g className="atlas-coordinate-lines" aria-hidden="true"><path d="M180 18V653 M35 88H325 M35 170H325 M35 312H325 M35 450H325 M35 612H325"/><ellipse cx="180" cy="648" rx="80" ry="9"/></g>
      <g className="atlas-legacy-body" fill={`url(#${uid}-body)`} stroke="#85968b" strokeWidth=".85" strokeLinejoin="round">
        <path d={arm}/><path d={arm} transform="translate(360 0) scale(-1 1)"/>
        <path d={hand}/><path d={hand} transform="translate(360 0) scale(-1 1)"/>
        <path d={leg}/><path d={leg} transform="translate(360 0) scale(-1 1)"/>
        <path d={foot}/><path d={foot} transform="translate(360 0) scale(-1 1)"/>
        <path d={torso}/>
        <path d="M163 102 L163 130 Q180 143 197 130 L197 102 Q180 111 163 102 Z"/>
        <path d={female ? "M155 62 C154 25 204 25 205 62 L203 89 Q199 108 180 118 Q161 108 157 89 Z" : "M152 61 C151 24 208 24 208 61 L205 90 Q199 112 180 119 Q161 112 155 90 Z"}/>
        <path d="M155 70 Q148 63 150 80 L157 89 M205 70 Q212 63 210 80 L203 89"/>
        <path d={female ? "M155 63 Q148 45 153 32 Q161 17 180 22 Q199 17 207 32 Q212 45 205 63 L198 50 Q180 59 162 50 Z" : "M152 61 Q154 27 180 23 Q206 27 208 61 L201 51 Q180 45 159 51 Z"} fill="#4b3533" stroke="#3a2929"/>
        {female && <path d="M154 47 Q143 53 149 75 M206 47 Q217 53 211 75" fill="none" stroke="#4b3533" strokeWidth="9" strokeLinecap="round"/>}
      </g>
      <g className="atlas-anatomy-lines" aria-hidden="true">
        {back ? <>
          <path d="M180 126V319 M170 145 Q143 149 137 172 L163 204 Q176 179 170 145 M190 145 Q217 149 223 172 L197 204 Q184 179 190 145 M153 208 Q161 253 148 282 M207 208 Q199 253 212 282 M139 308 Q157 326 179 311 Q201 326 221 308 M180 318V343 M150 357L158 430 M210 357L202 430 M153 466Q159 507 161 548 M207 466Q201 507 199 548"/>
          <path d="M159 62Q180 43 201 62 M174 112L174 129 M186 112L186 129"/>
        </> : <>
          <path d="M158 68Q168 62 175 68 M185 68Q192 62 202 68 M180 71L176 87L182 88 M171 98Q180 101 189 98 M167 119L174 140 M193 119L186 140 M174 145Q150 136 132 152 M186 145Q210 136 228 152"/>
          <path d="M58 330L69 319 M66 343L77 328 M75 349L84 333 M84 350L89 335 M302 330L291 319 M294 343L283 328 M285 349L276 333 M276 350L271 335"/>
          <path d="M143 627L164 627 M217 627L196 627"/>
          <path d={female ? "M137 172 Q130 199 157 202 Q176 202 177 181 M223 172 Q230 199 203 202 Q184 202 183 181 M151 215Q156 247 148 272 M209 215Q204 247 212 272" : "M128 168 Q142 154 174 166 L174 194 Q147 207 128 189 M232 168 Q218 154 186 166 L186 194 Q213 207 232 189 M154 211H174 M186 211H206 M154 232H174 M186 232H206 M157 253H174 M186 253H203"}/>
          <path d="M180 205V267 M177 276Q180 279 183 276 M140 296L168 320 M220 296L192 320 M149 351Q154 389 157 426 M211 351Q206 389 203 426 M150 450Q157 440 165 450 M195 450Q203 440 210 450 M156 474L162 546 M204 474L198 546 M103 175L91 226 M257 175L269 226 M87 263L68 309 M273 263L292 309"/>
        </>}
      </g>
      {shape("muscles", <path d="M108 163Q94 181 94 209L86 228L100 234Q117 203 120 177 Z M252 163Q266 181 266 209L274 228L260 234Q243 203 240 177 Z M142 348Q143 394 151 430L165 431L173 351 Z M218 348Q217 394 209 430L195 431L187 351 Z M149 480Q147 507 158 540L169 539Q175 511 168 482 Z M211 480Q213 507 202 540L191 539Q185 511 192 482 Z"/>)}
      {shape("joints", <g>{[[94,247],[266,247],[157,452],[203,452],[161,591],[199,591]].map(([cx,cy])=><circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="10"/>)}</g>)}
      {shape("brain", <path d="M159 58C158 31 201 31 201 58L197 65Q180 59 163 65Z"/>)}
      {!back && shape("eyes", <g><ellipse cx="167" cy="73" rx="10" ry="6"/><ellipse cx="193" cy="73" rx="10" ry="6"/></g>)}
      {!back && shape("thyroid", <path d="M169 127Q175 121 180 129Q185 121 191 127L188 140L180 137L172 140Z"/>)}
      {!back && shape("lungs", <path d="M170 159Q148 148 138 178L136 206Q149 219 172 208 Z M190 159Q212 148 222 178L224 206Q211 219 188 208Z"/>)}
      {!back && shape("heart", <path d="M184 185C186 174 199 177 203 188Q209 202 191 218Q178 206 179 194Z"/>)}
      {!back && shape("liver", <path d="M142 222Q161 212 188 223L204 230Q179 233 165 245Q146 250 141 238Z"/>)}
      {!back && shape("gut", <path d="M154 253Q180 246 206 253L205 284Q193 303 180 298Q162 304 155 287Z"/>)}
      {back && shape("kidneys", <path d="M153 232C136 229 137 256 150 260Q165 257 156 247Q166 238 153 232Z M207 232C224 229 223 256 210 260Q195 257 204 247Q194 238 207 232Z"/>)}
      {!back && shape("reproductive", female ? <path d="M160 313Q168 305 180 319Q192 305 200 313L195 322L186 322L183 338H177L174 322L165 322Z"/> : <path d="M165 322Q180 314 195 322L190 340Q180 350 170 340Z"/>)}
      <g className="atlas-coordinate-labels" aria-hidden="true"><text x="24" y="25">{back ? "POSTERIOR" : "ANTERIOR"}</text><text x="282" y="25">{female ? "F / 02" : model === "neutral" ? "N / 03" : "M / 01"}</text><text x="24" y="661">EVIDSTACK / ATLAS</text><text x="282" y="661">01 : 12</text></g>
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
  const [model, setModel] = useState(() => safeStorageGet("evid_body_atlas_model"));
  const [selectedId, setSelectedId] = useState(null);
  const [demoUsed, setDemoUsed] = useState(() => !isPro && safeSessionGet("evid_body_atlas_demo_used"));
  const [showPaywall, setShowPaywall] = useState(false);
  const [view, setView] = useState("front");
  const [hoveredId, setHoveredId] = useState(null);
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
    if (id === "kidneys") setView("back");
    else if (["eyes", "thyroid", "lungs", "heart", "liver", "gut", "reproductive"].includes(id)) setView("front");
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
            <BodySilhouette model={model} view={view} selectedId={selectedId} hoveredId={hoveredId} onHover={setHoveredId} onSelect={selectRegion} />
            <span className="body-atlas-canvas-hint">{hoveredId ? REGION_BY_ID[hoveredId].label : "Select a region to explore"}</span>
          </div>
          <div className="body-atlas-region-pills">
            {REGIONS.map(region => <button key={region.id} className={`${selectedId === region.id ? "is-active" : ""} ${hoveredId === region.id ? "is-hovered" : ""}`} onMouseEnter={() => setHoveredId(region.id)} onMouseLeave={() => setHoveredId(null)} onFocus={() => setHoveredId(region.id)} onBlur={() => setHoveredId(null)} aria-pressed={selectedId === region.id} onClick={() => selectRegion(region.id)}>{region.shortLabel}</button>)}
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


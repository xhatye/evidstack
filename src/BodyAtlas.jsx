import { useMemo, useState } from "react";
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

// Coordinates are measured against each original 1024 × 1536 asset.
// Image and hit areas share this viewBox, so resizing cannot separate them.
const ATLAS_GEOMETRY = {
  'male-front': {
    arms: ['M335 335 Q315 370 310 428 L286 504 L327 523 Q354 475 366 421 Q374 361 355 338Z', 'M281 549 Q258 580 247 625 L223 683 L248 697 Q279 647 296 615 L318 559Z', 'M675 335 Q698 374 705 433 L725 505 L684 522 Q663 476 649 423 Q638 368 654 340Z', 'M697 551 L725 541 Q753 584 767 633 L785 685 L765 697 Q736 654 718 618Z'],
    legs: ['M375 810 Q367 862 384 918 L393 971 L441 970 Q459 914 469 821Z','M539 822 Q550 909 575 970 L621 970 Q644 894 632 812Z','M371 1080 Q353 1123 367 1190 L376 1260 L394 1258 Q407 1205 414 1155 L409 1084Z','M600 1081 Q589 1132 608 1200 L624 1259 L643 1258 Q651 1196 644 1147 L628 1080Z'],
    joints: [[306,529],[710,529],[412,1018],[607,1018],[374,1301],[632,1301]],
    head:[508,83,56,37], eyes:[[476,123],[535,123]], neck:269, chest:373, abdomen:572, pelvis:737, skin:[196,771]
  },
  'female-front': {
    arms:['M354 331 Q337 351 335 401 L324 468 L311 514 L343 528 Q362 477 371 432 L379 372Z','M299 564 Q277 597 262 646 L237 697 L258 703 Q291 660 313 617 L329 570Z','M647 332 Q669 357 670 401 L685 476 L699 514 L668 528 Q648 482 638 430 L628 375Z','M686 565 L710 558 Q734 599 752 647 L772 698 L752 705 Q722 666 701 621Z'],
    legs:['M374 810 Q369 882 389 949 L400 1001 L455 1000 Q475 916 477 816Z','M532 816 Q537 920 555 1001 L611 1001 Q634 913 631 811Z','M393 1090 Q377 1127 386 1193 L400 1296 L426 1296 Q442 1212 444 1165 L437 1090Z','M568 1090 Q558 1140 572 1209 L587 1297 L612 1297 Q630 1199 626 1157 L610 1090Z'],
    joints:[[322,543],[687,543],[427,1047],[583,1047],[411,1330],[599,1330]],
    head:[503,110,49,28], eyes:[[478,153],[533,153]], neck:282, chest:410, abdomen:576, pelvis:736, skin:[207,776]
  },
  'male-back': {
    arms:['M334 300 Q315 340 312 397 L291 468 L326 485 Q351 435 363 382 L363 321Z','M281 519 Q261 555 251 610 L238 666 L261 673 Q285 630 301 582 L316 531Z','M684 302 Q704 345 704 397 L723 470 L689 484 Q663 434 650 382 L650 322Z','M704 519 L727 520 Q751 559 765 611 L777 668 L753 675 Q730 628 719 581Z'],
    legs:['M380 807 Q373 871 395 933 L409 982 L455 979 Q475 890 477 808Z','M539 808 Q546 899 566 980 L610 981 Q634 900 631 809Z','M383 1076 Q365 1125 382 1190 L392 1273 L418 1273 Q436 1178 435 1129 L423 1078Z','M580 1077 Q568 1124 580 1190 L597 1273 L621 1273 Q639 1168 627 1120 L614 1077Z'],
    joints:[[306,502],[708,502],[429,1028],[586,1028],[407,1320],[610,1320]],
    head:[508,104,53,57], kidneys:[[451,559],[565,559]], skin:[228,764]
  },
  'female-back': {
    arms:['M363 309 Q345 339 341 393 L323 458 L356 478 Q381 418 384 366 L380 318Z','M302 530 Q285 555 273 606 L253 665 L274 675 Q304 628 323 580 L335 540Z','M655 308 Q676 343 682 399 L696 460 L665 477 Q643 424 631 366 L636 318Z','M681 531 L704 525 Q730 558 746 611 L765 667 L743 679 Q717 633 698 589Z'],
    legs:['M384 804 Q382 883 402 950 L411 989 L465 985 Q485 894 482 805Z','M537 805 Q542 898 558 986 L609 989 Q632 909 632 804Z','M401 1087 Q385 1134 398 1212 L410 1286 L432 1286 Q451 1188 447 1140 L438 1090Z','M567 1086 Q554 1130 565 1204 L577 1286 L603 1286 Q624 1188 616 1140 L602 1087Z'],
    joints:[[330,507],[681,507],[432,1031],[583,1031],[420,1318],[591,1318]],
    head:[508,120,52,52], kidneys:[[454,550],[561,550]], skin:[230,750]
  }
};

function BodySilhouette({ model, view = 'front', selectedId, hoveredId, onHover, onSelect, decorative = false }) {
  const female = model === 'female';
  const back = view === 'back';
  const sex = female ? 'female' : 'male';
  const geo = ATLAS_GEOMETRY[sex + '-' + view];
  const ellipse = ([cx, cy, rx = 24, ry = 24]) => <ellipse key={cx + '-' + cy} cx={cx} cy={cy} rx={rx} ry={ry}/>;
  const shape = (id, children) => decorative ? null : (
    <g key={id} className={['body-atlas-hotspot', selectedId === id ? 'is-selected' : '', hoveredId === id ? 'is-hovered' : ''].join(' ')}
      role="button" tabIndex={0} aria-label={'Explore ' + REGION_BY_ID[id].label} aria-pressed={selectedId === id}
      onMouseEnter={() => onHover?.(id)} onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(id)} onBlur={() => onHover?.(null)} onClick={() => onSelect(id)}
      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(id); } }}>
      <title>{REGION_BY_ID[id].label}</title>{children}
    </g>
  );
  return (
    <svg className="body-atlas-svg" viewBox="0 0 1024 1536" role={decorative ? undefined : 'group'}
      aria-label={decorative ? undefined : (female ? 'Female' : 'Male') + ' body, ' + view + ' view. Choose a region.'} aria-hidden={decorative || undefined}>
      <g className="atlas-rendered-model">
        <image href={'/body-atlas-' + sex + (back ? '-back' : '') + '.png'} width="1024" height="1536"/>
      </g>
      {shape('muscles', [...geo.arms, ...geo.legs].map((d,i) => <path key={i} d={d}/>))}
      {shape('joints', geo.joints.map(point => ellipse([...point, 23, 22])))}
      {shape('brain', ellipse(geo.head))}
      {shape('skin', ellipse([...geo.skin, 20, 24]))}
      {back ? shape('kidneys', geo.kidneys.map(point => ellipse([...point, 23, 34]))) : <>
        {shape('eyes', geo.eyes.map(point => ellipse([...point, 18, 10])))}
        {shape('thyroid', <path d={'M482 '+geo.neck+' Q494 '+(geo.neck-9)+' 505 '+(geo.neck+4)+' Q516 '+(geo.neck-9)+' 528 '+geo.neck+' L524 '+(geo.neck+21)+' L505 '+(geo.neck+14)+' L486 '+(geo.neck+21)+'Z'}/>)}
        {shape('lungs', <g>{ellipse([462,geo.chest,34,57])}{ellipse([548,geo.chest,34,57])}</g>)}
        {shape('heart', ellipse([531,geo.chest+37,22,30]))}
        {shape('liver', ellipse([465,geo.chest+109,43,23]))}
        {shape('gut', ellipse([505,geo.abdomen,67,64]))}
        {shape('reproductive', ellipse([505,geo.pelvis,38,26]))}
      </>}
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


import { useEffect, useMemo, useState } from 'react';
import { EVIDENCE_STATES, filterSources, researchCounts } from './model.js';
import './research.css';

const sections = [['overview','Overview'],['benefits','Benefits & Evidence'],['risks','Risks & Interactions'],['doses','Studied Doses'],['mechanism','How It Works'],['sources','Studies & Sources']];
const missing = 'Not extracted from the reviewed source';

function Citations({ids, sources, onSource}) {
  return <span className="research-citations">{ids.map(id => {
    const source = sources.find(s => s.id === id);
    return source ? <a key={id} href={`#source-${id}`} onClick={e=>{e.preventDefault();onSource(id);}} aria-label={`Read source: ${source.label}`}>{source.label} ↗</a> : null;
  })}</span>;
}

export function StudyChart({charts, sources, onSource, selected, onSelect}) {
  const chart = charts.find(c=>c.id===selected) || charts[0];
  const [active,setActive] = useState(null);
  if (!chart) return null;
  const maximum = Math.max(...chart.arms.flatMap(a=>a.ci.map(Math.abs))) * 1.08;
  return <figure className="research-chart" aria-labelledby="research-chart-title">
    <div className="research-section-head"><div><span className="research-kicker">EXPLORE THE RESULTS</span><h3 id="research-chart-title">{chart.title}</h3></div>
      <label>Trial comparison<select value={chart.id} onChange={e=>{onSelect(e.target.value);setActive(null);}}>{charts.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
    </div>
    <p>{chart.population} · {chart.duration}</p><p className="research-small">{chart.unit}. Bar length represents the magnitude of reduction; markers show the confidence interval.</p>
    <div className="research-bars">{chart.arms.map((arm,i)=><button key={`${chart.id}-${arm.name}`} className={`research-bar-row ${active===i?'is-selected':''}`} onClick={()=>setActive(i)} onFocus={()=>setActive(i)} aria-label={`${arm.name}: ${arm.value} percent; 95 percent confidence interval ${arm.ci.join(' to ')}`}>
      <span>{arm.name}</span><span className="research-bar-track"><span className="research-bar" style={{width:`${Math.abs(arm.value)/maximum*100}%`}}/><span className="research-ci" style={{left:`${Math.abs(arm.ci[1])/maximum*100}%`,width:`${(Math.abs(arm.ci[0])-Math.abs(arm.ci[1]))/maximum*100}%`}}/></span><strong>{arm.value.toFixed(1)}%</strong>
    </button>)}</div>
    <p aria-live="polite" className="research-chart-readout">{active!==null?`${chart.arms[active].name}: ${chart.arms[active].value}% (95% CI ${chart.arms[active].ci[0]} to ${chart.arms[active].ci[1]}).`:'Select a bar to inspect its estimate and uncertainty.'}</p>
    <figcaption>{chart.note}<Citations ids={[chart.sourceId]} sources={sources} onSource={onSource}/></figcaption>
    <details><summary>Read the data as a table</summary><div className="research-table-wrap"><table><caption>{chart.title} at {chart.duration}</caption><thead><tr><th scope="col">Treatment</th><th scope="col">Weight change</th><th scope="col">95% CI</th></tr></thead><tbody>{chart.arms.map(a=><tr key={a.name}><th scope="row">{a.name}</th><td>{a.value}%</td><td>{a.ci.join(' to ')}%</td></tr>)}</tbody></table></div></details>
  </figure>;
}

function SourceLibrary({profile, locked, onUpgrade, selectedSource, onSource}) {
  const [filters,setFilters] = useState({query:'',kind:'',goal:'',year:'',population:''});
  const filtered = useMemo(()=>filterSources(profile.sources, filters),[profile,filters]);
  useEffect(()=>{if(selectedSource)setFilters({query:'',kind:'',goal:'',year:'',population:''});},[selectedSource]);
  useEffect(()=>{
    if (!selectedSource) return;
    const element=document.getElementById(`source-${selectedSource}`);
    if(element){element.scrollIntoView({block:'start',behavior:'instant'});element.focus({preventScroll:true});}
  },[selectedSource,filtered]);
  const update=(key,value)=>{onSource(null);setFilters(f=>({...f,[key]:value}));};
  const options = key => [...new Set(profile.sources.flatMap(s=>s[key]||[]))].sort();
  return <>
    <p>Only references in this record are counted. Publications can report the same trial; reviews can include overlapping participants. No pooled participant total is implied.</p>
    <div className="research-filters">
      <label className="research-search">Search references<input type="search" value={filters.query} onChange={e=>update('query',e.target.value)} placeholder="Title, author, trial, PMID or DOI"/></label>
      {[['kind','Study type','kind'],['goal','Outcome','goals'],['year','Publication year','year'],['population','Population','populationGroup']].map(([key,label,field])=><label key={key}>{label}<select value={filters[key]} onChange={e=>update(key,e.target.value)}><option value="">All</option>{options(field).map(v=><option key={v} value={v}>{v}</option>)}</select></label>)}
    </div>
    <p className="research-small" role="status">{filtered.length} of {profile.sources.length} references shown <button className="research-text-button" onClick={()=>{onSource(null);setFilters({query:'',kind:'',goal:'',year:'',population:''});}}>Reset filters</button></p>
    {!filtered.length&&<p className="research-empty">No references match these filters. Try another term or reset the filters.</p>}
    <div className="research-source-list">{filtered.map(s=><article className="research-source" id={`source-${s.id}`} tabIndex={-1} key={s.id}>
      <div className="research-source-meta"><span>{s.kind}</span><span>{s.level}</span><span>{s.year}{s.onlineYear?` · online ${s.onlineYear}`:''}</span>{s.sampleSize!==null&&s.sampleSize!==undefined&&<span>n = {s.sampleSize.toLocaleString('en-US')}</span>}</div>
      <h3>{s.title}</h3><p className="research-small">{s.authors} · {s.journal}</p>
      {!locked&&<p>{s.result}</p>}
      <div className="research-source-links"><a href={s.url} target="_blank" rel="noreferrer">{s.pmid?`PubMed · ${s.pmid}`:'Official document'} ↗</a>{s.doi&&<a href={`https://doi.org/${s.doi}`} target="_blank" rel="noreferrer">DOI ↗</a>}{(s.trialIds||[]).map(id=><a key={id} href={`https://clinicaltrials.gov/study/${id}`} target="_blank" rel="noreferrer">{id} ↗</a>)}</div>
      {locked?<button className="research-text-button" onClick={onUpgrade}>View study details with Pro ↗</button>:<details open={selectedSource===s.id?true:undefined}><summary>Study details & limitations</summary><dl className="research-details">{[['Design',s.design||s.kind],['Population',s.population],['Dose studied',s.dose],['Duration',s.duration],['Comparator',s.comparator],['Adverse events',s.adverseEvents],['Limitations',s.limitations],['What was checked',s.reviewScope],['Checked on',s.checkedAt]].map(([name,value])=><div key={name}><dt>{name}</dt><dd>{value||missing}</dd></div>)}</dl></details>}
    </article>)}</div>
  </>;
}

export default function CompoundResearch({profile,locked,onUpgrade,onBack,onSave,saved,saving,saveError,onInteractions}) {
  const [active,setActive]=useState('overview');
  const [source,setSource]=useState(null);
  const [chart,setChart]=useState(profile.charts[0]?.id||'');
  const counts=researchCounts(profile);
  const sectionsAvailable=sections.filter(([id])=>id!=='mechanism'||profile.mechanisms.length);
  useEffect(()=>{
    const readHash=()=>{
      const id=decodeURIComponent(window.location.hash.slice(1));
      if(id.startsWith('source-')&&profile.sources.some(s=>s.id===id.slice(7))){setSource(id.slice(7));setActive('sources');}
      else if(sectionsAvailable.some(([key])=>key===id)){setSource(null);setActive(id);}
    };
    readHash();window.addEventListener('hashchange',readHash);return()=>window.removeEventListener('hashchange',readHash);
  },[profile]);
  const go=(id,sourceId=null)=>{
    setActive(id);setSource(sourceId);
    window.history.replaceState(window.history.state,'',`${window.location.pathname}${window.location.search}#${sourceId?`source-${sourceId}`:id}`);
    requestAnimationFrame(()=>{const el=document.getElementById(sourceId?`source-${sourceId}`:'research-panel');if(el){el.focus({preventScroll:true});el.scrollIntoView({block:'start',behavior:'instant'});}});
  };
  const cite=ids=><Citations ids={ids} sources={profile.sources} onSource={id=>go('sources',id)}/>;
  const protectedSection=locked&&!['overview','sources'].includes(active);
  const keyNav=(event,index)=>{
    const offset=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
    const target=event.key==='Home'?0:event.key==='End'?sectionsAvailable.length-1:offset?(index+offset+sectionsAvailable.length)%sectionsAvailable.length:null;
    if(target===null)return;event.preventDefault();document.getElementById(`research-tab-${sectionsAvailable[target][0]}`)?.focus();
  };
  return <main className="research-page">
    <button className="research-back" onClick={onBack}>← Browse compounds</button>
    <header className="research-hero">
      <div className="research-hero-copy"><p className="research-kicker">COMPOUND RESEARCH <span> / {profile.category}</span></p><h1>{profile.name}</h1><p className="research-aliases">{profile.aliases}</p><p className="research-intro">{profile.introduction}</p>
        <div className="research-actions"><button className="research-button is-dark" onClick={onSave} disabled={saving}>{saving?'Saving…':saved?'Saved to My Stack ✓':'Save to My Stack +'}</button><button className="research-button" onClick={onInteractions}>Check interactions ↗</button>{profile.charts.length>1&&<button className="research-button" onClick={()=>{setChart('head-to-head');go('benefits');}}>Compare with semaglutide ↗</button>}</div>
        {saveError&&<p role="alert" className="research-error">{saveError}</p>}
      </div>
      <aside className="research-hero-aside"><p className="research-kicker">THE EVIDENCE AT A GLANCE</p><strong>{counts.publications}<span> publications in this record</span></strong><dl><div><dt>Individually indexed trials</dt><dd>{counts.trials}</dd></div><div><dt>Systematic reviews</dt><dd>{counts.reviews}</dd></div><div><dt>Animal publications</dt><dd>{counts.preclinical}</dd></div><div><dt>Official documents</dt><dd>{counts.official}</dd></div></dl><button className="research-text-button" onClick={()=>go('sources')}>Explore all {counts.references} references ↗</button><p className="research-small">Selected evidence, not the total literature.</p></aside>
    </header>
    <nav className="research-tabs" role="tablist" aria-label="Compound research sections">{sectionsAvailable.map(([id,label],i)=><button key={id} id={`research-tab-${id}`} role="tab" aria-selected={active===id} aria-controls="research-panel" tabIndex={active===id?0:-1} onKeyDown={e=>keyNav(e,i)} onClick={()=>go(id)}>{label}</button>)}</nav>
    <section className="research-panel" id="research-panel" role="tabpanel" tabIndex={-1} aria-labelledby={`research-tab-${active}`}>
      {protectedSection?<div className="research-lock"><p className="research-kicker">PRO RESEARCH</p><h2>Follow the evidence in detail.</h2><p>The full outcome analysis, studied doses and research tools keep their existing Pro access. The overview and source links remain available.</p><button className="research-button is-gold" onClick={onUpgrade}>Explore Pro ↗</button><button className="research-text-button" onClick={()=>go('sources')}>Browse source links</button></div>:<>
      {active==='overview'&&<>
        <div className="research-section-head"><div><p className="research-kicker">START HERE</p><h2>What the evidence says.</h2></div><span className="research-badge">{profile.status}</span></div>
        <p className="research-takeaway">{profile.takeaway}</p>{cite(profile.outcomes.flatMap(o=>o.sourceIds).filter((id,i,a)=>a.indexOf(id)===i))}
        <div className="research-outcome-grid">{profile.outcomes.map(o=><article className="research-outcome" key={o.id}><span className="research-kicker">{o.label}</span><h3>{o.confidence}</h3><p>{o.summary}</p><button className="research-text-button" onClick={()=>go('benefits')}>Read evidence & limits ↗</button></article>)}</div>
        {!!profile.regulation.length&&<div className="research-regulation">{profile.regulation.map(r=><div key={r.label}><h3>{r.label}</h3><p>{r.text}</p>{cite(r.sourceIds)}</div>)}</div>}
        <div className="research-scope"><h3>How much has been checked?</h3><p>{profile.scope}</p><p className="research-small">Source check: {profile.checkedAt}. Latest publication in this selection: {counts.latestPublication??'Not recorded'}. Official-document dates are counted separately. This is not a clinician review date.</p><button className="research-text-button" onClick={()=>go('sources')}>See exactly what was reviewed ↗</button></div>
      </>}
      {active==='benefits'&&<>
        <p className="research-kicker">OUTCOMES, NOT ONE OVERALL SCORE</p><h2>Benefits in context.</h2><p>Effect size, confidence and safety answer different questions. These summaries use the identified sources, without a numerical overall rating.</p>
        <StudyChart charts={profile.charts} sources={profile.sources} onSource={id=>go('sources',id)} selected={chart} onSelect={setChart}/>
        {profile.outcomes.map(o=><article className="research-evidence" key={o.id}><span className="research-badge">{EVIDENCE_STATES[o.status]}</span><h3>{o.label}</h3><p>{o.summary}</p><p><strong>Why this confidence:</strong> {o.reason}</p>{cite(o.sourceIds)}</article>)}
      </>}
      {active==='risks'&&<>
        <p className="research-kicker">BENEFITS HAVE TRADE-OFFS</p><h2>Risks & interactions.</h2><p>Recorded warnings are not a complete assessment for an individual. A missing interaction record does not establish that a combination is safe.</p>
        {profile.risks.length?profile.risks.map(r=><article className="research-risk" key={r.label}><h3>{r.label}</h3><p>{r.text}</p>{cite(r.sourceIds)}</article>):<div className="research-scope"><h3>Safety review incomplete</h3><p>The selected review does not supply a complete safety or interaction assessment. No “safe” rating is assigned.</p></div>}
        <button className="research-button is-dark" onClick={onInteractions}>Open interaction checker with {profile.name} ↗</button>
      </>}
      {active==='doses'&&<>
        <p className="research-kicker">WHAT WAS STUDIED</p><h2>Doses, populations & comparators.</h2><p>These describe research protocols, not a personal dosing plan. Formulation, indication and medical context matter.</p>
        {profile.sources.filter(s=>s.dose).length?profile.sources.filter(s=>s.dose).map(s=><article key={s.id} className="research-evidence"><h3>{s.label}</h3><p><strong>{s.dose}</strong></p><p>{s.population} · {s.duration||missing}</p><p>Comparator: {s.comparator||missing}</p>{s.level==='Animal'&&<p className="research-error">Animal dose only. Do not convert this into a human regimen.</p>}{cite([s.id])}</article>):<div className="research-scope"><h3>Dose not extracted</h3><p>The reviewed source does not provide a single verified regimen for this record. No dose is inferred from the catalogue.</p></div>}
        {profile.id==='tirzepatide'&&<p className="research-small">For product-specific administration, consult the current US prescribing information or EU product information with a clinician. This page does not provide a reconstitution calculator.{cite(['label','ema'])}</p>}
      </>}
      {active==='mechanism'&&<>
        <p className="research-kicker">FROM TARGET TO EFFECT</p><h2>How it works.</h2><p>A biological mechanism explains a possible route to an effect. Clinical benefits must still be tested in people.</p>
        <ol className="research-pathway">{profile.mechanisms.map((m,i)=><li key={m.label}><span className="research-step">0{i+1}</span><div><span className="research-badge">{m.evidence}</span><h3>{m.label}</h3><p>{m.text}</p>{cite(m.sourceIds)}</div></li>)}</ol><p className="research-small">This is an explanatory sequence, not a quantitative model or proof of each proposed pathway in humans.</p>
      </>}
      {active==='sources'&&<><p className="research-kicker">FOLLOW EACH CLAIM TO ITS SOURCE</p><h2>Studies & sources.</h2><SourceLibrary profile={profile} locked={locked} onUpgrade={onUpgrade} selectedSource={source} onSource={setSource}/></>}
      </>}
    </section>
    <footer className="research-footer"><p>Research information, not a prescription. Discuss treatment decisions and interactions with a qualified clinician.</p><a href={`/compound/${profile.id}#overview`} onClick={e=>{e.preventDefault();go('overview');}}>Back to overview ↑</a></footer>
  </main>;
}

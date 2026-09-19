import { researchCounts } from './model.js';
import './research.css';

// Public entry points use the same record as the profile, never legacy scores.
export function ResearchSnapshot({profile, onOpen, onShare, copied}) {
  const counts=researchCounts(profile);
  return <main className="research-page"><p className="research-kicker">FREE EVIDENCE SNAPSHOT</p><h1>{profile.name}</h1><p className="research-takeaway">{profile.takeaway}</p><div className="research-actions"><button className="research-button is-dark" onClick={onOpen}>Open full profile ↗</button><button className="research-button" onClick={onShare}>{copied?'Link copied':'Share snapshot ↗'}</button></div><section className="research-panel" style={{marginTop:24}}><h2>Evidence in this record</h2><p>{counts.publications} publications · {counts.trials} individually indexed trials · {counts.official} official documents.</p><p>{profile.scope}</p>{profile.outcomes.map(o=><article className="research-evidence" key={o.id}><h3>{o.label}</h3><p>{o.summary}</p><div className="research-citations">{o.sourceIds.map(id=>{const s=profile.sources.find(s=>s.id===id);return <a key={id} href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>;})}</div></article>)}<p className="research-small">Source check: {profile.checkedAt}. Research information, not a prescription.</p></section></main>;
}

export function ResearchComparison({profile, other, onOpen}) {
  const direct=other.id==='semaglutide';
  const sources=direct?profile.sources.filter(s=>['surmount5','surpass2'].includes(s.id)):[];
  return <main className="research-page"><p className="research-kicker">DIRECT COMPARISON</p><h1>{profile.name} vs {other.name}</h1><p>Compare the same population, outcome and study period. Separate catalogue scores cannot establish which treatment works better.</p><section className="research-panel"><h2>{direct?'Two different clinical questions':'No direct comparison documented here'}</h2>{sources.map(s=><article className="research-evidence" key={s.id}><h3>{s.label}</h3><p>{s.population} · {s.duration}</p><p><strong>Studied doses:</strong> {s.dose}</p><p>{s.result}</p><p><strong>Limits:</strong> {s.limitations}</p><a href={s.url} target="_blank" rel="noreferrer">Read {s.label} on PubMed ↗</a></article>)}{!direct&&<p>This pilot has not reviewed a head-to-head study for this pair. That does not establish that no such study exists.</p>}<div className="research-actions"><button className="research-button is-dark" onClick={()=>onOpen(profile)}>Open {profile.name} ↗</button><button className="research-button" onClick={()=>onOpen(other)}>Open {other.name} ↗</button></div></section></main>;
}

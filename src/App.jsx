import { useState, useMemo, useEffect } from "react";

function useIsMobile(){ 
  const [m,setM]=useState(()=>typeof window!=="undefined"&&window.innerWidth<768);
  useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return m;
}

const ROUTES = {
  "/":"supplements",
  "/supplements":"supplements",
  "/protocols":"protocols",
  "/stack-builder":"stack-builder",
  "/about":"about",
  "/legal":"legal",
};

function getPageFromPath(){
  return ROUTES[window.location.pathname]||"supplements";
}

function navigate(page){
  const path = page==="supplements"?"/":`/${page}`;
  window.history.pushState({},"",path);
}
import { SUPPLEMENTS, GOALS, TIERS } from "./data.js";
import { AuthProvider, useAuth } from "./AuthContext.jsx";

const C = {
  bg:"#f4f2ee",white:"#ffffff",black:"#0a0a0a",ink:"#1a1a1a",
  gray:"#6b7280",light:"#e8e5df",border:"#d4d0c8",
  green:"#16a34a",blue:"#2563eb",amber:"#d97706",red:"#dc2626",purple:"#7c3aed",
  gold:"#e2c97e",
};

const T = {
  nav: { supplements:"Supplements", protocols:"Protocols", about:"About" },
  controls: { search:"Search a supplement...", sortEfficacy:"Efficacy", sortEvidence:"Evidence", sortTier:"Tier", tierAll:"All Tiers", tiers:["Fundamentals","Advanced","Expert","Biohacking"], result:(n)=>`${n} result${n!==1?"s":""}`, goals:["All","Sleep","Focus","Memory","Mood","Strength","Recovery","Energy","Testosterone","Stress","Longevity","Skin","Cardio","Endurance","Weight Loss","Hair Health","Liver / Detox"] },
  card: { dosage:"Dosage", interactions:"Interactions", noInteractions:"None known", negative:"NEGATIVE", efficacy:"Efficacy", evidence:"Evidence", avgEfficacy:"Avg. efficacy", avgEvidence:"Avg. evidence", safety:["","RISKY","CAUTION","CAUTION","SAFE","VERY SAFE"], studies:(n,tp)=>`${n} studies / ${tp}` },
  footer:"Data sourced from PubMed meta-analyses and Cochrane reviews. For informational purposes only. Consult a healthcare professional before supplementing.",
  noResults:"No results",
};

const tierColor=(t)=>[null,C.green,C.blue,C.purple,C.amber][t]||C.gray;
const efColor=(v)=>v<0?C.red:v>=4?C.green:v===3?C.blue:v===2?C.amber:C.gray;

/* WAITLIST */
function WaitlistForm(){
  const [email,setEmail]=useState("");
  const [done,setDone]=useState(false);
  const isMob=useIsMobile();
  const submit=(e)=>{e.stopPropagation();if(email.includes("@"))setDone(true);};
  if(done)return <p style={{fontSize:13,color:"#4ade80",fontWeight:700,margin:0}}>You are on the list. We will reach out when Pro launches.</p>;
  return(
    <div style={{display:"flex",flexDirection:isMob?"column":"row",gap:isMob?8:0,maxWidth:440,width:"100%"}} onClick={e=>e.stopPropagation()}>
      <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit(e)} placeholder="your@email.com"
        style={{flex:1,padding:"11px 16px",background:"#1f2937",border:"1px solid #374151",borderRight:isMob?"1px solid #374151":"none",color:"#e8e5df",fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",width:isMob?"100%":"auto",boxSizing:"border-box"}}/>
      <button onClick={submit} style={{padding:"11px 20px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",flexShrink:0,width:isMob?"100%":"auto"}}>
        Notify me
      </button>
    </div>
  );
}

/* AUTH MODAL */
function AuthModal({onClose,initialMode="login"}){
  const {loginEmail,signupEmail,loginGoogle}=useAuth();
  const [mode,setMode]=useState(initialMode);
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const submit=async()=>{
    setError("");setLoading(true);
    try{
      if(mode==="login")await loginEmail(email,pw);
      else await signupEmail(email,pw);
      onClose();
    }catch(e){
      setError(e.code==="auth/invalid-credential"?"Incorrect email or password.":
               e.code==="auth/email-already-in-use"?"Email already registered.":
               e.code==="auth/weak-password"?"Password must be at least 6 characters.":
               "Something went wrong. Try again.");
    }finally{setLoading(false);}
  };
  const google=async()=>{
    setError("");setLoading(true);
    try{await loginGoogle();onClose();}
    catch(e){setError("Google sign-in failed.");setLoading(false);}
  };
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,width:"100%",maxWidth:400,padding:"40px 36px",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.gray}}>x</button>
        <p style={{fontSize:9,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>Evidstack</p>
        <h2 style={{fontSize:24,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 24px"}}>{mode==="login"?"Sign in":"Create account"}</h2>
        <button onClick={google} disabled={loading} style={{width:"100%",padding:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,border:`1px solid ${C.border}`,background:C.white,cursor:"pointer",fontSize:13,fontWeight:700,marginBottom:20,fontFamily:"Montserrat,sans-serif"}}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:11,color:C.gray}}>or</span><div style={{flex:1,height:1,background:C.border}}/>
        </div>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email"
          style={{width:"100%",padding:"11px 14px",border:`1px solid ${C.border}`,marginBottom:10,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",boxSizing:"border-box"}}/>
        <input value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Password" type="password"
          style={{width:"100%",padding:"11px 14px",border:`1px solid ${C.border}`,marginBottom:16,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",boxSizing:"border-box"}}/>
        {error&&<p style={{fontSize:12,color:C.red,margin:"0 0 12px"}}>{error}</p>}
        <button onClick={submit} disabled={loading} style={{width:"100%",padding:"13px",background:C.ink,color:C.white,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif"}}>
          {loading?"...":(mode==="login"?"Sign in":"Create account")}
        </button>
        <p style={{fontSize:12,color:C.gray,textAlign:"center",margin:"16px 0 0"}}>
          {mode==="login"?"No account? ":"Already have one? "}
          <span onClick={()=>setMode(mode==="login"?"signup":"login")} style={{color:C.ink,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>
            {mode==="login"?"Sign up":"Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}

/* UPGRADE MODAL */
function UpgradeModal({onClose,onAuthNeeded}){
  const {user}=useAuth();
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const checkout=async()=>{
    if(!user){onClose();onAuthNeeded();return;}
    setLoading(true);setError("");
    try{
      const res=await fetch("/api/stripe-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:user.uid,email:user.email})});
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      window.location.href=data.url;
    }catch(e){setError(e.message||"Something went wrong.");setLoading(false);}
  };
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,width:"100%",maxWidth:440,position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.gray}}>x</button>
        <div style={{borderTop:`4px solid ${C.gold}`,padding:"36px"}}>
          <p style={{fontSize:9,fontWeight:800,letterSpacing:".16em",color:C.gold,margin:"0 0 8px",textTransform:"uppercase"}}>Evidstack Pro</p>
          <h2 style={{fontSize:28,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 6px"}}>Unlock all 153 compounds</h2>
          <p style={{fontSize:14,color:C.gray,margin:"0 0 28px",lineHeight:1.6}}>Full access to Tier 2, 3, and 4 compounds plus the AI Stack Builder.</p>
          {[
            "Full database access - all tiers unlocked",
            "AI Stack Builder - personalized protocols",
            "Interaction checker between compounds",
            "8-week progression planning",
          ].map(text=>(
            <div key={text} style={{display:"flex",gap:10,marginBottom:10}}>
              <span style={{fontSize:13,fontWeight:900,color:C.green}}>+</span>
              <span style={{fontSize:13,color:C.ink}}>{text}</span>
            </div>
          ))}
          <div style={{margin:"24px 0",padding:"16px",background:C.bg,border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:800,color:C.ink}}>Evidstack Pro</span>
            <span style={{fontSize:22,fontWeight:900,color:C.ink}}>$9.99<span style={{fontSize:13,fontWeight:600,color:C.gray}}>/month</span></span>
          </div>
          {error&&<p style={{fontSize:12,color:C.red,marginBottom:12}}>{error}</p>}
          <button onClick={checkout} disabled={loading} style={{width:"100%",padding:"14px",background:C.ink,color:C.white,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif",marginBottom:10}}>
            {loading?"Redirecting...":user?"Continue to payment":"Sign in to continue"}
          </button>
          <p style={{fontSize:11,color:C.gray,textAlign:"center",margin:0}}>Cancel anytime. No commitment.</p>
        </div>
      </div>
    </div>
  );
}

/* PAYWALL CARD */
function PaywallCard({supp,onUpgrade,isMob}){
  const tc=tierColor(supp.tier);
  return(
    <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${tc}`,position:"relative",overflow:"hidden",minHeight:120}}>
      <div style={{padding:"24px 28px 20px",filter:"blur(4px)",userSelect:"none",pointerEvents:"none",opacity:.6}}>
        <p style={{fontSize:9,fontWeight:800,color:tc,letterSpacing:".14em",margin:"0 0 6px",textTransform:"uppercase"}}>TIER {supp.tier} / {TIERS[supp.tier]?.label?.toUpperCase()||""}</p>
        <h3 style={{fontSize:20,fontWeight:900,color:C.ink,margin:0}}>{supp.name}</h3>
        <div style={{marginTop:16,height:2,background:C.light}}/>
        <div style={{marginTop:12,height:2,background:C.light,width:"60%"}}/>
      </div>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(244,242,238,.88)",gap:10}}>
        <div style={{textAlign:"center"}}>
          <p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 2px"}}>Pro compound</p>
          <p style={{fontSize:11,color:C.gray,margin:0}}>Tier {supp.tier} - {supp.name}</p>
        </div>
        <button onClick={onUpgrade} style={{padding:"8px 18px",background:C.ink,color:C.white,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif"}}>
          Upgrade to Pro - $9.99/mo
        </button>
      </div>
    </div>
  );
}

/* SCORE BLOCK */
function ScoreBlock({label,value,color,max=5}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:9,fontWeight:700,letterSpacing:".12em",color:C.gray,textTransform:"uppercase"}}>{label}</span>
        <span style={{fontSize:11,fontWeight:800,color}}>{value}/{max}</span>
      </div>
      <div style={{height:2,background:C.light,position:"relative"}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${Math.abs(value)/max*100}%`,background:color,transition:"width .5s cubic-bezier(.16,1,.3,1)"}}/>
      </div>
    </div>
  );
}

/* EFFECT ROW */
function EffectRow({effect,goalObj}){
  const isNeg=effect.efficacy<0;
  const ec=efColor(effect.efficacy);
  return(
    <div style={{padding:"20px 0",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>{goalObj?.icon}</span>
          <div>
            <p style={{fontSize:13,fontWeight:800,color:C.ink,margin:0,letterSpacing:"-.02em"}}>{goalObj?.label||effect.goal}</p>
            <p style={{fontSize:10,color:C.gray,margin:"2px 0 0"}}>{T.card.studies(effect.studies,effect.type)}</p>
          </div>
        </div>
        {isNeg&&<span style={{fontSize:9,fontWeight:700,color:C.red,border:`1px solid ${C.red}`,padding:"2px 8px",letterSpacing:".08em"}}>! {T.card.negative}</span>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <ScoreBlock label={T.card.efficacy} value={Math.abs(effect.efficacy)} color={isNeg?C.red:ec}/>
        <ScoreBlock label={T.card.evidence} value={effect.evidence} color={efColor(effect.evidence+1)}/>
      </div>
      <p style={{fontSize:12,color:C.gray,lineHeight:1.7,margin:0}}>{effect.summary}</p>
    </div>
  );
}

/* SUPPLEMENT CARD */
function SupplementCard({supp,activeGoal,onClick,isSelected,isPro,onUpgrade}){
  const isMob=useIsMobile();
  if(supp.tier>=2&&!isPro)return <PaywallCard supp={supp} onUpgrade={onUpgrade} isMob={isMob}/>;
  const goalMap=Object.fromEntries(GOALS.map((g,i)=>[g.id,{...g,label:T.controls.goals[i]||g.label}]));
  const effects=activeGoal==="all"?supp.effects:supp.effects.filter(e=>e.goal===activeGoal);
  if(!effects.length)return null;
  const tc=tierColor(supp.tier);
  const avgEff=Math.round(effects.reduce((s,e)=>s+Math.abs(e.efficacy),0)/effects.length);
  const avgEv=Math.round(effects.reduce((s,e)=>s+e.evidence,0)/effects.length);
  return(
    <div onClick={onClick} style={{background:C.white,border:`1px solid ${isSelected?C.black:C.border}`,borderTop:`3px solid ${tc}`,cursor:"pointer",transition:"border-color .2s, box-shadow .2s",boxShadow:isSelected?"0 8px 32px rgba(0,0,0,.08)":"none"}}>
      <div style={{padding:isMob?"16px 14px 14px":"24px 28px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <p style={{fontSize:9,fontWeight:800,color:tc,letterSpacing:".14em",margin:"0 0 6px",textTransform:"uppercase"}}>TIER {supp.tier} / {TIERS[supp.tier]?.label?.toUpperCase()||""}</p>
            <h3 style={{fontSize:20,fontWeight:900,color:C.ink,margin:0,letterSpacing:"-.04em",lineHeight:1.1}}>{supp.name}</h3>
          </div>
          <div style={{textAlign:"right"}}>
            <p style={{fontSize:11,color:C.gray,margin:0}}>{supp.cost}</p>
            <p style={{fontSize:9,color:supp.safety>=4?C.green:C.amber,margin:"4px 0 0",fontWeight:700,letterSpacing:".08em"}}>{T.card.safety[supp.safety]||""}</p>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          <ScoreBlock label={T.card.avgEfficacy} value={avgEff} color={efColor(avgEff)}/>
          <ScoreBlock label={T.card.avgEvidence} value={avgEv} color={efColor(avgEv+1)}/>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {effects.map(e=>{
            const g=goalMap[e.goal];const isNeg=e.efficacy<0;const ec=efColor(e.efficacy);
            return(<span key={e.goal} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:700,color:isNeg?C.red:ec,background:isNeg?`${C.red}10`:`${ec}12`,border:`1px solid ${isNeg?C.red:ec}30`,padding:"3px 10px",letterSpacing:".04em"}}>{g?.icon} {g?.label} {isNeg?"-":""}{Math.abs(e.efficacy)}/5</span>);
          })}
        </div>
      </div>
      {isSelected&&(
        <div style={{borderTop:`1px solid ${C.border}`}}>
          <div style={{padding:isMob?"0 14px":"0 28px"}}>
            {effects.map(e=><EffectRow key={e.goal} effect={e} goalObj={goalMap[e.goal]}/>)}
          </div>
          <div style={{padding:isMob?"14px":"20px 28px 24px",display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:10}}>
            <div style={{background:C.bg,padding:"18px 20px",border:`1px solid ${C.border}`}}>
              <p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>{T.card.dosage}</p>
              <p style={{fontSize:16,fontWeight:900,color:C.ink,margin:"0 0 4px"}}>{supp.dosage.amount}</p>
              <p style={{fontSize:11,color:C.gray,margin:"0 0 8px"}}>{supp.dosage.timing}</p>
              {supp.dosage.note&&<p style={{fontSize:10,color:C.gray,margin:0,borderTop:`1px solid ${C.border}`,paddingTop:8,lineHeight:1.5}}>💡 {supp.dosage.note}</p>}
            </div>
            <div style={{background:C.bg,padding:"18px 20px",border:`1px solid ${C.border}`}}>
              <p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>{T.card.interactions}</p>
              {supp.interactions.length?supp.interactions.map((it,idx)=><p key={idx} style={{fontSize:11,color:C.amber,margin:"0 0 6px",lineHeight:1.5}}>! {it}</p>):<p style={{fontSize:11,color:C.green,margin:0,fontWeight:700}}>{T.card.noInteractions}</p>}
              <p style={{fontSize:10,color:C.gray,marginTop:10}}>{supp.legal}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* STACK BUILDER */
const GOAL_OPTIONS=[
  {id:"sleep",label:"Sleep",icon:"😴"},{id:"focus",label:"Focus",icon:"🎯"},
  {id:"memory",label:"Memory",icon:"🧠"},{id:"mood",label:"Mood",icon:"😊"},
  {id:"force",label:"Strength",icon:"💪"},{id:"recovery",label:"Recovery",icon:"🔄"},
  {id:"energy",label:"Energy",icon:"⚡"},{id:"hormones",label:"Testosterone",icon:"🩸"},
  {id:"stress",label:"Stress",icon:"🧘"},{id:"longevity",label:"Longevity",icon:"❤️"},
  {id:"skin",label:"Skin",icon:"✨"},{id:"cardio",label:"Cardio",icon:"🫀"},
];

function StackBuilder({onUpgrade}){
  const {isPro}=useAuth();
  const isMob=useIsMobile();
  const [goals,setGoals]=useState([]);
  const [budget,setBudget]=useState(80);
  const [existing,setExisting]=useState("");
  const [restrictions,setRestrictions]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const toggleGoal=(id)=>setGoals(g=>g.includes(id)?g.filter(x=>x!==id):[...g,id]);

  const build=async()=>{
    if(goals.length===0){setError("Select at least one goal.");return;}
    setError("");setLoading(true);setResult(null);
    try{
      const res=await fetch("/api/ai-stack",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goals,budget,existing,restrictions})});
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      setResult(data);
    }catch(e){setError(e.message||"Something went wrong. Try again.");}
    finally{setLoading(false);}
  };

  if(!isPro)return(
    <div style={{maxWidth:680,margin:"80px auto",padding:"0 24px",textAlign:"center"}}>
      <span style={{fontSize:48,display:"block",marginBottom:20}}>🧬</span>
      <h2 style={{fontSize:32,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 12px"}}>Stack Builder AI</h2>
      <p style={{fontSize:15,color:C.gray,lineHeight:1.8,margin:"0 auto 32px",maxWidth:480}}>Tell us your goals, budget, and what you already take. We build a personalized evidence-based protocol in seconds.</p>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,padding:"32px",marginBottom:32,textAlign:"left"}}>
        {[["🎯","Goal-based filtering","Compounds matched to your goals, ranked by strongest evidence"],["💰","Budget-aware","Stack fitted to your monthly spend"],["⚡","Interaction check","All compounds cross-checked for contraindications"],["📈","8-week progression","What to add or change after your first cycle"]].map(([icon,title,desc])=>(
          <div key={title} style={{display:"flex",gap:14,marginBottom:20}}>
            <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
            <div><p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 3px"}}>{title}</p><p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.5}}>{desc}</p></div>
          </div>
        ))}
      </div>
      <button onClick={onUpgrade} style={{padding:"14px 32px",background:C.ink,color:C.white,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif",width:"100%",maxWidth:340}}>
        Upgrade to Pro - $9.99/month
      </button>
      <p style={{fontSize:11,color:C.gray,marginTop:12}}>Cancel anytime. Full access to all 153 compounds + Stack Builder.</p>
    </div>
  );

  return(
    <div style={{maxWidth:840,margin:"0 auto",padding:isMob?"32px 16px 60px":"56px 48px 100px"}}>
      <p style={{fontSize:11,fontWeight:700,letterSpacing:".2em",color:C.gold,margin:"0 0 8px",textTransform:"uppercase"}}>Pro Feature</p>
      <h2 style={{fontSize:40,fontWeight:900,letterSpacing:"-.05em",color:C.ink,margin:"0 0 8px"}}>Stack Builder AI</h2>
      <p style={{fontSize:14,color:C.gray,margin:"0 0 40px",lineHeight:1.7}}>Select your goals, set your budget, and get a personalized evidence-based protocol in seconds.</p>

      <div style={{marginBottom:32}}>
        <p style={{fontSize:11,fontWeight:800,color:C.ink,letterSpacing:".1em",textTransform:"uppercase",margin:"0 0 14px"}}>1. Your goals <span style={{color:C.gray,fontWeight:400,textTransform:"none",letterSpacing:0}}>(pick all that apply)</span></p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {GOAL_OPTIONS.map(g=>{
            const on=goals.includes(g.id);
            return(<button key={g.id} onClick={()=>toggleGoal(g.id)} style={{padding:"8px 16px",fontSize:12,fontWeight:700,background:on?C.ink:"transparent",color:on?C.white:C.gray,border:`1px solid ${on?C.ink:C.border}`,cursor:"pointer",fontFamily:"Montserrat,sans-serif",transition:"all .15s"}}>{g.icon} {g.label}</button>);
          })}
        </div>
      </div>

      <div style={{marginBottom:32}}>
        <p style={{fontSize:11,fontWeight:800,color:C.ink,letterSpacing:".1em",textTransform:"uppercase",margin:"0 0 14px"}}>2. Monthly budget <span style={{color:C.gold,fontWeight:900}}>${budget}/month</span></p>
        <input type="range" min={20} max={500} step={10} value={budget} onChange={e=>setBudget(Number(e.target.value))} style={{width:"100%",maxWidth:400,accentColor:C.ink}}/>
        <div style={{display:"flex",justifyContent:"space-between",maxWidth:400,marginTop:4}}>
          <span style={{fontSize:10,color:C.gray}}>$20</span><span style={{fontSize:10,color:C.gray}}>$500</span>
        </div>
      </div>

      <div style={{marginBottom:32}}>
        <p style={{fontSize:11,fontWeight:800,color:C.ink,letterSpacing:".1em",textTransform:"uppercase",margin:"0 0 14px"}}>3. Already taking <span style={{color:C.gray,fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional)</span></p>
        <input value={existing} onChange={e=>setExisting(e.target.value)} placeholder="e.g. Creatine, Vitamin D, Omega-3..."
          style={{width:"100%",maxWidth:500,padding:"11px 16px",border:`1px solid ${C.border}`,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",background:C.white,boxSizing:"border-box"}}/>
      </div>

      <div style={{marginBottom:36}}>
        <p style={{fontSize:11,fontWeight:800,color:C.ink,letterSpacing:".1em",textTransform:"uppercase",margin:"0 0 14px"}}>4. Any notes <span style={{color:C.gray,fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional)</span></p>
        <input value={restrictions} onChange={e=>setRestrictions(e.target.value)} placeholder="e.g. vegetarian, avoid stimulants, have anxiety..."
          style={{width:"100%",maxWidth:500,padding:"11px 16px",border:`1px solid ${C.border}`,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",background:C.white,boxSizing:"border-box"}}/>
      </div>

      {error&&<p style={{fontSize:13,color:C.red,marginBottom:16}}>{error}</p>}
      <button onClick={build} disabled={loading||goals.length===0}
        style={{padding:"14px 36px",background:goals.length>0?C.ink:"#9ca3af",color:C.white,border:"none",fontSize:13,fontWeight:800,cursor:goals.length>0?"pointer":"not-allowed",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif",marginBottom:48}}>
        {loading?"Building your stack...":"Build my stack"}
      </button>

      {result&&(
        <div style={{border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,background:C.white}}>
          <div style={{padding:"28px 32px 20px",borderBottom:`1px solid ${C.border}`}}>
            <p style={{fontSize:9,fontWeight:800,color:C.gold,letterSpacing:".16em",margin:"0 0 8px",textTransform:"uppercase"}}>Your personalized stack</p>
            <h3 style={{fontSize:28,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 8px"}}>{result.stack_name}</h3>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:12}}>
              <span style={{fontSize:13,fontWeight:800,color:C.green}}>{result.total_cost}</span>
              <span style={{fontSize:11,color:C.gray}}>{result.compounds?.length} compounds</span>
            </div>
            <p style={{fontSize:13,color:C.gray,lineHeight:1.7,margin:0}}>{result.summary}</p>
          </div>
          <div style={{padding:"20px 32px"}}>
            {result.compounds?.map((c,i)=>(
              <div key={i} style={{display:"flex",gap:16,padding:"16px 0",borderBottom:i<result.compounds.length-1?`1px solid ${C.border}`:"none"}}>
                <div style={{width:28,height:28,background:tierColor(c.tier),flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:2}}>
                  <span style={{fontSize:10,fontWeight:900,color:C.white}}>T{c.tier}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                    <p style={{fontSize:14,fontWeight:900,color:C.ink,margin:0}}>{c.name}</p>
                    <span style={{fontSize:11,color:C.gray,marginLeft:12,flexShrink:0}}>{c.cost}</span>
                  </div>
                  <p style={{fontSize:11,color:C.blue,margin:"0 0 4px",fontWeight:700}}>{c.dose} - {c.timing}</p>
                  <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.5}}>{c.reason}</p>
                </div>
              </div>
            ))}
          </div>
          {(result.interactions||result.progression)&&(
            <div style={{padding:"20px 32px",borderTop:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {result.interactions&&(<div style={{background:C.bg,padding:"16px 18px"}}><p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>Interactions</p><p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.6}}>{result.interactions}</p></div>)}
              {result.progression&&(<div style={{background:C.bg,padding:"16px 18px"}}><p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>After 8 weeks</p><p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.6}}>{result.progression}</p></div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* LEGAL */
function LegalPage(){
  const isMob=useIsMobile();
  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:isMob?"32px 16px 60px":"64px 48px 100px"}}>
      <h1 style={{fontSize:isMob?26:36,fontWeight:900,letterSpacing:"-.04em",color:"#1a1a1a",margin:"0 0 8px"}}>Terms of Service & Privacy Policy</h1>
      <p style={{fontSize:12,color:"#6b7280",margin:"0 0 48px"}}>Last updated: March 2026</p>

      <div style={{height:1,background:"#d4d0c8",margin:"0 0 40px"}}/>

      {[
        {
          title:"1. Acceptance of Terms",
          body:"By accessing or using Evidstack (evidstack.com), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the service."
        },
        {
          title:"2. Description of Service",
          body:"Evidstack provides an evidence-based supplement database, research summaries, and an AI-powered stack builder. Content is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before starting any supplementation protocol."
        },
        {
          title:"3. Pro Subscription",
          body:"Evidstack Pro is a paid subscription at $9.99/month. Your subscription renews automatically each month until cancelled. You may cancel at any time through your account settings. No refunds are issued for partial subscription periods. We reserve the right to change pricing with 30 days notice."
        },
        {
          title:"4. Prohibited Use",
          body:"You may not use Evidstack to distribute false medical information, reverse-engineer or scrape our database, share your account credentials, or use the platform in any way that violates applicable law."
        },
        {
          title:"5. Disclaimer of Medical Advice",
          body:"All content on Evidstack is strictly for informational and educational purposes. Nothing on this platform constitutes medical advice, diagnosis, or treatment. The AI Stack Builder generates suggestions based on published research  - these suggestions are not personalized medical recommendations. Always consult a licensed healthcare provider before changing your supplementation routine."
        },
        {
          title:"6. Limitation of Liability",
          body:"Evidstack and its operators are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform or reliance on its content. Use the information at your own risk."
        },
        {
          title:"7. Privacy Policy  - Data We Collect",
          body:"We collect your email address and authentication data when you create an account. We store your subscription status in our database (Firebase Firestore). We do not sell your personal data to third parties. Payment processing is handled by Stripe  - we do not store your credit card information."
        },
        {
          title:"8. Cookies and Analytics",
          body:"Evidstack may use cookies for authentication purposes. We may use analytics tools to understand how users interact with the platform. No advertising cookies are used."
        },
        {
          title:"9. Third-Party Services",
          body:"Evidstack uses Firebase (Google) for authentication and database, Stripe for payment processing, and Vercel for hosting. Each of these services has its own privacy policy and terms of service."
        },
        {
          title:"10. Data Retention and Deletion",
          body:"You may request deletion of your account and associated data at any time by emailing hello@evidstack.com. We will process deletion requests within 30 days."
        },
        {
          title:"11. Changes to These Terms",
          body:"We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes by email."
        },
        {
          title:"12. Contact",
          body:"For any questions regarding these terms or your privacy, contact us at: hello@evidstack.com"
        },
      ].map(s=>(
        <div key={s.title} style={{marginBottom:32}}>
          <p style={{fontSize:13,fontWeight:800,color:"#1a1a1a",margin:"0 0 8px"}}>{s.title}</p>
          <p style={{fontSize:13,color:"#6b7280",lineHeight:1.8,margin:0}}>{s.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ABOUT */
function AboutPage(){
  const isMob=useIsMobile();
  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:isMob?"32px 16px 60px":"64px 48px 100px"}}>
      <h2 style={{fontSize:isMob?28:44,fontWeight:900,lineHeight:1.05,letterSpacing:"-.05em",margin:"0 0 12px",color:C.ink}}>Built for people who want real answers.</h2>
      <p style={{fontSize:15,color:C.gray,lineHeight:1.9,margin:"0 0 48px",maxWidth:600}}>The supplement industry runs on marketing. Evidstack runs on data.</p>
      <div style={{height:1,background:C.border,margin:"0 0 48px"}}/>
      {[
        {label:"The problem",body:"The supplement market is worth over 200 billion dollars. Most of that value is built on claims that would not survive a basic fact-check. Brands cite studies funded by the companies selling the product. They ignore contradictory data. They present weak correlational findings as proven facts. Evidstack was built to cut through that. Every compound is rated on two axes: how large the effect actually is, and how confident we are in the evidence."},
        {label:"How scoring works",body:"Efficacy (1-5) measures the actual size of the effect in human studies. Evidence (1-5) measures the quality and volume of research behind the claim. You can have strong evidence for a weak effect, and weak evidence for a strong effect. All scores are derived from peer-reviewed literature, primarily PubMed, the Cochrane Database, and Examine.com as a cross-reference."},
        {label:"The tier system",body:"Tier 1 (Fundamentals): broad research base, well-established safety. Tier 2 (Advanced): solid evidence with 10+ trials, slightly less mature. Tier 3 (Expert): promising results backed by fewer studies. Tier 4 (Biohacking): cutting-edge compounds with limited or no human clinical data. Research-grade use only."},
      ].map(s=>(<div key={s.label} style={{marginBottom:40}}><p style={{fontSize:11,fontWeight:700,letterSpacing:".2em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>{s.label}</p><p style={{fontSize:14,color:C.gray,lineHeight:1.9,margin:0,maxWidth:600}}>{s.body}</p></div>))}
    </div>
  );
}

/* PROTOCOLS */
function ProtocolsPage({onGoToSupplements}){
  const isMob=useIsMobile();
  const protocols=[
    {icon:"🧠",name:"Cognitive Stack",desc:"Focus, memory, and mental clarity. All compounds RCT-backed with evidence scores of 3+.",supps:["Caffeine + L-Theanine","Bacopa Monnieri","Alpha-GPC","Lions Mane"],badge:"Most popular",color:C.blue},
    {icon:"💪",name:"Performance Stack",desc:"Strength, endurance, and recovery. The strongest evidence base in sports science.",supps:["Creatine Monohydrate","Beta-Alanine","L-Citrulline","Omega-3"],badge:"Best evidence",color:C.green},
    {icon:"😴",name:"Sleep Stack",desc:"Reduces sleep latency and improves sleep quality. All RCT-validated. No dependency risk.",supps:["Magnesium Bisglycinate","Glycine","Apigenin","Ashwagandha"],badge:"No dependency",color:C.purple},
    {icon:"❤️",name:"Longevity Stack",desc:"Targets core aging mechanisms: mitochondrial function, inflammation, and NAD+ levels.",supps:["NMN / NR","CoQ10","Taurine","Berberine"],badge:"Cutting edge",color:C.amber},
    {icon:"🩸",name:"Testosterone Stack",desc:"Natural compounds with clinical evidence for testosterone and hormonal health in men.",supps:["Vitamin D3 + K2","Zinc","Tongkat Ali","Boron"],badge:"Men health",color:C.red},
    {icon:"🌊",name:"Stress Recovery Stack",desc:"Adaptogenic compounds that regulate the HPA axis and reduce chronic stress burden.",supps:["Ashwagandha KSM-66","Rhodiola Rosea","Magnesium","Omega-3"],badge:"RCT backed",color:"#06b6d4"},
  ];
  return(
    <div style={{maxWidth:960,margin:"0 auto",padding:isMob?"32px 16px 60px":"64px 48px 100px"}}>
      <p style={{fontSize:11,fontWeight:700,letterSpacing:".2em",color:C.gray,margin:"0 0 16px",textTransform:"uppercase"}}>Curated Stacks</p>
      <h2 style={{fontSize:isMob?28:44,fontWeight:900,lineHeight:1.05,letterSpacing:"-.05em",margin:"0 0 16px",color:C.ink}}>Pre-built protocols.</h2>
      <p style={{fontSize:14,color:C.gray,lineHeight:1.8,margin:"0 0 48px",maxWidth:520}}>Each stack combines supplements with compatible mechanisms, no major interactions, and evidence scores of 3+.</p>
      <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr 1fr",gap:12}}>
        {protocols.map(p=>(
          <div key={p.name} style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${p.color}`,padding:"24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <span style={{fontSize:28}}>{p.icon}</span>
              <span style={{fontSize:9,fontWeight:700,color:p.color,background:`${p.color}12`,border:`1px solid ${p.color}30`,padding:"3px 8px",letterSpacing:".08em"}}>{p.badge}</span>
            </div>
            <p style={{fontSize:15,fontWeight:900,color:C.ink,margin:"0 0 8px",letterSpacing:"-.03em"}}>{p.name}</p>
            <p style={{fontSize:11,color:C.gray,lineHeight:1.6,margin:"0 0 16px"}}>{p.desc}</p>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {p.supps.map(s=>(<div key={s} style={{display:"flex",alignItems:"center",gap:8}}><span style={{width:4,height:4,background:p.color,borderRadius:2,flexShrink:0}}/><span style={{fontSize:11,color:C.ink,fontWeight:600}}>{s}</span></div>))}
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:40,padding:"24px",background:C.white,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div>
          <p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 4px"}}>Want to build your own?</p>
          <p style={{fontSize:12,color:C.gray,margin:0}}>Browse all 153 compounds, filter by goal, and check interactions.</p>
        </div>
        <button onClick={onGoToSupplements} style={{padding:"12px 24px",background:C.ink,color:C.white,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:".04em"}}>Browse Supplements</button>
      </div>
    </div>
  );
}

/* ROOT */
function AppInner(){
  const {user,isPro,loading,logout}=useAuth();
  const [page,setPage]=useState(()=>getPageFromPath());
  const [goal,setGoal]=useState("all");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState(null);
  const [sortBy,setSortBy]=useState("efficacy");
  const [filterTier,setFilterTier]=useState(0);
  const [showAuth,setShowAuth]=useState(false);
  const [authMode,setAuthMode]=useState("login");
  const [showUpgrade,setShowUpgrade]=useState(false);
  const isMobile=useIsMobile();
  const [mobileMenu,setMobileMenu]=useState(false);

  const navigateTo=(p)=>{navigate(p);setPage(p);};
  useEffect(()=>{
    const onPop=()=>setPage(getPageFromPath());
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);
  const openAuth=(mode="login")=>{setAuthMode(mode);setShowAuth(true);};
  const openUpgrade=()=>setShowUpgrade(true);
  const toggle=(id)=>setSelected(p=>p===id?null:id);

  const filtered=useMemo(()=>{
    let list=SUPPLEMENTS;
    if(goal!=="all")list=list.filter(s=>s.effects.some(e=>e.goal===goal));
    if(filterTier)list=list.filter(s=>s.tier===filterTier);
    if(search.trim()){const q=search.toLowerCase();list=list.filter(s=>s.name.toLowerCase().includes(q)||(s.aliases||[]).some(a=>a.toLowerCase().includes(q)));}
    return[...list].sort((a,b)=>{
      const score=(s,k)=>{
        const ef=goal==="all"?s.effects:s.effects.filter(e=>e.goal===goal);
        if(!ef.length)return 0;
        const raw=ef.reduce((sum,e)=>sum+(k==="efficacy"?Math.abs(e.efficacy):e.evidence),0)/ef.length;
        const safetyPenalty=s.safety<=1?-3:0;
        const evidencePenalty=ef.every(e=>e.evidence<=1)?-2:0;
        return raw+safetyPenalty+evidencePenalty;
      };
      if(sortBy==="tier")return a.tier-b.tier;
      return score(b,sortBy)-score(a,sortBy);
    });
  },[goal,search,sortBy,filterTier]);

  if(loading)return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{fontSize:13,color:C.gray,fontFamily:"Montserrat,sans-serif"}}>Loading...</p>
    </div>
  );

  const navItems=[
    {id:"supplements",label:"Supplements"},
    {id:"protocols",label:"Protocols"},
    {id:"stack-builder",label:"Stack Builder",pro:true},
    {id:"about",label:"About"},
  ];

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif",color:C.ink}}>
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} initialMode={authMode}/>}
      {showUpgrade&&<UpgradeModal onClose={()=>setShowUpgrade(false)} onAuthNeeded={()=>openAuth("signup")}/>}

      {/* Mobile menu drawer */}
      {isMobile&&mobileMenu&&(
        <div onClick={()=>setMobileMenu(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:0,right:0,width:280,height:"100%",background:C.white,padding:"24px 20px",display:"flex",flexDirection:"column",gap:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <span style={{fontSize:14,fontWeight:900,letterSpacing:"-.04em"}}>EVIDSTACK</span>
              <button onClick={()=>setMobileMenu(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.gray}}>x</button>
            </div>
            {[...navItems,{id:"legal",label:"Terms & Privacy"}].map(item=>(
              <button key={item.id} onClick={()=>{navigateTo(item.id);setMobileMenu(false);}}
                style={{padding:"14px 16px",fontSize:14,fontWeight:700,background:page===item.id?C.ink:"transparent",color:page===item.id?C.white:item.pro&&!isPro?C.gold:C.gray,border:"none",cursor:"pointer",textAlign:"left",borderRadius:4}}>
                {item.pro&&!isPro?"✦ "+item.label:item.label}
              </button>
            ))}
            <div style={{height:1,background:C.border,margin:"12px 0"}}/>
            {user?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {isPro&&<span style={{fontSize:11,fontWeight:800,color:C.gold,letterSpacing:".12em",border:`1px solid ${C.gold}`,padding:"4px 10px",alignSelf:"flex-start"}}>PRO MEMBER</span>}
                {!isPro&&<button onClick={()=>{openUpgrade();setMobileMenu(false);}} style={{padding:"12px 16px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",width:"100%"}}>Upgrade to Pro</button>}
                <button onClick={()=>{logout();setMobileMenu(false);}} style={{padding:"12px 16px",fontSize:13,fontWeight:700,background:"transparent",color:C.gray,border:`1px solid ${C.border}`,cursor:"pointer",width:"100%"}}>Sign out</button>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <button onClick={()=>{openAuth("login");setMobileMenu(false);}} style={{padding:"12px 16px",fontSize:13,fontWeight:700,background:"transparent",color:C.ink,border:`1px solid ${C.border}`,cursor:"pointer",width:"100%"}}>Sign in</button>
                <button onClick={()=>{openAuth("signup");setMobileMenu(false);}} style={{padding:"12px 16px",fontSize:13,fontWeight:800,background:C.ink,color:C.white,border:"none",cursor:"pointer",width:"100%"}}>Sign up</button>
              </div>
            )}
          </div>
        </div>
      )}

      <nav style={{borderBottom:`1px solid ${C.border}`,padding:isMobile?"0 16px":"0 40px",display:"flex",alignItems:"center",justifyContent:"space-between",height:72,position:"sticky",top:0,zIndex:100,background:`${C.bg}f0`,backdropFilter:"blur(12px)"}}>
        <div onClick={()=>navigateTo("supplements")} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
          <div style={{width:30,height:30,border:`2px solid ${C.black}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,fontWeight:900}}>E</span></div>
          <span style={{fontSize:13,fontWeight:900,letterSpacing:"-.04em",color:C.ink,cursor:"pointer"}} onClick={()=>navigateTo("supplements")}>EVIDSTACK</span>
        </div>
        {isMobile?(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {user&&!isPro&&<button onClick={openUpgrade} style={{padding:"6px 12px",background:C.gold,color:C.ink,border:"none",fontSize:11,fontWeight:800,cursor:"pointer"}}>Upgrade</button>}
            {isPro&&<span style={{fontSize:9,fontWeight:800,color:C.gold,border:`1px solid ${C.gold}`,padding:"2px 6px"}}>PRO</span>}
            <button onClick={()=>setMobileMenu(true)} style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",flexDirection:"column",gap:5}}>
              <span style={{display:"block",width:22,height:2,background:C.ink}}/>
              <span style={{display:"block",width:22,height:2,background:C.ink}}/>
              <span style={{display:"block",width:22,height:2,background:C.ink}}/>
            </button>
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            {navItems.map(item=>(
              <button key={item.id} onClick={()=>navigateTo(item.id)}
                style={{padding:"8px 14px",fontSize:12,fontWeight:700,
                  background:page===item.id?C.ink:"transparent",
                  color:page===item.id?C.white:item.pro&&!isPro?C.gold:C.gray,
                  border:"none",cursor:"pointer",letterSpacing:"-.01em",transition:"all .15s"}}>
                {item.pro&&!isPro?"✦ "+item.label:item.label}
              </button>
            ))}
            <div style={{width:1,height:24,background:C.border,margin:"0 10px"}}/>
            {user?(
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {isPro&&<span style={{fontSize:10,fontWeight:800,color:C.gold,letterSpacing:".12em",border:`1px solid ${C.gold}`,padding:"4px 10px"}}>PRO</span>}
                {!isPro&&<button onClick={openUpgrade} style={{padding:"8px 16px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",letterSpacing:".04em"}}>Upgrade</button>}
                <button onClick={logout} style={{padding:"8px 14px",fontSize:11,fontWeight:700,background:"transparent",color:C.gray,border:`1px solid ${C.border}`,cursor:"pointer"}}>Sign out</button>
              </div>
            ):(
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openAuth("login")}  style={{padding:"8px 14px",fontSize:12,fontWeight:700,background:"transparent",color:C.gray,border:`1px solid ${C.border}`,cursor:"pointer"}}>Sign in</button>
                <button onClick={()=>openAuth("signup")} style={{padding:"8px 16px",fontSize:12,fontWeight:800,background:C.ink,color:C.white,border:"none",cursor:"pointer"}}>Sign up</button>
              </div>
            )}
          </div>
        )}
      </nav>

      {page==="about"         &&<AboutPage/>}
      {page==="legal"          &&<LegalPage/>}
      {page==="protocols"     &&<ProtocolsPage onGoToSupplements={()=>navigateTo("supplements")}/>}
      {page==="stack-builder" &&<StackBuilder onUpgrade={openUpgrade}/>}

      {page==="supplements"&&<>
        <div style={{padding:isMobile?"32px 16px 28px":"60px 24px 40px",textAlign:"center",borderBottom:`1px solid ${C.border}`}}>
          <h1 style={{fontSize:isMobile?28:48,fontWeight:900,lineHeight:1.12,letterSpacing:"-.04em",margin:"0 0 14px",color:C.ink,maxWidth:740,marginLeft:"auto",marginRight:"auto"}}>
            Supplement and peptide information you can trust.
          </h1>
          <p style={{fontSize:isMobile?13:15,color:C.gray,lineHeight:1.8,margin:"0 auto 20px",maxWidth:560,padding:isMobile?"0 4px":0}}>
            Evidstack <strong style={{color:C.ink,fontWeight:700}}>analyzes and ranks supplements</strong> by actual efficacy and strength of evidence. More than <strong style={{color:C.ink,fontWeight:700}}>200+ compounds</strong>, sourced from PubMed and Cochrane.
          </p>
          <div style={{display:"flex",justifyContent:"center",gap:isMobile?16:32,marginBottom:24,flexWrap:"wrap"}}>
            {[["153","compounds"],["4","evidence tiers"],["PubMed","primary source"],["Cochrane","systematic reviews"]].map(([val,label])=>(
              <div key={label}><span style={{fontSize:isMobile?13:15,fontWeight:900,color:C.ink}}>{val}</span><span style={{fontSize:10,color:C.gray,marginLeft:4}}>{label}</span></div>
            ))}
          </div>
          <div style={{display:"flex",maxWidth:680,margin:"0 auto 20px",boxShadow:"0 2px 16px rgba(0,0,0,.08)"}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={isMobile?"Search a supplement...":"What do you want to learn about?"}
              style={{flex:1,padding:isMobile?"13px 14px":"16px 20px",border:`1px solid ${C.border}`,borderRight:"none",background:C.white,fontSize:isMobile?13:14,fontFamily:"Montserrat,sans-serif",outline:"none",color:C.ink,minWidth:0}}/>
            <button style={{padding:isMobile?"13px 16px":"16px 24px",background:C.ink,color:C.white,border:"none",fontSize:isMobile?12:13,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",flexShrink:0}}>Search</button>
          </div>
          <div style={{maxWidth:680,margin:"0 auto",background:C.ink,padding:isMobile?"20px 16px":"24px 32px"}}>
            {user&&!isPro?(
              <><p style={{fontSize:13,color:"#e8e5df",margin:"0 0 6px",fontWeight:700}}>Unlock all 153 compounds + AI Stack Builder.</p>
              <p style={{fontSize:12,color:"#9ca3af",margin:"0 0 16px",lineHeight:1.6}}>Tier 2-4 compounds and personalized protocols - $9.99/month.</p>
              <button onClick={openUpgrade} style={{padding:"11px 24px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Upgrade to Pro</button></>
            ):user&&isPro?(
              <><p style={{fontSize:13,color:"#e8e5df",margin:"0 0 4px",fontWeight:700}}>Welcome back, Pro member.</p>
              <p style={{fontSize:12,color:"#9ca3af",margin:0}}>Full access to all compounds and the AI Stack Builder.</p></>
            ):(
              <><p style={{fontSize:13,color:"#e8e5df",margin:"0 0 6px",fontWeight:700}}>Evidstack Pro is coming.</p>
              <p style={{fontSize:12,color:"#9ca3af",margin:"0 0 16px",lineHeight:1.6}}>Stack builder, interaction checker, personalized protocols. Get early access.</p>
              <WaitlistForm/></>
            )}
          </div>
        </div>

        <div style={{borderBottom:`1px solid ${C.border}`,background:C.white}}>
          <div style={{display:"flex",gap:0,overflowX:"auto",padding:"0 32px"}}>
            {GOALS.map((g,i)=>(
              <button key={g.id} onClick={()=>setGoal(g.id)}
                style={{padding:"14px 14px",fontSize:11,fontWeight:700,letterSpacing:".04em",background:"transparent",color:goal===g.id?C.ink:C.gray,border:"none",borderBottom:goal===g.id?`2px solid ${C.ink}`:"2px solid transparent",cursor:"pointer",fontFamily:"Montserrat,sans-serif",whiteSpace:"nowrap"}}>
                {g.icon} {T.controls.goals[i]||g.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{padding:isMobile?"10px 12px":"12px 32px",borderBottom:`1px solid ${C.border}`,background:C.bg}}>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:isMobile?8:0}}>
            <span style={{fontSize:10,fontWeight:700,color:C.gray,letterSpacing:".1em"}}>TIER:</span>
            <button onClick={()=>setFilterTier(0)} style={{padding:"4px 8px",fontSize:10,fontWeight:700,background:filterTier===0?C.ink:"transparent",color:filterTier===0?C.white:C.gray,border:`1px solid ${C.border}`,cursor:"pointer"}}>{isMobile?"All":T.controls.tierAll}</button>
            {[1,2,3,4].map((ti,i)=>(
              <button key={ti} onClick={()=>setFilterTier(filterTier===ti?0:ti)}
                style={{padding:"4px 8px",fontSize:10,fontWeight:700,background:filterTier===ti?tierColor(ti):"transparent",color:filterTier===ti?C.white:tierColor(ti),border:`1px solid ${tierColor(ti)}`,cursor:"pointer"}}>
                {isMobile?`T${ti}`:`T${ti} / ${T.controls.tiers[i]}`}
              </button>
            ))}
            {!isMobile&&<div style={{marginLeft:"auto",display:"flex",gap:0,alignItems:"center"}}>
              <span style={{fontSize:10,fontWeight:700,color:C.gray,letterSpacing:".08em",padding:"4px 8px"}}>SORT:</span>
              {[["efficacy",T.controls.sortEfficacy],["evidence",T.controls.sortEvidence],["tier",T.controls.sortTier]].map(([id,label])=>(
                <button key={id} onClick={()=>setSortBy(id)}
                  style={{padding:"5px 12px",fontSize:10,fontWeight:700,letterSpacing:".04em",background:sortBy===id?C.ink:C.white,color:sortBy===id?C.white:C.gray,border:`1px solid ${C.border}`,marginLeft:-1,cursor:"pointer"}}>
                  {label}
                </button>
              ))}
              <span style={{fontSize:11,color:C.gray,fontWeight:600,padding:"4px 0 4px 12px"}}>{T.controls.result(filtered.length)}</span>
            </div>}
          </div>
          {isMobile&&<div style={{display:"flex",gap:0,alignItems:"center"}}>
            <span style={{fontSize:10,fontWeight:700,color:C.gray,letterSpacing:".08em",padding:"4px 8px 4px 0"}}>SORT:</span>
            {[["efficacy",T.controls.sortEfficacy],["evidence",T.controls.sortEvidence],["tier",T.controls.sortTier]].map(([id,label])=>(
              <button key={id} onClick={()=>setSortBy(id)}
                style={{padding:"5px 10px",fontSize:10,fontWeight:700,background:sortBy===id?C.ink:C.white,color:sortBy===id?C.white:C.gray,border:`1px solid ${C.border}`,marginLeft:-1,cursor:"pointer"}}>
                {label}
              </button>
            ))}
            <span style={{fontSize:10,color:C.gray,fontWeight:600,padding:"4px 0 4px 10px",marginLeft:"auto"}}>{T.controls.result(filtered.length)}</span>
          </div>}
        </div>

        <div style={{maxWidth:1000,margin:"0 auto",padding:isMobile?"16px 12px 60px":"24px 48px 80px"}}>
          {goal!=="all"&&(
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,padding:"10px 16px",background:C.white,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.ink,fontWeight:700}}>
                {GOALS.find(g=>g.id===goal)?.icon} Showing {filtered.length} compound{filtered.length!==1?"s":""} for <strong>{T.controls.goals[GOALS.findIndex(g=>g.id===goal)]||goal}</strong>
              </span>
              <button onClick={()=>setGoal("all")} style={{fontSize:11,color:C.gray,background:"transparent",border:"none",cursor:"pointer",fontWeight:600,textDecoration:"underline"}}>Clear filter</button>
            </div>
          )}
          {!isPro&&(
            <div style={{background:`${C.gold}18`,border:`1px solid ${C.gold}40`,padding:"12px 16px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <p style={{fontSize:12,color:C.ink,margin:0}}>
                <strong>Free plan:</strong> Tier 1 visible. <strong>{SUPPLEMENTS.filter(s=>s.tier>=2).length} compounds</strong> locked behind Pro.
              </p>
              <button onClick={openUpgrade} style={{padding:"6px 16px",background:C.ink,color:C.white,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:".04em"}}>Unlock all - $9.99/mo</button>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {filtered.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:C.gray}}><p style={{fontSize:32,fontWeight:900,margin:"0 0 8px",letterSpacing:"-.04em"}}>0</p><p style={{fontSize:13}}>{T.noResults}</p></div>}
            {filtered.map((s,i)=>(
              <div key={s.id} style={{animation:`fadeUp .35s ${i*.02}s both`}}>
                <SupplementCard supp={s} activeGoal={goal} onClick={()=>toggle(s.id)} isSelected={selected===s.id} isPro={isPro} onUpgrade={openUpgrade}/>
              </div>
            ))}
          </div>
        </div>
      </>}

      <div style={{borderTop:`1px solid ${C.border}`,padding:isMobile?"16px":"24px 48px",display:"flex",flexDirection:isMobile?"column":"row",justifyContent:"space-between",alignItems:isMobile?"flex-start":"center",flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:13,fontWeight:900,letterSpacing:"-.04em",color:C.ink,cursor:"pointer"}} onClick={()=>navigateTo("supplements")}>EVIDSTACK</span>
        <p style={{fontSize:10,color:C.gray,textAlign:"center",lineHeight:1.6,maxWidth:500}}>{T.footer}</p>
<span onClick={()=>navigateTo("legal")} style={{fontSize:10,color:C.gray,cursor:"pointer",textDecoration:"underline"}}>Terms & Privacy</span>
      </div>
    </div>
  );
}

export default function App(){
  return <AuthProvider><AppInner/></AuthProvider>;
}
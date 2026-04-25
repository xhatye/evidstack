import { useState, useMemo, useEffect, useRef } from "react";
import { db } from "./firebase.js";
import { doc, setDoc, getDoc } from "firebase/firestore";

function useIsMobile(){ 
  const [m,setM]=useState(()=>typeof window!=="undefined"&&window.innerWidth<768);
  useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);
  return m;
}

function useScrollReveal(threshold){
  const th=threshold||0.12;
  const ref=useRef(null);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVisible(true);obs.disconnect();}},{threshold:th});
    obs.observe(el);
    return()=>obs.disconnect();
  },[]);
  return[ref,visible];
}

function useCountUp(target,duration,started){
  const[count,setCount]=useState(0);
  useEffect(()=>{
    if(!started)return;
    let t0=null;const d=duration||1400;
    const step=(ts)=>{
      if(!t0)t0=ts;
      const p=Math.min((ts-t0)/d,1);
      setCount(Math.floor((1-Math.pow(1-p,3))*target));
      if(p<1)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },[target,started]);
  return count;
}

const ROUTES = {
  "/":"supplements",
  "/supplements":"supplements",
  "/stack-builder":"stack-builder",
  "/interactions":"interactions",
  "/weekly-protocol":"weekly-protocol",
  "/tracker":"tracker",
  "/about":"about",
  "/legal":"legal",
  "/affiliate":"affiliate",
  "/cycle-alerts":"cycle-alerts",
  "/stack-optimizer":"stack-optimizer",
  "/bloodwork":"bloodwork",
  "/pricing":"pricing",
  "/advisor":"advisor",
  "/interaction-checker":"interaction-checker",
  "/stack-audit":"stack-audit",
  "/bloodwork-history":"bloodwork-history",
  "/guides":"guides",
};

function getShareIdFromPath(){
  const path=window.location.pathname;
  if(path.startsWith("/stack/"))return path.replace("/stack/","");
  return null;
}

function getGoalIdFromPath(){
  const p=window.location.pathname;
  if(p.startsWith("/goal/"))return p.replace("/goal/","");
  return null;
}
function getGuideIdFromPath(){
  const p=window.location.pathname;
  if(p.startsWith("/guide/"))return p.replace("/guide/","");
  return null;
}
function getPageFromPath(){
  const path=window.location.pathname;
  if(path.startsWith("/compound/"))return "compound";
  if(path.startsWith("/stack/"))return "shared-stack";
  if(path.startsWith("/goal/"))return "goal-page";
  if(path.startsWith("/guide/"))return "guide-page";
  return ROUTES[path]||"supplements";
}
function getCompoundIdFromPath(){
  const path=window.location.pathname;
  if(path.startsWith("/compound/"))return path.replace("/compound/","");
  return null;
}

function navigate(page){
  const path = page==="supplements"?"/":`/${page}`;
  window.history.pushState({},"",path);
}
import { SUPPLEMENTS, GOALS, TIERS } from "./data.js";
import { AuthProvider, useAuth } from "./AuthContext.jsx";

// v2
const C = {
  bg:"#f4f2ee",white:"#ffffff",black:"#0a0a0a",ink:"#1a1a1a",
  gray:"#6b7280",light:"#e8e5df",border:"#d4d0c8",
  green:"#16a34a",blue:"#2563eb",amber:"#d97706",red:"#dc2626",purple:"#7c3aed",
  gold:"#e2c97e",
};

const T = {
  nav: { supplements:"Supplements", protocols:"Protocols", about:"About" },
  controls: { search:"Search a supplement...", sortEfficacy:"Efficacy", sortEvidence:"Evidence", sortTier:"Tier", tierAll:"All Tiers", tiers:["Fundamentals","Advanced","Expert","Biohacking"], result:(n)=>`${n} result${n!==1?"s":""}`, goals:["All","Sleep","Focus","Memory","Mood","Strength","Recovery","Energy","Testosterone","Stress","Longevity","Aesthetics","Cardio","Fat Loss","Hair","Liver / Detox","Body Recomp","Eye Health"] },
  card: { dosage:"Dosage", interactions:"Interactions", noInteractions:"None known", negative:"NEGATIVE", efficacy:"Efficacy", evidence:"Evidence", avgEfficacy:"Avg. efficacy", avgEvidence:"Avg. evidence", safety:["","RISKY","CAUTION","CAUTION","SAFE","VERY SAFE"], studies:(n,tp)=>`${n} studies / ${tp}` },
  footer:"Data sourced from PubMed meta-analyses and Cochrane reviews. For informational purposes only. Consult a healthcare professional before supplementing.",
  noResults:"No results",
};

const tierColor=(t)=>[null,C.green,C.blue,C.purple,C.amber][t]||C.gray;
const efColor=(v)=>v<0?C.red:v>=4?C.green:v===3?C.blue:v===2?C.amber:C.gray;

/* HERO STATS with count-up */
function HeroStats({isMobile}){
  const [ref,visible]=useScrollReveal(0.1);
  const total=Math.floor(SUPPLEMENTS.length/10)*10;
  const count=useCountUp(total,1200,visible);
  return(
    <div ref={ref} className={"evid-reveal"+(visible?" visible":"")}
      style={{display:"flex",justifyContent:"center",gap:isMobile?16:32,marginBottom:24,flexWrap:"wrap"}}>
      <div><span style={{fontSize:isMobile?13:15,fontWeight:900,color:C.ink}}>{visible?count+"+":(total+"+")}</span><span style={{fontSize:10,color:C.gray,marginLeft:4}}>compounds</span></div>
      <div><span style={{fontSize:isMobile?13:15,fontWeight:900,color:C.ink}}>4</span><span style={{fontSize:10,color:C.gray,marginLeft:4}}>evidence tiers</span></div>
      <div><span style={{fontSize:isMobile?13:15,fontWeight:900,color:C.ink}}>PubMed</span><span style={{fontSize:10,color:C.gray,marginLeft:4}}>primary source</span></div>
      <div><span style={{fontSize:isMobile?13:15,fontWeight:900,color:C.ink}}>Cochrane</span><span style={{fontSize:10,color:C.gray,marginLeft:4}}>systematic reviews</span></div>
      <div><span style={{fontSize:isMobile?13:15,fontWeight:900,color:C.ink}}>1,000+</span><span style={{fontSize:10,color:C.gray,marginLeft:4}}>side effects documented</span></div>
    </div>
  );
}

/* HOW IT WORKS with scroll-reveal */
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
/* ONBOARDING MODAL */
const ONBOARDING_KEY="evidstack_onboarded";
const ONBOARDING_MAX=3; // show at most 3 times total

function OnboardingModal({onClose}){
  const isMob=useIsMobile();
  const [step,setStep]=useState(0);
  const slides=[
    {
      icon:"🔬",
      title:`${Math.floor(SUPPLEMENTS.length/10)*10}+ compounds, ranked by science`,
      desc:"Every supplement in our database is scored on two axes: how strong the effect is, and how solid the evidence is. No marketing, no guesswork.",
      detail:"Browse by goal (Sleep, Testosterone, Focus, Weight Loss, Skin, and 14 more categories) or search directly.",
    },
    {
      icon:"📋",
      title:"Browse 200+ compounds.",
      desc:"Every supplement, peptide, GLP-1, SARM, and nootropic in the database is scored on two axes: how strong the effect is, and how solid the evidence is. No marketing, no guesswork.",
      detail:"Browse by goal (Sleep, Testosterone, Focus, Weight Loss, Skin, and 14 more categories) or search directly.",
    },
    {
      icon:"🧬",
      title:"Pro AI tools",
      desc:"AI Compound Advisor lets you describe any goal: skin quality, hair retention, hormones, body composition. Interaction Checker analyzes your full stack. Stack Audit AI scores and optimizes your protocol. Bloodwork History tracks 16 biomarkers over time.",
      detail:"All AI tools are Pro-only and powered by the same evidence base as the database.",
    },
  ];
  const slide=slides[step];
  const isLast=step===slides.length-1;

  const close=()=>{
    const count=parseInt(localStorage.getItem(ONBOARDING_KEY)||"0")+1;
    localStorage.setItem(ONBOARDING_KEY,String(count));
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:"Montserrat,sans-serif"}}>
      <div style={{background:C.white,maxWidth:520,width:"100%",position:"relative",boxShadow:"0 24px 60px rgba(0,0,0,.18)"}}>
        {/* Top bar */}
        <div style={{background:C.ink,padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:10,fontWeight:800,letterSpacing:".18em",color:C.gold}}>EVIDSTACK</span>
          <button onClick={close} style={{background:"none",border:"none",color:"#6b7280",fontSize:20,cursor:"pointer",lineHeight:1,padding:0}}>x</button>
        </div>

        {/* Step dots */}
        <div style={{display:"flex",gap:6,justifyContent:"center",padding:"16px 0 0"}}>
          {slides.map((_,i)=>(
            <div key={i} style={{width:i===step?24:7,height:7,borderRadius:4,background:i===step?C.ink:C.border,transition:"all .3s"}}/>
          ))}
        </div>

        {/* Content */}
        <div style={{padding:isMob?"24px 20px 28px":"32px 40px 36px",textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:20}}>{slide.icon}</div>
          <h2 style={{fontSize:isMob?20:24,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 14px",lineHeight:1.2}}>{slide.title}</h2>
          <p style={{fontSize:14,color:C.ink,lineHeight:1.7,margin:"0 0 12px"}}>{slide.desc}</p>
          <p style={{fontSize:12,color:C.gray,lineHeight:1.6,margin:"0 0 28px"}}>{slide.detail}</p>

          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            {step>0&&(
              <button onClick={()=>setStep(s=>s-1)} style={{padding:"11px 22px",background:"transparent",border:`1.5px solid ${C.border}`,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",color:C.gray}}>
                Back
              </button>
            )}
            {!isLast?(
              <button onClick={()=>setStep(s=>s+1)} style={{padding:"11px 28px",background:C.ink,color:C.white,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
                Next
              </button>
            ):(
              <button onClick={close} style={{padding:"11px 28px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
                Browse the database
              </button>
            )}
          </div>
        </div>

        {/* Skip */}
        <div style={{borderTop:`1px solid ${C.border}`,padding:"12px 24px",textAlign:"center"}}>
          <button onClick={close} style={{background:"none",border:"none",fontSize:11,color:C.gray,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>
            Skip intro
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE SETUP MODAL ───────────────────────────────────────────────────────
function ProfileSetupModal({onClose}){
  const {saveProfile}=useAuth();
  const isMob=useIsMobile();
  const [age,setAge]=useState("");
  const [weight,setWeight]=useState("");
  const [weightUnit,setWeightUnit]=useState("kg");
  const [height,setHeight]=useState("");
  const [heightUnit,setHeightUnit]=useState("cm");
  const [sex,setSex]=useState("");
  const [saving,setSaving]=useState(false);

  const save=async()=>{
    setSaving(true);
    const weightKg=weightUnit==="lbs"?Math.round(parseFloat(weight)*0.453592):parseFloat(weight);
    const heightCm=heightUnit==="ft"?Math.round(parseFloat(height)*30.48):parseFloat(height);
    await saveProfile({
      age:parseInt(age)||null,
      weightKg:isNaN(weightKg)?null:weightKg,
      heightCm:isNaN(heightCm)?null:heightCm,
      sex:sex||null,
      updatedAt:Date.now(),
    });
    onClose();
  };

  const canSave=age&&weight&&height&&sex;

  const iS={
    width:"100%",padding:"10px 12px",border:`1px solid ${C.border}`,
    fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",
    background:C.white,color:C.ink,boxSizing:"border-box",
  };
  const unitBtn=(active)=>({
    padding:"4px 10px",background:active?C.ink:"transparent",
    color:active?C.white:C.gray,border:"none",cursor:"pointer",
    fontSize:11,fontWeight:700,fontFamily:"Montserrat,sans-serif",transition:"all .15s",
  });
  const sexBtn=(active)=>({
    flex:1,padding:"10px 8px",background:active?C.ink:"transparent",
    color:active?C.white:C.gray,border:"none",cursor:"pointer",
    fontSize:12,fontWeight:700,fontFamily:"Montserrat,sans-serif",transition:"all .15s",
  });

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1010,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.white,width:"100%",maxWidth:400,position:"relative",fontFamily:"Montserrat,sans-serif"}}>
        {/* Header */}
        <div style={{background:C.ink,padding:"24px 28px 20px"}}>
          <p style={{fontSize:9,fontWeight:800,letterSpacing:".18em",color:C.gold,margin:"0 0 6px",textTransform:"uppercase"}}>Profile Calibration</p>
          <h2 style={{fontSize:20,fontWeight:900,color:C.white,margin:"0 0 6px",letterSpacing:"-.03em"}}>One last step.</h2>
          <p style={{fontSize:12,color:"#9ca3af",margin:0,lineHeight:1.6}}>4 quick fields. Used to calibrate compound dosages to your body: weight-based dosing, age-adjusted metabolism, and sex-specific hormone profiles.</p>
        </div>

        <div style={{padding:"24px 28px"}}>
          {/* Age */}
          <div style={{marginBottom:14}}>
            <p style={{fontSize:10,fontWeight:700,color:C.gray,margin:"0 0 6px",letterSpacing:".08em",textTransform:"uppercase"}}>Age</p>
            <input value={age} onChange={e=>setAge(e.target.value)} type="number" min="13" max="99" placeholder="e.g. 28" style={iS}/>
          </div>

          {/* Weight */}
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <p style={{fontSize:10,fontWeight:700,color:C.gray,margin:0,letterSpacing:".08em",textTransform:"uppercase"}}>Weight</p>
              <div style={{display:"flex",border:`1px solid ${C.border}`,background:C.bg}}>
                <button style={unitBtn(weightUnit==="kg")} onClick={()=>setWeightUnit("kg")}>kg</button>
                <button style={unitBtn(weightUnit==="lbs")} onClick={()=>setWeightUnit("lbs")}>lbs</button>
              </div>
            </div>
            <input value={weight} onChange={e=>setWeight(e.target.value)} type="number" min="30" placeholder={weightUnit==="kg"?"e.g. 80":"e.g. 176"} style={iS}/>
          </div>

          {/* Height */}
          <div style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <p style={{fontSize:10,fontWeight:700,color:C.gray,margin:0,letterSpacing:".08em",textTransform:"uppercase"}}>Height</p>
              <div style={{display:"flex",border:`1px solid ${C.border}`,background:C.bg}}>
                <button style={unitBtn(heightUnit==="cm")} onClick={()=>setHeightUnit("cm")}>cm</button>
                <button style={unitBtn(heightUnit==="ft")} onClick={()=>setHeightUnit("ft")}>ft</button>
              </div>
            </div>
            <input value={height} onChange={e=>setHeight(e.target.value)} type="number" min="100" placeholder={heightUnit==="cm"?"e.g. 178":"e.g. 5.9"} style={iS}/>
          </div>

          {/* Sex */}
          <div style={{marginBottom:24}}>
            <p style={{fontSize:10,fontWeight:700,color:C.gray,margin:"0 0 6px",letterSpacing:".08em",textTransform:"uppercase"}}>Biological sex</p>
            <div style={{display:"flex",border:`1px solid ${C.border}`,background:C.bg}}>
              {["Male","Female"].map(s=>(
                <button key={s} style={sexBtn(sex===s)} onClick={()=>setSex(s)}>{s}</button>
              ))}
            </div>
          </div>

          <button onClick={save} disabled={!canSave||saving}
            style={{width:"100%",padding:"13px",background:canSave?C.gold:C.border,color:C.ink,border:"none",fontSize:13,fontWeight:800,cursor:canSave?"pointer":"default",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",marginBottom:10}}>
            {saving?"Saving...":"Save and continue"}
          </button>
          <button onClick={onClose} style={{width:"100%",padding:"10px",background:"transparent",border:"none",fontSize:12,color:C.gray,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

function AuthModal({onClose,initialMode="login"}){
  const {loginEmail,signupEmail,loginGoogle,resetPassword}=useAuth();
  const [mode,setMode]=useState(initialMode); // login | signup | forgot | profile
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [pw2,setPw2]=useState("");
  const [error,setError]=useState("");
  const [info,setInfo]=useState("");
  const [loading,setLoading]=useState(false);
  const [showProfile,setShowProfile]=useState(false);

  const switchMode=(m)=>{setMode(m);setError("");setInfo("");setPw("");setPw2("");};

  const submit=async()=>{
    setError("");setInfo("");
    if(mode==="signup"&&pw!==pw2){setError("Passwords do not match.");return;}
    if(mode==="signup"&&pw.length<6){setError("Password must be at least 6 characters.");return;}
    setLoading(true);
    try{
      if(mode==="login"){await loginEmail(email,pw);onClose();}
      else if(mode==="signup"){await signupEmail(email,pw);setShowProfile(true);}
    }catch(e){
      setError(e.code==="auth/invalid-credential"?"Incorrect email or password.":
               e.code==="auth/email-already-in-use"?"This email is already registered.":
               e.code==="auth/weak-password"?"Password must be at least 6 characters.":
               e.code==="auth/invalid-email"?"Invalid email address.":
               "Something went wrong. Try again.");
    }finally{setLoading(false);}
  };

  const submitForgot=async()=>{
    if(!email.includes("@")){setError("Enter a valid email address.");return;}
    setLoading(true);setError("");
    try{
      await resetPassword(email);
      setInfo("Password reset email sent. Check your inbox.");
    }catch(e){
      setError(e.code==="auth/user-not-found"?"No account found with this email.":"Something went wrong.");
    }finally{setLoading(false);}
  };

  const google=async()=>{
    setError("");setLoading(true);
    try{
      await loginGoogle();
      // For Google sign-in we don't know if it's new - show profile modal
      setShowProfile(true);
    }
    catch(e){setError("Google sign-in failed.");setLoading(false);}
  };

  // Show profile setup after signup
  if(showProfile) return <ProfileSetupModal onClose={onClose}/>;

  const inputStyle={width:"100%",padding:"11px 14px",border:`1px solid ${C.border}`,marginBottom:10,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",boxSizing:"border-box"};

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,width:"100%",maxWidth:400,padding:"40px 36px",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.gray}}>x</button>
        <p style={{fontSize:9,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>Evidstack</p>
        <h2 style={{fontSize:24,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 24px"}}>
          {mode==="login"?"Sign in":mode==="signup"?"Create account":"Reset password"}
        </h2>

        {mode!=="forgot"&&<>
          <button onClick={google} disabled={loading} style={{width:"100%",padding:"12px",display:"flex",alignItems:"center",justifyContent:"center",gap:10,border:`1px solid ${C.border}`,background:C.white,cursor:"pointer",fontSize:13,fontWeight:700,marginBottom:20,fontFamily:"Montserrat,sans-serif"}}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:11,color:C.gray}}>or</span><div style={{flex:1,height:1,background:C.border}}/>
          </div>
        </>}

        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle}/>

        {mode!=="forgot"&&<>
          <input value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(mode==="login"?submit():null)} placeholder="Password" type="password" style={inputStyle}/>
          {mode==="signup"&&<input value={pw2} onChange={e=>setPw2(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Confirm password" type="password" style={{...inputStyle,marginBottom:mode==="login"?0:10}}/>}
        </>}

        {mode==="login"&&(
          <div style={{textAlign:"right",marginBottom:16,marginTop:2}}>
            <span onClick={()=>switchMode("forgot")} style={{fontSize:11,color:C.gray,cursor:"pointer",textDecoration:"underline"}}>Forgot password?</span>
          </div>
        )}

        {error&&<p style={{fontSize:12,color:C.red,margin:"0 0 12px"}}>{error}</p>}
        {info&&<p style={{fontSize:12,color:C.green,margin:"0 0 12px"}}>{info}</p>}

        <button onClick={mode==="forgot"?submitForgot:submit} disabled={loading}
          style={{width:"100%",padding:"13px",background:C.ink,color:C.white,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif",marginTop:mode==="login"?0:6}}>
          {loading?"...":(mode==="login"?"Sign in":mode==="signup"?"Create account":"Send reset email")}
        </button>

        <p style={{fontSize:12,color:C.gray,textAlign:"center",margin:"16px 0 0"}}>
          {mode==="login"&&<>No account? <span onClick={()=>switchMode("signup")} style={{color:C.ink,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>Sign up</span></>}
          {mode==="signup"&&<>Already have an account? <span onClick={()=>switchMode("login")} style={{color:C.ink,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>Sign in</span></>}
          {mode==="forgot"&&<><span onClick={()=>switchMode("login")} style={{color:C.ink,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>&larr; Back to sign in</span></>}
        </p>
      </div>
    </div>
  );
}

/* UPGRADE MODAL */
function UpgradeModal({onClose,onAuthNeeded}){
  const {user}=useAuth();
  const [plan,setPlan]=useState("monthly"); // monthly | annual
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const checkout=async()=>{
    if(!user){onClose();onAuthNeeded();return;}
    setLoading(true);setError("");
    try{
      const res=await fetch("/api/stripe-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:user.uid,email:user.email,plan})});
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      window.location.href=data.url;
    }catch(e){setError(e.message||"Something went wrong.");setLoading(false);}
  };

  const features=[
    {icon:"🔬",text:`All ${Math.floor(SUPPLEMENTS.length/10)*10}+ compounds including Tier 2-4`},
    {icon:"🔭",text:"AI Compound Advisor - unlimited evidence-ranked queries"},
    {icon:"⚗️",text:"Interaction Checker - full stack safety analysis"},
    {icon:"🎯",text:"Stack Audit AI - score and optimize your current stack"},
    {icon:"🩸",text:"Bloodwork History - track 16 biomarkers over time"},
    {icon:"📊",text:"My Tracker - weekly supplement log"},
    {icon:"💾",text:"Save and name your stacks"},
  ];

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"auto",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.gray,zIndex:1}}>x</button>

        {/* Header */}
        <div style={{background:C.ink,padding:"32px 28px 24px",textAlign:"center"}}>
          <p style={{fontSize:9,fontWeight:800,letterSpacing:".2em",color:C.gold,margin:"0 0 8px",textTransform:"uppercase"}}>Evidstack Pro</p>
          <h2 style={{fontSize:26,fontWeight:900,color:C.white,margin:"0 0 6px",letterSpacing:"-.04em"}}>Evidence without limits.</h2>
          <p style={{fontSize:13,color:"#9ca3af",margin:0}}>Full access to every tool and compound.</p>
        </div>

        {/* Plan toggle */}
        <div style={{padding:"20px 28px 0"}}>
          <div style={{display:"flex",background:C.bg,border:`1px solid ${C.border}`,marginBottom:20}}>
            {[["monthly","$9.99/mo","Monthly"],["annual","$6.58/mo","Annual  - save 34%"]].map(([id,price,label])=>(
              <button key={id} onClick={()=>setPlan(id)}
                style={{flex:1,padding:"12px 8px",background:plan===id?C.ink:"transparent",color:plan===id?C.white:C.gray,border:"none",cursor:"pointer",fontSize:12,fontWeight:800,fontFamily:"Montserrat,sans-serif",transition:"all .15s",position:"relative"}}>
                {id==="annual"&&<span style={{position:"absolute",top:-10,right:8,background:C.gold,color:C.ink,fontSize:8,fontWeight:800,padding:"2px 6px",letterSpacing:".06em"}}>BEST VALUE</span>}
                <div style={{fontSize:13,fontWeight:900,marginBottom:2}}>{price}</div>
                <div style={{fontSize:9,fontWeight:700,letterSpacing:".06em",opacity:.7}}>{label}</div>
              </button>
            ))}
          </div>

          {plan==="annual"&&<p style={{fontSize:11,color:C.green,fontWeight:700,margin:"-12px 0 16px",textAlign:"center"}}>$79/year  - billed annually. Save $40.88 vs monthly.</p>}

          {/* Comparison table */}
          <div style={{marginBottom:20}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",marginBottom:0}}>
              <div style={{padding:"10px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRight:"none"}}/>
              <div style={{padding:"10px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRight:"none",textAlign:"center"}}>
                <p style={{fontSize:9,fontWeight:800,color:C.gray,margin:0,letterSpacing:".1em",textTransform:"uppercase"}}>Free</p>
              </div>
              <div style={{padding:"10px 12px",background:C.ink,border:`1px solid ${C.ink}`,textAlign:"center"}}>
                <p style={{fontSize:9,fontWeight:800,color:C.gold,margin:0,letterSpacing:".1em",textTransform:"uppercase"}}>Pro</p>
              </div>
            </div>
            {[
              {feature:"Compounds",free:"Tier 1 only (33)",pro:`All ${Math.floor(SUPPLEMENTS.length/10)*10}+`,highlight:true},
              {feature:"Peptides & GLP-1s",free:false,pro:true},
              {feature:"Biohacking tier",free:false,pro:true},
              {feature:"AI Compound Advisor",free:"1 query",pro:"Unlimited",highlight:true},
              {feature:"Conversation memory",free:false,pro:true},
              {feature:"Interaction Checker",free:false,pro:true,highlight:true},
              {feature:"Stack Audit AI",free:false,pro:true},
              {feature:"Bloodwork History",free:false,pro:true},
              {feature:"AI Bloodwork Analyzer",free:false,pro:true},
              {feature:"My Tracker",free:false,pro:true},
              {feature:"Compare compounds",free:false,pro:true},
              {feature:"Save your stacks",free:false,pro:true,highlight:true},
            ].map((row,i)=>(
              <div key={row.feature} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
                <div style={{padding:"9px 12px",background:row.highlight?`${C.gold}0a`:C.white,border:`1px solid ${C.border}`,borderTop:"none",borderRight:"none"}}>
                  <span style={{fontSize:11,fontWeight:row.highlight?800:600,color:C.ink}}>{row.feature}</span>
                </div>
                <div style={{padding:"9px 12px",background:row.highlight?`${C.gold}0a`:C.white,border:`1px solid ${C.border}`,borderTop:"none",borderRight:"none",textAlign:"center"}}>
                  {typeof row.free==="boolean"
                    ?<span style={{fontSize:13,color:row.free?C.green:"#d4d0c8"}}>{row.free?"✓":" - "}</span>
                    :<span style={{fontSize:10,fontWeight:600,color:C.gray}}>{row.free}</span>}
                </div>
                <div style={{padding:"9px 12px",background:row.highlight?`${C.gold}15`:C.ink,border:`1px solid ${C.ink}`,borderTop:"none",textAlign:"center"}}>
                  {typeof row.pro==="boolean"
                    ?<span style={{fontSize:13,color:row.pro?C.gold:"#374151"}}>{row.pro?"✓":" - "}</span>
                    :<span style={{fontSize:10,fontWeight:700,color:row.highlight?C.gold:C.white}}>{row.pro}</span>}
                </div>
              </div>
            ))}
          </div>

          {error&&<p style={{fontSize:12,color:C.red,margin:"0 0 12px"}}>{error}</p>}
          <button onClick={checkout} disabled={loading}
            className="evid-shimmer-btn"
            style={{width:"100%",padding:"15px",background:C.gold,color:C.ink,border:"none",fontSize:14,fontWeight:900,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif",marginBottom:12}}>
            {loading?"...":plan==="annual"?"Start Pro  - $79/year":"Start Pro  - $9.99/month"}
          </button>
          <p style={{fontSize:11,color:C.gray,textAlign:"center",margin:"0 0 24px"}}>Cancel anytime. No questions asked.</p>
        </div>
      </div>
    </div>
  );
}
/* PAYWALL CARD */
const FREE_VISIBLE=4; // Tier 1 cards visible without account

function FreeGateBanner({onAuth,isMob}){
  return(
    <div style={{border:`1.5px solid ${C.ink}`,background:C.white,padding:isMob?"20px 16px":"24px 28px",textAlign:"center",margin:"4px 0"}}>
      <p style={{fontSize:14,fontWeight:900,color:C.ink,margin:"0 0 6px",letterSpacing:"-.02em"}}>You have seen {FREE_VISIBLE} compounds.</p>
      <p style={{fontSize:13,color:C.gray,margin:"0 0 20px",lineHeight:1.6}}>Create a free account to browse all 33 Tier 1 compounds. No credit card needed.</p>
      <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
        <button onClick={()=>onAuth("signup")} style={{padding:"12px 28px",background:C.ink,color:C.white,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
          Create free account
        </button>
        <button onClick={()=>onAuth("login")} style={{padding:"12px 20px",background:"transparent",color:C.gray,border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>
          Sign in
        </button>
      </div>
    </div>
  );
}

function FreeGateCard({supp,isMob}){
  return(
    <div style={{border:`1px solid ${C.border}`,background:C.white,padding:isMob?"14px 16px":"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,filter:"blur(2px)",pointerEvents:"none",userSelect:"none",opacity:.55}}>
      <div>
        <p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 3px"}}>{supp.name}</p>
        <p style={{fontSize:11,color:C.gray,margin:0}}>Tier {supp.tier} compound</p>
      </div>
      <div style={{display:"flex",gap:8,flexShrink:0}}>
        <div style={{padding:"6px 12px",background:C.bg,border:`1px solid ${C.border}`}}>
          <p style={{fontSize:9,color:C.gray,margin:"0 0 2px",fontWeight:700}}>EFFICACY</p>
          <p style={{fontSize:13,fontWeight:900,color:C.ink,margin:0}}>{supp.effects?.[0]?.efficacy||"-"}/5</p>
        </div>
        <div style={{padding:"6px 12px",background:C.bg,border:`1px solid ${C.border}`}}>
          <p style={{fontSize:9,color:C.gray,margin:"0 0 2px",fontWeight:700}}>EVIDENCE</p>
          <p style={{fontSize:13,fontWeight:900,color:C.ink,margin:0}}>{supp.effects?.[0]?.evidence||"-"}/5</p>
        </div>
      </div>
    </div>
  );
}

function PaywallCard({supp,onUpgrade,isMob,showCTA=true}){
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
        {showCTA&&<button onClick={onUpgrade} style={{padding:"8px 18px",background:C.ink,color:C.white,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif"}}>
          Upgrade to Pro - $9.99/mo
        </button>}
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
      <div style={{height:7,background:C.light,position:"relative",borderRadius:4,overflow:"hidden"}}>
        <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${Math.abs(value)/max*100}%`,background:color,transition:"width .6s cubic-bezier(.16,1,.3,1)",borderRadius:4}}/>
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
function SupplementCard({supp,activeGoal,onClick,isSelected,isPro,onUpgrade,onCompare,compareA,compareB,cardIndex=0}){
  const isMob=useIsMobile();
  const [hovered,setHovered]=useState(false);
  if(supp.tier>=2&&!isPro)return <PaywallCard supp={supp} onUpgrade={onUpgrade} isMob={isMob} onCompare={onCompare} compareA={compareA} compareB={compareB} showCTA={cardIndex%5===0}/>;
  const goalMap=Object.fromEntries(GOALS.map((g,i)=>[g.id,{...g,label:T.controls.goals[i]||g.label}]));
  const effects=activeGoal==="all"?supp.effects:supp.effects.filter(e=>e.goal===activeGoal);
  if(!effects.length)return null;
  const tc=tierColor(supp.tier);
  const avgEff=Math.round(effects.reduce((s,e)=>s+Math.abs(e.efficacy),0)/effects.length);
  const avgEv=Math.round(effects.reduce((s,e)=>s+e.evidence,0)/effects.length);
  return(
    <div
      onClick={onClick}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      style={{
        background:C.white,
        border:`1px solid ${isSelected?C.black:hovered?C.gray:C.border}`,
        borderTop:`3px solid ${tc}`,
        cursor:"pointer",
        transition:"border-color .18s, box-shadow .18s, transform .18s",
        boxShadow:isSelected?"0 8px 32px rgba(0,0,0,.10)":hovered?"0 4px 20px rgba(0,0,0,.08)":"none",
        transform:isSelected?"none":hovered?"translateY(-2px)":"none",
      }}>
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
        {isPro&&onCompare&&(
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            <button onClick={e=>{e.stopPropagation();onCompare(supp);}}
              style={{padding:"4px 10px",fontSize:9,fontWeight:800,background:compareA?.id===supp.id||compareB?.id===supp.id?C.blue:"transparent",color:compareA?.id===supp.id||compareB?.id===supp.id?C.white:C.gray,border:`1px solid ${compareA?.id===supp.id||compareB?.id===supp.id?C.blue:C.border}`,cursor:"pointer",letterSpacing:".06em",fontFamily:"Montserrat,sans-serif"}}>
              {compareA?.id===supp.id||compareB?.id===supp.id?"SELECTED TO COMPARE":"+ COMPARE"}
            </button>
          </div>
        )}
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
          <div style={{padding:"14px 28px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"flex-end"}}>
            <button
              onClick={e=>{e.stopPropagation();window.history.pushState({},"","/compound/"+supp.id);window.dispatchEvent(new PopStateEvent("popstate"));}}
              style={{padding:"9px 20px",background:C.ink,color:C.white,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".06em"}}>
              View Full Profile →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* WEEKLY PROTOCOL AI */
function WeeklyProtocolAI({onUpgrade}){
  const {isPro}=useAuth();
  const isMob=useIsMobile();
  const [goals,setGoals]=useState([]);
  const [stack,setStack]=useState("");
  const [budget,setBudget]=useState(100);
  const [experience,setExperience]=useState("intermediate");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [activeWeek,setActiveWeek]=useState(0);

  const GOAL_OPTS=[
    {id:"sleep",label:"Sleep",icon:"😴"},{id:"focus",label:"Focus",icon:"🎯"},
    {id:"memory",label:"Memory",icon:"🧠"},{id:"mood",label:"Mood",icon:"😊"},
    {id:"force",label:"Strength",icon:"💪"},{id:"recovery",label:"Recovery",icon:"🔄"},
    {id:"energy",label:"Energy",icon:"⚡"},{id:"hormones",label:"Testosterone",icon:"🩸"},
    {id:"stress",label:"Stress",icon:"🧘"},{id:"longevity",label:"Longevity",icon:"❤️"},
    {id:"weight",label:"Weight Loss",icon:"⚖️"},{id:"cardio",label:"Cardio",icon:"🫀"},
  ];

  const toggleGoal=(id)=>setGoals(g=>g.includes(id)?g.filter(x=>x!==id):[...g,id]);

  const build=async()=>{
    if(!goals.length){setError("Select at least one goal.");return;}
    setError("");setLoading(true);setResult(null);
    try{
      const res=await fetch("/api/weekly-protocol",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goals,stack,budget,experience})});
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      setResult(data);setActiveWeek(0);
    }catch(e){setError(e.message||"Something went wrong.");}
    finally{setLoading(false);}
  };

  if(!isPro)return(
    <div style={{maxWidth:680,margin:"80px auto",padding:"0 24px",textAlign:"center"}}>
      <span style={{fontSize:48,display:"block",marginBottom:20}}>📅</span>
      <h2 style={{fontSize:isMob?24:32,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 12px"}}>Weekly Protocol AI</h2>
      <p style={{fontSize:14,color:C.gray,lineHeight:1.8,margin:"0 auto 32px",maxWidth:480}}>Get a 4-week progressive protocol customized to your goals. The AI introduces compounds strategically, week by week, for maximum results and minimal side effects.</p>
      <button onClick={onUpgrade} style={{padding:"14px 32px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:900,cursor:"pointer",letterSpacing:".04em"}}>Unlock with Pro</button>
    </div>
  );

  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:isMob?"24px 16px 60px":"48px 48px 80px"}}>
      <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gold,margin:"0 0 8px",textTransform:"uppercase"}}>Pro Feature</p>
      <h2 style={{fontSize:isMob?24:36,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 8px"}}>Weekly Protocol AI</h2>
      <p style={{fontSize:13,color:C.gray,margin:"0 0 28px",lineHeight:1.7}}>A 4-week personalized plan that introduces compounds progressively.</p>

      {!result&&(
        <div>
          <div style={{marginBottom:20}}>
            <p style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>1. Your goals</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {GOAL_OPTS.map(g=>(
                <button key={g.id} onClick={()=>toggleGoal(g.id)}
                  style={{padding:"8px 14px",background:goals.includes(g.id)?C.ink:C.white,color:goals.includes(g.id)?C.white:C.gray,border:`1px solid ${goals.includes(g.id)?C.ink:C.border}`,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>
                  {g.icon} {g.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:16,marginBottom:20}}>
            <div>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>2. Monthly budget: ${budget}</p>
              <input type="range" min={30} max={500} value={budget} onChange={e=>setBudget(+e.target.value)} style={{width:"100%",accentColor:C.ink}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:C.gray}}>$30</span><span style={{fontSize:10,color:C.gray}}>$500</span></div>
            </div>
            <div>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>3. Experience level</p>
              <div style={{display:"flex",gap:0}}>
                {["beginner","intermediate","advanced"].map(e=>(
                  <button key={e} onClick={()=>setExperience(e)}
                    style={{flex:1,padding:"9px 4px",background:experience===e?C.ink:C.white,color:experience===e?C.white:C.gray,border:`1px solid ${C.border}`,fontSize:10,fontWeight:800,cursor:"pointer",marginLeft:-1,fontFamily:"Montserrat,sans-serif",textTransform:"uppercase",letterSpacing:".04em"}}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{marginBottom:20}}>
            <p style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>4. Already taking (optional)</p>
            <input value={stack} onChange={e=>setStack(e.target.value)} placeholder="e.g. Creatine, Vitamin D, Omega-3..."
              style={{width:"100%",padding:"11px 14px",border:`1px solid ${C.border}`,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",boxSizing:"border-box"}}/>
          </div>

          {error&&<p style={{fontSize:12,color:C.red,margin:"0 0 12px"}}>{error}</p>}
          <button onClick={build} disabled={loading}
            style={{padding:"13px 28px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:900,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif"}}>
            {loading?"Building your protocol...":"Build 4-Week Protocol"}
          </button>
        </div>
      )}

      {result&&(
        <div>
          <div style={{background:C.ink,padding:"20px 24px",marginBottom:24}}>
            <p style={{fontSize:11,fontWeight:800,color:C.gold,letterSpacing:".1em",margin:"0 0 4px",textTransform:"uppercase"}}>{result.protocol_name}</p>
            <p style={{fontSize:12,color:"#9ca3af",margin:0,lineHeight:1.7}}>{result.overview}</p>
          </div>

          {/* Week tabs */}
          <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`1px solid ${C.border}`}}>
            {result.weeks?.map((w,i)=>(
              <button key={i} onClick={()=>setActiveWeek(i)}
                style={{flex:1,padding:"10px 4px",background:"transparent",color:activeWeek===i?C.ink:C.gray,border:"none",borderBottom:activeWeek===i?`2px solid ${C.ink}`:"2px solid transparent",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
                WK {w.week}
              </button>
            ))}
          </div>

          {result.weeks?.[activeWeek]&&(
            <div>
              <div style={{marginBottom:16}}>
                <p style={{fontSize:14,fontWeight:900,color:C.ink,margin:"0 0 4px"}}>{result.weeks[activeWeek].theme}</p>
                <p style={{fontSize:12,color:C.gray,margin:"0 0 16px"}}>{result.weeks[activeWeek].focus}</p>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {result.weeks[activeWeek].compounds?.map((c,i)=>(
                    <div key={i} style={{display:"grid",gridTemplateColumns:isMob?"1fr":"2fr 1fr 1fr",gap:8,padding:"14px 16px",background:C.bg,border:`1px solid ${C.border}`}}>
                      <div><p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 2px"}}>{c.name}</p><p style={{fontSize:11,color:C.gray,margin:0}}>{c.why_now}</p></div>
                      <div><p style={{fontSize:9,fontWeight:700,color:C.gray,margin:"0 0 2px",textTransform:"uppercase",letterSpacing:".08em"}}>Dose</p><p style={{fontSize:11,fontWeight:700,color:C.ink,margin:0}}>{c.dose}</p></div>
                      <div><p style={{fontSize:9,fontWeight:700,color:C.gray,margin:"0 0 2px",textTransform:"uppercase",letterSpacing:".08em"}}>When</p><p style={{fontSize:11,fontWeight:700,color:C.ink,margin:0}}>{c.timing}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{padding:"14px 16px",background:`${C.green}0a`,border:`1px solid ${C.green}20`}}>
                <p style={{fontSize:10,fontWeight:800,color:C.green,letterSpacing:".1em",margin:"0 0 4px",textTransform:"uppercase"}}>What to expect</p>
                <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.6}}>{result.weeks[activeWeek].what_to_expect}</p>
              </div>
            </div>
          )}

          {/* Daily schedule */}
          {result.daily_schedule?.length>0&&(
            <div style={{marginTop:24}}>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>Daily schedule</p>
              <div style={{display:"flex",flexDirection:"column",gap:1}}>
                {result.daily_schedule.map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:16,padding:"11px 16px",background:i%2===0?C.white:C.bg,alignItems:"flex-start"}}>
                    <span style={{fontSize:11,fontWeight:900,color:C.ink,minWidth:90,flexShrink:0}}>{s.time}</span>
                    <div><span style={{fontSize:12,color:C.gray}}>{s.action}</span>{s.note&&<span style={{fontSize:11,color:C.blue,marginLeft:8}}> - {s.note}</span>}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.reassessment&&(
            <div style={{marginTop:20,padding:"14px 16px",background:C.bg,border:`1px solid ${C.border}`}}>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:".1em",color:C.gray,margin:"0 0 4px",textTransform:"uppercase"}}>Week 4 reassessment</p>
              <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.6}}>{result.reassessment}</p>
            </div>
          )}

          <button onClick={()=>{setResult(null);setGoals([]);}}
            style={{marginTop:24,padding:"10px 20px",background:"transparent",border:`1px solid ${C.border}`,fontSize:11,fontWeight:700,cursor:"pointer",color:C.gray,fontFamily:"Montserrat,sans-serif"}}>
            Build new protocol
          </button>
        </div>
      )}
    </div>
  );
}

/* INTERACTION CHECKER */
function InteractionChecker({onUpgrade}){
  const {isPro}=useAuth();
  const isMob=useIsMobile();
  const [input,setInput]=useState("");
  const [compounds,setCompounds]=useState([]);
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const NAMES=SUPPLEMENTS.map(s=>s.name);
  const [suggestions,setSuggestions]=useState([]);
  const [showSugg,setShowSugg]=useState(false);

  const onInputChange=(val)=>{
    setInput(val);
    if(val.length<2){setSuggestions([]);setShowSugg(false);return;}
    const q=val.toLowerCase();
    const matches=NAMES.filter(n=>n.toLowerCase().includes(q)).slice(0,6);
    setSuggestions(matches);
    setShowSugg(matches.length>0);
  };

  const addCompound=(name)=>{
    const t=(name||input).trim();
    if(!t||compounds.includes(t))return;
    if(compounds.length>=8){setError("Max 8 compounds.");return;}
    setCompounds(c=>[...c,t]);setInput("");setSuggestions([]);setShowSugg(false);setError("");
  };

  const check=async()=>{
    if(compounds.length<2){setError("Add at least 2 compounds.");return;}
    setError("");setLoading(true);setResult(null);
    try{
      const res=await fetch("/api/interaction-check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({compounds,userProfile:userProfile||null})});
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      setResult(data);
    }catch(e){setError(e.message||"Something went wrong.");}
    finally{setLoading(false);}
  };

  const typeColor={SYNERGY:C.green,CAUTION:C.amber,TIMING:C.blue,NEUTRAL:C.gray};
  const safetyColor={SAFE:C.green,CAUTION:C.amber,RISKY:C.red};

  if(!isPro)return(
    <div style={{maxWidth:680,margin:"80px auto",padding:"0 24px",textAlign:"center"}}>
      <span style={{fontSize:48,display:"block",marginBottom:20}}>⚗️</span>
      <h2 style={{fontSize:isMob?24:32,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 12px"}}>Interaction Checker</h2>
      <p style={{fontSize:14,color:C.gray,lineHeight:1.8,margin:"0 auto 32px",maxWidth:480}}>Enter your stack and get an AI-powered safety analysis. Know exactly what interacts, what synergizes, and the optimal timing for every compound.</p>
      <button onClick={onUpgrade} style={{padding:"14px 32px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:900,cursor:"pointer",letterSpacing:".04em"}}>Unlock with Pro</button>
    </div>
  );

  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:isMob?"24px 16px 60px":"48px 48px 80px"}}>
      <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gold,margin:"0 0 8px",textTransform:"uppercase"}}>Pro Feature</p>
      <h2 style={{fontSize:isMob?24:36,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 8px"}}>Interaction Checker</h2>
      <p style={{fontSize:13,color:C.gray,margin:"0 0 28px",lineHeight:1.7}}>Add 2-8 compounds from your stack for a full safety and synergy analysis.</p>

      {/* Input */}
      <div style={{position:"relative",marginBottom:12}}>
        <div style={{display:"flex",gap:0,boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
          <input value={input} onChange={e=>onInputChange(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter")addCompound();if(e.key==="Escape"){setShowSugg(false);}}}
            onBlur={()=>setTimeout(()=>setShowSugg(false),150)}
            onFocus={()=>input.length>=2&&setSuggestions.length>0&&setShowSugg(true)}
            placeholder="Type a compound name..."
            style={{flex:1,padding:"13px 16px",border:`1px solid ${C.border}`,borderRight:"none",fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",minWidth:0}}/>
          <button onClick={()=>addCompound()} style={{padding:"13px 20px",background:C.ink,color:C.white,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",flexShrink:0,fontFamily:"Montserrat,sans-serif"}}>Add</button>
        </div>
        {showSugg&&suggestions.length>0&&(
          <div style={{position:"absolute",top:"100%",left:0,right:0,background:C.white,border:`1px solid ${C.border}`,borderTop:"none",zIndex:100,boxShadow:"0 8px 24px rgba(0,0,0,.1)"}}>
            {suggestions.map(s=>(
              <div key={s} onMouseDown={()=>addCompound(s)}
                style={{padding:"11px 16px",fontSize:13,fontWeight:600,color:C.ink,cursor:"pointer",borderBottom:`1px solid ${C.border}`,background:C.white}}
                onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      {compounds.length>0&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
          {compounds.map(c=>(
            <div key={c} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:C.ink,color:C.white,fontSize:12,fontWeight:700}}>
              {c}
              <span onClick={()=>setCompounds(arr=>arr.filter(x=>x!==c))} style={{cursor:"pointer",fontSize:14,opacity:.6,fontWeight:900}}>x</span>
            </div>
          ))}
        </div>
      )}

      {error&&<p style={{fontSize:12,color:C.red,margin:"0 0 12px"}}>{error}</p>}

      <button onClick={check} disabled={loading||compounds.length<2}
        style={{padding:"13px 28px",background:compounds.length>=2?C.gold:"#d4d0c8",color:C.ink,border:"none",fontSize:13,fontWeight:900,cursor:compounds.length>=2?"pointer":"default",letterSpacing:".04em",marginBottom:32,fontFamily:"Montserrat,sans-serif"}}>
        {loading?"Analyzing...":"Analyze Interactions"}
      </button>

      {/* Results */}
      {result&&(
        <div>
          {/* Safety badge */}
          <div style={{display:"flex",alignItems:"center",gap:16,padding:"16px 20px",background:C.ink,marginBottom:20}}>
            <div style={{width:14,height:14,borderRadius:"50%",background:safetyColor[result.overall_safety]||C.gray,flexShrink:0}}/>
            <div>
              <p style={{fontSize:11,fontWeight:800,color:safetyColor[result.overall_safety]||C.gray,letterSpacing:".1em",margin:"0 0 2px",textTransform:"uppercase"}}>{result.overall_safety}</p>
              <p style={{fontSize:12,color:"#9ca3af",margin:0,lineHeight:1.6}}>{result.overall_summary}</p>
            </div>
          </div>

          {/* Interactions */}
          {result.interactions?.length>0&&(
            <div style={{marginBottom:24}}>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>Interactions Found</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {result.interactions.map((ix,i)=>(
                  <div key={i} style={{border:`1px solid ${typeColor[ix.type]||C.border}`,borderLeft:`3px solid ${typeColor[ix.type]||C.border}`,padding:"14px 16px",background:C.white}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                      <span style={{fontSize:9,fontWeight:800,color:typeColor[ix.type],letterSpacing:".1em",textTransform:"uppercase"}}>{ix.type}</span>
                      <span style={{fontSize:13,fontWeight:800,color:C.ink}}>{ix.title}</span>
                    </div>
                    <p style={{fontSize:12,color:C.gray,margin:"0 0 6px",lineHeight:1.6}}>{ix.description}</p>
                    <p style={{fontSize:11,fontWeight:700,color:C.ink,margin:0}}>→ {ix.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timing protocol */}
          {result.timing_protocol?.length>0&&(
            <div style={{marginBottom:24}}>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>Optimal Timing Protocol</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {result.timing_protocol.map((tp,i)=>(
                  <div key={i} style={{display:"flex",gap:16,padding:"12px 16px",background:C.bg,alignItems:"flex-start"}}>
                    <span style={{fontSize:11,fontWeight:900,color:C.ink,minWidth:100,flexShrink:0}}>{tp.time}</span>
                    <span style={{fontSize:12,color:C.gray,lineHeight:1.6}}>{tp.compounds?.join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.missing_synergies&&(
            <div style={{padding:"14px 16px",background:`${C.blue}08`,border:`1px solid ${C.blue}20`}}>
              <p style={{fontSize:10,fontWeight:800,color:C.blue,letterSpacing:".1em",margin:"0 0 4px",textTransform:"uppercase"}}>Synergy opportunity</p>
              <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.6}}>{result.missing_synergies}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* MY TRACKER */
function MyTracker({onUpgrade}){
  const {user,isPro}=useAuth();
  const isMob=useIsMobile();
  const [stack,setStack]=useState([]);
  const [newItem,setNewItem]=useState("");
  const [trackerSugg,setTrackerSugg]=useState([]);
  const [logs,setLogs]=useState({}); // {YYYY-MM-DD: {taken:[],mood:3,energy:3,note:""}}
  const [selectedDay,setSelectedDay]=useState(new Date().toISOString().slice(0,10));
  const [saving,setSaving]=useState(false);

  // Load from localStorage (no Firebase reads to avoid cost)
  useEffect(()=>{
    const saved=localStorage.getItem(`evidstack_tracker_${user?.uid}`);
    if(saved)try{const d=JSON.parse(saved);setStack(d.stack||[]);setLogs(d.logs||{});}catch(e){}
  },[user]);

  const save=(newStack,newLogs)=>{
    if(!user)return;
    const data={stack:newStack??stack,logs:newLogs??logs};
    localStorage.setItem(`evidstack_tracker_${user.uid}`,JSON.stringify(data));
  };

  const addToStack=()=>{
    const t=newItem.trim();
    if(!t||stack.includes(t))return;
    const s=[...stack,t];setStack(s);setNewItem("");save(s,null);
  };

  const getLog=()=>logs[selectedDay]||{taken:[],mood:3,energy:3,note:""};
  const setLog=(patch)=>{
    const updated={...logs,[selectedDay]:{...getLog(),...patch}};
    setLogs(updated);save(null,updated);
  };

  const toggleTaken=(item)=>{
    const log=getLog();
    const taken=log.taken.includes(item)?log.taken.filter(x=>x!==item):[...log.taken,item];
    setLog({taken});
  };

  // Last 7 days for mini chart
  const last7=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-6+i);
    return d.toISOString().slice(0,10);
  });

  if(!isPro)return(
    <div style={{maxWidth:680,margin:"80px auto",padding:"0 24px",textAlign:"center"}}>
      <span style={{fontSize:48,display:"block",marginBottom:20}}>📊</span>
      <h2 style={{fontSize:isMob?24:32,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 12px"}}>My Tracker</h2>
      <p style={{fontSize:14,color:C.gray,lineHeight:1.8,margin:"0 auto 32px",maxWidth:480}}>Log your daily supplements and track mood and energy over time. See which compounds actually move the needle for you.</p>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,padding:"32px",marginBottom:32,textAlign:"left"}}>
        {[["🗓️","Daily check-in","Log what you took each day in seconds"],["😴","Mood and energy scores","Rate 1-5 and spot patterns over time"],["📈","7-day chart","Visual breakdown of your weekly consistency"],["🔗","Correlation detection","See which days you feel best and why"]].map(([icon,title,desc])=>(
          <div key={title} style={{display:"flex",gap:14,marginBottom:20}}>
            <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
            <div><p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 3px"}}>{title}</p><p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.5}}>{desc}</p></div>
          </div>
        ))}
      </div>
      <button onClick={onUpgrade} style={{padding:"14px 32px",background:C.ink,color:C.white,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif",width:"100%",maxWidth:340}}>
        Upgrade to Pro - $9.99/month
      </button>
      <p style={{fontSize:11,color:C.gray,marginTop:12}}>Cancel anytime. Full access to all {Math.floor(SUPPLEMENTS.length/10)*10}+ compounds + AI tools.</p>
      <div style={{maxWidth:520,margin:"32px auto 0",textAlign:"left"}}>
        <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>Example - Week log</p>
        <div style={{border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,background:C.white}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr repeat(7,28px)",gap:4,padding:"12px 16px",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
            <span style={{fontSize:10,fontWeight:800,color:C.gray}}>COMPOUND</span>
            {["M","T","W","T","F","S","S"].map((d,i)=><span key={i} style={{fontSize:10,fontWeight:800,color:C.gray,textAlign:"center"}}>{d}</span>)}
          </div>
          {[["Creatine",[1,1,1,1,1,1,0]],["Vitamin D3",[1,1,1,1,1,1,1]],["Ashwagandha",[1,0,1,0,1,0,1]],["Omega-3",[1,1,0,1,1,1,0]]].map(([name,days])=>(
            <div key={name} style={{display:"grid",gridTemplateColumns:"1fr repeat(7,28px)",gap:4,padding:"8px 16px",borderBottom:`1px solid ${C.border}`,alignItems:"center"}}>
              <span style={{fontSize:11,fontWeight:700,color:C.ink}}>{name}</span>
              {days.map((d,i)=><span key={i} style={{fontSize:14,textAlign:"center"}}>{d?"✓":""}</span>)}
            </div>
          ))}
          <div style={{padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:11,color:C.gray}}>Avg mood this week</span>
            <span style={{fontSize:13,fontWeight:900,color:C.ink}}>4.1 / 5</span>
          </div>
          <div style={{padding:"12px 20px",background:"#1f2937",textAlign:"center"}}>
            <p style={{fontSize:11,color:"#6b7280",margin:0,fontStyle:"italic"}}>Unlock Pro to start tracking your stack</p>
          </div>
        </div>
      </div>
    </div>
  );

  const log=getLog();
  const daysThisWeek=last7.filter(d=>logs[d]?.taken?.length>0).length;

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
        <div style={{background:"#f59e0b",padding:"12px 0",marginBottom:0}}>
          <div style={{maxWidth:900,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>📊</span>
            <span style={{fontSize:11,fontWeight:900,color:"rgba(0,0,0,.65)",letterSpacing:".16em",textTransform:"uppercase"}}>My Tracker</span>
            <span style={{marginLeft:"auto",fontSize:10,fontWeight:800,color:"rgba(0,0,0,.5)",background:"rgba(0,0,0,.08)",padding:"3px 8px",letterSpacing:".08em",borderRadius:2}}>PRO</span>
          </div>
        </div>
      <div style={{maxWidth:760,margin:"0 auto",padding:isMob?"24px 16px 80px":"48px 48px 80px"}}>
      <h2 style={{fontSize:isMob?24:36,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 24px"}}>My Tracker</h2>

      {/* Stats bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:28}}>
        {[
          ["Compounds tracked",stack.length],
          ["Days logged this week",`${daysThisWeek}/7`],
          ["Today's intake",`${log.taken.length}/${stack.length}`],
        ].map(([label,val])=>(
          <div key={label} style={{background:C.ink,padding:"16px 14px",textAlign:"center"}}>
            <p style={{fontSize:isMob?20:24,fontWeight:900,color:C.white,margin:"0 0 4px"}}>{val}</p>
            <p style={{fontSize:9,color:"#6b7280",fontWeight:700,letterSpacing:".08em",margin:0,textTransform:"uppercase"}}>{label}</p>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:20}}>
        {/* Left: stack setup */}
        <div>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>My stack</p>
          <div style={{position:"relative",marginBottom:10}}>
            <div style={{display:"flex",gap:0}}>
              <input value={newItem} onChange={e=>{setNewItem(e.target.value);const q=e.target.value.toLowerCase();setTrackerSugg(q.length>=2?SUPPLEMENTS.map(s=>s.name).filter(n=>n.toLowerCase().includes(q)).slice(0,5):[]);}}
                onKeyDown={e=>e.key==="Enter"&&addToStack()}
                onBlur={()=>setTimeout(()=>setTrackerSugg([]),150)}
                placeholder="Search compounds..." style={{flex:1,padding:"9px 12px",border:`1px solid ${C.border}`,borderRight:"none",fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none"}}/>
              <button onClick={addToStack} style={{padding:"9px 14px",background:C.ink,color:C.white,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Add</button>
            </div>
            {trackerSugg.length>0&&(
              <div style={{position:"absolute",top:"100%",left:0,right:0,background:C.white,border:`1px solid ${C.border}`,borderTop:"none",zIndex:100,boxShadow:"0 6px 20px rgba(0,0,0,.1)"}}>
                {trackerSugg.map(s=>(
                  <div key={s} onMouseDown={()=>{if(!stack.includes(s)){const st=[...stack,s];setStack(st);save(st,null);}setNewItem("");setTrackerSugg([]);}}
                    style={{padding:"8px 12px",fontSize:12,fontWeight:600,color:C.ink,cursor:"pointer",borderBottom:`1px solid ${C.border}`}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                    onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:1}}>
            {stack.map(item=>(
              <div key={item} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:C.bg,border:`1px solid ${C.border}`}}>
                <span style={{fontSize:12,fontWeight:600,color:C.ink}}>{item}</span>
                <span onClick={()=>{const s=stack.filter(x=>x!==item);setStack(s);save(s,null);}} style={{cursor:"pointer",fontSize:13,color:C.gray}}>x</span>
              </div>
            ))}
            {stack.length===0&&(
              <div>
                <p style={{fontSize:12,color:C.gray,padding:"12px 0 8px",margin:0}}>Add your supplements above or start with common picks:</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {["Creatine Monohydrate","Vitamin D3 + K2","Omega-3 EPA/DHA","Magnesium Bisglycinate","Zinc Bisglycinate","Ashwagandha KSM-66","L-Theanine","Caffeine"].map(sug=>(
                    <button key={sug} onClick={()=>{if(!stack.includes(sug)){const s=[...stack,sug];setStack(s);save(s,null);}}}
                      style={{padding:"5px 12px",background:C.bg,border:`1px solid ${C.border}`,fontSize:11,fontWeight:700,color:C.gray,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: daily log */}
        <div>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>
            Log for {new Date(selectedDay+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}
          </p>
          <input type="date" value={selectedDay} onChange={e=>setSelectedDay(e.target.value)}
            style={{width:"100%",padding:"8px 10px",border:`1px solid ${C.border}`,fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",marginBottom:12,boxSizing:"border-box"}}/>

          {/* Taken checkboxes */}
          {stack.length>0&&(
            <div style={{marginBottom:14}}>
              <p style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 8px",textTransform:"uppercase"}}>Taken today</p>
              {stack.map(item=>(
                <div key={item} onClick={()=>toggleTaken(item)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:"pointer",background:log.taken.includes(item)?`${C.green}10`:C.white,border:`1px solid ${log.taken.includes(item)?C.green:C.border}`,marginBottom:4}}>
                  <div style={{width:14,height:14,border:`2px solid ${log.taken.includes(item)?C.green:C.border}`,background:log.taken.includes(item)?C.green:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {log.taken.includes(item)&&<span style={{color:C.white,fontSize:10,fontWeight:900,lineHeight:1}}>✓</span>}
                  </div>
                  <span style={{fontSize:12,fontWeight:600,color:C.ink}}>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Mood & Energy */}
          {[["mood","Mood 😊"],["energy","Energy ⚡"]].map(([key,label])=>(
            <div key={key} style={{marginBottom:12}}>
              <p style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 6px",textTransform:"uppercase"}}>{label}</p>
              <div style={{display:"flex",gap:4}}>
                {[1,2,3,4,5].map(v=>(
                  <button key={v} onClick={()=>setLog({[key]:v})}
                    style={{flex:1,padding:"8px 4px",background:log[key]===v?C.ink:C.white,color:log[key]===v?C.white:C.gray,border:`1px solid ${log[key]===v?C.ink:C.border}`,fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <textarea value={log.note||""} onChange={e=>setLog({note:e.target.value})} placeholder="Notes (optional)..."
            style={{width:"100%",padding:"9px 12px",border:`1px solid ${C.border}`,fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",resize:"vertical",minHeight:60,boxSizing:"border-box"}}/>
        </div>
      </div>

      {/* 7-day mini view */}
      {last7.some(d=>logs[d])&&(
        <div style={{marginTop:28}}>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>Last 7 days</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {last7.map(d=>{
              const l=logs[d]||{};
              const pct=stack.length?((l.taken||[]).length/stack.length):0;
              return(
                <div key={d} onClick={()=>setSelectedDay(d)} style={{cursor:"pointer",textAlign:"center",padding:"8px 4px",background:d===selectedDay?C.ink:C.bg,border:`1px solid ${d===selectedDay?C.ink:C.border}`}}>
                  <div style={{fontSize:9,fontWeight:700,color:d===selectedDay?C.white:C.gray,marginBottom:4}}>
                    {new Date(d+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short"}).toUpperCase()}
                  </div>
                  <div style={{height:32,background:d===selectedDay?"#374151":C.border,borderRadius:2,overflow:"hidden",margin:"0 4px"}}>
                    <div style={{height:`${pct*100}%`,background:pct>0.8?C.green:pct>0.5?C.amber:C.red,marginTop:`${(1-pct)*100}%`,transition:"height .3s"}}/>
                  </div>
                  {l.mood&&<div style={{fontSize:9,color:d===selectedDay?C.white:C.gray,marginTop:4,fontWeight:700}}>{l.mood}/5</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}

/* COMPOUNDMAXXING */
function CompoundmaxxingPage({onUpgrade,onNavigate}){
  const {isPro}=useAuth();
  const isMob=useIsMobile();

  const stacks=[
    {
      id:"healing-beginner",
      free:true,
      category:"Healing",
      level:"Beginner",
      name:"The Gold Standard Healing Stack",
      desc:"Comprehensive tissue repair from two complementary pathways. BPC-157 works systemically on soft tissue, TB-500 on structural repair and angiogenesis.",
      compounds:["BPC-157","TB-500"],
      color:"#16a34a",
      icon:"🩹",
      note:"Inject subcutaneously or IM. Cycle 8-12 weeks, assess results.",
    },
    {
      id:"healing-advanced",
      free:false,
      category:"Healing",
      level:"Advanced",
      name:"Complete Recovery Stack",
      desc:"Maximum healing support with GH enhancement. GHK-Cu adds cellular regeneration and collagen synthesis. Ipamorelin pulses GH for accelerated tissue repair.",
      compounds:["BPC-157","TB-500","GHK-Cu","Ipamorelin"],
      color:"#16a34a",
      icon:"🧬",
      note:"Run Ipamorelin at night, peptides morning and evening.",
    },
    {
      id:"gh-beginner",
      free:true,
      category:"GH Release",
      level:"Beginner",
      name:"Ipamorelin + CJC-1295",
      desc:"Classic GHRP + GHRH combination. Synergistic GH release without disrupting natural pulsatile patterns. The most popular GH peptide stack for a reason.",
      compounds:["Ipamorelin","CJC-1295 (no DAC)"],
      color:"#7c3aed",
      icon:"📈",
      note:"Inject 30 min before sleep on empty stomach for maximum GH pulse.",
    },
    {
      id:"gh-advanced",
      free:false,
      category:"GH Release",
      level:"Advanced",
      name:"Full GH Optimization",
      desc:"Comprehensive GH optimization combining pulsatile release (Ipamorelin + CJC) with sustained elevation (MK-677). Covers all GH secretion mechanisms.",
      compounds:["Ipamorelin","CJC-1295 (no DAC)","MK-677"],
      color:"#7c3aed",
      icon:"🚀",
      note:"MK-677 orally before bed, peptides injected 2-3x daily. Expect significant water retention initially.",
    },
    {
      id:"weightloss-advanced",
      free:false,
      category:"Weight Loss",
      level:"Advanced",
      name:"Semaglutide + Tesamorelin",
      desc:"Appetite control + visceral fat targeting for comprehensive body recomposition. Tesamorelin specifically reduces visceral adipose tissue  -  FDA approved for HIV lipodystrophy.",
      compounds:["Semaglutide","Tesamorelin"],
      color:"#d97706",
      icon:"⚖️",
      note:"Requires prescription in most countries. Medical supervision strongly recommended.",
    },
    {
      id:"weightloss-beginner",
      free:true,
      category:"Weight Loss",
      level:"Beginner",
      name:"GLP-1 + AOD-9604",
      desc:"Appetite management with HGH-fragment fat metabolism support. AOD-9604 is the lipolytic fragment of HGH without anabolic effects  -  excellent safety profile.",
      compounds:["Semaglutide","AOD-9604"],
      color:"#d97706",
      icon:"🔥",
      note:"AOD-9604 injected subcutaneously 250-500mcg/day, separate from Semaglutide timing.",
    },
    {
      id:"longevity-advanced",
      free:false,
      category:"Anti-Aging",
      level:"Advanced",
      name:"Longevity Peptide Stack",
      desc:"Multi-target approach: Epithalon activates telomerase for telomere maintenance, BPC-157 provides systemic repair, GHK-Cu drives cellular regeneration and collagen synthesis.",
      compounds:["Epithalon","BPC-157","GHK-Cu"],
      color:"#dc2626",
      icon:"♾️",
      note:"Epithalon typically cycled 10-20 days, 1-2x per year. Others can be run continuously.",
    },
    {
      id:"cognitive-longevity",
      free:false,
      category:"Cognitive",
      level:"Advanced",
      name:"Cognitive Longevity Stack",
      desc:"Neuroprotection, cognitive enhancement, and longevity support. Semax drives BDNF and cognitive performance, Selank reduces anxiety without sedation, Epithalon addresses neurological aging.",
      compounds:["Semax","Selank","Epithalon"],
      color:"#2563eb",
      icon:"🧠",
      note:"Semax and Selank can be administered as nasal sprays. Epithalon subcutaneous.",
    },
  ];

  const looksStacks=[
    {
      id:"skin-peptide",
      category:"Skin",
      level:"Beginner",
      name:"Skin Peptide Protocol",
      desc:"GHK-Cu drives collagen and elastin synthesis. Epithalon addresses cellular aging. Combined with oral Hyaluronic Acid for maximum skin quality.",
      compounds:["GHK-Cu","Hyaluronic Acid","Astaxanthin"],
      color:"#ec4899",
      icon:"✨",
      note:"GHK-Cu topical or injectable. HA oral 120-240mg/day. Astaxanthin 12mg/day.",
    },
    {
      id:"hair-stack",
      category:"Hair",
      level:"Advanced",
      name:"Hair Retention Stack",
      desc:"Multi-mechanism DHT blocking combined with follicle stimulation. Finasteride inhibits 5-AR systemically, Pumpkin Seed Oil adds topical DHT inhibition, Minoxidil stimulates follicles directly.",
      compounds:["Finasteride","Minoxidil","Pumpkin Seed Oil","Biotin"],
      color:"#f59e0b",
      icon:"💈",
      note:"Finasteride requires prescription. Blood work recommended before starting. Results in 6-12 months.",
    },
    {
      id:"face-recomp",
      category:"Face Recomp",
      level:"Beginner",
      name:"Face Fat Protocol",
      desc:"GLP-1 for systemic fat loss with bias toward facial fat. Tesamorelin specifically targets visceral and subcutaneous fat. Collagen supports skin elasticity during fat loss.",
      compounds:["Semaglutide","Collagen Peptides","Pycnogenol"],
      color:"#06b6d4",
      icon:"💆",
      note:"Lose face fat gradually  -  too rapid loss causes loose skin. Collagen counters this.",
    },
  ];

  const categories=[...new Set(stacks.map(s=>s.category))];
  const [activeCategory,setActiveCategory]=useState("All");

  const displayStacks = isPro ? stacks : stacks.filter(s=>s.free);
  const filtered = activeCategory==="All" ? displayStacks : displayStacks.filter(s=>s.category===activeCategory);

  const levelColor={Beginner:C.green,Advanced:C.purple};

  return(
    <div style={{minHeight:"60vh"}}>
      {/* Hero */}
      <div style={{background:C.ink,padding:isMob?"40px 16px":"64px 48px"}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".2em",color:C.gold,margin:"0 0 10px",textTransform:"uppercase"}}>Evidstack  -  Compoundmaxxing</p>
          <h1 style={{fontSize:isMob?28:48,fontWeight:900,letterSpacing:"-.04em",color:C.white,margin:"0 0 16px",lineHeight:1.05}}>Peptide stacks.<br/>Evidence-based.</h1>
          <p style={{fontSize:isMob?13:15,color:"#9ca3af",margin:"0 0 32px",maxWidth:580,lineHeight:1.8}}>
            Every stack curated from published research and clinical data. Dosing, timing, mechanisms  -  no bro science.
          </p>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {[[(Math.floor(SUPPLEMENTS.length/10)*10).toString()+"+","compounds"],["Peptides","fully documented"],["PubMed","primary source"]].map(([val,label])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 20px",border:"1px solid #374151"}}>
                <span style={{fontSize:14,fontWeight:900,color:C.white}}>{val}</span>
                <span style={{fontSize:11,color:"#6b7280"}}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Looksmaxxing stacks */}
      <div style={{padding:isMob?"32px 16px":"48px 48px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>Aesthetics protocols</p>
          <h2 style={{fontSize:isMob?22:32,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 24px"}}>Looksmaxxing stacks.</h2>
          {!isPro&&(
            <div style={{padding:"10px 16px",background:`${C.gold}12`,border:`1px solid ${C.gold}40`,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <p style={{fontSize:12,color:C.ink,margin:0}}><strong>Looksmaxxing stacks are Pro-only.</strong> Skin peptides, hair retention, face recomp protocols.</p>
              <button onClick={onUpgrade} style={{padding:"7px 16px",background:C.gold,color:C.ink,border:"none",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",flexShrink:0}}>Unlock Pro</button>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"repeat(3,1fr)",gap:16,marginBottom:16}}>
            {(isPro?looksStacks:[]).map(s=>(
              <div key={s.id} style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${s.color}`}}>
                <div style={{padding:"20px 20px 16px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <span style={{fontSize:24}}>{s.icon}</span>
                    <div style={{display:"flex",gap:6}}>
                      <span style={{fontSize:8,fontWeight:800,color:levelColor[s.level],border:`1px solid ${levelColor[s.level]}`,padding:"2px 7px",letterSpacing:".08em"}}>{s.level.toUpperCase()}</span>
                      <span style={{fontSize:8,fontWeight:800,color:s.color,background:`${s.color}12`,border:`1px solid ${s.color}30`,padding:"2px 7px",letterSpacing:".06em"}}>{s.category.toUpperCase()}</span>
                    </div>
                  </div>
                  <p style={{fontSize:14,fontWeight:900,color:C.ink,margin:"0 0 8px",letterSpacing:"-.02em"}}>{s.name}</p>
                  <p style={{fontSize:11,color:C.gray,lineHeight:1.6,margin:"0 0 14px"}}>{s.desc}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
                    {s.compounds.map(c=>(
                      <div key={c} style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{width:4,height:4,background:s.color,borderRadius:2,flexShrink:0}}/>
                        <span style={{fontSize:11,fontWeight:700,color:C.ink}}>{c}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:"8px 10px",background:C.bg,borderLeft:`2px solid ${s.color}`}}>
                    <p style={{fontSize:10,color:C.gray,margin:0,lineHeight:1.5}}>{s.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peptide stacks */}
      <div style={{padding:isMob?"32px 16px":"48px 48px"}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>Peptide protocols</p>
          <h2 style={{fontSize:isMob?22:32,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 24px"}}>Research stacks.</h2>

          {/* Category filter */}
          <div style={{display:"flex",gap:0,marginBottom:28,overflowX:"auto"}}>
            {["All",...categories].map(cat=>(
              <button key={cat} onClick={()=>setActiveCategory(cat)}
                style={{padding:"9px 18px",fontSize:11,fontWeight:700,background:activeCategory===cat?C.ink:"transparent",color:activeCategory===cat?C.white:C.gray,border:`1px solid ${C.border}`,marginLeft:-1,cursor:"pointer",fontFamily:"Montserrat,sans-serif",whiteSpace:"nowrap"}}>
                {cat}
              </button>
            ))}
          </div>

          {!isPro&&(
            <div style={{padding:"10px 16px",background:`${C.gold}12`,border:`1px solid ${C.gold}40`,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <p style={{fontSize:12,color:C.ink,margin:0}}><strong>5 more stacks locked</strong>  -  Full GH Optimization, Longevity, Cognitive, Weight Loss Advanced and more.</p>
              <button onClick={onUpgrade} style={{padding:"7px 16px",background:C.gold,color:C.ink,border:"none",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",flexShrink:0}}>Unlock Pro</button>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:16}}>
            {filtered.map(s=>(
              <div key={s.id} style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${s.color}`}}>
                <div style={{padding:"22px 22px 18px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <span style={{fontSize:26}}>{s.icon}</span>
                    <div style={{display:"flex",gap:6}}>
                      <span style={{fontSize:8,fontWeight:800,color:levelColor[s.level],border:`1px solid ${levelColor[s.level]}`,padding:"2px 7px",letterSpacing:".08em"}}>{s.level.toUpperCase()}</span>
                      <span style={{fontSize:8,fontWeight:800,color:s.color,background:`${s.color}12`,border:`1px solid ${s.color}30`,padding:"2px 7px",letterSpacing:".06em"}}>{s.category.toUpperCase()}</span>
                    </div>
                  </div>
                  <p style={{fontSize:15,fontWeight:900,color:C.ink,margin:"0 0 8px",letterSpacing:"-.02em"}}>{s.name}</p>
                  <p style={{fontSize:12,color:C.gray,lineHeight:1.7,margin:"0 0 14px"}}>{s.desc}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                    {s.compounds.map(c=>(
                      <span key={c} style={{fontSize:10,fontWeight:700,color:C.ink,background:C.bg,border:`1px solid ${C.border}`,padding:"4px 10px"}}>{c}</span>
                    ))}
                  </div>
                  <div style={{padding:"8px 12px",background:`${s.color}08`,borderLeft:`2px solid ${s.color}50`}}>
                    <p style={{fontSize:10,color:C.gray,margin:0,lineHeight:1.5,fontStyle:"italic"}}>{s.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pro CTA */}
          {!isPro&&(
            <div style={{marginTop:32,padding:"28px 32px",background:C.ink,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
              <div>
                <p style={{fontSize:14,fontWeight:900,color:C.white,margin:"0 0 4px"}}>Unlock the full database + AI Compound Advisor.</p>
                <p style={{fontSize:12,color:"#9ca3af",margin:0}}>All 180+ compounds with dosing, interactions, and evidence scores.</p>
              </div>
              <button onClick={onUpgrade} style={{padding:"12px 28px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",flexShrink:0}}>
                Upgrade to Pro
              </button>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{marginTop:24,padding:"14px 16px",background:C.bg,border:`1px solid ${C.border}`}}>
            <p style={{fontSize:10,color:C.gray,margin:0,lineHeight:1.6}}>
              <strong>Research purposes only.</strong> Peptides listed are unscheduled research compounds in most jurisdictions. This is not medical advice. Some compounds require prescriptions in certain countries. Always consult a qualified healthcare provider before starting any peptide protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* AFFILIATE */
function AffiliatePage(){
  const isMob=useIsMobile();
  const [copied,setCopied]=useState(false);

  const copy=(text)=>{
    navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  };

  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:isMob?"40px 16px 80px":"64px 48px 100px"}}>
      {/* Header */}
      <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gold,margin:"0 0 8px",textTransform:"uppercase"}}>Evidstack  -  Affiliate Program</p>
      <h1 style={{fontSize:isMob?28:44,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 16px",lineHeight:1.05}}>Earn 30% recurring commission.</h1>
      <p style={{fontSize:14,color:C.gray,lineHeight:1.8,margin:"0 0 40px",maxWidth:560}}>
        Recommend Evidstack to your audience and earn 30% on every payment  -  every month, for as long as they stay subscribed.
      </p>

      {/* Numbers */}
      <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(3,1fr)",gap:12,marginBottom:40}}>
        {[
          {val:"30%",label:"Recurring commission"},
          {val:"$3/mo",label:"Per monthly subscriber"},
          {val:"$23.70/yr",label:"Per annual subscriber"},
        ].map(s=>(
          <div key={s.label} style={{background:C.ink,padding:"20px 16px",textAlign:"center"}}>
            <p style={{fontSize:isMob?22:28,fontWeight:900,color:C.gold,margin:"0 0 4px"}}>{s.val}</p>
            <p style={{fontSize:10,color:"#6b7280",fontWeight:700,letterSpacing:".08em",margin:0,textTransform:"uppercase"}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{marginBottom:40}}>
        <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 16px",textTransform:"uppercase"}}>How it works</p>
        <div style={{display:"flex",flexDirection:"column",gap:1}}>
          {[
            {n:"01",title:"Apply below",desc:"Send us your name, platform, and audience size. We review and send you a custom link within 48h."},
            {n:"02",title:"Share your link",desc:"Use your tracking link in videos, posts, or bio. No minimum audience required."},
            {n:"03",title:"Earn every month",desc:"30% of every payment your referrals make, automatically, for their entire subscription lifetime."},
            {n:"04",title:"Get paid",desc:"Payouts monthly via PayPal or bank transfer once you hit $20 minimum."},
          ].map(s=>(
            <div key={s.n} style={{display:"flex",gap:20,padding:"18px 20px",background:C.bg,alignItems:"flex-start"}}>
              <span style={{fontSize:11,fontWeight:900,color:C.gold,flexShrink:0,letterSpacing:".04em"}}>{s.n}</span>
              <div>
                <p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 4px"}}>{s.title}</p>
                <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.6}}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who it's for */}
      <div style={{marginBottom:40}}>
        <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 16px",textTransform:"uppercase"}}>Who it is for</p>
        <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:10}}>
          {[
            {icon:"📱",title:"Content creators",desc:"TikTok, YouTube, Instagram  -  fitness, biohacking, looksmaxxing, nootropics content"},
            {icon:"🧬",title:"Peptide / biohacking communities",desc:"Discord servers, Telegram groups, Reddit moderators in relevant communities"},
            {icon:"🏋️",title:"Fitness coaches",desc:"Personal trainers, online coaches with a client base interested in optimization"},
            {icon:"✍️",title:"Newsletter writers",desc:"Health, longevity, or performance newsletters with engaged readers"},
          ].map(s=>(
            <div key={s.title} style={{padding:"16px 18px",border:`1px solid ${C.border}`,background:C.white}}>
              <p style={{fontSize:18,margin:"0 0 6px"}}>{s.icon}</p>
              <p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 4px"}}>{s.title}</p>
              <p style={{fontSize:11,color:C.gray,margin:0,lineHeight:1.6}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Apply form / CTA */}
      <div style={{background:C.ink,padding:isMob?"24px 20px":"32px 40px"}}>
        <p style={{fontSize:14,fontWeight:900,color:C.white,margin:"0 0 8px",letterSpacing:"-.02em"}}>Apply to become an affiliate.</p>
        <p style={{fontSize:12,color:"#9ca3af",margin:"0 0 24px",lineHeight:1.7}}>
          Send an email to <strong style={{color:C.gold}}>evidstack@protonmail.com</strong> with the subject line <strong style={{color:C.white}}>"Affiliate Application"</strong> and include:
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
          {["Your name and platform (TikTok, YouTube, etc.)","Your niche (looksmaxxing, fitness, biohacking, nootropics...)","Approximate audience size","Why you think Evidstack fits your audience"].map(item=>(
            <div key={item} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{color:C.gold,flexShrink:0,fontSize:12,marginTop:2}}>✓</span>
              <span style={{fontSize:12,color:"#e8e5df",lineHeight:1.5}}>{item}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>copy("evidstack@protonmail.com")}
          style={{padding:"12px 24px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
          {copied?"Copied!":"Copy email address"}
        </button>
      </div>

      <p style={{fontSize:11,color:C.gray,margin:"20px 0 0",lineHeight:1.7}}>
        We review all applications within 48 hours. No minimum follower count. We prioritize engaged niche audiences over large generic ones.
      </p>
    </div>
  );
}

/* COMPOUND PAGE */
function CompoundPage({compoundId,onUpgrade,onBack,onAuth}){
  const {user,isPro}=useAuth();
  const isMob=useIsMobile();
  const supp=SUPPLEMENTS.find(s=>s.id===compoundId);

  useEffect(()=>{window.scrollTo({top:0,behavior:"instant"});},[compoundId]);

  if(!supp)return(
    <div style={{maxWidth:680,margin:"80px auto",padding:"0 24px",textAlign:"center"}}>
      <p style={{fontSize:48,marginBottom:20}}>404</p>
      <h2 style={{fontSize:24,fontWeight:900,color:C.ink,margin:"0 0 12px"}}>Compound not found</h2>
      <p style={{fontSize:14,color:C.gray,marginBottom:24}}>This compound does not exist in our database.</p>
      <button onClick={onBack} style={{padding:"11px 24px",background:C.ink,color:C.white,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Back to Supplements</button>
    </div>
  );

  const isLocked=supp.tier>=2&&!isPro;
  const needsAccount=!user;
  const tc=tierColor(supp.tier);
  const tierLabel=TIERS[supp.tier]?.label||"";
  const safetyLabel=["","Risky","Caution","Caution","Safe","Very Safe"][supp.safety]||"";
  const safetyColor=[null,C.red,C.amber,C.amber,C.green,C.green][supp.safety]||C.gray;
  const efColor=(v)=>v>=4?C.green:v===3?C.blue:v===2?C.amber:C.red;

  return(
    <div style={{maxWidth:900,margin:"0 auto",padding:isMob?"24px 16px 80px":"48px 48px 100px"}}>
      {/* Back */}
      <button onClick={onBack}
        style={{display:"flex",alignItems:"center",gap:8,fontSize:12,fontWeight:700,color:C.gray,background:"none",border:"none",cursor:"pointer",fontFamily:"Montserrat,sans-serif",marginBottom:28,padding:0}}>
        ← Back to supplements
      </button>

      {/* Header */}
      <div style={{borderTop:`4px solid ${tc}`,background:C.white,border:`1px solid ${C.border}`,borderTop:`4px solid ${tc}`,marginBottom:24}}>
        <div style={{padding:isMob?"20px 18px":"32px 36px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:16}}>
            <div>
              <p style={{fontSize:9,fontWeight:800,color:tc,letterSpacing:".16em",margin:"0 0 8px",textTransform:"uppercase"}}>TIER {supp.tier} / {tierLabel.toUpperCase()}</p>
              <h1 style={{fontSize:isMob?24:38,fontWeight:900,color:C.ink,margin:"0 0 4px",letterSpacing:"-.03em",lineHeight:1.05}}>{supp.name}</h1>
              {(()=>{
                const filtered=supp.aliases?.filter(a=>a.toLowerCase()!==supp.name.toLowerCase()&&a.toLowerCase()!==supp.id.toLowerCase()).slice(0,3)||[];
                return filtered.length>0?<p style={{fontSize:11,color:C.gray,margin:"6px 0 0"}}>Also known as: {filtered.join(", ")}</p>:null;
              })()}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <div style={{padding:"8px 14px",background:C.bg,border:`1px solid ${C.border}`,textAlign:"center"}}>
                <p style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 2px",textTransform:"uppercase"}}>Safety</p>
                <p style={{fontSize:13,fontWeight:900,color:safetyColor,margin:0}}>{safetyLabel}</p>
              </div>
              <div style={{padding:"8px 14px",background:C.bg,border:`1px solid ${C.border}`,textAlign:"center"}}>
                <p style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 2px",textTransform:"uppercase"}}>Est. Cost</p>
                <p style={{fontSize:12,fontWeight:800,color:C.ink,margin:0}}>{supp.cost||"Varies"}</p>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div style={{padding:"10px 14px",background:`${tc}0a`,borderLeft:`3px solid ${tc}`,marginBottom:0}}>
            <p style={{fontSize:11,color:C.gray,margin:0,lineHeight:1.6}}><strong style={{color:C.ink}}>Legal status:</strong> {supp.legal}</p>
          </div>
        </div>
      </div>

      {needsAccount?(
        <div style={{border:`1.5px solid ${C.ink}`,background:C.white,padding:"36px",textAlign:"center",marginBottom:24}}>
          <p style={{fontSize:13,fontWeight:900,color:C.ink,margin:"0 0 8px",letterSpacing:"-.02em"}}>Create a free account to see the full profile.</p>
          <p style={{fontSize:13,color:C.gray,margin:"0 0 24px",lineHeight:1.6}}>Dosage protocol, evidence scores, study count, interactions, and related compounds. Free forever, no credit card.</p>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>onAuth("signup")} style={{padding:"12px 28px",background:C.ink,color:C.white,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Create free account</button>
            <button onClick={()=>onAuth("login")} style={{padding:"12px 20px",background:"transparent",color:C.gray,border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Sign in</button>
          </div>
        </div>
      ):isLocked?(
        <div style={{background:C.ink,padding:"40px 36px",textAlign:"center",marginBottom:24}}>
          <p style={{fontSize:11,fontWeight:800,color:C.gold,letterSpacing:".16em",margin:"0 0 8px",textTransform:"uppercase"}}>Pro Feature</p>
          <h2 style={{fontSize:24,fontWeight:900,color:C.white,margin:"0 0 12px",letterSpacing:"-.03em"}}>Full profile locked</h2>
          <p style={{fontSize:13,color:"#9ca3af",margin:"0 0 24px",lineHeight:1.7}}>Unlock dosing protocols, evidence scores, interactions, and detailed research summaries for all {Math.floor(SUPPLEMENTS.length/10)*10}+ compounds.</p>
          <button onClick={onUpgrade} style={{padding:"13px 32px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
            Unlock with Pro - $9.99/mo
          </button>
        </div>
      ):(
        <>
          {/* Dosage */}
          {supp.dosage&&(
            <div style={{background:C.white,border:`1px solid ${C.border}`,padding:isMob?"20px 18px":"28px 36px",marginBottom:16}}>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 16px",textTransform:"uppercase"}}>Dosing Protocol</p>
              <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:16,marginBottom:supp.dosage.note?16:0}}>
                {supp.dosage.amount&&(
                  <div style={{padding:"16px 18px",background:C.bg}}>
                    <p style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".12em",margin:"0 0 6px",textTransform:"uppercase"}}>Amount</p>
                    <p style={{fontSize:14,fontWeight:800,color:C.ink,margin:0}}>{supp.dosage.amount}</p>
                  </div>
                )}
                {supp.dosage.timing&&(
                  <div style={{padding:"16px 18px",background:C.bg}}>
                    <p style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".12em",margin:"0 0 6px",textTransform:"uppercase"}}>Timing</p>
                    <p style={{fontSize:14,fontWeight:800,color:C.ink,margin:0}}>{supp.dosage.timing}</p>
                  </div>
                )}
              </div>
              {supp.dosage.note&&(
                <div style={{padding:"14px 16px",background:`${C.blue}08`,borderLeft:`3px solid ${C.blue}`,marginTop:supp.dosage.amount?16:0}}>
                  <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.7}}>{supp.dosage.note}</p>
                </div>
              )}
            </div>
          )}

          {/* Evidence by goal */}
          <div style={{background:C.white,border:`1px solid ${C.border}`,padding:isMob?"20px 18px":"28px 36px",marginBottom:16}}>
            <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 20px",textTransform:"uppercase"}}>Evidence by Goal</p>
            <div style={{display:"flex",flexDirection:"column",gap:24}}>
              {supp.effects.map((e,i)=>{
                const goal=GOALS.find(g=>g.id===e.goal);
                return(
                  <div key={i} style={{paddingBottom:24,borderBottom:i<supp.effects.length-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:12}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:18}}>{goal?.icon||"•"}</span>
                        <span style={{fontSize:14,fontWeight:900,color:C.ink,textTransform:"capitalize"}}>{e.goal}</span>
                        <span style={{fontSize:9,fontWeight:700,color:C.gray,background:C.bg,border:`1px solid ${C.border}`,padding:"2px 8px",letterSpacing:".06em"}}>{e.type}</span>
                      </div>
                      <div style={{display:"flex",gap:12}}>
                        {[["Efficacy",e.efficacy],["Evidence",e.evidence]].map(([label,val])=>(
                          <div key={label} style={{textAlign:"center"}}>
                            <p style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 2px",textTransform:"uppercase"}}>{label}</p>
                            <p style={{fontSize:18,fontWeight:900,color:efColor(val),margin:0}}>{Math.abs(val)}/5</p>
                          </div>
                        ))}
                        <div style={{textAlign:"center"}}>
                          <p style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 2px",textTransform:"uppercase"}}>Studies</p>
                          <p style={{fontSize:18,fontWeight:900,color:C.ink,margin:0}}>{e.studies||"?"}</p>
                        </div>
                      </div>
                    </div>
                    {e.efficacy<0&&<p style={{fontSize:11,fontWeight:800,color:C.red,margin:"0 0 8px"}}>WARNING: Negative effect on this goal</p>}
                    <p style={{fontSize:13,color:C.gray,lineHeight:1.8,margin:"0 0 8px"}}>{e.summary}</p>
                    {e.sources&&e.sources.length>0&&(
                      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                        {e.sources.map(src=>(
                          <a key={src} href={src.startsWith("PMID:")?`https://pubmed.ncbi.nlm.nih.gov/${src.replace("PMID:","")}`:src.startsWith("Cochrane:")?`https://www.cochranelibrary.com/`:"#"}
                            target="_blank" rel="noopener noreferrer"
                            onClick={ev=>ev.stopPropagation()}
                            style={{fontSize:9,fontWeight:800,color:C.blue,background:`${C.blue}0a`,border:`1px solid ${C.blue}20`,padding:"3px 8px",textDecoration:"none",letterSpacing:".06em"}}>
                            {src}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactions */}
          {supp.interactions&&supp.interactions.length>0&&(
            <div style={{background:C.white,border:`1px solid ${C.border}`,padding:isMob?"20px 18px":"28px 36px",marginBottom:16}}>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 16px",textTransform:"uppercase"}}>Known Interactions</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {supp.interactions.map((it,i)=>(
                  <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 14px",background:`${C.amber}08`,borderLeft:`3px solid ${C.amber}`}}>
                    <span style={{color:C.amber,fontWeight:900,fontSize:13,flexShrink:0,marginTop:1}}>!</span>
                    <span style={{fontSize:12,color:C.ink,lineHeight:1.6}}>{it}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

          {/* Side Effects */}
          {supp.sideEffects&&supp.sideEffects.length>0&&(
            <div style={{background:C.white,border:`1px solid ${C.border}`,padding:isMob?"20px 18px":"28px 36px",marginBottom:16}}>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 20px",textTransform:"uppercase"}}>Side Effects</p>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {supp.sideEffects.map((se,i)=>{
                  const sevColor={mild:C.amber,moderate:"#f97316",severe:C.red}[se.severity]||C.gray;
                  const freqLabel={common:"Common",uncommon:"Uncommon",rare:"Rare"}[se.frequency]||se.frequency;
                  const freqDot={common:3,uncommon:2,rare:1}[se.frequency]||1;
                  return(
                    <div key={i} style={{padding:"14px 16px",background:C.bg,borderLeft:`3px solid ${sevColor}`,display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-start"}}>
                      <div style={{flex:1,minWidth:180}}>
                        <p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 4px"}}>{se.effect}</p>
                        {se.note&&<p style={{fontSize:11,color:C.gray,margin:0,lineHeight:1.6}}>{se.note}</p>}
                      </div>
                      <div style={{display:"flex",gap:8,flexShrink:0,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:9,fontWeight:800,color:sevColor,background:`${sevColor}15`,border:`1px solid ${sevColor}30`,padding:"3px 8px",letterSpacing:".06em",textTransform:"uppercase"}}>{se.severity}</span>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          {[1,2,3].map(n=>(
                            <div key={n} style={{width:8,height:8,borderRadius:"50%",background:n<=freqDot?sevColor:`${sevColor}25`}}/>
                          ))}
                          <span style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".06em",textTransform:"uppercase",marginLeft:2}}>{freqLabel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:14,padding:"10px 14px",background:`${C.amber}08`,border:`1px solid ${C.amber}20`}}>
                <p style={{fontSize:10,color:C.gray,margin:0,lineHeight:1.6}}>Side effect profiles vary by individual. This information is sourced from published clinical literature and does not constitute medical advice.</p>
              </div>
            </div>
          )}

          {/* Evidence Chart */}
          <div style={{background:C.white,border:`1px solid ${C.border}`,padding:isMob?"20px 18px":"28px 36px",marginBottom:16}}>
            <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 20px",textTransform:"uppercase"}}>Evidence Overview</p>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {supp.effects.map((e,i)=>{
                const goal=GOALS.find(g=>g.id===e.goal);
                const eff=Math.abs(e.efficacy);
                const ev=e.evidence;
                const rowColor=eff>=4?C.green:eff>=3?C.blue:eff>=2?C.amber:C.red;
                return(
                  <div key={i}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,gap:8,flexWrap:"wrap"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:14}}>{goal?.icon||"•"}</span>
                        <span style={{fontSize:12,fontWeight:700,color:C.ink,textTransform:"capitalize"}}>{e.goal}</span>
                      </div>
                      <div style={{display:"flex",gap:16,alignItems:"center"}}>
                        <span style={{fontSize:10,color:C.gray,fontWeight:600}}>{e.studies} {e.type?.split(" ")[0]||"studies"}</span>
                        <span style={{fontSize:11,fontWeight:900,color:rowColor}}>{eff}/5</span>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      <div>
                        <p style={{fontSize:8,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 3px",textTransform:"uppercase"}}>Efficacy</p>
                        <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${(eff/5)*100}%`,background:rowColor,borderRadius:3,transition:"width .6s ease"}}/>
                        </div>
                      </div>
                      <div>
                        <p style={{fontSize:8,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 3px",textTransform:"uppercase"}}>Evidence</p>
                        <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${(ev/5)*100}%`,background:C.blue,borderRadius:3,transition:"width .6s ease"}}/>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Who it's for */}
          <div style={{background:C.white,border:`1px solid ${C.border}`,padding:isMob?"20px 18px":"28px 36px",marginBottom:16}}>
            <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 16px",textTransform:"uppercase"}}>Quick Facts</p>
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(4,1fr)",gap:10}}>
              {[
                ["Tier",`${supp.tier} / ${TIERS[supp.tier]?.label||""}`,tc],
                ["Safety",safetyLabel,safetyColor],
                ["Goals covered",`${supp.effects.length} goal${supp.effects.length>1?"s":""}`,C.blue],
                ["Avg Efficacy",`${(supp.effects.reduce((s,e)=>s+Math.abs(e.efficacy),0)/supp.effects.length).toFixed(1)}/5`,C.green],
              ].map(([label,val,color])=>(
                <div key={label} style={{padding:"14px 14px",background:C.bg,textAlign:"center"}}>
                  <p style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 4px",textTransform:"uppercase"}}>{label}</p>
                  <p style={{fontSize:16,fontWeight:900,color:color||C.ink,margin:0}}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related compounds */}
          {(()=>{
            const goalIds=supp.effects.map(e=>e.goal);
            const related=SUPPLEMENTS.filter(s=>
              s.id!==supp.id&&
              s.effects.some(e=>goalIds.includes(e.goal))&&
              (isPro||s.tier===1)
            ).slice(0,4);
            if(!related.length)return null;
            return(
              <div style={{background:C.white,border:`1px solid ${C.border}`,padding:isMob?"20px 18px":"28px 36px",marginBottom:16}}>
                <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 16px",textTransform:"uppercase"}}>Related Compounds</p>
                <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:10}}>
                  {related.map(r=>{
                    const tc2=tierColor(r.tier);
                    const avgEff2=(r.effects.reduce((s,e)=>s+Math.abs(e.efficacy),0)/r.effects.length).toFixed(1);
                    return(
                      <div key={r.id}
                        onClick={()=>{window.history.pushState({},"","/compound/"+r.id);window.dispatchEvent(new PopStateEvent("popstate"));}}
                        style={{padding:"14px 16px",border:`1px solid ${C.border}`,borderLeft:`3px solid ${tc2}`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <p style={{fontSize:12,fontWeight:800,color:C.ink,margin:"0 0 2px"}}>{r.name}</p>
                          <p style={{fontSize:9,fontWeight:700,color:tc2,letterSpacing:".08em",margin:0,textTransform:"uppercase"}}>T{r.tier}</p>
                        </div>
                        <span style={{fontSize:14,fontWeight:900,color:C.green}}>{avgEff2}/5</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

      {/* Disclaimer */}
      <div style={{padding:"14px 16px",background:C.bg,border:`1px solid ${C.border}`,marginTop:8}}>
        <p style={{fontSize:10,color:C.gray,margin:0,lineHeight:1.6}}>For informational and research purposes only. Not medical advice. Consult a qualified healthcare provider before starting any supplementation protocol.</p>
      </div>
    </div>
  );
}

/* COMPARE MODAL */
function CompareModal({compA,compB,onClose}){
  const isMob=useIsMobile();
  const tierColor=(t)=>[null,C.green,C.blue,C.purple,C.amber][t]||C.gray;
  const efColor=(v)=>v<0?C.red:v>=4?C.green:v===3?C.blue:v===2?C.amber:C.gray;
  const avgStat=(s,key)=>{
    if(!s.effects.length)return 0;
    return(s.effects.reduce((sum,e)=>sum+(key==="efficacy"?Math.abs(e.efficacy):e.evidence),0)/s.effects.length).toFixed(1);
  };
  const safetyLabel=["","RISKY","CAUTION","CAUTION","SAFE","VERY SAFE"];
  const safetyColor=["",C.red,C.amber,C.amber,C.green,C.green];

  const rows=[
    {label:"Tier",a:`T${compA.tier}`,b:`T${compB.tier}`,aColor:tierColor(compA.tier),bColor:tierColor(compB.tier)},
    {label:"Avg Efficacy",a:`${avgStat(compA,"efficacy")}/5`,b:`${avgStat(compB,"efficacy")}/5`,aColor:efColor(parseFloat(avgStat(compA,"efficacy"))),bColor:efColor(parseFloat(avgStat(compB,"efficacy")))},
    {label:"Avg Evidence",a:`${avgStat(compA,"evidence")}/5`,b:`${avgStat(compB,"evidence")}/5`,aColor:efColor(parseFloat(avgStat(compA,"evidence"))),bColor:efColor(parseFloat(avgStat(compB,"evidence")))},
    {label:"Safety",a:safetyLabel[compA.safety]||" -",b:safetyLabel[compB.safety]||" -",aColor:safetyColor[compA.safety],bColor:safetyColor[compB.safety]},
    {label:"Cost",a:compA.cost||" -",b:compB.cost||" -"},
    {label:"Dosage",a:compA.dosage?.amount||" -",b:compB.dosage?.amount||" -"},
  ];

  const sharedGoals=compA.effects.filter(e=>compB.effects.some(e2=>e2.goal===e.goal)).map(e=>e.goal);

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,width:"100%",maxWidth:640,maxHeight:"90vh",overflow:"auto",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:12,right:16,background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.gray}}>x</button>

        {/* Header */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 48px 1fr",borderBottom:`1px solid ${C.border}`}}>
          {[compA,compB].map((s,i)=>(
            <div key={i} style={{padding:"20px 20px",borderTop:`3px solid ${tierColor(s.tier)}`,background:i===1?C.bg:C.white}}>
              <p style={{fontSize:9,fontWeight:800,color:tierColor(s.tier),letterSpacing:".1em",margin:"0 0 4px",textTransform:"uppercase"}}>T{s.tier}</p>
              <p style={{fontSize:14,fontWeight:900,color:C.ink,margin:0,lineHeight:1.2}}>{s.name}</p>
            </div>
          ))}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.gray,fontWeight:900}}>VS</div>
        </div>

        {/* Stats rows */}
        <div style={{padding:"0 0 8px"}}>
          {rows.map(row=>(
            <div key={row.label} style={{display:"grid",gridTemplateColumns:"1fr 80px 1fr",alignItems:"center",borderBottom:`1px solid ${C.border}`,padding:"0"}}>
              <div style={{padding:"12px 20px",textAlign:"right"}}><span style={{fontSize:13,fontWeight:700,color:row.aColor||C.ink}}>{row.a}</span></div>
              <div style={{textAlign:"center",padding:"12px 4px"}}><span style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".08em",textTransform:"uppercase"}}>{row.label}</span></div>
              <div style={{padding:"12px 20px",background:C.bg}}><span style={{fontSize:13,fontWeight:700,color:row.bColor||C.ink}}>{row.b}</span></div>
            </div>
          ))}
        </div>

        {/* Shared goals */}
        {sharedGoals.length>0&&(
          <div style={{padding:"16px 20px",background:`${C.blue}08`,borderTop:`1px solid ${C.border}`}}>
            <p style={{fontSize:10,fontWeight:800,color:C.blue,letterSpacing:".1em",margin:"0 0 8px",textTransform:"uppercase"}}>Shared goals  - synergy potential</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {sharedGoals.map(g=><span key={g} style={{fontSize:11,fontWeight:700,color:C.blue,background:`${C.blue}12`,border:`1px solid ${C.blue}30`,padding:"3px 10px"}}>{g}</span>)}
            </div>
          </div>
        )}

        {/* Goal coverage */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
          {[compA,compB].map((s,i)=>(
            <div key={i} style={{padding:"16px 20px",background:i===1?C.bg:C.white,borderTop:`1px solid ${C.border}`}}>
              <p style={{fontSize:9,fontWeight:800,color:C.gray,letterSpacing:".1em",margin:"0 0 10px",textTransform:"uppercase"}}>Goals covered</p>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {s.effects.slice(0,4).map(e=>(
                  <div key={e.goal} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,color:C.ink,fontWeight:600,textTransform:"capitalize"}}>{e.goal}</span>
                    <span style={{fontSize:11,fontWeight:800,color:efColor(e.efficacy)}}>{e.efficacy}/5</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
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
  const {isPro,user:sbUser,userProfile}=useAuth();
  const user=sbUser; // alias for share button
  const isMob=useIsMobile();
  const [goals,setGoals]=useState([]);
  const [budget,setBudget]=useState(80);
  const [existing,setExisting]=useState("");
  const [restrictions,setRestrictions]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [savedStacks,setSavedStacks]=useState(()=>{try{return JSON.parse(localStorage.getItem("evidstack_stacks_sb")||"[]");}catch(e){return[];}});
  const [showSaved,setShowSaved]=useState(false);
  const [saveMsg,setSaveMsg]=useState("");

  const saveStack=()=>{
    if(!result)return;
    const newS={id:Date.now(),name:result.stack_name||"My Stack",result,goals,savedAt:new Date().toLocaleDateString()};
    const updated=[newS,...savedStacks].slice(0,10);
    setSavedStacks(updated);
    localStorage.setItem("evidstack_stacks_sb",JSON.stringify(updated));
    setSaveMsg("Saved!");setTimeout(()=>setSaveMsg(""),2000);
  };
  const deleteStack=(id)=>{
    const updated=savedStacks.filter(s=>s.id!==id);
    setSavedStacks(updated);
    localStorage.setItem("evidstack_stacks_sb",JSON.stringify(updated));
  };

  const toggleGoal=(id)=>setGoals(g=>g.includes(id)?g.filter(x=>x!==id):[...g,id]);

  const build=async()=>{
    if(goals.length===0){setError("Select at least one goal.");return;}
    setError("");setLoading(true);setResult(null);
    try{
      const res=await fetch("/api/ai-stack",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({goals,budget,existing,restrictions,userProfile:userProfile||null})});
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
      <p style={{fontSize:11,color:C.gray,marginTop:12}}>Cancel anytime. Full access to all {Math.floor(SUPPLEMENTS.length/10)*10}+ compounds + AI tools.</p>

      {/* Example output */}
      <div style={{maxWidth:520,margin:"32px auto 0",textAlign:"left"}}>
        <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>Example  -  Cognitive + Strength, $80/mo</p>
        <div style={{border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,background:C.white}}>
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
            <p style={{fontSize:14,fontWeight:900,color:C.ink,margin:"0 0 2px",letterSpacing:"-.03em"}}>The Cognitive Performance Stack</p>
            <p style={{fontSize:11,color:C.gray,margin:0}}>Est. $65-80/month  -  4 compounds</p>
          </div>
          {[
            {name:"Creatine Monohydrate",dose:"5g/day",timing:"Post-workout",tier:1,color:"#16a34a"},
            {name:"Alpha-GPC",dose:"300mg/day",timing:"Morning",tier:2,color:"#2563eb"},
            {name:"Caffeine + L-Theanine",dose:"200+400mg",timing:"Morning",tier:1,color:"#16a34a"},
            {name:"Ashwagandha KSM-66",dose:"600mg/day",timing:"Evening",tier:2,color:"#2563eb"},
          ].map(s=>(
            <div key={s.name} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"center",padding:"10px 20px",borderBottom:`1px solid ${C.border}`}}>
              <div>
                <p style={{fontSize:12,fontWeight:800,color:C.ink,margin:"0 0 1px"}}>{s.name}</p>
                <p style={{fontSize:10,color:C.gray,margin:0}}>{s.timing}</p>
              </div>
              <span style={{fontSize:10,color:C.gray,fontWeight:600}}>{s.dose}</span>
              <span style={{fontSize:9,fontWeight:900,color:s.color,letterSpacing:".06em"}}>T{s.tier}</span>
            </div>
          ))}
          <div style={{padding:"12px 20px",background:"#1f2937",textAlign:"center"}}>
            <p style={{fontSize:11,color:"#6b7280",margin:0,fontStyle:"italic"}}>Unlock Pro to generate your personalized stack</p>
          </div>
        </div>
      </div>
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

      {savedStacks.length>0&&(
        <div style={{marginBottom:16}}>
          <button onClick={()=>setShowSaved(v=>!v)} style={{padding:"7px 14px",background:"transparent",border:`1px solid ${C.border}`,fontSize:11,fontWeight:700,cursor:"pointer",color:C.gray,fontFamily:"Montserrat,sans-serif"}}>
            {showSaved?"Hide":"View"} saved stacks ({savedStacks.length})
          </button>
          {showSaved&&<div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
            {savedStacks.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:C.bg,border:`1px solid ${C.border}`}}>
                <div><p style={{fontSize:12,fontWeight:800,color:C.ink,margin:"0 0 1px"}}>{s.name}</p><p style={{fontSize:10,color:C.gray,margin:0}}>{s.savedAt}</p></div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>{setResult(s.result);setShowSaved(false);}} style={{padding:"5px 12px",background:C.ink,color:C.white,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Load</button>
                  <button onClick={()=>deleteStack(s.id)} style={{padding:"5px 8px",background:"transparent",border:`1px solid ${C.border}`,fontSize:10,cursor:"pointer",color:C.gray,fontFamily:"Montserrat,sans-serif"}}>x</button>
                </div>
              </div>
            ))}
          </div>}
        </div>
      )}
      {error&&<p style={{fontSize:13,color:C.red,marginBottom:16}}>{error}</p>}
      <button onClick={build} disabled={loading||goals.length===0}
        style={{padding:"14px 36px",background:goals.length>0?C.ink:"#9ca3af",color:C.white,border:"none",fontSize:13,fontWeight:800,cursor:goals.length>0?"pointer":"not-allowed",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif",marginBottom:48}}>
        {loading?"Building your stack...":"Build my stack"}
      </button>

      {saveMsg&&<p style={{fontSize:12,color:C.green,fontWeight:700,margin:"0 0 8px"}}>✓ {saveMsg}</p>}
      {result&&(
        <div style={{border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,background:C.white}}>
          <div style={{padding:"28px 32px 20px",borderBottom:`1px solid ${C.border}`}}>
            <p style={{fontSize:9,fontWeight:800,color:C.gold,letterSpacing:".16em",margin:"0 0 8px",textTransform:"uppercase"}}>Your personalized stack</p>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:8}}>
              <h3 style={{fontSize:28,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:0}}>{result.stack_name}</h3>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={saveStack} style={{padding:"8px 16px",background:saveMsg?C.green:C.ink,color:C.white,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",flexShrink:0,transition:"background .3s"}}>
                  {saveMsg||"Save stack"}
                </button>
                <button onClick={async()=>{
                  try{
                    const shareId=Math.random().toString(36).slice(2,10);
                    await setDoc(doc(db,"shared_stacks",shareId),{...result,sharedAt:Date.now(),sharedBy:user?.uid||"anonymous"});
                    const url=`${window.location.origin}/stack/${shareId}`;
                    await navigator.clipboard.writeText(url);
                    alert("Share link copied to clipboard!");
                  }catch(e){alert("Could not create share link.");}
                }} style={{padding:"8px 14px",background:"transparent",border:`1px solid ${C.border}`,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",color:C.gray,flexShrink:0}}>
                  Share 🔗
                </button>
              </div>
            </div>
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
          body:"All content on Evidstack is strictly for informational and educational purposes. Nothing on this platform constitutes medical advice, diagnosis, or treatment. The AI Compound Advisor generates suggestions based on published research - these suggestions are not personalized medical recommendations. Always consult a licensed healthcare provider before changing your supplementation routine."
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
          body:"You may request deletion of your account and associated data at any time by emailing evidstack@protonmail.com. We will process deletion requests within 30 days."
        },
        {
          title:"11. Changes to These Terms",
          body:"We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes by email."
        },
        {
          title:"12. Contact",
          body:"For any questions regarding these terms or your privacy, contact us at: evidstack@protonmail.com"
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
      <h2 style={{fontSize:isMob?28:44,fontWeight:900,lineHeight:1.05,letterSpacing:"-.05em",margin:"0 0 12px",color:C.ink}}>The supplement industry runs on marketing. Evidstack runs on data.</h2>
      <p style={{fontSize:15,color:C.gray,lineHeight:1.9,margin:"0 0 48px",maxWidth:600}}>And then tells you what to actually do with it - with AI tools calibrated to your body, not a generic 70kg male from a clinical trial.</p>
      <div style={{height:1,background:C.border,margin:"0 0 48px"}}/>
      {[
        {
          label:"The problem",
          body:"The supplement market is worth over $200 billion globally. The vast majority of that revenue is built on marketing claims that would not survive basic scientific scrutiny. Brands routinely cite studies funded by their own companies, cherry-pick favorable outcomes, and present weak correlational findings as established facts. Influencers promote products based on sponsorship deals, not evidence. The result is an ecosystem where the loudest voices are almost always the least reliable ones. Most people end up cycling through dozens of supplements based on hype, spending hundreds of dollars on compounds with marginal or no real effect, while ignoring the handful that are genuinely transformative. Evidstack was built to fix that information problem. Every compound in the database is rated on exactly two dimensions: how large the actual effect is in human studies, and how confident we are in the body of evidence behind it."
        },
        {
          label:"How scoring works",
          body:"Efficacy scores (1 to 5) measure the magnitude of the real-world effect observed in human trials. A score of 5 means a large, clinically meaningful effect. A score of 1 means the effect exists but is too small to matter in practice. Evidence scores (1 to 5) measure the quality and volume of research behind the claim. A score of 5 means multiple large-scale RCTs and meta-analyses with consistent results. A score of 1 means animal data or isolated case reports only. These two dimensions are independent by design. A compound can have a 5/5 efficacy score with a 2/5 evidence score, meaning the effect is large but poorly studied in humans. That distinction is critical for making informed decisions. All scores are sourced from peer-reviewed literature on PubMed, Cochrane systematic reviews, and cross-referenced with independent research summaries. No brand partnerships influence the ratings."
        },
        {
          label:"The tier system",
          body:"Tier 1 (Fundamentals) covers compounds with a broad research base, well-established safety profiles, and consistent replication across independent labs. Think creatine, magnesium, omega-3. Tier 2 (Advanced) includes compounds with solid clinical evidence across 10 or more trials, but slightly newer or less mature research pipelines. Tier 3 (Expert) covers compounds showing genuine promise in early human studies, with fewer replications or smaller sample sizes. Use with awareness of the limitations. Tier 4 (Biohacking) includes cutting-edge research compounds, peptides, and experimental agents with limited or no formal human clinical trial data. These are documented for completeness and research purposes only. The tier system is not a recommendation to use or avoid any compound. It is a map of where the evidence currently stands."
        },
        {
          label:"What we cover",
          body:`Evidstack covers ${Math.floor(SUPPLEMENTS.length/10)*10}+ compounds across the full spectrum of evidence-based supplementation: foundational supplements like vitamin D, zinc, and omega-3; advanced nootropics and cognitive enhancers including racetams, cholinergics, and dopaminergic agents; peptides spanning healing compounds like BPC-157 and TB-500, GH secretagogues like Ipamorelin and CJC-1295, and skin and longevity peptides like GHK-Cu and Epithalon; GLP-1 receptor agonists and metabolic compounds including semaglutide and tirzepatide; hair retention and facial aesthetic compounds including finasteride, dutasteride, minoxidil, GHK-Cu, collagen peptides, and compounds targeting facial fat distribution and bone density; SARMs and performance compounds with available human trial data; anti-aging interventions including rapamycin, metformin, and senolytic compounds; and adaptogenic and stress-response compounds. Each entry includes clinical dosing ranges, timing recommendations, known interactions, safety rating, legal status, and estimated monthly cost.`
        },
        {
          label:"What others won't cover",
          body:"Most supplement databases stop at vitamins, minerals, and mainstream nootropics. They avoid the compounds serious optimizers actually want data on, either for legal caution or to stay palatable to advertisers. Evidstack has no advertisers and no conflicts of interest, so we document the full spectrum: anabolic androgenic steroids (testosterone, nandrolone, oxandrolone, trenbolone, and 50+ others), the complete SARM landscape (RAD-140, LGD-4033, Ostarine, Andarine, YK-11, S-23), peptides including BPC-157, TB-500, Ipamorelin, CJC-1295, Epithalon, GHK-Cu, and growth hormone analogs, GLP-1 receptor agonists including semaglutide and tirzepatide, beta-agonists, aromatase inhibitors, and progestins relevant to endocrinology and performance. Every entry is treated with the same scientific rigor as creatine: efficacy score, evidence score, dosing, interactions, safety rating, and legal status. The goal is not to recommend these compounds but to ensure that people who encounter them have access to the same quality of information as they do for any other compound."
        },
        {
          label:"What we are not",
          body:"Evidstack is not a medical provider, a pharmacy, or a clinical service. Nothing on this platform constitutes medical advice, diagnosis, or treatment. The information is compiled for educational and research purposes only. Dosing ranges reflect what has been used in published clinical literature, not personalized recommendations for you specifically. Some compounds covered on this platform are prescription medications, controlled substances, or research chemicals. Their inclusion in the database does not constitute an endorsement of their use outside of appropriate medical or research contexts. Always consult a qualified healthcare provider before starting, stopping, or modifying any supplementation or medication protocol."
        },
      ].map(s=>(<div key={s.label} style={{marginBottom:44}}><p style={{fontSize:11,fontWeight:700,letterSpacing:".2em",color:C.gray,margin:"0 0 14px",textTransform:"uppercase"}}>{s.label}</p><p style={{fontSize:14,color:C.gray,lineHeight:1.95,margin:0,maxWidth:640}}>{s.body}</p></div>))}

      {/* Founder note */}
      <div style={{height:1,background:C.border,margin:"0 0 40px"}}/>
      <div style={{display:"flex",gap:20,alignItems:"flex-start",maxWidth:600}}>
        <div style={{width:44,height:44,background:C.ink,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:14,fontWeight:900,color:C.white}}>M</span>
        </div>
        <div>
          <p style={{fontSize:12,fontWeight:800,color:C.ink,margin:"0 0 4px"}}>Marcus B.  -  Founder</p>
          <p style={{fontSize:13,color:C.gray,lineHeight:1.9,margin:0}}>Obsessed with evidence-based optimization. Built Evidstack because I was tired of spending hours cross-referencing studies just to answer basic questions about my stack. The goal: make rigorous supplement science accessible to anyone who actually wants to optimize  -  not just be marketed to.</p>
        </div>
      </div>
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
          <p style={{fontSize:12,color:C.gray,margin:0}}>Browse all {Math.floor(SUPPLEMENTS.length/10)*10}+ compounds, filter by goal, and check interactions.</p>
        </div>
        <button onClick={onGoToSupplements} style={{padding:"12px 24px",background:C.ink,color:C.white,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:".04em"}}>Browse Supplements</button>
      </div>
    </div>
  );
}

/* MANAGE SUBSCRIPTION BUTTON */
function ManageSubButton({uid}){
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const open=async()=>{
    setLoading(true);setErr("");
    try{
      const res=await fetch("/api/stripe-portal",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid})});
      const data=await res.json();
      if(data.error)throw new Error(data.error);
      window.location.href=data.url;
    }catch(e){setErr(e.message||"Something went wrong.");setLoading(false);}
  };
  return(
    <div>
      <button onClick={open} disabled={loading}
        style={{padding:"10px 18px",background:"transparent",border:`1px solid ${loading?"#d4d0c8":"#1a1a1a"}`,fontSize:12,fontWeight:700,color:loading?"#9ca3af":"#1a1a1a",cursor:loading?"not-allowed":"pointer",fontFamily:"Montserrat,sans-serif"}}>
        {loading?"Loading...":"Manage or cancel subscription →"}
      </button>
      {err&&<p style={{fontSize:11,color:"#dc2626",margin:"6px 0 0",lineHeight:1.5}}>{err}</p>}
    </div>
  );
}

/* ACCOUNT CENTER */
// ── PROFILE TAB (inside AccountCenter) ────────────────────────────────────────
function ProfileTab(){
  const {userProfile,saveProfile}=useAuth();
  const [age,setAge]=useState(String(userProfile?.age||""));
  const [weightKg,setWeightKg]=useState(String(userProfile?.weightKg||""));
  const [heightCm,setHeightCm]=useState(String(userProfile?.heightCm||""));
  const [sex,setSex]=useState(userProfile?.sex||"");
  const [weightUnit,setWeightUnit]=useState("kg");
  const [heightUnit,setHeightUnit]=useState("cm");
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);

  const displayWeight=weightUnit==="lbs"&&weightKg?Math.round(parseFloat(weightKg)*2.20462):weightKg;
  const displayHeight=heightUnit==="ft"&&heightCm?+(parseFloat(heightCm)/30.48).toFixed(1):heightCm;

  const handleSave=async()=>{
    setSaving(true);
    const wKg=weightUnit==="lbs"?Math.round(parseFloat(displayWeight)*0.453592):parseFloat(weightKg);
    const hCm=heightUnit==="ft"?Math.round(parseFloat(displayHeight)*30.48):parseFloat(heightCm);
    await saveProfile({age:parseInt(age)||null,weightKg:isNaN(wKg)?null:wKg,heightCm:isNaN(hCm)?null:hCm,sex:sex||null,updatedAt:Date.now()});
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2000);
  };

  const iS={width:"100%",padding:"10px 12px",border:`1px solid ${C.border}`,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",background:C.white,color:C.ink,boxSizing:"border-box",marginBottom:12};
  const uBtn=(active)=>({padding:"4px 10px",background:active?C.ink:"transparent",color:active?C.white:C.gray,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"Montserrat,sans-serif"});
  const sBtn=(active)=>({flex:1,padding:"9px 6px",background:active?C.ink:"transparent",color:active?C.white:C.gray,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"Montserrat,sans-serif"});

  return(
    <div>
      <p style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.gray,margin:"0 0 6px",textTransform:"uppercase"}}>Body Profile</p>
      <p style={{fontSize:12,color:C.gray,margin:"0 0 18px",lineHeight:1.6}}>Used to calibrate compound dosages, adjust AI recommendations to your weight, and apply sex-specific hormone reference ranges.</p>

      <div style={{marginBottom:12}}>
        <p style={{fontSize:10,fontWeight:700,color:C.gray,margin:"0 0 5px",letterSpacing:".06em",textTransform:"uppercase"}}>Age</p>
        <input value={age} onChange={e=>setAge(e.target.value)} type="number" min="13" max="99" placeholder="e.g. 28" style={iS}/>
      </div>

      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <p style={{fontSize:10,fontWeight:700,color:C.gray,margin:0,letterSpacing:".06em",textTransform:"uppercase"}}>Weight</p>
          <div style={{display:"flex",border:`1px solid ${C.border}`,background:C.bg}}>
            <button style={uBtn(weightUnit==="kg")} onClick={()=>setWeightUnit("kg")}>kg</button>
            <button style={uBtn(weightUnit==="lbs")} onClick={()=>setWeightUnit("lbs")}>lbs</button>
          </div>
        </div>
        <input value={displayWeight} onChange={e=>{
          const v=e.target.value;
          if(weightUnit==="lbs"){setWeightKg(String(Math.round(parseFloat(v)*0.453592)));}
          else setWeightKg(v);
        }} type="number" placeholder={weightUnit==="kg"?"e.g. 80":"e.g. 176"} style={iS}/>
      </div>

      <div style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <p style={{fontSize:10,fontWeight:700,color:C.gray,margin:0,letterSpacing:".06em",textTransform:"uppercase"}}>Height</p>
          <div style={{display:"flex",border:`1px solid ${C.border}`,background:C.bg}}>
            <button style={uBtn(heightUnit==="cm")} onClick={()=>setHeightUnit("cm")}>cm</button>
            <button style={uBtn(heightUnit==="ft")} onClick={()=>setHeightUnit("ft")}>ft</button>
          </div>
        </div>
        <input value={displayHeight} onChange={e=>{
          const v=e.target.value;
          if(heightUnit==="ft"){setHeightCm(String(Math.round(parseFloat(v)*30.48)));}
          else setHeightCm(v);
        }} type="number" placeholder={heightUnit==="cm"?"e.g. 178":"e.g. 5.9"} style={iS}/>
      </div>

      <div style={{marginBottom:18}}>
        <p style={{fontSize:10,fontWeight:700,color:C.gray,margin:"0 0 5px",letterSpacing:".06em",textTransform:"uppercase"}}>Biological sex</p>
        <div style={{display:"flex",border:`1px solid ${C.border}`,background:C.bg}}>
          {["Male","Female"].map(s=><button key={s} style={sBtn(sex===s)} onClick={()=>setSex(s)}>{s}</button>)}
        </div>
      </div>

      {saved&&<p style={{fontSize:12,color:C.green,fontWeight:700,margin:"0 0 10px"}}>Profile saved.</p>}
      <button onClick={handleSave} disabled={saving}
        style={{width:"100%",padding:"11px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
        {saving?"Saving...":"Save profile"}
      </button>
    </div>
  );
}

function AccountCenter({onClose,onUpgrade}){
  const {user,isPro,logout,changePassword,userProfile,saveProfile}=useAuth();
  const isMob=useIsMobile();
  const [tab,setTab]=useState("overview"); // overview | billing | security | profile
  const [oldPw,setOldPw]=useState("");
  const [newPw,setNewPw]=useState("");
  const [newPw2,setNewPw2]=useState("");
  const [pwError,setPwError]=useState("");
  const [pwSuccess,setPwSuccess]=useState("");
  const [pwLoading,setPwLoading]=useState(false);
  const isGoogle=user?.providerData?.[0]?.providerId==="google.com";

  const handleChangePw=async()=>{
    setPwError("");setPwSuccess("");
    if(newPw!==newPw2){setPwError("New passwords do not match.");return;}
    if(newPw.length<6){setPwError("Password must be at least 6 characters.");return;}
    setPwLoading(true);
    try{
      await changePassword(oldPw,newPw);
      setPwSuccess("Password updated successfully.");
      setOldPw("");setNewPw("");setNewPw2("");
    }catch(e){
      setPwError(e.code==="auth/wrong-password"||e.code==="auth/invalid-credential"?"Current password is incorrect.":"Something went wrong.");
    }finally{setPwLoading(false);}
  };

  const inputStyle={width:"100%",padding:"10px 12px",border:`1px solid ${C.border}`,marginBottom:8,fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",boxSizing:"border-box"};
  const tabs=[{id:"overview",label:"Overview"},{id:"billing",label:"Billing"},{id:"security",label:"Security"},{id:"profile",label:"My Profile"}];

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,width:"100%",maxWidth:480,position:"relative",maxHeight:"90vh",overflow:"auto"}}>
        <div style={{padding:"24px 28px 0",borderBottom:`1px solid ${C.border}`}}>
          <button onClick={onClose} style={{position:"absolute",top:16,right:20,background:"none",border:"none",fontSize:20,cursor:"pointer",color:C.gray}}>x</button>
          <p style={{fontSize:9,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 4px",textTransform:"uppercase"}}>Account</p>
          <p style={{fontSize:14,fontWeight:900,color:C.ink,margin:"0 0 20px",letterSpacing:"-.02em"}}>{user?.email}</p>
          <div style={{display:"flex",gap:0}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{padding:"10px 18px",fontSize:11,fontWeight:700,background:"transparent",color:tab===t.id?C.ink:C.gray,border:"none",borderBottom:tab===t.id?`2px solid ${C.ink}`:"2px solid transparent",cursor:"pointer",letterSpacing:".04em"}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{padding:"28px"}}>
          {tab==="overview"&&(
            <div>
              {/* Plan status */}
              <div style={{background:isPro?C.ink:C.bg,border:`1px solid ${isPro?C.ink:C.border}`,padding:"20px 22px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <span style={{fontSize:11,fontWeight:800,letterSpacing:".12em",color:isPro?C.gold:C.gray}}>{isPro?"PRO MEMBER":"FREE PLAN"}</span>
                  {!isPro&&<button onClick={()=>{onClose();onUpgrade();}} style={{padding:"6px 14px",background:C.gold,color:C.ink,border:"none",fontSize:11,fontWeight:800,cursor:"pointer"}}>Upgrade</button>}
                </div>
                <p style={{fontSize:12,color:isPro?"#9ca3af":C.gray,margin:0,lineHeight:1.6}}>
                  {isPro?`Full access to all ${Math.floor(SUPPLEMENTS.length/10)*10}+ compounds, peptides, GLP-1s, and AI Compound Advisor.`:`Tier 1 compounds only. Upgrade to unlock all ${Math.floor(SUPPLEMENTS.length/10)*10}+ compounds and AI Compound Advisor.`}
                </p>
              </div>

              {/* Account info */}
              <div style={{marginBottom:16}}>
                <p style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>Account Info</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    ["Email",user?.email||" -"],
                    ["Sign-in method",isGoogle?"Google":"Email / Password"],
                    ["Member since",user?.metadata?.creationTime?new Date(user.metadata.creationTime).toLocaleDateString("en-GB",{month:"short",year:"numeric"}):" -"],
                    ["Plan",isPro?"Evidstack Pro":"Free"],
                  ].map(([label,value])=>(
                    <div key={label} style={{background:C.bg,padding:"12px 14px"}}>
                      <p style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 4px",textTransform:"uppercase"}}>{label}</p>
                      <p style={{fontSize:12,fontWeight:700,color:C.ink,margin:0,wordBreak:"break-all"}}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick links */}
              <div style={{marginBottom:20}}>
                <p style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>Quick Links</p>
                <div style={{display:"flex",flexDirection:"column",gap:1}}>
                  {[
                    {label:"AI Compound Advisor",path:"advisor"},
                    {label:"Interaction Checker",path:"interaction-checker"},
                    {label:"Stack Audit AI",path:"stack-audit"},
                    {label:"Bloodwork History",path:"bloodwork-history"},
                    {label:"AI Bloodwork Analyzer",path:"bloodwork"},
                    {label:"My Tracker",path:"tracker"},
                    {label:"Terms & Privacy",path:"legal"},
                  ].map(item=>(
                    <button key={item.label} onClick={()=>{window.history.pushState({},"","/"+item.path);window.dispatchEvent(new PopStateEvent("popstate"));onClose();}}
                      style={{padding:"11px 14px",background:C.bg,border:"none",fontSize:12,fontWeight:600,color:C.ink,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      {item.label}<span style={{color:C.gray,fontSize:14}}>›</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={()=>{logout();onClose();}}
                style={{width:"100%",padding:"11px",background:"transparent",border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.gray,cursor:"pointer",letterSpacing:".04em"}}>
                Sign out
              </button>
            </div>
          )}

          {tab==="billing"&&(
            <div>
              {/* Comparison table */}
              <div style={{marginBottom:24}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",marginBottom:0}}>
                  {/* Header */}
                  <div style={{padding:"12px 14px",background:C.bg,border:`1px solid ${C.border}`,borderRight:"none"}}/>
                  <div style={{padding:"12px 14px",background:C.bg,border:`1px solid ${C.border}`,borderRight:"none",textAlign:"center"}}>
                    <p style={{fontSize:10,fontWeight:800,color:C.gray,margin:0,letterSpacing:".1em",textTransform:"uppercase"}}>Free</p>
                  </div>
                  <div style={{padding:"12px 14px",background:C.ink,border:`1px solid ${C.ink}`,textAlign:"center"}}>
                    <p style={{fontSize:10,fontWeight:800,color:C.gold,margin:0,letterSpacing:".1em",textTransform:"uppercase"}}>Pro</p>
                  </div>
                </div>
                {[
                  {feature:"Compounds",free:"Tier 1 only (33)",pro:`All ${Math.floor(SUPPLEMENTS.length/10)*10}+`,highlight:true},
                  {feature:"Peptides & GLP-1s",free:false,pro:true,highlight:false},
                  {feature:"Biohacking tier",free:false,pro:true,highlight:false},
                  {feature:"AI Compound Advisor",free:"1 query",pro:"Unlimited",highlight:true},
                  {feature:"Conversation memory",free:false,pro:true,highlight:false},
                  {feature:"Interaction Checker",free:false,pro:true,highlight:true},
                  {feature:"Stack Audit AI",free:false,pro:true,highlight:false},
                  {feature:"Bloodwork History",free:false,pro:true,highlight:false},
                  {feature:"AI Bloodwork Analyzer",free:false,pro:true,highlight:false},
                  {feature:"My Tracker",free:false,pro:true,highlight:false},
                  {feature:"Compare compounds",free:false,pro:true,highlight:false},
                  {feature:"Save your stacks",free:false,pro:true,highlight:true},
                  {feature:"Price",free:"$0",pro:"$9.99/mo or $6.58/mo yearly",highlight:false},
                ].map((row,i)=>(
                  <div key={row.feature} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
                    <div style={{padding:"11px 14px",background:row.highlight?`${C.gold}0a`:C.white,border:`1px solid ${C.border}`,borderTop:"none",borderRight:"none"}}>
                      <span style={{fontSize:11,fontWeight:row.highlight?800:600,color:C.ink}}>{row.feature}</span>
                    </div>
                    <div style={{padding:"11px 14px",background:row.highlight?`${C.gold}0a`:C.white,border:`1px solid ${C.border}`,borderTop:"none",borderRight:"none",textAlign:"center"}}>
                      {typeof row.free==="boolean"
                        ?<span style={{fontSize:13,color:row.free?C.green:C.border}}>{row.free?"✓":" - "}</span>
                        :<span style={{fontSize:11,fontWeight:600,color:C.gray}}>{row.free}</span>}
                    </div>
                    <div style={{padding:"11px 14px",background:row.highlight?`${C.gold}15`:C.ink,border:`1px solid ${C.ink}`,borderTop:"none",textAlign:"center"}}>
                      {typeof row.pro==="boolean"
                        ?<span style={{fontSize:13,color:row.pro?C.gold:"#374151"}}>{row.pro?"✓":" - "}</span>
                        :<span style={{fontSize:11,fontWeight:700,color:row.highlight?C.gold:C.white}}>{row.pro}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {!isPro&&(
                <div>
                  <button onClick={()=>{onClose();onUpgrade();}}
                    style={{width:"100%",padding:"14px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:900,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif",marginBottom:8}}>
                    Upgrade to Pro
                  </button>
                  <p style={{fontSize:11,color:C.gray,textAlign:"center",margin:0}}>Cancel anytime. No questions asked.</p>
                </div>
              )}

              {isPro&&(
                <div style={{padding:"16px",background:`${C.green}0a`,border:`1px solid ${C.green}20`,textAlign:"center"}}>
                  <p style={{fontSize:12,fontWeight:800,color:C.green,margin:"0 0 4px"}}>You are a Pro member</p>
                  <p style={{fontSize:11,color:C.gray,margin:0}}>Full access to all features. To manage your subscription, contact evidstack@protonmail.com</p>
                </div>
              )}
            </div>
          )}

          {tab==="security"&&(
            <div>
              {isGoogle?(
                <div style={{background:C.bg,padding:"20px",textAlign:"center"}}>
                  <p style={{fontSize:13,color:C.gray,margin:0,lineHeight:1.7}}>You signed in with Google.<br/>Password management is handled by your Google account.</p>
                </div>
              ):(
                <div>
                  <p style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.gray,margin:"0 0 14px",textTransform:"uppercase"}}>Change Password</p>
                  <input value={oldPw} onChange={e=>setOldPw(e.target.value)} placeholder="Current password" type="password" style={inputStyle}/>
                  <input value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="New password" type="password" style={inputStyle}/>
                  <input value={newPw2} onChange={e=>setNewPw2(e.target.value)} placeholder="Confirm new password" type="password" style={{...inputStyle,marginBottom:14}}/>
                  {pwError&&<p style={{fontSize:12,color:C.red,margin:"0 0 10px"}}>{pwError}</p>}
                  {pwSuccess&&<p style={{fontSize:12,color:C.green,margin:"0 0 10px"}}>{pwSuccess}</p>}
                  <button onClick={handleChangePw} disabled={pwLoading}
                    style={{width:"100%",padding:"11px",background:C.ink,color:C.white,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif"}}>
                    {pwLoading?"...":"Update password"}
                  </button>
                </div>
              )}

              <div style={{marginTop:28,paddingTop:20,borderTop:`1px solid ${C.border}`}}>
                {isPro&&(
                  <div style={{marginBottom:20}}>
                    <p style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>Manage Subscription</p>
                    <ManageSubButton uid={user?.uid}/>
                    <p style={{fontSize:10,color:C.gray,margin:"6px 0 0"}}>Cancel anytime. No questions asked.</p>
                  </div>
                )}
                <p style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>Danger Zone</p>
                <p style={{fontSize:12,color:C.gray,margin:"0 0 12px",lineHeight:1.6}}>To delete your account, contact us at <strong>evidstack@protonmail.com</strong></p>
              </div>
            </div>
          )}

          {tab==="profile"&&<ProfileTab/>}
        </div>
      </div>
    </div>
  );
}

/* ROOT */
// ── GOAL QUIZ ─────────────────────────────────────────────────────────────────
function GoalQuizSection({onNavigate,onAuth}){
  const {user}=useAuth();
  const isMob=useIsMobile();
  const [step,setStep]=useState(0); // 0=hidden,1,2,3,result
  const [goal,setGoal]=useState("");
  const [experience,setExperience]=useState("");
  const [budget,setBudget]=useState("");
  const [visible,setVisible]=useState(false);

  useEffect(()=>{
    const seen=localStorage.getItem("evidstack_quiz_seen");
    if(!seen){const t=setTimeout(()=>setVisible(true),3000);return()=>clearTimeout(t);}
  },[]);

  if(!visible||step===0)return(
    <div style={{maxWidth:680,margin:"0 auto 24px",textAlign:"center"}}>
      <button onClick={()=>setStep(1)} style={{padding:"10px 24px",background:"transparent",border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.gray,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
        Not sure where to start? Take the 30-second quiz →
      </button>
    </div>
  );

  const GOALS_Q=[
    {id:"strength",label:"Strength & Muscle",icon:"💪"},
    {id:"sleep",label:"Sleep Quality",icon:"😴"},
    {id:"focus",label:"Focus & Cognition",icon:"🧠"},
    {id:"hormones",label:"Testosterone",icon:"🩸"},
    {id:"weight",label:"Fat Loss",icon:"⚖️"},
    {id:"longevity",label:"Longevity",icon:"❤️"},
    {id:"recovery",label:"Recovery",icon:"🔁"},
    {id:"energy",label:"Energy",icon:"⚡"},
  ];
  const EXP=[{id:"beginner",label:"Beginner",desc:"Just starting out"},{id:"intermediate",label:"Intermediate",desc:"Some experience"},{id:"advanced",label:"Advanced",desc:"Know my protocols"}];
  const BUDGETS=[{id:"50",label:"Under $50/mo"},{id:"100",label:"$50-100/mo"},{id:"200",label:"$100-200/mo"},{id:"200+",label:"$200+/mo"}];

  // Hardcoded quick recommendations per goal
  const RECS={
    strength:["Creatine Monohydrate","Leucine","Beta-Alanine","Vitamin D3","Zinc"],
    sleep:["Magnesium Bisglycinate","L-Theanine","Melatonin","Ashwagandha","Glycine"],
    focus:["L-Theanine","Caffeine","Bacopa Monnieri","Alpha-GPC","Rhodiola Rosea"],
    hormones:["Zinc","Vitamin D3","Ashwagandha","Tongkat Ali","Fadogia Agrestis"],
    weight:["Berberine","Caffeine","Green Tea Extract","Glucomannan","L-Carnitine"],
    longevity:["NMN","Resveratrol","Quercetin","Alpha-Lipoic Acid","Vitamin D3"],
    recovery:["Creatine Monohydrate","Tart Cherry","Magnesium Bisglycinate","Collagen","BPC-157"],
    energy:["Creatine Monohydrate","Caffeine","L-Theanine","Rhodiola Rosea","CoQ10"],
  };

  const dismiss=()=>{setStep(0);setVisible(false);localStorage.setItem("evidstack_quiz_seen","1");};

  const optBtn=(active)=>({
    padding:isMob?"10px 12px":"12px 18px",border:`2px solid ${active?C.ink:C.border}`,
    background:active?C.ink:C.white,color:active?C.white:C.ink,
    cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"Montserrat,sans-serif",
    transition:"all .15s",textAlign:"left",display:"flex",alignItems:"center",gap:8,
  });

  return(
    <div style={{maxWidth:680,margin:"0 auto 32px"}}>
      {step===1&&(
        <div style={{background:C.white,border:`2px solid ${C.ink}`,padding:isMob?"20px":"28px 32px",position:"relative"}}>
          <button onClick={dismiss} style={{position:"absolute",top:12,right:14,background:"none",border:"none",fontSize:16,cursor:"pointer",color:C.gray}}>x</button>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gold,margin:"0 0 6px",textTransform:"uppercase"}}>30-second quiz</p>
          <p style={{fontSize:isMob?16:18,fontWeight:900,color:C.ink,margin:"0 0 18px",letterSpacing:"-.02em"}}>What is your main goal?</p>
          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:8,marginBottom:20}}>
            {GOALS_Q.map(g=>(
              <button key={g.id} style={optBtn(goal===g.id)} onClick={()=>setGoal(g.id)}>
                <span style={{fontSize:16}}>{g.icon}</span>
                <span style={{fontSize:11}}>{g.label}</span>
              </button>
            ))}
          </div>
          <button onClick={()=>{if(goal)setStep(2);}} disabled={!goal}
            style={{padding:"11px 28px",background:goal?C.gold:C.border,color:C.ink,border:"none",fontSize:13,fontWeight:800,cursor:goal?"pointer":"default",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
            Next →
          </button>
        </div>
      )}
      {step===2&&(
        <div style={{background:C.white,border:`2px solid ${C.ink}`,padding:isMob?"20px":"28px 32px",position:"relative"}}>
          <button onClick={dismiss} style={{position:"absolute",top:12,right:14,background:"none",border:"none",fontSize:16,cursor:"pointer",color:C.gray}}>x</button>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gold,margin:"0 0 6px",textTransform:"uppercase"}}>30-second quiz - 2/3</p>
          <p style={{fontSize:isMob?16:18,fontWeight:900,color:C.ink,margin:"0 0 18px",letterSpacing:"-.02em"}}>Experience level?</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {EXP.map(e=>(
              <button key={e.id} style={{...optBtn(experience===e.id),flexDirection:"row",justifyContent:"space-between"}} onClick={()=>setExperience(e.id)}>
                <span>{e.label}</span><span style={{fontSize:11,color:experience===e.id?C.white:C.gray,fontWeight:400}}>{e.desc}</span>
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setStep(1)} style={{padding:"11px 20px",background:"transparent",border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.gray,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>← Back</button>
            <button onClick={()=>{if(experience)setStep(3);}} disabled={!experience}
              style={{padding:"11px 28px",background:experience?C.gold:C.border,color:C.ink,border:"none",fontSize:13,fontWeight:800,cursor:experience?"pointer":"default",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
              Next →
            </button>
          </div>
        </div>
      )}
      {step===3&&(
        <div style={{background:C.white,border:`2px solid ${C.ink}`,padding:isMob?"20px":"28px 32px",position:"relative"}}>
          <button onClick={dismiss} style={{position:"absolute",top:12,right:14,background:"none",border:"none",fontSize:16,cursor:"pointer",color:C.gray}}>x</button>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gold,margin:"0 0 6px",textTransform:"uppercase"}}>30-second quiz - 3/3</p>
          <p style={{fontSize:isMob?16:18,fontWeight:900,color:C.ink,margin:"0 0 18px",letterSpacing:"-.02em"}}>Monthly supplement budget?</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
            {BUDGETS.map(b=>(
              <button key={b.id} style={optBtn(budget===b.id)} onClick={()=>setBudget(b.id)}>{b.label}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setStep(2)} style={{padding:"11px 20px",background:"transparent",border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.gray,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>← Back</button>
            <button onClick={()=>{if(budget)setStep(4);}} disabled={!budget}
              style={{padding:"11px 28px",background:budget?C.gold:C.border,color:C.ink,border:"none",fontSize:13,fontWeight:800,cursor:budget?"pointer":"default",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
              Show my stack →
            </button>
          </div>
        </div>
      )}
      {step===4&&(
        <div style={{background:C.white,border:`2px solid ${C.ink}`,borderTop:`4px solid ${C.gold}`,padding:isMob?"20px":"28px 32px",position:"relative"}}>
          <button onClick={dismiss} style={{position:"absolute",top:12,right:14,background:"none",border:"none",fontSize:16,cursor:"pointer",color:C.gray}}>x</button>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gold,margin:"0 0 6px",textTransform:"uppercase"}}>Your personalized starter stack</p>
          <p style={{fontSize:isMob?16:18,fontWeight:900,color:C.ink,margin:"0 0 4px",letterSpacing:"-.02em"}}>
            Top 5 compounds for {GOALS_Q.find(g=>g.id===goal)?.label}
          </p>
          <p style={{fontSize:12,color:C.gray,margin:"0 0 16px"}}>Ranked by efficacy and evidence. {experience==="beginner"?"Beginner-friendly selection.":experience==="advanced"?"Advanced protocol.":"Intermediate protocol."}</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            {(RECS[goal]||[]).map((name,i)=>{
              const supp=SUPPLEMENTS.find(s=>s.name===name||s.aliases?.includes(name));
              return(
                <div key={name} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:C.bg,border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:14,fontWeight:900,color:C.gold,width:20,flexShrink:0}}>#{i+1}</span>
                  <div style={{flex:1}}>
                    <span style={{fontSize:13,fontWeight:800,color:C.ink}}>{name}</span>
                    {supp&&<span style={{fontSize:10,color:C.gray,marginLeft:8}}>T{supp.tier} | Safety: {["","Risky","Caution","Caution","Safe","Very Safe"][supp.safety]||""}</span>}
                  </div>
                  {supp&&<span style={{fontSize:10,fontWeight:700,color:supp.tier===1?C.green:C.blue}}>{supp.tier===1?"Free":"Pro"}</span>}
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {user?(
              <button onClick={()=>{onNavigate("advisor");dismiss();}} style={{padding:"11px 24px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
                Analyze with AI Advisor →
              </button>
            ):(
              <button onClick={()=>{onAuth("signup");dismiss();}} style={{padding:"11px 24px",background:C.ink,color:C.white,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
                Create free account to see dosages →
              </button>
            )}
            <button onClick={()=>{onNavigate("supplements");dismiss();}} style={{padding:"11px 16px",background:"transparent",border:`1px solid ${C.border}`,fontSize:11,fontWeight:700,color:C.gray,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>
              Browse all compounds
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SHARED STACK PAGE ─────────────────────────────────────────────────────────
function SharedStackPage({shareId}){
  const isMob=useIsMobile();
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState("");

  useEffect(()=>{
    if(!shareId)return;
    (async()=>{
      try{
        const ref=doc(db,"shared_stacks",shareId);
        const snap=await getDoc(ref);
        if(snap.exists()){setData(snap.data());}
        else setErr("Stack not found or link has expired.");
      }catch{setErr("Could not load shared stack.");}
      finally{setLoading(false);}
    })();
  },[shareId]);

  if(loading)return<div style={{maxWidth:680,margin:"80px auto",textAlign:"center",fontFamily:"Montserrat,sans-serif"}}><p style={{color:C.gray}}>Loading shared stack...</p></div>;
  if(err)return<div style={{maxWidth:680,margin:"80px auto",textAlign:"center",fontFamily:"Montserrat,sans-serif"}}><p style={{color:C.red,fontWeight:700}}>{err}</p></div>;
  if(!data)return null;

  const tierColor=(t)=>["",C.green,C.blue,C.purple,C.amber][t]||C.gray;

  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:isMob?"24px 16px 80px":"48px 48px 80px",fontFamily:"Montserrat,sans-serif"}}>
      <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gold,margin:"0 0 6px",textTransform:"uppercase"}}>Shared Stack</p>
      <h1 style={{fontSize:isMob?24:36,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 6px"}}>{data.stack_name||"Shared Stack"}</h1>
      <p style={{fontSize:13,color:C.gray,margin:"0 0 6px"}}>Shared via Evidstack.com</p>
      {data.total_cost&&<p style={{fontSize:13,fontWeight:800,color:C.green,margin:"0 0 24px"}}>{data.total_cost}</p>}
      {data.summary&&<p style={{fontSize:14,color:C.gray,lineHeight:1.7,margin:"0 0 28px"}}>{data.summary}</p>}
      <div style={{border:`1px solid ${C.border}`,borderTop:`4px solid ${C.gold}`,background:C.white,marginBottom:20}}>
        <div style={{padding:"16px 24px",borderBottom:`1px solid ${C.border}`}}>
          <p style={{fontSize:11,fontWeight:800,color:C.gray,margin:0,letterSpacing:".1em",textTransform:"uppercase"}}>{data.compounds?.length} Compounds</p>
        </div>
        {data.compounds?.map((c,i)=>(
          <div key={i} style={{display:"flex",gap:16,padding:"16px 24px",borderBottom:i<data.compounds.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{width:28,height:28,background:tierColor(c.tier),flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",marginTop:2}}>
              <span style={{fontSize:10,fontWeight:900,color:C.white}}>T{c.tier}</span>
            </div>
            <div style={{flex:1}}>
              <p style={{fontSize:14,fontWeight:900,color:C.ink,margin:"0 0 3px"}}>{c.name}</p>
              <p style={{fontSize:11,color:C.blue,margin:"0 0 4px",fontWeight:700}}>{c.dose} - {c.timing}</p>
              <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.5}}>{c.reason}</p>
            </div>
            {c.cost&&<span style={{fontSize:11,color:C.gray,flexShrink:0}}>{c.cost}</span>}
          </div>
        ))}
      </div>
      {data.interactions&&<div style={{background:C.bg,border:`1px solid ${C.border}`,padding:"16px 20px",marginBottom:12}}><p style={{fontSize:10,fontWeight:800,color:C.gray,margin:"0 0 6px",letterSpacing:".1em",textTransform:"uppercase"}}>Interactions</p><p style={{fontSize:13,color:C.gray,margin:0,lineHeight:1.6}}>{data.interactions}</p></div>}
      <div style={{background:C.ink,padding:"20px 24px",textAlign:"center"}}>
        <p style={{fontSize:13,color:"#9ca3af",margin:"0 0 14px"}}>Build your own evidence-based stack at Evidstack.com</p>
        <a href="https://evidstack.com" style={{display:"inline-block",padding:"11px 28px",background:C.gold,color:C.ink,fontSize:12,fontWeight:800,textDecoration:"none",letterSpacing:".04em"}}>Build my stack</a>
      </div>
    </div>
  );
}

function AppInner(){
  const {user,isPro,loading,logout}=useAuth();
  // Inject global animation CSS once
  useEffect(()=>{
    if(document.getElementById("evid-anim-css"))return;
    const s=document.createElement("style");
    s.id="evid-anim-css";
    s.textContent=`
@keyframes evidFloat{0%,100%{transform:translateY(0) rotate(0deg);}33%{transform:translateY(-14px) rotate(2deg);}66%{transform:translateY(6px) rotate(-1.5deg);}}
@keyframes evidShimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
@keyframes evidPulse{0%,100%{opacity:.55;}50%{opacity:1;}}
@keyframes evidFadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
@keyframes evidCountIn{from{opacity:0;transform:scale(.8);}to{opacity:1;transform:scale(1);}}
@keyframes evidGlow{0%,100%{box-shadow:0 0 0 0 rgba(226,201,126,0);}50%{box-shadow:0 0 0 5px rgba(226,201,126,.18);}}
.evid-reveal{opacity:0;transform:translateY(20px);transition:opacity .6s cubic-bezier(.16,1,.3,1),transform .6s cubic-bezier(.16,1,.3,1);}
.evid-reveal.visible{opacity:1;transform:translateY(0);}
.evid-shimmer-btn{position:relative;overflow:hidden;}
.evid-shimmer-btn::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.45) 50%,transparent 65%);background-size:250% 100%;animation:evidShimmer 3s ease-in-out infinite;}
.evid-pulse-pro{animation:evidGlow 2.8s ease-in-out infinite;}
    `;
    document.head.appendChild(s);
  },[]);

  const [page,setPage]=useState(()=>getPageFromPath());
  const [compoundId,setCompoundId]=useState(()=>getCompoundIdFromPath());
  const [goalId,setGoalId]=useState(()=>getGoalIdFromPath());
  const [guideId,setGuideId]=useState(()=>getGuideIdFromPath());
  const [shareId,setShareId]=useState(()=>getShareIdFromPath());
  const [goal,setGoal]=useState("all");
  const [search,setSearch]=useState("");
  const [showSuggest,setShowSuggest]=useState(false);
  const searchContainerRef=useRef(null);
  const [selected,setSelected]=useState(null);
  const [sortBy,setSortBy]=useState("efficacy");
  const [filterTier,setFilterTier]=useState(0);
  const [showAuth,setShowAuth]=useState(false);
  const [authMode,setAuthMode]=useState("login");
  const [showUpgrade,setShowUpgrade]=useState(false);
  const [showAccount,setShowAccount]=useState(false);
  const [compareA,setCompareA]=useState(null);
  const [compareB,setCompareB]=useState(null);
  const [showCompareModal,setShowCompareModal]=useState(false);
  const [showOnboarding,setShowOnboarding]=useState(()=>{
    const count=parseInt(localStorage.getItem(ONBOARDING_KEY)||"0");
    return count<ONBOARDING_MAX;
  });
  const PLACEHOLDERS=[
    "Search by compound name...",
    "Try \"creatine\" for strength and muscle",
    "Try \"GHK-Cu\" for collagen and skin peptides",
    "Try \"semaglutide\" for weight loss",
    "Try \"BPC-157\" for healing peptides",
    "Try \"finasteride\" for hair retention",
    "Try \"focus\" for cognitive enhancers",
    "Try \"longevity\" for anti-aging compounds",
    "Try \"collagen\" for skin and facial quality",
    "Try \"skin\" to filter aesthetics compounds",
    "Try \"astaxanthin\" for photoprotection",
    "Try \"boron\" for testosterone and bone density",
  ];
  const [phIdx,setPhIdx]=useState(0);
  const [phFade,setPhFade]=useState(true);
  // Close suggestions when clicking outside search container
  useEffect(()=>{
    const handler=(e)=>{if(searchContainerRef.current&&!searchContainerRef.current.contains(e.target))setShowSuggest(false);};
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[]);
  useEffect(()=>{
    const iv=setInterval(()=>{
      setPhFade(false);
      setTimeout(()=>{setPhIdx(i=>(i+1)%PLACEHOLDERS.length);setPhFade(true);},400);
    },4000);
    return()=>clearInterval(iv);
  },[]);
  const isMobile=useIsMobile();
  const [mobileMenu,setMobileMenu]=useState(false);
  const [showTools,setShowTools]=useState(false);

  const navigateTo=(p)=>{navigate(p);setPage(p);setCompoundId(null);window.scrollTo({top:0,behavior:"instant"});};

  // Dynamic SEO meta tags
  useEffect(()=>{
    const supp=page==="compound"&&compoundId?SUPPLEMENTS.find(s=>s.id===compoundId):null;
    let title="EVIDSTACK - Evidence-Based Supplement & Compound Database";
    let desc="370+ supplements, peptides, SARMs, and compounds ranked by efficacy and evidence. PubMed meta-analyses, AI compound advisor, interaction checker.";
    if(supp){
      title=`${supp.name} - Dosage, Evidence & Interactions | Evidstack`;
      desc=`${supp.name} evidence review: safety ${["","risky","caution","caution","safe","very safe"][supp.safety]||""}, Tier ${supp.tier}, ${supp.effects?.length||0} goals covered. Dosing, interactions, and study summaries on Evidstack.`;
    }else if(page==="advisor"){title="AI Compound Advisor - Evidstack";desc="Describe any health goal and get compounds ranked by efficacy and evidence quality. Powered by 370+ compound database and PubMed data.";}
    else if(page==="pricing"){title="Pricing - Evidstack Pro";desc="Unlock all 370+ compounds, AI Compound Advisor, Interaction Checker, Stack Audit, and Bloodwork History for $9.99/month.";}
    else if(page==="interaction-checker"){title="Interaction Checker - Evidstack";desc="Check your full supplement stack for interactions, absorption conflicts, synergies, and optimal timing. Evidence-based analysis.";}
    else if(page==="stack-audit"){title="Stack Audit AI - Evidstack";desc="AI-powered supplement stack audit. Get a Stack Score, identify redundancies, critical gaps, and priority changes.";}
    else if(page==="bloodwork-history"){title="Bloodwork History - Evidstack";desc="Track 16 biomarkers over time. Correlate blood test results with your supplement stack changes.";}
    else if(page==="guides"){title="Supplement Protocol Guides - Evidstack";desc="Evidence-based supplement protocols for sleep, focus, testosterone, strength, longevity, skin, fat loss and recovery. Ranked by clinical trial data.";}
    else if(page==="goal-page"&&goalId){const g=GOALS.find(gl=>gl.id===goalId);if(g){title=`Best Supplements for ${g.label} - Evidstack`;desc=`Evidence-ranked supplements for ${g.label}. Every compound scored by efficacy and study quality from PubMed and Cochrane reviews.`;}}
    else if(page==="guide-page"&&guideId){title=`${guideId.charAt(0).toUpperCase()+guideId.slice(1)} Supplement Guide - Evidstack`;desc=`Evidence-based supplement protocol for ${guideId}. Ranked from primary to optional with dosing, timing, and interaction data.`;}
    document.title=title;
    let metaDesc=document.querySelector("meta[name='description']");
    if(metaDesc)metaDesc.setAttribute("content",desc);
    let ogTitle=document.querySelector("meta[property='og:title']");
    if(ogTitle)ogTitle.setAttribute("content",title);
    let ogDesc=document.querySelector("meta[property='og:description']");
    if(ogDesc)ogDesc.setAttribute("content",desc);
    let canonical=document.querySelector("link[rel='canonical']");
    if(canonical){
      const path=page==="supplements"?"":page==="compound"&&compoundId?`/compound/${compoundId}`:`/${page}`;
      canonical.setAttribute("href",`https://evidstack.com${path}`);
    }
  },[page,compoundId]);

  useEffect(()=>{
    const onPop=()=>{
      setPage(getPageFromPath());
      setCompoundId(getCompoundIdFromPath());
      setShareId(getShareIdFromPath());
      setGoalId(getGoalIdFromPath());
      setGuideId(getGuideIdFromPath());
    };
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);
  const openAuth=(mode="login")=>{setAuthMode(mode);setShowAuth(true);};
  const openUpgrade=()=>setShowUpgrade(true);
  const toggle=(id)=>setSelected(p=>p===id?null:id);
  const handleCompare=(supp)=>{
    if(compareA?.id===supp.id){setCompareA(null);return;}
    if(compareB?.id===supp.id){setCompareB(null);return;}
    if(!compareA){setCompareA(supp);return;}
    if(!compareB){setCompareB(supp);return;}
    // Both full  - replace oldest (A)
    setCompareA(compareB);setCompareB(supp);
  };

  const filtered=useMemo(()=>{
    let list=SUPPLEMENTS;
    if(goal!=="all")list=list.filter(s=>s.effects.some(e=>e.goal===goal));
    if(filterTier)list=list.filter(s=>s.tier===filterTier);
    if(search.trim()){
      const q=search.toLowerCase();
      // Semantic goal match: "sleep" → show all sleep compounds even if name doesn't contain "sleep"
      const goalMatch=GOALS.find(g=>g.id!=="all"&&(g.label.toLowerCase().replace(" / ","").replace(/ /g,"").includes(q)||g.id===q));
      if(goalMatch){
        list=list.filter(s=>s.effects.some(e=>e.goal===goalMatch.id));
      } else {
        // Prefix match first, then include match on name + aliases
        list=list.filter(s=>{
          const n=s.name.toLowerCase();
          const aliases=(s.aliases||[]).map(a=>a.toLowerCase());
          const tags=(s.tags||[]).map(t=>t.toLowerCase());
          return n.startsWith(q)||n.includes(q)||aliases.some(a=>a.includes(q))||tags.some(t=>t.includes(q));
        });
        // Sort so prefix matches come first
        list=[...list].sort((a,b)=>{
          const aStarts=a.name.toLowerCase().startsWith(q)?0:1;
          const bStarts=b.name.toLowerCase().startsWith(q)?0:1;
          return aStarts-bStarts;
        });
      }
    }
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
    {id:"advisor",label:"AI Compound Advisor"},
    {id:"guides",label:"Guides"},
    {id:"pricing",label:"Pricing"},
    {id:"about",label:"About"},
  ];
  const proTools=[
    {id:"tracker",label:"My Tracker"},
    {id:"bloodwork",label:"AI Bloodwork Analyzer"},
    {id:"interaction-checker",label:"Interaction Checker"},
    {id:"stack-audit",label:"Stack Audit AI"},
    {id:"bloodwork-history",label:"Bloodwork History"},
  ];
  const proPages=proTools.map(t=>t.id);

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif",color:C.ink}}>
      {showOnboarding&&<OnboardingModal onClose={()=>setShowOnboarding(false)}/>}
      {showAuth&&<AuthModal onClose={()=>setShowAuth(false)} initialMode={authMode}/>}
      {showUpgrade&&<UpgradeModal onClose={()=>setShowUpgrade(false)} onAuthNeeded={()=>openAuth("signup")}/>}
      {showAccount&&<AccountCenter onClose={()=>setShowAccount(false)} onUpgrade={openUpgrade}/>}
      {showCompareModal&&compareA&&compareB&&<CompareModal compA={compareA} compB={compareB} onClose={()=>{setShowCompareModal(false);setCompareA(null);setCompareB(null);}}/>}

      {/* Mobile menu drawer */}
      {isMobile&&mobileMenu&&(
        <div onClick={()=>setMobileMenu(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:0,right:0,width:280,height:"100%",background:C.white,padding:"24px 20px",display:"flex",flexDirection:"column",gap:4}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <span style={{fontSize:14,fontWeight:900,letterSpacing:"-.04em"}}>EVIDSTACK</span>
              <button onClick={()=>setMobileMenu(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.gray}}>x</button>
            </div>
            {[...navItems,...proTools,{id:"legal",label:"Terms & Privacy"}].map(item=>(
              <button key={item.id} onClick={()=>{navigateTo(item.id);setMobileMenu(false);}}
                style={{padding:"14px 16px",fontSize:14,fontWeight:700,
                  background:page===item.id?C.ink:"transparent",
                  color:page===item.id?C.white:C.gray,
                  border:"none",cursor:"pointer",textAlign:"left",borderRadius:4,
                  display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span>{item.label}</span>
                {proTools.some(t=>t.id===item.id)&&!isPro&&<span style={{fontSize:9,color:C.gold,fontWeight:900,letterSpacing:".06em"}}>PRO</span>}
              </button>
            ))}
            <div style={{height:1,background:C.border,margin:"12px 0"}}/>
            {user?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {isPro&&<span style={{fontSize:11,fontWeight:800,color:C.gold,letterSpacing:".12em",border:`1px solid ${C.gold}`,padding:"4px 10px",alignSelf:"flex-start"}}>PRO MEMBER</span>}
                {!isPro&&<button onClick={()=>{openUpgrade();setMobileMenu(false);}} style={{padding:"12px 16px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",width:"100%"}}>Upgrade to Pro</button>}
                <button onClick={()=>{setShowAccount(true);setMobileMenu(false);}} style={{padding:"12px 16px",fontSize:13,fontWeight:700,background:C.bg,color:C.ink,border:`1px solid ${C.border}`,cursor:"pointer",width:"100%"}}>My Account</button>
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
                  color:page===item.id?C.white:C.gray,
                  border:"none",cursor:"pointer",letterSpacing:"-.01em",transition:"all .15s"}}>
                {item.label}
              </button>
            ))}
            <div style={{position:"relative"}}
              onMouseEnter={()=>setShowTools(true)}
              onMouseLeave={()=>setShowTools(false)}>
              <button
                style={{padding:"8px 14px",fontSize:12,fontWeight:700,
                  background:proPages.includes(page)?C.ink:"transparent",
                  color:proPages.includes(page)?C.white:isPro?C.gray:C.gold,
                  border:"none",cursor:"pointer",letterSpacing:"-.01em",transition:"all .15s",
                  display:"flex",alignItems:"center",gap:5}}>
                <span style={{color:proPages.includes(page)?C.white:C.gold,marginRight:2}}>+</span><span>Pro Tools</span><span style={{fontSize:8,marginLeft:4}}>{showTools?"▲":"▼"}</span>
              </button>
              {showTools&&(
                <div style={{position:"absolute",top:"100%",left:0,background:C.white,
                  border:`1px solid ${C.border}`,boxShadow:"0 8px 24px rgba(0,0,0,.12)",
                  zIndex:500,minWidth:210}}>
                  {proTools.map(t=>(
                    <button key={t.id} onClick={()=>{navigateTo(t.id);setShowTools(false);}}
                      style={{width:"100%",padding:"12px 16px",fontSize:12,fontWeight:700,
                        background:page===t.id?C.bg:"transparent",
                        color:C.ink,border:"none",
                        borderBottom:`1px solid ${C.border}`,
                        cursor:"pointer",textAlign:"left",
                        fontFamily:"Montserrat,sans-serif",
                        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      {t.label}
                      {!isPro&&<span style={{fontSize:8,color:C.gold,fontWeight:900,letterSpacing:".08em"}}>PRO</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{width:1,height:24,background:C.border,margin:"0 10px"}}/>
            {user?(
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {isPro&&<span className="evid-pulse-pro" style={{fontSize:10,fontWeight:800,color:C.gold,letterSpacing:".12em",border:`1px solid ${C.gold}`,padding:"4px 10px"}}>PRO</span>}
                {!isPro&&<button onClick={openUpgrade} className="evid-shimmer-btn" style={{padding:"8px 16px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",letterSpacing:".04em"}}>Upgrade</button>}
                <button onClick={()=>setShowAccount(true)} style={{padding:"8px 14px",fontSize:11,fontWeight:700,background:"transparent",color:C.gray,border:`1px solid ${C.border}`,cursor:"pointer"}}>Account</button>
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
      {page==="pricing"        &&<PricingPage onUpgrade={openUpgrade} onAuth={openAuth}/>}
      {page==="affiliate"&&<AffiliatePage/>}
      {page==="compound"&&<CompoundPage compoundId={compoundId} onUpgrade={openUpgrade} onAuth={openAuth} onBack={()=>{window.history.pushState({},"","/supplements");window.dispatchEvent(new PopStateEvent("popstate"));}}/>}
      {page==="shared-stack"&&<SharedStackPage shareId={shareId}/>}
      {page==="guides"&&<GuidesIndexPage onNavigate={navigateTo} onUpgrade={openUpgrade} onAuth={openAuth}/>}
      {page==="goal-page"&&goalId&&<GoalPage goalId={goalId} onUpgrade={openUpgrade} onAuth={openAuth} onNavigate={navigateTo}/>}
      {page==="guide-page"&&guideId&&<GuidePage guideId={guideId} onUpgrade={openUpgrade} onAuth={openAuth} onNavigate={navigateTo}/>}
      {page==="legal"          &&<LegalPage/>}
      {page==="interactions"   &&<InteractionChecker onUpgrade={openUpgrade}/>}
      {page==="weekly-protocol"&&<WeeklyProtocolAI onUpgrade={openUpgrade}/>}
      {page==="tracker"        &&<MyTracker onUpgrade={openUpgrade}/>}
      {page==="advisor"        &&<CompoundAdvisorScreen onUpgrade={openUpgrade}/>}
      {page==="interaction-checker"&&<InteractionCheckerPro onUpgrade={openUpgrade}/>}
      {page==="stack-audit"   &&<StackAuditScreen onUpgrade={openUpgrade}/>}
      {page==="bloodwork-history"&&<BloodworkHistoryScreen onUpgrade={openUpgrade}/>}
      {page==="stack-builder" &&<StackBuilder onUpgrade={openUpgrade}/>}
      {page==="cycle-alerts"  &&<CycleAlertsScreen onUpgrade={openUpgrade}/>}
      {page==="stack-optimizer"&&<StackOptimizerScreen onUpgrade={openUpgrade}/>}
      {page==="bloodwork"     &&<BloodWorkScreen onUpgrade={openUpgrade}/>}

      {page==="supplements"&&<>
        <div style={{padding:isMobile?"32px 16px 40px":"60px 24px 56px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          {/* Molecular background */}
          {!isMobile&&<svg aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}} viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg">
            {[
              {cx:80,cy:80,r:28,d:11},{cx:1120,cy:60,r:22,d:14},{cx:200,cy:300,r:18,d:9},
              {cx:980,cy:280,r:24,d:13},{cx:550,cy:40,r:16,d:17},{cx:660,cy:360,r:20,d:8},
              {cx:350,cy:180,r:14,d:15},{cx:870,cy:150,r:26,d:12},{cx:120,cy:210,r:12,d:19},
              {cx:1050,cy:340,r:16,d:10},{cx:430,cy:330,r:22,d:7},{cx:760,cy:80,r:14,d:16},
            ].map(({cx,cy,r,d},i)=>(
              <g key={i} style={{animation:`evidFloat ${d}s ease-in-out infinite`,animationDelay:`${i*1.1}s`}}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1a1a" strokeWidth="1" opacity=".035"/>
                <circle cx={cx} cy={cy} r={r*0.35} fill="#1a1a1a" opacity=".025"/>
                {i%3===0&&<line x1={cx+r} y1={cy} x2={cx+r+28} y2={cy-14} stroke="#1a1a1a" strokeWidth=".8" opacity=".03"/>}
                {i%4===0&&<circle cx={cx+r+36} cy={cy-18} r={10} fill="none" stroke="#e2c97e" strokeWidth=".8" opacity=".07"/>}
              </g>
            ))}
          </svg>}
          <div style={{position:"relative",zIndex:1}}>
          <h1 style={{fontSize:isMobile?28:48,fontWeight:900,lineHeight:1.12,letterSpacing:"-.04em",margin:"0 0 14px",color:C.ink,maxWidth:740,marginLeft:"auto",marginRight:"auto"}}>
            Not just what the science says.<br/>What you should actually do.
          </h1>
          <p style={{fontSize:isMobile?13:15,color:C.gray,lineHeight:1.8,margin:"0 auto 20px",maxWidth:580,padding:isMobile?"0 4px":0}}>
            {Math.floor(SUPPLEMENTS.length/10)*10}+ compounds: peptides, SARMs, GLP-1s, anabolics, nootropics, skin & aesthetics - scored by <strong style={{color:C.ink,fontWeight:700}}>actual effect size</strong> and <strong style={{color:C.ink,fontWeight:700}}>evidence quality</strong>. Then an AI that turns the data into a protocol built for your body. Free to search. No account required.
          </p>
          <div ref={searchContainerRef} style={{maxWidth:680,margin:"0 auto 20px",position:"relative"}}>
            <div style={{display:"flex",boxShadow:"0 2px 16px rgba(0,0,0,.08)",position:"relative"}}>
              {!search&&(
                <div style={{position:"absolute",left:isMobile?14:20,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",zIndex:1,opacity:phFade?1:0,transition:"opacity .4s",fontSize:isMobile?13:14,color:"#9ca3af",fontFamily:"Montserrat,sans-serif",whiteSpace:"nowrap",overflow:"hidden",maxWidth:"calc(100% - 110px)"}}>
                  {isMobile?"Search a supplement...":PLACEHOLDERS[phIdx]}
                </div>
              )}
              <input value={search}
                onChange={e=>{setSearch(e.target.value);setShowSuggest(e.target.value.length>0);}}
                onFocus={()=>{if(search.length>0)setShowSuggest(true);}}
                onKeyDown={e=>{if(e.key==="Escape"){setShowSuggest(false);e.target.blur();}if(e.key==="Enter"){setShowSuggest(false);document.getElementById("compounds-grid")?.scrollIntoView({behavior:"smooth",block:"start"});}}}
                placeholder=""
                style={{flex:1,padding:isMobile?"13px 14px":"16px 20px",border:`1px solid ${C.border}`,borderRight:"none",background:C.white,fontSize:isMobile?13:14,fontFamily:"Montserrat,sans-serif",outline:"none",color:C.ink,minWidth:0}}/>
              <button onClick={()=>{setShowSuggest(false);document.getElementById("compounds-grid")?.scrollIntoView({behavior:"smooth",block:"start"});}} style={{padding:isMobile?"13px 16px":"16px 24px",background:C.ink,color:C.white,border:"none",fontSize:isMobile?12:13,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",flexShrink:0}}>Search for free →</button>
            </div>
            {/* Autocomplete dropdown */}
            {showSuggest&&search.trim().length>0&&(()=>{
              const q=search.toLowerCase();
              // Goal-level semantic suggestions
              const goalHits=GOALS.filter(g=>g.id!=="all"&&(g.label.toLowerCase().replace(" / ","").replace(/ /g,"").includes(q)||g.id.includes(q))).slice(0,3);
              // Compound name suggestions: prefix first, then includes
              const prefixHits=SUPPLEMENTS.filter(s=>s.name.toLowerCase().startsWith(q)).slice(0,6);
              const includeHits=SUPPLEMENTS.filter(s=>!s.name.toLowerCase().startsWith(q)&&(s.name.toLowerCase().includes(q)||(s.aliases||[]).some(a=>a.toLowerCase().includes(q)))).slice(0,4);
              const compoundHits=[...prefixHits,...includeHits].slice(0,8);
              if(!goalHits.length&&!compoundHits.length)return null;
              return(
                <div style={{position:"absolute",top:"100%",left:0,right:0,background:C.white,border:`1px solid ${C.border}`,boxShadow:"0 8px 24px rgba(0,0,0,.12)",zIndex:50,maxHeight:360,overflowY:"auto",marginTop:2}}>
                  {goalHits.length>0&&(
                    <div>
                      <p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:0,padding:"8px 16px 4px",textTransform:"uppercase",background:C.bg,borderBottom:`1px solid ${C.border}`}}>Filter by goal</p>
                      {goalHits.map(g=>(
                        <div key={g.id} onMouseDown={()=>{setSearch(g.label);setShowSuggest(false);document.getElementById("compounds-grid")?.scrollIntoView({behavior:"smooth",block:"start"});}}
                          style={{padding:"10px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`}}
                          onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <span style={{fontSize:16}}>{g.icon}</span>
                          <div>
                            <p style={{fontSize:13,fontWeight:700,color:C.ink,margin:0}}>{g.label}</p>
                            <p style={{fontSize:10,color:C.gray,margin:0}}>Show all compounds for this goal</p>
                          </div>
                          <span style={{marginLeft:"auto",fontSize:9,fontWeight:700,color:C.gold,letterSpacing:".08em",background:`${C.gold}18`,padding:"2px 7px"}}>GOAL</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {compoundHits.length>0&&(
                    <div>
                      {(goalHits.length>0||true)&&<p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:0,padding:"8px 16px 4px",textTransform:"uppercase",background:C.bg,borderBottom:`1px solid ${C.border}`}}>Compounds</p>}
                      {compoundHits.map(s=>{
                        const tierColor=["","#16a34a","#2563eb","#7c3aed","#d97706"][s.tier]||C.gray;
                        const tierLabel=["","T1","T2","T3","T4"][s.tier]||"";
                        const bestEff=s.effects.length?Math.max(...s.effects.map(e=>e.efficacy)):0;
                        return(
                          <div key={s.id} onMouseDown={()=>{setSearch(s.name);setShowSuggest(false);document.getElementById("compounds-grid")?.scrollIntoView({behavior:"smooth",block:"start"});}}
                            style={{padding:"10px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${C.border}`}}
                            onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <span style={{fontSize:10,fontWeight:800,color:tierColor,border:`1px solid ${tierColor}`,padding:"2px 6px",flexShrink:0,minWidth:24,textAlign:"center"}}>{tierLabel}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{fontSize:13,fontWeight:700,color:C.ink,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</p>
                              {s.aliases&&s.aliases[0]&&<p style={{fontSize:10,color:C.gray,margin:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.aliases[0]}</p>}
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                              <div style={{width:32,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                                <div style={{width:`${(bestEff/5)*100}%`,height:"100%",background:tierColor,borderRadius:2}}/>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          <p style={{fontSize:11,color:C.gray,textAlign:"center",margin:"0 auto 12px",maxWidth:500,fontFamily:"Montserrat,sans-serif"}}>T1 = strongest evidence. T4 = experimental. Every compound scored by effect size and study quality.</p>
          <HeroStats isMobile={isMobile}/>
          </div>{/* end zIndex:1 */}
          {/* Social proof */}
          <div className="evid-reveal visible" style={{maxWidth:680,margin:"0 auto 16px",display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:1,background:C.border}}>
            {[
              {val:`${Math.floor(SUPPLEMENTS.length/10)*10}+`,label:"Compounds"},
              {val:"PubMed",label:"Primary source"},
              {val:"4 tiers",label:"Evidence levels"},
              {val:"Free",label:"No card needed"},
            ].map(({val,label})=>(
              <div key={label} style={{background:C.white,padding:"14px 12px",textAlign:"center"}}>
                <p style={{fontSize:15,fontWeight:900,color:C.ink,margin:"0 0 2px",letterSpacing:"-.02em"}}>{val}</p>
                <p style={{fontSize:10,color:C.gray,margin:0,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase"}}>{label}</p>
              </div>
            ))}
          </div>

          <div style={{maxWidth:680,margin:"0 auto 0",background:C.ink,padding:isMobile?"20px 16px":"24px 32px"}}>
            {user&&!isPro?(
              <><p style={{fontSize:13,color:"#e8e5df",margin:"0 0 6px",fontWeight:700}}>Unlock all {Math.floor(SUPPLEMENTS.length/10)*10}+ compounds + AI Compound Advisor.</p>
              <p style={{fontSize:12,color:"#9ca3af",margin:"0 0 16px",lineHeight:1.6}}>Tier 2-4 compounds, peptides, AI tools - $9.99/month.</p>
              <button onClick={openUpgrade} style={{padding:"11px 24px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Upgrade to Pro</button></>
            ):user&&isPro?(
              <><p style={{fontSize:13,color:"#e8e5df",margin:"0 0 4px",fontWeight:700}}>Welcome back, Pro member.</p>
              <p style={{fontSize:12,color:"#9ca3af",margin:0}}>Full access to all compounds and the AI Compound Advisor.</p></>
            ):(
              <div>
                <p style={{fontSize:15,color:"#e8e5df",margin:"0 0 6px",fontWeight:900,letterSpacing:"-.02em"}}>Evidstack Pro is here.</p>
                <p style={{fontSize:12,color:"#9ca3af",margin:"0 0 20px",lineHeight:1.7}}>AI Compound Advisor, Interaction Checker, Stack Audit AI, Bloodwork History, and {Math.floor(SUPPLEMENTS.length/10)*10}+ compounds including peptides, GLP-1s, and biohacking tier.</p>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",justifyContent:"center"}}>
                  <button onClick={()=>{openUpgrade();}} className="evid-shimmer-btn" style={{padding:"12px 24px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",lineHeight:1}}>
                    Start for $9.99/mo
                  </button>
                  <button onClick={()=>{openAuth("signup");}} style={{padding:"12px 24px",background:"transparent",color:"#9ca3af",border:"1px solid #374151",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",lineHeight:1}}>
                    Create free account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* How it works */}


        {/* Goal Quiz */}
        <div style={{padding:"0 16px"}}>
          <GoalQuizSection onNavigate={navigateTo} onAuth={openAuth}/>
        </div>

      <div style={{background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",padding:"16px 0 40px"}}>
        <p style={{fontSize:10,fontWeight:700,letterSpacing:".16em",color:C.gray,margin:"0 0 14px",textTransform:"uppercase"}}>Browse the database</p>
        <style>{`
          @keyframes chevBounce{0%,100%{transform:translateY(0);opacity:.2}50%{transform:translateY(7px);opacity:1}}
          .chev1{animation:chevBounce 1.6s ease-in-out infinite;}
          .chev2{animation:chevBounce 1.6s ease-in-out .28s infinite;}
        `}</style>
        {[1,2].map(n=>(
          <svg key={n} className={n===1?"chev1":"chev2"} width="30" height="17" viewBox="0 0 30 17" fill="none" style={{display:"block"}}>
            <polyline points="3,3 15,14 27,3" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ))}
      </div>

        <div style={{borderBottom:`1px solid ${C.border}`,background:C.white}}>
          <div style={{display:"flex",gap:0,overflowX:"auto",padding:"0 32px"}}>
            {GOALS.map((g,i)=>(
              <div key={g.id} style={{display:"flex",alignItems:"stretch",position:"relative"}}>
                <button onClick={()=>setGoal(g.id)}
                  style={{padding:"14px 12px",fontSize:11,fontWeight:700,letterSpacing:".04em",background:"transparent",color:goal===g.id?C.ink:C.gray,border:"none",borderBottom:goal===g.id?`2px solid ${C.ink}`:"2px solid transparent",cursor:"pointer",fontFamily:"Montserrat,sans-serif",whiteSpace:"nowrap"}}>
                  {g.icon} {T.controls.goals[i]||g.label}
                </button>
                {g.id!=="all"&&<button title={`Browse all ${g.label} compounds`}
                  onClick={e=>{e.stopPropagation();window.history.pushState({},"",`/goal/${g.id}`);window.dispatchEvent(new PopStateEvent("popstate"));}}
                  style={{padding:"0 4px 0 0",background:"transparent",border:"none",borderBottom:goal===g.id?`2px solid ${C.ink}`:"2px solid transparent",cursor:"pointer",color:"#9ca3af",fontSize:9,display:"flex",alignItems:"center"}}
                  title="View full goal page">↗</button>}
              </div>
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
          {(compareA||compareB)&&(
            <div style={{background:C.ink,padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:10,fontWeight:800,color:C.gold,letterSpacing:".1em",textTransform:"uppercase"}}>Comparing:</span>
                {compareA&&<span style={{fontSize:11,fontWeight:700,color:C.white,border:`1px solid ${C.blue}`,padding:"3px 10px"}}>{compareA.name}</span>}
                {compareA&&!compareB&&<span style={{fontSize:10,color:"#9ca3af"}}>Select one more compound</span>}
                {compareB&&<span style={{fontSize:11,fontWeight:700,color:C.white,border:`1px solid ${C.blue}`,padding:"3px 10px"}}>{compareB.name}</span>}
              </div>
              <div style={{display:"flex",gap:8}}>
                {compareA&&compareB&&<button onClick={e=>{e.stopPropagation();setShowCompareModal(true);}} style={{padding:"7px 16px",background:C.blue,color:C.white,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Compare now</button>}
                <button onClick={()=>{setCompareA(null);setCompareB(null);}} style={{padding:"7px 12px",background:"transparent",border:"1px solid #374151",color:"#9ca3af",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Clear</button>
              </div>
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
            {(()=>{
              let tier1Seen=0;
              const items=[];
              for(let i=0;i<filtered.length;i++){
                const s=filtered[i];
                const isTier1=s.tier===1;
                if(!user&&isTier1){
                  if(tier1Seen===FREE_VISIBLE){
                    items.push(<FreeGateBanner key="free-gate-banner" onAuth={openAuth} isMob={isMobile}/>);
                  }
                  if(tier1Seen>=FREE_VISIBLE){
                    items.push(<div key={s.id} style={{animation:`fadeUp .35s ${i*.02}s both`}}><FreeGateCard supp={s} isMob={isMobile}/></div>);
                    tier1Seen++;
                    continue;
                  }
                  tier1Seen++;
                }
                items.push(
                  <div key={s.id} style={{animation:`fadeUp .35s ${i*.02}s both`}}>
                    <SupplementCard supp={s} activeGoal={goal} onClick={()=>toggle(s.id)} isSelected={selected===s.id} isPro={isPro} onUpgrade={openUpgrade} onCompare={handleCompare} compareA={compareA} compareB={compareB} cardIndex={i}/>
                  </div>
                );
              }
              return items;
            })()}
          </div>
        </div>
      </>}

      <div style={{borderTop:`1px solid ${C.border}`,background:C.white,padding:isMobile?"28px 16px":"40px 48px"}}>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:28,marginBottom:32}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:26,height:26,border:`2px solid ${C.ink}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:10,fontWeight:900,color:C.ink}}>E</span>
              </div>
              <span style={{fontSize:11,fontWeight:900,letterSpacing:".08em",color:C.ink}}>EVIDSTACK</span>
            </div>
            <p style={{fontSize:11,color:C.gray,margin:"0 0 6px",lineHeight:1.7}}>{Math.floor(SUPPLEMENTS.length/10)*10}+ compounds from PubMed and Cochrane.</p>
            <p style={{fontSize:11,color:C.gray,margin:0}}>evidstack@protonmail.com</p>
          </div>
          <div>
            <p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>Database</p>
            {[["supplements","Supplements"]].map(([p,l])=>(
              <button key={p} onClick={()=>navigateTo(p)} style={{display:"block",fontSize:12,color:C.gray,background:"none",border:"none",cursor:"pointer",fontFamily:"Montserrat,sans-serif",padding:"3px 0",textAlign:"left"}}>{l}</button>
            ))}
          </div>
          <div>
            <p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>Tools</p>
            {[["tracker","My Tracker"],["bloodwork","AI Bloodwork Analyzer"],["interaction-checker","Interaction Checker"],["stack-audit","Stack Audit AI"],["bloodwork-history","Bloodwork History"]].map(([p,l])=>(
              <button key={p} onClick={()=>navigateTo(p)} style={{display:"block",fontSize:12,color:C.gray,background:"none",border:"none",cursor:"pointer",fontFamily:"Montserrat,sans-serif",padding:"3px 0",textAlign:"left"}}>{l}</button>
            ))}
          </div>
          <div>
            <p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>Company</p>
            {[["about","About"],["pricing","Pricing"],["affiliate","Affiliate Program"],["legal","Terms & Privacy"]].map(([p,l])=>(
              <button key={p} onClick={()=>navigateTo(p)} style={{display:"block",fontSize:12,color:C.gray,background:"none",border:"none",cursor:"pointer",fontFamily:"Montserrat,sans-serif",padding:"3px 0",textAlign:"left"}}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <p style={{fontSize:10,color:C.gray,margin:0}}>{T.footer}</p>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <a href="https://www.tiktok.com/@evidstack" target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,color:C.gray,transition:"color .15s",textDecoration:"none"}}
              onMouseEnter={e=>e.currentTarget.style.color=C.ink}
              onMouseLeave={e=>e.currentTarget.style.color=C.gray}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.87a8.18 8.18 0 004.79 1.52V7a4.85 4.85 0 01-1.02-.31z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/evidstack" target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",justifyContent:"center",width:28,height:28,color:C.gray,transition:"color .15s",textDecoration:"none"}}
              onMouseEnter={e=>e.currentTarget.style.color=C.ink}
              onMouseLeave={e=>e.currentTarget.style.color=C.gray}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <p style={{fontSize:10,color:C.gray,margin:0}}>Not medical advice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CYCLE ALERTS ─────────────────────────────────────────────────────────────
function CycleAlertsScreen({onUpgrade}){
  const {isPro}=useAuth();
  const STORAGE_KEY="evidstack_cycles";
  const [cycles,setCycles]=useState(()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch{return [];}});
  const [form,setForm]=useState({compound:"",startDate:new Date().toISOString().slice(0,10),onWeeks:8,offWeeks:4});
  const [adding,setAdding]=useState(false);
  const [suggest,setSuggest]=useState([]);
  const isMob=useIsMobile();

  const save=(u)=>{setCycles(u);localStorage.setItem(STORAGE_KEY,JSON.stringify(u));};
  const addCycle=()=>{
    if(!form.compound.trim())return;
    save([...cycles,{id:Date.now(),...form,onWeeks:parseInt(form.onWeeks),offWeeks:parseInt(form.offWeeks)}]);
    setAdding(false);setForm({compound:"",startDate:new Date().toISOString().slice(0,10),onWeeks:8,offWeeks:4});
  };
  const deleteCycle=(id)=>save(cycles.filter(c=>c.id!==id));
  const getStatus=(cycle)=>{
    const start=new Date(cycle.startDate);
    const daysSince=Math.floor((new Date()-start)/86400000);
    const totalDays=(cycle.onWeeks+cycle.offWeeks)*7;
    const pos=((daysSince%totalDays)+totalDays)%totalDays;
    const onDays=cycle.onWeeks*7;
    const isOn=pos<onDays;
    const daysLeft=isOn?onDays-pos:totalDays-pos;
    const nextDate=new Date(Date.now()+daysLeft*86400000);
    return{isOn,daysLeft,nextDate:nextDate.toLocaleDateString("en-US",{month:"short",day:"numeric"}),daysSince};
  };
  const handleInput=(val)=>{
    setForm(f=>({...f,compound:val}));
    if(val.length<2){setSuggest([]);return;}
    setSuggest(SUPPLEMENTS.filter(s=>s.name.toLowerCase().includes(val.toLowerCase())).slice(0,5));
  };

  const Sp={page:{minHeight:"100vh",background:C.bg,padding:isMob?"32px 16px":"48px 24px",fontFamily:"Montserrat,sans-serif"},
    inner:{maxWidth:800,margin:"0 auto"},
    tag:{fontSize:11,fontWeight:700,letterSpacing:".15em",color:C.gold,marginBottom:8,display:"block"},
    h1:{fontSize:isMob?28:36,fontWeight:900,color:C.ink,margin:"0 0 8px"},
    sub:{fontSize:14,color:C.gray,margin:"0 0 36px"},
    card:{background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:isMob?16:24,marginBottom:16},
    btn:{background:C.ink,color:C.white,border:"none",borderRadius:3,padding:"11px 22px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"Montserrat,sans-serif"},
    btnGold:{background:C.gold,color:C.ink,border:"none",borderRadius:3,padding:"11px 22px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"Montserrat,sans-serif"},
    btnGhost:{background:"transparent",color:C.gray,border:`1px solid ${C.border}`,borderRadius:3,padding:"11px 22px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"Montserrat,sans-serif"},
    input:{width:"100%",padding:"10px 14px",border:`1px solid ${C.border}`,borderRadius:3,fontSize:14,fontFamily:"Montserrat,sans-serif",background:C.white,boxSizing:"border-box"},
    label:{fontSize:10,fontWeight:700,letterSpacing:".1em",color:C.gray,marginBottom:5,display:"block"},
    badge:(on)=>({display:"inline-block",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:on?"#dcfce7":"#fef3c7",color:on?"#166534":"#92400e"}),
  };

  if(!isPro)return(
    <div style={{maxWidth:680,margin:"80px auto",padding:"0 24px",textAlign:"center",fontFamily:"Montserrat,sans-serif"}}>
      <span style={{fontSize:48,display:"block",marginBottom:20}}>🔄</span>
      <h2 style={{fontSize:isMob?24:32,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 12px"}}>AI Cycle Alerts</h2>
      <p style={{fontSize:14,color:C.gray,lineHeight:1.8,margin:"0 auto 32px",maxWidth:480}}>Never lose track of your compound cycles again. Precise on/off phase alerts for every compound in your stack.</p>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,padding:"32px",marginBottom:32,textAlign:"left"}}>
        {[["⏱️","Precise phase tracking","Exact day count for ON and OFF phases"],["🔔","Stop and restart dates","Know exactly when to stop and when to restart each compound"],["🔍",`Autocomplete from ${Math.floor(SUPPLEMENTS.length/10)*10}+ compounds`,"Search your stack directly from our database"],["♾️","Unlimited cycles","Track RAD-140, BPC-157, Ashwagandha, peptides, all at once"]].map(([icon,title,desc])=>(
          <div key={title} style={{display:"flex",gap:14,marginBottom:20}}>
            <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
            <div><p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 3px"}}>{title}</p><p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.5}}>{desc}</p></div>
          </div>
        ))}
      </div>
      <button onClick={onUpgrade} style={{padding:"14px 32px",background:C.ink,color:C.white,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif",width:"100%",maxWidth:340}}>
        Upgrade to Pro - $9.99/month
      </button>
      <p style={{fontSize:11,color:C.gray,marginTop:12}}>Cancel anytime. Full access to all {Math.floor(SUPPLEMENTS.length/10)*10}+ compounds + AI tools.</p>
      <div style={{maxWidth:520,margin:"32px auto 0",textAlign:"left"}}>
        <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>Example - Active cycles</p>
        <div style={{border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,background:C.white}}>
          {[{name:"RAD-140",status:"ON",days:18,left:38,total:56,color:"#22c55e",badge:"ON",badgeBg:"#dcfce7",badgeColor:"#166534",msg:"38 days left in ON phase. Stop on May 29."},
            {name:"Ashwagandha KSM-66",status:"OFF",days:3,left:25,total:28,color:"#f59e0b",badge:"OFF",badgeBg:"#fef3c7",badgeColor:"#92400e",msg:"25 days left in OFF phase. Restart on Apr 16."},
            {name:"BPC-157",status:"ON",days:12,left:16,total:28,color:"#22c55e",badge:"ON",badgeBg:"#dcfce7",badgeColor:"#166534",msg:"16 days left in ON phase. Stop on Apr 7."},
          ].map(r=>(
            <div key={r.name} style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,borderLeft:`4px solid ${r.color}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <span style={{fontWeight:900,fontSize:14,color:C.ink}}>{r.name}</span>
                <span style={{fontSize:10,fontWeight:800,background:r.badgeBg,color:r.badgeColor,padding:"2px 8px",borderRadius:20}}>{r.badge}</span>
              </div>
              <p style={{fontSize:12,color:r.status==="ON"?"#166534":"#92400e",margin:0,fontWeight:600}}>{r.msg}</p>
            </div>
          ))}
          <div style={{padding:"12px 20px",background:"#1f2937",textAlign:"center"}}>
            <p style={{fontSize:11,color:"#6b7280",margin:0,fontStyle:"italic"}}>Unlock Pro to track your cycles</p>
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
        <div style={{background:"#6366f1",padding:"12px 0",marginBottom:0}}>
          <div style={{maxWidth:900,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>🔄</span>
            <span style={{fontSize:11,fontWeight:900,color:"rgba(0,0,0,.65)",letterSpacing:".16em",textTransform:"uppercase"}}>AI Cycle Alerts</span>
            <span style={{marginLeft:"auto",fontSize:10,fontWeight:800,color:"rgba(0,0,0,.5)",background:"rgba(0,0,0,.08)",padding:"3px 8px",letterSpacing:".08em",borderRadius:2}}>PRO</span>
          </div>
        </div>
<div style={{padding:isMob?"32px 16px 80px":"48px 24px 80px"}}><div style={Sp.inner}>
      <h1 style={Sp.h1}>AI Cycle Alerts</h1>
      <p style={Sp.sub}>Track your compound cycles. Get precise alerts for when to start, stop, and restart.</p>

      {cycles.length===0&&!adding&&(
        <div style={{...Sp.card,textAlign:"center",padding:48}}>
          <div style={{fontSize:40,marginBottom:14}}>🔄</div>
          <p style={{fontWeight:700,fontSize:16,marginBottom:8,color:C.ink}}>No cycles tracked yet</p>
          <p style={{color:C.gray,fontSize:14,marginBottom:24}}>Add compounds that need cycling: RAD-140, Ashwagandha, Berberine, BPC-157, peptides.</p>
          <button style={Sp.btnGold} onClick={()=>setAdding(true)}>Add first cycle</button>
        </div>
      )}

      {cycles.map(cycle=>{
        const st=getStatus(cycle);
        return(
          <div key={cycle.id} style={{...Sp.card,borderLeft:`4px solid ${st.isOn?"#22c55e":"#f59e0b"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{fontWeight:900,fontSize:18,color:C.ink}}>{cycle.compound}</span>
                  <span style={Sp.badge(st.isOn)}>{st.isOn?"ON":"OFF"}</span>
                </div>
                <div style={{color:C.gray,fontSize:13,display:"flex",gap:16,flexWrap:"wrap"}}>
                  <span>Started: {new Date(cycle.startDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                  <span>{cycle.onWeeks}w ON / {cycle.offWeeks}w OFF</span>
                  <span>Day {st.daysSince+1}</span>
                </div>
              </div>
              <button onClick={()=>deleteCycle(cycle.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.gray,fontSize:20,lineHeight:1}}>x</button>
            </div>
            <div style={{marginTop:14,padding:"12px 16px",background:st.isOn?"#f0fdf4":"#fffbeb",borderRadius:4}}>
              <p style={{margin:0,fontWeight:700,fontSize:14,color:st.isOn?"#166534":"#92400e"}}>
                {st.isOn
                  ?`${st.daysLeft} day${st.daysLeft!==1?"s":""} left in ON phase. Stop on ${st.nextDate}.`
                  :`${st.daysLeft} day${st.daysLeft!==1?"s":""} left in OFF phase. Restart on ${st.nextDate}.`}
              </p>
            </div>
          </div>
        );
      })}

      {adding&&(
        <div style={{...Sp.card,border:`2px solid ${C.gold}`}}>
          <p style={{fontWeight:900,fontSize:15,margin:"0 0 18px",color:C.ink}}>Add a compound cycle</p>
          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:14,marginBottom:16}}>
            <div style={{gridColumn:isMob?"1":"1 / -1",position:"relative"}}>
              <label style={Sp.label}>COMPOUND NAME</label>
              <input style={Sp.input} value={form.compound} onChange={e=>handleInput(e.target.value)} placeholder="e.g. RAD-140, Ashwagandha..."/>
              {suggest.length>0&&(
                <div style={{position:"absolute",top:"100%",left:0,right:0,background:C.white,border:`1px solid ${C.border}`,borderRadius:4,zIndex:10,boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
                  {suggest.map(s=>(
                    <div key={s.id} onClick={()=>{setForm(f=>({...f,compound:s.name}));setSuggest([]);}} style={{padding:"10px 14px",cursor:"pointer",fontSize:14,fontWeight:600,borderBottom:`1px solid ${C.border}`}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.bg} onMouseLeave={e=>e.currentTarget.style.background=C.white}>{s.name}</div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={Sp.label}>START DATE</label>
              <input type="date" style={Sp.input} value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <label style={Sp.label}>ON (weeks)</label>
                <input type="number" style={Sp.input} value={form.onWeeks} min={1} max={52} onChange={e=>setForm(f=>({...f,onWeeks:e.target.value}))}/>
              </div>
              <div>
                <label style={Sp.label}>OFF (weeks)</label>
                <input type="number" style={Sp.input} value={form.offWeeks} min={0} max={52} onChange={e=>setForm(f=>({...f,offWeeks:e.target.value}))}/>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button style={Sp.btnGold} onClick={addCycle}>Add cycle</button>
            <button style={Sp.btnGhost} onClick={()=>setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {!adding&&cycles.length>0&&(
        <button style={{...Sp.btn,marginTop:8}} onClick={()=>setAdding(true)}>+ Add cycle</button>
      )}

      <div style={{marginTop:36,padding:16,background:"#f9f7f4",borderRadius:4,border:`1px solid ${C.border}`}}>
        <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.7}}>
          <strong>Common cycles:</strong> Ashwagandha (8w on / 4w off), RAD-140 (8w on / 8w off), Berberine (8w on / 4w off), Tongkat Ali (5 days on / 2 days off), BPC-157 (4-6w on / 4w off), Ipamorelin (12w on / 4w off), Fadogia (8w on / 4w off).
        </p>
      </div>
    </div></div>
  </div>
  );
}

// ── STACK OPTIMIZER ───────────────────────────────────────────────────────────
function StackOptimizerScreen({onUpgrade}){
  const {isPro}=useAuth();
  const [logs]=useState(()=>{try{return JSON.parse(localStorage.getItem("evidstack_tracker")||"{}");}catch{return {};}});
  const [stack]=useState(()=>{try{return JSON.parse(localStorage.getItem("evidstack_my_stack")||"[]");}catch{return [];}});
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const isMob=useIsMobile();

  const logEntries=Object.entries(logs).sort(([a],[b])=>new Date(a)-new Date(b)).map(([date,data])=>({date,...data}));

  const analyze=async()=>{
    setLoading(true);setErr("");setResult(null);
    try{
      const res=await fetch("/api/stack-optimizer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({logs:logEntries,stack})});
      const data=await res.json();
      if(data.error){setErr(data.error);return;}
      setResult(data);
    }catch{setErr("Analysis failed. Please try again.");}
    finally{setLoading(false);}
  };

  const Sp={page:{minHeight:"100vh",background:C.bg,padding:isMob?"32px 16px":"48px 24px",fontFamily:"Montserrat,sans-serif"},
    inner:{maxWidth:800,margin:"0 auto"},
    tag:{fontSize:11,fontWeight:700,letterSpacing:".15em",color:C.gold,marginBottom:8,display:"block"},
    h1:{fontSize:isMob?28:36,fontWeight:900,color:C.ink,margin:"0 0 8px"},
    sub:{fontSize:14,color:C.gray,margin:"0 0 36px"},
    card:{background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:isMob?16:24,marginBottom:16},
    btn:{background:C.ink,color:C.white,border:"none",borderRadius:3,padding:"13px 26px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Montserrat,sans-serif"},
    btnGold:{background:C.gold,color:C.ink,border:"none",borderRadius:3,padding:"13px 26px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Montserrat,sans-serif"},
    insType:{positive:{border:"1px solid #bbf7d0",background:"#f0fdf4",color:"#166534"},warning:{border:"1px solid #fde68a",background:"#fffbeb",color:"#92400e"},suggestion:{border:"1px solid #bfdbfe",background:"#eff6ff",color:"#1e40af"}},
  };
  const typeIcon={positive:"✓",warning:"!",suggestion:"+"};

  if(!isPro)return(
    <div style={Sp.page}><div style={{...Sp.inner,textAlign:"center",paddingTop:80}}>
      <div style={{fontSize:48,marginBottom:16}}>📊</div>
      <h2 style={{fontWeight:900,fontSize:24,color:C.ink,marginBottom:8}}>Stack Optimizer is Pro only</h2>
      <p style={{color:C.gray,fontSize:15,marginBottom:28}}>AI analyzes your tracker logs and surfaces real correlations between your supplements, mood, and energy.</p>
      <button style={Sp.btnGold} onClick={onUpgrade}>Upgrade to Pro</button>
    </div></div>
  );

  return(
    <div style={Sp.page}><div style={Sp.inner}>
      <span style={Sp.tag}>PRO FEATURE</span>
      <h1 style={Sp.h1}>Stack Optimizer</h1>
      <p style={Sp.sub}>AI analyzes your tracker logs to detect what is working, what is not, and what to change.</p>

      {logEntries.length<7?(
        <div style={{...Sp.card,textAlign:"center",padding:48}}>
          <div style={{fontSize:48,marginBottom:14}}>📊</div>
          <p style={{fontWeight:700,fontSize:16,color:C.ink,marginBottom:8}}>Need more data</p>
          <p style={{color:C.gray,fontSize:14}}>You have {logEntries.length} day{logEntries.length!==1?"s":""} logged. The optimizer needs at least 7 days to detect patterns. Keep logging in My Tracker.</p>
        </div>
      ):(
        <>
          <div style={{...Sp.card,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
            <div>
              <p style={{fontWeight:900,fontSize:15,margin:"0 0 4px",color:C.ink}}>{logEntries.length} days of data ready for analysis</p>
              <p style={{color:C.gray,fontSize:13,margin:0}}>Stack: {stack.length>0?stack.join(", "):"No stack defined in My Tracker"}</p>
            </div>
            <button style={{...Sp.btn,opacity:loading?0.7:1}} onClick={analyze} disabled={loading}>{loading?"Analyzing...":"Run analysis"}</button>
          </div>
          {err&&<p style={{color:C.red,fontWeight:700,fontSize:14}}>{err}</p>}
        </>
      )}

      {loading&&(
        <div style={{...Sp.card,textAlign:"center",padding:48}}>
          <div style={{fontSize:32,marginBottom:10}}>🧠</div>
          <p style={{fontWeight:700,color:C.ink}}>Analyzing your data...</p>
          <p style={{color:C.gray,fontSize:14}}>Looking for correlations between your supplements and mood/energy scores.</p>
        </div>
      )}

      {result&&(<>
        <div style={{...Sp.card,background:C.ink,color:C.white}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <div>
              <p style={{fontSize:11,letterSpacing:".15em",color:C.gold,margin:"0 0 6px",fontWeight:700}}>OVERALL SCORE</p>
              <p style={{fontSize:15,color:"#d1d5db",margin:0}}>{result.headline}</p>
            </div>
            <div style={{fontSize:56,fontWeight:900,color:C.gold,lineHeight:1}}>{result.overallScore}</div>
          </div>
        </div>

        <h3 style={{fontWeight:900,fontSize:15,color:C.ink,marginBottom:12}}>Insights ({result.insights?.length||0})</h3>
        {result.insights?.map((ins,i)=>(
          <div key={i} style={{...Sp.insType[ins.type]||{},padding:20,borderRadius:4,marginBottom:12}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{fontWeight:900,fontSize:18,lineHeight:1,flexShrink:0}}>{typeIcon[ins.type]||"*"}</span>
              <div>
                <p style={{fontWeight:800,fontSize:14,margin:"0 0 6px"}}>{ins.title}</p>
                <p style={{fontSize:13,margin:"0 0 6px",lineHeight:1.5}}>{ins.detail}</p>
                {ins.compound&&<span style={{fontSize:11,fontWeight:700,background:"rgba(0,0,0,.08)",padding:"2px 8px",borderRadius:10}}>{ins.compound}</span>}
              </div>
            </div>
          </div>
        ))}

        <div style={{...Sp.card,borderTop:`3px solid ${C.ink}`,marginTop:8}}>
          <p style={{fontSize:10,fontWeight:700,letterSpacing:".12em",color:C.gray,margin:"0 0 8px"}}>RECOMMENDATION</p>
          <p style={{fontWeight:700,fontSize:15,color:C.ink,margin:0}}>{result.recommendation}</p>
        </div>
        {result.retestIn&&<p style={{fontSize:12,color:C.gray,textAlign:"center",marginTop:8}}>Suggested re-analysis in: {result.retestIn}</p>}
      </>)}
    </div></div>
  );
}

// ── BLOOD WORK ANALYZER ───────────────────────────────────────────────────────
const BLOOD_MARKERS=[
  {key:"testosterone_total",label:"Total Testosterone",unit:"ng/dL",placeholder:"e.g. 650",ref_low:300,ref_high:1000},
  {key:"testosterone_free",label:"Free Testosterone",unit:"pg/mL",placeholder:"e.g. 12",ref_low:5,ref_high:21},
  {key:"vitamin_d",label:"Vitamin D (25-OH)",unit:"ng/mL",placeholder:"e.g. 35",ref_low:30,ref_high:100},
  {key:"ferritin",label:"Ferritin",unit:"ng/mL",placeholder:"e.g. 80",ref_low:30,ref_high:300},
  {key:"tsh",label:"TSH",unit:"mIU/L",placeholder:"e.g. 2.1",ref_low:0.4,ref_high:4.0},
  {key:"cortisol",label:"Cortisol (morning)",unit:"mcg/dL",placeholder:"e.g. 14",ref_low:6,ref_high:23},
  {key:"dhea_s",label:"DHEA-S",unit:"mcg/dL",placeholder:"e.g. 250",ref_low:70,ref_high:500},
  {key:"igf1",label:"IGF-1",unit:"ng/mL",placeholder:"e.g. 180",ref_low:100,ref_high:300},
  {key:"shbg",label:"SHBG",unit:"nmol/L",placeholder:"e.g. 28",ref_low:10,ref_high:57},
  {key:"estradiol",label:"Estradiol (E2)",unit:"pg/mL",placeholder:"e.g. 22",ref_low:10,ref_high:40},
  {key:"crp",label:"CRP (hs-CRP)",unit:"mg/L",placeholder:"e.g. 0.8",ref_low:0,ref_high:1.0},
  {key:"homocysteine",label:"Homocysteine",unit:"mcmol/L",placeholder:"e.g. 8",ref_low:0,ref_high:10},
  {key:"hba1c",label:"HbA1c",unit:"%",placeholder:"e.g. 5.2",ref_low:0,ref_high:5.7},
  {key:"fasting_glucose",label:"Fasting Glucose",unit:"mg/dL",placeholder:"e.g. 88",ref_low:70,ref_high:99},
  {key:"hdl",label:"HDL Cholesterol",unit:"mg/dL",placeholder:"e.g. 55",ref_low:40,ref_high:300},
  {key:"triglycerides",label:"Triglycerides",unit:"mg/dL",placeholder:"e.g. 90",ref_low:0,ref_high:150},
];

function BloodWorkScreen({onUpgrade}){
  const {isPro,userProfile}=useAuth();
  const [markers,setMarkers]=useState({});
  const [goals,setGoals]=useState([]);
  const [currentStack,setCurrentStack]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [view,setView]=useState("input");
  const [saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem("evidstack_bloodwork")||"[]");}catch{return [];}});
  const isMob=useIsMobile();

  const GOAL_OPTIONS=["Testosterone optimization","Fat loss","Muscle gain","Longevity","Cognitive performance","Energy","Sleep quality","Inflammation reduction"];
  const statusStyle={LOW:{color:"#b45309",background:"#fffbeb",border:"1px solid #fde68a"},HIGH:{color:"#991b1b",background:"#fef2f2",border:"1px solid #fecaca"},OPTIMAL:{color:"#166534",background:"#f0fdf4",border:"1px solid #bbf7d0"}};
  const priorityColor={1:"#dc2626",2:"#f59e0b",3:"#3b82f6"};

  const getStatus=(key,val)=>{
    if(val===""||val===undefined)return null;
    const m=BLOOD_MARKERS.find(bm=>bm.key===key);if(!m)return null;
    const n=parseFloat(val);
    return n<m.ref_low?"LOW":n>m.ref_high?"HIGH":"OPTIMAL";
  };
  const filledCount=Object.values(markers).filter(v=>v!==""&&v!==undefined).length;

  const analyze=async()=>{
    if(filledCount<2){setErr("Please enter at least 2 blood markers.");return;}
    setLoading(true);setErr("");setResult(null);
    try{
      const stackArr=currentStack.split(",").map(s=>s.trim()).filter(Boolean);
      const res=await fetch("/api/bloodwork-analyzer",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({markers,goals,currentStack:stackArr,userProfile:userProfile||null})});
      const data=await res.json();
      if(data.error){setErr(data.error);return;}
      setResult(data);setView("result");
      const ns=[{id:Date.now(),date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),result:data},...saved].slice(0,5);
      setSaved(ns);localStorage.setItem("evidstack_bloodwork",JSON.stringify(ns));
    }catch{setErr("Analysis failed. Please try again.");}
    finally{setLoading(false);}
  };

  const Sp={page:{minHeight:"100vh",background:C.bg,padding:isMob?"32px 16px":"48px 24px",fontFamily:"Montserrat,sans-serif"},
    inner:{maxWidth:900,margin:"0 auto"},
    tag:{fontSize:11,fontWeight:700,letterSpacing:".15em",color:C.gold,marginBottom:8,display:"block"},
    h1:{fontSize:isMob?28:36,fontWeight:900,color:C.ink,margin:"0 0 8px"},
    sub:{fontSize:14,color:C.gray,margin:"0 0 32px"},
    card:{background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:isMob?16:24,marginBottom:16},
    btn:{background:C.ink,color:C.white,border:"none",borderRadius:3,padding:"13px 26px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Montserrat,sans-serif"},
    btnGold:{background:C.gold,color:C.ink,border:"none",borderRadius:3,padding:"13px 26px",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"Montserrat,sans-serif"},
    btnOutline:(active)=>({background:"transparent",color:active?C.ink:C.gray,border:active?`2px solid ${C.ink}`:`1px solid ${C.border}`,borderRadius:3,padding:"9px 18px",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}),
    input:{width:"100%",padding:"10px 14px",border:`1px solid ${C.border}`,borderRadius:3,fontSize:14,fontFamily:"Montserrat,sans-serif",background:C.white,boxSizing:"border-box"},
    label:{fontSize:10,fontWeight:700,letterSpacing:".1em",color:C.gray,marginBottom:5,display:"block"},
  };

  if(!isPro)return(
    <div style={{maxWidth:680,margin:"80px auto",padding:"0 24px",textAlign:"center",fontFamily:"Montserrat,sans-serif"}}>
      <span style={{fontSize:48,display:"block",marginBottom:20}}>🩸</span>
      <h2 style={{fontSize:isMob?24:32,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 12px"}}>AI Bloodwork Analyzer</h2>
      <p style={{fontSize:14,color:C.gray,lineHeight:1.8,margin:"0 auto 32px",maxWidth:480}}>Enter your blood test results and get evidence-based supplement recommendations personalized to your actual biology.</p>
      <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,padding:"32px",marginBottom:32,textAlign:"left"}}>
        {[["🧬","16 biomarkers analyzed","Testosterone, Vitamin D, cortisol, IGF-1, CRP, and more"],["⚡","Instant flag detection","LOW/HIGH markers flagged with clinical context and urgency"],["💊","Ranked recommendations","Compounds ranked by priority, with exact doses and timing"],["🚫","What to avoid","Identifies compounds that could worsen your specific results"],["📁","History of 5 analyses","Compare your bloodwork evolution over time"]].map(([icon,title,desc])=>(
          <div key={title} style={{display:"flex",gap:14,marginBottom:20}}>
            <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
            <div><p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 3px"}}>{title}</p><p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.5}}>{desc}</p></div>
          </div>
        ))}
      </div>
      <button onClick={onUpgrade} style={{padding:"14px 32px",background:C.ink,color:C.white,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",letterSpacing:".04em",fontFamily:"Montserrat,sans-serif",width:"100%",maxWidth:340}}>
        Upgrade to Pro - $9.99/month
      </button>
      <p style={{fontSize:11,color:C.gray,marginTop:12}}>Cancel anytime. Full access to all {Math.floor(SUPPLEMENTS.length/10)*10}+ compounds + AI tools.</p>
      <div style={{maxWidth:520,margin:"32px auto 0",textAlign:"left"}}>
        <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>Example - Analysis output</p>
        <div style={{border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,background:C.white}}>
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.ink}}>
            <span style={{fontSize:12,color:"#9ca3af"}}>Optimization score</span>
            <span style={{fontSize:28,fontWeight:900,color:C.gold}}>62</span>
          </div>
          {[{marker:"Vitamin D",val:"18 ng/mL",st:"LOW",color:"#b45309",bg:"#fffbeb",note:"Suppresses testosterone production and immune function"},
            {marker:"hs-CRP",val:"2.4 mg/L",st:"HIGH",color:"#991b1b",bg:"#fef2f2",note:"Low-grade systemic inflammation detected"},
            {marker:"Total Testosterone",val:"620 ng/dL",st:"OPTIMAL",color:"#166534",bg:"#f0fdf4",note:"In range, no intervention needed"},
          ].map(r=>(
            <div key={r.marker} style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,borderLeft:`4px solid ${r.color}`,background:r.bg}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:800,color:C.ink}}>{r.marker}</span>
                <span style={{fontSize:10,fontWeight:800,color:r.color}}>{r.st} - {r.val}</span>
              </div>
              <p style={{fontSize:11,color:r.color,margin:0}}>{r.note}</p>
            </div>
          ))}
          <div style={{padding:"12px 20px",background:"#1f2937",textAlign:"center"}}>
            <p style={{fontSize:11,color:"#6b7280",margin:0,fontStyle:"italic"}}>Unlock Pro to analyze your blood work</p>
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
        <div style={{background:"#10b981",padding:"12px 0",marginBottom:0}}>
          <div style={{maxWidth:900,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>🩸</span>
            <span style={{fontSize:11,fontWeight:900,color:"rgba(0,0,0,.65)",letterSpacing:".16em",textTransform:"uppercase"}}>AI Bloodwork Analyzer</span>
            <span style={{marginLeft:"auto",fontSize:10,fontWeight:800,color:"rgba(0,0,0,.5)",background:"rgba(0,0,0,.08)",padding:"3px 8px",letterSpacing:".08em",borderRadius:2}}>PRO</span>
          </div>
        </div>
<div style={{padding:isMob?"32px 16px 80px":"48px 24px 80px"}}><div style={Sp.inner}>
      <h1 style={Sp.h1}>AI Bloodwork Analyzer</h1>
      <p style={Sp.sub}>Enter your blood test results and get supplement recommendations based on your actual biology.</p>

      <div style={{display:"flex",gap:8,marginBottom:28,flexWrap:"wrap"}}>
        {["input","history"].map(tab=>(
          <button key={tab} onClick={()=>setView(tab)} style={Sp.btnOutline(view===tab)}>
            {tab==="input"?"New analysis":`History (${saved.length})`}
          </button>
        ))}
        {result&&<button onClick={()=>setView("result")} style={{...Sp.btnOutline(view==="result"),borderColor:C.gold,color:C.gold}}>Latest result</button>}
      </div>

      {view==="history"&&(
        saved.length===0?(
          <div style={{...Sp.card,textAlign:"center",padding:48}}><p style={{color:C.gray}}>No past analyses yet.</p></div>
        ):(
          saved.map(sr=>(
            <div key={sr.id} style={{...Sp.card,cursor:"pointer"}} onClick={()=>{setResult(sr.result);setView("result");}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{fontWeight:800,fontSize:15,margin:"0 0 4px",color:C.ink}}>{sr.date}</p>
                  <p style={{color:C.gray,fontSize:13,margin:0}}>{sr.result.summary?.slice(0,90)}...</p>
                </div>
                <span style={{fontSize:28,fontWeight:900,color:C.gold}}>{sr.result.priorityScore}</span>
              </div>
            </div>
          ))
        )
      )}

      {view==="input"&&(<>
        <div style={Sp.card}>
          <p style={{fontWeight:900,fontSize:14,margin:"0 0 18px",color:C.ink}}>1. Enter your blood markers ({filledCount} entered)</p>
          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
            {BLOOD_MARKERS.map(bm=>{
              const val=markers[bm.key]||"";const st=getStatus(bm.key,val);
              return(
                <div key={bm.key}>
                  <label style={Sp.label}>{bm.label.toUpperCase()}</label>
                  <div style={{position:"relative"}}>
                    <input type="number" step="0.1" style={{...Sp.input,paddingRight:52,...(st?statusStyle[st]:{}),fontSize:12}} value={val} placeholder={bm.placeholder} onChange={e=>setMarkers(m=>({...m,[bm.key]:e.target.value}))}/>
                    <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:9,color:C.gray,pointerEvents:"none"}}>{bm.unit}</span>
                  </div>
                  {st&&<span style={{fontSize:9,fontWeight:700,color:statusStyle[st].color}}>{st}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={Sp.card}>
          <p style={{fontWeight:900,fontSize:14,margin:"0 0 14px",color:C.ink}}>2. Your goals</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {GOAL_OPTIONS.map(g=>(
              <button key={g} onClick={()=>setGoals(prev=>prev.includes(g)?prev.filter(x=>x!==g):[...prev,g])} style={{padding:"7px 12px",borderRadius:3,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",border:goals.includes(g)?`2px solid ${C.ink}`:`1px solid ${C.border}`,background:goals.includes(g)?C.ink:C.white,color:goals.includes(g)?C.white:C.ink}}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div style={Sp.card}>
          <p style={{fontWeight:900,fontSize:14,margin:"0 0 10px",color:C.ink}}>3. Current supplements (optional)</p>
          <input style={Sp.input} value={currentStack} onChange={e=>setCurrentStack(e.target.value)} placeholder="e.g. Creatine, Vitamin D, Omega-3..."/>
        </div>

        {err&&<p style={{color:C.red,fontWeight:700,fontSize:14,marginBottom:16}}>{err}</p>}
        <button style={{...Sp.btn,opacity:loading?0.7:1}} onClick={analyze} disabled={loading}>
          {loading?"Analyzing blood work...":"Analyze blood work"}
        </button>
        <p style={{fontSize:11,color:C.gray,marginTop:10}}>Your data is never stored on our servers. Analysis runs in your session only.</p>
      </>)}

      {view==="result"&&result&&(<>
        <div style={{...Sp.card,background:C.ink,color:C.white,marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
            <div style={{flex:1}}>
              <p style={{fontSize:11,letterSpacing:".15em",color:C.gold,margin:"0 0 8px",fontWeight:700}}>ANALYSIS SUMMARY</p>
              <p style={{fontSize:14,color:"#d1d5db",margin:"0 0 8px",lineHeight:1.5}}>{result.summary}</p>
              {result.retestIn&&<p style={{fontSize:12,color:C.gray,margin:0}}>Recommended retest: {result.retestIn}</p>}
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:52,fontWeight:900,color:C.gold,lineHeight:1}}>{result.priorityScore}</div>
              <div style={{fontSize:9,color:C.gray,letterSpacing:".1em"}}>OPTIMIZATION SCORE</div>
            </div>
          </div>
        </div>

        {result.flags?.length>0&&(<>
          <h3 style={{fontWeight:900,fontSize:14,color:C.ink,marginBottom:12}}>Markers flagged ({result.flags.length})</h3>
          <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:12,marginBottom:20}}>
            {result.flags.map((flag,i)=>(
              <div key={i} style={{...Sp.card,marginBottom:0,borderLeft:`4px solid ${flag.urgency==="high"?"#ef4444":"#f59e0b"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontWeight:800,fontSize:13,color:C.ink}}>{flag.marker}</span>
                  <span style={{fontSize:10,fontWeight:700,...statusStyle[flag.status]||{},padding:"2px 8px",borderRadius:3}}>{flag.status} {flag.value}</span>
                </div>
                <p style={{fontSize:13,color:C.ink,margin:0,lineHeight:1.5}}>{flag.impact}</p>
              </div>
            ))}
          </div>
        </>)}

        {result.recommendations?.length>0&&(<>
          <h3 style={{fontWeight:900,fontSize:14,color:C.ink,marginBottom:12}}>Recommendations</h3>
          {result.recommendations.map((rec,i)=>(
            <div key={i} style={{...Sp.card,borderLeft:`4px solid ${priorityColor[rec.priority]||C.border}`}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
                <div style={{fontWeight:900,fontSize:22,color:priorityColor[rec.priority]||C.gray,minWidth:28}}>#{rec.priority}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}>
                    <span style={{fontWeight:900,fontSize:15,color:C.ink}}>{rec.compound}</span>
                    {rec.alreadyTaking&&<span style={{fontSize:9,background:"#dcfce7",color:"#166534",fontWeight:700,padding:"2px 8px",borderRadius:10}}>Already taking</span>}
                  </div>
                  <div style={{display:"flex",gap:16,marginBottom:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,color:C.gray}}><strong>Dose:</strong> {rec.dose}</span>
                    <span style={{fontSize:12,color:C.gray}}><strong>Timing:</strong> {rec.timing}</span>
                  </div>
                  <p style={{fontSize:13,color:C.ink,margin:0,lineHeight:1.5}}>{rec.rationale}</p>
                </div>
              </div>
            </div>
          ))}
        </>)}

        {result.avoid?.length>0&&(<>
          <h3 style={{fontWeight:900,fontSize:14,color:C.ink,margin:"20px 0 12px"}}>What to avoid</h3>
          {result.avoid.map((av,i)=>(
            <div key={i} style={{...Sp.card,background:"#fef2f2",border:"1px solid #fecaca"}}>
              <span style={{fontWeight:800,color:"#991b1b",fontSize:14}}>{av.compound}</span>
              <p style={{fontSize:13,color:"#7f1d1d",margin:"6px 0 0",lineHeight:1.5}}>{av.reason}</p>
            </div>
          ))}
        </>)}

        <p style={{fontSize:11,color:C.gray,marginTop:20,lineHeight:1.6,padding:"12px 16px",background:"#f9f7f4",borderRadius:4}}>{result.disclaimer}</p>
        <button style={{...Sp.btnOutline(false),marginTop:14}} onClick={()=>setView("input")}>Run new analysis</button>
      </>)}
    </div></div>
  </div>
  );
}

// ── PRICING PAGE ─────────────────────────────────────────────────────────────
// ── COMPOUND ADVISOR ─────────────────────────────────────────────────────────
function CompoundAdvisorScreen({onUpgrade}){
  const {isPro,user,userProfile}=useAuth();
  const isMob=useIsMobile();
  const [query,setQuery]=useState("");
  const [history,setHistory]=useState([]);
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [revealedCount,setRevealedCount]=useState(0);
  const [phase,setPhase]=useState("idle");
  const inputRef=useRef(null);

  // Free query tracking - 1 free query per session (localStorage)
  const FREE_KEY="evidstack_advisor_used";
  const [freeUsed,setFreeUsed]=useState(()=>!!localStorage.getItem(FREE_KEY));
  const [showUpgradeWall,setShowUpgradeWall]=useState(false);

  const tierColor=(t)=>["",C.green,C.blue,C.purple,C.amber][t]||C.gray;
  const tierLabel=(t)=>["","T1","T2","T3","T4"][t]||"T?";

  const SCANNING_LINES=[
    "Parsing query intent...",
    `Searching ${Math.floor(SUPPLEMENTS.length/10)*10}+ compounds...`,
    "Cross-referencing PubMed meta-analyses...",
    "Scoring efficacy and evidence quality...",
    "Checking compound interactions...",
    "Ranking by combined score...",
    "Generating protocol suggestion...",
  ];
  const [scanLine,setScanLine]=useState(0);

  useEffect(()=>{
    if(phase!=="scanning")return;
    const iv=setInterval(()=>setScanLine(l=>l<SCANNING_LINES.length-1?l+1:l),420);
    return()=>clearInterval(iv);
  },[phase]);

  // Cascade-reveal compounds one by one after response
  useEffect(()=>{
    if(phase!=="revealing"||!result?.compounds)return;
    if(revealedCount>=result.compounds.length){setPhase("done");return;}
    const t=setTimeout(()=>setRevealedCount(n=>n+1),180);
    return()=>clearTimeout(t);
  },[phase,revealedCount,result]);

  const submit=async(overrideQuery)=>{
    const q=(overrideQuery||query).trim();
    if(!q||loading)return;
    // Block if free user already used their 1 query
    if(!isPro&&freeUsed){setShowUpgradeWall(true);return;}
    setLoading(true);setErr("");setResult(null);setRevealedCount(0);setPhase("scanning");setScanLine(0);setShowUpgradeWall(false);
    const newHistory=[...history,{role:"user",content:q}];
    try{
      const res=await fetch("/api/symptom-advisor",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({query:q,conversationHistory:history,userProfile:userProfile||null}),
      });
      const data=await res.json();
      if(data.error){setErr(data.error);setPhase("idle");return;}
      setResult(data);
      setHistory([...newHistory,{role:"assistant",content:JSON.stringify(data)}]);
      setPhase("revealing");
      // Mark free query as used for non-pro users
      if(!isPro){localStorage.setItem(FREE_KEY,"1");setFreeUsed(true);}
    }catch{
      setErr("Analysis failed. Please try again.");
      setPhase("idle");
    }finally{
      setLoading(false);
      setQuery("");
    }
  };

  const reset=()=>{setResult(null);setHistory([]);setQuery("");setPhase("idle");setRevealedCount(0);setScanLine(0);setErr("");setShowUpgradeWall(false);};

  const SUGGESTIONS=["Best compounds for skin quality and collagen","Compounds affecting facial fat distribution","Hair retention stack: DHT, finasteride alternatives","What compounds improve bone density and IGF-1","Best peptide stack for skin and recovery","Best compounds for testosterone optimization","I want to improve my sleep quality","I'm looking to maximize muscle recovery"];

  const S={
    page:{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"},
    inner:{maxWidth:860,margin:"0 auto",padding:isMob?"32px 16px 80px":"56px 32px 100px"},
    tag:{fontSize:11,fontWeight:700,letterSpacing:".15em",color:C.gold,marginBottom:8,display:"block"},
    h1:{fontSize:isMob?28:40,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 10px"},
    sub:{fontSize:14,color:C.gray,margin:"0 0 36px",lineHeight:1.6,maxWidth:520},
    inputRow:{display:"flex",gap:0,border:`2px solid ${C.ink}`,background:C.white,marginBottom:12},
    textarea:{flex:1,padding:"16px 18px",border:"none",fontSize:14,fontFamily:"Montserrat,sans-serif",resize:"none",outline:"none",background:"transparent",color:C.ink,minHeight:64,lineHeight:1.5},
    sendBtn:{padding:"0 24px",background:C.ink,color:C.white,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",flexShrink:0,minWidth:80},
    chip:{padding:"8px 14px",border:`1px solid ${C.border}`,background:C.white,fontSize:11,fontWeight:600,cursor:"pointer",color:C.gray,fontFamily:"Montserrat,sans-serif",transition:"all .15s"},
  };

  return(
    <div style={S.page}>
      <style>{`
        @keyframes advisorFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes advisorSlideIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
        @keyframes advisorPulse{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes advisorScan{0%{width:0%}100%{width:100%}}
        @keyframes advisorScoreGrow{from{width:0}to{width:var(--w)}}
        @keyframes advisorBlink{0%,100%{opacity:1}50%{opacity:0}}
        .adv-slide{animation:advisorSlideIn .3s ease both}
        .adv-pulse{animation:advisorPulse 1.4s ease-in-out infinite}
        .adv-score-bar{animation:advisorScoreGrow .8s cubic-bezier(.22,1,.36,1) both}
      `}</style>

        <div style={{background:"#e2c97e",padding:"12px 0",marginBottom:0}}>
          <div style={{maxWidth:900,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>🔭</span>
            <span style={{fontSize:11,fontWeight:900,color:"rgba(0,0,0,.65)",letterSpacing:".16em",textTransform:"uppercase"}}>AI Compound Advisor</span>
            <span style={{marginLeft:"auto",fontSize:10,fontWeight:800,color:"rgba(0,0,0,.5)",background:"rgba(0,0,0,.08)",padding:"3px 8px",letterSpacing:".08em",borderRadius:2}}>PRO</span>
          </div>
        </div>
      <div style={S.inner}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:8}}>
          <h1 style={{...S.h1,margin:0}}>AI Compound Advisor</h1>
          {!isPro&&(
            <div style={{display:"flex",alignItems:"center",gap:8,background:freeUsed?"#fef3c7":"#f0fdf4",border:`1px solid ${freeUsed?"#fde68a":"#bbf7d0"}`,padding:"6px 12px",flexShrink:0}}>
              <span style={{fontSize:12,fontWeight:800,color:freeUsed?"#92400e":"#166534"}}>{freeUsed?"0 / 1 free queries used":"1 free query available"}</span>
              {freeUsed&&<button onClick={onUpgrade} style={{background:C.gold,color:C.ink,border:"none",fontSize:11,fontWeight:800,padding:"4px 10px",cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Go Pro</button>}
            </div>
          )}
          {isPro&&<span style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gold,border:`1px solid ${C.gold}`,padding:"4px 10px"}}>PRO</span>}
        </div>
        <p style={S.sub}>Describe any goal: performance, cognition, skin quality, hair, hormones, aesthetics, longevity. The advisor searches {Math.floor(SUPPLEMENTS.length/10)*10}+ compounds and returns the strongest evidence-based options, ranked by efficacy and study quality.{!isPro&&!freeUsed?" Try 1 query free, no account needed.":""}</p>
        {userProfile&&userProfile.weightKg&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:`${C.gold}12`,border:`1px solid ${C.gold}40`,marginBottom:16,fontSize:11,fontWeight:700,color:"#92400e",maxWidth:S.inner.maxWidth}}>
          <span style={{fontSize:14}}>🎯</span>
          Dosages calibrated to your profile: {userProfile.weightKg}kg{userProfile.age?`, ${userProfile.age}yo`:""}{userProfile.sex?`, ${userProfile.sex}`:""}
        </div>}

        {/* Upgrade wall - shown after free query used */}
        {!isPro&&freeUsed&&phase==="idle"&&!result&&(
          <div style={{border:`2px solid ${C.ink}`,background:C.white,padding:isMob?"24px 20px":"36px 40px",marginBottom:28,textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:14}}>🔭</div>
            <h2 style={{fontSize:isMob?20:26,fontWeight:900,color:C.ink,margin:"0 0 10px",letterSpacing:"-.03em"}}>You have used your free query.</h2>
            <p style={{fontSize:14,color:C.gray,margin:"0 auto 28px",maxWidth:460,lineHeight:1.7}}>Upgrade to Pro for unlimited queries, follow-up conversations, synergy detection, and protocol suggestions.</p>
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:12,maxWidth:480,margin:"0 auto 28px",textAlign:"left"}}>
              {[["💬","Unlimited queries","Ask about anything, anytime"],["🔗","Synergy detection","See which compounds stack"],["📈","Protocol suggestions","Step-by-step intro plan"],["🧠","Conversation memory","Follow-up questions in context"]].map(([icon,title,desc])=>(
                <div key={title} style={{display:"flex",gap:10,padding:"12px 14px",background:C.bg,border:`1px solid ${C.border}`}}>
                  <span style={{fontSize:18,flexShrink:0}}>{icon}</span>
                  <div><p style={{fontSize:12,fontWeight:800,color:C.ink,margin:"0 0 2px"}}>{title}</p><p style={{fontSize:11,color:C.gray,margin:0}}>{desc}</p></div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={onUpgrade} style={{padding:"13px 32px",background:C.ink,color:C.white,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
                Unlock Pro - $9.99/month
              </button>
              <button onClick={onUpgrade} style={{padding:"13px 22px",background:"transparent",color:C.gray,border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>
                Save 34% annually
              </button>
            </div>
            <p style={{fontSize:11,color:C.gray,marginTop:12}}>Cancel anytime. Instant access.</p>
          </div>
        )}

        {/* Input - hidden after free query used for non-pro */}
        {(!freeUsed||isPro||phase!=="idle"||result)&&(
          <div style={{marginBottom:28}}>
            {/* Textarea + Send row */}
            <div style={S.inputRow}>
              <textarea
                ref={inputRef}
                style={S.textarea}
                rows={2}
                value={query}
                onChange={e=>setQuery(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}}
                placeholder="e.g. I want better sleep quality without feeling groggy..."
                disabled={loading}
              />
              <button style={{...S.sendBtn,opacity:loading||!query.trim()?0.4:1}} onClick={()=>submit()} disabled={loading||!query.trim()}>
                {loading?"...":"Send"}
              </button>
            </div>
          </div>
        )}

        {/* Suggestions - only show when idle and no result */}
        {phase==="idle"&&!result&&(
          <div className="adv-card" style={{marginBottom:36}}>
            <p style={{fontSize:10,fontWeight:700,letterSpacing:".14em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>Try asking about</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {SUGGESTIONS.map(s=>(
                <button key={s} className="chip" style={S.chip} onClick={()=>submit(s)}
                  onMouseEnter={e=>Object.assign(e.currentTarget.style,{background:C.ink,color:C.white,borderColor:C.ink})}
                  onMouseLeave={e=>Object.assign(e.currentTarget.style,{background:C.white,color:C.gray,borderColor:C.border})}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scanning animation */}
        {phase==="scanning"&&(
          <div className="adv-card" style={{background:C.ink,padding:"32px",marginBottom:24}}>
            {/* Scan bar */}
            <div style={{height:2,background:"#1f2937",marginBottom:28,overflow:"hidden"}}>
              <div style={{height:"100%",background:C.gold,animation:"advisorScan 2.4s ease-in-out infinite"}}/>
            </div>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{flexShrink:0,marginTop:2}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:C.gold,animation:"advisorBlink 1s ease-in-out infinite"}}/>
              </div>
              <div style={{flex:1}}>
                {SCANNING_LINES.map((line,i)=>(
                  <div key={line} style={{
                    fontSize:12,fontWeight:i===scanLine?700:500,
                    color:i<scanLine?"#374151":i===scanLine?C.gold:"#1f2937",
                    marginBottom:6,
                    transition:"all .3s",
                    ...(i===scanLine?{letterSpacing:".02em"}:{})
                  }}>
                    {i<scanLine?"✓ ":i===scanLine?"→ ":"  "}{line}
                  </div>
                ))}
              </div>
              <div style={{fontSize:11,color:"#374151",fontWeight:700,textAlign:"right",flexShrink:0}}>
                <span className="adv-pulse">Analyzing</span>
              </div>
            </div>
          </div>
        )}

        {err&&<p style={{color:C.red,fontWeight:700,fontSize:14,marginBottom:20}}>{err}</p>}

        {/* Clarification */}
        {result?.clarify&&(
          <div className="adv-card" style={{border:`2px solid ${C.ink}`,padding:"24px",marginBottom:24}}>
            <p style={{fontSize:11,fontWeight:800,letterSpacing:".12em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>One question first</p>
            <p style={{fontSize:15,fontWeight:700,color:C.ink,margin:"0 0 20px"}}>{result.clarify}</p>
            <div style={{display:"flex",gap:0,border:`1.5px solid ${C.ink}`,background:C.white}}>
              <input style={{flex:1,padding:"11px 14px",border:"none",fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none"}} placeholder="Your answer..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
              <button style={{...S.sendBtn,minWidth:64}} onClick={()=>submit()}>Go</button>
            </div>
          </div>
        )}

        {/* Results */}
        {(phase==="revealing"||phase==="done")&&result?.compounds?.length>0&&(
          <>
            {/* Intent header */}
            <div className="adv-card" style={{borderLeft:`4px solid ${C.ink}`,paddingLeft:16,marginBottom:28}}>
              <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 4px",textTransform:"uppercase"}}>Analysis</p>
              <p style={{fontSize:15,fontWeight:700,color:C.ink,margin:0}}>{result.intent}</p>
            </div>

            {/* Compound cards */}
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:28}}>
              {result.compounds.slice(0,revealedCount).map((c,i)=>{
                const tc=tierColor(c.tier);
                const scoreMax=25;
                const scorePct=Math.round((c.combined_score/scoreMax)*100);
                return(
                  <div key={c.name} className="adv-card" style={{background:C.white,border:`1px solid ${C.border}`,borderLeft:`4px solid ${tc}`,animationDelay:`${i*0.05}s`,overflow:"hidden"}}>
                    {/* Top row */}
                    <div style={{padding:isMob?"14px 14px 10px":"18px 24px 12px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:11,fontWeight:900,color:C.white,background:tc,padding:"2px 8px",letterSpacing:".06em",flexShrink:0}}>{tierLabel(c.tier)}</span>
                          <span style={{fontSize:isMob?15:17,fontWeight:900,color:C.ink,letterSpacing:"-.02em"}}>{c.name}</span>
                          <span style={{fontSize:10,fontWeight:700,color:C.gray,flexShrink:0}}>#{c.rank}</span>
                        </div>
                        <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.5}}>{c.goal_match}</p>
                      </div>
                      {/* Combined score badge */}
                      <div style={{textAlign:"center",flexShrink:0}}>
                        <div style={{fontSize:26,fontWeight:900,color:tc,lineHeight:1}}>{c.combined_score}</div>
                        <div style={{fontSize:8,color:C.gray,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase"}}>Score</div>
                      </div>
                    </div>

                    {/* Score bars */}
                    <div style={{padding:isMob?"0 14px 12px":"0 24px 14px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                      {[["Efficacy",c.efficacy],["Evidence",c.evidence]].map(([label,val])=>(
                        <div key={label}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:9,fontWeight:700,color:C.gray,letterSpacing:".1em",textTransform:"uppercase"}}>{label}</span>
                            <span style={{fontSize:10,fontWeight:800,color:C.ink}}>{val}/5</span>
                          </div>
                          <div style={{height:4,background:C.bg,borderRadius:2,overflow:"hidden"}}>
                            <div className="adv-score-bar" style={{"--w":`${val*20}%`,height:"100%",background:tc,borderRadius:2,animationDelay:`${i*0.05+0.2}s`}}/>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom row - dose, timing, studies, synergy */}
                    <div style={{borderTop:`1px solid ${C.border}`,padding:isMob?"10px 14px":"10px 24px",display:"flex",gap:isMob?12:24,flexWrap:"wrap",alignItems:"center"}}>
                      {c.dose&&<span style={{fontSize:11,color:C.ink}}><strong>Dose:</strong> {c.dose}</span>}
                      {c.timing&&<span style={{fontSize:11,color:C.ink}}><strong>When:</strong> {c.timing}</span>}
                      {c.study_count&&<span style={{fontSize:11,color:C.gray}}>{c.study_count}+ studies ({c.study_type})</span>}
                      {c.synergy?.length>0&&(
                        <span style={{fontSize:10,background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",padding:"2px 8px",fontWeight:700,borderRadius:2}}>
                          Synergizes: {c.synergy.join(", ")}
                        </span>
                      )}
                      {c.conflict?.length>0&&(
                        <span style={{fontSize:10,background:"#fef2f2",color:"#991b1b",border:"1px solid #fecaca",padding:"2px 8px",fontWeight:700,borderRadius:2}}>
                          Separate from: {c.conflict.join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Synergy note + Stack suggestion */}
            {phase==="done"&&(<>
              {result.synergy_note&&(
                <div className="adv-slide" style={{background:C.ink,color:C.white,padding:"20px 24px",marginBottom:12}}>
                  <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gold,margin:"0 0 8px",textTransform:"uppercase"}}>Synergy and Interactions</p>
                  <p style={{fontSize:13,color:"#d1d5db",margin:0,lineHeight:1.6}}>{result.synergy_note}</p>
                </div>
              )}
              {result.stack_suggestion&&(
                <div className="adv-slide" style={{border:`1.5px solid ${C.ink}`,padding:"20px 24px",marginBottom:12,animationDelay:".1s"}}>
                  <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 8px",textTransform:"uppercase"}}>Suggested Protocol</p>
                  <p style={{fontSize:13,color:C.ink,margin:0,lineHeight:1.6}}>{result.stack_suggestion}</p>
                </div>
              )}
              {result.disclaimer&&(
                <p style={{fontSize:11,color:C.gray,margin:"0 0 24px",lineHeight:1.5,padding:"10px 14px",background:"#f9f7f4",borderRadius:2}}>{result.disclaimer}</p>
              )}

              {/* Follow-up input */}
              <div style={{marginTop:8}}>
                {isPro?(
                  <>
                    <p style={{fontSize:11,fontWeight:700,color:C.gray,margin:"0 0 10px",letterSpacing:".06em"}}>FOLLOW UP</p>
                    <div style={{...S.inputRow,marginBottom:16}}>
                      <textarea style={S.textarea} rows={1} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}} placeholder="Ask a follow-up question..." disabled={loading}/>
                      <button style={{...S.sendBtn,opacity:loading||!query.trim()?0.4:1}} onClick={()=>submit()} disabled={loading||!query.trim()}>Send</button>
                    </div>
                    <button onClick={reset} style={{fontSize:12,color:C.gray,background:"none",border:"none",cursor:"pointer",fontFamily:"Montserrat,sans-serif",padding:0}}>Start new search</button>
                  </>
                ):(
                  <div style={{borderTop:`1px solid ${C.border}`,paddingTop:20,marginTop:8,textAlign:"center"}}>
                    <p style={{fontSize:13,fontWeight:700,color:C.ink,margin:"0 0 6px"}}>Want to ask a follow-up?</p>
                    <p style={{fontSize:12,color:C.gray,margin:"0 0 16px"}}>Pro members get unlimited queries and full conversation memory.</p>
                    <button onClick={onUpgrade} style={{padding:"11px 28px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
                      Unlock Pro - $9.99/mo
                    </button>
                    <p style={{fontSize:11,color:C.gray,marginTop:8}}>Or save 34% with the annual plan.</p>
                  </div>
                )}
              </div>
            </>)}
          </>
        )}
      </div>
    </div>
  );
}

// ── INTERACTION CHECKER ───────────────────────────────────────────────────────
function InteractionCheckerPro({onUpgrade}){
  const {isPro,userProfile}=useAuth();
  const isMob=useIsMobile();
  const [input,setInput]=useState("");
  const [compounds,setCompounds]=useState([]);
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [phase,setPhase]=useState("idle");
  const [revealIdx,setRevealIdx]=useState(0);

  useEffect(()=>{
    if(phase!=="revealing"||!result?.interactions)return;
    if(revealIdx>=result.interactions.length){setPhase("done");return;}
    const t=setTimeout(()=>setRevealIdx(n=>n+1),150);
    return()=>clearTimeout(t);
  },[phase,revealIdx,result]);

  const addCompound=()=>{
    const v=input.trim();
    if(!v||compounds.includes(v))return;
    setCompounds(c=>[...c,v]);
    setInput("");
  };

  const removeCompound=(c)=>setCompounds(cs=>cs.filter(x=>x!==c));

  const analyze=async()=>{
    if(compounds.length<2){setErr("Add at least 2 compounds.");return;}
    setLoading(true);setErr("");setResult(null);setRevealIdx(0);setPhase("scanning");
    try{
      const res=await fetch("/api/interaction-checker",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({compounds})});
      const data=await res.json();
      if(data.error){setErr(data.error);setPhase("idle");return;}
      setResult(data);setPhase("revealing");
    }catch{setErr("Analysis failed.");setPhase("idle");}
    finally{setLoading(false);}
  };

  const reset=()=>{setResult(null);setCompounds([]);setInput("");setPhase("idle");setRevealIdx(0);setErr("");};

  const severityColor=(s)=>({positive:"#16a34a",minor:"#ca8a04",moderate:"#d97706",major:"#dc2626"})[s]||C.gray;
  const severityBg=(s)=>({positive:"#f0fdf4",minor:"#fefce8",moderate:"#fff7ed",major:"#fef2f2"})[s]||C.bg;
  const verdictColor=(v)=>({SAFE:"#16a34a",CAUTION:"#d97706",DANGER:"#dc2626"})[v]||C.gray;

  if(!isPro)return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:isMob?"60px 16px":"80px 32px",textAlign:"center"}}>
        <span style={{fontSize:52,display:"block",marginBottom:20}}>⚗️</span>
        <h2 style={{fontSize:isMob?24:36,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 12px"}}>Interaction Checker</h2>
        <p style={{fontSize:14,color:C.gray,lineHeight:1.8,margin:"0 auto 32px",maxWidth:480}}>Enter your full stack and get a complete interaction analysis: absorption conflicts, timing clashes, synergies, and safety flags, all in one report.</p>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,padding:"32px",marginBottom:32,textAlign:"left",maxWidth:500,margin:"0 auto 32px"}}>
          {[["⚠️","Safety flags","Major and moderate interaction warnings with severity scores"],["⚡","Synergy detection","Find which compounds amplify each other"],["⏱️","Timing protocol","Exact daily schedule to avoid absorption competition"],["🔬","Full pair analysis","Every compound pair assessed individually"]].map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex",gap:14,marginBottom:20}}>
              <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
              <div><p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 3px"}}>{title}</p><p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.5}}>{desc}</p></div>
            </div>
          ))}
        </div>
        <button onClick={onUpgrade} style={{padding:"14px 32px",background:C.ink,color:C.white,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Unlock Pro - $9.99/month</button>
        <p style={{fontSize:11,color:C.gray,marginTop:12}}>Cancel anytime. Full access to all tools.</p>
        <div style={{maxWidth:520,margin:"32px auto 0",textAlign:"left"}}>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>Example - Interaction report</p>
          <div style={{border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,background:C.white}}>
            <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,background:"#16a34a",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,fontWeight:800,color:C.white}}>SAFE - Safe to stack</span>
              <span style={{fontSize:20}}>✅</span>
            </div>
            {[{pair:"Creatine + Beta-Alanine",sev:"positive",sevColor:"#16a34a",sevBg:"#f0fdf4",desc:"Synergistic: both enhance ATP resynthesis and buffer lactic acid. Stack freely."},
              {pair:"Zinc + Iron",sev:"moderate",sevColor:"#d97706",sevBg:"#fff7ed",desc:"Absorption competition at shared intestinal transporter. Separate by minimum 2 hours."},
              {pair:"Caffeine + L-Theanine",sev:"positive",sevColor:"#16a34a",sevBg:"#f0fdf4",desc:"Classic synergy - theanine blunts caffeine jitteriness while preserving focus enhancement."},
            ].map(r=>(
              <div key={r.pair} style={{padding:"11px 18px",borderBottom:`1px solid ${C.border}`,borderLeft:`4px solid ${r.sevColor}`,background:r.sevBg}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,flexWrap:"wrap",gap:4}}>
                  <span style={{fontSize:12,fontWeight:800,color:C.ink}}>{r.pair}</span>
                  <span style={{fontSize:10,fontWeight:800,color:r.sevColor,textTransform:"uppercase"}}>{r.sev}</span>
                </div>
                <p style={{fontSize:11,color:"#374151",margin:0,lineHeight:1.4}}>{r.desc}</p>
              </div>
            ))}
            <div style={{padding:"10px 18px",background:"#1f2937",textAlign:"center"}}>
              <p style={{fontSize:11,color:"#6b7280",margin:0,fontStyle:"italic"}}>Unlock Pro to analyze your full stack</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
      <style>{`
        @keyframes icFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes icScan{0%{width:0%}100%{width:100%}}
        .ic-card{animation:icFadeIn .35s ease both}
      `}</style>
        <div style={{background:"#3b82f6",padding:"12px 0",marginBottom:0}}>
          <div style={{maxWidth:900,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>⚗️</span>
            <span style={{fontSize:11,fontWeight:900,color:"rgba(0,0,0,.65)",letterSpacing:".16em",textTransform:"uppercase"}}>Interaction Checker</span>
            <span style={{marginLeft:"auto",fontSize:10,fontWeight:800,color:"rgba(0,0,0,.5)",background:"rgba(0,0,0,.08)",padding:"3px 8px",letterSpacing:".08em",borderRadius:2}}>PRO</span>
          </div>
        </div>
      <div style={{maxWidth:800,margin:"0 auto",padding:isMob?"32px 16px 80px":"56px 32px 100px"}}>
        <h1 style={{fontSize:isMob?28:40,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 8px"}}>Interaction Checker</h1>
        <p style={{fontSize:14,color:C.gray,margin:"0 0 28px",lineHeight:1.6}}>Examine.com and ConsumerLab stop at the data. Evidstack tells you what to do with it. Add your compounds, get severity-rated interactions, synergy detection, and an exact daily timing protocol.</p>

        {/* Input */}
        <div style={{display:"flex",gap:0,border:`2px solid ${C.ink}`,background:C.white,marginBottom:12}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addCompound();}}
            placeholder="Type a compound name and press Enter..."
            style={{flex:1,padding:"14px 16px",border:"none",fontSize:14,fontFamily:"Montserrat,sans-serif",outline:"none",background:"transparent",color:C.ink}}/>
          <button onClick={addCompound} style={{padding:"0 20px",background:C.ink,color:C.white,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",flexShrink:0}}>Add</button>
        </div>

        {/* Compound chips */}
        {compounds.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:20}}>
            {compounds.map(c=>(
              <div key={c} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",background:C.ink,color:C.white,fontSize:12,fontWeight:700}}>
                {c}
                <button onClick={()=>removeCompound(c)} style={{background:"none",border:"none",color:"#9ca3af",cursor:"pointer",fontSize:14,padding:0,lineHeight:1}}>x</button>
              </div>
            ))}
          </div>
        )}

        {err&&<p style={{fontSize:13,color:C.red,fontWeight:700,margin:"0 0 16px"}}>{err}</p>}

        <div style={{display:"flex",gap:10,marginBottom:28}}>
          <button onClick={analyze} disabled={loading||compounds.length<2} style={{padding:"12px 28px",background:compounds.length>=2?C.gold:C.border,color:C.ink,border:"none",fontSize:13,fontWeight:800,cursor:compounds.length>=2?"pointer":"default",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
            {loading?"Analyzing...":"Analyze Stack"}
          </button>
          {result&&<button onClick={reset} style={{padding:"12px 20px",background:"transparent",border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.gray,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Start over</button>}
        </div>

        {/* Scanning */}
        {phase==="scanning"&&(
          <div className="ic-card" style={{background:C.ink,padding:"28px 24px",marginBottom:20}}>
            <div style={{height:2,background:"#1f2937",marginBottom:20,overflow:"hidden"}}>
              <div style={{height:"100%",background:C.gold,animation:"icScan 1.8s ease-in-out infinite"}}/>
            </div>
            <p style={{fontSize:12,color:C.gold,fontWeight:700,margin:0,letterSpacing:".08em"}}>SCANNING {compounds.length} COMPOUNDS FOR INTERACTIONS...</p>
          </div>
        )}

        {/* Results */}
        {result&&(
          <div className="ic-card">
            {/* Verdict banner */}
            <div style={{background:verdictColor(result.overall_verdict),padding:"20px 24px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
              <div>
                <p style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,.7)",letterSpacing:".14em",margin:"0 0 4px",textTransform:"uppercase"}}>Overall Verdict</p>
                <p style={{fontSize:22,fontWeight:900,color:C.white,margin:0,letterSpacing:"-.02em"}}>{result.overall_verdict} - {result.safe_to_stack?"Safe to stack":"Do not stack as-is"}</p>
              </div>
              <span style={{fontSize:40}}>{result.overall_verdict==="SAFE"?"✅":result.overall_verdict==="CAUTION"?"⚠️":"🚫"}</span>
            </div>
            <div style={{background:C.white,border:`1px solid ${C.border}`,padding:"16px 20px",marginBottom:20}}>
              <p style={{fontSize:13,color:C.gray,margin:0,lineHeight:1.7}}>{result.overall_summary}</p>
            </div>

            {/* Individual interactions */}
            <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 12px",textTransform:"uppercase"}}>Interaction Analysis</p>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
              {result.interactions?.slice(0,revealIdx).map((ix,i)=>(
                <div key={i} className="ic-card" style={{background:severityBg(ix.severity),border:`1px solid ${severityColor(ix.severity)}40`,borderLeft:`4px solid ${severityColor(ix.severity)}`,padding:"14px 18px",animationDelay:`${i*.05}s`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:6,flexWrap:"wrap"}}>
                    <p style={{fontSize:13,fontWeight:800,color:C.ink,margin:0}}>{ix.compounds?.join(" + ")}</p>
                    <span style={{fontSize:10,fontWeight:800,color:severityColor(ix.severity),background:`${severityColor(ix.severity)}15`,padding:"3px 8px",letterSpacing:".08em",textTransform:"uppercase",flexShrink:0,borderRadius:2}}>{ix.severity}</span>
                  </div>
                  <p style={{fontSize:12,color:C.gray,margin:"0 0 6px",lineHeight:1.5}}>{ix.description}</p>
                  {ix.recommendation&&<p style={{fontSize:12,fontWeight:700,color:C.ink,margin:0}}>→ {ix.recommendation}</p>}
                </div>
              ))}
            </div>

            {/* Timing protocol */}
            {phase==="done"&&result.timing_protocol&&(
              <div className="ic-card" style={{background:C.ink,padding:"20px 24px",marginBottom:16}}>
                <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gold,margin:"0 0 10px",textTransform:"uppercase"}}>Optimized Timing Protocol</p>
                <p style={{fontSize:13,color:"#d1d5db",margin:0,lineHeight:1.7}}>{result.timing_protocol}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── STACK AUDIT AI ────────────────────────────────────────────────────────────
function StackAuditScreen({onUpgrade}){
  const {isPro,userProfile}=useAuth();
  const isMob=useIsMobile();
  const [stack,setStack]=useState("");
  const [goals,setGoals]=useState("");
  const [budget,setBudget]=useState("100");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const [phase,setPhase]=useState("idle");

  const audit=async()=>{
    if(!stack.trim()){setErr("Describe your current stack first.");return;}
    setLoading(true);setErr("");setResult(null);setPhase("scanning");
    try{
      const res=await fetch("/api/stack-audit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({stack,goals,budget,userProfile:userProfile||null})});
      const data=await res.json();
      if(data.error){setErr(data.error);setPhase("idle");return;}
      setResult(data);setPhase("done");
    }catch{setErr("Audit failed.");setPhase("idle");}
    finally{setLoading(false);}
  };

  const reset=()=>{setResult(null);setStack("");setGoals("");setBudget("100");setPhase("idle");setErr("");};

  const verdictColor=(v)=>({KEEP:"#16a34a",OPTIMIZE:"#ca8a04",REPLACE:"#d97706",REMOVE:"#dc2626"})[v]||C.gray;
  const gradeColor=(g)=>({"A":"#16a34a","B":"#22c55e","C":"#ca8a04","D":"#d97706","F":"#dc2626"})[g]||C.gray;

  if(!isPro)return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:isMob?"60px 16px":"80px 32px",textAlign:"center"}}>
        <span style={{fontSize:52,display:"block",marginBottom:20}}>🎯</span>
        <h2 style={{fontSize:isMob?24:36,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 12px"}}>Stack Audit AI</h2>
        <p style={{fontSize:14,color:C.gray,lineHeight:1.8,margin:"0 auto 32px",maxWidth:480}}>Paste your current stack and get a complete audit: redundancies, critical gaps, timing fixes, cost-to-benefit analysis, and a Stack Score from 0 to 100.</p>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,padding:"32px",marginBottom:32,textAlign:"left",maxWidth:500,margin:"0 auto 32px"}}>
          {[["📊","Stack Score","Your stack graded 0-100 with letter grade"],["🗑️","Redundancy detection","Find what is doubling up and wasting money"],["🔍","Gap analysis","What is missing for your specific goals"],["💡","Priority changes","Top 3 changes to make immediately"]].map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex",gap:14,marginBottom:20}}>
              <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
              <div><p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 3px"}}>{title}</p><p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.5}}>{desc}</p></div>
            </div>
          ))}
        </div>
        <button onClick={onUpgrade} style={{padding:"14px 32px",background:C.ink,color:C.white,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Unlock Pro - $9.99/month</button>
        <p style={{fontSize:11,color:C.gray,marginTop:12}}>Cancel anytime. Full access to all tools.</p>
        <div style={{maxWidth:520,margin:"32px auto 0",textAlign:"left"}}>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>Example - Stack audit</p>
          <div style={{border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,background:C.white}}>
            <div style={{padding:"16px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:16,background:C.ink}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:36,fontWeight:900,color:"#22c55e",lineHeight:1}}>B</div>
                <div style={{fontSize:9,color:"#6b7280",fontWeight:700,letterSpacing:".08em"}}>GRADE</div>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:22,fontWeight:900,color:C.white}}>74</span>
                  <span style={{fontSize:11,color:"#9ca3af"}}>/100 Stack Score</span>
                </div>
                <p style={{fontSize:11,color:"#9ca3af",margin:0}}>Solid foundation. 2 redundancies found, 1 critical gap for stated goals.</p>
              </div>
            </div>
            {[{name:"Creatine",verdict:"KEEP",score:95,color:"#16a34a",reason:"Best-evidenced performance compound. Dose correct."},
              {name:"Magnesium Oxide",verdict:"REPLACE",score:40,color:"#d97706",reason:"Poor bioavailability (~4%). Switch to bisglycinate or malate."},
              {name:"Vitamin C + Zinc",verdict:"OPTIMIZE",score:65,color:"#ca8a04",reason:"Timing conflict - high-dose vitamin C reduces zinc absorption. Separate by 2h."},
            ].map(r=>(
              <div key={r.name} style={{padding:"10px 18px",borderBottom:`1px solid ${C.border}`,borderLeft:`4px solid ${r.color}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                    <span style={{fontSize:12,fontWeight:800,color:C.ink}}>{r.name}</span>
                    <span style={{fontSize:9,fontWeight:800,color:r.color,padding:"1px 5px",background:`${r.color}15`,borderRadius:2}}>{r.verdict}</span>
                  </div>
                  <p style={{fontSize:11,color:C.gray,margin:0}}>{r.reason}</p>
                </div>
                <span style={{fontSize:15,fontWeight:900,color:r.color,flexShrink:0}}>{r.score}</span>
              </div>
            ))}
            <div style={{padding:"10px 18px",background:"#1f2937",textAlign:"center"}}>
              <p style={{fontSize:11,color:"#6b7280",margin:0,fontStyle:"italic"}}>Unlock Pro to audit your stack</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
      <style>{`@keyframes auditFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.audit-card{animation:auditFade .4s ease both}`}</style>
        <div style={{background:"#8b5cf6",padding:"12px 0",marginBottom:0}}>
          <div style={{maxWidth:900,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>🎯</span>
            <span style={{fontSize:11,fontWeight:900,color:"rgba(0,0,0,.65)",letterSpacing:".16em",textTransform:"uppercase"}}>Stack Audit AI</span>
            <span style={{marginLeft:"auto",fontSize:10,fontWeight:800,color:"rgba(0,0,0,.5)",background:"rgba(0,0,0,.08)",padding:"3px 8px",letterSpacing:".08em",borderRadius:2}}>PRO</span>
          </div>
        </div>
      <div style={{maxWidth:800,margin:"0 auto",padding:isMob?"32px 16px 80px":"56px 32px 100px"}}>
        <h1 style={{fontSize:isMob?28:40,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 8px"}}>Stack Audit AI</h1>
        <p style={{fontSize:14,color:C.gray,margin:"0 0 4px",lineHeight:1.6}}>Paste your current stack. Get a complete audit: redundancies, gaps, timing conflicts, and a Stack Score 0-100 with grade.</p>
        <p style={{fontSize:12,color:C.gray,margin:"0 0 28px",lineHeight:1.5,fontStyle:"italic"}}>Unlike static databases, dosage recommendations are calibrated to your body weight and profile.</p>

        {!result&&(
          <div>
            <div style={{marginBottom:16}}>
              <p style={{fontSize:11,fontWeight:700,color:C.gray,margin:"0 0 8px",letterSpacing:".08em",textTransform:"uppercase"}}>Your current stack *</p>
              <textarea value={stack} onChange={e=>setStack(e.target.value)}
                placeholder="e.g. Creatine 5g, Magnesium glycinate 400mg, Vitamin D3 4000IU, Ashwagandha 600mg, Caffeine 200mg, L-Theanine 400mg, Omega-3 2g..."
                style={{width:"100%",padding:"14px 16px",border:`2px solid ${C.ink}`,fontSize:13,fontFamily:"Montserrat,sans-serif",resize:"vertical",outline:"none",background:C.white,color:C.ink,minHeight:100,boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:12,marginBottom:20}}>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:C.gray,margin:"0 0 8px",letterSpacing:".08em",textTransform:"uppercase"}}>Your goals</p>
                <input value={goals} onChange={e=>setGoals(e.target.value)} placeholder="e.g. muscle gain, sleep, focus, longevity..."
                  style={{width:"100%",padding:"12px 14px",border:`1px solid ${C.border}`,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",background:C.white,color:C.ink,boxSizing:"border-box"}}/>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:C.gray,margin:"0 0 8px",letterSpacing:".08em",textTransform:"uppercase"}}>Monthly budget ($)</p>
                <input value={budget} onChange={e=>setBudget(e.target.value)} placeholder="100"
                  style={{width:"100%",padding:"12px 14px",border:`1px solid ${C.border}`,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",background:C.white,color:C.ink,boxSizing:"border-box"}}/>
              </div>
            </div>
            {err&&<p style={{fontSize:13,color:C.red,fontWeight:700,margin:"0 0 12px"}}>{err}</p>}
            <button onClick={audit} disabled={loading||!stack.trim()} style={{padding:"13px 32px",background:stack.trim()?C.gold:C.border,color:C.ink,border:"none",fontSize:14,fontWeight:800,cursor:stack.trim()?"pointer":"default",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>
              {loading?"Auditing...":"Audit My Stack"}
            </button>
          </div>
        )}

        {phase==="scanning"&&(
          <div className="audit-card" style={{background:C.ink,padding:"28px 24px",marginTop:24}}>
            <div style={{height:2,background:"#1f2937",marginBottom:20,overflow:"hidden"}}>
              <div style={{height:"100%",background:C.gold,animation:"icScan 2s ease-in-out infinite"}}/>
            </div>
            <p style={{fontSize:12,color:C.gold,fontWeight:700,margin:0,letterSpacing:".08em"}}>AUDITING YOUR STACK...</p>
          </div>
        )}

        {result&&(
          <div>
            {/* Score */}
            <div className="audit-card" style={{display:"flex",gap:isMob?16:32,alignItems:"center",background:C.white,border:`1px solid ${C.border}`,borderTop:`4px solid ${gradeColor(result.grade)}`,padding:isMob?"20px":"28px 32px",marginBottom:20,flexWrap:"wrap"}}>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:isMob?52:68,fontWeight:900,color:gradeColor(result.grade),lineHeight:1}}>{result.grade}</div>
                <div style={{fontSize:11,color:C.gray,fontWeight:700,letterSpacing:".08em"}}>GRADE</div>
              </div>
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                  <span style={{fontSize:28,fontWeight:900,color:C.ink}}>{result.stack_score}</span>
                  <span style={{fontSize:13,color:C.gray,fontWeight:600}}>/100 Stack Score</span>
                </div>
                <div style={{height:8,background:C.bg,borderRadius:4,overflow:"hidden",marginBottom:10}}>
                  <div style={{height:"100%",background:gradeColor(result.grade),width:`${result.stack_score}%`,transition:"width 1s ease",borderRadius:4}}/>
                </div>
                <p style={{fontSize:13,color:C.gray,margin:0,lineHeight:1.6}}>{result.summary}</p>
              </div>
            </div>

            {/* Priority changes */}
            {result.priority_changes?.length>0&&(
              <div className="audit-card" style={{background:C.ink,padding:"20px 24px",marginBottom:16}}>
                <p style={{fontSize:10,fontWeight:800,color:C.gold,letterSpacing:".14em",margin:"0 0 12px",textTransform:"uppercase"}}>Top Priority Changes</p>
                {result.priority_changes.map((c,i)=>(
                  <div key={i} style={{display:"flex",gap:12,marginBottom:i<result.priority_changes.length-1?10:0,alignItems:"flex-start"}}>
                    <span style={{fontSize:13,fontWeight:900,color:C.gold,flexShrink:0,marginTop:1}}>#{i+1}</span>
                    <p style={{fontSize:13,color:"#d1d5db",margin:0,lineHeight:1.5}}>{c}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Per-compound verdicts */}
            {result.compounds_analyzed?.length>0&&(
              <div className="audit-card" style={{marginBottom:16}}>
                <p style={{fontSize:10,fontWeight:800,color:C.gray,letterSpacing:".14em",margin:"0 0 12px",textTransform:"uppercase"}}>Compound-by-Compound Verdict</p>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {result.compounds_analyzed.map((c,i)=>(
                    <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderLeft:`4px solid ${verdictColor(c.verdict)}`,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <span style={{fontSize:13,fontWeight:800,color:C.ink}}>{c.name}</span>
                          <span style={{fontSize:10,fontWeight:800,color:verdictColor(c.verdict),padding:"2px 6px",background:`${verdictColor(c.verdict)}15`,letterSpacing:".06em",borderRadius:2}}>{c.verdict}</span>
                        </div>
                        <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.4}}>{c.reason}</p>
                        {c.optimization&&<p style={{fontSize:12,fontWeight:700,color:C.ink,margin:"4px 0 0"}}>→ {c.optimization}</p>}
                      </div>
                      <div style={{textAlign:"center",flexShrink:0}}>
                        <div style={{fontSize:18,fontWeight:900,color:verdictColor(c.verdict)}}>{c.score}</div>
                        <div style={{fontSize:9,color:C.gray,fontWeight:700}}>SCORE</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Redundancies & Gaps */}
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:12,marginBottom:16}}>
              {result.redundancies?.length>0&&(
                <div className="audit-card" style={{background:"#fef2f2",border:"1px solid #fecaca",padding:"16px 18px"}}>
                  <p style={{fontSize:10,fontWeight:800,color:"#991b1b",letterSpacing:".12em",margin:"0 0 10px",textTransform:"uppercase"}}>Redundancies</p>
                  {result.redundancies.map((r,i)=><p key={i} style={{fontSize:12,color:"#7f1d1d",margin:i>0?"6px 0 0":0,lineHeight:1.5}}>• {r}</p>)}
                </div>
              )}
              {result.critical_gaps?.length>0&&(
                <div className="audit-card" style={{background:"#f0fdf4",border:"1px solid #bbf7d0",padding:"16px 18px"}}>
                  <p style={{fontSize:10,fontWeight:800,color:"#166534",letterSpacing:".12em",margin:"0 0 10px",textTransform:"uppercase"}}>Critical Gaps</p>
                  {result.critical_gaps.map((g,i)=><p key={i} style={{fontSize:12,color:"#14532d",margin:i>0?"6px 0 0":0,lineHeight:1.5}}>+ {g}</p>)}
                </div>
              )}
            </div>

            {/* Optimized stack */}
            {result.optimized_stack&&(
              <div className="audit-card" style={{border:`1.5px solid ${C.ink}`,padding:"20px 24px",marginBottom:16}}>
                <p style={{fontSize:10,fontWeight:800,color:C.gray,letterSpacing:".14em",margin:"0 0 10px",textTransform:"uppercase"}}>Recommended Stack</p>
                <p style={{fontSize:13,color:C.ink,margin:0,lineHeight:1.7}}>{result.optimized_stack}</p>
              </div>
            )}

            <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",marginTop:8}}>
              <button onClick={reset} style={{fontSize:12,color:C.gray,background:"none",border:"none",cursor:"pointer",fontFamily:"Montserrat,sans-serif",padding:0}}>Audit a different stack</button>
              <button onClick={()=>{
                const printContent=`
                  <html><head><title>Stack Audit - Evidstack</title>
                  <style>body{font-family:Helvetica,sans-serif;padding:32px;color:#1a1a1a;max-width:700px;margin:0 auto;}
                  h1{font-size:28px;font-weight:900;margin:0 0 4px;}
                  .score{font-size:48px;font-weight:900;color:#16a34a;}
                  .label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.1em;}
                  .compound{padding:12px 0;border-bottom:1px solid #d4d0c8;}
                  .verdict{display:inline-block;padding:2px 8px;font-size:10px;font-weight:800;border-radius:2px;}
                  .KEEP{background:#f0fdf4;color:#166534;} .OPTIMIZE{background:#fefce8;color:#92400e;}
                  .REPLACE{background:#fff7ed;color:#92400e;} .REMOVE{background:#fef2f2;color:#991b1b;}
                  .section{margin:24px 0;} .gray{color:#6b7280;font-size:13px;line-height:1.6;}
                  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #d4d0c8;font-size:11px;color:#9ca3af;}</style></head>
                  <body>
                  <p class="label">Evidstack Pro - Stack Audit</p>
                  <h1>${result.stack_name||"Stack Audit"}</h1>
                  <div style="display:flex;align-items:center;gap:24px;margin:16px 0;padding:20px;background:#f9f7f4;border-left:4px solid #e2c97e;">
                    <div><div class="score">${result.grade}</div><div class="label">Grade</div></div>
                    <div><div style="font-size:32px;font-weight:900;">${result.stack_score}</div><div class="label">Stack Score / 100</div></div>
                    <div style="flex:1;"><p class="gray">${result.summary||""}</p></div>
                  </div>
                  <div class="section">
                    <p class="label" style="margin-bottom:12px;">Priority Changes</p>
                    ${(result.priority_changes||[]).map((c,i)=>`<p style="margin:6px 0;"><strong>#${i+1}</strong> ${c}</p>`).join("")}
                  </div>
                  <div class="section">
                    <p class="label" style="margin-bottom:12px;">Compound Analysis</p>
                    ${(result.compounds_analyzed||[]).map(c=>`<div class="compound"><strong>${c.name}</strong> <span class="verdict ${c.verdict}">${c.verdict}</span> <span style="float:right;font-weight:900;">${c.score}/100</span><p class="gray" style="margin:4px 0 0;">${c.reason}${c.optimization?` → ${c.optimization}`:""}</p></div>`).join("")}
                  </div>
                  ${result.optimized_stack?`<div class="section"><p class="label" style="margin-bottom:8px;">Recommended Stack</p><p class="gray">${result.optimized_stack}</p></div>`:""}
                  <div class="footer">Generated by Evidstack.com | Evidence-Based Supplementation | ${new Date().toLocaleDateString()}</div>
                  </body></html>`;
                const w=window.open("","_blank");
                w.document.write(printContent);
                w.document.close();
                w.focus();
                w.print();
              }} style={{fontSize:12,color:C.ink,background:"transparent",border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:"Montserrat,sans-serif",padding:"6px 14px",fontWeight:700}}>
                Export PDF 📄
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── BLOODWORK HISTORY TRACKER ─────────────────────────────────────────────────
function BloodworkHistoryScreen({onUpgrade}){
  const {isPro,user}=useAuth();
  const isMob=useIsMobile();
  const STORAGE_KEY=`evidstack_bw_${user?.uid||"guest"}`;

  const MARKERS=[
    {id:"testosterone_total",label:"Testosterone Total",unit:"ng/dL",normal:[300,900],warn_low:250,warn_high:1200},
    {id:"testosterone_free",label:"Testosterone Free",unit:"pg/mL",normal:[8,25],warn_low:5,warn_high:40},
    {id:"lh",label:"LH",unit:"mIU/mL",normal:[1.7,8.6],warn_low:1,warn_high:15},
    {id:"fsh",label:"FSH",unit:"mIU/mL",normal:[1.5,12.4],warn_low:1,warn_high:20},
    {id:"estradiol",label:"Estradiol (E2)",unit:"pg/mL",normal:[10,40],warn_low:8,warn_high:60},
    {id:"shbg",label:"SHBG",unit:"nmol/L",normal:[10,57],warn_low:8,warn_high:80},
    {id:"igf1",label:"IGF-1",unit:"ng/mL",normal:[100,300],warn_low:80,warn_high:400},
    {id:"alt",label:"ALT",unit:"U/L",normal:[7,56],warn_low:0,warn_high:80},
    {id:"ast",label:"AST",unit:"U/L",normal:[10,40],warn_low:0,warn_high:60},
    {id:"hdl",label:"HDL Cholesterol",unit:"mg/dL",normal:[40,100],warn_low:35,warn_high:150},
    {id:"ldl",label:"LDL Cholesterol",unit:"mg/dL",normal:[0,130],warn_low:0,warn_high:160},
    {id:"hematocrit",label:"Hematocrit",unit:"%",normal:[38,50],warn_low:35,warn_high:55},
    {id:"psa",label:"PSA",unit:"ng/mL",normal:[0,4],warn_low:0,warn_high:6},
    {id:"creatinine",label:"Creatinine",unit:"mg/dL",normal:[0.7,1.2],warn_low:0.5,warn_high:1.5},
    {id:"rbc",label:"RBC",unit:"M/uL",normal:[4.5,5.9],warn_low:4.0,warn_high:6.5},
    {id:"cortisol",label:"Cortisol (AM)",unit:"mcg/dL",normal:[6,23],warn_low:4,warn_high:30},
  ];

  const [entries,setEntries]=useState(()=>{
    try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch{return[];}
  });
  const [showForm,setShowForm]=useState(false);
  const [date,setDate]=useState(new Date().toISOString().split("T")[0]);
  const [note,setNote]=useState("");
  const [values,setValues]=useState({});
  const [selectedMarker,setSelectedMarker]=useState("testosterone_total");

  const saveEntry=()=>{
    const entry={id:Date.now(),date,note,values:{...values}};
    const updated=[...entries,entry].sort((a,b)=>new Date(a.date)-new Date(b.date));
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(updated));
    setShowForm(false);setValues({});setNote("");setDate(new Date().toISOString().split("T")[0]);
  };

  const deleteEntry=(id)=>{
    const updated=entries.filter(e=>e.id!==id);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(updated));
  };

  const marker=MARKERS.find(m=>m.id===selectedMarker);
  const markerHistory=entries.map(e=>({date:e.date,val:parseFloat(e.values[selectedMarker])||null})).filter(e=>e.val!==null);

  const statusColor=(val,m)=>{
    if(!val||!m)return C.gray;
    if(val<m.warn_low||val>m.warn_high)return"#dc2626";
    if(val<m.normal[0]||val>m.normal[1])return"#d97706";
    return"#16a34a";
  };

  if(!isPro)return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:isMob?"60px 16px":"80px 32px",textAlign:"center"}}>
        <span style={{fontSize:52,display:"block",marginBottom:20}}>🩸</span>
        <h2 style={{fontSize:isMob?24:36,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 12px"}}>Bloodwork History</h2>
        <p style={{fontSize:14,color:C.gray,lineHeight:1.8,margin:"0 auto 32px",maxWidth:480}}>Track 16 biomarkers over time. See how your testosterone, liver enzymes, lipids, and hematocrit evolve as you change your stack.</p>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,padding:"32px",marginBottom:32,textAlign:"left",maxWidth:500,margin:"0 auto 32px"}}>
          {[["📈","Longitudinal tracking","Enter labs every 3 months, see every trend over time"],["16","Biomarkers","Testosterone, LH, FSH, E2, SHBG, IGF-1, ALT, AST, HDL, LDL, hematocrit, and more"],["🟡","Normal range overlay","Each value color-coded against clinical reference ranges"],["🔗","Stack correlation","Add notes to each entry to correlate with stack changes"]].map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex",gap:14,marginBottom:20}}>
              <span style={{fontSize:20,flexShrink:0,fontWeight:900}}>{icon}</span>
              <div><p style={{fontSize:13,fontWeight:800,color:C.ink,margin:"0 0 3px"}}>{title}</p><p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.5}}>{desc}</p></div>
            </div>
          ))}
        </div>
        <button onClick={onUpgrade} style={{padding:"14px 32px",background:C.ink,color:C.white,border:"none",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Unlock Pro - $9.99/month</button>
        <p style={{fontSize:11,color:C.gray,marginTop:12}}>Cancel anytime. Full access to all tools.</p>
        <div style={{maxWidth:520,margin:"32px auto 0",textAlign:"left"}}>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".14em",color:C.gray,margin:"0 0 10px",textTransform:"uppercase"}}>Example - Bloodwork history</p>
          <div style={{border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,background:C.white}}>
            <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.ink}}>
              <span style={{fontSize:12,color:"#9ca3af"}}>Testosterone Total (ng/dL)</span>
              <span style={{fontSize:10,color:"#4ade80",fontWeight:700}}>TRENDING UP</span>
            </div>
            <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`}}>
              <svg viewBox="0 0 200 60" style={{width:"100%",height:60}}>
                <rect x="0" y="15" width="200" height="25" fill="#16a34a" opacity=".08"/>
                <polyline points="10,42 50,35 90,28 130,20 170,16" fill="none" stroke="#16a34a" strokeWidth="2"/>
                {[{cx:10,cy:42},{cx:50,cy:35},{cx:90,cy:28},{cx:130,cy:20},{cx:170,cy:16}].map((p,i)=>(
                  <circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#16a34a"/>
                ))}
                <text x="0" y="58" fontSize="7" fill="#6b7280">Jan</text>
                <text x="40" y="58" fontSize="7" fill="#6b7280">Apr</text>
                <text x="80" y="58" fontSize="7" fill="#6b7280">Jul</text>
                <text x="120" y="58" fontSize="7" fill="#6b7280">Oct</text>
                <text x="158" y="58" fontSize="7" fill="#6b7280">Jan</text>
              </svg>
            </div>
            {[{date:"Jan 2024",val:"412",status:"CAUTION",color:"#d97706",note:"Below optimal range"},
              {date:"Jul 2024",val:"578",status:"NORMAL",color:"#16a34a",note:"Within range"},
              {date:"Jan 2025",val:"689",status:"OPTIMAL",color:"#16a34a",note:"Stack change: added Tongkat Ali"},
            ].map(r=>(
              <div key={r.date} style={{padding:"9px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <span style={{fontSize:12,fontWeight:700,color:C.ink}}>{r.date}</span>
                  <p style={{fontSize:10,color:C.gray,margin:0}}>{r.note}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:900,color:r.color}}>{r.val}</div>
                  <div style={{fontSize:9,fontWeight:700,color:r.color}}>{r.status}</div>
                </div>
              </div>
            ))}
            <div style={{padding:"10px 18px",background:"#1f2937",textAlign:"center"}}>
              <p style={{fontSize:11,color:"#6b7280",margin:0,fontStyle:"italic"}}>Unlock Pro to track your biomarkers over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
        <div style={{background:"#ef4444",padding:"12px 0",marginBottom:0}}>
          <div style={{maxWidth:900,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:18}}>🩸</span>
            <span style={{fontSize:11,fontWeight:900,color:"rgba(0,0,0,.65)",letterSpacing:".16em",textTransform:"uppercase"}}>Bloodwork History</span>
            <span style={{marginLeft:"auto",fontSize:10,fontWeight:800,color:"rgba(0,0,0,.5)",background:"rgba(0,0,0,.08)",padding:"3px 8px",letterSpacing:".08em",borderRadius:2}}>PRO</span>
          </div>
        </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:isMob?"32px 16px 80px":"56px 32px 100px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16,marginBottom:28}}>
          <div>
            <h1 style={{fontSize:isMob?28:40,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 6px"}}>Bloodwork History</h1>
            <p style={{fontSize:14,color:C.gray,margin:"0 0 3px"}}>The only supplement tool that connects your blood labs to your stack. Track 16 biomarkers over time and see the actual biological effect of every protocol change.</p>
            <p style={{fontSize:12,color:C.gray,margin:0,fontStyle:"italic"}}>{entries.length} entr{entries.length===1?"y":"ies"} logged.</p>
          </div>
          <div style={{display:"flex",gap:10,flexShrink:0,flexWrap:"wrap"}}>
            {entries.length>0&&<button onClick={()=>{
              const printContent=`<html><head><title>Bloodwork History - Evidstack</title>
              <style>body{font-family:Helvetica,sans-serif;padding:32px;color:#1a1a1a;max-width:700px;margin:0 auto;}
              h1{font-size:28px;font-weight:900;margin:0 0 4px;}
              .label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.1em;}
              table{width:100%;border-collapse:collapse;margin:16px 0;}
              th{background:#1a1a1a;color:white;padding:8px 12px;font-size:11px;text-align:left;}
              td{padding:8px 12px;border-bottom:1px solid #d4d0c8;font-size:12px;}
              .ok{color:#16a34a;font-weight:700;} .low{color:#d97706;font-weight:700;} .flag{color:#dc2626;font-weight:700;}
              .footer{margin-top:40px;padding-top:16px;border-top:1px solid #d4d0c8;font-size:11px;color:#9ca3af;}</style></head>
              <body>
              <p class="label">Evidstack Pro - Bloodwork History</p>
              <h1>Biomarker Report</h1>
              <p style="color:#6b7280;font-size:13px;margin:4px 0 24px;">${entries.length} entries | Generated ${new Date().toLocaleDateString()}</p>
              ${[...entries].reverse().map(e=>`
                <div style="margin-bottom:28px;">
                  <p style="font-size:15px;font-weight:800;margin:0 0 4px;">${e.date}</p>
                  ${e.note?`<p style="font-size:12px;color:#6b7280;margin:0 0 10px;">${e.note}</p>`:""}
                  <table><tr>${MARKERS.filter(m=>e.values[m.id]).map(m=>`<th>${m.label}<br/><span style="font-weight:400;">${m.unit}</span></th>`).join("")}</tr>
                  <tr>${MARKERS.filter(m=>e.values[m.id]).map(m=>{const v=parseFloat(e.values[m.id]);const ok=v>=m.normal[0]&&v<=m.normal[1];const danger=v<m.warn_low||v>m.warn_high;return`<td class="${danger?"flag":ok?"ok":"low"}">${v}</td>`;}).join("")}</tr></table>
                </div>`).join("")}
              <div class="footer">Generated by Evidstack.com | Evidence-Based Supplementation | This report is for informational purposes only. Consult a healthcare provider.</div>
              </body></html>`;
              const w=window.open("","_blank");
              w.document.write(printContent);
              w.document.close();
              w.focus();
              w.print();
            }} style={{padding:"12px 18px",background:"transparent",border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.ink,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Export PDF 📄</button>}
            <button onClick={()=>setShowForm(true)} style={{padding:"12px 22px",background:C.ink,color:C.white,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>+ Log Blood Work</button>
          </div>
        </div>

        {/* Log form */}
        {showForm&&(
          <div style={{background:C.white,border:`2px solid ${C.ink}`,padding:isMob?"20px":"28px 32px",marginBottom:28}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <p style={{fontSize:14,fontWeight:900,color:C.ink,margin:0}}>New Entry</p>
              <button onClick={()=>setShowForm(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.gray}}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 2fr",gap:12,marginBottom:16}}>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:C.gray,margin:"0 0 6px",letterSpacing:".08em",textTransform:"uppercase"}}>Date</p>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                  style={{width:"100%",padding:"10px 12px",border:`1px solid ${C.border}`,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:700,color:C.gray,margin:"0 0 6px",letterSpacing:".08em",textTransform:"uppercase"}}>Stack note (optional)</p>
                <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Week 8 of Test E 250mg/week + Ashwagandha"
                  style={{width:"100%",padding:"10px 12px",border:`1px solid ${C.border}`,fontSize:13,fontFamily:"Montserrat,sans-serif",outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            <p style={{fontSize:11,fontWeight:700,color:C.gray,margin:"0 0 12px",letterSpacing:".08em",textTransform:"uppercase"}}>Biomarker Values (leave blank if not tested)</p>
            <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:20}}>
              {MARKERS.map(m=>(
                <div key={m.id}>
                  <p style={{fontSize:10,fontWeight:700,color:C.gray,margin:"0 0 4px",lineHeight:1.2}}>{m.label}<br/><span style={{fontWeight:400,opacity:.7}}>{m.unit}</span></p>
                  <input type="number" value={values[m.id]||""} onChange={e=>setValues(v=>({...v,[m.id]:e.target.value}))}
                    placeholder="-" style={{width:"100%",padding:"8px 10px",border:`1px solid ${statusColor(parseFloat(values[m.id]),m)}`,fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",boxSizing:"border-box",color:statusColor(parseFloat(values[m.id]),m),fontWeight:values[m.id]?700:400}}/>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={saveEntry} style={{padding:"11px 24px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Save Entry</button>
              <button onClick={()=>setShowForm(false)} style={{padding:"11px 20px",background:"transparent",border:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.gray,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Cancel</button>
            </div>
          </div>
        )}

        {entries.length===0&&!showForm&&(
          <div style={{textAlign:"center",padding:"60px 20px",color:C.gray}}>
            <p style={{fontSize:48,margin:"0 0 12px"}}>🩸</p>
            <p style={{fontSize:15,fontWeight:700,color:C.ink,margin:"0 0 6px"}}>No entries yet</p>
            <p style={{fontSize:13,margin:"0 0 20px"}}>Log your first blood work to start tracking trends.</p>
            <button onClick={()=>setShowForm(true)} style={{padding:"11px 24px",background:C.ink,color:C.white,border:"none",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Log Blood Work</button>
          </div>
        )}

        {entries.length>0&&(
          <>
            {/* Marker selector + trend */}
            <div style={{background:C.white,border:`1px solid ${C.border}`,padding:isMob?"16px":"24px 28px",marginBottom:20}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
                <p style={{fontSize:11,fontWeight:700,color:C.gray,margin:0,letterSpacing:".08em",textTransform:"uppercase",flexShrink:0}}>Trend:</p>
                <select value={selectedMarker} onChange={e=>setSelectedMarker(e.target.value)}
                  style={{padding:"8px 12px",border:`1px solid ${C.border}`,fontSize:12,fontFamily:"Montserrat,sans-serif",outline:"none",background:C.white,color:C.ink,fontWeight:700}}>
                  {MARKERS.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              {markerHistory.length>=2?(
                <div style={{position:"relative",height:100,marginBottom:8}}>
                  {(()=>{
                    const vals=markerHistory.map(e=>e.val);
                    const min=Math.min(...vals,marker.normal[0]*0.8);
                    const max=Math.max(...vals,marker.normal[1]*1.1);
                    const range=max-min||1;
                    const W=100;const H=100;
                    const pts=markerHistory.map((e,i)=>{
                      const x=(i/(markerHistory.length-1))*W;
                      const y=H-((e.val-min)/range)*H;
                      return `${x},${y}`;
                    }).join(" ");
                    const normalTop=H-((marker.normal[1]-min)/range)*H;
                    const normalBottom=H-((marker.normal[0]-min)/range)*H;
                    return(
                      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:100,overflow:"visible"}}>
                        <rect x="0" y={normalTop} width={W} height={normalBottom-normalTop} fill="#16a34a" opacity=".08"/>
                        <polyline points={pts} fill="none" stroke={statusColor(vals[vals.length-1],marker)} strokeWidth="1.5"/>
                        {markerHistory.map((e,i)=>{
                          const x=(i/(markerHistory.length-1))*W;
                          const y=H-((e.val-min)/range)*H;
                          return <circle key={i} cx={x} cy={y} r="2.5" fill={statusColor(e.val,marker)}/>;
                        })}
                      </svg>
                    );
                  })()}
                </div>
              ):(
                <p style={{fontSize:12,color:C.gray,margin:0}}>Log at least 2 entries to see a trend chart.</p>
              )}
              {markerHistory.length>0&&(
                <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                  {markerHistory.slice(-3).map((e,i)=>(
                    <div key={i}>
                      <p style={{fontSize:10,color:C.gray,margin:"0 0 2px"}}>{e.date}</p>
                      <p style={{fontSize:15,fontWeight:900,color:statusColor(e.val,marker),margin:0}}>{e.val} <span style={{fontSize:10,fontWeight:400,color:C.gray}}>{marker?.unit}</span></p>
                    </div>
                  ))}
                  <div style={{marginLeft:"auto",textAlign:"right"}}>
                    <p style={{fontSize:10,color:C.gray,margin:"0 0 2px"}}>Normal range</p>
                    <p style={{fontSize:12,fontWeight:700,color:"#16a34a",margin:0}}>{marker?.normal[0]} - {marker?.normal[1]} {marker?.unit}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Entries list */}
            <p style={{fontSize:10,fontWeight:800,color:C.gray,letterSpacing:".14em",margin:"0 0 12px",textTransform:"uppercase"}}>All Entries</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[...entries].reverse().map(e=>{
                const flagged=MARKERS.filter(m=>{const v=parseFloat(e.values[m.id]);return v&&(v<m.warn_low||v>m.warn_high);});
                const warned=MARKERS.filter(m=>{const v=parseFloat(e.values[m.id]);return v&&(v<m.normal[0]||v>m.normal[1])&&!(v<m.warn_low||v>m.warn_high);});
                return(
                  <div key={e.id} style={{background:C.white,border:`1px solid ${C.border}`,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
                        <p style={{fontSize:14,fontWeight:800,color:C.ink,margin:0}}>{e.date}</p>
                        {flagged.length>0&&<span style={{fontSize:10,fontWeight:800,color:"#dc2626",background:"#fef2f2",padding:"2px 8px",borderRadius:2}}>{flagged.length} FLAG{flagged.length>1?"S":""}</span>}
                        {warned.length>0&&flagged.length===0&&<span style={{fontSize:10,fontWeight:800,color:"#d97706",background:"#fff7ed",padding:"2px 8px",borderRadius:2}}>{warned.length} CAUTION</span>}
                        {flagged.length===0&&warned.length===0&&Object.keys(e.values).length>0&&<span style={{fontSize:10,fontWeight:800,color:"#16a34a",background:"#f0fdf4",padding:"2px 8px",borderRadius:2}}>ALL NORMAL</span>}
                      </div>
                      {e.note&&<p style={{fontSize:12,color:C.gray,margin:"0 0 8px"}}>{e.note}</p>}
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {MARKERS.filter(m=>e.values[m.id]).map(m=>{
                          const v=parseFloat(e.values[m.id]);
                          return(<span key={m.id} style={{fontSize:11,color:statusColor(v,m),fontWeight:700}}>{m.label}: {v}</span>);
                        })}
                      </div>
                    </div>
                    <button onClick={()=>deleteEntry(e.id)} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:C.gray,flexShrink:0}}>🗑</button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── GUIDES INDEX PAGE ──────────────────────────────────────────────────────────
function GuidesIndexPage({onNavigate,onUpgrade,onAuth}){
  const {isPro,user}=useAuth();
  const isMob=useIsMobile();
  const FREE_GUIDE_IDS=["sleep","force"];
  const GUIDE_ITEMS=[
    {id:"sleep",label:"Sleep",icon:"😴",desc:"Magnesium, Glycine, L-Theanine, Ashwagandha. Improve onset, depth, and recovery."},
    {id:"force",label:"Strength",icon:"💪",desc:"Creatine, Citrulline, Beta-Alanine. The highest-evidence performance stack."},
    {id:"focus",label:"Focus & Cognition",icon:"🧠",desc:"Caffeine + L-Theanine, Lion's Mane, Bacopa. Sustained mental performance without dependence."},
    {id:"hormones",label:"Testosterone",icon:"🩸",desc:"D3, Zinc, Tongkat Ali, Ashwagandha, Boron. Optimize the hormonal foundation first."},
    {id:"longevity",label:"Longevity",icon:"❤️",desc:"Omega-3, CoQ10, NMN, Resveratrol. Target NAD+ decline, inflammation, and mitochondrial function."},
    {id:"skin",label:"Skin Quality",icon:"✨",desc:"Vitamin C, Astaxanthin, Collagen, Hyaluronic Acid. 8-12 weeks to visible improvement."},
    {id:"weight",label:"Fat Loss",icon:"⚖️",desc:"Berberine, Omega-3, Ashwagandha. Works within a caloric deficit. No thermogenic stack."},
    {id:"recovery",label:"Recovery",icon:"🔁",desc:"Omega-3, Creatine, Magnesium, BPC-157. Reduce soreness, accelerate repair."},
  ];
  const GOAL_ITEMS=GOALS.filter(g=>g.id!=="all");
  const navigateGuide=(id)=>{window.history.pushState({},"",`/guide/${id}`);window.dispatchEvent(new PopStateEvent("popstate"));};
  const navigateGoal=(id)=>{window.history.pushState({},"",`/goal/${id}`);window.dispatchEvent(new PopStateEvent("popstate"));};
  const handleGuideClick=(g)=>{
    if(!isPro&&!FREE_GUIDE_IDS.includes(g.id)){
      if(user)onUpgrade();
      else onAuth("signup");
      return;
    }
    navigateGuide(g.id);
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:isMob?"24px 16px":"40px 48px"}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <h1 style={{fontSize:isMob?26:40,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 10px"}}>Supplement Guides</h1>
          <p style={{fontSize:14,color:C.gray,margin:0,maxWidth:560,lineHeight:1.7}}>Evidence-based protocols for every goal. Each guide ranks compounds from foundational to advanced with exact dosing, timing, and what to avoid.</p>
        </div>
      </div>
      <div style={{maxWidth:960,margin:"0 auto",padding:isMob?"20px 16px 80px":"40px 48px 80px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:16}}>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:0,textTransform:"uppercase"}}>Protocol guides</p>
          {!isPro&&<span style={{fontSize:10,color:C.gray}}>{FREE_GUIDE_IDS.length} free - {GUIDE_ITEMS.length-FREE_GUIDE_IDS.length} Pro only</span>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:12,marginBottom:40}}>
          {GUIDE_ITEMS.map(g=>{
            const locked=!isPro&&!FREE_GUIDE_IDS.includes(g.id);
            return(
              <div key={g.id} onClick={()=>handleGuideClick(g)}
                style={{background:C.white,border:`1px solid ${C.border}`,borderLeft:`4px solid ${locked?C.gray:C.gold}`,padding:"20px 24px",cursor:"pointer",transition:"box-shadow .15s",opacity:locked?.65:1,position:"relative"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,.07)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{fontSize:22,filter:locked?"grayscale(1)":"none"}}>{g.icon}</span>
                  <span style={{fontSize:15,fontWeight:900,color:locked?C.gray:C.ink,letterSpacing:"-.02em"}}>{g.label}</span>
                  {locked
                    ?<span style={{marginLeft:"auto",fontSize:9,fontWeight:800,background:C.ink,color:C.gold,padding:"2px 7px",letterSpacing:".08em"}}>PRO</span>
                    :<span style={{marginLeft:"auto",fontSize:10,color:C.gray}}>→</span>}
                </div>
                <p style={{fontSize:11,color:C.gray,margin:0,lineHeight:1.6}}>{locked?"Unlock with Pro to access the full protocol.":g.desc}</p>
              </div>
            );
          })}
        </div>
        {!isPro&&(
          <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,padding:"18px 22px",marginBottom:40,display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:180}}>
              <p style={{fontSize:13,fontWeight:900,color:C.ink,margin:"0 0 4px"}}>6 more protocol guides - Pro only</p>
              <p style={{fontSize:11,color:C.gray,margin:0}}>Testosterone, Focus, Longevity, Skin, Fat Loss, and Recovery with full compound lists, dosing, and timing.</p>
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0,flexWrap:"wrap"}}>
              {user
                ?<button onClick={onUpgrade} className="evid-shimmer-btn" style={{padding:"10px 22px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Unlock Pro - $9.99/mo</button>
                :<><button onClick={()=>onAuth("signup")} style={{padding:"10px 18px",background:C.ink,color:C.white,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Create account</button>
                <button onClick={onUpgrade} className="evid-shimmer-btn" style={{padding:"10px 18px",background:C.gold,color:C.ink,border:"none",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Go Pro</button></>}
            </div>
          </div>
        )}
        <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:"0 0 16px",textTransform:"uppercase"}}>Browse by goal</p>
        <div style={{display:"grid",gridTemplateColumns:isMob?"1fr 1fr":"repeat(4,1fr)",gap:8}}>
          {GOAL_ITEMS.map(g=>{
            const count=SUPPLEMENTS.filter(s=>s.effects.some(e=>e.goal===g.id)).length;
            return(
              <div key={g.id} onClick={()=>navigateGoal(g.id)}
                style={{background:C.white,border:`1px solid ${C.border}`,padding:"14px 16px",cursor:"pointer",transition:"box-shadow .15s"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.06)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{fontSize:20,marginBottom:6}}>{g.icon}</div>
                <p style={{fontSize:12,fontWeight:800,color:C.ink,margin:"0 0 3px"}}>{g.label}</p>
                <p style={{fontSize:10,color:C.gray,margin:0}}>{count} compounds</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── GOAL PAGE ─────────────────────────────────────────────────────────────────
function GoalPage({goalId,onUpgrade,onAuth,onNavigate}){
  const {isPro,user}=useAuth();
  const isMob=useIsMobile();
  const goal=GOALS.find(g=>g.id===goalId);
  if(!goal||goal.id==="all")return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{fontFamily:"Montserrat,sans-serif",color:C.gray}}>Goal not found.</p></div>);
  const compounds=SUPPLEMENTS.filter(s=>s.effects.some(e=>e.goal===goalId))
    .map(s=>{const eff=s.effects.find(e=>e.goal===goalId);return{...s,goalEfficacy:eff?.efficacy||0,goalEvidence:eff?.evidence||0,goalStudies:eff?.study_count||eff?.studies||0,goalSummary:eff?.summary||"",goalType:eff?.study_type||eff?.type||""};})
    .sort((a,b)=>(b.goalEfficacy+b.goalEvidence)-(a.goalEfficacy+a.goalEvidence));
  const tierColor=["","#16a34a","#2563eb","#7c3aed","#d97706"];
  const FREE_SHOW=3;
  const navigateToCompound=(id)=>{window.history.pushState({},"",`/compound/${id}`);window.dispatchEvent(new PopStateEvent("popstate"));};
  const navigateToGuide=()=>{window.history.pushState({},"",`/guide/${goalId}`);window.dispatchEvent(new PopStateEvent("popstate"));};
  const GUIDE_IDS=["sleep","focus","hormones","force","longevity","skin","weight","recovery"];
  const hasGuide=GUIDE_IDS.includes(goalId);
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:isMob?"24px 16px":"32px 48px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <button onClick={()=>onNavigate("guides")} style={{fontSize:11,color:C.gray,background:"transparent",border:"none",cursor:"pointer",fontFamily:"Montserrat,sans-serif",marginBottom:16,padding:0}}>← All guides</button>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <span style={{fontSize:isMob?32:40}}>{goal.icon}</span>
            <h1 style={{fontSize:isMob?22:34,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:0}}>Best supplements for {goal.label}</h1>
          </div>
          <p style={{fontSize:13,color:C.gray,margin:"0 0 16px",lineHeight:1.7,maxWidth:560}}>{compounds.length} compounds with documented effects in human trials. Ranked by combined efficacy and evidence score from PubMed and Cochrane reviews.</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{padding:"5px 12px",background:C.bg,border:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.gray}}>{compounds.length} compounds</div>
            <div style={{padding:"5px 12px",background:C.bg,border:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.gray}}>Evidence ranked A-F</div>
            {hasGuide&&<button onClick={navigateToGuide} className="evid-shimmer-btn" style={{padding:"6px 14px",background:C.gold,color:C.ink,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>View Protocol Guide →</button>}
          </div>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:isMob?"16px 16px 80px":"32px 48px 80px"}}>
        <div style={{background:C.white,border:`1px solid ${C.border}`,padding:"10px 18px",marginBottom:20,display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontSize:9,fontWeight:800,letterSpacing:".12em",color:C.gray,textTransform:"uppercase",flexShrink:0}}>Evidence grade</span>
          {[["A","5/5","#16a34a"],["B","4/5","#2563eb"],["C","3/5","#7c3aed"],["D","2/5","#d97706"],["F","1/5","#dc2626"]].map(([g,s,col])=>(
            <div key={g} style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:12,fontWeight:900,color:col,background:`${col}15`,border:`1px solid ${col}30`,padding:"1px 7px",minWidth:20,textAlign:"center"}}>{g}</span>
              <span style={{fontSize:10,color:C.gray}}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {compounds.map((s,idx)=>{
            const locked=!isPro&&idx>=FREE_SHOW;
            const tc=tierColor[s.tier]||C.gray;
            const effGrade=["","F","D","C","B","A"][Math.round(s.goalEfficacy)]||"F";
            const evGrade=["","F","D","C","B","A"][Math.round(s.goalEvidence)]||"F";
            const effColor=["","#dc2626","#d97706","#7c3aed","#2563eb","#16a34a"][Math.round(s.goalEfficacy)]||C.gray;
            const evColor=["","#dc2626","#d97706","#7c3aed","#2563eb","#16a34a"][Math.round(s.goalEvidence)]||C.gray;
            if(locked&&idx===FREE_SHOW)return(
              <div key="gate" style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,padding:"22px 24px",textAlign:"center",marginTop:4}}>
                <p style={{fontSize:13,fontWeight:900,color:C.ink,margin:"0 0 6px"}}>Showing {FREE_SHOW} of {compounds.length} compounds</p>
                <p style={{fontSize:12,color:C.gray,margin:"0 0 18px"}}>Pro unlocks all {compounds.length} compounds for {goal.label}, full dosing, interactions, and the Protocol Guide.</p>
                <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                  {user?<button onClick={onUpgrade} className="evid-shimmer-btn" style={{padding:"11px 28px",background:C.gold,color:C.ink,border:"none",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Unlock Pro - $9.99/mo</button>
                  :<><button onClick={()=>onAuth("signup")} style={{padding:"11px 24px",background:C.ink,color:C.white,border:"none",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Create free account</button>
                  <button onClick={onUpgrade} className="evid-shimmer-btn" style={{padding:"11px 24px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Go Pro</button></>}
                </div>
              </div>
            );
            if(locked)return null;
            return(
              <div key={s.id} onClick={()=>navigateToCompound(s.id)}
                style={{background:C.white,border:`1px solid ${C.border}`,borderLeft:`4px solid ${tc}`,padding:isMob?"12px 14px":"14px 22px",cursor:"pointer",display:"flex",alignItems:"center",gap:isMob?10:18,flexWrap:"wrap",transition:"box-shadow .15s"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,.07)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <span style={{fontSize:13,fontWeight:900,color:C.gray,minWidth:22,textAlign:"center",flexShrink:0}}>#{idx+1}</span>
                <span style={{fontSize:9,fontWeight:800,color:tc,border:`1px solid ${tc}`,padding:"2px 6px",flexShrink:0}}>T{s.tier}</span>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:isMob?12:14,fontWeight:900,color:C.ink,margin:"0 0 2px",letterSpacing:"-.02em"}}>{s.name}</p>
                  {s.goalSummary&&<p style={{fontSize:10,color:C.gray,margin:0,lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.goalSummary}</p>}
                </div>
                <div style={{display:"flex",gap:isMob?8:14,flexShrink:0,alignItems:"center"}}>
                  <div style={{textAlign:"center"}}>
                    <p style={{fontSize:8,fontWeight:700,color:C.gray,margin:"0 0 2px",letterSpacing:".1em",textTransform:"uppercase"}}>Efficacy</p>
                    <span style={{fontSize:15,fontWeight:900,color:effColor}}>{effGrade}</span>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <p style={{fontSize:8,fontWeight:700,color:C.gray,margin:"0 0 2px",letterSpacing:".1em",textTransform:"uppercase"}}>Evidence</p>
                    <span style={{fontSize:15,fontWeight:900,color:evColor}}>{evGrade}</span>
                  </div>
                  {!isMob&&s.goalStudies>0&&<div style={{textAlign:"center"}}>
                    <p style={{fontSize:8,fontWeight:700,color:C.gray,margin:"0 0 2px",letterSpacing:".1em",textTransform:"uppercase"}}>Studies</p>
                    <span style={{fontSize:12,fontWeight:800,color:C.gray}}>{s.goalStudies}</span>
                  </div>}
                  <span style={{fontSize:10,color:C.gray,opacity:.5,flexShrink:0}}>→</span>
                </div>
              </div>
            );
          })}
        </div>
        {hasGuide&&<div style={{background:C.ink,padding:"22px 26px",marginTop:28,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:14}}>
          <div>
            <p style={{fontSize:13,fontWeight:900,color:C.white,margin:"0 0 3px"}}>{goal.label} Protocol Guide</p>
            <p style={{fontSize:11,color:"#6b7280",margin:0}}>Step-by-step protocol: which compounds to start with, exact dosing, timing, and what to avoid.</p>
          </div>
          <button onClick={navigateToGuide} className="evid-shimmer-btn" style={{padding:"10px 22px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",flexShrink:0}}>View Protocol Guide →</button>
        </div>}
      </div>
    </div>
  );
}

// ── GUIDE PAGE ─────────────────────────────────────────────────────────────────
const GUIDES={
  sleep:{title:"Sleep Optimization Protocol",goal:"sleep",intro:"Evidence-based protocol for improving sleep onset, depth, and overnight recovery. Start with Primary compounds for 4 weeks before adding Secondary.",
    primary:[
      {id:"magnesium-bisglycinate",role:"Primary",dose:"300-400mg",timing:"1hr before bed",why:"Activates GABA receptors and reduces cortisol. Most consistent evidence for sleep onset across multiple RCTs.",weeks:"Start week 1"},
      {id:"glycine",role:"Primary",dose:"3g",timing:"30min before bed",why:"Reduces core body temperature triggering sleep onset. Double-blind RCTs show improved sleep quality and reduced daytime fatigue.",weeks:"Start week 1"},
      {id:"l-theanine",role:"Primary",dose:"200-400mg",timing:"1hr before bed",why:"Increases alpha brain wave activity. Promotes relaxed alertness without drowsiness. Pairs well with magnesium.",weeks:"Start week 2"},
    ],
    secondary:[
      {id:"ashwagandha-ksm66",role:"Secondary",dose:"300-600mg",timing:"Evening",why:"HPA axis modulation reduces cortisol and shortens sleep onset. Particularly useful when poor sleep is stress-driven.",weeks:"Add week 4"},
      {id:"melatonin",role:"Secondary",dose:"0.5-1mg",timing:"30-60min before bed",why:"Physiological doses only. 0.5-1mg is more effective than high doses for most users.",weeks:"Add week 4"},
      {id:"taurine",role:"Secondary",dose:"1-2g",timing:"Before bed",why:"GABA-A modulator. Reduces sleep fragmentation. Consistent data on REM quality.",weeks:"Add week 6"},
    ],
    advanced:[{id:"ipamorelin",role:"Advanced",dose:"100-200mcg",timing:"Pre-sleep injection",why:"GH secretagogue that amplifies the natural GH pulse at sleep onset. Improves deep sleep architecture.",weeks:"Optional"}],
    avoid:["High-dose melatonin (5mg+) - receptor downregulation","Alcohol - disrupts REM despite causing drowsiness","Caffeine within 8-10 hours of sleep"],
    stack_note:"Magnesium + Glycine alone will improve sleep quality for most people. Add Theanine after 1 week if sleep onset is still slow. Ashwagandha is most useful if poor sleep is stress-driven.",
  },
  focus:{title:"Cognitive Focus Protocol",goal:"focus",intro:"Protocol for sustained focus, working memory, and executive function without dependence. Ranked by evidence quality and safety profile.",
    primary:[
      {id:"caffeine",role:"Primary",dose:"100-200mg",timing:"Morning, before task",why:"Most evidence-backed cognitive enhancer. Improves reaction time, alertness, and sustained attention. Stack with L-Theanine to reduce jitteriness.",weeks:"Start week 1"},
      {id:"l-theanine",role:"Primary",dose:"200mg",timing:"With caffeine",why:"Synergizes with caffeine. Blunts anxiety while maintaining alertness. 2:1 theanine:caffeine ratio is the studied combination.",weeks:"Start week 1"},
      {id:"lions-mane",role:"Primary",dose:"1000-3000mg",timing:"Morning",why:"NGF stimulation. Human trials show improved cognitive scores. Effects build over 4-8 weeks.",weeks:"Start week 1"},
    ],
    secondary:[
      {id:"bacopa-monnieri",role:"Secondary",dose:"300-450mg",timing:"With food",why:"Best evidence for memory consolidation. Saponins take 4-6 weeks to show effect. Take with fat for absorption.",weeks:"Add week 4"},
      {id:"rhodiola-rosea",role:"Secondary",dose:"200-400mg",timing:"Morning, away from food",why:"Reduces mental fatigue under stress. Particularly useful during high-stress periods.",weeks:"Add week 4"},
      {id:"coq10",role:"Secondary",dose:"200-400mg",timing:"Morning with fat",why:"Mitochondrial energy production. Most relevant if cognitive fatigue is energy-related.",weeks:"Add week 6"},
    ],
    advanced:[{id:"nmn",role:"Advanced",dose:"500-1000mg",timing:"Morning",why:"NAD+ restoration improves neuronal energy production. Most pronounced in adults over 35.",weeks:"Optional"}],
    avoid:["Combining multiple stimulants","Exceeding 400mg caffeine daily","Bacopa at night - can cause vivid dreams"],
    stack_note:"Caffeine + L-Theanine is the single most evidence-backed combination for focus. Add Lion's Mane for long-term cognitive support. Bacopa specifically for memory.",
  },
  hormones:{title:"Testosterone Optimization Protocol",goal:"hormones",intro:"Correct the most common hormonal deficiencies before considering ergogenic compounds. Always run bloodwork before and during any protocol.",
    primary:[
      {id:"vitamine-d3-k2",role:"Primary",dose:"4000-6000 IU D3 + 200mcg K2",timing:"Morning with fat",why:"Vitamin D deficiency directly associated with 20-30% lower testosterone. Most common correctable deficiency in men.",weeks:"Start week 1"},
      {id:"zinc-bisglycinate",role:"Primary",dose:"15-30mg",timing:"Away from calcium",why:"Direct cofactor for testosterone synthesis. Athletes and men with poor diet are commonly deficient.",weeks:"Start week 1"},
      {id:"magnesium-bisglycinate",role:"Primary",dose:"300-400mg",timing:"Evening",why:"Low magnesium suppresses free testosterone. Evening dosing also improves sleep which further supports hormonal recovery.",weeks:"Start week 1"},
    ],
    secondary:[
      {id:"ashwagandha-ksm66",role:"Secondary",dose:"600mg",timing:"Morning or evening",why:"8 RCTs showing testosterone increases of 15-37% in men with suboptimal baseline. Reduces cortisol.",weeks:"Add week 4"},
      {id:"tongkat-ali",role:"Secondary",dose:"400-600mg",timing:"Morning",why:"Reduces SHBG, increasing the free testosterone fraction. Documented increases of 15-37% in human trials.",weeks:"Add week 4"},
      {id:"boron",role:"Secondary",dose:"6-12mg",timing:"With food",why:"7mg daily for one week raised free testosterone 28% and reduced estradiol 39% in a controlled trial.",weeks:"Add week 6"},
    ],
    advanced:[{id:"ipamorelin",role:"Advanced",dose:"100-200mcg 2-3x/day",timing:"Away from meals",why:"GH secretagogue. Elevated IGF-1 supports lean mass and improves the hormonal environment.",weeks:"Optional"}],
    avoid:["Soy protein in large amounts","Alcohol - acutely suppresses testosterone","Combining multiple 5-AR inhibitors without bloodwork"],
    stack_note:"Correct D3, zinc, and magnesium first. These three deficiencies together suppress testosterone significantly and fixing them costs almost nothing. Only add adaptogens after 4-6 weeks. Bloodwork before and 8 weeks after any change.",
  },
  force:{title:"Strength and Performance Protocol",goal:"force",intro:"Compounds with direct human trial evidence for performance outcomes. Designed to be sustainable long-term.",
    primary:[
      {id:"creatine-monohydrate",role:"Primary",dose:"5g/day",timing:"Any time",why:"The most studied performance compound in existence. 500+ human trials. Increases phosphocreatine stores, strength, and power output.",weeks:"Start week 1"},
      {id:"citrulline",role:"Primary",dose:"6-8g",timing:"30-60min pre-workout",why:"Increases nitric oxide production and reduces training fatigue. More effective than arginine for blood flow.",weeks:"Start week 1"},
      {id:"beta-alanine",role:"Primary",dose:"3.2-6.4g",timing:"Pre-workout",why:"Increases muscle carnosine, buffering acid accumulation during high-intensity sets. Tingling is normal.",weeks:"Start week 1"},
    ],
    secondary:[
      {id:"vitamine-d3-k2",role:"Secondary",dose:"4000 IU D3",timing:"Morning with fat",why:"Deficiency directly reduces muscle protein synthesis and strength.",weeks:"Add week 2"},
      {id:"zinc-bisglycinate",role:"Secondary",dose:"15-25mg",timing:"Evening",why:"Athletes lose significant zinc through sweat. Deficiency reduces testosterone and recovery.",weeks:"Add week 2"},
      {id:"omega-3",role:"Secondary",dose:"2-3g EPA/DHA",timing:"With meals",why:"Reduces exercise-induced inflammation and improves muscle protein synthesis response to training.",weeks:"Add week 4"},
    ],
    advanced:[{id:"ipamorelin",role:"Advanced",dose:"100-200mcg 2-3x/day",timing:"Away from meals or pre-sleep",why:"GH secretagogue. Increases lean mass, reduces body fat, improves recovery. Significantly more effect with resistance training.",weeks:"Optional"}],
    avoid:["NSAIDs regularly - blunt training adaptation","Creatine loading phase - unnecessary and causes GI distress","Beta-alanine above 6.4g - no additional benefit"],
    stack_note:"Creatine alone is worth more than most entire supplement stacks. Take it daily, timing does not matter. Add Citrulline and Beta-Alanine for acute training performance.",
  },
  longevity:{title:"Longevity Protocol",goal:"longevity",intro:"Targeting the primary mechanisms of biological aging: NAD+ depletion, oxidative stress, inflammation, and mitochondrial dysfunction.",
    primary:[
      {id:"vitamine-d3-k2",role:"Primary",dose:"4000-6000 IU D3 + 200mcg K2",timing:"Morning with fat",why:"Vitamin D deficiency associated with accelerated all-cause mortality. K2 prevents arterial calcification.",weeks:"Start week 1"},
      {id:"omega-3",role:"Primary",dose:"2-4g EPA/DHA",timing:"With meals",why:"Reduces systemic inflammation - the primary driver of age-related disease. Consistent meta-analysis support.",weeks:"Start week 1"},
      {id:"coq10",role:"Primary",dose:"200-400mg ubiquinol",timing:"Morning with fat",why:"Mitochondrial cofactor that declines with age and is depleted by statins. Ubiquinol form is better absorbed.",weeks:"Start week 1"},
    ],
    secondary:[
      {id:"nmn",role:"Secondary",dose:"500-1000mg",timing:"Morning",why:"NAD+ precursor. NAD+ drops 50% by age 50. Human trials show significant restoration. Most relevant over 35.",weeks:"Add week 4"},
      {id:"resveratrol",role:"Secondary",dose:"500mg",timing:"With fat and NMN",why:"SIRT1 activator synergistic with NMN. Anti-inflammatory and cardioprotective. Bioavailability enhanced with fat.",weeks:"Add week 4"},
      {id:"astaxanthin",role:"Secondary",dose:"12mg",timing:"With fat",why:"Most potent carotenoid antioxidant. 14 human RCTs. Reduces oxidative damage and improves cardiovascular markers.",weeks:"Add week 6"},
    ],
    advanced:[{id:"epitalon",role:"Advanced",dose:"10mg/day for 10-20 day cycles",timing:"Any time",why:"Telomerase activator with documented effects on aging biomarkers and pineal function.",weeks:"Optional - 2-3 cycles/year"}],
    avoid:["Antioxidant megadosing - can blunt hormetic adaptation from exercise","Combining multiple NAD+ precursors","Resveratrol without fat - poor bioavailability"],
    stack_note:"D3+K2 and Omega-3 are the highest-evidence longevity interventions accessible to everyone. Fix those first. NMN becomes progressively more relevant after age 35.",
  },
  skin:{title:"Skin Quality Protocol",goal:"skin",intro:"Evidence-based protocol for collagen density, elasticity, hydration, and UV protection. Results typically visible at 8-12 weeks.",
    primary:[
      {id:"vitamin-c",role:"Primary",dose:"500-1000mg",timing:"Morning",why:"Rate-limiting cofactor for collagen synthesis. Deficiency stops collagen production. Also reduces oxidative skin damage.",weeks:"Start week 1"},
      {id:"astaxanthin",role:"Primary",dose:"12mg",timing:"With fat",why:"14 human RCTs showing reduced UV-induced skin damage, improved elasticity, and moisture retention.",weeks:"Start week 1"},
      {id:"collagen",role:"Primary",dose:"10-15g",timing:"Morning",why:"Oral collagen peptides reach dermal fibroblasts and upregulate collagen synthesis. 26 RCTs confirm effect. Below 10g is inconsistent.",weeks:"Start week 1"},
    ],
    secondary:[
      {id:"hyaluronic-acid",role:"Secondary",dose:"120-240mg",timing:"Morning",why:"Oral HA is absorbed and reaches skin tissue. 60-day trials show measurable reduction in wrinkle depth.",weeks:"Add week 4"},
      {id:"pine-bark-pycnogenol",role:"Secondary",dose:"100-150mg",timing:"With food",why:"7 RCTs showing improved skin elasticity, hydration, and UV protection. Anti-inflammatory via NF-kB inhibition.",weeks:"Add week 4"},
      {id:"ghk-cu",role:"Secondary",dose:"Topical 0.1-0.5% or injectable 200mcg",timing:"Evening",why:"Upregulates collagen type I and III. Most studied copper peptide for skin. Documented improvements in skin thickness.",weeks:"Add week 6"},
    ],
    advanced:[{id:"epitalon",role:"Advanced",dose:"10mg/day for 10-20 day cycles",timing:"Any time",why:"Tetrapeptide that reduces UV-induced skin damage and affects cellular aging markers.",weeks:"Optional - 2-3 cycles/year"}],
    avoid:["High-dose Vitamin A without monitoring - hepatotoxic","Combining multiple retinoids","Collagen below 10g/day - insufficient based on trial data"],
    stack_note:"Vitamin C + Collagen + Astaxanthin is the highest-evidence skin stack. Take them consistently for 12 weeks before evaluating. Do not expect visible results before 8 weeks.",
  },
  weight:{title:"Fat Loss Protocol",goal:"weight",intro:"No protocol replaces caloric deficit. These compounds work within a proper nutrition framework.",
    primary:[
      {id:"berberine",role:"Primary",dose:"500mg 3x/day",timing:"Before meals",why:"Activates AMPK, improving insulin sensitivity and reducing fat storage. Comparable to metformin in glucose control trials.",weeks:"Start week 1"},
      {id:"omega-3",role:"Primary",dose:"3-4g EPA/DHA",timing:"With meals",why:"Reduces cortisol-driven fat accumulation and improves insulin sensitivity.",weeks:"Start week 1"},
      {id:"vitamin-c",role:"Primary",dose:"500mg",timing:"Morning",why:"Inversely correlated with cortisol. Lower cortisol reduces stress-driven abdominal fat accumulation.",weeks:"Start week 1"},
    ],
    secondary:[
      {id:"ashwagandha-ksm66",role:"Secondary",dose:"600mg",timing:"Morning or evening",why:"Reduces cortisol by 27% in trials. High cortisol directly promotes abdominal fat storage.",weeks:"Add week 4"},
      {id:"creatine-monohydrate",role:"Secondary",dose:"5g",timing:"Any time",why:"Preserves lean mass during caloric deficit. More lean mass increases resting metabolic rate.",weeks:"Add week 4"},
      {id:"semaglutide",role:"Secondary - Rx only",dose:"0.25-2.4mg/week SC",timing:"Weekly injection",why:"GLP-1 agonist with 15-20% body weight reduction in trials. FDA-approved. Requires prescription.",weeks:"Prescription only"},
    ],
    advanced:[{id:"tesamorelin",role:"Advanced",dose:"1-2mg/day SC",timing:"Daily injection",why:"FDA-approved for visceral fat reduction. Particularly targets abdominal and facial subcutaneous fat.",weeks:"Optional - prescription"}],
    avoid:["Thermogenic stimulant stacks - high cardiovascular risk","Combining berberine with metformin without supervision","High-dose diuretics for weight loss"],
    stack_note:"Berberine is the most accessible evidence-backed compound for fat loss. Creatine during a cut preserves lean mass. Semaglutide is the highest-efficacy intervention but requires a prescription.",
  },
  recovery:{title:"Recovery Protocol",goal:"recovery",intro:"Compounds for accelerating muscle repair, reducing DOMS, and improving readiness between training sessions.",
    primary:[
      {id:"omega-3",role:"Primary",dose:"3-4g EPA/DHA",timing:"With meals",why:"Most consistent recovery compound in the literature. Reduces exercise-induced inflammation and muscle soreness.",weeks:"Start week 1"},
      {id:"creatine-monohydrate",role:"Primary",dose:"5g",timing:"Any time",why:"Accelerates phosphocreatine resynthesis between sessions. Reduces muscle damage markers in human trials.",weeks:"Start week 1"},
      {id:"magnesium-bisglycinate",role:"Primary",dose:"300-400mg",timing:"Evening",why:"Athletes lose significant magnesium through sweat. Deficiency slows recovery and increases muscle cramps.",weeks:"Start week 1"},
    ],
    secondary:[
      {id:"nac",role:"Secondary",dose:"600-1200mg",timing:"Post-workout",why:"Glutathione precursor. Reduces exercise-induced oxidative stress and improves recovery markers.",weeks:"Add week 2"},
      {id:"taurine",role:"Secondary",dose:"2-3g",timing:"Pre or post workout",why:"Reduces oxidative damage and muscle soreness markers in trials. Also cardioprotective.",weeks:"Add week 2"},
      {id:"collagen",role:"Secondary",dose:"15g + Vitamin C",timing:"1hr pre-workout",why:"Collagen + Vitamin C taken before exercise increases collagen synthesis markers in tendons. Timing matters here.",weeks:"Add week 4"},
    ],
    advanced:[{id:"bpc-157",role:"Advanced",dose:"250-500mcg",timing:"Near injured area or systemic",why:"Angiogenic peptide with strong animal data and consistent human anecdotal evidence for tendon and joint repair.",weeks:"Optional - injury specific"}],
    avoid:["NSAIDs regularly - blunt the inflammatory signal needed for adaptation","Vitamin C megadosing around training","Alcohol post-workout - impairs protein synthesis"],
    stack_note:"Omega-3 + Creatine + Magnesium covers the majority of recovery needs. Collagen before exercise is specifically for connective tissue. BPC-157 for injury-specific recovery.",
  },
};

function GuidePage({guideId,onUpgrade,onAuth,onNavigate}){
  const {isPro,user}=useAuth();
  const isMob=useIsMobile();
  const guide=GUIDES[guideId];
  if(!guide)return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <p style={{fontFamily:"Montserrat,sans-serif",fontSize:14,color:C.gray}}>Protocol guide not found.</p>
      <button onClick={()=>onNavigate("guides")} style={{padding:"10px 20px",background:C.ink,color:C.white,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Back to guides</button>
    </div>
  );
  const goal=GOALS.find(g=>g.id===guide.goal);
  const navigateToCompound=(id)=>{window.history.pushState({},"",`/compound/${id}`);window.dispatchEvent(new PopStateEvent("popstate"));};
  const navigateToGoal=()=>{window.history.pushState({},"",`/goal/${guide.goal}`);window.dispatchEvent(new PopStateEvent("popstate"));};
  const TIER_COLORS={Primary:"#16a34a",Secondary:"#2563eb",Advanced:"#d97706"};
  const ALL_TIERS=["Primary","Secondary","Advanced"];
  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"Montserrat,sans-serif"}}>
      <div style={{background:C.ink,padding:isMob?"24px 16px 28px":"40px 48px",position:"relative",overflow:"hidden"}}>
        {!isMob&&<div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)",backgroundSize:"32px 32px",pointerEvents:"none"}}/>}
        <div style={{maxWidth:860,margin:"0 auto",position:"relative"}}>
          <button onClick={()=>onNavigate("guides")} style={{fontSize:11,color:"#6b7280",background:"transparent",border:"none",cursor:"pointer",fontFamily:"Montserrat,sans-serif",marginBottom:16,padding:0}}>← All guides</button>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <span style={{fontSize:9,fontWeight:800,letterSpacing:".16em",color:C.gold,textTransform:"uppercase"}}>Protocol Guide</span>
            <span style={{fontSize:9,color:"#374151"}}>|</span>
            <span style={{fontSize:9,color:"#6b7280",letterSpacing:".1em",textTransform:"uppercase"}}>{goal?.icon} {goal?.label}</span>
          </div>
          <h1 style={{fontSize:isMob?22:36,fontWeight:900,letterSpacing:"-.04em",color:C.white,margin:"0 0 10px",lineHeight:1.05}}>{guide.title}</h1>
          <p style={{fontSize:12,color:"#9ca3af",margin:"0 0 20px",maxWidth:560,lineHeight:1.7}}>{guide.intro}</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {ALL_TIERS.map(tier=>{
              const items=tier==="Primary"?guide.primary:tier==="Secondary"?guide.secondary:guide.advanced||[];
              const col=TIER_COLORS[tier];
              return items.length?(<div key={tier} style={{padding:"5px 12px",border:`1px solid ${col}30`,background:`${col}12`}}>
                <span style={{fontSize:9,fontWeight:800,color:col}}>{tier}</span>
                <span style={{fontSize:9,color:"#6b7280",marginLeft:5}}>{items.length}</span>
              </div>):null;
            })}
          </div>
        </div>
      </div>
      <div style={{maxWidth:860,margin:"0 auto",padding:isMob?"16px 16px 80px":"32px 48px 80px"}}>
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderLeft:`4px solid ${C.gold}`,padding:"12px 18px",marginBottom:24}}>
          <p style={{fontSize:9,fontWeight:800,letterSpacing:".12em",color:C.gray,margin:"0 0 4px",textTransform:"uppercase"}}>Overview</p>
          <p style={{fontSize:12,color:C.ink,margin:0,lineHeight:1.7}}>{guide.stack_note}</p>
        </div>
        {ALL_TIERS.map(tier=>{
          const items=tier==="Primary"?guide.primary:tier==="Secondary"?guide.secondary:guide.advanced||[];
          if(!items.length)return null;
          const isAdv=tier==="Advanced";
          const locked=tier!=="Primary"&&!isPro;
          const tc=TIER_COLORS[tier];
          return(
            <div key={tier} style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <div style={{height:1,flex:1,background:C.border}}/>
                <p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:tc,margin:0,textTransform:"uppercase",flexShrink:0}}>{tier}</p>
                <div style={{height:1,flex:1,background:C.border}}/>
              </div>
              {locked?(
                <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`,padding:"18px 22px",textAlign:"center"}}>
                  <p style={{fontSize:13,fontWeight:900,color:C.ink,margin:"0 0 5px"}}>{tier} compounds - Pro only</p>
                  <p style={{fontSize:11,color:C.gray,margin:"0 0 14px"}}>{items.map(i=>{const s=SUPPLEMENTS.find(x=>x.id===i.id);return s?.name||i.id;}).join(", ")}</p>
                  <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                    {user?<button onClick={onUpgrade} className="evid-shimmer-btn" style={{padding:"9px 22px",background:C.gold,color:C.ink,border:"none",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Unlock Pro - $9.99/mo</button>
                    :<><button onClick={()=>onAuth("signup")} style={{padding:"9px 18px",background:C.ink,color:C.white,border:"none",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Create account</button>
                    <button onClick={onUpgrade} className="evid-shimmer-btn" style={{padding:"9px 18px",background:C.gold,color:C.ink,border:"none",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Go Pro</button></>}
                  </div>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {items.map(item=>{
                    const supp=SUPPLEMENTS.find(s=>s.id===item.id);
                    return(
                      <div key={item.id} style={{background:C.white,border:`1px solid ${C.border}`,borderLeft:`4px solid ${tc}`,padding:isMob?"12px 14px":"16px 22px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6,marginBottom:8}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:14,fontWeight:900,color:C.ink,letterSpacing:"-.02em"}}>{supp?.name||item.id}</span>
                            <span style={{fontSize:8,fontWeight:800,color:tc,background:`${tc}12`,border:`1px solid ${tc}25`,padding:"2px 6px",letterSpacing:".06em"}}>{item.role.toUpperCase()}</span>
                          </div>
                          <span style={{fontSize:9,color:C.gray,fontStyle:"italic"}}>{item.weeks}</span>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:isMob?6:14,marginBottom:8}}>
                          <div><p style={{fontSize:8,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 2px",textTransform:"uppercase"}}>Dose</p><p style={{fontSize:12,fontWeight:800,color:C.ink,margin:0}}>{item.dose}</p></div>
                          <div><p style={{fontSize:8,fontWeight:700,color:C.gray,letterSpacing:".1em",margin:"0 0 2px",textTransform:"uppercase"}}>Timing</p><p style={{fontSize:12,fontWeight:800,color:C.ink,margin:0}}>{item.timing}</p></div>
                        </div>
                        <p style={{fontSize:11,color:C.gray,margin:"0 0 8px",lineHeight:1.6}}>{item.why}</p>
                        <button onClick={()=>navigateToCompound(item.id)} style={{fontSize:10,fontWeight:700,color:tc,background:"transparent",border:`1px solid ${tc}30`,padding:"3px 10px",cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Full evidence profile →</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {isPro?(
          <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:"3px solid #dc2626",padding:"16px 22px",marginBottom:20}}>
            <p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:"#dc2626",margin:"0 0 12px",textTransform:"uppercase"}}>What to avoid</p>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {guide.avoid.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{color:"#dc2626",fontWeight:900,fontSize:13,flexShrink:0,marginTop:1}}>x</span>
                  <span style={{fontSize:11,color:C.ink,lineHeight:1.5}}>{a}</span>
                </div>
              ))}
            </div>
          </div>
        ):(
          <div style={{background:C.white,border:`1px solid ${C.border}`,borderTop:"3px solid #dc2626",padding:"16px 22px",marginBottom:20}}>
            <p style={{fontSize:9,fontWeight:800,letterSpacing:".14em",color:"#dc2626",margin:"0 0 8px",textTransform:"uppercase"}}>What to avoid</p>
            <p style={{fontSize:11,color:C.gray,margin:"0 0 12px"}}>{guide.avoid.length} interactions and combinations to avoid - Pro only.</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {user?<button onClick={onUpgrade} className="evid-shimmer-btn" style={{padding:"8px 18px",background:C.gold,color:C.ink,border:"none",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em"}}>Unlock Pro - $9.99/mo</button>
              :<><button onClick={()=>onAuth("signup")} style={{padding:"8px 14px",background:C.ink,color:C.white,border:"none",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Create account</button>
              <button onClick={onUpgrade} className="evid-shimmer-btn" style={{padding:"8px 14px",background:C.gold,color:C.ink,border:"none",fontSize:10,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif"}}>Go Pro</button></>}
            </div>
          </div>
        )}
        <div style={{padding:"10px 14px",background:`${C.amber}08`,border:`1px solid ${C.amber}20`}}>
          <p style={{fontSize:10,color:C.gray,margin:0,lineHeight:1.6}}>This protocol is based on published clinical research and is for informational purposes only. It does not constitute medical advice. Consult a healthcare provider before starting any supplementation protocol.</p>
        </div>
      </div>
    </div>
  );
}


function PricingPage({onUpgrade,onAuth}){
  const {user,isPro}=useAuth();
  const isMob=useIsMobile();
  const count=Math.floor(SUPPLEMENTS.length/10)*10;

  const rows=[
    {feature:"Compounds",free:"Tier 1 only (33)",pro:`All ${count}+`,highlight:true},
    {feature:"Peptides & GLP-1s",free:false,pro:true},
    {feature:"Biohacking tier (T4)",free:false,pro:true},
    {feature:"Compound pages (full profile)",free:false,pro:true},
    {feature:"AI Compound Advisor",free:"1 free query",pro:"Unlimited",highlight:true},
    {feature:"Conversation memory",free:false,pro:true},
    {feature:"Synergy and protocol suggestions",free:false,pro:true},
    {feature:"Interaction Checker",free:false,pro:true,highlight:true},
    {feature:"Stack Audit AI",free:false,pro:true},
    {feature:"Bloodwork History",free:false,pro:true},
    {feature:"AI Bloodwork Analyzer",free:false,pro:true},
    {feature:"My Tracker",free:false,pro:true},
    {feature:"Compare compounds",free:false,pro:true},
    {feature:"Save your stacks",free:false,pro:true,highlight:true},
  ];

  const S={
    page:{minHeight:"100vh",background:C.bg,padding:isMob?"40px 16px 80px":"60px 24px 100px",fontFamily:"Montserrat,sans-serif"},
    inner:{maxWidth:900,margin:"0 auto"},
    h1:{fontSize:isMob?32:52,fontWeight:900,letterSpacing:"-.04em",color:C.ink,margin:"0 0 12px",textAlign:"center"},
    sub:{fontSize:15,color:C.gray,textAlign:"center",margin:"0 auto 56px",maxWidth:480,lineHeight:1.7},
    card:{background:C.white,border:`1px solid ${C.border}`,padding:isMob?"24px 20px":"36px 32px"},
    btnGold:{padding:"14px 32px",background:C.gold,color:C.ink,border:"none",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Montserrat,sans-serif",letterSpacing:".04em",width:"100%"},
    btnGhost:{padding:"14px 32px",background:"transparent",color:C.gray,border:`1px solid ${C.border}`,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Montserrat,sans-serif",width:"100%"},
  };

  return(
    <div style={S.page}><div style={S.inner}>
      <h1 style={S.h1}>Simple, honest pricing.</h1>
      <p style={S.sub}>One Pro plan. Everything included. Cancel anytime.</p>

      {/* Competitor comparison USP6 */}
      <div style={{maxWidth:700,margin:"0 auto 48px",background:C.white,border:`1px solid ${C.border}`,borderTop:`3px solid ${C.gold}`}}>
        <div style={{padding:"16px 24px 12px",borderBottom:`1px solid ${C.border}`}}>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".16em",color:C.gray,margin:0,textTransform:"uppercase"}}>How Evidstack compares</p>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"Montserrat,sans-serif",fontSize:12}}>
            <thead>
              <tr>
                <th style={{padding:"12px 16px",textAlign:"left",fontWeight:800,color:C.gray,fontSize:10,letterSpacing:".1em",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>Feature</th>
                <th style={{padding:"12px 16px",textAlign:"center",fontWeight:800,color:C.gray,fontSize:10,letterSpacing:".1em",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>Examine.com</th>
                <th style={{padding:"12px 16px",textAlign:"center",fontWeight:800,color:C.gray,fontSize:10,letterSpacing:".1em",textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>ConsumerLab</th>
                <th style={{padding:"12px 16px",textAlign:"center",background:C.ink,fontWeight:800,color:C.gold,fontSize:10,letterSpacing:".1em",textTransform:"uppercase",borderBottom:`1px solid #1f2937`}}>Evidstack Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Price","$29/mo","$50/yr (~$4/mo)","$9.99/mo"],
                ["SARMs, AAS, peptides","Partial","No","Full 370+"],
                ["AI compound advisor","No","No","Yes, unlimited"],
                ["Interaction checker","Basic","No","Full AI analysis"],
                ["Stack audit","No","No","Score 0-100"],
                ["Bloodwork integration","No","No","16 biomarkers"],
                ["Dosage calibration to body","No","No","Weight/age/sex"],
                ["Conflict of interest","Zero","Zero","Zero"],
              ].map(([feat,examine,consumer,evidstack],i)=>(
                <tr key={feat} style={{background:i%2===0?C.white:C.bg}}>
                  <td style={{padding:"10px 16px",fontWeight:700,color:C.ink,borderBottom:`1px solid ${C.border}`}}>{feat}</td>
                  <td style={{padding:"10px 16px",textAlign:"center",color:C.gray,borderBottom:`1px solid ${C.border}`}}>{examine}</td>
                  <td style={{padding:"10px 16px",textAlign:"center",color:C.gray,borderBottom:`1px solid ${C.border}`}}>{consumer}</td>
                  <td style={{padding:"10px 16px",textAlign:"center",fontWeight:800,color:C.gold,background:i%2===0?"#1a1a1a":"#111111",borderBottom:"1px solid #1f2937"}}>{evidstack}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{padding:"12px 16px",textAlign:"center"}}>
          <p style={{fontSize:11,color:C.gray,margin:0}}>Examine.com pricing as of 2025. ConsumerLab $99.95/2 years. Neither covers body-calibrated dosing or AI stack analysis.</p>
        </div>
      </div>

      {/* Plan cards */}
      <div style={{display:"grid",gridTemplateColumns:isMob?"1fr":"1fr 1fr",gap:16,marginBottom:48}}>
        {/* Free */}
        <div style={{...S.card}}>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".18em",color:C.gray,margin:"0 0 16px",textTransform:"uppercase"}}>Free</p>
          <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:6}}>
            <span style={{fontSize:48,fontWeight:900,color:C.ink,lineHeight:1}}>$0</span>
          </div>
          <p style={{fontSize:13,color:C.gray,margin:"0 0 24px"}}>Forever free. No credit card needed.</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:28}}>
            {["Tier 1 compounds (33)","Browse the full database","1 free AI Compound Advisor query","Compound header info (name, tier, safety)"].map(f=>(
              <div key={f} style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{color:C.green,fontWeight:900,fontSize:14}}>✓</span>
                <span style={{fontSize:13,color:C.ink}}>{f}</span>
              </div>
            ))}
          </div>
          <button style={S.btnGhost} onClick={()=>onAuth("signup")}>Create free account</button>
        </div>

        {/* Pro */}
        <div style={{...S.card,borderTop:`3px solid ${C.gold}`,position:"relative"}}>
          <div style={{position:"absolute",top:-1,left:24,background:C.gold,color:C.ink,fontSize:9,fontWeight:800,padding:"3px 10px",letterSpacing:".1em",textTransform:"uppercase"}}>Most popular</div>
          <p style={{fontSize:10,fontWeight:800,letterSpacing:".18em",color:C.gold,margin:"0 0 16px",textTransform:"uppercase"}}>Pro</p>
          <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:4}}>
            <span style={{fontSize:48,fontWeight:900,color:C.ink,lineHeight:1}}>$9.99</span>
            <span style={{fontSize:14,color:C.gray}}>/month</span>
          </div>
          <p style={{fontSize:12,color:C.green,fontWeight:700,margin:"0 0 4px"}}>Or $79/year - save 34%</p>
          <p style={{fontSize:13,color:C.gray,margin:"0 0 24px"}}>Full access. Cancel in one click.</p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:28}}>
            {[`All ${count}+ compounds (Tier 1-4)`,"Peptides, GLP-1s, SARMs, nootropics","AI Compound Advisor - unlimited queries","Interaction Checker - full safety analysis","Stack Audit AI - score and optimize your stack","Bloodwork History - track 16 biomarkers over time","AI Bloodwork Analyzer","My Tracker","Compare compounds","Save your stacks"].map(f=>(
              <div key={f} style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{color:C.gold,fontWeight:900,fontSize:14}}>✓</span>
                <span style={{fontSize:13,color:C.ink,fontWeight:600}}>{f}</span>
              </div>
            ))}
          </div>
          {isPro
            ?<div style={{padding:"13px",background:"#f0fdf4",border:"1px solid #bbf7d0",textAlign:"center",fontSize:13,fontWeight:700,color:"#166534"}}>You are a Pro member</div>
            :<button className="evid-shimmer-btn" style={S.btnGold} onClick={onUpgrade}>Start for $9.99/month</button>
          }
        </div>
      </div>

      {/* Comparison table */}
      <h2 style={{fontSize:20,fontWeight:900,color:C.ink,margin:"0 0 20px",letterSpacing:"-.03em"}}>Full comparison</h2>
      <div style={{border:`1px solid ${C.border}`,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 100px 100px",background:C.ink}}>
          <div style={{padding:"12px 16px"}}/>
          <div style={{padding:"12px 8px",textAlign:"center"}}><span style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:C.gray,textTransform:"uppercase"}}>Free</span></div>
          <div style={{padding:"12px 8px",textAlign:"center"}}><span style={{fontSize:10,fontWeight:800,letterSpacing:".12em",color:C.gold,textTransform:"uppercase"}}>Pro</span></div>
        </div>
        {rows.map((row,i)=>(
          <div key={row.feature} style={{display:"grid",gridTemplateColumns:"1fr 100px 100px",background:row.highlight?`${C.gold}08`:i%2===0?C.white:"#fafaf9",borderTop:`1px solid ${C.border}`}}>
            <div style={{padding:"11px 16px"}}><span style={{fontSize:12,fontWeight:row.highlight?800:500,color:C.ink}}>{row.feature}</span></div>
            <div style={{padding:"11px 8px",textAlign:"center"}}>
              {typeof row.free==="string"
                ?<span style={{fontSize:11,fontWeight:600,color:C.gray}}>{row.free}</span>
                :<span style={{fontSize:14,color:row.free?C.green:"#d1d5db"}}>{row.free?"✓":"-"}</span>}
            </div>
            <div style={{padding:"11px 8px",textAlign:"center"}}>
              {typeof row.pro==="string"
                ?<span style={{fontSize:11,fontWeight:700,color:C.gold}}>{row.pro}</span>
                :<span style={{fontSize:14,color:C.green}}>✓</span>}
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{marginTop:56}}>
        <h2 style={{fontSize:20,fontWeight:900,color:C.ink,margin:"0 0 24px",letterSpacing:"-.03em"}}>Questions</h2>
        {[
          ["Can I cancel anytime?","Yes. Cancel directly from your account in one click. You keep access until the end of your billing period."],
          ["Is my payment secure?","All payments processed by Stripe. We never see or store your card details."],
          ["What is included in the free plan?","The free plan gives you access to all 33 Tier 1 compounds (the most widely studied), the ability to browse the full database, and 1 free query on the AI Compound Advisor so you can experience the tool before upgrading."],
          ["What counts as a Tier 1 compound?","Tier 1 covers the 33 most widely studied foundational compounds: Creatine, Magnesium, Vitamin D3, Omega-3, Zinc, and others with the strongest evidence base."],
          ["Does the AI Compound Advisor replace a doctor?","No. All tools provide informational context based on published research. Always consult a healthcare professional before making changes based on blood work or supplements."],
        ].map(([q,a])=>(
          <div key={q} style={{borderTop:`1px solid ${C.border}`,padding:"18px 0"}}>
            <p style={{fontWeight:800,fontSize:14,color:C.ink,margin:"0 0 8px"}}>{q}</p>
            <p style={{fontSize:13,color:C.gray,margin:0,lineHeight:1.6}}>{a}</p>
          </div>
        ))}
      </div>
    </div></div>
  );
}

export default function App(){
  return <AuthProvider><AppInner/></AuthProvider>;
}
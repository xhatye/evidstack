import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

// Keep the document responsive while the catalogue application and its route
// code are fetched. This also prevents analytics from blocking first paint.
const App = lazy(() => import("./App.jsx"));
const Analytics = lazy(() => import("@vercel/analytics/react").then(module => ({ default: module.Analytics })));

function LoadingShell(){
  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f4f2ee",color:"#1a1a1a",fontFamily:"Montserrat,Arial,sans-serif"}}>
      <div style={{display:"grid",gap:12,justifyItems:"center"}}>
        <span style={{display:"grid",placeItems:"center",width:42,height:42,border:"2px solid #1a1a1a",fontSize:15,fontWeight:900}}>E</span>
        <span style={{fontSize:10,fontWeight:800,letterSpacing:".18em"}}>EVIDSTACK</span>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={<LoadingShell />}><App /></Suspense>
    <Suspense fallback={null}><Analytics /></Suspense>
  </StrictMode>
);


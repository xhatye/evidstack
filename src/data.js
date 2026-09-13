// Lightweight catalogue metadata used by the landing page. The full record
// set is loaded only when the catalogue or a research tool needs it.
export const GOALS = [
  { id: "all", label: "All", icon: "◈" },
  { id: "sleep", label: "Sleep", icon: "😴" },
  { id: "focus", label: "Focus", icon: "🧠" },
  { id: "memory", label: "Memory", icon: "🔬" },
  { id: "mood", label: "Mood", icon: "😊" },
  { id: "force", label: "Strength", icon: "💪" },
  { id: "recovery", label: "Recovery", icon: "🔁" },
  { id: "endurance", label: "Endurance", icon: "🏃" },
  { id: "energy", label: "Energy", icon: "⚡" },
  { id: "hormones", label: "Testosterone", icon: "🩸" },
  { id: "stress", label: "Stress / Cortisol", icon: "🌊" },
  { id: "longevity", label: "Longevity", icon: "❤️" },
  { id: "skin", label: "Skin / Hair", icon: "✨" },
  { id: "cardio", label: "Cardio", icon: "🫀" },
  { id: "weight", label: "Weight Loss", icon: "⚖️" },
  { id: "hair", label: "Hair Health", icon: "💈" },
  { id: "liver", label: "Liver / Detox", icon: "🫁" },
  { id: "recomp", label: "Body Recomp", icon: "🔥" },
  { id: "eyes", label: "Eye Health", icon: "👁️" },
];

export const TIERS = {
  1: { label: "Fundamentals", color: "#4ade80", desc: "Core supplements, extensively studied" },
  2: { label: "Advanced", color: "#60a5fa", desc: "Good evidence base, common use" },
  3: { label: "Expert", color: "#a78bfa", desc: "Real effects, less long-term data" },
  4: { label: "Biohacking", color: "#f97316", desc: "Grey area, advanced users only" },
};

export const CATALOG_COUNT = 394;
export const SUPPLEMENTS = [];

let catalogPromise;
export function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = import("./catalog-data.js").then(({ SUPPLEMENTS: records }) => {
      SUPPLEMENTS.splice(0, SUPPLEMENTS.length, ...records);
      return SUPPLEMENTS;
    });
  }
  return catalogPromise;
}


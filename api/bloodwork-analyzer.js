export const config = { runtime: "nodejs" };

const MARKERS = [
  { key: "testosterone_total", label: "Total Testosterone", unit: "ng/dL", low: 300, high: 1000 },
  { key: "testosterone_free", label: "Free Testosterone", unit: "pg/mL", low: 5, high: 21 },
  { key: "vitamin_d", label: "Vitamin D (25-OH)", unit: "ng/mL", low: 30, high: 100 },
  { key: "ferritin", label: "Ferritin", unit: "ng/mL", low: 30, high: 300 },
  { key: "tsh", label: "TSH", unit: "mIU/L", low: 0.4, high: 4.0 },
  { key: "cortisol", label: "Cortisol (morning)", unit: "mcg/dL", low: 6, high: 23 },
  { key: "dhea_s", label: "DHEA-S", unit: "mcg/dL", low: 70, high: 500 },
  { key: "igf1", label: "IGF-1", unit: "ng/mL", low: 100, high: 300 },
  { key: "shbg", label: "SHBG", unit: "nmol/L", low: 10, high: 57 },
  { key: "estradiol", label: "Estradiol (E2)", unit: "pg/mL", low: 10, high: 40 },
  { key: "crp", label: "CRP (hs-CRP)", unit: "mg/L", low: 0, high: 1.0 },
  { key: "homocysteine", label: "Homocysteine", unit: "mcmol/L", low: 0, high: 10 },
  { key: "hba1c", label: "HbA1c", unit: "%", low: 0, high: 5.7 },
  { key: "fasting_glucose", label: "Fasting Glucose", unit: "mg/dL", low: 70, high: 99 },
  { key: "hdl", label: "HDL Cholesterol", unit: "mg/dL", low: 40, high: 300 },
  { key: "triglycerides", label: "Triglycerides", unit: "mg/dL", low: 0, high: 150 },
];

export { MARKERS };

export default async function handler(req) {
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  const { markers, goals, currentStack } = await req.json();

  const filledMarkers = Object.entries(markers)
    .filter(([, v]) => v !== "" && v !== null && v !== undefined)
    .map(([key, value]) => {
      const def = MARKERS.find((m) => m.key === key);
      if (!def) return null;
      const num = parseFloat(value);
      const status =
        num < def.low ? "LOW" : num > def.high ? "HIGH" : "OPTIMAL";
      return `${def.label}: ${value} ${def.unit} [${status} | ref: ${def.low}-${def.high}]`;
    })
    .filter(Boolean);

  if (filledMarkers.length < 2)
    return new Response(
      JSON.stringify({ error: "Please enter at least 2 blood markers." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );

  const prompt = `You are a world-class evidence-based supplement researcher. Analyze these blood work results and recommend specific supplements. Be precise, cite the mechanism of action, and prioritize by urgency.

Blood markers:
${filledMarkers.join("\n")}

User goals: ${goals?.join(", ") || "general optimization"}
Currently taking: ${currentStack?.join(", ") || "nothing specified"}

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "summary": "Your blood work shows strong testosterone but suboptimal Vitamin D and elevated CRP suggesting systemic inflammation.",
  "priorityScore": 68,
  "flags": [
    {
      "marker": "Vitamin D",
      "status": "LOW",
      "value": "18 ng/mL",
      "urgency": "high",
      "impact": "Low Vitamin D suppresses testosterone production, immune function, and mood. This single deficiency may explain fatigue and low mood scores."
    }
  ],
  "recommendations": [
    {
      "compound": "Vitamin D3 + K2",
      "dose": "5000 IU D3 with 100mcg K2-MK7",
      "timing": "Morning with a fatty meal",
      "rationale": "Direct correction of deficiency. K2 ensures calcium is directed to bones not arteries. Expect improvement in 8-12 weeks with re-test.",
      "priority": 1,
      "alreadyTaking": false
    },
    {
      "compound": "Omega-3 EPA/DHA",
      "dose": "2-4g EPA/DHA daily",
      "timing": "With any meal, split doses",
      "rationale": "hs-CRP of 2.4 indicates low-grade inflammation. Omega-3 at therapeutic doses reduces CRP by 20-35% within 8 weeks per multiple RCTs.",
      "priority": 2,
      "alreadyTaking": false
    }
  ],
  "avoid": [
    {
      "compound": "High-dose Zinc",
      "reason": "Your testosterone is already in range. Excess zinc over 40mg/day can suppress copper and create imbalances without benefit."
    }
  ],
  "retestIn": "8-12 weeks",
  "disclaimer": "This analysis is for informational purposes only and is not medical advice. Consult a qualified healthcare provider before making changes based on blood work."
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1800,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Analysis failed. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

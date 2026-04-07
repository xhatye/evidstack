export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const body = await req.json();
  const { compounds } = body;
  if (!compounds || compounds.length < 2)
    return new Response(JSON.stringify({ error: "Add at least 2 compounds." }), { status: 400, headers: { "Content-Type": "application/json" } });

  const profile = body.userProfile || null;
  const profileCtx = profile && profile.weightKg
    ? `\nUSER PROFILE: ${profile.weightKg}kg, age ${profile.age||"unknown"}, biological sex ${profile.sex||"unknown"}. Factor this into timing recommendations and flag any interactions that are especially relevant to this profile.`
    : "";

  const prompt = `You are a clinical pharmacologist and supplement safety expert. Analyze interactions between the following compounds: ${compounds.join(", ")}${profileCtx}

Evaluate every pair and group for:
- Pharmacokinetic interactions (absorption competition, enzyme inhibition/induction, timing conflicts)
- Pharmacodynamic interactions (additive, synergistic, or antagonistic effects)
- Safety concerns (cardiovascular, hepatotoxic, hormonal, CNS)
- Optimal timing adjustments

Respond ONLY with valid JSON, no markdown:
{
  "overall_verdict": "SAFE" | "CAUTION" | "DANGER",
  "overall_summary": "2-3 sentence overall assessment",
  "interactions": [
    {
      "compounds": ["Compound A", "Compound B"],
      "severity": "positive" | "minor" | "moderate" | "major",
      "type": "synergy" | "absorption" | "enzyme" | "cardiovascular" | "hormonal" | "hepatotoxic" | "CNS" | "timing",
      "description": "Clear explanation of the interaction",
      "recommendation": "Specific actionable advice"
    }
  ],
  "timing_protocol": "Optimal daily timing schedule for all compounds listed",
  "safe_to_stack": true | false
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 2000, temperature: 0.2, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return new Response(JSON.stringify(parsed), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Analysis failed. Please try again." }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

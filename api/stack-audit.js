export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const body = await req.json();
  const { stack, goals, budget } = body;
  if (!stack || stack.trim().length < 3)
    return new Response(JSON.stringify({ error: "Describe your current stack." }), { status: 400, headers: { "Content-Type": "application/json" } });

  const profile = body.userProfile || null;
  const profileCtx = profile && profile.weightKg
    ? `\nUSER PROFILE: ${profile.weightKg}kg, age ${profile.age||"unknown"}, biological sex ${profile.sex||"unknown"}. Adjust all dosage recommendations to this profile using weight-based dosing where applicable, age-adjusted metabolism considerations, and sex-specific reference ranges.`
    : "";

  const prompt = `You are a precision supplement consultant. Audit the following supplement stack:

CURRENT STACK: ${stack}
GOALS: ${goals || "not specified"}
MONTHLY BUDGET: $${budget || "not specified"}${profileCtx}

Perform a comprehensive audit covering:
1. Redundancies (compounds doing the same thing)
2. Critical gaps (what is missing for the stated goals)
3. Timing inefficiencies
4. Cost-to-benefit ratio of each compound
5. Safety concerns or interactions
6. Optimization opportunities
${profileCtx ? "7. Dosage adjustments based on the user profile provided above" : ""}

Respond ONLY with valid JSON, no markdown:
{
  "stack_score": 72,
  "grade": "B",
  "summary": "2-3 sentence overall verdict",
  "compounds_analyzed": [
    {
      "name": "Creatine",
      "verdict": "KEEP" | "OPTIMIZE" | "REPLACE" | "REMOVE",
      "score": 90,
      "reason": "Why this verdict",
      "optimization": "Specific change if OPTIMIZE or REPLACE"
    }
  ],
  "redundancies": ["Compound A and Compound B both do X - keep only the better one"],
  "critical_gaps": ["Missing Y for goal Z - add Compound W"],
  "timing_fixes": ["Take A in the morning, B at night to avoid absorption competition"],
  "cost_analysis": "Assessment of budget efficiency",
  "optimized_stack": "Your recommended final stack in plain text",
  "priority_changes": ["Most important change #1", "Most important change #2", "Most important change #3"]
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 2500, temperature: 0.3, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return new Response(JSON.stringify(parsed), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Audit failed. Please try again." }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

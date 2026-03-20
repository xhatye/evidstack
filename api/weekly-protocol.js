export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { goals, stack, budget, experience } = await req.json();

  const prompt = `You are an expert supplement coach. Create a detailed 4-week progressive supplement protocol.

User profile:
- Goals: ${goals.join(", ")}
- Current stack: ${stack || "none"}
- Monthly budget: $${budget}
- Experience level: ${experience}

Create a week-by-week protocol that introduces compounds progressively, explains the rationale, and includes practical timing.

Respond ONLY with valid JSON:
{
  "protocol_name": "string",
  "overview": "2-3 sentence summary of the approach",
  "weeks": [
    {
      "week": 1,
      "theme": "e.g. Foundation Phase",
      "focus": "What this week establishes",
      "compounds": [
        {
          "name": "string",
          "dose": "string",
          "timing": "string",
          "why_now": "Why introduced this week"
        }
      ],
      "what_to_expect": "Expected effects and adjustment period"
    }
  ],
  "daily_schedule": [
    { "time": "e.g. 7:00 AM", "action": "Compound X + Y with breakfast", "note": "optional tip" }
  ],
  "reassessment": "What to evaluate at week 4 and what to adjust"
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 2000, temperature: 0.3, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    return new Response(clean, { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

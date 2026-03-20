export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const { compounds } = await req.json();
  if (!compounds || compounds.length < 2) {
    return new Response(JSON.stringify({ error: "Enter at least 2 compounds." }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const prompt = `You are an expert pharmacologist and clinical nutritionist specializing in supplement interactions.

Analyze the interactions between these compounds: ${compounds.join(", ")}

For each pair that has a notable interaction (positive or negative), provide a clear analysis.
Then provide an overall safety assessment and timing recommendations.

Respond ONLY with valid JSON, no markdown, no preamble:

{
  "overall_safety": "SAFE" | "CAUTION" | "RISKY",
  "overall_summary": "2-sentence overall assessment",
  "interactions": [
    {
      "compounds": ["Compound A", "Compound B"],
      "type": "SYNERGY" | "CAUTION" | "TIMING" | "NEUTRAL",
      "title": "short title e.g. Zinc + Copper Antagonism",
      "description": "Clear explanation of the interaction and its significance",
      "recommendation": "What to do about it"
    }
  ],
  "timing_protocol": [
    {
      "time": "e.g. Morning with food",
      "compounds": ["list of compounds to take at this time"]
    }
  ],
  "missing_synergies": "Optional compounds that would enhance this stack"
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: 1500, temperature: 0.2, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    return new Response(clean, { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

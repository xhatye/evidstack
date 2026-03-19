export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { goals, budget, existing, restrictions } = await req.json();

  if (!goals || goals.length === 0) {
    return new Response(JSON.stringify({ error: "Provide at least one goal." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const prompt = `You are an expert supplement consultant with deep knowledge of sports medicine, clinical nutrition, and evidence-based supplementation.

A user wants a personalized supplement stack. Build them a precise, evidence-based protocol.

USER INPUT:
- Goals: ${goals.join(", ")}
- Monthly budget: $${budget}
- Already taking: ${existing || "nothing"}
- Restrictions / notes: ${restrictions || "none"}

INSTRUCTIONS:
- Recommend 4-8 compounds that synergize for their goals
- Focus on Tier 1 and Tier 2 compounds (best evidence, best safety)
- Include Tier 3-4 only if explicitly relevant and user seems experienced
- For each compound include: exact dose, timing, why it fits their goals
- Check interactions between all recommended compounds
- Fit within their budget (include estimated cost)
- Respond ONLY with valid JSON, no markdown, no explanation outside the JSON

RESPONSE FORMAT (strict JSON only):
{
  "stack_name": "string",
  "total_cost": "string e.g. $45-65/month",
  "summary": "string 2 sentences",
  "compounds": [
    {
      "name": "string",
      "dose": "string e.g. 5g/day",
      "timing": "string e.g. Post-workout",
      "reason": "string 1 sentence",
      "tier": 1,
      "cost": "string e.g. $10-15/month"
    }
  ],
  "interactions": "string or None identified",
  "progression": "string what to add after 8 weeks"
}`;

  try {
    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1500,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const err = await aiRes.text();
      throw new Error(`AI error: ${err}`);
    }

    const data = await aiRes.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();

    return new Response(clean, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

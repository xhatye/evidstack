import { secure } from "../server/access.js";
export const config = { runtime: "nodejs" };

async function handler(req, context) {
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  const { query, conversationHistory, tierPriority } = await req.json();

  if (!query || query.trim().length < 3)
    return new Response(
      JSON.stringify({ error: "Please describe your goal or issue in more detail." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );

  const systemPrompt = `You are the Evidstack Compound Advisor — a rigorous, evidence-based supplement research engine. Users describe a health goal, symptom, or optimization target, and you respond with the most relevant compounds from the Evidstack database ranked strictly by quality of evidence and strength of effect.

STRICT RULES:
- Never recommend more than 8 compounds per response
- Rank compounds by a combined score: evidence quality (1-5) x efficacy magnitude (1-5)
- Always note if compounds synergize (take together) or conflict (separate)
- Never make medical diagnoses or treatment claims
- Use "studies suggest" / "evidence indicates" — never "will" or "cures"
- Be concise — each compound entry should be scannable, not a wall of text
- If the query is vague, ask one clarifying question before listing compounds
- If the query involves a serious medical condition, note to consult a doctor first

Respond ONLY with valid JSON in exactly this structure (no markdown, no preamble):
{
  "intent": "one-line summary of what the user is trying to achieve",
  "clarify": null,
  "compounds": [
    {
      "rank": 1,
      "name": "Creatine Monohydrate",
      "tier": 1,
      "efficacy": 5,
      "evidence": 5,
      "combined_score": 25,
      "goal_match": "Directly increases phosphocreatine stores, improving peak power output by 5-15% in RCTs",
      "dose": "3-5g/day",
      "timing": "Post-workout or any time",
      "synergy": ["Beta-Alanine"],
      "conflict": [],
      "study_count": 500,
      "study_type": "Meta-analyses"
    }
  ],
  "synergy_note": "Compounds 1 and 3 work via complementary mechanisms and can be stacked. Take compound 2 separately from compound 4 (absorption competition).",
  "stack_suggestion": "Start with compound 1 alone for 4 weeks, then add compound 2. Introduce compound 3 only if goals are not met.",
  "disclaimer": "This analysis is for informational purposes only. Consult a healthcare provider before starting any supplementation protocol."
}

If the user needs clarification, set "clarify" to a single question string and set "compounds" to an empty array.${tierPriority?`

TIER PRIORITY: The user has chosen to prioritize Tier ${tierPriority} compounds (T${tierPriority}: ${["","Fundamentals - strongest evidence, safest, most studied","Advanced - solid evidence, less mainstream","Expert - strong evidence, more complex protocols","Biohacking - cutting-edge, experimental"][tierPriority]}). When multiple compounds have comparable evidence, prefer T${tierPriority} options and rank them higher. Still include compounds from other tiers if they are clearly superior for the stated goal. Mention the tier of each compound in your response.`:""}` ;

  const messages = [
    ...(conversationHistory || []),
    { role: "user", content: query }
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(25000),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
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


export default secure(handler, {"free":true});

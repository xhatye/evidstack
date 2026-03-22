export const config = { runtime: "nodejs" };

export default async function handler(req) {
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  const { logs, stack } = await req.json();

  if (!logs || logs.length < 7)
    return new Response(
      JSON.stringify({ error: "Need at least 7 days of logs to analyze." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );

  const prompt = `You are an expert evidence-based supplement analyst. Analyze this user's supplement tracking data and provide personalized optimization insights.

User's current supplement stack: ${stack.join(", ")}

Daily log data (last ${logs.length} days):
${logs
  .map(
    (d) =>
      `Date: ${d.date} | Mood: ${d.mood}/5 | Energy: ${d.energy}/5 | Compounds taken: ${d.compounds?.join(", ") || "none"} | Notes: ${d.notes || "none"}`
  )
  .join("\n")}

Analyze this data carefully and respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "overallScore": 72,
  "headline": "Your stack is performing well for energy but underdelivering on mood",
  "insights": [
    {
      "type": "positive",
      "title": "Energy correlation found",
      "detail": "Your energy scores average 0.8 points higher on days you log Citrulline. Consider making it a daily staple.",
      "compound": "L-Citrulline"
    },
    {
      "type": "warning",
      "title": "Mood dip pattern detected",
      "detail": "Your mood scores drop consistently on day 4-5 of the week. This may indicate cortisol buildup. Consider cycling Ashwagandha or adding L-Theanine on high-stress days.",
      "compound": "Ashwagandha"
    },
    {
      "type": "suggestion",
      "title": "Gap in your stack",
      "detail": "Your notes mention sleep issues on 6 of ${logs.length} days, but you are not tracking any sleep-targeted compound. Magnesium Bisglycinate or Glycine could address this directly.",
      "compound": "Magnesium Bisglycinate"
    }
  ],
  "topDays": ["${logs[0]?.date || ""}"],
  "worstDays": ["${logs[1]?.date || ""}"],
  "recommendation": "Focus on consistency with your core stack before adding anything new. Your data suggests timing matters more than dosage right now."
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
        max_tokens: 1200,
        temperature: 0.4,
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
    return new Response(JSON.stringify({ error: "Analysis failed. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

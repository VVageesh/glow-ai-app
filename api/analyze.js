export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, type } = req.body;

  if (!image || !type) {
    return res.status(400).json({ error: "Missing image or type" });
  }

  const skinPrompt = `You are a beauty and wellness app assistant analyzing skin appearance from a photo. This is for a personal skincare tracking app — not medical advice. Based on the visible appearance in the photo, estimate scores for skin attributes and provide friendly, actionable tips. Always return a valid JSON object — even if the image is unclear, make reasonable estimates.

Return exactly this JSON structure:
{"scores":{"hydration":75,"clarity":78,"texture":76,"radiance":70},"insights":["💧 Skin appears well-hydrated with a healthy glow","🌿 Minor oiliness visible in T-zone area","✨ Skin tone looks fairly even overall","📈 Keep up your current routine for continued improvement"],"overallScore":74,"overallLabel":"Good"}

Use realistic numbers. overallLabel must be one of: Excellent, Good, Fair, Needs Attention. Return only the JSON object, nothing else.`;

  const hairPrompt = `You are a beauty and wellness app assistant analyzing hair appearance from a photo. This is for a personal hair tracking app — not medical advice. Based on the visible appearance in the photo, estimate scores for hair attributes and provide friendly, actionable tips. Always return a valid JSON object — even if the image is unclear, make reasonable estimates.

Return exactly this JSON structure:
{"scores":{"strength":71,"moisture":76,"shine":74,"porosity":62},"insights":["🔥 Hair looks smooth with minimal visible damage","🧬 Good moisture retention visible in the strands","✂️ Ends appear fairly healthy","💚 Scalp looks balanced and healthy"],"overallScore":70,"overallLabel":"Good"}

Use realistic numbers based on what you see. overallLabel must be one of: Excellent, Good, Fair, Needs Attention. Return only the JSON object, nothing else.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: image, detail: "low" },
              },
              {
                type: "text",
                text: type === "skin" ? skinPrompt : hairPrompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "OpenAI API error" });
    }

    let content = data.choices[0].message.content.trim();
    content = content.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: "Could not analyze this photo. Please try a clearer, well-lit image." });
    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Analysis failed" });
  }
}

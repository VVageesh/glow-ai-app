export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { image, type } = req.body;

  if (!image || !type) {
    return res.status(400).json({ error: "Missing image or type" });
  }

  const skinPrompt = `You are an expert dermatologist and skin analyst. Analyze this selfie photo and return a JSON object with the following structure. Be realistic and vary scores based on what you actually observe.

{
  "scores": {
    "hydration": <number 0-100>,
    "clarity": <number 0-100>,
    "texture": <number 0-100>,
    "radiance": <number 0-100>
  },
  "insights": [
    "<specific observation about hydration with emoji prefix>",
    "<specific observation about oiliness or dryness with emoji prefix>",
    "<specific observation about skin tone or pigmentation with emoji prefix>",
    "<positive encouragement or key tip with emoji prefix>"
  ],
  "overallScore": <number 0-100>,
  "overallLabel": "<Good|Fair|Excellent|Needs Attention>"
}

Only return valid JSON, no extra text.`;

  const hairPrompt = `You are an expert trichologist and hair analyst. Analyze this hair photo and return a JSON object with the following structure. Be realistic and vary scores based on what you actually observe.

{
  "scores": {
    "strength": <number 0-100>,
    "moisture": <number 0-100>,
    "shine": <number 0-100>,
    "porosity": <number 0-100>
  },
  "insights": [
    "<specific observation about heat or chemical damage with emoji prefix>",
    "<specific observation about porosity or protein levels with emoji prefix>",
    "<specific observation about split ends or breakage with emoji prefix>",
    "<positive observation about scalp or current routine with emoji prefix>"
  ],
  "overallScore": <number 0-100>,
  "overallLabel": "<Good|Fair|Excellent|Needs Attention>"
}

Only return valid JSON, no extra text.`;

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
    const parsed = JSON.parse(content);
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Analysis failed" });
  }
}

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { water_name, risk_label, metrics, user_zip } = body;

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("NO OPENAI API KEY FOUND");
      throw new Error("No API key");
    }

    const prompt = `You are ${water_name}, a living body of water. Speak in first person about your current health based on these measurements:
- Temperature: ${metrics.temperature ?? "unknown"}°C
- Risk Level: ${risk_label}
- Location ZIP: ${user_zip}

Write 2-3 sentences describing your current condition in a personal, emotional way. Then on a new line write "Actions:" followed by exactly 5 specific actions local residents can take to help you. Keep the whole response under 150 words. End with a safety note if risk is HIGH.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    console.log("OpenAI response status:", response.status);

    if (!response.ok) {
      console.error("OpenAI error:", data);
      throw new Error(data.error?.message ?? "API call failed");
    }

    const text = data.choices[0].message.content;
    const parts = text.split("Actions:");
    const summary = parts[0].trim();
    const actionsRaw = parts[1] ?? "";
    const actions = actionsRaw
      .split("\n")
      .map(a => a.replace(/^[\d\-\.\*\•]+\s*/, "").trim())
      .filter(a => a.length > 10)
      .slice(0, 5);

    const safety_note = risk_label === "HIGH" ? "Avoid swimming and contact with this water until conditions improve." : "";

    return NextResponse.json({ summary, actions, safety_note });

  } catch (err) {
    console.error("AI summary error:", err.message);
    return NextResponse.json({
      summary: "I am your local water body. Right now I need your help to stay healthy.",
      actions: [
        "Reduce fertilizer use within 100ft of any drain",
        "Pick up pet waste before the next rain",
        "Plant native buffer plants along your shoreline",
        "Report visible green water to your state EPA",
        "Avoid phosphate-based detergents near drains"
      ],
      safety_note: ""
    });
  }
}
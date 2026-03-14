import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { water_name, risk_label, metrics, user_zip } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error("NO ANTHROPIC API KEY FOUND");
      throw new Error("No API key");
    }

    const prompt = `You are ${water_name}, a living body of water. Speak in first person about your current health based on these measurements:
- Temperature: ${metrics.temperature ?? "unknown"}°C
- Risk Level: ${risk_label}
- Location ZIP: ${user_zip}

Write 4-5 sentences describing your current condition in a deeply personal, emotional, and vivid way. Describe what you look like, what you feel, and what is happening to your ecosystem. Make it powerful and moving. Then on a new line write "Actions:" followed by exactly 5 very specific actions local residents in ZIP ${user_zip} can take to help you. Keep the total response under 250 words. If risk is HIGH end with a safety warning.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    console.log("Anthropic response status:", response.status);

    if (!response.ok) {
      console.error("Anthropic error:", data);
      throw new Error(data.error?.message ?? "API call failed");
    }

    const text = data.content[0].text;
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
      summary: "I am your local water body. Right now I need your help to stay healthy. My waters are struggling and the ecosystem within me is suffering. Every action you take makes a real difference to my future.",
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
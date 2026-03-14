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

    const prompt = `You are ${water_name}, a living body of water near ZIP code ${user_zip}. Based on these measurements:
- Temperature: ${metrics.temperature ?? "unknown"}°C
- Risk Level: ${risk_label}

Respond ONLY with a raw JSON object. Do not wrap it in markdown, do not use backticks, do not add any text before or after. Just the JSON object itself:
{
  "summary": "4-5 sentences in first person as the water body, deeply personal and emotional about your current health condition, describing what you look like and feel",
  "actions": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "safety_note": "one sentence safety warning if HIGH risk, empty string if not HIGH",
  "fish_at_risk": ["fish species 1", "fish species 2", "fish species 3"],
  "wildlife_affected": ["wildlife 1", "wildlife 2", "wildlife 3"],
  "health_effects": ["health effect on humans 1", "health effect 2", "health effect 3"],
  "historical_context": "2 sentences about historical bloom patterns for this type of water body in this region of the US",
  "fun_fact": "one surprising and interesting fact about this specific water body or the ecosystem around ZIP ${user_zip}"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-6",
        max_tokens: 800,
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
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      summary: parsed.summary,
      actions: parsed.actions,
      safety_note: parsed.safety_note,
      fish_at_risk: parsed.fish_at_risk,
      wildlife_affected: parsed.wildlife_affected,
      health_effects: parsed.health_effects,
      historical_context: parsed.historical_context,
      fun_fact: parsed.fun_fact
    });

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
      safety_note: "",
      fish_at_risk: ["Largemouth Bass", "Channel Catfish", "Bluegill"],
      wildlife_affected: ["Great Blue Heron", "River Otters", "Painted Turtles"],
      health_effects: ["Skin irritation on contact", "Nausea if water ingested", "Respiratory issues near blooms"],
      historical_context: "Algal blooms in this region have increased significantly over the past decade due to agricultural runoff and warming temperatures.",
      fun_fact: "Algal blooms can be seen from space and have been detected by NASA satellites monitoring water quality across the US."
    });
  }
}
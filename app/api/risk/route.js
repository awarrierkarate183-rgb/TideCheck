"use client";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const turbidity = parseFloat(searchParams.get("turbidity") || 0);
  const temp = parseFloat(searchParams.get("temperature") || 0);
  const oxygen = parseFloat(searchParams.get("dissolved_oxygen") || 0);
  const pH = parseFloat(searchParams.get("pH") || 7);

  let risk = 0;
  risk += turbidity * 0.35;
  risk += temp > 20 ? 0.3 * (temp - 20) : 0;
  risk += oxygen < 6 ? 0.2 * (6 - oxygen) : 0;
  risk += pH > 8 ? 0.15 * (pH - 8) : 0;

  risk = Math.min(Math.max(risk, 0), 100);

  let label = "LOW";
  if (risk > 66) label = "HIGH";
  else if (risk > 33) label = "MEDIUM";

  return new Response(
    JSON.stringify({ risk_score: risk, risk_label: label }),
    { status: 200 }
  );
}
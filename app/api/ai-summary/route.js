<<<<<<< HEAD
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
=======
const https = require("https");
const http = require("http");
const readline = require("readline");
 
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
if (!CLAUDE_API_KEY) {
  throw new Error("Set your CLAUDE_API_KEY environment variable before running this.");
}
 
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dlat = ((lat2 - lat1) * Math.PI) / 180;
  const dlon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dlon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
 
function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
  });
}
 
function httpPost(url, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        ...headers,
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
    req.write(body);
    req.end();
  });
}
 
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
 
async function getCoordinates(zipCode) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(zipCode)}&format=json&limit=1`;
    const results = await httpGet(url, { "User-Agent": "hab_tracker" });
    if (results && results.length > 0) {
      const loc = results[0];
      console.log(`Found location: ${loc.display_name}`);
      return { lat: parseFloat(loc.lat), lon: parseFloat(loc.lon) };
    }
    throw new Error("No results for that zip code.");
  } catch (e) {
    console.log(`Geocoding failed (${e.message}), falling back to center of USA.`);
    return { lat: 39.8283, lon: -98.5795 };
>>>>>>> 17d3a57d23f36ffb201e0d796022a34feab661b3
  }
}
 
async function getRiverName(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const result = await httpGet(url, { "User-Agent": "hab_tracker_reverse" });
    if (result && result.address) {
      const addr = result.address;
      const water =
        addr.river || addr.stream || addr.lake || addr.water ||
        addr.waterway || addr.reservoir || addr.bay || addr.natural;
      if (water) return water;
      const region = addr.county || addr.state_district || addr.state;
      if (region) return `${region} area`;
    }
  } catch (e) {
    // silently fall through
  }
  return "Unknown water body";
}
 
async function fetchEpaData(lat, lon, radiusMiles = 50) {
  const url =
    `https://www.waterqualitydata.us/data/Result/search` +
    `?lat=${lat}&long=${lon}&within=${radiusMiles}` +
    `&characteristicName=Microcystin&characteristicName=Chlorophyll` +
    `&mimeType=json&zip=no`;
 
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "application/json",
  };
 
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Fetching EPA data, attempt ${attempt} of 3...`);
      const results = await httpGet(url, headers);
      const keywords = ["microcystin", "chlorophyll", "cyanotoxin"];
      const records = results
        .filter((rec) => keywords.some((k) => (rec.CharacteristicName || "").toLowerCase().includes(k)))
        .map((rec) => ({
          site:      rec.MonitoringLocationName || "Unknown site",
          lat:       parseFloat(rec.LatitudeMeasure) || lat,
          lon:       parseFloat(rec.LongitudeMeasure) || lon,
          parameter: rec.CharacteristicName || "Unknown",
          value:     rec.ResultMeasureValue || "N/A",
          unit:      rec.ResultMeasureUnitCode || "",
          river:     null,
        }));
      console.log(`Got ${records.length} records from EPA.`);
      return records;
    } catch (e) {
      console.log(`Attempt ${attempt} failed: ${e.message}`);
      if (attempt < 3) {
        console.log("Waiting 3 seconds before retrying...");
        await sleep(3000);
      }
    }
  }
 
  console.log("EPA fetch failed after 3 attempts, using sample data instead.");
  return [];
}
 
function getSampleData(userLat, userLon) {
  console.log("No EPA data available, running on sample data.");
  return [
    { site: "Local Lake",       lat: userLat + 0.05, lon: userLon + 0.05, parameter: "Microcystin",   value: 8.3,  unit: "ug/L", river: null },
    { site: "Nearby Reservoir", lat: userLat - 0.08, lon: userLon + 0.12, parameter: "Chlorophyll a", value: 22.1, unit: "ug/L", river: null },
    { site: "River Tributary",  lat: userLat + 0.15, lon: userLon - 0.07, parameter: "Cyanotoxin",    value: 3.9,  unit: "ug/L", river: null },
    { site: "Community Pond",   lat: userLat - 0.12, lon: userLon - 0.10, parameter: "Microcystin",   value: 1.2,  unit: "ug/L", river: null },
    { site: "State Park Lake",  lat: userLat + 0.20, lon: userLon + 0.18, parameter: "Chlorophyll a", value: 15.7, unit: "ug/L", river: null },
  ];
}
 
async function analyzeWithClaude(habData) {
  let prompt =
    "You are an environmental scientist specializing in harmful algal blooms. " +
    "Analyze the water quality measurements below and write a 2-3 paragraph summary that covers: " +
    "what the data suggests about current bloom conditions, the severity and health risks to people, " +
    "pets, and wildlife, and what people should do to stay safe. Where you have a water body name, " +
    "mention it by name.\n\nData:\n";
 
  for (const rec of habData) {
    const riverNote = rec.river ? ` (${rec.river})` : "";
    prompt += `- ${rec.site}${riverNote}, ${rec.dist.toFixed(1)} km away: ${rec.parameter} = ${rec.value} ${rec.unit}\n`;
  }
 
  try {
    console.log("Sending data to Claude for analysis...");
    const result = await httpPost(
      "https://api.anthropic.com/v1/messages",
      {
        model:      "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages:   [{ role: "user", content: prompt }],
      },
      {
        "x-api-key":         CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      }
    );
    return result.content[0].text;
  } catch (e) {
    return `Claude API call failed: ${e.message}`;
  }
}
 
async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q) => new Promise((resolve) => rl.question(q, resolve));
 
  console.log("HAB Tracker - Harmful Algal Bloom Analyzer\n");
 
  const zipCode = (await question("Enter your ZIP code: ")).trim();
  rl.close();
 
  const { lat: userLat, lon: userLon } = await getCoordinates(zipCode);
  console.log(`Using coordinates: ${userLat.toFixed(4)}, ${userLon.toFixed(4)}\n`);
 
  let data = await fetchEpaData(userLat, userLon);
  if (!data.length) data = getSampleData(userLat, userLon);
 
  for (const rec of data) {
    rec.dist = haversine(userLat, userLon, rec.lat, rec.lon);
  }
  data = data.sort((a, b) => a.dist - b.dist).slice(0, 5);
 
  console.log("\nLooking up water body names...");
  for (const rec of data) {
    rec.river = await getRiverName(rec.lat, rec.lon);
    console.log(`  ${rec.site} -> ${rec.river}`);
  }
 
  console.log("\nTop 5 nearby HAB sites:");
  console.log("-".repeat(50));
  for (let i = 0; i < data.length; i++) {
    const rec = data[i];
    console.log(`${i + 1}. ${rec.site}`);
    console.log(`   Water body : ${rec.river}`);
    console.log(`   Distance   : ${rec.dist.toFixed(1)} km`);
    console.log(`   Parameter  : ${rec.parameter}`);
    console.log(`   Value      : ${rec.value} ${rec.unit}`);
    console.log();
  }
 
  const summary = await analyzeWithClaude(data);
  console.log("-".repeat(50));
  console.log("AI Analysis:\n");
  console.log(summary);
  console.log("-".repeat(50));
}
 
main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});

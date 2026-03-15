"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

const riskColors = { LOW: "#2ECC71", MEDIUM: "#F1C40F", HIGH: "#E74C3C" };
const riskGlow = { LOW: "rgba(46,204,113,0.4)", MEDIUM: "rgba(241,196,15,0.4)", HIGH: "rgba(231,76,60,0.4)" };

function WaterGraphic({ risk_label }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setFrame(f => f + 1), 100);
    return () => clearInterval(interval);
  }, []);

  const scenes = {
    LOW: { bg: "linear-gradient(180deg, #87CEEB 0%, #1E90FF 40%, #006994 100%)", surface: "rgba(135,206,235,0.3)", particles: ["🐟", "🐠", "🐬", "🐙", "⭐"], text: "✨ Clean & Healthy Waters", textColor: "#90EE90", description: "Crystal clear and thriving" },
    MEDIUM: { bg: "linear-gradient(180deg, #8FBC8F 0%, #A3C86D 40%, #6B8E23 100%)", surface: "rgba(143,188,143,0.3)", particles: ["⚠️", "🌿", "🐟", "💚"], text: "⚡ Moderate Concern", textColor: "#FFD700", description: "Some algae activity detected" },
    HIGH: { bg: "linear-gradient(180deg, #556B2F 0%, #3B5323 40%, #1A2E0F 100%)", surface: "rgba(85,107,47,0.3)", particles: ["🦠", "☠️", "🌿", "⚠️"], text: "🚨 Algae Bloom Detected", textColor: "#FF6B6B", description: "Dangerous bloom conditions" }
  };

  const scene = scenes[risk_label] || scenes.MEDIUM;
  const particlePositions = [{l:10,t:40},{l:25,t:60},{l:45,t:35},{l:65,t:55},{l:80,t:42},{l:90,t:65}];

  return (
    <div style={{ width: "100%", height: "220px", borderRadius: "20px", background: scene.bg, marginBottom: "28px", border: `2px solid ${riskColors[risk_label]}44`, boxShadow: `0 0 30px ${riskGlow[risk_label]}, inset 0 0 30px rgba(0,0,0,0.3)`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", left: `-${(frame * 0.5) % 100}%`, width: "200%", height: "40px", background: scene.surface, borderRadius: "50%", transition: "left 0.1s linear" }} />
      <div style={{ position: "absolute", top: "45%", left: `-${(frame * 0.3 + 50) % 100}%`, width: "200%", height: "30px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
      {particlePositions.map((pos, i) => (
        <div key={i} style={{ position: "absolute", left: `${pos.l}%`, top: `${pos.t + Math.sin((frame + i * 20) * 0.1) * 8}%`, fontSize: "1.4rem", transition: "top 0.1s ease" }}>
          {scene.particles[i % scene.particles.length]}
        </div>
      ))}
      <div style={{ position: "absolute", bottom: "16px", left: 0, right: 0, textAlign: "center" }}>
        <p style={{ color: scene.textColor, fontWeight: "bold", fontSize: "1.2rem", textShadow: "0 2px 8px rgba(0,0,0,0.5)", marginBottom: "4px" }}>{scene.text}</p>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>{scene.description}</p>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, icon }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "14px", padding: "16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)", flex: 1 }}>
      <div style={{ fontSize: "1.8rem", marginBottom: "6px" }}>{icon}</div>
      <p style={{ color: "#90CAF9", fontSize: "0.75rem", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</p>
      <p style={{ color: "white", fontSize: "1.2rem", fontWeight: "bold" }}>{value !== null && value !== undefined ? `${value}${unit}` : "N/A"}</p>
    </div>
  );
}

function Tag({ text, color }) {
  return (
    <div style={{ background: `${color}22`, border: `1px solid ${color}55`, borderRadius: "20px", padding: "6px 14px", color: "#E3F2FD", fontSize: "0.9rem" }}>
      {text}
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const zip = searchParams.get("zip") || "44102";
  const [waterData, setWaterData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    setMounted(true);
    import("leaflet/dist/leaflet.css");
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/water?zip=${zip}`);
        const water = await res.json();
        setWaterData(water);
        const aiRes = await fetch("/api/ai-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ water_name: water.water_name, risk_label: water.risk_label, metrics: water.metrics, user_zip: zip }),
        });
        const summary = await aiRes.json();
        setAiSummary(summary);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [zip]);

  const toggleCheck = (idx) => setChecked(prev => ({ ...prev, [idx]: !prev[idx] }));
  const allChecked = aiSummary?.actions?.length > 0 && aiSummary.actions.every((_, i) => checked[i]);

  if (loading || !waterData || !mounted) {
    return (
      <div style={{ background: "linear-gradient(180deg, #020B18 0%, #0A2342 40%, #0E6B8A 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px", animation: "spin 2s linear infinite" }}>🌿</div>
          <p style={{ color: "white", fontSize: "1.4rem", marginBottom: "8px" }}>Analyzing your water...</p>
          <p style={{ color: "#90CAF9", fontSize: "0.9rem" }}>Fetching live USGS data for ZIP {zip}</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(180deg, #020B18 0%, #0A2342 40%, #0E6B8A 100%)", minHeight: "100vh", fontFamily: "sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 style={{ color: "white", fontSize: "2.8rem", fontWeight: "900", marginBottom: "8px", textShadow: "0 0 30px rgba(46,204,113,0.6)" }}>🌿 BloomWatch</h1>
          <p style={{ color: "white", fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px" }}>{waterData.water_name}</p>
          <p style={{ color: "#64B5F6", fontSize: "0.9rem" }}>{waterData.city}, {waterData.state} — ZIP {zip}</p>
        </div>

        {/* Risk Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <div style={{ backgroundColor: riskColors[waterData.risk_label], color: "white", fontSize: "1.5rem", fontWeight: "900", padding: "14px 40px", borderRadius: "50px", animation: waterData.risk_label === "HIGH" ? "pulse 1.5s infinite" : "none", boxShadow: `0 0 40px ${riskGlow[waterData.risk_label]}, 0 4px 20px rgba(0,0,0,0.4)`, letterSpacing: "2px", textTransform: "uppercase" }}>
            {waterData.risk_label === "HIGH" ? "🚨" : waterData.risk_label === "MEDIUM" ? "⚡" : "✅"} {waterData.risk_label} RISK
          </div>
        </div>

        {/* Animated Water Graphic */}
        <WaterGraphic risk_label={waterData.risk_label} />

        {/* Metrics Row */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
          <MetricCard label="Temperature" value={waterData.metrics?.temperature} unit="°C" icon="🌡️" />
          <MetricCard label="Risk Score" value={waterData.risk_score} unit="/100" icon="📊" />
          <MetricCard label="Station" value={waterData.station_id} unit="" icon="📡" />
          <MetricCard label="Source" value="USGS" unit="" icon="🏛️" />
        </div>

        {/* Map */}
        <div style={{ borderRadius: "20px", overflow: "hidden", marginBottom: "28px", boxShadow: `0 0 30px ${riskGlow[waterData.risk_label]}, 0 8px 30px rgba(0,0,0,0.4)`, border: `2px solid ${riskColors[waterData.risk_label]}44` }}>
          <MapContainer center={[waterData.lat, waterData.lng]} zoom={11} style={{ height: "300px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            <Circle center={[waterData.lat, waterData.lng]} radius={800} color={riskColors[waterData.risk_label]} fillOpacity={0.25} weight={3}>
              <Popup><strong>{waterData.water_name}</strong><br />Risk: {waterData.risk_label}<br />ZIP: {zip}</Popup>
            </Circle>
          </MapContainer>
        </div>

        {/* AI Summary Card */}
        <div style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", borderRadius: "20px", padding: "28px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <h3 style={{ color: "white", fontSize: "1.3rem", fontWeight: "bold", marginBottom: "16px" }}>💬 Water Report</h3>
          <p style={{ color: "#E3F2FD", lineHeight: "1.8", marginBottom: "24px", fontSize: "1rem", fontStyle: "italic", borderLeft: `4px solid ${riskColors[waterData.risk_label]}`, paddingLeft: "16px" }}>{aiSummary?.summary}</p>

          <h4 style={{ color: "white", fontWeight: "bold", marginBottom: "16px", fontSize: "1.1rem" }}>✅ What You Can Do This Week</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {aiSummary?.actions?.map((action, idx) => (
              <div key={idx} onClick={() => toggleCheck(idx)} style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", padding: "12px 16px", borderRadius: "12px", background: checked[idx] ? "rgba(46,204,113,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${checked[idx] ? "rgba(46,204,113,0.4)" : "rgba(255,255,255,0.1)"}`, transition: "all 0.2s" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "8px", border: `2px solid ${checked[idx] ? "#2ECC71" : "rgba(255,255,255,0.3)"}`, background: checked[idx] ? "#2ECC71" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                  {checked[idx] && <span style={{ color: "white", fontSize: "14px", fontWeight: "bold" }}>✓</span>}
                </div>
                <span style={{ color: checked[idx] ? "#2ECC71" : "#E3F2FD", textDecoration: checked[idx] ? "line-through" : "none", fontSize: "0.95rem", transition: "all 0.2s" }}>{action}</span>
              </div>
            ))}
          </div>

          {allChecked && (
            <div style={{ marginTop: "20px", textAlign: "center", padding: "16px", background: "rgba(46,204,113,0.15)", borderRadius: "12px", border: "1px solid rgba(46,204,113,0.3)" }}>
              <p style={{ color: "#2ECC71", fontWeight: "bold", fontSize: "1.1rem" }}>🎉 Amazing! You are making a real difference! 🌿</p>
            </div>
          )}

          {aiSummary?.safety_note && (
            <div style={{ marginTop: "16px", padding: "14px 18px", background: "rgba(231,76,60,0.15)", borderRadius: "12px", border: "1px solid rgba(231,76,60,0.35)" }}>
              <p style={{ color: "#FF6B6B", fontWeight: "bold", fontSize: "0.95rem" }}>🚨 {aiSummary.safety_note}</p>
            </div>
          )}
        </div>

        {/* Ecosystem Impact Section */}
        <div style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", borderRadius: "20px", padding: "28px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <h3 style={{ color: "white", fontSize: "1.3rem", fontWeight: "bold", marginBottom: "24px" }}>🌿 Local Ecosystem Impact</h3>

          <div style={{ marginBottom: "22px" }}>
            <h4 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "12px" }}>🐟 Fish Species at Risk</h4>
            <ul style={{ paddingLeft: "18px", margin: 0 }}>
              {aiSummary?.fish_at_risk?.map((fish, i) => (
                <li key={i} style={{ color: "#E3F2FD", fontSize: "0.9rem", lineHeight: "1.7" }}>{fish}</li>
              ))}
            </ul>
          </div>
          <div style={{ marginBottom: "22px" }}>
            <h4 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "12px" }}>🦅 Nearby Wildlife Affected</h4>
            <ul style={{ paddingLeft: "18px", margin: 0 }}>
              {aiSummary?.wildlife_affected?.map((animal, i) => (
                <li key={i} style={{ color: "#E3F2FD", fontSize: "0.9rem", lineHeight: "1.7" }}>{animal}</li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: "22px" }}>
            <h4 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "12px" }}>⚕️ Health Effects on Humans</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {aiSummary?.health_effects?.map((effect, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: "rgba(231,76,60,0.1)", borderRadius: "10px", border: "1px solid rgba(231,76,60,0.2)" }}>
                  <span style={{ fontSize: "1rem" }}>⚠️</span>
                  <span style={{ color: "#E3F2FD", fontSize: "0.9rem" }}>{effect}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "22px" }}>
            <h4 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "12px" }}>📅 Historical Context</h4>
            <p style={{ color: "#E3F2FD", fontSize: "0.9rem", lineHeight: "1.7", borderLeft: "3px solid #0E6B8A", paddingLeft: "14px" }}>
              {aiSummary?.historical_context}
            </p>
          </div>

          <div style={{ marginBottom: "22px" }}>
            <h4 style={{ color: "#F1C40F", fontSize: "1rem", fontWeight: "bold", marginBottom: "12px" }}>💡 Did You Know?</h4>
            <p style={{ color: "#E3F2FD", fontSize: "0.9rem", lineHeight: "1.7", borderLeft: "3px solid #F1C40F", paddingLeft: "14px" }}>
              {aiSummary?.fun_fact}
            </p>
          </div>

        {/* Footer */}
        <div style={{ textAlign: "center", color: "#64B5F6", fontSize: "0.85rem", paddingBottom: "40px" }}>
          <p style={{ marginBottom: "4px" }}>Last updated: {new Date(waterData.last_updated).toLocaleString()}</p>
          <p style={{ marginBottom: "12px" }}>
            Data: <a href="https://waterservices.usgs.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#90CAF9" }}>USGS</a>
            {" / "}
            <a href="https://www.epa.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#90CAF9" }}>EPA</a>
          </p>
          <a href="/home" style={{ color: "white", padding: "10px 24px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.2)", textDecoration: "none", fontSize: "0.9rem" }}>← Check Another ZIP</a>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 40px ${riskGlow.HIGH}; }
          50% { transform: scale(1.06); box-shadow: 0 0 60px ${riskGlow.HIGH}; }
          100% { transform: scale(1); box-shadow: 0 0 40px ${riskGlow.HIGH}; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div style={{ background: "linear-gradient(180deg, #020B18 0%, #0A2342 40%, #0E6B8A 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "white", fontSize: "1.5rem" }}>🌿 Loading...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

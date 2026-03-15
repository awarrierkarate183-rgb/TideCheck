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

function BulletList({ items, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {items?.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <span style={{ color: color, fontSize: "1rem", marginTop: "2px", flexShrink: 0 }}>•</span>
          <span style={{ color: "#E3F2FD", fontSize: "0.95rem", lineHeight: "1.6" }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function LearnMoreModal({ waterData, onClose }) {
  const usgsUrl = `https://waterdata.usgs.gov/monitoring-location/${waterData.station_id}/`;
  const epaUrl = `https://www.epa.gov/nutrientpollution/effects-dead-zones-and-harmful-algal-blooms`;
  const habUrl = `https://www.cdc.gov/harmful-algal-blooms/about/index.html`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(2,11,24,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "linear-gradient(180deg, #0A2342, #0E6B8A)", borderRadius: "24px", padding: "32px", maxWidth: "640px", width: "100%", maxHeight: "85vh", overflowY: "auto", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: "bold", marginBottom: "4px" }}>📖 More About This Water Body</h2>
            <p style={{ color: "#90CAF9", fontSize: "0.9rem" }}>{waterData.water_name}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: "36px", height: "36px", color: "white", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Station info */}
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "14px" }}>📡 Monitoring Station Details</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "Station Name", value: waterData.water_name },
              { label: "Station ID", value: waterData.station_id },
              { label: "Location", value: `${waterData.city}, ${waterData.state}` },
              { label: "Coordinates", value: `${waterData.lat?.toFixed(4)}°N, ${waterData.lng?.toFixed(4)}°W` },
              { label: "Current Temperature", value: waterData.metrics?.temperature ? `${waterData.metrics.temperature}°C` : "N/A" },
              { label: "Risk Score", value: `${waterData.risk_score}/100` },
              { label: "Risk Level", value: waterData.risk_label },
              { label: "Last Updated", value: new Date(waterData.last_updated).toLocaleString() },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ color: "#90CAF9", fontSize: "0.85rem" }}>{item.label}</span>
                <span style={{ color: "white", fontSize: "0.85rem", fontWeight: "600", textAlign: "right", maxWidth: "60%" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What are algal blooms */}
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "12px" }}>🦠 What Are Harmful Algal Blooms?</h3>
          <p style={{ color: "#E3F2FD", fontSize: "0.9rem", lineHeight: "1.7", marginBottom: "12px" }}>
            Harmful Algal Blooms (HABs) occur when colonies of algae grow out of control in water bodies. They are fueled by excess nutrients — mainly nitrogen and phosphorus — from agricultural runoff, sewage, and urban stormwater.
          </p>
          <p style={{ color: "#E3F2FD", fontSize: "0.9rem", lineHeight: "1.7" }}>
            When algae die and decompose, they deplete oxygen in the water — creating "dead zones" where fish and other aquatic life cannot survive. Some blooms produce toxins that are dangerous to humans, pets, and wildlife.
          </p>
        </div>

        {/* Risk level explanation */}
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "14px" }}>📊 Understanding Risk Levels</h3>
          {[
            { level: "LOW", color: "#2ECC71", range: "0–32", desc: "Water conditions are healthy. Normal recreational activities are generally safe." },
            { level: "MEDIUM", color: "#F1C40F", range: "33–66", desc: "Some concern. Monitor conditions. Avoid swallowing water and rinse off after contact." },
            { level: "HIGH", color: "#E74C3C", range: "67–100", desc: "Dangerous conditions. Avoid all contact with water. Keep pets away from the shoreline." },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ background: r.color, color: "white", fontWeight: "bold", fontSize: "0.75rem", padding: "4px 10px", borderRadius: "12px", flexShrink: 0, marginTop: "2px" }}>{r.level}</div>
              <div>
                <span style={{ color: r.color, fontSize: "0.8rem", fontWeight: "bold" }}>Score {r.range} — </span>
                <span style={{ color: "#E3F2FD", fontSize: "0.85rem" }}>{r.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* External links */}
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "14px" }}>🔗 Official Resources</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "📡 View Live Station Data on USGS", url: usgsUrl, color: "#0E6B8A" },
              { label: "🏛️ EPA Nutrient Pollution & HABs", url: epaUrl, color: "#2ECC71" },
              { label: "🦠 CDC Harmful Algal Blooms Guide", url: habUrl, color: "#F1C40F" },
            ].map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: `${link.color}15`, border: `1px solid ${link.color}44`, borderRadius: "12px", textDecoration: "none", transition: "all 0.2s" }}>
                <span style={{ color: link.color, fontSize: "0.9rem", fontWeight: "600" }}>{link.label}</span>
                <span style={{ color: link.color, marginLeft: "auto" }}>→</span>
              </a>
            ))}
          </div>
        </div>

        <button onClick={onClose} style={{ width: "100%", padding: "14px", borderRadius: "14px", background: "linear-gradient(90deg, #0E6B8A, #2ECC71)", color: "white", fontWeight: "700", fontSize: "1rem", border: "none", cursor: "pointer" }}>
          Close ✕
        </button>
      </div>
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
  const [showLearnMore, setShowLearnMore] = useState(false);

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
      {showLearnMore && <LearnMoreModal waterData={waterData} onClose={() => setShowLearnMore(false)} />}

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

        {/* Learn More Button */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <button onClick={() => setShowLearnMore(true)} style={{ padding: "14px 32px", borderRadius: "14px", background: "rgba(255,255,255,0.08)", border: "2px solid rgba(144,202,249,0.4)", color: "#90CAF9", fontWeight: "700", fontSize: "1rem", cursor: "pointer", transition: "all 0.2s", backdropFilter: "blur(10px)" }}>
            📖 Learn More About This Water Body
          </button>
        </div>

        {/* AI Summary Card */}
        <div style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", borderRadius: "20px", padding: "28px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <h3 style={{ color: "white", fontSize: "1.3rem", fontWeight: "bold", marginBottom: "16px" }}>💬 Water Report</h3>
          <p style={{ color: "#E3F2FD", lineHeight: "1.8", marginBottom: "24px", fontSize: "1rem", fontStyle: "italic", borderLeft: `4px solid ${riskColors[waterData.risk_label]}`, paddingLeft: "16px" }}>{aiSummary?.summary}</p>

          <h4 style={{ color: "white", fontWeight: "bold", marginBottom: "16px", fontSize: "1.1rem" }}>✅ What You Can Do This Week</h4>
          <BulletList items={aiSummary?.actions} color="#2ECC71" />

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
            <BulletList items={aiSummary?.fish_at_risk} color="#64B5F6" />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <h4 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "12px" }}>🦅 Nearby Wildlife Affected</h4>
            <BulletList items={aiSummary?.wildlife_affected} color="#2ECC71" />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <h4 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "12px" }}>⚕️ Health Effects on Humans</h4>
            <BulletList items={aiSummary?.health_effects} color="#E74C3C" />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <h4 style={{ color: "#90CAF9", fontSize: "1rem", fontWeight: "bold", marginBottom: "12px" }}>📅 Historical Context</h4>
            <p style={{ color: "#E3F2FD", fontSize: "0.9rem", lineHeight: "1.7", borderLeft: "3px solid #0E6B8A", paddingLeft: "14px" }}>
              {aiSummary?.historical_context}
            </p>
          </div>

          <div style={{ background: "rgba(241,196,15,0.1)", border: "1px solid rgba(241,196,15,0.3)", borderRadius: "14px", padding: "16px" }}>
            <h4 style={{ color: "#F1C40F", fontSize: "1rem", fontWeight: "bold", marginBottom: "8px" }}>💡 Did You Know?</h4>
            <p style={{ color: "#E3F2FD", fontSize: "0.9rem", lineHeight: "1.6" }}>{aiSummary?.fun_fact}</p>
          </div>
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
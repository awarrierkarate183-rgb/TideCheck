"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

const riskColors = { LOW: "#2ECC71", MEDIUM: "#F1C40F", HIGH: "#E74C3C" };

function WaterGraphic({ risk_label }) {
  const scenes = {
    LOW: { bg: "linear-gradient(180deg, #1E90FF 0%, #00CED1 50%, #006994 100%)", emoji: "🐟", text: "Clean & Healthy", textColor: "#90EE90" },
    MEDIUM: { bg: "linear-gradient(180deg, #A3C86D 0%, #6B8E23 50%, #3B5323 100%)", emoji: "⚠️", text: "Some Concern", textColor: "#FFD700" },
    HIGH: { bg: "linear-gradient(180deg, #557A46 0%, #2D4A1E 50%, #1A2E0F 100%)", emoji: "🦠", text: "Algae Bloom Detected", textColor: "#FF6B6B" },
  };
  const scene = scenes[risk_label] || scenes.MEDIUM;

  return (
    <div style={{
      width: "100%",
      height: "180px",
      borderRadius: "16px",
      background: scene.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "24px",
      border: "1px solid rgba(255,255,255,0.2)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Wave animation */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "40px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50% 50% 0 0"
      }} />
      <div style={{ fontSize: "3rem", marginBottom: "8px" }}>{scene.emoji}</div>
      <p style={{ color: scene.textColor, fontWeight: "bold", fontSize: "1.1rem" }}>{scene.text}</p>
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
          body: JSON.stringify({
            water_name: water.water_name,
            risk_label: water.risk_label,
            metrics: water.metrics,
            user_zip: zip,
          }),
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
      <div style={{ background: "linear-gradient(135deg, #0A2342 0%, #0E6B8A 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🌊</div>
          <p style={{ color: "white", fontSize: "1.3rem" }}>Loading your water data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #0A2342 0%, #0E6B8A 100%)",
      minHeight: "100vh",
      fontFamily: "sans-serif",
      padding: "24px 16px"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: "white", fontSize: "2.5rem", fontWeight: "bold", marginBottom: "8px" }}>🌊 TideCheck</h1>
          <p style={{ color: "#90CAF9", fontSize: "1rem" }}>{waterData.water_name}</p>
          <p style={{ color: "#64B5F6", fontSize: "0.9rem" }}>{waterData.city}, {waterData.state} — ZIP {zip}</p>
        </div>

        {/* Risk Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <div style={{
            backgroundColor: riskColors[waterData.risk_label],
            color: "white",
            fontSize: "1.4rem",
            fontWeight: "bold",
            padding: "12px 32px",
            borderRadius: "50px",
            animation: waterData.risk_label === "HIGH" ? "pulse 2s infinite" : "none",
            boxShadow: `0 0 20px ${riskColors[waterData.risk_label]}66`
          }}>
            {waterData.risk_label === "HIGH" ? "⚠️" : waterData.risk_label === "MEDIUM" ? "⚡" : "✅"} {waterData.risk_label} RISK
          </div>
        </div>

        {/* Animated Water Graphic */}
        <WaterGraphic risk_label={waterData.risk_label} />

        {/* Map */}
        <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          <MapContainer
            center={[waterData.lat, waterData.lng]}
            zoom={11}
            style={{ height: "280px", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            <Circle center={[waterData.lat, waterData.lng]} radius={500} color={riskColors[waterData.risk_label]} fillOpacity={0.3}>
              <Popup>{waterData.water_name} — {waterData.risk_label} RISK</Popup>
            </Circle>
          </MapContainer>
        </div>

        {/* AI Summary */}
        <div style={{
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <h3 style={{ color: "white", fontSize: "1.2rem", fontWeight: "bold", marginBottom: "12px" }}>💬 Water Report</h3>
          <p style={{ color: "#E3F2FD", lineHeight: "1.7", marginBottom: "16px" }}>{aiSummary?.summary}</p>

          <h4 style={{ color: "white", fontWeight: "bold", marginBottom: "12px" }}>✅ What You Can Do This Week</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {aiSummary?.actions?.map((action, idx) => (
              <label key={idx} onClick={() => toggleCheck(idx)} style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                color: checked[idx] ? "#2ECC71" : "#E3F2FD",
                textDecoration: checked[idx] ? "line-through" : "none",
                transition: "all 0.2s"
              }}>
                <div style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "6px",
                  border: `2px solid ${checked[idx] ? "#2ECC71" : "rgba(255,255,255,0.4)"}`,
                  background: checked[idx] ? "#2ECC71" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {checked[idx] && <span style={{ color: "white", fontSize: "14px" }}>✓</span>}
                </div>
                {action}
              </label>
            ))}
          </div>

          {allChecked && (
            <div style={{ marginTop: "16px", textAlign: "center", color: "#2ECC71", fontWeight: "bold", fontSize: "1.1rem" }}>
              🎉 You are making a difference! Thank you! 🌊
            </div>
          )}

          {aiSummary?.safety_note && (
            <div style={{ marginTop: "16px", padding: "12px", background: "rgba(231,76,60,0.2)", borderRadius: "8px", border: "1px solid rgba(231,76,60,0.4)" }}>
              <p style={{ color: "#FF6B6B", fontWeight: "bold" }}>⚠️ {aiSummary.safety_note}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", color: "#64B5F6", fontSize: "0.85rem" }}>
          <p>Last updated: {new Date(waterData.last_updated).toLocaleString()}</p>
          <p>Data: <a href="https://waterservices.usgs.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#90CAF9" }}>USGS</a> / <a href="https://www.epa.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#90CAF9" }}>EPA</a></p>
          <a href="/home" style={{ color: "#90CAF9", marginTop: "8px", display: "inline-block" }}>← Check Another ZIP</a>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div style={{ background: "linear-gradient(135deg, #0A2342 0%, #0E6B8A 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "white", fontSize: "1.5rem" }}>🌊 Loading...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
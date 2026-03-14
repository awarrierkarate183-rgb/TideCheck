"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const riskColors = { LOW: "#2ECC71", MEDIUM: "#F1C40F", HIGH: "#E74C3C" };
const riskGlow = { LOW: "rgba(46,204,113,0.3)", MEDIUM: "rgba(241,196,15,0.3)", HIGH: "rgba(231,76,60,0.3)" };
const typeIcons = { "River": "🏞️", "Lake": "🏔️", "Bay / Coast": "🌊", "Canal": "🚤", "Water Body": "💧" };

function SelectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const zip = searchParams.get("zip") || "44102";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchNearby() {
      try {
        const res = await fetch(`/api/nearby-waters?zip=${zip}`);
        const json = await res.json();
        setData(json);
        setLoading(false);
        json.stations.forEach((_, i) => {
          setTimeout(() => setVisibleCards(i + 1), i * 200);
        });
      } catch (err) {
        console.error("Select page error:", err);
        setLoading(false);
      }
    }
    fetchNearby();
  }, [zip]);

  const handleSelect = (station) => {
    setSelected(station.station_id);
    setTimeout(() => {
      router.push(`/dashboard?zip=${zip}&station=${station.station_id}&name=${encodeURIComponent(station.name)}&lat=${station.lat}&lng=${station.lng}`);
    }, 400);
  };

  if (loading) {
    return (
      <div style={{ background: "linear-gradient(180deg, #020B18 0%, #0A2342 40%, #0E6B8A 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px", animation: "spin 2s linear infinite" }}>🌿</div>
          <p style={{ color: "white", fontSize: "1.4rem", marginBottom: "8px" }}>Finding water bodies near you...</p>
          <p style={{ color: "#90CAF9", fontSize: "0.9rem" }}>Scanning USGS stations for ZIP {zip}</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(180deg, #020B18 0%, #0A2342 40%, #0E6B8A 100%)", minHeight: "100vh", fontFamily: "sans-serif", padding: "40px 16px" }}>

      {/* Bubbles */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {[{w:80,h:80,l:5,t:15},{w:120,h:120,l:88,t:60},{w:60,h:60,l:45,t:80},{w:100,h:100,l:70,t:20},{w:70,h:70,l:20,t:70}].map((b, i) => (
          <div key={i} style={{ position: "absolute", width: `${b.w}px`, height: `${b.h}px`, left: `${b.l}%`, top: `${b.t}%`, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
        ))}
      </div>

      <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ color: "white", fontSize: "2.8rem", fontWeight: "900", marginBottom: "8px", textShadow: "0 0 30px rgba(46,204,113,0.6)" }}>🌿 BloomWatch</h1>
          <p style={{ color: "white", fontSize: "1.2rem", fontWeight: "600", marginBottom: "6px" }}>
            Water bodies near {data?.city}, {data?.state}
          </p>
          <p style={{ color: "#90CAF9", fontSize: "0.95rem" }}>
            Select a water body to see its full health report
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {data?.stations?.map((station, i) => (
            <div
              key={station.station_id}
              onClick={() => handleSelect(station)}
              style={{
                background: selected === station.station_id
                  ? `rgba(${station.risk_label === "HIGH" ? "231,76,60" : station.risk_label === "MEDIUM" ? "241,196,15" : "46,204,113"},0.2)`
                  : "rgba(255,255,255,0.07)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                padding: "24px",
                border: `2px solid ${selected === station.station_id ? riskColors[station.risk_label] : "rgba(255,255,255,0.1)"}`,
                boxShadow: selected === station.station_id ? `0 0 30px ${riskGlow[station.risk_label]}` : "0 4px 20px rgba(0,0,0,0.3)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                opacity: i < visibleCards ? 1 : 0,
                transform: i < visibleCards ? "translateY(0)" : "translateY(20px)",
                display: "flex",
                alignItems: "center",
                gap: "20px"
              }}
            >
              {/* Rank */}
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: `${riskColors[station.risk_label]}22`, border: `2px solid ${riskColors[station.risk_label]}66`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: riskColors[station.risk_label], fontWeight: "900", fontSize: "1.2rem" }}>{i + 1}</span>
              </div>

              {/* Type icon */}
              <div style={{ fontSize: "2.2rem", flexShrink: 0 }}>{typeIcons[station.type] || "💧"}</div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <p style={{ color: "white", fontWeight: "700", fontSize: "1.05rem", marginBottom: "6px" }}>{station.name}</p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <span style={{ color: "#90CAF9", fontSize: "0.85rem" }}>📍 {station.distance} miles away</span>
                  <span style={{ color: "#90CAF9", fontSize: "0.85rem" }}>{typeIcons[station.type]} {station.type}</span>
                  {station.temperature !== null && (
                    <span style={{ color: "#90CAF9", fontSize: "0.85rem" }}>🌡️ {station.temperature}°C</span>
                  )}
                </div>
              </div>

              {/* Risk badge */}
              <div style={{ background: riskColors[station.risk_label], color: "white", fontWeight: "800", fontSize: "0.8rem", padding: "6px 14px", borderRadius: "20px", flexShrink: 0, letterSpacing: "1px", boxShadow: `0 0 12px ${riskGlow[station.risk_label]}` }}>
                {station.risk_label === "HIGH" ? "🚨" : station.risk_label === "MEDIUM" ? "⚡" : "✅"} {station.risk_label}
              </div>

              <div style={{ color: "#90CAF9", fontSize: "1.3rem", flexShrink: 0 }}>→</div>
            </div>
          ))}
        </div>

        {/* Back button */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <a href="/home" style={{ color: "#90CAF9", border: "1px solid rgba(144,202,249,0.3)", padding: "10px 24px", borderRadius: "20px", textDecoration: "none", fontSize: "0.9rem" }}>
            ← Enter a different ZIP
          </a>
        </div>

      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function SelectPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "linear-gradient(180deg, #020B18 0%, #0A2342 40%, #0E6B8A 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "white", fontSize: "1.5rem" }}>🌿 Loading...</p>
      </div>
    }>
      <SelectContent />
    </Suspense>
  );
}
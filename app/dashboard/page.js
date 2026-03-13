"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./dashboard.module.css";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

const riskColors = { LOW: "#2ECC71", MEDIUM: "#F1C40F", HIGH: "#E74C3C" };
const waterColors = { LOW: "#1E90FF", MEDIUM: "#A3C86D", HIGH: "#557A46" };

function DashboardContent() {
  const searchParams = useSearchParams();
  const zip = searchParams.get("zip") || "44102";

  const [waterData, setWaterData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

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

  if (loading || !waterData || !mounted) {
    return (
      <div style={{background: "linear-gradient(135deg, #0A2342, #0E6B8A)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <p style={{color: "white", fontSize: "1.5rem"}}>🌊 Loading your water data...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.waterBackground} style={{backgroundColor: waterColors[waterData.risk_label], transition: "background-color 1s ease-in-out"}} />

      {/* Header */}
      <h1 style={{color: "white", fontSize: "2rem", fontWeight: "bold", marginBottom: "4px"}}>🌊 TideCheck</h1>
      <p style={{color: "#90CAF9", marginBottom: "20px"}}>{waterData.water_name} — {waterData.city}, {waterData.state}</p>

      {/* Risk Badge */}
      <div className={styles.riskBadge} style={{
        backgroundColor: riskColors[waterData.risk_label],
        animation: waterData.risk_label === "HIGH" ? "pulse 2s infinite" : "none"
      }}>
        {waterData.risk_label === "HIGH" ? "⚠️" : waterData.risk_label === "MEDIUM" ? "⚡" : "✅"} {waterData.risk_label} RISK
      </div>

      {/* Map */}
      <div className={styles.mapContainer}>
        <MapContainer
          center={[waterData.lat, waterData.lng]}
          zoom={11}
          style={{height: "300px", width: "100%"}}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          <Circle center={[waterData.lat, waterData.lng]} radius={500} color={riskColors[waterData.risk_label]}>
            <Popup>{waterData.water_name} — {waterData.risk_label} RISK</Popup>
          </Circle>
        </MapContainer>
      </div>

      {/* AI Summary */}
      <div className={styles.aiCard}>
        <h3>💬 Water Report</h3>
        <p>{aiSummary?.summary}</p>
        <ul>
          {aiSummary?.actions?.map((action, idx) => (
            <li key={idx}>
              <input type="checkbox" id={`action-${idx}`} />
              <label htmlFor={`action-${idx}`}>{action}</label>
            </li>
          ))}
        </ul>
        {aiSummary?.safety_note && (
          <p className={styles.safetyNote}>⚠️ {aiSummary.safety_note}</p>
        )}
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        Last updated: {new Date(waterData.last_updated).toLocaleString()} | Data: USGS/EPA
        <br />
        <a href="/" style={{color: "#90CAF9"}}>← Check another ZIP</a>
      </footer>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div style={{background: "linear-gradient(135deg, #0A2342, #0E6B8A)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <p style={{color: "white", fontSize: "1.5rem"}}>🌊 Loading...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
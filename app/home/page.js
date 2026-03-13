"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!zip || zip.length !== 5) return;
    setLoading(true);
    router.push(`/dashboard?zip=${zip}`);
  };

  const handleDemo = () => {
    setLoading(true);
    router.push(`/dashboard?zip=44102`);
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0A2342 0%, #0E6B8A 100%)",
      padding: "20px",
      fontFamily: "sans-serif"
    }}>

      {/* Bubbles */}
      <div style={{position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0}}>
        {[
          { w: 80, h: 80, l: 10, t: 20 },
          { w: 120, h: 120, l: 25, t: 60 },
          { w: 60, h: 60, l: 50, t: 10 },
          { w: 100, h: 100, l: 70, t: 40 },
          { w: 90, h: 90, l: 85, t: 70 },
          { w: 70, h: 70, l: 40, t: 80 },
          { w: 110, h: 110, l: 60, t: 25 },
          { w: 85, h: 85, l: 15, t: 50 },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute",
            width: `${b.w}px`,
            height: `${b.h}px`,
            left: `${b.l}%`,
            top: `${b.t}%`,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)"
          }} />
        ))}
      </div>

      {/* Header */}
      <div style={{textAlign: "center", marginBottom: "48px", zIndex: 1}}>
        <h1 style={{
          fontSize: "4rem",
          fontWeight: "bold",
          color: "white",
          marginBottom: "12px"
        }}>🌊 TideCheck</h1>
        <p style={{
          fontSize: "1.2rem",
          color: "#90CAF9"
        }}>Know your water. Protect your world.</p>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "20px",
        padding: "40px",
        width: "100%",
        maxWidth: "440px",
        border: "1px solid rgba(255,255,255,0.2)",
        zIndex: 1
      }}>
        <h2 style={{
          color: "white",
          fontSize: "1.5rem",
          fontWeight: "600",
          textAlign: "center",
          marginBottom: "8px"
        }}>Check Your Local Water</h2>

        <p style={{
          color: "#90CAF9",
          textAlign: "center",
          marginBottom: "28px",
          fontSize: "0.95rem"
        }}>Enter your ZIP code to see algal bloom risk near you</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter ZIP code..."
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            maxLength={5}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              fontSize: "1.1rem",
              textAlign: "center",
              marginBottom: "16px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #0E6B8A, #2ECC71)",
              color: "white",
              fontWeight: "600",
              fontSize: "1.1rem",
              border: "none",
              cursor: "pointer",
              marginBottom: "12px"
            }}
          >
            {loading ? "Loading... 🌊" : "Find My Water 🔍"}
          </button>
        </form>

        <button
          onClick={handleDemo}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            background: "transparent",
            color: "#90CAF9",
            border: "1px solid rgba(144,202,249,0.4)",
            cursor: "pointer",
            fontSize: "0.95rem"
          }}
        >
          Try Demo Location (Cleveland, OH)
        </button>
      </div>

    </main>
  );
}
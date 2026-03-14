"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [zip, setZip] = useState("");
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(interval);
  }, []);

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
      background: "linear-gradient(180deg, #020B18 0%, #0A2342 30%, #0E6B8A 70%, #1a9e8f 100%)",
      padding: "20px",
      fontFamily: "sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>

      {/* Stars */}
      {[
        {l:5,t:8},{l:15,t:3},{l:25,t:12},{l:40,t:5},{l:55,t:9},
        {l:70,t:4},{l:80,t:11},{l:90,t:6},{l:35,t:15},{l:60,t:2},
        {l:10,t:18},{l:85,t:16},{l:48,t:7},{l:72,t:14},{l:22,t:1}
      ].map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${s.l}%`,
          top: `${s.t}%`,
          width: "3px",
          height: "3px",
          borderRadius: "50%",
          background: "white",
          opacity: 0.6,
        }} />
      ))}

      {/* Bubbles */}
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
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)"
        }} />
      ))}

      {/* Seaweed left */}
      <div style={{ position: "absolute", bottom: 0, left: "3%", display: "flex", gap: "12px", alignItems: "flex-end" }}>
        {[
          { h: 220, delay: 0 },
          { h: 280, delay: 0.3 },
          { h: 180, delay: 0.6 },
          { h: 320, delay: 0.2 },
          { h: 150, delay: 0.8 },
        ].map((s, i) => (
          <div key={i} style={{
            width: "18px",
            height: `${s.h}px`,
            background: `linear-gradient(180deg, #2ECC71, #1a7a4a)`,
            borderRadius: "40px 40px 8px 8px",
            transformOrigin: "bottom center",
            animation: `sway${i % 2 === 0 ? "L" : "R"} ${2 + s.delay}s ease-in-out infinite`,
            opacity: 0.85
          }} />
        ))}
      </div>

      {/* Seaweed right */}
      <div style={{ position: "absolute", bottom: 0, right: "3%", display: "flex", gap: "12px", alignItems: "flex-end" }}>
        {[
          { h: 260, delay: 0.4 },
          { h: 200, delay: 0.1 },
          { h: 300, delay: 0.7 },
          { h: 170, delay: 0.5 },
          { h: 240, delay: 0.9 },
        ].map((s, i) => (
          <div key={i} style={{
            width: "18px",
            height: `${s.h}px`,
            background: `linear-gradient(180deg, #27AE60, #145a32)`,
            borderRadius: "40px 40px 8px 8px",
            transformOrigin: "bottom center",
            animation: `sway${i % 2 === 0 ? "R" : "L"} ${2.5 + s.delay}s ease-in-out infinite`,
            opacity: 0.85
          }} />
        ))}
      </div>

      {/* Fish */}
      <div style={{
        position: "absolute",
        bottom: "18%",
        left: "-60px",
        fontSize: "2rem",
        animation: "swimAcross 18s linear infinite",
      }}>🐠</div>
      <div style={{
        position: "absolute",
        bottom: "35%",
        left: "-60px",
        fontSize: "1.5rem",
        animation: "swimAcross 25s linear infinite",
        animationDelay: "8s"
      }}>🐟</div>
      <div style={{
        position: "absolute",
        bottom: "55%",
        right: "-60px",
        fontSize: "1.8rem",
        animation: "swimBack 20s linear infinite",
        animationDelay: "3s"
      }}>🐡</div>

      {/* Coral bottom */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "60px",
        background: "linear-gradient(180deg, transparent, rgba(10,35,66,0.8))",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: "20px",
        paddingBottom: "4px"
      }}>
        {["🪸", "🪸", "🌿", "🪸", "🌿", "🪸", "🪸"].map((c, i) => (
          <span key={i} style={{ fontSize: "1.8rem" }}>{c}</span>
        ))}
      </div>

      {/* Main content */}
      <div style={{ textAlign: "center", marginBottom: "40px", zIndex: 1 }}>
        <div style={{ fontSize: "5rem", marginBottom: "8px" }}>🌊</div>
        <h1 style={{
          fontSize: "5rem",
          fontWeight: "900",
          color: "white",
          marginBottom: "12px",
          textShadow: "0 0 40px rgba(14,107,138,0.8), 0 4px 20px rgba(0,0,0,0.5)",
          letterSpacing: "-2px"
        }}>TideCheck</h1>
        <p style={{
          fontSize: "1.3rem",
          color: "#90CAF9",
          marginBottom: "4px",
          letterSpacing: "2px",
          textTransform: "uppercase"
        }}>Know your water.</p>
        <p style={{
          fontSize: "1.3rem",
          color: "#64B5F6",
          letterSpacing: "2px",
          textTransform: "uppercase"
        }}>Protect your world.</p>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        padding: "40px",
        width: "100%",
        maxWidth: "480px",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        zIndex: 1
      }}>
        <h2 style={{
          color: "white",
          fontSize: "1.6rem",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "8px"
        }}>Check Your Local Water</h2>

        <p style={{
          color: "#90CAF9",
          textAlign: "center",
          marginBottom: "28px",
          fontSize: "1rem",
          lineHeight: "1.5"
        }}>Enter your ZIP code to get a real-time algal bloom risk report for your nearest water body</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter ZIP code..."
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            maxLength={5}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "white",
              fontSize: "1.2rem",
              textAlign: "center",
              marginBottom: "16px",
              outline: "none",
              boxSizing: "border-box",
              letterSpacing: "4px"
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "14px",
              background: loading ? "#555" : "linear-gradient(90deg, #0E6B8A, #2ECC71)",
              color: "white",
              fontWeight: "700",
              fontSize: "1.15rem",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "12px",
              boxShadow: "0 4px 20px rgba(46,204,113,0.3)",
              transition: "all 0.2s"
            }}
          >
            {loading ? "🌊 Loading..." : "Find My Water 🔍"}
          </button>
        </form>

        <button
          onClick={handleDemo}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "14px",
            background: "transparent",
            color: "#90CAF9",
            border: "1px solid rgba(144,202,249,0.35)",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "0.95rem",
            transition: "all 0.2s"
          }}
        >
          🎯 Try Demo Location (Cleveland, OH)
        </button>

        {/* Stats */}
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "28px",
          paddingTop: "20px",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          {[
            { number: "2,000+", label: "Water bodies tracked" },
            { number: "Real-time", label: "Live USGS data" },
            { number: "Any ZIP", label: "US coverage" },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ color: "#2ECC71", fontWeight: "bold", fontSize: "1rem", marginBottom: "4px" }}>{stat.number}</p>
              <p style={{ color: "#90CAF9", fontSize: "0.75rem" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes swayL {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes swayR {
          0%, 100% { transform: rotate(8deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes swimAcross {
          0% { left: -60px; }
          100% { left: 110%; }
        }
        @keyframes swimBack {
          0% { right: -60px; }
          100% { right: 110%; }
        }
      `}</style>

    </main>
  );
}
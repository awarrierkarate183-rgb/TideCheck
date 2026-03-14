export default function AboutPage() {
  const teamValues = [
    { icon: "🌿", title: "Sustainability", desc: "We believe protecting the environment shouldn't require a degree or an expensive lab." },
    { icon: "💻", title: "Technology", desc: "We combine cutting-edge AI and real government data to make environmental science accessible." },
    { icon: "🌊", title: "Community", desc: "We built BloomWatch so even your local community can understand and act on water health." },
    { icon: "🔬", title: "Science", desc: "Every insight is powered by real USGS and EPA data — the same sources scientists use." },
  ];

  return (
    <div style={{ background: "linear-gradient(180deg, #020B18 0%, #0A2342 40%, #0E6B8A 100%)", minHeight: "100vh", fontFamily: "sans-serif", padding: "40px 16px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "12px" }}>🌿</div>
          <h1 style={{ color: "white", fontSize: "3rem", fontWeight: "900", marginBottom: "12px", textShadow: "0 0 30px rgba(46,204,113,0.6)" }}>About BloomWatch</h1>
          <p style={{ color: "#90CAF9", fontSize: "1.1rem", lineHeight: "1.6", maxWidth: "600px", margin: "0 auto" }}>
            Built by students. Powered by real data. Driven by a passion for our planet.
          </p>
        </div>

        {/* Mission statement */}
        <div style={{ background: "rgba(46,204,113,0.08)", backdropFilter: "blur(20px)", borderRadius: "24px", padding: "36px", marginBottom: "32px", border: "2px solid rgba(46,204,113,0.2)", boxShadow: "0 0 30px rgba(46,204,113,0.1)" }}>
          <h2 style={{ color: "#2ECC71", fontSize: "1.4rem", fontWeight: "bold", marginBottom: "16px" }}>🎯 Our Mission</h2>
          <p style={{ color: "#E3F2FD", fontSize: "1.05rem", lineHeight: "1.9" }}>
            We are a team of students and future engineers and scientists who refuse to accept the norm of declining environmental health. Driven by a passion for sustainability and new technology, we combined our various skills to prove that the next generation of environmental solutions starts in our classroom and this hackathon.
          </p>
          <div style={{ marginTop: "20px", height: "2px", background: "linear-gradient(90deg, transparent, rgba(46,204,113,0.4), transparent)" }} />
          <p style={{ color: "#E3F2FD", fontSize: "1.05rem", lineHeight: "1.9", marginTop: "20px" }}>
            Protecting our environment shouldn't require a degree or an expensive lab. It should be simple and easy. We made an open-access app that can help detect algal blooms so even your local community can do something about it. By utilizing an API we can determine the health of your nearest water body and we provide solutions on how we can improve the health.
          </p>
        </div>

        {/* Values grid */}
        <h2 style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "20px", textAlign: "center" }}>What We Stand For</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "16px", marginBottom: "32px" }}>
          {teamValues.map((v, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", borderRadius: "18px", padding: "24px", border: "1px solid rgba(255,255,255,0.12)", transition: "all 0.2s" }}>
              <div style={{ fontSize: "2.2rem", marginBottom: "10px" }}>{v.icon}</div>
              <h3 style={{ color: "white", fontWeight: "bold", fontSize: "1.1rem", marginBottom: "8px" }}>{v.title}</h3>
              <p style={{ color: "#90CAF9", fontSize: "0.9rem", lineHeight: "1.6" }}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "24px", padding: "32px", marginBottom: "32px", border: "1px solid rgba(255,255,255,0.12)" }}>
          <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: "bold", marginBottom: "20px" }}>⚙️ How BloomWatch Works</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { step: "1", title: "Enter Your ZIP Code", desc: "We find the 5 nearest water monitoring stations to your location using USGS data.", color: "#0E6B8A" },
              { step: "2", title: "Select Your Water Body", desc: "Choose from the nearest rivers, lakes, and streams — each showing real-time risk levels.", color: "#2ECC71" },
              { step: "3", title: "Get Your Report", desc: "Our AI analyzes the live data and speaks as the water body itself, giving you a personal, emotional report.", color: "#F1C40F" },
              { step: "4", title: "Take Action", desc: "Get hyper-local action steps, ecosystem impact info, and educational resources specific to your area.", color: "#E74C3C" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `${item.color}22`, border: `2px solid ${item.color}66`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: item.color, fontWeight: "900", fontSize: "1rem" }}>{item.step}</span>
                </div>
                <div>
                  <h4 style={{ color: "white", fontWeight: "bold", marginBottom: "4px" }}>{item.title}</h4>
                  <p style={{ color: "#90CAF9", fontSize: "0.9rem", lineHeight: "1.5" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data sources */}
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "24px", padding: "32px", marginBottom: "32px", border: "1px solid rgba(255,255,255,0.12)" }}>
          <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: "bold", marginBottom: "16px" }}>🏛️ Our Data Sources</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { name: "USGS", desc: "US Geological Survey — live water monitoring stations", color: "#0E6B8A" },
              { name: "EPA", desc: "Environmental Protection Agency — water quality data", color: "#2ECC71" },
              { name: "NOAA", desc: "National Oceanic and Atmospheric Administration", color: "#F1C40F" },
              { name: "AI", desc: "Advanced language model for personalized insights", color: "#E74C3C" },
            ].map((src, i) => (
              <div key={i} style={{ background: `${src.color}15`, border: `1px solid ${src.color}44`, borderRadius: "14px", padding: "14px 18px", flex: 1, minWidth: "160px" }}>
                <p style={{ color: src.color, fontWeight: "bold", fontSize: "1rem", marginBottom: "4px" }}>{src.name}</p>
                <p style={{ color: "#90CAF9", fontSize: "0.8rem", lineHeight: "1.4" }}>{src.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "32px", background: "rgba(46,204,113,0.08)", borderRadius: "24px", border: "1px solid rgba(46,204,113,0.2)" }}>
          <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: "bold", marginBottom: "8px" }}>Ready to check your water? 🌿</h2>
          <p style={{ color: "#90CAF9", marginBottom: "20px" }}>Built at SMathHacks 2026 — Under the Sea theme — Interface Design Track</p>
          <a href="/home" style={{ display: "inline-block", padding: "14px 32px", borderRadius: "14px", background: "linear-gradient(90deg, #0E6B8A, #2ECC71)", color: "white", fontWeight: "700", fontSize: "1rem", textDecoration: "none" }}>
            Check Your Water →
          </a>
        </div>

      </div>
    </div>
  );
}
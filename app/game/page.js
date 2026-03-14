"use client";
import { useEffect, useRef, useState } from "react";

export default function GamePage() {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    running: false, tool: 'treat', health: 100, score: 0,
    population: 50, tick: 0, raf: null,
    blooms: [], fish: [], aerators: [], barriers: [], particles: []
  });
  const [tool, setToolState] = useState('treat');
  const [hud, setHud] = useState({ health: 100, blooms: 0, score: 0, population: 50 });
  const [msg, setMsg] = useState('Select a tool and click the river.');
  const [phase, setPhase] = useState('start'); // start | playing | won | lost
  const [finalScore, setFinalScore] = useState(0);

  const W = 700, H = 360, RT = 60, RB = 300;

  function r(a, b) { return a + Math.random() * (b - a); }

  function setTool(t) {
    setToolState(t);
    stateRef.current.tool = t;
  }

  function addBloom(visible) {
    stateRef.current.blooms.push({
      x: r(40, W - 40), y: r(RT + 15, RB - 15),
      rad: r(28, 55), op: visible ? r(0.5, 0.9) : 0.15, age: 0
    });
  }

  function addFish() {
    stateRef.current.fish.push({
      x: r(-50, -10), y: r(RT + 20, RB - 20), spd: r(0.7, 1.6), vy: 0
    });
  }

  function startGame() {
    const s = stateRef.current;
    s.running = true; s.health = 100; s.score = 0;
    s.population = 50; s.tick = 0;
    s.blooms = []; s.fish = []; s.aerators = []; s.barriers = []; s.particles = [];
    for (let i = 0; i < 5; i++) addBloom(true);
    for (let i = 0; i < 4; i++) addFish();
    setPhase('playing');
    setHud({ health: 100, blooms: 0, score: 0, population: 50 });
    cancelAnimationFrame(s.raf);
    requestAnimationFrame(loop);
  }

  function reducePop() {
    const s = stateRef.current;
    if (!s.running) return;
    if (s.population > 10) { s.population -= 10; s.score += 5; setMsg('Runoff reduced! ✅'); }
    else setMsg('Already minimal runoff.');
  }

  function drawScene(ctx) {
    const s = stateRef.current;
    ctx.clearRect(0, 0, W, H);

    // Sky
    ctx.fillStyle = '#0A2342';
    ctx.fillRect(0, 0, W, 22);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    [[0.08,5],[0.22,12],[0.45,4],[0.67,9],[0.85,6],[0.3,15],[0.55,10]].forEach(([lx,ly]) => {
      ctx.beginPath(); ctx.arc(lx*W, ly, 1.5, 0, Math.PI*2); ctx.fill();
    });

    // Top bank
    const topG = ctx.createLinearGradient(0, 18, 0, RT+5);
    topG.addColorStop(0, '#1a7a4a');
    topG.addColorStop(1, '#2ECC71');
    ctx.fillStyle = topG;
    ctx.fillRect(0, 18, W, RT - 13);

    // River
    const rG = ctx.createLinearGradient(0, RT, 0, RB);
    rG.addColorStop(0, '#0E6B8A');
    rG.addColorStop(0.4, '#085472');
    rG.addColorStop(1, '#063548');
    ctx.fillStyle = rG;
    ctx.fillRect(0, RT, W, RB - RT);

    // Ripples
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = RT + 20 + i * 46;
      ctx.beginPath(); ctx.moveTo(0, y);
      ctx.bezierCurveTo(W*0.3, y-10, W*0.7, y+10, W, y);
      ctx.stroke();
    }

    // Bottom bank
    const botG = ctx.createLinearGradient(0, RB-5, 0, H);
    botG.addColorStop(0, '#2ECC71');
    botG.addColorStop(1, '#1a7a4a');
    ctx.fillStyle = botG;
    ctx.fillRect(0, RB - 5, W, H - RB + 5);

    // Seaweed
    [[0.05],[0.12],[0.88],[0.95],[0.5],[0.35],[0.65]].forEach(([sx], i) => {
      ctx.strokeStyle = i % 2 === 0 ? '#27AE60' : '#2ECC71';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx*W, RB - 5);
      ctx.quadraticCurveTo(sx*W + (i%2===0?10:-10), RB-25, sx*W+(i%2===0?5:-5), RB-40);
      ctx.stroke();
    });

    // Barriers
    s.barriers.forEach(b => {
      ctx.fillStyle = 'rgba(52,44,137,0.85)';
      ctx.fillRect(b.x - 5, RT, 10, RB - RT);
      ctx.fillStyle = 'rgba(144,202,249,0.6)';
      for (let i = 0; i < 6; i++) ctx.fillRect(b.x-8, RT+8+i*38, 16, 9);
    });

    // Blooms
    s.blooms.forEach(b => {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.rad);
      g.addColorStop(0, `rgba(220,160,0,${b.op})`);
      g.addColorStop(0.5, `rgba(150,190,10,${b.op*0.75})`);
      g.addColorStop(1, `rgba(50,130,10,0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.rad, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(255,220,0,${b.op})`;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.rad*0.28, 0, Math.PI*2); ctx.fill();
      for (let d = 0; d < 5; d++) {
        const a = (d/5)*Math.PI*2 + b.age*0.02;
        ctx.fillStyle = `rgba(200,160,0,${b.op*0.8})`;
        ctx.beginPath(); ctx.arc(b.x+Math.cos(a)*b.rad*0.55, b.y+Math.sin(a)*b.rad*0.55, 5, 0, Math.PI*2); ctx.fill();
      }
    });

    // Aerators
    s.aerators.forEach(a => {
      for (let i = 0; i < 3; i++) {
        const rad = (a.age*1.5 + i*22) % 65;
        if (rad < 4) continue;
        ctx.strokeStyle = `rgba(140,200,255,${0.6 - rad/100})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(a.x, a.y, rad, 0, Math.PI*2); ctx.stroke();
      }
      ctx.fillStyle = '#2ECC71'; ctx.beginPath(); ctx.arc(a.x, a.y, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(a.x, a.y, 3, 0, Math.PI*2); ctx.fill();
    });

    // Fish
    s.fish.forEach(f => {
      ctx.fillStyle = '#90CAF9';
      ctx.beginPath(); ctx.ellipse(f.x, f.y, 11, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#64B5F6';
      ctx.beginPath(); ctx.moveTo(f.x-11, f.y); ctx.lineTo(f.x-18, f.y-6); ctx.lineTo(f.x-18, f.y+6); ctx.closePath(); ctx.fill();
    });

    // Particles
    s.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Health bar
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(8, H-16, W-16, 10);
    const hColor = s.health > 60 ? '#2ECC71' : s.health > 30 ? '#F1C40F' : '#E74C3C';
    ctx.fillStyle = hColor;
    ctx.fillRect(8, H-16, (W-16)*(s.health/100), 10);
  }

  function loop() {
    const s = stateRef.current;
    if (!s.running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    s.tick++;
    const rate = 0.014 + (s.population/50)*0.018;
    if (Math.random() < rate) addBloom(false);
    if (s.tick % 240 === 0 && s.fish.length < 8) addFish();

    s.blooms.forEach(b => {
      b.age++; b.op = Math.min(0.95, b.op + 0.01);
      s.health -= 0.022 * b.op;
      s.aerators.forEach(a => { if (Math.hypot(b.x-a.x, b.y-a.y) < 110) b.op = Math.max(0, b.op-0.008); });
      b.x += r(-0.6, 0.8); b.y += r(-0.4, 0.4);
      b.x = Math.max(15, Math.min(W-15, b.x));
      b.y = Math.max(RT+5, Math.min(RB-5, b.y));
    });
    s.blooms = s.blooms.filter(b => b.op > 0.04);

    s.fish.forEach(f => {
      f.x += f.spd;
      s.blooms.forEach(b => { const d = Math.hypot(f.x-b.x, f.y-b.y); if (d < 80 && d > 0) f.vy += ((f.y-b.y)/d)*0.5; });
      f.vy *= 0.87;
      f.y = Math.max(RT+10, Math.min(RB-10, f.y+f.vy));
      if (f.x > W+25) { f.x = r(-40,-5); f.y = r(RT+20,RB-20); f.vy = 0; s.score++; }
    });

    s.aerators.forEach(a => a.age++);
    s.particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.life-=0.04; p.vx*=0.9; p.vy*=0.9; });
    s.particles = s.particles.filter(p => p.life > 0);

    if (s.blooms.length === 0) s.health = Math.min(100, s.health+0.06);
    s.health = Math.max(0, Math.min(100, s.health));
    if (s.tick % 60 === 0) s.score += Math.max(0, Math.floor((s.health/100)*3));

    setHud({ health: Math.round(s.health), blooms: s.blooms.length, score: s.score, population: s.population });
    drawScene(ctx);

    if (s.health <= 0) { s.running = false; setFinalScore(s.score); setPhase('lost'); return; }
    if (s.tick > 3600 && s.health > 75) { s.running = false; setFinalScore(s.score); setPhase('won'); return; }

    s.raf = requestAnimationFrame(loop);
  }

  function handleClick(e) {
    const s = stateRef.current;
    if (!s.running) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (W / rect.width);
    const my = (e.clientY - rect.top) * (H / rect.height);

    if (s.tool === 'treat') {
      let hit = false;
      s.blooms.forEach(b => {
        if (Math.hypot(mx-b.x, my-b.y) < b.rad*1.3) {
          b.op = Math.max(0, b.op-0.6); s.score += 10; hit = true;
          for (let i = 0; i < 10; i++) s.particles.push({ x: mx, y: my, vx: r(-3,3), vy: r(-3,3), life: 1, col: '#2ECC71' });
          setMsg('Bloom treated! +10 points 🌿');
        }
      });
      s.blooms = s.blooms.filter(b => b.op > 0.04);
      if (!hit) setMsg('Missed — click on a yellow-green patch.');
    } else if (s.tool === 'aerate') {
      if (my < RT || my > RB) { setMsg('Place aerators inside the river.'); return; }
      if (s.aerators.length < 5) { s.aerators.push({ x: mx, y: my, age: 0 }); s.score = Math.max(0, s.score-5); setMsg('Aerator placed (-5pts). Suppresses nearby blooms 💧'); }
      else setMsg('Max 5 aerators at once.');
    } else if (s.tool === 'barrier') {
      if (s.barriers.length < 4) { s.barriers.push({ x: mx }); setMsg('Barrier placed. Slows bloom spread 🛡️'); }
      else setMsg('Max 4 barriers at once.');
    }
  }

  const toolButtons = [
    { id: 'treat', label: '🎯 Treat Bloom' },
    { id: 'aerate', label: '💧 Place Aerator' },
    { id: 'barrier', label: '🛡️ Place Barrier' },
  ];

  return (
    <div style={{ background: "linear-gradient(180deg, #020B18 0%, #0A2342 40%, #0E6B8A 100%)", minHeight: "100vh", fontFamily: "sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ color: "white", fontSize: "2.2rem", fontWeight: "900", marginBottom: "6px", textShadow: "0 0 30px rgba(46,204,113,0.6)" }}>🌿 River Guardian</h1>
          <p style={{ color: "#90CAF9", fontSize: "0.95rem" }}>Protect the river from harmful algal blooms</p>
        </div>

        {/* HUD */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "14px" }}>
          {[
            { label: "River Health", value: `${hud.health}%`, color: hud.health > 60 ? "#2ECC71" : hud.health > 30 ? "#F1C40F" : "#E74C3C" },
            { label: "Active Blooms", value: hud.blooms, color: hud.blooms === 0 ? "#2ECC71" : hud.blooms < 5 ? "#F1C40F" : "#E74C3C" },
            { label: "Population", value: hud.population, color: "#90CAF9" },
            { label: "Score", value: hud.score, color: "#F1C40F" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.07)", borderRadius: "12px", padding: "12px", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)" }}>
              <p style={{ color: "#90CAF9", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: "1.5rem", fontWeight: "900" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", marginBottom: "12px", border: "2px solid rgba(46,204,113,0.3)", boxShadow: "0 0 30px rgba(46,204,113,0.15)" }}>
          <canvas ref={canvasRef} width={W} height={H} onClick={handleClick} style={{ display: "block", width: "100%", cursor: "crosshair" }} />

          {/* Start */}
          {phase === 'start' && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(2,11,24,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRadius: "20px", padding: "36px", textAlign: "center", maxWidth: "320px", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🌿</div>
                <h2 style={{ color: "white", fontSize: "1.4rem", fontWeight: "bold", marginBottom: "10px" }}>River Guardian</h2>
                <p style={{ color: "#90CAF9", fontSize: "0.9rem", lineHeight: "1.6", marginBottom: "20px" }}>
                  Click yellow-green algae blooms to treat them before they destroy the river. Use tools to help protect the ecosystem!
                </p>
                <button onClick={startGame} style={{ padding: "12px 28px", borderRadius: "12px", background: "linear-gradient(90deg, #0E6B8A, #2ECC71)", color: "white", fontWeight: "700", fontSize: "1rem", border: "none", cursor: "pointer" }}>
                  Start Game 🎮
                </button>
              </div>
            </div>
          )}

          {/* Won / Lost */}
          {(phase === 'won' || phase === 'lost') && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(2,11,24,0.88)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRadius: "20px", padding: "36px", textAlign: "center", maxWidth: "320px", border: `1px solid ${phase === 'won' ? "rgba(46,204,113,0.4)" : "rgba(231,76,60,0.4)"}` }}>
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>{phase === 'won' ? "🎉" : "💀"}</div>
                <h2 style={{ color: phase === 'won' ? "#2ECC71" : "#E74C3C", fontSize: "1.4rem", fontWeight: "bold", marginBottom: "10px" }}>
                  {phase === 'won' ? "River Saved!" : "River Lost!"}
                </h2>
                <p style={{ color: "#90CAF9", fontSize: "0.9rem", marginBottom: "6px" }}>
                  {phase === 'won' ? "Incredible! You protected the ecosystem." : "The algal blooms overwhelmed the river."}
                </p>
                <p style={{ color: "#F1C40F", fontSize: "1.2rem", fontWeight: "bold", marginBottom: "20px" }}>Final Score: {finalScore}</p>
                <button onClick={startGame} style={{ padding: "12px 28px", borderRadius: "12px", background: "linear-gradient(90deg, #0E6B8A, #2ECC71)", color: "white", fontWeight: "700", fontSize: "1rem", border: "none", cursor: "pointer" }}>
                  Play Again 🌿
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
          {toolButtons.map(btn => (
            <button key={btn.id} onClick={() => setTool(btn.id)} style={{
              flex: 1, minWidth: "110px", padding: "10px 14px", borderRadius: "10px",
              fontWeight: "600", fontSize: "0.9rem",
              border: `2px solid ${tool === btn.id ? "#2ECC71" : "rgba(255,255,255,0.15)"}`,
              background: tool === btn.id ? "rgba(46,204,113,0.2)" : "rgba(255,255,255,0.07)",
              color: tool === btn.id ? "#2ECC71" : "#90CAF9", cursor: "pointer", transition: "all 0.2s"
            }}>{btn.label}</button>
          ))}
          <button onClick={reducePop} style={{ flex: 1, minWidth: "110px", padding: "10px 14px", borderRadius: "10px", fontWeight: "600", fontSize: "0.9rem", border: "2px solid rgba(231,76,60,0.4)", background: "rgba(231,76,60,0.1)", color: "#FF6B6B", cursor: "pointer" }}>
            🏭 Reduce Runoff
          </button>
        </div>

        {/* Log */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ color: "#90CAF9", fontSize: "0.85rem" }}>💬 {msg}</p>
        </div>

        {/* How to play */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "18px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ color: "white", fontWeight: "bold", marginBottom: "10px", fontSize: "0.95rem" }}>📖 How to Play</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "8px" }}>
            {[
              { icon: "🎯", text: "Select Treat Bloom then click yellow-green patches" },
              { icon: "💧", text: "Place aerators in the river to slow bloom growth" },
              { icon: "🛡️", text: "Add barriers to block blooms from spreading" },
              { icon: "🏭", text: "Reduce runoff to lower the bloom spawn rate" },
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1rem" }}>{tip.icon}</span>
                <p style={{ color: "#90CAF9", fontSize: "0.8rem", lineHeight: "1.5" }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
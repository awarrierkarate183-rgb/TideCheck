"use client";
import { useEffect, useRef, useState } from "react";

export default function GamePage() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [stats, setStats] = useState({ health: 100, blooms: 0, population: 50, score: 0 });
  const [tool, setTool] = useState("treat");
  const [log, setLog] = useState("Select a tool then click on the river to use it.");
  const [finalScore, setFinalScore] = useState(0);

  const gameState = useRef({
    blooms: [], particles: [], barriers: [], aerators: [], fish: [],
    score: 0, health: 100, population: 50, tick: 0, running: false, raf: null
  });

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function spawnBloom(W, H) {
    gameState.current.blooms.push({ x: rnd(0.05, 0.95), y: rnd(0.18, 0.82), r: rnd(18, 38), age: 0, opacity: 0, growing: true });
  }

  function spawnFish() {
    gameState.current.fish.push({ x: -0.05, y: rnd(0.25, 0.75), speed: rnd(0.0008, 0.0018), vy: 0, alive: true });
  }

  function spawnParticle(x, y, color) {
    for (let i = 0; i < 8; i++)
      gameState.current.particles.push({ x, y, vx: rnd(-2, 2), vy: rnd(-2, 2), life: 1, color });
  }

  function drawScene(ctx, W, H) {
    const gs = gameState.current;

    // Sky
    ctx.fillStyle = '#020B18';
    ctx.fillRect(0, 0, W, H * 0.12);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    [[0.08,0.03],[0.22,0.07],[0.45,0.04],[0.67,0.08],[0.85,0.02],[0.3,0.09],[0.55,0.06]].forEach(([lx,ly]) => {
      ctx.beginPath(); ctx.arc(lx*W, ly*H, 1.5, 0, Math.PI*2); ctx.fill();
    });

    // River banks
    const topGrad = ctx.createLinearGradient(0, H*0.1, 0, H*0.2);
    topGrad.addColorStop(0, '#0A2342');
    topGrad.addColorStop(1, '#1a7a4a');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, H*0.1, W, H*0.12);

    // River
    const rGrad = ctx.createLinearGradient(0, H*0.2, 0, H*0.85);
    rGrad.addColorStop(0, '#0E6B8A');
    rGrad.addColorStop(0.4, '#085472');
    rGrad.addColorStop(0.7, '#0A4D6E');
    rGrad.addColorStop(1, '#063548');
    ctx.fillStyle = rGrad;
    ctx.fillRect(0, H*0.2, W, H*0.65);

    // Water shimmer lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const yy = H * (0.28 + i * 0.11);
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.bezierCurveTo(W*0.25, yy-5, W*0.75, yy+5, W, yy);
      ctx.stroke();
    }

    // Bottom bank
    const botGrad = ctx.createLinearGradient(0, H*0.83, 0, H);
    botGrad.addColorStop(0, '#1a7a4a');
    botGrad.addColorStop(1, '#0A2342');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H*0.83, W, H*0.17);

    // Seaweed on banks
    [[0.05,0.82],[0.12,0.82],[0.88,0.82],[0.95,0.82],[0.5,0.82],[0.35,0.82],[0.65,0.82]].forEach(([sx,sy],i) => {
      ctx.strokeStyle = '#2ECC71';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx*W, sy*H);
      ctx.quadraticCurveTo(sx*W + (i%2===0?8:-8), (sy-0.06)*H, sx*W+(i%2===0?4:-4), (sy-0.1)*H);
      ctx.stroke();
    });

    // Barriers
    gs.barriers.forEach(b => {
      ctx.fillStyle = 'rgba(52,44,137,0.8)';
      ctx.fillRect(b.x*W - 4, H*0.21, 8, H*0.61);
      ctx.fillStyle = 'rgba(144,202,249,0.5)';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(b.x*W - 6, H*0.25 + i*(H*0.1), 12, 4);
      }
    });

    // Blooms
    gs.blooms.forEach(b => {
      const bx = b.x*W, by = b.y*H;
      const grd = ctx.createRadialGradient(bx, by, 0, bx, by, b.r*(W/600));
      const alpha = Math.min(b.opacity, 0.9);
      grd.addColorStop(0, `rgba(100,180,50,${alpha})`);
      grd.addColorStop(0.4, `rgba(60,140,20,${alpha*0.8})`);
      grd.addColorStop(1, `rgba(30,100,10,0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(bx, by, b.r*(W/600)*1.6, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = `rgba(46,204,113,${alpha*0.5})`;
      for (let d = 0; d < 6; d++) {
        const ang = (d/6)*Math.PI*2 + b.age*0.01;
        const dr = b.r*0.5*(W/600);
        ctx.beginPath();
        ctx.arc(bx+Math.cos(ang)*dr, by+Math.sin(ang)*dr, 3, 0, Math.PI*2);
        ctx.fill();
      }
    });

    // Aerators
    gs.aerators.forEach(a => {
      const ax = a.x*W, ay = a.y*H;
      ctx.strokeStyle = 'rgba(144,202,249,0.5)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(ax, ay, (a.age%40 + i*13)%45, 0, Math.PI*2);
        ctx.stroke();
      }
      ctx.fillStyle = '#2ECC71';
      ctx.beginPath(); ctx.arc(ax, ay, 5, 0, Math.PI*2); ctx.fill();
    });

    // Fish
    gs.fish.filter(f => f.alive).forEach(f => {
      const fx = f.x*W, fy = f.y*H;
      ctx.fillStyle = '#90CAF9';
      ctx.beginPath(); ctx.ellipse(fx, fy, 10, 5, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#64B5F6';
      ctx.beginPath(); ctx.moveTo(fx-10, fy); ctx.lineTo(fx-16, fy-5); ctx.lineTo(fx-16, fy+5); ctx.closePath(); ctx.fill();
    });

    // Particles
    gs.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Health bar
    const hColor = gs.health > 60 ? '#2ECC71' : gs.health > 30 ? '#F1C40F' : '#E74C3C';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(10, H-14, W-20, 6);
    ctx.fillStyle = hColor;
    ctx.fillRect(10, H-14, (W-20)*(gs.health/100), 6);
  }

  function startGame() {
    const gs = gameState.current;
    gs.blooms = []; gs.particles = []; gs.barriers = []; gs.aerators = []; gs.fish = [];
    gs.score = 0; gs.health = 100; gs.population = 50; gs.tick = 0; gs.running = true;
    setStarted(true); setGameOver(false); setGameWon(false);
    for (let i = 0; i < 3; i++) spawnFish();
    requestAnimationFrame(loop);
  }

  function loop() {
    const gs = gameState.current;
    if (!gs.running) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const W = wrap.clientWidth, H = wrap.clientHeight;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Update
    gs.tick++;
    const spawnChance = 0.008 + (gs.population/50)*0.012;
    if (Math.random() < spawnChance) spawnBloom(W, H);
    if (gs.tick % 300 === 0 && gs.fish.filter(f => f.alive).length < 6) spawnFish();

    gs.blooms.forEach(b => {
      b.age++;
      if (b.growing) { b.opacity = Math.min(1, b.opacity+0.01); if (b.opacity >= 0.9) b.growing = false; }
      gs.health -= 0.015 * b.opacity;
      gs.aerators.forEach(a => {
        const dx = (b.x-a.x)*W, dy = (b.y-a.y)*H;
        if (Math.sqrt(dx*dx+dy*dy) < 80) b.opacity = Math.max(0, b.opacity-0.005);
      });
      b.x += (Math.random()-0.45)*0.0008;
      b.y += (Math.random()-0.5)*0.0006;
      b.x = Math.max(0.02, Math.min(0.98, b.x));
      b.y = Math.max(0.22, Math.min(0.84, b.y));
    });
    gs.blooms = gs.blooms.filter(b => b.opacity > 0.02);

    gs.fish.filter(f => f.alive).forEach(f => {
      f.x += f.speed;
      gs.blooms.forEach(b => {
        const dx = (f.x-b.x)*W, dy = (f.y-b.y)*H;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 60) f.vy += (dy/dist)*0.3;
      });
      f.vy *= 0.9;
      f.y = Math.max(0.22, Math.min(0.84, f.y+f.vy*0.01));
      if (f.x > 1.1) { f.x = -0.05; f.y = 0.25+Math.random()*0.5; f.vy = 0; gs.score++; }
    });

    gs.aerators.forEach(a => a.age++);
    gs.particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.life-=0.04; p.vx*=0.92; p.vy*=0.92; });
    gs.particles = gs.particles.filter(p => p.life > 0);
    if (gs.blooms.length === 0 && gs.health < 100) gs.health = Math.min(100, gs.health+0.05);
    gs.health = Math.max(0, Math.min(100, gs.health));
    if (gs.tick % 60 === 0) gs.score += Math.max(0, Math.floor((gs.health/100)*3));

    setStats({ health: Math.round(gs.health), blooms: gs.blooms.length, population: gs.population, score: gs.score });

    drawScene(ctx, W, H);

    if (gs.health <= 0) { gs.running = false; setFinalScore(gs.score); setGameOver(true); return; }
    if (gs.tick > 3600 && gs.health > 80) { gs.running = false; setFinalScore(gs.score); setGameWon(true); return; }

    gs.raf = requestAnimationFrame(loop);
  }

  function handleCanvasClick(e) {
    const gs = gameState.current;
    if (!gs.running) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const W = canvas.width, H = canvas.height;
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    if (tool === 'treat') {
      let hit = false;
      gs.blooms.forEach(b => {
        const dx = (mx-b.x)*W, dy = (my-b.y)*H;
        if (Math.sqrt(dx*dx+dy*dy) < b.r*(W/600)*1.6) {
          spawnParticle(mx*W, my*H, '#2ECC71');
          b.opacity = Math.max(0, b.opacity-0.45);
          gs.score += 10; hit = true;
          setLog('Bloom treated! +10 points 🌿');
        }
      });
      gs.blooms = gs.blooms.filter(b => b.opacity > 0.02);
      if (!hit) setLog('No bloom here — click directly on a green patch.');
    } else if (tool === 'aerate') {
      if (gs.aerators.length < 5) {
        gs.aerators.push({ x: mx, y: my, age: 0 });
        gs.score -= 5;
        setLog('Aerator placed! Slows nearby blooms 💧');
      } else setLog('Max 5 aerators active at once.');
    } else if (tool === 'barrier') {
      if (gs.barriers.length < 4) {
        gs.barriers.push({ x: mx });
        setLog('Barrier placed! Limits bloom spread 🛡️');
      } else setLog('Max 4 barriers at once.');
    }
  }

  function reducePop() {
    const gs = gameState.current;
    if (gs.population > 10) {
      gs.population = Math.max(10, gs.population-10);
      gs.score += 5;
      setLog('Runoff reduced! Less nutrients entering the river ✅');
    } else setLog('Runoff is already well managed.');
  }

  const toolButtons = [
    { id: 'treat', label: '🎯 Treat Bloom', desc: 'Click blooms to remove them' },
    { id: 'aerate', label: '💧 Aerate Water', desc: 'Adds oxygen, slows blooms' },
    { id: 'barrier', label: '🛡️ Add Barrier', desc: 'Blocks bloom spread' },
  ];

  return (
    <div style={{ background: "linear-gradient(180deg, #020B18 0%, #0A2342 40%, #0E6B8A 100%)", minHeight: "100vh", fontFamily: "sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: "white", fontSize: "2.5rem", fontWeight: "900", marginBottom: "8px", textShadow: "0 0 30px rgba(46,204,113,0.6)" }}>🌿 River Guardian</h1>
          <p style={{ color: "#90CAF9", fontSize: "1rem" }}>Protect the river from harmful algal blooms</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {[
            { label: "River Health", value: `${stats.health}%`, color: stats.health > 60 ? "#2ECC71" : stats.health > 30 ? "#F1C40F" : "#E74C3C" },
            { label: "Active Blooms", value: stats.blooms, color: stats.blooms === 0 ? "#2ECC71" : stats.blooms < 5 ? "#F1C40F" : "#E74C3C" },
            { label: "Population", value: stats.population, color: "#90CAF9" },
            { label: "Score", value: stats.score, color: "#F1C40F" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.07)", borderRadius: "14px", padding: "14px", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)" }}>
              <p style={{ color: "#90CAF9", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: "1.6rem", fontWeight: "900" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div ref={wrapRef} style={{ position: "relative", width: "100%", height: "360px", borderRadius: "20px", overflow: "hidden", marginBottom: "16px", border: "2px solid rgba(46,204,113,0.3)", boxShadow: "0 0 30px rgba(46,204,113,0.2)" }}>
          <canvas ref={canvasRef} onClick={handleCanvasClick} style={{ display: "block", width: "100%", height: "100%", cursor: "crosshair" }} />

          {/* Start overlay */}
          {!started && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(2,11,24,0.85)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "20px" }}>
              <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRadius: "20px", padding: "40px", textAlign: "center", maxWidth: "340px", border: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🌿</div>
                <h2 style={{ color: "white", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "12px" }}>River Guardian</h2>
                <p style={{ color: "#90CAF9", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "24px" }}>
                  Harmful algal blooms are spreading through the river. Use your tools to treat blooms, add aerators, and place barriers. Keep the river healthy for 60 seconds to win!
                </p>
                <button onClick={startGame} style={{ padding: "14px 32px", borderRadius: "12px", background: "linear-gradient(90deg, #0E6B8A, #2ECC71)", color: "white", fontWeight: "700", fontSize: "1.1rem", border: "none", cursor: "pointer" }}>
                  Start Game 🎮
                </button>
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {(gameOver || gameWon) && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(2,11,24,0.85)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "20px" }}>
              <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRadius: "20px", padding: "40px", textAlign: "center", maxWidth: "340px", border: `1px solid ${gameWon ? "rgba(46,204,113,0.4)" : "rgba(231,76,60,0.4)"}` }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{gameWon ? "🎉" : "💀"}</div>
                <h2 style={{ color: gameWon ? "#2ECC71" : "#E74C3C", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "12px" }}>
                  {gameWon ? "River Saved!" : "River Lost!"}
                </h2>
                <p style={{ color: "#90CAF9", fontSize: "0.95rem", marginBottom: "8px" }}>
                  {gameWon ? "Amazing work! You protected the ecosystem." : "The algal blooms overwhelmed the river."}
                </p>
                <p style={{ color: "#F1C40F", fontSize: "1.2rem", fontWeight: "bold", marginBottom: "24px" }}>
                  Final Score: {finalScore}
                </p>
                <button onClick={startGame} style={{ padding: "14px 32px", borderRadius: "12px", background: "linear-gradient(90deg, #0E6B8A, #2ECC71)", color: "white", fontWeight: "700", fontSize: "1rem", border: "none", cursor: "pointer" }}>
                  Play Again 🌿
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tools */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          {toolButtons.map(btn => (
            <button key={btn.id} onClick={() => setTool(btn.id)} style={{
              flex: 1, minWidth: "120px", padding: "12px 16px", borderRadius: "12px", fontWeight: "600", fontSize: "0.9rem", border: `2px solid ${tool === btn.id ? "#2ECC71" : "rgba(255,255,255,0.15)"}`, background: tool === btn.id ? "rgba(46,204,113,0.2)" : "rgba(255,255,255,0.07)", color: tool === btn.id ? "#2ECC71" : "#90CAF9", cursor: "pointer", transition: "all 0.2s"
            }}>
              {btn.label}
              <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "2px" }}>{btn.desc}</div>
            </button>
          ))}
          <button onClick={reducePop} style={{ flex: 1, minWidth: "120px", padding: "12px 16px", borderRadius: "12px", fontWeight: "600", fontSize: "0.9rem", border: "2px solid rgba(231,76,60,0.4)", background: "rgba(231,76,60,0.1)", color: "#FF6B6B", cursor: "pointer" }}>
            🏭 Reduce Runoff
            <div style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "2px" }}>Less nutrients = less blooms</div>
          </button>
        </div>

        {/* Log */}
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "12px 16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <p style={{ color: "#90CAF9", fontSize: "0.9rem" }}>💬 {log}</p>
        </div>

        {/* How to play */}
        <div style={{ marginTop: "16px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h3 style={{ color: "white", fontWeight: "bold", marginBottom: "12px", fontSize: "1rem" }}>📖 How to Play</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
            {[
              { icon: "🎯", text: "Click Treat Bloom then click green patches on the river" },
              { icon: "💧", text: "Place aerators to slow bloom growth in an area" },
              { icon: "🛡️", text: "Add barriers to block blooms from spreading" },
              { icon: "🏭", text: "Reduce runoff to lower the bloom spawn rate" },
            ].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.2rem" }}>{tip.icon}</span>
                <p style={{ color: "#90CAF9", fontSize: "0.85rem", lineHeight: "1.5" }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./game.module.css";

export default function MiniGame() {
  const [fertilizer, setFertilizer] = useState(0);
  const [drains, setDrains] = useState(0);
  const [buffers, setBuffers] = useState(0);
  const [petWaste, setPetWaste] = useState(0);
  const [bloomLevel, setBloomLevel] = useState(40);
  const [win, setWin] = useState(false);

  const ambientRef = useRef(null);
  const winSoundRef = useRef(null);
  const bubbleSoundRef = useRef(null);

  const fishData = useRef([
    { img: "/game-assets/fish1.png", x: 10, y: 30, speed: 0.4, amplitude: 20 },
    { img: "/game-assets/fish2.png", x: 50, y: 40, speed: 0.2, amplitude: 15 },
    { img: "/game-assets/fish3.png", x: 70, y: 20, speed: 0.6, amplitude: 25 },
  ]);

  const coralData = useRef([
    { img: "/game-assets/coral1.png", left: "15%", baseHeight: 80 },
    { img: "/game-assets/coral2.png", left: "50%", baseHeight: 100 },
  ]);

  const [particles, setParticles] = useState(
    [...Array(20)].map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 5,
      speed: Math.random() * 0.3 + 0.1,
    }))
  );

  // Handle bloom updates
  useEffect(() => {
    let level = 40 + fertilizer * 4 - drains * 2 - buffers * 2.5 - petWaste * 1.5;
    level = Math.max(0, Math.min(100, level));
    setBloomLevel(level);
    setWin(level < 20);
    if (level < 20) winSoundRef.current.play();
  }, [fertilizer, drains, buffers, petWaste]);

  // Animate fish and particles
  useEffect(() => {
    ambientRef.current.play();
    let frame;
    const animate = () => {
      fishData.current.forEach(f => {
        f.x += f.speed;
        if (f.x > 100) f.x = -10;
        f.y += Math.sin(f.x / 5) * 0.2; // sinusoidal path
      });
      setParticles(p =>
        p.map(pa => ({
          ...pa,
          y: pa.y - pa.speed,
          x: (pa.x + Math.sin(pa.y / 10) * 0.2) % 100,
        }))
      );
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  const bloomColor =
    bloomLevel < 33
      ? "rgba(0,200,255,0.2)"
      : bloomLevel < 66
      ? "rgba(200,200,0,0.3)"
      : "rgba(34,139,34,0.5)";

  return (
    <div className={styles.gameContainer}>
      <audio ref={ambientRef} src="/game-assets/ambient.mp3" loop autoPlay />
      <audio ref={winSoundRef} src="/game-assets/win.mp3" />
      <audio ref={bubbleSoundRef} src="/game-assets/bubble.mp3" />

      <div className={styles.sky}></div>
      <div className={styles.water}></div>
      <div className={styles.seafloor}></div>
      <div className={styles.bloomOverlay} style={{ backgroundColor: bloomColor }}></div>

      {/* Fish */}
      {fishData.current.map((f, i) => (
        <img
          key={i}
          src={f.img}
          className={styles.fish}
          style={{ left: `${f.x}%`, top: `${f.y}%` }}
        />
      ))}

      {/* Coral */}
      {coralData.current.map((c, i) => (
        <img
          key={i}
          src={c.img}
          className={styles.coral}
          style={{
            left: c.left,
            height: `${c.baseHeight * (1 - bloomLevel / 100)}px`,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className={styles.bubble}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}

      {/* Sliders */}
      <div className={styles.sliderPanel}>
        <h2>Control the Bloom!</h2>
        {[
          ["Fertilizer Use", fertilizer, setFertilizer],
          ["Storm Drain Cleanup", drains, setDrains],
          ["Buffer Plants", buffers, setBuffers],
          ["Pet Waste Pickup", petWaste, setPetWaste],
        ].map(([label, value, setter], i) => (
          <div key={i}>
            <label>
              {label}: {value}
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={value}
              onChange={(e) => setter(Number(e.target.value))}
              className={styles.rangeInput}
            />
          </div>
        ))}
        {win && <div className={styles.winMessage}>🎉 You saved the water body!</div>}
      </div>

      <div className={styles.bloomMeter}>Bloom Level: {bloomLevel.toFixed(0)}%</div>
    </div>
  );
}
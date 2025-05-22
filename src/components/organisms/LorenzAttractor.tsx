// LorenzAttractorR3F.tsx
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function LorenzLine({ speed, playing, resetTrigger }: { speed: number; playing: boolean; resetTrigger: number }) {
  const pointsRef = useRef(new Float32Array(10000 * 3));
  const geometryRef = useRef<THREE.BufferGeometry>(null!);

  // Lorenz attractor state stored in a ref
  const state = useRef({
    sigma: 10,
    rho: 28,
    beta: 8 / 3,
    x: 0.1,
    y: 0,
    z: 0,
    maxPoints: 10000,
    head: 0,
    count: 1,
  });

  // Reset simulation when resetTrigger changes
  useEffect(() => {
    const sim = state.current;
    sim.x = 0.1;
    sim.y = 0;
    sim.z = 0;
    sim.head = 0;
    sim.count = 1;
    pointsRef.current.fill(0);
    if (geometryRef.current) {
      geometryRef.current.setDrawRange(0, 1);
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  }, [resetTrigger]);

  useFrame(() => {
    if (!playing) return;

    const sim = state.current;
    const dt = 0.005 * speed;

    for (let i = 0; i < 5; i++) {
      const dx = sim.sigma * (sim.y - sim.x) * dt;
      const dy = (sim.x * (sim.rho - sim.z) - sim.y) * dt;
      const dz = (sim.x * sim.y - sim.beta * sim.z) * dt;

      sim.x += dx;
      sim.y += dy;
      sim.z += dz;

      if (sim.count < sim.maxPoints) sim.count++;
      sim.head = (sim.head + 1) % sim.maxPoints;

      pointsRef.current[sim.head * 3 + 0] = sim.x;
      pointsRef.current[sim.head * 3 + 1] = sim.y;
      pointsRef.current[sim.head * 3 + 2] = sim.z;
    }

    if (geometryRef.current) {
      // Update geometry draw range and position attribute
      geometryRef.current.setDrawRange(0, state.current.count);
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  // Initialize buffer geometry once
  return (
    <line>
      <bufferGeometry
        ref={geometryRef}
        attach="geometry"
        onUpdate={(self) => {
          self.setAttribute("position", new THREE.BufferAttribute(pointsRef.current, 3));
          self.setDrawRange(0, 1);
        }}
      />
      <lineBasicMaterial color={0x5cb7ff} />
    </line>
  );
}

export default function LorenzAttractor() {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [resetTrigger, setResetTrigger] = useState(0); // trigger reset

  return (
    <>
      {/* Controls */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setPlaying((p) => !p)} style={{ fontWeight: 600, minWidth: 70 }}>
          {playing ? "Pause" : "Play"}
        </button>

        <button
          onClick={() => setResetTrigger((t) => t + 1)}
          style={{ fontWeight: 600, minWidth: 70 }}
          title="Reset the simulation"
        >
          Reset
        </button>

        <label
          style={{
            marginLeft: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#222",
          }}
        >
          <span>Speed:</span>
          <input
            type="range"
            min={0.2}
            max={5}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ marginLeft: 4 }}
          />
          <span style={{ minWidth: 24 }}>{speed.toFixed(1)}</span>
        </label>
      </div>

      {/* 3D Canvas */}
      <Canvas
        style={{
          width: "100%",
          height: 320,
          background: "#222",
          borderRadius: 8,
          overflow: "hidden",
        }}
        camera={{ position: [0, 0, 100], fov: 60, near: 0.01, far: 1000 }}
      >
        <ambientLight intensity={0.6} />
        <LorenzLine speed={speed} playing={playing} resetTrigger={resetTrigger} />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={10}
          maxDistance={200}
        />
      </Canvas>

      {/* Description text below */}
      <div
        style={{
          color: "#333",
          fontSize: "1rem",
          marginTop: 8,
          padding: "0 8px",
          lineHeight: 1.5,
          textAlign: "left",
          maxWidth: 520,
        }}
      >
        This is the famous <strong>Lorenz Attractor</strong>, discovered in 1963 by Edward Lorenz.
        It represents a simplified model of atmospheric convection, much like a pot of water heated on a stove.
        With the advent of early computers, Lorenz was able to solve this system of differential equations at thousands of points, revealing the beautiful figure recreated above.
        This surprising order emerging from apparent chaos helped give rise to what we now call <strong>Chaos Theory</strong>.
        <br />
        <small>
          (For an excellent history, see{" "}
          <a href="https://a.co/d/dhGbKdk" target="_blank" rel="noreferrer">
            <em>Chaos: Making a New Science</em>
          </a>{" "}
          by James Gleick.)
        </small>
      </div>
    </>
  );
}

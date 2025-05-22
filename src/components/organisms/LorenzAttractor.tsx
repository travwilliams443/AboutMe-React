// LorenzAttractorR3F.tsx
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import styles from "./AppViewerModal.module.css";

interface LorenzTubeProps {
  speed: number;
  playing: boolean;
  resetTrigger: number;
}

function LorenzTube({ speed, playing, resetTrigger }: LorenzTubeProps) {
  const state = useRef<{
    sigma: number;
    rho: number;
    beta: number;
    x: number;
    y: number;
    z: number;
    maxPoints: number;
    points: THREE.Vector3[];
  }>({
    sigma: 10,
    rho: 28,
    beta: 8 / 3,
    x: 0.1,
    y: 0,
    z: 0,
    maxPoints: 10000,
    points: [],
  });
  // Reset points on resetTrigger
  useEffect(() => {
    state.current.x = 0.1;
    state.current.y = 0;
    state.current.z = 0;
    state.current.points = [new THREE.Vector3(0.1, 0, 0)];
  }, [resetTrigger]);

  // Store the tube geometry in a ref
  const tubeRef = useRef<THREE.Mesh>(null);

  // Update simulation & points each frame
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

      sim.points.push(new THREE.Vector3(sim.x, sim.y, sim.z));
      if (sim.points.length > sim.maxPoints) {
        sim.points.shift(); // keep maxPoints length
      }
    }

    if (tubeRef.current) {
      const curve = new THREE.CatmullRomCurve3(state.current.points);
      const newGeometry = new THREE.TubeGeometry(curve, state.current.points.length * 2, 0.1, 8, false);

      tubeRef.current.geometry.dispose();  // dispose old geometry to avoid memory leaks
      tubeRef.current.geometry = newGeometry;
    }
  });

  return (
  <mesh ref={tubeRef} castShadow receiveShadow>
    <meshPhysicalMaterial
      color="#5cb7ff"
      metalness={0.7}
      roughness={0.2}
      clearcoat={1}
      clearcoatRoughness={0.1}
    />
  </mesh>
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
        <button onClick={() => setPlaying((p) => !p)} 
          title="Start or stop the simulation" 
          className={styles.button}
          >
          {playing ? "Pause" : "Play"}          
        </button>

        <button
          onClick={() => setResetTrigger((t) => t + 1)}          
          title="Reset the simulation"
          className={styles.button}
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
          background: "#000",
          borderRadius: 8,
          overflow: "hidden",
        }}
        camera={{ position: [0, 0, 100], fov: 60, near: 0.01, far: 1000 }}
      >
        <ambientLight intensity={2} />
        <directionalLight
          position={[5, 10, 7]}
          intensity={4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <LorenzTube speed={speed} playing={playing} resetTrigger={resetTrigger} />
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

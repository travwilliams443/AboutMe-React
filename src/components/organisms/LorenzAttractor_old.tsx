import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function LorenzAttractorViewer() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // UI state
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  // To always get the latest values inside the animation loop:
  const playingRef = useRef(playing);
  const speedRef = useRef(speed);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Three.js refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const lineRef = useRef<THREE.Line | null>(null);
  const controlsRef = useRef<InstanceType<typeof OrbitControls> | null>(null);
  const requestIdRef = useRef<number | null>(null);

  // Lorenz state in a ref so it's never reset
  const attractorRef = useRef({
    sigma: 10,
    rho: 28,
    beta: 8 / 3,
    x: 0.1,
    y: 0,
    z: 0,
    maxPoints: 10000,
    positions: new Float32Array(10000 * 3),
    head: 0,
    count: 1,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up Three.js scene/camera/renderer (initialize only once)
    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 1000);
    camera.position.set(0, 0, 100); // <-- Set default zoom/fov here!
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 10;
    controls.maxDistance = 200;
    controlsRef.current = controls;

    // Line geometry
    const { positions, maxPoints } = attractorRef.current;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 1);

    const material = new THREE.LineBasicMaterial({ color: 0x5cb7ff });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    lineRef.current = line;

    // Light for fun (not needed for line)
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Animation loop
    function animate() {
      requestIdRef.current = requestAnimationFrame(animate);

      // Always use the latest playing/speed from refs
      if (playingRef.current) {
        for (let steps = 0; steps < 5; steps++) {
          const sim = attractorRef.current;
          const dt = 0.005 * speedRef.current;

          const { sigma, rho, beta } = sim;
          const dx = sigma * (sim.y - sim.x) * dt;
          const dy = (sim.x * (rho - sim.z) - sim.y) * dt;
          const dz = (sim.x * sim.y - beta * sim.z) * dt;
          sim.x += dx;
          sim.y += dy;
          sim.z += dz;

          if (sim.count < sim.maxPoints) {
            sim.count++;
          }
          sim.head = (sim.head + 1) % sim.maxPoints;
          sim.positions[sim.head * 3 + 0] = sim.x;
          sim.positions[sim.head * 3 + 1] = sim.y;
          sim.positions[sim.head * 3 + 2] = sim.z;
        }
      }

      // Always update geometry and render scene, even when paused!
      const sim = attractorRef.current;
      geometry.setDrawRange(0, sim.count);
      geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    function handleResize() {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    }
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      if (requestIdRef.current !== null)
        cancelAnimationFrame(requestIdRef.current);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []); // <-- Only run once!

  // Simple controls
  return (
    <div>
      <div style={{
        marginBottom: 16, display: "flex", alignItems: "center", gap: 18,
        flexWrap: "wrap",
      }}>
        {/* Play/Pause Button */}
        <button
          onClick={() => setPlaying((p) => !p)}
          style={{ fontWeight: 600, minWidth: 70 }}
        >
          {playing ? "Pause" : "Play"}
        </button>
        {/* Reset Button */}
        <button
          onClick={() => {
            attractorRef.current.x = 0.1;
            attractorRef.current.y = 0;
            attractorRef.current.z = 0;
            attractorRef.current.head = 0;
            attractorRef.current.count = 1;
            attractorRef.current.positions.fill(0);
          }}
          style={{ fontWeight: 600, minWidth: 70 }}
        >
          Reset
        </button>
        {/* Speed Slider */}
        <label style={{
          marginLeft: 16, display: "flex", alignItems: "center",
          gap: 8, color: "#222"
        }}>
          <span>Speed:</span>
          <input
            type="range"
            min="0.2"
            max="5"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ marginLeft: 4 }}
          />
          <span style={{ minWidth: 24 }}>{speed.toFixed(1)}</span>
        </label>
      </div>
      {/* Animation Canvas! */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "320px",
          background: "#222",
          borderRadius: 8,
          overflow: "hidden",
        }}
      />
      <div
        style={{
          color: "#333",
          fontSize: "1rem",
          marginTop: 8,
          padding: "0 8px",
          lineHeight: 1.5,
          textAlign: "left",
          maxWidth: 520
        }}
      >
        This is the famous <strong>Lorenz Attractor</strong>, discovered in 1963 by Edward Lorenz.
        It represents a simplified model of atmospheric convection, much like a pot of water heated on a stove.
        With the advent of early computers, Lorenz was able to solve this system of differential equations at thousands of points, revealing the beautiful figure recreated above.
        This surprising order emerging from apparent chaos helped give rise to what we now call <strong>Chaos Theory</strong>.
        <br /><small>
          (For an excellent history, see <a href="https://a.co/d/dhGbKdk" target="_blank"><em>Chaos: Making a New Science</em></a> by James Gleick.)
        </small>
      </div>
    </div>
  );

}

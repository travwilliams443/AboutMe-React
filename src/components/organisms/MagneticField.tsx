import React, { useMemo, useState, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Cylinder, Text, Billboard } from "@react-three/drei";
import styles from "./AppViewerModal.module.css";

const segments = 200;
//const gridExtent = 8; // -5cm to +5cm
//const gridSpacingCm = 0.6;

const minZoom = 0.04;
const maxZoom = .3;

const minExtent = 3;
const maxExtent = 14;

const minSpacing = 0.15;
const maxSpacing = 2.0;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function CameraTracker({ setZoom }: { setZoom: (z: number) => void }) {
  const { camera } = useThree();
  const lastZoom = useRef<number | null>(null);

  useFrame(() => {
    // Example: Use camera.position.length() as a zoom proxy
    const zoomLevel = camera.position.length();

    if (lastZoom.current === null || Math.abs(zoomLevel - lastZoom.current) > 0.025) {
      setZoom(zoomLevel); //Update zoom level
      // Print when zoom changes (with some tolerance)
      //console.log("Zoom level:", zoomLevel.toFixed(3));
      lastZoom.current = zoomLevel;
    }

    // Normalize zoom value to [0, 1]
    const t = (zoomLevel - minZoom) / (maxZoom - minZoom);
    const clampT = Math.max(0, Math.min(1, t));

  });

  return null; // This component doesn't render anything visually
}

function CurrentArrow3D({ coilLengthM}: { coilLengthM: number }) {

  const dir = new THREE.Vector3(1, 0, 0);

  // Position the arrow shaft
  const shaftMid = new THREE.Vector3(0, 0, 0);
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0, 0)); // y-axis by default

    // Arrow parameters: start at one end, point to the other, or wherever you want!
  const headFrom = new THREE.Vector3(coilLengthM/2 + 0.004, 0, 0); // Tail (adjust as needed)
  
  return (
    <group>
      <Cylinder
        args={[.0005, .0005, coilLengthM, 16]}
        position={shaftMid.toArray()}
        quaternion={quaternion}
      >
        <meshStandardMaterial color={"white"} />
      </Cylinder>
      <arrowHelper
        args={[
          dir,
          headFrom,
          0,
          "white",   // color
          0.005, // headLength
          0.005, // headWidth
        ]}
      />
      {/*<Billboard>*/}
      <Text
        position={[0.0, 0.008, -0.0035]}
        fontSize={0.0055}
        color="white"
        anchorX="center"
        anchorY="middle" 
        rotation={[-Math.PI / 2, 0, Math.PI]}
      >
        CURRENT
      </Text>         
      {/*</Billboard>*/}
    </group>
  );
}
function CoilMesh({ coilRadiusM, coilLengthM, turns }: { coilRadiusM: number; coilLengthM: number; turns: number; }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const theta = (2 * Math.PI * turns);
    for (let i = 0; i < segments; i++) {
      const t = (i / (segments - 1)) * theta;
      const x = (coilLengthM / theta) * t - coilLengthM / 2;
      const y = coilRadiusM * Math.cos(t);
      const z = coilRadiusM * Math.sin(t);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, [coilRadiusM, coilLengthM, turns]);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.0005, 8, false), [curve]);
  return <mesh geometry={geometry}><meshStandardMaterial color="orange" /></mesh>;
}

function biotSavart(
  r: THREE.Vector3,
  coilPts: THREE.Vector3[],
  dl: THREE.Vector3[],
  current: number
): THREE.Vector3 {
  const MU_0 = 4 * Math.PI * 1e-7;
  let B = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i < coilPts.length; i++) {
    const R = new THREE.Vector3().subVectors(r, coilPts[i]);
    const rMag = R.length();
    if (rMag > 1e-6) {
      const cross = new THREE.Vector3().crossVectors(dl[i], R);
      cross.multiplyScalar(1 / Math.pow(rMag, 3));
      B.add(cross);
    }
  }
  B.multiplyScalar(MU_0 * current / (4 * Math.PI));
  return B;
}

function FieldArrows({
  coilRadiusM,
  coilLengthM,
  turns,
  current,
  onHoverField,
  zoomLevel
}: {
  coilRadiusM: number;
  coilLengthM: number;
  turns: number;
  current: number;
  onHoverField?: (pos: THREE.Vector3 | null, B?: number) => void;
  zoomLevel: number;
}) {
  const { coilPts, dl } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const isStraightWire = turns === 0;
    if (isStraightWire) {
      for (let i = 0; i < segments; i++) {
        const x = (i / (segments - 1)) * coilLengthM - coilLengthM / 2;
        pts.push(new THREE.Vector3(x, 0, 0));
      }
    } else {
      const theta = 2 * Math.PI * turns;
      for (let i = 0; i < segments; i++) {
        const t = (i / (segments - 1)) * theta;
        const x = (coilLengthM / theta) * t - coilLengthM / 2;
        const y = coilRadiusM * Math.cos(t);
        const z = coilRadiusM * Math.sin(t);
        pts.push(new THREE.Vector3(x, y, z));
      }
    }
    const segDl: THREE.Vector3[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      segDl.push(pts[i + 1].clone().sub(pts[i]));
    }
    segDl.push(segDl[segDl.length - 1].clone());
    return { coilPts: pts, dl: segDl };
  }, [coilRadiusM, coilLengthM, turns]);

  const arrows = useMemo(() => {
    const elements: React.JSX.Element[] = [];

    // Normalize zoom value to [0, 1]
    const t = (zoomLevel - minZoom) / (maxZoom - minZoom);
    const clampT = Math.max(0, Math.min(1, t));
    const gridExtent = lerp(minExtent, maxExtent, clampT);
    const gridSpacingCm = lerp(minSpacing, maxSpacing, clampT);

    for (let xCm = -gridExtent; xCm <= gridExtent; xCm += gridSpacingCm) {
      for (let zCm = -gridExtent; zCm <= gridExtent; zCm += gridSpacingCm) {
        const x = xCm / 100;
        const y = 0;
        const z = zCm / 100;
        const r = new THREE.Vector3(x, y, z);
        const B = biotSavart(r, coilPts, dl, current);
        const dir = B.clone().normalize();
        const length = 0.6 * gridSpacingCm / 100;
        const Bmag = B.length();
        const color = new THREE.Color().setHSL((1 - Math.min(1, Bmag * 1e5)) * 0.7, 1, 0.5);
        elements.push(
          <group key={`arrowgroup-${xCm}-${zCm}`}>
            <arrowHelper
              args={[dir, r, length, color.getHex(), 0.3 * length, 0.3 * length]}
            />
            <mesh
              position={[x, y, z]}
              onPointerOver={e => {
                e.stopPropagation();
                if (onHoverField) onHoverField(r, Bmag);
              }}
              onPointerOut={e => {
                e.stopPropagation();
                if (onHoverField) onHoverField(null, undefined);
              }}
              onPointerDown={e => {
                e.stopPropagation();
                if (onHoverField) onHoverField(r, Bmag);
              }}
            >
              <sphereGeometry args={[gridSpacingCm / 100, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        );
      }
    }
    return elements;
  }, [coilPts, dl, current, onHoverField]);

  return <>{arrows}</>;
}

function projectToScreen(
  vector: THREE.Vector3,
  camera: THREE.Camera,
  size: { width: number; height: number }
): { left: number; top: number } {
  const v = vector.clone().project(camera);
  return {
    left: ((v.x + 1) / 2) * size.width,
    top: (1 - (v.y + 1) / 2) * size.height,
  };
}

export default function MagneticField() {
  const [coilLengthCm, setCoilLengthCm] = useState(5);
  const [coilRadiusCm, setCoilRadiusCm] = useState(1);
  const [turns, setTurns] = useState(10);
  const [current, setCurrent] = useState(0.5);
  const [hoveredField, setHoveredField] = useState<THREE.Vector3 | null>(null);
  const [hoveredB, setHoveredB] = useState<number | undefined>(undefined);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [screenPos, setScreenPos] = useState<{ left: number; top: number } | null>(null);
  const [zoom, setZoom] = useState(1);

  return (
    <>
      <div
        className={styles.modalContent}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          height: "100%",
        }}
      >
        {/* Controls */}
        <div
          style={{
            marginBottom: 10,
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "space-between", // 'space-around' or 'space-between' works
            color: "black",
            padding: "0 0",
            flex: "none",
            width: "100%",
          }}
        >
          <div>
            <label>Coil Length: {coilLengthCm} cm</label><br />
            <input type="range" min="1" max="15" step="0.1" value={coilLengthCm} onChange={e => setCoilLengthCm(Number(e.target.value))} />
          </div>
          <div>
            <label>Coil Radius: {coilRadiusCm} cm</label><br />
            <input type="range" min="0.2" max="10" step="0.1" value={coilRadiusCm} onChange={e => setCoilRadiusCm(Number(e.target.value))} />
          </div>
          <div>
            <label>Turns: {turns}</label><br />
            <input type="range" min="1" max="30" step="1" value={turns} onChange={e => setTurns(Number(e.target.value))} />
          </div>
          <div>
            <label>Current: {current} A</label><br />
            <input type="range" min="0.1" max="5" step="0.1" value={current} onChange={e => setCurrent(Number(e.target.value))} />
          </div>
        </div>
        {/* Canvas container fills the rest */}
        <div
          ref={canvasRef}
          className={styles.canvasContainer}
          style={{
            flex: 1,
            minHeight: 0,
            position: "relative",
            pointerEvents: "none",
            height: "100%",
          }}
        >
          <Canvas
            style={{ pointerEvents: "auto", width: "100%", height: "100%" }}
            camera={{ position: [0, 0.18, 0], up: [0, 0, 1], fov: 45, near: 0.01 }}
            onPointerMissed={() => {
              setHoveredField(null);
              setHoveredB(undefined);
              setScreenPos(null);
            }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[0.1, 0.2, 0.2]} />
            <CoilMesh coilLengthM={coilLengthCm / 100} coilRadiusM={coilRadiusCm / 100} turns={turns} />
            <FieldArrows
              coilLengthM={coilLengthCm / 100}
              coilRadiusM={coilRadiusCm / 100}
              turns={turns}
              current={current}
              onHoverField={(pos, B) => {
                setHoveredField(pos);
                setHoveredB(B);

                if (pos && canvasRef.current) {
                  const { camera, size } = (window as any).threeFiberState || {};
                  if (camera && size) {
                    setScreenPos(projectToScreen(pos, camera, size));
                  } else {
                    setScreenPos({ left: 300, top: 200 });
                  }
                } else {
                  setScreenPos(null);
                }
              }}
              zoomLevel={zoom}
            />
            <OrbitControls />
            <CameraTracker setZoom={setZoom} />
            <CurrentArrow3D coilLengthM={coilLengthCm / 100}/>
          </Canvas>
          {/* Tooltip for |B| */}
          {hoveredField && hoveredB !== undefined && (
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "#fff",
                color: "#222",
                borderRadius: 4,
                padding: "3px 10px",
                fontSize: 15,
                fontFamily: "monospace",
                border: "1px solid #bbb",
                boxShadow: "0 2px 6px rgba(0,0,0,0.07)",
                pointerEvents: "none",
                zIndex: 100,
                whiteSpace: "nowrap"
              }}
            >
              |B| = {hoveredB.toExponential(3)} T
            </div>
          )}          
        </div>
        <div className={styles.descriptionScroll}>
          <b>What you're seeing:</b> The magnetic field lines inside and outside a solenoid. Use the sliders above to change the coil length, radius, number of turns, and current. Hover over the arrows to see the field strength at different points.
        </div>
      </div>
    </>
  );
}

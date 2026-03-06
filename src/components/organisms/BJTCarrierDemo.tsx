import React, { useEffect, useRef, useState } from "react";
import styles from "./BJTCarrierDemo.module.css";

type TransistorType = "NPN" | "PNP";
type OperatingMode = "Cutoff" | "Active" | "Saturation";

interface Particle {
  x: number;
  y: number;
  vx: number;
  drift: number;
  radius: number;
  phase: number;
  state: "injecting" | "base" | "collector";
  crowding: number;
  age: number;
  dwell: number;
}

interface Flash {
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

interface SliderProps {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

const CANVAS_WIDTH = 920;
const CANVAS_HEIGHT = 360;
const MOBILE_CANVAS_WIDTH = 420;
const MOBILE_CANVAS_HEIGHT = 520;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

export default function BJTCarrierDemo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const flashesRef = useRef<Flash[]>([]);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const spawnRemainderRef = useRef(0);

  const [transistorType, setTransistorType] = useState<TransistorType>("NPN");
  const [baseDrive, setBaseDrive] = useState(58);
  const [baseThickness, setBaseThickness] = useState(28);
  const [collectorField, setCollectorField] = useState(74);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 640px)").matches : false
  );
  const showDepletionRegions = true;
  const showLabels = true;
  const vbe = 0.72;
  const vce = 5.6;

  const injectionRate = clamp((baseDrive / 100) * (vbe / 0.75), 0, 1.4);
  const normalizedThickness = baseThickness / 100;
  const normalizedField = collectorField / 100;
  const saturationPressure = clamp(
    injectionRate * 1.2 + normalizedThickness * 0.25 - (normalizedField * 0.72 + vce / 18),
    0,
    1
  );
  const recombinationFraction = clamp(
    0.05 + normalizedThickness * 0.22 + saturationPressure * 0.24 - normalizedField * 0.08,
    0.02,
    0.92
  );
  const collectorCapture = clamp(
    normalizedField * (0.92 - normalizedThickness * 0.22 - saturationPressure * 0.3),
    0,
    0.96
  );

  let operatingMode: OperatingMode = "Active";
  if (injectionRate < 0.12 || vbe < 0.57) {
    operatingMode = "Cutoff";
  } else if (
    collectorCapture < 0.52 ||
    vce < 0.4 ||
    saturationPressure > 0.08 ||
    (baseDrive > 82 && collectorField < 72) ||
    (baseDrive > 92 && baseThickness > 18)
  ) {
    operatingMode = "Saturation";
  }

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    particlesRef.current = [];
    flashesRef.current = [];
    spawnRemainderRef.current = 0;
  }, [transistorType, isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = (now: number) => {
      const canvasWidth = isMobile ? MOBILE_CANVAS_WIDTH : CANVAS_WIDTH;
      const canvasHeight = isMobile ? MOBILE_CANVAS_HEIGHT : CANVAS_HEIGHT;
      const last = lastTimeRef.current ?? now;
      const dt = Math.min(0.033, (now - last) / 1000);
      lastTimeRef.current = now;

      const regionTop = 48;
      const regionBottom = canvasHeight - 52;
      const centerX = canvasWidth * 0.5;
      const centerY = canvasHeight * 0.5;
      const bodyRadius = isMobile ? 156 : 144;
      const baseWidth = lerp(44, 92, normalizedThickness);
      const baseX = centerX - baseWidth / 2;
      const collectorY = centerY - bodyRadius + 10;
      const emitterY = centerY + bodyRadius - 10;
      const collectorBandHeight = 120;
      const emitterBandHeight = 120;
      const fieldDirection = transistorType === "NPN" ? -1 : 1;
      const baseColor = transistorType === "NPN" ? "rgba(124, 45, 18, 0.34)" : "rgba(22, 78, 99, 0.34)";
      const carrierColor = transistorType === "NPN" ? "#7dd3fc" : "#fda4af";
      const carrierFill = transistorType === "NPN" ? "rgba(125, 211, 252, 0.9)" : "rgba(253, 164, 175, 0.9)";
      const symbol = transistorType === "NPN" ? "-" : "+";
      const spawnRate =
        operatingMode === "Cutoff"
          ? lerp(0, 3, injectionRate)
          : operatingMode === "Saturation"
            ? lerp(18, 82, injectionRate)
            : lerp(4, 68, injectionRate);
      const captureLine = centerY - 92;
      const saturationCaptureLine = centerY - 24;
      const baseMid = centerY;
      const basePulseRate = lerp(1, 8, baseDrive / 100);
      const injectionDirection = transistorType === "NPN" ? -1 : 1;
      const zeroField = normalizedField < 0.01;
      const effectiveCapture =
        operatingMode === "Saturation"
          ? Math.max(0.35, collectorCapture)
          : collectorCapture;
      const collectorStreamCount =
        operatingMode === "Saturation" && !zeroField
          ? Math.max(4, Math.round(lerp(4, 10, Math.max(normalizedField, 0.25))))
          : 0;

      const particles = particlesRef.current;
      const flashes = flashesRef.current;

      spawnRemainderRef.current += spawnRate * dt;
      while (spawnRemainderRef.current >= 1 && particles.length < 240) {
        particles.push({
          x: baseX + lerp(24, baseWidth - 4, Math.random()),
          y: transistorType === "NPN" ? emitterY + 6 : collectorY - 6,
          vx: lerp(58, 112, Math.random()),
          drift: lerp(18, 72, Math.random()),
          radius: 6,
          phase: Math.random() * Math.PI * 2,
          state: "injecting",
          crowding: Math.random(),
          age: 0,
          dwell: 0,
        });
        spawnRemainderRef.current -= 1;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#08131f";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const bodyGradient = ctx.createRadialGradient(centerX, centerY, 28, centerX, centerY, bodyRadius);
      bodyGradient.addColorStop(0, "#fef9c3");
      bodyGradient.addColorStop(1, "#facc15");
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, bodyRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(126, 34, 206, 0.9)";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = transistorType === "NPN" ? "rgba(14, 116, 144, 0.28)" : "rgba(190, 24, 93, 0.25)";
      ctx.fillRect(centerX - 112, collectorY - collectorBandHeight / 2, 224, collectorBandHeight);
      ctx.fillStyle = baseColor;
      ctx.fillRect(baseX, centerY - 96, baseWidth, 192);
      ctx.fillStyle = transistorType === "NPN" ? "rgba(8, 145, 178, 0.24)" : "rgba(225, 29, 72, 0.22)";
      ctx.fillRect(centerX - 112, emitterY - emitterBandHeight / 2, 224, emitterBandHeight);

      if (operatingMode === "Active") {
        ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
        ctx.fillRect(centerX - 20, centerY - 126, 40, 252);
      }

      if (showDepletionRegions) {
        ctx.fillStyle = "rgba(250, 204, 21, 0.18)";
        ctx.fillRect(baseX - 12, centerY - 106, 24, 212);
        ctx.fillStyle = "rgba(56, 189, 248, 0.16)";
        ctx.fillRect(baseX + baseWidth - 14, centerY - 106, 28, 212);
      }

      ctx.strokeStyle =
        operatingMode === "Cutoff"
          ? "rgba(148, 163, 184, 0.95)"
          : operatingMode === "Saturation"
            ? "rgba(220, 38, 38, 0.95)"
            : "rgba(37, 99, 235, 0.95)";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(centerX, collectorY - 36);
      ctx.lineTo(centerX, centerY - 18);
      ctx.moveTo(baseX - 120, centerY);
      ctx.lineTo(baseX, centerY);
      ctx.moveTo(centerX, centerY + 18);
      ctx.lineTo(centerX, emitterY + 36);
      ctx.stroke();

      for (let i = 0; i < 4; i += 1) {
        const pulseX = baseX - 88 + i * 22 + Math.sin(now / 160 + i) * 2;
        const pulseRadius = 4 + Math.sin(now / 140 + i * basePulseRate) * 1.3;
        const pulseAlpha = 0.35 + (baseDrive / 100) * 0.55;
        ctx.fillStyle = `rgba(244, 114, 182, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(pulseX, centerY, Math.max(2, pulseRadius), 0, Math.PI * 2);
        ctx.fill();
      }

      particlesRef.current = particles.filter((particle) => {
        particle.age += dt;
        const inBase =
          particle.x >= baseX && particle.x <= baseX + baseWidth && particle.y >= centerY - 96 && particle.y <= centerY + 96;
        const baseMotion = particle.state === "collector" ? 1.45 : 1;
        const crowdingOffset =
          operatingMode === "Saturation" && particle.y < baseMid
            ? Math.sin(now / 150 + particle.phase) * 18 * (0.2 + particle.crowding)
            : 0;

        particle.x += Math.sin(now / 180 + particle.phase) * particle.drift * dt * (inBase ? 0.18 : 0.1);

        if (particle.state === "collector") {
          particle.dwell = 0;
          particle.vx += 110 * normalizedField * dt;
          particle.y += fieldDirection * particle.vx * dt * baseMotion + crowdingOffset * dt;
        } else if (particle.state === "injecting") {
          particle.dwell = 0;
          const entrySpeed =
            operatingMode === "Cutoff"
              ? lerp(14, 32, injectionRate)
              : lerp(52, 118, injectionRate);
          particle.y += injectionDirection * entrySpeed * dt;
          const hitBase =
            transistorType === "NPN" ? particle.y <= centerY + 86 : particle.y >= centerY - 86;
          if (hitBase) {
            particle.state = "base";
            particle.vx =
              operatingMode === "Saturation"
                ? lerp(46, 110, Math.max(normalizedField, 0.2))
                : zeroField
                  ? 0
                  : lerp(140, 250, normalizedField);
          }
        } else {
          particle.dwell += dt;
          const transitSpeed = zeroField
            ? 0
            : operatingMode === "Saturation"
              ? lerp(54, 140, Math.max(normalizedField, 0.2)) * (0.7 + particle.crowding * 0.25)
              : lerp(160, 320, normalizedField);
          particle.vx = transitSpeed;
          particle.y += fieldDirection * particle.vx * dt + crowdingOffset * dt;
          if (zeroField) {
            particle.x += Math.sin(now / 120 + particle.phase) * particle.drift * dt * 0.3;
          }
        }

        particle.x = clamp(particle.x, centerX - 112, centerX + 112);
        particle.y = clamp(particle.y, regionTop + 12, regionBottom - 12);

        const activeCaptureEdge =
          operatingMode === "Saturation" ? saturationCaptureLine : captureLine;
        const reachedCaptureZone =
          transistorType === "NPN"
            ? particle.y <= activeCaptureEdge
            : particle.y >= canvasHeight - activeCaptureEdge;

        if (inBase && Math.random() < recombinationFraction * dt * 3.8) {
          flashes.push({ x: particle.x, y: particle.y, life: 0.18, maxLife: 0.18 });
          return false;
        }

        if (
          particle.state === "base" &&
          particle.dwell >
            (operatingMode === "Cutoff"
              ? 0.28
              : zeroField
                ? 0.35
                : operatingMode === "Saturation"
                  ? lerp(0.9, 1.9, normalizedThickness)
                  : lerp(0.55, 1.6, normalizedThickness))
        ) {
          flashes.push({ x: particle.x, y: particle.y, life: 0.14, maxLife: 0.14 });
          return false;
        }

        if (reachedCaptureZone && particle.state !== "collector") {
          if (Math.random() < effectiveCapture) {
            particle.state = "collector";
            particle.vx =
              operatingMode === "Saturation"
                ? lerp(220, 360, Math.max(normalizedField, 0.25))
                : lerp(120, 320, normalizedField);
            particle.dwell = 0;
            particle.x += Math.sin(particle.phase) * 10;
          } else if (operatingMode === "Saturation") {
            particle.state = "base";
            particle.y += fieldDirection * -28 * dt;
          }
        }

        if (transistorType === "NPN" && particle.y < -24) return false;
        if (transistorType === "PNP" && particle.y > canvasHeight + 24) return false;
        if (particle.age > 4.5) return false;
        return true;
      });

      flashesRef.current = flashes.filter((flash) => {
        flash.life -= dt;
        return flash.life > 0;
      });

      for (const particle of particlesRef.current) {
        ctx.fillStyle = particle.state === "collector" ? carrierFill : carrierColor;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "10px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(symbol, particle.x, particle.y + 0.5);
      }

      for (const flash of flashesRef.current) {
        const alpha = flash.life / flash.maxLife;
        ctx.strokeStyle = `rgba(250, 204, 21, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, 4 + (1 - alpha) * 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (collectorStreamCount > 0) {
        for (let i = 0; i < collectorStreamCount; i += 1) {
          const phase = now / 120 + i * 0.7;
          const t = (phase % 1 + 1) % 1;
          const streamY = lerp(centerY - 10, collectorY - 10, t);
          const streamX = centerX + Math.sin(now / 220 + i) * 10;
          ctx.fillStyle = carrierFill;
          ctx.beginPath();
          ctx.arc(streamX, streamY, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#e2e8f0";
          ctx.font = "10px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(symbol, streamX, streamY + 0.5);
        }
      }

      if (showLabels) {
        ctx.fillStyle = "rgba(241, 245, 249, 0.92)";
        ctx.font = isMobile ? "600 15px system-ui" : "600 17px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(`Collector (${transistorType === "NPN" ? "N" : "P"})`, centerX, 24);
        ctx.fillText(`Base (${transistorType === "NPN" ? "P" : "N"})`, baseX - (isMobile ? 120 : 168), centerY - 8);
        ctx.fillText(`Emitter (${transistorType === "NPN" ? "N" : "P"})`, centerX, canvasHeight - 12);
      }

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastTimeRef.current = null;
    };
  }, [
    transistorType,
    isMobile,
    operatingMode,
    normalizedThickness,
    normalizedField,
    injectionRate,
    recombinationFraction,
    collectorCapture,
    showDepletionRegions,
    showLabels,
  ]);

  return (
    <section className={styles.shell}>
      <div className={styles.grid}>
        <div className={`${styles.panel} ${styles.visualPanel}`}>
          <div className={styles.panelHeader}>
            <h2>Transistor Cross-Section</h2>
            <p>Conceptual carrier transport through the transistor body.</p>
          </div>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={isMobile ? MOBILE_CANVAS_WIDTH : CANVAS_WIDTH}
            height={isMobile ? MOBILE_CANVAS_HEIGHT : CANVAS_HEIGHT}
            aria-label="Animated bipolar junction transistor carrier-flow visualization"
          />
          <div className={styles.captionRow}>
            <span>{transistorType} transistor</span>
            <span>{operatingMode} region</span>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Controls</h2>
            <p>Conceptual carrier-flow model, not full semiconductor physics.</p>
          </div>

          <div className={styles.segmented}>
            {(["NPN", "PNP"] as TransistorType[]).map((option) => (
              <button
                key={option}
                type="button"
                className={option === transistorType ? styles.segmentActive : styles.segment}
                onClick={() => setTransistorType(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className={styles.segmented}>
            <div className={styles.modeIndicator}>
              <span className={styles.modeLabel}>Region</span>
              <strong className={styles.modeValue}>{operatingMode}</strong>
            </div>
          </div>

          <Slider
            label="Base drive"
            valueLabel={`${baseDrive}`}
            min={0}
            max={100}
            value={baseDrive}
            onChange={setBaseDrive}
          />
          <Slider
            label="Base thickness"
            valueLabel={baseThickness < 35 ? "Thin" : baseThickness < 70 ? "Medium" : "Thick"}
            min={0}
            max={100}
            value={baseThickness}
            onChange={setBaseThickness}
          />
          <Slider
            label="Collector field"
            valueLabel={collectorField < 35 ? "Weak" : collectorField < 70 ? "Moderate" : "Strong"}
            min={0}
            max={100}
            value={collectorField}
            onChange={setCollectorField}
          />
        </div>
      </div>
    </section>
  );
}

function Slider({ label, valueLabel, min, max, step = 1, value, onChange }: SliderProps) {
  return (
    <label className={styles.control}>
      <div className={styles.controlHeader}>
        <span>{label}</span>
        <strong>{valueLabel}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onInput={(event) => onChange(Number((event.target as HTMLInputElement).value))}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

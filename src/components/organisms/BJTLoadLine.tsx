import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Load-line + BJT output family simulator
 * - SVG plot
 * - Animated operating point = intersection of load line & instantaneous Ib curve
 *
 * Model (approx):
 *   x = Vce  (so x is 0..VCC, positive)
 *   Ic_active = beta * Ib
 *   knee factor: (1 - exp(-x / Vknee))
 *   Early effect: (1 + x / Va)
 *   Ic(x,Ib) = Ic_active * knee * early
 *
 * Load line:
 *   Ic_load(x) = (VCC - x) / RC
 *
 * Solve intersection by binary search on x in [0, VCC].
 */

function niceAxisMax(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 10;
  const rawStep = value / 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;

  let step = magnitude;
  if (normalized <= 1.5) step = magnitude;
  else if (normalized <= 3) step = 2 * magnitude;
  else if (normalized <= 7) step = 5 * magnitude;
  else step = 10 * magnitude;

  return Math.max(10, Math.ceil(value / step) * step);
}

function formatTick(value: number) {
  return Math.abs(value - Math.round(value)) < 1e-6 ? `${Math.round(value)}` : value.toFixed(1);
}

const DEFAULTS = {
  vcc: 10,
  rc: 1000,
  beta: 200,
  va: 60,
  vknee: 0.12,
  ibBiasUA: 25,
  ibAmpUA: 10,
  freqHz: 1.0,
};

export default function BJTLoadLine() {
  // ----- Controls -----
  const [vcc, setVcc] = useState(DEFAULTS.vcc); // volts
  const [rc, setRc] = useState(DEFAULTS.rc); // ohms
  const [beta, setBeta] = useState(DEFAULTS.beta); // unitless
  const [va, setVa] = useState(DEFAULTS.va); // Early voltage in volts
  const [vknee, setVknee] = useState(DEFAULTS.vknee); // volts (knee shaping)

  const [ibBiasUA, setIbBiasUA] = useState(DEFAULTS.ibBiasUA); // uA
  const [ibAmpUA, setIbAmpUA] = useState(DEFAULTS.ibAmpUA); // uA peak
  const [freqHz, setFreqHz] = useState(DEFAULTS.freqHz); // Hz
  const [paused, setPaused] = useState(false);

  // ----- Plot size -----
  const W = 720;
  const H = 500;
  const padL = 62;
  const padR = 18;
  const padT = 18;
  const padB = 82;

  // Axis ranges (auto-scale to avoid clipped load-line artifacts at low RC)
  const vceMin = 0;
  const vceMax = Math.max(10, Math.ceil(vcc));
  const icMinMA = 0;
  const loadInterceptMA = (vcc / rc) * 1e3;
  const icMaxMA = niceAxisMax(Math.max(10, loadInterceptMA * 1.1));
  const ibFamilyUA = [5, 15, 25, 35, 45];

  const xTicks = useMemo(
    () => Array.from({ length: 11 }, (_, i) => (i * vceMax) / 10),
    [vceMax]
  );
  const yTicks = useMemo(
    () => Array.from({ length: 11 }, (_, i) => (i * icMaxMA) / 10),
    [icMaxMA]
  );

  // ----- Helpers: scales -----
  const xScale = (vce: number) => {
    const t = (vce - vceMin) / (vceMax - vceMin);
    return padL + t * (W - padL - padR);
  };

  const yScale = (icMA: number) => {
    const t = (icMA - icMinMA) / (icMaxMA - icMinMA);
    return H - padB - t * (H - padT - padB);
  };

  // ----- Device model -----
  const icCurveMA = (vce: number, ibUA: number) => {
    const x = Math.max(0, Math.min(vcc, vce));
    const ibA = Math.max(0, ibUA) * 1e-6;
    const icActiveA = beta * ibA;

    const knee = 1 - Math.exp(-x / Math.max(1e-6, vknee));
    const early = 1 + x / Math.max(1e-6, va);

    const icA = icActiveA * knee * early;
    return icA * 1e3;
  };

  const icLoadMA = (vce: number) => {
    const icA = (vcc - vce) / rc;
    return Math.max(0, icA * 1e3);
  };

  // ----- Solve intersection for a given Ib (uA) -----
  const solveIntersection = (ibUA: number) => {
    let lo = 0;
    let hi = vcc;

    const f = (x: number) => icCurveMA(x, ibUA) - ((vcc - x) / rc) * 1e3;

    const flo = f(lo);
    const fhi = f(hi);

    if (Math.sign(flo) === Math.sign(fhi)) {
      const xPick = Math.abs(flo) < Math.abs(fhi) ? lo : hi;
      const vcePick = xPick;
      return { vce: vcePick, icMA: icLoadMA(vcePick) };
    }

    for (let i = 0; i < 40; i++) {
      const mid = 0.5 * (lo + hi);
      const fm = f(mid);
      if (Math.sign(fm) === Math.sign(flo)) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    const x = 0.5 * (lo + hi);
    const vce = x;
    const icMA = icLoadMA(vce);
    return { vce, icMA };
  };

  // ----- Precompute curve family paths -----
  const familyPaths = useMemo(() => {
    const n = 220;
    return ibFamilyUA.map((ib) => {
      let d = "";
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const vce = vceMin + t * (vceMax - vceMin);
        const ic = icCurveMA(vce, ib);
        const x = xScale(vce);
        const y = yScale(Math.min(icMaxMA * 0.999, ic));
        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
      return { ib, d };
    });
  }, [vcc, beta, va, vknee, rc, vceMax, icMaxMA]);

  // ----- Load line path -----
  const loadLinePath = useMemo(() => {
    const p1 = { vce: 0, ic: (vcc / rc) * 1e3 };
    const p2 = { vce: vcc, ic: 0 };
    const x1 = xScale(p1.vce);
    const y1 = yScale(p1.ic);
    const x2 = xScale(p2.vce);
    const y2 = yScale(p2.ic);
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }, [vcc, rc, vceMax, icMaxMA]);

  // ----- Animation loop -----
  const t0Ref = useRef(performance.now());
  const rafRef = useRef<number | null>(null);
  const [op, setOp] = useState(() => solveIntersection(ibBiasUA));
  const [ibNow, setIbNow] = useState(ibBiasUA);

  const handleResetPhase = () => {
    // Reset to the default slider settings and restart at phase 0.
    t0Ref.current = performance.now();
    setVcc(DEFAULTS.vcc);
    setRc(DEFAULTS.rc);
    setBeta(DEFAULTS.beta);
    setVa(DEFAULTS.va);
    setVknee(DEFAULTS.vknee);
    setIbBiasUA(DEFAULTS.ibBiasUA);
    setIbAmpUA(DEFAULTS.ibAmpUA);
    setFreqHz(DEFAULTS.freqHz);
  };

  useEffect(() => {
    // Keep readout and marker synced to control changes while paused.
    if (paused) {
      setIbNow(ibBiasUA);
      setOp(solveIntersection(ibBiasUA));
    }
  }, [paused, ibBiasUA, vcc, rc, beta, va, vknee]);

  useEffect(() => {
    const tick = (now: number) => {
      if (!paused) {
        const t = (now - t0Ref.current) / 1000;
        const ib = Math.max(
          0,
          ibBiasUA + ibAmpUA * Math.sin(2 * Math.PI * Math.max(0, freqHz) * t)
        );
        setIbNow(ib);
        setOp(solveIntersection(ib));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, ibBiasUA, ibAmpUA, freqHz, vcc, rc, beta, va, vknee]);

  // ----- Operating point marker -----
  const opX = xScale(op.vce);
  const opY = yScale(op.icMA);

  // ----- Simple grid -----
  const grid = useMemo(() => {
    const lines: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      key: string;
    }> = [];

    for (const v of xTicks) {
      lines.push({
        x1: xScale(v),
        y1: yScale(0),
        x2: xScale(v),
        y2: yScale(icMaxMA),
        key: `vx-${v.toFixed(4)}`,
      });
    }

    for (const i of yTicks) {
      lines.push({
        x1: xScale(0),
        y1: yScale(i),
        x2: xScale(vceMax),
        y2: yScale(i),
        key: `hy-${i.toFixed(4)}`,
      });
    }

    return lines;
  }, [xTicks, yTicks, vceMax, icMaxMA]);

  return (
    <div style={{ fontFamily: "system-ui, Arial", maxWidth: "100%", margin: "0 auto", padding: 8, color: "#111" }}>
      <h2 style={{ margin: "8px 0 12px" }}>Load Line + Output Curves Simulator</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            order: 2,
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <button onClick={() => setPaused((p) => !p)} style={btnStyle}>
              {paused ? "Play" : "Pause"}
            </button>
            <button
              onClick={handleResetPhase}
              style={btnStyle}
            >
              Reset
            </button>
          </div>

          <ControlRow
            label={`Input amplitude (uA): ${ibAmpUA.toFixed(1)}`}
            min={0}
            max={30}
            step={0.1}
            value={ibAmpUA}
            onChange={setIbAmpUA}
          />
          <ControlRow
            label={`Frequency (Hz): ${freqHz.toFixed(2)}`}
            min={0}
            max={10}
            step={0.01}
            value={freqHz}
            onChange={setFreqHz}
          />
          <ControlRow
            label={`Base bias (uA): ${ibBiasUA.toFixed(1)}`}
            min={0}
            max={60}
            step={0.1}
            value={ibBiasUA}
            onChange={setIbBiasUA}
          />

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "12px 0" }} />

          <ControlRow
            label={`VCC (V): ${vcc.toFixed(1)}`}
            min={5}
            max={15}
            step={0.1}
            value={vcc}
            onChange={setVcc}
          />
          <ControlRow
            label={`RC (Ohm): ${Math.round(rc)}`}
            min={200}
            max={3000}
            step={10}
            value={rc}
            onChange={setRc}
          />

          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "12px 0" }} />

          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 8 }}>Curve model knobs</div>
          <ControlRow
            label={`beta: ${Math.round(beta)}`}
            min={50}
            max={400}
            step={1}
            value={beta}
            onChange={setBeta}
          />
          <ControlRow
            label={`Early Va (V): ${va.toFixed(0)}`}
            min={20}
            max={200}
            step={1}
            value={va}
            onChange={setVa}
          />
          <ControlRow
            label={`Knee Vk (V): ${vknee.toFixed(3)}`}
            min={0.03}
            max={0.4}
            step={0.005}
            value={vknee}
            onChange={setVknee}
          />

          <div style={{ marginTop: 12, fontSize: 13 }}>
            <div><b>Instant Ib:</b> {ibNow.toFixed(2)} uA</div>
            <div>
              <b>Operating point:</b> VCE = {op.vce.toFixed(2)} V, IC = {op.icMA.toFixed(2)} mA
            </div>
          </div>
        </div>

        <div
          style={{
            order: 1,
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
            <g opacity={0.25}>
              {grid.map((ln) => (
                <line
                  key={ln.key}
                  x1={ln.x1}
                  y1={ln.y1}
                  x2={ln.x2}
                  y2={ln.y2}
                  stroke="black"
                  strokeWidth={1}
                />
              ))}
            </g>

            <g>
              <line
                x1={xScale(vceMin)}
                y1={yScale(0)}
                x2={xScale(vceMax)}
                y2={yScale(0)}
                stroke="black"
                strokeWidth={2}
              />
              <line
                x1={xScale(0)}
                y1={yScale(0)}
                x2={xScale(0)}
                y2={yScale(icMaxMA)}
                stroke="black"
                strokeWidth={2}
              />
              <text x={W / 2} y={H - 12} textAnchor="middle" fontSize={14}>
                VCE (V)
              </text>
              <text
                x={14}
                y={H / 2}
                transform={`rotate(-90, 14, ${H / 2})`}
                textAnchor="middle"
                fontSize={14}
              >
                IC (mA)
              </text>
            </g>

            <g fontSize={12} opacity={0.9}>
              {xTicks.map((v) => (
                <text key={v} x={xScale(v)} y={yScale(0) + 18} textAnchor="middle">
                  {formatTick(v)}
                </text>
              ))}
              {yTicks.map((mA) => (
                <text key={mA} x={xScale(0) - 10} y={yScale(mA) + 4} textAnchor="end">
                  {formatTick(mA)}
                </text>
              ))}
            </g>

            <g fill="none">
              {familyPaths.map((p) => (
                <path key={p.ib} d={p.d} stroke="black" strokeWidth={2} opacity={0.9} />
              ))}
            </g>

            <g fontSize={12} opacity={0.9}>
              {familyPaths.map((p) => {
                const vceLab = Math.min(vceMax * 0.68, vceMax - 0.6);
                const icLab = icCurveMA(vceLab, p.ib);
                return (
                  <text key={`lbl-${p.ib}`} x={xScale(vceLab) + 8} y={yScale(Math.min(icMaxMA * 0.98, icLab)) - 6}>
                    IB = {p.ib} uA
                  </text>
                );
              })}
            </g>

            <path d={loadLinePath} stroke="crimson" strokeWidth={3} fill="none" />

            <g>
              <circle cx={opX} cy={opY} r={7} fill="white" stroke="crimson" strokeWidth={3} />
              <line x1={opX} y1={opY} x2={opX} y2={yScale(0)} stroke="crimson" strokeWidth={1.5} opacity={0.55} />
              <line x1={opX} y1={opY} x2={xScale(0)} y2={opY} stroke="crimson" strokeWidth={1.5} opacity={0.55} />
            </g>
          </svg>

          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8 }}>
            Tip: set <b>Base bias</b> near 25 uA, then sweep <b>amplitude</b> to watch the point climb
            across IB = 15...35 uA curves.
          </div>
        </div>
      </div>
    </div>
  );
}

interface ControlRowProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

function ControlRow({ label, min, max, step, value, onChange }: ControlRowProps) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 13, marginBottom: 4 }}>{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  background: "white",
  color: "#111",
  borderRadius: 10,
  padding: "8px 10px",
  cursor: "pointer",
};

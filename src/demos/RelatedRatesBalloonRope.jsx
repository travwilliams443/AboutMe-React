import { useState } from "react";
import { BlockMath, InlineMath } from "../components/MathText";

const THETA_DEG = 55;
const THETA_RAD = (THETA_DEG * Math.PI) / 180;
const DSDT = -12;

function formatSig(value, digits = 6) {
  if (!Number.isFinite(value)) return "n/a";
  return Number(value.toPrecision(digits)).toString();
}

export default function RelatedRatesBalloonRope() {
  const [s, setS] = useState(120);
  const safeS = Math.max(10, Math.min(300, s));
  const h = safeS * Math.sin(THETA_RAD);
  const x = safeS * Math.cos(THETA_RAD);
  const dhdt = Math.sin(THETA_RAD) * DSDT;

  const scale = 1.3;
  const ox = 90;
  const oy = 380;
  const bx = ox + x * scale;
  const by = oy - h * scale;

  return (
    <section className="demo-layout">
      <div className="visual-panel">
        <h2>Hot-Air Balloon Rope</h2>
        <p>
          Rope angle is constant at <InlineMath math={"55^\\circ"} /> and rope length changes at{" "}
          <InlineMath math={"\\frac{ds}{dt}=-12\\,\\text{ft/s}"} /> (pulled in).
        </p>

        <div className="airliner-card">
          <svg viewBox="0 0 560 430" className="circle-svg" role="img" aria-label="Balloon rope triangle diagram">
            <rect x="0" y="0" width="560" height="430" fill="#f9fbff" />
            <line x1="40" y1={oy} x2="530" y2={oy} stroke="#485d70" strokeWidth="6" />
            <line x1={bx} y1={oy} x2={bx} y2={by} stroke="#0f5b55" strokeWidth="4" />
            <line x1={ox} y1={oy} x2={bx} y2={by} stroke="#c85700" strokeWidth="5" />

            <circle cx={bx} cy={by} r="12" fill="#5aa6ff" stroke="#2d6ba8" strokeWidth="2" />
            <text x={bx + 16} y={by - 6} className="plot-label">
              Balloon
            </text>
            <text x={(ox + bx) / 2 - 10} y={(oy + by) / 2 - 8} className="plot-label">
              s
            </text>
            <text x={bx + 8} y={(oy + by) / 2} className="plot-label">
              h
            </text>
            <text x={(ox + bx) / 2 - 14} y={oy + 24} className="plot-label">
              x
            </text>
            <path d={`M ${ox + 34} ${oy} A 34 34 0 0 0 ${ox + 20} ${oy - 28}`} fill="none" stroke="#7a2ba5" strokeWidth="2.5" />
            <text x={ox + 36} y={oy - 14} className="plot-label">
              55°
            </text>
          </svg>
        </div>

        <div className="controls-card">
          <label className="input-row">
            <span>
              Rope length <InlineMath math={"s\\,(\\text{ft})"} />
            </span>
            <input
              type="range"
              min="10"
              max="300"
              step="1"
              value={safeS}
              onChange={(e) => setS(Number(e.target.value))}
            />
            <input
              type="number"
              min="10"
              max="300"
              step="1"
              value={safeS}
              onChange={(e) => setS(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      <aside className="math-panel">
        <h2>Math Panel</h2>
        <section className="math-section">
          <h3>Model</h3>
          <BlockMath math={"h=s\\sin(55^\\circ)"} />
          <BlockMath math={"\\frac{ds}{dt}=-12\\,\\text{ft/s}"} />
        </section>

        <section className="math-section">
          <h3>Differentiate</h3>
          <BlockMath math={"\\frac{dh}{dt}=\\sin(55^\\circ)\\frac{ds}{dt}"} />
          <BlockMath math={"\\frac{dh}{dt}=-12\\sin(55^\\circ)\\,\\text{ft/s}"} />
          <BlockMath math={`\\frac{dh}{dt}\\approx ${formatSig(dhdt)}\\,\\text{ft/s}`} />
        </section>

        <section className="math-section">
          <h3>Interpretation</h3>
          <BlockMath math={"\\text{Negative sign means the balloon is descending.}"} />
          <BlockMath math={`\\text{Elevation decreases at }${formatSig(Math.abs(dhdt))}\\,\\text{ft/s}.`} />
        </section>

        <section className="math-section">
          <h3>Live values</h3>
          <BlockMath math={`s=${formatSig(safeS)}\\,\\text{ft}`} />
          <BlockMath math={`h=${formatSig(h)}\\,\\text{ft}`} />
          <BlockMath math={`x=${formatSig(x)}\\,\\text{ft}`} />
          <BlockMath math={`\\frac{dh}{dt}=${formatSig(dhdt)}\\,\\text{ft/s}`} />
        </section>
      </aside>
    </section>
  );
}

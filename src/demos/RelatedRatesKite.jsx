import { useState } from "react";
import { BlockMath, InlineMath } from "../components/MathText";

const HEIGHT = 59;
const DXDT = 5;

function formatSig(value, digits = 6) {
  if (!Number.isFinite(value)) return "n/a";
  return Number(value.toPrecision(digits)).toString();
}

export default function RelatedRatesKite() {
  const [s, setS] = useState(101);
  const safeS = Math.max(s, HEIGHT);
  const x = Math.sqrt(safeS * safeS - HEIGHT * HEIGHT);
  const dsdt = (x / safeS) * DXDT;

  const scenarioS = 101;
  const scenarioX = Math.sqrt(scenarioS * scenarioS - HEIGHT * HEIGHT);
  const scenarioDsdt = (scenarioX / scenarioS) * DXDT;

  const scale = 3;
  const baseX = 120;
  const baseY = 360;
  const topY = baseY - HEIGHT * scale;
  const topX = baseX + x * scale;

  return (
    <section className="demo-layout">
      <div className="visual-panel">
        <h2>Kite String Rate</h2>
        <p>
          The kite holds a constant height of <InlineMath math={"59\\,\\text{ft}"} /> and drifts east with{" "}
          <InlineMath math={"\\frac{dx}{dt}=5\\,\\text{ft/s}"} />. Find <InlineMath math={"\\frac{ds}{dt}"} /> when{" "}
          <InlineMath math={"s=101\\,\\text{ft}"} />.
        </p>

        <div className="airliner-card">
          <svg viewBox="0 0 560 420" className="circle-svg" role="img" aria-label="Kite triangle diagram">
            <rect x="0" y="0" width="560" height="420" fill="#f9fbff" />
            <line x1="60" y1={baseY} x2="520" y2={baseY} stroke="#aab7c5" strokeWidth="2" />
            <text x="526" y={baseY + 4} className="plot-label" style={{ fontWeight: 700 }}>
              E
            </text>
            <text x="42" y={baseY + 4} className="plot-label" style={{ fontWeight: 700 }}>
              W
            </text>
            <text x={baseX - 12} y="30" className="plot-label" style={{ fontWeight: 700 }}>
              N
            </text>

            <line x1={baseX} y1={baseY} x2={topX} y2={baseY} stroke="#1d6f6a" strokeWidth="4" />
            <line x1={topX} y1={baseY} x2={topX} y2={topY} stroke="#8e4a00" strokeWidth="4" />
            <line x1={baseX} y1={baseY} x2={topX} y2={topY} stroke="#5c2f8f" strokeWidth="4" />

            <circle cx={baseX} cy={baseY} r="6" fill="#17374a" />
            <circle cx={topX} cy={topY} r="8" fill="#d94f4f" />
            <text x={baseX - 32} y={baseY + 22} className="plot-label">
              Kate's hands
            </text>
            <text x={topX + 10} y={topY - 8} className="plot-label">
              Kite
            </text>
            <text x={baseX + (topX - baseX) / 2 - 12} y={baseY - 10} className="plot-label">
              x
            </text>
            <text x={topX + 8} y={baseY - (HEIGHT * scale) / 2} className="plot-label">
              59 ft
            </text>
            <text x={baseX + (topX - baseX) / 2} y={baseY - (HEIGHT * scale) / 2 - 20} className="plot-label">
              s
            </text>
          </svg>
        </div>

        <div className="controls-card">
          <label className="input-row">
            <span>
              String length <InlineMath math={"s\\,(\\text{ft})"} />
            </span>
            <input
              type="range"
              min={HEIGHT}
              max="180"
              step="0.1"
              value={safeS}
              onChange={(e) => setS(Number(e.target.value))}
            />
            <input
              type="number"
              min={HEIGHT}
              max="180"
              step="0.1"
              value={safeS}
              onChange={(e) => setS(Number(e.target.value))}
            />
          </label>
          <div className="controls-row">
            <button type="button" onClick={() => setS(101)}>
              Jump to <InlineMath math={"s=101\\,\\text{ft}"} />
            </button>
          </div>
        </div>
      </div>

      <aside className="math-panel">
        <h2>Math Panel</h2>
        <section className="math-section">
          <h3>Model</h3>
          <BlockMath math={"s^2=x^2+59^2"} />
          <BlockMath math={"\\frac{dx}{dt}=5\\,\\text{ft/s}"} />
        </section>

        <section className="math-section">
          <h3>Differentiate</h3>
          <BlockMath math={"2s\\frac{ds}{dt}=2x\\frac{dx}{dt}"} />
          <BlockMath math={"\\frac{ds}{dt}=\\frac{x}{s}\\frac{dx}{dt}"} />
        </section>

        <section className="math-section">
          <h3>When s = 101 ft</h3>
          <BlockMath math={"x=\\sqrt{101^2-59^2}=\\sqrt{6720}"} />
          <BlockMath math={`x\\approx ${formatSig(scenarioX)}\\,\\text{ft}`} />
          <BlockMath
            math={`\\frac{ds}{dt}=\\frac{\\sqrt{6720}}{101}(5)\\approx ${formatSig(scenarioDsdt)}\\,\\text{ft/s}`}
          />
        </section>

        <section className="math-section">
          <h3>Live values</h3>
          <BlockMath math={`s=${formatSig(safeS)}\\,\\text{ft}`} />
          <BlockMath math={`x=${formatSig(x)}\\,\\text{ft}`} />
          <BlockMath math={`\\frac{ds}{dt}=${formatSig(dsdt)}\\,\\text{ft/s}`} />
        </section>
      </aside>
    </section>
  );
}

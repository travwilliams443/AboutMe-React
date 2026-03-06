import { useState } from "react";
import { BlockMath, InlineMath } from "../components/MathText";

const POLE_H = 16.5;
const WOMAN_H = 5.5;
const DXDT = 9;

function formatSig(value, digits = 6) {
  if (!Number.isFinite(value)) return "n/a";
  return Number(value.toPrecision(digits)).toString();
}

export default function RelatedRatesStreetLight() {
  const [x, setX] = useState(14);
  const safeX = Math.max(0.5, Math.min(40, x));
  const s = 0.5 * safeX;
  const dsdt = 0.5 * DXDT;
  const tipX = safeX + s;

  const scale = 12;
  const ox = 80;
  const oy = 390;
  const poleTopY = oy - POLE_H * scale;
  const womanX = ox + safeX * scale;
  const womanTopY = oy - WOMAN_H * scale;
  const tipPx = ox + tipX * scale;

  return (
    <section className="demo-layout">
      <div className="visual-panel">
        <h2>Street Light and Shadow</h2>
        <p>
          Pole height <InlineMath math={"16.5\\,\\text{ft}"} />, woman height <InlineMath math={"5.5\\,\\text{ft}"} />, and{" "}
          <InlineMath math={"\\frac{dx}{dt}=9\\,\\text{ft/s}"} /> away from the pole.
        </p>

        <div className="airliner-card">
          <svg viewBox="0 0 620 430" className="circle-svg" role="img" aria-label="Street light shadow diagram">
            <rect x="0" y="0" width="620" height="430" fill="#f9fbff" />
            <line x1="30" y1={oy} x2="600" y2={oy} stroke="#485d70" strokeWidth="6" />

            <line x1={ox} y1={oy} x2={ox} y2={poleTopY} stroke="#3c4f60" strokeWidth="8" />
            <circle cx={ox} cy={poleTopY} r="6" fill="#ffd15a" stroke="#c4951a" strokeWidth="2" />
            <text x={ox - 28} y={poleTopY - 10} className="plot-label">
              16.5 ft
            </text>

            <line x1={womanX} y1={oy} x2={womanX} y2={womanTopY} stroke="#0f5b55" strokeWidth="5" />
            <circle cx={womanX} cy={womanTopY} r="4" fill="#0f5b55" />
            <text x={womanX + 8} y={womanTopY - 6} className="plot-label">
              5.5 ft
            </text>

            <line x1={ox} y1={poleTopY} x2={tipPx} y2={oy} stroke="#7a2ba5" strokeWidth="4" />
            <line x1={womanX} y1={oy} x2={tipPx} y2={oy} stroke="#c85700" strokeWidth="5" />

            <line x1={ox} y1={oy + 18} x2={womanX} y2={oy + 18} stroke="#1d6f6a" strokeWidth="2.5" />
            <text x={(ox + womanX) / 2 - 8} y={oy + 38} className="plot-label">
              x
            </text>
            <line x1={womanX} y1={oy + 26} x2={tipPx} y2={oy + 26} stroke="#b75b00" strokeWidth="2.5" />
            <text x={(womanX + tipPx) / 2 - 8} y={oy + 46} className="plot-label">
              s
            </text>
          </svg>
        </div>

        <div className="controls-card">
          <label className="input-row">
            <span>
              Woman distance <InlineMath math={"x\\,(\\text{ft})"} />
            </span>
            <input
              type="range"
              min="0.5"
              max="40"
              step="0.1"
              value={safeX}
              onChange={(e) => setX(Number(e.target.value))}
            />
            <input
              type="number"
              min="0.5"
              max="40"
              step="0.1"
              value={safeX}
              onChange={(e) => setX(Number(e.target.value))}
            />
          </label>
          <div className="controls-row">
            <button type="button" onClick={() => setX(14)}>
              Jump to <InlineMath math={"x=14\\,\\text{ft}"} />
            </button>
          </div>
        </div>
      </div>

      <aside className="math-panel">
        <h2>Math Panel</h2>
        <section className="math-section">
          <h3>Similar Triangles</h3>
          <BlockMath math={"\\frac{16.5}{x+s}=\\frac{5.5}{s}"} />
          <BlockMath math={"16.5s=5.5(x+s)\\Rightarrow 11s=5.5x\\Rightarrow s=\\frac{x}{2}"} />
        </section>

        <section className="math-section">
          <h3>Differentiate</h3>
          <BlockMath math={"\\frac{ds}{dt}=\\frac{1}{2}\\frac{dx}{dt}"} />
          <BlockMath math={"\\frac{ds}{dt}=\\frac{1}{2}(9)=4.5\\,\\text{ft/s}"} />
        </section>

        <section className="math-section">
          <h3>At x = 14 ft</h3>
          <BlockMath math={"\\frac{ds}{dt}=4.5\\,\\text{ft/s}"} />
          <BlockMath math={"\\text{(independent of }x\\text{ in this setup)}"} />
        </section>

        <section className="math-section">
          <h3>Live values</h3>
          <BlockMath math={`x=${formatSig(safeX)}\\,\\text{ft}`} />
          <BlockMath math={`s=${formatSig(s)}\\,\\text{ft}`} />
          <BlockMath math={`\\frac{ds}{dt}=${formatSig(dsdt)}\\,\\text{ft/s}`} />
        </section>
      </aside>
    </section>
  );
}

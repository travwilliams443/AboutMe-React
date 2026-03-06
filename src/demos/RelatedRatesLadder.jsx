import { useMemo, useState } from "react";
import { BlockMath, InlineMath } from "../components/MathText";

const LADDER_LEN = 25;
const DXDT = 0.3;

function formatSig(value, digits = 6) {
  if (!Number.isFinite(value)) return "n/a";
  return Number(value.toPrecision(digits)).toString();
}

export default function RelatedRatesLadder() {
  const [x, setX] = useState(24);
  const safeX = Math.min(LADDER_LEN - 0.1, Math.max(0.1, x));
  const y = Math.sqrt(LADDER_LEN * LADDER_LEN - safeX * safeX);
  const dydt = -(safeX / y) * DXDT;

  const atTwentyFour = useMemo(() => {
    const x0 = 24;
    const y0 = Math.sqrt(625 - x0 * x0);
    const dydt0 = -(x0 / y0) * DXDT;
    return { x0, y0, dydt0 };
  }, []);

  const scale = 14;
  const originX = 100;
  const originY = 390;
  const topY = originY - y * scale;
  const footX = originX + safeX * scale;

  return (
    <section className="demo-layout">
      <div className="visual-panel">
        <h2>Ladder Against a Wall</h2>
        <p>
          A <InlineMath math={"25\\,\\text{ft}"} /> ladder has foot distance <InlineMath math={"x"} /> from the wall and top
          height <InlineMath math={"y"} />. Given <InlineMath math={"\\frac{dx}{dt}=0.3\\,\\text{ft/s}"} />, find{" "}
          <InlineMath math={"\\frac{dy}{dt}"} /> when <InlineMath math={"x=24\\,\\text{ft}"} />.
        </p>

        <div className="airliner-card">
          <svg viewBox="0 0 560 430" className="circle-svg" role="img" aria-label="Ladder wall diagram">
            <rect x="0" y="0" width="560" height="430" fill="#f9fbff" />
            <line x1={originX} y1="40" x2={originX} y2={originY} stroke="#485d70" strokeWidth="6" />
            <line x1={originX} y1={originY} x2="520" y2={originY} stroke="#485d70" strokeWidth="6" />

            <line x1={originX} y1={originY} x2={footX} y2={topY} stroke="#c85700" strokeWidth="6" />
            <circle cx={footX} cy={topY} r="7" fill="#c85700" />
            <text x={footX + 10} y={topY - 8} className="plot-label">
              Top
            </text>

            <line x1={originX} y1={originY + 18} x2={footX} y2={originY + 18} stroke="#0f5b55" strokeWidth="2.5" />
            <text x={(originX + footX) / 2 - 8} y={originY + 36} className="plot-label">
              x
            </text>
            <line x1={originX + 18} y1={originY} x2={originX + 18} y2={topY} stroke="#0f5b55" strokeWidth="2.5" />
            <text x={originX + 24} y={(originY + topY) / 2} className="plot-label">
              y
            </text>
            <text x={(originX + footX) / 2 + 16} y={(originY + topY) / 2 - 10} className="plot-label">
              25 ft
            </text>
          </svg>
        </div>

        <div className="controls-card">
          <label className="input-row">
            <span>
              Foot distance <InlineMath math={"x\\,(\\text{ft})"} />
            </span>
            <input
              type="range"
              min="0.1"
              max="24.9"
              step="0.1"
              value={safeX}
              onChange={(e) => setX(Number(e.target.value))}
            />
            <input
              type="number"
              min="0.1"
              max="24.9"
              step="0.1"
              value={safeX}
              onChange={(e) => setX(Number(e.target.value))}
            />
          </label>
          <div className="controls-row">
            <button type="button" onClick={() => setX(24)}>
              Jump to <InlineMath math={"x=24\\,\\text{ft}"} />
            </button>
          </div>
        </div>
      </div>

      <aside className="math-panel">
        <h2>Math Panel</h2>
        <section className="math-section">
          <h3>Model</h3>
          <BlockMath math={"x^2+y^2=25^2=625"} />
          <BlockMath math={"\\frac{dx}{dt}=0.3\\,\\text{ft/s}"} />
        </section>

        <section className="math-section">
          <h3>Differentiate</h3>
          <BlockMath math={"2x\\frac{dx}{dt}+2y\\frac{dy}{dt}=0"} />
          <BlockMath math={"\\frac{dy}{dt}=-\\frac{x}{y}\\frac{dx}{dt}"} />
        </section>

        <section className="math-section">
          <h3>At x = 24 ft</h3>
          <BlockMath math={"y=\\sqrt{625-24^2}=\\sqrt{49}=7\\,\\text{ft}"} />
          <BlockMath math={"\\frac{dy}{dt}=-\\frac{24}{7}(0.3)=-\\frac{36}{35}\\,\\text{ft/s}"} />
          <BlockMath math={`\\frac{dy}{dt}\\approx ${formatSig(atTwentyFour.dydt0)}\\,\\text{ft/s}`} />
        </section>

        <section className="math-section">
          <h3>Live values</h3>
          <BlockMath math={`x=${formatSig(safeX)}\\,\\text{ft}`} />
          <BlockMath math={`y=${formatSig(y)}\\,\\text{ft}`} />
          <BlockMath math={`\\frac{dy}{dt}=${formatSig(dydt)}\\,\\text{ft/s}`} />
        </section>
      </aside>
    </section>
  );
}

import { useMemo, useState } from "react";
import { BlockMath, InlineMath } from "../components/MathText";

const H_TANK = 15;
const R_TANK = 5;
const DHDT = -4;

function formatSig(value, digits = 6) {
  if (!Number.isFinite(value)) return "n/a";
  return Number(value.toPrecision(digits)).toString();
}

export default function RelatedRatesConeDrain() {
  const [h, setH] = useState(6);
  const safeH = Math.min(H_TANK, Math.max(0.2, h));
  const r = safeH / 3;
  const v = (Math.PI * safeH * safeH * safeH) / 27;
  const dvdt = (Math.PI / 9) * safeH * safeH * DHDT;

  const atSix = useMemo(() => {
    const h0 = 6;
    const dvdt0 = (Math.PI / 9) * h0 * h0 * DHDT;
    return { h0, dvdt0 };
  }, []);

  const coneTopY = 80;
  const coneBottomY = 360;
  const coneCenterX = 280;
  const coneHalfWidth = 120;
  const waterTopY = coneBottomY - (safeH / H_TANK) * (coneBottomY - coneTopY);
  const waterHalfWidth = (safeH / H_TANK) * coneHalfWidth;

  return (
    <section className="demo-layout">
      <div className="visual-panel">
        <h2>Inverted Cone Drain</h2>
        <p>
          Tank dimensions: height <InlineMath math={"15\\,\\text{ft}"} />, top radius{" "}
          <InlineMath math={"5\\,\\text{ft}"} />. Water depth changes at{" "}
          <InlineMath math={"\\frac{dh}{dt}=-4\\,\\text{ft/min}"} />.
        </p>

        <div className="airliner-card">
          <svg viewBox="0 0 560 430" className="circle-svg" role="img" aria-label="Inverted cone water diagram">
            <rect x="0" y="0" width="560" height="430" fill="#f9fbff" />

            <ellipse cx={coneCenterX} cy={coneTopY} rx={coneHalfWidth} ry="24" fill="#e8edf3" stroke="#9aacbf" strokeWidth="3" />
            <line
              x1={coneCenterX - coneHalfWidth}
              y1={coneTopY}
              x2={coneCenterX}
              y2={coneBottomY}
              stroke="#8e9dac"
              strokeWidth="4"
            />
            <line
              x1={coneCenterX + coneHalfWidth}
              y1={coneTopY}
              x2={coneCenterX}
              y2={coneBottomY}
              stroke="#8e9dac"
              strokeWidth="4"
            />

            <polygon
              points={`${coneCenterX - waterHalfWidth},${waterTopY} ${coneCenterX + waterHalfWidth},${waterTopY} ${coneCenterX},${coneBottomY}`}
              fill="rgba(77, 201, 255, 0.45)"
              stroke="#1b86b3"
              strokeWidth="2"
            />
            <ellipse
              cx={coneCenterX}
              cy={waterTopY}
              rx={Math.max(2, waterHalfWidth)}
              ry={Math.max(2, waterHalfWidth * 0.2)}
              fill="rgba(77, 201, 255, 0.65)"
              stroke="#1b86b3"
              strokeWidth="2"
            />

            <line x1="470" y1={coneTopY} x2="470" y2={coneBottomY} stroke="#333" strokeWidth="1.5" />
            <line x1="465" y1={coneTopY} x2="475" y2={coneTopY} stroke="#333" strokeWidth="1.5" />
            <line x1="465" y1={coneBottomY} x2="475" y2={coneBottomY} stroke="#333" strokeWidth="1.5" />
            <text x="480" y={(coneTopY + coneBottomY) / 2} className="plot-label">
              15 ft
            </text>

            <line x1={coneCenterX} y1={coneTopY - 30} x2={coneCenterX + coneHalfWidth} y2={coneTopY - 30} stroke="#d31584" strokeWidth="3" />
            <circle cx={coneCenterX} cy={coneTopY - 30} r="4" fill="#d31584" />
            <text x={coneCenterX + coneHalfWidth / 2 - 10} y={coneTopY - 38} className="plot-label">
              5 ft
            </text>

            <line x1={coneCenterX + 35} y1={coneBottomY} x2={coneCenterX + 35} y2={waterTopY} stroke="#0f5b55" strokeWidth="2.5" />
            <text x={coneCenterX + 42} y={(coneBottomY + waterTopY) / 2} className="plot-label">
              h
            </text>
          </svg>
        </div>

        <div className="controls-card">
          <label className="input-row">
            <span>
              Water depth <InlineMath math={"h\\,(\\text{ft})"} />
            </span>
            <input
              type="range"
              min="0.2"
              max="15"
              step="0.1"
              value={safeH}
              onChange={(e) => setH(Number(e.target.value))}
            />
            <input
              type="number"
              min="0.2"
              max="15"
              step="0.1"
              value={safeH}
              onChange={(e) => setH(Number(e.target.value))}
            />
          </label>
          <div className="controls-row">
            <button type="button" onClick={() => setH(6)}>
              Jump to <InlineMath math={"h=6\\,\\text{ft}"} />
            </button>
          </div>
        </div>
      </div>

      <aside className="math-panel">
        <h2>Math Panel</h2>
        <section className="math-section">
          <h3>Geometry + Volume</h3>
          <BlockMath math={"\\frac{r}{h}=\\frac{5}{15}=\\frac{1}{3}\\Rightarrow r=\\frac{h}{3}"} />
          <BlockMath math={"V=\\frac{1}{3}\\pi r^2h"} />
          <BlockMath math={"V=\\frac{1}{3}\\pi\\left(\\frac{h}{3}\\right)^2h=\\frac{\\pi h^3}{27}"} />
        </section>

        <section className="math-section">
          <h3>Differentiate w.r.t. time</h3>
          <BlockMath math={"\\frac{dV}{dt}=\\frac{\\pi}{9}h^2\\frac{dh}{dt}"} />
          <BlockMath math={"\\frac{dh}{dt}=-4\\,\\text{ft/min}"} />
        </section>

        <section className="math-section">
          <h3>At h = 6 ft</h3>
          <BlockMath math={"\\frac{dV}{dt}=\\frac{\\pi}{9}(6)^2(-4)=-16\\pi\\,\\text{ft}^3/\\text{min}"} />
          <BlockMath math={`\\frac{dV}{dt}\\approx ${formatSig(atSix.dvdt0)}\\,\\text{ft}^3/\\text{min}`} />
          <BlockMath math={"\\text{Draining rate (outflow magnitude)}=16\\pi\\approx 50.2655\\,\\text{ft}^3/\\text{min}"} />
        </section>

        <section className="math-section">
          <h3>Live values</h3>
          <BlockMath math={`h=${formatSig(safeH)}\\,\\text{ft}`} />
          <BlockMath math={`r=${formatSig(r)}\\,\\text{ft}`} />
          <BlockMath math={`V=${formatSig(v)}\\,\\text{ft}^3`} />
          <BlockMath math={`\\frac{dV}{dt}=${formatSig(dvdt)}\\,\\text{ft}^3/\\text{min}`} />
        </section>
      </aside>
    </section>
  );
}

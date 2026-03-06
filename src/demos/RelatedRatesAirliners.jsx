import { useMemo, useState } from "react";
import { BlockMath, InlineMath } from "../components/MathText";

function formatSig(value, digits = 6) {
  if (!Number.isFinite(value)) return "n/a";
  return Number(value.toPrecision(digits)).toString();
}

export default function RelatedRatesAirliners() {
  const [time, setTime] = useState(3);
  const dxdt = 510;
  const dydt = time >= 1 ? 560 : 0;

  const x = dxdt * time;
  const y = time >= 1 ? 560 * (time - 1) : 0;
  const z = Math.sqrt(x * x + y * y);
  const dzdt = z > 0 ? (x * dxdt + y * dydt) / z : 0;

  const scale = useMemo(() => {
    const maxExtent = Math.max(1800, Math.abs(x), Math.abs(y), z);
    return 220 / maxExtent;
  }, [x, y, z]);

  const plane1Px = { x: 260 + x * scale, y: 260 };
  const plane2Px = { x: 260, y: 260 + y * scale };

  const atThree = useMemo(() => {
    const tx = 510 * 3;
    const ty = 560 * (3 - 1);
    const tz = Math.sqrt(tx * tx + ty * ty);
    const tdzdt = (tx * 510 + ty * 560) / tz;
    return { tx, ty, tz, tdzdt };
  }, []);

  return (
    <section className="demo-layout">
      <div className="visual-panel">
        <h2>Airliners Over an Airport</h2>
        <p>
          Plane A passes the airport at noon traveling due east at{" "}
          <InlineMath math={"510\\,\\text{mi/hr}"} />. Plane B passes at 1:00 p.m. traveling due south at{" "}
          <InlineMath math={"560\\,\\text{mi/hr}"} />.
        </p>

        <div className="airliner-card">
          <svg viewBox="0 0 520 520" className="circle-svg" role="img" aria-label="Airliner position diagram">
            <rect x="0" y="0" width="520" height="520" fill="#f9fbff" />
            <line x1="40" y1="260" x2="480" y2="260" stroke="#aab7c5" strokeWidth="2" />
            <line x1="260" y1="40" x2="260" y2="480" stroke="#aab7c5" strokeWidth="2" />
            <text x="252" y="24" className="plot-label" style={{ fontWeight: 700 }}>
              N
            </text>
            <text x="252" y="500" className="plot-label" style={{ fontWeight: 700 }}>
              S
            </text>
            <text x="494" y="264" className="plot-label" style={{ fontWeight: 700 }}>
              E
            </text>
            <text x="18" y="264" className="plot-label" style={{ fontWeight: 700 }}>
              W
            </text>
            <circle cx="260" cy="260" r="6" fill="#17374a" />
            <text x="268" y="252" className="plot-label">
              Airport
            </text>

            <line x1="260" y1="260" x2={plane1Px.x} y2={plane1Px.y} stroke="#0d7668" strokeWidth="4" />
            <line x1="260" y1="260" x2={plane2Px.x} y2={plane2Px.y} stroke="#8e4a00" strokeWidth="4" />
            <line
              x1={plane1Px.x}
              y1={plane1Px.y}
              x2={plane2Px.x}
              y2={plane2Px.y}
              stroke="#5c2f8f"
              strokeWidth="3"
              strokeDasharray="7 5"
            />

            <circle cx={plane1Px.x} cy={plane1Px.y} r="8" fill="#0d7668" />
            <circle cx={plane2Px.x} cy={plane2Px.y} r="8" fill="#8e4a00" />
            <text x={plane1Px.x + 10} y={plane1Px.y - 10} className="plot-label">
              Plane A
            </text>
            <text x={plane2Px.x + 10} y={plane2Px.y - 10} className="plot-label">
              Plane B
            </text>
          </svg>
        </div>

        <div className="controls-card">
          <label className="input-row">
            <span>
              Time after noon <InlineMath math={"t\\,(\\text{hr})"} />
            </span>
            <input
              type="range"
              min="0"
              max="5"
              step="0.05"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
            />
            <input
              type="number"
              min="0"
              max="5"
              step="0.05"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      <aside className="math-panel">
        <h2>Math Panel</h2>
        <section className="math-section">
          <h3>Model</h3>
          <BlockMath math={"x(t)=510t"} />
          <BlockMath math={"y(t)=560(t-1),\\quad t\\ge 1\\;(\\text{south distance})"} />
          <BlockMath math={"z^2=x^2+y^2"} />
        </section>

        <section className="math-section">
          <h3>Differentiate</h3>
          <BlockMath math={"2z\\frac{dz}{dt}=2x\\frac{dx}{dt}+2y\\frac{dy}{dt}"} />
          <BlockMath math={"\\frac{dz}{dt}=\\frac{x\\frac{dx}{dt}+y\\frac{dy}{dt}}{z}"} />
        </section>

        <section className="math-section">
          <h3>At 3:00 p.m.</h3>
          <BlockMath math={`x=510(3)=${atThree.tx}`} />
          <BlockMath math={`y=560(3-1)=${atThree.ty}`} />
          <BlockMath math={`z=\\sqrt{${atThree.tx}^2+(${atThree.ty})^2}=${formatSig(atThree.tz)}\\,\\text{mi}`} />
          <BlockMath
            math={`\\frac{dz}{dt}=\\frac{(${atThree.tx})(510)+(${atThree.ty})(560)}{${formatSig(atThree.tz)}}\\approx ${formatSig(
              atThree.tdzdt
            )}\\,\\text{mi/hr}`}
          />
        </section>

        <section className="math-section">
          <h3>Live values</h3>
          <BlockMath math={`t=${formatSig(time)}\\,\\text{hr after noon}`} />
          <BlockMath math={`x=${formatSig(x)}\\,\\text{mi}`} />
          <BlockMath math={`y=${formatSig(y)}\\,\\text{mi}`} />
          <BlockMath math={`z=${formatSig(z)}\\,\\text{mi}`} />
          <BlockMath math={`\\frac{dz}{dt}=${formatSig(dzdt)}\\,\\text{mi/hr}`} />
        </section>
      </aside>
    </section>
  );
}

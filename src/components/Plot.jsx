import { renderToString } from "katex/dist/katex.mjs";
import { InlineMath } from "./MathText";

function mapToRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return (outMin + outMax) / 2;
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
}

function makeCurve(dAdt) {
  const minR = 0.1;
  const maxR = 10;
  const steps = 50;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const r = minR + (i / steps) * (maxR - minR);
    const drdt = dAdt / (2 * Math.PI * r);
    points.push({ r, drdt });
  }
  return points;
}

export default function Plot({ currentR, currentDrdt, dAdt, history }) {
  const width = 540;
  const height = 220;
  const pad = 32;
  const curve = makeCurve(dAdt);
  const yMax = Math.max(...curve.map((p) => p.drdt), currentDrdt, 0.5);

  const linePath = curve
    .map((p, i) => {
      const x = mapToRange(p.r, 0.1, 10, pad, width - pad);
      const y = mapToRange(p.drdt, 0, yMax, height - pad, pad);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const currentX = mapToRange(currentR, 0.1, 10, pad, width - pad);
  const currentY = mapToRange(currentDrdt, 0, yMax, height - pad, pad);
  const latest = history[history.length - 1];
  const xAxisLabel = renderToString("r\\,(\\mathrm{cm})", { throwOnError: false });
  const yAxisLabel = renderToString("\\frac{dr}{dt}\\,(\\mathrm{cm/s})", { throwOnError: false });

  return (
    <section className="plot-card">
      <h3>
        <InlineMath math={"\\frac{dr}{dt}\\text{ vs }r"} /> (live)
      </h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="plot-svg" role="img" aria-label="drdt versus r plot">
        <rect x="0" y="0" width={width} height={height} fill="#fbfcfd" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#b3bdc7" />
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#b3bdc7" />
        <path d={linePath} fill="none" stroke="#1b6f67" strokeWidth="3" />
        <circle cx={currentX} cy={currentY} r="6" fill="#c85700" />
        <text x={width - 120} y={26} className="plot-label">
          dr/dt = {Number(currentDrdt.toPrecision(4))}
        </text>
        <text x={width - 120} y={42} className="plot-label">
          r = {Number(currentR.toPrecision(4))}
        </text>
        {latest ? (
          <text x={width - 120} y={58} className="plot-label">
            t = {Number(latest.t.toPrecision(4))} s
          </text>
        ) : null}
        <foreignObject x={width / 2 - 48} y={height - 28} width="120" height="24">
          <div className="katex-svg-label" dangerouslySetInnerHTML={{ __html: xAxisLabel }} />
        </foreignObject>
        <g transform="translate(14, 150) rotate(-90)">
          <foreignObject x="0" y="0" width="160" height="26">
            <div className="katex-svg-label" dangerouslySetInnerHTML={{ __html: yAxisLabel }} />
          </foreignObject>
        </g>
      </svg>
    </section>
  );
}

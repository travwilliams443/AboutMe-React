import { BlockMath, InlineMath } from "./MathText";

const PI = Math.PI;

function scenarioAValue() {
  return 1 / (4 * PI);
}

function scenarioBValue() {
  return 3 / 2;
}

export default function MathPanel({ area, radius, circumference, dAdt, drdt, formatSig }) {
  return (
    <aside className="math-panel">
      <h2>Math Panel</h2>

      <section className="math-section">
        <h3>Definitions</h3>
        <BlockMath math={"A=\\pi r^2"} />
        <BlockMath math={"C=2\\pi r"} />
      </section>

      <section className="math-section">
        <h3>Differentiate with respect to time</h3>
        <BlockMath math={"\\frac{dA}{dt}=2\\pi r\\frac{dr}{dt}"} />
      </section>

      <section className="math-section">
        <h3>Solve for radius rate</h3>
        <BlockMath math={"\\frac{dr}{dt}=\\frac{1}{2\\pi r}\\frac{dA}{dt}"} />
        <BlockMath math={"\\text{With }\\frac{dA}{dt}=3:\\quad\\frac{dr}{dt}=\\frac{3}{2\\pi r}"} />
      </section>

      <section className="math-section">
        <h3>
          Scenario (a): <InlineMath math={"r=6\\,\\text{cm}"} />
        </h3>
        <BlockMath math={"\\text{Exact: }\\frac{dr}{dt}=\\frac{3}{2\\pi\\cdot 6}=\\frac{1}{4\\pi}\\,\\text{cm/s}"} />
        <BlockMath math={`\\text{Approx: }\\frac{dr}{dt}\\approx ${formatSig(scenarioAValue())}\\,\\text{cm/s}`} />
      </section>

      <section className="math-section">
        <h3>
          Scenario (b): <InlineMath math={"C=2\\,\\text{cm}"} />
        </h3>
        <BlockMath math={"\\text{Exact radius: }r=\\frac{C}{2\\pi}=\\frac{2}{2\\pi}=\\frac{1}{\\pi}\\,\\text{cm}"} />
        <BlockMath math={"\\text{Exact rate: }\\frac{dr}{dt}=\\frac{3}{2\\pi(1/\\pi)}=\\frac{3}{2}\\,\\text{cm/s}"} />
        <BlockMath math={`\\text{Approx: }\\frac{dr}{dt}\\approx ${formatSig(scenarioBValue())}\\,\\text{cm/s}`} />
      </section>

      <section className="math-section">
        <h3>Live values</h3>
        <BlockMath math={`A=${formatSig(area)}\\,\\text{cm}^2`} />
        <BlockMath math={`r=${formatSig(radius)}\\,\\text{cm}`} />
        <BlockMath math={`C=${formatSig(circumference)}\\,\\text{cm}`} />
        <BlockMath math={`\\frac{dA}{dt}=${formatSig(dAdt)}\\,\\text{cm}^2/\\text{s}`} />
        <BlockMath math={`\\frac{dr}{dt}=${formatSig(drdt)}\\,\\text{cm}/\\text{s}`} />
        <p>
          Current formula:{" "}
          <InlineMath math={`\\frac{dr}{dt}=\\frac{${formatSig(dAdt)}}{2\\pi\\cdot ${formatSig(radius)}}`} />
        </p>
      </section>
    </aside>
  );
}

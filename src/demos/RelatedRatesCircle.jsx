import { useEffect, useMemo, useRef, useState } from "react";
import MathPanel from "../components/MathPanel";
import { InlineMath } from "../components/MathText";
import PlayControls from "../components/PlayControls";
import Plot from "../components/Plot";

const PI = Math.PI;

function areaFromRadius(r) {
  return PI * r * r;
}

function radiusFromArea(a) {
  return Math.sqrt(a / PI);
}

function formatSig(value, digits = 5) {
  if (!Number.isFinite(value)) return "n/a";
  return Number(value.toPrecision(digits)).toString();
}

export default function RelatedRatesCircle() {
  const [dAdt, setDAdt] = useState(3);
  const [r0, setR0] = useState(1);
  const [t, setT] = useState(0);
  const [area, setArea] = useState(areaFromRadius(1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [holdConstant, setHoldConstant] = useState(true);
  const [focusMode, setFocusMode] = useState("");
  const [history, setHistory] = useState([{ t: 0, r: 1, drdt: 3 / (2 * PI * 1) }]);
  const lastTsRef = useRef(null);
  const frameRef = useRef(null);

  const r = useMemo(() => radiusFromArea(area), [area]);
  const circumference = useMemo(() => 2 * PI * r, [r]);
  const drdt = useMemo(() => dAdt / (2 * PI * r), [dAdt, r]);

  const resetState = (nextR0 = r0) => {
    const nextArea = areaFromRadius(nextR0);
    setT(0);
    setArea(nextArea);
    setHistory([{ t: 0, r: nextR0, drdt: dAdt / (2 * PI * nextR0) }]);
    setIsPlaying(false);
    setFocusMode("");
    lastTsRef.current = null;
  };

  useEffect(() => {
    if (!isPlaying) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTsRef.current = null;
      return;
    }
    const step = (ts) => {
      if (lastTsRef.current == null) {
        lastTsRef.current = ts;
      }
      const dtReal = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const dt = dtReal * speed;
      if (dt > 0) {
        setArea((prev) => prev + dAdt * dt);
        setT((prevT) => prevT + dt);
      }
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastTsRef.current = null;
    };
  }, [isPlaying, speed, dAdt]);

  useEffect(() => {
    setHistory((prev) => {
      const next = [...prev, { t, r, drdt }];
      const minT = t - 20;
      return next.filter((p) => p.t >= minT);
    });
  }, [t, r, drdt]);

  const jumpToRadiusSix = () => {
    const jumpR = 6;
    setArea(areaFromRadius(jumpR));
    setT(0);
    setIsPlaying(false);
    setFocusMode("r6");
    setHistory([{ t: 0, r: jumpR, drdt: dAdt / (2 * PI * jumpR) }]);
  };

  const jumpToCircumferenceTwo = () => {
    const jumpR = 1 / PI;
    setArea(areaFromRadius(jumpR));
    setT(0);
    setIsPlaying(false);
    setFocusMode("c2");
    setHistory([{ t: 0, r: jumpR, drdt: dAdt / (2 * PI * jumpR) }]);
  };

  const maxViewportRadius = Math.max(6.5, r * 1.15);
  const drawRadius = Math.min(190 * (r / maxViewportRadius), 190);

  return (
    <section className="demo-layout">
      <div className="visual-panel">
        <div className="circle-card">
          <svg viewBox="0 0 420 420" className="circle-svg" role="img" aria-label="Growing circle visualization">
            <defs>
              <radialGradient id="circleFill" cx="45%" cy="40%">
                <stop offset="0%" stopColor="#d7f2ee" />
                <stop offset="100%" stopColor="#93d7cb" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="420" height="420" fill="#f7f9fb" />
            <circle cx="210" cy="210" r={drawRadius} fill="url(#circleFill)" stroke="#0f5b55" strokeWidth="4" />
          </svg>
          <div className="metrics-overlay">
            <div>
              <InlineMath math={`A=${formatSig(area)}\\,\\text{cm}^2`} />
            </div>
            <div>
              <InlineMath math={`r=${formatSig(r)}\\,\\text{cm}`} />
            </div>
            <div>
              <InlineMath math={`\\frac{dA}{dt}=${formatSig(dAdt)}\\,\\text{cm}^2/\\text{s}`} />
            </div>
            <div>
              <InlineMath math={`\\frac{dr}{dt}=${formatSig(drdt)}\\,\\text{cm}/\\text{s}`} />
            </div>
            <div>
              <InlineMath math={`C=${formatSig(circumference)}\\,\\text{cm}`} />
            </div>
          </div>
        </div>

        <PlayControls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying((p) => !p)}
          onReset={() => resetState(r0)}
          speed={speed}
          onSpeedChange={setSpeed}
          dAdt={dAdt}
          onDAdtChange={(next) => setDAdt(next)}
          r0={r0}
          onR0Change={(next) => {
            setR0(next);
            resetState(next);
          }}
          holdConstant={holdConstant}
          onToggleHold={() => setHoldConstant((v) => !v)}
          onJumpRadiusSix={jumpToRadiusSix}
          onJumpCircumferenceTwo={jumpToCircumferenceTwo}
        />

        {focusMode ? (
          <div className="focus-marker">
            Evaluating instant rate at{" "}
            {focusMode === "r6" ? <InlineMath math={"r=6\\,\\text{cm}"} /> : <InlineMath math={"C=2\\,\\text{cm}"} />}
            .
          </div>
        ) : null}

        <Plot currentR={r} currentDrdt={drdt} dAdt={dAdt} history={history} />

        <details className="explain-box">
          <summary>What's happening?</summary>
          <ul>
            <li>Area increases steadily, so the circle must expand.</li>
            <li>At larger radius, the same added area is a thinner ring, so radius grows more slowly.</li>
            <li>
              The formula <InlineMath math={"\\frac{dr}{dt}=\\frac{3}{2\\pi r}"} /> shows that inverse relationship
              with radius.
            </li>
          </ul>
        </details>
      </div>

      <MathPanel
        area={area}
        radius={r}
        circumference={circumference}
        dAdt={dAdt}
        drdt={drdt}
        formatSig={formatSig}
      />
    </section>
  );
}

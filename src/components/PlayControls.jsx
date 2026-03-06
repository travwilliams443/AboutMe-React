import { InlineMath } from "./MathText";

const SPEEDS = [0.25, 0.5, 1, 2, 4];

export default function PlayControls({
  isPlaying,
  onPlayPause,
  onReset,
  speed,
  onSpeedChange,
  dAdt,
  onDAdtChange,
  r0,
  onR0Change,
  holdConstant,
  onToggleHold,
  onJumpRadiusSix,
  onJumpCircumferenceTwo
}) {
  return (
    <div className="controls-card">
      <div className="controls-row">
        <button type="button" onClick={onPlayPause}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="controls-row">
        <span>Speed</span>
        <div className="speed-group">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              className={speed === s ? "active-speed" : ""}
              onClick={() => onSpeedChange(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <label className="input-row">
        <span>
          <InlineMath math={"\\frac{dA}{dt}\\,(\\text{cm}^2/\\text{s})"} />
        </span>
        <input
          type="range"
          min="0.1"
          max="20"
          step="0.1"
          value={dAdt}
          onChange={(e) => onDAdtChange(Number(e.target.value))}
        />
        <input
          type="number"
          min="0.1"
          max="20"
          step="0.1"
          value={dAdt}
          onChange={(e) => onDAdtChange(Number(e.target.value))}
        />
      </label>

      <label className="input-row">
        <span>
          Initial radius <InlineMath math={"r_0\\,(\\text{cm})"} />
        </span>
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={r0}
          onChange={(e) => onR0Change(Number(e.target.value))}
        />
        <input
          type="number"
          min="0.1"
          max="10"
          step="0.1"
          value={r0}
          onChange={(e) => onR0Change(Number(e.target.value))}
        />
      </label>

      <label className="toggle-row">
        <input type="checkbox" checked={holdConstant} onChange={onToggleHold} disabled />
        Hold <InlineMath math={"\\frac{dA}{dt}"} /> constant
      </label>

      <div className="controls-row">
        <button type="button" onClick={onJumpRadiusSix}>
          Jump to <InlineMath math={"r=6\\,\\text{cm}"} />
        </button>
        <button type="button" onClick={onJumpCircumferenceTwo}>
          Jump to <InlineMath math={"C=2\\,\\text{cm}"} />
        </button>
      </div>
    </div>
  );
}

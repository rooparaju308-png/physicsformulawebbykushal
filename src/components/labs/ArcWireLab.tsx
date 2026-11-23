import React, { useState } from 'react';
import { FormulaCard } from '../FormulaCard';
import { getFormulaById } from '../../data/formulas';
import { MathBlock } from '../MathBlock';

interface ArcWireLabProps {
  knownIds: string[];
  bookmarkedIds: string[];
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
}

type SpecialPreset =
  | 'custom-arc'
  | 'quarter-arc'
  | 'semicircle'
  | 'full-ring'
  | 'custom-wire'
  | 'infinite-wire'
  | 'semi-infinite'
  | 'bisector';

export const ArcWireLab: React.FC<ArcWireLabProps> = ({
  knownIds,
  bookmarkedIds,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
}) => {
  const [geometry, setGeometry] = useState<'arc' | 'wire'>('arc');
  const [preset, setPreset] = useState<SpecialPreset>('semicircle');

  // Arc params
  const [thetaDeg, setThetaDeg] = useState(180);
  const [radius, setRadius] = useState(0.5); // m
  // Wire params
  const [theta1Deg, setTheta1Deg] = useState(45);
  const [theta2Deg, setTheta2Deg] = useState(60);
  const [perpR, setPerpR] = useState(0.5); // m

  // Shared source params
  const [lambdaMicro, setLambdaMicro] = useState(2.0); // uC/m
  const [currentI, setCurrentI] = useState(5.0); // A

  const k = 9e9;
  const kp = 1e-7;
  const lambda = lambdaMicro * 1e-6;

  // Derived computations
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const arcQ = lambda * radius * thetaRad;
  const arcE = ((2 * k * lambda) / radius) * Math.sin(thetaRad / 2);
  const arcV = (k * arcQ) / radius;
  const arcB = (kp * currentI * thetaRad) / radius;

  const t1 = (theta1Deg * Math.PI) / 180;
  const t2 = (theta2Deg * Math.PI) / 180;
  const wireEPerp = ((k * lambda) / perpR) * (Math.sin(t1) + Math.sin(t2));
  const wireEPar = ((k * lambda) / perpR) * Math.abs(Math.cos(t1) - Math.cos(t2));
  const wireB = ((kp * currentI) / perpR) * (Math.sin(t1) + Math.sin(t2));
  const wireV =
    theta1Deg < 89 && theta2Deg < 89
      ? k * lambda * Math.log(((1 + Math.sin(t1)) * (1 + Math.sin(t2))) / (Math.cos(t1) * Math.cos(t2)))
      : Infinity;

  const applyPreset = (p: SpecialPreset) => {
    setPreset(p);
    if (p === 'quarter-arc') {
      setGeometry('arc');
      setThetaDeg(90);
    } else if (p === 'semicircle') {
      setGeometry('arc');
      setThetaDeg(180);
    } else if (p === 'full-ring') {
      setGeometry('arc');
      setThetaDeg(360);
    } else if (p === 'infinite-wire') {
      setGeometry('wire');
      setTheta1Deg(90);
      setTheta2Deg(90);
    } else if (p === 'semi-infinite') {
      setGeometry('wire');
      setTheta1Deg(0);
      setTheta2Deg(90);
    } else if (p === 'bisector') {
      setGeometry('wire');
      setTheta1Deg(45);
      setTheta2Deg(45);
    }
  };

  // Highlighted formula ID based on preset / geometry
  const activeFormulaId =
    geometry === 'arc'
      ? thetaDeg === 360
        ? 'lar-arc-ring-centre'
        : thetaDeg === 180
        ? 'lar-arc-semicircle'
        : thetaDeg === 90
        ? 'lar-arc-quarter'
        : 'lar-arc-e'
      : theta1Deg === 90 && theta2Deg === 90
      ? 'lar-wire-infinite'
      : theta1Deg === 0 && theta2Deg === 90
      ? 'lar-wire-semi-infinite'
      : theta1Deg === theta2Deg
      ? 'lar-wire-bisector'
      : 'lar-wire-e-perp';

  const activeFormula = getFormulaById(activeFormulaId);
  const companionFormula = getFormulaById(geometry === 'arc' ? 'lar-arc-b' : 'lar-wire-b');

  // SVG Arc path calculation
  const cx = 160;
  const cy = 125;
  const svgR = 52 + radius * 32;
  const startAngle = -thetaRad / 2 - Math.PI / 2;
  const endAngle = thetaRad / 2 - Math.PI / 2;
  const x1 = cx + svgR * Math.cos(startAngle);
  const y1 = cy + svgR * Math.sin(startAngle);
  const x2 = cx + svgR * Math.cos(endAngle);
  const y2 = cy + svgR * Math.sin(endAngle);
  const largeArc = thetaDeg > 180 ? 1 : 0;

  // Wire SVG geometry
  const wireX = 100 + perpR * 35;
  const obsX = 240;
  const obsY = 125;
  const distPx = obsX - wireX;
  const topY = Math.max(18, obsY - Math.min(102, distPx * Math.tan(Math.min(t1, 1.43))));
  const botY = Math.min(232, obsY + Math.min(102, distPx * Math.tan(Math.min(t2, 1.43))));

  return (
    <div className="space-y-4">
      {/* Geometry Switch + Special Case Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1">
          <button
            type="button"
            onClick={() => {
              setGeometry('arc');
              setPreset('custom-arc');
            }}
            className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              geometry === 'arc'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Arc / Ring Mode
          </button>
          <button
            type="button"
            onClick={() => {
              setGeometry('wire');
              setPreset('custom-wire');
            }}
            className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              geometry === 'wire'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Straight Wire Mode
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'quarter-arc', label: 'Quarter (90°)' },
              { id: 'semicircle', label: 'Semicircle (180°)' },
              { id: 'full-ring', label: 'Ring (360°)' },
              { id: 'infinite-wire', label: 'Infinite Wire' },
              { id: 'semi-infinite', label: 'Semi-Infinite' },
              { id: 'bisector', label: 'Bisector' },
            ] as { id: SpecialPreset; label: string }[]
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => applyPreset(chip.id)}
              className={`min-h-[36px] px-3 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                preset === chip.id
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                  : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-500/50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Interactive Visual Stage */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>
              {geometry === 'arc' ? `Arc Angle θ = ${thetaDeg}°` : `Wire Angles θ₁ = ${theta1Deg}°, θ₂ = ${theta2Deg}°`}
            </span>
            <span className="font-mono text-cyan-600 dark:text-cyan-300">λ ↔ I · k ↔ k′</span>
          </div>

          <svg viewBox="0 0 320 250" className="w-full max-h-[260px] mx-auto select-none">
            <defs>
              <marker id="arrowCyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee" />
              </marker>
              <marker id="arrowViolet" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#a855f7" />
              </marker>
            </defs>

            {geometry === 'arc' ? (
              <g>
                {/* Radial dashed guides */}
                {thetaDeg < 360 && (
                  <>
                    <line x1={cx} y1={cy} x2={x1} y2={y1} stroke="#64748b" strokeDasharray="4 4" strokeWidth="1.2" />
                    <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#64748b" strokeDasharray="4 4" strokeWidth="1.2" />
                  </>
                )}

                {/* Arc / Full Ring */}
                {thetaDeg >= 360 ? (
                  <circle cx={cx} cy={cy} r={svgR} fill="none" stroke="#22d3ee" strokeWidth="6" />
                ) : (
                  <path
                    d={`M ${x1} ${y1} A ${svgR} ${svgR} 0 ${largeArc} 1 ${x2} ${y2}`}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                )}

                {/* Animated current pulse along arc */}
                {thetaDeg >= 360 ? (
                  <circle cx={cx} cy={cy} r={svgR} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeDasharray="6 12">
                    <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="1.4s" repeatCount="indefinite" />
                  </circle>
                ) : (
                  <path
                    d={`M ${x1} ${y1} A ${svgR} ${svgR} 0 ${largeArc} 1 ${x2} ${y2}`}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    strokeDasharray="6 12"
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="1.4s" repeatCount="indefinite" />
                  </path>
                )}

                {/* Centre point A */}
                <circle cx={cx} cy={cy} r="5" fill="#f8fafc" stroke="#22d3ee" strokeWidth="2" />
                <text x={cx - 16} y={cy + 4} fill="#94a3b8" fontSize="11" fontWeight="600">
                  A
                </text>

                {/* E-field vector pointing away from midpoint */}
                {thetaDeg < 360 && (
                  <>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={cx}
                      y2={cy + 48 * Math.sin(thetaRad / 2)}
                      stroke="#22d3ee"
                      strokeWidth="2.5"
                      markerEnd="url(#arrowCyan)"
                    />
                    <text x={cx + 8} y={cy + 36} fill="#22d3ee" fontSize="11" fontWeight="600">
                      E_A
                    </text>
                  </>
                )}

                {/* B symbol at centre (into page) */}
                <circle cx={cx + 22} cy={cy - 18} r="8" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                <circle cx={cx + 22} cy={cy - 18} r="2.2" fill="#a855f7" />
                <text x={cx + 34} y={cy - 14} fill="#c084fc" fontSize="11" fontWeight="600">
                  B_A
                </text>
              </g>
            ) : (
              <g>
                {/* Perpendicular line */}
                <line x1={wireX} y1={obsY} x2={obsX} y2={obsY} stroke="#64748b" strokeDasharray="4 4" strokeWidth="1.3" />
                <text x={(wireX + obsX) / 2 - 4} y={obsY - 6} fill="#94a3b8" fontSize="11">
                  r
                </text>

                {/* Rays to ends */}
                <line x1={obsX} y1={obsY} x2={wireX} y2={topY} stroke="#475569" strokeDasharray="3 3" strokeWidth="1.2" />
                <line x1={obsX} y1={obsY} x2={wireX} y2={botY} stroke="#475569" strokeDasharray="3 3" strokeWidth="1.2" />

                {/* Wire rod */}
                <line x1={wireX} y1={topY} x2={wireX} y2={botY} stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" />
                <line x1={wireX} y1={topY} x2={wireX} y2={botY} stroke="#a855f7" strokeWidth="2.5" strokeDasharray="6 10">
                  <animate attributeName="stroke-dashoffset" from="0" to="32" dur="1.2s" repeatCount="indefinite" />
                </line>

                {/* Point O */}
                <circle cx={obsX} cy={obsY} r="5" fill="#f8fafc" stroke="#22d3ee" strokeWidth="2" />
                <text x={obsX + 8} y={obsY - 8} fill="#94a3b8" fontSize="11" fontWeight="600">
                  O
                </text>

                {/* E_perp and E_par arrows */}
                <line x1={obsX} y1={obsY} x2={obsX + 48} y2={obsY} stroke="#22d3ee" strokeWidth="2.4" markerEnd="url(#arrowCyan)" />
                <text x={obsX + 24} y={obsY + 14} fill="#22d3ee" fontSize="11">
                  E⊥
                </text>
                {Math.abs(theta1Deg - theta2Deg) > 1 && (
                  <>
                    <line
                      x1={obsX}
                      y1={obsY}
                      x2={obsX}
                      y2={theta1Deg > theta2Deg ? obsY + 40 : obsY - 40}
                      stroke="#a855f7"
                      strokeWidth="2.4"
                      markerEnd="url(#arrowViolet)"
                    />
                    <text
                      x={obsX + 8}
                      y={theta1Deg > theta2Deg ? obsY + 34 : obsY - 28}
                      fill="#c084fc"
                      fontSize="11"
                    >
                      E∥
                    </text>
                  </>
                )}
              </g>
            )}
          </svg>

          {/* Live Readout Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
            {geometry === 'arc' ? (
              <>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">E_A (centre)</div>
                  <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                    {(arcE / 1000).toFixed(2)} kN/C
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">V_A (centre)</div>
                  <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {(arcV / 1000).toFixed(2)} kV
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">B_A (centre)</div>
                  <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                    {(arcB * 1e6).toFixed(2)} µT
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Charge Q = λRθ</div>
                  <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {(arcQ * 1e6).toFixed(2)} µC
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">E⊥</div>
                  <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                    {(wireEPerp / 1000).toFixed(2)} kN/C
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">E∥</div>
                  <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {(wireEPar / 1000).toFixed(2)} kN/C
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">B₀</div>
                  <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                    {(wireB * 1e6).toFixed(2)} µT
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">V₀</div>
                  <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {Number.isFinite(wireV) ? `${(wireV / 1000).toFixed(2)} kV` : '∞ (ref)'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Controls Deck */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Live Geometry & Source Parameters
          </h4>

          {geometry === 'arc' ? (
            <>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Arc Angle θ</span>
                  <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{thetaDeg}° ({(thetaRad / Math.PI).toFixed(2)}π)</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={360}
                  step={5}
                  value={thetaDeg}
                  onChange={(e) => {
                    setThetaDeg(Number(e.target.value));
                    setPreset('custom-arc');
                  }}
                  className="w-full h-2 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Radius R</span>
                  <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{radius.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.5}
                  step={0.05}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full h-2 cursor-pointer"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Upper Angle θ₁</span>
                  <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{theta1Deg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={1}
                  value={theta1Deg}
                  onChange={(e) => {
                    setTheta1Deg(Number(e.target.value));
                    setPreset('custom-wire');
                  }}
                  className="w-full h-2 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Lower Angle θ₂</span>
                  <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{theta2Deg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={1}
                  value={theta2Deg}
                  onChange={(e) => {
                    setTheta2Deg(Number(e.target.value));
                    setPreset('custom-wire');
                  }}
                  className="w-full h-2 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Perpendicular Distance r</span>
                  <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{perpR.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.5}
                  step={0.05}
                  value={perpR}
                  onChange={(e) => setPerpR(Number(e.target.value))}
                  className="w-full h-2 cursor-pointer"
                />
              </div>
            </>
          )}

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Linear Charge Density λ</span>
              <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{lambdaMicro.toFixed(1)} µC/m</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={lambdaMicro}
              onChange={(e) => setLambdaMicro(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Current I</span>
              <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">{currentI.toFixed(1)} A</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={currentI}
              onChange={(e) => setCurrentI(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div className="rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3 text-xs">
            <div className="text-slate-500 dark:text-slate-400 mb-1">Active Unified Mapping</div>
            <MathBlock
              latex={
                geometry === 'arc'
                  ? String.raw`E_A = \frac{2k\lambda}{R}\sin\frac{\theta}{2} \;\longleftrightarrow\; B_A = \frac{k'I\theta}{R}`
                  : String.raw`E_\perp = \frac{k\lambda}{r}(\sin\theta_1+\sin\theta_2) \;\longleftrightarrow\; B_0 = \frac{k'I}{r}(\sin\theta_1+\sin\theta_2)`
              }
              displayMode={false}
            />
          </div>
        </div>
      </div>

      {/* Highlighted Matching Formula Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activeFormula && (
          <FormulaCard
            formula={activeFormula}
            isKnown={knownIds.includes(activeFormula.id)}
            isBookmarked={bookmarkedIds.includes(activeFormula.id)}
            isHighlighted
            onToggleKnown={onToggleKnown}
            onToggleBookmark={onToggleBookmark}
            onJumpToFormula={onJumpToFormula}
          />
        )}
        {companionFormula && companionFormula.id !== activeFormula?.id && (
          <FormulaCard
            formula={companionFormula}
            isKnown={knownIds.includes(companionFormula.id)}
            isBookmarked={bookmarkedIds.includes(companionFormula.id)}
            onToggleKnown={onToggleKnown}
            onToggleBookmark={onToggleBookmark}
            onJumpToFormula={onJumpToFormula}
          />
        )}
      </div>
    </div>
  );
};

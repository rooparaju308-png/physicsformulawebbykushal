import React, { useState } from 'react';
import { FormulaCard } from '../FormulaCard';
import { getFormulaById } from '../../data/formulas';

interface MagnetismLabProps {
  knownIds: string[];
  bookmarkedIds: string[];
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
}

type MagSubMode = 'charge' | 'wire' | 'loop';

export const MagnetismLab: React.FC<MagnetismLabProps> = ({
  knownIds,
  bookmarkedIds,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
}) => {
  const [subMode, setSubMode] = useState<MagSubMode>('charge');

  // Particle params
  const [speed, setSpeed] = useState(4.0); // x10^6 m/s
  const [angleDeg, setAngleDeg] = useState(65); // angle with B (90 = circle)
  const [bField, setBField] = useState(1.2); // T

  // Wire & Loop params
  const [currentI, setCurrentI] = useState(5.0); // A
  const [lengthOrArea, setLengthOrArea] = useState(0.4); // m or m^2
  const [turnsN, setTurnsN] = useState(20);

  // Calculations (proton-like q/m ~ 10^8 C/kg scaled for clean readable mm/cm)
  const qOverM = 1e8;
  const vSI = speed * 1e6;
  const thetaRad = (angleDeg * Math.PI) / 180;
  const rMeters = (vSI * Math.sin(thetaRad)) / (qOverM * bField);
  const T_ns = ((2 * Math.PI) / (qOverM * bField)) * 1e9;
  const pitchMeters = vSI * Math.cos(thetaRad) * (T_ns * 1e-9);

  const wireForce = bField * currentI * lengthOrArea * Math.sin(thetaRad);
  const magMoment = turnsN * currentI * lengthOrArea * 0.1;
  const loopTorque = magMoment * bField * Math.sin(thetaRad);
  const loopU = -magMoment * bField * Math.cos(thetaRad);

  // Build SVG helix path
  const helixPath = (() => {
    const pts: string[] = [];
    const turns = angleDeg >= 88 ? 1 : 3.2;
    const ampY = Math.max(12, Math.min(58, rMeters * 1000 * 1.4));
    const stepX = angleDeg >= 88 ? 0 : Math.max(12, Math.cos(thetaRad) * 90);
    const startX = angleDeg >= 88 ? 160 : 50;
    for (let i = 0; i <= 140; i++) {
      const t = (i / 140) * turns * 2 * Math.PI;
      const x = startX + (t / (2 * Math.PI)) * stepX + Math.sin(t) * (angleDeg >= 88 ? ampY : ampY * 0.35);
      const y = 100 + Math.cos(t) * ampY;
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
  })();

  const activeFormulaId =
    subMode === 'charge'
      ? angleDeg >= 88
        ? 'mag-circle'
        : 'mag-helix'
      : subMode === 'wire'
      ? 'mag-wire-force'
      : 'mag-loop-torque';

  const activeFormula = getFormulaById(activeFormulaId);

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1 gap-1">
        {(
          [
            { id: 'charge', label: 'Charged Particle (Circle / Helix)' },
            { id: 'wire', label: 'Wire Force F = I(l × B)' },
            { id: 'loop', label: 'Loop Torque τ = μ × B' },
          ] as { id: MagSubMode; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubMode(tab.id)}
            className={`min-h-[40px] px-3.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              subMode === tab.id
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
          <svg viewBox="0 0 320 200" className="w-full max-h-[220px]">
            <defs>
              <marker id="magArr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#a855f7" />
              </marker>
              <marker id="forceArr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#34d399" />
              </marker>
            </defs>

            {/* Uniform B background field lines */}
            {[45, 100, 155].map((y) => (
              <line
                key={y}
                x1="20"
                y1={y}
                x2="298"
                y2={y}
                stroke="#475569"
                strokeWidth="1"
                strokeDasharray="4 4"
                markerEnd="url(#magArr)"
              />
            ))}
            <text x="275" y="38" fill="#c084fc" fontSize="11" fontWeight="600">
              B = {bField.toFixed(1)} T
            </text>

            {subMode === 'charge' && (
              <g>
                <path d={helixPath} fill="none" stroke="#22d3ee" strokeWidth="2.6" strokeLinecap="round" />
                <text x="20" y="188" fill="#94a3b8" fontSize="10.5">
                  {angleDeg >= 88 ? 'Pure Circular Orbit (θ = 90°)' : `Helical Path (θ = ${angleDeg}°)`}
                </text>
              </g>
            )}

            {subMode === 'wire' && (
              <g>
                <g transform={`rotate(${angleDeg - 90}, 160, 100)`}>
                  <line x1="160" y1="35" x2="160" y2="165" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" />
                  <text x="170" y="55" fill="#22d3ee" fontSize="11" fontWeight="600">
                    I = {currentI} A
                  </text>
                </g>
                <circle cx="160" cy="100" r="10" fill="none" stroke="#34d399" strokeWidth="2" />
                <circle cx="160" cy="100" r="3" fill="#34d399" />
                <text x="176" y="122" fill="#34d399" fontSize="11" fontWeight="600">
                  F = {wireForce.toFixed(2)} N (⊙)
                </text>
              </g>
            )}

            {subMode === 'loop' && (
              <g>
                {/* Tilted rectangular coil */}
                <g transform={`rotate(${angleDeg}, 160, 100)`}>
                  <rect x="115" y="72" width="90" height="56" rx="4" fill="#22d3ee" fillOpacity="0.12" stroke="#22d3ee" strokeWidth="3" />
                  <line x1="160" y1="100" x2="160" y2="48" stroke="#34d399" strokeWidth="2.4" markerEnd="url(#forceArr)" />
                  <text x="166" y="56" fill="#34d399" fontSize="11" fontWeight="600">
                    μ
                  </text>
                </g>
                <text x="20" y="188" fill="#94a3b8" fontSize="10.5">
                  τ = NIAB sinθ = {loopTorque.toFixed(2)} N·m
                </text>
              </g>
            )}
          </svg>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
            {subMode === 'charge' ? (
              <>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Radius r = mv⊥/qB</div>
                  <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                    {(rMeters * 100).toFixed(2)} cm
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Pitch p = v∥T</div>
                  <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                    {(pitchMeters * 100).toFixed(2)} cm
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Time Period T</div>
                  <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {T_ns.toFixed(1)} ns
                  </div>
                </div>
              </>
            ) : subMode === 'wire' ? (
              <>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Force F = BIl sinθ</div>
                  <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                    {wireForce.toFixed(2)} N
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Angle θ (l, B)</div>
                  <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {angleDeg}°
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Work Done</div>
                  <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                    0 (if static)
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Dipole μ = NIA</div>
                  <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                    {magMoment.toFixed(2)} A·m²
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Torque τ = μB sinθ</div>
                  <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                    {loopTorque.toFixed(2)} N·m
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Energy U = −μB cosθ</div>
                  <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                    {loopU.toFixed(2)} J
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Magnetic Field & Geometry Controls
          </h4>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Magnetic Field B</span>
              <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">{bField.toFixed(1)} T</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={3.0}
              step={0.1}
              value={bField}
              onChange={(e) => setBField(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Angle θ with B</span>
              <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{angleDeg}°</span>
            </div>
            <input
              type="range"
              min={subMode === 'loop' ? 0 : 15}
              max={subMode === 'loop' ? 180 : 90}
              step={1}
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          {subMode === 'charge' ? (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Particle Speed v</span>
                <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{speed.toFixed(1)} × 10⁶ m/s</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full h-2 cursor-pointer"
              />
            </div>
          ) : (
            <>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Current I</span>
                  <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{currentI.toFixed(1)} A</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={0.5}
                  value={currentI}
                  onChange={(e) => setCurrentI(Number(e.target.value))}
                  className="w-full h-2 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">
                    {subMode === 'wire' ? 'Wire Length l' : 'Turns N'}
                  </span>
                  <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                    {subMode === 'wire' ? `${lengthOrArea.toFixed(2)} m` : `${turnsN} turns`}
                  </span>
                </div>
                {subMode === 'wire' ? (
                  <input
                    type="range"
                    min={0.1}
                    max={1.5}
                    step={0.05}
                    value={lengthOrArea}
                    onChange={(e) => setLengthOrArea(Number(e.target.value))}
                    className="w-full h-2 cursor-pointer"
                  />
                ) : (
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={turnsN}
                    onChange={(e) => setTurnsN(Number(e.target.value))}
                    className="w-full h-2 cursor-pointer"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

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
    </div>
  );
};

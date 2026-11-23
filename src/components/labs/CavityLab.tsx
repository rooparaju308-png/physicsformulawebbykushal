import React, { useState } from 'react';
import { FormulaCard } from '../FormulaCard';
import { getFormulaById } from '../../data/formulas';
import { formatSci } from '../../data/calculators';

interface CavityLabProps {
  knownIds: string[];
  bookmarkedIds: string[];
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
}

type CavityMode = 'sphere-e' | 'cyl-e' | 'cyl-b';

const KE = 9e9;
const KM = 1e-7;

export const CavityLab: React.FC<CavityLabProps> = ({
  knownIds,
  bookmarkedIds,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
}) => {
  const [mode, setMode] = useState<CavityMode>('sphere-e');
  const [mainR, setMainR] = useState(1.0); // m
  const [cavityB, setCavityB] = useState(0.32); // m
  const [offsetA, setOffsetA] = useState(0.45); // m
  const [angleDeg, setAngleDeg] = useState(20); // direction of O1->O2
  const [density, setDensity] = useState(20); // uC/m^3 or A/cm^2

  const clampedB = Math.min(cavityB, mainR * 0.45);
  const maxOffset = Math.max(0.05, mainR - clampedB - 0.04);
  const clampedA = Math.min(offsetA, maxOffset);
  const rad = (angleDeg * Math.PI) / 180;

  // Physics calculations
  const rho = density * 1e-6; // C/m^3
  const J = density * 1e4; // A/m^2 (20 A/cm^2 -> 2e5 A/m^2)

  const eSphereCavity = ((4 * Math.PI * KE * rho) / 3) * clampedA;
  const vCavityCenter =
    2 * Math.PI * KE * rho * (mainR * mainR - (clampedA * clampedA) / 3 - clampedB * clampedB);
  const eCylCavity = 2 * Math.PI * KE * rho * clampedA;
  const bCylCavity = 2 * Math.PI * KM * J * clampedA;

  // SVG Geometry (Center O1 at 160, 100; radius R maps to 78px)
  const pxScale = 78 / mainR;
  const rPx = 78;
  const bPx = clampedB * pxScale;
  const axPx = clampedA * Math.cos(rad) * pxScale;
  const ayPx = -clampedA * Math.sin(rad) * pxScale;
  const o2x = 160 + axPx;
  const o2y = 100 + ayPx;

  // Field vector inside cavity:
  // For electrostatics (sphere-e, cyl-e): parallel to a = O1->O2
  // For magnetostatics (cyl-b with J out of page +z): J x a is rotated +90 deg CCW from a!
  const fieldAngleRad = mode === 'cyl-b' ? rad + Math.PI / 2 : rad;
  const arrowLen = Math.max(10, Math.min(bPx * 0.85, 22));
  const dx = Math.cos(fieldAngleRad) * (arrowLen * 0.5);
  const dy = -Math.sin(fieldAngleRad) * (arrowLen * 0.5);

  const samplePoints = [
    { x: o2x, y: o2y },
    { x: o2x + bPx * 0.38, y: o2y },
    { x: o2x - bPx * 0.38, y: o2y },
    { x: o2x, y: o2y + bPx * 0.38 },
    { x: o2x, y: o2y - bPx * 0.38 },
  ];

  const formulaId =
    mode === 'sphere-e'
      ? 'elec-cavity-sphere'
      : mode === 'cyl-e'
      ? 'elec-cavity-cylinder'
      : 'mag-cavity-cylinder';
  const activeFormula = getFormulaById(formulaId);

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1 gap-1">
        {(
          [
            { id: 'sphere-e', label: '10A. Spherical Cavity (E & V)' },
            { id: 'cyl-e', label: '10B. Charged Cylinder Cavity (E)' },
            { id: 'cyl-b', label: '10C. Current Cylinder Cavity (B)' },
          ] as { id: CavityMode; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className={`min-h-[40px] px-3.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              mode === tab.id
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
          <svg viewBox="0 0 320 200" className="w-full max-h-[240px]">
            <defs>
              <marker id="cavFieldArr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1 L 9 5 L 0 9 z" fill={mode === 'cyl-b' ? '#a855f7' : '#22d3ee'} />
              </marker>
              <marker id="offsetArr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Main Solid Body */}
            <circle
              cx="160"
              cy="100"
              r={rPx}
              fill={mode === 'cyl-b' ? '#a855f7' : '#22d3ee'}
              fillOpacity={0.13}
              stroke={mode === 'cyl-b' ? '#a855f7' : '#22d3ee'}
              strokeWidth="2"
            />

            {/* Cavity Hole */}
            <circle
              cx={o2x}
              cy={o2y}
              r={bPx}
              fill="#060913"
              fillOpacity={0.85}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            {/* Offset Vector a = O1 -> O2 */}
            <circle cx="160" cy="100" r="3" fill="#f59e0b" />
            <text x="145" y="114" fill="#fbbf24" fontSize="10" fontWeight="600">
              O₁
            </text>
            {clampedA > 0.03 && (
              <line
                x1="160"
                y1="100"
                x2={o2x}
                y2={o2y}
                stroke="#f59e0b"
                strokeWidth="2"
                markerEnd="url(#offsetArr)"
              />
            )}
            <text x={o2x - 8} y={o2y - bPx - 6} fill="#cbd5e1" fontSize="10" fontWeight="600">
              O₂ (b={clampedB.toFixed(2)}m)
            </text>

            {/* Uniform Field Arrows Inside Cavity */}
            {samplePoints.map((pt, idx) => (
              <line
                key={idx}
                x1={pt.x - dx}
                y1={pt.y - dy}
                x2={pt.x + dx}
                y2={pt.y + dy}
                stroke={mode === 'cyl-b' ? '#c084fc' : '#22d3ee'}
                strokeWidth="1.8"
                markerEnd="url(#cavFieldArr)"
              />
            ))}

            <text x="12" y="20" fill="#94a3b8" fontSize="10.5">
              {mode === 'cyl-b'
                ? 'Uniform B_cavity ⊥ a (along J × a)'
                : 'Uniform E_cavity ∥ a (independent of cavity radius b)'}
            </text>
          </svg>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
            {mode === 'sphere-e' && (
              <>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Uniform E_cavity</div>
                  <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                    {formatSci(eSphereCavity)} N/C
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Potential V(O₂)</div>
                  <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                    {formatSci(vCavityCenter)} V
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Offset |a| = O₁O₂</div>
                  <div className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-300">
                    {clampedA.toFixed(2)} m
                  </div>
                </div>
              </>
            )}

            {mode === 'cyl-e' && (
              <>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Uniform E_cavity</div>
                  <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                    {formatSci(eCylCavity)} N/C
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Ratio vs Sphere</div>
                  <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    3/2 × (ρa/2ε₀)
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Direction</div>
                  <div className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-300">
                    Along a ({angleDeg}°)
                  </div>
                </div>
              </>
            )}

            {mode === 'cyl-b' && (
              <>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Uniform B_cavity</div>
                  <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                    {formatSci(bCylCavity * 1e3)} mT
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Direction</div>
                  <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                    J × a ({(angleDeg + 90) % 360}°)
                  </div>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                  <div className="text-slate-500 dark:text-slate-400">Depends on b?</div>
                  <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                    No (B ∝ J·a)
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3.5">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Superposition Cavity Controls
          </h4>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Main Radius R</span>
              <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">
                {mainR.toFixed(2)} m
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.05}
              value={mainR}
              onChange={(e) => setMainR(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Cavity Radius b</span>
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {clampedB.toFixed(2)} m
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.8}
              step={0.02}
              value={cavityB}
              onChange={(e) => setCavityB(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Center Offset |a| = O₁O₂</span>
              <span className="font-mono tabular-nums text-amber-600 dark:text-amber-300">
                {clampedA.toFixed(2)} m
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxOffset}
              step={0.02}
              value={clampedA}
              onChange={(e) => setOffsetA(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Offset Vector Angle</span>
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {angleDeg}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={355}
              step={5}
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">
                {mode === 'cyl-b' ? 'Current Density J' : 'Volume Charge ρ'}
              </span>
              <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">
                {density} {mode === 'cyl-b' ? 'A/cm²' : 'μC/m³'}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>
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

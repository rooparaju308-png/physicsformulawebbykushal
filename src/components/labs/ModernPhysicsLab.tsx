import React, { useState } from 'react';
import { FormulaCard } from '../FormulaCard';
import { getFormulaById } from '../../data/formulas';
import { formatSci } from '../../data/calculators';

interface ModernPhysicsLabProps {
  knownIds: string[];
  bookmarkedIds: string[];
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
}

type ModernMode = 'photoelectric' | 'bohr-debroglie';

const METALS: { name: string; phi: number }[] = [
  { name: 'Cesium (Cs)', phi: 2.1 },
  { name: 'Sodium (Na)', phi: 2.3 },
  { name: 'Zinc (Zn)', phi: 4.3 },
  { name: 'Platinum (Pt)', phi: 5.6 },
];

function wavelengthToColor(nm: number): string {
  if (nm < 380) return '#a855f7'; // UV
  if (nm < 450) return '#6366f1';
  if (nm < 495) return '#38bdf8';
  if (nm < 570) return '#22c55e';
  if (nm < 590) return '#eab308';
  if (nm < 620) return '#f97316';
  return '#ef4444';
}

export const ModernPhysicsLab: React.FC<ModernPhysicsLabProps> = ({
  knownIds,
  bookmarkedIds,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
}) => {
  const [mode, setMode] = useState<ModernMode>('photoelectric');

  // Photoelectric controls
  const [phiEv, setPhiEv] = useState(2.3);
  const [lambdaNm, setLambdaNm] = useState(360);
  const [intensity, setIntensity] = useState(1.0);
  const [plateV, setPlateV] = useState(0.5);

  // Bohr & de-Broglie controls
  const [Z, setZ] = useState(1);
  const [nUpper, setNUpper] = useState(3);
  const [nLower, setNLower] = useState(2);
  const [accVolt, setAccVolt] = useState(100);

  // Photoelectric calculations
  const photonEv = 1240 / lambdaNm;
  const kMax = Math.max(0, photonEv - phiEv);
  const vStop = kMax; // numerically V0 = K_max / e
  const thresholdNm = 1240 / phiEv;
  const emitted = photonEv > phiEv;
  const currentNorm =
    !emitted
      ? 0
      : plateV <= -vStop
      ? 0
      : plateV >= 0
      ? intensity
      : intensity * ((plateV + vStop) / Math.max(0.1, vStop));

  // Bohr calculations
  const validTransition = nUpper > nLower;
  const R = 1.097e7;
  const deltaE = validTransition
    ? 13.6 * Z * Z * (1 / (nLower * nLower) - 1 / (nUpper * nUpper))
    : 0;
  const specLamNm = validTransition
    ? (1 / (R * Z * Z * (1 / (nLower * nLower) - 1 / (nUpper * nUpper)))) * 1e9
    : 0;
  const rUpperA = 0.529 * ((nUpper * nUpper) / Z);
  const vUpper = 2.18e6 * (Z / nUpper);
  const eUpper = -13.6 * ((Z * Z) / (nUpper * nUpper));
  const maxLines = (nUpper * (nUpper - 1)) / 2;

  const lamElectronA = 12.27 / Math.sqrt(accVolt);
  const lamProtonA = 0.286 / Math.sqrt(accVolt);
  const lamAlphaA = 0.101 / Math.sqrt(accVolt);

  const activeFormula = getFormulaById(
    mode === 'photoelectric' ? 'mod-einstein-pe' : 'mod-bohr-quantization'
  );

  // Build I-V curve path for photoelectric SVG
  const ivPathPoints: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const vVal = -4 + (i / 40) * 8; // -4V .. +4V
    let cur = 0;
    if (emitted && vVal > -vStop) {
      cur =
        vVal >= 0
          ? intensity * 0.45
          : intensity * 0.45 * ((vVal + vStop) / Math.max(0.15, vStop));
    }
    const px = 30 + ((vVal + 4) / 8) * 265;
    const py = 148 - Math.min(1, cur) * 105;
    ivPathPoints.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
  }

  const rayColor = wavelengthToColor(lambdaNm);

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1 gap-1">
        <button
          type="button"
          onClick={() => setMode('photoelectric')}
          className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'photoelectric'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Photoelectric Effect (V₀ & I–V)
        </button>
        <button
          type="button"
          onClick={() => setMode('bohr-debroglie')}
          className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'bohr-debroglie'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Bohr Atom & de-Broglie Waves
        </button>
      </div>

      {mode === 'photoelectric' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Vacuum Chamber SVG */}
              <svg viewBox="0 0 260 175" className="w-full rounded-xl bg-slate-950 border border-slate-800 p-1">
                <rect x="20" y="25" width="220" height="115" rx="20" fill="none" stroke="#334155" strokeWidth="1.5" />
                {/* Emitter Cathode */}
                <rect x="38" y="45" width="10" height="75" rx="3" fill="#64748b" />
                <text x="34" y="134" fill="#94a3b8" fontSize="9">Emitter</text>
                {/* Collector Anode */}
                <rect x="212" y="45" width="10" height="75" rx="3" fill={plateV < 0 ? '#f43f5e' : '#22d3ee'} />
                <text x="196" y="134" fill="#94a3b8" fontSize="9">Collector ({plateV.toFixed(1)}V)</text>

                {/* Incident Photons */}
                {[54, 74, 94].slice(0, intensity >= 1.5 ? 3 : intensity >= 1 ? 2 : 1).map((yPos, idx) => (
                  <g key={idx}>
                    <line x1="110" y1={yPos - 26} x2="50" y2={yPos} stroke={rayColor} strokeWidth="2.2" strokeDasharray="4 3" />
                    <circle cx="80" cy={yPos - 13} r="3" fill={rayColor} />
                  </g>
                ))}

                {/* Emitted Electrons */}
                {emitted &&
                  [58, 78, 98].slice(0, intensity >= 1.5 ? 3 : 2).map((yPos, idx) => {
                    const reach =
                      plateV >= -vStop
                        ? 210
                        : 54 + Math.max(12, (kMax / Math.abs(plateV)) * 130);
                    return (
                      <g key={idx}>
                        <line
                          x1="50"
                          y1={yPos}
                          x2={Math.min(210, reach)}
                          y2={yPos}
                          stroke="#22d3ee"
                          strokeWidth="1.5"
                          strokeDasharray={currentNorm > 0 ? undefined : '3 3'}
                        />
                        <circle cx={Math.min(206, 85 + idx * 35)} cy={yPos} r="3.5" fill="#22d3ee" />
                      </g>
                    );
                  })}

                <text x="14" y="162" fill={emitted ? '#34d399' : '#f43f5e'} fontSize="10" fontWeight="600">
                  {emitted
                    ? currentNorm > 0
                      ? `Electrons ejected · Photocurrent ON`
                      : `Stopped at V ≤ −${vStop.toFixed(2)}V`
                    : `λ > λ₀ (${thresholdNm.toFixed(0)} nm) — No Emission`}
                </text>
              </svg>

              {/* Live I vs V Curve */}
              <svg viewBox="0 0 310 175" className="w-full rounded-xl bg-slate-950 border border-slate-800 p-1">
                <line x1="30" y1="148" x2="295" y2="148" stroke="#64748b" strokeWidth="1.2" />
                <line x1="162" y1="22" x2="162" y2="154" stroke="#64748b" strokeWidth="1.2" />
                <path d={ivPathPoints.join(' ')} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
                {/* Current Operating Marker */}
                <circle
                  cx={30 + ((plateV + 4) / 8) * 265}
                  cy={148 - Math.min(1, currentNorm * 0.45) * 105}
                  r="4.5"
                  fill="#a855f7"
                  stroke="#f8fafc"
                  strokeWidth="1.5"
                />
                <text x="290" y="164" textAnchor="end" fill="#94a3b8" fontSize="9.5">
                  Collector V (−4V to +4V)
                </text>
                <text x="34" y="16" fill="#94a3b8" fontSize="9.5">
                  Photocurrent I
                </text>
                {emitted && (
                  <text
                    x={Math.max(32, 30 + ((-vStop + 4) / 8) * 265 - 12)}
                    y="163"
                    fill="#fbbf24"
                    fontSize="9.5"
                    fontWeight="600"
                  >
                    −V₀
                  </text>
                )}
              </svg>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Photon hν</div>
                <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                  {photonEv.toFixed(2)} eV
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">K_max</div>
                <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                  {kMax.toFixed(2)} eV
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Stopping V₀</div>
                <div className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-300">
                  {vStop.toFixed(2)} V
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Threshold λ₀</div>
                <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                  {thresholdNm.toFixed(0)} nm
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Photoelectric Controls
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {METALS.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setPhiEv(m.phi)}
                  className={`min-h-[34px] px-2.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                    Math.abs(phiEv - m.phi) < 0.05
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m.name} ({m.phi} eV)
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Wavelength λ</span>
                <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{lambdaNm} nm</span>
              </div>
              <input
                type="range"
                min={180}
                max={750}
                step={10}
                value={lambdaNm}
                onChange={(e) => setLambdaNm(Number(e.target.value))}
                className="w-full h-2 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Work Function φ</span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-300">{phiEv.toFixed(2)} eV</span>
              </div>
              <input
                type="range"
                min={1.5}
                max={6.0}
                step={0.1}
                value={phiEv}
                onChange={(e) => setPhiEv(Number(e.target.value))}
                className="w-full h-2 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Light Intensity</span>
                <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">{intensity.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Collector Potential V</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-300">{plateV.toFixed(1)} V</span>
              </div>
              <input
                type="range"
                min={-4.0}
                max={4.0}
                step={0.1}
                value={plateV}
                onChange={(e) => setPlateV(Number(e.target.value))}
                className="w-full h-2 cursor-pointer"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
            <svg viewBox="0 0 320 205" className="w-full max-h-[240px]">
              {/* Nucleus */}
              <circle cx="110" cy="102" r="7" fill="#f59e0b" />
              <text x="104" y="105" fill="#0f172a" fontSize="8.5" fontWeight="700">+{Z}</text>

              {/* Orbits n=1..5 */}
              {[1, 2, 3, 4, 5].map((lvl) => {
                const rad = 16 * lvl;
                const isUp = lvl === nUpper;
                const isLow = lvl === nLower;
                return (
                  <g key={lvl}>
                    <circle
                      cx="110"
                      cy="102"
                      r={rad}
                      fill="none"
                      stroke={isUp ? '#22d3ee' : isLow ? '#a855f7' : '#334155'}
                      strokeWidth={isUp || isLow ? 2 : 1}
                      strokeDasharray={isUp || isLow ? undefined : '3 3'}
                    />
                    <text x={110 + rad + 2} y="105" fill="#94a3b8" fontSize="8">
                      n={lvl}
                    </text>
                  </g>
                );
              })}

              {/* Transition Arrow from nUpper -> nLower */}
              {validTransition && (
                <>
                  <line
                    x1={110}
                    y1={102 - 16 * nUpper}
                    x2={110}
                    y2={102 - 16 * nLower}
                    stroke={wavelengthToColor(specLamNm)}
                    strokeWidth="2.5"
                  />
                  <circle cx="110" cy={102 - 16 * nUpper} r="4" fill="#22d3ee" />
                  <circle cx="110" cy={102 - 16 * nLower} r="4" fill="#a855f7" />
                </>
              )}

              {/* Right-side summary readout */}
              <text x="210" y="42" fill="#e2e8f0" fontSize="10.5" fontWeight="600">
                Transition n={nUpper} → n={nLower}
              </text>
              <text x="210" y="60" fill="#22d3ee" fontSize="10">
                ΔE = {deltaE.toFixed(2)} eV
              </text>
              <text x="210" y="76" fill="#fbbf24" fontSize="10">
                λ = {validTransition ? `${specLamNm.toFixed(1)} nm` : 'Need n₂ > n₁'}
              </text>
              <text x="210" y="102" fill="#94a3b8" fontSize="9.5">
                de-Broglie at V = {accVolt} V:
              </text>
              <text x="210" y="118" fill="#38bdf8" fontSize="9.5">
                λ_e = {lamElectronA.toFixed(2)} Å
              </text>
              <text x="210" y="133" fill="#a855f7" fontSize="9.5">
                λ_p = {lamProtonA.toFixed(3)} Å
              </text>
              <text x="210" y="148" fill="#34d399" fontSize="9.5">
                λ_α = {lamAlphaA.toFixed(3)} Å
              </text>
            </svg>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Radius r_{nUpper}</div>
                <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                  {rUpperA.toFixed(2)} Å
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Speed v_{nUpper}</div>
                <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                  {formatSci(vUpper, 3)} m/s
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Total E_{nUpper}</div>
                <div className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-300">
                  {eUpper.toFixed(2)} eV
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Max Lines (n={nUpper}→1)</div>
                <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                  {maxLines} lines
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Bohr & de-Broglie Parameters
            </h4>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Atomic Number Z (1=H, 2=He⁺, 3=Li²⁺)</span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-300">Z = {Z}</span>
              </div>
              <input type="range" min={1} max={4} step={1} value={Z} onChange={(e) => setZ(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Upper Level n₂</span>
                <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">n₂ = {nUpper}</span>
              </div>
              <input type="range" min={2} max={5} step={1} value={nUpper} onChange={(e) => setNUpper(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Lower Level n₁</span>
                <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">n₁ = {nLower}</span>
              </div>
              <input type="range" min={1} max={4} step={1} value={nLower} onChange={(e) => setNLower(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Accelerating Voltage V (de-Broglie)</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-300">{accVolt} V</span>
              </div>
              <input type="range" min={10} max={1000} step={10} value={accVolt} onChange={(e) => setAccVolt(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>
          </div>
        </div>
      )}

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

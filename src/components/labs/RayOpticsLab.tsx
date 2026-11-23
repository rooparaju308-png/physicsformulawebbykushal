import React, { useState } from 'react';
import { FormulaCard } from '../FormulaCard';
import { getFormulaById } from '../../data/formulas';
import { formatSci } from '../../data/calculators';

interface RayOpticsLabProps {
  knownIds: string[];
  bookmarkedIds: string[];
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
}

type RayMode = 'lens-mirror' | 'prism';
type OpticalElem = 'convex-lens' | 'concave-lens' | 'concave-mirror' | 'convex-mirror';

export const RayOpticsLab: React.FC<RayOpticsLabProps> = ({
  knownIds,
  bookmarkedIds,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
}) => {
  const [mode, setMode] = useState<RayMode>('lens-mirror');

  // Lens / Mirror bench state
  const [elem, setElem] = useState<OpticalElem>('convex-lens');
  const [uMag, setUMag] = useState(30); // cm (object placed at -uMag)
  const [fAirMag, setFAirMag] = useState(15); // cm
  const [nLens, setNLens] = useState(1.5);
  const [nMed, setNMed] = useState(1.0);

  // Prism state
  const [prismA, setPrismA] = useState(60); // deg
  const [prismN, setPrismN] = useState(1.5);
  const [incI, setIncI] = useState(48.6); // deg

  const isLens = elem === 'convex-lens' || elem === 'concave-lens';

  // Effective focal length (lenses respond to surrounding medium via Lens Maker)
  const fAirSigned =
    elem === 'convex-lens' || elem === 'convex-mirror' ? fAirMag : -fAirMag;
  const fSigned = isLens
    ? fAirSigned * ((nLens - 1) / (nLens / nMed - 1 || 1e-6))
    : fAirSigned;

  const u = -uMag;
  const vRaw = isLens
    ? Math.abs(u + fSigned) < 1e-3
      ? Infinity
      : (u * fSigned) / (u + fSigned)
    : Math.abs(u - fSigned) < 1e-3
    ? Infinity
    : (u * fSigned) / (u - fSigned);

  const m = Number.isFinite(vRaw) ? (isLens ? vRaw / u : -vRaw / u) : Infinity;
  const mLong = Number.isFinite(m) ? -m * m : -Infinity;
  const lensFlipped = isLens && nMed > nLens;

  // Prism calculations
  const iRad = (incI * Math.PI) / 180;
  const sinR1 = Math.sin(iRad) / prismN;
  const r1Deg = (Math.asin(Math.min(1, Math.max(-1, sinR1))) * 180) / Math.PI;
  const r2Deg = prismA - r1Deg;
  const icDeg = prismN > 1 ? (Math.asin(1 / prismN) * 180) / Math.PI : 90;
  const sinE = prismN * Math.sin((r2Deg * Math.PI) / 180);
  const tirAtSecondFace = Math.abs(sinE) > 1 || r2Deg > icDeg;
  const eDeg = tirAtSecondFace ? NaN : (Math.asin(sinE) * 180) / Math.PI;
  const deltaDeg = tirAtSecondFace ? NaN : incI + eDeg - prismA;
  const rMinRad = (prismA * 0.5 * Math.PI) / 180;
  const sinIMin = prismN * Math.sin(rMinRad);
  const iMinDeg = sinIMin <= 1 ? (Math.asin(sinIMin) * 180) / Math.PI : NaN;
  const deltaMinDeg = Number.isFinite(iMinDeg) ? 2 * iMinDeg - prismA : NaN;

  // Build δ vs i curve points
  const prismCurvePts: string[] = [];
  let startedCurve = false;
  for (let ang = 5; ang <= 85; ang += 2) {
    const r1 = (Math.asin(Math.sin((ang * Math.PI) / 180) / prismN) * 180) / Math.PI;
    const r2 = prismA - r1;
    const se = prismN * Math.sin((r2 * Math.PI) / 180);
    if (se <= 1 && r2 >= -icDeg) {
      const e = (Math.asin(se) * 180) / Math.PI;
      const d = ang + e - prismA;
      const px = 30 + ((ang - 5) / 80) * 260;
      const py = 152 - Math.min(1, Math.max(0, d / 90)) * 120;
      prismCurvePts.push(`${startedCurve ? 'L' : 'M'} ${px.toFixed(1)} ${py.toFixed(1)}`);
      startedCurve = true;
    }
  }

  // SVG Ray Bench scaling (origin at x=160, y=100; 1cm -> 2.1px)
  const scale = 2.1;
  const clampedU = Math.max(-70, Math.min(-6, u));
  const clampedV = Number.isFinite(vRaw) ? Math.max(-70, Math.min(70, vRaw)) : 70;
  const ox = 160 + clampedU * scale;
  const objH = 26;
  const ix = 160 + clampedV * scale;
  const imgH = Number.isFinite(m) ? Math.max(-45, Math.min(45, objH * m)) : 0;

  const activeFormula = getFormulaById(
    mode === 'prism' ? 'ray-prism' : isLens ? 'ray-lens-maker' : 'ray-mirror-formula'
  );

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1 gap-1">
        <button
          type="button"
          onClick={() => setMode('lens-mirror')}
          className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'lens-mirror'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Thin Lens / Mirror Ray Bench
        </button>
        <button
          type="button"
          onClick={() => setMode('prism')}
          className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'prism'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Prism δ vs i & TIR Bench
        </button>
      </div>

      {mode === 'lens-mirror' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
            <svg viewBox="0 0 320 200" className="w-full max-h-[240px] rounded-xl bg-slate-950 border border-slate-800">
              {/* Principal Axis */}
              <line x1="10" y1="100" x2="310" y2="100" stroke="#475569" strokeWidth="1" strokeDasharray="4 3" />

              {/* Optical Element at x=160 */}
              {isLens ? (
                <ellipse cx="160" cy="100" rx="5" ry="62" fill="#38bdf8" fillOpacity="0.22" stroke="#38bdf8" strokeWidth="2" />
              ) : (
                <line x1="160" y1="36" x2="160" y2="164" stroke="#fbbf24" strokeWidth="3" />
              )}

              {/* Focus markers */}
              {Number.isFinite(fSigned) && Math.abs(fSigned) * scale < 145 && (
                <>
                  <circle cx={160 + fSigned * scale} cy="100" r="3" fill="#a855f7" />
                  <circle cx={160 - fSigned * scale} cy="100" r="3" fill="#a855f7" />
                </>
              )}

              {/* Object Arrow */}
              <line x1={ox} y1="100" x2={ox} y2={100 - objH} stroke="#22d3ee" strokeWidth="2.5" />
              <circle cx={ox} cy={100 - objH} r="3" fill="#22d3ee" />
              <text x={ox - 4} y="114" fill="#22d3ee" fontSize="9">O</text>

              {/* Principal Ray 1: Parallel to axis -> through focal / image tip */}
              <line x1={ox} y1={100 - objH} x2="160" y2={100 - objH} stroke="#fbbf24" strokeWidth="1.5" />
              {Number.isFinite(vRaw) && (
                <>
                  <line
                    x1="160"
                    y1={100 - objH}
                    x2={ix}
                    y2={100 - imgH}
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray={(isLens && vRaw < 0) || (!isLens && vRaw > 0) ? '4 3' : undefined}
                  />
                  {/* Ray 2 through optical center / pole */}
                  <line x1={ox} y1={100 - objH} x2={ix} y2={100 - imgH} stroke="#34d399" strokeWidth="1.4" opacity="0.85" />
                  {/* Image Arrow */}
                  <line x1={ix} y1="100" x2={ix} y2={100 - imgH} stroke="#f472b6" strokeWidth="2.5" />
                  <circle cx={ix} cy={100 - imgH} r="3" fill="#f472b6" />
                  <text x={ix - 3} y="114" fill="#f472b6" fontSize="9">I</text>
                </>
              )}

              <text x="12" y="18" fill={lensFlipped ? '#f59e0b' : '#94a3b8'} fontSize="10" fontWeight="600">
                {lensFlipped
                  ? `TRAP ACTIVE: n_med (${nMed}) > n_lens (${nLens}) flips lens nature!`
                  : `Medium n = ${nMed.toFixed(2)} · Focal f = ${Number.isFinite(fSigned) ? fSigned.toFixed(1) : '∞'} cm`}
              </text>
            </svg>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Effective f</div>
                <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                  {Number.isFinite(fSigned) ? `${fSigned.toFixed(1)} cm` : '∞'}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Image v</div>
                <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                  {Number.isFinite(vRaw) ? `${formatSci(vRaw, 3)} cm` : '∞'}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Lateral m</div>
                <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                  {Number.isFinite(m) ? `${m.toFixed(2)}×` : '∞'}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Longitudinal m_L</div>
                <div className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-300">
                  {Number.isFinite(mLong) ? `${mLong.toFixed(2)}×` : '−∞'}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Optical Element & Medium</h4>

            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'convex-lens', label: 'Convex Lens' },
                  { id: 'concave-lens', label: 'Concave Lens' },
                  { id: 'concave-mirror', label: 'Concave Mirror' },
                  { id: 'convex-mirror', label: 'Convex Mirror' },
                ] as { id: OpticalElem; label: string }[]
              ).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setElem(o.id)}
                  className={`min-h-[38px] px-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                    elem === o.id
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Object Distance |u|</span>
                <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{uMag} cm</span>
              </div>
              <input type="range" min={8} max={60} step={1} value={uMag} onChange={(e) => setUMag(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Air Focal Magnitude |f_air|</span>
                <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">{fAirMag} cm</span>
              </div>
              <input type="range" min={8} max={35} step={1} value={fAirMag} onChange={(e) => setFAirMag(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>

            {isLens && (
              <>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Lens Refractive Index n_lens</span>
                    <span className="font-mono tabular-nums text-amber-600 dark:text-amber-300">{nLens.toFixed(2)}</span>
                  </div>
                  <input type="range" min={1.3} max={1.9} step={0.05} value={nLens} onChange={(e) => setNLens(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Surrounding Medium n_med</span>
                    <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-300">{nMed.toFixed(2)}</span>
                  </div>
                  <input type="range" min={1.0} max={1.9} step={0.05} value={nMed} onChange={(e) => setNMed(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
            <svg viewBox="0 0 310 175" className="w-full max-h-[235px] rounded-xl bg-slate-950 border border-slate-800">
              <line x1="30" y1="152" x2="295" y2="152" stroke="#64748b" strokeWidth="1.2" />
              <line x1="30" y1="20" x2="30" y2="156" stroke="#64748b" strokeWidth="1.2" />
              {prismCurvePts.length > 0 && (
                <path d={prismCurvePts.join(' ')} fill="none" stroke="#fbbf24" strokeWidth="2.5" />
              )}
              {!tirAtSecondFace && (
                <circle
                  cx={30 + ((incI - 5) / 80) * 260}
                  cy={152 - Math.min(1, Math.max(0, deltaDeg / 90)) * 120}
                  r="4.5"
                  fill="#22d3ee"
                  stroke="#f8fafc"
                  strokeWidth="1.5"
                />
              )}
              <text x="290" y="166" textAnchor="end" fill="#94a3b8" fontSize="9.5">
                Incidence Angle i (5° to 85°)
              </text>
              <text x="35" y="16" fill="#94a3b8" fontSize="9.5">
                Deviation δ (°)
              </text>
              <text x="38" y="34" fill={tirAtSecondFace ? '#f43f5e' : '#34d399'} fontSize="10" fontWeight="600">
                {tirAtSecondFace
                  ? `TIR at 2nd face (r₂ = ${r2Deg.toFixed(1)}° > i_c = ${icDeg.toFixed(1)}°)`
                  : `r₁=${r1Deg.toFixed(1)}°, r₂=${r2Deg.toFixed(1)}°, e=${eDeg.toFixed(1)}°`}
              </text>
            </svg>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Deviation δ</div>
                <div className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-300">
                  {Number.isFinite(deltaDeg) ? `${deltaDeg.toFixed(1)}°` : 'TIR (No exit)'}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Min Dev δ_m</div>
                <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                  {Number.isFinite(deltaMinDeg) ? `${deltaMinDeg.toFixed(1)}°` : 'N/A'}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Critical i_c</div>
                <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                  {icDeg.toFixed(1)}°
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">No-Exit Check (A &gt; 2i_c)</div>
                <div className="mt-0.5 font-mono font-semibold text-rose-500">
                  {prismA > 2 * icDeg ? 'Always TIR' : 'Can emerge'}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Prism Parameters</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Prism Angle A</span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-300">{prismA}°</span>
              </div>
              <input type="range" min={10} max={90} step={2} value={prismA} onChange={(e) => setPrismA(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Refractive Index n</span>
                <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{prismN.toFixed(2)}</span>
              </div>
              <input type="range" min={1.25} max={1.9} step={0.05} value={prismN} onChange={(e) => setPrismN(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Incidence Angle i</span>
                <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">{incI.toFixed(1)}°</span>
              </div>
              <input type="range" min={5} max={85} step={0.5} value={incI} onChange={(e) => setIncI(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
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

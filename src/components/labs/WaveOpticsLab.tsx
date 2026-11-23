import React, { useState } from 'react';
import { FormulaCard } from '../FormulaCard';
import { getFormulaById } from '../../data/formulas';

interface WaveOpticsLabProps {
  knownIds: string[];
  bookmarkedIds: string[];
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
}

type WaveTab = 'ydse-diffraction' | 'polarization';
type PatternMode = 'ydse' | 'single-slit';

function nmToHex(nm: number): string {
  if (nm < 450) return '#6366f1';
  if (nm < 495) return '#38bdf8';
  if (nm < 570) return '#22c55e';
  if (nm < 590) return '#eab308';
  if (nm < 620) return '#f97316';
  return '#ef4444';
}

export const WaveOpticsLab: React.FC<WaveOpticsLabProps> = ({
  knownIds,
  bookmarkedIds,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
}) => {
  const [tab, setTab] = useState<WaveTab>('ydse-diffraction');
  const [patternMode, setPatternMode] = useState<PatternMode>('ydse');

  // YDSE & Diffraction parameters
  const [lambdaNm, setLambdaNm] = useState(580);
  const [slitDimMm, setSlitDimMm] = useState(0.5); // d for YDSE, a for Single Slit
  const [screenD, setScreenD] = useState(1.2); // m
  const [liquidN, setLiquidN] = useState(1.0);
  const [sheetUm, setSheetUm] = useState(0); // thin sheet thickness in um
  const [sheetN, setSheetN] = useState(1.5);

  // Polarization parameters
  const [incIntensity, setIncIntensity] = useState(100);
  const [analyzerDeg, setAnalyzerDeg] = useState(60);
  const [mediumN, setMediumN] = useState(1.5);

  const lamEff = (lambdaNm * 1e-9) / liquidN;
  const slitM = slitDimMm * 1e-3;
  const betaMm = ((lamEff * screenD) / slitM) * 1e3;
  const centralWidthMm = 2 * betaMm; // single slit W_central = 2 * lambda_eff * D / a
  const shiftMm = ((screenD / slitM) * (sheetN - 1) * (sheetUm * 1e-6)) * 1e3;

  // Build normalized intensity curve across screen y in [-6mm .. +6mm]
  const pts: string[] = [];
  const fringeStrips: { x: number; opacity: number }[] = [];
  const yRangeMm = 6;
  const samples = 60;
  for (let i = 0; i <= samples; i++) {
    const yMm = -yRangeMm + (i / samples) * (2 * yRangeMm);
    let intensityNorm = 0;
    if (patternMode === 'ydse') {
      const yEff = yMm - shiftMm;
      const dPhi = (2 * Math.PI * yEff) / Math.max(0.05, betaMm);
      intensityNorm = Math.pow(Math.cos(dPhi / 2), 2);
    } else {
      const alpha = (Math.PI * yMm) / Math.max(0.05, betaMm);
      intensityNorm = Math.abs(alpha) < 1e-4 ? 1 : Math.pow(Math.sin(alpha) / alpha, 2);
    }
    const px = 20 + (i / samples) * 280;
    const py = 148 - intensityNorm * 92;
    pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    if (i < samples) {
      fringeStrips.push({ x: px, opacity: intensityNorm });
    }
  }

  // Polarization calculations
  const afterFirst = 0.5 * incIntensity;
  const afterAnalyzer = afterFirst * Math.pow(Math.cos((analyzerDeg * Math.PI) / 180), 2);
  const brewsterDeg = (Math.atan(mediumN) * 180) / Math.PI;

  const waveColor = nmToHex(lambdaNm);

  const activeFormula = getFormulaById(
    tab === 'polarization'
      ? 'wave-polarization'
      : patternMode === 'ydse'
      ? sheetUm > 0
        ? 'wave-slab-shift'
        : 'wave-ydse'
      : 'wave-single-slit'
  );

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab('ydse-diffraction')}
          className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'ydse-diffraction'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          YDSE vs Single-Slit Diffraction
        </button>
        <button
          type="button"
          onClick={() => setTab('polarization')}
          className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'polarization'
              ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Malus&apos;s Law & Brewster&apos;s Angle
        </button>
      </div>

      {tab === 'ydse-diffraction' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800/70 p-1 gap-1 self-start">
              <button
                type="button"
                onClick={() => setPatternMode('ydse')}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold ${
                  patternMode === 'ydse'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                YDSE (Double Slit)
              </button>
              <button
                type="button"
                onClick={() => setPatternMode('single-slit')}
                className={`min-h-[34px] px-3 rounded-lg text-xs font-semibold ${
                  patternMode === 'single-slit'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Single-Slit Diffraction
              </button>
            </div>

            <svg viewBox="0 0 320 175" className="w-full max-h-[225px] rounded-xl bg-slate-950 border border-slate-800">
              {/* Simulated screen fringe strip at top */}
              {fringeStrips.map((strip, idx) => (
                <rect
                  key={idx}
                  x={strip.x}
                  y="14"
                  width={280 / samples + 1}
                  height="26"
                  fill={waveColor}
                  fillOpacity={strip.opacity}
                />
              ))}
              <line x1="160" y1="14" x2="160" y2="152" stroke="#475569" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="20" y1="148" x2="300" y2="148" stroke="#64748b" strokeWidth="1.2" />
              <path d={pts.join(' ')} fill="none" stroke={waveColor} strokeWidth="2.5" />

              <text x="160" y="164" textAnchor="middle" fill="#94a3b8" fontSize="9.5">
                Screen Position y (−6 mm to +6 mm)
              </text>
            </svg>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
              {patternMode === 'ydse' ? (
                <>
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                    <div className="text-slate-500 dark:text-slate-400">Fringe Width β′</div>
                    <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                      {betaMm.toFixed(2)} mm
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                    <div className="text-slate-500 dark:text-slate-400">Slab Shift Δy</div>
                    <div className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-300">
                      {shiftMm.toFixed(2)} mm
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                    <div className="text-slate-500 dark:text-slate-400">Medium λ′ = λ/n</div>
                    <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                      {(lambdaNm / liquidN).toFixed(0)} nm
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                    <div className="text-slate-500 dark:text-slate-400">Central Max 2λD/a</div>
                    <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                      {centralWidthMm.toFixed(2)} mm
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                    <div className="text-slate-500 dark:text-slate-400">1st Minimum y₁</div>
                    <div className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-300">
                      ±{betaMm.toFixed(2)} mm
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                    <div className="text-slate-500 dark:text-slate-400">Angular Width 2λ/a</div>
                    <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                      {(((2 * lamEff) / slitM) * (180 / Math.PI)).toFixed(3)}°
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Wave Bench Controls</h4>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Wavelength λ</span>
                <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{lambdaNm} nm</span>
              </div>
              <input type="range" min={390} max={720} step={10} value={lambdaNm} onChange={(e) => setLambdaNm(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">
                  {patternMode === 'ydse' ? 'Slit Separation d' : 'Single Slit Width a'}
                </span>
                <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">{slitDimMm.toFixed(2)} mm</span>
              </div>
              <input type="range" min={0.15} max={1.5} step={0.05} value={slitDimMm} onChange={(e) => setSlitDimMm(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Screen Distance D</span>
                <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">{screenD.toFixed(1)} m</span>
              </div>
              <input type="range" min={0.5} max={2.5} step={0.1} value={screenD} onChange={(e) => setScreenD(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Medium Refractive Index n</span>
                <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-300">{liquidN.toFixed(2)}</span>
              </div>
              <input type="range" min={1.0} max={1.8} step={0.05} value={liquidN} onChange={(e) => setLiquidN(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>

            {patternMode === 'ydse' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Sheet t (Slit 1)</span>
                    <span className="font-mono tabular-nums text-amber-500">{sheetUm} μm</span>
                  </div>
                  <input type="range" min={0} max={5} step={0.5} value={sheetUm} onChange={(e) => setSheetUm(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-600 dark:text-slate-300">Sheet n_s</span>
                    <span className="font-mono tabular-nums text-amber-500">{sheetN.toFixed(2)}</span>
                  </div>
                  <input type="range" min={1.2} max={1.8} step={0.05} value={sheetN} onChange={(e) => setSheetN(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
            <svg viewBox="0 0 320 175" className="w-full max-h-[220px] rounded-xl bg-slate-950 border border-slate-800">
              {/* Unpolarized beam */}
              <line x1="20" y1="88" x2="100" y2="88" stroke="#fbbf24" strokeWidth="3" />
              <text x="55" y="75" textAnchor="middle" fill="#fbbf24" fontSize="9.5">Unpolarized I₀={incIntensity}</text>

              {/* Polarizer P1 */}
              <ellipse cx="105" cy="88" rx="7" ry="48" fill="#22d3ee" fillOpacity="0.2" stroke="#22d3ee" strokeWidth="2" />
              <text x="105" y="152" textAnchor="middle" fill="#22d3ee" fontSize="9">P₁ (I₀/2)</text>

              {/* Intermediate beam */}
              <line x1="112" y1="88" x2="195" y2="88" stroke="#22d3ee" strokeWidth="2.5" />
              <text x="153" y="75" textAnchor="middle" fill="#22d3ee" fontSize="9.5">{afterFirst.toFixed(1)}</text>

              {/* Analyzer P2 */}
              <ellipse cx="200" cy="88" rx="7" ry="48" fill="#a855f7" fillOpacity="0.2" stroke="#a855f7" strokeWidth="2" />
              <text x="200" y="152" textAnchor="middle" fill="#a855f7" fontSize="9">P₂ (θ={analyzerDeg}°)</text>

              {/* Emergent beam */}
              <line
                x1="207"
                y1="88"
                x2="300"
                y2="88"
                stroke="#34d399"
                strokeWidth="3"
                strokeOpacity={Math.max(0.08, afterAnalyzer / Math.max(1, afterFirst))}
              />
              <text x="255" y="75" textAnchor="middle" fill="#34d399" fontSize="9.5">
                I = {afterAnalyzer.toFixed(1)}
              </text>
            </svg>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">After 1st Polarizer</div>
                <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                  {afterFirst.toFixed(1)} W/m²
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">After Analyzer (Malus)</div>
                <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                  {afterAnalyzer.toFixed(2)} W/m²
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Brewster Angle i_B</div>
                <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                  {brewsterDeg.toFixed(1)}°
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Polarization Controls</h4>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Incident Unpolarized I₀</span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-300">{incIntensity} W/m²</span>
              </div>
              <input type="range" min={20} max={200} step={10} value={incIntensity} onChange={(e) => setIncIntensity(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Analyzer Angle θ</span>
                <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{analyzerDeg}°</span>
              </div>
              <input type="range" min={0} max={90} step={5} value={analyzerDeg} onChange={(e) => setAnalyzerDeg(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Surface Index n (Brewster)</span>
                <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">{mediumN.toFixed(2)}</span>
              </div>
              <input type="range" min={1.2} max={2.2} step={0.05} value={mediumN} onChange={(e) => setMediumN(Number(e.target.value))} className="w-full h-2 cursor-pointer" />
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

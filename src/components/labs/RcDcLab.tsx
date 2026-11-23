import React, { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { FormulaCard } from '../FormulaCard';
import { getFormulaById } from '../../data/formulas';
import { MathBlock } from '../MathBlock';

interface RcDcLabProps {
  knownIds: string[];
  bookmarkedIds: string[];
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
}

type TransientMode = 'RC' | 'LR' | 'LC';

export const RcDcLab: React.FC<RcDcLabProps> = ({
  knownIds,
  bookmarkedIds,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
}) => {
  const [mode, setMode] = useState<TransientMode>('RC');
  const [phase, setPhase] = useState<'charge' | 'discharge'>('charge');
  const [eps, setEps] = useState(12); // V
  const [R, setR] = useState(10); // kOhm for RC, Ohm for LR
  const [C_uF, setC_uF] = useState(100); // uF
  const [L_mH, setL_mH] = useState(200); // mH

  const [tTau, setTTau] = useState(1.0); // normalized time t/tau (0..5) or radians/pi for LC
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setTTau((prev) => {
        const next = prev + dt * 0.75;
        return next > 5 ? 0 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Computations
  const tauRC = R * 1e3 * (C_uF * 1e-6); // seconds
  const tauLR = (L_mH * 1e-3) / Math.max(1, R); // seconds
  const omegaLC = 1 / Math.sqrt(L_mH * 1e-3 * C_uF * 1e-6);

  const expFactor = Math.exp(-tTau);
  const rcQFrac = phase === 'charge' ? 1 - expFactor : expFactor;
  const rcIFrac = expFactor; // normalized |I| / I_max

  const lrIFrac = phase === 'charge' ? 1 - expFactor : expFactor;
  const lrVLFrac = expFactor;

  const lcAngle = tTau * Math.PI; // up to 5pi
  const lcQFrac = Math.cos(lcAngle);
  const lcIFrac = -Math.sin(lcAngle);

  // Energy split for RC charging
  const cSI = C_uF * 1e-6;
  const eStoredFull = 0.5 * cSI * eps * eps;
  const eStoredNow = eStoredFull * rcQFrac * rcQFrac;
  const eBatteryNow = cSI * eps * eps * rcQFrac;
  const eHeatNow = Math.max(0, eBatteryNow - eStoredNow);

  // SVG plot path helpers (x: 36..296, y: 20..145)
  const plotCurve = (fn: (u: number) => number, maxU = 5) => {
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const u = (i / 60) * maxU;
      const val = fn(u); // -1..1 or 0..1
      const px = 36 + (u / maxU) * 256;
      const py = mode === 'LC' ? 82 - val * 56 : 140 - val * 114;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const probeX = 36 + (tTau / 5) * 256;
  const tauMarkerX = 36 + (1 / 5) * 256;

  const linkedFormulaId =
    mode === 'RC'
      ? phase === 'charge'
        ? 'curr-rc-charging'
        : 'curr-rc-discharging'
      : mode === 'LR'
      ? 'emi-lr-circuit'
      : 'emi-lc-osc';

  const linkedFormula = getFormulaById(linkedFormulaId);
  const universalRule = getFormulaById('map-rule-transient');

  return (
    <div className="space-y-4">
      {/* Mode + Switch Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1">
          {(['RC', 'LR', 'LC'] as TransientMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                mode === m
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {m === 'RC' ? 'RC Master (DC)' : m === 'LR' ? 'LR Mode' : 'LC Oscillation'}
            </button>
          ))}
        </div>

        {mode !== 'LC' && (
          <div className="inline-flex rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1">
            <button
              type="button"
              onClick={() => setPhase('charge')}
              className={`min-h-[40px] px-3.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                phase === 'charge'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {mode === 'RC' ? 'Charging Switch' : 'Current Growth'}
            </button>
            <button
              type="button"
              onClick={() => setPhase('discharge')}
              className={`min-h-[40px] px-3.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                phase === 'discharge'
                  ? 'bg-violet-500 text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {mode === 'RC' ? 'Discharging Switch' : 'Current Decay'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Live Graph & Circuit Stage */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <MathBlock
              latex={String.raw`X(t) = X_\infty + (X_0 - X_\infty)e^{-t/\tau}`}
              displayMode={false}
              className="text-cyan-700 dark:text-cyan-300 font-semibold"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="min-h-[36px] px-3 rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1.5 font-medium"
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                <span>{playing ? 'Pause' : 'Play'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  setTTau(0);
                }}
                aria-label="Reset time"
                className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 inline-flex items-center justify-center"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <svg viewBox="0 0 310 165" className="w-full max-h-[210px]">
            {/* Axes */}
            <line x1="36" y1="140" x2="296" y2="140" stroke="#475569" strokeWidth="1.2" />
            <line x1="36" y1="18" x2="36" y2="145" stroke="#475569" strokeWidth="1.2" />

            {mode === 'LC' ? (
              <>
                <line x1="36" y1="82" x2="296" y2="82" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
                <path d={plotCurve((u) => Math.cos(u * Math.PI))} fill="none" stroke="#22d3ee" strokeWidth="2.4" />
                <path d={plotCurve((u) => -Math.sin(u * Math.PI))} fill="none" stroke="#a855f7" strokeWidth="2.2" strokeDasharray="5 3" />
                <line x1={probeX} y1="18" x2={probeX} y2="145" stroke="#f472b6" strokeWidth="1.5" />
                <circle cx={probeX} cy={82 - lcQFrac * 56} r="4.5" fill="#22d3ee" />
                <circle cx={probeX} cy={82 - lcIFrac * 56} r="4.5" fill="#a855f7" />
              </>
            ) : (
              <>
                {/* Tau marker */}
                <line x1={tauMarkerX} y1="22" x2={tauMarkerX} y2="140" stroke="#34d399" strokeDasharray="4 3" strokeWidth="1.2" />
                <text x={tauMarkerX + 3} y="30" fill="#34d399" fontSize="9.5">
                  t = τ (63% / 37%)
                </text>

                {/* Primary quantity curve (q/V_C or I_L) */}
                <path
                  d={plotCurve((u) => (phase === 'charge' ? 1 - Math.exp(-u) : Math.exp(-u)))}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                />
                {/* Secondary curve (I in RC or V_L in LR) */}
                <path
                  d={plotCurve((u) => Math.exp(-u))}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />

                {/* Time Probe */}
                <line x1={probeX} y1="18" x2={probeX} y2="140" stroke="#f472b6" strokeWidth="1.5" />
                <circle
                  cx={probeX}
                  cy={140 - (mode === 'RC' ? rcQFrac : lrIFrac) * 114}
                  r="4.5"
                  fill="#22d3ee"
                />
                <circle
                  cx={probeX}
                  cy={140 - (mode === 'RC' ? rcIFrac : lrVLFrac) * 114}
                  r="4.5"
                  fill="#a855f7"
                />
              </>
            )}

            <text x="285" y="154" fill="#94a3b8" fontSize="10">
              {mode === 'LC' ? 'ωt' : 't/τ'}
            </text>
            <text x="10" y="26" fill="#94a3b8" fontSize="10">
              1.0
            </text>
          </svg>

          {/* Energy Split Bar (RC Charge) or Mode Readouts */}
          {mode === 'RC' ? (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300 tabular-nums">
                <span>
                  {phase === 'charge'
                    ? `Battery: ${(eBatteryNow * 1e3).toFixed(2)} mJ | Stored U_C: ${(eStoredNow * 1e3).toFixed(2)} mJ | Heat R: ${(eHeatNow * 1e3).toFixed(2)} mJ`
                    : `Remaining Stored Energy: ${(eStoredNow * 1e3).toFixed(2)} mJ (${(rcQFrac * rcQFrac * 100).toFixed(1)}%)`}
                </span>
                <span className="font-mono text-cyan-600 dark:text-cyan-300">τ = {tauRC.toFixed(2)} s</span>
              </div>
              {phase === 'charge' && (
                <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-cyan-400 transition-all"
                    style={{ width: `${eBatteryNow > 0 ? (eStoredNow / eBatteryNow) * 100 : 50}%` }}
                  />
                  <div
                    className="h-full bg-rose-500 transition-all"
                    style={{ width: `${eBatteryNow > 0 ? (eHeatNow / eBatteryNow) * 100 : 50}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">
                  {mode === 'LR' ? 'τ = L/R' : 'ω = 1/√(LC)'}
                </div>
                <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                  {mode === 'LR' ? `${(tauLR * 1000).toFixed(1)} ms` : `${omegaLC.toFixed(1)} rad/s`}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">
                  {mode === 'LR' ? 'I / I_max' : 'q / Q₀'}
                </div>
                <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                  {mode === 'LR' ? `${(lrIFrac * 100).toFixed(1)}%` : `${(lcQFrac * 100).toFixed(0)}%`}
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">
                  {mode === 'LR' ? 'V_L / ε' : 'U_C : U_L'}
                </div>
                <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                  {mode === 'LR'
                    ? `${(lrVLFrac * 100).toFixed(1)}%`
                    : `${(lcQFrac * lcQFrac * 100).toFixed(0)}% : ${(lcIFrac * lcIFrac * 100).toFixed(0)}%`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sliders Deck */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3.5">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Transient Parameters & Scrubber
          </h4>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">
                {mode === 'LC' ? 'Phase ωt / π' : 'Time t / τ'}
              </span>
              <span className="font-mono tabular-nums text-rose-500 dark:text-rose-400">
                {tTau.toFixed(2)} {mode === 'LC' ? 'π' : 'τ'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.05}
              value={tTau}
              onChange={(e) => {
                setPlaying(false);
                setTTau(Number(e.target.value));
              }}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Battery EMF ε</span>
              <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{eps} V</span>
            </div>
            <input
              type="range"
              min={2}
              max={24}
              step={1}
              value={eps}
              onChange={(e) => setEps(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          {mode !== 'LC' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">
                  Resistance R ({mode === 'RC' ? 'kΩ' : 'Ω'})
                </span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-300">
                  {R} {mode === 'RC' ? 'kΩ' : 'Ω'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={R}
                onChange={(e) => setR(Number(e.target.value))}
                className="w-full h-2 cursor-pointer"
              />
            </div>
          )}

          {mode !== 'LR' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Capacitance C</span>
                <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{C_uF} µF</span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={C_uF}
                onChange={(e) => setC_uF(Number(e.target.value))}
                className="w-full h-2 cursor-pointer"
              />
            </div>
          )}

          {mode !== 'RC' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300">Inductance L</span>
                <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">{L_mH} mH</span>
              </div>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={L_mH}
                onChange={(e) => setL_mH(Number(e.target.value))}
                className="w-full h-2 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Linked Formula Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {linkedFormula && (
          <FormulaCard
            formula={linkedFormula}
            isKnown={knownIds.includes(linkedFormula.id)}
            isBookmarked={bookmarkedIds.includes(linkedFormula.id)}
            isHighlighted
            onToggleKnown={onToggleKnown}
            onToggleBookmark={onToggleBookmark}
            onJumpToFormula={onJumpToFormula}
          />
        )}
        {universalRule && (
          <FormulaCard
            formula={universalRule}
            isKnown={knownIds.includes(universalRule.id)}
            isBookmarked={bookmarkedIds.includes(universalRule.id)}
            onToggleKnown={onToggleKnown}
            onToggleBookmark={onToggleBookmark}
            onJumpToFormula={onJumpToFormula}
          />
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { FormulaCard } from '../FormulaCard';
import { getFormulaById } from '../../data/formulas';

interface RlcAcLabProps {
  knownIds: string[];
  bookmarkedIds: string[];
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
}

type RlcMode = 'RLC' | 'RC' | 'RL' | 'LC';

export const RlcAcLab: React.FC<RlcAcLabProps> = ({
  knownIds,
  bookmarkedIds,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
}) => {
  const [mode, setMode] = useState<RlcMode>('RLC');
  const [R, setR] = useState(40); // Ohm
  const [L_mH, setL_mH] = useState(120); // mH
  const [C_uF, setC_uF] = useState(50); // uF
  const [freq, setFreq] = useState(65); // Hz
  const [V0, setV0] = useState(100); // V peak

  const effR = mode === 'LC' ? 0 : R;
  const effL = mode === 'RC' ? 0 : L_mH * 1e-3;
  const effC = mode === 'RL' ? Infinity : C_uF * 1e-6;

  const omega = 2 * Math.PI * freq;
  const XL = omega * effL;
  const XC = effC === Infinity ? 0 : 1 / (omega * effC);
  const netX = XL - XC;
  const Z = Math.max(0.01, Math.hypot(effR, netX));
  const I0 = V0 / Z;
  const phiRad = Math.atan2(netX, effR);
  const phiDeg = (phiRad * 180) / Math.PI;
  const pf = effR / Z;
  const Pavg = 0.5 * V0 * I0 * pf;

  const hasLC = effL > 0 && effC !== Infinity;
  const f0 = hasLC ? 1 / (2 * Math.PI * Math.sqrt(effL * effC)) : 0;
  const Q = hasLC && effR > 0 ? (1 / effR) * Math.sqrt(effL / effC) : 0;
  const bandwidthHz = effL > 0 && effR > 0 ? effR / (2 * Math.PI * effL) : 0;
  const atResonance = hasLC && Math.abs(freq - f0) < Math.max(1.5, f0 * 0.03);

  const VR = I0 * effR;
  const VL = I0 * XL;
  const VC = I0 * XC;

  // Normalized phasor lengths (max 70px)
  const maxV = Math.max(V0, VR, VL, VC, 1);
  const scaleV = 65 / maxV;
  const vrPx = VR * scaleV;
  const vlPx = VL * scaleV;
  const vcPx = VC * scaleV;
  const netVxPx = (VL - VC) * scaleV;

  // Flow speed inverse of Z
  const flowDur = Math.max(0.45, Math.min(3.5, 1.5 / Math.max(0.3, I0)));

  const rlcFormulas = [
    { id: 'ac-rlc-impedance', activeFor: ['RLC'] },
    { id: 'ac-resonance', activeFor: ['RLC'] },
    { id: 'ac-q-factor', activeFor: ['RLC'] },
    { id: 'ac-rc-limit', activeFor: ['RC'] },
    { id: 'ac-rl-limit', activeFor: ['RL'] },
    { id: 'ac-lc-limit', activeFor: ['LC'] },
  ];

  return (
    <div className="space-y-4">
      {/* Limit Switches */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'RLC', label: 'Full Series RLC' },
              { id: 'RC', label: 'Switch: L = 0 → RC' },
              { id: 'RL', label: 'Switch: C = ∞ (X_C=0) → RL' },
              { id: 'LC', label: 'Switch: R = 0 → LC' },
            ] as { id: RlcMode; label: string }[]
          ).map((sw) => (
            <button
              key={sw.id}
              type="button"
              onClick={() => setMode(sw.id)}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                mode === sw.id
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                  : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-cyan-500/50'
              }`}
            >
              {sw.label}
            </button>
          ))}
        </div>

        {hasLC && (
          <button
            type="button"
            onClick={() => setFreq(Math.round(f0))}
            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
              atResonance
                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                : 'border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-500/20'
            }`}
          >
            {atResonance ? `At Resonance f₀ = ${f0.toFixed(1)} Hz` : `Snap to Resonance (${f0.toFixed(1)} Hz)`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Circuit + Phasor SVG */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Animated Circuit Diagram */}
            <svg viewBox="0 0 260 185" className="w-full max-h-[200px]">
              {/* Outer loop */}
              <rect
                x="28"
                y="28"
                width="204"
                height="128"
                rx="10"
                fill="none"
                stroke="#334155"
                strokeWidth="2.5"
              />
              {/* Animated current dots */}
              <rect
                x="28"
                y="28"
                width="204"
                height="128"
                rx="10"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.5"
                strokeDasharray="5 17"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-44"
                  dur={`${flowDur}s`}
                  repeatCount="indefinite"
                />
              </rect>

              {/* AC Source at bottom */}
              <circle cx="130" cy="156" r="15" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
              <path d="M 122 156 Q 126 149 130 156 T 138 156" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <text x="130" y="181" textAnchor="middle" fill="#94a3b8" fontSize="10">
                V₀={V0}V, {freq}Hz
              </text>

              {/* R on top left */}
              <rect x="46" y="18" width="44" height="20" rx="4" fill="#0f172a" />
              {mode === 'LC' ? (
                <line x1="46" y1="28" x2="90" y2="28" stroke="#34d399" strokeWidth="2.5" />
              ) : (
                <path
                  d="M 46 28 L 52 21 L 58 35 L 64 21 L 70 35 L 76 21 L 82 35 L 90 28"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.2"
                />
              )}
              <text x="68" y="13" textAnchor="middle" fill="#fbbf24" fontSize="10">
                {mode === 'LC' ? 'R=0 (short)' : `R=${R}Ω`}
              </text>

              {/* L on top middle */}
              <rect x="108" y="18" width="46" height="20" rx="4" fill="#0f172a" />
              {mode === 'RC' ? (
                <line x1="108" y1="28" x2="154" y2="28" stroke="#34d399" strokeWidth="2.5" />
              ) : (
                <path
                  d="M 108 28 C 112 16, 118 16, 120 28 C 122 16, 128 16, 131 28 C 133 16, 139 16, 142 28 C 144 16, 150 16, 154 28"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.2"
                />
              )}
              <text x="131" y="13" textAnchor="middle" fill="#c084fc" fontSize="10">
                {mode === 'RC' ? 'L=0 (short)' : `L=${L_mH}mH`}
              </text>

              {/* C on top right */}
              <rect x="172" y="16" width="38" height="24" rx="4" fill="#0f172a" />
              {mode === 'RL' ? (
                <line x1="172" y1="28" x2="210" y2="28" stroke="#34d399" strokeWidth="2.5" />
              ) : (
                <>
                  <line x1="187" y1="18" x2="187" y2="38" stroke="#22d3ee" strokeWidth="2.5" />
                  <line x1="195" y1="18" x2="195" y2="38" stroke="#22d3ee" strokeWidth="2.5" />
                </>
              )}
              <text x="191" y="13" textAnchor="middle" fill="#22d3ee" fontSize="10">
                {mode === 'RL' ? 'C=∞ (short)' : `C=${C_uF}µF`}
              </text>
            </svg>

            {/* Live Phasor Diagram */}
            <svg viewBox="0 0 180 180" className="w-full max-h-[190px]">
              <defs>
                <marker id="phCyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee" />
                </marker>
                <marker id="phViolet" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#a855f7" />
                </marker>
                <marker id="phAmber" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#fbbf24" />
                </marker>
                <marker id="phPink" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#f472b6" />
                </marker>
              </defs>

              <circle cx="80" cy="90" r="68" fill="none" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="10" y1="90" x2="165" y2="90" stroke="#475569" strokeWidth="1" />
              <line x1="80" y1="15" x2="80" y2="165" stroke="#475569" strokeWidth="1" />

              {/* V_R along +x (in phase with I) */}
              {vrPx > 2 && (
                <line x1="80" y1="90" x2={80 + vrPx} y2="90" stroke="#fbbf24" strokeWidth="2.4" markerEnd="url(#phAmber)" />
              )}
              <text x={Math.min(155, 84 + vrPx)} y="102" fill="#fbbf24" fontSize="10">
                V_R, I
              </text>

              {/* V_L up */}
              {vlPx > 2 && (
                <line x1="80" y1="90" x2="80" y2={90 - vlPx} stroke="#a855f7" strokeWidth="2.2" markerEnd="url(#phViolet)" />
              )}
              {vlPx > 2 && (
                <text x="62" y={Math.max(16, 88 - vlPx)} fill="#c084fc" fontSize="10">
                  V_L
                </text>
              )}

              {/* V_C down */}
              {vcPx > 2 && (
                <line x1="80" y1="90" x2="80" y2={90 + vcPx} stroke="#22d3ee" strokeWidth="2.2" markerEnd="url(#phCyan)" />
              )}
              {vcPx > 2 && (
                <text x="62" y={Math.min(172, 98 + vcPx)} fill="#22d3ee" fontSize="10">
                  V_C
                </text>
              )}

              {/* Resultant V_source */}
              <line
                x1="80"
                y1="90"
                x2={80 + vrPx}
                y2={90 - netVxPx}
                stroke="#f472b6"
                strokeWidth="2.6"
                markerEnd="url(#phPink)"
              />
              <text
                x={Math.min(156, 84 + vrPx)}
                y={Math.max(18, Math.min(170, 88 - netVxPx))}
                fill="#f472b6"
                fontSize="10"
                fontWeight="600"
              >
                V₀ (φ={phiDeg.toFixed(0)}°)
              </text>
            </svg>
          </div>

          {/* Readouts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
              <div className="text-slate-500 dark:text-slate-400">Impedance Z</div>
              <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">{Z.toFixed(1)} Ω</div>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
              <div className="text-slate-500 dark:text-slate-400">Peak I₀ / Phase φ</div>
              <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                {I0.toFixed(2)} A · {phiDeg.toFixed(1)}°
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
              <div className="text-slate-500 dark:text-slate-400">cosφ / P_avg</div>
              <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                {pf.toFixed(2)} · {Pavg.toFixed(1)} W
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
              <div className="text-slate-500 dark:text-slate-400">X_L / X_C / Q</div>
              <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                {XL.toFixed(0)} / {XC.toFixed(0)} Ω · Q={Q.toFixed(1)}
              </div>
            </div>
          </div>

          {hasLC && (
            <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1 tabular-nums">
              <span>Resonance f₀ = <strong className="text-slate-900 dark:text-slate-200">{f0.toFixed(2)} Hz</strong></span>
              <span>Bandwidth Δf = <strong className="text-slate-900 dark:text-slate-200">{bandwidthHz.toFixed(2)} Hz</strong></span>
              <span>Regime: <strong className="text-cyan-600 dark:text-cyan-300">{XL > XC ? 'Inductive (V leads I)' : XL < XC ? 'Capacitive (I leads V)' : 'Resistive (Resonance)'}</strong></span>
            </div>
          )}
        </div>

        {/* Sliders Deck */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3.5">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            RLC Master Parameters
          </h4>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Resistance R {mode === 'LC' ? '(Bypassed = 0)' : ''}</span>
              <span className="font-mono tabular-nums text-amber-600 dark:text-amber-300">{effR} Ω</span>
            </div>
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              disabled={mode === 'LC'}
              value={R}
              onChange={(e) => setR(Number(e.target.value))}
              className="w-full h-2 cursor-pointer disabled:opacity-40"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Inductance L {mode === 'RC' ? '(Bypassed = 0)' : ''}</span>
              <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">{mode === 'RC' ? '0 mH' : `${L_mH} mH`}</span>
            </div>
            <input
              type="range"
              min={20}
              max={300}
              step={10}
              disabled={mode === 'RC'}
              value={L_mH}
              onChange={(e) => setL_mH(Number(e.target.value))}
              className="w-full h-2 cursor-pointer disabled:opacity-40"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Capacitance C {mode === 'RL' ? '(Shorted C = ∞)' : ''}</span>
              <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{mode === 'RL' ? '∞ µF' : `${C_uF} µF`}</span>
            </div>
            <input
              type="range"
              min={10}
              max={150}
              step={5}
              disabled={mode === 'RL'}
              value={C_uF}
              onChange={(e) => setC_uF(Number(e.target.value))}
              className="w-full h-2 cursor-pointer disabled:opacity-40"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">AC Frequency f</span>
              <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{freq} Hz</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              step={1}
              value={freq}
              onChange={(e) => setFreq(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Source Peak Voltage V₀</span>
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">{V0} V</span>
            </div>
            <input
              type="range"
              min={20}
              max={300}
              step={10}
              value={V0}
              onChange={(e) => setV0(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Formula Highlighting (Matching Mode stays glowing, others dim) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rlcFormulas.map((item) => {
          const f = getFormulaById(item.id);
          if (!f) return null;
          const active = item.activeFor.includes(mode);
          return (
            <FormulaCard
              key={f.id}
              formula={f}
              isKnown={knownIds.includes(f.id)}
              isBookmarked={bookmarkedIds.includes(f.id)}
              isHighlighted={active}
              isDimmed={!active}
              onToggleKnown={onToggleKnown}
              onToggleBookmark={onToggleBookmark}
              onJumpToFormula={onJumpToFormula}
            />
          );
        })}
      </div>
    </div>
  );
};

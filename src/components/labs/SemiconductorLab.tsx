import React, { useState } from 'react';
import { FormulaCard } from '../FormulaCard';
import { getFormulaById } from '../../data/formulas';

interface SemiconductorLabProps {
  knownIds: string[];
  bookmarkedIds: string[];
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
}

type SemiTab = 'iv-quadrants' | 'zener' | 'logic-gates';
type DiodeType = 'pn' | 'zener' | 'photodiode' | 'solar';
type GateType = 'NAND' | 'NOR' | 'AND' | 'OR' | 'XOR';

export const SemiconductorLab: React.FC<SemiconductorLabProps> = ({
  knownIds,
  bookmarkedIds,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
}) => {
  const [tab, setTab] = useState<SemiTab>('iv-quadrants');

  // Diode Quadrants state
  const [diodeType, setDiodeType] = useState<DiodeType>('photodiode');
  const [lightLevel, setLightLevel] = useState(2); // 1..4

  // Zener regulator state
  const [vin, setVin] = useState(15);
  const [vz, setVz] = useState(9);
  const [rs, setRs] = useState(200);
  const [rl, setRl] = useState(600);

  // Logic Gate state
  const [gate, setGate] = useState<GateType>('NAND');
  const [inA, setInA] = useState<0 | 1>(1);
  const [inB, setInB] = useState<0 | 1>(0);

  // Zener physics
  const vUnreg = (vin * rl) / (rs + rl);
  const isRegulating = vUnreg >= vz;
  const isMa = isRegulating ? ((vin - vz) / rs) * 1e3 : (vin / (rs + rl)) * 1e3;
  const ilMa = isRegulating ? (vz / rl) * 1e3 : isMa;
  const izMa = isRegulating ? isMa - ilMa : 0;

  // Logic gate evaluation
  const evalGate = (a: 0 | 1, b: 0 | 1, g: GateType): 0 | 1 => {
    switch (g) {
      case 'AND':
        return a && b ? 1 : 0;
      case 'OR':
        return a || b ? 1 : 0;
      case 'NAND':
        return !(a && b) ? 1 : 0;
      case 'NOR':
        return !(a || b) ? 1 : 0;
      case 'XOR':
        return a !== b ? 1 : 0;
    }
  };
  const gateOut = evalGate(inA, inB, gate);

  const formulaId =
    tab === 'iv-quadrants'
      ? 'semi-diode-characteristics'
      : tab === 'zener'
      ? 'semi-zener-regulator'
      : 'semi-boolean-gates';
  const activeFormula = getFormulaById(formulaId);

  // 4-Quadrant origin at (160, 100)
  const buildDiodePath = () => {
    if (diodeType === 'pn') {
      return 'M 40 103 L 160 100 Q 190 98 205 70 T 230 22';
    }
    if (diodeType === 'zener') {
      return 'M 80 175 L 86 105 L 160 100 Q 190 98 215 45';
    }
    if (diodeType === 'photodiode') {
      const yShift = 100 + lightLevel * 16;
      return `M 40 ${yShift} L 155 ${yShift} L 160 100 Q 195 96 220 40`;
    }
    // Solar cell Q4
    const vocPx = 160 + 55 + lightLevel * 10;
    const iscPx = 100 + 20 + lightLevel * 12;
    return `M 160 ${iscPx} Q ${vocPx - 12} ${iscPx - 6} ${vocPx} 100`;
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1 gap-1">
        {(
          [
            { id: 'iv-quadrants', label: 'Special Diode I–V Quadrants' },
            { id: 'zener', label: 'Zener Voltage Regulator' },
            { id: 'logic-gates', label: 'Logic Gates & De Morgan' },
          ] as { id: SemiTab; label: string }[]
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-[40px] px-3.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === item.id
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'iv-quadrants' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
            <svg viewBox="0 0 320 200" className="w-full max-h-[240px] rounded-xl bg-slate-950 border border-slate-800">
              <line x1="20" y1="100" x2="300" y2="100" stroke="#64748b" strokeWidth="1.2" />
              <line x1="160" y1="12" x2="160" y2="188" stroke="#64748b" strokeWidth="1.2" />

              {/* Quadrant labels */}
              <text x="270" y="25" fill="#475569" fontSize="10" fontWeight="600">Q1 (+V, +I)</text>
              <text x="30" y="182" fill="#475569" fontSize="10" fontWeight="600">Q3 (−V, −I)</text>
              <text x="270" y="182" fill="#475569" fontSize="10" fontWeight="600">Q4 (+V, −I)</text>

              <path d={buildDiodePath()} fill="none" stroke="#34d399" strokeWidth="2.8" />

              <text x="16" y="22" fill="#22d3ee" fontSize="10.5" fontWeight="600">
                {diodeType === 'pn' && 'p-n / LED: Q1 Forward knee (~0.7V Si)'}
                {diodeType === 'zener' && 'Zener Diode: Sharp Q3 breakdown at −V_Z'}
                {diodeType === 'photodiode' && 'Photodiode: Q3 reverse bias shifts downward with light'}
                {diodeType === 'solar' && 'Solar Cell: Unbiased Q4 (intercepts +V_oc & −I_sc)'}
              </text>
            </svg>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Select Diode Operating Regime
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'pn', label: 'p-n / LED (Q1)' },
                  { id: 'zener', label: 'Zener (Q3)' },
                  { id: 'photodiode', label: 'Photodiode (Q3)' },
                  { id: 'solar', label: 'Solar Cell (Q4)' },
                ] as { id: DiodeType; label: string }[]
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDiodeType(d.id)}
                  className={`min-h-[42px] px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    diodeType === d.id
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {(diodeType === 'photodiode' || diodeType === 'solar') && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">Incident Light Intensity</span>
                  <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-300">
                    I{lightLevel} ({lightLevel}×)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={lightLevel}
                  onChange={(e) => setLightLevel(Number(e.target.value))}
                  className="w-full h-2 cursor-pointer"
                />
              </div>
            )}

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Remember JEE trap: overall p-n junction diode is electrically neutral, while the depletion layer holds immobile ions and zero free carriers.
            </p>
          </div>
        </div>
      )}

      {tab === 'zener' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
            <svg viewBox="0 0 320 180" className="w-full max-h-[220px] rounded-xl bg-slate-950 border border-slate-800">
              {/* Circuit Schematic */}
              <rect x="35" y="40" width="250" height="105" fill="none" stroke="#475569" strokeWidth="1.8" />
              {/* V_in source */}
              <circle cx="35" cy="92" r="16" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
              <text x="35" y="96" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="700">{vin}V</text>
              {/* Series R_s */}
              <rect x="92" y="30" width="54" height="20" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
              <text x="119" y="43" textAnchor="middle" fill="#e9d5ff" fontSize="9.5">R_s={rs}Ω</text>
              {/* Zener Branch */}
              <line x1="185" y1="40" x2="185" y2="145" stroke={isRegulating ? '#34d399' : '#64748b'} strokeWidth="2" />
              <polygon points="175,98 195,98 185,78" fill={isRegulating ? '#34d399' : '#64748b'} />
              <polyline points="172,74 176,78 194,78 198,82" fill="none" stroke="#34d399" strokeWidth="2" />
              <text x="164" y="122" fill="#34d399" fontSize="9.5">V_Z={vz}V</text>
              {/* Load R_L */}
              <rect x="268" y="65" width="34" height="55" rx="4" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
              <text x="285" y="96" textAnchor="middle" fill="#fde68a" fontSize="9.5">{rl}Ω</text>

              <text x="160" y="20" textAnchor="middle" fill={isRegulating ? '#34d399' : '#f43f5e'} fontSize="10.5" fontWeight="700">
                {isRegulating ? `Regulating Active: V_out locked at ${vz} V` : `Below Breakdown (V_Thev = ${vUnreg.toFixed(1)}V < ${vz}V)`}
              </text>
            </svg>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Series I_s</div>
                <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                  {isMa.toFixed(1)} mA
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Zener I_Z</div>
                <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                  {izMa.toFixed(1)} mA
                </div>
              </div>
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Load I_L</div>
                <div className="mt-0.5 font-mono font-semibold text-amber-600 dark:text-amber-300">
                  {ilMa.toFixed(1)} mA
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Zener Controls</h4>
            {[
              { label: 'Supply V_in', val: vin, set: setVin, min: 5, max: 25, step: 1, unit: 'V' },
              { label: 'Zener V_Z', val: vz, set: setVz, min: 3, max: 15, step: 0.5, unit: 'V' },
              { label: 'Series R_s', val: rs, set: setRs, min: 50, max: 500, step: 25, unit: 'Ω' },
              { label: 'Load R_L', val: rl, set: setRl, min: 100, max: 1200, step: 50, unit: 'Ω' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">{s.label}</span>
                  <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{s.val} {s.unit}</span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.val}
                  onChange={(e) => s.set(Number(e.target.value))}
                  className="w-full h-2 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'logic-gates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {(['NAND', 'NOR', 'AND', 'OR', 'XOR'] as GateType[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGate(g)}
                    className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold border transition-colors ${
                      gate === g
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 items-center rounded-xl bg-slate-950 border border-slate-800 p-4">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setInA((a) => (a ? 0 : 1))}
                  className={`w-full min-h-[44px] rounded-xl font-mono text-xs font-bold border ${
                    inA
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                      : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  A = {inA} (tap)
                </button>
                <button
                  type="button"
                  onClick={() => setInB((b) => (b ? 0 : 1))}
                  className={`w-full min-h-[44px] rounded-xl font-mono text-xs font-bold border ${
                    inB
                      ? 'border-violet-400 bg-violet-500/20 text-violet-200'
                      : 'border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  B = {inB} (tap)
                </button>
              </div>

              <div className="text-center">
                <div className="inline-flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-3">
                  <span className="text-xs font-bold text-slate-100">{gate}</span>
                  <span className="text-[11px] text-slate-400">
                    {gate === 'NAND' && '¬(A · B)'}
                    {gate === 'NOR' && '¬(A + B)'}
                    {gate === 'AND' && 'A · B'}
                    {gate === 'OR' && 'A + B'}
                    {gate === 'XOR' && 'A ⊕ B'}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div
                  className={`min-h-[60px] rounded-xl border flex flex-col items-center justify-center font-mono ${
                    gateOut
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                  }`}
                >
                  <span className="text-[11px] uppercase">Output Y</span>
                  <span className="text-xl font-bold">{gateOut}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Live Truth Table ({gate})
            </h4>
            <table className="w-full text-xs text-center border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2">A</th>
                  <th className="py-2">B</th>
                  <th className="py-2">Y = {gate}(A,B)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 font-mono">
                {(
                  [
                    [0, 0],
                    [0, 1],
                    [1, 0],
                    [1, 1],
                  ] as [0 | 1, 0 | 1][]
                ).map(([a, b]) => {
                  const y = evalGate(a, b, gate);
                  const active = a === inA && b === inB;
                  return (
                    <tr
                      key={`${a}-${b}`}
                      className={active ? 'bg-cyan-500/15 font-bold text-cyan-600 dark:text-cyan-300' : ''}
                    >
                      <td className="py-2">{a}</td>
                      <td className="py-2">{b}</td>
                      <td className="py-2">{y}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

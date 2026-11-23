import React, { useState } from 'react';
import { FormulaCard } from '../FormulaCard';
import { getFormulaById } from '../../data/formulas';

interface CapacitorLabProps {
  knownIds: string[];
  bookmarkedIds: string[];
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
}

export const CapacitorLab: React.FC<CapacitorLabProps> = ({
  knownIds,
  bookmarkedIds,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
}) => {
  const [batteryConnected, setBatteryConnected] = useState(true);
  const [K, setK] = useState(4.0);
  const [slabRatio, setSlabRatio] = useState(1.0); // t / d (0..1)
  const [V0, setV0] = useState(12); // V

  // Baseline air-filled values (normalized C0 = 1 uF)
  const C0 = 1.0;
  const Q0 = C0 * V0;
  const E0 = V0 / 1.0; // normalized per unit d=1cm -> V/cm
  const U0 = 0.5 * C0 * V0 * V0;

  // Capacitance with partial slab thickness t/d = slabRatio
  const C_new = C0 / (1 - slabRatio + slabRatio / K);
  const cFactor = C_new / C0;

  const V_new = batteryConnected ? V0 : V0 / cFactor;
  const Q_new = batteryConnected ? C_new * V0 : Q0;
  const E_air = batteryConnected ? V_new / (1 - slabRatio + slabRatio / K) : E0;
  const E_slab = E_air / K;
  const U_new = batteryConnected ? 0.5 * C_new * V0 * V0 : (Q0 * Q0) / (2 * C_new);
  const qInduced = Q_new * (1 - 1 / K);

  const fBattery = getFormulaById('elec-cap-battery-toggle');
  const fDielectric = getFormulaById('elec-cap-dielectric');

  const slabW = Math.round(slabRatio * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1">
          <button
            type="button"
            onClick={() => setBatteryConnected(true)}
            className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              batteryConnected
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Battery Connected (V constant)
          </button>
          <button
            type="button"
            onClick={() => setBatteryConnected(false)}
            className={`min-h-[40px] px-4 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              !batteryConnected
                ? 'bg-violet-500 text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Battery Disconnected (Q constant)
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSlabRatio(slabRatio > 0 ? 0 : 1)}
          className="min-h-[40px] px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-cyan-500/50"
        >
          {slabRatio > 0 ? 'Remove Dielectric (t = 0)' : 'Insert Full Dielectric (t = d)'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Parallel Plate Diagram */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 flex flex-col justify-between gap-3">
          <svg viewBox="0 0 320 200" className="w-full max-h-[220px]">
            <defs>
              <marker id="capArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee" />
              </marker>
            </defs>

            {/* Circuit wires to battery */}
            <path d="M 102 38 L 102 18 L 28 18 L 28 84" fill="none" stroke="#475569" strokeWidth="2" />
            <path d="M 28 116 L 28 180 L 218 180 L 218 162" fill="none" stroke="#475569" strokeWidth="2" />
            <path d="M 102 162 L 102 180" fill="none" stroke="#475569" strokeWidth="2" />
            <path d="M 218 38 L 218 18 L 102 18" fill="none" stroke="#475569" strokeWidth="2" />

            {/* Battery + switch */}
            {batteryConnected ? (
              <g>
                <line x1="16" y1="90" x2="40" y2="90" stroke="#22d3ee" strokeWidth="3" />
                <line x1="22" y1="100" x2="34" y2="100" stroke="#a855f7" strokeWidth="3" />
                <text x="8" y="122" fill="#22d3ee" fontSize="10" fontWeight="600">
                  {V0}V ON
                </text>
              </g>
            ) : (
              <g>
                <circle cx="28" cy="86" r="3" fill="#94a3b8" />
                <circle cx="28" cy="114" r="3" fill="#94a3b8" />
                <line x1="28" y1="114" x2="44" y2="92" stroke="#f472b6" strokeWidth="2.5" />
                <text x="6" y="132" fill="#f472b6" fontSize="10" fontWeight="600">
                  ISOLATED
                </text>
              </g>
            )}

            {/* Left Plate (+Q) */}
            <rect x="96" y="38" width="12" height="124" rx="2" fill="#22d3ee" />
            <text x="84" y="48" fill="#22d3ee" fontSize="11" fontWeight="700">
              +Q
            </text>

            {/* Right Plate (-Q) */}
            <rect x="212" y="38" width="12" height="124" rx="2" fill="#a855f7" />
            <text x="228" y="48" fill="#c084fc" fontSize="11" fontWeight="700">
              −Q
            </text>

            {/* Dielectric Slab */}
            {slabW > 0 && (
              <g>
                <rect
                  x={160 - slabW / 2}
                  y="44"
                  width={slabW}
                  height="112"
                  rx="4"
                  fill="#8b5cf6"
                  fillOpacity="0.28"
                  stroke="#a855f7"
                  strokeWidth="1.5"
                />
                <text x="160" y="104" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="600">
                  K = {K.toFixed(1)}
                </text>
                <text x={160 - slabW / 2 + 4} y="58" fill="#f472b6" fontSize="9.5">
                  −q′
                </text>
                <text x={160 + slabW / 2 - 18} y="58" fill="#22d3ee" fontSize="9.5">
                  +q′
                </text>
              </g>
            )}

            {/* Electric Field arrows */}
            {[68, 128].map((yPos) => (
              <line
                key={yPos}
                x1="114"
                y1={yPos}
                x2="204"
                y2={yPos}
                stroke="#22d3ee"
                strokeWidth="1.6"
                strokeDasharray="4 3"
                markerEnd="url(#capArrow)"
              />
            ))}
          </svg>

          {/* Live C, Q, V, E, U Comparison Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs tabular-nums">
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
              <div className="text-slate-500 dark:text-slate-400">C / C₀</div>
              <div className="mt-0.5 font-mono font-semibold text-emerald-600 dark:text-emerald-300">
                {cFactor.toFixed(2)}× ↑
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
              <div className="text-slate-500 dark:text-slate-400">Charge Q</div>
              <div className="mt-0.5 font-mono font-semibold text-cyan-600 dark:text-cyan-300">
                {Q_new.toFixed(1)} µC ({(Q_new / Q0).toFixed(2)}×)
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
              <div className="text-slate-500 dark:text-slate-400">Voltage V</div>
              <div className="mt-0.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                {V_new.toFixed(2)} V ({(V_new / V0).toFixed(2)}×)
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
              <div className="text-slate-500 dark:text-slate-400">E inside K</div>
              <div className="mt-0.5 font-mono font-semibold text-violet-600 dark:text-violet-300">
                {E_slab.toFixed(2)} V/cm
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-2.5">
              <div className="text-slate-500 dark:text-slate-400">Energy U</div>
              <div className="mt-0.5 font-mono font-semibold text-rose-600 dark:text-rose-300">
                {U_new.toFixed(1)} µJ ({(U_new / U0).toFixed(2)}×)
              </div>
            </div>
          </div>
        </div>

        {/* Sliders Deck */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 space-y-4">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Dielectric Slab Parameters
          </h4>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Dielectric Constant K</span>
              <span className="font-mono tabular-nums text-violet-600 dark:text-violet-300">{K.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={K}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Slab Thickness Fraction t/d</span>
              <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">{(slabRatio * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={slabRatio}
              onChange={(e) => setSlabRatio(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">Initial Battery Voltage V₀</span>
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">{V0} V</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={V0}
              onChange={(e) => setV0(Number(e.target.value))}
              className="w-full h-2 cursor-pointer"
            />
          </div>

          <div className="rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-1 text-slate-700 dark:text-slate-300 tabular-nums">
            <div>Induced bound charge q′ = Q(1 − 1/K): <strong>{qInduced.toFixed(2)} µC</strong></div>
            <div>Air-gap field E_air: <strong>{E_air.toFixed(2)} V/cm</strong></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {fBattery && (
          <FormulaCard
            formula={fBattery}
            isKnown={knownIds.includes(fBattery.id)}
            isBookmarked={bookmarkedIds.includes(fBattery.id)}
            isHighlighted
            onToggleKnown={onToggleKnown}
            onToggleBookmark={onToggleBookmark}
            onJumpToFormula={onJumpToFormula}
          />
        )}
        {fDielectric && (
          <FormulaCard
            formula={fDielectric}
            isKnown={knownIds.includes(fDielectric.id)}
            isBookmarked={bookmarkedIds.includes(fDielectric.id)}
            onToggleKnown={onToggleKnown}
            onToggleBookmark={onToggleBookmark}
            onJumpToFormula={onJumpToFormula}
          />
        )}
      </div>
    </div>
  );
};

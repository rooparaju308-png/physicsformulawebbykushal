import React, { useMemo, useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import {
  evaluatePhysicsExpression,
  formatSci,
  getCalculatorForFormula,
} from '../data/calculators';

interface FormulaSandboxProps {
  formulaId: string;
}

const CONSTANT_CHIPS = [
  { token: 'ke', label: 'kₑ (9e9)' },
  { token: 'km', label: 'kₘ (1e-7)' },
  { token: 'eps0', label: 'ε₀' },
  { token: 'mu0', label: 'μ₀' },
  { token: 'e0', label: 'e (1.6e-19)' },
  { token: 'c', label: 'c (3e8)' },
  { token: 'pi', label: 'π' },
];

export const FormulaSandbox: React.FC<FormulaSandboxProps> = ({ formulaId }) => {
  const preset = useMemo(() => getCalculatorForFormula(formulaId), [formulaId]);

  const [values, setValues] = useState<Record<string, number>>(() => {
    if (!preset) return {};
    return Object.fromEntries(preset.inputs.map((inp) => [inp.key, inp.defaultVal]));
  });

  const [expr, setExpr] = useState('2 * ke * 4e-6 / 0.1');

  const presetOutputs = useMemo(() => {
    if (!preset) return [];
    return preset.compute(values);
  }, [preset, values]);

  const evalResult = useMemo(() => evaluatePhysicsExpression(expr), [expr]);

  const handleResetPreset = () => {
    if (!preset) return;
    setValues(Object.fromEntries(preset.inputs.map((inp) => [inp.key, inp.defaultVal])));
  };

  return (
    <div className="mt-3 rounded-xl border border-cyan-500/30 bg-slate-50/95 dark:bg-slate-950/85 p-3.5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-300">
          <Calculator className="h-4 w-4 shrink-0" />
          <span>{preset ? preset.title : 'PYQ Numerical Sandbox'}</span>
        </div>
        {preset && (
          <button
            type="button"
            onClick={handleResetPreset}
            className="min-h-[34px] px-2.5 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {preset && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {preset.inputs.map((inp) => (
              <label key={inp.key} className="block space-y-1">
                <span className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="truncate">{inp.label}</span>
                  <span className="font-mono text-[10px] text-slate-500">{inp.unit}</span>
                </span>
                <input
                  type="number"
                  step={inp.step ?? 'any'}
                  min={inp.min}
                  value={values[inp.key] ?? inp.defaultVal}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setValues((prev) => ({
                      ...prev,
                      [inp.key]: Number.isFinite(num) ? num : 0,
                    }));
                  }}
                  className="w-full min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presetOutputs.map((out) => (
              <div
                key={out.label}
                className="rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 px-3 py-2 flex items-center justify-between gap-2"
              >
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {out.label}
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-cyan-700 dark:text-cyan-300 whitespace-nowrap">
                  {out.value} {out.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Expression Evaluator with Baked-in Constants */}
      <div className={preset ? 'pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2' : 'space-y-2'}>
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Quick Expression Evaluator (angles in deg for sin/cos/tan)</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CONSTANT_CHIPS.map((chip) => (
            <button
              key={chip.token}
              type="button"
              onClick={() => setExpr((prev) => (prev ? `${prev} * ${chip.token}` : chip.token))}
              className="min-h-[30px] px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:border-cyan-400 transition-colors whitespace-nowrap"
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="e.g. 2 * ke * 4e-6 / 0.1 or sqrt(30^2 + (31.4 - 79.6)^2)"
            className="flex-1 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
          />
          <div className="min-h-[40px] px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <span className="text-[11px] text-slate-500">=</span>
            {evalResult.ok ? (
              <span className="font-mono text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-300">
                {formatSci(evalResult.value, 5)}
              </span>
            ) : (
              <span className="text-[11px] text-rose-500">{evalResult.error}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

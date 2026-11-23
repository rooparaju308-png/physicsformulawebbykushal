import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Bookmark,
  Calculator,
  CheckCircle2,
  Circle,
  FlaskConical,
  LineChart,
  ShieldAlert,
} from 'lucide-react';
import { Formula } from '../types/physics';
import { getFormulaById } from '../data/formulas';
import { getTrapNote } from '../data/traps';
import { MathBlock } from './MathBlock';
import { FormulaSandbox } from './FormulaSandbox';

interface FormulaCardProps {
  formula: Formula;
  isKnown: boolean;
  isBookmarked: boolean;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  showTrapHighlight?: boolean;
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
  onOpenGraph?: (graphId: string, formulaId: string) => void;
  onOpenLab?: (labId: NonNullable<Formula['labId']>, formulaId: string) => void;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  formula,
  isKnown,
  isBookmarked,
  isHighlighted = false,
  isDimmed = false,
  showTrapHighlight = false,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
  onOpenGraph,
  onOpenLab,
}) => {
  const [sandboxOpen, setSandboxOpen] = useState(false);

  const weightLabel =
    formula.jeeWeight === 3 ? 'High Yield' : formula.jeeWeight === 2 ? 'Core' : 'Foundation';

  const trap = getTrapNote(formula.id);
  const derived = formula.derivedFrom.map(getFormulaById).filter((x): x is Formula => !!x);
  const specials = formula.specialCasesTo.map(getFormulaById).filter((x): x is Formula => !!x);
  const analogs = formula.analogTo.map(getFormulaById).filter((x): x is Formula => !!x);

  return (
    <article
      id={`formula-${formula.id}`}
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 backdrop-blur-md ${
        isHighlighted
          ? 'border-cyan-400/80 bg-cyan-950/30 dark:bg-cyan-950/35 shadow-[0_0_24px_rgba(34,211,238,0.18)]'
          : showTrapHighlight && trap
          ? 'border-amber-500/60 bg-white/90 dark:bg-slate-900/75'
          : 'border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/65'
      } ${isDimmed ? 'opacity-40' : 'opacity-100'}`}
    >
      {/* Top quiet unboxed metadata + action buttons */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-cyan-700 dark:text-cyan-300">{formula.subtopic}</span>
            <span aria-hidden="true">·</span>
            <span>{weightLabel}</span>
            {trap && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Exam Trap
                </span>
              </>
            )}
            {formula.verify && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Verify note
                </span>
              </>
            )}
          </div>
          <h3 className="mt-1 text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            {formula.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleBookmark(formula.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark formula'}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-colors ${
              isBookmarked
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
            }`}
          >
            <Bookmark className="h-4.5 w-4.5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={() => onToggleKnown(formula.id)}
            aria-label={isKnown ? 'Mark as still learning' : 'Mark I know this'}
            className={`min-h-[44px] px-3 flex items-center gap-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              isKnown
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
            }`}
          >
            {isKnown ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <Circle className="h-4 w-4 shrink-0" />
            )}
            <span>{isKnown ? 'Known' : 'I know this'}</span>
          </button>
        </div>
      </div>

      {/* Rendered KaTeX Formula */}
      <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950/75 border border-slate-200/80 dark:border-slate-800/90 px-3.5 py-3 text-slate-900 dark:text-cyan-50 overflow-x-auto">
        <MathBlock latex={formula.latex} displayMode />
      </div>

      {/* Conditions & Variables */}
      {formula.conditions.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {formula.conditions.map((cond, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-cyan-500 shrink-0" aria-hidden="true" />
              <span>{cond}</span>
            </li>
          ))}
        </ul>
      )}

      {formula.variables.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          {formula.variables.map((v, i) => (
            <span key={i} className="inline-flex items-baseline gap-1">
              <MathBlock latex={v.symbol} displayMode={false} className="text-slate-800 dark:text-slate-200 font-medium" />
              <span>: {v.meaning}</span>
            </span>
          ))}
        </div>
      )}

      {trap && (showTrapHighlight || isHighlighted) && (
        <div className="mt-3 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2.5 text-xs space-y-1 text-amber-900 dark:text-amber-100">
          <div className="font-semibold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>JEE Trap: {trap.headline}</span>
          </div>
          <div>
            <strong>Common mistake:</strong> {trap.pitfall}
          </div>
          <div>
            <strong>Safe rule:</strong> {trap.safeRule}
          </div>
        </div>
      )}

      {formula.verify && (
        <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          <strong>Verify:</strong> {formula.verify}
        </div>
      )}

      {/* Quick Graph / Lab / Numerical Calculator Launchers */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSandboxOpen((o) => !o)}
          className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
            sandboxOpen
              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-700 dark:text-cyan-200'
              : 'border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:border-cyan-400'
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>{sandboxOpen ? 'Hide calculator' : 'Calculate / PYQ check'}</span>
        </button>

        {formula.graphId && onOpenGraph && (
          <button
            type="button"
            onClick={() => onOpenGraph(formula.graphId!, formula.id)}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3.5 py-2 text-xs font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-500/20 transition-colors whitespace-nowrap shrink-0"
          >
            <LineChart className="h-4 w-4" />
            <span>Open graph</span>
          </button>
        )}
        {formula.labId && onOpenLab && (
          <button
            type="button"
            onClick={() => onOpenLab(formula.labId!, formula.id)}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-medium text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition-colors whitespace-nowrap shrink-0"
          >
            <FlaskConical className="h-4 w-4" />
            <span>Open simulator</span>
          </button>
        )}
      </div>

      {sandboxOpen && <FormulaSandbox formulaId={formula.id} />}

      {/* Interlinked Web Navigation: Derived From / Special Cases / Analog */}
      {(derived.length > 0 || specials.length > 0 || analogs.length > 0) && (
        <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
          {derived.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium mr-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Derived from:
              </span>
              {derived.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onJumpToFormula(item.id)}
                  className="min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors text-left"
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}

          {specials.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium mr-1">
                <ArrowRight className="h-3.5 w-3.5" />
                Special cases:
              </span>
              {specials.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onJumpToFormula(item.id)}
                  className="min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-violet-500/10 transition-colors text-left"
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}

          {analogs.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium mr-1">
                <ArrowLeftRight className="h-3.5 w-3.5" />
                Analog:
              </span>
              {analogs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onJumpToFormula(item.id)}
                  className="min-h-[36px] px-2.5 py-1 rounded-lg border border-cyan-500/25 bg-cyan-500/5 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/15 transition-colors text-left"
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

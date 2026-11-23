import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { CHAPTERS, FORMULAS, FORMULA_MAP } from '../data/formulas';
import { GRAPH_GROUPS } from '../data/graphs';
import { AppTab } from '../types/physics';

interface AuditPageProps {
  onNavigate: (tab: AppTab) => void;
  onJumpToFormula: (id: string) => void;
}

export const AuditPage: React.FC<AuditPageProps> = ({ onNavigate, onJumpToFormula }) => {
  const auditData = useMemo(() => {
    const byChapter = CHAPTERS.map((ch) => {
      const list = FORMULAS.filter((f) => f.chapter === ch.id);
      return { chapter: ch, count: list.length, formulas: list };
    });

    const brokenLinks: { sourceId: string; missingTarget: string }[] = [];
    for (const f of FORMULAS) {
      for (const id of [...f.derivedFrom, ...f.specialCasesTo, ...f.analogTo]) {
        if (!FORMULA_MAP[id]) {
          brokenLinks.push({ sourceId: f.id, missingTarget: id });
        }
      }
    }

    const verifyItems = FORMULAS.filter((f) => !!f.verify);

    return {
      totalFormulas: FORMULAS.length,
      totalGraphs: GRAPH_GROUPS.length,
      byChapter,
      brokenLinks,
      verifyItems,
    };
  }, []);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Formula Web Audit
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Chapter-by-chapter inventory & cross-link integrity check against Part A.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Formulas</div>
          <div className="mt-1 text-2xl font-bold text-cyan-600 dark:text-cyan-300 tabular-nums">
            {auditData.totalFormulas}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Graph Groups</div>
          <div className="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-300 tabular-nums">
            {auditData.totalGraphs} / 16
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Broken Web Links</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-300 tabular-nums">
            {auditData.brokenLinks.length}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Verify Flags</div>
          <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-300 tabular-nums">
            {auditData.verifyItems.length}
          </div>
        </div>
      </div>

      {/* Per-Chapter Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 overflow-hidden">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-100 dark:bg-slate-950/70 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 font-semibold">Chapter</th>
              <th className="px-4 py-3 font-semibold text-right">Formula Count</th>
              <th className="px-4 py-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {auditData.byChapter.map(({ chapter, count }) => (
              <tr key={chapter.id}>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {chapter.title}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-cyan-600 dark:text-cyan-300">
                  {count}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Indexed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Verify-Flagged Notes */}
      {auditData.verifyItems.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span>Items Marked for Notebook Cross-Check ({auditData.verifyItems.length})</span>
          </div>
          <div className="space-y-2 text-xs">
            {auditData.verifyItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-white/80 dark:bg-slate-900/70 p-3"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</div>
                  <div className="text-slate-600 dark:text-slate-300 mt-0.5">{item.verify}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onJumpToFormula(item.id)}
                  className="min-h-[36px] px-3 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-200 font-semibold whitespace-nowrap shrink-0"
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

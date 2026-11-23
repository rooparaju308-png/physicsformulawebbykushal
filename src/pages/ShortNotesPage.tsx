import React, { useState } from 'react';
import {
  ArrowUpRight,
  Ban,
  BookOpen,
  FlaskConical,
  LineChart,
  ShieldAlert,
} from 'lucide-react';
import { NTA_SYLLABUS_REMOVALS, SHORT_NOTES } from '../data/shortNotes';
import { Formula } from '../types/physics';
import { MathBlock } from '../components/MathBlock';

interface ShortNotesPageProps {
  onJumpToFormula: (formulaId: string) => void;
  onOpenGraph: (graphId: string, formulaId: string) => void;
  onOpenLab: (labId: NonNullable<Formula['labId']>, formulaId: string) => void;
}

export const ShortNotesPage: React.FC<ShortNotesPageProps> = ({
  onJumpToFormula,
  onOpenGraph,
  onOpenLab,
}) => {
  const [selectedId, setSelectedId] = useState<string>(SHORT_NOTES[0].id);
  const [trapsHighlight, setTrapsHighlight] = useState(false);
  const [showNtaBanner, setShowNtaBanner] = useState(false);

  const chapter = SHORT_NOTES.find((c) => c.id === selectedId) ?? SHORT_NOTES[0];
  const firstFormulaId = chapter.sections[0]?.items[0]?.formulaId ?? '';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            High-Yield Short Notes (NTA JEE Main)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Complete chapter-wise revision notes covering Units 11–20 (Electrostatics → EM Waves → Modern Physics → Semiconductors → Optics → Unit 20 Labs).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowNtaBanner((s) => !s)}
            className={`min-h-[42px] px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border whitespace-nowrap transition-colors ${
              showNtaBanner
                ? 'border-rose-400 bg-rose-500/15 text-rose-700 dark:text-rose-200'
                : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Ban className="h-4 w-4 text-rose-500" />
            <span>NTA Removed Topics</span>
          </button>

          <button
            type="button"
            onClick={() => setTrapsHighlight((t) => !t)}
            className={`min-h-[42px] px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border whitespace-nowrap transition-colors ${
              trapsHighlight
                ? 'border-amber-400 bg-amber-500/20 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>{trapsHighlight ? 'Showing Traps & Graphs Focus' : 'Highlight Traps Only'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Global NTA Removed Topics Summary */}
      {showNtaBanner && (
        <section className="rounded-2xl border border-rose-500/35 bg-rose-500/5 dark:bg-rose-950/20 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300">
            <Ban className="h-4 w-4 shrink-0" />
            <span>What NTA Removed (Skip These for JEE Main)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {NTA_SYLLABUS_REMOVALS.map((item) => (
              <div
                key={item.unit}
                className="rounded-xl bg-white/85 dark:bg-slate-950/70 border border-rose-500/20 p-3 space-y-1"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {item.unit}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.topics}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chapter Switcher Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {SHORT_NOTES.map((note) => {
          const active = note.id === chapter.id;
          return (
            <button
              key={note.id}
              type="button"
              onClick={() => setSelectedId(note.id)}
              className={`min-h-[44px] px-4 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors flex items-center gap-2 ${
                active
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                  : 'border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-cyan-500/40'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: note.accentColor }}
              />
              <span>{note.shortTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Chapter Overview & Simulation Launcher Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
            <BookOpen className="h-4 w-4" />
            <span>{chapter.unitTag} · Chapter Revision Sheet</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {chapter.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {chapter.subtitle}
          </p>
          {chapter.ntaRemoved && chapter.ntaRemoved.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1.5">
              {chapter.ntaRemoved.map((rem) => (
                <span
                  key={rem}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:text-rose-300"
                >
                  <Ban className="h-3 w-3 shrink-0" />
                  <span>{rem}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenLab(chapter.labId, firstFormulaId)}
          className="min-h-[46px] px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 hover:opacity-95 transition-opacity"
        >
          <FlaskConical className="h-4 w-4" />
          <span>Launch {chapter.simTitle}</span>
        </button>
      </div>

      {/* Core Formulas Sections */}
      {!trapsHighlight && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {chapter.sections.map((sec) => (
            <section
              key={sec.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 space-y-3"
            >
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                {sec.title}
              </h4>
              <div className="space-y-2.5">
                {sec.items.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl bg-slate-50 dark:bg-slate-950/75 border border-slate-200/80 dark:border-slate-800 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {item.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => onJumpToFormula(item.formulaId)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-300 hover:underline whitespace-nowrap shrink-0"
                      >
                        <span>Card</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="overflow-x-auto text-slate-950 dark:text-cyan-50">
                      <MathBlock latex={item.latex} displayMode />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Quick-Check Comparison Table (e.g., Series LCR Table) */}
      {!trapsHighlight && chapter.comparisonTable && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 space-y-3">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            {chapter.comparisonTable.title}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  {chapter.comparisonTable.headers.map((h) => (
                    <th key={h} className="py-2 pr-4 font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chapter.comparisonTable.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-2.5 pr-4 ${
                          cIdx === 0
                            ? 'font-semibold text-cyan-700 dark:text-cyan-300 whitespace-nowrap'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Must-Know Graphs & Key JEE Traps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            <LineChart className="h-4.5 w-4.5 text-violet-500" />
            <span>Must-Know Graphs &amp; Diagrams</span>
          </div>
          <div className="space-y-2.5">
            {chapter.mustKnowGraphs.map((g) => (
              <div
                key={g.title}
                className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 p-3 space-y-1.5"
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {g.title}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {g.summary}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {g.graphId && (
                    <button
                      type="button"
                      onClick={() => onOpenGraph(g.graphId!, g.formulaId)}
                      className="text-[11px] font-semibold text-violet-600 dark:text-violet-300 hover:underline"
                    >
                      Open Interactive Graph →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onJumpToFormula(g.formulaId)}
                    className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-300 hover:underline"
                  >
                    View Formula Card →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-500/35 bg-amber-500/5 dark:bg-amber-950/15 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-amber-800 dark:text-amber-300">
            <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
            <span>Key JEE Main Trap Points</span>
          </div>
          <div className="space-y-2.5">
            {chapter.jeeTraps.map((trap, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-white/80 dark:bg-slate-950/75 border border-amber-500/25 p-3 space-y-1.5"
              >
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {trap.point}
                </p>
                <button
                  type="button"
                  onClick={() => onJumpToFormula(trap.formulaId)}
                  className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                >
                  Open Linked Formula &amp; Trap Rule →
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs text-slate-300">
              <strong className="text-cyan-300">{chapter.simTitle}:</strong> {chapter.simDescription}
            </div>
            <button
              type="button"
              onClick={() => onOpenLab(chapter.labId, firstFormulaId)}
              className="min-h-[38px] px-3.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/35 text-xs font-semibold whitespace-nowrap shrink-0 hover:bg-cyan-500/30"
            >
              Open Simulation
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

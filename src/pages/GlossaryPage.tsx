import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BookMarked,
  FlaskConical,
  Search,
  X,
} from 'lucide-react';
import { PHYSICS_GLOSSARY, GlossaryTerm } from '../data/glossary';
import { CHAPTERS, FORMULA_MAP } from '../data/formulas';
import { ChapterId, Formula } from '../types/physics';
import { MathBlock } from '../components/MathBlock';

interface GlossaryPageProps {
  onJumpToFormula: (formulaId: string) => void;
  onOpenLab: (labId: NonNullable<Formula['labId']>, formulaId: string) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const GLOSSARY_BY_ID: Record<string, GlossaryTerm> = Object.fromEntries(
  PHYSICS_GLOSSARY.map((t) => [t.id, t])
);

export const GlossaryPage: React.FC<GlossaryPageProps> = ({
  onJumpToFormula,
  onOpenLab,
}) => {
  const [query, setQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<ChapterId | 'all'>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const chapterTabs = useMemo(() => {
    const present = new Set(PHYSICS_GLOSSARY.map((t) => t.chapter));
    return CHAPTERS.filter((c) => present.has(c.id));
  }, []);

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    for (const item of PHYSICS_GLOSSARY) {
      if (selectedChapter !== 'all' && item.chapter !== selectedChapter) continue;
      set.add(item.term.charAt(0).toUpperCase());
    }
    return set;
  }, [selectedChapter]);

  const filteredTerms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PHYSICS_GLOSSARY.filter((item) => {
      if (selectedChapter !== 'all' && item.chapter !== selectedChapter) return false;
      if (selectedLetter !== 'ALL' && item.term.charAt(0).toUpperCase() !== selectedLetter) {
        return false;
      }
      if (!q) return true;
      const linkedTitles = item.formulaIds
        .map((fid) => FORMULA_MAP[fid]?.title || '')
        .join(' ');
      const hay = `${item.term} ${item.symbol || ''} ${item.definition} ${item.jeeNote || ''} ${item.unitLabel} ${linkedTitles}`.toLowerCase();
      return hay.includes(q);
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [query, selectedChapter, selectedLetter]);

  const handleJumpToTerm = (termId: string) => {
    setQuery('');
    setSelectedChapter('all');
    setSelectedLetter('ALL');
    setHighlightedId(termId);
    setTimeout(() => {
      const el = document.getElementById(`glossary-${termId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
    setTimeout(() => {
      setHighlightedId((prev) => (prev === termId ? null : prev));
    }, 2200);
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedChapter('all');
    setSelectedLetter('ALL');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            JEE Physics Glossary (A–Z)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Quick-reference definitions, physical quantities, SI units &amp; direct Formula Web links across Units 11–20.
          </p>
        </div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
          Showing {filteredTerms.length} of {PHYSICS_GLOSSARY.length} syllabus terms
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search term, symbol, law, or unit (e.g. 'displacement current', 'Brewster', 'Q-value', 'half-deflection')..."
            aria-label="Search Physics Glossary"
            className="w-full min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-10 pr-10 text-sm text-slate-900 dark:text-slate-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear glossary search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Unit Filter Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setSelectedChapter('all');
              setSelectedLetter('ALL');
            }}
            className={`min-h-[38px] px-3.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
              selectedChapter === 'all'
                ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200 font-semibold'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300 hover:border-cyan-500/40'
            }`}
          >
            All Units
          </button>
          {chapterTabs.map((ch) => {
            const active = selectedChapter === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setSelectedChapter(ch.id);
                  setSelectedLetter('ALL');
                }}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
                  active
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300 hover:border-cyan-500/40'
                }`}
              >
                {ch.shortTitle}
              </button>
            );
          })}
        </div>

        {/* Alphabet Quick-Filter Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-1 border-t border-slate-200/70 dark:border-slate-800/70">
          <button
            type="button"
            onClick={() => setSelectedLetter('ALL')}
            className={`min-h-[34px] px-2.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              selectedLetter === 'ALL'
                ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            A–Z
          </button>
          {ALPHABET.map((letter) => {
            const hasTerms = availableLetters.has(letter);
            const active = selectedLetter === letter;
            return (
              <button
                key={letter}
                type="button"
                disabled={!hasTerms}
                onClick={() => setSelectedLetter(active ? 'ALL' : letter)}
                className={`min-h-[34px] min-w-[30px] px-1.5 rounded-md text-xs font-mono font-semibold shrink-0 transition-colors ${
                  active
                    ? 'bg-cyan-500 text-slate-950'
                    : hasTerms
                      ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredTerms.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-8 text-center space-y-3">
          <BookMarked className="h-7 w-7 text-slate-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No glossary terms match your current filters
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try clearing the search query or switching back to all syllabus units.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="min-h-[40px] px-4 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold hover:bg-cyan-400 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTerms.map((item) => {
            const linkedFormulas = item.formulaIds
              .map((id) => FORMULA_MAP[id])
              .filter((f): f is Formula => Boolean(f));
            const primaryFormula = linkedFormulas[0];
            const relatedTerms = (item.relatedIds || [])
              .map((rid) => GLOSSARY_BY_ID[rid])
              .filter((t): t is GlossaryTerm => Boolean(t));
            const isHighlighted = highlightedId === item.id;

            return (
              <article
                key={item.id}
                id={`glossary-${item.id}`}
                className={`rounded-2xl border bg-white/90 dark:bg-slate-900/75 p-5 flex flex-col justify-between gap-4 transition-colors ${
                  isHighlighted
                    ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Quiet inline metadata without pill boxes */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-cyan-700 dark:text-cyan-300">
                      {item.unitLabel}
                    </span>
                    {item.siUnit && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>SI Unit: {item.siUnit}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {linkedFormulas.length}{' '}
                      {linkedFormulas.length === 1 ? 'formula' : 'formulas'}
                    </span>
                  </div>

                  {/* Term Header + Symbol */}
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      {item.term}
                    </h3>
                    {item.symbol && (
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                        {item.symbol}
                      </span>
                    )}
                  </div>

                  {/* Concise Definition */}
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {item.definition}
                  </p>

                  {/* Key Formula MathBlock Preview */}
                  {primaryFormula && (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/75 border border-slate-200/80 dark:border-slate-800/80 px-3 py-2.5 overflow-x-auto">
                      <MathBlock latex={primaryFormula.latex} displayMode />
                    </div>
                  )}

                  {/* JEE Note / Trap Check */}
                  {item.jeeNote && (
                    <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{item.jeeNote}</span>
                    </div>
                  )}
                </div>

                {/* Footer Links: Formula Web Jumps + Lab + Related Terms */}
                <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {linkedFormulas.map((formula) => (
                      <button
                        key={formula.id}
                        type="button"
                        onClick={() => onJumpToFormula(formula.id)}
                        className="min-h-[36px] px-3 rounded-lg border border-cyan-500/35 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-cyan-500/20 transition-colors whitespace-nowrap"
                      >
                        <span className="max-w-[210px] truncate">{formula.title}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                      </button>
                    ))}
                    {primaryFormula?.labId && (
                      <button
                        type="button"
                        onClick={() => onOpenLab(primaryFormula.labId!, primaryFormula.id)}
                        className="min-h-[36px] px-3 rounded-lg border border-violet-500/35 bg-violet-500/10 text-violet-700 dark:text-violet-200 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-violet-500/20 transition-colors whitespace-nowrap"
                      >
                        <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                        <span>Open Sim Lab</span>
                      </button>
                    )}
                  </div>

                  {relatedTerms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>Related:</span>
                      {relatedTerms.map((rel, idx) => (
                        <React.Fragment key={rel.id}>
                          {idx > 0 && <span aria-hidden="true">·</span>}
                          <button
                            type="button"
                            onClick={() => handleJumpToTerm(rel.id)}
                            className="text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2 font-medium"
                          >
                            {rel.term}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

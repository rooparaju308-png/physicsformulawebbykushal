import React, { useEffect, useMemo, useState } from 'react';
import { Bookmark, Columns2, GitBranch, LayoutGrid, Scale, Search, ShieldAlert, X } from 'lucide-react';
import { CHAPTERS, FORMULAS } from '../data/formulas';
import { getTrapNote } from '../data/traps';
import { ChapterId, Formula } from '../types/physics';
import { FormulaCard } from '../components/FormulaCard';
import { ComparisonSheet } from '../components/ComparisonSheet';
import { ConceptGraphView } from '../components/ConceptGraphView';
import { UnitConverterModal } from '../components/UnitConverterModal';

interface WebPageProps {
  knownIds: string[];
  bookmarkedIds: string[];
  focusedFormulaId: string | null;
  onToggleKnown: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onJumpToFormula: (id: string) => void;
  onOpenGraph: (graphId: string, formulaId: string) => void;
  onOpenLab: (labId: NonNullable<Formula['labId']>, formulaId: string) => void;
}

type WebViewMode = 'cards' | 'graph' | 'compare';

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const text = target.toLowerCase();
  if (text.includes(q)) return true;
  // Subsequence fuzzy fallback
  let qi = 0;
  for (let i = 0; i < text.length && qi < q.length; i++) {
    if (text[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

export const WebPage: React.FC<WebPageProps> = ({
  knownIds,
  bookmarkedIds,
  focusedFormulaId,
  onToggleKnown,
  onToggleBookmark,
  onJumpToFormula,
  onOpenGraph,
  onOpenLab,
}) => {
  const [viewMode, setViewMode] = useState<WebViewMode>('cards');
  const [query, setQuery] = useState('');
  const [selectedChapter, setSelectedChapter] = useState<ChapterId | 'all'>('all');
  const [weightFilter, setWeightFilter] = useState<0 | 1 | 2 | 3>(0);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [onlyTraps, setOnlyTraps] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  useEffect(() => {
    if (!focusedFormulaId) return;
    setViewMode('cards');
    setSelectedChapter('all');
    setWeightFilter(0);
    setOnlyBookmarked(false);
    setOnlyTraps(false);
    setQuery('');
    const timer = setTimeout(() => {
      const el = document.getElementById(`formula-${focusedFormulaId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 90);
    return () => clearTimeout(timer);
  }, [focusedFormulaId]);

  const filtered = useMemo(() => {
    return FORMULAS.filter((f) => {
      if (selectedChapter !== 'all' && f.chapter !== selectedChapter) return false;
      if (weightFilter !== 0 && f.jeeWeight !== weightFilter) return false;
      if (onlyBookmarked && !bookmarkedIds.includes(f.id)) return false;
      if (onlyTraps && !getTrapNote(f.id)) return false;
      if (query.trim()) {
        const trap = getTrapNote(f.id);
        const hay = `${f.title} ${f.subtopic} ${f.tags.join(' ')} ${f.conditions.join(' ')} ${f.latex} ${
          trap ? `${trap.headline} ${trap.pitfall} ${trap.safeRule}` : ''
        }`;
        if (!fuzzyMatch(query, hay)) return false;
      }
      return true;
    });
  }, [selectedChapter, weightFilter, onlyBookmarked, onlyTraps, bookmarkedIds, query]);

  // Group filtered formulas by chapter in exact Part A order
  const groupedByChapter = useMemo(() => {
    return CHAPTERS.map((ch) => ({
      chapter: ch,
      items: filtered.filter((f) => f.chapter === ch.id),
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Interlinked Formula Web
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Walk derivations, traps, numerical calculators & twin comparisons across all {FORMULAS.length} formulas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Converter & Constants Overlay Button */}
          <button
            type="button"
            onClick={() => setIsConverterOpen(true)}
            className="min-h-[40px] px-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-200 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-cyan-500/25 transition-colors"
          >
            <Scale className="h-4 w-4 shrink-0" />
            <span>Unit Converter & Constants</span>
          </button>

          {/* View Mode Switcher: Cards | Concept Graph | Compare Twin Pairs */}
          <div className="inline-flex items-center rounded-xl bg-slate-200/80 dark:bg-slate-800/80 p-1 gap-1">
            {(
              [
                { id: 'cards', label: 'Cards', icon: LayoutGrid },
                { id: 'graph', label: 'Graph', icon: GitBranch },
                { id: 'compare', label: 'Twin Compare', icon: Columns2 },
              ] as const
            ).map((m) => {
              const Icon = m.icon;
              const active = viewMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewMode(m.id)}
                  className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {viewMode === 'graph' && (
        <ConceptGraphView knownIds={knownIds} onJumpToFormula={onJumpToFormula} />
      )}

      {viewMode === 'compare' && (
        <ComparisonSheet onJumpToFormula={onJumpToFormula} />
      )}

      {viewMode === 'cards' && (
        <>
          {/* Fuzzy Search + Filter Controls */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-3.5 space-y-3">
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Fuzzy search formulas, traps, tags, symbols (e.g. cavity, rlc, dipole)..."
                  className="w-full min-h-[44px] pl-10 pr-9 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {([0, 3, 2, 1] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeightFilter(w)}
                    className={`min-h-[44px] px-3 rounded-xl text-xs font-medium border whitespace-nowrap transition-colors ${
                      weightFilter === w
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {w === 0 ? 'All Yield' : w === 3 ? 'High Yield' : w === 2 ? 'Core' : 'Foundation'}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setOnlyTraps((t) => !t)}
                  aria-label="Filter JEE traps and sign conventions"
                  className={`min-h-[44px] px-3 rounded-xl text-xs font-medium border inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    onlyTraps
                      ? 'border-amber-400 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>Traps Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyBookmarked((b) => !b)}
                  aria-label="Filter bookmarked formulas"
                  className={`min-h-[44px] px-3 rounded-xl text-xs font-medium border inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    onlyBookmarked
                      ? 'border-amber-400 bg-amber-500/15 text-amber-600 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Bookmark className="h-4 w-4" fill={onlyBookmarked ? 'currentColor' : 'none'} />
                  <span className="hidden sm:inline">Starred</span>
                </button>
              </div>
            </div>

            {/* Chapter Chain Tabs + Count */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedChapter('all')}
                  className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    selectedChapter === 'all'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  All Chapters
                </button>
                {CHAPTERS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChapter(ch.id)}
                    className={`min-h-[40px] px-3.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                      selectedChapter === ch.id
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {ch.shortTitle}
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap shrink-0">
                <strong className="text-slate-900 dark:text-slate-100">{filtered.length}</strong> / {FORMULAS.length}
              </div>
            </div>
          </div>

          {/* Chapter Sections */}
          {groupedByChapter.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No formulas match your current filters. Try clearing your search query, trap mode, or chapter filter.
            </div>
          ) : (
            <div className="space-y-8">
              {groupedByChapter.map(({ chapter, items }) => (
                <section key={chapter.id} className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {chapter.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{chapter.subtitle}</p>
                    </div>
                    <span className="text-xs font-mono text-cyan-600 dark:text-cyan-300 tabular-nums shrink-0">
                      {items.length} formulas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {items.map((formula) => (
                      <FormulaCard
                        key={formula.id}
                        formula={formula}
                        isKnown={knownIds.includes(formula.id)}
                        isBookmarked={bookmarkedIds.includes(formula.id)}
                        isHighlighted={focusedFormulaId === formula.id}
                        showTrapHighlight={onlyTraps}
                        onToggleKnown={onToggleKnown}
                        onToggleBookmark={onToggleBookmark}
                        onJumpToFormula={onJumpToFormula}
                        onOpenGraph={onOpenGraph}
                        onOpenLab={onOpenLab}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <UnitConverterModal isOpen={isConverterOpen} onClose={() => setIsConverterOpen(false)} />
    </div>
  );
};

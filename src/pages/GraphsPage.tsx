import React, { useEffect, useState } from 'react';
import { GRAPH_GROUPS } from '../data/graphs';
import { CHAPTERS } from '../data/formulas';
import { InteractiveGraphCard } from '../components/InteractiveGraphCard';

interface GraphsPageProps {
  focusedGraphId: string | null;
  onJumpToFormula: (formulaId: string) => void;
}

export const GraphsPage: React.FC<GraphsPageProps> = ({
  focusedGraphId,
  onJumpToFormula,
}) => {
  const [chapterFilter, setChapterFilter] = useState<string>('all');

  useEffect(() => {
    if (focusedGraphId) {
      setChapterFilter('all');
      const el = document.getElementById(`graph-${focusedGraphId}`);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
      }
    }
  }, [focusedGraphId]);

  const filtered =
    chapterFilter === 'all'
      ? GRAPH_GROUPS
      : GRAPH_GROUPS.filter((g) => g.chapter === chapterFilter);

  const availableChapters = CHAPTERS.filter((c) =>
    GRAPH_GROUPS.some((g) => g.chapter === c.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Interactive Physics Graphs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            All {GRAPH_GROUPS.length} graph groups across EM, Optics, Modern Physics & Semiconductors. Tap any curve or point to inspect the linked formula.
          </p>
        </div>
      </div>

      {/* Chapter Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setChapterFilter('all')}
          className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            chapterFilter === 'all'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
          }`}
        >
          All {GRAPH_GROUPS.length} Graphs
        </button>
        {availableChapters.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => setChapterFilter(ch.id)}
            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              chapterFilter === ch.id
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
            }`}
          >
            {ch.shortTitle}
          </button>
        ))}
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map((graph) => (
          <InteractiveGraphCard
            key={graph.id}
            graph={graph}
            isFocused={focusedGraphId === graph.id}
            onJumpToFormula={onJumpToFormula}
          />
        ))}
      </div>
    </div>
  );
};

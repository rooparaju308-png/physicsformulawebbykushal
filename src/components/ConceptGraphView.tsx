import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowLeft, ArrowLeftRight } from 'lucide-react';
import { CHAPTERS, FORMULAS, getFormulaById } from '../data/formulas';
import { ChapterId, Formula } from '../types/physics';
import { MathBlock } from './MathBlock';

interface ConceptGraphViewProps {
  knownIds: string[];
  onJumpToFormula: (formulaId: string) => void;
}

export const ConceptGraphView: React.FC<ConceptGraphViewProps> = ({
  knownIds,
  onJumpToFormula,
}) => {
  const [chapterFilter, setChapterFilter] = useState<ChapterId>('line-arc-ring');
  const [selectedId, setSelectedId] = useState<string>('lar-wire-e-perp');

  const nodes = useMemo(
    () => FORMULAS.filter((f) => f.chapter === chapterFilter),
    [chapterFilter]
  );

  const selectedFormula: Formula = useMemo(() => {
    const found = getFormulaById(selectedId);
    if (found && found.chapter === chapterFilter) return found;
    return nodes[0] ?? FORMULAS[0];
  }, [selectedId, chapterFilter, nodes]);

  // Group nodes into subtopic columns for a clean structured DAG layout
  const subtopicColumns = useMemo(() => {
    const subtopics = Array.from(new Set(nodes.map((n) => n.subtopic)));
    return subtopics.map((sub) => ({
      subtopic: sub,
      items: nodes.filter((n) => n.subtopic === sub),
    }));
  }, [nodes]);

  // Compute node positions in SVG coordinate space
  const layout = useMemo(() => {
    const colW = 240;
    const rowH = 74;
    const padX = 24;
    const padY = 48;
    const pos: Record<string, { x: number; y: number }> = {};

    subtopicColumns.forEach((col, ci) => {
      col.items.forEach((item, ri) => {
        pos[item.id] = {
          x: padX + ci * colW,
          y: padY + ri * rowH,
        };
      });
    });

    const maxRows = Math.max(1, ...subtopicColumns.map((c) => c.items.length));
    const width = Math.max(680, padX * 2 + subtopicColumns.length * colW);
    const height = Math.max(340, padY + maxRows * rowH + 24);
    return { pos, width, height, colW };
  }, [subtopicColumns]);

  const edges = useMemo(() => {
    const list: { from: string; to: string; kind: 'derive' | 'analog' }[] = [];
    for (const f of nodes) {
      for (const parentId of f.derivedFrom) {
        if (layout.pos[parentId] && layout.pos[f.id]) {
          list.push({ from: parentId, to: f.id, kind: 'derive' });
        }
      }
      for (const specialId of f.specialCasesTo) {
        if (layout.pos[specialId] && layout.pos[f.id]) {
          list.push({ from: f.id, to: specialId, kind: 'derive' });
        }
      }
      for (const analogId of f.analogTo) {
        if (layout.pos[analogId] && layout.pos[f.id] && f.id < analogId) {
          list.push({ from: f.id, to: analogId, kind: 'analog' });
        }
      }
    }
    return list;
  }, [nodes, layout]);

  const parents = selectedFormula.derivedFrom.map(getFormulaById).filter((x): x is Formula => !!x);
  const children = selectedFormula.specialCasesTo.map(getFormulaById).filter((x): x is Formula => !!x);
  const analogs = selectedFormula.analogTo.map(getFormulaById).filter((x): x is Formula => !!x);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {CHAPTERS.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => {
              setChapterFilter(ch.id);
              const first = FORMULAS.find((f) => f.chapter === ch.id);
              if (first) setSelectedId(first.id);
            }}
            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
              chapterFilter === ch.id
                ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200 font-semibold'
                : 'border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300'
            }`}
          >
            {ch.shortTitle}
          </button>
        ))}
      </div>

      {/* Interactive Scrollable Concept Graph */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-3 sm:p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Tap any node to inspect derivations, special cases & cross-chapter analogies</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-cyan-400 inline-block" /> Derivation / Special Case
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-violet-400 inline-block" /> Analogy
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl bg-slate-50 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800">
          <svg
            width={layout.width}
            height={layout.height}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            className="block"
          >
            <defs>
              <marker id="edgeArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#22d3ee" />
              </marker>
            </defs>

            {/* Subtopic Column Headers */}
            {subtopicColumns.map((col, idx) => (
              <text
                key={col.subtopic}
                x={24 + idx * layout.colW}
                y={26}
                fill="#94a3b8"
                fontSize="11"
                fontWeight="600"
              >
                {col.subtopic.slice(0, 30)}
              </text>
            ))}

            {/* Edges */}
            {edges.map((edge, i) => {
              const p1 = layout.pos[edge.from];
              const p2 = layout.pos[edge.to];
              if (!p1 || !p2) return null;
              const isRelated =
                edge.from === selectedFormula.id || edge.to === selectedFormula.id;
              const x1 = p1.x + 105;
              const y1 = p1.y + 24;
              const x2 = p2.x + 105;
              const y2 = p2.y + 24;
              const cx = (x1 + x2) / 2;
              return (
                <path
                  key={`${edge.from}-${edge.to}-${i}`}
                  d={`M ${x1} ${y1} Q ${cx} ${(y1 + y2) / 2 - 18} ${x2} ${y2}`}
                  fill="none"
                  stroke={edge.kind === 'analog' ? '#a855f7' : '#22d3ee'}
                  strokeWidth={isRelated ? 2.2 : 1.1}
                  strokeOpacity={isRelated ? 0.95 : 0.25}
                  strokeDasharray={edge.kind === 'analog' ? '4 4' : undefined}
                  markerEnd={edge.kind === 'derive' ? 'url(#edgeArrow)' : undefined}
                />
              );
            })}

            {/* Formula Nodes */}
            {nodes.map((node) => {
              const p = layout.pos[node.id];
              if (!p) return null;
              const isSel = node.id === selectedFormula.id;
              const isKnown = knownIds.includes(node.id);
              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedId(node.id)}
                  className="cursor-pointer"
                >
                  <rect
                    x={p.x}
                    y={p.y}
                    width={210}
                    height={48}
                    rx={10}
                    fill={isSel ? '#083344' : '#0f172a'}
                    fillOpacity={isSel ? 0.95 : 0.88}
                    stroke={isSel ? '#22d3ee' : isKnown ? '#10b981' : '#334155'}
                    strokeWidth={isSel ? 2 : 1}
                  />
                  <text
                    x={p.x + 10}
                    y={p.y + 20}
                    fill={isSel ? '#67e8f9' : '#f1f5f9'}
                    fontSize="11"
                    fontWeight="600"
                  >
                    {node.title.length > 29 ? `${node.title.slice(0, 27)}…` : node.title}
                  </text>
                  <text
                    x={p.x + 10}
                    y={p.y + 36}
                    fill={isKnown ? '#6ee7b7' : '#94a3b8'}
                    fontSize="10"
                  >
                    {isKnown ? 'Known' : node.jeeWeight === 3 ? 'High Yield' : 'Core'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Node Inspector */}
      <div className="rounded-2xl border border-cyan-500/30 bg-white/90 dark:bg-slate-900/75 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs text-cyan-600 dark:text-cyan-300 font-medium">
              {selectedFormula.subtopic}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {selectedFormula.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onJumpToFormula(selectedFormula.id)}
            className="min-h-[42px] px-4 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold whitespace-nowrap shrink-0 hover:bg-cyan-400 transition-colors"
          >
            Open Full Card & Sandbox
          </button>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3 overflow-x-auto">
          <MathBlock latex={selectedFormula.latex} displayMode />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
            <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
              <ArrowLeft className="h-3.5 w-3.5 text-cyan-500" />
              <span>Derived From ({parents.length})</span>
            </div>
            {parents.length === 0 ? (
              <div className="text-slate-400">Root principle</div>
            ) : (
              parents.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setChapterFilter(p.chapter);
                    setSelectedId(p.id);
                  }}
                  className="block w-full text-left py-1 text-cyan-600 dark:text-cyan-300 hover:underline truncate"
                >
                  {p.title}
                </button>
              ))
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
            <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
              <ArrowRight className="h-3.5 w-3.5 text-violet-500" />
              <span>Special Cases ({children.length})</span>
            </div>
            {children.length === 0 ? (
              <div className="text-slate-400">Terminal result</div>
            ) : (
              children.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setChapterFilter(c.chapter);
                    setSelectedId(c.id);
                  }}
                  className="block w-full text-left py-1 text-violet-600 dark:text-violet-300 hover:underline truncate"
                >
                  {c.title}
                </button>
              ))
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
            <div className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
              <ArrowLeftRight className="h-3.5 w-3.5 text-emerald-500" />
              <span>Cross-Analogies ({analogs.length})</span>
            </div>
            {analogs.length === 0 ? (
              <div className="text-slate-400">No direct twin</div>
            ) : (
              analogs.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setChapterFilter(a.chapter);
                    setSelectedId(a.id);
                  }}
                  className="block w-full text-left py-1 text-emerald-600 dark:text-emerald-300 hover:underline truncate"
                >
                  {a.title}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Edit2, GripVertical, Plus, Trash2 } from 'lucide-react';
import { CHAPTERS } from '../data/formulas';
import { ChapterId, ChecklistItem, ChecklistStage } from '../types/physics';

interface ChecklistPageProps {
  items: ChecklistItem[];
  onToggleStage: (itemId: string, stage: ChecklistStage) => void;
  onAddItem: (title: string, chapter: ChapterId | 'custom') => void;
  onEditItem: (itemId: string, title: string) => void;
  onDeleteItem: (itemId: string) => void;
  onReorderItem: (fromIndex: number, toIndex: number) => void;
}

const STAGES: { key: ChecklistStage; label: string }[] = [
  { key: 'formulasLearnt', label: 'Formulas' },
  { key: 'graphsUnderstood', label: 'Graphs' },
  { key: 'flashcardsDone', label: 'Flashcards' },
  { key: 'pyqsSolved', label: 'PYQs' },
  { key: 'revisedX2', label: 'Rev ×2' },
];

export const ChecklistPage: React.FC<ChecklistPageProps> = ({
  items,
  onToggleStage,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onReorderItem,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newChapter, setNewChapter] = useState<ChapterId | 'custom'>('custom');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [chapterFilter, setChapterFilter] = useState<ChapterId | 'all' | 'custom'>('all');

  const overallStats = useMemo(() => {
    const total = items.length * STAGES.length;
    const done = items.reduce(
      (sum, item) => sum + STAGES.filter((s) => item.stages[s.key]).length,
      0
    );
    return {
      done,
      total,
      pct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [items]);

  const chapterBars = useMemo(() => {
    return CHAPTERS.map((ch) => {
      const chItems = items.filter((i) => i.chapter === ch.id);
      const total = chItems.length * STAGES.length;
      const done = chItems.reduce(
        (sum, item) => sum + STAGES.filter((s) => item.stages[s.key]).length,
        0
      );
      return {
        chapter: ch,
        pct: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });
  }, [items]);

  const visibleItems = items
    .map((item, globalIndex) => ({ item, globalIndex }))
    .filter(({ item }) => chapterFilter === 'all' || item.chapter === chapterFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Preparation Checklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track Formulas, Graphs, Flashcards, PYQs & 2× Revision per topic. Drag or use arrows to reorder.
          </p>
        </div>
        <div className="text-sm font-bold text-cyan-600 dark:text-cyan-300 tabular-nums">
          Overall: {overallStats.pct}% ({overallStats.done}/{overallStats.total})
        </div>
      </div>

      {/* Overall + Chapter Progress Bars */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4 space-y-3">
        <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300"
            style={{ width: `${overallStats.pct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {chapterBars.map(({ chapter, pct }) => (
            <div key={chapter.id} className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 tabular-nums">
                <span className="truncate">{chapter.shortTitle}</span>
                <span className="font-mono">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Checklist Item */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newTitle.trim()) return;
          onAddItem(newTitle, newChapter);
          setNewTitle('');
        }}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-3.5 flex flex-col sm:flex-row gap-2"
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add custom topic, PYQ set, or mock paper..."
          className="flex-1 min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-3.5 text-sm text-slate-900 dark:text-slate-100"
        />
        <select
          value={newChapter}
          onChange={(e) => setNewChapter(e.target.value as ChapterId | 'custom')}
          aria-label="Checklist item chapter"
          className="min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-3 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="custom">Custom Task</option>
          {CHAPTERS.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.shortTitle}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="min-h-[44px] px-4 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </form>

      {/* Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setChapterFilter('all')}
          className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 ${
            chapterFilter === 'all'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
          }`}
        >
          All Topics
        </button>
        <button
          type="button"
          onClick={() => setChapterFilter('custom')}
          className={`min-h-[40px] px-3.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 ${
            chapterFilter === 'custom'
              ? 'bg-cyan-500 text-slate-950 font-semibold'
              : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
          }`}
        >
          Custom
        </button>
        {CHAPTERS.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => setChapterFilter(ch.id)}
            className={`min-h-[40px] px-3.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 ${
              chapterFilter === ch.id
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'bg-slate-200/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
            }`}
          >
            {ch.shortTitle}
          </button>
        ))}
      </div>

      {/* Checklist Rows */}
      <div className="space-y-2.5">
        {visibleItems.map(({ item, globalIndex }) => {
          const chMeta = CHAPTERS.find((c) => c.id === item.chapter);
          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragIndex(globalIndex)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== globalIndex) {
                  onReorderItem(dragIndex, globalIndex);
                }
                setDragIndex(null);
              }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <GripVertical className="h-4 w-4 text-slate-400 shrink-0 cursor-grab" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-cyan-600 dark:text-cyan-300 font-medium">
                      {chMeta ? chMeta.shortTitle : 'Custom'}
                    </div>
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="flex-1 min-h-[36px] rounded-lg bg-slate-100 dark:bg-slate-950 border border-cyan-400 px-2.5 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onEditItem(item.id, editingText);
                            setEditingId(null);
                          }}
                          className="min-h-[36px] px-3 rounded-lg bg-cyan-500 text-slate-950 text-xs font-semibold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onReorderItem(globalIndex, globalIndex - 1)}
                    aria-label="Move item up"
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onReorderItem(globalIndex, globalIndex + 1)}
                    aria-label="Move item down"
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingText(item.title);
                    }}
                    aria-label="Edit checklist item"
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-400"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    aria-label="Delete checklist item"
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* 5 Stage Toggles */}
              <div className="grid grid-cols-5 gap-1.5">
                {STAGES.map((st) => {
                  const active = item.stages[st.key];
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => onToggleStage(item.id, st.key)}
                      className={`min-h-[40px] px-1.5 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1 border transition-colors ${
                        active
                          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {active && <Check className="h-3 w-3 shrink-0" />}
                      <span className="truncate">{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

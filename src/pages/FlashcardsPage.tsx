import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Flame, RotateCcw, Shuffle, X } from 'lucide-react';
import { CHAPTERS, FORMULAS } from '../data/formulas';
import { ChapterId, FlashcardProgress } from '../types/physics';
import { MathBlock } from '../components/MathBlock';

interface FlashcardsPageProps {
  flashcards: Record<string, FlashcardProgress>;
  todayReviewCount: number;
  onReviewCard: (formulaId: string, known: boolean) => void;
}

type DeckMode = 'due' | 'all' | 'hard';

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({
  flashcards,
  todayReviewCount,
  onReviewCard,
}) => {
  const [chapterFilter, setChapterFilter] = useState<ChapterId | 'all'>('all');
  const [deckMode, setDeckMode] = useState<DeckMode>('due');
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);

  const now = Date.now();

  const deck = useMemo(() => {
    const base = FORMULAS.filter((f) => {
      if (chapterFilter !== 'all' && f.chapter !== chapterFilter) return false;
      const prog = flashcards[f.id];
      if (deckMode === 'hard') {
        return prog && (prog.wrongCount > 0 || prog.box === 1);
      }
      if (deckMode === 'due') {
        return !prog || prog.nextReviewAt <= now;
      }
      return true;
    });

    if (shuffleSeed === 0) return base;
    const copy = [...base];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = (i * 31 + shuffleSeed * 17) % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [chapterFilter, deckMode, flashcards, shuffleSeed, now]);

  const safeIndex = deck.length > 0 ? cardIndex % deck.length : 0;
  const currentFormula = deck[safeIndex];
  const currentProgress = currentFormula ? flashcards[currentFormula.id] : undefined;

  // Leitner 5-box counts
  const boxCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const f of FORMULAS) {
      const box = flashcards[f.id]?.box ?? 1;
      counts[box - 1] += 1;
    }
    return counts;
  }, [flashcards]);

  const handleGrade = (known: boolean) => {
    if (!currentFormula) return;
    onReviewCard(currentFormula.id, known);
    setFlipped(false);
    setCardIndex((prev) => prev + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Leitner Spaced-Repetition Flashcards
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tap card to flip · Swipe right = Known (advance box) · Swipe left = Revise (reset to Box 1).
          </p>
        </div>
        <div className="text-xs font-medium text-cyan-600 dark:text-cyan-300 tabular-nums">
          Reviewed today: <strong>{todayReviewCount}</strong> cards
        </div>
      </div>

      {/* Leitner 5-Box Distribution Strip */}
      <div className="grid grid-cols-5 gap-2">
        {boxCounts.map((cnt, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/65 p-2.5 text-center"
          >
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Box {idx + 1}</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">{cnt}</div>
          </div>
        ))}
      </div>

      {/* Deck Mode + Chapter Filter + Shuffle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'due', label: 'Due Now' },
              { id: 'hard', label: 'Hard Cards' },
              { id: 'all', label: 'All Cards' },
            ] as { id: DeckMode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setDeckMode(m.id);
                setCardIndex(0);
                setFlipped(false);
              }}
              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors ${
                deckMode === m.id
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                  : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300'
              }`}
            >
              {m.id === 'hard' && <Flame className="h-3.5 w-3.5 text-rose-500" />}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={chapterFilter}
            onChange={(e) => {
              setChapterFilter(e.target.value as ChapterId | 'all');
              setCardIndex(0);
              setFlipped(false);
            }}
            aria-label="Filter flashcards by chapter"
            className="min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Chapters ({FORMULAS.length})</option>
            {CHAPTERS.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.shortTitle}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setShuffleSeed((s) => s + 1);
              setCardIndex(0);
              setFlipped(false);
            }}
            className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 text-xs font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"
          >
            <Shuffle className="h-3.5 w-3.5" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Flashcard Stage */}
      {!currentFormula ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-10 text-center space-y-3">
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            All due cards reviewed in this deck
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch to &ldquo;All Cards&rdquo; to practice any chapter freely.
          </p>
          <button
            type="button"
            onClick={() => setDeckMode('all')}
            className="min-h-[44px] px-5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold"
          >
            Practice All Cards
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span>
              Card {safeIndex + 1} of {deck.length} · Box {currentProgress?.box ?? 1}
            </span>
            <span>{currentFormula.subtopic}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentFormula.id}-${safeIndex}`}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.45}
              onDragEnd={(_, info) => {
                if (info.offset.x > 95) handleGrade(true);
                else if (info.offset.x < -95) handleGrade(false);
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              onClick={() => setFlipped((f) => !f)}
              className="cursor-pointer select-none rounded-3xl border border-cyan-500/30 bg-white/95 dark:bg-slate-900/85 p-6 sm:p-8 min-h-[280px] flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{flipped ? 'Formula & Conditions' : 'Situation / Prompt'}</span>
                <span className="text-cyan-600 dark:text-cyan-300 font-medium">
                  {flipped ? 'Tap to hide' : 'Tap to reveal'}
                </span>
              </div>

              {!flipped ? (
                <div className="my-auto py-6 text-center space-y-2">
                  <div className="text-xs font-medium text-violet-600 dark:text-violet-300">
                    {currentFormula.title}
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                    {currentFormula.flashcard.front}
                  </p>
                </div>
              ) : (
                <div className="my-auto py-4 space-y-3">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3.5 overflow-x-auto text-slate-900 dark:text-cyan-50">
                    <MathBlock latex={currentFormula.latex} displayMode />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {currentFormula.flashcard.back}
                  </p>
                  {currentFormula.conditions.length > 0 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {currentFormula.conditions[0]}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/70 dark:border-slate-800/70">
                <span>← Swipe left: Revise</span>
                <span>Swipe right: Known →</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Accessible Action Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleGrade(false)}
              className="min-h-[48px] rounded-2xl border border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-rose-500/20 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Revise</span>
            </button>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="min-h-[48px] rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Flip</span>
            </button>
            <button
              type="button"
              onClick={() => handleGrade(true)}
              className="min-h-[48px] rounded-2xl bg-emerald-500 text-slate-950 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>Known</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

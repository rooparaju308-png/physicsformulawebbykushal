import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Flame,
  RotateCcw,
  ShieldAlert,
  Timer,
  XCircle,
} from 'lucide-react';
import { CHAPTERS } from '../data/formulas';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/quizQuestions';
import { ChapterId } from '../types/physics';

interface QuizPageProps {
  onJumpToFormula: (formulaId: string) => void;
  onReviewCard: (formulaId: string, known: boolean) => void;
}

type SprintFilter = 'all' | 'trap' | 'limiting' | 'numerical' | 'concept' | ChapterId;

function shuffleList<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  onJumpToFormula,
  onReviewCard,
}) => {
  const [filter, setFilter] = useState<SprintFilter>('all');
  const [sprintLength, setSprintLength] = useState<5 | 10 | 15>(10);
  const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [results, setResults] = useState<{ q: QuizQuestion; chosen: number; correct: boolean }[]>([]);
  const [startMs, setStartMs] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);

  const matchingCount = useMemo(() => {
    return QUIZ_QUESTIONS.filter((q) => {
      if (filter === 'all') return true;
      if (filter === 'trap' || filter === 'limiting' || filter === 'numerical' || filter === 'concept') {
        return q.category === filter;
      }
      return q.chapter === filter;
    }).length;
  }, [filter]);

  const startSprint = () => {
    const pool = QUIZ_QUESTIONS.filter((q) => {
      if (filter === 'all') return true;
      if (filter === 'trap' || filter === 'limiting' || filter === 'numerical' || filter === 'concept') {
        return q.category === filter;
      }
      return q.chapter === filter;
    });
    const picked = shuffleList(pool).slice(0, Math.min(sprintLength, pool.length));
    setDeck(picked);
    setIndex(0);
    setSelectedOption(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setResults([]);
    setStartMs(Date.now());
    setElapsedSec(0);
    setStarted(true);
  };

  const currentQ = deck[index];
  const isFinished = started && deck.length > 0 && index >= deck.length;

  const handleChoose = (optIdx: number) => {
    if (!currentQ || selectedOption !== null) return;
    setSelectedOption(optIdx);
    const isCorrect = optIdx === currentQ.correctIndex;
    onReviewCard(currentQ.formulaId, isCorrect);
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
    setResults((prev) => [...prev, { q: currentQ, chosen: optIdx, correct: isCorrect }]);
  };

  const handleNext = () => {
    if (index + 1 >= deck.length) {
      setElapsedSec(Math.max(1, Math.round((Date.now() - startMs) / 1000)));
    }
    setIndex((i) => i + 1);
    setSelectedOption(null);
  };

  if (!started) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Rapid-Fire Formula Sprint
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Test sign conventions, limiting cases, and numerical speed—missed questions sync directly to Leitner Box 1.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-5 space-y-5">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              1. Focus Mode or Chapter
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: 'All Mixed' },
                  { id: 'trap', label: 'Traps & Sign Conventions' },
                  { id: 'limiting', label: 'Limiting Cases' },
                  { id: 'numerical', label: 'Quick Numericals' },
                  { id: 'concept', label: 'Core Concepts' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setFilter(m.id)}
                  className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ${
                    filter === m.id
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
              {CHAPTERS.filter((c) =>
                QUIZ_QUESTIONS.some((q) => q.chapter === c.id)
              ).map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setFilter(ch.id)}
                  className={`min-h-[40px] px-3.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap ${
                    filter === ch.id
                      ? 'border-violet-400 bg-violet-500/15 text-violet-700 dark:text-violet-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {ch.shortTitle}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              2. Sprint Length ({matchingCount} questions available in pool)
            </div>
            <div className="flex items-center gap-2">
              {([5, 10, 15] as const).map((len) => (
                <button
                  key={len}
                  type="button"
                  onClick={() => setSprintLength(len)}
                  className={`min-h-[42px] px-4 rounded-xl text-xs font-semibold border tabular-nums transition-colors ${
                    sprintLength === len
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {len} Questions
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={matchingCount === 0}
            onClick={startSprint}
            className="min-h-[48px] px-6 rounded-xl bg-cyan-500 text-slate-950 text-sm font-bold inline-flex items-center gap-2 hover:bg-cyan-400 disabled:opacity-40 transition-colors"
          >
            <span>Start Sprint ({Math.min(sprintLength, matchingCount)} Qs)</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const pct = Math.round((score / Math.max(1, deck.length)) * 100);
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-cyan-500/30 bg-white/90 dark:bg-slate-900/75 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
                <Award className="h-4 w-4" />
                <span>Sprint Complete</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {score} / {deck.length} ({pct}%)
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs tabular-nums">
              <div className="text-right">
                <div className="text-slate-500 dark:text-slate-400">Best Streak</div>
                <div className="font-bold text-amber-500">{bestStreak}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-500 dark:text-slate-400">Time</div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{elapsedSec}s</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startSprint}
              className="min-h-[44px] px-4 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Run Another Sprint</span>
            </button>
            <button
              type="button"
              onClick={() => setStarted(false)}
              className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              Change Filter
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {results.map((r, i) => (
            <div
              key={r.q.id}
              className={`rounded-2xl border p-4 space-y-2 ${
                r.correct
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-rose-500/30 bg-rose-500/5'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {i + 1}. {r.q.prompt}
                </div>
                {r.correct ? (
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                )}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <strong>Answer:</strong> {r.q.options[r.q.correctIndex]} — {r.q.explanation}
              </div>
              <button
                type="button"
                onClick={() => onJumpToFormula(r.q.formulaId)}
                className="text-xs font-medium text-cyan-600 dark:text-cyan-300 hover:underline"
              >
                Inspect Linked Formula Card →
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          Question {index + 1} / {deck.length}
        </span>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
            <Flame className="h-4 w-4" />
            Streak: {streak}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300 font-semibold">
            <Timer className="h-4 w-4" />
            Score: {score}
          </span>
          <button
            type="button"
            onClick={() => setStarted(false)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Quit
          </button>
        </div>
      </div>

      {currentQ && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-medium text-cyan-600 dark:text-cyan-300">
              {currentQ.category === 'trap' && <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />}
              {currentQ.category === 'trap'
                ? 'Trap & Sign Convention'
                : currentQ.category === 'limiting'
                ? 'Limiting Case'
                : currentQ.category === 'numerical'
                ? 'Quick Numerical'
                : 'Core Concept'}
            </span>
            <span>{currentQ.chapter}</span>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            {currentQ.prompt}
          </h3>

          <div className="space-y-2">
            {currentQ.options.map((opt, oi) => {
              const answered = selectedOption !== null;
              const isChosen = selectedOption === oi;
              const isRight = oi === currentQ.correctIndex;
              let cls =
                'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 hover:border-cyan-400';
              if (answered) {
                if (isRight) {
                  cls =
                    'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-semibold';
                } else if (isChosen) {
                  cls =
                    'border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200';
                } else {
                  cls =
                    'border-slate-200/60 dark:border-slate-800/60 opacity-55 text-slate-500';
                }
              }

              return (
                <button
                  key={oi}
                  type="button"
                  disabled={answered}
                  onClick={() => handleChoose(oi)}
                  className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl border text-left text-xs sm:text-sm transition-colors flex items-center justify-between gap-2 ${cls}`}
                >
                  <span>
                    <span className="font-mono mr-2 text-slate-400">
                      {String.fromCharCode(65 + oi)}.
                    </span>
                    {opt}
                  </span>
                  {answered && isRight && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                  {answered && isChosen && !isRight && <XCircle className="h-4 w-4 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-3.5 space-y-2.5">
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <strong>Explanation:</strong> {currentQ.explanation}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onJumpToFormula(currentQ.formulaId)}
                  className="min-h-[40px] px-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-xs font-medium text-cyan-700 dark:text-cyan-300"
                >
                  Inspect Linked Formula
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-[42px] px-5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <span>{index + 1 >= deck.length ? 'Finish Sprint' : 'Next Question'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

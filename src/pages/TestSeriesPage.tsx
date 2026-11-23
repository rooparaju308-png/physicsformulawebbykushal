import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, ChevronRight, Clock, FileText, HelpCircle, RotateCcw, Sparkles, Trophy, XCircle, Zap } from 'lucide-react';
import { JEE_TEST_PAPERS, TestPaper, TestQuestion } from '../data/mockTests';

interface TestSeriesPageProps {
  onJumpToFormula: (formulaId: string) => void;
}

export const TestSeriesPage: React.FC<TestSeriesPageProps> = ({ onJumpToFormula }) => {
  const [selectedPaper, setSelectedPaper] = useState<TestPaper | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  // Timer effect during test
  useEffect(() => {
    if (!testStarted || isTestSubmitted || !selectedPaper) return;
    const id = setInterval(() => {
      setTimeLeftSec((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsTestSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [testStarted, isTestSubmitted, selectedPaper]);

  const handleStartTest = (paper: TestPaper) => {
    setSelectedPaper(paper);
    setTimeLeftSec(paper.durationMinutes * 60);
    setUserAnswers({});
    setMarkedForReview({});
    setCurrentQIndex(0);
    setIsTestSubmitted(false);
    setTestStarted(true);
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isTestSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleToggleMarkReview = (qIdx: number) => {
    setMarkedForReview((prev) => ({ ...prev, [qIdx]: !prev[qIdx] }));
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Score calculation
  const calculateResults = () => {
    if (!selectedPaper) return { correct: 0, incorrect: 0, unattempted: 0, score: 0, maxScore: 0 };
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    selectedPaper.questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      if (ans === undefined) {
        unattempted++;
      } else if (ans === q.correctAnswerIndex) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const score = correct * 4 - incorrect * 1;
    const maxScore = selectedPaper.questions.length * 4;
    return { correct, incorrect, unattempted, score, maxScore };
  };

  const results = selectedPaper ? calculateResults() : { correct: 0, incorrect: 0, unattempted: 0, score: 0, maxScore: 0 };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            JEE Mock Test Series Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pre-loaded NTA pattern mock papers with real-time exam timer, +4/-1 marking &amp; detailed solutions. No upload required!
          </p>
        </div>
        {testStarted && !isTestSubmitted && (
          <div className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 rounded-2xl">
            <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-300 animate-pulse" />
            <span className="font-mono text-sm font-bold text-cyan-700 dark:text-cyan-200 tabular-nums">
              Time Left: {formatTimer(timeLeftSec)}
            </span>
          </div>
        )}
      </div>

      {!testStarted ? (
        /* Test Paper Catalog */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JEE_TEST_PAPERS.map((paper) => (
            <div
              key={paper.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-4 hover:border-cyan-400/60 transition-colors shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                    NTA Pattern
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {paper.durationMinutes} mins
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{paper.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{paper.subtitle}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {paper.totalQuestions} Questions · {paper.totalQuestions * 4} Marks
                </span>
                <button
                  type="button"
                  onClick={() => handleStartTest(paper)}
                  className="min-h-[40px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Start Test</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : isTestSubmitted ? (
        /* Test Scorecard & Solutions Review */
        <div className="space-y-6">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/50 p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Test Completed</span>
                <h3 className="text-xl sm:text-2xl font-bold mt-0.5">{selectedPaper?.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setTestStarted(false)}
                className="min-h-[40px] px-4 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors"
              >
                Back to Test Catalog
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-2xl bg-white/10 p-3 text-center">
                <div className="text-2xl font-bold font-mono text-cyan-300">
                  {results.score} <span className="text-xs text-slate-300">/ {results.maxScore}</span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">Final Score (+4/-1)</div>
              </div>
              <div className="rounded-2xl bg-emerald-500/20 border border-emerald-500/30 p-3 text-center">
                <div className="text-2xl font-bold font-mono text-emerald-300">{results.correct}</div>
                <div className="text-xs text-emerald-200 mt-0.5">Correct (+{results.correct * 4})</div>
              </div>
              <div className="rounded-2xl bg-rose-500/20 border border-rose-500/30 p-3 text-center">
                <div className="text-2xl font-bold font-mono text-rose-300">{results.incorrect}</div>
                <div className="text-xs text-rose-200 mt-0.5">Incorrect (-{results.incorrect})</div>
              </div>
              <div className="rounded-2xl bg-amber-500/20 border border-amber-500/30 p-3 text-center">
                <div className="text-2xl font-bold font-mono text-amber-300">{results.unattempted}</div>
                <div className="text-xs text-amber-200 mt-0.5">Unattempted</div>
              </div>
            </div>
          </div>

          {/* Detailed Solutions Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Detailed Question Solutions &amp; Explanations
            </h3>
            {selectedPaper?.questions.map((q, qIdx) => {
              const userAns = userAnswers[qIdx];
              const isCorrect = userAns === q.correctAnswerIndex;
              const isUnattempted = userAns === undefined;
              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-5 space-y-3 ${
                    isCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : isUnattempted
                        ? 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900'
                        : 'border-rose-500/40 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Question {qIdx + 1} · {q.chapter} ({q.difficulty})
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : isUnattempted
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : isUnattempted ? null : <XCircle className="h-3.5 w-3.5" />}
                      <span>{isCorrect ? 'Correct (+4)' : isUnattempted ? 'Unattempted (0)' : 'Incorrect (-1)'}</span>
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{q.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = userAns === optIdx;
                      const isRightChoice = q.correctAnswerIndex === optIdx;
                      return (
                        <div
                          key={opt}
                          className={`p-3 rounded-xl text-xs font-medium border flex items-center justify-between ${
                            isRightChoice
                              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-bold'
                              : isUserChoice
                                ? 'border-rose-500 bg-rose-500/15 text-rose-900 dark:text-rose-200'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>
                            ({String.fromCharCode(65 + optIdx)}) {opt}
                          </span>
                          {isRightChoice && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 ml-2" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">Explanation:</span>
                    <p className="text-slate-600 dark:text-slate-300">{q.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active Test Taking Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Question Card */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                Question {currentQIndex + 1} of {selectedPaper?.questions.length}
              </span>
              <button
                type="button"
                onClick={() => handleToggleMarkReview(currentQIndex)}
                className={`min-h-[36px] px-3 rounded-xl text-xs font-medium border transition-colors ${
                  markedForReview[currentQIndex]
                    ? 'border-amber-400 bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                {markedForReview[currentQIndex] ? '★ Marked for Review' : '☆ Mark for Review'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedPaper?.questions[currentQIndex].question}
              </h3>

              <div className="space-y-2.5 pt-2">
                {selectedPaper?.questions[currentQIndex].options.map((opt, optIdx) => {
                  const selected = userAnswers[currentQIndex] === optIdx;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectOption(currentQIndex, optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold flex items-center justify-between transition-colors ${
                        selected
                          ? 'border-cyan-500 bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          selected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        selected ? 'border-cyan-500 bg-cyan-500 text-slate-950' : 'border-slate-400'
                      }`}>
                        {selected && <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
                className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold disabled:opacity-40"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-2">
                {userAnswers[currentQIndex] !== undefined && (
                  <button
                    type="button"
                    onClick={() => {
                      const copy = { ...userAnswers };
                      delete copy[currentQIndex];
                      setUserAnswers(copy);
                    }}
                    className="min-h-[44px] px-3 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10"
                  >
                    Clear Response
                  </button>
                )}

                {currentQIndex < (selectedPaper?.questions.length ?? 1) - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQIndex((i) => i + 1)}
                    className="min-h-[44px] px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to submit your test?')) {
                        setIsTestSubmitted(true);
                      }
                    }}
                    className="min-h-[44px] px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    Submit Test ✓
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Question Palette</h4>
            <div className="grid grid-cols-5 gap-2">
              {selectedPaper?.questions.map((_, idx) => {
                const attempted = userAnswers[idx] !== undefined;
                const marked = markedForReview[idx];
                const active = currentQIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQIndex(idx)}
                    className={`min-h-[40px] rounded-xl text-xs font-bold font-mono transition-all relative ${
                      active
                        ? 'ring-2 ring-cyan-400 ring-offset-2 dark:ring-offset-slate-900'
                        : ''
                    } ${
                      attempted
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {idx + 1}
                    {marked && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-emerald-500/30 border border-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-md bg-slate-200 dark:bg-slate-800" />
                <span>Unattempted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span>Marked for Review</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to submit your test?')) {
                  setIsTestSubmitted(true);
                }
              }}
              className="w-full min-h-[44px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs mt-2"
            >
              Submit Test Paper
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

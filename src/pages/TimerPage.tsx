import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Flame,
  Lock,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Save,
  Sparkles,
  Trophy,
  Unlock,
  Zap,
} from 'lucide-react';
import { AppSettings, ChapterId, StudySession } from '../types/physics';
import { CHAPTERS } from '../data/formulas';
import {
  calculateSessionXp,
  computeTotalFocusXp,
  getAspirantLevel,
  getSessionXp,
  getStreakMultiplier,
} from '../utils/xp';

import { LoFiRadio } from '../components/LoFiRadio';

interface TimerPageProps {
  settings: AppSettings;
  sessions: StudySession[];
  streakDays?: number;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onAddSession: (session: Omit<StudySession, 'id'>) => void;
  onOpenSharedRooms?: () => void;
}

function playBeepChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, now + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.16, now + i * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.38);
    });
  } catch {
    // Ignore audio context restriction
  }
}

export const TimerPage: React.FC<TimerPageProps> = ({
  settings,
  sessions,
  streakDays = 1,
  onUpdateSettings,
  onAddSession,
  onOpenSharedRooms,
}) => {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [pomoPhase, setPomoPhase] = useState<'work' | 'break'>('work');
  const [chapterTag, setChapterTag] = useState<ChapterId | 'general'>('electrostatics');
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(settings.pomodoroWorkMin * 60);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [wakeLockSupported] = useState(
    () => typeof navigator !== 'undefined' && 'wakeLock' in navigator
  );
  const [xpToast, setXpToast] = useState<{
    earned: number;
    base: number;
    bonus: number;
    mult: number;
  } | null>(null);
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const totalFocusXp = useMemo(() => computeTotalFocusXp(sessions), [sessions]);
  const levelInfo = useMemo(() => getAspirantLevel(totalFocusXp), [totalFocusXp]);
  const streakMultiplier = useMemo(() => getStreakMultiplier(streakDays), [streakDays]);

  const projectedXp = useMemo(() => {
    if (mode === 'pomodoro') {
      return calculateSessionXp({
        mode: 'pomodoro',
        durationSeconds: settings.pomodoroWorkMin * 60,
        streakDays,
      });
    }
    return calculateSessionXp({
      mode: 'stopwatch',
      durationSeconds: Math.max(60, elapsedSec),
      streakDays,
    });
  }, [mode, settings.pomodoroWorkMin, elapsedSec, streakDays]);

  const showRewardBanner = (
    sesMode: 'pomodoro' | 'stopwatch',
    durationSeconds: number
  ) => {
    const calc = calculateSessionXp({
      mode: sesMode,
      durationSeconds,
      streakDays,
    });
    setXpToast({
      earned: calc.totalXp,
      base: calc.baseFocusXp,
      bonus: calc.pomodoroBonus,
      mult: calc.streakMultiplier,
    });
    window.setTimeout(() => setXpToast(null), 6000);
  };

  // Sync preset duration when idle
  useEffect(() => {
    if (!running && mode === 'pomodoro') {
      setSecondsLeft(
        (pomoPhase === 'work' ? settings.pomodoroWorkMin : settings.pomodoroBreakMin) * 60
      );
    }
  }, [settings.pomodoroWorkMin, settings.pomodoroBreakMin, pomoPhase, mode, running]);

  // Timer ticker
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (mode === 'pomodoro') {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setRunning(false);
            playBeepChime();
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
            if (pomoPhase === 'work') {
              const workSec = settings.pomodoroWorkMin * 60;
              const calc = calculateSessionXp({
                mode: 'pomodoro',
                durationSeconds: workSec,
                streakDays,
              });
              onAddSession({
                mode: 'pomodoro',
                chapter: chapterTag,
                durationSeconds: workSec,
                completedAt: Date.now(),
                xpEarned: calc.totalXp,
              });
              showRewardBanner('pomodoro', workSec);
              setPomoPhase('break');
              return settings.pomodoroBreakMin * 60;
            } else {
              setPomoPhase('work');
              return settings.pomodoroWorkMin * 60;
            }
          }
          return prev - 1;
        });
      } else {
        setElapsedSec((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [
    running,
    mode,
    pomoPhase,
    chapterTag,
    settings.pomodoroWorkMin,
    settings.pomodoroBreakMin,
    streakDays,
    onAddSession,
  ]);

  // Wake Lock API management
  const toggleWakeLock = async () => {
    if (!wakeLockSupported) return;
    if (wakeLockActive && wakeLockRef.current) {
      await wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
      setWakeLockActive(false);
      return;
    }
    try {
      const nav = navigator as unknown as {
        wakeLock: {
          request: (t: 'screen') => Promise<{ release: () => Promise<void> }>;
        };
      };
      const sentinel = await nav.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      setWakeLockActive(true);
    } catch {
      setWakeLockActive(false);
    }
  };

  useEffect(() => {
    return () => {
      if (wakeLockRef.current) wakeLockRef.current.release().catch(() => {});
    };
  }, []);

  const displaySec = mode === 'pomodoro' ? secondsLeft : elapsedSec;
  const mins = String(Math.floor(displaySec / 60)).padStart(2, '0');
  const secs = String(displaySec % 60).padStart(2, '0');

  // Last 7 days bar chart data
  const weeklyBars = useMemo(() => {
    const days: { label: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const totalSec = sessions
        .filter((s) => {
          const sd = new Date(s.completedAt);
          const sk = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}-${String(sd.getDate()).padStart(2, '0')}`;
          return sk === key;
        })
        .reduce((a, b) => a + b.durationSeconds, 0);
      days.push({ label, minutes: Math.round(totalSec / 60) });
    }
    return days;
  }, [sessions]);

  const maxBarMin = Math.max(30, ...weeklyBars.map((b) => b.minutes));
  const totalWeekMin = weeklyBars.reduce((a, b) => a + b.minutes, 0);
  const todayMin = weeklyBars[weeklyBars.length - 1]?.minutes ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Focus Study Timer
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pomodoro &amp; Stopwatch awarding 10 XP/min +50 XP Pomodoro completion bonus × streak multiplier.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs text-cyan-600 dark:text-cyan-300 tabular-nums">
            Today: <strong>{todayMin}m</strong> · 7-Day: <strong>{totalWeekMin}m</strong>
          </div>
          {onOpenSharedRooms && (
            <button
              type="button"
              onClick={onOpenSharedRooms}
              className="min-h-[38px] px-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Study Together (Live Rooms) →</span>
            </button>
          )}
        </div>
      </div>

      {/* Focus XP & Aspirant Level Progress Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-amber-600 dark:text-amber-300 tabular-nums">
                  Level {levelInfo.level}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {levelInfo.title}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                <span>
                  <strong className="text-slate-900 dark:text-slate-100 text-sm">
                    {totalFocusXp.toLocaleString()}
                  </strong>{' '}
                  Total Focus XP
                </span>
                <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-300 font-semibold">
                  <Flame className="h-3.5 w-3.5" />
                  {streakDays}d Streak ({streakMultiplier.toFixed(1)}× XP)
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-72 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] tabular-nums">
              <span className="text-slate-500 dark:text-slate-400">
                Next Rank (Lv {levelInfo.level + 1})
              </span>
              <span className="font-semibold text-cyan-600 dark:text-cyan-300">
                {levelInfo.xpToNext.toLocaleString()} XP left
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-violet-500 transition-all duration-300"
                style={{ width: `${levelInfo.progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Post-session XP reward banner */}
      {xpToast && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300 tabular-nums">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Session Logged: +{xpToast.earned} XP earned!</span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 tabular-nums">
            Base {xpToast.base} XP
            {xpToast.bonus > 0 ? ` + ${xpToast.bonus} Pomodoro Bonus` : ''} ×{' '}
            {xpToast.mult.toFixed(1)} Streak
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Timer Clock Face */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-6 flex flex-col items-center justify-between space-y-5">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              {(['pomodoro', 'stopwatch'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setRunning(false);
                    setMode(m);
                  }}
                  className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    mode === m
                      ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {wakeLockSupported && (
              <button
                type="button"
                onClick={toggleWakeLock}
                className={`min-h-[38px] px-3 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 border transition-colors ${
                  wakeLockActive
                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {wakeLockActive ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <Unlock className="h-3.5 w-3.5" />
                )}
                <span>{wakeLockActive ? 'Screen Awake' : 'Keep Awake'}</span>
              </button>
            )}
          </div>

          <div className="text-center py-3 space-y-2">
            {mode === 'pomodoro' && (
              <div className="text-xs font-semibold text-violet-600 dark:text-violet-300 uppercase tracking-wider">
                {pomoPhase === 'work' ? 'Focus Session' : 'Short Break'}
              </div>
            )}
            <div className="font-mono text-6xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-cyan-100 tabular-nums">
              {mins}:{secs}
            </div>
            {(mode === 'stopwatch' || pomoPhase === 'work') && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-300 tabular-nums">
                <Zap className="h-3.5 w-3.5" />
                <span>
                  {mode === 'pomodoro'
                    ? `On completion: +${projectedXp.totalXp} XP (${settings.pomodoroWorkMin}m × 10 + 50 bonus × ${streakMultiplier.toFixed(1)})`
                    : elapsedSec >= 10
                      ? `Log now for +${calculateSessionXp({ mode: 'stopwatch', durationSeconds: elapsedSec, streakDays }).totalXp} XP`
                      : `Rate: ${Math.round(10 * streakMultiplier)} XP/min`}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="w-full space-y-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                className="flex-1 min-h-[48px] rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{running ? 'Pause' : 'Start'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRunning(false);
                  if (mode === 'pomodoro') {
                    setSecondsLeft(
                      (pomoPhase === 'work'
                        ? settings.pomodoroWorkMin
                        : settings.pomodoroBreakMin) * 60
                    );
                  } else {
                    setElapsedSec(0);
                  }
                }}
                aria-label="Reset timer"
                className="min-h-[48px] min-w-[48px] rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 inline-flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {mode === 'stopwatch' && elapsedSec >= 10 && (
                <button
                  type="button"
                  onClick={() => {
                    const calc = calculateSessionXp({
                      mode: 'stopwatch',
                      durationSeconds: elapsedSec,
                      streakDays,
                    });
                    onAddSession({
                      mode: 'stopwatch',
                      chapter: chapterTag,
                      durationSeconds: elapsedSec,
                      completedAt: Date.now(),
                      xpEarned: calc.totalXp,
                    });
                    showRewardBanner('stopwatch', elapsedSec);
                    setRunning(false);
                    setElapsedSec(0);
                  }}
                  className="min-h-[48px] px-4 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Log XP</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">
                  Chapter Tag
                </label>
                <select
                  value={chapterTag}
                  onChange={(e) => setChapterTag(e.target.value as ChapterId | 'general')}
                  className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-2.5 text-slate-800 dark:text-slate-200"
                >
                  <option value="general">General Physics</option>
                  {CHAPTERS.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.shortTitle}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">
                  Work (min)
                </label>
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={settings.pomodoroWorkMin}
                  onChange={(e) =>
                    onUpdateSettings({
                      pomodoroWorkMin: Math.max(5, Number(e.target.value)),
                    })
                  }
                  className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-2.5 text-slate-800 dark:text-slate-200 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">
                  Break (min)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={settings.pomodoroBreakMin}
                  onChange={(e) =>
                    onUpdateSettings({
                      pomodoroBreakMin: Math.max(1, Number(e.target.value)),
                    })
                  }
                  className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-2.5 text-slate-800 dark:text-slate-200 tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Bar Chart + Session History */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              7-Day Study Minutes
            </h3>
            <svg viewBox="0 0 320 130" className="w-full max-h-[150px]">
              {weeklyBars.map((bar, idx) => {
                const barH = (bar.minutes / maxBarMin) * 85;
                const x = 18 + idx * 43;
                const y = 102 - barH;
                return (
                  <g key={bar.label + idx}>
                    <rect
                      x={x}
                      y={y}
                      width="26"
                      height={Math.max(3, barH)}
                      rx="6"
                      fill={idx === 6 ? '#22d3ee' : '#6366f1'}
                      opacity={idx === 6 ? 0.95 : 0.65}
                    />
                    <text x={x + 13} y={y - 5} textAnchor="middle" fill="#94a3b8" fontSize="9">
                      {bar.minutes}m
                    </text>
                    <text x={x + 13} y="120" textAnchor="middle" fill="#94a3b8" fontSize="9.5">
                      {bar.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Recent Sessions &amp; XP Earned
            </h4>
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete a Pomodoro or log a Stopwatch session to earn Focus XP and rank up.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 text-xs">
                {sessions.slice(0, 10).map((ses) => {
                  const ch = CHAPTERS.find((c) => c.id === ses.chapter);
                  const xp = getSessionXp(ses);
                  return (
                    <div
                      key={ses.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-slate-100 dark:bg-slate-950/60 px-3 py-2"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {ch ? ch.shortTitle : 'General'} · {ses.mode}
                      </span>
                      <div className="flex items-center gap-3 shrink-0 tabular-nums font-mono">
                        <span className="font-semibold text-amber-600 dark:text-amber-300">
                          +{xp} XP
                        </span>
                        <span className="text-cyan-600 dark:text-cyan-300">
                          {Math.floor(ses.durationSeconds / 60)}m {ses.durationSeconds % 60}s
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <LoFiRadio />
    </div>
  );
};

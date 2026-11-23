import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookMarked,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Edit3,
  Flame,
  FlaskConical,
  HelpCircle,
  Layers,
  Network,
  Plus,
  Sparkles,
  Trash2,
  User,
  Users,
  Zap,
} from 'lucide-react';
import {
  AppSettings,
  AppTab,
  ChecklistItem,
  DailyGoalTask,
  PublicProfile,
  StudySession,
} from '../types/physics';
import { CONSTANTS, FORMULAS, getFormulaById } from '../data/formulas';
import { MathBlock } from '../components/MathBlock';
import { ConfettiBurst, ConfettiTrigger } from '../components/ConfettiBurst';
import { ProfileProgressModal } from '../components/ProfileProgressModal';
import { useFirebase } from '../contexts/FirebaseContext';
import { getAspirantLevel } from '../utils/xp';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface HomePageProps {
  settings: AppSettings;
  knownIds: string[];
  bookmarkedIds: string[];
  checklist: ChecklistItem[];
  sessions: StudySession[];
  streakDays: number;
  todayReviewCount: number;
  todayStudySeconds: number;
  totalFocusXp?: number;
  lastVisitedFormulaId: string;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onNavigate: (tab: AppTab) => void;
  onJumpToFormula: (formulaId: string) => void;
}

const GOAL_MINUTE_PRESETS = [30, 45, 60, 90, 120] as const;

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  knownIds,
  bookmarkedIds,
  checklist,
  sessions,
  streakDays,
  todayReviewCount,
  todayStudySeconds,
  totalFocusXp = 0,
  lastVisitedFormulaId,
  onUpdateSettings,
  onNavigate,
  onJumpToFormula,
}) => {
  const { profile } = useFirebase();

  const [nowMs, setNowMs] = useState(Date.now());
  const [editingDate, setEditingDate] = useState(!settings.examDateConfigured);
  const [draftDate, setDraftDate] = useState(settings.examDate);

  // Top-bar Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Customizable Today's Goal & Tasks state
  const [editingCardGoal, setEditingCardGoal] = useState(false);
  const [goalSavedFlash, setGoalSavedFlash] = useState(false);
  const [draftGoalMinutes, setDraftGoalMinutes] = useState(String(settings.dailyGoalMinutes));
  const [draftGoalLabel, setDraftGoalLabel] = useState(settings.dailyGoalLabel || '');
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draftTaskText, setDraftTaskText] = useState('');
  const [confettiTrigger, setConfettiTrigger] = useState<ConfettiTrigger | null>(null);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const celebrationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current !== null) {
        window.clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setDraftGoalMinutes(String(settings.dailyGoalMinutes));
    setDraftGoalLabel(settings.dailyGoalLabel || '');
  }, [settings.dailyGoalMinutes, settings.dailyGoalLabel]);

  const targetMs = new Date(`${settings.examDate}T09:00:00`).getTime();
  const diffMs = Math.max(0, targetMs - nowMs);
  const daysLeft = Math.floor(diffMs / 86400000);
  const hoursLeft = Math.floor((diffMs % 86400000) / 3600000);
  const minsLeft = Math.floor((diffMs % 3600000) / 60000);
  const secsLeft = Math.floor((diffMs % 60000) / 1000);

  // Formula of the day (deterministic by day of year)
  const dayIndex = Math.floor(nowMs / 86400000) % FORMULAS.length;
  const formulaOfDay = FORMULAS[dayIndex] ?? FORMULAS[0];
  const lastFormula = getFormulaById(lastVisitedFormulaId) ?? FORMULAS[0];

  const dailyTasks = settings.dailyTasks || [];
  const doneTasksCount = dailyTasks.filter((t) => t.done).length;

  const todayMinutes = Math.floor(todayStudySeconds / 60);
  const minutesRatio = Math.min(1, todayMinutes / Math.max(1, settings.dailyGoalMinutes));
  const goalPct =
    dailyTasks.length > 0
      ? Math.round(((minutesRatio + doneTasksCount / dailyTasks.length) / 2) * 100)
      : Math.round(minutesRatio * 100);

  const masteryPct = Math.round((knownIds.length / FORMULAS.length) * 100);
  const levelInfo = getAspirantLevel(totalFocusXp);

  // Build local profile snapshot if user is not signed in to Firebase yet
  const activeSelfProfile = useMemo<PublicProfile>(() => {
    if (profile) return profile;
    const chapterKnown: Record<string, number> = {};
    for (const f of FORMULAS) {
      if (knownIds.includes(f.id)) {
        chapterKnown[f.chapter] = (chapterKnown[f.chapter] || 0) + 1;
      }
    }
    let checklistDone = 0;
    for (const item of checklist) {
      if (item.stages.formulasLearnt) checklistDone += 1;
      if (item.stages.graphsUnderstood) checklistDone += 1;
      if (item.stages.flashcardsDone) checklistDone += 1;
      if (item.stages.pyqsSolved) checklistDone += 1;
      if (item.stages.revisedX2) checklistDone += 1;
    }
    const totalStudyMinutes = Math.floor(
      sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / 60
    );
    return {
      uid: 'local-aspirant',
      guestCode: 'LOCAL',
      displayName: 'Local Aspirant',
      authType: 'guest',
      avatarColor: '#06b6d4',
      knownCount: knownIds.length,
      bookmarkedCount: bookmarkedIds.length,
      streakDays,
      todayReviews: todayReviewCount,
      totalStudyMinutes,
      focusXp: totalFocusXp,
      checklistDone,
      chapterKnown,
      createdAtMs: nowMs,
      updatedAtMs: nowMs,
    };
  }, [
    profile,
    knownIds,
    bookmarkedIds.length,
    streakDays,
    todayReviewCount,
    checklist,
    sessions,
    totalFocusXp,
    nowMs,
  ]);

  const weeklyChartData = useMemo(() => {
    const days: { dateStr: string; label: string; minutes: number; sessionsCount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(nowMs - i * 86400000);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      days.push({ dateStr, label, minutes: 0, sessionsCount: 0 });
    }

    const map = new Map<string, { minutes: number; sessionsCount: number }>();
    for (const s of sessions) {
      const sDate = new Date(s.completedAt);
      const y = sDate.getFullYear();
      const m = String(sDate.getMonth() + 1).padStart(2, '0');
      const day = String(sDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const cur = map.get(dateStr) || { minutes: 0, sessionsCount: 0 };
      map.set(dateStr, {
        minutes: cur.minutes + Math.round(s.durationSeconds / 60),
        sessionsCount: cur.sessionsCount + 1,
      });
    }

    return days.map((d) => {
      const rec = map.get(d.dateStr);
      return {
        ...d,
        minutes: rec ? rec.minutes : 0,
        sessionsCount: rec ? rec.sessionsCount : 0,
      };
    });
  }, [sessions, nowMs]);

  const handleSaveGoalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMin = Math.max(5, Math.min(600, Math.round(Number(draftGoalMinutes) || 60)));
    onUpdateSettings({
      dailyGoalMinutes: parsedMin,
      dailyGoalLabel: draftGoalLabel.trim().slice(0, 80),
    });
    setEditingCardGoal(false);
    setGoalSavedFlash(true);
    window.setTimeout(() => setGoalSavedFlash(false), 1800);
  };

  const handleAddDailyTask = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTaskText.trim().slice(0, 100);
    if (!clean || dailyTasks.length >= 15) return;
    const nextTask: DailyGoalTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: clean,
      done: false,
    };
    onUpdateSettings({ dailyTasks: [...dailyTasks, nextTask] });
    setNewTaskText('');
  };

  const handleToggleDailyTask = (
    taskId: string,
    event?: React.MouseEvent<HTMLButtonElement>
  ) => {
    const target = dailyTasks.find((t) => t.id === taskId);
    const becomingDone = Boolean(target && !target.done);
    const updatedTasks = dailyTasks.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );

    onUpdateSettings({
      dailyTasks: updatedTasks,
    });

    if (becomingDone) {
      const rect = event?.currentTarget.getBoundingClientRect();
      const x = rect ? rect.left + 16 : undefined;
      const y = rect ? rect.top + rect.height / 2 : undefined;
      const allCompleted =
        updatedTasks.length > 0 && updatedTasks.every((t) => t.done);

      setConfettiTrigger({
        id: Date.now(),
        x,
        y,
        intensity: allCompleted ? 'grand' : 'task',
      });
      setCelebrationMsg(
        allCompleted
          ? "All Today's Goal tasks completed! Great momentum."
          : 'Task completed! Keep going.'
      );
      if (celebrationTimerRef.current !== null) {
        window.clearTimeout(celebrationTimerRef.current);
      }
      celebrationTimerRef.current = window.setTimeout(() => {
        setCelebrationMsg(null);
        celebrationTimerRef.current = null;
      }, 2800);
    }
  };

  const handleSaveTaskEdit = (taskId: string) => {
    const clean = draftTaskText.trim().slice(0, 100);
    if (!clean) {
      setEditingTaskId(null);
      return;
    }
    onUpdateSettings({
      dailyTasks: dailyTasks.map((t) => (t.id === taskId ? { ...t, text: clean } : t)),
    });
    setEditingTaskId(null);
  };

  const handleDeleteDailyTask = (taskId: string) => {
    onUpdateSettings({
      dailyTasks: dailyTasks.filter((t) => t.id !== taskId),
    });
  };

  const handleClearDoneTasks = () => {
    onUpdateSettings({
      dailyTasks: dailyTasks.filter((t) => !t.done),
    });
  };

  // SVG Ring Math
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, goalPct) / 100) * circ;

  return (
    <div className="space-y-5">
      <ConfettiBurst trigger={confettiTrigger} />
      {/* Top Aspirant Status Strip: Streak, Level & Profile */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {streakDays} {streakDays === 1 ? 'Day' : 'Days'} Streak
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          <button
            type="button"
            onClick={() => onNavigate('timer')}
            className="flex items-center gap-2 text-left hover:opacity-85 transition-opacity"
          >
            <Award className="h-4 w-4 text-cyan-500 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              Level {levelInfo.level}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              · {totalFocusXp.toLocaleString()} XP
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/70 hover:border-cyan-400 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2 transition-colors"
        >
          {profile ? (
            <span
              className="h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: profile.avatarColor }}
            >
              {profile.displayName.slice(0, 2).toUpperCase()}
            </span>
          ) : (
            <User className="h-4 w-4 text-cyan-500 shrink-0" />
          )}
          <span className="truncate max-w-[140px]">
            {profile ? profile.displayName : 'Profile'}
          </span>
        </button>
      </section>

      {/* First-Launch / Editable Exam Countdown Hero */}
      <section className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/50 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-violet-950/40 p-5 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
              <Calendar className="h-4 w-4" />
              <span>JEE Main Target · {settings.examDate}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-3 sm:gap-4 tabular-nums">
              <div>
                <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  {daysLeft}
                </span>
                <span className="ml-1 text-xs sm:text-sm text-slate-300">days</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-semibold text-cyan-300">
                  {hoursLeft}
                </span>
                <span className="ml-1 text-xs sm:text-sm text-slate-300">hrs</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-semibold text-cyan-300">
                  {minsLeft}
                </span>
                <span className="ml-1 text-xs sm:text-sm text-slate-300">min</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-semibold text-cyan-300">
                  {secsLeft}
                </span>
                <span className="ml-1 text-xs sm:text-sm text-slate-300">sec</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            {editingDate ? (
              <div className="rounded-2xl bg-slate-950/75 border border-cyan-500/30 p-3 space-y-2 w-full sm:w-auto">
                <label className="block text-xs text-cyan-200 font-medium">
                  Set your JEE Main exam date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={draftDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                    className="min-h-[40px] rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (draftDate) {
                        onUpdateSettings({ examDate: draftDate, examDateConfigured: true });
                        setEditingDate(false);
                      }
                    }}
                    className="min-h-[40px] px-4 rounded-xl bg-cyan-400 text-slate-950 text-xs font-semibold whitespace-nowrap"
                  >
                    Save Date
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraftDate(settings.examDate);
                  setEditingDate(true);
                }}
                className="min-h-[44px] px-4 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors self-start sm:self-end"
              >
                Edit Exam Date
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Metrics Row: Goal Ring, Streak, Mastery, Reviews */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4 flex items-center gap-3.5 col-span-2 lg:col-span-1">
          {editingCardGoal ? (
            <form onSubmit={handleSaveGoalSettings} className="w-full space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-300">
                  Edit Today&apos;s Goal
                </span>
                <button
                  type="button"
                  onClick={() => setEditingCardGoal(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                autoFocus
                maxLength={80}
                value={draftGoalLabel}
                onChange={(e) => setDraftGoalLabel(e.target.value)}
                placeholder="Write today's study objective..."
                aria-label="Today's study goal objective"
                className="w-full min-h-[36px] rounded-xl border border-cyan-500/40 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs text-slate-900 dark:text-slate-100"
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={5}
                  max={600}
                  value={draftGoalMinutes}
                  onChange={(e) => setDraftGoalMinutes(e.target.value)}
                  aria-label="Daily goal target minutes"
                  className="w-20 min-h-[36px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
                <span className="text-[11px] text-slate-500">min</span>
                <button
                  type="submit"
                  className="ml-auto min-h-[36px] px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <>
              <svg width="80" height="80" className="shrink-0 -rotate-90">
                <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-slate-200 dark:text-slate-800" />
                <circle
                  cx="40"
                  cy="40"
                  r={r}
                  fill="none"
                  stroke="url(#goalGrad)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                />
                <defs>
                  <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Today&apos;s Goal</span>
                  <button
                    type="button"
                    onClick={() => setEditingCardGoal(true)}
                    aria-label="Edit today's goal"
                    className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-300 hover:underline inline-flex items-center gap-0.5"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {todayMinutes}/{settings.dailyGoalMinutes}m
                </div>
                <div className="text-xs text-cyan-600 dark:text-cyan-300 tabular-nums truncate">
                  {goalPct}% done
                  {dailyTasks.length > 0 ? ` · ${doneTasksCount}/${dailyTasks.length} tasks` : ''}
                </div>
                {settings.dailyGoalLabel?.trim() && (
                  <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    {settings.dailyGoalLabel}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Study Streak</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {streakDays} {streakDays === 1 ? 'day' : 'days'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Keep daily momentum</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Formula Web Mastery</span>
            <Network className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {knownIds.length}/{FORMULAS.length}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-300 tabular-nums">{masteryPct}% marked known</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Flashcards Today</span>
            <Layers className="h-4 w-4 text-violet-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {todayReviewCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Cards reviewed today</div>
        </div>
      </section>

      {/* Weekly Study Trends Chart (Recharts) */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-300">
              <Clock className="h-4 w-4" />
              <span>Weekly Study Trends (Last 7 Days)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Focus Time &amp; Session Activity
            </h3>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="m" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: any, name: any) => [
                  name === 'minutes' ? `${val} minutes` : `${val} sessions`,
                  name === 'minutes' ? 'Focus Time' : 'Sessions',
                ]}
              />
              <Bar dataKey="minutes" fill="#22d3ee" radius={[6, 6, 0, 0]} name="minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Customizable Today's Goal & Daily Tasks Panel */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Today&apos;s Study Objective &amp; Tasks
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Target: {settings.dailyGoalMinutes} min
                {dailyTasks.length > 0 ? ` · ${doneTasksCount}/${dailyTasks.length} tasks done` : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {celebrationMsg && (
              <span
                role="status"
                aria-live="polite"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-300"
              >
                {celebrationMsg}
              </span>
            )}
            {doneTasksCount > 0 && (
              <button
                type="button"
                onClick={handleClearDoneTasks}
                className="min-h-[36px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Clear Completed
              </button>
            )}
          </div>
        </div>

        {/* Always-Visible Editable Today's Goal Objective & Target Minutes */}
        <form
          onSubmit={handleSaveGoalSettings}
          className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3 space-y-2.5"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-2.5">
            <div className="flex-1">
              <label
                htmlFor="today-goal-objective-input"
                className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
              >
                Define Today&apos;s Goal
              </label>
              <input
                id="today-goal-objective-input"
                type="text"
                maxLength={80}
                value={draftGoalLabel}
                onChange={(e) => setDraftGoalLabel(e.target.value)}
                placeholder="e.g. Finish Electrostatics notes + solve 20 PYQs"
                className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label
                  htmlFor="today-goal-minutes-input"
                  className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
                >
                  Minutes Goal
                </label>
                <input
                  id="today-goal-minutes-input"
                  type="number"
                  min={5}
                  max={600}
                  value={draftGoalMinutes}
                  onChange={(e) => setDraftGoalMinutes(e.target.value)}
                  className="w-20 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="hidden sm:flex items-center gap-1 pb-0.5">
                {GOAL_MINUTE_PRESETS.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setDraftGoalMinutes(String(min))}
                    className={`min-h-[36px] px-2.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                      Number(draftGoalMinutes) === min
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="min-h-[40px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold whitespace-nowrap"
              >
                {goalSavedFlash ? 'Saved!' : 'Save Goal'}
              </button>
            </div>
          </div>
        </form>

        {/* Add Custom Task Form */}
        <form onSubmit={handleAddDailyTask} className="flex items-center gap-2">
          <input
            type="text"
            maxLength={100}
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a daily checklist task (e.g. Revise Unit 12 formulas, solve 15 PYQs)..."
            className="flex-1 min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim() || dailyTasks.length >= 15}
            className="min-h-[42px] px-4 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </form>

        {/* Task Checklist with Inline Edit & Delete */}
        {dailyTasks.length === 0 ? (
          <div className="text-xs text-slate-500 dark:text-slate-400 py-0.5">
            Break your daily objective into bite-sized tasks above and tick them off as you finish.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {dailyTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/55 px-3 py-2"
              >
                {editingTaskId === task.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveTaskEdit(task.id);
                    }}
                    className="flex-1 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      autoFocus
                      maxLength={100}
                      value={draftTaskText}
                      onChange={(e) => setDraftTaskText(e.target.value)}
                      className="flex-1 min-h-[34px] rounded-lg border border-cyan-500/40 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="submit"
                      className="min-h-[34px] px-3 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTaskId(null)}
                      className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => handleToggleDailyTask(task.id, e)}
                      className="flex-1 flex items-center gap-2.5 text-left min-w-0"
                    >
                      {task.done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <span
                        className={`text-xs sm:text-sm truncate ${
                          task.done
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.text}
                      </span>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setDraftTaskText(task.text);
                        }}
                        aria-label="Edit daily task"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-cyan-500"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDailyTask(task.id)}
                        aria-label="Delete daily task"
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Formula of the Day + Quick Resume */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-300">
              <Sparkles className="h-4 w-4" />
              <span>Formula of the Day</span>
            </div>
            <h3 className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {formulaOfDay.title}
            </h3>
            <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950/75 border border-slate-200 dark:border-slate-800 p-3 overflow-x-auto">
              <MathBlock latex={formulaOfDay.latex} displayMode />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">{formulaOfDay.subtopic}</span>
            <button
              type="button"
              onClick={() => onJumpToFormula(formulaOfDay.id)}
              className="min-h-[44px] px-4 rounded-xl bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-violet-500/25 transition-colors whitespace-nowrap"
            >
              <span>Inspect in Web</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Resume & Launchers */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-300">Quick Resume</div>
            <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {lastFormula.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Continue walking the web from your last viewed node or launch an interactive lab.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onJumpToFormula(lastFormula.id)}
              className="min-h-[44px] px-4 rounded-xl bg-cyan-500 text-slate-950 text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-cyan-400 transition-colors"
            >
              <Network className="h-4 w-4" />
              <span>Resume Formula Web</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('notes')}
              className="min-h-[44px] px-4 rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Short Notes (Units 11–20)</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('labs')}
              className="min-h-[44px] px-4 rounded-xl border border-cyan-500/35 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200 text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-colors"
            >
              <FlaskConical className="h-4 w-4" />
              <span>Open 10 Simulations</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('quiz')}
              className="min-h-[44px] px-4 rounded-xl border border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-200 text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-amber-500/20 transition-colors"
            >
              <Zap className="h-4 w-4" />
              <span>Rapid-Fire Sprint</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('doubt-solver')}
              className="min-h-[44px] px-4 rounded-xl border border-indigo-500/35 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200 text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-indigo-500/20 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>Instant Doubt Solver</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('glossary')}
              className="min-h-[44px] px-4 rounded-xl border border-teal-500/35 bg-teal-500/10 text-teal-700 dark:text-teal-200 text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-teal-500/20 transition-colors"
            >
              <BookMarked className="h-4 w-4" />
              <span>Physics Glossary (A–Z)</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('community')}
              className="min-h-[44px] px-4 rounded-xl border border-violet-500/35 bg-violet-500/10 text-violet-700 dark:text-violet-200 text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-violet-500/20 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Doubt Chat &amp; Friends</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Physical Constants Strip */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Standard Constants (SI Units)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {CONSTANTS.map((c, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 px-3 py-2 flex items-center justify-between gap-2 overflow-x-auto"
            >
              <MathBlock latex={c.symbol} displayMode={false} className="text-cyan-700 dark:text-cyan-300" />
              <MathBlock latex={c.value} displayMode={false} className="text-slate-800 dark:text-slate-200" />
            </div>
          ))}
        </div>
      </section>

      {/* Self Profile Progress Modal opened from Home Top Strip */}
      {showProfileModal && (
        <ProfileProgressModal
          viewedProfile={activeSelfProfile}
          isSelf={true}
          isLocalOnly={!profile}
          onClose={() => setShowProfileModal(false)}
          onAddFriend={() => {}}
          onOpenDm={() => {}}
          onOpenSync={() => onNavigate('community')}
        />
      )}
    </div>
  );
};

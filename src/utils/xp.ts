import { PublicProfile, StudySession } from '../types/physics';

export const XP_PER_FOCUS_MINUTE = 10;
export const POMODORO_BONUS_XP = 50;
export const MAX_STREAK_MULTIPLIER = 1.5;

export interface AspirantLevelInfo {
  level: number;
  title: string;
  totalXp: number;
  currentLevelMinXp: number;
  nextLevelXp: number;
  progressPct: number;
  xpToNext: number;
}

const LEVEL_TITLES: { minXp: number; title: string }[] = [
  { minXp: 0, title: 'Kinematics Starter' },
  { minXp: 250, title: 'Gauss Explorer' },
  { minXp: 750, title: 'Circuit Tactician' },
  { minXp: 1500, title: 'Lorentz Navigator' },
  { minXp: 3000, title: 'Phasor Strategist' },
  { minXp: 5000, title: 'Wavefront Scholar' },
  { minXp: 8000, title: 'Quantum Sprinter' },
  { minXp: 12500, title: 'Optics Virtuoso' },
  { minXp: 18000, title: '99%ile Contender' },
  { minXp: 25000, title: 'AIR Ranker' },
];

export function getStreakMultiplier(streakDays: number): number {
  const safeStreak = Math.max(1, Math.floor(streakDays || 1));
  const raw = 1 + Math.min(0.5, (safeStreak - 1) * 0.1);
  return Math.round(raw * 10) / 10;
}

export function calculateSessionXp(params: {
  mode: 'pomodoro' | 'stopwatch';
  durationSeconds: number;
  streakDays: number;
}): {
  baseFocusXp: number;
  pomodoroBonus: number;
  streakMultiplier: number;
  totalXp: number;
} {
  const safeSeconds = Math.max(0, params.durationSeconds || 0);
  const baseFocusXp =
    safeSeconds > 0 ? Math.max(1, Math.round((safeSeconds / 60) * XP_PER_FOCUS_MINUTE)) : 0;
  const pomodoroBonus =
    params.mode === 'pomodoro' && safeSeconds >= 300 ? POMODORO_BONUS_XP : 0;
  const streakMultiplier = getStreakMultiplier(params.streakDays);
  const totalXp = Math.round((baseFocusXp + pomodoroBonus) * streakMultiplier);

  return {
    baseFocusXp,
    pomodoroBonus,
    streakMultiplier,
    totalXp,
  };
}

export function getSessionXp(session: StudySession): number {
  if (
    typeof session.xpEarned === 'number' &&
    Number.isFinite(session.xpEarned) &&
    session.xpEarned >= 0
  ) {
    return Math.round(session.xpEarned);
  }
  const base =
    session.durationSeconds > 0
      ? Math.max(1, Math.round((session.durationSeconds / 60) * XP_PER_FOCUS_MINUTE))
      : 0;
  const bonus =
    session.mode === 'pomodoro' && session.durationSeconds >= 300 ? POMODORO_BONUS_XP : 0;
  return base + bonus;
}

export function computeTotalFocusXp(sessions: StudySession[]): number {
  return (sessions || []).reduce((sum, ses) => sum + getSessionXp(ses), 0);
}

export function getProfileFocusXp(profile: PublicProfile): number {
  if (
    typeof profile.focusXp === 'number' &&
    Number.isFinite(profile.focusXp) &&
    profile.focusXp >= 0
  ) {
    return Math.round(profile.focusXp);
  }
  return Math.round(Math.max(0, profile.totalStudyMinutes || 0) * XP_PER_FOCUS_MINUTE);
}

export function getAspirantLevel(totalXp: number): AspirantLevelInfo {
  const safeXp = Math.max(0, Math.round(totalXp || 0));

  for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_TITLES[i].minXp) {
      if (i === LEVEL_TITLES.length - 1) {
        const extraLevels = Math.floor((safeXp - LEVEL_TITLES[i].minXp) / 10000);
        const level = LEVEL_TITLES.length + extraLevels;
        const currentLevelMinXp = LEVEL_TITLES[i].minXp + extraLevels * 10000;
        const nextLevelXp = currentLevelMinXp + 10000;
        const progressPct = Math.min(
          100,
          Math.round(((safeXp - currentLevelMinXp) / (nextLevelXp - currentLevelMinXp)) * 100)
        );
        return {
          level,
          title: LEVEL_TITLES[i].title,
          totalXp: safeXp,
          currentLevelMinXp,
          nextLevelXp,
          progressPct,
          xpToNext: Math.max(0, nextLevelXp - safeXp),
        };
      }

      const currentLevelMinXp = LEVEL_TITLES[i].minXp;
      const nextLevelXp = LEVEL_TITLES[i + 1].minXp;
      const span = Math.max(1, nextLevelXp - currentLevelMinXp);
      const progressPct = Math.min(100, Math.round(((safeXp - currentLevelMinXp) / span) * 100));
      return {
        level: i + 1,
        title: LEVEL_TITLES[i].title,
        totalXp: safeXp,
        currentLevelMinXp,
        nextLevelXp,
        progressPct,
        xpToNext: Math.max(0, nextLevelXp - safeXp),
      };
    }
  }

  return {
    level: 1,
    title: LEVEL_TITLES[0].title,
    totalXp: 0,
    currentLevelMinXp: 0,
    nextLevelXp: LEVEL_TITLES[1].minXp,
    progressPct: 0,
    xpToNext: LEVEL_TITLES[1].minXp,
  };
}

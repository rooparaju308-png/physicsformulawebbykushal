import { PublicProfile } from '../types/physics';
import { getProfileFocusXp } from './xp';

export type BadgeTone = 'cyan' | 'amber' | 'emerald' | 'violet' | 'rose';

export interface AspirantBadge {
  id: string;
  label: string;
  description: string;
  tone: BadgeTone;
  iconKey: 'sparkles' | 'trophy' | 'flame' | 'clock' | 'check' | 'shield' | 'zap';
}

interface BadgeRule extends AspirantBadge {
  check: (profile: PublicProfile) => boolean;
}

const BADGE_RULES: BadgeRule[] = [
  {
    id: 'streak-30',
    label: '30-Day Unstoppable',
    description: 'Maintained a 30+ day study streak',
    tone: 'amber',
    iconKey: 'flame',
    check: (p) => p.streakDays >= 30,
  },
  {
    id: 'streak-7',
    label: 'Week Warrior',
    description: 'Maintained a 7+ day study streak',
    tone: 'amber',
    iconKey: 'flame',
    check: (p) => p.streakDays >= 7,
  },
  {
    id: 'streak-3',
    label: '3-Day Spark',
    description: 'Kept a 3+ day consecutive streak',
    tone: 'amber',
    iconKey: 'flame',
    check: (p) => p.streakDays >= 3,
  },
  {
    id: 'focus-600',
    label: '10h+ Grinder',
    description: 'Logged 10+ hours of focus study time',
    tone: 'cyan',
    iconKey: 'clock',
    check: (p) => p.totalStudyMinutes >= 600,
  },
  {
    id: 'focus-300',
    label: '5h+ Marathoner',
    description: 'Logged 5+ hours of focus study time',
    tone: 'cyan',
    iconKey: 'clock',
    check: (p) => p.totalStudyMinutes >= 300,
  },
  {
    id: 'focus-60',
    label: 'Deep Focus 1h+',
    description: 'Logged 60+ minutes of active study time',
    tone: 'cyan',
    iconKey: 'clock',
    check: (p) => p.totalStudyMinutes >= 60,
  },
  {
    id: 'xp-1000',
    label: '1,000 XP Spark',
    description: 'Earned 1,000+ Focus XP from timer sessions',
    tone: 'amber',
    iconKey: 'zap',
    check: (p) => getProfileFocusXp(p) >= 1000,
  },
  {
    id: 'xp-5000',
    label: '5,000 XP Ranker',
    description: 'Earned 5,000+ Focus XP with streak multiplier',
    tone: 'violet',
    iconKey: 'trophy',
    check: (p) => getProfileFocusXp(p) >= 5000,
  },
  {
    id: 'xp-15000',
    label: '15,000 XP Legend',
    description: 'Crossed 15,000 Focus XP milestone',
    tone: 'emerald',
    iconKey: 'sparkles',
    check: (p) => getProfileFocusXp(p) >= 15000,
  },
  {
    id: 'master-150',
    label: 'Physics Grandmaster',
    description: 'Mastered 150+ JEE formulas',
    tone: 'violet',
    iconKey: 'trophy',
    check: (p) => p.knownCount >= 150,
  },
  {
    id: 'master-75',
    label: 'Formula Architect',
    description: 'Mastered 75+ JEE formulas',
    tone: 'violet',
    iconKey: 'sparkles',
    check: (p) => p.knownCount >= 75,
  },
  {
    id: 'master-10',
    label: 'First 10 Formulas',
    description: 'Mastered 10+ JEE formulas',
    tone: 'emerald',
    iconKey: 'sparkles',
    check: (p) => p.knownCount >= 10,
  },
  {
    id: 'checklist-25',
    label: 'Checklist Pro',
    description: 'Completed 25+ chapter revision stages',
    tone: 'emerald',
    iconKey: 'check',
    check: (p) => p.checklistDone >= 25,
  },
  {
    id: 'daily-sprinter',
    label: 'Daily Sprinter',
    description: 'Reviewed 15+ flashcards today',
    tone: 'rose',
    iconKey: 'zap',
    check: (p) => p.todayReviews >= 15,
  },
  {
    id: 'gmail-verified',
    label: 'Gmail Backed Up',
    description: 'Cloud progress secured with Google Sign-In',
    tone: 'emerald',
    iconKey: 'shield',
    check: (p) => p.authType === 'gmail',
  },
];

export function getAspirantBadges(profile: PublicProfile): {
  earned: AspirantBadge[];
  upcoming: AspirantBadge[];
} {
  const earned: AspirantBadge[] = [];
  const upcoming: AspirantBadge[] = [];

  for (const rule of BADGE_RULES) {
    const badge: AspirantBadge = {
      id: rule.id,
      label: rule.label,
      description: rule.description,
      tone: rule.tone,
      iconKey: rule.iconKey,
    };
    if (rule.check(profile)) {
      earned.push(badge);
    } else {
      upcoming.push(badge);
    }
  }

  return { earned, upcoming };
}

export function formatStudyDuration(totalMinutes: number): string {
  const mins = Math.max(0, Math.round(totalMinutes));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem === 0 ? `${hrs}h` : `${hrs}h ${rem}m`;
}

export function computeLeaderboardScore(profile: PublicProfile): number {
  return Math.max(0, profile.totalStudyMinutes) + Math.max(0, profile.streakDays) * 30;
}

export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  cyan: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  amber: 'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  emerald: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  violet: 'border-violet-500/35 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  rose: 'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300',
};

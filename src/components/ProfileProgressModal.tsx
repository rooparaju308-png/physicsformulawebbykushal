import React, { useMemo } from 'react';
import {
  Award,
  Bookmark,
  CheckSquare,
  Clock,
  Flame,
  Layers,
  Lock,
  MessageCircle,
  Network,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserPlus,
  X,
  Zap,
} from 'lucide-react';
import { CHAPTERS, FORMULAS } from '../data/formulas';
import { DmThread, PublicProfile } from '../types/physics';
import {
  AspirantBadge,
  BADGE_TONE_CLASSES,
  computeLeaderboardScore,
  formatStudyDuration,
  getAspirantBadges,
} from '../utils/badges';
import { getAspirantLevel, getProfileFocusXp } from '../utils/xp';

interface ProfileProgressModalProps {
  viewedProfile: PublicProfile;
  isSelf: boolean;
  isLocalOnly?: boolean;
  existingThread?: DmThread;
  onClose: () => void;
  onAddFriend: (target: PublicProfile) => void;
  onOpenDm: (threadId: string) => void;
  onOpenSync?: () => void;
}

function renderBadgeIcon(iconKey: AspirantBadge['iconKey'], className = 'h-3.5 w-3.5') {
  switch (iconKey) {
    case 'trophy':
      return <Trophy className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'check':
      return <CheckSquare className={className} />;
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'zap':
      return <Zap className={className} />;
    case 'sparkles':
    default:
      return <Sparkles className={className} />;
  }
}

export const ProfileProgressModal: React.FC<ProfileProgressModalProps> = ({
  viewedProfile,
  isSelf,
  isLocalOnly = false,
  existingThread,
  onClose,
  onAddFriend,
  onOpenDm,
  onOpenSync,
}) => {
  const chapterTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of FORMULAS) {
      map.set(f.chapter, (map.get(f.chapter) || 0) + 1);
    }
    return map;
  }, []);

  const totalFormulas = FORMULAS.length;
  const overallPct = Math.min(
    100,
    Math.round((viewedProfile.knownCount / Math.max(1, totalFormulas)) * 100)
  );

  const { earned: earnedBadges, upcoming: upcomingBadges } = useMemo(
    () => getAspirantBadges(viewedProfile),
    [viewedProfile]
  );

  const studyScore = useMemo(
    () => computeLeaderboardScore(viewedProfile),
    [viewedProfile]
  );

  const focusXp = useMemo(
    () => getProfileFocusXp(viewedProfile),
    [viewedProfile]
  );
  const levelInfo = useMemo(() => getAspirantLevel(focusXp), [focusXp]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ backgroundColor: viewedProfile.avatarColor }}
            >
              {viewedProfile.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                  {viewedProfile.displayName}
                </h3>
                {isSelf && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 text-[10px] font-bold">
                    You
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    viewedProfile.authType === 'gmail'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {viewedProfile.authType === 'gmail' && <ShieldCheck className="h-3 w-3" />}
                  <span>{viewedProfile.authType === 'gmail' ? 'Gmail Verified' : 'Guest ID'}</span>
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-cyan-600 dark:text-cyan-300">
                  ID: {viewedProfile.guestCode}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                  Leaderboard Score: <strong className="text-slate-800 dark:text-slate-200">{studyScore}</strong> pts
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile inspector"
            className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Focus XP & Aspirant Rank Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>
                  Lv.{levelInfo.level} · {levelInfo.title}
                </span>
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-300 tabular-nums">
                {focusXp.toLocaleString()} XP
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-300"
                style={{ width: `${levelInfo.progressPct}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {levelInfo.xpToNext.toLocaleString()} XP to Level {levelInfo.level + 1}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Network className="h-4 w-4 text-cyan-500" />
                <span>Formula Web Mastery</span>
              </span>
              <span className="font-bold text-cyan-600 dark:text-cyan-300 tabular-nums">
                {viewedProfile.knownCount} / {totalFormulas} ({overallPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              Mastered formulas synced across sessions
            </div>
          </div>
        </div>

        {/* Key Learning Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Focus XP</span>
              <Zap className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="mt-1 text-base font-bold text-amber-600 dark:text-amber-300 tabular-nums">
              {focusXp.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Streak</span>
              <Flame className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {viewedProfile.streakDays}d
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Study Time</span>
              <Clock className="h-3.5 w-3.5 text-cyan-500" />
            </div>
            <div className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatStudyDuration(viewedProfile.totalStudyMinutes)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Reviews Today</span>
              <Layers className="h-3.5 w-3.5 text-violet-500" />
            </div>
            <div className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {viewedProfile.todayReviews}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Checklist / Stars</span>
              <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums flex items-center gap-2">
              <span>{viewedProfile.checklistDone}</span>
              <span className="text-xs font-normal text-slate-400 inline-flex items-center gap-0.5">
                <Bookmark className="h-3 w-3 text-amber-400" />
                {viewedProfile.bookmarkedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Earned Badges & Achievements */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" />
              <span>Earned Badges ({earnedBadges.length})</span>
            </div>
            {upcomingBadges.length > 0 && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                {upcomingBadges.length} milestones remaining
              </span>
            )}
          </div>

          {earnedBadges.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-500 dark:text-slate-400">
              No badges unlocked yet. Keep logging study focus minutes, daily streaks, and mastered formulas!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-xl border px-3 py-2 flex items-start gap-2.5 ${BADGE_TONE_CLASSES[badge.tone]}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {renderBadgeIcon(badge.iconKey)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-tight">{badge.label}</div>
                    <div className="text-[11px] opacity-85 leading-snug mt-0.5">
                      {badge.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {upcomingBadges.length > 0 && (
            <div className="pt-1">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Next Milestones
              </div>
              <div className="flex flex-wrap gap-1.5">
                {upcomingBadges.slice(0, 3).map((badge) => (
                  <span
                    key={badge.id}
                    title={badge.description}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-2.5 py-1 text-[11px] text-slate-500 dark:text-slate-400"
                  >
                    <Lock className="h-3 w-3" />
                    <span>{badge.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chapter-by-Chapter Breakdown */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Chapter-by-Chapter Mastery
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CHAPTERS.map((ch) => {
              const total = chapterTotals.get(ch.id) || 1;
              const known = Math.min(total, viewedProfile.chapterKnown?.[ch.id] || 0);
              const pct = Math.round((known / total) * 100);
              return (
                <div
                  key={ch.id}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-2.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {ch.shortTitle}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                      {known}/{total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: ch.accentColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Footer */}
        {isSelf && isLocalOnly && onOpenSync && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Progress saved locally on this device. Sign in to sync with Community &amp; Leaderboard.
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSync();
              }}
              className="min-h-[40px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Join with Guest ID / Gmail</span>
            </button>
          </div>
        )}

        {!isSelf && (
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            {existingThread ? (
              existingThread.status === 'accepted' ? (
                <button
                  type="button"
                  onClick={() => {
                    onOpenDm(existingThread.id);
                    onClose();
                  }}
                  className="min-h-[42px] px-4 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold inline-flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Open 1v1 Friend Chat</span>
                </button>
              ) : (
                <span className="text-xs font-semibold text-amber-500">
                  Friend request pending...
                </span>
              )
            ) : (
              <button
                type="button"
                onClick={() => {
                  onAddFriend(viewedProfile);
                  onClose();
                }}
                className="min-h-[42px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold inline-flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Send Friend Request</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

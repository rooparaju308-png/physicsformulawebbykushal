import React, { useMemo, useState } from 'react';
import {
  Award,
  Clock,
  Crown,
  Eye,
  Flame,
  Medal,
  MessageCircle,
  Search,
  ShieldCheck,
  Trophy,
  UserPlus,
  Zap,
} from 'lucide-react';
import { FORMULAS } from '../data/formulas';
import { DmThread, PublicProfile } from '../types/physics';
import {
  BADGE_TONE_CLASSES,
  computeLeaderboardScore,
  formatStudyDuration,
  getAspirantBadges,
} from '../utils/badges';
import { getAspirantLevel, getProfileFocusXp } from '../utils/xp';

export type LeaderboardSortMode = 'xp' | 'combined' | 'studyTime' | 'streak';

interface GlobalLeaderboardProps {
  profiles: PublicProfile[];
  currentUid: string;
  onSelectProfile: (profile: PublicProfile) => void;
  getThreadWithUser: (targetUid: string) => DmThread | undefined;
  onRequestFriend: (target: PublicProfile) => void;
  onOpenDm: (threadId: string) => void;
}

interface RankedEntry {
  profile: PublicProfile;
  rank: number;
  score: number;
  badges: ReturnType<typeof getAspirantBadges>['earned'];
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  profiles,
  currentUid,
  onSelectProfile,
  getThreadWithUser,
  onRequestFriend,
  onOpenDm,
}) => {
  const [sortMode, setSortMode] = useState<LeaderboardSortMode>('xp');
  const [searchQuery, setSearchQuery] = useState('');

  const rankedAll: RankedEntry[] = useMemo(() => {
    const sorted = [...profiles].sort((a, b) => {
      if (sortMode === 'xp') {
        return (
          getProfileFocusXp(b) - getProfileFocusXp(a) ||
          b.totalStudyMinutes - a.totalStudyMinutes ||
          b.streakDays - a.streakDays ||
          b.updatedAtMs - a.updatedAtMs
        );
      }
      if (sortMode === 'studyTime') {
        return (
          b.totalStudyMinutes - a.totalStudyMinutes ||
          getProfileFocusXp(b) - getProfileFocusXp(a) ||
          b.streakDays - a.streakDays ||
          b.updatedAtMs - a.updatedAtMs
        );
      }
      if (sortMode === 'streak') {
        return (
          b.streakDays - a.streakDays ||
          getProfileFocusXp(b) - getProfileFocusXp(a) ||
          b.totalStudyMinutes - a.totalStudyMinutes ||
          b.updatedAtMs - a.updatedAtMs
        );
      }
      // Combined Study Time + Streak score
      const scoreDiff = computeLeaderboardScore(b) - computeLeaderboardScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return (
        getProfileFocusXp(b) - getProfileFocusXp(a) ||
        b.totalStudyMinutes - a.totalStudyMinutes ||
        b.streakDays - a.streakDays ||
        b.updatedAtMs - a.updatedAtMs
      );
    });

    return sorted.map((profile, idx) => ({
      profile,
      rank: idx + 1,
      score: computeLeaderboardScore(profile),
      badges: getAspirantBadges(profile).earned,
    }));
  }, [profiles, sortMode]);

  const myEntry = useMemo(
    () => rankedAll.find((entry) => entry.profile.uid === currentUid) ?? null,
    [rankedAll, currentUid]
  );

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rankedAll;
    return rankedAll.filter(
      ({ profile }) =>
        profile.displayName.toLowerCase().includes(q) ||
        profile.guestCode.toLowerCase().includes(q)
    );
  }, [rankedAll, searchQuery]);

  const showPodium = searchQuery.trim().length === 0 && filteredEntries.length > 0;
  const podiumEntries = showPodium ? filteredEntries.slice(0, 3) : [];
  const tableEntries = showPodium ? filteredEntries.slice(3) : filteredEntries;

  return (
    <div className="space-y-4">
      {/* Header, Ranking Mode & Search Controls */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Global Leaderboard</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                ({rankedAll.length} aspirants)
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked by Focus XP, study time &amp; daily streak. Click any username to inspect their progress, badges, and chapter statistics.
            </p>
          </div>

          <div className="relative sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find username or JEE ID..."
              aria-label="Filter leaderboard by username or ID"
              className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
            Rank by:
          </span>
          <button
            type="button"
            onClick={() => setSortMode('xp')}
            className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
              sortMode === 'xp'
                ? 'border-amber-400 bg-amber-500/15 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Focus XP</span>
          </button>

          <button
            type="button"
            onClick={() => setSortMode('combined')}
            className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
              sortMode === 'combined'
                ? 'border-violet-400 bg-violet-500/15 text-violet-700 dark:text-violet-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>Study Time &amp; Streak</span>
          </button>

          <button
            type="button"
            onClick={() => setSortMode('studyTime')}
            className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
              sortMode === 'studyTime'
                ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Study Time</span>
          </button>

          <button
            type="button"
            onClick={() => setSortMode('streak')}
            className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
              sortMode === 'streak'
                ? 'border-orange-400 bg-orange-500/15 text-orange-700 dark:text-orange-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Longest Streak</span>
          </button>
        </div>
      </div>

      {/* Your Standing Summary */}
      {myEntry && (
        <div className="rounded-2xl border border-cyan-500/35 bg-cyan-500/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold text-sm flex items-center justify-center tabular-nums shrink-0">
              #{myEntry.rank}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 dark:text-slate-400">Your Rank:</span>
                <button
                  type="button"
                  onClick={() => onSelectProfile(myEntry.profile)}
                  className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-300 hover:underline truncate"
                >
                  {myEntry.profile.displayName}
                </button>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-300">
                  {myEntry.profile.guestCode}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-300 tabular-nums">
                <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-300">
                  <Zap className="h-3 w-3" />
                  {getProfileFocusXp(myEntry.profile).toLocaleString()} XP · Lv.{getAspirantLevel(getProfileFocusXp(myEntry.profile)).level}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 text-cyan-500" />
                  {formatStudyDuration(myEntry.profile.totalStudyMinutes)} focus
                </span>
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-3 w-3 text-amber-500" />
                  {myEntry.profile.streakDays}d streak
                </span>
                <span className="inline-flex items-center gap-1">
                  <Award className="h-3 w-3 text-violet-500" />
                  {myEntry.badges.length} badges
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectProfile(myEntry.profile)}
            className="min-h-[38px] px-3.5 rounded-xl border border-cyan-500/40 bg-white dark:bg-slate-900 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/10 inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>My Progress &amp; Badges</span>
          </button>
        </div>
      )}

      {/* Top 3 Podium */}
      {podiumEntries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {podiumEntries.map((entry) => {
            const { profile: member, rank, badges } = entry;
            const isMe = member.uid === currentUid;
            const masteryPct = Math.min(
              100,
              Math.round((member.knownCount / Math.max(1, FORMULAS.length)) * 100)
            );

            const podiumStyle =
              rank === 1
                ? 'border-amber-400/70 bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 dark:from-amber-500/12 dark:via-slate-900/90 dark:to-slate-900'
                : rank === 2
                  ? 'border-slate-400/60 bg-gradient-to-br from-slate-400/10 via-white to-slate-400/5 dark:from-slate-400/10 dark:via-slate-900/90 dark:to-slate-900'
                  : 'border-orange-400/55 bg-gradient-to-br from-orange-500/10 via-white to-orange-500/5 dark:from-orange-500/10 dark:via-slate-900/90 dark:to-slate-900';

            const RankIcon = rank === 1 ? Crown : rank === 2 ? Medal : Award;
            const rankBadgeColor =
              rank === 1
                ? 'bg-amber-500 text-slate-950'
                : rank === 2
                  ? 'bg-slate-300 text-slate-900'
                  : 'bg-orange-400 text-slate-950';

            return (
              <div
                key={member.uid}
                className={`rounded-2xl border p-4 space-y-3 transition-colors ${podiumStyle}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onSelectProfile(member)}
                          className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-300 hover:underline truncate text-left"
                          title={`View ${member.displayName}'s profile, badges & statistics`}
                        >
                          {member.displayName}
                        </button>
                        {member.authType === 'gmail' && (
                          <ShieldCheck
                            className="h-3.5 w-3.5 text-emerald-500 shrink-0"
                            aria-label="Gmail verified"
                          />
                        )}
                        {isMe && (
                          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-300">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-300">
                        {member.guestCode}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold tabular-nums shrink-0 ${rankBadgeColor}`}
                  >
                    <RankIcon className="h-3.5 w-3.5" />
                    <span>#{rank}</span>
                  </span>
                </div>

                {/* Primary Ranking Metrics: Focus XP, Study Time & Streak */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 px-2.5 py-2">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span>Lv.{getAspirantLevel(getProfileFocusXp(member)).level} XP</span>
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-amber-600 dark:text-amber-300 tabular-nums">
                      {getProfileFocusXp(member).toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 px-2.5 py-2">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-cyan-500" />
                      <span>Study</span>
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatStudyDuration(member.totalStudyMinutes)}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 px-2.5 py-2">
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      <span>Streak</span>
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {member.streakDays}d
                    </div>
                  </div>
                </div>

                {/* Mastery & Badges Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] tabular-nums">
                    <span className="text-slate-500 dark:text-slate-400">Formula Mastery</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-300">
                      {member.knownCount}/{FORMULAS.length} ({masteryPct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                      style={{ width: `${masteryPct}%` }}
                    />
                  </div>
                </div>

                {badges.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {badges.slice(0, 2).map((badge) => (
                      <span
                        key={badge.id}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${BADGE_TONE_CLASSES[badge.tone]}`}
                      >
                        {badge.label}
                      </span>
                    ))}
                    {badges.length > 2 && (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                        +{badges.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-1 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectProfile(member)}
                    className="text-[11px] font-bold text-cyan-600 dark:text-cyan-300 hover:underline inline-flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Progress &amp; Badges</span>
                  </button>

                  {!isMe && (() => {
                    const existing = getThreadWithUser(member.uid);
                    if (existing?.status === 'accepted') {
                      return (
                        <button
                          type="button"
                          onClick={() => onOpenDm(existing.id)}
                          className="text-[11px] font-semibold text-violet-600 dark:text-violet-300 hover:underline inline-flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>1v1 Chat</span>
                        </button>
                      );
                    }
                    if (existing?.status === 'pending') {
                      return (
                        <span className="text-[11px] font-semibold text-amber-500">Pending</span>
                      );
                    }
                    return (
                      <button
                        type="button"
                        onClick={() => onRequestFriend(member)}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
                      >
                        <UserPlus className="h-3 w-3" />
                        <span>Add Friend</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ranked Leaderboard Table / Directory */}
      {tableEntries.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
            <span>
              {showPodium ? 'Full Rankings' : `Search Results (${tableEntries.length})`}
            </span>
            <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
              Click any username to inspect stats
            </span>
          </div>

          <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
            {tableEntries.map((entry) => {
              const { profile: member, rank, badges } = entry;
              const isMe = member.uid === currentUid;
              const existingThread = !isMe ? getThreadWithUser(member.uid) : undefined;
              const masteryPct = Math.min(
                100,
                Math.round((member.knownCount / Math.max(1, FORMULAS.length)) * 100)
              );

              return (
                <div
                  key={member.uid}
                  className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isMe
                      ? 'bg-cyan-500/5'
                      : 'hover:bg-slate-50/90 dark:hover:bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                      #{rank}
                    </span>

                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => onSelectProfile(member)}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-300 hover:underline truncate text-left"
                        >
                          {member.displayName}
                        </button>
                        {member.authType === 'gmail' && (
                          <ShieldCheck
                            className="h-3.5 w-3.5 text-emerald-500 shrink-0"
                            aria-label="Gmail verified"
                          />
                        )}
                        {isMe && (
                          <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-300">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="text-cyan-600 dark:text-cyan-300">{member.guestCode}</span>
                        <span>·</span>
                        <span className="tabular-nums">{badges.length} badges</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics + Actions */}
                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-5 text-xs">
                    <div className="flex items-center gap-4 tabular-nums">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] text-slate-500">
                          Lv.{getAspirantLevel(getProfileFocusXp(member)).level} Focus XP
                        </div>
                        <div className="font-bold text-amber-600 dark:text-amber-300 inline-flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>{getProfileFocusXp(member).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-[10px] text-slate-500">Study Time</div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-cyan-500" />
                          <span>{formatStudyDuration(member.totalStudyMinutes)}</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-[10px] text-slate-500">Streak</div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 inline-flex items-center gap-1">
                          <Flame className="h-3 w-3 text-amber-500" />
                          <span>{member.streakDays}d</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-[10px] text-slate-500">Mastered</div>
                        <div className="font-bold text-cyan-600 dark:text-cyan-300">
                          {member.knownCount} ({masteryPct}%)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectProfile(member)}
                        className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyan-400 text-[11px] font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-cyan-500" />
                        <span>Profile</span>
                      </button>

                      {!isMe && !existingThread && (
                        <button
                          type="button"
                          onClick={() => onRequestFriend(member)}
                          className="min-h-[34px] px-2.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-[11px] font-semibold text-violet-700 dark:text-violet-300 inline-flex items-center gap-1"
                        >
                          <UserPlus className="h-3 w-3" />
                          <span>Add</span>
                        </button>
                      )}

                      {!isMe && existingThread?.status === 'accepted' && (
                        <button
                          type="button"
                          onClick={() => onOpenDm(existingThread.id)}
                          className="min-h-[34px] px-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>DM</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredEntries.length === 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
          No aspirants matched &ldquo;{searchQuery}&rdquo;. Try another username or JEE Guest ID.
        </div>
      )}
    </div>
  );
};

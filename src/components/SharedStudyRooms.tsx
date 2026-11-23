import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  Clock,
  Coffee,
  Copy,
  Flame,
  LogOut,
  Pause,
  PenTool,
  Play,
  Plus,
  Radio,
  RotateCcw,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { CHAPTERS } from '../data/formulas';
import {
  closeStudyRoom,
  computeRoomRemainingSeconds,
  createStudyRoom,
  joinStudyRoom,
  leaveStudyRoom,
  subscribeRoomParticipants,
  subscribeStudyRoom,
  updateParticipantBadge,
  updateStudyRoomState,
} from '../services/studyRoomService';
import {
  ChapterId,
  PublicProfile,
  StudyRoom,
  StudyRoomParticipant,
  StudyRoomStatusBadge,
  StudySession,
} from '../types/physics';

interface SharedStudyRoomsProps {
  profile: PublicProfile;
  rooms: StudyRoom[];
  friendUids: Set<string>;
  activeRoomId: string | null;
  onChangeActiveRoomId: (roomId: string | null) => void;
  onInspectUid: (uid: string) => void;
  onAddSession?: (session: Omit<StudySession, 'id'>) => void;
}

const STATUS_META: Record<
  StudyRoomStatusBadge,
  {
    label: string;
    badgeClasses: string;
    dotColor: string;
  }
> = {
  focusing: {
    label: 'Focusing',
    badgeClasses:
      'border-cyan-500/40 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300',
    dotColor: 'bg-cyan-400',
  },
  'solving-pyqs': {
    label: 'Solving PYQs',
    badgeClasses:
      'border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300',
    dotColor: 'bg-violet-400',
  },
  'revising-notes': {
    label: 'Revising Notes',
    badgeClasses:
      'border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    dotColor: 'bg-emerald-400',
  },
  'on-break': {
    label: 'On Break',
    badgeClasses:
      'border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
    dotColor: 'bg-amber-400',
  },
  paused: {
    label: 'Paused',
    badgeClasses:
      'border-slate-300 dark:border-slate-700 bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    dotColor: 'bg-slate-400',
  },
};

function StatusIcon({
  status,
  className = 'h-3.5 w-3.5',
}: {
  status: StudyRoomStatusBadge;
  className?: string;
}) {
  switch (status) {
    case 'focusing':
      return <Flame className={className} />;
    case 'solving-pyqs':
      return <PenTool className={className} />;
    case 'revising-notes':
      return <BookOpen className={className} />;
    case 'on-break':
      return <Coffee className={className} />;
    case 'paused':
    default:
      return <Pause className={className} />;
  }
}

function playRoomChime() {
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
      gain.gain.exponentialRampToValueAtTime(0.14, now + i * 0.14 + 0.03);
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

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = String(Math.floor(safe / 60)).padStart(2, '0');
  const secs = String(safe % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

export const SharedStudyRooms: React.FC<SharedStudyRoomsProps> = ({
  profile,
  rooms,
  friendUids,
  activeRoomId,
  onChangeActiveRoomId,
  onInspectUid,
  onAddSession,
}) => {
  // Create room form state
  const [roomTitle, setRoomTitle] = useState('');
  const [roomChapter, setRoomChapter] = useState<string>('electrostatics');
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [creating, setCreating] = useState(false);

  // Join by code state
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);

  // Live active room & participants
  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
  const [participants, setParticipants] = useState<StudyRoomParticipant[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const [copiedRoomCode, setCopiedRoomCode] = useState(false);
  const [cycleLoggedMessage, setCycleLoggedMessage] = useState<string | null>(null);

  // My live status badge & topic
  const [myStatus, setMyStatus] = useState<StudyRoomStatusBadge>('focusing');
  const [myTopic, setMyTopic] = useState('');
  const [savingBadge, setSavingBadge] = useState(false);

  const loggedCycleKeysRef = useRef<Set<string>>(new Set());
  const autoAdvancedKeysRef = useRef<Set<string>>(new Set());

  // Subscribe to selected room & participants
  useEffect(() => {
    if (!activeRoomId) {
      setActiveRoom(null);
      setParticipants([]);
      return;
    }

    const unsubRoom = subscribeStudyRoom(activeRoomId, (room) => {
      if (!room || !room.isActive) {
        setActiveRoom(null);
        onChangeActiveRoomId(null);
        setRoomError('That study room was ended by the host.');
        return;
      }
      setActiveRoom(room);
    });

    const unsubParts = subscribeRoomParticipants(activeRoomId, (parts) => {
      setParticipants(parts);
      const mine = parts.find((p) => p.uid === profile.uid);
      if (mine) {
        setMyStatus(mine.status);
        setMyTopic((prev) => (prev === '' && mine.focusTopic ? mine.focusTopic : prev));
      }
    });

    return () => {
      unsubRoom();
      unsubParts();
    };
  }, [activeRoomId, profile.uid, onChangeActiveRoomId]);

  // Shared 1-second local clock tick for live rooms lobby & active room
  useEffect(() => {
    const id = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = useMemo(() => {
    if (!activeRoom) return 0;
    return computeRoomRemainingSeconds(activeRoom, nowMs);
  }, [activeRoom, nowMs]);

  const isHost = Boolean(activeRoom && activeRoom.hostUid === profile.uid);

  // Handle focus cycle completion cleanly (log session + host auto-advance to break)
  useEffect(() => {
    if (!activeRoom || !activeRoom.isRunning || secondsLeft > 0) return;

    const cycleKey = `${activeRoom.id}_${activeRoom.phase}_${activeRoom.phaseEndsAtMs}`;

    if (activeRoom.phase === 'focus' && !loggedCycleKeysRef.current.has(cycleKey)) {
      loggedCycleKeysRef.current.add(cycleKey);
      if (chimeEnabled) playRoomChime();
      if (onAddSession) {
        const validChapters = new Set<string>(CHAPTERS.map((c) => c.id));
        const mappedChapter: ChapterId | 'general' = validChapters.has(activeRoom.chapter)
          ? (activeRoom.chapter as ChapterId)
          : 'general';
        onAddSession({
          mode: 'pomodoro',
          chapter: mappedChapter,
          durationSeconds: activeRoom.workMinutes * 60,
          completedAt: Date.now(),
        });
        setCycleLoggedMessage(`+${activeRoom.workMinutes}m shared focus session logged!`);
        setTimeout(() => setCycleLoggedMessage(null), 4000);
      }
    }

    if (isHost && !autoAdvancedKeysRef.current.has(cycleKey)) {
      autoAdvancedKeysRef.current.add(cycleKey);
      if (activeRoom.phase === 'focus') {
        const breakSec = activeRoom.breakMinutes * 60;
        void updateStudyRoomState(activeRoom, {
          phase: 'break',
          isRunning: true,
          remainingSeconds: breakSec,
          phaseEndsAtMs: Date.now() + breakSec * 1000,
        });
      } else {
        const focusSec = activeRoom.workMinutes * 60;
        void updateStudyRoomState(activeRoom, {
          phase: 'focus',
          isRunning: false,
          remainingSeconds: focusSec,
          phaseEndsAtMs: 0,
        });
      }
    }
  }, [activeRoom, secondsLeft, isHost, chimeEnabled, onAddSession]);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => {
      const aFriend = friendUids.has(a.hostUid) ? 1 : 0;
      const bFriend = friendUids.has(b.hostUid) ? 1 : 0;
      if (aFriend !== bFriend) return bFriend - aFriend;
      return b.updatedAtMs - a.updatedAtMs;
    });
  }, [rooms, friendUids]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setRoomError(null);
    try {
      const chMeta = CHAPTERS.find((c) => c.id === roomChapter);
      const defaultTopic = chMeta ? chMeta.shortTitle : 'Mixed JEE Physics';
      const created = await createStudyRoom({
        host: profile,
        title: roomTitle.trim() || `${defaultTopic} Pomodoro`,
        chapter: roomChapter,
        workMinutes,
        breakMinutes,
        initialTopic: defaultTopic,
      });
      setMyStatus('focusing');
      setMyTopic(defaultTopic);
      setRoomTitle('');
      onChangeActiveRoomId(created.id);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : 'Failed to create study room.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (room: StudyRoom) => {
    setJoiningRoomId(room.id);
    setRoomError(null);
    try {
      const chMeta = CHAPTERS.find((c) => c.id === room.chapter);
      const initialStatus: StudyRoomStatusBadge =
        room.phase === 'break' ? 'on-break' : room.isRunning ? 'focusing' : 'paused';
      const initialTopic = chMeta ? chMeta.shortTitle : room.title.slice(0, 60);
      await joinStudyRoom(room.id, profile, initialStatus, initialTopic);
      setMyStatus(initialStatus);
      setMyTopic(initialTopic);
      onChangeActiveRoomId(room.id);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : 'Could not join study room.');
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCodeInput.trim().toUpperCase();
    if (!clean) return;
    const match = rooms.find((r) => r.roomCode.toUpperCase() === clean);
    if (!match) {
      setRoomError(`No active room found with code "${clean}".`);
      return;
    }
    setJoinCodeInput('');
    await handleJoinRoom(match);
  };

  const handleLeaveRoom = async () => {
    if (!activeRoom) return;
    const rid = activeRoom.id;
    onChangeActiveRoomId(null);
    setActiveRoom(null);
    setParticipants([]);
    await leaveStudyRoom(rid, profile.uid).catch(() => {});
  };

  const handleEndRoom = async () => {
    if (!activeRoom || !isHost) return;
    const roomToClose = activeRoom;
    onChangeActiveRoomId(null);
    setActiveRoom(null);
    setParticipants([]);
    await closeStudyRoom(roomToClose, profile.uid);
  };

  const handleHostToggleRun = async () => {
    if (!activeRoom || !isHost) return;
    if (activeRoom.isRunning) {
      const rem = computeRoomRemainingSeconds(activeRoom, Date.now());
      await updateStudyRoomState(activeRoom, {
        isRunning: false,
        remainingSeconds: rem,
        phaseEndsAtMs: 0,
      });
    } else {
      const baseSec =
        activeRoom.remainingSeconds > 0
          ? activeRoom.remainingSeconds
          : (activeRoom.phase === 'focus'
              ? activeRoom.workMinutes
              : activeRoom.breakMinutes) * 60;
      await updateStudyRoomState(activeRoom, {
        isRunning: true,
        remainingSeconds: baseSec,
        phaseEndsAtMs: Date.now() + baseSec * 1000,
      });
    }
  };

  const handleHostResetClock = async () => {
    if (!activeRoom || !isHost) return;
    const targetSec =
      (activeRoom.phase === 'focus'
        ? activeRoom.workMinutes
        : activeRoom.breakMinutes) * 60;
    await updateStudyRoomState(activeRoom, {
      isRunning: false,
      remainingSeconds: targetSec,
      phaseEndsAtMs: 0,
    });
  };

  const handleHostSwitchPhase = async () => {
    if (!activeRoom || !isHost) return;
    const nextPhase = activeRoom.phase === 'focus' ? 'break' : 'focus';
    const nextSec =
      (nextPhase === 'focus' ? activeRoom.workMinutes : activeRoom.breakMinutes) *
      60;
    await updateStudyRoomState(activeRoom, {
      phase: nextPhase,
      isRunning: true,
      remainingSeconds: nextSec,
      phaseEndsAtMs: Date.now() + nextSec * 1000,
    });
  };

  const handleStatusChange = async (nextStatus: StudyRoomStatusBadge) => {
    setMyStatus(nextStatus);
    if (!activeRoom) return;
    setSavingBadge(true);
    try {
      await updateParticipantBadge(activeRoom.id, profile, nextStatus, myTopic);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : 'Failed to update status badge.');
    } finally {
      setSavingBadge(false);
    }
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom) return;
    setSavingBadge(true);
    try {
      await updateParticipantBadge(activeRoom.id, profile, myStatus, myTopic);
    } catch (err) {
      setRoomError(err instanceof Error ? err.message : 'Failed to update focus topic.');
    } finally {
      setSavingBadge(false);
    }
  };

  const handleCopyRoomCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedRoomCode(true);
      setTimeout(() => setCopiedRoomCode(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  // -------------------------------------------------------------------------
  // ACTIVE ROOM VIEW: SYNCHRONIZED POMODORO + LIVE STATUS BADGES
  // -------------------------------------------------------------------------
  if (activeRoom) {
    const chMeta = CHAPTERS.find((c) => c.id === activeRoom.chapter);
    return (
      <div className="space-y-4">
        {roomError && (
          <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-200 flex items-center justify-between">
            <span>{roomError}</span>
            <button type="button" onClick={() => setRoomError(null)} className="underline">
              Dismiss
            </button>
          </div>
        )}

        {cycleLoggedMessage && (
          <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>{cycleLoggedMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Synchronized Live Pomodoro Clock */}
          <div className="lg:col-span-5 rounded-3xl border border-cyan-500/35 bg-white/95 dark:bg-slate-900/80 p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                    <Radio className="h-3.5 w-3.5 animate-pulse" />
                    <span>LIVE SHARED POMODORO</span>
                  </div>
                  <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                    {activeRoom.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setChimeEnabled((c) => !c)}
                  aria-label={chimeEnabled ? 'Mute cycle chime' : 'Enable cycle chime'}
                  title={chimeEnabled ? 'Cycle chime on' : 'Cycle chime muted'}
                  className="min-h-[36px] min-w-[36px] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-cyan-500 shrink-0"
                >
                  {chimeEnabled ? (
                    <Volume2 className="h-4 w-4 text-cyan-500" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-700 dark:text-violet-300 font-semibold">
                  {chMeta ? chMeta.shortTitle : 'General Physics'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyRoomCode(activeRoom.roomCode)}
                  className="inline-flex items-center gap-1 font-mono font-bold text-cyan-600 dark:text-cyan-300 hover:underline"
                  title="Copy room invite code for friends"
                >
                  <span>Code: {activeRoom.roomCode}</span>
                  {copiedRoomCode ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                <span className="text-slate-400">·</span>
                <button
                  type="button"
                  onClick={() => onInspectUid(activeRoom.hostUid)}
                  className="text-slate-600 dark:text-slate-300 hover:underline"
                >
                  Host: <strong>{activeRoom.hostName}</strong>
                </button>
              </div>
            </div>

            {/* Clock Face */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 py-6 px-4 text-center space-y-2">
              <div
                className={`text-xs font-bold uppercase tracking-wider ${
                  activeRoom.phase === 'focus'
                    ? 'text-cyan-600 dark:text-cyan-300'
                    : 'text-amber-600 dark:text-amber-300'
                }`}
              >
                {activeRoom.phase === 'focus'
                  ? `Focus Session (${activeRoom.workMinutes}m)`
                  : `Break Recharge (${activeRoom.breakMinutes}m)`}
              </div>

              <div className="font-mono text-6xl font-bold tracking-tight text-slate-900 dark:text-cyan-100 tabular-nums">
                {formatClock(secondsLeft)}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeRoom.isRunning
                  ? 'Synced across all participants'
                  : 'Timer paused by host'}
              </div>
            </div>

            {/* Host Controls vs Participant Leave */}
            <div className="space-y-2.5">
              {isHost ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleHostToggleRun}
                    className="flex-1 min-h-[44px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    {activeRoom.isRunning ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span>Pause All</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>Resume All</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleHostSwitchPhase}
                    title="Switch between Focus and Break for everyone"
                    className="min-h-[44px] px-3 rounded-xl border border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <SkipForward className="h-4 w-4" />
                    <span>{activeRoom.phase === 'focus' ? 'Break' : 'Focus'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleHostResetClock}
                    aria-label="Reset shared clock"
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 inline-flex items-center justify-center"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-3 py-2 text-[11px] text-slate-600 dark:text-slate-300 text-center">
                  Timer clock is synced to host <strong>{activeRoom.hostName}</strong>. Completed focus cycles auto-log to your study history!
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleLeaveRoom}
                  className="min-h-[38px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Leave Room</span>
                </button>

                {isHost && (
                  <button
                    type="button"
                    onClick={handleEndRoom}
                    className="min-h-[38px] px-3 rounded-xl border border-rose-500/40 bg-rose-500/10 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 inline-flex items-center gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>End Room</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Study Status Badges & Squad Members */}
          <div className="lg:col-span-7 space-y-4">
            {/* My Live Status Badge Controls */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Your Live Study Status Badge
                </div>
                {savingBadge && (
                  <span className="text-[10px] text-cyan-500 font-semibold">Updating...</span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(STATUS_META) as StudyRoomStatusBadge[]).map((statusKey) => {
                  const meta = STATUS_META[statusKey];
                  const selected = myStatus === statusKey;
                  return (
                    <button
                      key={statusKey}
                      type="button"
                      onClick={() => handleStatusChange(statusKey)}
                      className={`min-h-[36px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                        selected
                          ? `${meta.badgeClasses} ring-2 ring-offset-1 ring-cyan-400/50 dark:ring-offset-slate-900`
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <StatusIcon status={statusKey} />
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSaveTopic} className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={60}
                  value={myTopic}
                  onChange={(e) => setMyTopic(e.target.value)}
                  placeholder="What are you working on? (e.g. Gauss Law & RLC PYQs)"
                  className="flex-1 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={savingBadge}
                  className="min-h-[38px] px-3.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold shrink-0"
                >
                  Update Topic
                </button>
              </form>
            </div>

            {/* Live Participants Squad Watching Status Badges */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-500" />
                  <span>Prepping Together ({participants.length})</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click any name to view profile &amp; badges
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {participants.map((member) => {
                  const statusMeta = STATUS_META[member.status] || STATUS_META.focusing;
                  const isMe = member.uid === profile.uid;
                  const isRoomHost = member.uid === activeRoom.hostUid;
                  const isFriend = !isMe && friendUids.has(member.uid);
                  return (
                    <div
                      key={member.uid}
                      className={`rounded-xl border p-3 space-y-2 ${
                        isMe
                          ? 'border-cyan-500/40 bg-cyan-500/5'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <div
                              className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: member.avatarColor }}
                            >
                              {member.displayName.slice(0, 2).toUpperCase()}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${statusMeta.dotColor}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => onInspectUid(member.uid)}
                                className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-cyan-600 dark:hover:text-cyan-300 hover:underline truncate text-left"
                              >
                                {member.displayName}
                              </button>
                              {member.authType === 'gmail' && (
                                <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                              )}
                              {isRoomHost && (
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300">
                                  Host
                                </span>
                              )}
                              {isFriend && (
                                <span className="text-[10px] font-bold text-violet-600 dark:text-violet-300">
                                  Friend
                                </span>
                              )}
                              {isMe && (
                                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-300">
                                  (You)
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              {member.guestCode}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/70 dark:border-slate-800/80">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${statusMeta.badgeClasses}`}
                        >
                          <StatusIcon status={member.status} className="h-3 w-3" />
                          <span>{statusMeta.label}</span>
                        </span>

                        {member.focusTopic && (
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
                            {member.focusTopic}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // ROOMS LOBBY: HOST NEW POMODORO OR JOIN FRIEND'S LIVE FOCUS ROOM
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {roomError && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-200 flex items-center justify-between">
          <span>{roomError}</span>
          <button type="button" onClick={() => setRoomError(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Host a Shared Study Room */}
        <form
          onSubmit={handleCreateRoom}
          className="lg:col-span-5 rounded-2xl border border-cyan-500/35 bg-white/95 dark:bg-slate-900/80 p-4 sm:p-5 space-y-3.5"
        >
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="h-4 w-4 text-cyan-500" />
              <span>Start Shared Pomodoro Room</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Launch a live synced timer and share the Room Code with friends to study together.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room Title
              </label>
              <input
                type="text"
                maxLength={60}
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                placeholder="e.g. Current Electricity & Optics Grind"
                className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Chapter Focus
              </label>
              <select
                value={roomChapter}
                onChange={(e) => setRoomChapter(e.target.value)}
                className="w-full min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-slate-900 dark:text-slate-100"
              >
                <option value="general">Mixed JEE Physics</option>
                {CHAPTERS.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.shortTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pomodoro Preset (Focus / Break)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  { w: 25, b: 5, label: '25 / 5m' },
                  { w: 45, b: 10, label: '45 / 10m' },
                  { w: 50, b: 10, label: '50 / 10m' },
                  { w: 60, b: 10, label: '60 / 10m' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setWorkMinutes(preset.w);
                      setBreakMinutes(preset.b);
                    }}
                    className={`min-h-[34px] px-2.5 rounded-lg border text-[11px] font-semibold tabular-nums ${
                      workMinutes === preset.w && breakMinutes === preset.b
                        ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-slate-500">Focus (min)</span>
                  <input
                    type="number"
                    min={5}
                    max={90}
                    value={workMinutes}
                    onChange={(e) =>
                      setWorkMinutes(Math.min(90, Math.max(5, Number(e.target.value) || 25)))
                    }
                    className="w-full mt-0.5 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Break (min)</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={breakMinutes}
                    onChange={(e) =>
                      setBreakMinutes(Math.min(30, Math.max(1, Number(e.target.value) || 5)))
                    }
                    className="w-full mt-0.5 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 tabular-nums text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full min-h-[44px] rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Radio className="h-4 w-4" />
            <span>{creating ? 'Launching Study Room...' : 'Start Live Study Room'}</span>
          </button>
        </form>

        {/* Active Study Rooms Browser */}
        <div className="lg:col-span-7 space-y-3">
          {/* Quick Join by Code */}
          <form
            onSubmit={handleJoinByCode}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-3.5 flex flex-col sm:flex-row sm:items-center gap-2"
          >
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 shrink-0">
              Join by Room Code:
            </div>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. STUDY-7K2P"
                className="flex-1 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="min-h-[38px] px-4 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold shrink-0"
              >
                Join Code
              </button>
            </div>
          </form>

          {/* Active Live Study Rooms */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/80 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span>Live Focus Sessions ({sortedRooms.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Join a friend&apos;s timer session
              </span>
            </div>

            {sortedRooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  No live study rooms running right now
                </p>
                <p>
                  Start a Shared Pomodoro Room on the left and share the Room Code with your 1v1 friends!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedRooms.map((room) => {
                  const isFriendHost = friendUids.has(room.hostUid);
                  const isMyRoom = room.hostUid === profile.uid;
                  const chMeta = CHAPTERS.find((c) => c.id === room.chapter);
                  const roomSeconds = computeRoomRemainingSeconds(room, nowMs);

                  return (
                    <div
                      key={room.id}
                      className={`rounded-2xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isFriendHost
                          ? 'border-violet-500/45 bg-violet-500/5'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            {room.title}
                          </span>
                          {isFriendHost && (
                            <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-700 dark:text-violet-300 text-[10px] font-bold">
                              Friend&apos;s Room
                            </span>
                          )}
                          {isMyRoom && (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
                              Hosted by You
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <button
                            type="button"
                            onClick={() => onInspectUid(room.hostUid)}
                            className="hover:underline text-slate-700 dark:text-slate-200 font-medium"
                          >
                            {room.hostName}
                          </button>
                          <span>·</span>
                          <span className="font-mono text-cyan-600 dark:text-cyan-300">
                            {room.roomCode}
                          </span>
                          <span>·</span>
                          <span>{chMeta ? chMeta.shortTitle : 'General'}</span>
                          <span>·</span>
                          <span className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-300">
                            {room.phase === 'focus' ? 'Focus' : 'Break'}{' '}
                            {room.isRunning ? `${formatClock(roomSeconds)} left` : 'Paused'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={joiningRoomId === room.id}
                        onClick={() => handleJoinRoom(room)}
                        className="min-h-[40px] px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>
                          {joiningRoomId === room.id
                            ? 'Joining...'
                            : isMyRoom
                              ? 'Re-enter Room'
                              : 'Join Timer Session'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

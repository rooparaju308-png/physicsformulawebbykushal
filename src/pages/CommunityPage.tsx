import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  LogOut,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
  Trophy,
  Eye,
  Radio,
} from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import { FORMULAS } from '../data/formulas';
import {
  acceptFriendRequest,
  declineOrCancelFriendRequest,
  deleteCommunityMessage,
  fetchPublicProfileByUid,
  lookupByGuestCode,
  sendCommunityMessage,
  sendDmMessage,
  sendFriendRequest,
  subscribeCommunityMessages,
  subscribeDmMessages,
  subscribeDmThreads,
  subscribePublicProfiles,
} from '../services/communityService';
import { joinStudyRoom, subscribeActiveStudyRooms } from '../services/studyRoomService';
import { GlobalLeaderboard } from '../components/GlobalLeaderboard';
import { ProfileProgressModal } from '../components/ProfileProgressModal';
import { SharedStudyRooms } from '../components/SharedStudyRooms';
import {
  CommunityChannel,
  CommunityMessage,
  DmMessage,
  DmThread,
  DoubtCommunityDraft,
  PublicProfile,
  StudyRoom,
  StudySession,
} from '../types/physics';
import { compressDoubtPhoto } from '../utils/imageCompress';
import { getAspirantLevel, getProfileFocusXp } from '../utils/xp';

export type CommunitySubTab = 'rooms' | 'friends' | 'study-rooms' | 'leaderboard';

interface CommunityPageProps {
  onJumpToFormula: (formulaId: string) => void;
  onAddSession?: (session: Omit<StudySession, 'id'>) => void;
  initialSubTab?: CommunitySubTab;
  pendingDoubtDraft?: DoubtCommunityDraft | null;
  onConsumeDoubtDraft?: () => void;
}

const CHANNELS: { id: CommunityChannel; label: string; desc: string }[] = [
  { id: 'general', label: 'General', desc: 'All JEE Physics doubts & strategy' },
  { id: 'electromagnetism', label: 'Electromagnetism', desc: 'Electrostatics, Current, Mag, EMI & AC' },
  { id: 'modern-physics', label: 'Modern Physics', desc: 'Photoelectric, Bohr, Nuclei' },
  { id: 'optics', label: 'Ray & Wave Optics', desc: 'Mirrors, Lenses, Prism, YDSE' },
  { id: 'semiconductors', label: 'Semiconductors', desc: 'Diodes, Zener, Logic Gates' },
];

function formatTime(ms: number): string {
  try {
    return new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  onJumpToFormula,
  onAddSession,
  initialSubTab,
  pendingDoubtDraft,
  onConsumeDoubtDraft,
}) => {
  const {
    user,
    profile,
    authLoading,
    actionLoading,
    authError,
    anonymousDisabledWarning,
    syncStatus,
    clearAuthError,
    joinAsGuest,
    signInWithGmail,
    upgradeGuestToGmail,
    updateNickname,
    signOutKeepData,
  } = useFirebase();

  const [guestNickname, setGuestNickname] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [subTab, setSubTab] = useState<CommunitySubTab>(initialSubTab || 'rooms');
  const [activeChannel, setActiveChannel] = useState<CommunityChannel>('general');
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [threads, setThreads] = useState<DmThread[]>([]);
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([]);
  const [activeStudyRoomId, setActiveStudyRoomId] = useState<string | null>(null);
  const [inspectedProfile, setInspectedProfile] = useState<PublicProfile | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    if (!pendingDoubtDraft) return;
    setSubTab('rooms');
    setActiveChannel(pendingDoubtDraft.channel);
    setChatText(pendingDoubtDraft.text);
    setFormulaTag(pendingDoubtDraft.formulaTag ?? '');
    onConsumeDoubtDraft?.();
  }, [pendingDoubtDraft, onConsumeDoubtDraft]);

  // Community composer state
  const [chatText, setChatText] = useState('');
  const [chatPhoto, setChatPhoto] = useState<{ dataUrl: string; sizeKb: number } | null>(null);
  const [formulaTag, setFormulaTag] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Friends & DM state
  const [searchCode, setSearchCode] = useState('');
  const [searchingCode, setSearchingCode] = useState(false);
  const [foundUser, setFoundUser] = useState<PublicProfile | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<DmMessage[]>([]);
  const [dmText, setDmText] = useState('');
  const [dmPhoto, setDmPhoto] = useState<{ dataUrl: string; sizeKb: number } | null>(null);
  const [sendingDm, setSendingDm] = useState(false);

  // Lightbox photo viewer
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const roomBottomRef = useRef<HTMLDivElement | null>(null);
  const dmBottomRef = useRef<HTMLDivElement | null>(null);

  const formulaLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of FORMULAS) map.set(f.id, f.title);
    return map;
  }, []);

  // Real-time community channel listener
  useEffect(() => {
    if (!user || !profile) {
      setMessages([]);
      return;
    }
    const unsub = subscribeCommunityMessages(activeChannel, (msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [user, profile, activeChannel]);

  // Real-time public profiles, DM threads & live study rooms listeners
  useEffect(() => {
    if (!user || !profile) {
      setProfiles([]);
      setThreads([]);
      setStudyRooms([]);
      return;
    }
    const unsubProfiles = subscribePublicProfiles(setProfiles);
    const unsubThreads = subscribeDmThreads(user.uid, (nextThreads) => {
      setThreads(nextThreads);
    });
    const unsubRooms = subscribeActiveStudyRooms(setStudyRooms);
    return () => {
      unsubProfiles();
      unsubThreads();
      unsubRooms();
    };
  }, [user, profile]);

  // Auto-select first accepted DM thread if none selected
  const acceptedThreads = useMemo(
    () => threads.filter((t) => t.status === 'accepted'),
    [threads]
  );
  const friendUids = useMemo(() => {
    const set = new Set<string>();
    if (!user) return set;
    for (const t of acceptedThreads) {
      set.add(t.participantA === user.uid ? t.participantB : t.participantA);
    }
    return set;
  }, [acceptedThreads, user]);
  const pendingIncoming = useMemo(
    () => threads.filter((t) => t.status === 'pending' && user && t.initiatedBy !== user.uid),
    [threads, user]
  );
  const pendingOutgoing = useMemo(
    () => threads.filter((t) => t.status === 'pending' && user && t.initiatedBy === user.uid),
    [threads, user]
  );

  useEffect(() => {
    if (selectedThreadId && !threads.some((t) => t.id === selectedThreadId)) {
      setSelectedThreadId(null);
    } else if (!selectedThreadId && acceptedThreads.length > 0) {
      setSelectedThreadId(acceptedThreads[0].id);
    }
  }, [threads, acceptedThreads, selectedThreadId]);

  const activeThread = useMemo(
    () => acceptedThreads.find((t) => t.id === selectedThreadId) ?? null,
    [acceptedThreads, selectedThreadId]
  );

  // Real-time 1v1 DM messages listener
  useEffect(() => {
    if (!user || !activeThread) {
      setDmMessages([]);
      return;
    }
    const unsub = subscribeDmMessages(activeThread.id, user.uid, setDmMessages);
    return () => unsub();
  }, [user, activeThread]);

  useEffect(() => {
    roomBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    dmBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages.length]);

  const handleCopyCode = async () => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.guestCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handlePhotoSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'room' | 'dm'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLocalError(null);
    try {
      const compressed = await compressDoubtPhoto(file);
      if (target === 'room') setChatPhoto({ dataUrl: compressed.dataUrl, sizeKb: compressed.sizeKb });
      else setDmPhoto({ dataUrl: compressed.dataUrl, sizeKb: compressed.sizeKb });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not attach image.');
    }
  };

  const handleSendRoomMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || (!chatText.trim() && !chatPhoto)) return;
    setSendingMsg(true);
    setLocalError(null);
    try {
      await sendCommunityMessage({
        sender: profile,
        channel: activeChannel,
        text: chatText,
        photoDataUrl: chatPhoto?.dataUrl || '',
        formulaTag,
      });
      setChatText('');
      setChatPhoto(null);
      setFormulaTag('');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleSendDm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !activeThread || (!dmText.trim() && !dmPhoto)) return;
    setSendingDm(true);
    setLocalError(null);
    try {
      await sendDmMessage({
        thread: activeThread,
        sender: profile,
        text: dmText,
        photoDataUrl: dmPhoto?.dataUrl || '',
      });
      setDmText('');
      setDmPhoto(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to send direct message.');
    } finally {
      setSendingDm(false);
    }
  };

  const handleSearchGuestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setSearchingCode(true);
    setLocalError(null);
    setFoundUser(null);
    try {
      const result = await lookupByGuestCode(searchCode);
      if (!result) {
        setLocalError(`No aspirant found with ID "${searchCode.trim().toUpperCase()}".`);
      } else {
        setFoundUser(result);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Lookup failed.');
    } finally {
      setSearchingCode(false);
    }
  };

  const getThreadWithUser = (otherUid: string): DmThread | undefined => {
    return threads.find((t) => t.participants.includes(otherUid));
  };

  const handleRequestFriend = async (target: Pick<PublicProfile, 'uid' | 'displayName' | 'guestCode'>) => {
    if (!profile) return;
    setLocalError(null);
    try {
      await sendFriendRequest(profile, target);
      setSubTab('friends');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not send friend request.');
    }
  };

  const getFriendNameAndCode = (thread: DmThread): { name: string; code: string; uid: string } => {
    if (!user) return { name: thread.nameA, code: thread.codeA, uid: thread.participantA };
    return thread.participantA === user.uid
      ? { name: thread.nameB, code: thread.codeB, uid: thread.participantB }
      : { name: thread.nameA, code: thread.codeA, uid: thread.participantA };
  };

  const handleInspectUserByUid = async (targetUid: string) => {
    const fromCache = profiles.find((p) => p.uid === targetUid);
    if (fromCache) {
      setInspectedProfile(fromCache);
      return;
    }
    try {
      const fetched = await fetchPublicProfileByUid(targetUid);
      if (fetched) setInspectedProfile(fetched);
    } catch {
      // Handled inside fetchPublicProfileByUid
    }
  };

  if (authLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-8 text-center text-sm text-slate-500">
        Connecting to JEE Physics Community...
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Unauthenticated Entry Screen: Guest ID vs Gmail Login
  // -------------------------------------------------------------------------
  if (!user || !profile) {
    return (
      <div className="space-y-5 max-w-4xl mx-auto">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            JEE Aspirants Doubt Community &amp; 1v1 Friends
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Join immediately with a Guest ID (no account needed) or sign in with Gmail. Chat across physics channels, send doubt photos, and message friends 1-on-1.
          </p>
        </div>

        {(authError || anonymousDisabledWarning) && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2 text-xs text-amber-800 dark:text-amber-200">
            <div className="font-semibold flex items-center justify-between gap-2">
              <span>Connection Notice</span>
              <button
                type="button"
                onClick={clearAuthError}
                className="text-amber-700 dark:text-amber-300 underline"
              >
                Dismiss
              </button>
            </div>
            <p className="leading-relaxed">{authError}</p>
            {anonymousDisabledWarning && (
              <a
                href="https://console.firebase.google.com/project/hopeful-dragon-jrrhs/authentication/providers"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-cyan-600 dark:text-cyan-300 hover:underline"
              >
                <span>Open Firebase Console → Authentication → Enable Anonymous</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: Guest ID */}
          <div className="rounded-3xl border border-cyan-500/35 bg-white/90 dark:bg-slate-900/75 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-300">
                <Sparkles className="h-4 w-4" />
                <span>No Account Needed</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Join Instantly with Guest ID
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Get an instant shareable ID (like <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-300">JEE-K8M4P2</span>) to chat in doubt rooms, upload question photos, and add 1v1 study friends. Upgrade to Gmail anytime without losing a single formula!
              </p>
            </div>

            <div className="space-y-2.5">
              <input
                type="text"
                maxLength={32}
                value={guestNickname}
                onChange={(e) => setGuestNickname(e.target.value)}
                placeholder="Optional display name (e.g. Aarav JEE27)"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 text-xs text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => joinAsGuest(guestNickname)}
                className="w-full min-h-[46px] rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>{actionLoading ? 'Creating Guest ID...' : 'Enter with Guest ID'}</span>
              </button>
            </div>
          </div>

          {/* Option 2: Gmail Login */}
          <div className="rounded-3xl border border-violet-500/35 bg-white/90 dark:bg-slate-900/75 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 dark:text-violet-300">
                <ShieldCheck className="h-4 w-4" />
                <span>Permanent Cloud Backup</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Sign In with Gmail
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Keep your known formulas, flashcard Leitner boxes, study streak, checklist stages &amp; friend chats synced across all devices. Existing local progress merges additively — Gmail data is never erased.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Smart Merge active: Local &amp; Gmail cloud progress are preserved forever.</span>
              </div>
              <button
                type="button"
                disabled={actionLoading}
                onClick={signInWithGmail}
                className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:opacity-95 disabled:opacity-60 text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-2 transition-opacity"
              >
                <Cloud className="h-4 w-4" />
                <span>{actionLoading ? 'Signing in...' : 'Continue with Gmail'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Authenticated Community Dashboard
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Profile & Sync Identity Bar */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: profile.avatarColor }}
          >
            {profile.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 space-y-0.5">
            {editingName ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (draftName.trim()) {
                    await updateNickname(draftName);
                  }
                  setEditingName(false);
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  maxLength={40}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="min-h-[34px] rounded-lg border border-cyan-500/40 bg-slate-50 dark:bg-slate-950 px-2.5 text-xs text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="min-h-[34px] px-2.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="min-h-[34px] px-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {profile.displayName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(profile.displayName);
                    setEditingName(true);
                  }}
                  aria-label="Edit display name"
                  className="text-slate-400 hover:text-cyan-400"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    profile.authType === 'gmail'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {profile.authType === 'gmail' ? 'Gmail Synced' : 'Guest Session'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
              <span>Shareable ID:</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 font-mono font-bold text-cyan-600 dark:text-cyan-300 hover:underline"
              >
                <span>{profile.guestCode}</span>
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <span className="text-slate-400">·</span>
              {(() => {
                const focusXp = getProfileFocusXp(profile);
                const level = getAspirantLevel(focusXp);
                return (
                  <>
                    <span className="font-semibold text-amber-600 dark:text-amber-300 tabular-nums">
                      Lv.{level.level} · {focusXp.toLocaleString()} XP
                    </span>
                    <span className="text-slate-400">·</span>
                  </>
                );
              })()}
              <span className="text-emerald-600 dark:text-emerald-300 inline-flex items-center gap-1">
                <Cloud className="h-3.5 w-3.5" />
                {syncStatus === 'syncing'
                  ? 'Saving study data...'
                  : syncStatus === 'error'
                    ? 'Sync retrying'
                    : 'Progress preserved'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {profile.authType === 'guest' && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={upgradeGuestToGmail}
              className="min-h-[40px] px-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Link Gmail (Keep Data)</span>
            </button>
          )}
          <button
            type="button"
            disabled={actionLoading}
            onClick={signOutKeepData}
            className="min-h-[40px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      {(authError || localError) && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-700 dark:text-rose-200 flex items-center justify-between gap-2">
          <span>{authError || localError}</span>
          <button
            type="button"
            onClick={() => {
              clearAuthError();
              setLocalError(null);
            }}
            className="font-semibold underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sub-navigation: Doubt Rooms, 1v1 Friends & Global Leaderboard */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSubTab('rooms')}
          className={`min-h-[44px] px-4 rounded-xl text-xs font-bold inline-flex items-center gap-2 border transition-colors ${
            subTab === 'rooms'
              ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
              : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Public Doubt Channels</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('friends')}
          className={`min-h-[44px] px-4 rounded-xl text-xs font-bold inline-flex items-center gap-2 border transition-colors ${
            subTab === 'friends'
              ? 'border-violet-400 bg-violet-500/15 text-violet-700 dark:text-violet-200'
              : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Friends &amp; 1v1 Chat</span>
          {(pendingIncoming.length > 0 || acceptedThreads.length > 0) && (
            <span className="px-1.5 py-0.5 rounded-md bg-violet-500 text-white text-[10px] tabular-nums">
              {pendingIncoming.length > 0 ? `${pendingIncoming.length} req` : acceptedThreads.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('study-rooms')}
          className={`min-h-[44px] px-4 rounded-xl text-xs font-bold inline-flex items-center gap-2 border transition-colors ${
            subTab === 'study-rooms'
              ? 'border-emerald-400 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'
              : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Radio className={`h-4 w-4 ${activeStudyRoomId ? 'text-emerald-400 animate-pulse' : ''}`} />
          <span>Shared Study Rooms</span>
          {studyRooms.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] tabular-nums">
              {studyRooms.length} live
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('leaderboard')}
          className={`min-h-[44px] px-4 rounded-xl text-xs font-bold inline-flex items-center gap-2 border transition-colors ${
            subTab === 'leaderboard'
              ? 'border-amber-400 bg-amber-500/15 text-amber-700 dark:text-amber-200'
              : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Global Leaderboard</span>
          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] tabular-nums">
            {profiles.length}
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SUB-TAB 1: PUBLIC DOUBT CHANNELS                                    */}
      {/* ------------------------------------------------------------------- */}
      {subTab === 'rooms' && (
        <div className="space-y-3">
          {/* Channel Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CHANNELS.map((ch) => {
              const active = ch.id === activeChannel;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChannel(ch.id)}
                  className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                    active
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white/75 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  # {ch.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 overflow-hidden flex flex-col h-[560px]">
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  #{CHANNELS.find((c) => c.id === activeChannel)?.label}
                </span>
                <span className="ml-2 text-slate-500 dark:text-slate-400 hidden sm:inline">
                  {CHANNELS.find((c) => c.id === activeChannel)?.desc}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {messages.length} messages
              </span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500 space-y-2">
                  <Camera className="h-7 w-7 text-cyan-400/70" />
                  <p>No doubts posted in this channel yet. Upload a question photo or ask a concept below!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user.uid;
                  const thread = !isMine ? getThreadWithUser(msg.senderId) : undefined;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-3 border space-y-2 ${
                          isMine
                            ? 'bg-cyan-500/12 border-cyan-500/35 text-slate-900 dark:text-slate-100'
                            : 'bg-slate-50 dark:bg-slate-950/75 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleInspectUserByUid(msg.senderId)}
                            className="flex items-center gap-1.5 flex-wrap text-left hover:underline"
                            title="View profile & JEE progress"
                          >
                            <span className="font-bold">{msg.senderName}</span>
                            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-300">
                              {msg.senderCode}
                            </span>
                            {msg.senderAuthType === 'gmail' && (
                              <ShieldCheck className="h-3 w-3 text-emerald-500" />
                            )}
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-400 tabular-nums">
                              {formatTime(msg.createdAtMs)}
                            </span>
                            {!isMine && !thread && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRequestFriend({
                                    uid: msg.senderId,
                                    displayName: msg.senderName,
                                    guestCode: msg.senderCode,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 dark:text-violet-300 hover:underline"
                              >
                                <UserPlus className="h-3 w-3" />
                                <span>Add Friend</span>
                              </button>
                            )}
                            {!isMine && thread && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedThreadId(thread.id);
                                  setSubTab('friends');
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300 hover:underline"
                              >
                                <UserCheck className="h-3 w-3" />
                                <span>{thread.status === 'accepted' ? '1v1 Chat' : 'Pending'}</span>
                              </button>
                            )}
                            {isMine && (
                              <button
                                type="button"
                                onClick={() => deleteCommunityMessage(msg.id)}
                                aria-label="Delete message"
                                className="text-slate-400 hover:text-rose-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {msg.formulaTag && (
                          <button
                            type="button"
                            onClick={() => onJumpToFormula(msg.formulaTag)}
                            className="inline-flex items-center gap-1 rounded-lg bg-violet-500/15 border border-violet-500/30 px-2 py-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-500/25"
                          >
                            <span>Formula: {formulaLookup.get(msg.formulaTag) ?? msg.formulaTag} →</span>
                          </button>
                        )}

                        {msg.photoDataUrl && (
                          <button
                            type="button"
                            onClick={() => setLightboxUrl(msg.photoDataUrl)}
                            className="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:opacity-95"
                          >
                            <img
                              src={msg.photoDataUrl}
                              alt="Physics doubt attachment"
                              className="max-h-60 w-auto object-contain bg-white"
                            />
                          </button>
                        )}

                        {msg.text && (
                          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {msg.text}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={roomBottomRef} />
            </div>

            {/* Doubt Photo Preview & Composer */}
            <form
              onSubmit={handleSendRoomMessage}
              className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50/80 dark:bg-slate-950/70 space-y-2"
            >
              {(chatPhoto || formulaTag) && (
                <div className="flex flex-wrap items-center gap-2">
                  {chatPhoto && (
                    <div className="relative inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-white dark:bg-slate-900 p-1.5 pr-7">
                      <img
                        src={chatPhoto.dataUrl}
                        alt="Attached doubt preview"
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-300 tabular-nums">
                        Doubt Photo ({chatPhoto.sizeKb} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setChatPhoto(null)}
                        aria-label="Remove doubt photo"
                        className="absolute top-1 right-1 text-slate-400 hover:text-rose-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {formulaTag && (
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/15 border border-violet-500/35 px-2.5 py-1 text-[11px] text-violet-700 dark:text-violet-300">
                      <span>{formulaLookup.get(formulaTag) ?? formulaTag}</span>
                      <button type="button" onClick={() => setFormulaTag('')}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <label
                  title="Attach doubt photo"
                  className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer hover:border-cyan-400 shrink-0"
                >
                  <ImageIcon className="h-4 w-4 text-cyan-500" />
                  <span className="hidden sm:inline">Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoSelect(e, 'room')}
                    className="hidden"
                  />
                </label>

                <select
                  value={formulaTag}
                  onChange={(e) => setFormulaTag(e.target.value)}
                  aria-label="Tag a physics formula"
                  className="hidden md:block max-w-[180px] min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="">Tag formula (optional)</option>
                  {FORMULAS.slice(0, 60).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  maxLength={1000}
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="Ask a JEE doubt, explain a step, or attach a question photo..."
                  className="flex-1 min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                />

                <button
                  type="submit"
                  disabled={sendingMsg || (!chatText.trim() && !chatPhoto)}
                  className="min-h-[44px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SUB-TAB 2: FRIENDS & 1v1 DIRECT CHAT                                */}
      {/* ------------------------------------------------------------------- */}
      {subTab === 'friends' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Add by Guest ID, Requests, Active Friends & Members */}
          <div className="lg:col-span-5 space-y-3">
            {/* Find Friend by Guest ID */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Add Friend by Guest ID
              </div>
              <form onSubmit={handleSearchGuestCode} className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="Enter ID (e.g. JEE-7K9P2A)"
                  className="flex-1 min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-mono text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={searchingCode}
                  className="min-h-[42px] px-3.5 rounded-xl bg-violet-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Find</span>
                </button>
              </form>

              {foundUser && (
                <div className="rounded-xl border border-cyan-500/35 bg-cyan-500/10 p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {foundUser.displayName}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-300">
                      {foundUser.guestCode}
                    </div>
                  </div>
                  {foundUser.uid === user.uid ? (
                    <span className="text-[11px] text-slate-500">That's you</span>
                  ) : getThreadWithUser(foundUser.uid) ? (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                      Already linked
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequestFriend(foundUser)}
                      className="min-h-[36px] px-3 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Incoming / Outgoing Friend Requests */}
            {(pendingIncoming.length > 0 || pendingOutgoing.length > 0) && (
              <div className="rounded-2xl border border-amber-500/35 bg-amber-500/5 p-4 space-y-2.5">
                <div className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  Friend Requests ({pendingIncoming.length + pendingOutgoing.length})
                </div>
                {pendingIncoming.map((req) => {
                  const friend = getFriendNameAndCode(req);
                  return (
                    <div
                      key={req.id}
                      className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{friend.name}</div>
                        <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300">
                          {friend.code}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => acceptFriendRequest(req.id)}
                          className="min-h-[34px] px-2.5 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-bold"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => declineOrCancelFriendRequest(req.id)}
                          className="min-h-[34px] px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-[11px]"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
                {pendingOutgoing.map((req) => {
                  const friend = getFriendNameAndCode(req);
                  return (
                    <div
                      key={req.id}
                      className="rounded-xl bg-white/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{friend.name}</div>
                        <div className="text-[10px] text-slate-500">Request sent ({friend.code})</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => declineOrCancelFriendRequest(req.id)}
                        className="text-[11px] text-rose-500 hover:underline shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Accepted Friends List */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                1v1 Study Friends ({acceptedThreads.length})
              </div>
              {acceptedThreads.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No 1v1 friends yet. Enter a friend&apos;s Guest ID above or pick an aspirant below!
                </p>
              ) : (
                <div className="space-y-1.5">
                  {acceptedThreads.map((t) => {
                    const friend = getFriendNameAndCode(t);
                    const active = t.id === selectedThreadId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedThreadId(t.id)}
                        className={`w-full text-left rounded-xl p-3 border transition-colors ${
                          active
                            ? 'border-violet-400 bg-violet-500/15'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-violet-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {friend.name}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-300 shrink-0">
                            {friend.code}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {t.lastMessage}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Live Community Members Directory */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Active Aspirants in Community
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {profiles
                  .filter((p) => p.uid !== user.uid)
                  .map((member) => {
                    const existingThread = getThreadWithUser(member.uid);
                    return (
                      <div
                        key={member.uid}
                        className="rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-2"
                      >
                        <button
                          type="button"
                          onClick={() => setInspectedProfile(member)}
                          className="min-w-0 text-left hover:underline"
                          title="Watch profile & JEE progress"
                        >
                          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {member.displayName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {member.guestCode} · {member.knownCount} known · {member.streakDays}d streak
                          </div>
                        </button>
                        {existingThread ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (existingThread.status === 'accepted') {
                                setSelectedThreadId(existingThread.id);
                              }
                            }}
                            className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300 shrink-0"
                          >
                            {existingThread.status === 'accepted' ? 'Open DM' : 'Pending'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestFriend(member)}
                            className="min-h-[32px] px-2.5 rounded-lg bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30 text-[11px] font-semibold shrink-0"
                          >
                            + Friend
                          </button>
                        )}
                      </div>
                    );
                  })}
                {profiles.filter((p) => p.uid !== user.uid).length === 0 && (
                  <p className="text-xs text-slate-500">
                    Share your ID <span className="font-mono font-bold text-cyan-500">{profile.guestCode}</span> with friends so they can add you!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Active 1v1 DM Window */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 overflow-hidden flex flex-col h-[560px]">
              {activeThread ? (
                <>
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {getFriendNameAndCode(activeThread).name}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-600 dark:text-cyan-300">
                        1v1 Study DM · {getFriendNameAndCode(activeThread).code}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {(() => {
                        const friendUid = getFriendNameAndCode(activeThread).uid;
                        const friendRoom = studyRooms.find((r) => r.hostUid === friendUid);
                        if (!friendRoom) return null;
                        return (
                          <button
                            type="button"
                            onClick={async () => {
                              await joinStudyRoom(
                                friendRoom.id,
                                profile,
                                friendRoom.phase === 'break' ? 'on-break' : 'focusing',
                                friendRoom.title.slice(0, 60)
                              ).catch(() => {});
                              setActiveStudyRoomId(friendRoom.id);
                              setSubTab('study-rooms');
                            }}
                            className="min-h-[34px] px-3 rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1.5"
                          >
                            <Radio className="h-3.5 w-3.5 animate-pulse" />
                            <span>Join Focus Room</span>
                          </button>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() => handleInspectUserByUid(getFriendNameAndCode(activeThread).uid)}
                        className="min-h-[34px] px-3 rounded-lg border border-cyan-500/35 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[11px] font-semibold inline-flex items-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Watch Progress</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {dmMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center">
                        Say hi or send a photo doubt to start solving together!
                      </div>
                    ) : (
                      dmMessages.map((m) => {
                        const isMine = m.senderId === user.uid;
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl p-3 border space-y-1.5 ${
                                isMine
                                  ? 'bg-violet-500/15 border-violet-500/35 text-slate-900 dark:text-slate-100'
                                  : 'bg-slate-50 dark:bg-slate-950/75 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {m.photoDataUrl && (
                                <button
                                  type="button"
                                  onClick={() => setLightboxUrl(m.photoDataUrl)}
                                  className="block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800"
                                >
                                  <img
                                    src={m.photoDataUrl}
                                    alt="DM doubt photo"
                                    className="max-h-56 w-auto object-contain bg-white"
                                  />
                                </button>
                              )}
                              {m.text && (
                                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                                  {m.text}
                                </p>
                              )}
                              <div className="text-[10px] text-slate-400 text-right tabular-nums">
                                {formatTime(m.createdAtMs)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={dmBottomRef} />
                  </div>

                  <form
                    onSubmit={handleSendDm}
                    className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50/80 dark:bg-slate-950/70 space-y-2"
                  >
                    {dmPhoto && (
                      <div className="relative inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-white dark:bg-slate-900 p-1.5 pr-7">
                        <img
                          src={dmPhoto.dataUrl}
                          alt="DM photo preview"
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <span className="text-[11px] font-semibold text-violet-500 tabular-nums">
                          Photo ({dmPhoto.sizeKb} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => setDmPhoto(null)}
                          className="absolute top-1 right-1 text-slate-400 hover:text-rose-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="min-h-[44px] min-w-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer hover:border-violet-400 shrink-0">
                        <ImageIcon className="h-4 w-4 text-violet-500" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoSelect(e, 'dm')}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        maxLength={1000}
                        value={dmText}
                        onChange={(e) => setDmText(e.target.value)}
                        placeholder="Message friend or share a doubt photo..."
                        className="flex-1 min-h-[44px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="submit"
                        disabled={sendingDm || (!dmText.trim() && !dmPhoto)}
                        className="min-h-[44px] px-4 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <MessageCircle className="h-8 w-8 text-violet-400/70" />
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    Select or Add a 1v1 Friend
                  </p>
                  <p className="max-w-sm">
                    Share your Guest ID <span className="font-mono font-bold text-cyan-500">{profile.guestCode}</span> or send a friend request to discuss physics doubts privately with photos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SUB-TAB 3: SHARED STUDY ROOMS (LIVE POMODORO TOGETHER)              */}
      {/* ------------------------------------------------------------------- */}
      {subTab === 'study-rooms' && (
        <SharedStudyRooms
          profile={profile}
          rooms={studyRooms}
          friendUids={friendUids}
          activeRoomId={activeStudyRoomId}
          onChangeActiveRoomId={setActiveStudyRoomId}
          onInspectUid={(uid) => handleInspectUserByUid(uid)}
          onAddSession={onAddSession}
        />
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SUB-TAB 4: GLOBAL LEADERBOARD (STUDY TIME, STREAK & PROFILES)       */}
      {/* ------------------------------------------------------------------- */}
      {subTab === 'leaderboard' && (
        <GlobalLeaderboard
          profiles={profiles}
          currentUid={user.uid}
          onSelectProfile={(target) => setInspectedProfile(target)}
          getThreadWithUser={getThreadWithUser}
          onRequestFriend={(target) => handleRequestFriend(target)}
          onOpenDm={(threadId) => {
            setSelectedThreadId(threadId);
            setSubTab('friends');
          }}
        />
      )}

      {/* Inspect Any Aspirant's Profile & Chapter Mastery Modal */}
      {inspectedProfile && (
        <ProfileProgressModal
          viewedProfile={inspectedProfile}
          isSelf={inspectedProfile.uid === user.uid}
          existingThread={getThreadWithUser(inspectedProfile.uid)}
          onClose={() => setInspectedProfile(null)}
          onAddFriend={(target) => handleRequestFriend(target)}
          onOpenDm={(threadId) => {
            setSelectedThreadId(threadId);
            setSubTab('friends');
          }}
        />
      )}

      {/* Fullscreen Doubt Photo Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-white p-2 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              aria-label="Close photo preview"
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={lightboxUrl}
              alt="Full-size physics doubt"
              className="max-h-[84vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

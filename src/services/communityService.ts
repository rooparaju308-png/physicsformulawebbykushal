import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { FORMULAS } from '../data/formulas';
import {
  CommunityChannel,
  CommunityMessage,
  DmMessage,
  DmThread,
  PersistedState,
  PublicProfile,
} from '../types/physics';
import { compactFlashcardsForCloud } from '../utils/mergeProgress';
import { computeTotalFocusXp, XP_PER_FOCUS_MINUTE } from '../utils/xp';

export interface PublicProgressSummary {
  knownCount: number;
  bookmarkedCount: number;
  streakDays: number;
  todayReviews: number;
  totalStudyMinutes: number;
  focusXp: number;
  checklistDone: number;
  chapterKnown: Record<string, number>;
}

const FORMULA_CHAPTER_MAP = new Map<string, string>(
  FORMULAS.map((f) => [f.id, f.chapter])
);

export function buildPublicProgressSummary(state: PersistedState): PublicProgressSummary {
  const chapterKnown: Record<string, number> = {};
  for (const id of state.knownIds || []) {
    const ch = FORMULA_CHAPTER_MAP.get(id);
    if (ch) {
      chapterKnown[ch] = (chapterKnown[ch] || 0) + 1;
    }
  }

  let checklistDone = 0;
  for (const item of state.checklist || []) {
    if (item.stages.formulasLearnt) checklistDone += 1;
    if (item.stages.graphsUnderstood) checklistDone += 1;
    if (item.stages.flashcardsDone) checklistDone += 1;
    if (item.stages.pyqsSolved) checklistDone += 1;
    if (item.stages.revisedX2) checklistDone += 1;
  }

  const totalSeconds = (state.sessions || []).reduce(
    (sum, s) => sum + (s.durationSeconds || 0),
    0
  );

  const totalStudyMinutes = Math.min(1000000, Math.floor(totalSeconds / 60));
  const focusXp = Math.min(50000000, Math.max(0, computeTotalFocusXp(state.sessions || [])));

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return {
    knownCount: Math.min(1000, (state.knownIds || []).length),
    bookmarkedCount: Math.min(1000, (state.bookmarkedIds || []).length),
    streakDays: Math.min(10000, Math.max(0, state.streakDays || 1)),
    todayReviews: Math.min(10000, Math.max(0, state.dailyReviews?.[today] ?? 0)),
    totalStudyMinutes,
    focusXp,
    checklistDone: Math.min(5000, checklistDone),
    chapterKnown,
  };
}

const AVATAR_PALETTE = [
  '#06b6d4',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#3b82f6',
  '#14b8a6',
];

function tsToMs(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  if (val && typeof val === 'object' && 'toMillis' in val && typeof (val as { toMillis: () => number }).toMillis === 'function') {
    return (val as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

export function generateGuestCode(uid: string): string {
  const storageKey = `jee_guest_code_${uid}`;
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached && /^[A-Z0-9-]{4,24}$/.test(cached)) return cached;
  } catch {
    // Ignore storage error
  }
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  const code = `JEE-${suffix}`;
  try {
    localStorage.setItem(storageKey, code);
  } catch {
    // Ignore storage error
  }
  return code;
}

export function makeOrderedDocId(): string {
  const revTs = String(Math.max(0, 9999999999999 - Date.now())).padStart(13, '0');
  const rand = Math.random().toString(36).slice(2, 7).replace(/[^a-z0-9]/g, 'x');
  return `${revTs}_${rand}`;
}

export function makeThreadId(uid1: string, uid2: string): {
  threadId: string;
  participantA: string;
  participantB: string;
} {
  const [participantA, participantB] = uid1 < uid2 ? [uid1, uid2] : [uid2, uid1];
  return {
    threadId: `${participantA}_${participantB}`,
    participantA,
    participantB,
  };
}

export async function ensureUserProfile(params: {
  uid: string;
  displayName?: string | null;
  authType: 'guest' | 'gmail';
  progress: PublicProgressSummary;
}): Promise<PublicProfile> {
  const profilePath = `publicProfiles/${params.uid}`;
  const profileRef = doc(db, 'publicProfiles', params.uid);

  try {
    const snap = await getDoc(profileRef);
    const cleanRequestedName = (params.displayName || '').trim().slice(0, 40);
    const { progress } = params;

    if (snap.exists()) {
      const data = snap.data();
      const guestCode = String(data.guestCode || generateGuestCode(params.uid));
      const nextName =
        cleanRequestedName ||
        String(data.displayName || `Aspirant ${guestCode.slice(4)}`);
      const nextAuthType = params.authType;
      const avatarColor = String(data.avatarColor || AVATAR_PALETTE[0]);

      const needsUpdate =
        data.displayName !== nextName ||
        data.authType !== nextAuthType ||
        data.knownCount !== progress.knownCount ||
        data.bookmarkedCount !== progress.bookmarkedCount ||
        data.streakDays !== progress.streakDays ||
        data.todayReviews !== progress.todayReviews ||
        data.totalStudyMinutes !== progress.totalStudyMinutes ||
        data.focusXp !== progress.focusXp ||
        data.checklistDone !== progress.checklistDone ||
        typeof data.chapterKnown !== 'object' ||
        JSON.stringify(data.chapterKnown || {}) !== JSON.stringify(progress.chapterKnown);

      if (needsUpdate) {
        const batch = writeBatch(db);
        batch.update(profileRef, {
          displayName: nextName,
          authType: nextAuthType,
          avatarColor,
          knownCount: progress.knownCount,
          bookmarkedCount: progress.bookmarkedCount,
          streakDays: progress.streakDays,
          todayReviews: progress.todayReviews,
          totalStudyMinutes: progress.totalStudyMinutes,
          focusXp: progress.focusXp,
          checklistDone: progress.checklistDone,
          chapterKnown: progress.chapterKnown,
          updatedAt: serverTimestamp(),
        });
        const codeRef = doc(db, 'guestCodes', guestCode);
        const codeSnap = await getDoc(codeRef);
        if (codeSnap.exists()) {
          batch.update(codeRef, {
            displayName: nextName,
            authType: nextAuthType,
            avatarColor,
          });
        } else {
          batch.set(codeRef, {
            guestCode,
            uid: params.uid,
            displayName: nextName,
            authType: nextAuthType,
            avatarColor,
            createdAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }

      return {
        uid: params.uid,
        guestCode,
        displayName: nextName,
        authType: nextAuthType,
        avatarColor,
        knownCount: progress.knownCount,
        bookmarkedCount: progress.bookmarkedCount,
        streakDays: progress.streakDays,
        todayReviews: progress.todayReviews,
        totalStudyMinutes: progress.totalStudyMinutes,
        focusXp: progress.focusXp,
        checklistDone: progress.checklistDone,
        chapterKnown: progress.chapterKnown,
        createdAtMs: tsToMs(data.createdAt),
        updatedAtMs: Date.now(),
      };
    }

    const guestCode = generateGuestCode(params.uid);
    const displayName =
      cleanRequestedName ||
      (params.authType === 'gmail' ? 'JEE Aspirant' : `Guest ${guestCode.slice(4)}`);
    const avatarColor =
      AVATAR_PALETTE[params.uid.charCodeAt(0) % AVATAR_PALETTE.length] || '#06b6d4';

    const batch = writeBatch(db);
    batch.set(profileRef, {
      uid: params.uid,
      guestCode,
      displayName,
      authType: params.authType,
      avatarColor,
      knownCount: progress.knownCount,
      bookmarkedCount: progress.bookmarkedCount,
      streakDays: progress.streakDays,
      todayReviews: progress.todayReviews,
      totalStudyMinutes: progress.totalStudyMinutes,
      focusXp: progress.focusXp,
      checklistDone: progress.checklistDone,
      chapterKnown: progress.chapterKnown,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'guestCodes', guestCode), {
      guestCode,
      uid: params.uid,
      displayName,
      authType: params.authType,
      avatarColor,
      createdAt: serverTimestamp(),
    });
    await batch.commit();

    return {
      uid: params.uid,
      guestCode,
      displayName,
      authType: params.authType,
      avatarColor,
      knownCount: progress.knownCount,
      bookmarkedCount: progress.bookmarkedCount,
      streakDays: progress.streakDays,
      todayReviews: progress.todayReviews,
      totalStudyMinutes: progress.totalStudyMinutes,
      focusXp: progress.focusXp,
      checklistDone: progress.checklistDone,
      chapterKnown: progress.chapterKnown,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, profilePath);
  }
}

export async function updateProfileDisplayName(
  profile: PublicProfile,
  newName: string
): Promise<PublicProfile> {
  const cleanName = newName.trim().slice(0, 40);
  if (!cleanName) return profile;
  const profilePath = `publicProfiles/${profile.uid}`;
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'publicProfiles', profile.uid), {
      displayName: cleanName,
      authType: profile.authType,
      avatarColor: profile.avatarColor,
      knownCount: profile.knownCount,
      bookmarkedCount: profile.bookmarkedCount,
      streakDays: profile.streakDays,
      todayReviews: profile.todayReviews,
      totalStudyMinutes: profile.totalStudyMinutes,
      focusXp:
        typeof profile.focusXp === 'number'
          ? profile.focusXp
          : Math.round(profile.totalStudyMinutes * XP_PER_FOCUS_MINUTE),
      checklistDone: profile.checklistDone,
      chapterKnown: profile.chapterKnown,
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'guestCodes', profile.guestCode), {
      displayName: cleanName,
      authType: profile.authType,
      avatarColor: profile.avatarColor,
    });
    await batch.commit();
    return { ...profile, displayName: cleanName, updatedAtMs: Date.now() };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, profilePath);
  }
}

export async function fetchCloudStudyData(
  uid: string
): Promise<Partial<PersistedState> | null> {
  const path = `users/${uid}/private/studyData`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'private', 'studyData'));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      settings: data.settings as PersistedState['settings'],
      knownIds: Array.isArray(data.knownIds) ? data.knownIds : [],
      bookmarkedIds: Array.isArray(data.bookmarkedIds) ? data.bookmarkedIds : [],
      flashcards: (data.flashcards || {}) as PersistedState['flashcards'],
      checklist: Array.isArray(data.checklist) ? data.checklist : [],
      sessions: Array.isArray(data.sessions) ? data.sessions : [],
      dailyReviews: (data.dailyReviews || {}) as Record<string, number>,
      streakDays: typeof data.streakDays === 'number' ? data.streakDays : 1,
      lastActiveDate: String(data.lastActiveDate || ''),
      lastVisitedFormulaId: String(data.lastVisitedFormulaId || ''),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveCloudStudyData(
  uid: string,
  email: string | null,
  state: PersistedState
): Promise<void> {
  const path = `users/${uid}/private/studyData`;
  const ref = doc(db, 'users', uid, 'private', 'studyData');

  const trimmedDailyEntries = Object.entries(state.dailyReviews || {}).slice(-900);
  const dailyReviews = Object.fromEntries(trimmedDailyEntries);

  const payload = {
    uid,
    email: (email || '').slice(0, 160),
    knownIds: (state.knownIds || []).slice(0, 500),
    bookmarkedIds: (state.bookmarkedIds || []).slice(0, 500),
    flashcards: compactFlashcardsForCloud(state.flashcards || {}),
    checklist: (state.checklist || []).slice(0, 300),
    sessions: (state.sessions || []).slice(0, 200),
    dailyReviews,
    streakDays: Math.min(10000, Math.max(0, state.streakDays || 1)),
    lastActiveDate: (state.lastActiveDate || '').slice(0, 20),
    lastVisitedFormulaId: (state.lastVisitedFormulaId || '').slice(0, 128),
    settings: { ...state.settings },
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(ref, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

function mapDocToProfile(id: string, data: Record<string, unknown>): PublicProfile {
  const totalStudyMinutes = Number(data.totalStudyMinutes || 0);
  const rawXp = data.focusXp;
  const focusXp =
    typeof rawXp === 'number' && Number.isFinite(rawXp) && rawXp >= 0
      ? Math.round(rawXp)
      : Math.round(totalStudyMinutes * XP_PER_FOCUS_MINUTE);

  return {
    uid: String(data.uid || id),
    guestCode: String(data.guestCode || ''),
    displayName: String(data.displayName || 'Aspirant'),
    authType: data.authType === 'gmail' ? 'gmail' : 'guest',
    avatarColor: String(data.avatarColor || '#06b6d4'),
    knownCount: Number(data.knownCount || 0),
    bookmarkedCount: Number(data.bookmarkedCount || 0),
    streakDays: Number(data.streakDays || 1),
    todayReviews: Number(data.todayReviews || 0),
    totalStudyMinutes,
    focusXp,
    checklistDone: Number(data.checklistDone || 0),
    chapterKnown:
      data.chapterKnown && typeof data.chapterKnown === 'object'
        ? (data.chapterKnown as Record<string, number>)
        : {},
    createdAtMs: tsToMs(data.createdAt),
    updatedAtMs: tsToMs(data.updatedAt),
  };
}

export function subscribePublicProfiles(
  onData: (profiles: PublicProfile[]) => void
): Unsubscribe {
  const path = 'publicProfiles';
  const q = query(
    collection(db, 'publicProfiles'),
    where('authType', 'in', ['guest', 'gmail']),
    limit(100)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items: PublicProfile[] = snap.docs.map((d) => mapDocToProfile(d.id, d.data()));
      items.sort((a, b) => b.knownCount - a.knownCount || b.updatedAtMs - a.updatedAtMs);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function fetchPublicProfileByUid(uid: string): Promise<PublicProfile | null> {
  const cleanUid = uid.trim();
  if (!cleanUid) return null;
  const path = `publicProfiles/${cleanUid}`;
  try {
    const snap = await getDoc(doc(db, 'publicProfiles', cleanUid));
    if (!snap.exists()) return null;
    return mapDocToProfile(snap.id, snap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function lookupByGuestCode(
  rawCode: string
): Promise<PublicProfile | null> {
  const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if (code.length < 4 || code.length > 24) return null;
  const path = `guestCodes/${code}`;
  try {
    const snap = await getDoc(doc(db, 'guestCodes', code));
    if (!snap.exists()) return null;
    const d = snap.data();
    const uid = String(d.uid);
    const full = await fetchPublicProfileByUid(uid);
    if (full) return full;
    return mapDocToProfile(uid, d);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeCommunityMessages(
  channel: CommunityChannel,
  onData: (messages: CommunityMessage[]) => void
): Unsubscribe {
  const path = `communityMessages (${channel})`;
  const q = query(
    collection(db, 'communityMessages'),
    where('channel', '==', channel),
    limit(80)
  );
  return onSnapshot(
    q,
    (snap) => {
      const msgs: CommunityMessage[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          senderId: String(data.senderId || ''),
          senderName: String(data.senderName || 'Aspirant'),
          senderCode: String(data.senderCode || ''),
          senderAuthType: data.senderAuthType === 'gmail' ? 'gmail' : 'guest',
          channel: (data.channel as CommunityChannel) || 'general',
          text: String(data.text || ''),
          photoDataUrl: String(data.photoDataUrl || ''),
          formulaTag: String(data.formulaTag || ''),
          createdAtMs: tsToMs(data.createdAt),
        };
      });
      msgs.sort((a, b) => a.createdAtMs - b.createdAtMs);
      onData(msgs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function sendCommunityMessage(params: {
  sender: PublicProfile;
  channel: CommunityChannel;
  text: string;
  photoDataUrl?: string;
  formulaTag?: string;
}): Promise<void> {
  const text = params.text.trim().slice(0, 1000);
  const photoDataUrl = (params.photoDataUrl || '').slice(0, 350000);
  if (!text && !photoDataUrl) return;

  const id = makeOrderedDocId();
  const path = `communityMessages/${id}`;
  try {
    await setDoc(doc(db, 'communityMessages', id), {
      id,
      senderId: params.sender.uid,
      senderName: params.sender.displayName.slice(0, 40),
      senderCode: params.sender.guestCode,
      senderAuthType: params.sender.authType,
      channel: params.channel,
      text,
      photoDataUrl,
      formulaTag: (params.formulaTag || '').slice(0, 80),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCommunityMessage(messageId: string): Promise<void> {
  const path = `communityMessages/${messageId}`;
  try {
    await deleteDoc(doc(db, 'communityMessages', messageId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeDmThreads(
  uid: string,
  onData: (threads: DmThread[]) => void
): Unsubscribe {
  const path = 'dmThreads';
  const q = query(
    collection(db, 'dmThreads'),
    where('participants', 'array-contains', uid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const threads: DmThread[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          participantA: String(data.participantA || ''),
          participantB: String(data.participantB || ''),
          participants: Array.isArray(data.participants) ? data.participants.map(String) : [],
          nameA: String(data.nameA || 'Aspirant A'),
          nameB: String(data.nameB || 'Aspirant B'),
          codeA: String(data.codeA || ''),
          codeB: String(data.codeB || ''),
          status: data.status === 'accepted' ? 'accepted' : 'pending',
          initiatedBy: String(data.initiatedBy || ''),
          lastMessage: String(data.lastMessage || ''),
          createdAtMs: tsToMs(data.createdAt),
          updatedAtMs: tsToMs(data.updatedAt),
        };
      });
      threads.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
      onData(threads);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function sendFriendRequest(
  me: PublicProfile,
  target: Pick<PublicProfile, 'uid' | 'displayName' | 'guestCode'>
): Promise<string> {
  if (me.uid === target.uid) {
    throw new Error('You cannot send a friend request to yourself.');
  }
  const { threadId, participantA, participantB } = makeThreadId(me.uid, target.uid);
  const path = `dmThreads/${threadId}`;
  const threadRef = doc(db, 'dmThreads', threadId);

  const meIsA = me.uid === participantA;
  const nameA = (meIsA ? me.displayName : target.displayName).slice(0, 40);
  const nameB = (meIsA ? target.displayName : me.displayName).slice(0, 40);
  const codeA = meIsA ? me.guestCode : target.guestCode;
  const codeB = meIsA ? target.guestCode : me.guestCode;

  try {
    const existingSnap = await getDoc(threadRef);
    if (existingSnap.exists()) {
      return threadId;
    }

    await setDoc(threadRef, {
      id: threadId,
      participantA,
      participantB,
      participants: [participantA, participantB],
      nameA,
      nameB,
      codeA,
      codeB,
      status: 'pending',
      initiatedBy: me.uid,
      lastMessage: `${me.displayName.slice(0, 28)} sent a friend request`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return threadId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function acceptFriendRequest(threadId: string): Promise<void> {
  const path = `dmThreads/${threadId}`;
  try {
    await updateDoc(doc(db, 'dmThreads', threadId), {
      status: 'accepted',
      lastMessage: 'Friend request accepted — start 1v1 chat!',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function declineOrCancelFriendRequest(threadId: string): Promise<void> {
  const path = `dmThreads/${threadId}`;
  try {
    await deleteDoc(doc(db, 'dmThreads', threadId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeDmMessages(
  threadId: string,
  uid: string,
  onData: (messages: DmMessage[]) => void
): Unsubscribe {
  const path = `dmThreads/${threadId}/messages`;
  const q = query(
    collection(db, 'dmThreads', threadId, 'messages'),
    where('participants', 'array-contains', uid),
    limit(100)
  );
  return onSnapshot(
    q,
    (snap) => {
      const msgs: DmMessage[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: String(data.id || d.id),
          threadId: String(data.threadId || threadId),
          participantA: String(data.participantA || ''),
          participantB: String(data.participantB || ''),
          participants: Array.isArray(data.participants) ? data.participants.map(String) : [],
          senderId: String(data.senderId || ''),
          senderName: String(data.senderName || 'Friend'),
          text: String(data.text || ''),
          photoDataUrl: String(data.photoDataUrl || ''),
          createdAtMs: tsToMs(data.createdAt),
        };
      });
      msgs.sort((a, b) => a.createdAtMs - b.createdAtMs);
      onData(msgs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function sendDmMessage(params: {
  thread: DmThread;
  sender: PublicProfile;
  text: string;
  photoDataUrl?: string;
}): Promise<void> {
  const text = params.text.trim().slice(0, 1000);
  const photoDataUrl = (params.photoDataUrl || '').slice(0, 350000);
  if (!text && !photoDataUrl) return;

  const id = makeOrderedDocId();
  const path = `dmThreads/${params.thread.id}/messages/${id}`;
  const preview = photoDataUrl
    ? text
      ? `Photo doubt: ${text}`.slice(0, 180)
      : 'Sent a doubt photo'
    : text.slice(0, 180);

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'dmThreads', params.thread.id, 'messages', id), {
      id,
      threadId: params.thread.id,
      participantA: params.thread.participantA,
      participantB: params.thread.participantB,
      participants: params.thread.participants,
      senderId: params.sender.uid,
      senderName: params.sender.displayName.slice(0, 40),
      text,
      photoDataUrl,
      createdAt: serverTimestamp(),
    });
    batch.update(doc(db, 'dmThreads', params.thread.id), {
      lastMessage: preview,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

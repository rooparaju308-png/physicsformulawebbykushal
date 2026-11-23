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
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  PublicProfile,
  StudyRoom,
  StudyRoomParticipant,
  StudyRoomStatusBadge,
} from '../types/physics';

function tsToMs(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  if (
    val &&
    typeof val === 'object' &&
    'toMillis' in val &&
    typeof (val as { toMillis: () => number }).toMillis === 'function'
  ) {
    return (val as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

function generateRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `STUDY-${suffix}`;
}

function makeRoomId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 7).replace(/[^a-z0-9]/g, 'x');
  return `room_${ts}_${rand}`;
}

function mapDocToRoom(id: string, data: Record<string, unknown>): StudyRoom {
  return {
    id: String(data.id || id),
    roomCode: String(data.roomCode || ''),
    title: String(data.title || 'Focus Study Room'),
    chapter: String(data.chapter || 'general'),
    hostUid: String(data.hostUid || ''),
    hostName: String(data.hostName || 'Aspirant'),
    hostCode: String(data.hostCode || ''),
    phase: data.phase === 'break' ? 'break' : 'focus',
    workMinutes: Math.min(90, Math.max(5, Number(data.workMinutes || 25))),
    breakMinutes: Math.min(30, Math.max(1, Number(data.breakMinutes || 5))),
    isRunning: Boolean(data.isRunning),
    remainingSeconds: Math.min(5400, Math.max(0, Number(data.remainingSeconds || 0))),
    phaseEndsAtMs: Number(data.phaseEndsAtMs || 0),
    isActive: Boolean(data.isActive),
    createdAtMs: tsToMs(data.createdAt),
    updatedAtMs: tsToMs(data.updatedAt),
  };
}

function mapDocToParticipant(id: string, data: Record<string, unknown>): StudyRoomParticipant {
  const rawStatus = String(data.status || 'focusing');
  const validStatuses: StudyRoomStatusBadge[] = [
    'focusing',
    'solving-pyqs',
    'revising-notes',
    'on-break',
    'paused',
  ];
  const status = validStatuses.includes(rawStatus as StudyRoomStatusBadge)
    ? (rawStatus as StudyRoomStatusBadge)
    : 'focusing';

  return {
    uid: String(data.uid || id),
    roomId: String(data.roomId || ''),
    displayName: String(data.displayName || 'Aspirant'),
    guestCode: String(data.guestCode || ''),
    authType: data.authType === 'gmail' ? 'gmail' : 'guest',
    avatarColor: String(data.avatarColor || '#06b6d4'),
    status,
    focusTopic: String(data.focusTopic || ''),
    joinedAtMs: tsToMs(data.joinedAt),
    updatedAtMs: tsToMs(data.updatedAt),
  };
}

export function subscribeActiveStudyRooms(
  onData: (rooms: StudyRoom[]) => void
): Unsubscribe {
  const path = 'studyRooms';
  const q = query(
    collection(db, 'studyRooms'),
    where('isActive', '==', true),
    limit(30)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => mapDocToRoom(d.id, d.data()));
      list.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeStudyRoom(
  roomId: string,
  onData: (room: StudyRoom | null) => void
): Unsubscribe {
  const path = `studyRooms/${roomId}`;
  return onSnapshot(
    doc(db, 'studyRooms', roomId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(mapDocToRoom(snap.id, snap.data()));
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeRoomParticipants(
  roomId: string,
  onData: (participants: StudyRoomParticipant[]) => void
): Unsubscribe {
  const path = `studyRooms/${roomId}/participants`;
  const q = query(
    collection(db, 'studyRooms', roomId, 'participants'),
    where('roomId', '==', roomId),
    limit(40)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => mapDocToParticipant(d.id, d.data()));
      list.sort((a, b) => a.joinedAtMs - b.joinedAtMs);
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createStudyRoom(params: {
  host: PublicProfile;
  title: string;
  chapter: string;
  workMinutes: number;
  breakMinutes: number;
  initialTopic?: string;
}): Promise<StudyRoom> {
  const roomId = makeRoomId();
  const roomCode = generateRoomCode();
  const workMin = Math.min(90, Math.max(5, Math.round(params.workMinutes)));
  const breakMin = Math.min(30, Math.max(1, Math.round(params.breakMinutes)));
  const remainingSeconds = workMin * 60;
  const phaseEndsAtMs = Date.now() + remainingSeconds * 1000;
  const cleanTitle = (params.title.trim() || `${params.host.displayName}'s Focus Room`).slice(0, 60);
  const cleanChapter = (params.chapter.trim() || 'general').slice(0, 40);
  const path = `studyRooms/${roomId}`;

  try {
    await setDoc(doc(db, 'studyRooms', roomId), {
      id: roomId,
      roomCode,
      title: cleanTitle,
      chapter: cleanChapter,
      hostUid: params.host.uid,
      hostName: params.host.displayName.slice(0, 40),
      hostCode: params.host.guestCode,
      phase: 'focus',
      workMinutes: workMin,
      breakMinutes: breakMin,
      isRunning: true,
      remainingSeconds,
      phaseEndsAtMs,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await joinStudyRoom(
      roomId,
      params.host,
      'focusing',
      (params.initialTopic || cleanTitle).slice(0, 60)
    );

    return {
      id: roomId,
      roomCode,
      title: cleanTitle,
      chapter: cleanChapter,
      hostUid: params.host.uid,
      hostName: params.host.displayName.slice(0, 40),
      hostCode: params.host.guestCode,
      phase: 'focus',
      workMinutes: workMin,
      breakMinutes: breakMin,
      isRunning: true,
      remainingSeconds,
      phaseEndsAtMs,
      isActive: true,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateStudyRoomState(
  room: StudyRoom,
  patch: Partial<
    Pick<
      StudyRoom,
      | 'title'
      | 'chapter'
      | 'phase'
      | 'workMinutes'
      | 'breakMinutes'
      | 'isRunning'
      | 'remainingSeconds'
      | 'phaseEndsAtMs'
      | 'isActive'
    >
  >
): Promise<void> {
  const path = `studyRooms/${room.id}`;
  const cleanTitle = (patch.title !== undefined ? patch.title : room.title).trim().slice(0, 60) || room.title;
  const cleanChapter = (patch.chapter !== undefined ? patch.chapter : room.chapter).trim().slice(0, 40) || 'general';
  const workMinutes = Math.min(90, Math.max(5, Math.round(patch.workMinutes ?? room.workMinutes)));
  const breakMinutes = Math.min(30, Math.max(1, Math.round(patch.breakMinutes ?? room.breakMinutes)));
  const remainingSeconds = Math.min(5400, Math.max(0, Math.round(patch.remainingSeconds ?? room.remainingSeconds)));
  const phaseEndsAtMs = Math.min(9999999999999, Math.max(0, Math.round(patch.phaseEndsAtMs ?? room.phaseEndsAtMs)));

  try {
    await updateDoc(doc(db, 'studyRooms', room.id), {
      title: cleanTitle,
      chapter: cleanChapter,
      hostName: room.hostName.slice(0, 40),
      phase: patch.phase ?? room.phase,
      workMinutes,
      breakMinutes,
      isRunning: patch.isRunning ?? room.isRunning,
      remainingSeconds,
      phaseEndsAtMs,
      isActive: patch.isActive ?? room.isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function joinStudyRoom(
  roomId: string,
  profile: PublicProfile,
  status: StudyRoomStatusBadge = 'focusing',
  focusTopic = ''
): Promise<void> {
  const path = `studyRooms/${roomId}/participants/${profile.uid}`;
  const ref = doc(db, 'studyRooms', roomId, 'participants', profile.uid);
  const cleanTopic = focusTopic.trim().slice(0, 60);

  try {
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) {
      await updateDoc(ref, {
        displayName: profile.displayName.slice(0, 40),
        status,
        focusTopic: cleanTopic,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        uid: profile.uid,
        roomId,
        displayName: profile.displayName.slice(0, 40),
        guestCode: profile.guestCode,
        authType: profile.authType,
        avatarColor: profile.avatarColor,
        status,
        focusTopic: cleanTopic,
        joinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateParticipantBadge(
  roomId: string,
  profile: PublicProfile,
  status: StudyRoomStatusBadge,
  focusTopic: string
): Promise<void> {
  const path = `studyRooms/${roomId}/participants/${profile.uid}`;
  try {
    await updateDoc(doc(db, 'studyRooms', roomId, 'participants', profile.uid), {
      displayName: profile.displayName.slice(0, 40),
      status,
      focusTopic: focusTopic.trim().slice(0, 60),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function leaveStudyRoom(roomId: string, uid: string): Promise<void> {
  const path = `studyRooms/${roomId}/participants/${uid}`;
  try {
    await deleteDoc(doc(db, 'studyRooms', roomId, 'participants', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function closeStudyRoom(room: StudyRoom, hostUid: string): Promise<void> {
  await updateStudyRoomState(room, { isActive: false, isRunning: false });
  await leaveStudyRoom(room.id, hostUid).catch(() => {});
}

export function computeRoomRemainingSeconds(room: StudyRoom, nowMs: number = Date.now()): number {
  if (!room.isRunning) {
    return Math.max(0, room.remainingSeconds);
  }
  return Math.max(0, Math.ceil((room.phaseEndsAtMs - nowMs) / 1000));
}

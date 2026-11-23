import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import {
  buildPublicProgressSummary,
  ensureUserProfile,
  fetchCloudStudyData,
  saveCloudStudyData,
  updateProfileDisplayName,
} from '../services/communityService';
import { PersistedState, PublicProfile } from '../types/physics';
import { mergeStudyStates } from '../utils/mergeProgress';

export type SyncStatus = 'local-only' | 'syncing' | 'synced' | 'error';

interface FirebaseContextValue {
  user: User | null;
  profile: PublicProfile | null;
  authLoading: boolean;
  actionLoading: boolean;
  authError: string | null;
  anonymousDisabledWarning: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
  clearAuthError: () => void;
  joinAsGuest: (nickname?: string) => Promise<void>;
  signInWithGmail: () => Promise<void>;
  upgradeGuestToGmail: () => Promise<void>;
  updateNickname: (newName: string) => Promise<void>;
  signOutKeepData: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

interface FirebaseProviderProps {
  studyState: PersistedState;
  onMergeCloudState: (cloud: Partial<PersistedState> | null | undefined) => PersistedState;
  children: React.ReactNode;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  studyState,
  onMergeCloudState,
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [anonymousDisabledWarning, setAnonymousDisabledWarning] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local-only');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const studyStateRef = useRef<PersistedState>(studyState);
  studyStateRef.current = studyState;

  const mergeRef = useRef(onMergeCloudState);
  mergeRef.current = onMergeCloudState;

  const pendingNicknameRef = useRef<string | null>(null);
  const syncedUidRef = useRef<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        syncedUidRef.current = null;
        setUser(null);
        setProfile(null);
        setSyncStatus('local-only');
        setAuthLoading(false);
        return;
      }

      setUser(firebaseUser);
      setSyncStatus('syncing');

      try {
        const authType: 'guest' | 'gmail' = firebaseUser.isAnonymous ? 'guest' : 'gmail';
        const desiredName =
          pendingNicknameRef.current ||
          firebaseUser.displayName ||
          null;
        pendingNicknameRef.current = null;

        // Non-erasing bidirectional sync: fetch cloud -> merge with local -> persist merged
        const cloudData = await fetchCloudStudyData(firebaseUser.uid);
        const currentLocal = studyStateRef.current;
        const merged = cloudData ? mergeStudyStates(currentLocal, cloudData) : currentLocal;
        if (cloudData) {
          mergeRef.current(cloudData);
        }

        const ensured = await ensureUserProfile({
          uid: firebaseUser.uid,
          displayName: desiredName,
          authType,
          progress: buildPublicProgressSummary(merged),
        });
        setProfile(ensured);

        await saveCloudStudyData(firebaseUser.uid, firebaseUser.email, merged);

        syncedUidRef.current = firebaseUser.uid;
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      } catch (error) {
        console.error('Firebase initial sync failed:', error);
        setSyncStatus('error');
        setAuthError(
          error instanceof Error ? error.message : 'Failed to initialize cloud session.'
        );
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // Debounced auto-save to Firestore whenever local studyState changes while authenticated
  useEffect(() => {
    if (!user || syncedUidRef.current !== user.uid) return;

    const timer = window.setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        await saveCloudStudyData(user.uid, user.email, studyState);
        if (profile) {
          const updated = await ensureUserProfile({
            uid: user.uid,
            displayName: profile.displayName,
            authType: user.isAnonymous ? 'guest' : 'gmail',
            progress: buildPublicProgressSummary(studyState),
          });
          setProfile(updated);
        }
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
      } catch (error) {
        console.error('Background study sync error:', error);
        setSyncStatus('error');
      }
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [studyState, user, profile]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const joinAsGuest = useCallback(async (nickname?: string) => {
    setAuthError(null);
    setAnonymousDisabledWarning(false);
    setActionLoading(true);
    try {
      if (nickname?.trim()) {
        pendingNicknameRef.current = nickname.trim().slice(0, 40);
      }
      await signInAnonymously(auth);
    } catch (error: unknown) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code: string }).code)
          : '';
      if (
        code === 'auth/operation-not-allowed' ||
        code === 'auth/admin-restricted-operation'
      ) {
        setAnonymousDisabledWarning(true);
        setAuthError(
          'Anonymous Guest Sign-In is not yet enabled in Firebase Console (Authentication → Sign-in method → Anonymous). You can sign in with Gmail right away, or enable Anonymous provider in Console.'
        );
      } else {
        setAuthError(
          error instanceof Error ? error.message : 'Could not start Guest session.'
        );
      }
    } finally {
      setActionLoading(false);
    }
  }, []);

  const signInWithGmail = useCallback(async () => {
    setAuthError(null);
    setActionLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code: string }).code)
          : '';
      if (code !== 'auth/popup-closed-by-user') {
        setAuthError(
          error instanceof Error ? error.message : 'Gmail sign-in failed. Please allow popups and try again.'
        );
      }
    } finally {
      setActionLoading(false);
    }
  }, []);

  const upgradeGuestToGmail = useCallback(async () => {
    const current = auth.currentUser;
    if (!current) {
      await signInWithGmail();
      return;
    }
    setAuthError(null);
    setActionLoading(true);
    try {
      const res = await linkWithPopup(current, googleProvider);
      const updated = await ensureUserProfile({
        uid: res.user.uid,
        displayName: res.user.displayName || profile?.displayName || null,
        authType: 'gmail',
        progress: buildPublicProgressSummary(studyStateRef.current),
      });
      setProfile(updated);
      await saveCloudStudyData(res.user.uid, res.user.email, studyStateRef.current);
      setLastSyncedAt(Date.now());
    } catch (error: unknown) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code: string }).code)
          : '';
      if (code === 'auth/credential-already-in-use' || code === 'auth/email-already-in-use') {
        const cred =
          error instanceof FirebaseError
            ? GoogleAuthProvider.credentialFromError(error)
            : null;
        if (cred) {
          await saveCloudStudyData(current.uid, current.email, studyStateRef.current);
          await signInWithCredential(auth, cred);
          // onAuthStateChanged will automatically merge local Guest progress into the Gmail account!
          return;
        }
      }
      if (code !== 'auth/popup-closed-by-user') {
        setAuthError(
          error instanceof Error ? error.message : 'Could not link Gmail account.'
        );
      }
    } finally {
      setActionLoading(false);
    }
  }, [profile?.displayName, signInWithGmail]);

  const updateNickname = useCallback(
    async (newName: string) => {
      if (!profile) return;
      setAuthError(null);
      setActionLoading(true);
      try {
        const updated = await updateProfileDisplayName(profile, newName);
        setProfile(updated);
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : 'Could not update display name.');
      } finally {
        setActionLoading(false);
      }
    },
    [profile]
  );

  const signOutKeepData = useCallback(async () => {
    setAuthError(null);
    setActionLoading(true);
    try {
      if (auth.currentUser) {
        await saveCloudStudyData(
          auth.currentUser.uid,
          auth.currentUser.email,
          studyStateRef.current
        );
      }
      await signOut(auth);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign-out failed.');
    } finally {
      setActionLoading(false);
    }
  }, []);

  return (
    <FirebaseContext.Provider
      value={{
        user,
        profile,
        authLoading,
        actionLoading,
        authError,
        anonymousDisabledWarning,
        syncStatus,
        lastSyncedAt,
        clearAuthError,
        joinAsGuest,
        signInWithGmail,
        upgradeGuestToGmail,
        updateNickname,
        signOutKeepData,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used inside FirebaseProvider');
  }
  return ctx;
}

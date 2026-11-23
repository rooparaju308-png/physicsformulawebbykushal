import { useEffect, useState, useCallback } from 'react';
import { CHAPTERS, FORMULAS } from '../data/formulas';
import {
  AppSettings,
  ChapterId,
  ChecklistItem,
  ChecklistStage,
  PersistedState,
  StudySession,
} from '../types/physics';
import { buildDefaultFlashcards, mergeStudyStates } from '../utils/mergeProgress';
import { calculateSessionXp, computeTotalFocusXp } from '../utils/xp';

const STORAGE_KEY = 'jee_physics_web_state_v1';

function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildDefaultChecklist(): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  for (const ch of CHAPTERS) {
    const chFormulas = FORMULAS.filter((f) => f.chapter === ch.id);
    const subtopics = Array.from(new Set(chFormulas.map((f) => f.subtopic)));
    for (const sub of subtopics) {
      items.push({
        id: `chk-${ch.id}-${sub.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        chapter: ch.id,
        title: sub,
        stages: {
          formulasLearnt: false,
          graphsUnderstood: false,
          flashcardsDone: false,
          pyqsSolved: false,
          revisedX2: false,
        },
      });
    }
  }
  return items;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accent: 'cyan-violet',
  fontSize: 'md',
  examDate: '2027-01-22',
  examDateConfigured: false,
  dailyGoalMinutes: 60,
  dailyGoalLabel: '',
  dailyTasks: [],
  pomodoroWorkMin: 25,
  pomodoroBreakMin: 5,
};

function mergeChecklistWithDefaults(existing?: ChecklistItem[]): ChecklistItem[] {
  const defaults = buildDefaultChecklist();
  if (!existing || existing.length === 0) return defaults;
  const existingIds = new Set(existing.map((item) => item.id));
  const missingDefaults = defaults.filter((d) => !existingIds.has(d.id));
  return [...existing, ...missingDefaults];
}

function loadInitialState(): PersistedState {
  const today = getTodayStr();
  const fallback: PersistedState = {
    settings: DEFAULT_SETTINGS,
    knownIds: [],
    bookmarkedIds: [],
    flashcards: buildDefaultFlashcards(),
    checklist: buildDefaultChecklist(),
    sessions: [],
    dailyReviews: { [today]: 0 },
    streakDays: 1,
    lastActiveDate: today,
    lastVisitedFormulaId: FORMULAS[0]?.id ?? 'map-electrostatics-chain',
    lastVisitedTab: 'home',
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const mergedFlashcards = { ...buildDefaultFlashcards(), ...(parsed.flashcards || {}) };
    const existingChecklist = mergeChecklistWithDefaults(parsed.checklist);
    // Streak maintenance
    let streak = parsed.streakDays ?? 1;
    const lastDate = parsed.lastActiveDate ?? today;
    if (lastDate !== today) {
      const diffMs = new Date(today).getTime() - new Date(lastDate).getTime();
      const diffDays = Math.round(diffMs / 86400000);
      if (diffDays === 1) streak += 1;
      else if (diffDays > 1) streak = 1;
    }

    return {
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
      knownIds: parsed.knownIds || [],
      bookmarkedIds: parsed.bookmarkedIds || [],
      flashcards: mergedFlashcards,
      checklist: existingChecklist,
      sessions: parsed.sessions || [],
      dailyReviews: parsed.dailyReviews || { [today]: 0 },
      streakDays: streak,
      lastActiveDate: today,
      lastVisitedFormulaId: parsed.lastVisitedFormulaId || fallback.lastVisitedFormulaId,
      lastVisitedTab: parsed.lastVisitedTab || 'home',
    };
  } catch {
    return fallback;
  }
}

export function useAppStore() {
  const [state, setState] = useState<PersistedState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [state]);

  // Apply theme, accent & font size to <html>
  useEffect(() => {
    const root = document.documentElement;
    const { theme, accent, fontSize } = state.settings;

    const applyTheme = (isDark: boolean) => {
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', isDark ? '#060913' : '#f8fafc');
    };

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mq.matches);
      const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    } else {
      applyTheme(theme === 'dark');
    }

    if (accent === 'cyan-violet') {
      root.style.setProperty('--accent-primary', theme === 'light' ? '#0891b2' : '#22d3ee');
      root.style.setProperty('--accent-secondary', theme === 'light' ? '#7c3aed' : '#a855f7');
    } else if (accent === 'emerald-teal') {
      root.style.setProperty('--accent-primary', theme === 'light' ? '#059669' : '#34d399');
      root.style.setProperty('--accent-secondary', theme === 'light' ? '#0d9488' : '#2dd4bf');
    } else {
      root.style.setProperty('--accent-primary', theme === 'light' ? '#d97706' : '#fbbf24');
      root.style.setProperty('--accent-secondary', theme === 'light' ? '#e11d48' : '#fb7185');
    }

    root.style.setProperty(
      '--app-font-scale',
      fontSize === 'sm' ? '0.92' : fontSize === 'lg' ? '1.08' : '1'
    );
  }, [state.settings]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const toggleKnown = useCallback((formulaId: string) => {
    setState((prev) => {
      const exists = prev.knownIds.includes(formulaId);
      return {
        ...prev,
        knownIds: exists
          ? prev.knownIds.filter((id) => id !== formulaId)
          : [...prev.knownIds, formulaId],
      };
    });
  }, []);

  const toggleBookmark = useCallback((formulaId: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedIds.includes(formulaId);
      return {
        ...prev,
        bookmarkedIds: exists
          ? prev.bookmarkedIds.filter((id) => id !== formulaId)
          : [...prev.bookmarkedIds, formulaId],
      };
    });
  }, []);

  const setLastVisitedFormula = useCallback((formulaId: string) => {
    setState((prev) => ({ ...prev, lastVisitedFormulaId: formulaId }));
  }, []);

  const reviewFlashcard = useCallback((formulaId: string, known: boolean) => {
    const now = Date.now();
    const today = getTodayStr();
    // Leitner box intervals in hours: Box1=0h, Box2=12h, Box3=48h, Box4=120h, Box5=240h
    const intervalHours: Record<number, number> = { 1: 0, 2: 12, 3: 48, 4: 120, 5: 240 };

    setState((prev) => {
      const cur = prev.flashcards[formulaId] ?? {
        formulaId,
        box: 1 as const,
        nextReviewAt: now,
        lastReviewedAt: 0,
        wrongCount: 0,
        correctStreak: 0,
      };
      const nextBox = known
        ? (Math.min(5, cur.box + 1) as 1 | 2 | 3 | 4 | 5)
        : (1 as const);
      const nextReviewAt = now + intervalHours[nextBox] * 3600 * 1000;

      const knownIds = known && !prev.knownIds.includes(formulaId)
        ? [...prev.knownIds, formulaId]
        : prev.knownIds;

      return {
        ...prev,
        knownIds,
        flashcards: {
          ...prev.flashcards,
          [formulaId]: {
            formulaId,
            box: nextBox,
            nextReviewAt,
            lastReviewedAt: now,
            wrongCount: known ? cur.wrongCount : cur.wrongCount + 1,
            correctStreak: known ? cur.correctStreak + 1 : 0,
          },
        },
        dailyReviews: {
          ...prev.dailyReviews,
          [today]: (prev.dailyReviews[today] ?? 0) + 1,
        },
      };
    });
  }, []);

  const toggleChecklistStage = useCallback((itemId: string, stage: ChecklistStage) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId
          ? { ...item, stages: { ...item.stages, [stage]: !item.stages[stage] } }
          : item
      ),
    }));
  }, []);

  const addChecklistItem = useCallback((title: string, chapter: ChapterId | 'custom') => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      checklist: [
        ...prev.checklist,
        {
          id: `custom-${Date.now()}`,
          chapter,
          title: trimmed,
          isCustom: true,
          stages: {
            formulasLearnt: false,
            graphsUnderstood: false,
            flashcardsDone: false,
            pyqsSolved: false,
            revisedX2: false,
          },
        },
      ],
    }));
  }, []);

  const editChecklistItem = useCallback((itemId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, title: trimmed } : item
      ),
    }));
  }, []);

  const deleteChecklistItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== itemId),
    }));
  }, []);

  const reorderChecklistItem = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.checklist.length ||
        toIndex >= prev.checklist.length
      ) {
        return prev;
      }
      const next = [...prev.checklist];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...prev, checklist: next };
    });
  }, []);

  const addStudySession = useCallback((session: Omit<StudySession, 'id'>) => {
    setState((prev) => {
      const earned =
        typeof session.xpEarned === 'number'
          ? session.xpEarned
          : calculateSessionXp({
              mode: session.mode,
              durationSeconds: session.durationSeconds,
              streakDays: prev.streakDays,
            }).totalXp;
      return {
        ...prev,
        sessions: [
          { ...session, id: `ses-${Date.now()}`, xpEarned: earned },
          ...prev.sessions,
        ].slice(0, 200),
      };
    });
  }, []);

  const exportProgressJson = useCallback(() => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importProgressJson = useCallback((jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText) as Partial<PersistedState>;
      if (!parsed || typeof parsed !== 'object' || !parsed.settings) return false;
      setState((prev) => ({
        ...prev,
        ...parsed,
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        flashcards: { ...buildDefaultFlashcards(), ...(parsed.flashcards || {}) },
        checklist: mergeChecklistWithDefaults(
          parsed.checklist && parsed.checklist.length > 0 ? parsed.checklist : prev.checklist
        ),
      }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetAllProgress = useCallback(() => {
    const today = getTodayStr();
    const fresh: PersistedState = {
      settings: DEFAULT_SETTINGS,
      knownIds: [],
      bookmarkedIds: [],
      flashcards: buildDefaultFlashcards(),
      checklist: buildDefaultChecklist(),
      sessions: [],
      dailyReviews: { [today]: 0 },
      streakDays: 1,
      lastActiveDate: today,
      lastVisitedFormulaId: FORMULAS[0]?.id ?? 'map-electrostatics-chain',
      lastVisitedTab: 'home',
    };
    setState(fresh);
  }, []);

  const mergeCloudState = useCallback(
    (cloud: Partial<PersistedState> | null | undefined): PersistedState => {
      let mergedResult = state;
      setState((prev) => {
        mergedResult = mergeStudyStates(prev, cloud);
        return mergedResult;
      });
      return mergedResult;
    },
    [state]
  );

  const today = getTodayStr();
  const todayReviewCount = state.dailyReviews[today] ?? 0;
  const todaySessions = state.sessions.filter((s) => {
    const d = new Date(s.completedAt);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return ds === today;
  });
  const todayStudySeconds = todaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
  const todayFocusXp = computeTotalFocusXp(todaySessions);
  const totalFocusXp = computeTotalFocusXp(state.sessions);

  return {
    state,
    todayReviewCount,
    todayStudySeconds,
    todayFocusXp,
    totalFocusXp,
    updateSettings,
    toggleKnown,
    toggleBookmark,
    setLastVisitedFormula,
    reviewFlashcard,
    toggleChecklistStage,
    addChecklistItem,
    editChecklistItem,
    deleteChecklistItem,
    reorderChecklistItem,
    addStudySession,
    mergeCloudState,
    exportProgressJson,
    importProgressJson,
    resetAllProgress,
  };
}

import { FORMULAS } from '../data/formulas';
import {
  ChecklistItem,
  FlashcardProgress,
  PersistedState,
  StudySession,
} from '../types/physics';

export function buildDefaultFlashcards(): Record<string, FlashcardProgress> {
  const map: Record<string, FlashcardProgress> = {};
  const now = Date.now();
  for (const f of FORMULAS) {
    map[f.id] = {
      formulaId: f.id,
      box: 1,
      nextReviewAt: now,
      lastReviewedAt: 0,
      wrongCount: 0,
      correctStreak: 0,
    };
  }
  return map;
}

export function mergeStudyStates(
  local: PersistedState,
  cloud: Partial<PersistedState> | null | undefined
): PersistedState {
  if (!cloud || typeof cloud !== 'object') return local;

  const knownSet = new Set<string>([
    ...(local.knownIds || []),
    ...(Array.isArray(cloud.knownIds) ? cloud.knownIds : []),
  ]);
  const bookmarkedSet = new Set<string>([
    ...(local.bookmarkedIds || []),
    ...(Array.isArray(cloud.bookmarkedIds) ? cloud.bookmarkedIds : []),
  ]);

  // Merge flashcards keeping the most progressed / recently reviewed state per formulaId
  const flashcards: Record<string, FlashcardProgress> = {
    ...buildDefaultFlashcards(),
    ...local.flashcards,
  };
  if (cloud.flashcards && typeof cloud.flashcards === 'object') {
    for (const [id, cCard] of Object.entries(cloud.flashcards)) {
      if (!cCard || typeof cCard !== 'object') continue;
      const lCard = flashcards[id];
      if (!lCard) {
        flashcards[id] = cCard;
      } else {
        const useCloud =
          (cCard.lastReviewedAt || 0) > (lCard.lastReviewedAt || 0) ||
          ((cCard.lastReviewedAt || 0) === (lCard.lastReviewedAt || 0) &&
            (cCard.box || 1) > (lCard.box || 1));
        flashcards[id] = useCloud
          ? {
              ...cCard,
              wrongCount: Math.max(cCard.wrongCount || 0, lCard.wrongCount || 0),
              correctStreak: Math.max(cCard.correctStreak || 0, lCard.correctStreak || 0),
            }
          : {
              ...lCard,
              wrongCount: Math.max(cCard.wrongCount || 0, lCard.wrongCount || 0),
              correctStreak: Math.max(cCard.correctStreak || 0, lCard.correctStreak || 0),
            };
      }
    }
  }

  // Merge checklist additively (OR stage booleans so completed ticks are never lost)
  const checklistMap = new Map<string, ChecklistItem>();
  for (const item of local.checklist || []) {
    checklistMap.set(item.id, { ...item, stages: { ...item.stages } });
  }
  for (const cItem of Array.isArray(cloud.checklist) ? cloud.checklist : []) {
    if (!cItem || !cItem.id) continue;
    const existing = checklistMap.get(cItem.id);
    if (!existing) {
      checklistMap.set(cItem.id, cItem);
    } else {
      checklistMap.set(cItem.id, {
        ...existing,
        stages: {
          formulasLearnt: existing.stages.formulasLearnt || !!cItem.stages?.formulasLearnt,
          graphsUnderstood: existing.stages.graphsUnderstood || !!cItem.stages?.graphsUnderstood,
          flashcardsDone: existing.stages.flashcardsDone || !!cItem.stages?.flashcardsDone,
          pyqsSolved: existing.stages.pyqsSolved || !!cItem.stages?.pyqsSolved,
          revisedX2: existing.stages.revisedX2 || !!cItem.stages?.revisedX2,
        },
      });
    }
  }

  // Merge study sessions deduplicated by id (prefer entry carrying xpEarned)
  const sessionMap = new Map<string, StudySession>();
  for (const s of [...(local.sessions || []), ...(Array.isArray(cloud.sessions) ? cloud.sessions : [])]) {
    if (!s || !s.id) continue;
    const prev = sessionMap.get(s.id);
    if (!prev || (typeof prev.xpEarned !== 'number' && typeof s.xpEarned === 'number')) {
      sessionMap.set(s.id, s);
    }
  }
  const sessions = Array.from(sessionMap.values())
    .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
    .slice(0, 200);

  // Merge dailyReviews taking max per day
  const dailyReviews: Record<string, number> = { ...(local.dailyReviews || {}) };
  if (cloud.dailyReviews && typeof cloud.dailyReviews === 'object') {
    for (const [dateKey, count] of Object.entries(cloud.dailyReviews)) {
      if (typeof count === 'number') {
        dailyReviews[dateKey] = Math.max(dailyReviews[dateKey] ?? 0, count);
      }
    }
  }

  const streakDays = Math.max(local.streakDays || 1, cloud.streakDays || 1);
  const lastActiveDate =
    (cloud.lastActiveDate || '') > (local.lastActiveDate || '')
      ? cloud.lastActiveDate!
      : local.lastActiveDate;

  const baseSettings = local.settings.examDateConfigured
    ? local.settings
    : cloud.settings
      ? { ...local.settings, ...cloud.settings }
      : local.settings;

  const settings = {
    ...baseSettings,
    dailyGoalLabel:
      local.settings.dailyGoalLabel || cloud.settings?.dailyGoalLabel || '',
    dailyTasks:
      local.settings.dailyTasks && local.settings.dailyTasks.length > 0
        ? local.settings.dailyTasks
        : cloud.settings?.dailyTasks || [],
  };

  return {
    ...local,
    settings,
    knownIds: Array.from(knownSet).slice(0, 500),
    bookmarkedIds: Array.from(bookmarkedSet).slice(0, 500),
    flashcards,
    checklist: Array.from(checklistMap.values()).slice(0, 300),
    sessions,
    dailyReviews,
    streakDays,
    lastActiveDate,
    lastVisitedFormulaId: local.lastVisitedFormulaId || cloud.lastVisitedFormulaId || '',
  };
}

export function compactFlashcardsForCloud(
  flashcards: Record<string, FlashcardProgress>
): Record<string, FlashcardProgress> {
  const out: Record<string, FlashcardProgress> = {};
  let count = 0;
  for (const [id, card] of Object.entries(flashcards)) {
    if (count >= 500) break;
    if (card.lastReviewedAt > 0 || card.box > 1 || card.wrongCount > 0 || card.correctStreak > 0) {
      out[id] = card;
      count += 1;
    }
  }
  return out;
}

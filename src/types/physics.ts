export type ChapterId =
  | 'master-map'
  | 'line-arc-ring'
  | 'electrostatics'
  | 'current'
  | 'magnetism'
  | 'emi'
  | 'ac'
  | 'em-waves'
  | 'modern-physics'
  | 'semiconductors'
  | 'ray-optics'
  | 'wave-optics'
  | 'experimental-skills'
  | 'class11-mechanics'
  | 'class11-rotational'
  | 'class11-gravitation'
  | 'class11-properties'
  | 'class11-thermodynamics'
  | 'class11-waves-shm';

export type ChainId =
  | 'master'
  | 'line'
  | 'arc'
  | 'ring'
  | 'disc'
  | 'electrostatics'
  | 'gauss'
  | 'dipole'
  | 'capacitor'
  | 'current'
  | 'rc'
  | 'magnetism'
  | 'emi'
  | 'lr'
  | 'lc'
  | 'rlc'
  | 'em-waves'
  | 'modern'
  | 'semiconductors'
  | 'ray-optics'
  | 'wave-optics'
  | 'experimental-skills'
  | 'class11-mechanics'
  | 'class11-rotational'
  | 'class11-gravitation'
  | 'class11-properties'
  | 'class11-thermodynamics'
  | 'class11-waves-shm';

export interface Formula {
  id: string;
  chapter: ChapterId;
  subtopic: string;
  chain: ChainId;
  title: string;
  latex: string;
  conditions: string[];
  variables: { symbol: string; meaning: string }[];
  derivedFrom: string[];
  specialCasesTo: string[];
  analogTo: string[];
  graphId?: string;
  labId?:
    | 'arc-wire'
    | 'rlc'
    | 'rc-dc'
    | 'capacitor'
    | 'magnetism'
    | 'cavity'
    | 'modern'
    | 'semiconductor'
    | 'ray-optics'
    | 'wave-optics';
  flashcard: {
    front: string;
    back: string;
  };
  tags: string[];
  jeeWeight: 1 | 2 | 3;
  verify?: string;
}

export interface ChapterMeta {
  id: ChapterId;
  order: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  accentColor: string;
}

export interface GraphSliderDef {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface GraphCurveLink {
  id: string;
  label: string;
  color: string;
  formulaId: string;
}

export interface GraphGroup {
  id: string;
  index: number;
  title: string;
  chapter: ChapterId;
  subtitle: string;
  xLabel: string;
  yLabel: string;
  sliders: GraphSliderDef[];
  curves: GraphCurveLink[];
}

export interface FlashcardProgress {
  formulaId: string;
  box: 1 | 2 | 3 | 4 | 5;
  nextReviewAt: number;
  lastReviewedAt: number;
  wrongCount: number;
  correctStreak: number;
}

export type ChecklistStage =
  | 'formulasLearnt'
  | 'graphsUnderstood'
  | 'flashcardsDone'
  | 'pyqsSolved'
  | 'revisedX2';

export interface ChecklistItem {
  id: string;
  chapter: ChapterId | 'custom';
  title: string;
  isCustom?: boolean;
  stages: Record<ChecklistStage, boolean>;
}

export interface StudySession {
  id: string;
  mode: 'pomodoro' | 'stopwatch';
  chapter: ChapterId | 'general';
  durationSeconds: number;
  completedAt: number;
  xpEarned?: number;
}

export type ThemeMode = 'dark' | 'light' | 'auto';
export type AccentPalette = 'cyan-violet' | 'emerald-teal' | 'amber-rose';

export interface DailyGoalTask {
  id: string;
  text: string;
  done: boolean;
}

export interface AppSettings {
  theme: ThemeMode;
  accent: AccentPalette;
  fontSize: 'sm' | 'md' | 'lg';
  examDate: string; // YYYY-MM-DD
  examDateConfigured: boolean;
  dailyGoalMinutes: number;
  dailyGoalLabel?: string;
  dailyTasks?: DailyGoalTask[];
  pomodoroWorkMin: number;
  pomodoroBreakMin: number;
}

export type AppTab =
  | 'home'
  | 'web'
  | 'labs'
  | 'notes'
  | 'glossary'
  | 'graphs'
  | 'quiz'
  | 'flashcards'
  | 'checklist'
  | 'timer'
  | 'doubt-solver'
  | 'test-series'
  | 'community'
  | 'settings'
  | 'audit';

export interface PersistedState {
  settings: AppSettings;
  knownIds: string[];
  bookmarkedIds: string[];
  flashcards: Record<string, FlashcardProgress>;
  checklist: ChecklistItem[];
  sessions: StudySession[];
  dailyReviews: Record<string, number>;
  streakDays: number;
  lastActiveDate: string;
  lastVisitedFormulaId: string;
  lastVisitedTab: AppTab;
}

export type CommunityChannel =
  | 'general'
  | 'electromagnetism'
  | 'modern-physics'
  | 'optics'
  | 'semiconductors';

export interface PublicProfile {
  uid: string;
  guestCode: string;
  displayName: string;
  authType: 'guest' | 'gmail';
  avatarColor: string;
  knownCount: number;
  bookmarkedCount: number;
  streakDays: number;
  todayReviews: number;
  totalStudyMinutes: number;
  focusXp?: number;
  checklistDone: number;
  chapterKnown: Record<string, number>;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface DoubtCommunityDraft {
  channel: CommunityChannel;
  text: string;
  formulaTag: string;
}

export interface CommunityMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderCode: string;
  senderAuthType: 'guest' | 'gmail';
  channel: CommunityChannel;
  text: string;
  photoDataUrl: string;
  formulaTag: string;
  createdAtMs: number;
}

export interface DmThread {
  id: string;
  participantA: string;
  participantB: string;
  participants: string[];
  nameA: string;
  nameB: string;
  codeA: string;
  codeB: string;
  status: 'pending' | 'accepted';
  initiatedBy: string;
  lastMessage: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface DmMessage {
  id: string;
  threadId: string;
  participantA: string;
  participantB: string;
  participants: string[];
  senderId: string;
  senderName: string;
  text: string;
  photoDataUrl: string;
  createdAtMs: number;
}

export type StudyRoomStatusBadge =
  | 'focusing'
  | 'solving-pyqs'
  | 'revising-notes'
  | 'on-break'
  | 'paused';

export interface StudyRoom {
  id: string;
  roomCode: string;
  title: string;
  chapter: string;
  hostUid: string;
  hostName: string;
  hostCode: string;
  phase: 'focus' | 'break';
  workMinutes: number;
  breakMinutes: number;
  isRunning: boolean;
  remainingSeconds: number;
  phaseEndsAtMs: number;
  isActive: boolean;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface StudyRoomParticipant {
  uid: string;
  roomId: string;
  displayName: string;
  guestCode: string;
  authType: 'guest' | 'gmail';
  avatarColor: string;
  status: StudyRoomStatusBadge;
  focusTopic: string;
  joinedAtMs: number;
  updatedAtMs: number;
}

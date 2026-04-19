export type TrueFalseQuestion = {
  id: string;
  type: "true-false";
  statement: string;
  correct: boolean;
  explanation: string;
};

export type AppUserRole = "admin" | "teacher" | "student";

export type AppUser = {
  id: string;
  name: string;
  avatar: string;
  role: AppUserRole;
  teacherId?: string | null;
};

export type QuestionGameMode = "pirate" | "run" | "blind-box" | "elimination" | "arena";

export type ArenaRound = 1 | 2 | 3;

export type QuestionAssignment = {
  gameModes: QuestionGameMode[];
  arenaRound: ArenaRound | null;
};

export type MultiTrueFalseStatement = {
  id: string;
  label: "a." | "b." | "c." | "d.";
  text: string;
  correct: boolean;
};

export type MultiTrueFalseQuestion = {
  id: string;
  type: "multi-true-false";
  question: string;
  statements: MultiTrueFalseStatement[];
  explanation: string;
};

export type QuestionLibraryMeta = {
  gradeLevel?: "10" | "11" | "12" | "other" | null;
  subject?: string | null;
  chapter?: string | null;
  lesson?: string | null;
};

export type SyncedQuestionMeta = QuestionAssignment & QuestionLibraryMeta & {
  createdAt?: string;
  updatedAt?: string;
  createdByUid?: string | null;
  createdByName?: string | null;
  createdByRole?: AppUserRole | null;
};

export type SyncedTrueFalseQuestion = TrueFalseQuestion & SyncedQuestionMeta;

export type SyncedMultiTrueFalseQuestion = MultiTrueFalseQuestion & SyncedQuestionMeta;

export type SyncedQuestion = SyncedTrueFalseQuestion | SyncedMultiTrueFalseQuestion;

export type Student = {
  id: string;
  name: string;
  avatar: string;
};

/* ── Real exam scoring: 1ý=0.1, 2ý=0.25, 3ý=0.5, 4ý=1.0 ── */
export function calcRealScore(correctCount: number): number {
  if (correctCount <= 0) return 0;
  if (correctCount === 1) return 0.1;
  if (correctCount === 2) return 0.25;
  if (correctCount === 3) return 0.5;
  return 1.0;
}

export function scoreLabel(correctCount: number): string {
  if (correctCount === 4) return "4/4 → 1.0đ ⭐ Hoàn hảo!";
  if (correctCount === 3) return "3/4 → 0.5đ ⚠️ Mất 0.5đ!";
  if (correctCount === 2) return "2/4 → 0.25đ 😥 Mất 0.75đ!";
  if (correctCount === 1) return "1/4 → 0.1đ 😱 Mất 0.9đ!";
  return "0/4 → 0đ 💀 Mất trọn 1đ!";
}

export type ExamQuestionResult = {
  questionId: string;
  answers: Record<string, boolean>;
  correctCount: number;
  score: number;
};

export type ExamResult = {
  id: string;
  date: string;
  questions: ExamQuestionResult[];
  totalScore: number;
  maxScore: number;
  timeSpent: number;
};

export type ErrorRecord = {
  id: string;
  statementText: string;
  userAnswer: boolean;
  correctAnswer: boolean;
  explanation: string;
  questionId: string;
  date: string;
};

import type {
  AppUser,
  ArenaRound,
  MultiTrueFalseStatement,
  QuestionAssignment,
  QuestionGameMode,
  SyncedMultiTrueFalseQuestion,
  SyncedQuestion,
  SyncedTrueFalseQuestion,
} from "../types";

const QUESTION_BANK_ENDPOINT = "/api/questions";
const QUESTION_BANK_REFRESH_EVENT = "question-bank:refresh";
const validRoles = new Set(["admin", "teacher", "student"] as const);
const validModes = new Set(["pirate", "run", "blind-box", "elimination", "arena"] as const);

export type CreateTrueFalseQuestionInput = {
  type: "true-false";
  statement: string;
  correct: boolean;
  explanation: string;
} & QuestionAssignment;

export type CreateMultiTrueFalseQuestionInput = {
  type: "multi-true-false";
  question: string;
  statements: MultiTrueFalseStatement[];
  explanation: string;
} & QuestionAssignment;

export type CreateQuestionInput =
  | CreateTrueFalseQuestionInput
  | CreateMultiTrueFalseQuestionInput;

export type QuestionLibraryFilter = {
  gradeLevel?: string | null;
  subject?: string | null;
  chapter?: string | null;
  lesson?: string | null;
};

type QuestionBankSnapshot = {
  configured: boolean;
  questions: SyncedQuestion[];
};

class QuestionBankApiError extends Error {
  configured: boolean;

  constructor(message: string, configured = true) {
    super(message);
    this.name = "QuestionBankApiError";
    this.configured = configured;
  }
}

function isArenaRound(value: unknown): value is ArenaRound {
  return value === 1 || value === 2 || value === 3;
}

function toIso(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  return undefined;
}

function normalizeSyncedQuestion(question: SyncedQuestion): SyncedQuestion {
  const data = question as Partial<SyncedQuestion> & Record<string, unknown>;
  const gameModes = Array.isArray(data.gameModes)
    ? data.gameModes.filter((mode: unknown): mode is QuestionGameMode => validModes.has(mode as QuestionGameMode))
    : [];
  const createdByRole =
    typeof data.createdByRole === "string" && validRoles.has(data.createdByRole as "admin" | "teacher" | "student")
      ? data.createdByRole
      : null;
  const baseMeta = {
    gameModes,
    arenaRound: isArenaRound(data.arenaRound) ? data.arenaRound : null,
    gradeLevel:
      data.gradeLevel === "10" || data.gradeLevel === "11" || data.gradeLevel === "12" || data.gradeLevel === "other"
        ? data.gradeLevel
        : null,
    subject: typeof data.subject === "string" ? data.subject : null,
    chapter: typeof data.chapter === "string" ? data.chapter : null,
    lesson: typeof data.lesson === "string" ? data.lesson : null,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    createdByUid: typeof data.createdByUid === "string" ? data.createdByUid : null,
    createdByName: typeof data.createdByName === "string" ? data.createdByName : null,
    createdByRole,
  };

  if (data.type === "true-false") {
    return {
      id: typeof data.id === "string" ? data.id : "",
      type: "true-false",
      statement: typeof data.statement === "string" ? data.statement : "",
      correct: Boolean(data.correct),
      explanation: typeof data.explanation === "string" ? data.explanation : "",
      ...baseMeta,
    } satisfies SyncedTrueFalseQuestion;
  }

  return {
    id: typeof data.id === "string" ? data.id : "",
    type: "multi-true-false",
    question: typeof data.question === "string" ? data.question : "",
    statements: Array.isArray(data.statements)
      ? data.statements.map((statement, index) => ({
          id:
            typeof statement?.id === "string"
              ? statement.id
              : ["a", "b", "c", "d"][index] ?? String(index),
          label:
            statement?.label === "a." ||
            statement?.label === "b." ||
            statement?.label === "c." ||
            statement?.label === "d."
              ? statement.label
              : (["a.", "b.", "c.", "d."][index] ?? "a."),
          text: typeof statement?.text === "string" ? statement.text : "",
          correct: Boolean(statement?.correct),
        }))
      : [],
    explanation: typeof data.explanation === "string" ? data.explanation : "",
    ...baseMeta,
  } satisfies SyncedMultiTrueFalseQuestion;
}

function emitQuestionBankRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(QUESTION_BANK_REFRESH_EVENT));
  }
}

async function readResponseBody(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchQuestionBankSnapshot(teacherId?: string | null): Promise<QuestionBankSnapshot> {
  const url = teacherId ? `${QUESTION_BANK_ENDPOINT}?teacherId=${encodeURIComponent(teacherId)}` : QUESTION_BANK_ENDPOINT;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new QuestionBankApiError(
      typeof data?.error === "string" ? data.error : "Không thể tải ngân hàng câu hỏi từ server.",
      data?.configured !== false,
    );
  }

  return {
    configured: data?.configured !== false,
    questions: Array.isArray(data?.questions) ? data.questions.map(normalizeSyncedQuestion) : [],
  };
}

export function subscribeToQuestions(
  teacherId: string | null | undefined,
  onData: (questions: SyncedQuestion[]) => void,
  onError: (message: string) => void,
  onConfigChange?: (configured: boolean) => void,
) {
  let disposed = false;

  const load = async () => {
    try {
      const snapshot = await fetchQuestionBankSnapshot(teacherId);
      if (disposed) return;
      onConfigChange?.(snapshot.configured);
      onData(snapshot.questions);
    } catch (error) {
      if (disposed) return;
      if (error instanceof QuestionBankApiError) {
        onConfigChange?.(error.configured);
        onError(error.message);
        return;
      }

      onConfigChange?.(true);
      onError("Không thể đồng bộ ngân hàng câu hỏi từ server.");
    }
  };

  void load();

  const refreshHandler = () => {
    void load();
  };

  const intervalId = globalThis.setInterval(() => {
    void load();
  }, 10000);

  if (typeof window !== "undefined") {
    window.addEventListener(QUESTION_BANK_REFRESH_EVENT, refreshHandler);
  }

  return () => {
    disposed = true;
    globalThis.clearInterval(intervalId);
    if (typeof window !== "undefined") {
      window.removeEventListener(QUESTION_BANK_REFRESH_EVENT, refreshHandler);
    }
  };
}

export async function saveQuestion(input: CreateQuestionInput, user: AppUser | null) {
  const response = await fetch(QUESTION_BANK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ question: input, user }),
  });
  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new QuestionBankApiError(
      typeof data?.error === "string" ? data.error : "Không thể lưu câu hỏi lên server.",
      data?.configured !== false,
    );
  }

  emitQuestionBankRefresh();
}

export async function saveQuestionsBatch(inputs: CreateQuestionInput[], user: AppUser | null) {
  if (inputs.length === 0) return 0;

  const response = await fetch(QUESTION_BANK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ questions: inputs, user }),
  });
  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new QuestionBankApiError(
      typeof data?.error === "string" ? data.error : "Không thể nhập câu hỏi hàng loạt lên server.",
      data?.configured !== false,
    );
  }

  emitQuestionBankRefresh();
  return typeof data?.count === "number" ? data.count : inputs.length;
}

export async function removeQuestion(questionId: string) {
  const response = await fetch(`${QUESTION_BANK_ENDPOINT}?id=${encodeURIComponent(questionId)}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });
  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new QuestionBankApiError(
      typeof data?.error === "string" ? data.error : "Không thể xóa câu hỏi trên server.",
      data?.configured !== false,
    );
  }

  emitQuestionBankRefresh();
}

export function isTrueFalseQuestion(question: SyncedQuestion): question is SyncedTrueFalseQuestion {
  return question.type === "true-false";
}

export function isMultiTrueFalseQuestion(question: SyncedQuestion): question is SyncedMultiTrueFalseQuestion {
  return question.type === "multi-true-false";
}

export function filterTrueFalseQuestionsByMode(
  questions: SyncedQuestion[],
  mode: Extract<QuestionGameMode, "pirate" | "run">,
) {
  return questions.filter(isTrueFalseQuestion).filter((question) => question.gameModes.includes(mode));
}

export function filterMultiTrueFalseQuestionsByMode(
  questions: SyncedQuestion[],
  mode: Extract<QuestionGameMode, "pirate" | "blind-box" | "elimination" | "arena">,
  arenaRound?: ArenaRound,
) {
  return questions
    .filter(isMultiTrueFalseQuestion)
    .filter((question) => question.gameModes.includes(mode))
    .filter((question) => (mode === "arena" ? question.arenaRound === arenaRound : true));
}

export function filterQuestionsByLibrary(questions: SyncedQuestion[], filter: QuestionLibraryFilter) {
  return questions.filter((question) => {
    const matchesGrade = !filter.gradeLevel || question.gradeLevel === filter.gradeLevel;
    const matchesSubject = !filter.subject || (question.subject ?? "").toLowerCase().includes(filter.subject.toLowerCase());
    const matchesChapter = !filter.chapter || (question.chapter ?? "").toLowerCase().includes(filter.chapter.toLowerCase());
    const matchesLesson = !filter.lesson || (question.lesson ?? "").toLowerCase().includes(filter.lesson.toLowerCase());
    return matchesGrade && matchesSubject && matchesChapter && matchesLesson;
  });
}

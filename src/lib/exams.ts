import type { AppUser, SyncedQuestion } from "../types";

export type ExamAudience = "class" | "students" | "all";

export type ExamDocument = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdByUid: string | null;
  createdByName: string | null;
  createdByRole: AppUser["role"] | null;
  questionIds: string[];
  questionSnapshot: SyncedQuestion[];
  audience: ExamAudience;
  classId: string | null;
  className: string | null;
  status: "draft" | "published";
};

type SavedExamPayload = {
  title: string;
  description: string;
  questionIds: string[];
  questionSnapshot: SyncedQuestion[];
  audience: ExamAudience;
  classId: string | null;
  className: string | null;
  status: "draft" | "published";
};

type ExamAttemptPayload = {
  examId: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, boolean>;
  submittedAt?: string;
};

const EXAMS_ENDPOINT = "/api/exams";
const EXAM_ATTEMPTS_ENDPOINT = "/api/exam-attempts";

async function readResponseBody(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function saveExam(payload: SavedExamPayload, user: AppUser | null) {
  const response = await fetch(EXAMS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ exam: payload, user }),
  });

  const data = await readResponseBody(response);
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : "Không thể lưu đề thi.");
  }

  return data as { ok: true; id: string };
}

export async function fetchExams(teacherId?: string | null) {
  const url = teacherId ? `${EXAMS_ENDPOINT}?teacherId=${encodeURIComponent(teacherId)}` : EXAMS_ENDPOINT;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : "Không thể tải danh sách đề thi.");
  }

  return Array.isArray(data?.exams) ? (data.exams as ExamDocument[]) : [];
}

export async function fetchExamById(examId: string) {
  const response = await fetch(`${EXAMS_ENDPOINT}?id=${encodeURIComponent(examId)}`, { headers: { Accept: "application/json" } });
  const data = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : "Không thể tải đề thi.");
  }

  return (data?.exam as ExamDocument) ?? null;
}

export async function saveExamAttempt(payload: ExamAttemptPayload, user: AppUser | null) {
  const response = await fetch(EXAM_ATTEMPTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ attempt: payload, user }),
  });
  const data = await readResponseBody(response);
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : "Không thể lưu bài làm.");
  }
  return data as { ok: true; id: string };
}

export async function fetchExamAttempts(examId?: string | null) {
  const url = examId ? `${EXAM_ATTEMPTS_ENDPOINT}?examId=${encodeURIComponent(examId)}` : EXAM_ATTEMPTS_ENDPOINT;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await readResponseBody(response);
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : "Không thể tải bài làm.");
  }
  return Array.isArray(data?.attempts) ? data.attempts : [];
}

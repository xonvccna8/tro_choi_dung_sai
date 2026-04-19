import type { AppUser, SyncedQuestion } from "../types";

export type GameAssignmentMode = "pirate" | "run" | "blind-box" | "elimination" | "arena";
export type GameAssignmentAudience = "class" | "students" | "all";

export type GameAssignmentDocument = {
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
  mode: GameAssignmentMode;
  audience: GameAssignmentAudience;
  classId: string | null;
  className: string | null;
  status: "draft" | "published";
};

type SavedGameAssignmentPayload = {
  title: string;
  description: string;
  questionIds: string[];
  questionSnapshot: SyncedQuestion[];
  mode: GameAssignmentMode;
  audience: GameAssignmentAudience;
  classId: string | null;
  className: string | null;
  status: "draft" | "published";
};

export type UpdateGameAssignmentPayload = SavedGameAssignmentPayload & { id: string };

const ENDPOINT = "/api/game-assignments";

async function readResponseBody(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function saveGameAssignment(payload: SavedGameAssignmentPayload, user: AppUser | null) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ assignment: payload, user }),
  });
  const data = await readResponseBody(response);
  if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Không thể lưu giao trò chơi.");
  return data as { ok: true; id: string };
}

export async function updateGameAssignment(payload: UpdateGameAssignmentPayload, user: AppUser | null) {
  const response = await fetch(ENDPOINT, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ id: payload.id, assignment: payload, user }),
  });
  const data = await readResponseBody(response);
  if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Không thể cập nhật giao trò chơi.");
  return data as { ok: true; id: string };
}

export async function deleteGameAssignment(id: string) {
  const response = await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { Accept: "application/json" } });
  const data = await readResponseBody(response);
  if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Không thể xóa giao trò chơi.");
  return data as { ok: true; id: string };
}

export async function fetchGameAssignments(teacherId?: string | null) {
  const url = teacherId ? `${ENDPOINT}?teacherId=${encodeURIComponent(teacherId)}` : ENDPOINT;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await readResponseBody(response);
  if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Không thể tải giao trò chơi.");
  return Array.isArray(data?.assignments) ? (data.assignments as GameAssignmentDocument[]) : [];
}

export async function fetchGameAssignmentById(id: string) {
  const response = await fetch(`${ENDPOINT}?id=${encodeURIComponent(id)}`, { headers: { Accept: "application/json" } });
  const data = await readResponseBody(response);
  if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Không thể tải giao trò chơi.");
  return (data?.assignment as GameAssignmentDocument) ?? null;
}

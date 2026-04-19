import type { AppUser } from "../types";

export type GameResultPayload = {
  assignmentId: string;
  assignmentTitle: string;
  mode: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, boolean>;
};

const ENDPOINT = "/api/game-results";

async function readResponseBody(response: Response) {
  try { return await response.json(); } catch { return null; }
}

export async function saveGameResult(payload: GameResultPayload, user: AppUser | null) {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ result: payload, user }),
  });
  const data = await readResponseBody(response);
  if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Không thể lưu kết quả game.");
  return data as { ok: true; id: string };
}

export async function fetchGameResults(assignmentId?: string | null) {
  const url = assignmentId ? `${ENDPOINT}?assignmentId=${encodeURIComponent(assignmentId)}` : ENDPOINT;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await readResponseBody(response);
  if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Không thể tải kết quả game.");
  return Array.isArray(data?.results) ? data.results : [];
}

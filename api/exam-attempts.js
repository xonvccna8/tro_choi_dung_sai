import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const ATTEMPTS_COLLECTION = "examAttempts";
const validRoles = new Set(["admin", "teacher", "student"]);

function sendJson(res, statusCode, payload) {
  res.status(statusCode);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.send(JSON.stringify(payload));
}

function readServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin chưa được cấu hình đầy đủ. Hãy thêm FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL và FIREBASE_PRIVATE_KEY vào Vercel env.");
  }
  return { projectId, clientEmail, privateKey };
}

function getAdminDb() {
  const app = getApps()[0] ?? initializeApp({ credential: cert(readServiceAccount()) });
  return getFirestore(app);
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;
  return {
    id: typeof user.id === "string" ? user.id.trim() : null,
    name: typeof user.name === "string" ? user.name.trim() : null,
    role: typeof user.role === "string" && validRoles.has(user.role) ? user.role : null,
  };
}

function normalizeAttemptInput(input) {
  if (!input || typeof input !== "object") throw new Error("Payload bài làm không hợp lệ.");
  const examId = typeof input.examId === "string" ? input.examId.trim() : "";
  const examTitle = typeof input.examTitle === "string" ? input.examTitle.trim() : "";
  const score = typeof input.score === "number" ? input.score : 0;
  const totalQuestions = typeof input.totalQuestions === "number" ? input.totalQuestions : 0;
  const answers = input.answers && typeof input.answers === "object" ? input.answers : {};
  if (!examId) throw new Error("Thiếu id đề thi.");
  return { examId, examTitle, score, totalQuestions, answers };
}

function toIso(value) {
  if (value && typeof value === "object" && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return undefined;
}

function mapAttempt(documentSnapshot) {
  const data = documentSnapshot.data() ?? {};
  return {
    id: documentSnapshot.id,
    examId: typeof data.examId === "string" ? data.examId : "",
    examTitle: typeof data.examTitle === "string" ? data.examTitle : "",
    score: typeof data.score === "number" ? data.score : 0,
    totalQuestions: typeof data.totalQuestions === "number" ? data.totalQuestions : 0,
    answers: data.answers && typeof data.answers === "object" ? data.answers : {},
    createdAt: toIso(data.createdAt),
    createdByUid: typeof data.createdByUid === "string" ? data.createdByUid : null,
    createdByName: typeof data.createdByName === "string" ? data.createdByName : null,
    createdByRole: typeof data.createdByRole === "string" && validRoles.has(data.createdByRole) ? data.createdByRole : null,
  };
}

async function listAttempts(req, res) {
  const db = getAdminDb();
  const examId = typeof req.query.examId === "string" ? req.query.examId.trim() : "";
  let q = db.collection(ATTEMPTS_COLLECTION);
  if (examId) q = q.where("examId", "==", examId);
  const snapshot = await q.get();
  const attempts = snapshot.docs.map(mapAttempt).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  sendJson(res, 200, { ok: true, attempts });
}

async function createAttempt(req, res) {
  const db = getAdminDb();
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
  const actor = normalizeUser(body.user);
  const input = normalizeAttemptInput(body.attempt);
  const ref = db.collection(ATTEMPTS_COLLECTION).doc();
  const timestamp = FieldValue.serverTimestamp();

  await ref.set({
    ...input,
    createdAt: timestamp,
    createdByUid: actor?.id ?? null,
    createdByName: actor?.name ?? null,
    createdByRole: actor?.role ?? null,
  });

  sendJson(res, 200, { ok: true, id: ref.id });
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") return await listAttempts(req, res);
    if (req.method === "POST") return await createAttempt(req, res);
    sendJson(res, 405, { ok: false, error: "Method không được hỗ trợ." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định từ Firebase Admin.";
    const isConfigError = message.includes("Firebase Admin chưa được cấu hình đầy đủ");
    sendJson(res, isConfigError ? 503 : 500, { ok: false, error: message, configured: !isConfigError });
  }
}

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const EXAMS_COLLECTION = "exams";
const validRoles = new Set(["admin", "teacher", "student"]);
const validAudiences = new Set(["all", "students", "class"]);

function sendJson(res, statusCode, payload) {
  res.status(statusCode);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.send(JSON.stringify(payload));
}

function toIso(value) {
  if (value && typeof value === "object" && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return undefined;
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

function normalizeExamInput(input) {
  if (!input || typeof input !== "object") throw new Error("Payload đề thi không hợp lệ.");

  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) throw new Error("Đề thi đang thiếu tiêu đề.");

  const description = typeof input.description === "string" ? input.description.trim() : "";
  const questionIds = Array.isArray(input.questionIds) ? input.questionIds.filter((item) => typeof item === "string" && item.trim()) : [];
  const questionSnapshot = Array.isArray(input.questionSnapshot) ? input.questionSnapshot : [];
  const audience = typeof input.audience === "string" && validAudiences.has(input.audience) ? input.audience : "all";
  const classId = typeof input.classId === "string" && input.classId.trim() ? input.classId.trim() : null;
  const className = typeof input.className === "string" && input.className.trim() ? input.className.trim() : null;
  const status = input.status === "published" ? "published" : "draft";

  if (questionIds.length === 0) throw new Error("Đề thi cần ít nhất 1 câu hỏi.");

  return { title, description, questionIds, questionSnapshot, audience, classId, className, status };
}

function mapExam(documentSnapshot) {
  const data = documentSnapshot.data() ?? {};
  return {
    id: documentSnapshot.id,
    title: typeof data.title === "string" ? data.title : "",
    description: typeof data.description === "string" ? data.description : "",
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    createdByUid: typeof data.createdByUid === "string" ? data.createdByUid : null,
    createdByName: typeof data.createdByName === "string" ? data.createdByName : null,
    createdByRole: typeof data.createdByRole === "string" && validRoles.has(data.createdByRole) ? data.createdByRole : null,
    questionIds: Array.isArray(data.questionIds) ? data.questionIds : [],
    questionSnapshot: Array.isArray(data.questionSnapshot) ? data.questionSnapshot : [],
    audience: typeof data.audience === "string" && validAudiences.has(data.audience) ? data.audience : "all",
    classId: typeof data.classId === "string" ? data.classId : null,
    className: typeof data.className === "string" ? data.className : null,
    status: data.status === "published" ? "published" : "draft",
  };
}

async function getExamById(req, res) {
  const db = getAdminDb();
  const examId = typeof req.query.id === "string" ? req.query.id.trim() : "";
  if (!examId) return sendJson(res, 400, { ok: false, error: "Thiếu id đề thi." });
  const snapshot = await db.collection(EXAMS_COLLECTION).doc(examId).get();
  if (!snapshot.exists) return sendJson(res, 404, { ok: false, error: "Không tìm thấy đề thi." });
  sendJson(res, 200, { ok: true, exam: mapExam(snapshot) });
}

async function listExams(req, res) {
  const db = getAdminDb();
  const teacherId = typeof req.query.teacherId === "string" ? req.query.teacherId.trim() : "";
  let q = db.collection(EXAMS_COLLECTION);
  if (teacherId) q = q.where("createdByUid", "==", teacherId);
  const snapshot = await q.get();
  const exams = snapshot.docs.map(mapExam).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  sendJson(res, 200, { ok: true, exams });
}

async function createExam(req, res) {
  const db = getAdminDb();
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
  const actor = normalizeUser(body.user);
  const input = normalizeExamInput(body.exam);
  const ref = db.collection(EXAMS_COLLECTION).doc();
  const timestamp = FieldValue.serverTimestamp();

  await ref.set({
    ...input,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdByUid: actor?.id ?? null,
    createdByName: actor?.name ?? null,
    createdByRole: actor?.role ?? null,
  });

  sendJson(res, 200, { ok: true, id: ref.id });
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      if (req.query?.id) return await getExamById(req, res);
      return await listExams(req, res);
    }
    if (req.method === "POST") return await createExam(req, res);
    sendJson(res, 405, { ok: false, error: "Method không được hỗ trợ." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định từ Firebase Admin.";
    const isConfigError = message.includes("Firebase Admin chưa được cấu hình đầy đủ");
    sendJson(res, isConfigError ? 503 : 500, { ok: false, error: message, configured: !isConfigError });
  }
}

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const COLLECTION = "gameAssignments";
const validRoles = new Set(["admin", "teacher", "student"]);
const validModes = new Set(["pirate", "run", "blind-box", "elimination", "arena"]);
const validAudiences = new Set(["all", "students", "class"]);

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
  if (!projectId || !clientEmail || !privateKey) throw new Error("Firebase Admin chưa được cấu hình đầy đủ.");
  return { projectId, clientEmail, privateKey };
}

function getAdminDb() { return getFirestore(getApps()[0] ?? initializeApp({ credential: cert(readServiceAccount()) })); }
function toIso(value) { if (value && typeof value === "object" && typeof value.toDate === "function") return value.toDate().toISOString(); if (value instanceof Date) return value.toISOString(); if (typeof value === "string") return value; return undefined; }
function normalizeUser(user) { if (!user || typeof user !== "object") return null; return { id: typeof user.id === "string" ? user.id.trim() : null, name: typeof user.name === "string" ? user.name.trim() : null, role: typeof user.role === "string" && validRoles.has(user.role) ? user.role : null }; }

function normalizeInput(input) {
  if (!input || typeof input !== "object") throw new Error("Payload giao trò chơi không hợp lệ.");
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) throw new Error("Giao trò chơi đang thiếu tiêu đề.");
  const questionIds = Array.isArray(input.questionIds) ? input.questionIds.filter((item) => typeof item === "string" && item.trim()) : [];
  if (questionIds.length === 0) throw new Error("Giao trò chơi cần ít nhất 1 câu hỏi.");
  const mode = typeof input.mode === "string" && validModes.has(input.mode) ? input.mode : "run";
  const audience = typeof input.audience === "string" && validAudiences.has(input.audience) ? input.audience : "all";
  return { title, description: typeof input.description === "string" ? input.description.trim() : "", questionIds, questionSnapshot: Array.isArray(input.questionSnapshot) ? input.questionSnapshot : [], mode, audience, classId: typeof input.classId === "string" && input.classId.trim() ? input.classId.trim() : null, className: typeof input.className === "string" && input.className.trim() ? input.className.trim() : null, status: input.status === "published" ? "published" : "draft" };
}

function mapDoc(docSnap) {
  const data = docSnap.data() ?? {};
  return { id: docSnap.id, title: typeof data.title === "string" ? data.title : "", description: typeof data.description === "string" ? data.description : "", createdAt: toIso(data.createdAt), updatedAt: toIso(data.updatedAt), createdByUid: typeof data.createdByUid === "string" ? data.createdByUid : null, createdByName: typeof data.createdByName === "string" ? data.createdByName : null, createdByRole: typeof data.createdByRole === "string" && validRoles.has(data.createdByRole) ? data.createdByRole : null, questionIds: Array.isArray(data.questionIds) ? data.questionIds : [], questionSnapshot: Array.isArray(data.questionSnapshot) ? data.questionSnapshot : [], mode: typeof data.mode === "string" && validModes.has(data.mode) ? data.mode : "run", audience: typeof data.audience === "string" && validAudiences.has(data.audience) ? data.audience : "all", classId: typeof data.classId === "string" ? data.classId : null, className: typeof data.className === "string" ? data.className : null, status: data.status === "published" ? "published" : "draft" };
}

async function getById(req, res) { const db = getAdminDb(); const id = typeof req.query.id === "string" ? req.query.id.trim() : ""; if (!id) return sendJson(res, 400, { ok: false, error: "Thiếu id." }); const snap = await db.collection(COLLECTION).doc(id).get(); if (!snap.exists) return sendJson(res, 404, { ok: false, error: "Không tìm thấy." }); sendJson(res, 200, { ok: true, assignment: mapDoc(snap) }); }
async function list(req, res) { const db = getAdminDb(); const teacherId = typeof req.query.teacherId === "string" ? req.query.teacherId.trim() : ""; let q = db.collection(COLLECTION); if (teacherId) q = q.where("createdByUid", "==", teacherId); const snap = await q.get(); sendJson(res, 200, { ok: true, assignments: snap.docs.map(mapDoc).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")) }); }
async function create(req, res) { const db = getAdminDb(); const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {}; const actor = normalizeUser(body.user); const input = normalizeInput(body.assignment); const ref = db.collection(COLLECTION).doc(); const timestamp = FieldValue.serverTimestamp(); await ref.set({ ...input, createdAt: timestamp, updatedAt: timestamp, createdByUid: actor?.id ?? null, createdByName: actor?.name ?? null, createdByRole: actor?.role ?? null }); sendJson(res, 200, { ok: true, id: ref.id }); }
async function update(req, res) { const db = getAdminDb(); const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {}; const id = typeof body.id === "string" ? body.id.trim() : ""; if (!id) throw new Error("Thiếu id giao trò chơi."); const input = normalizeInput(body.assignment); const ref = db.collection(COLLECTION).doc(id); const snap = await ref.get(); if (!snap.exists) return sendJson(res, 404, { ok: false, error: "Không tìm thấy." }); await ref.update({ ...input, updatedAt: FieldValue.serverTimestamp() }); sendJson(res, 200, { ok: true, id }); }
async function remove(req, res) { const db = getAdminDb(); const id = typeof req.query.id === "string" ? req.query.id.trim() : ""; if (!id) return sendJson(res, 400, { ok: false, error: "Thiếu id." }); const ref = db.collection(COLLECTION).doc(id); const snap = await ref.get(); if (!snap.exists) return sendJson(res, 404, { ok: false, error: "Không tìm thấy." }); await ref.delete(); sendJson(res, 200, { ok: true, id }); }
export default async function handler(req, res) { try { if (req.method === "GET") { if (req.query?.id) return await getById(req, res); return await list(req, res); } if (req.method === "POST") return await create(req, res); if (req.method === "PUT") return await update(req, res); if (req.method === "DELETE") return await remove(req, res); sendJson(res, 405, { ok: false, error: "Method không được hỗ trợ." }); } catch (error) { const message = error instanceof Error ? error.message : "Lỗi không xác định."; sendJson(res, message.includes("Firebase Admin chưa được cấu hình đầy đủ") ? 503 : 500, { ok: false, error: message }); } }

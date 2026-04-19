import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

const COLLECTION = "gameResults";
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
  if (!projectId || !clientEmail || !privateKey) throw new Error("Firebase Admin chưa được cấu hình đầy đủ.");
  return { projectId, clientEmail, privateKey };
}

function getAdminDb() { return getFirestore(getApps()[0] ?? initializeApp({ credential: cert(readServiceAccount()) })); }
function toIso(value) { if (value && typeof value === "object" && typeof value.toDate === "function") return value.toDate().toISOString(); if (value instanceof Date) return value.toISOString(); if (typeof value === "string") return value; return undefined; }
function normalizeUser(user) { if (!user || typeof user !== "object") return null; return { id: typeof user.id === "string" ? user.id.trim() : null, name: typeof user.name === "string" ? user.name.trim() : null, role: typeof user.role === "string" && validRoles.has(user.role) ? user.role : null }; }

function normalizeInput(input) {
  if (!input || typeof input !== "object") throw new Error("Payload kết quả game không hợp lệ.");
  const assignmentId = typeof input.assignmentId === "string" ? input.assignmentId.trim() : "";
  if (!assignmentId) throw new Error("Thiếu assignmentId.");
  return {
    assignmentId,
    assignmentTitle: typeof input.assignmentTitle === "string" ? input.assignmentTitle.trim() : "",
    mode: typeof input.mode === "string" ? input.mode : "run",
    score: typeof input.score === "number" ? input.score : 0,
    totalQuestions: typeof input.totalQuestions === "number" ? input.totalQuestions : 0,
    answers: input.answers && typeof input.answers === "object" ? input.answers : {},
  };
}

function mapDoc(docSnap) {
  const data = docSnap.data() ?? {};
  return { id: docSnap.id, assignmentId: typeof data.assignmentId === "string" ? data.assignmentId : "", assignmentTitle: typeof data.assignmentTitle === "string" ? data.assignmentTitle : "", mode: typeof data.mode === "string" ? data.mode : "run", score: typeof data.score === "number" ? data.score : 0, totalQuestions: typeof data.totalQuestions === "number" ? data.totalQuestions : 0, answers: data.answers && typeof data.answers === "object" ? data.answers : {}, createdAt: toIso(data.createdAt), createdByUid: typeof data.createdByUid === "string" ? data.createdByUid : null, createdByName: typeof data.createdByName === "string" ? data.createdByName : null, createdByRole: typeof data.createdByRole === "string" && validRoles.has(data.createdByRole) ? data.createdByRole : null };
}

async function list(req, res) { const db = getAdminDb(); const assignmentId = typeof req.query.assignmentId === "string" ? req.query.assignmentId.trim() : ""; let q = db.collection(COLLECTION); if (assignmentId) q = q.where("assignmentId", "==", assignmentId); const snap = await q.get(); sendJson(res, 200, { ok: true, results: snap.docs.map(mapDoc).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")) }); }
async function create(req, res) { const db = getAdminDb(); const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {}; const actor = normalizeUser(body.user); const input = normalizeInput(body.result); const ref = db.collection(COLLECTION).doc(); const timestamp = FieldValue.serverTimestamp(); await ref.set({ ...input, createdAt: timestamp, createdByUid: actor?.id ?? null, createdByName: actor?.name ?? null, createdByRole: actor?.role ?? null }); sendJson(res, 200, { ok: true, id: ref.id }); }

export default async function handler(req, res) { 
  try { 
    if (req.method === "GET") return await list(req, res); 
    if (req.method === "POST") return await create(req, res); 
    sendJson(res, 405, { ok: false, error: "Method không được hỗ trợ." }); 
  } catch (error) { 
    const message = error instanceof Error ? error.message : "Lỗi không xác định."; 
    const isConfigError = message.includes("Firebase Admin chưa được cấu hình đầy đủ");
    
    if (isConfigError && req.method === "GET") {
      try {
        const mockRaw = fs.readFileSync(path.join(process.cwd(), "api/mock_db.json"), "utf8");
        const dbJson = JSON.parse(mockRaw);
        const reqAssignmentId = typeof req.query.assignmentId === "string" ? req.query.assignmentId.trim() : "";
        let results = dbJson.gameResults || [];
        if (reqAssignmentId) results = results.filter(r => r.assignmentId === reqAssignmentId);
        results.sort((a, b) => (b.playedAt ?? "").localeCompare(a.playedAt ?? ""));
        return sendJson(res, 200, { ok: true, results });
      } catch (e) {}
    }
    
    sendJson(res, isConfigError ? 503 : 500, { ok: false, error: message }); 
  } 
}

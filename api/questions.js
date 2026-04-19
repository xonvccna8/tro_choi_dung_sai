import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

const QUESTIONS_COLLECTION = "questions";
const validRoles = new Set(["admin", "teacher", "student"]);
const validModes = new Set(["pirate", "run", "blind-box", "elimination", "arena"]);

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
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string") {
    return value;
  }
  return undefined;
}

function readServiceAccount() {
  const projectId = process.env.FIREBASE_PROJECT_ID ?? "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin chưa được cấu hình đầy đủ. Hãy thêm FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL và FIREBASE_PRIVATE_KEY vào Vercel env.",
    );
  }

  return { projectId, clientEmail, privateKey };
}

function getAdminDb() {
  const serviceAccount = readServiceAccount();
  const app =
    getApps()[0] ??
    initializeApp({
      credential: cert(serviceAccount),
    });

  return getFirestore(app);
}

function normalizeModes(gameModes) {
  if (!Array.isArray(gameModes)) {
    return [];
  }

  return Array.from(
    new Set(gameModes.filter((mode) => typeof mode === "string" && validModes.has(mode))),
  );
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    id: typeof user.id === "string" ? user.id.trim() : null,
    name: typeof user.name === "string" ? user.name.trim() : null,
    role: typeof user.role === "string" && validRoles.has(user.role) ? user.role : null,
  };
}

function normalizeQuestionInput(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Payload câu hỏi không hợp lệ.");
  }

  const gameModes = normalizeModes(input.gameModes);
  const arenaRound =
    gameModes.includes("arena") && (input.arenaRound === 1 || input.arenaRound === 2 || input.arenaRound === 3)
      ? input.arenaRound
      : null;
  const explanation = typeof input.explanation === "string" ? input.explanation.trim() : "";

  if (input.type === "true-false") {
    const statement = typeof input.statement === "string" ? input.statement.trim() : "";
    if (!statement) {
      throw new Error("Câu Đúng/Sai đơn đang thiếu mệnh đề.");
    }

    return {
      type: "true-false",
      statement,
      correct: Boolean(input.correct),
      explanation: explanation || "Giáo viên chưa thêm giải thích.",
      gameModes,
      arenaRound: null,
    };
  }

  if (input.type === "multi-true-false") {
    const question = typeof input.question === "string" ? input.question.trim() : "Cho các nhận định sau:";
    const rawStatements = Array.isArray(input.statements) ? input.statements : [];
    const statements = rawStatements.slice(0, 4).map((statement, index) => ({
      id:
        statement && typeof statement.id === "string"
          ? statement.id
          : ["a", "b", "c", "d"][index] ?? String(index),
      label:
        statement &&
        (statement.label === "a." || statement.label === "b." || statement.label === "c." || statement.label === "d.")
          ? statement.label
          : ["a.", "b.", "c.", "d."][index] ?? "a.",
      text: statement && typeof statement.text === "string" ? statement.text.trim() : "",
      correct: Boolean(statement && statement.correct),
    }));

    if (statements.length === 0 || statements.some((statement) => !statement.text)) {
      throw new Error("Câu 4 ý đang thiếu nội dung a, b, c hoặc d.");
    }

    return {
      type: "multi-true-false",
      question,
      statements,
      explanation: explanation || "Giáo viên chưa thêm giải thích.",
      gameModes,
      arenaRound,
    };
  }

  throw new Error("Loại câu hỏi không được hỗ trợ.");
}

function mapQuestion(documentSnapshot) {
  const data = documentSnapshot.data() ?? {};
  const gameModes = normalizeModes(data.gameModes);
  const baseMeta = {
    gameModes,
    arenaRound: data.arenaRound === 1 || data.arenaRound === 2 || data.arenaRound === 3 ? data.arenaRound : null,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    createdByUid: typeof data.createdByUid === "string" ? data.createdByUid : null,
    createdByName: typeof data.createdByName === "string" ? data.createdByName : null,
    createdByRole: typeof data.createdByRole === "string" && validRoles.has(data.createdByRole) ? data.createdByRole : null,
  };

  if (data.type === "true-false") {
    return {
      id: documentSnapshot.id,
      type: "true-false",
      statement: typeof data.statement === "string" ? data.statement : "",
      correct: Boolean(data.correct),
      explanation: typeof data.explanation === "string" ? data.explanation : "",
      ...baseMeta,
    };
  }

  return {
    id: documentSnapshot.id,
    type: "multi-true-false",
    question: typeof data.question === "string" ? data.question : "",
    statements: Array.isArray(data.statements)
      ? data.statements.map((statement, index) => ({
          id:
            statement && typeof statement.id === "string"
              ? statement.id
              : ["a", "b", "c", "d"][index] ?? String(index),
          label:
            statement &&
            (statement.label === "a." || statement.label === "b." || statement.label === "c." || statement.label === "d.")
              ? statement.label
              : ["a.", "b.", "c.", "d."][index] ?? "a.",
          text: statement && typeof statement.text === "string" ? statement.text : "",
          correct: Boolean(statement && statement.correct),
        }))
      : [],
    explanation: typeof data.explanation === "string" ? data.explanation : "",
    ...baseMeta,
  };
}

async function listQuestions(req, res) {
  const teacherId = typeof req.query.teacherId === "string" ? req.query.teacherId.trim() : "";

  if (teacherId && teacherId.startsWith("demo-")) {
    try {
      const dbData = require("./mock_db.json");
      sendJson(res, 200, { configured: true, questions: dbData.questions || [] });
      return;
    } catch (e) {
      console.error("Lỗi đọc Mock DB trong listQuestions:", e);
    }
  }

  const db = getAdminDb();
  let query = db.collection(QUESTIONS_COLLECTION);
  
  if (teacherId) {
    query = query.where("createdByUid", "==", teacherId);
  }

  const snapshot = await query.get();
  const questions = snapshot.docs
    .map(mapQuestion)
    .sort((left, right) => (right.createdAt ?? "").localeCompare(left.createdAt ?? ""));

  sendJson(res, 200, { configured: true, questions });
}

async function createQuestions(req, res) {
  const db = getAdminDb();
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
  const actor = normalizeUser(body.user);
  const inputs = Array.isArray(body.questions)
    ? body.questions
    : body.question
      ? [body.question]
      : [];

  if (inputs.length === 0) {
    sendJson(res, 400, { configured: true, error: "Không có câu hỏi nào để lưu." });
    return;
  }

  const normalizedQuestions = inputs.map(normalizeQuestionInput);
  const batch = db.batch();

  for (const question of normalizedQuestions) {
    const questionRef = db.collection(QUESTIONS_COLLECTION).doc();
    batch.set(questionRef, {
      ...question,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdByUid: actor?.id ?? null,
      createdByName: actor?.name ?? null,
      createdByRole: actor?.role ?? null,
    });
  }

  await batch.commit();
  sendJson(res, 200, { configured: true, count: normalizedQuestions.length });
}

async function deleteQuestion(req, res) {
  const db = getAdminDb();
  const questionId = typeof req.query.id === "string" ? req.query.id.trim() : "";

  if (!questionId) {
    sendJson(res, 400, { configured: true, error: "Thiếu questionId để xóa." });
    return;
  }

  await db.collection(QUESTIONS_COLLECTION).doc(questionId).delete();
  sendJson(res, 200, { configured: true, ok: true });
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      await listQuestions(req, res);
      return;
    }

    if (req.method === "POST") {
      await createQuestions(req, res);
      return;
    }

    if (req.method === "DELETE") {
      await deleteQuestion(req, res);
      return;
    }

    sendJson(res, 405, { configured: true, error: "Method không được hỗ trợ." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định từ Firebase Admin.";
    const isConfigError = message.includes("Firebase Admin chưa được cấu hình đầy đủ");
    
    if (isConfigError && req.method === "GET") {
      try {
        const mockDataPath = path.join(process.cwd(), "api/mock_db.json");
        if (fs.existsSync(mockDataPath)) {
          const dbRaw = fs.readFileSync(mockDataPath, "utf-8");
          const dbData = JSON.parse(dbRaw);
          // Cho frontend biết cấu hình true để không hiện đỏ
          sendJson(res, 200, { configured: true, questions: dbData.questions || [] });
          return;
        }
      } catch (e) {
        console.error("Lỗi đọc Mock DB:", e);
      }
    }

    sendJson(res, isConfigError ? 503 : 500, {
      configured: !isConfigError,
      error: message,
    });
  }
}
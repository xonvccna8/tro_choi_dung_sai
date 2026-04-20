import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { AppUser, TrueFalseQuestion } from "../types";
import { db } from "./firebase";

export type BattleMode = "duel" | "live";
export type BattleRoomStatus = "scheduled" | "live" | "finished";
export type BattlePlayerStatus = "joined" | "playing" | "finished";

export type BattleRoomQuestion = Pick<TrueFalseQuestion, "id" | "statement" | "correct" | "explanation">;

export type BattleAnswerRecord = {
  questionId: string;
  answer: boolean;
  isCorrect: boolean;
  responseMs: number;
  points: number;
  answeredAt: string;
  questionIndex: number;
};

export type BattlePlayer = {
  userId: string;
  name: string;
  avatar: string;
  joinedAt: string;
  lastSeenAt: string;
  status: BattlePlayerStatus;
  score: number;
  correctCount: number;
  answeredCount: number;
  totalResponseMs: number;
  rewardClaimedAt: string | null;
  answers: Record<string, BattleAnswerRecord>;
};

export type BattleRoom = {
  id: string;
  code: string;
  title: string;
  mode: BattleMode;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  status: BattleRoomStatus;
  questions: BattleRoomQuestion[];
  questionDurationSeconds: number;
  scheduledStartAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  maxPlayers: number;
  prizeGoldWinner: number;
  prizeGoldParticipation: number;
  winnerId: string | null;
  createdAt: string;
  updatedAt: string;
};

type BattleRoomDocument = Omit<BattleRoom, "id">;
type BattlePlayerDocument = BattlePlayer;

function ensureDb() {
  if (!db) {
    throw new Error("Firestore chưa sẵn sàng. Hãy kiểm tra cấu hình Firebase.");
  }

  return db;
}

function normalizeIso(value: unknown) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }

  return new Date(0).toISOString();
}

function normalizeRoom(id: string, value: BattleRoomDocument): BattleRoom {
  return {
    id,
    code: typeof value.code === "string" ? value.code.trim().toUpperCase() : "",
    title: typeof value.title === "string" && value.title.trim() ? value.title.trim() : "Quiz Battle",
    mode: value.mode === "duel" ? "duel" : "live",
    hostId: typeof value.hostId === "string" ? value.hostId : "",
    hostName: typeof value.hostName === "string" ? value.hostName : "Người tạo phòng",
    hostAvatar: typeof value.hostAvatar === "string" ? value.hostAvatar : "🎓",
    status: value.status === "finished" ? "finished" : value.status === "live" ? "live" : "scheduled",
    questions: Array.isArray(value.questions)
      ? value.questions
          .filter((question) => question && typeof question.id === "string" && typeof question.statement === "string")
          .map((question) => ({
            id: question.id,
            statement: question.statement,
            correct: Boolean(question.correct),
            explanation: typeof question.explanation === "string" ? question.explanation : "",
          }))
      : [],
    questionDurationSeconds:
      typeof value.questionDurationSeconds === "number" && value.questionDurationSeconds > 0
        ? value.questionDurationSeconds
        : 20,
    scheduledStartAt: normalizeIso(value.scheduledStartAt),
    startedAt: value.startedAt ? normalizeIso(value.startedAt) : null,
    finishedAt: value.finishedAt ? normalizeIso(value.finishedAt) : null,
    maxPlayers: typeof value.maxPlayers === "number" && value.maxPlayers > 0 ? value.maxPlayers : 2,
    prizeGoldWinner: typeof value.prizeGoldWinner === "number" ? value.prizeGoldWinner : 150,
    prizeGoldParticipation: typeof value.prizeGoldParticipation === "number" ? value.prizeGoldParticipation : 30,
    winnerId: typeof value.winnerId === "string" && value.winnerId.trim() ? value.winnerId : null,
    createdAt: normalizeIso(value.createdAt),
    updatedAt: normalizeIso(value.updatedAt),
  };
}

function normalizePlayer(value: BattlePlayerDocument): BattlePlayer {
  const answers = value.answers && typeof value.answers === "object" ? value.answers : {};

  return {
    userId: typeof value.userId === "string" ? value.userId : "",
    name: typeof value.name === "string" && value.name.trim() ? value.name.trim() : "Học sinh",
    avatar: typeof value.avatar === "string" && value.avatar.trim() ? value.avatar.trim() : "👨‍🎓",
    joinedAt: normalizeIso(value.joinedAt),
    lastSeenAt: normalizeIso(value.lastSeenAt),
    status: value.status === "finished" ? "finished" : value.status === "playing" ? "playing" : "joined",
    score: typeof value.score === "number" ? value.score : 0,
    correctCount: typeof value.correctCount === "number" ? value.correctCount : 0,
    answeredCount: typeof value.answeredCount === "number" ? value.answeredCount : 0,
    totalResponseMs: typeof value.totalResponseMs === "number" ? value.totalResponseMs : 0,
    rewardClaimedAt:
      typeof value.rewardClaimedAt === "string" && value.rewardClaimedAt.trim()
        ? value.rewardClaimedAt
        : null,
    answers: Object.fromEntries(
      Object.entries(answers).map(([questionId, answer]) => {
        const valueMap = answer as Partial<BattleAnswerRecord>;
        return [
          questionId,
          {
            questionId,
            answer: Boolean(valueMap.answer),
            isCorrect: Boolean(valueMap.isCorrect),
            responseMs: typeof valueMap.responseMs === "number" ? valueMap.responseMs : 0,
            points: typeof valueMap.points === "number" ? valueMap.points : 0,
            answeredAt: normalizeIso(valueMap.answeredAt),
            questionIndex: typeof valueMap.questionIndex === "number" ? valueMap.questionIndex : 0,
          } satisfies BattleAnswerRecord,
        ];
      }),
    ),
  };
}

function buildInitialPlayer(user: AppUser): BattlePlayer {
  const now = new Date().toISOString();

  return {
    userId: user.id,
    name: user.name,
    avatar: user.avatar,
    joinedAt: now,
    lastSeenAt: now,
    status: "joined",
    score: 0,
    correctCount: 0,
    answeredCount: 0,
    totalResponseMs: 0,
    rewardClaimedAt: null,
    answers: {},
  };
}

function randomRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function reserveRoomCode() {
  const database = ensureDb();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = randomRoomCode();
    const snapshot = await getDocs(query(collection(database, "battleRooms"), where("code", "==", code)));
    if (snapshot.empty) {
      return code;
    }
  }

  throw new Error("Không thể tạo mã phòng duy nhất. Hãy thử lại.");
}

export function sortBattlePlayers(players: BattlePlayer[]) {
  return [...players].sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    if (right.correctCount !== left.correctCount) return right.correctCount - left.correctCount;
    if (left.totalResponseMs !== right.totalResponseMs) return left.totalResponseMs - right.totalResponseMs;
    return left.joinedAt.localeCompare(right.joinedAt);
  });
}

export function computeBattlePoints(questionDurationSeconds: number, responseMs: number) {
  const questionDurationMs = Math.max(1, questionDurationSeconds * 1000);
  const boundedResponseMs = Math.min(questionDurationMs, Math.max(0, responseMs));
  const maxPoints = 1000;
  const minPoints = 400;
  const ratio = boundedResponseMs / questionDurationMs;

  return Math.round(maxPoints - ratio * (maxPoints - minPoints));
}

export async function createBattleRoom(input: {
  host: AppUser;
  mode: BattleMode;
  title: string;
  scheduledStartAt: string;
  questions: BattleRoomQuestion[];
  questionDurationSeconds: number;
  maxPlayers: number;
  prizeGoldWinner: number;
  prizeGoldParticipation: number;
}) {
  const database = ensureDb();
  const roomRef = doc(collection(database, "battleRooms"));
  const code = await reserveRoomCode();
  const now = new Date().toISOString();

  const room = {
    id: roomRef.id,
    code,
    title: input.title.trim() || (input.mode === "duel" ? "Thách đấu 1v1" : "Quiz Battle nhiều người"),
    mode: input.mode,
    hostId: input.host.id,
    hostName: input.host.name,
    hostAvatar: input.host.avatar,
    status: "scheduled",
    questions: input.questions,
    questionDurationSeconds: input.questionDurationSeconds,
    scheduledStartAt: input.scheduledStartAt,
    startedAt: null,
    finishedAt: null,
    maxPlayers: input.maxPlayers,
    prizeGoldWinner: input.prizeGoldWinner,
    prizeGoldParticipation: input.prizeGoldParticipation,
    winnerId: null,
    createdAt: now,
    updatedAt: now,
  } satisfies BattleRoom;

  await setDoc(roomRef, {
    code: room.code,
    title: room.title,
    mode: room.mode,
    hostId: room.hostId,
    hostName: room.hostName,
    hostAvatar: room.hostAvatar,
    status: room.status,
    questions: room.questions,
    questionDurationSeconds: room.questionDurationSeconds,
    scheduledStartAt: room.scheduledStartAt,
    startedAt: room.startedAt,
    finishedAt: room.finishedAt,
    maxPlayers: room.maxPlayers,
    prizeGoldWinner: room.prizeGoldWinner,
    prizeGoldParticipation: room.prizeGoldParticipation,
    winnerId: room.winnerId,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  } satisfies BattleRoomDocument);

  await setDoc(doc(database, "battleRooms", room.id, "players", input.host.id), buildInitialPlayer(input.host));

  return room;
}

export async function findBattleRoomByCode(code: string) {
  const database = ensureDb();
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    throw new Error("Hãy nhập mã phòng trước khi tham gia.");
  }

  const snapshot = await getDocs(query(collection(database, "battleRooms"), where("code", "==", normalizedCode)));
  if (snapshot.empty) return null;

  const roomDoc = snapshot.docs[0];
  return normalizeRoom(roomDoc.id, roomDoc.data() as BattleRoomDocument);
}

export async function ensureBattlePlayerJoined(room: BattleRoom, user: AppUser) {
  const database = ensureDb();
  const playerRef = doc(database, "battleRooms", room.id, "players", user.id);
  const playerSnapshot = await getDoc(playerRef);

  if (playerSnapshot.exists()) {
    await updateDoc(playerRef, {
      lastSeenAt: new Date().toISOString(),
    });
    return normalizePlayer(playerSnapshot.data() as BattlePlayerDocument);
  }

  if (room.status === "finished") {
    throw new Error("Phòng đấu này đã kết thúc.");
  }

  const playersSnapshot = await getDocs(collection(database, "battleRooms", room.id, "players"));
  if (playersSnapshot.size >= room.maxPlayers) {
    throw new Error("Phòng đã đủ người chơi.");
  }

  const player = buildInitialPlayer(user);
  await setDoc(playerRef, player);
  return player;
}

export function subscribeToBattleRoom(
  roomId: string,
  onRoom: (room: BattleRoom) => void,
  onPlayers: (players: BattlePlayer[]) => void,
  onError: (message: string) => void,
) {
  const database = ensureDb();

  const unsubscribeRoom = onSnapshot(
    doc(database, "battleRooms", roomId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onError("Không tìm thấy phòng đấu này.");
        return;
      }

      onRoom(normalizeRoom(snapshot.id, snapshot.data() as BattleRoomDocument));
    },
    () => {
      onError("Không thể đồng bộ trạng thái phòng đấu.");
    },
  );

  const unsubscribePlayers = onSnapshot(
    collection(database, "battleRooms", roomId, "players"),
    (snapshot) => {
      const players = snapshot.docs.map((item) => normalizePlayer(item.data() as BattlePlayerDocument));
      onPlayers(sortBattlePlayers(players));
    },
    () => {
      onError("Không thể đồng bộ danh sách người chơi.");
    },
  );

  return () => {
    unsubscribeRoom();
    unsubscribePlayers();
  };
}

export async function submitBattleAnswer(input: {
  roomId: string;
  player: BattlePlayer;
  question: BattleRoomQuestion;
  answer: boolean;
  responseMs: number;
  questionIndex: number;
  questionDurationSeconds: number;
}) {
  const database = ensureDb();
  if (input.player.answers[input.question.id]) {
    return input.player;
  }

  const answeredAt = new Date().toISOString();
  const isCorrect = input.answer === input.question.correct;
  const points = isCorrect ? computeBattlePoints(input.questionDurationSeconds, input.responseMs) : 0;
  const nextPlayer = {
    ...input.player,
    status: "playing",
    score: input.player.score + points,
    correctCount: input.player.correctCount + (isCorrect ? 1 : 0),
    answeredCount: input.player.answeredCount + 1,
    totalResponseMs: input.player.totalResponseMs + input.responseMs,
    lastSeenAt: answeredAt,
    answers: {
      ...input.player.answers,
      [input.question.id]: {
        questionId: input.question.id,
        answer: input.answer,
        isCorrect,
        responseMs: input.responseMs,
        points,
        answeredAt,
        questionIndex: input.questionIndex,
      },
    },
  } satisfies BattlePlayer;

  await setDoc(doc(database, "battleRooms", input.roomId, "players", input.player.userId), nextPlayer);
  return nextPlayer;
}

export async function startBattleRoom(roomId: string) {
  const database = ensureDb();
  const now = new Date().toISOString();

  await updateDoc(doc(database, "battleRooms", roomId), {
    status: "live",
    startedAt: now,
    updatedAt: now,
  });
}

export async function finishBattleRoom(roomId: string, players: BattlePlayer[]) {
  const database = ensureDb();
  const now = new Date().toISOString();
  const sortedPlayers = sortBattlePlayers(players);
  const winner = sortedPlayers.find((player) => player.answeredCount > 0) ?? null;
  const batch = writeBatch(database);

  batch.update(doc(database, "battleRooms", roomId), {
    status: "finished",
    finishedAt: now,
    updatedAt: now,
    winnerId: winner?.userId ?? null,
  });

  sortedPlayers.forEach((player) => {
    batch.set(
      doc(database, "battleRooms", roomId, "players", player.userId),
      {
        ...player,
        status: "finished",
        lastSeenAt: now,
      } satisfies BattlePlayerDocument,
    );
  });

  await batch.commit();
}

export async function claimBattleReward(roomId: string, playerId: string) {
  const database = ensureDb();

  await updateDoc(doc(database, "battleRooms", roomId, "players", playerId), {
    rewardClaimedAt: new Date().toISOString(),
  });
}

// ═══════════════════════════════════════════════════════════
// AUTO-MATCHMAKING: Tự tìm đối thủ 1v1
// ═══════════════════════════════════════════════════════════

export type MatchmakingEntry = {
  userId: string;
  name: string;
  avatar: string;
  status: "waiting" | "matched";
  roomId: string | null;
  createdAt: string;
};

/** Thêm học sinh vào hàng chờ tìm đối thủ */
export async function joinMatchmakingQueue(user: AppUser) {
  const database = ensureDb();
  await setDoc(doc(database, "matchmakingQueue", user.id), {
    userId: user.id,
    name: user.name,
    avatar: user.avatar,
    status: "waiting",
    roomId: null,
    createdAt: new Date().toISOString(),
  } satisfies MatchmakingEntry);
}

/** Rời hàng chờ */
export async function leaveMatchmakingQueue(userId: string) {
  const database = ensureDb();
  try {
    await deleteDoc(doc(database, "matchmakingQueue", userId));
  } catch {
    // Bỏ qua nếu đã xóa
  }
}

/** Lắng nghe trạng thái entry của mình — khi bị matched sẽ có roomId */
export function subscribeToOwnMatchEntry(
  userId: string,
  onMatched: (roomId: string) => void,
  onRemoved: () => void,
) {
  const database = ensureDb();
  return onSnapshot(doc(database, "matchmakingQueue", userId), (snapshot) => {
    if (!snapshot.exists()) {
      onRemoved();
      return;
    }
    const data = snapshot.data() as MatchmakingEntry;
    if (data.status === "matched" && data.roomId) {
      onMatched(data.roomId);
    }
  });
}

/** Tìm đối thủ đang chờ trong hàng (trừ chính mình) */
export async function findWaitingOpponent(
  myUserId: string,
): Promise<MatchmakingEntry | null> {
  const database = ensureDb();
  const snapshot = await getDocs(
    query(
      collection(database, "matchmakingQueue"),
      where("status", "==", "waiting"),
    ),
  );

  for (const item of snapshot.docs) {
    if (item.id !== myUserId) {
      return item.data() as MatchmakingEntry;
    }
  }
  return null;
}

/** Lấy ngẫu nhiên câu hỏi Đúng/Sai từ Firestore */
export async function fetchRandomBattleQuestions(
  count: number,
): Promise<BattleRoomQuestion[]> {
  const database = ensureDb();
  const snapshot = await getDocs(collection(database, "questions"));
  const pool: BattleRoomQuestion[] = [];

  for (const item of snapshot.docs) {
    const data = item.data();
    if (
      data.type === "true-false" &&
      typeof data.statement === "string" &&
      typeof data.correct === "boolean"
    ) {
      pool.push({
        id: item.id,
        statement: data.statement,
        correct: data.correct,
        explanation: typeof data.explanation === "string" ? data.explanation : "",
      });
    }
  }

  // Trộn ngẫu nhiên
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, count);
}

/** Ghép trận: tạo phòng, cập nhật cả 2 entry, trả về roomId */
export async function createMatchedDuelRoom(
  me: AppUser,
  opponent: MatchmakingEntry,
  questions: BattleRoomQuestion[],
  questionDurationSeconds = 20,
) {
  const database = ensureDb();
  const roomRef = doc(collection(database, "battleRooms"));
  const code = await reserveRoomCode();
  const now = new Date().toISOString();

  const batch = writeBatch(database);

  // Tạo phòng đấu — trạng thái "live" để bắt đầu ngay
  batch.set(roomRef, {
    code,
    title: `${me.name} vs ${opponent.name}`,
    mode: "duel" as BattleMode,
    hostId: me.id,
    hostName: me.name,
    hostAvatar: me.avatar,
    status: "live" as BattleRoomStatus,
    questions,
    questionDurationSeconds,
    scheduledStartAt: now,
    startedAt: now,
    finishedAt: null,
    maxPlayers: 2,
    prizeGoldWinner: 180,
    prizeGoldParticipation: 35,
    winnerId: null,
    createdAt: now,
    updatedAt: now,
  } satisfies BattleRoomDocument);

  // Thêm cả 2 người chơi
  batch.set(
    doc(database, "battleRooms", roomRef.id, "players", me.id),
    buildInitialPlayer(me),
  );
  batch.set(
    doc(database, "battleRooms", roomRef.id, "players", opponent.userId),
    buildInitialPlayer({
      id: opponent.userId,
      name: opponent.name,
      avatar: opponent.avatar,
      role: "student",
    } as AppUser),
  );

  // Cập nhật matchmaking queue — đánh dấu matched
  batch.update(doc(database, "matchmakingQueue", me.id), {
    status: "matched",
    roomId: roomRef.id,
  });
  batch.update(doc(database, "matchmakingQueue", opponent.userId), {
    status: "matched",
    roomId: roomRef.id,
  });

  await batch.commit();
  return roomRef.id;
}

/** Dọn dẹp entry khỏi hàng chờ sau khi đã vào phòng */
export async function cleanupMatchmakingEntry(userId: string) {
  const database = ensureDb();
  try {
    await deleteDoc(doc(database, "matchmakingQueue", userId));
  } catch {
    // OK
  }
}
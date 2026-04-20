import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  Radio,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { RichContentBlock } from "../components/RichContent";
import { GameShell } from "../components/GameShell";
import { QuestionBankNotice } from "../components/QuestionBankNotice";
import { useAppAuth } from "../lib/AuthContext";
import {
  claimBattleReward,
  ensureBattlePlayerJoined,
  finishBattleRoom,
  sortBattlePlayers,
  startBattleRoom,
  submitBattleAnswer,
  subscribeToBattleRoom,
  type BattlePlayer,
  type BattleRoom,
} from "../lib/liveBattle";
import { useGameStore } from "../store/useGameStore";

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatMode(mode: BattleRoom["mode"]) {
  return mode === "duel" ? "Thách đấu 1v1" : "Trực tiếp nhiều người";
}

export function LiveBattleRoomPage() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const storedUser = useGameStore((state) => state.user);
  const addGold = useGameStore((state) => state.addGold);
  const addExp = useGameStore((state) => state.addExp);
  const addCollection = useGameStore((state) => state.addCollection);
  const { profile, currentUser, isConfigured } = useAppAuth();
  const appUser = profile ?? storedUser;

  const [room, setRoom] = useState<BattleRoom | null>(null);
  const [players, setPlayers] = useState<BattlePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [answerMessage, setAnswerMessage] = useState("");
  const [rewardMessage, setRewardMessage] = useState("");
  const [submittingQuestionId, setSubmittingQuestionId] = useState("");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  const joiningRef = useRef(false);
  const startingRef = useRef(false);
  const finishingRef = useRef(false);
  const rewardRef = useRef(false);

  useEffect(() => {
    if (!roomId || !isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToBattleRoom(
      roomId,
      (nextRoom) => {
        setRoom(nextRoom);
        setLoading(false);
      },
      (nextPlayers) => {
        setPlayers(sortBattlePlayers(nextPlayers));
        setLoading(false);
      },
      (message) => {
        setErrorMessage(message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [isConfigured, roomId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const currentPlayer = useMemo(
    () => players.find((player) => player.userId === appUser?.id || player.userId === currentUser?.uid) ?? null,
    [appUser?.id, currentUser?.uid, players],
  );

  const winner = useMemo(
    () => (room?.winnerId ? players.find((player) => player.userId === room.winnerId) ?? null : null),
    [players, room?.winnerId],
  );

  const minimumPlayers = 2;
  const isHost = room?.hostId === appUser?.id;
  const questionDurationMs = room ? room.questionDurationSeconds * 1000 : 0;
  const totalBattleDurationMs = room ? room.questions.length * questionDurationMs : 0;
  const scheduledStartMs = room ? new Date(room.scheduledStartAt).getTime() : 0;
  const startedAtMs = room?.startedAt ? new Date(room.startedAt).getTime() : 0;
  const scheduledRemainingMs = room && room.status === "scheduled" ? Math.max(0, scheduledStartMs - now) : 0;
  const elapsedLiveMs = room && room.status !== "scheduled" && room.startedAt ? Math.max(0, now - startedAtMs) : 0;
  const totalRemainingMs = room && room.status === "live" ? Math.max(0, totalBattleDurationMs - elapsedLiveMs) : 0;

  const currentQuestionIndex =
    room && room.status === "live" && room.questions.length > 0
      ? Math.min(room.questions.length - 1, Math.floor(elapsedLiveMs / Math.max(questionDurationMs, 1)))
      : 0;
  const currentQuestion = room?.questions[currentQuestionIndex] ?? null;
  const currentQuestionStartMs = startedAtMs + currentQuestionIndex * questionDurationMs;
  const currentQuestionElapsedMs = room && room.status === "live" ? Math.max(0, now - currentQuestionStartMs) : 0;
  const currentQuestionRemainingMs =
    room && room.status === "live" ? Math.max(0, questionDurationMs - currentQuestionElapsedMs) : 0;
  const currentAnswer = currentPlayer && currentQuestion ? currentPlayer.answers[currentQuestion.id] : null;
  const currentRank = currentPlayer ? players.findIndex((player) => player.userId === currentPlayer.userId) + 1 : 0;

  useEffect(() => {
    if (!room || !appUser || currentPlayer || joiningRef.current) return;

    joiningRef.current = true;
    setErrorMessage("");

    void ensureBattlePlayerJoined(room, appUser)
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : "Không thể tham gia phòng đấu.");
      })
      .finally(() => {
        joiningRef.current = false;
      });
  }, [appUser, currentPlayer, room]);

  // Auto-start đã được tắt — chỉ GV (host) mới bấm "Bắt đầu ngay" được

  useEffect(() => {
    if (!room || room.status !== "live" || finishingRef.current) return;
    if (totalRemainingMs > 0) return;

    finishingRef.current = true;

    void finishBattleRoom(room.id, players)
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : "Không thể chốt kết quả trận đấu.");
      })
      .finally(() => {
        finishingRef.current = false;
      });
  }, [players, room, totalRemainingMs]);

  useEffect(() => {
    if (!room || room.status !== "finished" || !currentPlayer || rewardRef.current) return;
    if (currentPlayer.rewardClaimedAt) return;

    rewardRef.current = true;

    const isWinner = room.winnerId === currentPlayer.userId;
    const earnedGold = isWinner ? room.prizeGoldWinner : currentPlayer.answeredCount > 0 ? room.prizeGoldParticipation : 0;
    const earnedExp = isWinner ? 120 : currentPlayer.answeredCount > 0 ? 35 : 0;

    void claimBattleReward(room.id, currentPlayer.userId)
      .then(() => {
        if (earnedGold > 0) addGold(earnedGold);
        if (earnedExp > 0) addExp(earnedExp);
        if (isWinner) {
          addCollection(`Cúp Battle ${new Date().toLocaleDateString("vi-VN")}`);
        }

        setRewardMessage(
          isWinner
            ? `Bạn thắng trận và nhận +${earnedGold} vàng, +${earnedExp} EXP cùng 1 cúp sưu tầm.`
            : earnedGold > 0
              ? `Bạn nhận thưởng tham gia +${earnedGold} vàng, +${earnedExp} EXP.`
              : "Trận đấu đã kết thúc.",
        );
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : "Không thể nhận thưởng trận đấu.");
      })
      .finally(() => {
        rewardRef.current = false;
      });
  }, [addCollection, addExp, addGold, currentPlayer, room]);

  const handleAnswer = async (answer: boolean) => {
    if (!room || !currentPlayer || !currentQuestion) return;
    if (room.status !== "live" || currentAnswer || currentQuestionRemainingMs <= 0) return;

    setSubmittingQuestionId(currentQuestion.id);
    setErrorMessage("");

    try {
      const responseMs = Math.min(questionDurationMs, Math.max(0, Date.now() - currentQuestionStartMs));
      const nextPlayer = await submitBattleAnswer({
        roomId: room.id,
        player: currentPlayer,
        question: currentQuestion,
        answer,
        responseMs,
        questionIndex: currentQuestionIndex,
        questionDurationSeconds: room.questionDurationSeconds,
      });

      const nextAnswer = nextPlayer.answers[currentQuestion.id];
      setAnswerMessage(
        nextAnswer.isCorrect
          ? `Chính xác! +${nextAnswer.points} điểm tốc độ.`
          : "Sai rồi. Chờ câu kế tiếp để gỡ điểm.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể gửi đáp án.");
    } finally {
      setSubmittingQuestionId("");
    }
  };

  const handleCopyCode = async () => {
    if (!room) return;

    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setErrorMessage("Không thể sao chép mã phòng trên thiết bị này.");
    }
  };

  const handleStartNow = async () => {
    if (!room) return;

    try {
      await startBattleRoom(room.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể bắt đầu trận ngay bây giờ.");
    }
  };

  if (!isConfigured) {
    return (
      <GameShell title="Đấu trực tiếp" subtitle="Phòng đấu đang chờ đăng nhập Firebase">
        <QuestionBankNotice
          title="Firebase chưa sẵn sàng"
          description="Phòng đấu trực tiếp cần đăng nhập Firebase và Firestore để đồng bộ người chơi theo thời gian thực."
          tone="amber"
        />
      </GameShell>
    );
  }

  if (loading) {
    return (
      <GameShell title="Đấu trực tiếp" subtitle="Đang kết nối phòng đấu">
        <QuestionBankNotice
          title="Đang đồng bộ phòng đấu"
          description="Hệ thống đang kết nối trạng thái phòng, danh sách người chơi và lịch bắt đầu."
          hideAction
        />
      </GameShell>
    );
  }

  if (!room) {
    return (
      <GameShell title="Đấu trực tiếp" subtitle="Không thể mở phòng đấu">
        <QuestionBankNotice
          title="Không tìm thấy phòng đấu"
          description={errorMessage || "Phòng bạn mở không tồn tại hoặc đã bị xóa."}
          tone="rose"
        />
      </GameShell>
    );
  }

  return (
    <GameShell title={room.title} subtitle={`${formatMode(room.mode)} · ${room.questions.length} câu Đúng/Sai`}>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/50 bg-white/95 p-6 shadow-xl">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-violet-700">
                <Radio className="h-4 w-4" />
                {room.status === "scheduled" ? "Sắp bắt đầu" : room.status === "live" ? "Đang diễn ra" : "Đã kết thúc"}
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">{room.title}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">
                  {room.hostAvatar} {room.hostName}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">
                  {room.mode === "duel" ? "2 người" : `${room.maxPlayers} người`}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:w-[380px]">
              <button
                type="button"
                onClick={handleCopyCode}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Mã phòng</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{room.code}</p>
                  </div>
                  <Copy className="h-5 w-5 text-slate-500" />
                </div>
                <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{copied ? "Đã sao chép" : "Chạm để sao chép"}</p>
              </button>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Mốc thời gian</p>
                <p className="mt-2 text-lg font-black text-slate-900">{formatDateTime(room.status === "scheduled" ? room.scheduledStartAt : room.startedAt ?? room.scheduledStartAt)}</p>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {room.status === "scheduled"
                    ? `Bắt đầu sau ${formatClock(Math.ceil(scheduledRemainingMs / 1000))}`
                    : room.status === "live"
                      ? `Còn ${formatClock(Math.ceil(totalRemainingMs / 1000))}`
                      : `Kết thúc lúc ${formatDateTime(room.finishedAt ?? room.updatedAt)}`}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Người đang vào</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{players.length}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Nhịp mỗi câu</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{room.questionDurationSeconds}s</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Thưởng thắng</p>
              <p className="mt-2 text-3xl font-black text-amber-600">+{room.prizeGoldWinner}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Hạng hiện tại</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{currentRank || "-"}</p>
            </div>
          </div>

          {errorMessage && <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errorMessage}</p>}
          {rewardMessage && <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{rewardMessage}</p>}
        </section>

        <section className={room.status === "scheduled" ? "space-y-6" : "grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"} >
          <div className="space-y-6">
            {room.status === "scheduled" && (
              <section className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/95 shadow-xl">
                {/* Header màu gradient như Quizizz */}
                <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 px-6 py-8 text-white">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                  <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    {/* Mã phòng to, rõ */}
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">Mã tham gia</p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="inline-flex items-center gap-3 rounded-2xl bg-white/20 px-5 py-3 transition hover:bg-white/30"
                        >
                          <span className="text-4xl font-black tracking-[0.35em]">{room.code}</span>
                          <Copy className="h-5 w-5 opacity-80" />
                        </button>
                        {copied && <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">Đã sao chép!</span>}
                      </div>
                      <p className="mt-2 text-sm text-white/60">Học sinh nhập mã này để vào phòng</p>
                    </div>

                    {/* Trạng thái người + timer */}
                    <div className="flex flex-wrap gap-4">
                      <div className="rounded-2xl bg-white/20 px-5 py-4 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Đã vào</p>
                        <p className="mt-1 text-4xl font-black">{players.length}</p>
                        <p className="text-xs text-white/60">/ {room.maxPlayers} tối đa</p>
                      </div>
                      <div className="rounded-2xl bg-white/20 px-5 py-4 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Cần tối thiểu</p>
                        <p className="mt-1 text-4xl font-black">{minimumPlayers}</p>
                        <p className="text-xs text-white/60">người</p>
                      </div>
                      {scheduledRemainingMs > 0 && (
                        <div className="rounded-2xl bg-white/20 px-5 py-4 text-center">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Đếm ngược</p>
                          <p className="mt-1 text-4xl font-black">{formatClock(Math.ceil(scheduledRemainingMs / 1000))}</p>
                          <p className="text-xs text-white/60">tự khởi động</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar người tham gia */}
                  <div className="relative z-10 mt-6">
                    <div className="flex items-center justify-between text-xs font-bold text-white/70 mb-2">
                      <span>{players.length >= minimumPlayers ? "✓ Đủ người để bắt đầu!" : `Cần thêm ${minimumPlayers - players.length} người nữa`}</span>
                      <span>{players.length}/{minimumPlayers}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-white transition-all duration-500"
                        style={{ width: `${Math.min(100, (players.length / minimumPlayers) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Danh sách học sinh – kiểu Quizizz avatar grid */}
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">
                      Người chơi đang chờ
                      <span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700">{players.length}</span>
                    </h3>
                    {/* Nút bắt đầu ngay cho host */}
                    {room.hostId === appUser?.id && players.length >= minimumPlayers && (
                      <button
                        type="button"
                        onClick={() => void handleStartNow()}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white shadow-lg transition hover:bg-emerald-600 hover:shadow-xl"
                      >
                        <Zap className="h-5 w-5" />
                        Bắt đầu ngay!
                      </button>
                    )}
                  </div>

                  {players.length === 0 ? (
                    <div className="flex flex-col items-center rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                        <Users className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="mt-4 font-black text-slate-500">Chưa có người vào phòng</p>
                      <p className="mt-1 text-sm text-slate-400">Chia sẻ mã <span className="font-black text-violet-600">{room.code}</span> để mời người tham gia</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {players.map((player, index) => (
                        <div
                          key={player.userId}
                          className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition animate-in fade-in zoom-in-95 ${
                            player.userId === appUser?.id
                              ? "border-violet-400 bg-violet-50 shadow-md"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-sm ${
                            index === 0 ? "bg-amber-100" : index === 1 ? "bg-sky-100" : "bg-slate-100"
                          }`}>
                            {player.avatar || "🧑"}
                          </div>
                          <p className="w-full truncate text-xs font-black text-slate-800">{player.name}</p>
                          {player.userId === appUser?.id && (
                            <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-black text-white">Bạn</span>
                          )}
                          {player.userId === room.hostId && player.userId !== appUser?.id && (
                            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-white">Host</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Học sinh thấy thông báo chờ host */}
                  {room.hostId !== appUser?.id && players.length < minimumPlayers && (
                    <p className="mt-5 rounded-2xl bg-indigo-50 px-4 py-3 text-center text-sm font-bold text-indigo-700">
                      ⏳ Đang chờ đủ người… Giáo viên sẽ bắt đầu khi đủ {minimumPlayers} người.
                    </p>
                  )}
                  {room.hostId !== appUser?.id && players.length >= minimumPlayers && (
                    <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700">
                      ✅ Đã đủ người! Chờ giáo viên bắt đầu trận đấu…
                    </p>
                  )}
                </div>
              </section>
            )}

            {room.status === "live" && currentQuestion && (
              <>
                {/* ── GV/Host: Màn hình giám sát đua điểm kiểu Quizizz ── */}
                {isHost && (
                  <section className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/95 shadow-xl">
                    <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 px-6 py-5 text-white">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-black uppercase tracking-[0.2em] text-white/70">Đang thi · Câu {currentQuestionIndex + 1}/{room.questions.length}</p>
                          <p className="mt-1 text-lg font-medium text-white/90"><RichContentBlock text={currentQuestion.statement} className="text-white" /></p>
                        </div>
                        <div className="flex gap-3">
                          <div className="rounded-2xl bg-white/20 px-4 py-3 text-center">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/60">Câu này</p>
                            <p className="mt-1 text-2xl font-black">{formatClock(Math.ceil(currentQuestionRemainingMs / 1000))}</p>
                          </div>
                          <div className="rounded-2xl bg-white/20 px-4 py-3 text-center">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/60">Tổng</p>
                            <p className="mt-1 text-2xl font-black">{formatClock(Math.ceil(totalRemainingMs / 1000))}</p>
                          </div>
                        </div>
                      </div>
                      <div className="relative z-10 mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                        <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(currentQuestionRemainingMs / Math.max(questionDurationMs, 1)) * 100}%` }} />
                      </div>
                    </div>

                    {/* Bảng đua điểm realtime */}
                    <div className="p-6">
                      <h3 className="mb-4 text-lg font-black text-slate-900">🏁 Bảng đua điểm trực tiếp</h3>
                      <div className="space-y-3">
                        {players.map((player, index) => {
                          const maxScore = Math.max(1, ...players.map(p => p.score));
                          const barWidth = Math.max(5, (player.score / maxScore) * 100);
                          const colors = ["from-amber-400 to-orange-500", "from-sky-400 to-blue-500", "from-emerald-400 to-teal-500", "from-rose-400 to-pink-500", "from-violet-400 to-purple-500"];
                          const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
                          return (
                            <div key={player.userId} className="flex items-center gap-3">
                              <span className="w-8 text-center text-lg font-black">{rankEmoji}</span>
                              <div className="flex-1">
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="text-sm font-black text-slate-800">{player.avatar} {player.name}</span>
                                  <span className="text-sm font-black text-slate-600">{player.score} đ · {player.correctCount}/{player.answeredCount}</span>
                                </div>
                                <div className="h-8 overflow-hidden rounded-xl bg-slate-100">
                                  <div
                                    className={`flex h-full items-center rounded-xl bg-gradient-to-r px-3 text-xs font-black text-white shadow-sm transition-all duration-500 ${colors[index % colors.length]}`}
                                    style={{ width: `${barWidth}%` }}
                                  >
                                    {player.score > 0 && `${player.score}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                          <p className="text-xs font-bold text-emerald-600">Đã trả lời</p>
                          <p className="mt-1 text-xl font-black text-emerald-700">{players.reduce((s, p) => s + p.answeredCount, 0)}</p>
                        </div>
                        <div className="rounded-2xl bg-violet-50 p-3 text-center">
                          <p className="text-xs font-bold text-violet-600">Trả lời đúng</p>
                          <p className="mt-1 text-xl font-black text-violet-700">{players.reduce((s, p) => s + p.correctCount, 0)}</p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 p-3 text-center">
                          <p className="text-xs font-bold text-amber-600">Điểm cao nhất</p>
                          <p className="mt-1 text-xl font-black text-amber-700">{Math.max(0, ...players.map(p => p.score))}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* ── Học sinh: Giao diện trả lời câu hỏi ── */}
                {!isHost && (
                  <section className="rounded-[2rem] border border-white/50 bg-white/95 p-6 shadow-xl">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Câu hiện tại</p>
                        <h3 className="mt-2 text-2xl font-black text-slate-900">Câu {currentQuestionIndex + 1}/{room.questions.length}</h3>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Thời gian câu này</p>
                          <p className="mt-1 text-2xl font-black text-slate-900">{formatClock(Math.ceil(currentQuestionRemainingMs / 1000))}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Tổng còn</p>
                          <p className="mt-1 text-2xl font-black text-slate-900">{formatClock(Math.ceil(totalRemainingMs / 1000))}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all" style={{ width: `${(currentQuestionRemainingMs / Math.max(questionDurationMs, 1)) * 100}%` }} />
                    </div>

                    <div className="mt-6 rounded-[1.75rem] bg-slate-50 p-5">
                      <RichContentBlock text={currentQuestion.statement} className="text-xl font-semibold text-slate-900" />
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => void handleAnswer(true)}
                        disabled={Boolean(currentAnswer) || Boolean(submittingQuestionId) || currentQuestionRemainingMs <= 0}
                        className="rounded-2xl bg-emerald-500 px-5 py-4 text-lg font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Đúng
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleAnswer(false)}
                        disabled={Boolean(currentAnswer) || Boolean(submittingQuestionId) || currentQuestionRemainingMs <= 0}
                        className="rounded-2xl bg-rose-500 px-5 py-4 text-lg font-black text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Sai
                      </button>
                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                      {currentAnswer ? (
                        <span className="inline-flex items-center gap-2 text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                          Đã khóa đáp án.
                        </span>
                      ) : (
                        <span>Nhanh hơn = nhiều điểm hơn.</span>
                      )}
                    </div>

                    {answerMessage && <p className="mt-4 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">{answerMessage}</p>}
                  </section>
                )}
              </>
            )}

            {room.status === "finished" && (
              <section className="rounded-[2rem] border border-white/50 bg-white/95 p-6 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Trận đấu đã kết thúc</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Điểm trước</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Tốc độ sau</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.75rem] bg-gradient-to-r from-amber-400 to-orange-500 p-5 text-white shadow-lg">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/85">Quán quân</p>
                  <p className="mt-2 text-3xl font-black">{winner ? `${winner.avatar} ${winner.name}` : "Chưa xác định"}</p>
                  <p className="mt-2 text-sm text-white/85">
                    {winner ? `${winner.score} điểm · ${winner.correctCount}/${room.questions.length} câu đúng` : "Không có người trả lời trong trận này."}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/game/battle")}
                    className="rounded-2xl bg-violet-600 px-5 py-3 font-black text-white transition hover:bg-violet-700"
                  >
                    Tạo trận mới
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/games")}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Quay về trung tâm game
                  </button>
                </div>
              </section>
            )}
          </div>

          {room.status !== "scheduled" && <aside className="space-y-6">
            <section className="rounded-[2rem] border border-white/50 bg-white/95 p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Bảng xếp hạng realtime</h3>
                  <p className="text-sm text-slate-500">Cao → thấp</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {players.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm font-medium text-slate-500">
                    Chưa có người.
                  </div>
                )}

                {players.map((player, index) => (
                  <div
                    key={player.userId}
                    className={`rounded-2xl border px-4 py-3 transition ${
                      player.userId === currentPlayer?.userId
                        ? "border-violet-300 bg-violet-50 shadow-sm"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-700 shadow-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{player.avatar} {player.name}</p>
                          <p className="text-xs font-medium text-slate-500">
                            {player.correctCount} đúng · {player.answeredCount} đã trả lời
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-slate-900">{player.score}</p>
                        <p className="text-xs font-medium text-slate-500">{(player.totalResponseMs / 1000).toFixed(1)}s</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/50 bg-white/95 p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Tóm tắt</h3>
                  <p className="text-sm text-slate-500">Chỉ số chính</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Tên chế độ</p>
                  <p className="mt-2 text-lg font-black text-slate-900">{formatMode(room.mode)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Trạng thái cá nhân</p>
                  <p className="mt-2 text-lg font-black text-slate-900">{currentPlayer ? currentPlayer.status : "Đang vào phòng"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Điểm của bạn</p>
                  <p className="mt-2 text-lg font-black text-slate-900">{currentPlayer?.score ?? 0}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Tốc độ phản hồi</p>
                  <p className="mt-2 text-lg font-black text-slate-900">
                    {currentPlayer ? `${(currentPlayer.totalResponseMs / 1000).toFixed(1)}s` : "-"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Điểm cao xếp trên</span>
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Bằng điểm xét tốc độ</span>
              </div>
            </section>
          </aside>}
        </section>
      </div>
    </GameShell>
  );
}
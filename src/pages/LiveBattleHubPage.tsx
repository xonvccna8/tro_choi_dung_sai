import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarClock,
  Clock3,
  KeyRound,
  Radio,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { GameShell } from "../components/GameShell";
import { QuestionBankNotice } from "../components/QuestionBankNotice";
import { useQuestionBank } from "../hooks/useQuestionBank";
import type { AppUser, SyncedTrueFalseQuestion } from "../types";
import { useAppAuth } from "../lib/AuthContext";
import {
  createBattleRoom,
  findBattleRoomByCode,
  type BattleMode,
  type BattleRoomQuestion,
} from "../lib/liveBattle";
import { isTrueFalseQuestion } from "../lib/questionBank";
import { useGameStore } from "../store/useGameStore";

function toDatetimeLocalValue(date: Date) {
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function shuffleQuestions(questions: SyncedTrueFalseQuestion[]) {
  const nextQuestions = [...questions];

  for (let index = nextQuestions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextQuestions[index], nextQuestions[randomIndex]] = [nextQuestions[randomIndex], nextQuestions[index]];
  }

  return nextQuestions;
}

function normalizeBattleQuestions(questions: SyncedTrueFalseQuestion[]): BattleRoomQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    statement: question.statement,
    correct: question.correct,
    explanation: question.explanation,
  }));
}

export function LiveBattleHubPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const storedUser = useGameStore((state) => state.user);
  const { profile, currentUser, isConfigured } = useAppAuth();
  const { questions, loading, error } = useQuestionBank();
  const appUser = (profile ?? storedUser) as AppUser | null;
  const requestedMode = searchParams.get("mode") === "live" ? "live" : "duel";

  const [mode, setMode] = useState<BattleMode>(requestedMode);
  const [title, setTitle] = useState(requestedMode === "duel" ? "Đối kháng 1 & 1" : "Đối kháng 1 & lớp");
  const [scheduledStartAt, setScheduledStartAt] = useState(toDatetimeLocalValue(new Date(Date.now() + 2 * 60_000)));
  const [questionCount, setQuestionCount] = useState(8);
  const [questionDurationSeconds, setQuestionDurationSeconds] = useState(20);
  const [maxPlayers, setMaxPlayers] = useState(20);
  const [joinCode, setJoinCode] = useState("");
  const [busyAction, setBusyAction] = useState<"create" | "join" | "">("");
  const [errorMessage, setErrorMessage] = useState("");

  const trueFalsePool = useMemo(() => questions.filter(isTrueFalseQuestion), [questions]);
  const canUseRealtimeBattle = Boolean(isConfigured && appUser);
  const modeLabel = mode === "duel" ? "Đối kháng 1 & 1" : "Đối kháng 1 & lớp";

  const featureNotes =
    mode === "duel"
      ? [
          { label: "2 người", icon: <Users className="h-4 w-4" /> },
          { label: "Hẹn giờ", icon: <CalendarClock className="h-4 w-4" /> },
          { label: "Tốc độ", icon: <Sparkles className="h-4 w-4" /> },
        ]
      : [
          { label: "Cả lớp", icon: <Users className="h-4 w-4" /> },
          { label: "1 mã", icon: <KeyRound className="h-4 w-4" /> },
          { label: "BXH trực tiếp", icon: <Trophy className="h-4 w-4" /> },
        ];

  useEffect(() => {
    setMode(requestedMode);
    setTitle(requestedMode === "duel" ? "Đối kháng 1 & 1" : "Đối kháng 1 & lớp");
    setMaxPlayers((current) => (requestedMode === "duel" ? 2 : Math.max(10, current)));
  }, [requestedMode]);

  const handleModeChange = (nextMode: BattleMode) => {
    setMode(nextMode);
    setTitle(nextMode === "duel" ? "Đối kháng 1 & 1" : "Đối kháng 1 & lớp");
    setMaxPlayers(nextMode === "duel" ? 2 : Math.max(10, maxPlayers));
  };

  const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!appUser) {
      setErrorMessage("Bạn cần đăng nhập trước khi tạo phòng đấu.");
      return;
    }

    if (trueFalsePool.length < questionCount) {
      setErrorMessage(`Ngân hàng hiện chỉ có ${trueFalsePool.length} câu Đúng/Sai, chưa đủ để tạo trận ${questionCount} câu.`);
      return;
    }

    setBusyAction("create");
    setErrorMessage("");

    try {
      const selectedQuestions = normalizeBattleQuestions(shuffleQuestions(trueFalsePool).slice(0, questionCount));
      const room = await createBattleRoom({
        host: appUser,
        mode,
        title,
        scheduledStartAt: new Date(scheduledStartAt).toISOString(),
        questions: selectedQuestions,
        questionDurationSeconds,
        maxPlayers: mode === "duel" ? 2 : Math.max(3, maxPlayers),
        prizeGoldWinner: mode === "duel" ? 180 : 250,
        prizeGoldParticipation: mode === "duel" ? 35 : 50,
      });

      navigate(`/game/battle/${room.id}`);
    } catch (nextError) {
      setErrorMessage(nextError instanceof Error ? nextError.message : "Không thể tạo phòng đấu.");
    } finally {
      setBusyAction("");
    }
  };

  const handleJoinRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyAction("join");
    setErrorMessage("");

    try {
      const room = await findBattleRoomByCode(joinCode);
      if (!room) {
        throw new Error("Không tìm thấy phòng với mã này.");
      }

      navigate(`/game/battle/${room.id}`);
    } catch (nextError) {
      setErrorMessage(nextError instanceof Error ? nextError.message : "Không thể tham gia phòng đấu.");
    } finally {
      setBusyAction("");
    }
  };

  if (!canUseRealtimeBattle) {
    return (
      <GameShell title="Đấu trực tiếp" subtitle="Đối kháng trực tiếp theo thời gian thực">
        <QuestionBankNotice
          title="Đấu trực tiếp cần đăng nhập Firebase"
          description="Chế độ đối kháng trực tiếp dùng Firestore để đồng bộ tên người chơi, bảng xếp hạng và lịch thi. Hãy đăng nhập bằng tài khoản Firebase trước khi tạo hoặc vào phòng."
          tone="amber"
        />
      </GameShell>
    );
  }

  if (!appUser) {
    return null;
  }

  if (loading) {
    return (
      <GameShell title="Đấu trực tiếp" subtitle="Đối kháng trực tiếp theo thời gian thực">
        <QuestionBankNotice
          title="Đang chuẩn bị ngân hàng câu hỏi"
          description="Hệ thống đang tải câu hỏi Đúng/Sai để tạo phòng đối kháng trực tiếp."
          hideAction
        />
      </GameShell>
    );
  }

  if (error) {
    return (
      <GameShell title="Đấu trực tiếp" subtitle="Đối kháng trực tiếp theo thời gian thực">
        <QuestionBankNotice title="Không tải được câu hỏi" description={error} tone="rose" />
      </GameShell>
    );
  }

  if (trueFalsePool.length < 5 && appUser.role !== "student") {
    return (
      <GameShell title="Đấu trực tiếp" subtitle="Đối kháng trực tiếp theo thời gian thực">
        <QuestionBankNotice
          title="Chưa đủ câu hỏi Đúng/Sai"
          description={`Đấu trực tiếp cần tối thiểu 5 câu Đúng/Sai để quay vòng trận đấu. Hiện hệ thống mới có ${trueFalsePool.length} câu.`}
          tone="amber"
        />
      </GameShell>
    );
  }

  // ────── Giao diện Học sinh ──────
  if (appUser.role === "student") {
    return (
      <GameShell title="Thi trực tiếp" subtitle="Nhập mã phòng từ giáo viên để vào thi">
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/95 p-8 shadow-2xl">
              {/* Icon + tiêu đề */}
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_16px_40px_rgba(109,40,217,0.35)]">
                  <KeyRound className="h-10 w-10" />
                </div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-violet-700">
                  <Radio className="h-3.5 w-3.5" />
                  Phòng đấu trực tiếp
                </div>
                <h2 className="mt-3 text-2xl font-black text-slate-900">Nhập mã phòng thi</h2>
                <p className="mt-2 text-sm text-slate-500">Giáo viên sẽ cung cấp mã gồm 6 ký tự</p>
              </div>

              {/* Form nhập mã */}
              <form onSubmit={handleJoinRoom} className="mt-8 space-y-4">
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-center text-3xl font-black uppercase tracking-[0.45em] outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="_ _ _ _ _ _"
                  maxLength={6}
                  autoComplete="off"
                  spellCheck={false}
                />

                {errorMessage && (
                  <p className="rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={busyAction === "join" || joinCode.length < 4}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-4 text-base font-black text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Users className="h-5 w-5" />
                  {busyAction === "join" ? "Đang vào phòng..." : "Vào thi ngay"}
                </button>
              </form>

              {/* Thông tin */}
              <div className="mt-8 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50">
                <div className="p-3 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Câu hỏi</p>
                  <p className="mt-1 text-sm font-black text-slate-800">Đúng / Sai</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">BXH</p>
                  <p className="mt-1 text-sm font-black text-slate-800">Trực tiếp</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">Phần thưởng</p>
                  <p className="mt-1 text-sm font-black text-amber-600">Vàng + EXP</p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-white/70">
              {appUser.avatar} {appUser.name} · Đã kết nối Firebase
            </p>
          </div>
        </div>
      </GameShell>
    );
  }

  // ────── Giao diện Giáo viên / Admin ──────
  return (
    <GameShell title={modeLabel} subtitle="Thi trực tiếp với bảng xếp hạng sống">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/50 bg-white/95 p-6 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-violet-700">
                <Radio className="h-4 w-4" />
                Khu trò chơi trực tiếp
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">{modeLabel}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {featureNotes.map((note) => (
                  <div key={note.label} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700">
                    {note.icon}
                    {note.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[340px] lg:grid-cols-1">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Câu hỏi khả dụng</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{trueFalsePool.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Người tổ chức</p>
                <p className="mt-2 text-lg font-black text-slate-900">{appUser.avatar} {appUser.name}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Firebase</p>
                <p className="mt-2 text-lg font-black text-emerald-700">Đang đồng bộ</p>
              </div>
            </div>
          </div>

        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={handleCreateRoom} className="rounded-[2rem] border border-white/50 bg-white/95 p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Swords className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Tạo phòng đấu</h3>
                <p className="text-sm text-slate-500">Tạo nhanh</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleModeChange("duel")}
                className={`rounded-2xl border p-4 text-left transition ${
                  mode === "duel"
                    ? "border-violet-300 bg-violet-50 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">So kè</p>
                <p className="text-lg font-black text-slate-900">Đối kháng 1 & 1</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">2 người</span>
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">Hẹn giờ</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("live")}
                className={`rounded-2xl border p-4 text-left transition ${
                  mode === "live"
                    ? "border-indigo-300 bg-indigo-50 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Cả lớp</p>
                <p className="text-lg font-black text-slate-900">Đối kháng 1 & lớp</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">1 mã</span>
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">BXH</span>
                </div>
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-bold text-slate-700">
                <span>Tên phiên đấu</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  placeholder="Ví dụ: 11A1 đấu tốc độ chương este"
                />
              </label>

              <label className="space-y-2 text-sm font-bold text-slate-700">
                <span className="inline-flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Giờ bắt đầu</span>
                <input
                  type="datetime-local"
                  value={scheduledStartAt}
                  onChange={(event) => setScheduledStartAt(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </label>

              <label className="space-y-2 text-sm font-bold text-slate-700">
                <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> Số câu</span>
                <select
                  value={questionCount}
                  onChange={(event) => setQuestionCount(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  {[5, 8, 10, 12, 15].map((value) => (
                    <option key={value} value={value}>{value} câu</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-bold text-slate-700">
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> Thời gian mỗi câu</span>
                <select
                  value={questionDurationSeconds}
                  onChange={(event) => setQuestionDurationSeconds(Number(event.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                >
                  {[10, 15, 20, 30].map((value) => (
                    <option key={value} value={value}>{value} giây</option>
                  ))}
                </select>
              </label>

              {mode === "live" && (
                <label className="space-y-2 text-sm font-bold text-slate-700 md:col-span-2">
                  <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> Sức chứa phòng trực tiếp</span>
                  <select
                    value={maxPlayers}
                    onChange={(event) => setMaxPlayers(Number(event.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  >
                    {[10, 20, 30, 50].map((value) => (
                      <option key={value} value={value}>{value} học sinh</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-800">Chấm điểm</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Đúng</span>
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Nhanh</span>
                <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Điểm cao xếp trên</span>
              </div>
            </div>

            {errorMessage && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errorMessage}</p>}

            <button
              type="submit"
              disabled={busyAction === "create"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-4 text-base font-black text-white transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Zap className="h-5 w-5" />
              {busyAction === "create" ? "Đang tạo phòng..." : "Tạo phòng trực tiếp"}
            </button>
          </form>

          <div className="space-y-6">
            <form onSubmit={handleJoinRoom} className="rounded-[2rem] border border-white/50 bg-white/95 p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Vào phòng bằng mã</h3>
                  <p className="text-sm text-slate-500">Nhập mã</p>
                </div>
              </div>

              <label className="mt-6 block space-y-2 text-sm font-bold text-slate-700">
                <span>Mã phòng</span>
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xl font-black uppercase tracking-[0.35em] outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="ABC123"
                  maxLength={6}
                />
              </label>

              <button
                type="submit"
                disabled={busyAction === "join"}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-base font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Users className="h-5 w-5" />
                {busyAction === "join" ? "Đang vào phòng..." : "Tham gia ngay"}
              </button>
            </form>

            <section className="rounded-[2rem] border border-white/50 bg-white/95 p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Chọn nhanh</h3>
                  <p className="text-sm text-slate-500">3 kiểu dùng</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="font-black text-slate-900">1 & 1</p>
                  <div className="mt-2 inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">So tài nhanh</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="font-black text-slate-900">1 & lớp</p>
                  <div className="mt-2 inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">Thi cả lớp</div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="font-black text-slate-900">Thưởng</p>
                  <div className="mt-2 inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">Vàng + huy hiệu</div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </GameShell>
  );
}
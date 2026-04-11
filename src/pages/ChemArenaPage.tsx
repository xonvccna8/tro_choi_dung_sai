import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChemText } from "../components/ChemText";
import { GameShell } from "../components/GameShell";
import { ConfettiRain, StarBlast } from "../components/Effects";
import { round1Pool, round2Pool, round3Pool } from "../data/arenaQuestions";
import { useGameStore } from "../store/useGameStore";
import { calcRealScore, scoreLabel } from "../types";
import type { ExamResult, ErrorRecord, MultiTrueFalseQuestion } from "../types";
import { playCorrect, playReward, playWrong } from "../utils/sound";

/* ── Cấu hình 3 vòng thi ── */
const ROUND_CONFIG = [
  { name: "Khởi Động", icon: "🔥", questions: 4, time: 5 * 60, pool: round1Pool, color: "from-emerald-500 to-teal-500", bgGlow: "shadow-emerald-500/30" },
  { name: "Tăng Tốc", icon: "⚡", questions: 4, time: 5 * 60, pool: round2Pool, color: "from-amber-500 to-orange-500", bgGlow: "shadow-amber-500/30" },
  { name: "Quyết Chiến", icon: "👑", questions: 2, time: 3 * 60, pool: round3Pool, color: "from-rose-500 to-pink-500", bgGlow: "shadow-rose-500/30" },
];

const TOTAL_MAX = 10; // 4+4+2=10 điểm

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${String(ss).padStart(2, "0")}`;
}

type Phase = "menu" | "round-intro" | "playing" | "round-result" | "final";

type RoundResult = {
  round: number;
  questions: MultiTrueFalseQuestion[];
  answers: Record<string, Record<string, boolean>>;
  scores: number[];
  totalScore: number;
  maxScore: number;
  timeSpent: number;
};

export function ChemArenaPage() {
  const { addGold, addExp, addExamResult, addErrors, addPerfect, soundOn } = useGameStore();

  const [phase, setPhase] = useState<Phase>("menu");
  const [currentRound, setCurrentRound] = useState(0);
  const [questions, setQuestions] = useState<MultiTrueFalseQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [confetti, setConfetti] = useState(0);
  const [stars, setStars] = useState(0);
  const [currentQ, setCurrentQ] = useState(0); // current question index for display
  const submitted = useRef(false);

  /* refs for timer closure */
  const qRef = useRef(questions);
  qRef.current = questions;
  const aRef = useRef(answers);
  aRef.current = answers;
  const tRef = useRef(timeLeft);
  tRef.current = timeLeft;
  const roundRef = useRef(currentRound);
  roundRef.current = currentRound;

  const config = ROUND_CONFIG[currentRound] || ROUND_CONFIG[0];

  /* ── Timer ── */
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          if (!submitted.current) submitRound();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Start entire game ── */
  const startGame = () => {
    setRoundResults([]);
    setCurrentRound(0);
    showRoundIntro(0);
  };

  /* ── Show round intro ── */
  const showRoundIntro = (round: number) => {
    setCurrentRound(round);
    setPhase("round-intro");
  };

  /* ── Begin playing a round ── */
  const beginRound = () => {
    const cfg = ROUND_CONFIG[currentRound];
    const qs = shuffle(cfg.pool).slice(0, cfg.questions);
    setQuestions(qs);
    setAnswers({});
    setTimeLeft(cfg.time);
    setCurrentQ(0);
    submitted.current = false;
    setPhase("playing");
  };

  /* ── Pick answer ── */
  const pickAnswer = (qId: string, sId: string, val: boolean) => {
    setAnswers((p) => ({ ...p, [qId]: { ...(p[qId] || {}), [sId]: val } }));
  };

  /* ── Submit round ── */
  const submitRound = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;

    const qs = qRef.current;
    const ans = aRef.current;
    const cfg = ROUND_CONFIG[roundRef.current];
    const spent = cfg.time - tRef.current;

    const scores = qs.map((q) => {
      const a = ans[q.id] || {};
      const cc = q.statements.filter((s) => a[s.id] === s.correct).length;
      return calcRealScore(cc);
    });
    const total = scores.reduce((s, v) => s + v, 0);

    // Track errors
    const errs: ErrorRecord[] = [];
    qs.forEach((q) => {
      const a = ans[q.id] || {};
      q.statements.forEach((s) => {
        if (a[s.id] !== s.correct) {
          errs.push({
            id: `err-arena-${Date.now()}-${s.id}`,
            statementText: s.text,
            userAnswer: a[s.id] ?? !s.correct,
            correctAnswer: s.correct,
            explanation: q.explanation,
            questionId: q.id,
            date: new Date().toISOString(),
          });
        }
      });
    });
    if (errs.length) addErrors(errs);

    // Perfect check
    const perfectRound = scores.every((sc) => sc === 1.0);
    if (perfectRound) { addPerfect(); setConfetti((c) => c + 1); }
    if (total >= cfg.questions * 0.5) setStars((c) => c + 1);

    // Sound
    if (total >= cfg.questions * 0.75) playCorrect(soundOn);
    else playWrong(soundOn);

    const rr: RoundResult = {
      round: roundRef.current,
      questions: qs,
      answers: ans,
      scores,
      totalScore: total,
      maxScore: cfg.questions,
      timeSpent: spent,
    };

    setRoundResults((prev) => [...prev, rr]);
    setPhase("round-result");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Next round or final ── */
  const nextRound = () => {
    if (currentRound + 1 < ROUND_CONFIG.length) {
      showRoundIntro(currentRound + 1);
    } else {
      finishGame();
    }
  };

  /* ── Final summary ── */
  const finishGame = () => {
    // Save exam result
    // Use roundResults which now has all rounds
    const allQResults = roundResults.concat().flatMap((rr) =>
      rr.questions.map((q, i) => {
        const a = rr.answers[q.id] || {};
        const cc = q.statements.filter((s) => a[s.id] === s.correct).length;
        return { questionId: q.id, answers: a, correctCount: cc, score: rr.scores[i] };
      })
    );

    // Wait - roundResults may not include last round yet. Let's recalc:
    const finalRoundResults = [...roundResults]; // Already includes last round from submitRound setState
    const totalScore = finalRoundResults.reduce((s, r) => s + r.totalScore, 0);
    const totalTime = finalRoundResults.reduce((s, r) => s + r.timeSpent, 0);

    const exam: ExamResult = {
      id: `arena-${Date.now()}`,
      date: new Date().toISOString(),
      questions: allQResults,
      totalScore,
      maxScore: TOTAL_MAX,
      timeSpent: totalTime,
    };
    addExamResult(exam);

    // Rewards
    const gold = Math.round(totalScore * 50);
    addGold(gold);
    addExp(Math.round(totalScore * 20));

    if (totalScore >= 8) { setConfetti((c) => c + 1); playReward(soundOn); }

    setPhase("final");
  };

  /* ── Answered count for current question ── */
  const answeredCount = (qId: string) => Object.keys(answers[qId] || {}).length;

  /* ── Time danger ── */
  const timeDanger = timeLeft <= 30;
  const timeWarning = timeLeft <= 60 && !timeDanger;

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <GameShell title="⚔️ Đấu Trường Hóa Học" subtitle="3 vòng – 10 câu – 10 điểm – Luyện như thi thật!">
      <div className="relative">
        <ConfettiRain trigger={confetti} />
        <StarBlast trigger={stars} />

        {/* ═══ MENU ═══ */}
        {phase === "menu" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-3xl bg-white/95 p-5 shadow-xl text-center">
              <p className="text-5xl">⚔️</p>
              <h2 className="mt-2 text-2xl font-black text-violet-700">Đấu Trường Hóa Học</h2>
              <p className="mt-1 text-sm text-slate-600">Chinh phục 3 vòng thi – Giống đề thi thật 100%</p>

              <div className="mt-4 space-y-2">
                {ROUND_CONFIG.map((r, i) => (
                  <div key={i} className={`rounded-2xl bg-gradient-to-r ${r.color} p-3 text-white text-left`}>
                    <p className="font-black">{r.icon} Vòng {i + 1}: {r.name}</p>
                    <p className="text-xs text-white/80">
                      {r.questions} câu × 1 điểm = {r.questions} điểm | ⏱️ {r.time / 60} phút
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl bg-violet-50 p-3 text-left text-sm">
                <p className="font-bold text-violet-700">📋 Thang điểm mỗi câu:</p>
                <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                  <span>✅ 1/4 ý đúng → <strong>0.1đ</strong></span>
                  <span>✅ 2/4 ý đúng → <strong>0.25đ</strong></span>
                  <span>✅ 3/4 ý đúng → <strong>0.5đ</strong></span>
                  <span>⭐ 4/4 ý đúng → <strong>1.0đ</strong></span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 text-lg font-black text-white shadow-lg hover:brightness-110 transition"
              >
                ⚔️ Vào Đấu Trường!
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══ ROUND INTRO ═══ */}
        {phase === "round-intro" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`intro-${currentRound}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <div className={`rounded-3xl bg-gradient-to-br ${config.color} p-6 text-center shadow-2xl ${config.bgGlow}`}>
                <motion.p
                  className="text-7xl"
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  {config.icon}
                </motion.p>
                <h2 className="mt-3 text-3xl font-black text-white">
                  Vòng {currentRound + 1}: {config.name}
                </h2>
                <p className="mt-1 text-white/80">
                  {config.questions} câu hỏi – {config.time / 60} phút – Tổng {config.questions} điểm
                </p>

                {/* Score so far */}
                {roundResults.length > 0 && (
                  <div className="mt-3 rounded-xl bg-white/20 p-2 text-sm text-white">
                    Điểm hiện tại: <strong>{roundResults.reduce((s, r) => s + r.totalScore, 0).toFixed(2)}đ</strong>
                    {" / "}{roundResults.reduce((s, r) => s + r.maxScore, 0)}đ
                  </div>
                )}

                <div className="mt-4 rounded-2xl bg-white/10 p-3 text-left text-sm text-white/90">
                  {currentRound === 0 && <p>💡 Mỗi câu có 4 ý: a(Nhận biết), b(Thông hiểu), c(Vận dụng), d(Vận dụng cao). Hãy cẩn thận với ý c và d!</p>}
                  {currentRound === 1 && <p>⚡ Câu hỏi khó hơn! Ý c, d là những bẫy kinh điển. Dùng phương pháp loại trừ!</p>}
                  {currentRound === 2 && <p>👑 2 câu quyết chiến – mỗi câu CỰC KHÓ. Bình tĩnh, đọc kỹ từng ý!</p>}
                </div>

                <button
                  onClick={beginRound}
                  className="mt-5 w-full rounded-2xl bg-white/90 p-4 text-lg font-black text-slate-800 shadow-lg hover:bg-white transition"
                >
                  🚀 Bắt Đầu Vòng {currentRound + 1}!
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ═══ PLAYING ═══ */}
        {phase === "playing" && (
          <div className="space-y-3">
            {/* Timer bar */}
            <div className={`sticky top-2 z-10 rounded-2xl p-3 shadow-xl ${
              timeDanger ? "bg-rose-600 animate-pulse" : timeWarning ? "bg-amber-500" : "bg-white/95"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-black ${timeDanger || timeWarning ? "text-white" : "text-violet-700"}`}>
                  {config.icon} Vòng {currentRound + 1}: {config.name}
                </span>
                <span className={`text-2xl font-black ${
                  timeDanger ? "text-white" : timeWarning ? "text-white" : "text-slate-800"
                }`}>
                  ⏱️ {fmt(timeLeft)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${timeDanger ? "bg-rose-300" : "bg-gradient-to-r " + config.color}`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timeLeft / config.time) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              {/* Question tabs */}
              <div className="mt-2 flex gap-1">
                {questions.map((q, i) => {
                  const filled = answeredCount(q.id) === 4;
                  const partial = answeredCount(q.id) > 0 && !filled;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQ(i)}
                      className={`flex-1 rounded-lg p-1.5 text-xs font-bold transition ${
                        currentQ === i
                          ? "bg-violet-600 text-white shadow-md"
                          : filled
                          ? "bg-emerald-100 text-emerald-700"
                          : partial
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Câu {i + 1} {filled ? "✅" : partial ? "..." : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current question */}
            <AnimatePresence mode="wait">
              {questions[currentQ] && (
                <motion.div
                  key={questions[currentQ].id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="rounded-3xl bg-white/95 p-4 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-xl bg-violet-100 px-3 py-1 text-sm font-black text-violet-700">
                      Câu {currentQ + 1}/{questions.length}
                    </span>
                    <span className="text-xs text-slate-400">
                      {answeredCount(questions[currentQ].id)}/4 ý đã chọn
                    </span>
                  </div>

                  <p className="text-base font-bold text-slate-800">
                    <ChemText text={questions[currentQ].question} />
                  </p>

                  {questions[currentQ].statements.map((s) => {
                    const qId = questions[currentQ].id;
                    const picked = answers[qId]?.[s.id];
                    const levelBadge = s.id === "a" ? "🟢 NB" : s.id === "b" ? "🔵 TH" : s.id === "c" ? "🟠 VD" : "🔴 VDC";

                    return (
                      <div key={s.id} className="mt-3 rounded-2xl border-2 border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-start gap-2">
                          <span className="rounded-lg bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
                            {s.label}
                          </span>
                          <span className="rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            {levelBadge}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm">
                          <ChemText text={s.text} />
                        </p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => pickAnswer(qId, s.id, true)}
                            className={`flex-1 rounded-xl p-2.5 text-sm font-bold transition ${
                              picked === true
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            ✅ Đúng
                          </button>
                          <button
                            onClick={() => pickAnswer(qId, s.id, false)}
                            className={`flex-1 rounded-xl p-2.5 text-sm font-bold transition ${
                              picked === false
                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                            }`}
                          >
                            ❌ Sai
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Navigation */}
                  <div className="mt-4 flex gap-2">
                    {currentQ > 0 && (
                      <button
                        onClick={() => setCurrentQ((c) => c - 1)}
                        className="flex-1 rounded-xl bg-slate-200 p-3 font-bold text-slate-700"
                      >
                        ◀ Câu trước
                      </button>
                    )}
                    {currentQ < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQ((c) => c + 1)}
                        className="flex-1 rounded-xl bg-violet-500 p-3 font-bold text-white"
                      >
                        Câu sau ▶
                      </button>
                    ) : (
                      <button
                        onClick={submitRound}
                        className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 font-bold text-white shadow-lg"
                      >
                        📝 Nộp Vòng {currentRound + 1}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick submit button */}
            <button
              onClick={submitRound}
              className="w-full rounded-xl bg-rose-100 p-3 text-sm font-bold text-rose-700 hover:bg-rose-200 transition"
            >
              ⚡ Nộp bài sớm
            </button>
          </div>
        )}

        {/* ═══ ROUND RESULT ═══ */}
        {phase === "round-result" && roundResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {(() => {
              const rr = roundResults[roundResults.length - 1];
              const cfg = ROUND_CONFIG[rr.round];
              return (
                <>
                  <div className={`rounded-3xl bg-gradient-to-br ${cfg.color} p-5 text-center shadow-2xl`}>
                    <p className="text-5xl">{rr.totalScore >= cfg.questions * 0.75 ? "🏆" : rr.totalScore >= cfg.questions * 0.5 ? "👍" : "💪"}</p>
                    <h3 className="mt-2 text-2xl font-black text-white">
                      Vòng {rr.round + 1}: {cfg.name}
                    </h3>
                    <p className="mt-1 text-4xl font-black text-white">
                      {rr.totalScore.toFixed(2)} / {cfg.questions} điểm
                    </p>
                    <p className="text-sm text-white/80">⏱️ {fmt(rr.timeSpent)}</p>
                  </div>

                  {/* Detail per question */}
                  {rr.questions.map((q, qi) => {
                    const a = rr.answers[q.id] || {};
                    const cc = q.statements.filter((s) => a[s.id] === s.correct).length;
                    return (
                      <div key={q.id} className="rounded-2xl bg-white/95 p-4 shadow-xl">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-violet-700">Câu {qi + 1}</span>
                          <span className={`rounded-lg px-2 py-1 text-xs font-bold ${
                            cc === 4 ? "bg-emerald-100 text-emerald-700" :
                            cc === 3 ? "bg-amber-100 text-amber-700" :
                            "bg-rose-100 text-rose-700"
                          }`}>
                            {scoreLabel(cc)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium"><ChemText text={q.question} /></p>
                        {q.statements.map((s) => {
                          const userAns = a[s.id];
                          const isCorrectAns = userAns === s.correct;
                          return (
                            <div key={s.id} className={`mt-1 rounded-lg p-2 text-xs ${
                              isCorrectAns ? "bg-emerald-50" : "bg-rose-50"
                            }`}>
                              <span className="font-bold">{s.label}</span>{" "}
                              <ChemText text={s.text} />
                              <span className="ml-2">
                                {isCorrectAns ? "✅" : "❌"}
                                {" "}(Đáp án: {s.correct ? "Đúng" : "Sai"}
                                {userAns !== undefined ? `, Bạn chọn: ${userAns ? "Đúng" : "Sai"}` : ", Chưa chọn"})
                              </span>
                            </div>
                          );
                        })}
                        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs italic text-amber-800">
                          💡 <ChemText text={q.explanation} />
                        </p>
                      </div>
                    );
                  })}

                  {/* Accumulated score */}
                  <div className="rounded-2xl bg-violet-100 p-3 text-center">
                    <p className="text-sm font-bold text-violet-700">
                      Tổng tích lũy: {roundResults.reduce((s, r) => s + r.totalScore, 0).toFixed(2)}/{roundResults.reduce((s, r) => s + r.maxScore, 0)} điểm
                    </p>
                  </div>

                  <button
                    onClick={nextRound}
                    className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 text-lg font-black text-white shadow-lg hover:brightness-110 transition"
                  >
                    {currentRound + 1 < ROUND_CONFIG.length
                      ? `🚀 Tiến vào Vòng ${currentRound + 2}!`
                      : "🏆 Xem Kết Quả Chung Cuộc!"
                    }
                  </button>
                </>
              );
            })()}
          </motion.div>
        )}

        {/* ═══ FINAL RESULT ═══ */}
        {phase === "final" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 p-6 text-center shadow-2xl">
              {(() => {
                const total = roundResults.reduce((s, r) => s + r.totalScore, 0);
                const totalTime = roundResults.reduce((s, r) => s + r.timeSpent, 0);
                const grade = total >= 9 ? "🏅 Xuất sắc" : total >= 7 ? "🏆 Giỏi" : total >= 5 ? "👍 Khá" : total >= 3 ? "📚 Trung bình" : "💪 Cần cố gắng";
                const emoji = total >= 9 ? "🎉" : total >= 7 ? "⭐" : total >= 5 ? "👏" : "📖";

                return (
                  <>
                    <motion.p
                      className="text-7xl"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: 2 }}
                    >
                      {emoji}
                    </motion.p>
                    <h2 className="mt-3 text-3xl font-black text-white">Kết Quả Chung Cuộc</h2>
                    <p className="mt-2 text-6xl font-black text-white">
                      {total.toFixed(2)}<span className="text-2xl text-white/70">/{TOTAL_MAX}</span>
                    </p>
                    <p className="mt-1 text-xl font-bold text-white/90">{grade}</p>
                    <p className="text-sm text-white/70">⏱️ Tổng: {fmt(totalTime)}</p>

                    {/* Per-round breakdown */}
                    <div className="mt-4 space-y-2">
                      {roundResults.map((rr, i) => {
                        const cfg = ROUND_CONFIG[rr.round];
                        return (
                          <div key={i} className="flex items-center justify-between rounded-xl bg-white/20 p-2 text-sm text-white">
                            <span>{cfg.icon} Vòng {i + 1}</span>
                            <span className="font-black">{rr.totalScore.toFixed(2)}/{cfg.questions}đ</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Score distribution like real exam */}
                    <div className="mt-4 rounded-2xl bg-white/10 p-3 text-left text-xs text-white/80">
                      <p className="font-bold text-white">📊 Phân tích chi tiết:</p>
                      {roundResults.flatMap((rr) =>
                        rr.questions.map((q, qi) => {
                          const a = rr.answers[q.id] || {};
                          const cc = q.statements.filter((s) => a[s.id] === s.correct).length;
                          return (
                            <p key={q.id} className="mt-1">
                              V{rr.round + 1} - Câu {qi + 1}: {scoreLabel(cc)}
                            </p>
                          );
                        })
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            <button
              onClick={() => { setPhase("menu"); setRoundResults([]); }}
              className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 text-lg font-black text-white shadow-lg"
            >
              🔄 Chiến Lại Lần Nữa!
            </button>
          </motion.div>
        )}
      </div>
    </GameShell>
  );
}

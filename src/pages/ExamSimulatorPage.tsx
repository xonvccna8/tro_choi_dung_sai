import { useEffect, useRef, useState } from "react";
import { ChemText } from "../components/ChemText";
import { GameShell } from "../components/GameShell";
import { ConfettiRain, StarBlast } from "../components/Effects";
import { multiTrueFalseQuestions } from "../data/questions";
import { useGameStore } from "../store/useGameStore";
import { calcRealScore, scoreLabel } from "../types";
import type { ExamResult, ErrorRecord, MultiTrueFalseQuestion } from "../types";
import { playCorrect, playReward, playWrong } from "../utils/sound";

const EXAM_Q_COUNT = 4;
const EXAM_SECONDS = 8 * 60;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

type Phase = "idle" | "exam" | "result";

export function ExamSimulatorPage() {
  const { addGold, addExp, addExamResult, addErrors, addPerfect, soundOn, customMultiTrueFalseQuestions } =
    useGameStore();

  const [phase, setPhase] = useState<Phase>("idle");
  const [questions, setQuestions] = useState<MultiTrueFalseQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, Record<string, boolean>>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [confetti, setConfetti] = useState(0);
  const [stars, setStars] = useState(0);
  const submitted = useRef(false);

  /* refs so timer callback is never stale */
  const qRef = useRef(questions);
  qRef.current = questions;
  const aRef = useRef(answers);
  aRef.current = answers;
  const tRef = useRef(timeLeft);
  tRef.current = timeLeft;

  /* ── timer ── */
  useEffect(() => {
    if (phase !== "exam") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          if (!submitted.current) doSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const startExam = () => {
    const pool = [...customMultiTrueFalseQuestions, ...multiTrueFalseQuestions];
    setQuestions(shuffle(pool).slice(0, EXAM_Q_COUNT));
    setAnswers({});
    setTimeLeft(EXAM_SECONDS);
    setResult(null);
    submitted.current = false;
    setPhase("exam");
  };

  const pickAnswer = (qId: string, sId: string, val: boolean) => {
    setAnswers((p) => ({ ...p, [qId]: { ...(p[qId] || {}), [sId]: val } }));
  };

  const doSubmit = () => {
    if (submitted.current) return;
    submitted.current = true;
    const qs = qRef.current;
    const ans = aRef.current;
    const spent = EXAM_SECONDS - tRef.current;

    const qResults = qs.map((q) => {
      const a = ans[q.id] || {};
      const cc = q.statements.filter((s) => a[s.id] === s.correct).length;
      return { questionId: q.id, answers: a, correctCount: cc, score: calcRealScore(cc) };
    });

    const total = qResults.reduce((s, r) => s + r.score, 0);
    const exam: ExamResult = {
      id: `exam-${Date.now()}`,
      date: new Date().toISOString(),
      questions: qResults,
      totalScore: total,
      maxScore: EXAM_Q_COUNT,
      timeSpent: spent,
    };

    // Collect errors
    const errs: ErrorRecord[] = [];
    qs.forEach((q) => {
      const a = ans[q.id] || {};
      q.statements.forEach((s) => {
        if (a[s.id] !== s.correct) {
          errs.push({
            id: `err-${Date.now()}-${q.id}-${s.id}`,
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

    // Count perfects
    const perfects = qResults.filter((r) => r.correctCount === 4).length;
    for (let i = 0; i < perfects; i++) addPerfect();

    // Rewards
    const goldR = Math.round(total * 80);
    addGold(goldR);
    addExp(Math.round(total * 25));
    addExamResult(exam);
    if (errs.length) addErrors(errs);

    if (total >= 3.5) {
      setConfetti((v) => v + 1);
      playReward(soundOn);
    } else if (total >= 2) {
      setStars((v) => v + 1);
      playCorrect(soundOn);
    } else {
      playWrong(soundOn);
    }

    setResult(exam);
    setPhase("result");
  };

  /* progress */
  const answeredCount = questions.reduce((sum, q) => {
    const a = answers[q.id] || {};
    return sum + q.statements.filter((s) => a[s.id] !== undefined).length;
  }, 0);
  const totalStatements = questions.length * 4;

  return (
    <GameShell title="📝 Thi Thu That" subtitle="Mo phong de thi Hoa - 4 cau Dung/Sai">
      {/* ── IDLE ── */}
      {phase === "idle" && (
        <div className="rounded-3xl bg-white/95 p-5 shadow-xl">
          <h2 className="text-xl font-black text-violet-700">Quy tac thi</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>📌 <b>4 cau hoi</b>, moi cau <b>4 nhan dinh</b> Dung/Sai</p>
            <p>⏱️ Thoi gian: <b>8 phut</b> (giong thi that)</p>
            <p className="font-bold text-rose-600">📊 Thang diem moi cau (toi da 1.0d):</p>
            <div className="rounded-xl bg-gradient-to-r from-red-50 to-emerald-50 p-3">
              <p>• Dung <b>1</b> y → <span className="font-bold text-red-600">0.1d</span></p>
              <p>• Dung <b>2</b> y → <span className="font-bold text-orange-600">0.25d</span></p>
              <p>• Dung <b>3</b> y → <span className="font-bold text-yellow-600">0.5d</span> <span className="text-red-500">(mat 0.5d!)</span></p>
              <p>• Dung <b>4</b> y → <span className="font-bold text-emerald-600">1.0d</span> ⭐</p>
            </div>
            <p className="rounded-lg bg-rose-100 p-2 font-bold text-rose-700">
              ⚠️ Chi sai 1 y = mat 0.5 diem! Hay can than tung y!
            </p>
          </div>
          <button
            onClick={startExam}
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 p-4 text-lg font-black text-white shadow-lg"
          >
            🚀 Bat dau thi
          </button>

          {/* Exam history */}
          <ExamHistory />
        </div>
      )}

      {/* ── EXAM ── */}
      {phase === "exam" && (
        <div className="space-y-4">
          {/* Timer bar */}
          <div className="sticky top-0 z-10 rounded-2xl bg-white/95 p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className={`font-bold ${timeLeft < 60 ? "text-rose-600 animate-pulse" : ""}`}>⏱️ {fmt(timeLeft)}</span>
              <span className="text-sm">{answeredCount}/{totalStatements} y da chon</span>
              <button onClick={doSubmit} className="rounded-xl bg-rose-500 px-4 py-2 font-bold text-white">
                Nop bai
              </button>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-500 transition-all"
                style={{ width: `${(answeredCount / totalStatements) * 100}%` }}
              />
            </div>
            {timeLeft < 60 && (
              <p className="mt-1 animate-pulse text-center text-sm font-bold text-rose-600">⚠️ Con duoi 1 phut!</p>
            )}
          </div>

          {/* Questions */}
          {questions.map((q, qi) => (
            <div key={q.id} className="rounded-3xl bg-white/95 p-4 shadow-xl">
              <h3 className="font-black text-violet-700">Cau {qi + 1}/4</h3>
              <p className="mt-1 text-sm">
                <ChemText text={q.question} />
              </p>
              <div className="mt-3 space-y-2">
                {q.statements.map((s) => {
                  const chosen = answers[q.id]?.[s.id];
                  return (
                    <div key={s.id} className="rounded-xl bg-slate-50 p-3">
                      <p className="font-medium">
                        {s.label} <ChemText text={s.text} />
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => pickAnswer(q.id, s.id, true)}
                          className={`flex-1 rounded-lg py-2 font-bold text-white transition ${chosen === true ? "bg-emerald-700 ring-2 ring-emerald-300" : "bg-emerald-500"}`}
                        >
                          Dung
                        </button>
                        <button
                          onClick={() => pickAnswer(q.id, s.id, false)}
                          className={`flex-1 rounded-lg py-2 font-bold text-white transition ${chosen === false ? "bg-rose-700 ring-2 ring-rose-300" : "bg-rose-500"}`}
                        >
                          Sai
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={doSubmit}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 p-4 text-lg font-black text-white"
          >
            ✅ Nop bai
          </button>
        </div>
      )}

      {/* ── RESULT ── */}
      {phase === "result" && result && (
        <div className="relative space-y-4">
          {/* Score overview */}
          <div className="rounded-3xl bg-white/95 p-5 shadow-xl text-center">
            <h2 className="text-2xl font-black text-violet-700">📊 Ket qua thi</h2>
            <p className="mt-2 text-4xl font-black">
              <span
                className={
                  result.totalScore >= 3
                    ? "text-emerald-600"
                    : result.totalScore >= 2
                      ? "text-yellow-600"
                      : "text-rose-600"
                }
              >
                {result.totalScore.toFixed(2)}
              </span>
              <span className="text-2xl text-slate-400"> / {result.maxScore}.0d</span>
            </p>
            <p className="mt-1 text-sm text-slate-500">Thoi gian: {fmt(result.timeSpent)}</p>
            <p className="text-sm text-slate-500">
              Mat: <span className="font-bold text-rose-600">{(result.maxScore - result.totalScore).toFixed(2)}d</span>
            </p>
            <p className="mt-1 text-sm">
              Gold: <span className="font-bold text-amber-600">+{Math.round(result.totalScore * 80)}</span> | EXP:{" "}
              <span className="font-bold text-violet-600">+{Math.round(result.totalScore * 25)}</span>
            </p>
          </div>

          {/* Detailed breakdown per question */}
          {questions.map((q, qi) => {
            const qr = result.questions[qi];
            const bgColor =
              qr.correctCount === 4
                ? "bg-emerald-50 border-emerald-300"
                : qr.correctCount === 3
                  ? "bg-yellow-50 border-yellow-300"
                  : qr.correctCount === 2
                    ? "bg-orange-50 border-orange-300"
                    : "bg-red-50 border-red-300";
            return (
              <div key={q.id} className={`rounded-3xl border-2 p-4 shadow ${bgColor}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-black">Cau {qi + 1}</h3>
                  <span className="text-sm font-bold">{scoreLabel(qr.correctCount)}</span>
                </div>
                <div className="mt-2 space-y-1">
                  {q.statements.map((s) => {
                    const userAns = qr.answers[s.id];
                    const isCorrect = userAns === s.correct;
                    return (
                      <div
                        key={s.id}
                        className={`flex items-start gap-2 rounded-lg p-2 ${isCorrect ? "bg-emerald-100" : "bg-rose-100"}`}
                      >
                        <span>{isCorrect ? "✅" : "❌"}</span>
                        <div>
                          <p className="text-sm">
                            {s.label} <ChemText text={s.text} />
                          </p>
                          <p className="text-xs text-slate-500">
                            Ban chon: <b>{userAns === undefined ? "Chua chon" : userAns ? "Dung" : "Sai"}</b> | Dap an:{" "}
                            <b>{s.correct ? "Dung" : "Sai"}</b>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs italic text-slate-600">
                  <ChemText text={q.explanation} />
                </p>
              </div>
            );
          })}

          {/* Analysis */}
          <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
            <h3 className="font-black text-violet-700">💡 Phan tich</h3>
            {result.questions.filter((r) => r.correctCount === 3).length > 0 && (
              <p className="mt-2 rounded-lg bg-yellow-100 p-2 text-sm">
                ⚠️ Ban co <b>{result.questions.filter((r) => r.correctCount === 3).length}</b> cau dung 3/4 → mat{" "}
                <b>{(result.questions.filter((r) => r.correctCount === 3).length * 0.5).toFixed(1)}d</b>! Chi can
                dung them 1 y moi cau se duoc them{" "}
                {(result.questions.filter((r) => r.correctCount === 3).length * 0.5).toFixed(1)}d.
              </p>
            )}
            {result.questions.filter((r) => r.correctCount === 4).length > 0 && (
              <p className="mt-2 rounded-lg bg-emerald-100 p-2 text-sm">
                ⭐ Xuat sac! <b>{result.questions.filter((r) => r.correctCount === 4).length}</b> cau hoan hao 4/4!
              </p>
            )}
            {result.questions.filter((r) => r.correctCount <= 2).length > 0 && (
              <p className="mt-2 rounded-lg bg-rose-100 p-2 text-sm">
                ❌ Co <b>{result.questions.filter((r) => r.correctCount <= 2).length}</b> cau duoi 3/4 → can on lai kien
                thuc. Xem So Sai Lam!
              </p>
            )}
            <p className="mt-2 text-sm text-slate-600">
              Cac y sai da duoc luu vao <b>📕 So Sai Lam</b> de ban on lai.
            </p>
          </div>

          <button
            onClick={startExam}
            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 p-4 font-black text-white"
          >
            🔄 Thi lai
          </button>
          <ConfettiRain trigger={confetti} />
          <StarBlast trigger={stars} />
        </div>
      )}
    </GameShell>
  );
}

/* ── Mini component: exam history ── */
function ExamHistory() {
  const examHistory = useGameStore((s) => s.examHistory);
  if (examHistory.length === 0) return null;
  const recent = examHistory.slice(0, 5);
  return (
    <div className="mt-4">
      <h3 className="font-bold text-violet-700">📜 Lich su thi gan day</h3>
      <div className="mt-2 space-y-1">
        {recent.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-sm">
            <span>{new Date(e.date).toLocaleDateString("vi")}</span>
            <span
              className={`font-bold ${e.totalScore >= 3 ? "text-emerald-600" : e.totalScore >= 2 ? "text-yellow-600" : "text-rose-600"}`}
            >
              {e.totalScore.toFixed(2)}/{e.maxScore}d
            </span>
            <span className="text-xs text-slate-400">{fmt(e.timeSpent)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

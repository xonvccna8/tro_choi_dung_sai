import { useState } from "react";
import { ChemText } from "../components/ChemText";
import { GameShell } from "../components/GameShell";
import { useGameStore } from "../store/useGameStore";
import { playCorrect, playWrong } from "../utils/sound";

export function ErrorBookPage() {
  const { errorBook, removeError, clearErrorBook, addGold, addExp, soundOn } = useGameStore();
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<boolean | null>(null);
  const [quizResult, setQuizResult] = useState("");
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  const startQuiz = () => {
    if (errorBook.length === 0) return;
    setQuizMode(true);
    setQuizIndex(0);
    setQuizAnswer(null);
    setQuizResult("");
    setQuizScore({ correct: 0, total: 0 });
  };

  const checkQuiz = () => {
    const err = errorBook[quizIndex];
    if (quizAnswer === err.correctAnswer) {
      setQuizResult("✅ Chinh xac! Ban da nho roi.");
      setQuizScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
      removeError(err.id);
      addGold(10);
      addExp(5);
      playCorrect(soundOn);
    } else {
      setQuizResult(`❌ Sai! Dap an dung: ${err.correctAnswer ? "Dung" : "Sai"}. ${err.explanation}`);
      setQuizScore((s) => ({ ...s, total: s.total + 1 }));
      playWrong(soundOn);
    }
  };

  const nextQuiz = () => {
    if (quizIndex >= errorBook.length - 1) {
      setQuizMode(false);
      return;
    }
    setQuizIndex((i) => i + 1);
    setQuizAnswer(null);
    setQuizResult("");
  };

  return (
    <GameShell title="📕 So Sai Lam" subtitle="On lai nhung y da sai de khong lap lai">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-bold text-violet-700">{errorBook.length} loi sai da ghi nhan</p>
          {errorBook.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={startQuiz}
                className="rounded-lg bg-violet-600 px-3 py-1 text-sm font-bold text-white"
              >
                🧠 On lai
              </button>
              <button onClick={clearErrorBook} className="rounded-lg bg-slate-300 px-3 py-1 text-sm">
                Xoa het
              </button>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="mt-2 rounded-xl bg-amber-50 p-3 text-sm">
          <p className="font-bold text-amber-700">💡 Meo hoc:</p>
          <p>Nao nguoi co xu huong lap lai sai lam cu. On lai cac y sai la cach hieu qua nhat de khong mat diem!</p>
          <p className="mt-1 font-bold text-rose-600">Nho: Sai 1 y = mat 0.5 diem!</p>
        </div>

        {/* Quiz mode */}
        {quizMode && errorBook.length > 0 ? (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Cau {quizIndex + 1}/{errorBook.length}
              </p>
              <p className="text-sm">
                Dung: <span className="font-bold text-emerald-600">{quizScore.correct}</span> /{" "}
                {quizScore.total}
              </p>
            </div>

            <div className="mt-2 rounded-xl bg-violet-50 p-4">
              <p className="font-bold">
                <ChemText text={errorBook[quizIndex].statementText} />
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Lan truoc ban chon:{" "}
                <span className="font-bold text-rose-600">
                  {errorBook[quizIndex].userAnswer ? "Dung" : "Sai"}
                </span>{" "}
                (sai)
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setQuizAnswer(true)}
                className={`flex-1 rounded-xl p-3 font-bold text-white ${quizAnswer === true ? "bg-emerald-700 ring-2" : "bg-emerald-500"}`}
              >
                Dung
              </button>
              <button
                onClick={() => setQuizAnswer(false)}
                className={`flex-1 rounded-xl p-3 font-bold text-white ${quizAnswer === false ? "bg-rose-700 ring-2" : "bg-rose-500"}`}
              >
                Sai
              </button>
            </div>

            {quizAnswer !== null && !quizResult && (
              <button
                onClick={checkQuiz}
                className="mt-2 w-full rounded-xl bg-violet-600 p-3 font-bold text-white"
              >
                Kiem tra
              </button>
            )}

            {quizResult && (
              <>
                <p className="mt-2 rounded-lg bg-slate-100 p-2 text-sm">{quizResult}</p>
                <button
                  onClick={nextQuiz}
                  className="mt-2 w-full rounded-xl bg-fuchsia-600 p-3 font-bold text-white"
                >
                  {quizIndex >= errorBook.length - 1 ? "Hoan thanh" : "Cau tiep →"}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {errorBook.length === 0 && (
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-2xl">🎉</p>
                <p className="mt-1 font-bold text-emerald-700">Chua co loi sai nao!</p>
                <p className="text-sm text-slate-500">Hay lam bai thi thu de bat dau ghi nhan.</p>
              </div>
            )}
            {errorBook.slice(0, 30).map((err) => (
              <div key={err.id} className="rounded-xl bg-rose-50 p-3">
                <p className="text-sm font-medium">
                  <ChemText text={err.statementText} />
                </p>
                <p className="text-xs text-slate-500">
                  Ban chon: <span className="text-rose-600">{err.userAnswer ? "Dung" : "Sai"}</span> → Dap an:{" "}
                  <span className="text-emerald-600">{err.correctAnswer ? "Dung" : "Sai"}</span>
                </p>
                <p className="text-xs italic text-slate-400">{err.explanation}</p>
              </div>
            ))}
            {errorBook.length > 30 && (
              <p className="text-center text-sm text-slate-400">... va {errorBook.length - 30} loi khac</p>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}

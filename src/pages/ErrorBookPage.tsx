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
      setQuizResult("✅ Chính xác! Bạn đã nhớ rồi.");
      setQuizScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
      removeError(err.id);
      addGold(10);
      addExp(5);
      playCorrect(soundOn);
    } else {
         setQuizResult(`Sai! Đáp án đúng: ${err.correctAnswer ? "Đúng" : "Sai"}. ${err.explanation}`);
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
    <GameShell title="📕 Sổ Sai Lầm" subtitle="Ôn lại những ý đã sai để không lặp lại">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-bold text-violet-700">{errorBook.length} lỗi sai đã ghi nhận</p>
          {errorBook.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={startQuiz}
                className="rounded-lg bg-violet-600 px-3 py-1 text-sm font-bold text-white"
              >
                🧠 Ôn lại
              </button>
              <button onClick={clearErrorBook} className="rounded-lg bg-slate-300 px-3 py-1 text-sm">
                Xóa hết
              </button>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="mt-2 rounded-xl bg-amber-50 p-3 text-sm">
          <p className="font-bold text-amber-700">💡 Mẹo học:</p>
          <p>Não người có xu hướng lặp lại sai lầm cũ. Ôn lại các ý sai là cách hiệu quả nhất để không mất điểm!</p>
          <p className="mt-1 font-bold text-rose-600">Nhớ: Sai 1 ý = mất 0.5 điểm!</p>
        </div>

        {/* Quiz mode */}
        {quizMode && errorBook.length > 0 ? (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Câu {quizIndex + 1}/{errorBook.length}
              </p>
              <p className="text-sm">
                Đúng: <span className="font-bold text-emerald-600">{quizScore.correct}</span> /{" "}
                {quizScore.total}
              </p>
            </div>

            <div className="mt-2 rounded-xl bg-violet-50 p-4">
              <p className="font-bold">
                <ChemText text={errorBook[quizIndex].statementText} />
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Lần trước bạn chọn:{" "}
                <span className="font-bold text-rose-600">
                  {errorBook[quizIndex].userAnswer ? "Đúng" : "Sai"}
                </span>{" "}
                (sai)
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setQuizAnswer(true)}
                className={`flex-1 rounded-xl p-3 font-bold text-white ${quizAnswer === true ? "bg-emerald-700 ring-2" : "bg-emerald-500"}`}
              >
                Đúng
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
                Kiểm tra
              </button>
            )}

            {quizResult && (
              <>
                <p className="mt-2 rounded-lg bg-slate-100 p-2 text-sm">{quizResult}</p>
                <button
                  onClick={nextQuiz}
                  className="mt-2 w-full rounded-xl bg-fuchsia-600 p-3 font-bold text-white"
                >
                  {quizIndex >= errorBook.length - 1 ? "Hoàn thành" : "Câu tiếp →"}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {errorBook.length === 0 && (
              <div className="rounded-xl bg-emerald-50 p-4 text-center">
                <p className="text-2xl">🎉</p>
                <p className="mt-1 font-bold text-emerald-700">Chưa có lỗi sai nào!</p>
                <p className="text-sm text-slate-500">Hãy làm bài thi thử để bắt đầu ghi nhận.</p>
              </div>
            )}
            {errorBook.slice(0, 30).map((err) => (
              <div key={err.id} className="rounded-xl bg-rose-50 p-3">
                <p className="text-sm font-medium">
                  <ChemText text={err.statementText} />
                </p>
                <p className="text-xs text-slate-500">
                  Bạn chọn: <span className="text-rose-600">{err.userAnswer ? "Đúng" : "Sai"}</span> → Đáp án:{" "}
                  <span className="text-emerald-600">{err.correctAnswer ? "Đúng" : "Sai"}</span>
                </p>
                <p className="text-xs italic text-slate-400">{err.explanation}</p>
              </div>
            ))}
            {errorBook.length > 30 && (
              <p className="text-center text-sm text-slate-400">... và {errorBook.length - 30} lỗi khác</p>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}

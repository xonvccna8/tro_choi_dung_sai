import { Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

export function DashboardPage() {
  const { user, level, gold, streak, soundOn, toggleSound, examHistory, errorBook, perfectCount } =
    useGameStore();

  const avgScore =
    examHistory.length > 0
      ? (examHistory.reduce((s, e) => s + e.totalScore, 0) / examHistory.length).toFixed(2)
      : "--";

  return (
    <main className="mx-auto max-w-3xl p-4 pb-20">
      {/* User info */}
      <div className="rounded-3xl bg-white/95 p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-violet-700">
            Xin chào {user?.name} {user?.avatar}
          </h1>
          <button
            onClick={toggleSound}
            className="rounded-xl bg-slate-900 px-3 py-1 text-sm text-white"
          >
            Âm thanh: {soundOn ? "BẬT" : "TẮT"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-violet-100 p-3">
            <p className="text-xs">Cấp độ</p>
            <p className="font-black">{level}</p>
          </div>
          <div className="rounded-2xl bg-amber-100 p-3">
            <p className="text-xs">Vàng</p>
            <p className="font-black">{gold}</p>
          </div>
          <div className="rounded-2xl bg-rose-100 p-3">
            <p className="text-xs">Chuỗi ngày</p>
            <p className="font-black">{streak}</p>
          </div>
        </div>

        {/* Exam stats */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-fuchsia-100 p-3">
            <p className="text-xs">Thi thử</p>
            <p className="font-black">{examHistory.length}</p>
          </div>
          <div className="rounded-2xl bg-emerald-100 p-3">
            <p className="text-xs">TB điểm</p>
            <p className="font-black">{avgScore}</p>
          </div>
          <div className="rounded-2xl bg-cyan-100 p-3">
            <p className="text-xs">4/4 ⭐</p>
            <p className="font-black">{perfectCount}</p>
          </div>
        </div>

        {/* Warning banner */}
        {errorBook.length > 0 && (
          <Link
            to="/game/errors"
            className="mt-3 block rounded-xl bg-rose-100 p-2 text-center text-sm font-bold text-rose-700 shadow-sm animate-pulse"
          >
            🚑 Bệnh viện: Bạn có {errorBook.length} ca kiến thức cần cấp cứu gấp!
          </Link>
        )}
      </div>

      {/* Utilities */}
      <div className="mt-4">
        <h2 className="mb-2 text-lg font-black text-white">⭐ Nhiệm Vụ & Công Cụ</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/daily" className="rounded-2xl bg-white/90 p-4">
            <Flame className="mb-2" />
            Nhiệm vụ hằng ngày
          </Link>
          <Link to="/strategy" className="rounded-2xl bg-white/90 p-4">
            📖 Cẩm nang học
          </Link>
          <Link to="/collection" className="rounded-2xl bg-white/90 p-4">
            🎴 Bộ sưu tập
          </Link>
          <Link to="/builder" className="rounded-2xl bg-white/90 p-4 text-center">
            🧪 Tạo câu hỏi
          </Link>
        </div>
      </div>
    </main>
  );
}

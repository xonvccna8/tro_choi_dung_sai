import { Trophy, Flame, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

const examModes = [
  {
    to: "/game/arena",
    title: "⚔️ Đấu Trường Hóa Học",
    desc: "3 vòng – 10 câu – 10 điểm – Luyện như thi thật!",
    color: "from-violet-500 via-fuchsia-500 to-pink-500",
    big: true,
  },
  {
    to: "/game/exam",
    title: "📝 Thi Thử Thật",
    desc: "4 câu × 4 ý, timer 8 phút, điểm thật",
    color: "from-violet-400 to-fuchsia-500",
  },
  {
    to: "/game/eliminate",
    title: "🎯 Luyện Loại Trừ",
    desc: "PP 2 vòng: Chắc → Tập trung",
    color: "from-emerald-400 to-teal-500",
  },
  {
    to: "/game/errors",
    title: "📕 Sổ Sai Lầm",
    desc: "Ôn lại các ý đã sai",
    color: "from-rose-400 to-pink-500",
  },
  {
    to: "/strategy",
    title: "📖 Cẩm Nang",
    desc: "6 phương pháp hiệu quả",
    color: "from-amber-400 to-orange-500",
  },
];

const miniGames = [
  { to: "/game/pirate", title: "🏴‍☠️ Đảo Hải Tặc", color: "from-yellow-300 to-orange-300" },
  { to: "/game/run", title: "🏃 Đường Chạy Vô Cực", color: "from-cyan-300 to-blue-300" },
  { to: "/game/box", title: "🎁 Hộp Bí Ẩn", color: "from-pink-300 to-fuchsia-300" },
];

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
            className="mt-3 block rounded-xl bg-rose-100 p-2 text-center text-sm font-bold text-rose-700"
          >
            📕 Bạn có {errorBook.length} ý sai chưa ôn → Bấm để ôn lại!
          </Link>
        )}
      </div>

      {/* Exam training section */}
      <div className="mt-4">
        <h2 className="mb-2 text-lg font-black text-white">🎯 Luyện thi Đúng/Sai</h2>
        <div className="grid gap-3">
          {examModes.map((g) => (
            <Link
              key={g.to}
              to={g.to}
              className={`rounded-3xl bg-gradient-to-r p-4 shadow-xl ${g.color} ${g.big ? "py-6" : ""}`}
            >
              <p className="text-lg font-black text-white">{g.title}</p>
              <p className="text-sm text-white/80">{g.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Mini games */}
      <div className="mt-4">
        <h2 className="mb-2 text-lg font-black text-white">🎮 Trò Chơi Nhỏ</h2>
        <div className="grid grid-cols-3 gap-3">
          {miniGames.map((g) => (
            <Link
              key={g.to}
              to={g.to}
              className={`rounded-2xl bg-gradient-to-r p-3 text-center shadow-xl ${g.color}`}
            >
              <p className="text-sm font-black text-slate-900">{g.title}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Utilities */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link to="/daily" className="rounded-2xl bg-white/90 p-4">
          <Flame className="mb-2" />
          Nhiệm vụ hằng ngày
        </Link>
        <Link to="/leaderboard" className="rounded-2xl bg-white/90 p-4">
          <Trophy className="mb-2" />
          Bảng xếp hạng
        </Link>
        <Link to="/profile" className="rounded-2xl bg-white/90 p-4">
          <Coins className="mb-2" />
          Hồ sơ
        </Link>
        <Link to="/collection" className="rounded-2xl bg-white/90 p-4">
          🎴 Bộ sưu tập
        </Link>
        <Link to="/builder" className="col-span-2 rounded-2xl bg-white/90 p-4 text-center">
          🧪 Tạo câu hỏi
        </Link>
      </div>
    </main>
  );
}

import { Trophy, Flame, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

const examModes = [
  {
    to: "/game/exam",
    title: "📝 Thi Thu That",
    desc: "4 cau × 4 y, timer 8 phut, diem that",
    color: "from-violet-400 to-fuchsia-500",
    big: true,
  },
  {
    to: "/game/eliminate",
    title: "🎯 Luyen Loai Tru",
    desc: "PP 2 vong: Chac → Tap trung",
    color: "from-emerald-400 to-teal-500",
  },
  {
    to: "/game/errors",
    title: "📕 So Sai Lam",
    desc: "On lai cac y da sai",
    color: "from-rose-400 to-pink-500",
  },
  {
    to: "/strategy",
    title: "📖 Cam Nang",
    desc: "6 phuong phap hieu qua",
    color: "from-amber-400 to-orange-500",
  },
];

const miniGames = [
  { to: "/game/pirate", title: "🏴‍☠️ Dao Hai Tac", color: "from-yellow-300 to-orange-300" },
  { to: "/game/run", title: "🏃 Duong Chay Vo Cuc", color: "from-cyan-300 to-blue-300" },
  { to: "/game/box", title: "🎁 Blind Box", color: "from-pink-300 to-fuchsia-300" },
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
            Xin chao {user?.name} {user?.avatar}
          </h1>
          <button
            onClick={toggleSound}
            className="rounded-xl bg-slate-900 px-3 py-1 text-sm text-white"
          >
            Sound: {soundOn ? "ON" : "OFF"}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-violet-100 p-3">
            <p className="text-xs">Level</p>
            <p className="font-black">{level}</p>
          </div>
          <div className="rounded-2xl bg-amber-100 p-3">
            <p className="text-xs">Gold</p>
            <p className="font-black">{gold}</p>
          </div>
          <div className="rounded-2xl bg-rose-100 p-3">
            <p className="text-xs">Streak</p>
            <p className="font-black">{streak}</p>
          </div>
        </div>

        {/* Exam stats */}
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-fuchsia-100 p-3">
            <p className="text-xs">Thi thu</p>
            <p className="font-black">{examHistory.length}</p>
          </div>
          <div className="rounded-2xl bg-emerald-100 p-3">
            <p className="text-xs">TB diem</p>
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
            📕 Ban co {errorBook.length} y sai chua on → Bam de on lai!
          </Link>
        )}
      </div>

      {/* Exam training section */}
      <div className="mt-4">
        <h2 className="mb-2 text-lg font-black text-white">🎯 Luyen thi Dung/Sai</h2>
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
        <h2 className="mb-2 text-lg font-black text-white">🎮 Mini Games</h2>
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
          Daily mission
        </Link>
        <Link to="/leaderboard" className="rounded-2xl bg-white/90 p-4">
          <Trophy className="mb-2" />
          Leaderboard
        </Link>
        <Link to="/profile" className="rounded-2xl bg-white/90 p-4">
          <Coins className="mb-2" />
          Profile
        </Link>
        <Link to="/collection" className="rounded-2xl bg-white/90 p-4">
          🎴 Collection
        </Link>
        <Link to="/builder" className="col-span-2 rounded-2xl bg-white/90 p-4 text-center">
          🧪 Tao cau hoi
        </Link>
      </div>
    </main>
  );
}

import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Coins,
  Flame,
  Gamepad2,
  Play,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { LogoutButton } from "../components/LogoutButton";
import { useGameStore } from "../store/useGameStore";

export function DashboardPage() {
  const { user, level, gold, streak, examHistory, errorBook } = useGameStore();

  const avgScore =
    examHistory.length > 0
      ? (examHistory.reduce((s, e) => s + e.totalScore, 0) / examHistory.length).toFixed(1)
      : "--";

  const heroStats = [
    {
      label: "Cấp",
      value: level,
      icon: <BarChart3 className="h-4 w-4" />,
      shell: "bg-violet-50 text-violet-700",
      iconShell: "bg-violet-600 text-white",
    },
    {
      label: "Xu",
      value: gold,
      icon: <Coins className="h-4 w-4" />,
      shell: "bg-amber-50 text-amber-700",
      iconShell: "bg-amber-500 text-white",
    },
    {
      label: "Chuỗi",
      value: streak,
      icon: <Flame className="h-4 w-4" />,
      shell: "bg-rose-50 text-rose-700",
      iconShell: "bg-rose-500 text-white",
    },
  ];

  const shortcuts = [
    {
      to: "/games",
      title: "Trò chơi",
      icon: <Gamepad2 className="h-6 w-6" />,
      shell: "border-emerald-100 bg-emerald-50/70",
      iconShell: "bg-emerald-600 text-white",
      badge: "Chơi",
    },
    {
      to: "/leaderboard",
      title: "BXH",
      icon: <Trophy className="h-6 w-6" />,
      shell: "border-amber-100 bg-amber-50/70",
      iconShell: "bg-amber-500 text-white",
      badge: "Dẫn đầu",
    },
    {
      to: "/game/errors",
      title: "Lỗi",
      icon: <AlertTriangle className="h-6 w-6" />,
      shell: "border-rose-100 bg-rose-50/70",
      iconShell: "bg-rose-500 text-white",
      badge: `${errorBook.length}`,
    },
  ];

  const summaryCards = [
    {
      title: "Bài",
      value: examHistory.length,
      icon: <BookOpen className="h-5 w-5" />,
      shell: "bg-white border-slate-200 text-slate-900",
      iconShell: "bg-slate-900 text-white",
    },
    {
      title: "TB",
      value: avgScore,
      icon: <BarChart3 className="h-5 w-5" />,
      shell: "bg-white border-sky-100 text-slate-900",
      iconShell: "bg-sky-500 text-white",
    },
    {
      title: "Sai",
      value: errorBook.length,
      icon: <AlertTriangle className="h-5 w-5" />,
      shell: "bg-white border-rose-100 text-slate-900",
      iconShell: "bg-rose-500 text-white",
    },
  ];

  return (
    <main className="absolute inset-0 z-50 min-h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">Góc Học Tập</h1>
            </div>
          </div>
          <LogoutButton tone="student" compact />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 via-indigo-600 to-sky-500 p-5 text-white shadow-[0_22px_60px_rgba(79,70,229,0.28)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-white/15 text-3xl shadow-lg backdrop-blur-sm">
                {user?.avatar ?? "👨‍🎓"}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-100">Hôm nay</p>
                <h2 className="mt-1 text-2xl font-black sm:text-3xl">{user?.name}</h2>
              </div>
            </div>
            <Link
              to="/games"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-indigo-600 shadow-xl transition-all hover:-translate-y-1 hover:bg-indigo-50 sm:px-5"
            >
              <Play className="h-5 w-5 fill-indigo-600" />
              Vào chơi
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
              <Gamepad2 className="h-3.5 w-3.5" />
              Trực tiếp
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white">
              <BookOpen className="h-3.5 w-3.5" />
              Tự luyện
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {heroStats.map((card) => (
              <div key={card.label} className={`rounded-[1.25rem] p-3 ${card.shell}`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconShell}`}>
                  {card.icon}
                </div>
                <p className="mt-3 text-[11px] font-black uppercase tracking-[0.18em]">{card.label}</p>
                <p className="mt-1 text-lg font-black">{card.value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {shortcuts.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className={`group rounded-[1.6rem] border p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${card.shell}`}
            >
              <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                {card.badge}
              </div>
              <div className={`mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-[1.2rem] shadow-lg transition-transform group-hover:scale-110 ${card.iconShell}`}>
                {card.icon}
              </div>
              <h3 className="mt-4 text-xl font-black text-slate-900">{card.title}</h3>
            </Link>
          ))}
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.title} className={`rounded-[1.5rem] border p-5 shadow-sm ${card.shell}`}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconShell}`}>
                {card.icon}
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{card.title}</p>
              <p className={`mt-1 text-3xl font-black ${card.title === "Sai" ? "text-rose-600" : "text-slate-900"}`}>{card.value}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

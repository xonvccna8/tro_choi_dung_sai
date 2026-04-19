import { GameShell } from "../components/GameShell";
import { useGameStore } from "../store/useGameStore";
import { BarChart3, Coins, Flame, Sparkles } from "lucide-react";

export function ProfilePage() {
  const { user, level, exp, gold, streak } = useGameStore();
  const stats = [
    {
      label: "Lv",
      value: level,
      icon: <BarChart3 className="h-5 w-5" />,
      iconShell: "bg-violet-600 text-white",
    },
    {
      label: "EXP",
      value: `${exp}/100`,
      icon: <Sparkles className="h-5 w-5" />,
      iconShell: "bg-sky-500 text-white",
    },
    {
      label: "Xu",
      value: gold,
      icon: <Coins className="h-5 w-5" />,
      iconShell: "bg-amber-500 text-white",
    },
    {
      label: "Chuỗi",
      value: streak,
      icon: <Flame className="h-5 w-5" />,
      iconShell: "bg-rose-500 text-white",
    },
  ];

  return (
    <GameShell title="Hồ Sơ" subtitle="Tài khoản">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        <div className="rounded-[1.75rem] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-sky-500 p-5 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white/15 text-4xl shadow-sm backdrop-blur-sm">
              {user?.avatar}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/80">Học sinh</p>
              <p className="mt-1 text-2xl font-black">{user?.name}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {stats.map((card) => (
            <div key={card.label} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconShell}`}>
                {card.icon}
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[1.4rem] border border-sky-100 bg-sky-50/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Tiến độ exp</p>
            <p className="text-sm font-black text-sky-700">{exp}%</p>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/80">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-violet-500" style={{ width: `${Math.min(exp, 100)}%` }} />
          </div>
        </div>
      </div>
    </GameShell>
  );
}

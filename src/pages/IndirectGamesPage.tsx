import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Stars } from "lucide-react";
import { LogoutButton } from "../components/LogoutButton";

export function IndirectGamesPage() {
  const roadmapStages = [
    {
      id: "stage-1",
      icon: "🌱",
      title: "Chặng 1",
      desc: "Phản xạ",
      themeColor: "text-emerald-600",
      themeBg: "bg-emerald-100",
      games: [
        { to: "/game/box", icon: "🎁", title: "Hộp Bí Ẩn", color: "from-pink-400 to-fuchsia-400", tag: "4 ý", big: false },
        { to: "/game/pirate", icon: "🏴‍☠️", title: "Đảo Hải Tặc", color: "from-amber-400 to-orange-400", tag: "Kho báu", big: false },
        { to: "/game/run", icon: "🏃", title: "Đường Chạy", color: "from-cyan-400 to-blue-500", tag: "Đúng/Sai", big: false },
      ],
    },
    {
      id: "stage-2",
      icon: "🛡️",
      title: "Chặng 2",
      desc: "Khắc phục",
      themeColor: "text-amber-600",
      themeBg: "bg-amber-100",
      games: [
        { to: "/game/eliminate", icon: "🥷", title: "Loại Trừ", color: "from-emerald-500 to-teal-600", tag: "4 ý", big: false },
        { to: "/game/errors", icon: "🚑", title: "Bệnh Viện", color: "from-rose-400 to-rose-600", tag: "Ôn lỗi", big: false },
      ],
    },
    {
      id: "stage-3",
      icon: "👑",
      title: "Chặng 3",
      desc: "Thực chiến",
      themeColor: "text-violet-700",
      themeBg: "bg-violet-200",
      games: [
        { to: "/game/arena", icon: "⚔️", title: "Đấu Trường", color: "from-violet-600 to-indigo-600", tag: "Trùm", big: true },
      ],
    },
  ];

  return (
    <main className="mx-auto max-w-3xl p-4 animate-in fade-in slide-in-from-bottom-4 zoom-in-95">
      <div className="mb-8 rounded-3xl bg-white/95 p-6 shadow-xl text-center backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <Link
            to="/games"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <LogoutButton tone="student" compact />
        </div>
        <div className="mx-auto mt-2 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Trò Chơi Gián Tiếp</h1>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">3 chặng</span>
          <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-sky-700">Tự luyện</span>
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-violet-700">Mở bất kỳ lúc nào</span>
        </div>
      </div>

      <div className="space-y-8 relative">
        <div className="absolute left-[27px] top-6 bottom-16 w-1.5 bg-slate-200/60 rounded-full z-0 hidden sm:block"></div>

        {roadmapStages.map((stage) => (
          <div key={stage.id} className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stage.themeBg} ${stage.themeColor} text-2xl shadow-lg ring-4 ring-white`}>
                {stage.icon}
              </div>
              <div>
                <h2 className="text-xl font-black text-white drop-shadow-[0_2px_10px_rgba(15,23,42,0.35)]">{stage.title}</h2>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{stage.desc}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:pl-[68px]">
              {stage.games.map((game) => (
                <Link
                  key={game.to}
                  to={game.to}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 shadow-xl transition-all hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl ${game.color} ${game.big ? "py-8" : ""}`}
                >
                  <div className="absolute right-0 top-0 -mr-6 -mt-6 rounded-full bg-white/20 p-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Stars className="h-10 w-10 text-white/40" />
                  </div>
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl shadow-lg backdrop-blur-sm">
                        {game.icon}
                      </div>
                      <div>
                        <p className={`${game.big ? "text-2xl" : "text-xl"} font-black text-white`}>{game.title}</p>
                        <div className="mt-2 inline-flex rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/95">
                          {game.tag}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur transition-all group-hover:scale-110">
                    &rarr;
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

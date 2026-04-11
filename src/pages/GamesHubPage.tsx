import { Link } from "react-router-dom";
import { Gamepad2, Stars } from "lucide-react";

export function GamesHubPage() {
  const miniGames = [
    { to: "/game/box", title: "🎁 Hộp Bí Ẩn", color: "from-pink-400 to-fuchsia-400", desc: "Mở hộp đoán đúng sai nhận vàng" },
    { to: "/game/pirate", title: "🏴‍☠️ Đảo Hải Tặc", color: "from-amber-400 to-orange-400", desc: "Săn kho báu kiến thức hoá học" },
    { to: "/game/run", title: "🏃 Đường Chạy Vô Cực", color: "from-cyan-400 to-blue-400", desc: "Chạy đua giới hạn trí tuệ" },
  ];

  return (
    <main className="mx-auto max-w-3xl p-4 animate-in fade-in slide-in-from-bottom-4 zoom-in-95">
      <div className="mb-6 rounded-3xl bg-white/95 p-6 shadow-xl text-center backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg">
          <Gamepad2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-violet-700">Khu Giải Trí</h1>
        <p className="mt-2 text-sm text-slate-500">
          Vừa học vừa chơi, nhận thêm vàng thưởng! Các trò chơi giúp ôn tập phản xạ Đúng/Sai tốc độ cao.
        </p>
      </div>

      <div className="grid gap-4">
        {miniGames.map((g) => (
          <Link
            key={g.to}
            to={g.to}
            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 shadow-xl transition-all hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl ${g.color}`}
          >
            <div className="absolute right-0 top-0 -mr-6 -mt-6 rounded-full bg-white/20 p-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Stars className="h-10 w-10 text-white/40" />
            </div>
            <div className="relative z-10">
              <p className="flex items-center text-xl font-black text-white">{g.title}</p>
              <p className="ml-8 mt-1 text-sm font-semibold text-white/90">{g.desc}</p>
            </div>
            <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur transition-all group-hover:scale-110">
              &rarr;
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
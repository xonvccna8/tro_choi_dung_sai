import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Radio, Swords, Users } from "lucide-react";
import { useGameStore } from "../store/useGameStore";

export function GamesHubPage() {
  const user = useGameStore((state) => state.user);

  return (
    <main className="mx-auto max-w-4xl p-4 animate-in fade-in slide-in-from-bottom-4 zoom-in-95">
      <div className="mb-8 rounded-3xl bg-white/95 p-6 shadow-xl text-center backdrop-blur-sm relative">
        <Link
          to={user?.role === "teacher" ? "/teacher" : "/dashboard"}
          className="absolute left-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-black text-slate-900 mt-2">Khu Vực Trò Chơi</h1>
        <p className="mt-2 text-sm text-slate-600">
          Hãy chọn hình thức tham gia học tập và giải trí phù hợp với bạn.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Trực Tiếp */}
        <Link
          to="/games/direct"
          className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500 p-1 shadow-2xl transition hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(124,58,237,0.3)]"
        >
          <div className="relative flex h-full flex-col justify-between rounded-[calc(2.5rem-4px)] bg-white/10 p-8 pt-10 backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl transition group-hover:bg-white/30" />
            
            <div className="relative z-10">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white text-violet-600 shadow-xl">
                <Radio className="h-8 w-8" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                <div className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                Thời gian thực
              </div>
              <h2 className="mt-4 text-4xl font-black text-white">Đối kháng<br/>Trực tiếp</h2>
              <p className="mt-4 text-base font-semibold text-white/90">
                Tham gia các phòng đấu live 1 vs 1 hoặc 1 vs cả lớp. 
                Đua top xếp hạng thời gian thực!
              </p>
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-bold text-white">
                <Swords className="h-3.5 w-3.5" /> 1 đấu 1
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-bold text-white">
                <Users className="h-3.5 w-3.5" /> Cả lớp
              </span>
            </div>
          </div>
        </Link>

        {/* Card 2: Gián Tiếp (Tự luyện) */}
        <Link
          to="/games/indirect"
          className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-500 via-cyan-500 to-sky-500 p-1 shadow-2xl transition hover:scale-[1.02] hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(14,165,233,0.3)]"
        >
          <div className="relative flex h-full flex-col justify-between rounded-[calc(2.5rem-4px)] bg-white/10 p-8 pt-10 backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl transition group-hover:bg-white/30" />
            
            <div className="relative z-10">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white text-emerald-600 shadow-xl">
                <BookOpen className="h-8 w-8" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white backdrop-blur-md">
                <span className="text-lg leading-none">📚</span>
                Học & Chơi
              </div>
              <h2 className="mt-4 text-4xl font-black text-white">Lộ trình<br/>Tự luyện</h2>
              <p className="mt-4 text-base font-semibold text-white/90">
                Tự thăng cấp qua các chặng Đảo Hải Tặc, Hộp Bí Ẩn, Đấu Trường... 
                chơi bất kỳ lúc nào bạn rảnh!
              </p>
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-bold text-white">
                5 chế độ
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-bold text-white">
                Lưu tiến độ
              </span>
            </div>
          </div>
        </Link>
      </div>
    </main>
  );
}
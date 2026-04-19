import { GameShell } from "../components/GameShell";
import { Medal, Sparkles, Trophy } from "lucide-react";

export function LeaderboardPage() {
  const rows: Array<{ name: string; score: number }> = [];

  return (
    <GameShell title="Bảng Xếp Hạng" subtitle="Dẫn đầu">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        {rows.length === 0 ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-amber-100 text-amber-600 shadow-sm">
              <Trophy className="h-8 w-8" />
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">Chưa có điểm</span>
              <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">Làm bài để lên hạng</span>
            </div>
          </div>
        ) : (
          rows.map((row, index) => (
            <div key={row.name} className="mt-2 flex items-center justify-between rounded-[1.2rem] bg-slate-100 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
                  {index === 0 ? <Trophy className="h-5 w-5 text-amber-500" /> : index === 1 ? <Medal className="h-5 w-5 text-slate-500" /> : <Sparkles className="h-5 w-5 text-violet-500" />}
                </div>
                <p className="font-bold">{row.name}</p>
              </div>
              <p className="font-black">{row.score}</p>
            </div>
          ))
        )}
      </div>
    </GameShell>
  );
}

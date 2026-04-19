import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookMarked, Search, PlayCircle } from "lucide-react";
import { useAppAuth } from "../lib/AuthContext";
import { fetchGameAssignments, type GameAssignmentDocument } from "../lib/gameAssignments";

export function StudentExamsPage() {
  const { currentUser } = useAppAuth();
  const [games, setGames] = useState<GameAssignmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const next = await fetchGameAssignments();
        if (!mounted) return;
        setGames(next.filter((game) => game.status === "published"));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) return games;
    return games.filter((game) => [game.title, game.description, game.className ?? "", game.mode].join(" ").toLowerCase().includes(text));
  }, [games, keyword]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
            <BookMarked className="h-4 w-4" />
            Trò chơi được giao
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Danh sách game cho {currentUser?.email ?? "học sinh"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Chỉ hiển thị game đã phát hành để học sinh vào chơi trực tiếp.</p>
        </section>

        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên game hoặc mô tả" className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-violet-400" />
        </div>

        <section className="grid gap-4">
          {loading && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Đang tải game...</div>}
          {!loading && filtered.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Chưa có game nào phù hợp.</div>}
          {filtered.map((game) => (
            <article key={game.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">{game.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{game.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Mode: {game.mode}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{game.className ?? "Tất cả"}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{game.questionIds.length} câu</span>
                  </div>
                </div>
                <Link to={`/game-assignment/${game.id}`} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white">
                  <PlayCircle className="h-4 w-4" />
                  Chơi ngay
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

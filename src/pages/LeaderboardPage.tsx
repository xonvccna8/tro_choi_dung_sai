import { GameShell } from "../components/GameShell";
import { useGameStore } from "../store/useGameStore";

export function LeaderboardPage() {
  const user = useGameStore((s) => s.user);
  const level = useGameStore((s) => s.level);
  const streak = useGameStore((s) => s.streak);

  const rows = [
    { name: "Linh", score: 320 },
    { name: "Minh", score: 280 },
    { name: user?.name ?? "Ban", score: level * 40 + streak * 10 },
    { name: "Trang", score: 180 },
  ].sort((a, b) => b.score - a.score);

  return (
    <GameShell title="Leaderboard" subtitle="Top hoc sinh cham chi">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        {rows.map((r, idx) => (
          <div key={r.name} className="mt-2 flex items-center justify-between rounded-xl bg-slate-100 p-3">
            <p className="font-bold">#{idx + 1} {r.name}</p>
            <p>{r.score} pts</p>
          </div>
        ))}
      </div>
    </GameShell>
  );
}

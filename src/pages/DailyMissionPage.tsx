import { Link } from "react-router-dom";
import { GameShell } from "../components/GameShell";
import { useGameStore } from "../store/useGameStore";

export function DailyMissionPage() {
  const increaseStreak = useGameStore((s) => s.increaseStreak);
  const addGold = useGameStore((s) => s.addGold);

  return (
    <GameShell title="Daily Mission" subtitle="Duy tri thoi quen hoc moi ngay">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        <div className="rounded-2xl bg-violet-100 p-3">1) Hoan thanh 1 cau Dung/Sai don</div>
        <div className="mt-2 rounded-2xl bg-pink-100 p-3">2) Hoan thanh 1 cau 4 y Dung/Sai</div>
        <button
          className="mt-3 w-full rounded-xl bg-emerald-500 p-3 font-bold text-white"
          onClick={() => {
            increaseStreak();
            addGold(60);
          }}
        >
          Nhan thuong ngay
        </button>
        <Link className="mt-3 block text-center text-sm text-violet-700 underline" to="/dashboard">
          Ve dashboard
        </Link>
      </div>
    </GameShell>
  );
}

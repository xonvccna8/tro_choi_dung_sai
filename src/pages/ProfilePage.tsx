import { GameShell } from "../components/GameShell";
import { useGameStore } from "../store/useGameStore";

export function ProfilePage() {
  const { user, level, exp, gold, streak } = useGameStore();
  return (
    <GameShell title="Profile" subtitle="Thong tin hoc sinh">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        <p className="text-2xl">{user?.avatar} {user?.name}</p>
        <p className="mt-2">Level: {level}</p>
        <p>EXP: {exp}/100</p>
        <p>Gold: {gold}</p>
        <p>Streak: {streak} ngay</p>
      </div>
    </GameShell>
  );
}

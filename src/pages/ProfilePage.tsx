import { GameShell } from "../components/GameShell";
import { useGameStore } from "../store/useGameStore";

export function ProfilePage() {
  const { user, level, exp, gold, streak } = useGameStore();
  return (
    <GameShell title="Hồ Sơ" subtitle="Thông tin học sinh">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        <p className="text-2xl">{user?.avatar} {user?.name}</p>
        <p className="mt-2">Cấp độ: {level}</p>
        <p>Kinh nghiệm: {exp}/100</p>
        <p>Vàng: {gold}</p>
        <p>Chuỗi ngày: {streak} ngày</p>
      </div>
    </GameShell>
  );
}

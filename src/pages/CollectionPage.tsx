import { GameShell } from "../components/GameShell";
import { useGameStore } from "../store/useGameStore";

export function CollectionPage() {
  const collection = useGameStore((s) => s.collection);
  return (
    <GameShell title="Bộ Sưu Tập" subtitle="Vật phẩm đã mở khóa">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        {collection.length === 0 && <p>Chưa có vật phẩm nào. Hãy chơi Hộp Bí Ẩn.</p>}
        {collection.map((item) => (
          <div key={item} className="mt-2 rounded-xl bg-slate-100 p-3">
            {item}
          </div>
        ))}
      </div>
    </GameShell>
  );
}

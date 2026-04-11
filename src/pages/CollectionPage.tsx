import { GameShell } from "../components/GameShell";
import { useGameStore } from "../store/useGameStore";

export function CollectionPage() {
  const collection = useGameStore((s) => s.collection);
  return (
    <GameShell title="Collection" subtitle="Vat pham da mo khoa">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        {collection.length === 0 && <p>Chua co vat pham nao. Hay choi Blind Box.</p>}
        {collection.map((item) => (
          <div key={item} className="mt-2 rounded-xl bg-slate-100 p-3">
            {item}
          </div>
        ))}
      </div>
    </GameShell>
  );
}

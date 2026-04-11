import { useNavigate } from "react-router-dom";
import { students } from "../data/students";
import { useGameStore } from "../store/useGameStore";

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useGameStore((s) => s.setUser);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center p-6">
      <div className="w-full rounded-3xl bg-white/95 p-6 shadow-2xl">
        <h1 className="text-center text-3xl font-black text-violet-700">Chem True/False Quest</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Chọn học sinh để bắt đầu chơi mỗi ngày</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {students.map((s) => (
            <button
              key={s.id}
              className="rounded-2xl bg-gradient-to-r from-yellow-200 to-pink-200 p-4 text-left transition hover:scale-[1.03]"
              onClick={() => {
                setUser(s);
                navigate("/dashboard");
              }}
            >
              <div className="text-2xl">{s.avatar}</div>
              <div className="font-bold text-slate-800">{s.name}</div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

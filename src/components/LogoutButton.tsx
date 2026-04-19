import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useGameStore } from "../store/useGameStore";

type LogoutButtonProps = {
  tone?: "admin" | "teacher" | "student";
  compact?: boolean;
  className?: string;
};

const toneClasses = {
  admin: {
    button: "border-white/10 bg-slate-900 text-white hover:bg-slate-800",
    icon: "bg-white/10 text-white",
  },
  teacher: {
    button: "border-amber-200/40 bg-amber-700 text-white hover:bg-amber-800",
    icon: "bg-white/15 text-white",
  },
  student: {
    button: "border-violet-200/40 bg-violet-600 text-white hover:bg-violet-700",
    icon: "bg-white/15 text-white",
  },
} as const;

export function LogoutButton({ tone = "student", compact = false, className = "" }: LogoutButtonProps) {
  const navigate = useNavigate();
  const logout = useGameStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Không thể đăng xuất khỏi Firebase.", error);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Đăng xuất"
      title="Đăng xuất"
      className={`group inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${toneClasses[tone].button} ${compact ? "justify-center px-2.5" : ""} ${className}`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:-rotate-6 ${toneClasses[tone].icon}`}
      >
        <LogOut className="h-4 w-4" />
      </span>
      {!compact && <span className="hidden sm:inline">Đăng xuất</span>}
    </button>
  );
}
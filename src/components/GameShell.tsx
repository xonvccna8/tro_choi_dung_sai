import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function GameShell({ title, subtitle, children }: Props) {
  return (
    <div className="mx-auto max-w-3xl p-4 pb-20">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/70">{subtitle}</p>
          <h1 className="text-2xl font-black text-white">{title}</h1>
        </div>
        <Link to="/dashboard" className="rounded-2xl bg-white/20 p-3 text-white">
          <Home size={20} />
        </Link>
      </div>
      {children}
    </div>
  );
}

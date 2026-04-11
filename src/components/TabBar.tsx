import { Link, useLocation } from "react-router-dom";
import { Home, Gamepad2, Trophy, User } from "lucide-react";

export function TabBar() {
  const location = useLocation();

  const tabs = [
    { name: "Học Tập", path: "/dashboard", icon: <Home className="h-6 w-6" /> },
    { name: "Giải Trí", path: "/games", icon: <Gamepad2 className="h-6 w-6" /> },
    { name: "Xếp Hạng", path: "/leaderboard", icon: <Trophy className="h-6 w-6" /> },
    { name: "Cá Nhân", path: "/profile", icon: <User className="h-6 w-6" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-white/95 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.2)] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-around p-2">
        {tabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center space-y-1 rounded-xl p-2 px-4 transition-all duration-300 ${
                isActive ? "bg-violet-100 text-violet-700" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon}
              <span className="text-[10px] font-bold sm:text-xs">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

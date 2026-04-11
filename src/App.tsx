import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { CollectionPage } from "./pages/CollectionPage";
import { DailyMissionPage } from "./pages/DailyMissionPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EliminationTrainerPage } from "./pages/EliminationTrainerPage";
import { EndlessRunPage } from "./pages/EndlessRunPage";
import { ErrorBookPage } from "./pages/ErrorBookPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PirateIslandPage } from "./pages/PirateIslandPage";
import { ProfilePage } from "./pages/ProfilePage";
import { BlindBoxPage } from "./pages/BlindBoxPage";
import { ChemArenaPage } from "./pages/ChemArenaPage";
import { QuestionBuilderPage } from "./pages/QuestionBuilderPage";
import { StrategyGuidePage } from "./pages/StrategyGuidePage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { GamesHubPage } from "./pages/GamesHubPage";
import { MainLayout } from "./components/MainLayout";
import { useGameStore } from "./store/useGameStore";

function GuardedRoute({ children }: { children: ReactElement }) {
  const user = useGameStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-500 via-fuchsia-500 to-sky-500 text-slate-800">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Role based dashboards */}
        <Route path="/admin" element={<GuardedRoute><AdminDashboardPage /></GuardedRoute>} />
        <Route path="/teacher" element={<GuardedRoute><TeacherDashboardPage /></GuardedRoute>} />

        {/* Layout routes with Tab Bar */}
        <Route element={<GuardedRoute><MainLayout /></GuardedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/games" element={<GamesHubPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/daily" element={<DailyMissionPage />} />
          <Route path="/builder" element={<QuestionBuilderPage />} />
          <Route path="/strategy" element={<StrategyGuidePage />} />
        </Route>

        {/* Full screen game routes */}
        <Route path="/game/pirate" element={<GuardedRoute><PirateIslandPage /></GuardedRoute>} />
        <Route path="/game/run" element={<GuardedRoute><EndlessRunPage /></GuardedRoute>} />
        <Route path="/game/box" element={<GuardedRoute><BlindBoxPage /></GuardedRoute>} />
        <Route path="/game/arena" element={<GuardedRoute><ChemArenaPage /></GuardedRoute>} />
        <Route path="/game/eliminate" element={<GuardedRoute><EliminationTrainerPage /></GuardedRoute>} />
        <Route path="/game/errors" element={<GuardedRoute><ErrorBookPage /></GuardedRoute>} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

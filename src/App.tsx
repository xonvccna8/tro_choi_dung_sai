import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { CollectionPage } from "./pages/CollectionPage";
import { DailyMissionPage } from "./pages/DailyMissionPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EliminationTrainerPage } from "./pages/EliminationTrainerPage";
import { EndlessRunPage } from "./pages/EndlessRunPage";
import { ErrorBookPage } from "./pages/ErrorBookPage";
import { ExamSimulatorPage } from "./pages/ExamSimulatorPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PirateIslandPage } from "./pages/PirateIslandPage";
import { ProfilePage } from "./pages/ProfilePage";
import { BlindBoxPage } from "./pages/BlindBoxPage";
import { ChemArenaPage } from "./pages/ChemArenaPage";
import { QuestionBuilderPage } from "./pages/QuestionBuilderPage";
import { StrategyGuidePage } from "./pages/StrategyGuidePage";
import { useGameStore } from "./store/useGameStore";

function GuardedRoute({ children }: { children: ReactElement }) {
  const user = useGameStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-500 via-fuchsia-500 to-sky-500">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <GuardedRoute>
              <DashboardPage />
            </GuardedRoute>
          }
        />
        <Route path="/game/pirate" element={<GuardedRoute><PirateIslandPage /></GuardedRoute>} />
        <Route path="/game/run" element={<GuardedRoute><EndlessRunPage /></GuardedRoute>} />
        <Route path="/game/box" element={<GuardedRoute><BlindBoxPage /></GuardedRoute>} />
        <Route path="/game/exam" element={<GuardedRoute><ExamSimulatorPage /></GuardedRoute>} />
        <Route path="/game/arena" element={<GuardedRoute><ChemArenaPage /></GuardedRoute>} />
        <Route path="/game/eliminate" element={<GuardedRoute><EliminationTrainerPage /></GuardedRoute>} />
        <Route path="/game/errors" element={<GuardedRoute><ErrorBookPage /></GuardedRoute>} />
        <Route path="/strategy" element={<GuardedRoute><StrategyGuidePage /></GuardedRoute>} />
        <Route path="/daily" element={<GuardedRoute><DailyMissionPage /></GuardedRoute>} />
        <Route path="/leaderboard" element={<GuardedRoute><LeaderboardPage /></GuardedRoute>} />
        <Route path="/profile" element={<GuardedRoute><ProfilePage /></GuardedRoute>} />
        <Route path="/collection" element={<GuardedRoute><CollectionPage /></GuardedRoute>} />
        <Route path="/builder" element={<GuardedRoute><QuestionBuilderPage /></GuardedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

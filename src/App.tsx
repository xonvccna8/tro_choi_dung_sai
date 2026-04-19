import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { useAppAuth } from "./lib/AuthContext";
import { resolveHomeRouteForRole } from "./lib/userProfiles";
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
import { AcademicArenaPage } from "./pages/AcademicArenaPage";
import { LiveBattleHubPage } from "./pages/LiveBattleHubPage";
import { LiveBattleRoomPage } from "./pages/LiveBattleRoomPage";
import { QuestionBuilderPage } from "./pages/QuestionBuilderPage";
import { StrategyGuidePage } from "./pages/StrategyGuidePage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { GamesHubPage } from "./pages/GamesHubPage";
import { DirectGamesPage } from "./pages/DirectGamesPage";
import { IndirectGamesPage } from "./pages/IndirectGamesPage";
import { TeacherClassesPage } from "./pages/TeacherClassesPage";
import { TeacherStatsPage } from "./pages/TeacherStatsPage";
import { StudentExamPage } from "./pages/StudentExamPage";
import { StudentExamsPage } from "./pages/StudentExamsPage";
import { StudentGamePage } from "./pages/StudentGamePage";
import { TeacherQuestionLibraryPage } from "./pages/TeacherQuestionLibraryPage";
import { TeacherGameAssignmentPage } from "./pages/TeacherGameAssignmentPage";
import { TeacherGameAssignmentsPage } from "./pages/TeacherGameAssignmentsPage";

import { MainLayout } from "./components/MainLayout";
import { useGameStore } from "./store/useGameStore";
import type { AppUserRole } from "./types";

function GuardedRoute({ children, allowedRoles }: { children: ReactElement; allowedRoles?: AppUserRole[] }) {
  const storedUser = useGameStore((s) => s.user);
  const { loading, profile, isConfigured } = useAppAuth();
  const user = profile ?? storedUser;

  if (isConfigured && loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-emerald-200">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={resolveHomeRouteForRole(user.role)} replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-500 via-fuchsia-500 to-sky-500 text-slate-800">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin" element={<GuardedRoute allowedRoles={["admin"]}><AdminDashboardPage /></GuardedRoute>} />
        <Route path="/teacher" element={<GuardedRoute allowedRoles={["teacher"]}><TeacherDashboardPage /></GuardedRoute>} />
        <Route path="/teacher/classes" element={<GuardedRoute allowedRoles={["teacher"]}><TeacherClassesPage /></GuardedRoute>} />
        <Route path="/teacher/library" element={<GuardedRoute allowedRoles={["teacher"]}><TeacherQuestionLibraryPage /></GuardedRoute>} />
        <Route path="/teacher/game-assignment" element={<GuardedRoute allowedRoles={["teacher"]}><TeacherGameAssignmentPage /></GuardedRoute>} />
        <Route path="/teacher/game-assignments" element={<GuardedRoute allowedRoles={["teacher"]}><TeacherGameAssignmentsPage /></GuardedRoute>} />
        <Route path="/teacher/stats" element={<GuardedRoute allowedRoles={["teacher"]}><TeacherStatsPage /></GuardedRoute>} />

        <Route element={<GuardedRoute><MainLayout /></GuardedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/games" element={<GamesHubPage />} />
          <Route path="/games/direct" element={<DirectGamesPage />} />
          <Route path="/games/indirect" element={<IndirectGamesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/exams" element={<StudentExamsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/daily" element={<DailyMissionPage />} />
          <Route path="/builder" element={<GuardedRoute allowedRoles={["teacher"]}><QuestionBuilderPage /></GuardedRoute>} />
          <Route path="/strategy" element={<StrategyGuidePage />} />
        </Route>

        <Route path="/game-assignment/:assignmentId" element={<GuardedRoute><StudentGamePage /></GuardedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

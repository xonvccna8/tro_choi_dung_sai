import {
  ArrowRight,
  BookMarked,
  FileUser,
  FlaskConical,
  Gamepad2,
  Layers3,
  ShieldCheck,
  Sparkles,
  BarChart3,
  ClipboardList,
  Target,
  Trophy,
  Users,
  Radio,
} from "lucide-react";
import { Link } from "react-router-dom";
import { LogoutButton } from "../components/LogoutButton";
import { useQuestionBank } from "../hooks/useQuestionBank";
import { useGameStore } from "../store/useGameStore";

export function TeacherDashboardPage() {
  const user = useGameStore((s) => s.user);
  const { questions, loading, error, isConfigured } = useQuestionBank();

  const totalQuestions = questions.length;
  const runCount = questions.filter((question) => question.gameModes.includes("run")).length;
  const pirateCount = questions.filter((question) => question.gameModes.includes("pirate")).length;
  const blindBoxCount = questions.filter((question) => question.gameModes.includes("blind-box")).length;
  const eliminationCount = questions.filter((question) => question.gameModes.includes("elimination")).length;
  const arenaCount = questions.filter((question) => question.gameModes.includes("arena")).length;
  const readyModes = [runCount, pirateCount, blindBoxCount, eliminationCount, arenaCount].filter((count) => count > 0).length;
  const coverageTarget = Math.min(100, Math.round((readyModes / 5) * 100));

  const statCards = [
    {
      title: "Ngân hàng",
      value: loading ? "..." : totalQuestions,
      note: error ? "Lỗi đồng bộ" : "Đồng bộ",
      icon: <Layers3 className="h-6 w-6" />,
      colorText: "text-rose-600",
      colorBg: "bg-rose-50",
      borderColor: "border-rose-200"
    },
    {
      title: "Chạy + Hải tặc",
      value: runCount + pirateCount,
      note: `${runCount}/${pirateCount}`,
      icon: <Target className="h-6 w-6" />,
      colorText: "text-rose-600",
      colorBg: "bg-rose-50",
      borderColor: "border-rose-200"
    },
    {
      title: "4 ý",
      value: blindBoxCount + eliminationCount + arenaCount,
      note: `Đấu trường ${arenaCount}`,
      icon: <FlaskConical className="h-6 w-6" />,
      colorText: "text-rose-600",
      colorBg: "bg-rose-50",
      borderColor: "border-rose-200"
    },
    {
      title: "Phủ chế độ",
      value: `${coverageTarget}%`,
      note: `${readyModes}/5 chế độ`,
      icon: <ShieldCheck className="h-6 w-6" />,
      colorText: "text-rose-600",
      colorBg: "bg-rose-50",
      borderColor: "border-rose-200"
    },
  ];

  const quickActions = [
    {
      title: "Soạn",
      href: "/builder",
      icon: <BookMarked className="h-5 w-5" />,
      colorBg: "bg-indigo-600",
      badge: "Ngân hàng",
    },
    {
      title: "Đề thi",
      href: "/teacher/exams",
      icon: <ClipboardList className="h-5 w-5" />,
      colorBg: "bg-violet-600",
      badge: "Tạo bài",
    },
    {
      title: "Giao game",
      href: "/teacher/game-assignments",
      icon: <Target className="h-5 w-5" />,
      colorBg: "bg-fuchsia-600",
      badge: "Phân bài",
    },
    {
      title: "Đối kháng",
      href: "/games/direct",
      icon: <Radio className="h-5 w-5" />,
      colorBg: "bg-rose-600",
      badge: "Thi Live",
    },
    {
      title: "Thống kê",
      href: "/teacher/stats",
      icon: <BarChart3 className="h-5 w-5" />,
      colorBg: "bg-amber-600",
      badge: "Tiến độ",
    },
    {
      title: "Lớp học",
      href: "/teacher/classes",
      icon: <Users className="h-5 w-5" />,
      colorBg: "bg-emerald-600",
      badge: "Quản lý",
    },
  ];

  const distributions = [
    { label: "Chạy", count: runCount, color: "bg-emerald-500" },
    { label: "Hải tặc", count: pirateCount, color: "bg-amber-500" },
    { label: "Hộp", count: blindBoxCount, color: "bg-sky-500" },
    { label: "Loại Trừ", count: eliminationCount, color: "bg-rose-500" },
    { label: "Đấu trường", count: arenaCount, color: "bg-indigo-500" },
  ];

  const todoItems = [
    { label: isConfigured ? "Firebase ổn" : "Thiếu Firebase", tone: isConfigured ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700" },
    { label: totalQuestions > 0 ? "Đã có ngân hàng" : "Thêm câu đầu tiên", tone: totalQuestions > 0 ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700" },
    { label: arenaCount > 0 ? "Đấu trường sẵn sàng" : "Bổ sung đấu trường", tone: arenaCount > 0 ? "bg-indigo-50 text-indigo-700" : "bg-rose-50 text-rose-700" },
  ];

  const heroChips = [
    {
      label: `${readyModes}/5 chế độ`,
      tone: "bg-white/85 text-slate-700",
    },
    {
      label: `${totalQuestions} câu`,
      tone: "bg-white/85 text-slate-700",
    },
    {
      label: isConfigured ? "Firebase" : "Cần cấu hình",
      tone: isConfigured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
    },
  ];

  const classroomStats = [
    { label: "LT1", val: 0 },
    { label: "LT2", val: 0 },
    { label: "Đấu trường", val: 0 },
    { label: "Hỗ trợ", val: 0 },
  ];

  const maxDistribution = Math.max(...distributions.map((item) => item.count), 1);

  return (
    <main className="absolute inset-0 z-50 min-h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">Không Gian Giáo Viên</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-2 md:flex">
              <span className="text-sm font-black text-slate-900">{user?.name}</span>
              <span className="text-lg">{user?.avatar}</span>
            </div>
            <LogoutButton tone="teacher" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[1.8rem] border border-indigo-100 bg-white shadow-sm">
          <div className="relative px-6 py-7 sm:p-8">
            <div className="absolute right-0 top-0 hidden h-full w-1/3 bg-gradient-to-l from-indigo-50/80 to-transparent lg:block" />
            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  <Sparkles className="h-4 w-4" />
                  Giáo viên
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Tổng quan</h2>
                <div className="mt-5 flex flex-wrap gap-2 text-[13px] font-medium text-slate-600">
                  {heroChips.map((chip) => (
                    <span key={chip.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-black uppercase tracking-[0.18em] ${chip.tone}`}>
                      {chip.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="group rounded-[1.25rem] border border-slate-100 bg-slate-50/70 p-4 text-center transition-all hover:-translate-y-1 hover:border-indigo-100 hover:bg-white hover:shadow-md"
                  >
                    <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-2xl ${action.colorBg} text-white shadow-sm`}>
                      {action.icon}
                    </div>
                    <p className="mt-3 text-sm font-black text-slate-900">{action.title}</p>
                    <div className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                      {action.badge}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <article key={card.title} className={`rounded-[1.25rem] border-2 bg-gradient-to-br from-white to-rose-50/30 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(244,63,94,0.15)] ${card.borderColor}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-black text-slate-600">{card.title}</p>
                  <div className="mt-2 text-3xl font-black text-rose-700">{card.value}</div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm">
                  {card.icon}
                </div>
              </div>
              <div className="mt-4 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 shadow-sm">
                {card.note}
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Phủ game</h3>
                  <div className="mt-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-700">
                    5 nhóm chính
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {distributions.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-black text-slate-700">{item.label}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-900">{item.count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${item.count === 0 ? 0 : Math.max(8, Math.round((item.count / maxDistribution) * 100))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-indigo-100 bg-indigo-50/30 p-6 shadow-sm sm:p-8">
              <h3 className="flex items-center gap-2 text-xl font-black text-slate-900">
                <FileUser className="h-5 w-5 text-indigo-600" />
                Việc cần làm
              </h3>
              <div className="mt-6 flex flex-wrap gap-3">
                {todoItems.map((item) => (
                  <div key={item.label} className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${item.tone}`}>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="flex items-center gap-2 text-xl font-black text-slate-900">
                <Users className="h-5 w-5 text-emerald-500" />
                Dữ liệu lớp
              </h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {classroomStats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-black text-slate-700">{stat.label}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-900 shadow-sm">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="flex items-center gap-2 text-xl font-black text-slate-900">
                <Sparkles className="h-5 w-5 text-violet-500" />
                Tác vụ nhanh
              </h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <Link
                    key={`${action.title}-list`}
                    to={action.href}
                    className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:border-indigo-100 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.colorBg} text-white shadow-sm`}>
                        {action.icon}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{action.title}</p>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{action.badge}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
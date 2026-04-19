import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  KeyRound,
  Radio,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { LogoutButton } from "../components/LogoutButton";
import { useGameStore } from "../store/useGameStore";

export function DirectGamesPage() {
  const user = useGameStore((state) => state.user);
  const logoutTone: "admin" | "teacher" | "student" =
    user?.role === "teacher" ? "teacher" : user?.role === "admin" ? "admin" : "student";

  const roleCard =
    user?.role === "teacher"
      ? {
          title: "Giáo viên",
          chips: [
            { label: "Mở phòng", icon: <Radio className="h-3.5 w-3.5" /> },
            { label: "Hẹn giờ", icon: <CalendarClock className="h-3.5 w-3.5" /> },
            { label: "Phát mã", icon: <KeyRound className="h-3.5 w-3.5" /> },
          ],
        }
      : user?.role === "admin"
        ? {
            title: "Xem luồng",
            chips: [
              { label: "Xem thử", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
              { label: "Di động", icon: <Sparkles className="h-3.5 w-3.5" /> },
              { label: "Trực tiếp", icon: <Radio className="h-3.5 w-3.5" /> },
            ],
          }
        : {
            title: "Học sinh",
            chips: [
              { label: "Chọn", icon: <Sparkles className="h-3.5 w-3.5" /> },
              { label: "Nhập mã", icon: <KeyRound className="h-3.5 w-3.5" /> },
              { label: "Vào chơi", icon: <Swords className="h-3.5 w-3.5" /> },
            ],
          };

  const directModes = [
    {
      to: "/game/battle?mode=duel",
      index: "01",
      badge: "2 người · 1 phòng",
      title: "Đối kháng 1 & 1",
      icon: <Swords className="h-6 w-6" />,
      iconShell: "bg-violet-600 text-white",
      frame: "from-violet-500 via-fuchsia-500 to-rose-400",
      shell: "border-violet-100 bg-[linear-gradient(180deg,rgba(245,243,255,0.96)_0%,rgba(255,255,255,0.98)_56%,rgba(253,242,248,0.95)_100%)]",
      accent: "bg-violet-100 text-violet-700",
      cta: "bg-violet-600 text-white group-hover:bg-violet-700",
      details: [
        { label: "2 bạn", icon: <Users className="h-3.5 w-3.5" /> },
        { label: "Hẹn giờ", icon: <CalendarClock className="h-3.5 w-3.5" /> },
        { label: "Tốc độ", icon: <Sparkles className="h-3.5 w-3.5" /> },
      ],
    },
    {
      to: "/game/battle?mode=live",
      index: "02",
      badge: "1 host · cả lớp vào chung",
      title: "Đối kháng 1 & lớp",
      icon: <Users className="h-6 w-6" />,
      iconShell: "bg-sky-600 text-white",
      frame: "from-sky-500 via-cyan-500 to-emerald-400",
      shell: "border-sky-100 bg-[linear-gradient(180deg,rgba(240,249,255,0.98)_0%,rgba(255,255,255,0.98)_54%,rgba(236,253,245,0.96)_100%)]",
      accent: "bg-sky-100 text-sky-700",
      cta: "bg-sky-600 text-white group-hover:bg-sky-700",
      details: [
        { label: "Cả lớp", icon: <Users className="h-3.5 w-3.5" /> },
        { label: "1 mã", icon: <KeyRound className="h-3.5 w-3.5" /> },
        { label: "BXH", icon: <Trophy className="h-3.5 w-3.5" /> },
      ],
    },
  ];

  const highlights = [
    { label: "Ít bước", icon: <Sparkles className="h-4 w-4" /> },
    { label: "Mã ngắn", icon: <KeyRound className="h-4 w-4" /> },
    { label: "Di động", icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  const steps = [
    {
      title: "Chọn chế độ",
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      title: "Nhập mã",
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      title: "Xem BXH",
      icon: <Trophy className="h-4 w-4" />,
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-4 pb-10 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 sm:px-5 sm:py-6">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,250,252,0.97)_0%,rgba(255,255,255,0.99)_55%,rgba(244,249,255,0.97)_100%)] p-4 shadow-[0_30px_90px_rgba(76,29,149,0.18)] backdrop-blur-sm sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.16),_transparent_68%)]" />
        <div className="pointer-events-none absolute -right-10 top-24 h-40 w-40 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 bottom-12 h-36 w-36 rounded-full bg-violet-300/25 blur-3xl" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <Link
            to="/games"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-slate-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <LogoutButton tone={logoutTone} compact />
        </div>

        <div className="relative z-10 mt-6 grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-sky-500 text-white shadow-[0_18px_40px_rgba(109,40,217,0.32)]">
              <Radio className="h-8 w-8" />
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              Phân khu trực tiếp
            </div>
            <h1 className="mt-4 max-w-xl text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              Đối kháng trực tiếp
            </h1>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.label} className="inline-flex items-center gap-2 rounded-[1.35rem] border border-white/80 bg-white/90 px-4 py-3 text-sm font-black text-slate-900 shadow-lg shadow-slate-200/60">
                  {item.icon}
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.9rem] border border-slate-900/10 bg-slate-900 p-5 text-white shadow-[0_26px_80px_rgba(15,23,42,0.28)] sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-300">Vai trò hiện tại</p>
                <p className="mt-1 text-lg font-black text-white">{roleCard.title}</p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <KeyRound className="h-4 w-4 text-amber-300" />
                Vai trò
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {roleCard.chips.map((chip) => (
                  <div key={chip.label} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
                    {chip.icon}
                    {chip.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid gap-5 xl:grid-cols-2">
          {directModes.map((mode) => (
            <Link
              key={mode.to}
              to={mode.to}
              className={`group rounded-[2.1rem] bg-gradient-to-br p-[1px] shadow-[0_22px_60px_rgba(15,23,42,0.15)] transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_30px_80px_rgba(15,23,42,0.2)] ${mode.frame}`}
            >
              <div className={`relative h-full overflow-hidden rounded-[calc(2.1rem-1px)] border p-5 sm:p-6 ${mode.shell}`}>
                <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-white/55 blur-3xl" />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${mode.iconShell}`}>
                    {mode.icon}
                  </div>
                  <span className="text-4xl font-black leading-none text-slate-200">{mode.index}</span>
                </div>

                <div className={`relative z-10 mt-5 inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${mode.accent}`}>
                  {mode.badge}
                </div>
                <h2 className="relative z-10 mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-[1.75rem]">{mode.title}</h2>

                <div className="relative z-10 mt-5 flex flex-wrap gap-2.5">
                  {mode.details.map((detail) => (
                    <div key={detail.label} className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/88 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                      {detail.icon}
                      {detail.label}
                    </div>
                  ))}
                </div>

                <div className={`relative z-10 mt-6 inline-flex w-full items-center justify-between rounded-[1.2rem] px-4 py-3 text-sm font-black shadow-lg transition-colors ${mode.cta}`}>
                  <span>Chọn chế độ này</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.8rem] border border-white/80 bg-white/92 p-5 shadow-xl shadow-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">3 chạm</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {steps.map((step) => (
                <div key={step.title} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700">
                  {step.icon}
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 shadow-xl shadow-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">Quyền tạo</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                GV tạo
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                <KeyRound className="h-3.5 w-3.5 text-sky-600" />
                HS nhập mã
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-slate-700 shadow-sm">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                BXH live
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
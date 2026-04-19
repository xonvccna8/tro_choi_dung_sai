import {
  Activity,
  ArrowRight,
  BookOpenCheck,
  Database,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { LogoutButton } from "../components/LogoutButton";
import { useQuestionBank } from "../hooks/useQuestionBank";
import { hasFirebaseConfig } from "../lib/firebase";
import { useGameStore } from "../store/useGameStore";

export function AdminDashboardPage() {
  const user = useGameStore((s) => s.user);
  const { questions, loading, error, isConfigured } = useQuestionBank();

  const totalQuestions = questions.length;
  const trueFalseCount = questions.filter((question) => question.type === "true-false").length;
  const multiCount = questions.filter((question) => question.type === "multi-true-false").length;
  const runReadyCount = questions.filter((question) => question.gameModes.includes("run")).length;

  const healthCards = [
    {
      title: "Ngân hàng câu hỏi",
      value: loading ? "..." : totalQuestions,
      note: error ? "Đang lỗi kết nối" : isConfigured ? "Đang đồng bộ" : "Thiếu biến môi trường máy chủ",
      icon: <Database className="h-5 w-5" />,
      tone: "from-slate-900 to-slate-700 text-white",
    },
    {
      title: "Đăng nhập Firebase",
      value: hasFirebaseConfig ? "BẬT" : "DÙNG THỬ",
      note: hasFirebaseConfig ? "Đăng nhập thật đã sẵn sàng" : "Đang dùng cục bộ",
      icon: <ShieldCheck className="h-5 w-5" />,
      tone: "from-emerald-500 to-teal-500 text-white",
    },
    {
      title: "Bộ câu đơn",
      value: trueFalseCount,
      note: `${runReadyCount} câu đã gắn cho Đường Chạy`,
      icon: <Layers3 className="h-5 w-5" />,
      tone: "from-sky-500 to-cyan-500 text-white",
    },
    {
      title: "Bộ câu 4 ý",
      value: multiCount,
      note: "Dùng cho Hộp Bí Ẩn, Loại Trừ, Đấu Trường",
      icon: <BookOpenCheck className="h-5 w-5" />,
      tone: "from-fuchsia-500 to-violet-500 text-white",
    },
  ];

  const actionCards = [
    {
      title: "Kiểm tra luồng thi trực tiếp",
      description: "Xem màn phân nhánh đối kháng 1&1 và 1&lớp như học sinh đang thấy trên điện thoại.",
      href: "/games/direct",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      title: "Xem luồng học sinh",
      description: "Mở dashboard học sinh để kiểm tra hành trình, nhiệm vụ và các điểm chạm chính.",
      href: "/dashboard",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      title: "Mở trung tâm trò chơi",
      description: "Duyệt nhanh các mode hiện có để đánh giá độ sẵn sàng trước khi triển khai.",
      href: "/games",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      title: "Kiểm tra bảng xếp hạng",
      description: "Xem lớp dữ liệu kết quả hiện đang hiển thị ở khu vực leaderboard.",
      href: "/leaderboard",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <main className="relative mx-auto min-h-screen max-w-6xl px-4 py-6 pb-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.38),_transparent_65%)]" />
      <div className="pointer-events-none absolute -left-12 top-24 h-56 w-56 rounded-full bg-sky-400/20 blur-[90px]" />
      <div className="pointer-events-none absolute right-0 top-12 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-[110px]" />

      <div className="relative z-10 space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_25px_80px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                <Wrench className="h-4 w-4" />
                Trung tâm quản trị
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Xin chào, {user?.name} {user?.avatar}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Màn quản trị được làm lại theo nhịp của dự án tham chiếu: tiêu đề rõ, trạng thái hệ thống nhìn được ngay, và các lối đi nhanh đến những vùng quan trọng nhất của ứng dụng.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">3 vai trò đã có chặn quyền riêng</span>
                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5">Ngân hàng câu hỏi dùng API phía máy chủ</span>
                <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1.5">Đăng nhập thật bật khi có VITE_FIREBASE_*</span>
              </div>
            </div>

            <div className="flex items-start justify-end">
              <LogoutButton tone="admin" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {healthCards.map((card) => (
            <article
              key={card.title}
              className={`rounded-[1.75rem] bg-gradient-to-br p-[1px] shadow-xl ${card.tone}`}
            >
              <div className="h-full rounded-[calc(1.75rem-1px)] bg-slate-950/88 p-5 text-white">
                <div className="flex items-center justify-between text-slate-200">
                  <span className="text-sm font-semibold">{card.title}</span>
                  <span className="rounded-xl bg-white/10 p-2">{card.icon}</span>
                </div>
                <div className="mt-6 text-3xl font-black tracking-tight">{card.value}</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{card.note}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[2rem] border border-white/60 bg-white/94 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Tác vụ nhanh</p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">Điều hướng quản trị</h2>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">Xem trực tiếp</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {actionCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.href}
                  className="group rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                    {card.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-900">
                    Mở khu vực
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/60 bg-white/94 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Tình trạng hệ thống
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Đăng nhập ứng dụng</span>
                  <span className={`font-bold ${hasFirebaseConfig ? "text-emerald-600" : "text-amber-600"}`}>
                    {hasFirebaseConfig ? "Đăng nhập Firebase" : "Dùng thử cục bộ"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <span>API câu hỏi</span>
                  <span className={`font-bold ${error ? "text-rose-600" : isConfigured ? "text-emerald-600" : "text-amber-600"}`}>
                    {error ? "Lỗi kết nối" : isConfigured ? "Hoạt động" : "Chưa cấu hình"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <span>Chặn quyền</span>
                  <span className="font-bold text-sky-600">Quản trị / Giáo viên / Học sinh</span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-dashed border-white/40 bg-white/78 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-6">
              <h2 className="flex items-center gap-2 text-xl font-black text-slate-900">
                <Sparkles className="h-5 w-5 text-fuchsia-500" />
                Việc nên làm tiếp
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p className="rounded-2xl bg-slate-50 px-4 py-3">1. Điền đủ biến môi trường Firebase trên Vercel để bỏ hoàn toàn chế độ dùng thử.</p>
                <p className="rounded-2xl bg-slate-50 px-4 py-3">2. Tạo hồ sơ `users/{'{uid}'}` có `role: admin` cho tài khoản quản trị chính.</p>
                <p className="rounded-2xl bg-slate-50 px-4 py-3">3. Theo dõi sau khi giáo viên cập nhật ngân hàng câu hỏi để xác nhận dữ liệu học sinh nhận được là đồng nhất.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
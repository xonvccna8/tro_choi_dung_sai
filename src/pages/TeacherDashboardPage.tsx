import { Users, FileUser, Trophy, FlaskConical, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

export function TeacherDashboardPage() {
  const user = useGameStore((s) => s.user);

  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-orange-50 p-6 pb-20">
      <div className="mb-6 flex items-center justify-between rounded-3xl bg-amber-600 p-6 text-white shadow-xl">
        <div>
          <p className="text-sm font-bold text-amber-200">Giáo Viên Của Hệ Thống</p>
          <h1 className="text-2xl font-black">Xin chào, {user?.name} {user?.avatar}</h1>
        </div>
        <Link to="/login" className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white hover:bg-amber-800">
          Đăng xuất
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: <LayoutDashboard size={24} />, title: "Danh Sách Lớp", desc: "3 lớp quản lý" },
          { icon: <FileUser size={24} />, title: "Quản Lý Học Sinh", desc: "120 học sinh" },
          { icon: <Trophy size={24} />, title: "Xếp Hạng Học Sinh", desc: "Theo từng game" },
          { icon: <FlaskConical size={24} />, title: "Tạo Đề / Trò Chơi", desc: "Bộ câu hỏi tùy chỉnh" },
        ].map((item, i) => (
          <div key={i} className="cursor-pointer rounded-2xl bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-amber-500/20">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              {item.icon}
            </div>
            <h3 className="font-bold text-slate-800">{item.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-black text-slate-800 flex items-center gap-2">
            <Users className="text-emerald-500" /> Báo cáo lớp học hôm nay
          </h2>
          <div className="space-y-3">
            {[
              { label: "Hoàn thành Lộ Trình 1 (Tân Binh)", val: 12 },
              { label: "Hoàn thành Lộ Trình 2 (Tinh Anh)", val: 7 },
              { label: "Vượt qua Lộ Trình 3 (Đấu Trường)", val: 1 },
              { label: "Học sinh CẦN trợ giúp ở Kiến Thức C", val: 4 },
            ].map((stat, i) => (
              <div key={i} className="flex justify-between border-b pb-2 text-sm last:border-0">
                <span className="text-slate-600">{stat.label}</span>
                <span className="font-bold text-slate-900">{stat.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl flex flex-col items-center justify-center text-center">
          <FlaskConical className="h-12 w-12 text-violet-500 mb-3" />
          <h3 className="font-black text-xl text-slate-800">Tự tạo trò chơi của bạn</h3>
          <p className="mt-2 text-sm text-slate-500">
            Tính năng giáo viên cho phép bạn biên soạn câu hỏi đúng sai chuẩn cấu trúc thi để phát cho học sinh lớp bạn học.
          </p>
          <Link to="/builder" className="mt-4 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white shadow hover:bg-violet-700">
             Vào Trình Soạn Thảo
          </Link>
        </div>
      </div>
    </main>
  );
}
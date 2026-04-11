import { ShieldAlert, Users, Settings, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { useGameStore } from "../store/useGameStore";

export function AdminDashboardPage() {
  const user = useGameStore((s) => s.user);

  return (
    <main className="mx-auto min-h-screen max-w-4xl bg-slate-50 p-6 pb-20">
      <div className="mb-6 flex items-center justify-between rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
        <div>
          <p className="text-sm font-bold text-slate-400">Admin Control Panel</p>
          <h1 className="text-2xl font-black">Xin chào, {user?.name} {user?.avatar}</h1>
        </div>
        <Link to="/login" className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">
          Đăng xuất
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { icon: <Users size={24} />, title: "Quản lý Giáo Viên" },
          { icon: <Users size={24} />, title: "Quản lý Học Sinh" },
          { icon: <Database size={24} />, title: "Sao lưu Dữ Liệu" },
          { icon: <Settings size={24} />, title: "Cài đặt Hệ thống" },
        ].map((item, i) => (
          <div key={i} className="cursor-pointer rounded-2xl bg-white p-6 text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              {item.icon}
            </div>
            <h3 className="font-bold text-slate-800">{item.title}</h3>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-black text-slate-800 flex items-center gap-2">
          <ShieldAlert className="text-rose-500" /> Hoạt động hệ thống gần đây
        </h2>
        <div className="space-y-3">
          {[
            { msg: "Giáo viên 'Cô giáo Hóa' đã tạo phòng thi mới", time: "10 phút trước" },
            { msg: "15 học sinh mớ đăng ký tài khoản", time: "1 giờ trước" },
            { msg: "Hệ thống backup dữ liệu thành công", time: "2 giờ trước" },
          ].map((act, i) => (
             <div key={i} className="flex justify-between rounded-xl bg-slate-50 p-4 border border-slate-100">
               <span className="font-medium text-slate-700">{act.msg}</span>
               <span className="text-sm text-slate-400">{act.time}</span>
             </div>
          ))}
        </div>
      </div>
    </main>
  );
}
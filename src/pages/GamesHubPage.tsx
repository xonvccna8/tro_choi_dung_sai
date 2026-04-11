import { Link } from "react-router-dom";
import { Gamepad2, Stars } from "lucide-react";

export function GamesHubPage() {
  const roadmapStages = [
    {
      id: "stage-1",
      icon: "🌱",
      title: "Chặng 1: Tân Binh Phản Xạ",
      desc: "Làm nóng não bộ với các mệnh đề đơn lẻ, luật chơi đơn giản.",
      themeColor: "text-emerald-600",
      themeBg: "bg-emerald-100",
      games: [
        { to: "/game/box", title: "🎁 Hộp Bí Ẩn", color: "from-pink-400 to-fuchsia-400", desc: "Mở hộp đoán đúng sai nhận vàng thưởng to", big: false },
        { to: "/game/pirate", title: "🏴‍☠️ Đảo Hải Tặc", color: "from-amber-400 to-orange-400", desc: "Đào kho báu với tri thức hóa học", big: false },
        { to: "/game/run", title: "🏃 Đường Chạy Vô Cực", color: "from-cyan-400 to-blue-500", desc: "Chạy đua liên tục vượt giới hạn trí tuệ", big: false },
      ]
    },
    {
      id: "stage-2",
      icon: "🛡️",
      title: "Chặng 2: Tinh Anh Khắc Phục",
      desc: "Luyện tư duy loại trừ và dũng cảm đối mặt với lỗ hổng của bản thân.",
      themeColor: "text-amber-600",
      themeBg: "bg-amber-100",
      games: [
        { to: "/game/eliminate", title: "🥷 Thợ Săn Loại Trừ", color: "from-emerald-500 to-teal-600", desc: "Giải mã tuyệt kỹ phân biệt Thực - Hư", big: false },
        { to: "/game/errors", title: "🚑 Bệnh Viện Hóa Học", color: "from-rose-400 to-rose-600", desc: "Cấp cứu và chữa lành các kiến thức đã sai", big: false },
      ]
    },
    {
      id: "stage-3",
      icon: "👑",
      title: "Chặng 3: Cao Thủ Thực Chiến",
      desc: "Áp lực thời gian, câu hỏi tổ hợp 4 ý chuẩn cấu trúc thi tốt nghiệp.",
      themeColor: "text-violet-700",
      themeBg: "bg-violet-200",
      games: [
        { to: "/game/arena", title: "⚔️ Đấu Trường Hóa Học", color: "from-violet-600 to-indigo-600", desc: "3 vòng sinh tử – Chinh phục điểm 10 như thi thật", big: true },
      ]
    }
  ];

  return (
    <main className="mx-auto max-w-3xl p-4 animate-in fade-in slide-in-from-bottom-4 zoom-in-95">
      <div className="mb-8 rounded-3xl bg-white/95 p-6 shadow-xl text-center backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg">
          <Gamepad2 className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-violet-700">Lộ Trình Trò Chơi</h1>
        <p className="mt-2 text-sm text-slate-600">
          Học hóa chưa bao giờ dễ đến thế! Hãy leo rank từ từ qua 3 chặng đường để chinh phục điểm 10 thủ khoa nhé.
        </p>
      </div>

      <div className="space-y-8 relative">
        {/* Đường kẽ nối lộ trình (Timeline line) */}
        <div className="absolute left-[27px] top-6 bottom-16 w-1.5 bg-slate-200/60 rounded-full z-0 hidden sm:block"></div>

        {roadmapStages.map((stage) => (
          <div key={stage.id} className="relative z-10">
            {/* Stage Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stage.themeBg} ${stage.themeColor} text-2xl shadow-lg ring-4 ring-white`}>
                {stage.icon}
              </div>
              <div>
                <h2 className={`text-xl font-black ${stage.themeColor}`}>{stage.title}</h2>
                <p className="text-sm font-semibold text-slate-600">{stage.desc}</p>
              </div>
            </div>

            {/* Game Cards */}
            <div className="grid gap-4 sm:pl-[68px]">
              {stage.games.map((g) => (
                <Link
                  key={g.to}
                  to={g.to}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 shadow-xl transition-all hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl ${g.color} ${g.big ? 'py-8' : ''}`}
                >
                  <div className="absolute right-0 top-0 -mr-6 -mt-6 rounded-full bg-white/20 p-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Stars className="h-10 w-10 text-white/40" />
                  </div>
                  <div className="relative z-10">
                    <p className={`${g.big ? 'text-2xl' : 'text-xl'} flex items-center font-black text-white`}>{g.title}</p>
                    <p className={`mt-1 font-semibold text-white/90 ${g.big ? 'text-base ml-9' : 'text-sm ml-8'}`}>{g.desc}</p>
                  </div>
                  <div className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur transition-all group-hover:scale-110">
                    &rarr;
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
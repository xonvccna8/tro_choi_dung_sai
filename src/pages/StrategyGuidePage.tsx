import { GameShell } from "../components/GameShell";
import { calcRealScore } from "../types";
import { Link } from "react-router-dom";

const strategies = [
  {
    icon: "📊",
    title: "Hiểu thang điểm thật",
    desc: "Đúng 3/4 chỉ được 0.5đ, đúng 4/4 được 1.0đ. Sai 1 ý = mất 0.5đ! Vì vậy PHẢI cẩn thận từng ý, đừng vội vàng.",
    tip: "Hãy dành thêm 30 giây kiểm tra lại ý bạn chưa chắc chắn. 30 giây đó có thể cứu 0.5 điểm!",
    game: "/game/exam",
    gameName: "Thi Thử Thật",
  },
  {
    icon: "🎯",
    title: "Phương pháp Loại Trừ 2 Vòng",
    desc: "Vòng 1: Nhanh chóng đánh dấu ý bạn CHẮC CHẮN biết. Vòng 2: Dồn toàn bộ suy nghĩ vào ý CHƯA CHẮC.",
    tip: "Thường bạn tự tin 2-3 ý/câu. Tập trung vào 1-2 ý còn lại sẽ tăng tỷ lệ 4/4 đáng kể.",
    game: "/game/eliminate",
    gameName: "Luyện Loại Trừ",
  },
  {
    icon: "⚡",
    title: "Luyện tốc độ từng ý",
    desc: "Mỗi ý Đúng/Sai cần đọc kỹ và xử lý trong ~30 giây. Luyện nhiều ý riêng lẻ giúp tăng tốc và tự tin.",
    tip: "Chạy Đường Chạy Vô Cực mỗi ngày 10 phút, mục tiêu 20+ ý/phút với độ chính xác >85%.",
    game: "/game/run",
    gameName: "Đường Chạy Vô Cực",
  },
  {
    icon: "📕",
    title: "Ôn lại lỗi sai",
    desc: "Não người có xu hướng lặp lại sai lầm cũ. Ghi nhận và ôn lại những ý đã sai là cách hiệu quả nhất.",
    tip: "Sau mỗi bài thi thử, mở Sổ Sai Lầm và ôn lại TẤT CẢ các ý sai. Lặp lại đến khi không còn lỗi.",
    game: "/game/errors",
    gameName: "Sổ Sai Lầm",
  },
  {
    icon: "🔑",
    title: "Nhận diện từ khóa bẫy",
    desc: "Các từ như 'chỉ', 'luôn luôn', 'tất cả', 'không bao giờ', 'duy nhất' thường là BẪY. Mệnh đề tuyệt đối thường SAI.",
    tip: "Khi thấy từ tuyệt đối, hãy tự hỏi: 'Có ngoại lệ nào không?' Nếu có 1 ngoại lệ → mệnh đề SAI.",
    game: "/game/pirate",
    gameName: "Đảo Hải Tặc",
  },
  {
    icon: "🧠",
    title: "Xử lý từng ý ĐỘC LẬP",
    desc: "Đừng để đáp án ý a ảnh hưởng ý b. Mỗi ý là một mệnh đề riêng biệt. Đọc và xét đúng/sai RIÊNG từng ý.",
    tip: "Che các ý khác, chỉ đọc 1 ý tại 1 thời điểm. Quyết định xong mới chuyển ý tiếp.",
    game: "/game/eliminate",
    gameName: "Luyện Loại Trừ",
  },
];

export function StrategyGuidePage() {
  return (
    <GameShell title="📖 Cẩm Nang Chiến Thuật" subtitle="6 phương pháp làm Đúng/Sai hiệu quả">
      {/* Scoring table */}
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        <h2 className="text-lg font-black text-rose-600">⚠️ Bảng điểm thật - Hiểu để không mất điểm oan!</h2>
        <div className="mt-3 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-violet-100">
              <tr>
                <th className="p-2 text-left">Số ý đúng</th>
                <th className="p-2">Điểm nhận</th>
                <th className="p-2">Điểm mất</th>
                <th className="p-2">Nhận xét</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4].map((n) => (
                <tr
                  key={n}
                  className={
                    n === 3 ? "bg-yellow-50 font-bold" : n === 4 ? "bg-emerald-50 font-bold" : ""
                  }
                >
                  <td className="p-2">{n}/4</td>
                  <td className="p-2 text-center">{calcRealScore(n)}đ</td>
                  <td className="p-2 text-center text-rose-600">{(1 - calcRealScore(n)).toFixed(2)}đ</td>
                  <td className="p-2 text-xs">
                    {n === 0 && "💀 Mất trọn"}
                    {n === 1 && "😱 Gần như mất trọn"}
                    {n === 2 && "😥 Mất 3/4 số điểm"}
                    {n === 3 && "⚠️ SAI 1 Ý = MẤT 0.5Đ!"}
                    {n === 4 && "⭐ Hoàn hảo!"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-lg bg-rose-100 p-3 text-center">
          <p className="text-sm font-bold text-rose-700">
            4 câu × sai 1 ý/câu = mất 2.0 điểm trên tổng 4.0!
          </p>
          <p className="text-xs text-rose-600">(chỉ còn 2.0đ thay vì 4.0đ)</p>
        </div>

        {/* Visual example */}
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-bold text-violet-700">📋 Ví dụ thực tế:</p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between rounded bg-yellow-100 p-1 px-2">
              <span>Câu 1: ✅ ✅ ❌ ✅ → 3/4</span>
              <span className="font-bold text-yellow-700">0.5đ (mất 0.5đ)</span>
            </div>
            <div className="flex justify-between rounded bg-emerald-100 p-1 px-2">
              <span>Câu 2: ✅ ✅ ✅ ✅ → 4/4</span>
              <span className="font-bold text-emerald-700">1.0đ ⭐</span>
            </div>
            <div className="flex justify-between rounded bg-orange-100 p-1 px-2">
              <span>Câu 3: ✅ ❌ ✅ ❌ → 2/4</span>
              <span className="font-bold text-orange-700">0.25đ (mất 0.75đ)</span>
            </div>
            <div className="flex justify-between rounded bg-emerald-100 p-1 px-2">
              <span>Câu 4: ✅ ✅ ✅ ✅ → 4/4</span>
              <span className="font-bold text-emerald-700">1.0đ ⭐</span>
            </div>
            <div className="flex justify-between rounded bg-violet-100 p-1 px-2 font-bold">
              <span>Tổng</span>
              <span>2.75 / 4.0đ</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            → Nếu câu 1 và câu 3 đúng hết: 4.0đ! Chỉ sai 3 ý mà mất 1.25đ.
          </p>
        </div>
      </div>

      {/* Strategy cards */}
      {strategies.map((s, i) => (
        <div key={i} className="mt-4 rounded-3xl bg-white/95 p-4 shadow-xl">
          <h3 className="text-lg font-black text-violet-700">
            {s.icon} PP{i + 1}: {s.title}
          </h3>
          <p className="mt-2 text-sm">{s.desc}</p>
          <p className="mt-2 rounded-lg bg-amber-50 p-2 text-sm">
            💡 <b>Mẹo:</b> {s.tip}
          </p>
          <Link
            to={s.game}
            className="mt-2 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white"
          >
            Luyện tập: {s.gameName} →
          </Link>
        </div>
      ))}

      {/* Quick guide */}
      <div className="mt-4 rounded-3xl bg-gradient-to-r from-violet-100 to-fuchsia-100 p-4 shadow-xl">
        <h3 className="font-black text-violet-700">🗺️ Lộ trình ôn tập khuyến nghị</h3>
        <div className="mt-2 space-y-2 text-sm">
          <p>
            <b>Bước 1:</b> Đọc Cẩm Nang → hiểu thang điểm và chiến thuật
          </p>
          <p>
            <b>Bước 2:</b> Chạy Đường Chạy Vô Cực 10 phút/ngày → tăng phản xạ
          </p>
          <p>
            <b>Bước 3:</b> Luyện Loại Trừ 5 câu/ngày → master phương pháp 2 vòng
          </p>
          <p>
            <b>Bước 4:</b> Thi Thử Thật 1 lần/ngày → mô phỏng áp lực thi
          </p>
          <p>
            <b>Bước 5:</b> Ôn Sổ Sai Lầm sau mỗi lần thi → không lặp lại lỗi
          </p>
        </div>
      </div>
    </GameShell>
  );
}

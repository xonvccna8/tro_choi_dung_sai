import { GameShell } from "../components/GameShell";
import { calcRealScore } from "../types";
import { Link } from "react-router-dom";

const strategies = [
  {
    icon: "📊",
    title: "Hieu thang diem that",
    desc: "Dung 3/4 chi duoc 0.5d, dung 4/4 duoc 1.0d. Sai 1 y = mat 0.5d! Vi vay PHAI can than tung y, dung voi vang.",
    tip: "Hay danh them 30 giay kiem tra lai y ban chua chac chan. 30 giay do co the cuu 0.5 diem!",
    game: "/game/exam",
    gameName: "Thi Thu That",
  },
  {
    icon: "🎯",
    title: "Phuong phap Loai Tru 2 Vong",
    desc: "Vong 1: Nhanh chong danh dau y ban CHAC CHAN biet. Vong 2: Don toan bo suy nghi vao y CHUA CHAC.",
    tip: "Thuong ban tu tin 2-3 y/cau. Tap trung vao 1-2 y con lai se tang ty le 4/4 dang ke.",
    game: "/game/eliminate",
    gameName: "Luyen Loai Tru",
  },
  {
    icon: "⚡",
    title: "Luyen toc do tung y",
    desc: "Moi y Dung/Sai can doc ky va xu ly trong ~30 giay. Luyen nhieu y rieng le giup tang toc va tu tin.",
    tip: "Chay Endless Run moi ngay 10 phut, muc tieu 20+ y/phut voi do chinh xac >85%.",
    game: "/game/run",
    gameName: "Duong Chay Vo Cuc",
  },
  {
    icon: "📕",
    title: "On lai loi sai",
    desc: "Nao nguoi co xu huong lap lai sai lam cu. Ghi nhan va on lai nhung y da sai la cach hieu qua nhat.",
    tip: "Sau moi bai thi thu, mo So Sai Lam va on lai TAT CA cac y sai. Lap lai den khi khong con loi.",
    game: "/game/errors",
    gameName: "So Sai Lam",
  },
  {
    icon: "🔑",
    title: "Nhan dien tu khoa bay",
    desc: "Cac tu nhu 'chi', 'luon luon', 'tat ca', 'khong bao gio', 'duy nhat' thuong la BAY. Menh de tuyet doi thuong SAI.",
    tip: "Khi thay tu tuyet doi, hay tu hoi: 'Co ngoai le nao khong?' Neu co 1 ngoai le → menh de SAI.",
    game: "/game/pirate",
    gameName: "Dao Hai Tac",
  },
  {
    icon: "🧠",
    title: "Xu ly tung y DOC LAP",
    desc: "Dung de dap an y a anh huong y b. Moi y la mot menh de rieng biet. Doc va xet dung/sai RIENG tung y.",
    tip: "Che cac y khac, chi doc 1 y tai 1 thoi diem. Quyet dinh xong moi chuyen y tiep.",
    game: "/game/eliminate",
    gameName: "Luyen Loai Tru",
  },
];

export function StrategyGuidePage() {
  return (
    <GameShell title="📖 Cam Nang Chien Thuat" subtitle="6 phuong phap lam Dung/Sai hieu qua">
      {/* Scoring table */}
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        <h2 className="text-lg font-black text-rose-600">⚠️ Bang diem that - Hieu de khong mat diem oan!</h2>
        <div className="mt-3 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-violet-100">
              <tr>
                <th className="p-2 text-left">So y dung</th>
                <th className="p-2">Diem nhan</th>
                <th className="p-2">Diem mat</th>
                <th className="p-2">Nhan xet</th>
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
                  <td className="p-2 text-center">{calcRealScore(n)}d</td>
                  <td className="p-2 text-center text-rose-600">{(1 - calcRealScore(n)).toFixed(2)}d</td>
                  <td className="p-2 text-xs">
                    {n === 0 && "💀 Mat tron"}
                    {n === 1 && "😱 Gan nhu mat tron"}
                    {n === 2 && "😥 Mat 3/4 so diem"}
                    {n === 3 && "⚠️ SAI 1 Y = MAT 0.5D!"}
                    {n === 4 && "⭐ Hoan hao!"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 rounded-lg bg-rose-100 p-3 text-center">
          <p className="text-sm font-bold text-rose-700">
            4 cau × sai 1 y/cau = mat 2.0 diem tren tong 4.0!
          </p>
          <p className="text-xs text-rose-600">(chi con 2.0d thay vi 4.0d)</p>
        </div>

        {/* Visual example */}
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-sm font-bold text-violet-700">📋 Vi du thuc te:</p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between rounded bg-yellow-100 p-1 px-2">
              <span>Cau 1: ✅ ✅ ❌ ✅ → 3/4</span>
              <span className="font-bold text-yellow-700">0.5d (mat 0.5d)</span>
            </div>
            <div className="flex justify-between rounded bg-emerald-100 p-1 px-2">
              <span>Cau 2: ✅ ✅ ✅ ✅ → 4/4</span>
              <span className="font-bold text-emerald-700">1.0d ⭐</span>
            </div>
            <div className="flex justify-between rounded bg-orange-100 p-1 px-2">
              <span>Cau 3: ✅ ❌ ✅ ❌ → 2/4</span>
              <span className="font-bold text-orange-700">0.25d (mat 0.75d)</span>
            </div>
            <div className="flex justify-between rounded bg-emerald-100 p-1 px-2">
              <span>Cau 4: ✅ ✅ ✅ ✅ → 4/4</span>
              <span className="font-bold text-emerald-700">1.0d ⭐</span>
            </div>
            <div className="flex justify-between rounded bg-violet-100 p-1 px-2 font-bold">
              <span>Tong</span>
              <span>2.75 / 4.0d</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-600">
            → Neu cau 1 va cau 3 dung het: 4.0d! Chi sai 3 y ma mat 1.25d.
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
            💡 <b>Meo:</b> {s.tip}
          </p>
          <Link
            to={s.game}
            className="mt-2 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white"
          >
            Luyen tap: {s.gameName} →
          </Link>
        </div>
      ))}

      {/* Quick guide */}
      <div className="mt-4 rounded-3xl bg-gradient-to-r from-violet-100 to-fuchsia-100 p-4 shadow-xl">
        <h3 className="font-black text-violet-700">🗺️ Lo trinh on tap khuyen nghi</h3>
        <div className="mt-2 space-y-2 text-sm">
          <p>
            <b>Buoc 1:</b> Doc Cam Nang → hieu thang diem va chien thuat
          </p>
          <p>
            <b>Buoc 2:</b> Chay Endless Run 10 phut/ngay → tang phan xa
          </p>
          <p>
            <b>Buoc 3:</b> Luyen Loai Tru 5 cau/ngay → master phuong phap 2 vong
          </p>
          <p>
            <b>Buoc 4:</b> Thi Thu That 1 lan/ngay → mo phong ap luc thi
          </p>
          <p>
            <b>Buoc 5:</b> On So Sai Lam sau moi lan thi → khong lap lai loi
          </p>
        </div>
      </div>
    </GameShell>
  );
}

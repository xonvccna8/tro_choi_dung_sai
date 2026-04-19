import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Edit3, Eye, Plus, Search, Trash2, Upload, Undo2 } from "lucide-react";
import { useAppAuth } from "../lib/AuthContext";
import { deleteGameAssignment, fetchGameAssignments, updateGameAssignment, type GameAssignmentDocument } from "../lib/gameAssignments";
import { useGameStore } from "../store/useGameStore";

export function TeacherGameAssignmentsPage() {
  const { currentUser, profile } = useAppAuth();
  const user = useGameStore((s) => s.user);
  const teacherId = currentUser?.uid ?? profile?.id ?? null;
  const [assignments, setAssignments] = useState<GameAssignmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const next = await fetchGameAssignments(teacherId);
      setAssignments(next);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [teacherId]);

  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    if (!text) return assignments;
    return assignments.filter((item) => [item.title, item.description, item.mode, item.className ?? ""].join(" ").toLowerCase().includes(text));
  }, [assignments, keyword]);

  async function handleDelete(id: string) {
    if (!confirm("Xóa bài giao này?")) return;
    try {
      await deleteGameAssignment(id);
      setMessage("Đã xóa bài giao.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể xóa bài giao.");
    }
  }

  async function togglePublish(item: GameAssignmentDocument) {
    if (!user) return;
    try {
      await updateGameAssignment(
        {
          id: item.id,
          title: item.title,
          description: item.description,
          questionIds: item.questionIds,
          questionSnapshot: item.questionSnapshot,
          mode: item.mode,
          audience: item.audience,
          classId: item.classId,
          className: item.className,
          status: item.status === "published" ? "draft" : "published",
        },
        user,
      );
      setMessage(item.status === "published" ? "Đã thu hồi bài giao." : "Đã phát hành bài giao.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể đổi trạng thái bài giao.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                <Eye className="h-4 w-4" />
                Quản lý game assignment
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight">Xem, sửa, xóa bài giao</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Quản lý toàn bộ trò chơi đã giao cho học sinh.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/teacher/game-assignment" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white">
                <Plus className="h-4 w-4" />
                Tạo bài giao mới
              </Link>
              <Link to="/teacher/library" className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
                Thư viện câu hỏi
              </Link>
            </div>
          </div>
        </section>

        {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{message}</div>}

        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm theo tên bài, mode, lớp..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-sky-400" />
        </div>

        <section className="grid gap-4">
          {loading && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Đang tải bài giao...</div>}
          {!loading && filtered.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Chưa có bài giao nào phù hợp.</div>}
          {filtered.map((item) => (
            <article key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Mode: {item.mode}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{item.className ?? item.audience}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{item.questionIds.length} câu</span>
                    <span className={`rounded-full px-3 py-1 ${item.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.status}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/teacher/game-assignment?id=${item.id}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">
                    <Edit3 className="h-4 w-4" />
                    Sửa
                  </Link>
                  <button type="button" onClick={() => void togglePublish(item)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white ${item.status === "published" ? "bg-amber-600" : "bg-emerald-600"}`}>
                    {item.status === "published" ? <Undo2 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                    {item.status === "published" ? "Thu hồi" : "Phát hành"}
                  </button>
                  <button type="button" onClick={() => void handleDelete(item.id)} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white">
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Tạo bởi {item.createdByName ?? user?.name ?? "Giáo viên"} • {item.questionSnapshot.length} câu đã lưu snapshot</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

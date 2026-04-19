import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Gamepad2, Layers3, Send, Sparkles, Users, Target, ShieldCheck, Bomb, FlaskConical, Swords, Check, Save } from "lucide-react";
import { useQuestionBank, type SyncedQuestion } from "../hooks/useQuestionBank";
import { listTeacherClasses, type TeacherClass } from "../lib/classroom";
import { useAppAuth } from "../lib/AuthContext";
import { fetchGameAssignmentById, saveGameAssignment, updateGameAssignment, type GameAssignmentMode, type GameAssignmentAudience } from "../lib/gameAssignments";
import { useGameStore } from "../store/useGameStore";

const modeCards: Array<{ mode: GameAssignmentMode; title: string; description: string; icon: JSX.Element; color: string }> = [
  { mode: "run", title: "Đường Chạy", description: "Tăng tốc phản xạ, phù hợp câu nhanh.", icon: <Target className="h-5 w-5" />, color: "from-emerald-500 to-teal-500" },
  { mode: "pirate", title: "Đảo Hải Tặc", description: "Vượt thử thách, câu hỏi mang tính khám phá.", icon: <Swords className="h-5 w-5" />, color: "from-amber-500 to-orange-500" },
  { mode: "blind-box", title: "Hộp Bí Ẩn", description: "Mở hộp theo lượt, tạo cảm giác bất ngờ.", icon: <ShieldCheck className="h-5 w-5" />, color: "from-sky-500 to-blue-500" },
  { mode: "elimination", title: "Loại Trừ", description: "Luyện tư duy loại trừ đáp án sai.", icon: <Bomb className="h-5 w-5" />, color: "from-rose-500 to-pink-500" },
  { mode: "arena", title: "Đấu Trường", description: "Chọn câu đối kháng cho lớp cạnh tranh.", icon: <FlaskConical className="h-5 w-5" />, color: "from-violet-500 to-fuchsia-500" },
];

export function TeacherGameAssignmentPage() {
  const { currentUser, profile, isConfigured } = useAppAuth();
  const user = useGameStore((state) => state.user);
  const teacherId = currentUser?.uid ?? profile?.id ?? null;
  const { questions } = useQuestionBank(teacherId);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("Giao trò chơi mới");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<GameAssignmentMode>("run");
  const [audience, setAudience] = useState<GameAssignmentAudience>("all");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!teacherId || !isConfigured) return;
      const next = await listTeacherClasses(teacherId);
      if (!mounted) return;
      setClasses(next);
      setSelectedClassId((current) => current || next[0]?.id || "");
    }
    void load();
    return () => { mounted = false; };
  }, [isConfigured, teacherId]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id || loaded) return;
    let mounted = true;
    async function loadAssignment() {
      const assignment = await fetchGameAssignmentById(id);
      if (!mounted || !assignment) return;
      setEditingId(assignment.id);
      setTitle(assignment.title);
      setDescription(assignment.description);
      setMode(assignment.mode);
      setAudience(assignment.audience);
      setSelectedClassId(assignment.classId ?? "");
      setSelectedIds(assignment.questionIds);
      setLoaded(true);
    }
    void loadAssignment();
    return () => { mounted = false; };
  }, [loaded, searchParams]);

  const selectedClass = classes.find((item) => item.id === selectedClassId) ?? null;
  const selectedQuestions = useMemo(() => {
    const map = new Map(questions.map((question) => [question.id, question]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean) as SyncedQuestion[];
  }, [questions, selectedIds]);

  function toggleQuestion(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function handleSave() {
    if (!user) return;
    if (selectedQuestions.length === 0) {
      setMessage("Hãy chọn ít nhất 1 câu hỏi.");
      return;
    }
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        questionIds: selectedQuestions.map((question) => question.id),
        questionSnapshot: selectedQuestions,
        mode,
        audience,
        classId: audience === "class" ? selectedClass?.id ?? null : null,
        className: audience === "class" ? selectedClass?.name ?? null : null,
        status: "draft" as const,
      };
      const result = editingId
        ? await updateGameAssignment({ id: editingId, ...payload }, user)
        : await saveGameAssignment(payload, user);
      setEditingId(result.id);
      setMessage(editingId ? "Đã cập nhật bài giao." : `Đã lưu giao trò chơi (ID: ${result.id}).`);
      navigate(`/teacher/game-assignments`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu giao trò chơi.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
            <Gamepad2 className="h-4 w-4" />
            Giao trò chơi
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Giáo viên chọn câu và giao theo mode game</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Không còn là đề thi nữa. Đây là bài giao để học sinh bấm vào và chơi trực tiếp.</p>
        </section>

        {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{message}</div>}

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" placeholder="Tên bài giao trò chơi" />
                <select value={mode} onChange={(e) => setMode(e.target.value as GameAssignmentMode)} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
                  <option value="run">Đường Chạy</option>
                  <option value="pirate">Đảo Hải Tặc</option>
                  <option value="blind-box">Hộp Bí Ẩn</option>
                  <option value="elimination">Loại Trừ</option>
                  <option value="arena">Đấu Trường</option>
                </select>
                <select value={audience} onChange={(e) => setAudience(e.target.value as GameAssignmentAudience)} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
                  <option value="all">Toàn bộ học sinh</option>
                  <option value="students">Học sinh được giao</option>
                  <option value="class">Một lớp cụ thể</option>
                </select>
                {audience === "class" && (
                  <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400">
                    {classes.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.name}</option>)}
                  </select>
                )}
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="md:col-span-2 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-sky-400" placeholder="Mô tả bài giao trò chơi" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Chọn mode game</h2>
                  <p className="text-sm text-slate-500">Bấm vào mode để xem cách chơi và chọn nhanh.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {mode}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {modeCards.map((item) => {
                  const active = mode === item.mode;
                  return (
                    <button key={item.mode} type="button" onClick={() => setMode(item.mode)} className={`rounded-[1.5rem] border p-4 text-left transition ${active ? "border-sky-400 bg-sky-50 shadow-md" : "border-slate-200 bg-slate-50 hover:bg-white"}`}>
                      <div className={`inline-flex rounded-2xl bg-gradient-to-br ${item.color} p-3 text-white shadow-sm`}>
                        {item.icon}
                      </div>
                      <p className="mt-3 text-base font-black text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Chọn câu hỏi</h2>
                  <p className="text-sm text-slate-500">Lấy từ thư viện và đưa vào game.</p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  {selectedQuestions.length} câu
                </div>
              </div>
              <div className="grid gap-3">
                {questions.map((question) => {
                  const active = selectedIds.includes(question.id);
                  return (
                    <button key={question.id} type="button" onClick={() => toggleQuestion(question.id)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-slate-50 hover:bg-white"}`}>
                      <p className="text-sm font-bold text-slate-900">{question.type === "true-false" ? question.statement : question.question}</p>
                      <p className="mt-1 text-xs text-slate-500">{question.gradeLevel ?? "Chưa gắn lớp"} • {question.subject ?? "Chưa gắn môn"} • {question.chapter ?? "Chưa gắn chương"} • {question.lesson ?? "Chưa gắn bài"}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-black"><Send className="h-5 w-5 text-sky-600" /> Tóm tắt giao game</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-bold">Mode:</span> {mode}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-bold">Số câu:</span> {selectedQuestions.length}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3"><span className="font-bold">Lớp:</span> {audience === "class" ? selectedClass?.name ?? "Chưa chọn" : audience}</div>
              </div>
              <button type="button" onClick={() => void handleSave()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white">
                <Sparkles className="h-4 w-4" />
                {editingId ? "Cập nhật bài giao" : "Giao trò chơi"}
              </button>
              <p className="mt-3 text-xs text-slate-500">{editingId ? `Đang sửa bài giao ${editingId}` : "Tạo bài giao mới từ thư viện câu hỏi."}</p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-black"><Users className="h-5 w-5 text-emerald-600" /> Ghi chú</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Sau khi giao xong, học sinh sẽ thấy bài ở danh sách trò chơi được giao và vào chơi trực tiếp.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/teacher/library" className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">Quay lại thư viện</Link>
                <Link to="/teacher/game-assignments" className="inline-flex w-full items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">Quản lý bài giao</Link>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

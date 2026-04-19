import { useEffect, useMemo, useState } from "react";
import { BookMarked, Check, ClipboardList, Download, Filter, GripVertical, Plus, Search, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuestionBank, type SyncedQuestion } from "../hooks/useQuestionBank";
import { useAppAuth } from "../lib/AuthContext";
import { saveExam, type ExamAudience } from "../lib/exams";
import { listTeacherClasses, type TeacherClass } from "../lib/classroom";
import { useGameStore } from "../store/useGameStore";
import { isMultiTrueFalseQuestion, isTrueFalseQuestion } from "../lib/questionBank";

export function TeacherExamsPage() {
  const { currentUser, profile, isConfigured } = useAppAuth();
  const user = useGameStore((s) => s.user);
  const teacherId = currentUser?.uid ?? profile?.id ?? null;
  const { questions, loading, error } = useQuestionBank(teacherId);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("Đề kiểm tra nhanh");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [audience, setAudience] = useState<ExamAudience>("all");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

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
    return () => {
      mounted = false;
    };
  }, [isConfigured, teacherId]);

  const selectedClass = classes.find((item) => item.id === selectedClassId) ?? null;

  const filteredQuestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return questions;
    return questions.filter((question) => {
      const fields = [
        isTrueFalseQuestion(question) ? question.statement : question.question,
        question.explanation,
        question.gameModes.join(" "),
      ].join(" ").toLowerCase();
      return fields.includes(keyword);
    });
  }, [questions, search]);

  const selectedQuestions = useMemo(() => {
    const byId = new Map(questions.map((question) => [question.id, question]));
    return selectedIds.map((id) => byId.get(id)).filter(Boolean) as SyncedQuestion[];
  }, [questions, selectedIds]);

  const stats = [
    { label: "Đã chọn", value: selectedQuestions.length },
    { label: "Câu đơn", value: selectedQuestions.filter(isTrueFalseQuestion).length },
    { label: "Câu 4 ý", value: selectedQuestions.filter(isMultiTrueFalseQuestion).length },
    { label: "Tổng ngân hàng", value: questions.length },
  ];

  function toggleQuestion(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function moveQuestion(id: string, direction: -1 | 1) {
    setSelectedIds((current) => {
      const index = current.indexOf(id);
      if (index < 0) return current;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function removeQuestion(id: string) {
    setSelectedIds((current) => current.filter((item) => item !== id));
  }

  function exportExamDocx() {
    const lines = [
      `ĐỀ: ${title.trim() || "Chưa đặt tên"}`,
      description.trim() ? `Mô tả: ${description.trim()}` : "",
      `Đối tượng: ${audience}${audience === "class" && selectedClass ? ` - ${selectedClass.name}` : ""}`,
      "",
      ...selectedQuestions.map((question, index) => {
        if (isTrueFalseQuestion(question)) {
          return `${index + 1}. [${question.correct ? "ĐÚNG" : "SAI"}] ${question.statement}`;
        }
        const options = question.statements.map((statement) => `${statement.label} ${statement.text}`).join("\n");
        return `${index + 1}. ${question.question}\n${options}`;
      }),
    ].filter(Boolean);

    const blob = new Blob([lines.join("\n\n")], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.trim().replace(/\s+/g, "-").toLowerCase() || "de-thi"}.docx`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleSave() {
    if (!teacherId || !user) return;
    if (!title.trim()) {
      setSaveMessage("Hãy nhập tiêu đề đề thi.");
      return;
    }
    if (selectedQuestions.length === 0) {
      setSaveMessage("Hãy chọn ít nhất 1 câu hỏi.");
      return;
    }
    setSaving(true);
    setSaveMessage("");
    try {
      const result = await saveExam(
        {
          title: title.trim(),
          description: description.trim(),
          questionIds: selectedQuestions.map((question) => question.id),
          questionSnapshot: selectedQuestions,
          audience,
          classId: audience === "class" ? selectedClass?.id ?? null : null,
          className: audience === "class" ? selectedClass?.name ?? null : null,
          status: "draft",
        },
        user,
      );
      setSaveMessage(`Đã lưu đề thi thành công (ID: ${result.id}).`);
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Không thể lưu đề thi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
                <BookMarked className="h-4 w-4" />
                Tạo đề thi / bài tập thật
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight">Chọn câu hỏi và lưu thành đề</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Chọn câu hỏi từ ngân hàng, sắp xếp lại thứ tự, lưu đề vào Firestore và gắn cho lớp nếu muốn giao bài ngay.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px] sm:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-3 text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-black text-violet-700">{loading ? "..." : item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div>}
        {saveMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{saveMessage}</div>}

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-slate-600">Tên đề</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-400" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600">Đối tượng</label>
                  <select value={audience} onChange={(e) => setAudience(e.target.value as ExamAudience)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-400">
                    <option value="all">Toàn bộ học sinh</option>
                    <option value="students">Học sinh được giao</option>
                    <option value="class">Một lớp cụ thể</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-slate-600">Mô tả</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-400" placeholder="Ví dụ: Kiểm tra 15 phút chương phenol - ancol" />
                </div>
                {audience === "class" && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-slate-600">Chọn lớp</label>
                    <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-400">
                      {classes.length === 0 && <option value="">Chưa có lớp</option>}
                      {classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>{classItem.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black">Ngân hàng câu hỏi</h2>
                  <p className="text-sm text-slate-500">Bấm vào câu hỏi để thêm vào đề.</p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm nhanh theo nội dung" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-violet-400" />
                </div>
              </div>

              <div className="grid gap-3">
                {filteredQuestions.map((question) => {
                  const active = selectedIds.includes(question.id);
                  return (
                    <button key={question.id} type="button" onClick={() => toggleQuestion(question.id)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-slate-50 hover:bg-white"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{isTrueFalseQuestion(question) ? question.statement : question.question}</p>
                          <p className="mt-1 text-xs text-slate-500">{question.gameModes.join(" • ")}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-violet-600 text-white" : "bg-white text-slate-600"}`}>
                          {active ? <Check className="h-3.5 w-3.5" /> : "Chọn"}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {!loading && filteredQuestions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">Chưa có câu hỏi phù hợp.</div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-black"><ClipboardList className="h-5 w-5 text-violet-600" /> Đề đang chọn</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                {selectedQuestions.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-3">Chưa chọn câu hỏi nào.</div>
                ) : (
                  selectedQuestions.map((question, index) => (
                    <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900">{index + 1}. {isTrueFalseQuestion(question) ? question.statement : question.question}</p>
                          <p className="mt-1 text-xs text-slate-500">{question.gameModes.join(" • ")}</p>
                        </div>
                        <button type="button" onClick={() => removeQuestion(question.id)} className="rounded-lg bg-white px-2 py-1 text-slate-500 shadow-sm hover:text-rose-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => moveQuestion(question.id, -1)} disabled={index === 0} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40">
                          Lên
                        </button>
                        <button type="button" onClick={() => moveQuestion(question.id, 1)} disabled={index === selectedQuestions.length - 1} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm disabled:cursor-not-allowed disabled:opacity-40">
                          Xuống
                        </button>
                        <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                          <GripVertical className="h-3.5 w-3.5" />
                          Sắp xếp thứ tự
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-black"><Filter className="h-5 w-5 text-emerald-600" /> Thao tác</h3>
              <button type="button" onClick={handleSave} disabled={saving} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
                <Sparkles className="h-4 w-4" />
                {saving ? "Đang lưu..." : "Lưu đề thi"}
              </button>
              <button type="button" onClick={exportExamDocx} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200">
                <Download className="h-4 w-4" />
                Xuất file Word (.docx)
              </button>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Đề sẽ được lưu vào Firestore cùng danh sách câu hỏi snapshot để sau này mở lại vẫn giữ nguyên.
              </p>
              <Link to="/teacher/stats" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">
                Xem thống kê
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

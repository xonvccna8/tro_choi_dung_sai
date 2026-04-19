import { useMemo, useState } from "react";
import { BookOpen, Filter, Layers3, Send, Sparkles } from "lucide-react";
import { useQuestionBank } from "../hooks/useQuestionBank";
import type { SyncedQuestion } from "../types";
import { filterQuestionsByLibrary, isMultiTrueFalseQuestion, isTrueFalseQuestion } from "../lib/questionBank";
import { useGameStore } from "../store/useGameStore";
import { saveGameAssignment } from "../lib/gameAssignments";

const defaultFilter = {
  gradeLevel: "",
  subject: "",
  chapter: "",
  lesson: "",
};

export function TeacherQuestionLibraryPage() {
  const user = useGameStore((state) => state.user);
  const { questions, loading } = useQuestionBank();
  const [filter, setFilter] = useState(defaultFilter);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState("");

  const filteredQuestions = useMemo(() => filterQuestionsByLibrary(questions, filter), [questions, filter]);
  const selectedQuestions = useMemo(() => filteredQuestions.filter((question) => selectedIds.includes(question.id)), [filteredQuestions, selectedIds]);

  const groupedCount = {
    grade10: questions.filter((question) => question.gradeLevel === "10").length,
    grade11: questions.filter((question) => question.gradeLevel === "11").length,
    grade12: questions.filter((question) => question.gradeLevel === "12").length,
  };

  function toggleQuestion(questionId: string) {
    setSelectedIds((current) => (current.includes(questionId) ? current.filter((id) => id !== questionId) : [...current, questionId]));
  }

  async function handleSendToGame() {
    if (!user) return;
    if (selectedQuestions.length === 0) {
      setSaveMessage("Hãy chọn ít nhất 1 câu hỏi.");
      return;
    }
    try {
      const result = await saveGameAssignment(
        {
          title: "Bài giao từ thư viện câu hỏi",
          description: `Giao ${selectedQuestions.length} câu từ thư viện theo lớp/môn/chương/bài.`,
          questionIds: selectedQuestions.map((question) => question.id),
          questionSnapshot: selectedQuestions,
          mode: "run",
          audience: "all",
          classId: null,
          className: null,
          status: "draft",
        },
        user,
      );
      setSaveMessage(`Đã chuyển ${selectedQuestions.length} câu vào trò chơi (ID: ${result.id}).`);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Không thể chuyển câu vào trò chơi.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-violet-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-violet-700">
            <BookOpen className="h-4 w-4" />
            Thư viện câu hỏi
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Lớp → Môn → Chương → Bài → Câu hỏi</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Chọn câu hỏi từ thư viện, sau đó chuyển sang trò chơi để giao cho lớp.</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Lớp 10", value: groupedCount.grade10 },
            { label: "Lớp 11", value: groupedCount.grade11 },
            { label: "Lớp 12", value: groupedCount.grade12 },
            { label: "Đã chọn", value: selectedQuestions.length },
          ].map((item) => (
            <article key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-violet-700">{loading ? "..." : item.value}</p>
            </article>
          ))}
        </section>

        {saveMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{saveMessage}</div>}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-black"><Filter className="h-5 w-5 text-violet-600" /> Bộ lọc thư viện</div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["gradeLevel", "Lớp: 10, 11, 12"],
              ["subject", "Môn học"],
              ["chapter", "Chương"],
              ["lesson", "Bài"],
            ].map(([key, placeholder]) => (
              <input key={key} value={(filter as never)[key]} onChange={(e) => setFilter((prev) => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-400" />
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {filteredQuestions.map((question) => <QuestionCard key={question.id} question={question} selected={selectedIds.includes(question.id)} onToggle={toggleQuestion} />)}
            {!loading && filteredQuestions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Chưa có câu hỏi phù hợp bộ lọc.</div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-black"><Sparkles className="h-5 w-5 text-emerald-600" /> Chuyển vào trò chơi</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Hãy chọn câu hỏi rồi bấm nút để chuyển sang luồng giao game.</p>
              <button type="button" onClick={() => void handleSendToGame()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white">
                <Send className="h-4 w-4" />
                Chuyển {selectedQuestions.length} câu vào trò chơi
              </button>
              <p className="mt-3 text-xs leading-6 text-slate-500">Tài khoản hiện tại: {user?.name ?? "Giáo viên"}. Bước tiếp theo sẽ nối phần giao game cho lớp.</p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-black"><Layers3 className="h-5 w-5 text-sky-600" /> Hướng dẫn</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>• Chọn theo lớp / môn / chương / bài</li>
                <li>• Bấm vào câu hỏi để chọn</li>
                <li>• Chuyển câu vào luồng giao trò chơi</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function QuestionCard({ question, selected, onToggle }: { question: SyncedQuestion; selected: boolean; onToggle: (id: string) => void; }) {
  return (
    <button type="button" onClick={() => onToggle(question.id)} className={`w-full rounded-[1.5rem] border p-5 text-left transition ${selected ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white hover:border-violet-200 hover:shadow-sm"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1">{question.gradeLevel ?? "Chưa gắn lớp"}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">{question.subject ?? "Chưa gắn môn"}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">{question.chapter ?? "Chưa gắn chương"}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">{question.lesson ?? "Chưa gắn bài"}</span>
          </div>
          <p className="mt-3 text-base font-bold text-slate-900">{isTrueFalseQuestion(question) ? question.statement : question.question}</p>
          <p className="mt-1 text-sm text-slate-500">{isMultiTrueFalseQuestion(question) ? `${question.statements.length} ý` : "Câu đơn"} • {question.gameModes.join(" • ")}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${selected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600"}`}>{selected ? "Đã chọn" : "Chọn"}</span>
      </div>
    </button>
  );
}

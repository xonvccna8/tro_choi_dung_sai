import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock3, Send } from "lucide-react";
import { fetchGameAssignmentById, type GameAssignmentDocument } from "../lib/gameAssignments";
import { saveGameResult } from "../lib/gameResults";
import { useGameStore } from "../store/useGameStore";

export function StudentGamePage() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const user = useGameStore((s) => s.user);
  const [assignment, setAssignment] = useState<GameAssignmentDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!assignmentId) return;
      setLoading(true);
      const next = await fetchGameAssignmentById(assignmentId);
      if (!mounted) return;
      setAssignment(next);
      setLoading(false);
    }
    void load();
    return () => { mounted = false; };
  }, [assignmentId]);

  const questions = assignment?.questionSnapshot ?? [];

  const score = useMemo(() => {
    let total = 0;
    for (const question of questions) {
      if (question.type === "true-false") {
        const answer = answers[question.id];
        if (typeof answer === "boolean" && answer === question.correct) total += 1;
      } else {
        const correctCount = question.statements.filter((statement) => answers[`${question.id}:${statement.id}`] === statement.correct).length;
        total += correctCount;
      }
    }
    return total;
  }, [answers, questions]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Đang tải trò chơi...</div>;
  if (!assignment) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Không tìm thấy trò chơi.</div>;

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      const result = await saveGameResult(
        {
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          mode: assignment.mode,
          score,
          totalQuestions: questions.length,
          answers,
        },
        user,
      );
      setMessage(`Đã lưu kết quả game (${result.id}).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể lưu kết quả game.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black">{assignment.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{assignment.description}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">Mode: {assignment.mode}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{assignment.className ?? "Tất cả"}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{assignment.questionIds.length} câu</span>
          </div>
        </section>

        <section className="space-y-4">
          {questions.map((question, index) => {
            if (question.type === "true-false") {
              return (
                <article key={question.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-500">Câu {index + 1}</p>
                  <h2 className="mt-1 text-lg font-black">{question.statement}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[{ label: "Đúng", value: true }, { label: "Sai", value: false }].map((option) => (
                      <button key={option.label} type="button" onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.value }))} className={`rounded-2xl border px-4 py-3 text-left font-bold transition ${answers[question.id] === option.value ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-slate-50 hover:bg-white"}`}>{option.label}</button>
                    ))}
                  </div>
                </article>
              );
            }

            return (
              <article key={question.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-500">Câu {index + 1}</p>
                <h2 className="mt-1 text-lg font-black">{question.question}</h2>
                <div className="mt-4 space-y-3">
                  {question.statements.map((statement) => {
                    const key = `${question.id}:${statement.id}`;
                    return (
                      <button key={statement.id} type="button" onClick={() => setAnswers((current) => ({ ...current, [key]: !(current[key] ?? false) }))} className={`w-full rounded-2xl border px-4 py-3 text-left transition ${answers[key] ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-slate-50 hover:bg-white"}`}>
                        <span className="font-bold text-violet-700">{statement.label}</span> {statement.text}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500">Kết quả tạm tính</p>
              <h2 className="text-2xl font-black">{score} điểm</h2>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700">Quay lại</button>
              <button type="button" onClick={handleSubmit} disabled={submitted} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                <Send className="h-4 w-4" />
                {submitted ? "Đã nộp" : "Nộp bài"}
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Clock3 className="h-4 w-4" />
            {message || "Bài chơi sẽ được lưu khi bấm nộp bài."}
          </div>
        </section>
      </div>
    </main>
  );
}

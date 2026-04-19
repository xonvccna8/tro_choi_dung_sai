import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Clock3, Send } from "lucide-react";
import { fetchExamById, saveExamAttempt, type ExamDocument } from "../lib/exams";
import { isMultiTrueFalseQuestion, isTrueFalseQuestion } from "../lib/questionBank";
import { useGameStore } from "../store/useGameStore";
import { useAppAuth } from "../lib/AuthContext";

export function StudentExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAppAuth();
  const user = useGameStore((s) => s.user);
  const [exam, setExam] = useState<ExamDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!examId) return;
      setLoading(true);
      const next = await fetchExamById(examId);
      if (!mounted) return;
      setExam(next);
      setLoading(false);
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [examId]);

  const questions = exam?.questionSnapshot ?? [];
  const trueFalseQuestions = questions.filter(isTrueFalseQuestion);
  const multiQuestions = questions.filter(isMultiTrueFalseQuestion);

  const score = useMemo(() => {
    let total = 0;
    for (const question of trueFalseQuestions) {
      const answer = answers[question.id];
      if (typeof answer === "boolean" && answer === question.correct) total += 1;
    }
    for (const question of multiQuestions) {
      const correctCount = question.statements.filter((statement) => answers[`${question.id}:${statement.id}`] === statement.correct).length;
      total += correctCount;
    }
    return total;
  }, [answers, multiQuestions, trueFalseQuestions]);

  const totalQuestions = trueFalseQuestions.length + multiQuestions.length;

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Đang tải đề...</div>;
  }

  if (!exam) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">Không tìm thấy đề thi.</div>;
  }

  const handleSubmit = async () => {
    setSubmitted(true);
    setSaving(true);
    try {
      await saveExamAttempt(
        {
          examId: exam.id,
          examTitle: exam.title,
          answers,
          score,
          totalQuestions,
          submittedAt: new Date().toISOString(),
        },
        user,
      );
      setSavedMessage("Đã lưu bài làm lên Firestore.");
    } catch (error) {
      setSavedMessage(error instanceof Error ? error.message : "Không thể lưu bài làm.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black">{exam.title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{exam.description}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">{exam.audience}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{exam.className ?? "Chưa giao lớp"}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{exam.questionIds.length} câu</span>
          </div>
        </section>

        <section className="space-y-4">
          {questions.map((question, index) => {
            if (isTrueFalseQuestion(question)) {
              return (
                <article key={question.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-500">Câu {index + 1}</p>
                  <h2 className="mt-1 text-lg font-black">{question.statement}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      { label: "Đúng", value: true },
                      { label: "Sai", value: false },
                    ].map((option) => (
                      <button key={option.label} type="button" onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.value }))} className={`rounded-2xl border px-4 py-3 text-left font-bold transition ${answers[question.id] === option.value ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-slate-50 hover:bg-white"}`}>
                        {option.label}
                      </button>
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
              <button type="button" onClick={handleSubmit} disabled={submitted || saving} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                <Send className="h-4 w-4" />
                {submitted ? (saving ? "Đang lưu..." : "Đã nộp") : "Nộp bài"}
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Clock3 className="h-4 w-4" />
            {savedMessage || "Kết quả sẽ được lưu khi bạn bấm nộp bài."}
          </div>
          <p className="mt-3 text-xs text-slate-500">Người làm: {user?.name ?? currentUser?.email ?? "Học sinh"}. Kết quả hiện đã lưu lại ở Firestore qua API bài làm.</p>
        </section>
      </div>
    </main>
  );
}

import { useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, Medal, TrendingUp, Trophy, Users } from "lucide-react";
import { useQuestionBank } from "../hooks/useQuestionBank";
import { useAppAuth } from "../lib/AuthContext";
import { fetchGameResults } from "../lib/gameResults";
import { listStudents, listTeacherClasses, type ClassroomStudent, type TeacherClass } from "../lib/classroom";
import { useGameStore } from "../store/useGameStore";

type GameResult = {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  mode: string;
  score: number;
  totalQuestions: number;
  createdAt?: string;
  createdByUid?: string | null;
  createdByName?: string | null;
};

export function TeacherStatsPage() {
  const { currentUser, profile, isConfigured } = useAppAuth();
  const user = useGameStore((s) => s.user);
  const { questions, loading } = useQuestionBank(currentUser?.uid ?? profile?.id ?? null);

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [results, setResults] = useState<GameResult[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<string>("all");

  const teacherId = currentUser?.uid ?? profile?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!teacherId || !isConfigured) {
        setClasses([]);
        setStudents([]);
        setResults([]);
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      try {
        const [nextClasses, nextStudents, nextResults] = await Promise.all([
          listTeacherClasses(teacherId),
          listStudents(),
          fetchGameResults(),
        ]);
        if (cancelled) return;
        setClasses(nextClasses);
        setStudents(nextStudents.filter((student) => student.teacherId === teacherId || student.classId !== null));
        setResults((nextResults as GameResult[]).filter((result) => result.createdByUid === teacherId || result.createdByUid !== null));
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isConfigured, teacherId]);

  const filteredResults = useMemo(
    () => (selectedMode === "all" ? results : results.filter((result) => result.mode === selectedMode)),
    [results, selectedMode],
  );

  const total = questions.length;
  const run = questions.filter((q) => q.gameModes.includes("run")).length;
  const pirate = questions.filter((q) => q.gameModes.includes("pirate")).length;
  const blindBox = questions.filter((q) => q.gameModes.includes("blind-box")).length;
  const elimination = questions.filter((q) => q.gameModes.includes("elimination")).length;
  const arena = questions.filter((q) => q.gameModes.includes("arena")).length;

  const assignedStudents = useMemo(() => students.filter((student) => Boolean(student.classId) && student.teacherId === teacherId), [students, teacherId]);
  const averageScore = useMemo(() => {
    if (filteredResults.length === 0) return 0;
    return Math.round((filteredResults.reduce((sum, result) => sum + result.score, 0) / filteredResults.length) * 10) / 10;
  }, [filteredResults]);

  const classRows = classes.map((classItem) => ({ name: classItem.name, count: students.filter((student) => student.classId === classItem.id).length }));
  const topStudents = assignedStudents.slice(0, 5);
  const latestResults = filteredResults.slice(0, 5);

  const cards = [
    { label: "Tổng câu", value: total, icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Đường Chạy", value: run, icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Đảo Hải Tặc", value: pirate, icon: <Medal className="h-5 w-5" /> },
    { label: "Lượt chơi", value: results.length, icon: <Users className="h-5 w-5" /> },
  ];

  const modeOptions = ["all", "run", "pirate", "blind-box", "elimination", "arena"] as const;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
            <BarChart3 className="h-4 w-4" />
            Thống kê học sinh
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Bảng thống kê cho {user?.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Thống kê hiện đã nối với ngân hàng câu hỏi, lớp học, danh sách học sinh và kết quả chơi trong Firestore.</p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-sm font-bold">{card.label}</span>
                {card.icon}
              </div>
              <div className="mt-4 text-3xl font-black text-sky-700">{loading ? "..." : card.value}</div>
            </article>
          ))}
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black">Bộ lọc thống kê theo mode</h2>
              <p className="text-sm text-slate-500">Chọn mode để xem kết quả thật theo trò chơi.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {modeOptions.map((mode) => (
                <button key={mode} type="button" onClick={() => setSelectedMode(mode)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${selectedMode === mode ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {mode === "all" ? "Tất cả" : mode}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Theo lớp</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              {dataLoading && <Row label="Đang tải" value="..." />}
              {!dataLoading && classRows.length === 0 && <Row label="Trạng thái" value="Chưa có lớp nào" />}
              {classRows.map((item) => <Row key={item.name} label={item.name} value={`${item.count} học sinh`} />)}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Theo học sinh</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Row label="Số học sinh đã xếp lớp" value={`${assignedStudents.length}`} />
              <Row label="Lượt chơi lọc theo mode" value={`${filteredResults.length}`} />
              <Row label="Điểm trung bình" value={`${averageScore}`} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-black"><BookOpen className="h-5 w-5 text-violet-600" /> Kết quả gần đây</h2>
            <div className="mt-4 space-y-3">
              {latestResults.length === 0 && <Row label="Danh sách" value="Chưa có lượt chơi" />}
              {latestResults.map((result) => (
                <div key={result.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-800">{result.assignmentTitle || "Game chưa đặt tên"}</p>
                      <p className="text-xs text-slate-500">Mode: {result.mode} • {result.createdByName || "Học sinh"}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">{result.score}/{result.totalQuestions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">Tiến độ phân phối câu hỏi</h2>
            <div className="mt-4 space-y-3">
              <Progress label="Đường Chạy" value={run} total={total} />
              <Progress label="Đảo Hải Tặc" value={pirate} total={total} />
              <Progress label="Hộp Bí Ẩn" value={blindBox} total={total} />
              <Progress label="Loại Trừ" value={elimination} total={total} />
              <Progress label="Đấu Trường" value={arena} total={total} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-black"><Users className="h-5 w-5 text-emerald-600" /> Top học sinh đang quản lý</h2>
            <div className="mt-4 space-y-3">
              {topStudents.length === 0 && <Row label="Danh sách" value="Chưa có học sinh" />}
              {topStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-bold text-slate-800">{student.avatar} {student.name}</p>
                    <p className="text-xs text-slate-500">{student.email || "Chưa có email"}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">{student.className ?? "Chưa rõ lớp"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
            <p className="font-bold text-slate-900">Ghi chú</p>
            <p className="mt-2">Để thống kê chi tiết theo từng câu đúng/sai, mình sẽ cần thêm chấm điểm chi tiết từ `answers` của bài làm. Khung hiện tại đã có bài làm, điểm tổng, lớp và danh sách gần đây.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="font-bold text-slate-500">{value}</span>
    </div>
  );
}

function Progress({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="text-slate-500">{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

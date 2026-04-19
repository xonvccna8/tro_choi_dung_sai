import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Check,
  Copy,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useAppAuth } from "../lib/AuthContext";
import {
  assignStudentToClass,
  createTeacherClass,
  deleteTeacherClass,
  listStudents,
  listTeacherClasses,
  removeStudentFromClass,
  type ClassroomStudent,
  type TeacherClass,
} from "../lib/classroom";

function formatDate(value: string) {
  if (!value) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function matchesSearch(student: ClassroomStudent, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return true;

  return [student.name, student.email, student.className ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(normalizedKeyword);
}

export function TeacherClassesPage() {
  const { currentUser, profile, isConfigured } = useAppAuth();
  const teacherId = currentUser?.uid ?? profile?.id ?? null;
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<ClassroomStudent[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingClass, setSavingClass] = useState(false);
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);
  const [pendingDeleteClassId, setPendingDeleteClassId] = useState<string | null>(null);
  const [copiedClassId, setCopiedClassId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [showStudentSource, setShowStudentSource] = useState(false);

  const canSync = Boolean(isConfigured && teacherId && profile);

  const studentCountByClassId = useMemo(() => {
    const counts = new Map<string, number>();

    students.forEach((student) => {
      if (!student.classId) return;
      counts.set(student.classId, (counts.get(student.classId) ?? 0) + 1);
    });

    return counts;
  }, [students]);

  const selectedClass = classes.find((item) => item.id === selectedClassId) ?? null;

  const manageableStudents = useMemo(() => {
    if (!teacherId) return [];

    return students.filter(
      (student) => !student.teacherId || student.teacherId === teacherId || student.classId === selectedClassId,
    );
  }, [selectedClassId, students, teacherId]);

  const classStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return manageableStudents.filter(
      (student) => student.classId === selectedClassId && matchesSearch(student, searchTerm),
    );
  }, [manageableStudents, searchTerm, selectedClassId]);

  const availableStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return manageableStudents.filter(
      (student) => student.classId !== selectedClassId && matchesSearch(student, searchTerm),
    );
  }, [manageableStudents, searchTerm, selectedClassId]);

  const assignedStudentCount = students.filter((student) => Boolean(student.classId) && student.teacherId === teacherId).length;

  async function loadData() {
    if (!teacherId) {
      setClasses([]);
      setStudents([]);
      setSelectedClassId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [nextClasses, nextStudents] = await Promise.all([listTeacherClasses(teacherId), listStudents()]);
      setClasses(nextClasses);
      setStudents(nextStudents);
      setSelectedClassId((current) => {
        if (current && nextClasses.some((item) => item.id === current)) {
          return current;
        }
        return nextClasses[0]?.id ?? null;
      });
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Không thể đồng bộ dữ liệu lớp học.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canSync) {
      setLoading(false);
      setClasses([]);
      setStudents([]);
      return;
    }

    void loadData();
  }, [canSync, teacherId]);

  async function handleAddClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = newClassName.trim();

    if (!trimmedName || !teacherId || !profile) return;

    setSavingClass(true);
    setError("");

    try {
      const nextClass = await createTeacherClass({
        teacherId,
        teacherName: profile.name,
        name: trimmedName,
      });
      setNewClassName("");
      await loadData();
      setSelectedClassId(nextClass.id);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Không thể tạo lớp mới.";
      setError(message);
    } finally {
      setSavingClass(false);
    }
  }

  async function handleDeleteClass(classItem: TeacherClass) {
    const studentCount = studentCountByClassId.get(classItem.id) ?? 0;
    const confirmed = window.confirm(
      `Xóa ${classItem.name}? ${studentCount > 0 ? `Toàn bộ ${studentCount} học sinh sẽ bị gỡ khỏi lớp này.` : ""}`,
    );

    if (!confirmed) return;

    setPendingDeleteClassId(classItem.id);
    setError("");

    try {
      await deleteTeacherClass(classItem.id);
      await loadData();
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Không thể xóa lớp học.";
      setError(message);
    } finally {
      setPendingDeleteClassId(null);
    }
  }

  async function handleAssignStudent(student: ClassroomStudent) {
    if (!selectedClass || !teacherId) return;

    setPendingStudentId(student.id);
    setError("");

    try {
      await assignStudentToClass({
        studentId: student.id,
        classId: selectedClass.id,
        className: selectedClass.name,
        teacherId,
      });
      await loadData();
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Không thể cập nhật lớp cho học sinh.";
      setError(message);
    } finally {
      setPendingStudentId(null);
    }
  }

  async function handleRemoveStudent(student: ClassroomStudent) {
    setPendingStudentId(student.id);
    setError("");

    try {
      await removeStudentFromClass(student.id);
      await loadData();
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Không thể gỡ học sinh khỏi lớp.";
      setError(message);
    } finally {
      setPendingStudentId(null);
    }
  }

  async function handleCopyInviteCode(classItem: TeacherClass) {
    try {
      await navigator.clipboard.writeText(classItem.inviteCode);
      setCopiedClassId(classItem.id);
      window.setTimeout(() => {
        setCopiedClassId((current) => (current === classItem.id ? null : current));
      }, 1600);
    } catch {
      setError("Không thể sao chép mã lớp trên thiết bị này.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/teacher"
              className="rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">Quản lý Lớp & Học sinh</h1>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Đồng bộ Firestore cho giáo viên
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || !canSync}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {!canSync && (
          <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
            <h2 className="text-lg font-black">Cần đăng nhập bằng Firebase để quản lý lớp</h2>
            <p className="mt-2 text-sm leading-6">
              Màn hình này đang ghi trực tiếp vào Firestore. Hãy dùng tài khoản giáo viên đã đăng nhập qua Firebase Auth
              để tạo lớp và gán học sinh thật.
            </p>
          </section>
        )}

        {canSync && (
          <>
            <section className="mb-6 grid gap-4 sm:grid-cols-3">
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-500">Tổng số lớp</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{classes.length}</p>
              </article>
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-500">Học sinh đã xếp lớp</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{assignedStudentCount}</p>
              </article>
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-bold text-slate-500">Học sinh đang hiển thị</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{manageableStudents.length}</p>
              </article>
            </section>

            <section className="mb-6 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Tạo lớp mới</h2>
                  <p className="text-sm text-slate-500">Lớp sẽ được lưu ngay lên Firebase theo tài khoản giáo viên hiện tại.</p>
                </div>
              </div>

              <form onSubmit={handleAddClass} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Ví dụ: 10A1, 11 Chuyên Hóa, Ôn thi cuối kỳ"
                  value={newClassName}
                  onChange={(event) => setNewClassName(event.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <button
                  type="submit"
                  disabled={savingClass || !newClassName.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingClass ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  Tạo lớp
                </button>
              </form>

              {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
            </section>

            <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 px-2">
                  <h2 className="text-lg font-black text-slate-900">Danh sách lớp</h2>
                  <p className="text-sm text-slate-500">Chọn một lớp để thêm hoặc gỡ học sinh.</p>
                </div>

                <div className="space-y-3">
                  {loading && (
                    <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}

                  {!loading && classes.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 px-4 py-10 text-center text-sm font-medium text-slate-500">
                      Chưa có lớp nào. Tạo lớp đầu tiên để bắt đầu quản lý.
                    </div>
                  )}

                  {classes.map((classItem) => {
                    const isActive = classItem.id === selectedClassId;
                    const count = studentCountByClassId.get(classItem.id) ?? 0;

                    return (
                      <button
                        key={classItem.id}
                        type="button"
                        onClick={() => setSelectedClassId(classItem.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isActive
                            ? "border-indigo-300 bg-indigo-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-black text-slate-900">{classItem.name}</p>
                            <p className="mt-1 text-xs font-medium text-slate-500">Tạo ngày {formatDate(classItem.createdAt)}</p>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm">
                            {count} HS
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2 text-xs">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleCopyInviteCode(classItem);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 font-bold text-slate-600 shadow-sm"
                          >
                            {copiedClassId === classItem.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedClassId === classItem.id ? "Đã copy" : classItem.inviteCode}
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleDeleteClass(classItem);
                            }}
                            disabled={pendingDeleteClassId === classItem.id}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {pendingDeleteClassId === classItem.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Xóa
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="space-y-6">
                <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                  {selectedClass ? (
                    <>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900">{selectedClass.name}</h2>
                          <p className="mt-1 text-sm text-slate-500">
                            Mã lớp <span className="font-bold text-slate-700">{selectedClass.inviteCode}</span> . {studentCountByClassId.get(selectedClass.id) ?? 0} học sinh
                          </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="search"
                            placeholder="Tìm theo tên hoặc email"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        {/* Học sinh trong lớp – full width */}
                        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4">
                          <div className="mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-5 w-5 text-indigo-600" />
                              <h3 className="text-lg font-black text-slate-900">Học sinh trong lớp</h3>
                              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                                {classStudents.length}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowStudentSource((v) => !v)}
                              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                                showStudentSource
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              <UserPlus className="h-4 w-4" />
                              {showStudentSource ? "Ẩn nguồn" : `Thêm học sinh${availableStudents.length > 0 ? ` (${availableStudents.length})` : ""}`}
                            </button>
                          </div>

                          <div className="space-y-3">
                            {classStudents.length === 0 && (
                              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm font-medium text-slate-500">
                                Chưa có học sinh nào trong lớp này.
                              </div>
                            )}

                            {classStudents.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                              >
                                <div>
                                  <p className="font-bold text-slate-900">
                                    {student.avatar} {student.name}
                                  </p>
                                  <p className="text-sm text-slate-500">{student.email || "Chưa có email"}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => void handleRemoveStudent(student)}
                                  disabled={pendingStudentId === student.id}
                                  className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {pendingStudentId === student.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <UserMinus className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Nguồn học sinh – collapsible */}
                        {showStudentSource && (
                          <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/60 p-4">
                            <div className="mb-4 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-emerald-600" />
                                <h3 className="text-lg font-black text-slate-900">Nguồn học sinh</h3>
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                  {availableStudents.length}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowStudentSource(false)}
                                className="rounded-xl bg-white/80 px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-700"
                              >
                                Đóng
                              </button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {availableStudents.length === 0 && (
                                <div className="col-span-full rounded-2xl border border-dashed border-emerald-200 bg-white px-4 py-8 text-center text-sm font-medium text-slate-500">
                                  Không còn học sinh phù hợp với bộ lọc hiện tại.
                                </div>
                              )}

                              {availableStudents.map((student) => (
                                <div
                                  key={student.id}
                                  className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-3"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate font-bold text-slate-900">
                                      {student.avatar} {student.name}
                                    </p>
                                    <p className="truncate text-sm text-slate-500">{student.email || "Chưa có email"}</p>
                                    {student.className && (
                                      <p className="mt-0.5 truncate text-xs font-bold text-amber-700">Lớp {student.className}</p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void handleAssignStudent(student)}
                                    disabled={pendingStudentId === student.id}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {pendingStudentId === student.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <UserPlus className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-slate-500">
                      Hãy chọn một lớp ở cột bên trái để quản lý học sinh.
                    </div>
                  )}
                </section>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
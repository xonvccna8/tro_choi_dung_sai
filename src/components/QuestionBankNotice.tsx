import { Link } from "react-router-dom";
import { useAppAuth } from "../lib/AuthContext";
import { useGameStore } from "../store/useGameStore";

type Tone = "violet" | "amber" | "rose" | "emerald";

type QuestionBankNoticeProps = {
  title: string;
  description: string;
  tone?: Tone;
  actionLabel?: string;
  hideAction?: boolean;
};

const toneClasses: Record<Tone, { shell: string; title: string; button: string }> = {
  violet: {
    shell: "bg-violet-50 border-violet-200",
    title: "text-violet-700",
    button: "bg-violet-600 text-white hover:bg-violet-700",
  },
  amber: {
    shell: "bg-amber-50 border-amber-200",
    title: "text-amber-700",
    button: "bg-amber-500 text-white hover:bg-amber-600",
  },
  rose: {
    shell: "bg-rose-50 border-rose-200",
    title: "text-rose-700",
    button: "bg-rose-500 text-white hover:bg-rose-600",
  },
  emerald: {
    shell: "bg-emerald-50 border-emerald-200",
    title: "text-emerald-700",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
};

export function QuestionBankNotice({
  title,
  description,
  tone = "violet",
  actionLabel = "Vào Trình Tạo Câu Hỏi",
  hideAction = false,
}: QuestionBankNoticeProps) {
  const activeTone = toneClasses[tone];
  const storedUser = useGameStore((state) => state.user);
  const { profile } = useAppAuth();
  const user = profile ?? storedUser;
  const canCreateQuestions = user?.role === "teacher";
  const studentFacingDescription =
    !hideAction && !canCreateQuestions
      ? "Bộ câu hỏi hoặc bài tập này chưa sẵn sàng cho học sinh. Hãy báo giáo viên kiểm tra và bổ sung nội dung giúp em."
      : description;

  return (
    <div className={`rounded-3xl border p-5 shadow-xl ${activeTone.shell}`}>
      <p className={`text-lg font-black ${activeTone.title}`}>{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{studentFacingDescription}</p>
      {!hideAction && canCreateQuestions && (
        <Link
          to="/builder"
          className={`mt-4 inline-flex rounded-2xl px-4 py-3 text-sm font-bold transition ${activeTone.button}`}
        >
          {actionLabel}
        </Link>
      )}
      {!hideAction && !canCreateQuestions && (
        <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
          Học sinh chỉ nhận bài tập và câu hỏi từ giáo viên, không tạo nội dung ở trang này.
        </div>
      )}
    </div>
  );
}
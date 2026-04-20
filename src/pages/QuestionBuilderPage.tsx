import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ChemText } from "../components/ChemText";
import { FormulaToolbar } from "../components/FormulaToolbar";
import { GameShell } from "../components/GameShell";
import { QuestionBankNotice } from "../components/QuestionBankNotice";
import { useQuestionBank } from "../hooks/useQuestionBank";
import {
  filterMultiTrueFalseQuestionsByMode,
  filterTrueFalseQuestionsByMode,
  isMultiTrueFalseQuestion,
  isTrueFalseQuestion,
  removeQuestion,
  saveQuestion,
  saveQuestionsBatch,
  type CreateQuestionInput,
} from "../lib/questionBank";
import {
  generateMultiQuestionWithAI,
  generateSingleQuestionWithAI,
} from "../lib/aiQuestionGenerator";
import { useGameStore } from "../store/useGameStore";
import type { ArenaRound, QuestionAssignment, QuestionGameMode, SyncedQuestion } from "../types";
import { downloadWordTemplate } from "../utils/generateTemplate";
import { parseDocxFile, parseQuestionFile } from "../utils/questionParser";
import type { ParsedResult } from "../utils/questionParser";
import { uploadImageToStorage } from "../lib/uploadImage";

type Tab = "manual" | "upload" | "ai";
type Feedback = { tone: "success" | "error"; text: string } | null;
type AiGenerationMode = "single" | "multi";

type TrueFalseMode = Extract<QuestionGameMode, "pirate" | "run">;
type MultiMode = Extract<QuestionGameMode, "pirate" | "blind-box" | "elimination" | "arena">;

type AssignmentState = {
  trueFalseModes: TrueFalseMode[];
  multiModes: MultiMode[];
  arenaRound: ArenaRound;
};

type TargetOption<T extends string> = {
  value: T;
  title: string;
  description: string;
};

const trueFalseTargets: TargetOption<TrueFalseMode>[] = [
  { value: "run", title: "Đường Chạy Vô Cực", description: "Câu Đúng/Sai đơn cho game phản xạ nhanh." },
  { value: "pirate", title: "Đảo Hải Tặc", description: "Dùng ở phần quay vàng Đúng/Sai đơn." },
];

const multiTargets: TargetOption<MultiMode>[] = [
  { value: "pirate", title: "Đảo Hải Tặc", description: "Boss 4 ý ở cuối màn Đảo Hải Tặc." },
  { value: "blind-box", title: "Hộp Bí Ẩn", description: "Game mở hộp cần câu 4 ý đạt từ 3/4." },
  { value: "elimination", title: "Thợ Săn Loại Trừ", description: "Luyện phương pháp loại trừ cho câu 4 ý." },
  { value: "arena", title: "Đấu Trường Học Thuật", description: "Câu 4 ý phân theo vòng 1, 2, 3." },
];

const defaultAssignment: AssignmentState = {
  trueFalseModes: ["run", "pirate"],
  multiModes: ["pirate", "blind-box", "elimination"],
  arenaRound: 1,
};

function toggleInList<T extends string>(current: T[], value: T) {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

function resolveAssignment(
  questionType: "true-false" | "multi-true-false",
  assignment: AssignmentState,
): { assignment: QuestionAssignment | null; error: string | null } {
  if (questionType === "true-false") {
    if (assignment.trueFalseModes.length === 0) {
      return {
        assignment: null,
        error: "Hãy chọn ít nhất 1 trò chơi cho câu Đúng/Sai đơn.",
      };
    }

    return {
      assignment: {
        gameModes: assignment.trueFalseModes,
        arenaRound: null,
      },
      error: null,
    };
  }

  if (assignment.multiModes.length === 0) {
    return {
      assignment: null,
      error: "Hãy chọn ít nhất 1 trò chơi cho câu 4 ý Đúng/Sai.",
    };
  }

  return {
    assignment: {
      gameModes: assignment.multiModes,
      arenaRound: assignment.multiModes.includes("arena") ? assignment.arenaRound : null,
    },
    error: null,
  };
}

export function QuestionBuilderPage() {
  const user = useGameStore((s) => s.user);
  const { questions, loading, error, isConfigured } = useQuestionBank();

  const [tab, setTab] = useState<Tab>("manual");
  const [type, setType] = useState<"true-false" | "multi-true-false">("true-false");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [assignment, setAssignment] = useState<AssignmentState>(defaultAssignment);

  const [tfStatement, setTfStatement] = useState("");
  const [tfCorrect, setTfCorrect] = useState(true);
  const [tfExplanation, setTfExplanation] = useState("");

  const [mtfQuestion, setMtfQuestion] = useState("Cho các nhận định sau:");
  const [stmts, setStmts] = useState([
    { text: "", correct: true },
    { text: "", correct: true },
    { text: "", correct: false },
    { text: "", correct: true },
  ]);
  const [mtfExplanation, setMtfExplanation] = useState("");

  const activeField = useRef<string>("");
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedResult | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");
  const [aiMode, setAiMode] = useState<AiGenerationMode>("single");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSinglePrompt, setAiSinglePrompt] = useState("");
  const [aiMultiPrompt, setAiMultiPrompt] = useState("");
  const [aiStatementPrompts, setAiStatementPrompts] = useState(["", "", "", ""]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const summary = useMemo(
    () => ({
      total: questions.length,
      trueFalse: questions.filter(isTrueFalseQuestion).length,
      multi: questions.filter(isMultiTrueFalseQuestion).length,
      run: filterTrueFalseQuestionsByMode(questions, "run").length,
      pirate: questions.filter((question) => question.gameModes.includes("pirate")).length,
      blindBox: filterMultiTrueFalseQuestionsByMode(questions, "blind-box").length,
      elimination: filterMultiTrueFalseQuestionsByMode(questions, "elimination").length,
      arenaRound1: filterMultiTrueFalseQuestionsByMode(questions, "arena", 1).length,
      arenaRound2: filterMultiTrueFalseQuestionsByMode(questions, "arena", 2).length,
      arenaRound3: filterMultiTrueFalseQuestionsByMode(questions, "arena", 3).length,
    }),
    [questions],
  );

  const handleFocus = (key: string) => {
    activeField.current = key;
  };

  const refCallback =
    (key: string) => (element: HTMLInputElement | HTMLTextAreaElement | null) => {
      inputRefs.current[key] = element;
    };

  const appendToField = (key: string, text: string) => {
    switch (key) {
      case "tfStatement":
        setTfStatement((value) => value + text);
        break;
      case "tfExplanation":
        setTfExplanation((value) => value + text);
        break;
      case "mtfQuestion":
        setMtfQuestion((value) => value + text);
        break;
      case "mtfExplanation":
        setMtfExplanation((value) => value + text);
        break;
      default: {
        const match = key.match(/^stmt-(\d)$/);
        if (match) {
          const index = Number(match[1]);
          setStmts((prev) =>
            prev.map((statement, i) => (i === index ? { ...statement, text: statement.text + text } : statement)),
          );
        }
      }
    }
  };

  const handleInsert = (text: string) => {
    const fieldKey = activeField.current;
    const element = inputRefs.current[fieldKey];

    if (element) {
      element.focus();
      document.execCommand("insertText", false, text);
      return;
    }

    appendToField(fieldKey, text);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setFeedback({ tone: "success", text: "Đang tải ảnh lên máy chủ, vui lòng đợi..." });
      
      const downloadURL = await uploadImageToStorage(file);
      
      const imageSyntax = `\n[IMG:${downloadURL}]\n`;
      handleInsert(imageSyntax);
      
      setFeedback({ tone: "success", text: "Tải ảnh thành công! Đã chèn mã ảnh vào ô đang chọn." });
    } catch (error) {
      setFeedback({ 
        tone: "error", 
        text: error instanceof Error ? error.message : "Có lỗi khi tải ảnh lên." 
      });
    } finally {
      setIsUploadingImage(false);
      // Reset input file
      e.target.value = "";
    }
  };

  const updateStmt = (index: number, field: "text" | "correct", value: string | boolean) => {
    setStmts((prev) => prev.map((statement, i) => (i === index ? { ...statement, [field]: value } : statement)));
  };

  const resetTrueFalseForm = () => {
    setTfStatement("");
    setTfCorrect(true);
    setTfExplanation("");
  };

  const resetMultiForm = () => {
    setMtfQuestion("Cho các nhận định sau:");
    setStmts([
      { text: "", correct: true },
      { text: "", correct: true },
      { text: "", correct: false },
      { text: "", correct: true },
    ]);
    setMtfExplanation("");
  };

  const submitManual = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const assignmentResult = resolveAssignment(type, assignment);
    if (assignmentResult.error || !assignmentResult.assignment) {
      setFeedback({ tone: "error", text: assignmentResult.error ?? "Thiếu thiết lập phân phối câu hỏi." });
      return;
    }

    let payload: CreateQuestionInput;

    if (type === "true-false") {
      if (!tfStatement.trim()) {
        setFeedback({ tone: "error", text: "Vui lòng nhập mệnh đề cho câu Đúng/Sai đơn." });
        return;
      }

      payload = {
        type: "true-false",
        statement: tfStatement.trim(),
        correct: tfCorrect,
        explanation: tfExplanation.trim() || "Giáo viên chưa thêm giải thích.",
        ...assignmentResult.assignment,
      };
    } else {
      if (stmts.some((statement) => !statement.text.trim())) {
        setFeedback({ tone: "error", text: "Vui lòng nhập đủ 4 ý a, b, c, d cho câu 4 ý." });
        return;
      }

      const labels = ["a.", "b.", "c.", "d."] as const;
      payload = {
        type: "multi-true-false",
        question: mtfQuestion.trim() || "Cho các nhận định sau:",
        statements: stmts.map((statement, index) => ({
          id: labels[index].replace(".", ""),
          label: labels[index],
          text: statement.text.trim(),
          correct: statement.correct,
        })),
        explanation: mtfExplanation.trim() || "Giáo viên chưa thêm giải thích.",
        ...assignmentResult.assignment,
      };
    }

    try {
      setSaving(true);
      await saveQuestion(payload, user);
      setFeedback({ tone: "success", text: "Đã lưu câu hỏi lên Firebase và đồng bộ toàn hệ thống." });
      if (type === "true-false") resetTrueFalseForm();
      else resetMultiForm();
    } catch (saveError) {
      setFeedback({
        tone: "error",
        text:
          saveError instanceof Error
            ? saveError.message
            : "Không thể lưu câu hỏi lên Firebase. Kiểm tra cấu hình hoặc Firestore Rules.",
      });
    } finally {
      setSaving(false);
    }
  };

  const processFile = async (file: File) => {
    try {
      const result = file.name.endsWith(".docx")
        ? await parseDocxFile(file)
        : parseQuestionFile(await file.text());

      setParsedData(result);
      setUploadMsg(`Đã nhận ${result.trueFalse.length} câu đơn và ${result.multiTrueFalse.length} câu 4 ý.`);
      setFeedback(null);
    } catch {
      setParsedData(null);
      setUploadMsg("Không đọc được file. Hãy kiểm tra lại format Word/TXT.");
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const importAll = async () => {
    if (!parsedData) return;

    const trueFalseAssignment =
      parsedData.trueFalse.length > 0 ? resolveAssignment("true-false", assignment) : { assignment: null, error: null };
    const multiAssignment =
      parsedData.multiTrueFalse.length > 0
        ? resolveAssignment("multi-true-false", assignment)
        : { assignment: null, error: null };

    const firstError = trueFalseAssignment.error || multiAssignment.error;
    if (firstError) {
      setFeedback({ tone: "error", text: firstError });
      return;
    }

    const labels = ["a.", "b.", "c.", "d."] as const;
    const payloads: CreateQuestionInput[] = [
      ...parsedData.trueFalse.map((question) => ({
        type: "true-false" as const,
        statement: question.statement,
        correct: question.correct,
        explanation: question.explanation,
        ...(trueFalseAssignment.assignment as QuestionAssignment),
      })),
      ...parsedData.multiTrueFalse.map((question) => ({
        type: "multi-true-false" as const,
        question: question.question,
        statements: question.statements.map((statement, index) => ({
          id: labels[index].replace(".", ""),
          label: labels[index],
          text: statement.text,
          correct: statement.correct,
        })),
        explanation: question.explanation,
        ...(multiAssignment.assignment as QuestionAssignment),
      })),
    ];

    try {
      setSaving(true);
      const importedCount = await saveQuestionsBatch(payloads, user);
      setFeedback({ tone: "success", text: `Đã nhập ${importedCount} câu hỏi lên Firebase thành công.` });
      setParsedData(null);
      setUploadMsg("");
    } catch (saveError) {
      setFeedback({
        tone: "error",
        text:
          saveError instanceof Error
            ? saveError.message
            : "Không thể nhập câu hỏi hàng loạt lên Firebase.",
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Tự động phân bổ câu hỏi vào các game KHÁC NHAU:
   * - Câu đơn: xoay kẽ run / pirate (mỗi câu chỉ 1 game)
   * - Câu 4 ý: chia nhóm blind-box / elimination / arena-1 / arena-2 / arena-3
   */
  const importAutoDistribute = async () => {
    if (!parsedData) return;
    const totalSingle = parsedData.trueFalse.length;
    const totalMulti = parsedData.multiTrueFalse.length;

    if (totalSingle + totalMulti === 0) {
      setFeedback({ tone: "error", text: "Không có câu hỏi nào để nhập." });
      return;
    }

    const labels = ["a.", "b.", "c.", "d."] as const;
    const payloads: CreateQuestionInput[] = [];

    // === Câu đơn: xoay kẽ run → pirate → run → pirate ...
    const singleModes: Array<"run" | "pirate"> = ["run", "pirate"];
    parsedData.trueFalse.forEach((question, index) => {
      const mode = singleModes[index % 2];
      payloads.push({
        type: "true-false",
        statement: question.statement,
        correct: question.correct,
        explanation: question.explanation,
        gameModes: [mode],
        arenaRound: null,
      });
    });

    // === Câu 4 ý: chia đều blind-box → elimination → arena(R1) → arena(R2) → arena(R3) → blind-box...
    const multiModes: Array<{ mode: "blind-box" | "elimination" | "arena"; round: ArenaRound | null }> = [
      { mode: "blind-box", round: null },
      { mode: "elimination", round: null },
      { mode: "arena", round: 1 },
      { mode: "arena", round: 2 },
      { mode: "arena", round: 3 },
    ];

    parsedData.multiTrueFalse.forEach((question, index) => {
      const config = multiModes[index % multiModes.length];
      payloads.push({
        type: "multi-true-false",
        question: question.question,
        statements: question.statements.map((statement, i) => ({
          id: labels[i].replace(".", ""),
          label: labels[i],
          text: statement.text,
          correct: statement.correct,
        })),
        explanation: question.explanation,
        gameModes: [config.mode],
        arenaRound: config.round,
      });
    });

    try {
      setSaving(true);
      const importedCount = await saveQuestionsBatch(payloads, user);

      // Tóm tắt phân bổ
      const runCount = payloads.filter((p) => p.type === "true-false" && p.gameModes.includes("run")).length;
      const pirateCount = payloads.filter((p) => p.type === "true-false" && p.gameModes.includes("pirate")).length;
      const boxCount = payloads.filter((p) => p.type === "multi-true-false" && p.gameModes.includes("blind-box")).length;
      const elimCount = payloads.filter((p) => p.type === "multi-true-false" && p.gameModes.includes("elimination")).length;
      const arenaCount = payloads.filter((p) => p.type === "multi-true-false" && p.gameModes.includes("arena")).length;

      setFeedback({
        tone: "success",
        text: `✅ Đã nhập ${importedCount} câu! Đường Chạy: ${runCount} | Hải Tặc: ${pirateCount} | Hộp Bí Ẩn: ${boxCount} | Loại Trừ: ${elimCount} | Đấu Trường: ${arenaCount}`,
      });
      setParsedData(null);
      setUploadMsg("");
    } catch (saveError) {
      setFeedback({
        tone: "error",
        text:
          saveError instanceof Error
            ? saveError.message
            : "Không thể nhập câu hỏi hàng loạt lên Firebase.",
      });
    } finally {
      setSaving(false);
    }
  };


  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setDeletingId(questionId);
      await removeQuestion(questionId);
      setFeedback({ tone: "success", text: "Đã xóa câu hỏi khỏi Firebase." });
    } catch (deleteError) {
      setFeedback({
        tone: "error",
        text:
          deleteError instanceof Error
            ? deleteError.message
            : "Không thể xóa câu hỏi khỏi Firebase.",
      });
    } finally {
      setDeletingId("");
    }
  };

  const generateAiQuestion = async () => {
    setFeedback(null);

    try {
      setAiGenerating(true);

      if (aiMode === "single") {
        if (!aiSinglePrompt.trim()) {
          setFeedback({ tone: "error", text: "Vui lòng nhập prompt để AI tạo câu Đúng/Sai đơn." });
          return;
        }

        const result = await generateSingleQuestionWithAI(aiSinglePrompt);
        setType("true-false");
        setTfStatement(result.statement);
        setTfCorrect(result.correct);
        setTfExplanation(result.explanation);
        setTab("manual");
        setFeedback({
          tone: "success",
          text: "AI đã tạo xong câu Đúng/Sai đơn và đổ vào form. Hãy rà soát rồi bấm lưu lên Firebase.",
        });
        return;
      }

      if (!aiMultiPrompt.trim()) {
        setFeedback({ tone: "error", text: "Vui lòng nhập nội dung chung để AI tạo câu 4 ý." });
        return;
      }

      if (aiStatementPrompts.some((value) => !value.trim())) {
        setFeedback({ tone: "error", text: "Vui lòng nhập đủ 4 yêu cầu cho các ý a, b, c, d." });
        return;
      }

      const result = await generateMultiQuestionWithAI(aiMultiPrompt, aiStatementPrompts);
      setType("multi-true-false");
      setMtfQuestion(result.question);
      setStmts(result.statements.map((statement) => ({ text: statement.text, correct: statement.correct })));
      setMtfExplanation(result.explanation);
      setTab("manual");
      setFeedback({
        tone: "success",
        text: "AI đã tạo xong câu 4 ý và đổ vào form. Hãy rà soát rồi bấm lưu lên Firebase.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Không thể tạo câu hỏi bằng AI lúc này.",
      });
    } finally {
      setAiGenerating(false);
    }
  };



  if (!isConfigured) {
    return (
      <GameShell title="🧪 Tạo Câu Hỏi" subtitle="Lưu vào Firebase để đồng bộ cho giáo viên và học sinh">
        <QuestionBankNotice
          title="Firebase chưa được cấu hình"
          description="App đã được chuyển sang chế độ dùng ngân hàng câu hỏi Firebase duy nhất. Hãy thêm cấu hình Web App của Firebase vào dự án rồi deploy lại để bắt đầu lưu và đồng bộ câu hỏi."
          tone="amber"
          hideAction
        />

        <div className="mt-4 rounded-3xl bg-white/95 p-5 shadow-xl">
          <p className="text-lg font-black text-violet-700">Các biến môi trường cần có</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              "VITE_FIREBASE_API_KEY",
              "VITE_FIREBASE_APP_ID",
              "VITE_FIREBASE_AUTH_DOMAIN",
              "VITE_FIREBASE_PROJECT_ID",
              "VITE_FIREBASE_STORAGE_BUCKET",
              "VITE_FIREBASE_MESSAGING_SENDER_ID",
            ].map((envName) => (
              <div key={envName} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                {envName}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Sau khi thêm các biến này vào `.env.local` và Vercel, mọi câu hỏi tạo ở đây sẽ được lưu lên Firestore và đồng bộ theo thời gian thực.
          </p>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="🧪 Tạo Câu Hỏi" subtitle="Lưu lên Firebase và phân phối theo từng game">
      <div className="space-y-4">
        <div className="rounded-3xl bg-white/95 p-5 shadow-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-lg font-black text-violet-700">Ngân hàng câu hỏi dùng chung</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Dữ liệu seed cũ đã bị loại bỏ. Từ giờ mọi câu hỏi sẽ được lưu vào Firestore và đồng bộ cho giáo viên, học sinh từ cùng một nguồn.
              </p>
            </div>
            <div className="rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-700">
              <p className="font-bold">Người tạo hiện tại</p>
              <p>{user?.name ?? "Chưa xác định"}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Tổng câu hỏi" value={loading ? "..." : String(summary.total)} tone="violet" />
            <StatCard label="Câu đơn" value={loading ? "..." : String(summary.trueFalse)} tone="emerald" />
            <StatCard label="Câu 4 ý" value={loading ? "..." : String(summary.multi)} tone="amber" />
            <StatCard
              label="Đấu Trường"
              value={loading ? "..." : `${summary.arenaRound1}/${summary.arenaRound2}/${summary.arenaRound3}`}
              hint="R1 / R2 / R3"
              tone="rose"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white/95 p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-black text-violet-700">🎯 Phân phối câu hỏi</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Chọn rõ câu hỏi sẽ xuất hiện ở game nào. Với Đấu Trường Học Thuật, bạn cần chỉ định thêm vòng 1, 2 hoặc 3.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAssignment(defaultAssignment)}
              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Đặt lại
            </button>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <TargetSelectionCard
              title="Câu Đúng/Sai đơn"
              description="Áp dụng cho các game cần mệnh đề đơn lẻ."
              options={trueFalseTargets}
              selected={assignment.trueFalseModes}
              onToggle={(mode) =>
                setAssignment((prev) => ({ ...prev, trueFalseModes: toggleInList(prev.trueFalseModes, mode) }))
              }
            />

            <div className="rounded-2xl bg-slate-50 p-4">
              <TargetSelectionCard
                title="Câu 4 ý Đúng/Sai"
                description="Áp dụng cho các game dạng 4 phát biểu a, b, c, d."
                options={multiTargets}
                selected={assignment.multiModes}
                onToggle={(mode) =>
                  setAssignment((prev) => ({ ...prev, multiModes: toggleInList(prev.multiModes, mode) }))
                }
              />

              {assignment.multiModes.includes("arena") && (
                <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                  <p className="text-sm font-bold text-violet-700">Vòng Đấu Trường</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {([1, 2, 3] as ArenaRound[]).map((round) => (
                      <button
                        key={round}
                        type="button"
                        onClick={() => setAssignment((prev) => ({ ...prev, arenaRound: round }))}
                        className={`rounded-xl px-3 py-3 text-sm font-bold transition ${assignment.arenaRound === round ? "bg-violet-600 text-white shadow-lg" : "bg-white text-slate-700 hover:bg-violet-100"}`}
                      >
                        Vòng {round}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MiniCountCard label="Đường Chạy" value={summary.run} />
            <MiniCountCard label="Đảo Hải Tặc" value={summary.pirate} />
            <MiniCountCard label="Hộp Bí Ẩn" value={summary.blindBox} />
            <MiniCountCard label="Loại Trừ" value={summary.elimination} />
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-2xl border p-4 text-sm font-semibold shadow-sm ${feedback.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
          >
            {feedback.text}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => {
              setTab("manual");
              setFeedback(null);
            }}
            className={`rounded-xl p-3 font-bold transition ${tab === "manual" ? "bg-violet-600 text-white shadow-lg" : "bg-white/80 text-slate-700"}`}
          >
            ✏️ Soạn tay
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("ai");
              setFeedback(null);
            }}
            className={`rounded-xl p-3 font-bold transition ${tab === "ai" ? "bg-emerald-600 text-white shadow-lg" : "bg-white/80 text-slate-700"}`}
          >
            🤖 AI tạo câu hỏi
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("upload");
              setFeedback(null);
            }}
            className={`rounded-xl p-3 font-bold transition ${tab === "upload" ? "bg-fuchsia-600 text-white shadow-lg" : "bg-white/80 text-slate-700"}`}
          >
            📁 Nhập từ file
          </button>
        </div>

        {tab === "manual" && (
          <form onSubmit={submitManual} className="space-y-3">
            <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
              <button
                type="button"
                onClick={() => setShowToolbar((current) => !current)}
                className="flex w-full items-center justify-between"
              >
                <span className="text-sm font-bold text-violet-700">
                  🧪 Công cụ công thức & Ảnh {showToolbar ? "▲" : "▼"}
                </span>
                <span className="text-xs text-slate-400">Bấm ô nhập rồi chọn công thức</span>
              </button>
              {showToolbar && (
                <div className="mt-4 flex flex-col gap-4 border-t-2 border-slate-100 pt-4">
                  <FormulaToolbar onInsert={handleInsert} />
                  
                  {/* Upload Image Section */}
                  <div className="flex animate-fade-in items-center gap-3 rounded-2xl bg-slate-50 p-3">
                    <div className="flex bg-white shrink-0 items-center justify-center rounded-xl p-2 shadow-sm text-lg border border-slate-200 text-slate-500">
                      🖼️
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700">Chèn Ảnh</p>
                      <p className="text-xs text-slate-500">
                        Hệ thống tự nén ảnh. Bấm vào ô text trước khi tải ảnh.
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold shadow-md transition ${
                          isUploadingImage 
                            ? "bg-slate-300 text-slate-500" 
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                        }`}
                      >
                        {isUploadingImage ? "Đang tải..." : "Tải ảnh lên"}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("true-false")}
                className={`flex-1 rounded-xl p-3 font-bold transition ${type === "true-false" ? "bg-violet-600 text-white shadow-lg" : "bg-white/80 text-slate-700"}`}
              >
                📝 Câu đơn
              </button>
              <button
                type="button"
                onClick={() => setType("multi-true-false")}
                className={`flex-1 rounded-xl p-3 font-bold transition ${type === "multi-true-false" ? "bg-fuchsia-600 text-white shadow-lg" : "bg-white/80 text-slate-700"}`}
              >
                📋 Câu 4 ý
              </button>
            </div>

            <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
              {type === "true-false" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-slate-600">Mệnh đề</label>
                    <input
                      ref={refCallback("tfStatement")}
                      onFocus={() => handleFocus("tfStatement")}
                      value={tfStatement}
                      onChange={(e) => setTfStatement(e.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-violet-400 focus:outline-none"
                      placeholder="Ví dụ: Glucose có công thức C6H12O6."
                    />
                    {tfStatement && (
                      <div className="mt-2 rounded-xl bg-violet-50 p-3 text-sm">
                        <span className="text-xs text-slate-400">Xem trước:</span>
                        <div className="mt-1">
                          <ChemText text={tfStatement} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-600">Đáp án đúng</label>
                    <select
                      value={tfCorrect ? "true" : "false"}
                      onChange={(e) => setTfCorrect(e.target.value === "true")}
                      className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3"
                    >
                      <option value="true">Đúng</option>
                      <option value="false">Sai</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-600">Giải thích</label>
                    <textarea
                      ref={refCallback("tfExplanation")}
                      onFocus={() => handleFocus("tfExplanation")}
                      value={tfExplanation}
                      onChange={(e) => setTfExplanation(e.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-violet-400 focus:outline-none"
                      placeholder="Giải thích ngắn gọn cho đáp án"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-slate-600">Câu hỏi</label>
                    <input
                      ref={refCallback("mtfQuestion")}
                      onFocus={() => handleFocus("mtfQuestion")}
                      value={mtfQuestion}
                      onChange={(e) => setMtfQuestion(e.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-violet-400 focus:outline-none"
                      placeholder="Cho các nhận định sau:"
                    />
                  </div>

                  {stmts.map((statement, index) => {
                    const label = ["a", "b", "c", "d"][index];
                    return (
                      <div key={label} className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-violet-700">{label}.</span>
                          <input
                            ref={refCallback(`stmt-${index}`)}
                            onFocus={() => handleFocus(`stmt-${index}`)}
                            value={statement.text}
                            onChange={(e) => updateStmt(index, "text", e.target.value)}
                            className="flex-1 rounded-lg border-2 border-slate-200 p-2 focus:border-violet-400 focus:outline-none"
                            placeholder={`Nội dung ý ${label}...`}
                          />
                          <select
                            value={statement.correct ? "true" : "false"}
                            onChange={(e) => updateStmt(index, "correct", e.target.value === "true")}
                            className="rounded-lg border-2 border-slate-200 p-2 text-sm"
                          >
                            <option value="true">Đ</option>
                            <option value="false">S</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}

                  <div>
                    <label className="text-sm font-bold text-slate-600">Giải thích chung</label>
                    <textarea
                      ref={refCallback("mtfExplanation")}
                      onFocus={() => handleFocus("mtfExplanation")}
                      value={mtfExplanation}
                      onChange={(e) => setMtfExplanation(e.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-violet-400 focus:outline-none"
                      placeholder="Giải thích cho cả 4 ý"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-lg font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Đang lưu lên Firebase..." : "💾 Lưu câu hỏi lên Firebase"}
              </button>
            </div>
          </form>
        )}

        {tab === "ai" && (
          <div className="space-y-3">
            <div className="rounded-3xl bg-white/95 p-5 shadow-xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-lg font-black text-emerald-700">🤖 AI tạo bài tập Đúng/Sai</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    AI chỉ sinh nội dung và đổ vào form soạn tay để bạn rà soát trước khi lưu. Cách này an toàn hơn và giữ chất lượng tốt hơn.
                  </p>
                </div>

              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                📝 Chọn loại câu hỏi bên dưới, nhập hoặc chỉnh prompt rồi nhấn <strong>✨ Tạo câu hỏi bằng AI</strong>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAiMode("single")}
                  className={`flex-1 rounded-xl p-3 font-bold transition ${aiMode === "single" ? "bg-emerald-600 text-white shadow-lg" : "bg-slate-100 text-slate-700"}`}
                >
                  Câu đơn Đúng/Sai
                </button>
                <button
                  type="button"
                  onClick={() => setAiMode("multi")}
                  className={`flex-1 rounded-xl p-3 font-bold transition ${aiMode === "multi" ? "bg-teal-600 text-white shadow-lg" : "bg-slate-100 text-slate-700"}`}
                >
                  Câu 4 ý Đúng/Sai
                </button>
              </div>

              {aiMode === "single" ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-sm font-bold text-slate-600">Prompt tạo câu đơn</label>
                    <textarea
                      value={aiSinglePrompt}
                      onChange={(e) => setAiSinglePrompt(e.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-emerald-400 focus:outline-none"
                      rows={6}
                      placeholder="Ví dụ: Tạo 1 câu đúng sai đơn về phản ứng của phenol với dung dịch brom, mức độ vận dụng, phát biểu ngắn gọn nhưng dễ nhầm, có giải thích rõ vì sao đúng hoặc sai."
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-sm font-bold text-slate-600">Prompt nội dung chung</label>
                    <textarea
                      value={aiMultiPrompt}
                      onChange={(e) => setAiMultiPrompt(e.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-emerald-400 focus:outline-none"
                      rows={5}
                      placeholder="Ví dụ: Tạo 1 câu 4 ý đúng sai về kim loại kiềm, bám sát chương trình THPT, có câu dẫn như đề thi thật, độ khó khá giỏi."
                    />
                  </div>

                  {aiStatementPrompts.map((value, index) => {
                    const label = ["a", "b", "c", "d"][index];
                    return (
                      <div key={label}>
                        <label className="text-sm font-bold text-slate-600">Yêu cầu cho ý {label}</label>
                        <input
                          value={value}
                          onChange={(e) =>
                            setAiStatementPrompts((prev) => prev.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)))
                          }
                          className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-emerald-400 focus:outline-none"
                          placeholder={`Ví dụ: Ý ${label} hỏi về tính chất / hiện tượng / công thức / nhận xét dễ nhầm.`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={generateAiQuestion}
                disabled={aiGenerating}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-lg font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {aiGenerating ? "AI đang tạo câu hỏi..." : "✨ Tạo câu hỏi bằng AI"}
              </button>
            </div>
          </div>
        )}

        {tab === "upload" && (
          <div className="space-y-3">
            <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
              <h3 className="text-lg font-black text-violet-700">📄 Bước 1: Tải mẫu file Word</h3>
              <p className="mt-1 text-sm text-slate-600">
                Tải mẫu `.docx`, nhập câu hỏi theo đúng format, rồi tải ngược lại lên hệ thống để lưu hàng loạt vào Firestore.
              </p>
              <button
                onClick={() => downloadWordTemplate()}
                className="mt-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-bold text-white shadow-lg transition hover:brightness-110"
              >
                ⬇️ Tải mẫu câu hỏi (.docx)
              </button>
            </div>

            <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
              <h3 className="font-black text-violet-700">📋 Hướng dẫn format trong Word</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="rounded-lg bg-violet-50 p-3">
                  <p className="font-bold text-violet-700">Câu đơn Đúng/Sai</p>
                  <code className="mt-1 block rounded bg-white p-2 text-xs text-slate-700">
                    [ĐÚNG] H2SO4 là acid mạnh. | Vì H2SO4 phân li hoàn toàn.
                  </code>
                  <code className="mt-1 block rounded bg-white p-2 text-xs text-slate-700">
                    [SAI] Fructose là aldose. | Fructose là ketose.
                  </code>
                </div>

                <div className="rounded-lg bg-fuchsia-50 p-3">
                  <p className="font-bold text-fuchsia-700">Câu 4 ý (giữa 2 dấu ---)</p>
                  <pre className="mt-1 whitespace-pre-wrap rounded bg-white p-2 text-xs text-slate-700">
{`---
Cho các nhận định sau:
a. [ĐÚNG] Glucose là aldohexose.
b. [SAI] Fructose là aldose.
c. [SAI] Saccharose có tính khử.
d. [ĐÚNG] Maltose có tính khử.
Giải thích: Fructose là ketose.
---`}
                  </pre>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
              <h3 className="text-lg font-black text-violet-700">📁 Bước 2: Tải file Word lên</h3>
              <div
                className="mt-3 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 p-6 transition hover:bg-violet-100"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={handleDrop}
              >
                <p className="text-4xl">📄</p>
                <p className="mt-2 font-bold text-violet-700">Kéo thả file Word vào đây</p>
                <p className="text-sm text-slate-500">hoặc bấm để chọn file (.docx / .txt)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx,.txt"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {uploadMsg && (
                <p className="mt-3 rounded-lg bg-violet-100 p-3 text-sm font-bold text-violet-700">
                  {uploadMsg}
                </p>
              )}

              {parsedData && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-bold text-slate-700">👀 Xem trước câu hỏi</h4>

                  {parsedData.trueFalse.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-violet-600">Câu đơn ({parsedData.trueFalse.length})</p>
                      {parsedData.trueFalse.map((question, index) => (
                        <div key={`${question.statement}-${index}`} className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">
                          <span className={question.correct ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                            [{question.correct ? "Đ" : "S"}]
                          </span>{" "}
                          <ChemText text={question.statement} />
                        </div>
                      ))}
                    </div>
                  )}

                  {parsedData.multiTrueFalse.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-fuchsia-600">Câu 4 ý ({parsedData.multiTrueFalse.length})</p>
                      {parsedData.multiTrueFalse.map((question, index) => (
                        <div key={`${question.question}-${index}`} className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">
                          <p className="font-medium"><ChemText text={question.question} /></p>
                          {question.statements.map((statement, statementIndex) => (
                            <p key={`${statement.label}-${statementIndex}`} className="ml-3 mt-1">
                              <span className={statement.correct ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                                [{statement.correct ? "Đ" : "S"}]
                              </span>{" "}
                              {statement.label} <ChemText text={statement.text} />
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nút Phân bổ Tự động - ưu tiên hiển thị */}
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-black text-emerald-700">🎯 Phân bổ tự động (Khuyến nghị)</p>
                    <p className="mt-1 text-xs text-emerald-600">
                      Tự chia câu đơn → Đường Chạy &amp; Hải Tặc (xoay kẽ).
                      Câu 4 ý → Hộp Bí Ẩn / Loại Trừ / Đấu Trường R1-R2-R3.
                      <strong> Mỗi game một bộ câu riêng biệt!</strong>
                    </p>
                    <button
                      onClick={importAutoDistribute}
                      disabled={saving}
                      className="mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-lg font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Đang phân bổ lên Firebase..." : `✨ Phân bổ tự động ${parsedData.trueFalse.length + parsedData.multiTrueFalse.length} câu hỏi`}
                    </button>
                  </div>

                  {/* Nút nhập theo cài đặt thủ công */}
                  <button
                    onClick={importAll}
                    disabled={saving}
                    className="mt-2 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    {saving ? "Đang nhập..." : "📥 Nhập theo cài đặt phân phối thủ công ở trên"}
                  </button>

                </div>
              )}
            </div>
          </div>
        )}

        <FirebaseQuestionList
          questions={questions}
          loading={loading}
          deletingId={deletingId}
          onDelete={handleDeleteQuestion}
        />
      </div>
    </GameShell>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "violet" | "emerald" | "amber" | "rose";
}) {
  const tones = {
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  } as const;

  return (
    <div className={`rounded-2xl p-4 ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      {hint && <p className="mt-1 text-xs font-semibold opacity-70">{hint}</p>}
    </div>
  );
}

function MiniCountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-3 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-800">{value}</p>
    </div>
  );
}

function TargetSelectionCard<T extends string>({
  title,
  description,
  options,
  selected,
  onToggle,
}: {
  title: string;
  description: string;
  options: TargetOption<T>[];
  selected: T[];
  onToggle: (mode: T) => void;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-black text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              className={`rounded-2xl border p-4 text-left transition ${active ? "border-violet-500 bg-violet-50 shadow-md" : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"}`}
            >
              <p className={`font-bold ${active ? "text-violet-700" : "text-slate-800"}`}>{option.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FirebaseQuestionList({
  questions,
  loading,
  deletingId,
  onDelete,
}: {
  questions: SyncedQuestion[];
  loading: boolean;
  deletingId: string;
  onDelete: (questionId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const trueFalseQuestions = questions.filter(isTrueFalseQuestion);
  const multiTrueFalseQuestions = questions.filter(isMultiTrueFalseQuestion);

  return (
    <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
      <div 
        className="flex cursor-pointer flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-black text-violet-700">📚 Ngân hàng câu hỏi Firebase</h3>
          <span className="text-violet-400 transition-transform duration-300 text-xs" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
            {loading ? "Đang đồng bộ..." : `${questions.length} câu hỏi`}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 animate-fade-in border-t border-slate-100 pt-4">
          {!loading && questions.length === 0 && (
            <div className="rounded-2xl bg-violet-50 p-4 text-sm text-violet-700">
              Ngân hàng câu hỏi hiện đang rỗng. Hãy tạo câu hỏi đầu tiên để các game bắt đầu hoạt động trở lại.
            </div>
          )}

          {trueFalseQuestions.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Câu đơn ({trueFalseQuestions.length})</p>
              {trueFalseQuestions.map((question) => (
                <div key={question.id} className="mt-2 rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 text-sm">
                      <p>
                        <span className={question.correct ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                          [{question.correct ? "Đ" : "S"}]
                        </span>{" "}
                        <ChemText text={question.statement} />
                      </p>
                      <p className="mt-1 text-xs italic text-slate-500">
                        <ChemText text={question.explanation} />
                      </p>
                      <QuestionMetaRow question={question} />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(question.id); }}
                      disabled={deletingId === question.id}
                      className="rounded-xl px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === question.id ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {multiTrueFalseQuestions.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Câu 4 ý ({multiTrueFalseQuestions.length})</p>
              {multiTrueFalseQuestions.map((question) => (
                <div key={question.id} className="mt-2 rounded-2xl bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 text-sm">
                      <p className="font-medium"><ChemText text={question.question} /></p>
                      {question.statements.map((statement) => (
                        <p key={statement.id} className="mt-1 ml-3">
                          <span className={statement.correct ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                            [{statement.correct ? "Đ" : "S"}]
                          </span>{" "}
                          {statement.label} <ChemText text={statement.text} />
                        </p>
                      ))}
                      <p className="mt-1 text-xs italic text-slate-500">
                        <ChemText text={question.explanation} />
                      </p>
                      <QuestionMetaRow question={question} />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDelete(question.id); }}
                      disabled={deletingId === question.id}
                      className="rounded-xl px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === question.id ? "..." : "🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionMetaRow({ question }: { question: SyncedQuestion }) {
  const labels = question.gameModes.map((mode) => {
    if (mode === "run") return "Đường Chạy";
    if (mode === "pirate") return "Đảo Hải Tặc";
    if (mode === "blind-box") return "Hộp Bí Ẩn";
    if (mode === "elimination") return "Loại Trừ";
    return question.arenaRound ? `Đấu Trường V${question.arenaRound}` : "Đấu Trường";
  });

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
      {labels.map((label) => (
        <span key={`${question.id}-${label}`} className="rounded-full bg-white px-2 py-1 font-semibold text-slate-600 shadow-sm">
          {label}
        </span>
      ))}
      <span className="rounded-full bg-white px-2 py-1 font-semibold text-slate-500 shadow-sm">
        {question.createdByName ? `Tạo bởi ${question.createdByName}` : "Không rõ người tạo"}
      </span>
      <span className="rounded-full bg-white px-2 py-1 font-semibold text-slate-500 shadow-sm">
        {question.createdAt ? new Date(question.createdAt).toLocaleString("vi-VN") : "Vừa tạo"}
      </span>
    </div>
  );
}

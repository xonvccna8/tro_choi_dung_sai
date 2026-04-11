import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ChemText } from "../components/ChemText";
import { FormulaToolbar } from "../components/FormulaToolbar";
import { GameShell } from "../components/GameShell";
import { useGameStore } from "../store/useGameStore";
import { parseQuestionFile } from "../utils/questionParser";
import type { ParsedResult } from "../utils/questionParser";

type Tab = "manual" | "upload";

export function QuestionBuilderPage() {
  const addTf = useGameStore((s) => s.addCustomTrueFalseQuestion);
  const addMtf = useGameStore((s) => s.addCustomMultiTrueFalseQuestion);
  const removeTf = useGameStore((s) => s.removeCustomTrueFalseQuestion);
  const removeMtf = useGameStore((s) => s.removeCustomMultiTrueFalseQuestion);
  const customTf = useGameStore((s) => s.customTrueFalseQuestions);
  const customMtf = useGameStore((s) => s.customMultiTrueFalseQuestions);

  const [tab, setTab] = useState<Tab>("manual");
  const [type, setType] = useState<"true-false" | "multi-true-false">("true-false");
  const [message, setMessage] = useState("");
  const [showToolbar, setShowToolbar] = useState(true);

  /* ── True-false fields ── */
  const [tfStatement, setTfStatement] = useState("");
  const [tfCorrect, setTfCorrect] = useState(true);
  const [tfExplanation, setTfExplanation] = useState("");

  /* ── Multi true-false fields ── */
  const [mtfQuestion, setMtfQuestion] = useState("Cho cac nhan dinh sau:");
  const [stmts, setStmts] = useState([
    { text: "", correct: true },
    { text: "", correct: true },
    { text: "", correct: false },
    { text: "", correct: true },
  ]);
  const [mtfExplanation, setMtfExplanation] = useState("");

  /* ── Active field tracking for formula toolbar insertion ── */
  const activeField = useRef<string>("");
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  /* ── File upload ── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<ParsedResult | null>(null);
  const [uploadMsg, setUploadMsg] = useState("");

  const handleFocus = (key: string) => {
    activeField.current = key;
  };

  const refCallback =
    (key: string) => (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      inputRefs.current[key] = el;
    };

  /* Insert formula text at cursor position of the currently focused input */
  const handleInsert = (text: string) => {
    const key = activeField.current;
    const el = inputRefs.current[key];
    if (el) {
      el.focus();
      // insertText inserts at cursor and fires React onChange
      document.execCommand("insertText", false, text);
      return;
    }
    // Fallback: append to whichever field based on key
    appendToField(key, text);
  };

  const appendToField = (key: string, text: string) => {
    switch (key) {
      case "tfStatement":
        setTfStatement((v) => v + text);
        break;
      case "tfExplanation":
        setTfExplanation((v) => v + text);
        break;
      case "mtfQuestion":
        setMtfQuestion((v) => v + text);
        break;
      case "mtfExplanation":
        setMtfExplanation((v) => v + text);
        break;
      default: {
        const m = key.match(/^stmt-(\d)$/);
        if (m) {
          const idx = parseInt(m[1]);
          setStmts((prev) =>
            prev.map((s, i) => (i === idx ? { ...s, text: s.text + text } : s)),
          );
        }
      }
    }
  };

  const updateStmt = (index: number, field: "text" | "correct", value: string | boolean) => {
    setStmts((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  /* ── Submit manual question ── */
  const submitManual = (e: FormEvent) => {
    e.preventDefault();

    if (type === "true-false") {
      if (!tfStatement.trim()) {
        setMessage("⚠️ Vui long nhap menh de.");
        return;
      }
      addTf({
        id: `custom-tf-${Date.now()}`,
        type: "true-false",
        statement: tfStatement.trim(),
        correct: tfCorrect,
        explanation: tfExplanation.trim() || "Giao vien chua them giai thich.",
      });
      setMessage("✅ Da tao cau Dung/Sai don thanh cong!");
      setTfStatement("");
      setTfExplanation("");
      return;
    }

    if (stmts.some((s) => !s.text.trim())) {
      setMessage("⚠️ Vui long nhap du 4 y a, b, c, d.");
      return;
    }
    const labels = ["a.", "b.", "c.", "d."] as const;
    addMtf({
      id: `custom-mtf-${Date.now()}`,
      type: "multi-true-false",
      question: mtfQuestion.trim() || "Cho cac nhan dinh sau:",
      statements: stmts.map((s, i) => ({
        id: labels[i].replace(".", ""),
        label: labels[i],
        text: s.text.trim(),
        correct: s.correct,
      })),
      explanation: mtfExplanation.trim() || "Giao vien chua them giai thich.",
    });
    setMessage("✅ Da tao cau 4 y Dung/Sai thanh cong!");
    setStmts([
      { text: "", correct: true },
      { text: "", correct: true },
      { text: "", correct: false },
      { text: "", correct: true },
    ]);
    setMtfExplanation("");
  };

  /* ── File handling ── */
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      try {
        const result = parseQuestionFile(content);
        setParsedData(result);
        setUploadMsg(
          `✅ Tim thay: ${result.trueFalse.length} cau don + ${result.multiTrueFalse.length} cau 4 y`,
        );
      } catch {
        setUploadMsg("⚠️ Loi doc file. Kiem tra lai format.");
      }
    };
    reader.readAsText(file, "UTF-8");
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

  const importAll = () => {
    if (!parsedData) return;
    let count = 0;
    const labels = ["a.", "b.", "c.", "d."] as const;

    parsedData.trueFalse.forEach((q) => {
      addTf({
        id: `custom-tf-${Date.now()}-${count}`,
        type: "true-false",
        statement: q.statement,
        correct: q.correct,
        explanation: q.explanation,
      });
      count++;
    });

    parsedData.multiTrueFalse.forEach((q) => {
      addMtf({
        id: `custom-mtf-${Date.now()}-${count}`,
        type: "multi-true-false",
        question: q.question,
        statements: q.statements.map((s, i) => ({
          id: labels[i].replace(".", ""),
          label: labels[i],
          text: s.text,
          correct: s.correct,
        })),
        explanation: q.explanation,
      });
      count++;
    });

    setMessage(`✅ Da nhap thanh cong ${count} cau hoi tu file!`);
    setParsedData(null);
    setUploadMsg("");
  };

  return (
    <GameShell title="🧪 Tao Cau Hoi" subtitle="Soan cau hoi voi cong thuc hoa hoc dep">
      {/* ── Tab switcher ── */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => { setTab("manual"); setMessage(""); }}
          className={`flex-1 rounded-xl p-3 font-bold transition ${
            tab === "manual" ? "bg-violet-600 text-white shadow-lg" : "bg-white/80 text-slate-700"
          }`}
        >
          ✏️ Soan tay
        </button>
        <button
          onClick={() => { setTab("upload"); setMessage(""); }}
          className={`flex-1 rounded-xl p-3 font-bold transition ${
            tab === "upload" ? "bg-fuchsia-600 text-white shadow-lg" : "bg-white/80 text-slate-700"
          }`}
        >
          📁 Tai file len
        </button>
      </div>

      {/* ═══════════════════ MANUAL TAB ═══════════════════ */}
      {tab === "manual" && (
        <form onSubmit={submitManual} className="space-y-3">
          {/* Formula toolbar */}
          <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
            <button
              type="button"
              onClick={() => setShowToolbar(!showToolbar)}
              className="flex w-full items-center justify-between"
            >
              <span className="text-sm font-bold text-violet-700">
                🧪 Cong cu cong thuc hoa hoc {showToolbar ? "▲" : "▼"}
              </span>
              <span className="text-xs text-slate-400">Bam o nhap → bam cong thuc</span>
            </button>
            {showToolbar && (
              <div className="mt-2">
                <FormulaToolbar onInsert={handleInsert} />
              </div>
            )}
          </div>

          {/* Type selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("true-false")}
              className={`flex-1 rounded-xl p-3 font-bold transition ${
                type === "true-false"
                  ? "bg-violet-600 text-white shadow-lg"
                  : "bg-white/80 text-slate-700"
              }`}
            >
              📝 Cau don
            </button>
            <button
              type="button"
              onClick={() => setType("multi-true-false")}
              className={`flex-1 rounded-xl p-3 font-bold transition ${
                type === "multi-true-false"
                  ? "bg-fuchsia-600 text-white shadow-lg"
                  : "bg-white/80 text-slate-700"
              }`}
            >
              📋 Cau 4 y
            </button>
          </div>

          {/* ── Input form ── */}
          <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
            {type === "true-false" ? (
              /* ── Single True/False ── */
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-slate-600">Menh de:</label>
                  <input
                    ref={refCallback("tfStatement") as React.RefCallback<HTMLInputElement>}
                    onFocus={() => handleFocus("tfStatement")}
                    value={tfStatement}
                    onChange={(e) => setTfStatement(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-violet-400 focus:outline-none"
                    placeholder="Vi du: Glucose co cong thuc C6H12O6."
                  />
                  {tfStatement && (
                    <div className="mt-1 rounded-lg bg-violet-50 p-2 text-sm">
                      <span className="text-xs text-slate-400">Xem truoc: </span>
                      <ChemText text={tfStatement} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600">Dap an dung:</label>
                  <select
                    value={tfCorrect ? "true" : "false"}
                    onChange={(e) => setTfCorrect(e.target.value === "true")}
                    className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3"
                  >
                    <option value="true">✅ Dung</option>
                    <option value="false">❌ Sai</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600">Giai thich:</label>
                  <textarea
                    ref={refCallback("tfExplanation") as React.RefCallback<HTMLTextAreaElement>}
                    onFocus={() => handleFocus("tfExplanation")}
                    value={tfExplanation}
                    onChange={(e) => setTfExplanation(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-violet-400 focus:outline-none"
                    placeholder="Giai thich ngan gon ve dap an"
                    rows={2}
                  />
                  {tfExplanation && (
                    <div className="mt-1 rounded-lg bg-violet-50 p-2 text-sm">
                      <span className="text-xs text-slate-400">Xem truoc: </span>
                      <ChemText text={tfExplanation} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Multi True/False (4 ý) ── */
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-slate-600">Cau hoi:</label>
                  <input
                    ref={refCallback("mtfQuestion") as React.RefCallback<HTMLInputElement>}
                    onFocus={() => handleFocus("mtfQuestion")}
                    value={mtfQuestion}
                    onChange={(e) => setMtfQuestion(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-violet-400 focus:outline-none"
                    placeholder="Cho cac nhan dinh sau:"
                  />
                </div>

                {stmts.map((s, i) => {
                  const label = ["a", "b", "c", "d"][i];
                  return (
                    <div key={i} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-violet-700">{label}.</span>
                        <input
                          ref={refCallback(`stmt-${i}`) as React.RefCallback<HTMLInputElement>}
                          onFocus={() => handleFocus(`stmt-${i}`)}
                          value={s.text}
                          onChange={(e) => updateStmt(i, "text", e.target.value)}
                          className="flex-1 rounded-lg border-2 border-slate-200 p-2 focus:border-violet-400 focus:outline-none"
                          placeholder={`Noi dung y ${label}...`}
                        />
                        <select
                          value={s.correct ? "true" : "false"}
                          onChange={(e) => updateStmt(i, "correct", e.target.value === "true")}
                          className="rounded-lg border-2 border-slate-200 p-2 text-sm"
                        >
                          <option value="true">✅ D</option>
                          <option value="false">❌ S</option>
                        </select>
                      </div>
                      {s.text && (
                        <div className="mt-1 rounded-lg bg-violet-50 p-2 text-sm">
                          <ChemText text={`${label}. ${s.text}`} />
                          <span className="ml-2 text-xs">
                            {s.correct ? "✅ Dung" : "❌ Sai"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div>
                  <label className="text-sm font-bold text-slate-600">Giai thich chung:</label>
                  <textarea
                    ref={refCallback("mtfExplanation") as React.RefCallback<HTMLTextAreaElement>}
                    onFocus={() => handleFocus("mtfExplanation")}
                    value={mtfExplanation}
                    onChange={(e) => setMtfExplanation(e.target.value)}
                    className="mt-1 w-full rounded-xl border-2 border-slate-200 p-3 focus:border-violet-400 focus:outline-none"
                    placeholder="Giai thich cho ca 4 y"
                    rows={2}
                  />
                  {mtfExplanation && (
                    <div className="mt-1 rounded-lg bg-violet-50 p-2 text-sm">
                      <span className="text-xs text-slate-400">Xem truoc: </span>
                      <ChemText text={mtfExplanation} />
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-lg font-bold text-white shadow-lg"
            >
              💾 Luu cau hoi
            </button>
            {message && (
              <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-sm font-semibold text-emerald-700">
                {message}
              </p>
            )}
          </div>

          {/* Existing questions list */}
          <CustomQuestionList
            customTf={customTf}
            customMtf={customMtf}
            onRemoveTf={removeTf}
            onRemoveMtf={removeMtf}
          />
        </form>
      )}

      {/* ═══════════════════ UPLOAD TAB ═══════════════════ */}
      {tab === "upload" && (
        <div className="space-y-3">
          {/* Download template */}
          <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
            <h3 className="text-lg font-black text-violet-700">📄 Buoc 1: Tai mau file</h3>
            <p className="mt-1 text-sm text-slate-600">
              Tai mau, mo bang Word hoac Notepad, soan cau hoi theo format, luu thanh .txt (UTF-8), roi tai len.
            </p>
            <a
              href="/mau-cau-hoi.txt"
              download="mau-cau-hoi.txt"
              className="mt-3 inline-block rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-bold text-white shadow-lg"
            >
              ⬇️ Tai mau cau hoi (.txt)
            </a>
          </div>

          {/* Format guide */}
          <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
            <h3 className="font-black text-violet-700">📋 Huong dan format</h3>
            <div className="mt-2 space-y-2 text-sm">
              <div className="rounded-lg bg-violet-50 p-3">
                <p className="font-bold text-violet-700">Cau don Dung/Sai:</p>
                <code className="mt-1 block rounded bg-white p-2 text-xs text-slate-700">
                  [DUNG] H2SO4 la acid manh. | Vi H2SO4 phan li hoan toan.
                </code>
                <code className="mt-1 block rounded bg-white p-2 text-xs text-slate-700">
                  [SAI] Fructose la aldose. | Fructose la ketose.
                </code>
              </div>

              <div className="rounded-lg bg-fuchsia-50 p-3">
                <p className="font-bold text-fuchsia-700">Cau 4 y (giua 2 dau ---):</p>
                <pre className="mt-1 whitespace-pre-wrap rounded bg-white p-2 text-xs text-slate-700">
{`---
Cho cac nhan dinh sau:
a. [DUNG] Glucose la aldohexose.
b. [SAI] Fructose la aldose.
c. [SAI] Sucrose co tinh khu.
d. [DUNG] Maltose co tinh khu.
Giai thich: Fructose la ketose.
---`}
                </pre>
              </div>

              <div className="rounded-lg bg-amber-50 p-3">
                <p className="font-bold text-amber-700">Cong thuc hoa hoc:</p>
                <p>• Chi so duoi: go binh thuong → H2SO4 hien thi <ChemText text="H2SO4" /></p>
                <p>• Chi so tren: dung ^{"{...}"} → Fe^{"{2+}"} hien thi <ChemText text="Fe^{2+}" /></p>
                <p>• Mui ten: {"->"}  hien thi <ChemText text="->" /> | {"<->"}  hien thi <ChemText text="<->" /></p>
              </div>
            </div>
          </div>

          {/* Upload area */}
          <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
            <h3 className="text-lg font-black text-violet-700">📁 Buoc 2: Tai file len</h3>
            <div
              className="mt-3 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 p-6 transition hover:bg-violet-100"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={handleDrop}
            >
              <p className="text-4xl">📁</p>
              <p className="mt-2 font-bold text-violet-700">Keo tha file vao day</p>
              <p className="text-sm text-slate-500">hoac bam de chon file (.txt)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {uploadMsg && (
              <p className="mt-2 rounded-lg bg-violet-100 p-2 text-sm font-bold text-violet-700">
                {uploadMsg}
              </p>
            )}

            {/* Preview parsed data */}
            {parsedData && (
              <div className="mt-3 space-y-2">
                <h4 className="font-bold text-slate-700">👀 Xem truoc cau hoi:</h4>

                {parsedData.trueFalse.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-violet-600">
                      Cau don ({parsedData.trueFalse.length}):
                    </p>
                    {parsedData.trueFalse.map((q, i) => (
                      <div key={i} className="mt-1 rounded-lg bg-slate-50 p-2 text-sm">
                        <span className={q.correct ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                          [{q.correct ? "D" : "S"}]
                        </span>{" "}
                        <ChemText text={q.statement} />
                        {q.explanation && (
                          <p className="mt-1 text-xs italic text-slate-400">
                            GT: <ChemText text={q.explanation} />
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {parsedData.multiTrueFalse.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-fuchsia-600">
                      Cau 4 y ({parsedData.multiTrueFalse.length}):
                    </p>
                    {parsedData.multiTrueFalse.map((q, i) => (
                      <div key={i} className="mt-1 rounded-lg bg-slate-50 p-2 text-sm">
                        <p className="font-medium"><ChemText text={q.question} /></p>
                        {q.statements.map((s, j) => (
                          <p key={j} className="ml-3">
                            <span className={s.correct ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                              [{s.correct ? "D" : "S"}]
                            </span>{" "}
                            {s.label} <ChemText text={s.text} />
                          </p>
                        ))}
                        {q.explanation && (
                          <p className="mt-1 text-xs italic text-slate-400">
                            GT: <ChemText text={q.explanation} />
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={importAll}
                  className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-3 text-lg font-bold text-white shadow-lg"
                >
                  📥 Nhap tat ca {(parsedData.trueFalse.length + parsedData.multiTrueFalse.length)} cau hoi
                </button>
              </div>
            )}
          </div>

          {message && (
            <p className="rounded-lg bg-emerald-50 p-2 text-sm font-semibold text-emerald-700">
              {message}
            </p>
          )}

          {/* Existing questions list */}
          <CustomQuestionList
            customTf={customTf}
            customMtf={customMtf}
            onRemoveTf={removeTf}
            onRemoveMtf={removeMtf}
          />
        </div>
      )}
    </GameShell>
  );
}

/* ════════════════════════════════════════════════════════
 * Mini component: List existing custom questions with delete
 * ════════════════════════════════════════════════════════ */
function CustomQuestionList({
  customTf,
  customMtf,
  onRemoveTf,
  onRemoveMtf,
}: {
  customTf: { id: string; statement: string; correct: boolean; explanation: string }[];
  customMtf: {
    id: string;
    question: string;
    statements: { id: string; label: string; text: string; correct: boolean }[];
    explanation: string;
  }[];
  onRemoveTf: (id: string) => void;
  onRemoveMtf: (id: string) => void;
}) {
  if (customTf.length === 0 && customMtf.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
      <h3 className="font-black text-violet-700">
        📚 Cau hoi da tao ({customTf.length + customMtf.length})
      </h3>

      {customTf.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold text-slate-500">
            Cau don ({customTf.length}):
          </p>
          {customTf.map((q) => (
            <div
              key={q.id}
              className="mt-1 flex items-start justify-between rounded-lg bg-slate-50 p-2"
            >
              <div className="flex-1 text-sm">
                <span className={q.correct ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                  [{q.correct ? "Đ" : "S"}]
                </span>{" "}
                <ChemText text={q.statement} />
                <p className="mt-0.5 text-xs italic text-slate-400">
                  <ChemText text={q.explanation} />
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveTf(q.id)}
                className="ml-2 rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-100 hover:text-rose-700"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {customMtf.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold text-slate-500">
            Cau 4 y ({customMtf.length}):
          </p>
          {customMtf.map((q) => (
            <div key={q.id} className="mt-1 rounded-lg bg-slate-50 p-2">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium"><ChemText text={q.question} /></p>
                <button
                  type="button"
                  onClick={() => onRemoveMtf(q.id)}
                  className="ml-2 rounded-lg px-2 py-1 text-xs text-rose-500 hover:bg-rose-100 hover:text-rose-700"
                >
                  🗑️
                </button>
              </div>
              {q.statements.map((s) => (
                <p key={s.id} className="ml-3 text-xs">
                  <span className={s.correct ? "font-bold text-emerald-600" : "font-bold text-rose-600"}>
                    [{s.correct ? "Đ" : "S"}]
                  </span>{" "}
                  {s.label} <ChemText text={s.text} />
                </p>
              ))}
              <p className="mt-0.5 text-xs italic text-slate-400">
                <ChemText text={q.explanation} />
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

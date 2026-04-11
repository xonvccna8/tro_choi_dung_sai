import { useState } from "react";
import type { FormEvent } from "react";
import { GameShell } from "../components/GameShell";
import { useGameStore } from "../store/useGameStore";

export function QuestionBuilderPage() {
  const addTf = useGameStore((s) => s.addCustomTrueFalseQuestion);
  const addMtf = useGameStore((s) => s.addCustomMultiTrueFalseQuestion);
  const [type, setType] = useState<"true-false" | "multi-true-false">("true-false");
  const [message, setMessage] = useState("");

  const [tfStatement, setTfStatement] = useState("");
  const [tfCorrect, setTfCorrect] = useState(true);
  const [tfExplanation, setTfExplanation] = useState("");

  const [aText, setAText] = useState("");
  const [aCorrect, setACorrect] = useState(true);
  const [bText, setBText] = useState("");
  const [bCorrect, setBCorrect] = useState(true);
  const [cText, setCText] = useState("");
  const [cCorrect, setCCorrect] = useState(false);
  const [dText, setDText] = useState("");
  const [dCorrect, setDCorrect] = useState(true);
  const [mtfExplanation, setMtfExplanation] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (type === "true-false") {
      if (!tfStatement.trim()) return;
      addTf({
        id: `custom-tf-${Date.now()}`,
        type: "true-false",
        statement: tfStatement.trim(),
        correct: tfCorrect,
        explanation: tfExplanation.trim() || "Giai thich bo sung tu giao vien.",
      });
      setMessage("Da tao cau Dung/Sai thanh cong.");
      setTfStatement("");
      setTfExplanation("");
      return;
    }

    if (!aText.trim() || !bText.trim() || !cText.trim() || !dText.trim()) return;
    addMtf({
      id: `custom-mtf-${Date.now()}`,
      type: "multi-true-false",
      question: "Cho cac nhan dinh sau:",
      statements: [
        { id: "a", label: "a.", text: aText.trim(), correct: aCorrect },
        { id: "b", label: "b.", text: bText.trim(), correct: bCorrect },
        { id: "c", label: "c.", text: cText.trim(), correct: cCorrect },
        { id: "d", label: "d.", text: dText.trim(), correct: dCorrect },
      ],
      explanation: mtfExplanation.trim() || "Giai thich bo sung tu giao vien.",
    });
    setMessage("Da tao cau 4 y Dung/Sai thanh cong.");
    setAText("");
    setBText("");
    setCText("");
    setDText("");
    setMtfExplanation("");
  };

  return (
    <GameShell title="Tao Cau Hoi" subtitle="Nhap cau hoi H12 co cong thuc dep: H2SO4, CO2, C6H12O6">
      <form onSubmit={submit} className="rounded-3xl bg-white/95 p-4 shadow-xl">
        <div className="mb-3 flex gap-2">
          <button type="button" className="rounded-xl bg-violet-600 px-3 py-2 text-white" onClick={() => setType("true-false")}>Cau don</button>
          <button type="button" className="rounded-xl bg-fuchsia-600 px-3 py-2 text-white" onClick={() => setType("multi-true-false")}>Cau 4 y</button>
        </div>

        {type === "true-false" ? (
          <div className="space-y-2">
            <input value={tfStatement} onChange={(e) => setTfStatement(e.target.value)} className="w-full rounded-xl border p-3" placeholder="Vi du: Glucose co cong thuc C6H12O6." />
            <select value={tfCorrect ? "true" : "false"} onChange={(e) => setTfCorrect(e.target.value === "true")} className="w-full rounded-xl border p-3">
              <option value="true">Dap an dung: Dung</option>
              <option value="false">Dap an dung: Sai</option>
            </select>
            <textarea value={tfExplanation} onChange={(e) => setTfExplanation(e.target.value)} className="w-full rounded-xl border p-3" placeholder="Giai thich ngan gon" />
          </div>
        ) : (
          <div className="space-y-2">
            <input value={aText} onChange={(e) => setAText(e.target.value)} className="w-full rounded-xl border p-3" placeholder="a. ..." />
            <select value={aCorrect ? "true" : "false"} onChange={(e) => setACorrect(e.target.value === "true")} className="w-full rounded-xl border p-3"><option value="true">a. Dung</option><option value="false">a. Sai</option></select>
            <input value={bText} onChange={(e) => setBText(e.target.value)} className="w-full rounded-xl border p-3" placeholder="b. ..." />
            <select value={bCorrect ? "true" : "false"} onChange={(e) => setBCorrect(e.target.value === "true")} className="w-full rounded-xl border p-3"><option value="true">b. Dung</option><option value="false">b. Sai</option></select>
            <input value={cText} onChange={(e) => setCText(e.target.value)} className="w-full rounded-xl border p-3" placeholder="c. ..." />
            <select value={cCorrect ? "true" : "false"} onChange={(e) => setCCorrect(e.target.value === "true")} className="w-full rounded-xl border p-3"><option value="true">c. Dung</option><option value="false">c. Sai</option></select>
            <input value={dText} onChange={(e) => setDText(e.target.value)} className="w-full rounded-xl border p-3" placeholder="d. ..." />
            <select value={dCorrect ? "true" : "false"} onChange={(e) => setDCorrect(e.target.value === "true")} className="w-full rounded-xl border p-3"><option value="true">d. Dung</option><option value="false">d. Sai</option></select>
            <textarea value={mtfExplanation} onChange={(e) => setMtfExplanation(e.target.value)} className="w-full rounded-xl border p-3" placeholder="Giai thich cho cau 4 y" />
          </div>
        )}

        <button type="submit" className="mt-3 w-full rounded-xl bg-emerald-500 p-3 font-bold text-white">Luu cau hoi</button>
        {message && <p className="mt-2 rounded-lg bg-emerald-100 p-2 text-sm">{message}</p>}
      </form>
    </GameShell>
  );
}

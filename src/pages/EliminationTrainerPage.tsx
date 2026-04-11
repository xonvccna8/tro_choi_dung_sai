import { useMemo, useState } from "react";
import { ChemText } from "../components/ChemText";
import { GameShell } from "../components/GameShell";
import { StarBlast } from "../components/Effects";
import { multiTrueFalseQuestions } from "../data/questions";
import { useGameStore } from "../store/useGameStore";
import { calcRealScore, scoreLabel } from "../types";
import type { ErrorRecord } from "../types";
import { playCorrect, playWrong } from "../utils/sound";

type Confidence = "sure" | "unsure" | "none";
type Phase = "mark" | "focus" | "result";

export function EliminationTrainerPage() {
  const { addGold, addExp, addErrors, addPerfect, soundOn, customMultiTrueFalseQuestions } = useGameStore();
  const pool = useMemo(
    () => [...customMultiTrueFalseQuestions, ...multiTrueFalseQuestions],
    [customMultiTrueFalseQuestions],
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("mark");
  const [confidence, setConfidence] = useState<Record<string, Confidence>>({});
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [stars, setStars] = useState(0);
  const [message, setMessage] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [totalQ, setTotalQ] = useState(0);

  const q = pool[index % pool.length];

  const toggleConfidence = (sId: string) => {
    setConfidence((p) => {
      const cur = p[sId] || "none";
      if (cur === "none") return { ...p, [sId]: "sure" };
      if (cur === "sure") return { ...p, [sId]: "unsure" };
      return { ...p, [sId]: "none" };
    });
  };

  const goToFocus = () => {
    setPhase("focus");
  };

  const setAnswer = (sId: string, val: boolean) => {
    setAnswers((p) => ({ ...p, [sId]: val }));
  };

  const checkResult = () => {
    const cc = q.statements.filter((s) => answers[s.id] === s.correct).length;
    const score = calcRealScore(cc);
    const goldMap: Record<number, number> = { 0: 0, 1: 10, 2: 25, 3: 50, 4: 150 };
    const gold = goldMap[cc] ?? 0;
    addGold(gold);
    addExp(cc * 10);
    if (cc === 4) addPerfect();

    // Track errors
    const errs: ErrorRecord[] = q.statements
      .filter((s) => answers[s.id] !== s.correct)
      .map((s) => ({
        id: `err-elim-${Date.now()}-${s.id}`,
        statementText: s.text,
        userAnswer: answers[s.id] ?? !s.correct,
        correctAnswer: s.correct,
        explanation: q.explanation,
        questionId: q.id,
        date: new Date().toISOString(),
      }));
    if (errs.length) addErrors(errs);

    // Check confident-but-wrong
    const confidentWrong = q.statements.filter(
      (s) => confidence[s.id] === "sure" && answers[s.id] !== s.correct,
    ).length;

    if (cc >= 3) {
      playCorrect(soundOn);
      setStars((v) => v + 1);
    } else {
      playWrong(soundOn);
    }

    let msg = scoreLabel(cc) + ` → +${gold} gold`;
    if (confidentWrong > 0) {
      msg += `\n🚨 Ban CHAC CHAN nhung lai SAI ${confidentWrong} y! Can on lai kien thuc nay.`;
    }
    if (cc === 4) {
      msg += "\n🎉 Phuong phap loai tru hieu qua!";
    }

    setTotalScore((s) => s + score);
    setTotalQ((n) => n + 1);
    setMessage(msg);
    setPhase("result");
  };

  const nextQuestion = () => {
    setIndex((i) => i + 1);
    setPhase("mark");
    setConfidence({});
    setAnswers({});
    setMessage("");
  };

  const sureCount = Object.values(confidence).filter((c) => c === "sure").length;
  const unsureCount = Object.values(confidence).filter((c) => c === "unsure").length;

  return (
    <GameShell title="🎯 Luyen Loai Tru" subtitle="Phuong phap 2 vong: Chac chan → Tap trung">
      {/* Stats bar */}
      {totalQ > 0 && (
        <div className="mb-3 rounded-2xl bg-white/90 p-2 text-center text-sm">
          <span>
            Da lam: <b>{totalQ}</b> cau
          </span>
          <span className="ml-3">
            TB: <b>{(totalScore / totalQ).toFixed(2)}</b>d/cau
          </span>
          <span className="ml-3">
            Tong: <b>{totalScore.toFixed(2)}</b>d
          </span>
        </div>
      )}

      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        {/* Strategy guide */}
        <div className="mb-3 rounded-xl bg-violet-50 p-3 text-sm">
          <p className="font-bold text-violet-700">💡 Chien thuat Loai Tru:</p>
          <p>
            <b>Vong 1:</b> Danh dau y ban <span className="font-bold text-emerald-600">CHAC CHAN</span> biet va y{" "}
            <span className="font-bold text-amber-600">CHUA CHAC</span>
          </p>
          <p>
            <b>Vong 2:</b> Tap trung toan bo suy nghi vao y CHUA CHAC
          </p>
        </div>

        <p className="font-medium">
          <ChemText text={q.question} />
        </p>

        {/* PHASE: MARK */}
        {phase === "mark" && (
          <>
            <p className="mt-2 text-sm font-bold text-violet-600">Vong 1: Phan loai do tu tin (bam de doi)</p>
            <div className="mt-2 space-y-2">
              {q.statements.map((s) => {
                const conf = confidence[s.id] || "none";
                const bg =
                  conf === "sure"
                    ? "bg-emerald-100 border-emerald-400"
                    : conf === "unsure"
                      ? "bg-amber-100 border-amber-400"
                      : "bg-slate-50 border-slate-200";
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleConfidence(s.id)}
                    className={`w-full rounded-xl border-2 p-3 text-left transition ${bg}`}
                  >
                    <p className="font-medium">
                      {s.label} <ChemText text={s.text} />
                    </p>
                    <p className="mt-1 text-xs">
                      {conf === "sure" && "🟢 Chac chan"}
                      {conf === "unsure" && "🟡 Chua chac"}
                      {conf === "none" && "⚪ Chua phan loai"}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Chac chan: {sureCount} | Chua chac: {unsureCount}
            </p>
            <button
              onClick={goToFocus}
              className="mt-3 w-full rounded-xl bg-violet-600 p-3 font-bold text-white"
            >
              Sang Vong 2 →
            </button>
          </>
        )}

        {/* PHASE: FOCUS */}
        {phase === "focus" && (
          <>
            <p className="mt-2 text-sm font-bold text-fuchsia-600">Vong 2: Chon Dung/Sai cho tung y</p>
            <div className="mt-2 space-y-2">
              {q.statements.map((s) => {
                const conf = confidence[s.id] || "none";
                const isFocused = conf === "unsure" || conf === "none";
                const chosen = answers[s.id];
                return (
                  <div
                    key={s.id}
                    className={`rounded-xl p-3 ${isFocused ? "bg-amber-50 ring-2 ring-amber-300" : "bg-slate-50"}`}
                  >
                    {isFocused && <span className="text-xs font-bold text-amber-600">⚡ TAP TRUNG Y NAY</span>}
                    {!isFocused && <span className="text-xs text-emerald-600">✓ Y tu tin</span>}
                    <p className="font-medium">
                      {s.label} <ChemText text={s.text} />
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setAnswer(s.id, true)}
                        className={`flex-1 rounded-lg py-2 font-bold text-white ${chosen === true ? "bg-emerald-700 ring-2 ring-emerald-300" : "bg-emerald-500"}`}
                      >
                        Dung
                      </button>
                      <button
                        onClick={() => setAnswer(s.id, false)}
                        className={`flex-1 rounded-lg py-2 font-bold text-white ${chosen === false ? "bg-rose-700 ring-2 ring-rose-300" : "bg-rose-500"}`}
                      >
                        Sai
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={checkResult}
              className="mt-3 w-full rounded-xl bg-fuchsia-600 p-3 font-bold text-white"
            >
              ✅ Kiem tra ket qua
            </button>
          </>
        )}

        {/* PHASE: RESULT */}
        {phase === "result" && (
          <>
            <div className="mt-2 space-y-1">
              {q.statements.map((s) => {
                const isCorrect = answers[s.id] === s.correct;
                const conf = confidence[s.id] || "none";
                return (
                  <div
                    key={s.id}
                    className={`rounded-lg p-2 ${isCorrect ? "bg-emerald-100" : "bg-rose-100"}`}
                  >
                    <p className="text-sm">
                      {isCorrect ? "✅" : "❌"} {s.label} <ChemText text={s.text} />
                    </p>
                    <p className="text-xs text-slate-500">
                      Dap an: <b>{s.correct ? "Dung" : "Sai"}</b>
                      {!isCorrect && conf === "sure" && (
                        <span className="font-bold text-rose-600"> ← CHAC nhung SAI!</span>
                      )}
                      {!isCorrect && (conf === "unsure" || conf === "none") && (
                        <span className="text-amber-600"> ← Y chua chac - can on them</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-sm italic text-slate-600">
              <ChemText text={q.explanation} />
            </p>
            {message &&
              message.split("\n").map((line, i) => (
                <p key={i} className="mt-1 rounded-lg bg-violet-100 p-2 text-sm font-bold text-violet-700">
                  {line}
                </p>
              ))}
            <button
              onClick={nextQuestion}
              className="mt-3 w-full rounded-xl bg-violet-600 p-3 font-bold text-white"
            >
              Cau tiep →
            </button>
          </>
        )}
        <StarBlast trigger={stars} />
      </div>
    </GameShell>
  );
}

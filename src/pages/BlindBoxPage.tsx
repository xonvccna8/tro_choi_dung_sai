import { useState } from "react";
import { ChemText } from "../components/ChemText";
import { GameShell } from "../components/GameShell";
import { multiTrueFalseQuestions } from "../data/questions";
import { useGameStore } from "../store/useGameStore";
import { scoreLabel } from "../types";
import type { ErrorRecord } from "../types";
import { playCorrect, playReward, playWrong } from "../utils/sound";

const rewards = ["Pet Mini Dragon", "Skin Pirate Neon", "Sticker Gold Star", "Title: Vua Dung/Sai"];

export function BlindBoxPage() {
  const addCollection = useGameStore((s) => s.addCollection);
  const addGold = useGameStore((s) => s.addGold);
  const addErrors = useGameStore((s) => s.addErrors);
  const addPerfect = useGameStore((s) => s.addPerfect);
  const soundOn = useGameStore((s) => s.soundOn);
  const customMultiTrueFalseQuestions = useGameStore((s) => s.customMultiTrueFalseQuestions);
  const [progress, setProgress] = useState(0);
  const [opened, setOpened] = useState<string>("");
  const [resultMessage, setResultMessage] = useState("");
  const pool = [...customMultiTrueFalseQuestions, ...multiTrueFalseQuestions];
  const q = pool[progress % pool.length];
  const [answerMap, setAnswerMap] = useState<Record<string, boolean>>({});

  const submit = () => {
    const correctCount = q.statements.filter((s) => answerMap[s.id] === s.correct).length;
    const goldMap: Record<number, number> = { 0: 0, 1: 10, 2: 25, 3: 40, 4: 100 };
    const gold = goldMap[correctCount] ?? 0;
    addGold(gold);
    if (correctCount === 4) addPerfect();

    // Track errors
    const errs: ErrorRecord[] = q.statements
      .filter((s) => answerMap[s.id] !== s.correct)
      .map((s) => ({
        id: `err-box-${Date.now()}-${s.id}`,
        statementText: s.text,
        userAnswer: answerMap[s.id] ?? !s.correct,
        correctAnswer: s.correct,
        explanation: q.explanation,
        questionId: q.id,
        date: new Date().toISOString(),
      }));
    if (errs.length) addErrors(errs);

    if (correctCount >= 3) {
      setProgress((p) => p + 1);
      playCorrect(soundOn);
      setResultMessage(`${scoreLabel(correctCount)} +${gold} gold.`);
      setAnswerMap({});
    } else {
      playWrong(soundOn);
      setResultMessage(`${scoreLabel(correctCount)} +${gold} gold. Can tu 3/4 de tien!`);
    }
  };

  const openBox = () => {
    if (progress >= 3) {
      const item = rewards[Math.floor(Math.random() * rewards.length)];
      addCollection(item);
      setOpened(item);
      setProgress(0);
      setAnswerMap({});
      playReward(soundOn);
    }
  };

  return (
    <GameShell title="Blind Box" subtitle="Hoan thanh 3 cau 4 y Dung/Sai de nhan ve">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        <p className="font-bold">Tien do: {progress}/3</p>
        <p className="mt-2"><ChemText text={q.question} /></p>
        {q.statements.map((s) => (
          <div key={s.id} className="mt-2 rounded-xl bg-slate-100 p-3">
            <p>{s.label} <ChemText text={s.text} /></p>
            <div className="mt-1 flex gap-2">
              <button onClick={() => setAnswerMap((v) => ({ ...v, [s.id]: true }))} className="rounded-lg bg-emerald-500 px-3 py-1 text-white">Dung</button>
              <button onClick={() => setAnswerMap((v) => ({ ...v, [s.id]: false }))} className="rounded-lg bg-rose-500 px-3 py-1 text-white">Sai</button>
            </div>
          </div>
        ))}
        <button onClick={submit} className="mt-3 w-full rounded-xl bg-violet-600 p-3 font-bold text-white">Nop bai</button>
        <button onClick={openBox} className="mt-2 w-full rounded-xl bg-gradient-to-r from-yellow-300 to-pink-300 p-3 font-black">Khui hop</button>
        {resultMessage && <p className="mt-2 rounded-lg bg-violet-100 p-2 text-sm font-semibold text-violet-700">{resultMessage}</p>}
        {opened && <p className="mt-2 rounded-lg bg-amber-100 p-2">Ban nhan duoc: {opened}</p>}
      </div>
    </GameShell>
  );
}

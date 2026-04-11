import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChemText } from "../components/ChemText";
import { GameShell } from "../components/GameShell";
import { trueFalseQuestions } from "../data/questions";
import { useGameStore } from "../store/useGameStore";
import { playCorrect, playWrong } from "../utils/sound";

export function EndlessRunPage() {
  const addGold = useGameStore((s) => s.addGold);
  const addExp = useGameStore((s) => s.addExp);
  const soundOn = useGameStore((s) => s.soundOn);
  const customTrueFalseQuestions = useGameStore((s) => s.customTrueFalseQuestions);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lane, setLane] = useState<"left" | "right">("right");
  const [resultMessage, setResultMessage] = useState("");
  const list = useMemo(
    () => [...customTrueFalseQuestions, ...trueFalseQuestions, ...customTrueFalseQuestions, ...trueFalseQuestions],
    [customTrueFalseQuestions],
  );
  const q = list[index % list.length];

  const choose = (value: boolean) => {
    if (value === q.correct) {
      setScore((s) => s + 1);
      addGold(15);
      addExp(10);
      playCorrect(soundOn);
      setResultMessage("Chinh xac! +15 gold");
    } else {
      playWrong(soundOn);
      setResultMessage("Sai roi, co len!");
    }
    setLane(value ? "right" : "left");
    setIndex((i) => i + 1);
  };

  return (
    <GameShell title="Duong Chay Vo Cuc" subtitle="Trai = Sai, Phai = Dung">
      <div className="rounded-3xl bg-white/95 p-5 shadow-xl">
        <p className="text-sm text-slate-500">Diem: {score}</p>
        <div className="relative mt-3 h-16 overflow-hidden rounded-2xl bg-slate-900">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#1f2937_0%,#1f2937_70%,#374151_100%)]" />
          <motion.div
            className="absolute top-3 text-3xl"
            animate={{ left: lane === "left" ? "20%" : "70%", y: [0, -4, 0] }}
            transition={{ duration: 0.22 }}
          >
            🏃
          </motion.div>
        </div>
        <div className="mt-3 rounded-2xl bg-cyan-100 p-4 text-lg font-bold"><ChemText text={q.statement} /></div>
        {resultMessage && <p className="mt-2 rounded-lg bg-slate-100 p-2 text-sm font-semibold text-slate-700">{resultMessage}</p>}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="rounded-2xl bg-rose-500 p-4 text-xl font-black text-white" onClick={() => choose(false)}>
            ⬅ Sai
          </button>
          <button className="rounded-2xl bg-emerald-500 p-4 text-xl font-black text-white" onClick={() => choose(true)}>
            Dung ➡
          </button>
        </div>
      </div>
    </GameShell>
  );
}

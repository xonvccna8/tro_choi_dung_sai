import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChemText } from "../components/ChemText";
import { GameShell } from "../components/GameShell";
import { QuestionBankNotice } from "../components/QuestionBankNotice";
import { useQuestionBank } from "../hooks/useQuestionBank";
import { filterTrueFalseQuestionsByMode } from "../lib/questionBank";
import { useGameStore } from "../store/useGameStore";
import { playCorrect, playWrong } from "../utils/sound";

export function EndlessRunPage() {
  const addGold = useGameStore((s) => s.addGold);
  const addExp = useGameStore((s) => s.addExp);
  const soundOn = useGameStore((s) => s.soundOn);
  const { questions, loading, error, isConfigured } = useQuestionBank();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lane, setLane] = useState<"left" | "right">("right");
  const [resultMessage, setResultMessage] = useState("");
  const list = useMemo(() => {
    const baseQuestions = filterTrueFalseQuestionsByMode(questions, "run");
    return baseQuestions.length > 0 ? [...baseQuestions, ...baseQuestions] : [];
  }, [questions]);

  if (!isConfigured) {
    return (
      <GameShell title="Đường Chạy Vô Cực" subtitle="Trái = Sai, Phải = Đúng">
        <QuestionBankNotice
          title="Firebase chưa sẵn sàng"
          description="Game này đã chuyển sang dùng ngân hàng câu hỏi Firebase. Hãy cấu hình Firebase rồi tạo câu hỏi Đúng/Sai đơn cho Đường Chạy Vô Cực."
          tone="amber"
        />
      </GameShell>
    );
  }

  if (loading) {
    return (
      <GameShell title="Đường Chạy Vô Cực" subtitle="Trái = Sai, Phải = Đúng">
        <QuestionBankNotice
          title="Đang đồng bộ câu hỏi"
          description="Hệ thống đang tải câu hỏi từ Firebase cho Đường Chạy Vô Cực."
          hideAction
        />
      </GameShell>
    );
  }

  if (error) {
    return (
      <GameShell title="Đường Chạy Vô Cực" subtitle="Trái = Sai, Phải = Đúng">
        <QuestionBankNotice title="Không tải được câu hỏi" description={error} tone="rose" />
      </GameShell>
    );
  }

  if (list.length === 0) {
    return (
      <GameShell title="Đường Chạy Vô Cực" subtitle="Trái = Sai, Phải = Đúng">
        <QuestionBankNotice
          title="Chưa có câu hỏi cho Đường Chạy Vô Cực"
          description="Hãy tạo ít nhất 1 câu Đúng/Sai đơn và gắn nó cho game Đường Chạy Vô Cực trong trình tạo câu hỏi."
        />
      </GameShell>
    );
  }

  const q = list[index % list.length];

  const choose = (value: boolean) => {
    if (value === q.correct) {
      setScore((s) => s + 1);
      addGold(15);
      addExp(10);
      playCorrect(soundOn);
      setResultMessage("Chính xác! +15 vàng");
    } else {
      playWrong(soundOn);
      setResultMessage("Sai rồi, cố lên!");
    }
    setLane(value ? "right" : "left");
    setIndex((i) => i + 1);
  };

  return (
    <GameShell title="Đường Chạy Vô Cực" subtitle="Trái = Sai, Phải = Đúng">
      <div className="rounded-3xl bg-white/95 p-5 shadow-xl">
        <p className="text-sm text-slate-500">Điểm: {score}</p>
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
            Đúng ➡
          </button>
        </div>
      </div>
    </GameShell>
  );
}

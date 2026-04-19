import { useState } from "react";
import { ChemText } from "../components/ChemText";
import { RichContentBlock } from "../components/RichContent";
import { GameShell } from "../components/GameShell";
import { QuestionBankNotice } from "../components/QuestionBankNotice";
import { useQuestionBank } from "../hooks/useQuestionBank";
import { filterMultiTrueFalseQuestionsByMode } from "../lib/questionBank";
import { useGameStore } from "../store/useGameStore";
import { scoreLabel } from "../types";
import type { ErrorRecord } from "../types";
import { playCorrect, playReward, playWrong } from "../utils/sound";

const rewards = ["Pet Rồng Con", "Skin Hải Tặc Neon", "Sticker Ngôi Sao Vàng", "Danh hiệu: Vua Đúng/Sai"];

export function BlindBoxPage() {
  const addCollection = useGameStore((s) => s.addCollection);
  const addGold = useGameStore((s) => s.addGold);
  const addErrors = useGameStore((s) => s.addErrors);
  const addPerfect = useGameStore((s) => s.addPerfect);
  const soundOn = useGameStore((s) => s.soundOn);
  const { questions, loading, error, isConfigured } = useQuestionBank();
  const [progress, setProgress] = useState(0);
  const [opened, setOpened] = useState<string>("");
  const [resultMessage, setResultMessage] = useState("");
  const [answerMap, setAnswerMap] = useState<Record<string, boolean>>({});
  const pool = filterMultiTrueFalseQuestionsByMode(questions, "blind-box");

  if (!isConfigured) {
    return (
      <GameShell title="Hộp Bí Ẩn" subtitle="Hoàn thành 3 câu 4 ý Đúng/Sai để nhận vé">
        <QuestionBankNotice
          title="Firebase chưa sẵn sàng"
          description="Game này đã chuyển sang dùng câu hỏi 4 ý từ Firebase. Hãy cấu hình Firebase rồi tạo câu hỏi cho Hộp Bí Ẩn."
          tone="amber"
        />
      </GameShell>
    );
  }

  if (loading) {
    return (
      <GameShell title="Hộp Bí Ẩn" subtitle="Hoàn thành 3 câu 4 ý Đúng/Sai để nhận vé">
        <QuestionBankNotice
          title="Đang đồng bộ câu hỏi"
          description="Hệ thống đang tải câu hỏi cho Hộp Bí Ẩn từ Firebase."
          hideAction
        />
      </GameShell>
    );
  }

  if (error) {
    return (
      <GameShell title="Hộp Bí Ẩn" subtitle="Hoàn thành 3 câu 4 ý Đúng/Sai để nhận vé">
        <QuestionBankNotice title="Không tải được câu hỏi" description={error} tone="rose" />
      </GameShell>
    );
  }

  if (pool.length === 0) {
    return (
      <GameShell title="Hộp Bí Ẩn" subtitle="Hoàn thành 3 câu 4 ý Đúng/Sai để nhận vé">
        <QuestionBankNotice
          title="Chưa có câu hỏi cho Hộp Bí Ẩn"
          description="Hãy tạo ít nhất 1 câu 4 ý và gắn nó cho game Hộp Bí Ẩn trong trình tạo câu hỏi."
        />
      </GameShell>
    );
  }

  const q = pool[progress % pool.length];

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
      setResultMessage(`${scoreLabel(correctCount)} +${gold} vàng.`);
      setAnswerMap({});
    } else {
      playWrong(soundOn);
      setResultMessage(`${scoreLabel(correctCount)} +${gold} vàng. Cần từ 3/4 để tiến!`);
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
    <GameShell title="Hộp Bí Ẩn" subtitle="Hoàn thành 3 câu 4 ý Đúng/Sai để nhận vé">
      <div className="rounded-3xl bg-white/95 p-4 shadow-xl">
        <p className="font-bold">Tiến độ: {progress}/3</p>
        <RichContentBlock text={q.question} className="mt-2 text-slate-800" />
        {q.statements.map((s) => {
          const picked = answerMap[s.id];
          return (
            <div key={s.id} className="mt-2 rounded-xl bg-slate-100 p-3">
              <p>{s.label} <ChemText text={s.text} /></p>
              <div className="mt-1 flex gap-2">
                <button
                  onClick={() => setAnswerMap((v) => ({ ...v, [s.id]: true }))}
                  className={`rounded-lg px-4 py-2 font-bold transition ${
                    picked === true
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                    Đúng
                </button>
                <button
                  onClick={() => setAnswerMap((v) => ({ ...v, [s.id]: false }))}
                  className={`rounded-lg px-4 py-2 font-bold transition ${
                    picked === false
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                    Sai
                </button>
              </div>
            </div>
          );
        })}
        <button onClick={submit} className="mt-3 w-full rounded-xl bg-violet-600 p-3 font-bold text-white">Nộp bài</button>
        <button onClick={openBox} className="mt-2 w-full rounded-xl bg-gradient-to-r from-yellow-300 to-pink-300 p-3 font-black">Khui hộp</button>
        {resultMessage && <p className="mt-2 rounded-lg bg-violet-100 p-2 text-sm font-semibold text-violet-700">{resultMessage}</p>}
        {opened && <p className="mt-2 rounded-lg bg-amber-100 p-2">Bạn nhận được: {opened}</p>}
      </div>
    </GameShell>
  );
}

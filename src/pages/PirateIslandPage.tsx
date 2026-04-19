import { useMemo, useState } from "react";
import { ChemText } from "../components/ChemText";
import { RichContentBlock } from "../components/RichContent";
import { GameShell } from "../components/GameShell";
import { ConfettiRain, CoinBurst, StarBlast } from "../components/Effects";
import { QuestionBankNotice } from "../components/QuestionBankNotice";
import { useQuestionBank } from "../hooks/useQuestionBank";
import { filterMultiTrueFalseQuestionsByMode, filterTrueFalseQuestionsByMode } from "../lib/questionBank";
import { useGameStore } from "../store/useGameStore";
import { calcRealScore, scoreLabel } from "../types";
import type { ErrorRecord } from "../types";
import { playCorrect, playReward, playWrong } from "../utils/sound";

export function PirateIslandPage() {
  const addGold = useGameStore((s) => s.addGold);
  const addExp = useGameStore((s) => s.addExp);
  const addErrors = useGameStore((s) => s.addErrors);
  const addPerfect = useGameStore((s) => s.addPerfect);
  const soundOn = useGameStore((s) => s.soundOn);
  const { questions, loading, error, isConfigured } = useQuestionBank();
  const [burst, setBurst] = useState(0);
  const [stars, setStars] = useState(0);
  const [confetti, setConfetti] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [attackAnswers, setAttackAnswers] = useState<Record<string, boolean>>({});
  const [spinMessage, setSpinMessage] = useState("");
  const [attackMessage, setAttackMessage] = useState("");
  const [tfIndex, setTfIndex] = useState(0);
  const [mtfIndex, setMtfIndex] = useState(0);
  const tfPool = useMemo(() => filterTrueFalseQuestionsByMode(questions, "pirate"), [questions]);
  const mtfPool = useMemo(() => filterMultiTrueFalseQuestionsByMode(questions, "pirate"), [questions]);

  if (!isConfigured) {
    return (
      <GameShell title="Đảo Hải Tặc" subtitle="Đúng/Sai để quay thưởng và tấn công">
        <QuestionBankNotice
          title="Firebase chưa sẵn sàng"
          description="Đảo Hải Tặc cần cả câu Đúng/Sai đơn và câu 4 ý từ Firebase. Hãy cấu hình Firebase rồi tạo câu hỏi phù hợp cho game này."
          tone="amber"
        />
      </GameShell>
    );
  }

  if (loading) {
    return (
      <GameShell title="Đảo Hải Tặc" subtitle="Đúng/Sai để quay thưởng và tấn công">
        <QuestionBankNotice
          title="Đang đồng bộ câu hỏi"
          description="Hệ thống đang tải câu hỏi cho Đảo Hải Tặc từ Firebase."
          hideAction
        />
      </GameShell>
    );
  }

  if (error) {
    return (
      <GameShell title="Đảo Hải Tặc" subtitle="Đúng/Sai để quay thưởng và tấn công">
        <QuestionBankNotice title="Không tải được câu hỏi" description={error} tone="rose" />
      </GameShell>
    );
  }

  if (tfPool.length === 0 || mtfPool.length === 0) {
    return (
      <GameShell title="Đảo Hải Tặc" subtitle="Đúng/Sai để quay thưởng và tấn công">
        <QuestionBankNotice
          title="Chưa đủ câu hỏi cho Đảo Hải Tặc"
          description={`Game này cần cả câu Đúng/Sai đơn và câu 4 ý. Hiện có ${tfPool.length} câu đơn và ${mtfPool.length} câu 4 ý được gắn cho Đảo Hải Tặc.`}
        />
      </GameShell>
    );
  }

  const tf = tfPool[tfIndex % tfPool.length];
  const mtf = mtfPool[mtfIndex % mtfPool.length];

  const spinReward = () => {
    if (answer === null) {
      setSpinMessage("Bạn cần chọn Đúng hoặc Sai trước khi quay.");
      return;
    }
    if (answer === tf.correct) {
      const rewards = [30, 50, 80];
      const value = rewards[Math.floor(Math.random() * rewards.length)];
      addGold(value);
      addExp(25);
      setBurst((v) => v + 1);
      setConfetti((v) => v + 1);
      playReward(soundOn);
      setSpinMessage(`Chính xác! Bạn nhận +${value} vàng.`);
    } else {
      playWrong(soundOn);
      setSpinMessage("Sai mất rồi! Thử lại câu tiếp theo.");
    }
    setAnswer(null);
    setTfIndex((v) => v + 1);
  };

  const finishAttack = () => {
    const correctCount = mtf.statements.filter((s) => attackAnswers[s.id] === s.correct).length;
    const score = calcRealScore(correctCount);
    const goldMap: Record<number, number> = { 0: 0, 1: 10, 2: 25, 3: 50, 4: 150 };
    const gold = goldMap[correctCount] ?? 0;
    addGold(gold);
    addExp(correctCount * 10);
    if (correctCount === 4) addPerfect();

    // Track errors
    const errs: ErrorRecord[] = mtf.statements
      .filter((s) => attackAnswers[s.id] !== s.correct)
      .map((s) => ({
        id: `err-pirate-${Date.now()}-${s.id}`,
        statementText: s.text,
        userAnswer: attackAnswers[s.id] ?? !s.correct,
        correctAnswer: s.correct,
        explanation: mtf.explanation,
        questionId: mtf.id,
        date: new Date().toISOString(),
      }));
    if (errs.length) addErrors(errs);

    if (correctCount === 4) {
      setStars((v) => v + 1);
      playCorrect(soundOn);
      setAttackMessage(`🎉 HOÀN HẢO 4/4! → ${score}đ, +${gold} vàng`);
    } else if (correctCount === 3) {
      playWrong(soundOn);
      setAttackMessage(`⚠️ 3/4 = 0.5đ (mất 0.5đ!) +${gold} vàng. Cố gắng 4/4!`);
    } else {
      playWrong(soundOn);
      setAttackMessage(`❌ ${scoreLabel(correctCount)} +${gold} vàng`);
    }
    setAttackAnswers({});
    setMtfIndex((v) => v + 1);
  };

  return (
    <GameShell title="Đảo Hải Tặc" subtitle="Đúng/Sai để quay thưởng và tấn công">
      <div className="relative rounded-3xl bg-white/95 p-4 shadow-xl">
        <h2 className="font-black text-violet-700">Câu Đúng/Sai đơn</h2>
        <p className="mt-2 rounded-xl bg-violet-100 p-3"><ChemText text={tf.statement} /></p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setAnswer(true)}
            className={`flex-1 rounded-xl p-3 font-bold text-white ${answer === true ? "bg-emerald-700 ring-4 ring-emerald-200" : "bg-emerald-500"}`}
          >
            Đúng
          </button>
          <button
            onClick={() => setAnswer(false)}
            className={`flex-1 rounded-xl p-3 font-bold text-white ${answer === false ? "bg-rose-700 ring-4 ring-rose-200" : "bg-rose-500"}`}
          >
            Sai
          </button>
        </div>
        <button onClick={spinReward} className="mt-3 w-full rounded-xl bg-gradient-to-r from-yellow-300 to-orange-400 p-3 font-black">
          Quay nhận vàng
        </button>
        <p className="mt-2 text-sm text-slate-600"><ChemText text={tf.explanation} /></p>
        {spinMessage && <p className="mt-2 rounded-lg bg-violet-100 p-2 text-sm font-semibold text-violet-700">{spinMessage}</p>}
        <CoinBurst trigger={burst} />
        <ConfettiRain trigger={confetti} />
      </div>

      <div className="relative mt-4 rounded-3xl bg-white/95 p-4 shadow-xl">
        <h2 className="font-black text-violet-700">Tấn công boss (4 ý Đúng/Sai)</h2>
        <RichContentBlock text={mtf.question} className="mt-2 text-slate-800" />
        <div className="mt-3 space-y-2">
          {mtf.statements.map((s) => (
            <div key={s.id} className="rounded-xl bg-slate-100 p-3">
              <p className="font-semibold">{s.label} <ChemText text={s.text} /></p>
              <div className="mt-2 flex gap-2">
                  <button onClick={() => setAttackAnswers((v) => ({ ...v, [s.id]: true }))} className="rounded-lg bg-emerald-500 px-3 py-1 text-white">Đúng</button>
                  <button onClick={() => setAttackAnswers((v) => ({ ...v, [s.id]: false }))} className="rounded-lg bg-rose-500 px-3 py-1 text-white">Sai</button>
              </div>
              {attackAnswers[s.id] !== undefined && (
                <p className="mt-1 text-xs text-slate-600">Đã chọn: {attackAnswers[s.id] ? "Đúng" : "Sai"}</p>
              )}
            </div>
          ))}
        </div>
        <button onClick={finishAttack} className="mt-3 w-full rounded-xl bg-gradient-to-r from-fuchsia-400 to-violet-500 p-3 font-black text-white">
          Kết thúc tấn công
        </button>
        <p className="mt-2 text-sm text-slate-600"><ChemText text={mtf.explanation} /></p>
        {attackMessage && <p className="mt-2 rounded-lg bg-fuchsia-100 p-2 text-sm font-semibold text-fuchsia-700">{attackMessage}</p>}
        <StarBlast trigger={stars} />
      </div>
    </GameShell>
  );
}


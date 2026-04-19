import { useEffect, useMemo, useState } from "react";
import { subscribeToQuestions } from "../lib/questionBank";
import { useGameStore } from "../store/useGameStore";
import type { SyncedQuestion } from "../types";

export function useQuestionBank(customTeacherId?: string | null) {
  const [questions, setQuestions] = useState<SyncedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfigured, setIsConfigured] = useState(true);
  const user = useGameStore((state) => state.user);

  const teacherId = customTeacherId !== undefined 
    ? customTeacherId 
    : (user?.role === "admin" ? null : user?.teacherId);

  useEffect(() => {
    const unsubscribe = subscribeToQuestions(
      teacherId,
      (nextQuestions) => {
        setQuestions(nextQuestions);
        setLoading(false);
        setError("");
      },
      (message) => {
        setQuestions([]);
        setLoading(false);
        setError(message);
      },
      (configured) => {
        setIsConfigured(configured);
      },
    );

    return unsubscribe;
  }, [teacherId]);

  return useMemo(
    () => ({
      questions,
      loading,
      error,
      isConfigured,
    }),
    [error, isConfigured, loading, questions],
  );
}
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExamResult, ErrorRecord, MultiTrueFalseQuestion, TrueFalseQuestion } from "../types";

type AppUser = {
  id: string;
  name: string;
  avatar: string;
};

type GameStore = {
  user: AppUser | null;
  level: number;
  exp: number;
  gold: number;
  streak: number;
  collection: string[];
  leaderboardScore: number;
  soundOn: boolean;
  customTrueFalseQuestions: TrueFalseQuestion[];
  customMultiTrueFalseQuestions: MultiTrueFalseQuestion[];
  examHistory: ExamResult[];
  errorBook: ErrorRecord[];
  perfectCount: number;
  setUser: (user: AppUser) => void;
  addGold: (amount: number) => void;
  addExp: (amount: number) => void;
  addCollection: (item: string) => void;
  increaseStreak: () => void;
  resetStreak: () => void;
  toggleSound: () => void;
  addCustomTrueFalseQuestion: (question: TrueFalseQuestion) => void;
  addCustomMultiTrueFalseQuestion: (question: MultiTrueFalseQuestion) => void;
  removeCustomTrueFalseQuestion: (id: string) => void;
  removeCustomMultiTrueFalseQuestion: (id: string) => void;
  addExamResult: (result: ExamResult) => void;
  addErrors: (errors: ErrorRecord[]) => void;
  removeError: (id: string) => void;
  clearErrorBook: () => void;
  addPerfect: () => void;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      user: null,
      level: 1,
      exp: 0,
      gold: 0,
      streak: 0,
      collection: [],
      leaderboardScore: 0,
      soundOn: true,
      customTrueFalseQuestions: [],
      customMultiTrueFalseQuestions: [],
      examHistory: [],
      errorBook: [],
      perfectCount: 0,
      setUser: (user) => set({ user }),
      addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
      addExp: (amount) =>
        set((state) => {
          const nextExp = state.exp + amount;
          const extraLevel = Math.floor(nextExp / 100);
          return {
            exp: nextExp % 100,
            level: state.level + extraLevel,
            leaderboardScore: state.leaderboardScore + amount,
          };
        }),
      addCollection: (item) =>
        set((state) => ({
          collection: state.collection.includes(item) ? state.collection : [...state.collection, item],
        })),
      increaseStreak: () => set((state) => ({ streak: state.streak + 1 })),
      resetStreak: () => set({ streak: 0 }),
      toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),
      addCustomTrueFalseQuestion: (question) =>
        set((state) => ({ customTrueFalseQuestions: [question, ...state.customTrueFalseQuestions] })),
      addCustomMultiTrueFalseQuestion: (question) =>
        set((state) => ({ customMultiTrueFalseQuestions: [question, ...state.customMultiTrueFalseQuestions] })),
      removeCustomTrueFalseQuestion: (id) =>
        set((state) => ({
          customTrueFalseQuestions: state.customTrueFalseQuestions.filter((q) => q.id !== id),
        })),
      removeCustomMultiTrueFalseQuestion: (id) =>
        set((state) => ({
          customMultiTrueFalseQuestions: state.customMultiTrueFalseQuestions.filter((q) => q.id !== id),
        })),
      addExamResult: (result) =>
        set((state) => ({ examHistory: [result, ...state.examHistory].slice(0, 50) })),
      addErrors: (errors) =>
        set((state) => ({ errorBook: [...errors, ...state.errorBook].slice(0, 200) })),
      removeError: (id) =>
        set((state) => ({ errorBook: state.errorBook.filter((e) => e.id !== id) })),
      clearErrorBook: () => set({ errorBook: [] }),
      addPerfect: () => set((state) => ({ perfectCount: state.perfectCount + 1 })),
    }),
    { name: "tf-game-storage" },
  ),
);

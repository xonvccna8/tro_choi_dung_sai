import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser, ExamResult, ErrorRecord } from "../types";

type PersistedGameState = {
  user: AppUser | null;
  level: number;
  exp: number;
  gold: number;
  streak: number;
  collection: string[];
  leaderboardScore: number;
  soundOn: boolean;
  examHistory: ExamResult[];
  errorBook: ErrorRecord[];
  perfectCount: number;
};

type GameStore = PersistedGameState & {
  setUser: (user: AppUser) => void;
  logout: () => void;
  addGold: (amount: number) => void;
  addExp: (amount: number) => void;
  addCollection: (item: string) => void;
  increaseStreak: () => void;
  resetStreak: () => void;
  toggleSound: () => void;
  addExamResult: (result: ExamResult) => void;
  addErrors: (errors: ErrorRecord[]) => void;
  removeError: (id: string) => void;
  clearErrorBook: () => void;
  addPerfect: () => void;
};

const initialState: PersistedGameState = {
  user: null,
  level: 1,
  exp: 0,
  gold: 0,
  streak: 0,
  collection: [],
  leaderboardScore: 0,
  soundOn: true,
  examHistory: [],
  errorBook: [],
  perfectCount: 0,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
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
      addExamResult: (result) =>
        set((state) => ({ examHistory: [result, ...state.examHistory].slice(0, 50) })),
      addErrors: (errors) =>
        set((state) => ({ errorBook: [...errors, ...state.errorBook].slice(0, 200) })),
      removeError: (id) =>
        set((state) => ({ errorBook: state.errorBook.filter((e) => e.id !== id) })),
      clearErrorBook: () => set({ errorBook: [] }),
      addPerfect: () => set((state) => ({ perfectCount: state.perfectCount + 1 })),
    }),
    {
      name: "tf-game-storage",
      version: 2,
      migrate: () => initialState,
    },
  ),
);

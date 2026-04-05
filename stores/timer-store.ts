"use client";

import { create } from "zustand";

type TimerPhase = "focus" | "break";

type TimerStore = {
  selectedActivityId: string | null;
  pomodoroEnabled: boolean;
  phase: TimerPhase;
  isRunning: boolean;
  startedAt: number | null;
  elapsedBeforePause: number;
  sessionStartedAt: number | null;
  setSelectedActivityId: (activityId: string | null) => void;
  togglePomodoro: () => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  completePomodoroCycle: () => void;
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  selectedActivityId: null,
  pomodoroEnabled: false,
  phase: "focus",
  isRunning: false,
  startedAt: null,
  elapsedBeforePause: 0,
  sessionStartedAt: null,
  setSelectedActivityId: (activityId) => set({ selectedActivityId: activityId }),
  togglePomodoro: () =>
    set((state) => ({
      pomodoroEnabled: !state.pomodoroEnabled,
      phase: "focus",
      elapsedBeforePause: 0,
      startedAt: null,
      isRunning: false,
      sessionStartedAt: null,
    })),
  start: () =>
    set((state) => {
      const now = Date.now();
      return {
        isRunning: true,
        startedAt: now,
        sessionStartedAt: state.sessionStartedAt ?? now - state.elapsedBeforePause,
      };
    }),
  pause: () =>
    set((state) => {
      if (!state.startedAt) return state;
      return {
        isRunning: false,
        elapsedBeforePause:
          state.elapsedBeforePause + Math.max(0, Date.now() - state.startedAt),
        startedAt: null,
      };
    }),
  stop: () =>
    set({
      isRunning: false,
      startedAt: null,
      elapsedBeforePause: 0,
      sessionStartedAt: null,
      phase: "focus",
    }),
  completePomodoroCycle: () =>
    set((state) => ({
      phase: state.phase === "focus" ? "break" : "focus",
      isRunning: false,
      startedAt: null,
      elapsedBeforePause: 0,
      sessionStartedAt: null,
    })),
}));

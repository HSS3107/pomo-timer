"use client";

import { create } from "zustand";

type TimerPhase = "focus" | "break";

type TimerStore = {
  selectedActivityId: string | null;
  pomodoroEnabled: boolean;
  phase: TimerPhase;
  focusDurationMinutes: number;
  breakDurationMinutes: number;
  isRunning: boolean;
  startedAt: number | null;
  elapsedBeforePause: number;
  sessionStartedAt: number | null;
  setSelectedActivityId: (activityId: string | null) => void;
  setFocusDurationMinutes: (minutes: number) => void;
  setBreakDurationMinutes: (minutes: number) => void;
  togglePomodoro: () => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  completePomodoroCycle: (options?: { autoStart?: boolean }) => void;
};

export const useTimerStore = create<TimerStore>((set, get) => ({
  selectedActivityId: null,
  pomodoroEnabled: false,
  phase: "focus",
  focusDurationMinutes: 25,
  breakDurationMinutes: 5,
  isRunning: false,
  startedAt: null,
  elapsedBeforePause: 0,
  sessionStartedAt: null,
  setSelectedActivityId: (activityId) => set({ selectedActivityId: activityId }),
  setFocusDurationMinutes: (minutes) =>
    set({
      focusDurationMinutes: Math.min(180, Math.max(1, Math.floor(minutes))),
      isRunning: false,
      startedAt: null,
      elapsedBeforePause: 0,
      sessionStartedAt: null,
      phase: "focus",
    }),
  setBreakDurationMinutes: (minutes) =>
    set({
      breakDurationMinutes: Math.min(60, Math.max(1, Math.floor(minutes))),
      isRunning: false,
      startedAt: null,
      elapsedBeforePause: 0,
      sessionStartedAt: null,
      phase: "focus",
    }),
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
  completePomodoroCycle: ({ autoStart = false } = {}) =>
    set((state) => {
      const nextPhase = state.phase === "focus" ? "break" : "focus";
      const now = Date.now();

      return {
        phase: nextPhase,
        isRunning: autoStart,
        startedAt: autoStart ? now : null,
        elapsedBeforePause: 0,
        sessionStartedAt: autoStart ? now : null,
      };
    }),
}));

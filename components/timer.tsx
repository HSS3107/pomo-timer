"use client";

import { Pause, Play, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createTimerSessionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DashboardActivity } from "@/types";
import { useTimerStore } from "@/stores/timer-store";

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

type SoundTone = {
  frequency: number;
  duration: number;
  delay: number;
  gain: number;
};

function playToneSequence(
  audioContext: AudioContext,
  tones: SoundTone[],
  oscillatorType: OscillatorType,
) {
  const startAt = audioContext.currentTime + 0.02;

  for (const tone of tones) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const toneStart = startAt + tone.delay;
    const toneEnd = toneStart + tone.duration;

    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(tone.frequency, toneStart);

    gainNode.gain.setValueAtTime(0.0001, toneStart);
    gainNode.gain.exponentialRampToValueAtTime(tone.gain, toneStart + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, toneEnd);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(toneStart);
    oscillator.stop(toneEnd + 0.02);
  }
}

export function Timer({
  activities,
  selectedActivityId,
}: {
  activities: DashboardActivity[];
  selectedActivityId: string | null;
}) {
  const {
    pomodoroEnabled,
    phase,
    focusDurationMinutes,
    breakDurationMinutes,
    isRunning,
    startedAt,
    elapsedBeforePause,
    sessionStartedAt,
    setFocusDurationMinutes,
    setBreakDurationMinutes,
    togglePomodoro,
    setSelectedActivityId,
    start,
    pause,
    stop,
    completePomodoroCycle,
  } = useTimerStore();
  const [now, setNow] = useState(Date.now());
  const [focusInput, setFocusInput] = useState("25");
  const [breakInput, setBreakInput] = useState("5");
  const [isPending, startTransition] = useTransition();
  const audioContextRef = useRef<AudioContext | null>(null);
  const completionKeyRef = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSelectedActivityId(selectedActivityId ?? activities[0]?.id ?? null);
  }, [activities, selectedActivityId, setSelectedActivityId]);

  useEffect(() => {
    setFocusInput(String(focusDurationMinutes));
  }, [focusDurationMinutes]);

  useEffect(() => {
    setBreakInput(String(breakDurationMinutes));
  }, [breakDurationMinutes]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const activeActivityId = selectedActivityId ?? activities[0]?.id ?? null;

  const elapsedMs = useMemo(() => {
    if (isRunning && startedAt) {
      return elapsedBeforePause + (now - startedAt);
    }

    return elapsedBeforePause;
  }, [elapsedBeforePause, isRunning, now, startedAt]);

  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const focusSeconds = focusDurationMinutes * 60;
  const breakSeconds = breakDurationMinutes * 60;
  const targetSeconds = phase === "focus" ? focusSeconds : breakSeconds;
  const displaySeconds = Math.max(targetSeconds - elapsedSeconds, 0);

  function getSessionPayload(targetPhase: "focus" | "break") {
    if (!activeActivityId || !sessionStartedAt) {
      return null;
    }

    const effectiveStartedAt = new Date(sessionStartedAt);
    const effectiveEndedAt = new Date(sessionStartedAt + elapsedMs);
    const durationSeconds = Math.max(1, Math.floor(elapsedMs / 1000));

    return {
      activityId: activeActivityId,
      startedAt: effectiveStartedAt.toISOString(),
      endedAt: effectiveEndedAt.toISOString(),
      durationSeconds,
      phase: targetPhase,
      source: pomodoroEnabled ? "pomodoro" : "timer",
    } as const;
  }

  function getCompletionKey() {
    if (!sessionStartedAt) {
      return null;
    }

    return `${phase}-${sessionStartedAt}`;
  }

  async function playSound(kind: "start" | "focusEnd" | "breakEnd") {
    const AudioCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioCtor) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtor();
    }

    const audioContext = audioContextRef.current;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    if (kind === "start") {
      playToneSequence(
        audioContext,
        [
          { frequency: 392, duration: 0.16, delay: 0, gain: 0.03 },
          { frequency: 523.25, duration: 0.2, delay: 0.08, gain: 0.04 },
        ],
        "sine",
      );
      return;
    }

    if (kind === "focusEnd") {
      playToneSequence(
        audioContext,
        [
          { frequency: 523.25, duration: 0.22, delay: 0, gain: 0.045 },
          { frequency: 659.25, duration: 0.24, delay: 0.12, gain: 0.05 },
          { frequency: 783.99, duration: 0.28, delay: 0.26, gain: 0.055 },
          { frequency: 1046.5, duration: 0.5, delay: 0.42, gain: 0.06 },
        ],
        "triangle",
      );
      return;
    }

    playToneSequence(
      audioContext,
      [
        { frequency: 587.33, duration: 0.22, delay: 0, gain: 0.04 },
        { frequency: 493.88, duration: 0.18, delay: 0.16, gain: 0.035 },
        { frequency: 659.25, duration: 0.36, delay: 0.28, gain: 0.045 },
      ],
      "sine",
    );
  }

  function persistFocusSession(onComplete?: () => void) {
    const payload = getSessionPayload("focus");

    if (!payload) {
      onComplete?.();
      return;
    }

    startTransition(async () => {
      await createTimerSessionAction(payload);
      onComplete?.();
      router.refresh();
    });
  }

  useEffect(() => {
    if (!isRunning) return;
    if (elapsedSeconds < targetSeconds) return;

    const completionKey = getCompletionKey();
    if (completionKey && completionKeyRef.current === completionKey) {
      return;
    }
    completionKeyRef.current = completionKey;

    if (pomodoroEnabled && phase === "focus") {
      void playSound("focusEnd");
      persistFocusSession();
      completePomodoroCycle({ autoStart: true });
      return;
    }

    if (pomodoroEnabled && phase === "break") {
      void playSound("breakEnd");
      completePomodoroCycle({ autoStart: false });
      return;
    }

    void playSound("focusEnd");
    persistFocusSession(stop);
  }, [
    completePomodoroCycle,
    elapsedSeconds,
    isRunning,
    phase,
    pomodoroEnabled,
    router,
    stop,
    targetSeconds,
  ]);

  function applyDuration(
    value: string,
    setter: (minutes: number) => void,
    fallback: number,
  ) {
    const parsed = Number(value);
    setter(Number.isFinite(parsed) && parsed > 0 ? parsed : fallback);
  }

  async function handleStop() {
    completionKeyRef.current = getCompletionKey();

    if (phase === "break") {
      stop();
      return;
    }

    persistFocusSession(stop);
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Timer</h2>
          <p className="text-sm text-[var(--muted)]">
            Timestamp based tracking with optional Pomodoro pacing.
          </p>
        </div>
        <Button variant={pomodoroEnabled ? "primary" : "secondary"} onClick={togglePomodoro}>
          Pomodoro {pomodoroEnabled ? "ON" : "OFF"}
        </Button>
      </div>

      <div className="mt-6 rounded-[28px] bg-[linear-gradient(160deg,#fff7ef,#f1dcc5)] p-6">
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <span>Current mode</span>
          <span className="rounded-full bg-white/70 px-3 py-1 font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            {phase}
          </span>
        </div>
        <p className="mt-6 text-center text-6xl font-semibold tracking-tight md:text-7xl">
          {formatClock(displaySeconds)}
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <label className="rounded-[24px] bg-white/65 p-4">
            <span className="mb-2 block text-sm font-medium text-[var(--muted)]">
              Focus minutes
            </span>
            <Input
              type="number"
              min="1"
              max="180"
              value={focusInput}
              onChange={(event) => setFocusInput(event.target.value)}
              onBlur={() => applyDuration(focusInput, setFocusDurationMinutes, 25)}
            />
          </label>
          <label className="rounded-[24px] bg-white/65 p-4">
            <span className="mb-2 block text-sm font-medium text-[var(--muted)]">
              Break minutes
            </span>
            <Input
              type="number"
              min="1"
              max="60"
              value={breakInput}
              onChange={(event) => setBreakInput(event.target.value)}
              onBlur={() => applyDuration(breakInput, setBreakDurationMinutes, 5)}
            />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            onClick={async () => {
              if (isRunning) {
                pause();
                return;
              }

              await playSound("start");
              start();
            }}
            disabled={!activeActivityId || isPending}
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => void handleStop()}
            disabled={elapsedSeconds === 0 || isPending}
          >
            <Square className="mr-2 h-4 w-4" />
            {phase === "break" ? "Stop break" : "Stop & save"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

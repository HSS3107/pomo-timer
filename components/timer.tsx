"use client";

import { Pause, Play, Square } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createTimerSessionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DashboardActivity } from "@/types";
import { useTimerStore } from "@/stores/timer-store";

const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
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
    isRunning,
    startedAt,
    elapsedBeforePause,
    sessionStartedAt,
    togglePomodoro,
    setSelectedActivityId,
    start,
    pause,
    stop,
    completePomodoroCycle,
  } = useTimerStore();
  const [now, setNow] = useState(Date.now());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setSelectedActivityId(selectedActivityId ?? activities[0]?.id ?? null);
  }, [activities, selectedActivityId, setSelectedActivityId]);

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
  const targetSeconds = pomodoroEnabled
    ? phase === "focus"
      ? FOCUS_SECONDS
      : BREAK_SECONDS
    : null;
  const displaySeconds =
    targetSeconds === null ? elapsedSeconds : Math.max(targetSeconds - elapsedSeconds, 0);

  useEffect(() => {
    if (!pomodoroEnabled || !isRunning || targetSeconds === null) return;
    if (elapsedSeconds < targetSeconds) return;

    completePomodoroCycle();
  }, [
    completePomodoroCycle,
    elapsedSeconds,
    isRunning,
    pomodoroEnabled,
    targetSeconds,
  ]);

  async function handleStop() {
    if (!activeActivityId || !sessionStartedAt) {
      stop();
      return;
    }

    const effectiveStartedAt = new Date(sessionStartedAt);
    const effectiveEndedAt = new Date(sessionStartedAt + elapsedMs);
    const durationSeconds = Math.max(1, Math.floor(elapsedMs / 1000));

    startTransition(async () => {
      await createTimerSessionAction({
        activityId: activeActivityId,
        startedAt: effectiveStartedAt.toISOString(),
        endedAt: effectiveEndedAt.toISOString(),
        durationSeconds,
        phase,
        source: pomodoroEnabled ? "pomodoro" : "timer",
      });
      stop();
      router.refresh();
    });
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
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            onClick={() => (isRunning ? pause() : start())}
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
            Stop & save
          </Button>
        </div>
      </div>
    </Card>
  );
}

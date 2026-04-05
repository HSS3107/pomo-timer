"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createManualSessionAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DashboardActivity } from "@/types";

export function ManualEntryForm({
  activities,
  selectedActivityId,
}: {
  activities: DashboardActivity[];
  selectedActivityId: string | null;
}) {
  const [minutes, setMinutes] = useState("25");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit() {
    const activityId = selectedActivityId ?? activities[0]?.id;
    const durationMinutes = Number(minutes);

    if (!activityId || Number.isNaN(durationMinutes) || durationMinutes <= 0) {
      return;
    }

    startTransition(async () => {
      await createManualSessionAction({
        activityId,
        durationMinutes,
      });
      setMinutes("25");
      router.refresh();
    });
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold">Manual entry</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Backfill work you already finished.
      </p>

      <div className="mt-5 flex gap-3">
        <Input
          type="number"
          min="1"
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
          placeholder="Minutes"
        />
        <Button onClick={handleSubmit} disabled={isPending || !activities.length}>
          Save session
        </Button>
      </div>
    </Card>
  );
}

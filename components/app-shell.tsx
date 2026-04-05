"use client";

import { useEffect } from "react";

import { ActivityList } from "@/components/activity-list";
import { Dashboard } from "@/components/dashboard";
import { ManualEntryForm } from "@/components/manual-entry-form";
import { Timer } from "@/components/timer";
import type { DashboardData } from "@/types";
import { useTimerStore } from "@/stores/timer-store";

export function AppShell({ data }: { data: DashboardData }) {
  const selectedActivityId = useTimerStore((state) => state.selectedActivityId);
  const setSelectedActivityId = useTimerStore((state) => state.setSelectedActivityId);

  useEffect(() => {
    if (!selectedActivityId && data.activities[0]?.id) {
      setSelectedActivityId(data.activities[0].id);
    }
  }, [data.activities, selectedActivityId, setSelectedActivityId]);

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-6">
        <ActivityList
          activities={data.activities}
          selectedActivityId={selectedActivityId}
          onSelect={setSelectedActivityId}
        />
      </div>
      <div className="space-y-6">
        <Timer activities={data.activities} selectedActivityId={selectedActivityId} />
        <Dashboard data={data} />
        <ManualEntryForm
          activities={data.activities}
          selectedActivityId={selectedActivityId}
        />
      </div>
    </div>
  );
}

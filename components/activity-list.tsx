"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createActivityAction,
  deleteActivityAction,
  renameActivityAction,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DashboardActivity } from "@/types";
import { formatDuration } from "@/lib/utils";

export function ActivityList({
  activities,
  selectedActivityId,
  onSelect,
}: {
  activities: DashboardActivity[];
  selectedActivityId: string | null;
  onSelect: (activityId: string) => void;
}) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const hasActivities = activities.length > 0;
  const selectedFallback = useMemo(
    () => selectedActivityId ?? activities[0]?.id ?? null,
    [activities, selectedActivityId],
  );

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    startTransition(async () => {
      const result = await createActivityAction({ name: trimmed });
      setName("");
      if (result?.activityId) {
        onSelect(result.activityId);
      }
      router.refresh();
    });
  }

  async function handleRename(activityId: string) {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    startTransition(async () => {
      await renameActivityAction({ activityId, name: trimmed });
      setEditingId(null);
      setEditingName("");
      router.refresh();
    });
  }

  async function handleDelete(activityId: string) {
    if (selectedFallback === activityId && activities.length > 1) {
      const next = activities.find((activity) => activity.id !== activityId);
      if (next) onSelect(next.id);
    }

    startTransition(async () => {
      await deleteActivityAction({ activityId });
      router.refresh();
    });
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Activities</h2>
          <p className="text-sm text-[var(--muted)]">
            Create a few buckets for your focus time.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New activity"
        />
        <Button onClick={handleCreate} disabled={isPending || !name.trim()}>
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {hasActivities ? (
          activities.map((activity) => {
            const isSelected = selectedFallback === activity.id;
            const isEditing = editingId === activity.id;

            return (
              <div
                key={activity.id}
                className={`w-full rounded-[24px] border p-4 text-left transition ${
                  isSelected
                    ? "border-[var(--accent)] bg-white shadow-lg shadow-orange-100"
                    : "border-[var(--border)] bg-white/55 hover:bg-white/80"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleRename(activity.id);
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="truncate text-base font-semibold">{activity.name}</p>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                          {formatDuration(activity.totalSeconds)} tracked
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                          {activity.sessionCount} sessions
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingId(activity.id);
                        setEditingName(activity.name);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDelete(activity.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => onSelect(activity.id)}
                    className="mt-3 text-sm font-medium text-[var(--accent-strong)]"
                  >
                    {isSelected ? "Selected activity" : "Select activity"}
                  </button>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
            Add your first activity to start tracking focused work.
          </div>
        )}
      </div>
    </Card>
  );
}

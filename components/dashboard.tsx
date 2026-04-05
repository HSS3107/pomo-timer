import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { DashboardData } from "@/types";
import { formatDuration, formatHours } from "@/lib/utils";

export function Dashboard({ data }: { data: DashboardData }) {
  const maxSeconds = data.activities[0]?.totalSeconds ?? 1;

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <p className="text-sm text-[var(--muted)]">
            Sorted by total tracked time across all synced sessions.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
          <div className="rounded-[24px] bg-white/70 p-4">
            <p className="text-sm text-[var(--muted)]">Grand total</p>
            <p className="mt-2 text-2xl font-semibold">
              {formatHours(data.grandTotalSeconds)}
            </p>
          </div>
          <div className="rounded-[24px] bg-white/70 p-4">
            <p className="text-sm text-[var(--muted)]">Sessions</p>
            <p className="mt-2 text-2xl font-semibold">{data.grandSessionCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {data.activities.length ? (
          data.activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-[24px] border border-[var(--border)] bg-white/70 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-base font-semibold">{activity.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {activity.sessionCount} sessions
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-base font-semibold">
                    {formatHours(activity.totalSeconds)}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {formatDuration(activity.totalSeconds)}
                  </p>
                </div>
              </div>
              <ProgressBar
                className="mt-4"
                value={(activity.totalSeconds / maxSeconds) * 100}
              />
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted)]">
            Your dashboard fills up once you save a few sessions.
          </div>
        )}
      </div>
    </Card>
  );
}

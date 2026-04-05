import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const width = Math.max(6, Math.min(100, value));

  return (
    <div className={cn("h-3 w-full overflow-hidden rounded-full bg-black/10", className)}>
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),#f0b168)] transition-all"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

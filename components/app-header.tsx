import { UserButton } from "@clerk/nextjs";

export function AppHeader() {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--accent-strong)]">
          Focus Dashboard
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          Keep every session intentional.
        </h1>
      </div>
      <div className="flex items-center gap-3 self-start rounded-full border border-[var(--border)] bg-white/70 px-4 py-2">
        <span className="text-sm text-[var(--muted)]">Account</span>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}

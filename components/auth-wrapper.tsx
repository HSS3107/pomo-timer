import type { ReactNode } from "react";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
          <section className="glass grid w-full gap-8 overflow-hidden rounded-[36px] border border-[var(--border)] p-8 shadow-2xl shadow-orange-100 md:grid-cols-[1.3fr_0.9fr] md:p-12">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
                Pomodoro Tracker
              </p>
              <h1 className="max-w-xl text-4xl font-semibold leading-tight md:text-6xl">
                Focus sessions that follow you across every device.
              </h1>
              <p className="max-w-lg text-base leading-7 text-[var(--muted)]">
                Sign in with Google or email, run a simple Pomodoro timer, and
                store every session in Neon so your dashboard stays synced.
              </p>
              <SignInButton mode="modal">
                <Button size="lg">Start tracking</Button>
              </SignInButton>
            </div>
            <div className="relative overflow-hidden rounded-[28px] border border-white/40 bg-[linear-gradient(160deg,#221c16,#4e3427)] p-6 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_30%)]" />
              <div className="relative space-y-4">
                <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/80">
                  Minimal by design
                </div>
                <div className="space-y-3">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-sm text-white/70">Focus block</p>
                    <p className="mt-2 text-5xl font-semibold">25:00</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-3xl bg-white/10 p-4">
                      <p className="text-sm text-white/70">Sessions today</p>
                      <p className="mt-2 text-2xl font-semibold">8</p>
                    </div>
                    <div className="rounded-3xl bg-white/10 p-4">
                      <p className="text-sm text-white/70">Tracked time</p>
                      <p className="mt-2 text-2xl font-semibold">3.4h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </SignedOut>
    </>
  );
}

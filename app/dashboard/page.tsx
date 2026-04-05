import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";
import { getDashboardData } from "@/db/queries";
import { ensureUserRecord } from "@/db/queries";
import { getCurrentProfile, requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  await ensureUserRecord({
    clerkUserId: profile.userId,
    email: profile.email,
    name: profile.name,
    imageUrl: profile.imageUrl,
  });

  const { userId } = await requireUser();
  const data = await getDashboardData(userId);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-10">
      <div className="space-y-6">
        <AppHeader />
        <AppShell data={data} />
      </div>
    </main>
  );
}

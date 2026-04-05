import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

export async function requireUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return { userId };
}

export async function getCurrentProfile() {
  const { userId } = await requireUser();
  const user = await currentUser();

  return {
    userId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    name: user?.fullName ?? user?.firstName ?? "Pomodoro User",
    imageUrl: user?.imageUrl ?? null,
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { ensureUserRecord, getActivityById } from "@/db/queries";
import { activities, sessions } from "@/db/schema";
import { getCurrentProfile, requireUser } from "@/lib/auth";

async function ensureUserInDatabase() {
  const profile = await getCurrentProfile();

  await ensureUserRecord({
    clerkUserId: profile.userId,
    email: profile.email,
    name: profile.name,
    imageUrl: profile.imageUrl,
  });

  return profile;
}

export async function bootstrapUserAction() {
  await ensureUserInDatabase();
}

export async function createActivityAction({ name }: { name: string }) {
  const profile = await ensureUserInDatabase();
  const trimmed = name.trim();
  const db = getDb();

  if (!trimmed) {
    throw new Error("Activity name is required");
  }

  const [activity] = await db
    .insert(activities)
    .values({
      userId: profile.userId,
      name: trimmed,
    })
    .returning({ activityId: activities.id });

  revalidatePath("/");

  return activity;
}

export async function renameActivityAction({
  activityId,
  name,
}: {
  activityId: string;
  name: string;
}) {
  const { userId } = await requireUser();
  const trimmed = name.trim();
  const db = getDb();

  if (!trimmed) {
    throw new Error("Activity name is required");
  }

  await db
    .update(activities)
    .set({
      name: trimmed,
      updatedAt: new Date(),
    })
    .where(and(eq(activities.id, activityId), eq(activities.userId, userId)));

  revalidatePath("/");
}

export async function deleteActivityAction({ activityId }: { activityId: string }) {
  const { userId } = await requireUser();
  const db = getDb();

  await db
    .delete(activities)
    .where(and(eq(activities.id, activityId), eq(activities.userId, userId)));

  revalidatePath("/");
}

export async function createTimerSessionAction(input: {
  activityId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  source: "timer" | "pomodoro";
  phase: "focus" | "break";
}) {
  const { userId } = await requireUser();
  const activity = await getActivityById(userId, input.activityId);
  const db = getDb();

  if (!activity) {
    throw new Error("Activity not found");
  }

  await db.insert(sessions).values({
    userId,
    activityId: input.activityId,
    startedAt: new Date(input.startedAt),
    endedAt: new Date(input.endedAt),
    durationSeconds: input.durationSeconds,
    source: input.source,
    phase: input.phase,
  });

  revalidatePath("/");
}

export async function createManualSessionAction(input: {
  activityId: string;
  durationMinutes: number;
}) {
  const { userId } = await requireUser();
  const activity = await getActivityById(userId, input.activityId);
  const db = getDb();

  if (!activity) {
    throw new Error("Activity not found");
  }

  const durationSeconds = Math.floor(input.durationMinutes * 60);
  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - durationSeconds * 1000);

  await db.insert(sessions).values({
    userId,
    activityId: input.activityId,
    startedAt,
    endedAt,
    durationSeconds,
    source: "manual",
    phase: "focus",
  });

  revalidatePath("/");
}

import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { activities, sessions, users } from "@/db/schema";

export async function upsertUser(input: {
  clerkUserId: string;
  email: string | null;
  name: string;
  imageUrl: string | null;
}) {
  const db = getDb();

  await db
    .insert(users)
    .values(input)
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: {
        email: input.email,
        name: input.name,
        imageUrl: input.imageUrl,
      },
    });
}

export async function getDashboardData(userId: string) {
  const db = getDb();
  const totalSecondsExpr =
    sql<number>`coalesce(sum(${sessions.durationSeconds}), 0)`.mapWith(Number);
  const sessionCountExpr =
    sql<number>`coalesce(count(${sessions.id}), 0)`.mapWith(Number);

  const results = await db
    .select({
      id: activities.id,
      name: activities.name,
      createdAt: activities.createdAt,
      totalSeconds: totalSecondsExpr,
      sessionCount: sessionCountExpr,
    })
    .from(activities)
    .leftJoin(
      sessions,
      and(eq(sessions.activityId, activities.id), eq(sessions.userId, userId)),
    )
    .where(eq(activities.userId, userId))
    .groupBy(activities.id)
    .orderBy(desc(totalSecondsExpr), activities.name);

  const grandTotalSeconds = results.reduce(
    (sum, activity) => sum + activity.totalSeconds,
    0,
  );
  const grandSessionCount = results.reduce(
    (sum, activity) => sum + activity.sessionCount,
    0,
  );

  return {
    activities: results,
    grandTotalSeconds,
    grandSessionCount,
  };
}

export async function getActivityById(userId: string, activityId: string) {
  const db = getDb();

  const [activity] = await db
    .select()
    .from(activities)
    .where(and(eq(activities.id, activityId), eq(activities.userId, userId)))
    .limit(1);

  return activity ?? null;
}

export async function ensureUserRecord(input: {
  clerkUserId: string;
  email: string | null;
  name: string;
  imageUrl: string | null;
}) {
  await upsertUser(input);
}

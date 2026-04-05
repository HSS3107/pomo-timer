CREATE TABLE "users" (
  "clerk_user_id" text PRIMARY KEY NOT NULL,
  "email" text,
  "name" text NOT NULL,
  "image_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "activities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "activities_user_id_users_clerk_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "activity_id" uuid NOT NULL,
  "started_at" timestamp with time zone NOT NULL,
  "ended_at" timestamp with time zone NOT NULL,
  "duration_seconds" integer NOT NULL,
  "source" text DEFAULT 'timer' NOT NULL,
  "phase" text DEFAULT 'focus' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "sessions_user_id_users_clerk_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("clerk_user_id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "sessions_activity_id_activities_id_fk"
    FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX "activities_user_idx" ON "activities" USING btree ("user_id");
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");
CREATE INDEX "sessions_activity_idx" ON "sessions" USING btree ("activity_id");

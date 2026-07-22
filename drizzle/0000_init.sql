CREATE TYPE "public"."block_type" AS ENUM('alongamento_dinamico', 'mobilidade', 'aquecimento', 'hipertrofia', 'wod', 'alongamento_final');--> statement-breakpoint
CREATE TYPE "public"."exercise_category" AS ENUM('hipertrofia', 'mobilidade', 'aquecimento', 'alongamento', 'wod', 'acessorio');--> statement-breakpoint
CREATE TYPE "public"."pr_kind" AS ENUM('load', 'reps', 'time');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('in_progress', 'done', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."wod_score_type" AS ENUM('time', 'rounds_reps', 'reps', 'load');--> statement-breakpoint
CREATE TYPE "public"."wod_type" AS ENUM('amrap', 'emom', 'for_time', 'tabata', 'chipper');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "block_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"order" integer NOT NULL,
	"sets" integer DEFAULT 1 NOT NULL,
	"reps" text DEFAULT '' NOT NULL,
	"rest_seconds" integer DEFAULT 90 NOT NULL,
	"target_rpe" real,
	"tempo" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "body_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"weight_kg" real,
	"body_fat_pct" real,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "exercise_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"exercise_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category" "exercise_category" NOT NULL,
	"muscles" text[] DEFAULT '{}' NOT NULL,
	"equipment" text,
	"instructions" text,
	"common_mistakes" text,
	"cadence" text,
	"video_url" text,
	"image_url" text,
	"is_neglected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exercises_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"sleep_hours" real,
	"sleep_quality" integer,
	"energy" integer,
	"mood" integer,
	"soreness" integer,
	"stress" integer,
	"water_ml" integer,
	"weight_kg" real,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "nutrition_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"calories" integer,
	"protein_g" integer,
	"carbs_g" integer,
	"fat_g" integer,
	"water_ml" integer,
	"creatine_taken" boolean DEFAULT false NOT NULL,
	"supplements" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "personal_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"exercise_id" integer NOT NULL,
	"kind" "pr_kind" DEFAULT 'load' NOT NULL,
	"value" real NOT NULL,
	"unit" text DEFAULT 'kg' NOT NULL,
	"reps" integer,
	"session_id" integer,
	"achieved_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"total_weeks" integer DEFAULT 12 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "set_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"exercise_id" integer NOT NULL,
	"block_exercise_id" integer,
	"set_number" integer NOT NULL,
	"weight_kg" real,
	"reps" integer,
	"rpe" real,
	"notes" text,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"goal" text,
	"height_cm" real,
	"target_weight_kg" real,
	"program_id" integer,
	"program_start_date" date,
	"default_rest_seconds" integer DEFAULT 90 NOT NULL,
	"sound_enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wod_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"wod_id" integer NOT NULL,
	"result_seconds" integer,
	"result_rounds" integer,
	"result_reps" integer,
	"result_text" text,
	"rx" boolean DEFAULT true NOT NULL,
	"notes" text,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wods" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" "wod_type" NOT NULL,
	"score_type" "wod_score_type" NOT NULL,
	"time_cap_seconds" integer,
	"rounds" integer,
	"interval_seconds" integer,
	"scheme" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_id" integer NOT NULL,
	"order" integer NOT NULL,
	"type" "block_type" NOT NULL,
	"title" text NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workout_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workout_id" integer NOT NULL,
	"status" "session_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" integer NOT NULL,
	"week" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"name" text NOT NULL,
	"focus" text,
	"phase" text,
	"estimated_minutes" integer DEFAULT 60 NOT NULL,
	"effort_level" integer DEFAULT 3 NOT NULL,
	"muscles" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_exercises" ADD CONSTRAINT "block_exercises_block_id_workout_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."workout_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_exercises" ADD CONSTRAINT "block_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_metrics" ADD CONSTRAINT "body_metrics_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_favorites" ADD CONSTRAINT "exercise_favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_favorites" ADD CONSTRAINT "exercise_favorites_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_logs" ADD CONSTRAINT "nutrition_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_records" ADD CONSTRAINT "personal_records_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_block_exercise_id_block_exercises_id_fk" FOREIGN KEY ("block_exercise_id") REFERENCES "public"."block_exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wod_results" ADD CONSTRAINT "wod_results_session_id_workout_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wod_results" ADD CONSTRAINT "wod_results_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wod_results" ADD CONSTRAINT "wod_results_wod_id_wods_id_fk" FOREIGN KEY ("wod_id") REFERENCES "public"."wods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wods" ADD CONSTRAINT "wods_block_id_workout_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."workout_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_blocks" ADD CONSTRAINT "workout_blocks_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "fav_user_exercise" ON "exercise_favorites" USING btree ("user_id","exercise_id");--> statement-breakpoint
CREATE UNIQUE INDEX "journal_user_date" ON "journal_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "nutrition_user_date" ON "nutrition_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "workout_program_week_day" ON "workouts" USING btree ("program_id","week","day_of_week");
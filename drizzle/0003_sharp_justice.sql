CREATE TYPE "public"."calisthenics_level" AS ENUM('iniciante', 'intermediario', 'avancado');--> statement-breakpoint
CREATE TABLE "calisthenics_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"level" "calisthenics_level" NOT NULL,
	"order" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"equipment" text,
	"muscles" text[] DEFAULT '{}' NOT NULL,
	"sets" text,
	"instructions" text,
	"common_mistakes" text,
	"video_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "calisthenics_lessons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "calisthenics_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calisthenics_progress" ADD CONSTRAINT "calisthenics_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calisthenics_progress" ADD CONSTRAINT "calisthenics_progress_lesson_id_calisthenics_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."calisthenics_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "calisthenics_user_lesson" ON "calisthenics_progress" USING btree ("user_id","lesson_id");
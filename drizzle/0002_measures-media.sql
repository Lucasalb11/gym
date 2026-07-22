CREATE TABLE "body_measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"chest_cm" real,
	"waist_cm" real,
	"hip_cm" real,
	"arm_cm" real,
	"thigh_cm" real,
	"calf_cm" real,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "substitutes" text;--> statement-breakpoint
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
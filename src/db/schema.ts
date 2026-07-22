import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Better Auth
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Biblioteca de exercícios
// ---------------------------------------------------------------------------

export const exerciseCategory = pgEnum("exercise_category", [
  "hipertrofia",
  "mobilidade",
  "aquecimento",
  "alongamento",
  "wod",
  "acessorio",
]);

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: exerciseCategory("category").notNull(),
  muscles: text("muscles").array().notNull().default([]),
  equipment: text("equipment"),
  instructions: text("instructions"),
  commonMistakes: text("common_mistakes"),
  cadence: text("cadence"),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  // Alternativa sem equipamento (ex.: remo → corrida; wall ball → thruster c/ halteres)
  substitutes: text("substitutes"),
  isNeglected: boolean("is_neglected").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exerciseFavorites = pgTable(
  "exercise_favorites",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("fav_user_exercise").on(t.userId, t.exerciseId)],
);

// ---------------------------------------------------------------------------
// Programa (12 semanas → dias → blocos → exercícios prescritos)
// ---------------------------------------------------------------------------

export const blockType = pgEnum("block_type", [
  "alongamento_dinamico",
  "mobilidade",
  "aquecimento",
  "hipertrofia",
  "wod",
  "alongamento_final",
]);

export const wodType = pgEnum("wod_type", [
  "amrap",
  "emom",
  "for_time",
  "tabata",
  "chipper",
]);

export const wodScoreType = pgEnum("wod_score_type", [
  "time",
  "rounds_reps",
  "reps",
  "load",
]);

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  totalWeeks: integer("total_weeks").notNull().default(12),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const workouts = pgTable(
  "workouts",
  {
    id: serial("id").primaryKey(),
    programId: integer("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    week: integer("week").notNull(),
    dayOfWeek: integer("day_of_week").notNull(), // 1 = segunda … 7 = domingo
    name: text("name").notNull(),
    focus: text("focus"),
    phase: text("phase"), // acumulação | intensificação | pico | deload | teste
    estimatedMinutes: integer("estimated_minutes").notNull().default(60),
    effortLevel: integer("effort_level").notNull().default(3), // 1-5
    muscles: text("muscles").array().notNull().default([]),
  },
  (t) => [uniqueIndex("workout_program_week_day").on(t.programId, t.week, t.dayOfWeek)],
);

export const workoutBlocks = pgTable("workout_blocks", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  type: blockType("type").notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
});

export const blockExercises = pgTable("block_exercises", {
  id: serial("id").primaryKey(),
  blockId: integer("block_id")
    .notNull()
    .references(() => workoutBlocks.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id),
  order: integer("order").notNull(),
  sets: integer("sets").notNull().default(1),
  reps: text("reps").notNull().default(""), // "8-10", "45s", "12/lado"
  restSeconds: integer("rest_seconds").notNull().default(90),
  targetRpe: real("target_rpe"),
  tempo: text("tempo"), // cadência, ex: "3-1-1"
  notes: text("notes"),
});

export const wods = pgTable("wods", {
  id: serial("id").primaryKey(),
  blockId: integer("block_id")
    .notNull()
    .references(() => workoutBlocks.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: wodType("type").notNull(),
  scoreType: wodScoreType("score_type").notNull(),
  timeCapSeconds: integer("time_cap_seconds"),
  rounds: integer("rounds"),
  intervalSeconds: integer("interval_seconds"), // EMOM/Tabata
  scheme: text("scheme").notNull(), // descrição completa do WOD
});

// ---------------------------------------------------------------------------
// Registro de treino
// ---------------------------------------------------------------------------

export const sessionStatus = pgEnum("session_status", [
  "in_progress",
  "done",
  "skipped",
]);

export const workoutSessions = pgTable("workout_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id),
  status: sessionStatus("status").notNull().default("in_progress"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  finishedAt: timestamp("finished_at"),
  notes: text("notes"),
});

export const setLogs = pgTable("set_logs", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => workoutSessions.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  // exerciseId denormalizado: permite séries avulsas (negligenciados) e
  // consultas de progressão/PR sem join pela prescrição
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id),
  blockExerciseId: integer("block_exercise_id").references(() => blockExercises.id),
  setNumber: integer("set_number").notNull(),
  weightKg: real("weight_kg"),
  reps: integer("reps"),
  rpe: real("rpe"),
  notes: text("notes"),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const wodResults = pgTable("wod_results", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => workoutSessions.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  wodId: integer("wod_id")
    .notNull()
    .references(() => wods.id),
  resultSeconds: integer("result_seconds"),
  resultRounds: integer("result_rounds"),
  resultReps: integer("result_reps"),
  resultText: text("result_text"),
  rx: boolean("rx").notNull().default(true),
  notes: text("notes"),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const prKind = pgEnum("pr_kind", ["load", "reps", "time"]);

export const personalRecords = pgTable("personal_records", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id),
  kind: prKind("kind").notNull().default("load"),
  value: real("value").notNull(),
  unit: text("unit").notNull().default("kg"),
  reps: integer("reps"),
  sessionId: integer("session_id").references(() => workoutSessions.id),
  achievedAt: timestamp("achieved_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Diário, corpo e nutrição
// ---------------------------------------------------------------------------

export const bodyMetrics = pgTable("body_metrics", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  weightKg: real("weight_kg"),
  bodyFatPct: real("body_fat_pct"),
  notes: text("notes"),
});

export const bodyMeasurements = pgTable("body_measurements", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  chestCm: real("chest_cm"),
  waistCm: real("waist_cm"),
  hipCm: real("hip_cm"),
  armCm: real("arm_cm"),
  thighCm: real("thigh_cm"),
  calfCm: real("calf_cm"),
  notes: text("notes"),
});

export const journalEntries = pgTable(
  "journal_entries",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    sleepHours: real("sleep_hours"),
    sleepQuality: integer("sleep_quality"), // 1-5
    energy: integer("energy"), // 1-5
    mood: integer("mood"), // 1-5
    soreness: integer("soreness"), // 1-5
    stress: integer("stress"), // 1-5
    waterMl: integer("water_ml"),
    weightKg: real("weight_kg"),
    notes: text("notes"),
  },
  (t) => [uniqueIndex("journal_user_date").on(t.userId, t.date)],
);

export const nutritionLogs = pgTable(
  "nutrition_logs",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    calories: integer("calories"),
    proteinG: integer("protein_g"),
    carbsG: integer("carbs_g"),
    fatG: integer("fat_g"),
    waterMl: integer("water_ml"),
    creatineTaken: boolean("creatine_taken").notNull().default(false),
    supplements: text("supplements"),
    notes: text("notes"),
  },
  (t) => [uniqueIndex("nutrition_user_date").on(t.userId, t.date)],
);

// Fotos de progresso: arquivo fica no Vercel Blob (ou disco em dev);
// aqui guardamos só a referência — o acesso é sempre via rota autenticada.
export const progressPhotos = pgTable("progress_photos", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  storage: text("storage").notNull(), // "blob" | "local"
  pathname: text("pathname").notNull(), // URL do blob ou caminho local
  contentType: text("content_type").notNull().default("image/jpeg"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Perfil / preferências
// ---------------------------------------------------------------------------

export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  goal: text("goal"),
  heightCm: real("height_cm"),
  targetWeightKg: real("target_weight_kg"),
  programId: integer("program_id").references(() => programs.id),
  programStartDate: date("program_start_date"),
  defaultRestSeconds: integer("default_rest_seconds").notNull().default(90),
  soundEnabled: boolean("sound_enabled").notNull().default(false),
});

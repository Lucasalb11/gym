"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import {
  bodyMeasurements,
  bodyMetrics,
  calisthenicsProgress,
  exerciseFavorites,
  journalEntries,
  nutritionLogs,
  programs,
  userProfiles,
} from "@/db/schema";
import { mondayOf, todayISO } from "@/lib/dates";
import { requireUser } from "@/lib/session";

const scale = z.number().int().min(1).max(5).nullable();

const journalSchema = z.object({
  sleepHours: z.number().min(0).max(24).nullable(),
  sleepQuality: scale,
  energy: scale,
  mood: scale,
  soreness: scale,
  stress: scale,
  waterMl: z.number().int().min(0).max(20000).nullable(),
  weightKg: z.number().min(20).max(400).nullable(),
  notes: z.string().max(1000).optional(),
});

export async function saveJournal(input: z.infer<typeof journalSchema>) {
  const user = await requireUser();
  const data = journalSchema.parse(input);
  const db = await getDb();
  const date = todayISO();

  const [existing] = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, user.id), eq(journalEntries.date, date)));

  if (existing) {
    await db.update(journalEntries).set(data).where(eq(journalEntries.id, existing.id));
  } else {
    await db.insert(journalEntries).values({ ...data, userId: user.id, date });
  }

  if (data.weightKg) {
    await db.insert(bodyMetrics).values({ userId: user.id, date, weightKg: data.weightKg });
  }
  revalidatePath("/diario");
  revalidatePath("/");
  return { ok: true };
}

const nutritionSchema = z.object({
  calories: z.number().int().min(0).max(20000).nullable(),
  proteinG: z.number().int().min(0).max(1000).nullable(),
  carbsG: z.number().int().min(0).max(2000).nullable(),
  fatG: z.number().int().min(0).max(1000).nullable(),
  waterMl: z.number().int().min(0).max(20000).nullable(),
  creatineTaken: z.boolean(),
  supplements: z.string().max(300).optional(),
  notes: z.string().max(1000).optional(),
});

export async function saveNutrition(input: z.infer<typeof nutritionSchema>) {
  const user = await requireUser();
  const data = nutritionSchema.parse(input);
  const db = await getDb();
  const date = todayISO();

  const [existing] = await db
    .select()
    .from(nutritionLogs)
    .where(and(eq(nutritionLogs.userId, user.id), eq(nutritionLogs.date, date)));

  if (existing) {
    await db.update(nutritionLogs).set(data).where(eq(nutritionLogs.id, existing.id));
  } else {
    await db.insert(nutritionLogs).values({ ...data, userId: user.id, date });
  }
  revalidatePath("/nutricao");
  return { ok: true };
}

const profileSchema = z.object({
  goal: z.string().max(200).nullable(),
  heightCm: z.number().min(100).max(250).nullable(),
  targetWeightKg: z.number().min(30).max(300).nullable(),
  defaultRestSeconds: z.number().int().min(15).max(600),
  soundEnabled: z.boolean(),
});

export async function updateProfile(input: z.infer<typeof profileSchema>) {
  const user = await requireUser();
  const data = profileSchema.parse(input);
  const db = await getDb();
  await db.update(userProfiles).set(data).where(eq(userProfiles.userId, user.id));
  revalidatePath("/perfil");
  return { ok: true };
}

/** Troca o programa ativo e reinicia a contagem de semanas na segunda-feira atual. */
export async function changeProgram(programId: number) {
  const user = await requireUser();
  const db = await getDb();
  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.id, programId));
  if (!program) return { ok: false, error: "Programa não encontrado." };
  await db
    .update(userProfiles)
    .set({ programId, programStartDate: todayISO(mondayOf()) })
    .where(eq(userProfiles.userId, user.id));
  revalidatePath("/");
  revalidatePath("/programa");
  revalidatePath("/perfil");
  return { ok: true };
}

const cm = z.number().min(10).max(300).nullable();

const measurementsSchema = z.object({
  chestCm: cm,
  waistCm: cm,
  hipCm: cm,
  armCm: cm,
  thighCm: cm,
  calfCm: cm,
  notes: z.string().max(300).optional(),
});

export async function saveMeasurements(input: z.infer<typeof measurementsSchema>) {
  const user = await requireUser();
  const data = measurementsSchema.parse(input);
  const db = await getDb();
  const date = todayISO();
  const [existing] = await db
    .select()
    .from(bodyMeasurements)
    .where(and(eq(bodyMeasurements.userId, user.id), eq(bodyMeasurements.date, date)));
  if (existing) {
    await db
      .update(bodyMeasurements)
      .set(data)
      .where(eq(bodyMeasurements.id, existing.id));
  } else {
    await db.insert(bodyMeasurements).values({ ...data, userId: user.id, date });
  }
  revalidatePath("/medidas");
  revalidatePath("/evolucao");
  return { ok: true };
}

export async function toggleFavorite(exerciseId: number) {
  const user = await requireUser();
  const db = await getDb();
  const [existing] = await db
    .select()
    .from(exerciseFavorites)
    .where(
      and(
        eq(exerciseFavorites.userId, user.id),
        eq(exerciseFavorites.exerciseId, exerciseId),
      ),
    );
  if (existing) {
    await db.delete(exerciseFavorites).where(eq(exerciseFavorites.id, existing.id));
  } else {
    await db.insert(exerciseFavorites).values({ userId: user.id, exerciseId });
  }
  revalidatePath("/biblioteca");
  return { ok: true };
}

export async function toggleLessonDone(lessonId: number) {
  const user = await requireUser();
  const db = await getDb();
  const [existing] = await db
    .select()
    .from(calisthenicsProgress)
    .where(
      and(
        eq(calisthenicsProgress.userId, user.id),
        eq(calisthenicsProgress.lessonId, lessonId),
      ),
    );
  if (existing) {
    await db.delete(calisthenicsProgress).where(eq(calisthenicsProgress.id, existing.id));
  } else {
    await db.insert(calisthenicsProgress).values({ userId: user.id, lessonId });
  }
  revalidatePath("/calistenia");
  return { ok: true };
}

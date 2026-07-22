"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import {
  personalRecords,
  setLogs,
  wodResults,
  workoutSessions,
} from "@/db/schema";
import { requireUser } from "@/lib/session";

export async function startSession(workoutId: number) {
  const user = await requireUser();
  const db = await getDb();

  const [existing] = await db
    .select()
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, user.id),
        eq(workoutSessions.workoutId, workoutId),
        eq(workoutSessions.status, "in_progress"),
      ),
    );
  if (existing) return { sessionId: existing.id };

  const [created] = await db
    .insert(workoutSessions)
    .values({ userId: user.id, workoutId })
    .returning();
  revalidatePath("/");
  return { sessionId: created.id };
}

const logSetSchema = z.object({
  sessionId: z.number().int().positive(),
  exerciseId: z.number().int().positive(),
  blockExerciseId: z.number().int().positive().nullable(),
  setNumber: z.number().int().min(1).max(30),
  weightKg: z.number().min(0).max(600).nullable(),
  reps: z.number().int().min(0).max(500).nullable(),
  rpe: z.number().min(1).max(10).nullable(),
  notes: z.string().max(500).optional(),
});

export async function logSet(input: z.infer<typeof logSetSchema>) {
  const user = await requireUser();
  const data = logSetSchema.parse(input);
  const db = await getDb();

  await db.insert(setLogs).values({ ...data, userId: user.id });

  // Detecção de PR de carga: maior peso já levantado nesse exercício
  let prAchieved = false;
  if (data.weightKg && data.reps && data.reps > 0) {
    const [best] = await db
      .select({ max: sql<number>`coalesce(max(${personalRecords.value}), 0)` })
      .from(personalRecords)
      .where(
        and(
          eq(personalRecords.userId, user.id),
          eq(personalRecords.exerciseId, data.exerciseId),
          eq(personalRecords.kind, "load"),
        ),
      );
    if (data.weightKg > Number(best?.max ?? 0)) {
      await db.insert(personalRecords).values({
        userId: user.id,
        exerciseId: data.exerciseId,
        kind: "load",
        value: data.weightKg,
        reps: data.reps,
        sessionId: data.sessionId,
      });
      prAchieved = true;
    }
  }

  return { ok: true, prAchieved };
}

const wodResultSchema = z.object({
  sessionId: z.number().int().positive(),
  wodId: z.number().int().positive(),
  resultSeconds: z.number().int().min(0).nullable(),
  resultRounds: z.number().int().min(0).nullable(),
  resultReps: z.number().int().min(0).nullable(),
  resultText: z.string().max(200).nullable(),
  rx: z.boolean(),
  notes: z.string().max(500).optional(),
});

export async function saveWodResult(input: z.infer<typeof wodResultSchema>) {
  const user = await requireUser();
  const data = wodResultSchema.parse(input);
  const db = await getDb();
  await db.insert(wodResults).values({ ...data, userId: user.id });
  return { ok: true };
}

export async function finishSession(sessionId: number, notes?: string) {
  const user = await requireUser();
  const db = await getDb();
  await db
    .update(workoutSessions)
    .set({ status: "done", finishedAt: new Date(), notes })
    .where(
      and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, user.id)),
    );
  revalidatePath("/");
  revalidatePath("/programa");
  return { ok: true };
}

/** Série avulsa (ex.: exercício negligenciado adicionado por fora do programa). */
export async function quickLogSet(input: {
  exerciseId: number;
  weightKg: number | null;
  reps: number | null;
}) {
  const user = await requireUser();
  const db = await getDb();

  // Usa a sessão ativa se existir; senão cria uma sessão avulsa no treino do dia
  let [active] = await db
    .select()
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, user.id),
        eq(workoutSessions.status, "in_progress"),
      ),
    )
    .orderBy(desc(workoutSessions.startedAt));

  if (!active) {
    const [lastDone] = await db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, user.id))
      .orderBy(desc(workoutSessions.startedAt))
      .limit(1);
    if (!lastDone) return { ok: false, error: "Comece um treino primeiro." };
    [active] = await db
      .insert(workoutSessions)
      .values({ userId: user.id, workoutId: lastDone.workoutId, status: "done", finishedAt: new Date() })
      .returning();
  }

  const [{ setNumber }] = await db
    .select({ setNumber: sql<number>`coalesce(max(${setLogs.setNumber}), 0) + 1` })
    .from(setLogs)
    .where(
      and(eq(setLogs.sessionId, active.id), eq(setLogs.exerciseId, input.exerciseId)),
    );

  await db.insert(setLogs).values({
    sessionId: active.id,
    userId: user.id,
    exerciseId: input.exerciseId,
    blockExerciseId: null,
    setNumber: Number(setNumber),
    weightKg: input.weightKg,
    reps: input.reps,
    rpe: null,
  });
  return { ok: true };
}

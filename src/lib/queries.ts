import "server-only";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  blockExercises,
  bodyMetrics,
  calisthenicsLessons,
  calisthenicsProgress,
  exerciseFavorites,
  exercises,
  journalEntries,
  nutritionLogs,
  personalRecords,
  programs,
  setLogs,
  userProfiles,
  wodResults,
  wods,
  workoutBlocks,
  workoutSessions,
  workouts,
} from "@/db/schema";
import { mondayOf, todayISO, isoDayOfWeek } from "@/lib/dates";

// ---------------------------------------------------------------------------
// Perfil / posição no programa
// ---------------------------------------------------------------------------

export async function ensureProfile(userId: string) {
  const db = await getDb();
  const existing = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId));
  if (existing[0]) return existing[0];

  const allPrograms = await db.select().from(programs);
  const program =
    allPrograms.find((p) => p.name.includes("Intermediário · Ciclo 1")) ??
    allPrograms[0];
  const [created] = await db
    .insert(userProfiles)
    .values({
      userId,
      programId: program?.id,
      programStartDate: todayISO(mondayOf()),
      goal: "Hipertrofia + condicionamento (híbrido)",
    })
    .returning();
  return created;
}

export function currentProgramWeek(programStartDate: string | null, totalWeeks = 12) {
  if (!programStartDate) return 1;
  const start = new Date(`${programStartDate}T00:00:00`);
  const diffDays = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return Math.min(Math.max(Math.floor(diffDays / 7) + 1, 1), totalWeeks);
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function getDashboardData(userId: string) {
  const db = await getDb();
  const profile = await ensureProfile(userId);
  const week = currentProgramWeek(profile.programStartDate);
  const dow = isoDayOfWeek();

  const todayWorkout = profile.programId
    ? (
        await db
          .select()
          .from(workouts)
          .where(
            and(
              eq(workouts.programId, profile.programId),
              eq(workouts.week, week),
              eq(workouts.dayOfWeek, dow),
            ),
          )
      )[0] ?? null
    : null;

  const monday = mondayOf();

  const [volumeRow] = await db
    .select({
      volume: sql<number>`coalesce(sum(${setLogs.weightKg} * ${setLogs.reps}), 0)`,
      sets: sql<number>`count(*)`,
    })
    .from(setLogs)
    .where(and(eq(setLogs.userId, userId), gte(setLogs.completedAt, monday)));

  const finished = await db
    .select({
      startedAt: workoutSessions.startedAt,
      id: workoutSessions.id,
      workoutId: workoutSessions.workoutId,
    })
    .from(workoutSessions)
    .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, "done")))
    .orderBy(desc(workoutSessions.startedAt));

  // streak: dias consecutivos com treino concluído, terminando hoje ou ontem
  const daySet = new Set(finished.map((s) => todayISO(s.startedAt)));
  let streak = 0;
  const cursor = new Date();
  if (!daySet.has(todayISO(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (daySet.has(todayISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const doneThisWeek = finished.filter((s) => s.startedAt >= monday).length;

  const [lastWeight] = await db
    .select()
    .from(bodyMetrics)
    .where(eq(bodyMetrics.userId, userId))
    .orderBy(desc(bodyMetrics.date))
    .limit(1);

  const [lastPr] = await db
    .select({
      value: personalRecords.value,
      unit: personalRecords.unit,
      achievedAt: personalRecords.achievedAt,
      exerciseName: exercises.name,
    })
    .from(personalRecords)
    .innerJoin(exercises, eq(exercises.id, personalRecords.exerciseId))
    .where(eq(personalRecords.userId, userId))
    .orderBy(desc(personalRecords.achievedAt))
    .limit(1);

  const activeSession = todayWorkout
    ? (
        await db
          .select()
          .from(workoutSessions)
          .where(
            and(
              eq(workoutSessions.userId, userId),
              eq(workoutSessions.workoutId, todayWorkout.id),
              eq(workoutSessions.status, "in_progress"),
            ),
          )
      )[0] ?? null
    : null;

  const todayDone = todayWorkout
    ? finished.some(
        (s) => s.workoutId === todayWorkout.id && todayISO(s.startedAt) === todayISO(),
      )
    : false;

  return {
    profile,
    week,
    todayWorkout,
    activeSession,
    todayDone,
    weeklyVolume: Number(volumeRow?.volume ?? 0),
    weeklySets: Number(volumeRow?.sets ?? 0),
    doneThisWeek,
    streak,
    lastSessionAt: finished[0]?.startedAt ?? null,
    bodyWeight: lastWeight?.weightKg ?? null,
    lastPr: lastPr ?? null,
  };
}

// ---------------------------------------------------------------------------
// Programa
// ---------------------------------------------------------------------------

export async function getProgramOverview(userId: string) {
  const db = await getDb();
  const profile = await ensureProfile(userId);
  if (!profile.programId) return null;

  const [program] = await db
    .select()
    .from(programs)
    .where(eq(programs.id, profile.programId));

  const allWorkouts = await db
    .select()
    .from(workouts)
    .where(eq(workouts.programId, profile.programId))
    .orderBy(asc(workouts.week), asc(workouts.dayOfWeek));

  const doneSessions = await db
    .select({ workoutId: workoutSessions.workoutId })
    .from(workoutSessions)
    .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, "done")));
  const doneIds = new Set(doneSessions.map((s) => s.workoutId));

  return {
    program,
    currentWeek: currentProgramWeek(profile.programStartDate, program.totalWeeks),
    workouts: allWorkouts.map((w) => ({ ...w, done: doneIds.has(w.id) })),
  };
}

// ---------------------------------------------------------------------------
// Detalhe do treino (blocos + exercícios + cargas anteriores)
// ---------------------------------------------------------------------------

export async function getWorkoutDetail(workoutId: number, userId: string) {
  const db = await getDb();
  const [workout] = await db.select().from(workouts).where(eq(workouts.id, workoutId));
  if (!workout) return null;

  const blocks = await db
    .select()
    .from(workoutBlocks)
    .where(eq(workoutBlocks.workoutId, workoutId))
    .orderBy(asc(workoutBlocks.order));
  const blockIds = blocks.map((b) => b.id);

  const items = blockIds.length
    ? await db
        .select({
          be: blockExercises,
          exercise: exercises,
        })
        .from(blockExercises)
        .innerJoin(exercises, eq(exercises.id, blockExercises.exerciseId))
        .where(inArray(blockExercises.blockId, blockIds))
        .orderBy(asc(blockExercises.order))
    : [];

  const wodRows = blockIds.length
    ? await db.select().from(wods).where(inArray(wods.blockId, blockIds))
    : [];

  // Última carga registrada por exercício (qualquer sessão anterior)
  const exerciseIds = [...new Set(items.map((i) => i.exercise.id))];
  const lastLogs = exerciseIds.length
    ? await db
        .select({
          exerciseId: setLogs.exerciseId,
          weightKg: setLogs.weightKg,
          reps: setLogs.reps,
          rpe: setLogs.rpe,
          completedAt: setLogs.completedAt,
        })
        .from(setLogs)
        .where(and(eq(setLogs.userId, userId), inArray(setLogs.exerciseId, exerciseIds)))
        .orderBy(desc(setLogs.completedAt))
        .limit(400)
    : [];

  // logs vêm ordenados do mais recente → o primeiro por exercício é a última carga
  const lastByExercise = new Map<number, { weightKg: number | null; reps: number | null; rpe: number | null }>();
  for (const log of lastLogs) {
    if (!lastByExercise.has(log.exerciseId)) {
      lastByExercise.set(log.exerciseId, {
        weightKg: log.weightKg,
        reps: log.reps,
        rpe: log.rpe,
      });
    }
  }

  const [activeSession] = await db
    .select()
    .from(workoutSessions)
    .where(
      and(
        eq(workoutSessions.userId, userId),
        eq(workoutSessions.workoutId, workoutId),
        eq(workoutSessions.status, "in_progress"),
      ),
    );

  const loggedSets = activeSession
    ? await db
        .select()
        .from(setLogs)
        .where(eq(setLogs.sessionId, activeSession.id))
        .orderBy(asc(setLogs.completedAt))
    : [];

  const loggedWods = activeSession
    ? await db
        .select({ wodId: wodResults.wodId })
        .from(wodResults)
        .where(eq(wodResults.sessionId, activeSession.id))
    : [];

  return {
    workout,
    blocks: blocks.map((b) => ({
      ...b,
      wod: wodRows.find((w) => w.blockId === b.id) ?? null,
      items: items
        .filter((i) => i.be.blockId === b.id)
        .map((i) => ({
          ...i.be,
          exercise: i.exercise,
          lastLog: lastByExercise.get(i.exercise.id) ?? null,
        })),
    })),
    activeSession: activeSession ?? null,
    loggedSets,
    loggedWodIds: loggedWods.map((w) => w.wodId),
  };
}

// ---------------------------------------------------------------------------
// Evolução
// ---------------------------------------------------------------------------

export async function getEvolutionData(userId: string) {
  const db = await getDb();
  const logs = await db
    .select({
      weightKg: setLogs.weightKg,
      reps: setLogs.reps,
      completedAt: setLogs.completedAt,
      exerciseId: setLogs.exerciseId,
    })
    .from(setLogs)
    .where(eq(setLogs.userId, userId))
    .orderBy(asc(setLogs.completedAt));

  const byWeek = new Map<string, { volume: number; sets: number }>();
  for (const log of logs) {
    const weekKey = todayISO(mondayOf(log.completedAt));
    const cur = byWeek.get(weekKey) ?? { volume: 0, sets: 0 };
    cur.volume += (log.weightKg ?? 0) * (log.reps ?? 0);
    cur.sets += 1;
    byWeek.set(weekKey, cur);
  }

  const weights = await db
    .select()
    .from(bodyMetrics)
    .where(eq(bodyMetrics.userId, userId))
    .orderBy(asc(bodyMetrics.date));

  const journalWeights = await db
    .select({ date: journalEntries.date, weightKg: journalEntries.weightKg })
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(asc(journalEntries.date));

  const weightSeries = [
    ...weights.filter((w) => w.weightKg != null).map((w) => ({ date: w.date, weightKg: w.weightKg! })),
    ...journalWeights.filter((w) => w.weightKg != null).map((w) => ({ date: w.date, weightKg: w.weightKg! })),
  ]
    .sort((a, b) => a.date.localeCompare(b.date));

  const prs = await db
    .select({
      id: personalRecords.id,
      value: personalRecords.value,
      unit: personalRecords.unit,
      reps: personalRecords.reps,
      achievedAt: personalRecords.achievedAt,
      exerciseName: exercises.name,
    })
    .from(personalRecords)
    .innerJoin(exercises, eq(exercises.id, personalRecords.exerciseId))
    .where(eq(personalRecords.userId, userId))
    .orderBy(desc(personalRecords.achievedAt))
    .limit(20);

  const wodDone = await db
    .select({
      resultSeconds: wodResults.resultSeconds,
      resultRounds: wodResults.resultRounds,
      resultReps: wodResults.resultReps,
      completedAt: wodResults.completedAt,
      name: wods.name,
    })
    .from(wodResults)
    .innerJoin(wods, eq(wods.id, wodResults.wodId))
    .where(eq(wodResults.userId, userId))
    .orderBy(desc(wodResults.completedAt))
    .limit(30);

  const sessions = await db
    .select({ startedAt: workoutSessions.startedAt })
    .from(workoutSessions)
    .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, "done")))
    .orderBy(asc(workoutSessions.startedAt));

  // Força: evolução da melhor carga dos 4 principais
  const db2 = await getDb();
  const mains = await db2
    .select({ id: exercises.id, name: exercises.name, slug: exercises.slug })
    .from(exercises)
    .where(
      inArray(exercises.slug, [
        "agachamento-livre",
        "supino-reto",
        "levantamento-terra",
        "barra-fixa",
      ]),
    );
  const strengthSeries = mains.map((m) => {
    const best = new Map<string, number>();
    for (const log of logs) {
      if (log.exerciseId !== m.id || !log.weightKg) continue;
      const weekKey = todayISO(mondayOf(log.completedAt));
      best.set(weekKey, Math.max(best.get(weekKey) ?? 0, log.weightKg));
    }
    return {
      name: m.name,
      slug: m.slug,
      points: [...best.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([week, weightKg]) => ({ week, weightKg })),
    };
  });

  return {
    volumeByWeek: [...byWeek.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, v]) => ({ week, ...v })),
    weightSeries,
    prs,
    wodDone,
    trainedDays: sessions.map((s) => todayISO(s.startedAt)),
    strengthSeries,
  };
}

// ---------------------------------------------------------------------------
// Biblioteca / negligenciados
// ---------------------------------------------------------------------------

export async function getLibrary(userId: string) {
  const db = await getDb();
  const all = await db.select().from(exercises).orderBy(asc(exercises.name));
  const favs = await db
    .select({ exerciseId: exerciseFavorites.exerciseId })
    .from(exerciseFavorites)
    .where(eq(exerciseFavorites.userId, userId));
  const favSet = new Set(favs.map((f) => f.exerciseId));
  return all.map((e) => ({ ...e, favorite: favSet.has(e.id) }));
}

// ---------------------------------------------------------------------------
// Calistenia
// ---------------------------------------------------------------------------

export async function getCalisthenicsRoadmap(userId: string) {
  const db = await getDb();
  const lessons = await db
    .select()
    .from(calisthenicsLessons)
    .orderBy(asc(calisthenicsLessons.order));
  const done = await db
    .select({ lessonId: calisthenicsProgress.lessonId })
    .from(calisthenicsProgress)
    .where(eq(calisthenicsProgress.userId, userId));
  const doneSet = new Set(done.map((d) => d.lessonId));
  return lessons.map((l) => ({ ...l, done: doneSet.has(l.id) }));
}

// ---------------------------------------------------------------------------
// Diário / nutrição / perfil
// ---------------------------------------------------------------------------

export async function getTodayJournal(userId: string) {
  const db = await getDb();
  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.userId, userId), eq(journalEntries.date, todayISO())));
  const recent = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.date))
    .limit(14);
  return { today: entry ?? null, recent };
}

export async function getTodayNutrition(userId: string) {
  const db = await getDb();
  const [entry] = await db
    .select()
    .from(nutritionLogs)
    .where(and(eq(nutritionLogs.userId, userId), eq(nutritionLogs.date, todayISO())));
  const recent = await db
    .select()
    .from(nutritionLogs)
    .where(eq(nutritionLogs.userId, userId))
    .orderBy(desc(nutritionLogs.date))
    .limit(14);
  return { today: entry ?? null, recent };
}

export async function getProfileData(userId: string) {
  const db = await getDb();
  const profile = await ensureProfile(userId);
  const [latestWeight] = await db
    .select()
    .from(bodyMetrics)
    .where(eq(bodyMetrics.userId, userId))
    .orderBy(desc(bodyMetrics.date))
    .limit(1);
  const prs = await db
    .select({
      value: personalRecords.value,
      unit: personalRecords.unit,
      reps: personalRecords.reps,
      achievedAt: personalRecords.achievedAt,
      exerciseName: exercises.name,
    })
    .from(personalRecords)
    .innerJoin(exercises, eq(exercises.id, personalRecords.exerciseId))
    .where(eq(personalRecords.userId, userId))
    .orderBy(desc(personalRecords.value))
    .limit(10);
  return { profile, latestWeight: latestWeight ?? null, prs };
}

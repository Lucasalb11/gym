import { notFound } from "next/navigation";
import { WorkoutPlayer } from "@/components/player/workout-player";
import { ensureProfile, getWorkoutDetail } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import type { PlayerData } from "@/lib/workout-types";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const workoutId = Number(id);
  if (!Number.isInteger(workoutId)) notFound();

  const [detail, profile] = await Promise.all([
    getWorkoutDetail(workoutId, user.id),
    ensureProfile(user.id),
  ]);
  if (!detail) notFound();

  const data: PlayerData = {
    workout: {
      id: detail.workout.id,
      name: detail.workout.name,
      focus: detail.workout.focus,
      week: detail.workout.week,
      phase: detail.workout.phase,
      estimatedMinutes: detail.workout.estimatedMinutes,
      effortLevel: detail.workout.effortLevel,
      muscles: detail.workout.muscles,
    },
    blocks: detail.blocks.map((b) => ({
      id: b.id,
      order: b.order,
      type: b.type,
      title: b.title,
      wod: b.wod,
      items: b.items.map((i) => ({
        id: i.id,
        exerciseId: i.exerciseId,
        order: i.order,
        sets: i.sets,
        reps: i.reps,
        restSeconds: i.restSeconds,
        targetRpe: i.targetRpe,
        tempo: i.tempo,
        notes: i.notes,
        lastLog: i.lastLog,
        exercise: {
          id: i.exercise.id,
          slug: i.exercise.slug,
          name: i.exercise.name,
          category: i.exercise.category,
          muscles: i.exercise.muscles,
          equipment: i.exercise.equipment,
          instructions: i.exercise.instructions,
          commonMistakes: i.exercise.commonMistakes,
          cadence: i.exercise.cadence,
          isNeglected: i.exercise.isNeglected,
        },
      })),
    })),
    sessionId: detail.activeSession?.id ?? null,
    sessionStartedAt: detail.activeSession?.startedAt.toISOString() ?? null,
    loggedSets: detail.loggedSets.map((s) => ({
      blockExerciseId: s.blockExerciseId,
      exerciseId: s.exerciseId,
      setNumber: s.setNumber,
      weightKg: s.weightKg,
      reps: s.reps,
    })),
    loggedWodIds: detail.loggedWodIds,
    defaultRestSeconds: profile.defaultRestSeconds,
    soundEnabled: profile.soundEnabled,
  };

  return <WorkoutPlayer {...data} />;
}

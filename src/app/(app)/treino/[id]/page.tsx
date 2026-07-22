import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Flame, Play } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getWorkoutDetail } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { BLOCK_LABEL } from "@/lib/workout-types";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const workoutId = Number(id);
  if (!Number.isInteger(workoutId)) notFound();

  const detail = await getWorkoutDetail(workoutId, user.id);
  if (!detail) notFound();
  const { workout, blocks } = detail;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar">
          <Link href={`/programa/${workout.week}`}>
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
        </Button>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Semana {workout.week} · {workout.phase}
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight">
            {workout.name}
          </h1>
          {workout.focus && (
            <p className="mt-1 text-sm text-muted-foreground">{workout.focus}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />~{workout.estimatedMinutes} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Flame className="size-4" aria-hidden />
              esforço {workout.effortLevel}/5
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {workout.muscles.map((m) => (
              <Badge key={m} variant="secondary" className="font-normal">
                {m}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      <Button asChild size="lg" className="h-12 rounded-full text-base">
        <Link href={`/treino/${workout.id}/play`}>
          <Play className="size-5" aria-hidden />
          {detail.activeSession ? "Continuar treino" : "Começar treino"}
        </Link>
      </Button>

      <Accordion
        type="multiple"
        defaultValue={blocks.map((b) => `block-${b.id}`)}
        className="flex flex-col gap-2"
      >
        {blocks.map((block) => (
          <AccordionItem
            key={block.id}
            value={`block-${block.id}`}
            className="rounded-xl border border-border bg-card px-4"
          >
            <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
              {BLOCK_LABEL[block.type]}
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {block.wod ? (
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium">{block.wod.name}</span>
                    <Badge variant="secondary" className="uppercase">
                      {block.wod.type.replace("_", " ")}
                    </Badge>
                    {block.wod.timeCapSeconds && (
                      <Badge variant="secondary" className="font-mono tabular-nums">
                        cap {Math.round(block.wod.timeCapSeconds / 60)}′
                      </Badge>
                    )}
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-secondary/50 p-3 font-sans text-sm leading-relaxed">
                    {block.wod.scheme}
                  </pre>
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-border">
                  {block.items.map((item) => (
                    <li key={item.id} className="flex items-baseline justify-between gap-3 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{item.exercise.name}</p>
                        {block.type === "hipertrofia" && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.targetRpe ? `RPE ${item.targetRpe}` : ""}
                            {item.tempo ? ` · cadência ${item.tempo}` : ""}
                            {` · descanso ${item.restSeconds}s`}
                            {item.lastLog?.weightKg != null &&
                              ` · anterior ${item.lastLog.weightKg} kg`}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                        {block.type === "hipertrofia"
                          ? `${item.sets}× ${item.reps}`
                          : item.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

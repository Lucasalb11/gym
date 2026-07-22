"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Circle } from "lucide-react";
import { toggleLessonDone } from "@/actions/tracking";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { VideoEmbed } from "@/components/video-embed";
import { cn } from "@/lib/utils";

type Lesson = {
  id: number;
  slug: string;
  level: "iniciante" | "intermediario" | "avancado";
  order: number;
  title: string;
  description: string | null;
  equipment: string | null;
  muscles: string[];
  sets: string | null;
  instructions: string | null;
  commonMistakes: string | null;
  videoUrl: string | null;
  done: boolean;
};

const LEVELS: { value: Lesson["level"]; label: string }[] = [
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

export function CalisthenicsRoadmap({ lessons }: { lessons: Lesson[] }) {
  const [level, setLevel] = useState<Lesson["level"]>("iniciante");
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [done, setDone] = useState<Set<number>>(
    () => new Set(lessons.filter((l) => l.done).map((l) => l.id)),
  );
  const [, startTransition] = useTransition();

  const byLevel = useMemo(
    () => lessons.filter((l) => l.level === level).sort((a, b) => a.order - b.order),
    [lessons, level],
  );

  const progressByLevel = useMemo(() => {
    const map = new Map<Lesson["level"], { total: number; done: number }>();
    for (const l of lessons) {
      const cur = map.get(l.level) ?? { total: 0, done: 0 };
      cur.total++;
      if (done.has(l.id)) cur.done++;
      map.set(l.level, cur);
    }
    return map;
  }, [lessons, done]);

  function handleToggle(lessonId: number) {
    setDone((s) => {
      const next = new Set(s);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
    startTransition(() => {
      toggleLessonDone(lessonId);
    });
  }

  const currentStats = progressByLevel.get(level) ?? { total: 0, done: 0 };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Filtrar por nível"
      >
        {LEVELS.map((l) => {
          const stats = progressByLevel.get(l.value) ?? { total: 0, done: 0 };
          return (
            <button
              key={l.value}
              type="button"
              role="tab"
              aria-selected={level === l.value}
              onClick={() => setLevel(l.value)}
              className={cn(
                "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                level === l.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
              <span
                className={cn(
                  "font-mono text-xs tabular-nums",
                  level === l.value
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground/70",
                )}
              >
                {stats.done}/{stats.total}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Progress
          value={(currentStats.done / Math.max(currentStats.total, 1)) * 100}
          className="h-1.5"
          aria-label={`${currentStats.done} de ${currentStats.total} aulas concluídas`}
        />
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {currentStats.done}/{currentStats.total}
        </span>
      </div>

      <ol className="relative flex flex-col gap-3">
        {byLevel.map((lesson, i) => {
          const isDone = done.has(lesson.id);
          const isLast = i === byLevel.length - 1;
          return (
            <li key={lesson.id} className="relative flex gap-3">
              {!isLast && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-[15px] top-9 h-[calc(100%-16px)] w-0.5",
                    isDone ? "bg-primary/50" : "bg-border",
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => handleToggle(lesson.id)}
                aria-label={
                  isDone
                    ? `Desmarcar ${lesson.title} como concluída`
                    : `Marcar ${lesson.title} como concluída`
                }
                aria-pressed={isDone}
                className={cn(
                  "relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50",
                )}
              >
                {isDone ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Circle className="size-3 fill-current" aria-hidden />
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelected(lesson)}
                className="flex-1 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card
                  className={cn(
                    "transition-colors hover:bg-accent/50",
                    isDone && "border-primary/30 bg-primary/5",
                  )}
                >
                  <CardContent className="p-3">
                    <p className={cn("font-medium", isDone && "text-muted-foreground line-through")}>
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {lesson.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {lesson.sets && (
                        <Badge variant="secondary" className="font-mono tabular-nums">
                          {lesson.sets}
                        </Badge>
                      )}
                      {lesson.equipment && (
                        <Badge variant="secondary">{lesson.equipment}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </button>
            </li>
          );
        })}
      </ol>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.muscles.join(", ")}
                  {selected.equipment ? ` · ${selected.equipment}` : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 text-sm">
                {selected.sets && (
                  <p>
                    <span className="font-medium">Séries: </span>
                    <span className="font-mono tabular-nums">{selected.sets}</span>
                  </p>
                )}
                {selected.instructions && (
                  <p>
                    <span className="font-medium">Execução: </span>
                    {selected.instructions}
                  </p>
                )}
                {selected.commonMistakes && (
                  <p>
                    <span className="font-medium">Erros comuns: </span>
                    {selected.commonMistakes}
                  </p>
                )}
                {selected.videoUrl && (
                  <VideoEmbed url={selected.videoUrl} title={selected.title} />
                )}
                <button
                  type="button"
                  onClick={() => handleToggle(selected.id)}
                  className={cn(
                    "flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    done.has(selected.id)
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border hover:bg-accent",
                  )}
                >
                  {done.has(selected.id) ? (
                    <>
                      <Check className="size-4" aria-hidden />
                      Concluída
                    </>
                  ) : (
                    "Marcar como concluída"
                  )}
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProgramOverview } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Programa" };

const PHASE_BY_WEEK = (week: number) => {
  if (week === 4 || week === 8) return "Deload";
  if (week <= 3) return "Acumulação";
  if (week <= 7) return "Intensificação";
  if (week <= 11) return "Pico";
  return "Teste / PR";
};

export default async function ProgramPage() {
  const user = await requireUser();
  const data = await getProgramOverview(user.id);
  if (!data) return null;

  const byWeek = new Map<number, { total: number; done: number }>();
  for (const w of data.workouts) {
    const cur = byWeek.get(w.week) ?? { total: 0, done: 0 };
    cur.total++;
    if (w.done) cur.done++;
    byWeek.set(w.week, cur);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Programa</h1>
        <p className="mt-1 text-sm text-muted-foreground">{data.program.name}</p>
      </header>

      <ul className="flex flex-col gap-3">
        {Array.from({ length: data.program.totalWeeks }, (_, i) => i + 1).map(
          (week) => {
            const stats = byWeek.get(week) ?? { total: 0, done: 0 };
            const isCurrent = week === data.currentWeek;
            return (
              <li key={week}>
                <Link
                  href={`/programa/${week}`}
                  className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card
                    className={cn(
                      "transition-colors hover:bg-accent/50",
                      isCurrent && "border-primary/40",
                    )}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Semana {week}</span>
                          {isCurrent && <Badge>Atual</Badge>}
                          <Badge variant="secondary" className="font-normal">
                            {PHASE_BY_WEEK(week)}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <Progress
                            value={(stats.done / Math.max(stats.total, 1)) * 100}
                            className="h-1.5"
                            aria-label={`${stats.done} de ${stats.total} treinos concluídos`}
                          />
                          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                            {stats.done}/{stats.total}
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        className="size-5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          },
        )}
      </ul>
    </div>
  );
}

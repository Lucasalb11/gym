import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WEEKDAY_LABELS } from "@/lib/dates";
import { getProgramOverview } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export default async function WeekPage({
  params,
}: {
  params: Promise<{ week: string }>;
}) {
  const { week: weekParam } = await params;
  const week = Number(weekParam);
  const user = await requireUser();
  const data = await getProgramOverview(user.id);
  if (!data || !Number.isInteger(week) || week < 1 || week > data.program.totalWeeks)
    notFound();

  const days = data.workouts.filter((w) => w.week === week);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Voltar ao programa">
          <Link href="/programa">
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Semana {week}</h1>
          <p className="text-sm capitalize text-muted-foreground">
            {days[0]?.phase ?? ""}
          </p>
        </div>
      </header>

      <ul className="flex flex-col gap-3">
        {days.map((w) => (
          <li key={w.id}>
            <Link
              href={`/treino/${w.id}`}
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {WEEKDAY_LABELS[w.dayOfWeek]}
                    </p>
                    <p className="mt-0.5 font-medium">{w.name}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden />~
                        {w.estimatedMinutes} min
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Flame className="size-3.5" aria-hidden />
                        esforço {w.effortLevel}/5
                      </span>
                    </p>
                  </div>
                  {w.done ? (
                    <Badge className="gap-1">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                      Feito
                    </Badge>
                  ) : (
                    <ChevronRight
                      className="size-5 text-muted-foreground"
                      aria-hidden
                    />
                  )}
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

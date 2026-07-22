import Link from "next/link";
import {
  Activity,
  BookHeart,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  NotebookPen,
  Play,
  Scale,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { WEEKDAY_LABELS } from "@/lib/dates";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const EFFORT_LABEL: Record<number, string> = {
  1: "Muito leve",
  2: "Leve",
  3: "Moderado",
  4: "Pesado",
  5: "Máximo",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  const firstName = user.name?.split(" ")[0] ?? "atleta";
  const w = data.todayWorkout;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-sm text-muted-foreground">
          Semana {data.week} de 12 · {WEEKDAY_LABELS[new Date().getDay() === 0 ? 7 : new Date().getDay()]}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {greeting()}, {firstName}.
        </h1>
      </header>

      {/* Treino de hoje */}
      {w ? (
        <Card className="border-primary/20 bg-gradient-to-b from-primary/10 to-card">
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  Treino de hoje
                </p>
                <h2 className="mt-1 text-xl font-semibold">{w.name}</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">{w.focus}</p>
              </div>
              {data.todayDone && (
                <Badge className="shrink-0 gap-1">
                  <CheckCircle2 className="size-3.5" aria-hidden /> Concluído
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" aria-hidden />
                ~{w.estimatedMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Flame className="size-4" aria-hidden />
                {EFFORT_LABEL[w.effortLevel]}
              </span>
              <span className="capitalize">{w.phase}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {w.muscles.map((m) => (
                <Badge key={m} variant="secondary" className="font-normal">
                  {m}
                </Badge>
              ))}
            </div>

            {!data.todayDone && (
              <Button asChild size="lg" className="mt-1 h-12 rounded-full text-base">
                <Link href={`/treino/${w.id}/play`}>
                  <Play className="size-5" aria-hidden />
                  {data.activeSession ? "Continuar treino" : "Começar treino"}
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="self-center">
              <Link href={`/treino/${w.id}`}>Ver detalhes do treino</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
            <Dumbbell className="size-8 text-muted-foreground" aria-hidden />
            <p className="font-medium">Hoje é dia de descanso</p>
            <p className="text-sm text-muted-foreground">
              Aproveite para caminhar, alongar e dormir bem. O próximo treino
              aparece aqui automaticamente.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/programa">Ver programa</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Métricas */}
      <section aria-label="Resumo" className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Activity className="size-4" aria-hidden />}
          label="Volume semanal"
          value={
            data.weeklyVolume >= 1000
              ? `${(data.weeklyVolume / 1000).toFixed(1)} t`
              : `${Math.round(data.weeklyVolume)} kg`
          }
          hint={`${data.weeklySets} séries`}
        />
        <StatCard
          icon={<Flame className="size-4" aria-hidden />}
          label="Sequência"
          value={`${data.streak} ${data.streak === 1 ? "dia" : "dias"}`}
          hint={`${data.doneThisWeek}/5 treinos na semana`}
        />
        <StatCard
          icon={<Scale className="size-4" aria-hidden />}
          label="Peso corporal"
          value={data.bodyWeight ? `${data.bodyWeight.toFixed(1)} kg` : "—"}
          hint={data.bodyWeight ? "último registro" : "registre no diário"}
        />
        <StatCard
          icon={<Trophy className="size-4" aria-hidden />}
          label="Último PR"
          value={data.lastPr ? `${data.lastPr.value} ${data.lastPr.unit}` : "—"}
          hint={data.lastPr?.exerciseName ?? "ainda sem PRs"}
        />
      </section>

      {/* Atalhos */}
      <section aria-label="Atalhos" className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="h-auto justify-start gap-3 p-4">
          <Link href="/diario">
            <NotebookPen className="size-5 text-primary" aria-hidden />
            <span className="flex flex-col items-start">
              <span className="font-medium">Diário</span>
              <span className="text-xs text-muted-foreground">
                sono, energia, peso
              </span>
            </span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start gap-3 p-4">
          <Link href="/negligenciados">
            <BookHeart className="size-5 text-primary" aria-hidden />
            <span className="flex flex-col items-start">
              <span className="font-medium">Negligenciados</span>
              <span className="text-xs text-muted-foreground">
                tibial, manguito, core…
              </span>
            </span>
          </Link>
        </Button>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="font-mono text-xl font-semibold tabular-nums">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </CardContent>
    </Card>
  );
}

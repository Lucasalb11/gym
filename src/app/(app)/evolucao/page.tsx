import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { CalendarCheck, Camera, Ruler, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  StrengthChart,
  VolumeChart,
  WeightChart,
} from "@/components/evolution-charts";
import { getDb } from "@/db";
import { progressPhotos } from "@/db/schema";
import { formatSeconds, mondayOf, todayISO } from "@/lib/dates";
import { ensureProfile, getEvolutionData } from "@/lib/queries";
import { requireUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Evolução" };

function imcOf(weightKg: number | null, heightCm: number | null) {
  if (!weightKg || !heightCm) return null;
  const imc = weightKg / (heightCm / 100) ** 2;
  const label =
    imc < 18.5
      ? "abaixo do peso"
      : imc < 25
        ? "faixa saudável"
        : imc < 30
          ? "sobrepeso"
          : "obesidade";
  return { value: imc, label };
}

export default async function EvolutionPage() {
  const user = await requireUser();
  const [data, profile, db] = await Promise.all([
    getEvolutionData(user.id),
    ensureProfile(user.id),
    getDb(),
  ]);
  const photos = await db
    .select({ id: progressPhotos.id, date: progressPhotos.date })
    .from(progressPhotos)
    .where(eq(progressPhotos.userId, user.id))
    .orderBy(desc(progressPhotos.createdAt))
    .limit(4);
  const latestWeight = data.weightSeries.at(-1)?.weightKg ?? null;
  const imc = imcOf(latestWeight, profile.heightCm);

  const wodTimes = data.wodDone.filter((w) => w.resultSeconds != null);
  const avgWod =
    wodTimes.length > 0
      ? Math.round(
          wodTimes.reduce((acc, w) => acc + (w.resultSeconds ?? 0), 0) /
            wodTimes.length,
        )
      : null;

  // Frequência: últimas 8 semanas, seg→dom
  const trained = new Set(data.trainedDays);
  const start = mondayOf();
  start.setDate(start.getDate() - 7 * 7);
  const weeks: string[][] = [];
  for (let w = 0; w < 8; w++) {
    const days: string[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      days.push(todayISO(day));
    }
    weeks.push(days);
  }
  const today = todayISO();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Evolução</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Seu progresso ao longo do programa.
        </p>
      </header>

      {/* Tiles */}
      <section aria-label="Resumo" className="grid grid-cols-3 gap-3">
        <Tile
          icon={<CalendarCheck className="size-4" aria-hidden />}
          label="Dias treinados"
          value={String(new Set(data.trainedDays).size)}
        />
        <Tile
          icon={<Trophy className="size-4" aria-hidden />}
          label="PRs"
          value={String(data.prs.length)}
        />
        <Tile
          icon={<Timer className="size-4" aria-hidden />}
          label="Média WOD"
          value={avgWod != null ? formatSeconds(avgWod) : "—"}
        />
      </section>

      <ChartCard title="Volume semanal" subtitle="Carga total levantada (kg × reps)">
        <VolumeChart data={data.volumeByWeek} />
      </ChartCard>

      <ChartCard title="Peso corporal" subtitle="Registros do diário">
        <WeightChart data={data.weightSeries} />
      </ChartCard>

      {/* Corpo: IMC, medidas e fotos */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Corpo</h2>
              <p className="text-xs text-muted-foreground">
                IMC, medidas e fotos de progresso
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/medidas">
                  <Ruler className="size-4" aria-hidden />
                  Medidas
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/fotos">
                  <Camera className="size-4" aria-hidden />
                  Fotos
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground">Peso atual</p>
              <p className="font-mono text-xl font-semibold tabular-nums">
                {latestWeight ? `${latestWeight.toFixed(1)} kg` : "—"}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground">IMC</p>
              <p className="font-mono text-xl font-semibold tabular-nums">
                {imc ? imc.value.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {imc
                  ? imc.label
                  : !profile.heightCm
                    ? "cadastre sua altura no perfil"
                    : "registre seu peso no diário"}
              </p>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.map((p) => (
                <Link
                  key={p.id}
                  href="/fotos"
                  className="overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/photos/${p.id}/file`}
                    alt={`Foto de progresso de ${new Date(`${p.date}T12:00:00`).toLocaleDateString("pt-BR")}`}
                    className="aspect-[3/4] w-full object-cover"
                    loading="lazy"
                  />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ChartCard
        title="Força"
        subtitle="Melhor carga da semana nos exercícios principais"
      >
        <StrengthChart series={data.strengthSeries} />
      </ChartCard>

      {/* Frequência */}
      <ChartCard title="Frequência" subtitle="Últimas 8 semanas">
        <div className="flex flex-col gap-1.5" aria-label="Calendário de dias treinados">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex gap-1.5">
              {week.map((day) => (
                <div
                  key={day}
                  title={new Date(`${day}T12:00:00`).toLocaleDateString("pt-BR")}
                  className={cn(
                    "h-6 flex-1 rounded",
                    trained.has(day)
                      ? "bg-primary"
                      : day > today
                        ? "bg-secondary/40"
                        : "bg-secondary",
                    day === today && "ring-2 ring-ring",
                  )}
                />
              ))}
            </div>
          ))}
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>
        </div>
      </ChartCard>

      {/* PRs */}
      <section aria-label="Recordes pessoais" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Recordes pessoais
        </h2>
        {data.prs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhum PR ainda — eles são detectados automaticamente quando você
              registra uma carga maior que todas as anteriores.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.prs.map((pr) => (
              <li key={pr.id}>
                <Card>
                  <CardContent className="flex items-center gap-3 p-3">
                    <Trophy className="size-4 shrink-0 text-primary" aria-hidden />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{pr.exerciseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {pr.achievedAt.toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {pr.value} {pr.unit}
                      {pr.reps ? ` × ${pr.reps}` : ""}
                    </span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* WODs recentes */}
      <section aria-label="WODs recentes" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          WODs recentes
        </h2>
        {data.wodDone.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Os resultados dos seus WODs aparecem aqui.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.wodDone.map((w, i) => (
              <li key={i}>
                <Card>
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{w.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.completedAt.toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {w.resultSeconds != null
                        ? formatSeconds(w.resultSeconds)
                        : w.resultRounds != null
                          ? `${w.resultRounds} rds${w.resultReps ? ` +${w.resultReps}` : ""}`
                          : (w.resultReps ?? "—")}
                    </span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-3">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="font-mono text-lg font-semibold tabular-nums">{value}</span>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold">{title}</h2>
        <p className="mb-3 text-xs text-muted-foreground">{subtitle}</p>
        {children}
      </CardContent>
    </Card>
  );
}

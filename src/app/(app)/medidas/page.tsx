import type { Metadata } from "next";
import { asc, desc, eq } from "drizzle-orm";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MeasurementsForm } from "@/components/measurements-form";
import { getDb } from "@/db";
import { bodyMeasurements } from "@/db/schema";
import { todayISO } from "@/lib/dates";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Medidas" };

const LABELS: [keyof MeasureRow, string][] = [
  ["chestCm", "Peito"],
  ["waistCm", "Cintura"],
  ["hipCm", "Quadril"],
  ["armCm", "Braço"],
  ["thighCm", "Coxa"],
  ["calfCm", "Panturrilha"],
];

type MeasureRow = {
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
};

export default async function MeasurementsPage() {
  const user = await requireUser();
  const db = await getDb();
  const all = await db
    .select()
    .from(bodyMeasurements)
    .where(eq(bodyMeasurements.userId, user.id))
    .orderBy(asc(bodyMeasurements.date));

  const first = all[0] ?? null;
  const latest = all[all.length - 1] ?? null;
  const today = all.find((m) => m.date === todayISO()) ?? null;
  const recent = [...all].reverse().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Medidas corporais</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Peito, cintura, quadril, braço, coxa e panturrilha — 1× por semana já
          conta a história.
        </p>
      </header>

      <MeasurementsForm
        initial={
          today
            ? {
                chestCm: today.chestCm,
                waistCm: today.waistCm,
                hipCm: today.hipCm,
                armCm: today.armCm,
                thighCm: today.thighCm,
                calfCm: today.calfCm,
              }
            : null
        }
      />

      {latest && first && latest.id !== first.id && (
        <section aria-label="Evolução desde a primeira medição">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Desde a primeira medição
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LABELS.map(([key, label]) => {
              const from = first[key] as number | null;
              const to = latest[key] as number | null;
              if (from == null || to == null) return null;
              const delta = to - from;
              return (
                <Card key={key}>
                  <CardContent className="flex flex-col gap-0.5 p-3">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="font-mono text-lg font-semibold tabular-nums">
                      {to.toFixed(1)}
                    </span>
                    {delta !== 0 && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                        {delta > 0 ? (
                          <ArrowUp className="size-3" aria-hidden />
                        ) : (
                          <ArrowDown className="size-3" aria-hidden />
                        )}
                        {Math.abs(delta).toFixed(1)} cm
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section aria-label="Histórico" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Histórico</h2>
        {recent.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma medição ainda. Registre a primeira acima — é a sua linha
              de base.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((m) => (
              <li key={m.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1 p-3 text-sm">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {new Date(`${m.date}T12:00:00`).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    {LABELS.map(([key, label]) =>
                      m[key] != null ? (
                        <span key={key} className="font-mono tabular-nums">
                          {label.toLowerCase()} {(m[key] as number).toFixed(1)}
                        </span>
                      ) : null,
                    )}
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

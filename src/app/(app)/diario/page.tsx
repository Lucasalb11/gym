import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { JournalForm } from "@/components/journal-form";
import { getTodayJournal } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Diário" };

export default async function JournalPage() {
  const user = await requireUser();
  const { today, recent } = await getTodayJournal(user.id);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Diário</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sono, energia e recuperação — 30 segundos por dia.
        </p>
      </header>

      <JournalForm
        initial={
          today
            ? {
                sleepHours: today.sleepHours,
                sleepQuality: today.sleepQuality,
                energy: today.energy,
                mood: today.mood,
                soreness: today.soreness,
                stress: today.stress,
                waterMl: today.waterMl,
                weightKg: today.weightKg,
                notes: today.notes ?? "",
              }
            : null
        }
      />

      <section aria-label="Últimos registros" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Últimos 14 dias
        </h2>
        {recent.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Nenhum registro ainda. Preencha o de hoje acima — leva menos de um
              minuto.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((e) => (
              <li key={e.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-1 p-3 text-sm">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {new Date(`${e.date}T12:00:00`).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    {e.sleepHours != null && <span>😴 {e.sleepHours}h</span>}
                    {e.energy != null && <span>⚡ {e.energy}/5</span>}
                    {e.mood != null && <span>🙂 {e.mood}/5</span>}
                    {e.soreness != null && <span>💢 dor {e.soreness}/5</span>}
                    {e.weightKg != null && (
                      <span className="font-mono tabular-nums">
                        ⚖️ {e.weightKg.toFixed(1)} kg
                      </span>
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

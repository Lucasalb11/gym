import type { Metadata } from "next";
import { NutritionForm } from "@/components/nutrition-form";
import { RecipeBrowser } from "@/components/recipe-browser";
import { getProfileData, getTodayNutrition } from "@/lib/queries";
import { nutritionTargets } from "@/lib/recipes";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Nutrição" };

export default async function NutritionPage() {
  const user = await requireUser();
  const [{ today }, { latestWeight }] = await Promise.all([
    getTodayNutrition(user.id),
    getProfileData(user.id),
  ]);
  const targets = nutritionTargets(latestWeight?.weightKg ?? null);

  const macros = [
    { label: "Calorias", value: today?.calories ?? 0, target: targets.calories, unit: "kcal" },
    { label: "Proteína", value: today?.proteinG ?? 0, target: targets.proteinG, unit: "g" },
    { label: "Carboidratos", value: today?.carbsG ?? 0, target: targets.carbsG, unit: "g" },
    { label: "Gordura", value: today?.fatG ?? 0, target: targets.fatG, unit: "g" },
    { label: "Água", value: today?.waterMl ?? 0, target: targets.waterMl, unit: "ml" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Nutrição</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Metas calculadas para{" "}
          {latestWeight?.weightKg
            ? `${latestWeight.weightKg.toFixed(1)} kg`
            : "80 kg (registre seu peso no diário para personalizar)"}
          .
        </p>
      </header>

      {/* Progresso do dia */}
      <section aria-label="Progresso de hoje" className="flex flex-col gap-3">
        {macros.map((m) => {
          const pct = Math.min((m.value / m.target) * 100, 100);
          return (
            <div key={m.label}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="font-medium">{m.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {m.value} / {m.target} {m.unit}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${m.label}: ${m.value} de ${m.target} ${m.unit}`}
                className="h-2 overflow-hidden rounded-full bg-secondary"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </section>

      <NutritionForm
        initial={
          today
            ? {
                calories: today.calories,
                proteinG: today.proteinG,
                carbsG: today.carbsG,
                fatG: today.fatG,
                waterMl: today.waterMl,
                creatineTaken: today.creatineTaken,
                supplements: today.supplements ?? "",
                notes: today.notes ?? "",
              }
            : null
        }
      />

      {/* Receitas */}
      <section aria-label="Receitas fáceis" className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Receitas fáceis</h2>
          <p className="text-sm text-muted-foreground">
            Filtre por tipo de proteína — incluindo opções vegetarianas. Links
            para TudoGostoso e Panelinha.
          </p>
        </div>
        <RecipeBrowser />
      </section>
    </div>
  );
}

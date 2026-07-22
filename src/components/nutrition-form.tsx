"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveNutrition } from "@/actions/tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Values = {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  waterMl: number | null;
  creatineTaken: boolean;
  supplements: string;
  notes: string;
};

const EMPTY: Values = {
  calories: null,
  proteinG: null,
  carbsG: null,
  fatG: null,
  waterMl: null,
  creatineTaken: false,
  supplements: "",
  notes: "",
};

export function NutritionForm({ initial }: { initial: Values | null }) {
  const [values, setValues] = useState<Values>(initial ?? EMPTY);
  const [pending, startTransition] = useTransition();

  const num = (v: number | null) => (v == null ? "" : v);
  const setNum = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({
      ...v,
      [key]: e.target.value === "" ? null : Number(e.target.value),
    }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await saveNutrition({
        calories: values.calories,
        proteinG: values.proteinG,
        carbsG: values.carbsG,
        fatG: values.fatG,
        waterMl: values.waterMl,
        creatineTaken: values.creatineTaken,
        supplements: values.supplements || undefined,
        notes: values.notes || undefined,
      });
      toast.success("Registro de hoje salvo.");
    });
  }

  const fields: { key: keyof Values; label: string; unit: string }[] = [
    { key: "calories", label: "Calorias", unit: "kcal" },
    { key: "proteinG", label: "Proteína", unit: "g" },
    { key: "carbsG", label: "Carboidratos", unit: "g" },
    { key: "fatG", label: "Gordura", unit: "g" },
    { key: "waterMl", label: "Água", unit: "ml" },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Registrar hoje</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {fields.map((f) => (
              <div key={f.key} className="grid gap-1.5">
                <Label htmlFor={`nut-${f.key}`} className="text-xs">
                  {f.label} ({f.unit})
                </Label>
                <Input
                  id={`nut-${f.key}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={num(values[f.key] as number | null)}
                  onChange={setNum(f.key)}
                  className="font-mono tabular-nums"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="nut-creatine" className="font-normal">
              Tomei creatina hoje
            </Label>
            <Switch
              id="nut-creatine"
              checked={values.creatineTaken}
              onCheckedChange={(v) => setValues((s) => ({ ...s, creatineTaken: v }))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="nut-supplements" className="text-xs">
              Suplementos
            </Label>
            <Input
              id="nut-supplements"
              placeholder="whey, ômega-3…"
              value={values.supplements}
              onChange={(e) =>
                setValues((s) => ({ ...s, supplements: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="nut-notes" className="text-xs">
              Observações
            </Label>
            <Textarea
              id="nut-notes"
              placeholder="Como foi a alimentação hoje?"
              value={values.notes}
              onChange={(e) => setValues((s) => ({ ...s, notes: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando…" : "Salvar registro"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

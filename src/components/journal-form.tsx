"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveJournal } from "@/actions/tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Values = {
  sleepHours: number | null;
  sleepQuality: number | null;
  energy: number | null;
  mood: number | null;
  soreness: number | null;
  stress: number | null;
  waterMl: number | null;
  weightKg: number | null;
  notes: string;
};

const EMPTY: Values = {
  sleepHours: null,
  sleepQuality: null,
  energy: null,
  mood: null,
  soreness: null,
  stress: null,
  waterMl: null,
  weightKg: null,
  notes: "",
};

function ScaleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-1.5" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(value === v ? null : v)}
            className={cn(
              "h-10 flex-1 rounded-lg border text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === v
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export function JournalForm({ initial }: { initial: Values | null }) {
  const [values, setValues] = useState<Values>(initial ?? EMPTY);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await saveJournal({ ...values, notes: values.notes || undefined });
      toast.success("Diário de hoje salvo.");
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="j-sleep" className="text-xs">
                Horas de sono
              </Label>
              <Input
                id="j-sleep"
                type="number"
                inputMode="decimal"
                min={0}
                max={24}
                step={0.5}
                value={values.sleepHours ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    sleepHours: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className="font-mono tabular-nums"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="j-weight" className="text-xs">
                Peso (kg)
              </Label>
              <Input
                id="j-weight"
                type="number"
                inputMode="decimal"
                min={20}
                max={400}
                step={0.1}
                value={values.weightKg ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    weightKg: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className="font-mono tabular-nums"
              />
            </div>
          </div>

          <ScaleField
            label="Qualidade do sono"
            value={values.sleepQuality}
            onChange={(v) => setValues((s) => ({ ...s, sleepQuality: v }))}
          />
          <ScaleField
            label="Energia"
            value={values.energy}
            onChange={(v) => setValues((s) => ({ ...s, energy: v }))}
          />
          <ScaleField
            label="Humor"
            value={values.mood}
            onChange={(v) => setValues((s) => ({ ...s, mood: v }))}
          />
          <ScaleField
            label="Dor muscular"
            value={values.soreness}
            onChange={(v) => setValues((s) => ({ ...s, soreness: v }))}
          />
          <ScaleField
            label="Estresse"
            value={values.stress}
            onChange={(v) => setValues((s) => ({ ...s, stress: v }))}
          />

          <div className="grid gap-1.5">
            <Label htmlFor="j-water" className="text-xs">
              Água (ml)
            </Label>
            <Input
              id="j-water"
              type="number"
              inputMode="numeric"
              min={0}
              step={250}
              value={values.waterMl ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  waterMl: e.target.value === "" ? null : Number(e.target.value),
                }))
              }
              className="font-mono tabular-nums"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="j-notes" className="text-xs">
              Comentários
            </Label>
            <Textarea
              id="j-notes"
              placeholder="Como você está se sentindo?"
              value={values.notes}
              onChange={(e) => setValues((v) => ({ ...v, notes: e.target.value }))}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando…" : "Salvar diário"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

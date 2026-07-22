"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveMeasurements } from "@/actions/tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Values = {
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
};

const EMPTY: Values = {
  chestCm: null,
  waistCm: null,
  hipCm: null,
  armCm: null,
  thighCm: null,
  calfCm: null,
};

const FIELDS: { key: keyof Values; label: string }[] = [
  { key: "chestCm", label: "Peito" },
  { key: "waistCm", label: "Cintura" },
  { key: "hipCm", label: "Quadril" },
  { key: "armCm", label: "Braço" },
  { key: "thighCm", label: "Coxa" },
  { key: "calfCm", label: "Panturrilha" },
];

export function MeasurementsForm({ initial }: { initial: Values | null }) {
  const [values, setValues] = useState<Values>(initial ?? EMPTY);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await saveMeasurements(values);
      toast.success("Medidas de hoje salvas.");
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Medidas de hoje (cm)</p>
          <p className="text-xs text-muted-foreground">
            Meça sempre no mesmo horário, relaxado, fita paralela ao chão.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {FIELDS.map((f) => (
              <div key={f.key} className="grid gap-1.5">
                <Label htmlFor={`m-${f.key}`} className="text-xs">
                  {f.label}
                </Label>
                <Input
                  id={`m-${f.key}`}
                  type="number"
                  inputMode="decimal"
                  min={10}
                  max={300}
                  step={0.5}
                  value={values[f.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      [f.key]: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  className="font-mono tabular-nums"
                />
              </div>
            ))}
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando…" : "Salvar medidas"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Values = {
  goal: string | null;
  heightCm: number | null;
  targetWeightKg: number | null;
  defaultRestSeconds: number;
  soundEnabled: boolean;
};

export function ProfileForm({ initial }: { initial: Values }) {
  const [values, setValues] = useState<Values>(initial);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateProfile(values);
      toast.success("Perfil atualizado.");
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <p className="text-sm font-semibold">Objetivo e preferências</p>
          <div className="grid gap-1.5">
            <Label htmlFor="p-goal" className="text-xs">
              Objetivo
            </Label>
            <Input
              id="p-goal"
              placeholder="Hipertrofia + condicionamento"
              value={values.goal ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, goal: e.target.value || null }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="p-height" className="text-xs">
                Altura (cm)
              </Label>
              <Input
                id="p-height"
                type="number"
                inputMode="numeric"
                min={100}
                max={250}
                value={values.heightCm ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    heightCm: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className="font-mono tabular-nums"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-target" className="text-xs">
                Peso alvo (kg)
              </Label>
              <Input
                id="p-target"
                type="number"
                inputMode="decimal"
                min={30}
                max={300}
                step={0.5}
                value={values.targetWeightKg ?? ""}
                onChange={(e) =>
                  setValues((v) => ({
                    ...v,
                    targetWeightKg:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className="font-mono tabular-nums"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="p-rest" className="text-xs">
              Descanso padrão (segundos)
            </Label>
            <Input
              id="p-rest"
              type="number"
              inputMode="numeric"
              min={15}
              max={600}
              step={15}
              value={values.defaultRestSeconds}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  defaultRestSeconds: Number(e.target.value || 90),
                }))
              }
              className="font-mono tabular-nums"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="p-sound" className="font-normal">
              Som ao fim do descanso
            </Label>
            <Switch
              id="p-sound"
              checked={values.soundEnabled}
              onCheckedChange={(v) => setValues((s) => ({ ...s, soundEnabled: v }))}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

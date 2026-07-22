"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { quickLogSet } from "@/actions/workout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Item = {
  id: number;
  name: string;
  muscles: string[];
  instructions: string | null;
};

export function QuickLogList({ exercises }: { exercises: Item[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <ul className="flex flex-col gap-2">
      {exercises.map((e) => (
        <li key={e.id}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{e.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {e.muscles.join(", ")}
                  </p>
                </div>
                <Button
                  variant={openId === e.id ? "secondary" : "outline"}
                  size="sm"
                  className="h-10 shrink-0"
                  aria-expanded={openId === e.id}
                  onClick={() => setOpenId(openId === e.id ? null : e.id)}
                >
                  <Plus className="size-4" aria-hidden />
                  Registrar
                </Button>
              </div>
              {e.instructions && openId === e.id && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {e.instructions}
                </p>
              )}
              {openId === e.id && (
                <QuickLogForm exerciseId={e.id} onDone={() => setOpenId(null)} />
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function QuickLogForm({
  exerciseId,
  onDone,
}: {
  exerciseId: number;
  onDone: () => void;
}) {
  const [weight, setWeight] = useState<number | "">("");
  const [reps, setReps] = useState<number | "">("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await quickLogSet({
        exerciseId,
        weightKg: weight === "" ? null : weight,
        reps: reps === "" ? null : reps,
      });
      if (res.ok) {
        toast.success("Série registrada.");
        onDone();
      } else {
        toast.error(res.error ?? "Não foi possível registrar.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mt-3 flex items-end gap-2">
      <div className="grid flex-1 gap-1.5">
        <Label htmlFor={`ql-w-${exerciseId}`} className="text-xs">
          Carga (kg)
        </Label>
        <Input
          id={`ql-w-${exerciseId}`}
          type="number"
          inputMode="decimal"
          min={0}
          step={2.5}
          value={weight}
          onChange={(e) =>
            setWeight(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="h-10 font-mono tabular-nums"
        />
      </div>
      <div className="grid flex-1 gap-1.5">
        <Label htmlFor={`ql-r-${exerciseId}`} className="text-xs">
          Reps
        </Label>
        <Input
          id={`ql-r-${exerciseId}`}
          type="number"
          inputMode="numeric"
          min={0}
          value={reps}
          onChange={(e) =>
            setReps(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="h-10 font-mono tabular-nums"
        />
      </div>
      <Button type="submit" disabled={pending} className="h-10">
        <Check className="size-4" aria-hidden />
        {pending ? "…" : "Salvar"}
      </Button>
    </form>
  );
}

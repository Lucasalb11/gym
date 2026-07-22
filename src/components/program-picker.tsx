"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { changeProgram } from "@/actions/tracking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProgramPicker({
  programs,
  currentId,
}: {
  programs: { id: number; name: string; description: string | null }[];
  currentId: number | null;
}) {
  const [selected, setSelected] = useState<string>(
    currentId != null ? String(currentId) : "",
  );
  const [pending, startTransition] = useTransition();
  const current = programs.find((p) => String(p.id) === selected);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="grid gap-1.5">
          <Label htmlFor="program-select">Programa ativo</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger id="program-select" className="w-full">
              <SelectValue placeholder="Escolha um programa" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {current?.description && (
          <p className="text-xs text-muted-foreground">{current.description}</p>
        )}
        {String(currentId) !== selected && selected !== "" && (
          <Button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await changeProgram(Number(selected));
                if (res.ok) {
                  toast.success(
                    "Programa trocado — a semana 1 começa na segunda-feira desta semana.",
                  );
                } else {
                  toast.error(res.error ?? "Não foi possível trocar.");
                }
              })
            }
          >
            {pending ? "Trocando…" : "Trocar para este programa"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PhotoUpload() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Escolha ou tire uma foto primeiro.");
      return;
    }
    setPending(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("notes", notes);
      const res = await fetch("/api/photos", { method: "POST", body: form });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Falha no envio.");
      }
      toast.success("Foto salva.");
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha no envio.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="photo-file">Nova foto</Label>
            <Input
              id="photo-file"
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="photo-notes" className="text-xs">
              Nota (opcional)
            </Label>
            <Input
              id="photo-notes"
              placeholder="ex.: fim da semana 4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Camera className="size-4" aria-hidden />
            )}
            {pending ? "Enviando…" : "Salvar foto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

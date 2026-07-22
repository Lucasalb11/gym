"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Star } from "lucide-react";
import { toggleFavorite } from "@/actions/tracking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Exercise = {
  id: number;
  name: string;
  category: string;
  muscles: string[];
  equipment: string | null;
  instructions: string | null;
  commonMistakes: string | null;
  cadence: string | null;
  isNeglected: boolean;
  favorite: boolean;
};

const CATEGORIES = [
  { value: "all", label: "Todos" },
  { value: "fav", label: "Favoritos" },
  { value: "hipertrofia", label: "Hipertrofia" },
  { value: "wod", label: "WOD" },
  { value: "acessorio", label: "Acessórios" },
  { value: "mobilidade", label: "Mobilidade" },
  { value: "alongamento", label: "Alongamento" },
  { value: "aquecimento", label: "Aquecimento" },
];

export function LibraryBrowser({ exercises }: { exercises: Exercise[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(
    () => new Set(exercises.filter((e) => e.favorite).map((e) => e.id)),
  );
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((e) => {
      if (category === "fav" && !favorites.has(e.id)) return false;
      if (category !== "all" && category !== "fav" && e.category !== category)
        return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.muscles.some((m) => m.toLowerCase().includes(q))
      );
    });
  }, [exercises, query, category, favorites]);

  function handleFavorite(id: number) {
    setFavorites((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    startTransition(() => {
      toggleFavorite(id);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Buscar exercício ou músculo…"
          aria-label="Buscar exercício"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Categorias">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={category === c.value}
            onClick={() => setCategory(c.value)}
            className={cn(
              "h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              category === c.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum exercício encontrado para essa busca.
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((e) => (
            <li key={e.id}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => setSelected(e)}
                    className="flex min-w-0 flex-1 flex-col items-start rounded-lg p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="font-medium">{e.name}</span>
                    <span className="mt-0.5 truncate text-xs text-muted-foreground">
                      {e.muscles.join(", ")}
                    </span>
                  </button>
                  {e.isNeglected && (
                    <Badge variant="secondary" className="shrink-0">
                      negligenciado
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={
                      favorites.has(e.id)
                        ? `Remover ${e.name} dos favoritos`
                        : `Favoritar ${e.name}`
                    }
                    aria-pressed={favorites.has(e.id)}
                    onClick={() => handleFavorite(e.id)}
                  >
                    <Star
                      className={cn(
                        "size-5",
                        favorites.has(e.id)
                          ? "fill-primary text-primary"
                          : "text-muted-foreground",
                      )}
                      aria-hidden
                    />
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.muscles.join(", ")}
                  {selected.equipment ? ` · ${selected.equipment}` : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3 text-sm">
                {selected.instructions && (
                  <p>
                    <span className="font-medium">Execução: </span>
                    {selected.instructions}
                  </p>
                )}
                {selected.commonMistakes && (
                  <p>
                    <span className="font-medium">Erros comuns: </span>
                    {selected.commonMistakes}
                  </p>
                )}
                {selected.cadence && (
                  <p>
                    <span className="font-medium">Cadência: </span>
                    <span className="font-mono tabular-nums">{selected.cadence}</span>
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

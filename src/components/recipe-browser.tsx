"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PROTEIN_LABELS, RECIPES, type ProteinSource } from "@/lib/recipes";
import { cn } from "@/lib/utils";

type Filter = "todas" | ProteinSource | "veg";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "frango", label: PROTEIN_LABELS.frango },
  { value: "carne", label: PROTEIN_LABELS.carne },
  { value: "peixe", label: PROTEIN_LABELS.peixe },
  { value: "ovos", label: PROTEIN_LABELS.ovos },
  { value: "veg", label: "🌱 Vegetarianas" },
];

export function RecipeBrowser() {
  const [filter, setFilter] = useState<Filter>("todas");

  const filtered = RECIPES.filter((r) => {
    if (filter === "todas") return true;
    if (filter === "veg") return r.vegetarian;
    return r.protein === filter;
  });

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Filtrar receitas por proteína"
      >
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "h-9 shrink-0 rounded-full border px-3.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              filter === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {filtered.map((r) => (
          <li key={r.name}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">
                      {r.vegetarian && (
                        <span aria-label="vegetariana" title="Vegetariana">
                          🌱{" "}
                        </span>
                      )}
                      {r.name}
                    </p>
                    <ExternalLink
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{PROTEIN_LABELS[r.protein]}</Badge>
                    <Badge variant="secondary">{r.tag}</Badge>
                    <Badge variant="secondary" className="font-mono tabular-nums">
                      ~{r.approx.kcal} kcal
                    </Badge>
                    <Badge variant="secondary" className="font-mono tabular-nums">
                      {r.approx.proteinG} g proteína
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {r.source}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

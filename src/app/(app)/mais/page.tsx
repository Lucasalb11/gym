import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Camera,
  ChevronRight,
  Dumbbell,
  NotebookPen,
  Ruler,
  UserRound,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Mais" };

const LINKS = [
  {
    href: "/diario",
    label: "Diário",
    description: "Sono, energia, humor, dor, peso",
    icon: NotebookPen,
  },
  {
    href: "/biblioteca",
    label: "Biblioteca de exercícios",
    description: "Busca, filtros, execução e favoritos",
    icon: BookOpen,
  },
  {
    href: "/negligenciados",
    label: "Exercícios negligenciados",
    description: "Tibial, manguito, core, pegada…",
    icon: Dumbbell,
  },
  {
    href: "/fotos",
    label: "Fotos de progresso",
    description: "Antes/depois privado, direto da câmera",
    icon: Camera,
  },
  {
    href: "/medidas",
    label: "Medidas corporais",
    description: "Peito, cintura, braço, coxa… + evolução",
    icon: Ruler,
  },
  {
    href: "/perfil",
    label: "Perfil",
    description: "Objetivo, metas, preferências e PRs",
    icon: UserRound,
  },
];

export default function MorePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Mais</h1>
      <ul className="flex flex-col gap-2">
        {LINKS.map(({ href, label, description, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <Icon className="size-5 shrink-0 text-primary" aria-hidden />
                  <div className="flex-1">
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <ChevronRight
                    className="size-5 text-muted-foreground"
                    aria-hidden
                  />
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

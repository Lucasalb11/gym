"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  ChartLine,
  House,
  Menu,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Início", icon: House },
  { href: "/programa", label: "Programa", icon: CalendarRange },
  { href: "/evolucao", label: "Evolução", icon: ChartLine },
  { href: "/nutricao", label: "Nutrição", icon: UtensilsCrossed },
  { href: "/mais", label: "Mais", icon: Menu },
];

export function BottomNav() {
  const pathname = usePathname();

  // Some o nav no player para o fluxo de treino ocupar a tela toda
  if (pathname.includes("/play")) return null;

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

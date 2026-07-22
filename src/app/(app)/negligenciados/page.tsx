import type { Metadata } from "next";
import { QuickLogList } from "@/components/quick-log-list";
import { getLibrary } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Negligenciados" };

export default async function NeglectedPage() {
  const user = await requireUser();
  const library = await getLibrary(user.id);
  const neglected = library.filter((e) => e.isNeglected);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Exercícios negligenciados
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tibial, antebraços, manguito, core, pegada, trapézio, glúteo médio,
          adutores e panturrilhas. Adicione uma série rápida a qualquer momento
          — ela entra no seu histórico do dia.
        </p>
      </header>
      <QuickLogList
        exercises={neglected.map((e) => ({
          id: e.id,
          name: e.name,
          muscles: e.muscles,
          instructions: e.instructions,
        }))}
      />
    </div>
  );
}

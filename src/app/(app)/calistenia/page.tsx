import type { Metadata } from "next";
import { CalisthenicsRoadmap } from "@/components/calisthenics-roadmap";
import { getCalisthenicsRoadmap } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Calistenia" };

export default async function CalisthenicsPage() {
  const user = await requireUser();
  const lessons = await getCalisthenicsRoadmap(user.id);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Calistenia</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Roadmap de progressões com peso corporal — barra fixa, paralelas e
          elástico. Escolha o nível e vá marcando as aulas.
        </p>
      </header>
      <CalisthenicsRoadmap lessons={lessons} />
    </div>
  );
}

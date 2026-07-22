import type { Metadata } from "next";
import { LibraryBrowser } from "@/components/library-browser";
import { getLibrary } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Biblioteca" };

export default async function LibraryPage() {
  const user = await requireUser();
  const library = await getLibrary(user.id);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Biblioteca</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {library.length} exercícios com execução, erros comuns e músculos.
        </p>
      </header>
      <LibraryBrowser
        exercises={library.map((e) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          muscles: e.muscles,
          equipment: e.equipment,
          instructions: e.instructions,
          commonMistakes: e.commonMistakes,
          cadence: e.cadence,
          imageUrl: e.imageUrl,
          videoUrl: e.videoUrl,
          substitutes: e.substitutes,
          isNeglected: e.isNeglected,
          favorite: e.favorite,
        }))}
      />
    </div>
  );
}

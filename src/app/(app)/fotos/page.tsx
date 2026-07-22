import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { PhotoUpload } from "@/components/photo-upload";
import { getDb } from "@/db";
import { progressPhotos } from "@/db/schema";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Fotos de progresso" };

export default async function PhotosPage() {
  const user = await requireUser();
  const db = await getDb();
  const photos = await db
    .select({
      id: progressPhotos.id,
      date: progressPhotos.date,
      notes: progressPhotos.notes,
    })
    .from(progressPhotos)
    .where(eq(progressPhotos.userId, user.id))
    .orderBy(desc(progressPhotos.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Fotos de progresso
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Privadas por padrão — só você vê, e o acesso passa pelo seu login.
        </p>
      </header>

      <PhotoUpload />

      {photos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma foto ainda. Tire uma hoje — daqui a 12 semanas você vai
            querer ter esse antes/depois.
          </CardContent>
        </Card>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <li key={p.id} className="overflow-hidden rounded-xl border border-border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/photos/${p.id}/file`}
                alt={`Foto de progresso de ${new Date(`${p.date}T12:00:00`).toLocaleDateString("pt-BR")}`}
                className="aspect-[3/4] w-full object-cover"
                loading="lazy"
              />
              <div className="p-2">
                <p className="font-mono text-xs tabular-nums text-muted-foreground">
                  {new Date(`${p.date}T12:00:00`).toLocaleDateString("pt-BR")}
                </p>
                {p.notes && <p className="mt-0.5 text-xs">{p.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

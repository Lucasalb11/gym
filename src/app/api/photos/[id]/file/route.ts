import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { progressPhotos } from "@/db/schema";
import { getSessionUser } from "@/lib/session";

// Serve a foto apenas para o dono — o storage em si nunca é exposto ao cliente.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const photoId = Number(id);
  if (!Number.isInteger(photoId)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const db = await getDb();
  const [photo] = await db
    .select()
    .from(progressPhotos)
    .where(
      and(eq(progressPhotos.id, photoId), eq(progressPhotos.userId, user.id)),
    );
  if (!photo) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (photo.storage === "blob") {
    const res = await fetch(photo.pathname);
    if (!res.ok || !res.body) {
      return NextResponse.json({ error: "storage error" }, { status: 502 });
    }
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": photo.contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  const buf = await readFile(path.join(process.cwd(), ".uploads", photo.pathname));
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getDb } from "@/db";
import { progressPhotos } from "@/db/schema";
import { todayISO } from "@/lib/dates";
import { getSessionUser } from "@/lib/session";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const notes = String(form.get("notes") ?? "");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Formato não suportado." }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Imagem acima de 8 MB." }, { status: 413 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `photos/${user.id}/${Date.now()}.${ext}`;

  let storage: "blob" | "local";
  let pathname: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // Produção: Vercel Blob com sufixo aleatório (URL não adivinhável);
    // o app nunca expõe a URL — o arquivo é servido pela rota autenticada.
    const blob = await put(name, file, { access: "public", addRandomSuffix: true });
    storage = "blob";
    pathname = blob.url;
  } else {
    // Dev local: grava em .uploads (fora do controle de versão)
    const dir = path.join(process.cwd(), ".uploads", user.id);
    await mkdir(dir, { recursive: true });
    const localName = `${Date.now()}.${ext}`;
    await writeFile(
      path.join(dir, localName),
      Buffer.from(await file.arrayBuffer()),
    );
    storage = "local";
    pathname = path.join(user.id, localName);
  }

  const db = await getDb();
  const [created] = await db
    .insert(progressPhotos)
    .values({
      userId: user.id,
      date: todayISO(),
      storage,
      pathname,
      contentType: file.type,
      notes: notes || null,
    })
    .returning({ id: progressPhotos.id });

  return NextResponse.json({ id: created.id });
}

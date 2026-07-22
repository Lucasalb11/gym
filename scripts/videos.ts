/* Busca no YouTube um tutorial em pt-BR para cada exercício, valida que o
 * vídeo existe e permite embed (oEmbed) e grava a URL no banco.
 * Rode com: npx tsx scripts/videos.ts (DATABASE_URL opcional) */
import { eq } from "drizzle-orm";
import { getDb } from "../src/db";
import { exercises } from "../src/db/schema";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const HEADERS = { "Accept-Language": "pt-BR,pt;q=0.9", "User-Agent": UA };

async function searchCandidates(query: string): Promise<string[]> {
  const res = await fetch(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    { headers: HEADERS },
  );
  if (!res.ok) return [];
  const html = await res.text();
  const ids: string[] = [];
  for (const m of html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)) {
    if (!ids.includes(m[1])) ids.push(m[1]);
    if (ids.length >= 4) break;
  }
  return ids;
}

/** true = embeddável; respeita rate limit com 1 retry após pausa */
async function isEmbeddable(videoId: string): Promise<boolean> {
  const url = encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`);
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${url}&format=json`,
      { headers: HEADERS },
    );
    if (res.ok) return true;
    if (res.status !== 429) return false; // embed desabilitado/privado
    await sleep(5000);
  }
  return false;
}

async function main() {
  const db = await getDb();
  const rows = await db
    .select({
      id: exercises.id,
      name: exercises.name,
      category: exercises.category,
      videoUrl: exercises.videoUrl,
    })
    .from(exercises);

  let found = 0;
  let kept = 0;
  for (const row of rows) {
    // Já tem vídeo real (não é link de busca)? Mantém.
    if (row.videoUrl?.includes("watch?v=")) {
      kept++;
      continue;
    }
    const query =
      row.category === "alongamento" || row.category === "mobilidade"
        ? `como fazer ${row.name} alongamento mobilidade`
        : `como fazer ${row.name} execução correta técnica`;
    let candidates = await searchCandidates(query);
    if (candidates.length === 0) {
      // página anti-bot sem resultados: espera e tenta de novo
      await sleep(10000);
      candidates = await searchCandidates(query);
    }
    if (candidates.length === 0) {
      console.log(`  ✗ ${row.name}: busca sem resultados (anti-bot)`);
      await sleep(2500);
      continue;
    }
    let chosen: string | null = null;
    for (const id of candidates) {
      if (await isEmbeddable(id)) {
        chosen = id;
        break;
      }
      await sleep(500);
    }
    if (chosen) {
      await db
        .update(exercises)
        .set({ videoUrl: `https://www.youtube.com/watch?v=${chosen}` })
        .where(eq(exercises.id, row.id));
      found++;
      console.log(`  ✓ ${row.name} → ${chosen}`);
    } else {
      console.log(`  ✗ ${row.name}: nenhum vídeo embeddável encontrado`);
    }
    await sleep(2500);
  }
  console.log(`Vídeos: ${found} novos, ${kept} já existentes, total ${rows.length}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

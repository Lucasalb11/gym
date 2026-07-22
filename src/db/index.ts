import path from "node:path";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = NodePgDatabase<typeof schema>;

// Em produção use DATABASE_URL (Neon/Vercel). Sem DATABASE_URL o app roda com
// PGlite (Postgres embarcado em ./.pglite) — zero setup em dev.
async function createDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = new Pool({ connectionString: url });
    return drizzlePg(pool, { schema });
  }
  // Durante o `next build` vários workers avaliam este módulo em paralelo;
  // usar PGlite em memória evita conflito de lock no diretório de dados.
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const client = isBuild
    ? new PGlite()
    : new PGlite(path.join(process.cwd(), ".pglite"));
  const db = drizzlePglite(client, { schema });
  await migratePglite(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });
  return db as unknown as Db;
}

const globalForDb = globalThis as unknown as { __db?: Promise<Db> };

export function getDb(): Promise<Db> {
  return (globalForDb.__db ??= createDb());
}

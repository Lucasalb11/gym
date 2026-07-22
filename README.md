# Hybrid — Treino Híbrido (Hipertrofia + CrossFit)

PWA para acompanhar um programa de 12 semanas de hipertrofia + CrossFit.
Substitui a ficha de papel: treino do dia, registro de séries com carga/RPE,
timer de descanso automático, timer de WOD, PRs automáticos, diário, nutrição
com receitas, fotos de progresso e gráficos de evolução.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind 4 + shadcn/ui · Drizzle ORM ·
PostgreSQL (Neon em produção, PGlite embarcado em dev) · Better Auth (e-mail +
senha com hash scrypt) · Recharts · Framer Motion · PWA (manifest + service worker).

## Rodando local (zero setup de banco)

```bash
npm install
npm run db:seed   # cria o banco PGlite local (./.pglite) e o programa de 12 semanas
npm run dev
```

Abra http://localhost:3000, crie sua conta (e-mail + senha) e comece.
Sem `DATABASE_URL`, tudo roda no PGlite local — nenhum serviço externo.

## Deploy na Vercel (grátis)

1. **Banco**: instale o **Neon Postgres** pelo Vercel Marketplace (tier grátis).
   Isso cria `DATABASE_URL` no projeto.
2. **Env vars**: `BETTER_AUTH_SECRET` (`openssl rand -hex 32`) e
   `BETTER_AUTH_URL` (URL do deploy).
3. **Fotos**: crie um store do **Vercel Blob** (grátis) — isso define
   `BLOB_READ_WRITE_TOKEN`. Sem ele, upload de fotos só funciona em dev.
4. **Migrations + seed** (uma vez, do seu terminal):

```bash
DATABASE_URL="postgres://…" npx drizzle-kit migrate
DATABASE_URL="postgres://…" npm run db:seed
```

5. `vercel deploy --prod` (ou conecte o repositório no dashboard).

## Segurança

- Senhas: hash scrypt pelo Better Auth; sessões em cookie httpOnly.
- Fotos: armazenadas no Vercel Blob com sufixo aleatório e **servidas apenas
  pela rota autenticada** `/api/photos/[id]/file` (só o dono acessa).
- Todas as tabelas de dados do usuário têm `user_id` com checagem de sessão
  nas queries e actions.

## Estrutura

```
src/
  app/(app)/        páginas autenticadas (dashboard, programa, treino, player…)
  app/login/        cadastro/entrada
  app/api/          Better Auth + upload/stream de fotos
  actions/          server actions (Zod) — séries, WOD, diário, nutrição…
  components/       UI (player de treino, timers, gráficos, formulários)
  db/               schema Drizzle + cliente (PGlite ↔ Postgres)
  lib/              queries, sessão, datas, receitas, tipos
scripts/seed.ts     biblioteca de exercícios + gerador do programa de 12 semanas
.claude/skills/preparador-fisico/  skill de coach p/ gerar novos programas
```

## Programa

5 dias/semana com periodização: acumulação (sem. 1–3) → deload (4) →
intensificação (5–7) → deload (8) → pico (9–11) → teste/PR (12).
Cada sessão segue a ordem: alongamento dinâmico → mobilidade → aquecimento →
hipertrofia → WOD → alongamento final. Em semanas de deload os WODs são
regenerativos (Zona 2); na semana 12 os WODs são leves entre os dias de teste,
com a Cindy no sábado como reteste de condicionamento. Para gerar novos
programas por objetivo, use a skill `/preparador-fisico` no Claude Code.

# Brand — Hybrid (Treino Híbrido: Hipertrofia + CrossFit)

_Status: active — derivado da direção dada pelo Lucas no briefing do produto._

## Direção

Companheiro de treino premium, nível Apple Fitness / Whoop / Linear. Minimalista,
muito respiro, cards arredondados, animações sutis. **Dark mode é o padrão** — o app
é usado dentro da academia, geralmente à noite ou em ambientes escuros.

## Paleta

Dark-first, neutros quase-pretos com um único acento "volt" (verde-lima, inspirado
em Whoop) reservado para ações primárias, progresso e PRs.

| Token | Dark (padrão) | Uso |
| --- | --- | --- |
| `background` | `oklch(0.145 0 0)` | fundo do app |
| `card` | `oklch(0.195 0 0)` | cards |
| `primary` | `oklch(0.87 0.21 130)` (volt) | CTA, série concluída, PR |
| `primary-foreground` | `oklch(0.18 0.04 130)` | texto sobre volt |
| `destructive` | `oklch(0.704 0.191 22.216)` | apagar, falha |
| `chart-1..5` | lima, ciano, violeta, âmbar, rosa | gráficos |

Light mode existe e funciona, com o mesmo acento escurecido para contraste AA.

## Tipografia

- **Geist Sans** — UI geral (via `next/font`).
- **Geist Mono** — números: cargas, timers, reps, resultados de WOD. Sempre com
  `tabular-nums` para números que mudam em tempo real.

## Tom de voz

Direto, encorajador, em português. "Concluir série", "Começar treino", "+5 kg vs
semana passada". Sem jargão corporativo, sem exclamações em excesso. Celebration
apenas em PRs e streaks.

## Regras de uso

- Volt nunca é usado como cor de fundo de superfícies grandes — só ações/realce.
- Estados de progresso positivos: volt. Regressão/queda: neutro (nunca vermelho, o
  vermelho fica reservado para erros destrutivos).
- Raio padrão `--radius: 0.75rem` (cards arredondados, botões pill em CTAs do player).

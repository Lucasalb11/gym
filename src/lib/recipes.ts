// Sugestões de receitas fáceis e alinhadas ao treino. Os links apontam para
// buscas em sites confiáveis (TudoGostoso, Panelinha) — sempre atualizados.

export type Recipe = {
  name: string;
  description: string;
  tag: "pós-treino" | "pré-treino" | "almoço/janta" | "lanche" | "café da manhã";
  approx: { kcal: number; proteinG: number };
  url: string;
  source: "TudoGostoso" | "Panelinha";
};

const tg = (q: string) =>
  `https://www.tudogostoso.com.br/busca?q=${encodeURIComponent(q)}`;
const pan = (q: string) =>
  `https://www.panelinha.com.br/busca?search=${encodeURIComponent(q)}`;

export const RECIPES: Recipe[] = [
  {
    name: "Frango grelhado com batata-doce",
    description: "O clássico do pós-treino: proteína magra + carbo de qualidade. Pronto em 25 min.",
    tag: "pós-treino",
    approx: { kcal: 450, proteinG: 40 },
    url: tg("frango grelhado com batata doce"),
    source: "TudoGostoso",
  },
  {
    name: "Omelete de forno com legumes",
    description: "Rende várias porções, ótimo para marmitas da semana.",
    tag: "café da manhã",
    approx: { kcal: 300, proteinG: 22 },
    url: tg("omelete de forno"),
    source: "TudoGostoso",
  },
  {
    name: "Panqueca de banana e aveia",
    description: "3 ingredientes, sem açúcar. Carbo rápido ideal 1h antes do treino.",
    tag: "pré-treino",
    approx: { kcal: 350, proteinG: 15 },
    url: tg("panqueca de banana e aveia"),
    source: "TudoGostoso",
  },
  {
    name: "Estrogonofe fit de frango",
    description: "Versão leve com iogurte, sem perder o gosto de comida de verdade.",
    tag: "almoço/janta",
    approx: { kcal: 420, proteinG: 35 },
    url: tg("estrogonofe fit de frango"),
    source: "TudoGostoso",
  },
  {
    name: "Escondidinho de batata-doce com frango",
    description: "Marmita perfeita: congela bem e segura a fome à noite.",
    tag: "almoço/janta",
    approx: { kcal: 480, proteinG: 38 },
    url: tg("escondidinho de batata doce com frango"),
    source: "TudoGostoso",
  },
  {
    name: "Wrap de atum",
    description: "Lanche de 5 minutos com ~25 g de proteína, sem fogão.",
    tag: "lanche",
    approx: { kcal: 320, proteinG: 26 },
    url: tg("wrap de atum"),
    source: "TudoGostoso",
  },
  {
    name: "Carne moída com legumes na panela",
    description: "Uma panela só, rende 4 marmitas. Combine com arroz pronto.",
    tag: "almoço/janta",
    approx: { kcal: 400, proteinG: 32 },
    url: pan("carne moída com legumes"),
    source: "Panelinha",
  },
  {
    name: "Salmão assado com legumes",
    description: "Gorduras boas + proteína. Assa tudo junto em 20 min.",
    tag: "almoço/janta",
    approx: { kcal: 500, proteinG: 34 },
    url: pan("salmão assado"),
    source: "Panelinha",
  },
  {
    name: "Vitamina de banana com aveia e pasta de amendoim",
    description: "Café da manhã líquido de 2 minutos; adicione whey para +25 g de proteína.",
    tag: "café da manhã",
    approx: { kcal: 420, proteinG: 18 },
    url: tg("vitamina de banana com aveia"),
    source: "TudoGostoso",
  },
  {
    name: "Crepioca de frango",
    description: "Tapioca + ovo + recheio proteico. Janta rápida pós-treino noturno.",
    tag: "pós-treino",
    approx: { kcal: 380, proteinG: 30 },
    url: tg("crepioca de frango"),
    source: "TudoGostoso",
  },
];

/** Metas diárias estimadas a partir do peso corporal (hipertrofia + condicionamento). */
export function nutritionTargets(weightKg: number | null) {
  const w = weightKg ?? 80;
  return {
    calories: Math.round(w * 35),
    proteinG: Math.round(w * 1.8),
    carbsG: Math.round(w * 4),
    fatG: Math.round(w * 0.9),
    waterMl: Math.round(w * 35),
  };
}

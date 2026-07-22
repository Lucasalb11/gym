// Sugestões de receitas fáceis e alinhadas ao treino. Os links apontam para
// buscas em sites confiáveis (TudoGostoso, Panelinha) — sempre atualizados.

export type ProteinSource =
  | "frango"
  | "carne"
  | "peixe"
  | "ovos"
  | "vegetariana";

export type Recipe = {
  name: string;
  description: string;
  tag: "pós-treino" | "pré-treino" | "almoço/janta" | "lanche" | "café da manhã";
  protein: ProteinSource;
  vegetarian: boolean;
  approx: { kcal: number; proteinG: number };
  url: string;
  source: "TudoGostoso" | "Panelinha";
};

const tg = (q: string) =>
  `https://www.tudogostoso.com.br/busca?q=${encodeURIComponent(q)}`;
const pan = (q: string) =>
  `https://www.panelinha.com.br/busca?search=${encodeURIComponent(q)}`;

export const PROTEIN_LABELS: Record<ProteinSource, string> = {
  frango: "Frango",
  carne: "Carne",
  peixe: "Peixe",
  ovos: "Ovos & laticínios",
  vegetariana: "Vegetariana",
};

export const RECIPES: Recipe[] = [
  // Frango
  {
    name: "Frango grelhado com batata-doce",
    description: "O clássico do pós-treino: proteína magra + carbo de qualidade. Pronto em 25 min.",
    tag: "pós-treino",
    protein: "frango",
    vegetarian: false,
    approx: { kcal: 450, proteinG: 40 },
    url: tg("frango grelhado com batata doce"),
    source: "TudoGostoso",
  },
  {
    name: "Estrogonofe fit de frango",
    description: "Versão leve com iogurte, sem perder o gosto de comida de verdade.",
    tag: "almoço/janta",
    protein: "frango",
    vegetarian: false,
    approx: { kcal: 420, proteinG: 35 },
    url: tg("estrogonofe fit de frango"),
    source: "TudoGostoso",
  },
  {
    name: "Escondidinho de batata-doce com frango",
    description: "Marmita perfeita: congela bem e segura a fome à noite.",
    tag: "almoço/janta",
    protein: "frango",
    vegetarian: false,
    approx: { kcal: 480, proteinG: 38 },
    url: tg("escondidinho de batata doce com frango"),
    source: "TudoGostoso",
  },
  {
    name: "Crepioca de frango",
    description: "Tapioca + ovo + recheio proteico. Janta rápida pós-treino noturno.",
    tag: "pós-treino",
    protein: "frango",
    vegetarian: false,
    approx: { kcal: 380, proteinG: 30 },
    url: tg("crepioca de frango"),
    source: "TudoGostoso",
  },

  // Carne
  {
    name: "Carne moída com legumes na panela",
    description: "Uma panela só, rende 4 marmitas. Combine com arroz pronto.",
    tag: "almoço/janta",
    protein: "carne",
    vegetarian: false,
    approx: { kcal: 400, proteinG: 32 },
    url: pan("carne moída com legumes"),
    source: "Panelinha",
  },
  {
    name: "Patinho acebolado com arroz e feijão",
    description: "PF clássico: ferro, creatina natural e ~35 g de proteína.",
    tag: "almoço/janta",
    protein: "carne",
    vegetarian: false,
    approx: { kcal: 550, proteinG: 35 },
    url: tg("patinho acebolado"),
    source: "TudoGostoso",
  },

  // Peixe
  {
    name: "Salmão assado com legumes",
    description: "Gorduras boas + proteína. Assa tudo junto em 20 min.",
    tag: "almoço/janta",
    protein: "peixe",
    vegetarian: false,
    approx: { kcal: 500, proteinG: 34 },
    url: pan("salmão assado"),
    source: "Panelinha",
  },
  {
    name: "Wrap de atum",
    description: "Lanche de 5 minutos com ~25 g de proteína, sem fogão.",
    tag: "lanche",
    protein: "peixe",
    vegetarian: false,
    approx: { kcal: 320, proteinG: 26 },
    url: tg("wrap de atum"),
    source: "TudoGostoso",
  },
  {
    name: "Tilápia grelhada com purê de mandioquinha",
    description: "Peixe branco magro, leve para o jantar e barato.",
    tag: "almoço/janta",
    protein: "peixe",
    vegetarian: false,
    approx: { kcal: 420, proteinG: 32 },
    url: tg("tilápia grelhada"),
    source: "TudoGostoso",
  },

  // Ovos & laticínios (vegetariano)
  {
    name: "Omelete de forno com legumes",
    description: "Rende várias porções, ótimo para marmitas da semana.",
    tag: "café da manhã",
    protein: "ovos",
    vegetarian: true,
    approx: { kcal: 300, proteinG: 22 },
    url: tg("omelete de forno"),
    source: "TudoGostoso",
  },
  {
    name: "Panqueca de banana e aveia",
    description: "3 ingredientes, sem açúcar. Carbo rápido ideal 1h antes do treino.",
    tag: "pré-treino",
    protein: "ovos",
    vegetarian: true,
    approx: { kcal: 350, proteinG: 15 },
    url: tg("panqueca de banana e aveia"),
    source: "TudoGostoso",
  },
  {
    name: "Vitamina de banana com aveia e pasta de amendoim",
    description: "Café da manhã líquido de 2 minutos; adicione whey para +25 g de proteína.",
    tag: "café da manhã",
    protein: "ovos",
    vegetarian: true,
    approx: { kcal: 420, proteinG: 18 },
    url: tg("vitamina de banana com aveia"),
    source: "TudoGostoso",
  },
  {
    name: "Bowl de iogurte grego com frutas e granola",
    description: "Lanche proteico sem cozinhar; iogurte grego tem o dobro de proteína.",
    tag: "lanche",
    protein: "ovos",
    vegetarian: true,
    approx: { kcal: 340, proteinG: 20 },
    url: tg("bowl de iogurte grego"),
    source: "TudoGostoso",
  },

  // Vegetarianas (leguminosas & soja)
  {
    name: "Grão-de-bico ao curry",
    description: "Proteína vegetal + fibra; rende marmitas e congela bem.",
    tag: "almoço/janta",
    protein: "vegetariana",
    vegetarian: true,
    approx: { kcal: 430, proteinG: 18 },
    url: tg("grão de bico ao curry"),
    source: "TudoGostoso",
  },
  {
    name: "Tofu grelhado com legumes salteados",
    description: "Tofu firme grelhado tem ~17 g de proteína por porção; tempere bem!",
    tag: "almoço/janta",
    protein: "vegetariana",
    vegetarian: true,
    approx: { kcal: 380, proteinG: 22 },
    url: tg("tofu grelhado"),
    source: "TudoGostoso",
  },
  {
    name: "Lentilha com arroz e cebola caramelizada",
    description: "Arroz + lentilha = aminoácidos completos. Clássico barato e forte.",
    tag: "almoço/janta",
    protein: "vegetariana",
    vegetarian: true,
    approx: { kcal: 450, proteinG: 19 },
    url: tg("lentilha com arroz"),
    source: "TudoGostoso",
  },
  {
    name: "Hambúrguer de feijão-preto",
    description: "Rende vários discos para congelar; sirva no pão com salada.",
    tag: "almoço/janta",
    protein: "vegetariana",
    vegetarian: true,
    approx: { kcal: 400, proteinG: 16 },
    url: tg("hambúrguer de feijão preto"),
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

/* Popula o banco com a biblioteca de exercícios e o programa híbrido de 12
 * semanas (Hipertrofia + CrossFit). Rode com: npm run db:seed */
import { count } from "drizzle-orm";
import { getDb } from "../src/db";
import {
  blockExercises,
  exercises,
  programs,
  wods,
  workoutBlocks,
  workouts,
  type exerciseCategory,
} from "../src/db/schema";

type Category = (typeof exerciseCategory.enumValues)[number];

type SeedExercise = {
  slug: string;
  name: string;
  category: Category;
  muscles: string[];
  equipment?: string;
  instructions?: string;
  commonMistakes?: string;
  cadence?: string;
  isNeglected?: boolean;
};

const ex = (
  slug: string,
  name: string,
  category: Category,
  muscles: string[],
  rest: Partial<SeedExercise> = {},
): SeedExercise => ({ slug, name, category, muscles, ...rest });

// ---------------------------------------------------------------------------
// Biblioteca
// ---------------------------------------------------------------------------

const EXERCISES: SeedExercise[] = [
  // Alongamento dinâmico
  ex("balanco-pernas", "Balanço de pernas", "alongamento", ["posteriores", "quadril"], {
    instructions: "De pé, apoiado, balance a perna à frente e atrás com amplitude crescente. 10 por perna.",
  }),
  ex("avanco-rotacao", "Avanço com rotação de tronco", "alongamento", ["quadril", "core"], {
    instructions: "Dê um passo à frente em avanço e gire o tronco sobre a perna da frente.",
  }),
  ex("circulo-bracos", "Círculos de braços", "alongamento", ["ombros"], {
    instructions: "Círculos amplos para frente e para trás, aumentando a amplitude.",
  }),
  ex("agachamento-cossaco", "Agachamento cossaco", "alongamento", ["adutores", "quadril"], {
    instructions: "Agache lateralmente sobre uma perna mantendo a outra estendida.",
  }),
  ex("inchworm", "Inchworm", "alongamento", ["posteriores", "core", "ombros"], {
    instructions: "Das mãos nos pés, caminhe com as mãos até a prancha e volte.",
  }),
  ex("passagem-bastao", "Passagem de ombros com bastão", "alongamento", ["ombros", "peitoral"], {
    instructions: "Segure o bastão com pegada ampla e passe por cima da cabeça até as costas.",
  }),

  // Mobilidade
  ex("mobilidade-tornozelo", "Mobilidade de tornozelo na parede", "mobilidade", ["panturrilhas", "tornozelo"], {
    instructions: "Joelho em direção à parede sem tirar o calcanhar do chão. 10 por lado.",
  }),
  ex("noventa-noventa", "90/90 de quadril", "mobilidade", ["quadril", "glúteos"], {
    instructions: "Sentado com as duas pernas a 90°, incline o tronco sobre a perna da frente e troque de lado.",
  }),
  ex("gato-camelo", "Gato-camelo", "mobilidade", ["coluna", "core"], {
    instructions: "Em quatro apoios, alterne flexão e extensão da coluna de forma controlada.",
  }),
  ex("rotacao-toracica", "Rotação torácica ajoelhado", "mobilidade", ["coluna", "ombros"], {
    instructions: "Em quatro apoios, mão na nuca, gire o cotovelo em direção ao teto.",
  }),
  ex("pombo", "Pigeon (pombo)", "mobilidade", ["glúteos", "quadril"], {
    instructions: "Perna da frente flexionada no chão, quadril quadrado, incline o tronco à frente.",
  }),

  // Aquecimento
  ex("remo-maquina", "Remo (máquina)", "aquecimento", ["corpo inteiro"], {
    equipment: "remo",
    instructions: "Ritmo confortável, foco na sequência pernas-quadril-braços.",
  }),
  ex("bike", "Bike", "aquecimento", ["corpo inteiro"], { equipment: "bike" }),
  ex("pular-corda", "Pular corda", "aquecimento", ["panturrilhas", "coordenação"], { equipment: "corda" }),
  ex("polichinelo", "Polichinelo", "aquecimento", ["corpo inteiro"]),
  ex("band-pull-apart", "Band pull-apart", "aquecimento", ["deltóide posterior", "manguito"], {
    equipment: "elástico",
    instructions: "Braços estendidos à frente, abra o elástico até tocar o peito, escápulas retraídas.",
  }),
  ex("barra-vazia", "Séries com barra vazia", "aquecimento", ["padrão do dia"], {
    equipment: "barra",
    instructions: "2-3 séries leves do primeiro exercício do dia, subindo a carga gradualmente.",
  }),

  // Hipertrofia — principais
  ex("agachamento-livre", "Agachamento livre", "hipertrofia", ["quadríceps", "glúteos", "core"], {
    equipment: "barra",
    cadence: "3-0-1",
    instructions: "Barra no trapézio, pés na largura dos ombros. Desça controlado até abaixo da paralela mantendo o tronco firme e joelhos alinhados com os pés.",
    commonMistakes: "Joelhos colapsando para dentro; calcanhar saindo do chão; perder a lordose no fundo.",
  }),
  ex("levantamento-terra", "Levantamento terra", "hipertrofia", ["posteriores", "glúteos", "lombar", "trapézio"], {
    equipment: "barra",
    cadence: "2-1-1",
    instructions: "Barra sobre o meio do pé, coluna neutra, empurre o chão e estenda quadril e joelhos juntos. Trave o quadril no topo sem hiperextender.",
    commonMistakes: "Arredondar a lombar; barra longe do corpo; puxar com os braços.",
  }),
  ex("supino-reto", "Supino reto (barra)", "hipertrofia", ["peitoral", "tríceps", "deltóide anterior"], {
    equipment: "barra",
    cadence: "3-1-1",
    instructions: "Escápulas retraídas, pés firmes. Desça a barra até o peito e empurre em linha levemente diagonal.",
    commonMistakes: "Quicar a barra no peito; cotovelos abertos a 90°; perder o apoio dos pés.",
  }),
  ex("desenvolvimento-militar", "Desenvolvimento militar", "hipertrofia", ["ombros", "tríceps", "core"], {
    equipment: "barra",
    cadence: "2-0-1",
    instructions: "Em pé, core firme, empurre a barra verticalmente passando a cabeça à frente no topo.",
    commonMistakes: "Hiperextender a lombar; empurrar a barra para frente.",
  }),
  ex("barra-fixa", "Barra fixa", "hipertrofia", ["dorsais", "bíceps", "core"], {
    equipment: "barra fixa",
    cadence: "2-0-1",
    instructions: "Pegada pronada, inicie deprimindo as escápulas e puxe o queixo acima da barra.",
    commonMistakes: "Meia amplitude; balançar o corpo; não estender os braços embaixo.",
  }),
  ex("remada-curvada", "Remada curvada", "hipertrofia", ["dorsais", "trapézio", "bíceps"], {
    equipment: "barra",
    cadence: "2-1-1",
    instructions: "Tronco a ~45°, puxe a barra em direção ao umbigo com os cotovelos junto ao corpo.",
    commonMistakes: "Usar impulso do quadril; arredondar as costas.",
  }),
  ex("remada-apoiada", "Remada apoiada no banco", "hipertrofia", ["dorsais", "trapézio", "bíceps"], {
    equipment: "banco inclinado + halteres",
    cadence: "2-1-1",
    instructions: "Peito apoiado no banco inclinado, puxe os halteres em direção ao quadril com os cotovelos junto ao corpo. Sem carga na lombar.",
    commonMistakes: "Tirar o peito do banco; encolher os ombros em vez de puxar com as costas.",
  }),
  ex("hip-thrust", "Hip thrust", "hipertrofia", ["glúteos", "posteriores"], {
    equipment: "barra + banco",
    cadence: "2-2-1",
    instructions: "Costas apoiadas no banco, estenda o quadril até a linha ombro-joelho e segure 2s no topo.",
    commonMistakes: "Hiperextender a lombar no topo; amplitude curta.",
  }),
  ex("stiff", "Stiff (RDL)", "hipertrofia", ["posteriores", "glúteos", "lombar"], {
    equipment: "barra",
    cadence: "3-1-1",
    instructions: "Joelhos semiflexionados, empurre o quadril para trás descendo a barra rente à perna até sentir o alongamento.",
    commonMistakes: "Arredondar a coluna; flexionar demais os joelhos (virar agachamento).",
  }),
  ex("leg-press", "Leg press", "hipertrofia", ["quadríceps", "glúteos"], {
    equipment: "máquina",
    cadence: "3-0-1",
    instructions: "Desça controlado até ~90° sem tirar a lombar do encosto.",
    commonMistakes: "Amplitude curta com carga alta; estender totalmente os joelhos com impacto.",
  }),
  ex("cadeira-extensora", "Cadeira extensora", "hipertrofia", ["quadríceps"], {
    equipment: "máquina",
    cadence: "2-1-2",
    instructions: "Estenda até quase o bloqueio e desça em 2 segundos.",
    commonMistakes: "Usar impulso; descer sem controle.",
  }),
  ex("mesa-flexora", "Mesa flexora", "hipertrofia", ["posteriores"], {
    equipment: "máquina",
    cadence: "2-1-2",
    instructions: "Flexione até o final da amplitude e retorne devagar, quadril colado no banco.",
    commonMistakes: "Levantar o quadril do banco; excêntrica solta.",
  }),
  ex("supino-inclinado-halteres", "Supino inclinado com halteres", "hipertrofia", ["peitoral superior", "ombros", "tríceps"], {
    equipment: "halteres",
    cadence: "3-0-1",
    instructions: "Banco a 30°, desça os halteres até o alongamento do peitoral e suba em arco.",
    commonMistakes: "Inclinação alta demais (vira ombro); bater os halteres no topo.",
  }),
  ex("desenvolvimento-halteres", "Desenvolvimento com halteres", "hipertrofia", ["ombros", "tríceps"], {
    equipment: "halteres",
    cadence: "2-0-1",
    instructions: "Sentado ou em pé, suba os halteres até a extensão sem bater no topo.",
    commonMistakes: "Arquear a lombar; descer só até a orelha.",
  }),
  ex("puxada-alta", "Puxada na polia", "hipertrofia", ["dorsais", "bíceps"], {
    equipment: "polia",
    cadence: "2-1-2",
    instructions: "Puxe a barra até a parte superior do peito com leve inclinação do tronco.",
    commonMistakes: "Puxar atrás da nuca; usar impulso do tronco.",
  }),
  ex("elevacao-lateral", "Elevação lateral", "hipertrofia", ["deltóide lateral"], {
    equipment: "halteres",
    cadence: "2-0-2",
    instructions: "Cotovelos semiflexionados, suba até a linha dos ombros liderando com os cotovelos.",
    commonMistakes: "Balançar o corpo; subir acima da linha do ombro com rotação interna.",
  }),
  ex("rosca-direta", "Rosca direta", "hipertrofia", ["bíceps", "antebraços"], {
    equipment: "barra W ou halteres",
    cadence: "2-0-2",
    instructions: "Cotovelos fixos ao lado do corpo, flexione sem balançar.",
    commonMistakes: "Roubar com o quadril; cotovelos indo à frente.",
  }),
  ex("rosca-martelo", "Rosca martelo", "hipertrofia", ["bíceps", "braquial", "antebraços"], {
    equipment: "halteres",
    cadence: "2-0-2",
    instructions: "Pegada neutra, flexione mantendo o punho firme.",
  }),
  ex("triceps-corda", "Tríceps na corda", "hipertrofia", ["tríceps"], {
    equipment: "polia",
    cadence: "2-0-2",
    instructions: "Cotovelos fixos, estenda e abra a corda no final do movimento.",
    commonMistakes: "Cotovelos abrindo; usar o ombro para empurrar.",
  }),

  // Core (negligenciado)
  ex("prancha", "Prancha", "acessorio", ["core"], {
    isNeglected: true,
    instructions: "Antebraços no chão, corpo em linha, glúteo e abdômen contraídos.",
    commonMistakes: "Quadril caído ou empinado.",
  }),
  ex("pallof-press", "Pallof press", "acessorio", ["core", "oblíquos"], {
    isNeglected: true,
    equipment: "polia ou elástico",
    instructions: "De lado para a polia, estenda os braços à frente resistindo à rotação.",
  }),
  ex("hollow-hold", "Hollow hold", "acessorio", ["core"], {
    isNeglected: true,
    instructions: "Deitado, lombar pressionada no chão, pernas e ombros suspensos.",
  }),
  ex("ab-wheel", "Roda abdominal", "acessorio", ["core", "dorsais"], {
    isNeglected: true,
    equipment: "roda",
    instructions: "Role à frente mantendo o quadril estável, sem vencer com a lombar.",
  }),

  // Negligenciados
  ex("tibial-anterior", "Elevação de ponta do pé (tibial anterior)", "acessorio", ["tibial anterior"], {
    isNeglected: true,
    instructions: "Costas na parede, calcanhares à frente, eleve as pontas dos pés o máximo possível.",
  }),
  ex("rosca-punho", "Rosca de punho", "acessorio", ["antebraços"], {
    isNeglected: true,
    equipment: "barra ou halteres",
    instructions: "Antebraços apoiados, flexione apenas os punhos com amplitude completa.",
  }),
  ex("extensao-punho", "Extensão de punho", "acessorio", ["antebraços"], {
    isNeglected: true,
    equipment: "halteres",
    instructions: "Palma para baixo, estenda o punho contra a carga.",
  }),
  ex("farmer-carry", "Farmer carry", "acessorio", ["pegada", "trapézio", "core"], {
    isNeglected: true,
    equipment: "halteres pesados ou KB",
    instructions: "Caminhe com carga pesada nas mãos, postura ereta e passos curtos.",
  }),
  ex("dead-hang", "Dead hang", "acessorio", ["pegada", "ombros"], {
    isNeglected: true,
    equipment: "barra fixa",
    instructions: "Pendure-se na barra com braços estendidos, ombros ativos.",
  }),
  ex("rotacao-externa-manguito", "Rotação externa com elástico", "acessorio", ["manguito rotador"], {
    isNeglected: true,
    equipment: "elástico",
    instructions: "Cotovelo a 90° junto ao corpo, gire o antebraço para fora devagar.",
  }),
  ex("face-pull", "Face pull", "acessorio", ["deltóide posterior", "manguito", "trapézio"], {
    isNeglected: true,
    equipment: "polia com corda",
    instructions: "Puxe a corda em direção ao rosto com rotação externa no final.",
    commonMistakes: "Carga alta demais com impulso do tronco.",
  }),
  ex("encolhimento-trapezio", "Encolhimento (trapézio)", "acessorio", ["trapézio"], {
    isNeglected: true,
    equipment: "halteres ou barra",
    instructions: "Eleve os ombros verticalmente e segure 1s no topo, sem girar.",
  }),
  ex("gluteo-medio-banda", "Caminhada lateral com banda", "acessorio", ["glúteo médio"], {
    isNeglected: true,
    equipment: "mini band",
    instructions: "Banda acima dos joelhos, semiagachado, passos laterais mantendo tensão.",
  }),
  ex("cadeira-adutora", "Cadeira adutora", "acessorio", ["adutores"], {
    isNeglected: true,
    equipment: "máquina",
    instructions: "Feche as pernas contra a resistência de forma controlada.",
  }),
  ex("cadeira-abdutora", "Cadeira abdutora", "acessorio", ["abdutores", "glúteo médio"], {
    isNeglected: true,
    equipment: "máquina",
    instructions: "Abra as pernas contra a resistência, tronco levemente inclinado à frente.",
  }),
  ex("panturrilha-em-pe", "Panturrilha em pé", "acessorio", ["panturrilhas"], {
    isNeglected: true,
    equipment: "máquina ou step",
    cadence: "2-1-2",
    instructions: "Amplitude completa: alongue embaixo, pausa de 1s no topo.",
    commonMistakes: "Repetições curtas e rápidas quicando.",
  }),
  ex("panturrilha-sentado", "Panturrilha sentado", "acessorio", ["sóleo"], {
    isNeglected: true,
    equipment: "máquina",
    cadence: "2-1-2",
    instructions: "Joelhos a 90°, foco no sóleo, pausa no alongamento.",
  }),

  // Movimentos de WOD
  ex("thruster", "Thruster", "wod", ["quadríceps", "glúteos", "ombros"], {
    equipment: "barra ou halteres",
    instructions: "Agachamento frontal + desenvolvimento em um movimento fluido.",
    commonMistakes: "Separar o agachamento do press e perder o impulso das pernas.",
  }),
  ex("wall-ball", "Wall ball", "wod", ["quadríceps", "glúteos", "ombros"], {
    equipment: "medball",
    instructions: "Agache com a bola no peito e arremesse ao alvo ao subir.",
  }),
  ex("kettlebell-swing", "Kettlebell swing", "wod", ["posteriores", "glúteos", "core"], {
    equipment: "kettlebell",
    instructions: "Movimento de dobradiça: o quadril projeta o KB até a altura dos olhos.",
    commonMistakes: "Agachar em vez de dobrar o quadril; puxar com os braços.",
  }),
  ex("burpee", "Burpee", "wod", ["corpo inteiro"], {
    instructions: "Peito no chão, suba e salte com extensão completa do quadril.",
  }),
  ex("box-jump", "Box jump", "wod", ["quadríceps", "glúteos", "panturrilhas"], {
    equipment: "caixa",
    instructions: "Salte na caixa e estenda completamente o quadril no topo. Desça com cuidado.",
  }),
  ex("double-under", "Double under", "wod", ["panturrilhas", "coordenação"], {
    equipment: "corda",
    instructions: "Duas passagens da corda por salto, punhos rápidos e salto vertical.",
  }),
  ex("pull-up-kipping", "Pull-up (kipping)", "wod", ["dorsais", "core"], {
    equipment: "barra fixa",
    instructions: "Use o balanço arco-oco para gerar impulso e suba o queixo acima da barra.",
  }),
  ex("push-up", "Flexão", "wod", ["peitoral", "tríceps", "core"], {
    instructions: "Corpo em linha, peito ao chão, extensão completa dos cotovelos.",
  }),
  ex("air-squat", "Air squat", "wod", ["quadríceps", "glúteos"], {
    instructions: "Agachamento livre sem carga, quadril abaixo da paralela.",
  }),
  ex("sit-up", "Sit-up", "wod", ["core"], {
    instructions: "Abmat sob a lombar, toque o chão atrás e os pés à frente.",
  }),
  ex("avanco-alternado", "Avanço alternado", "wod", ["quadríceps", "glúteos"], {
    instructions: "Passada à frente com o joelho de trás tocando levemente o chão.",
  }),
  ex("power-clean", "Power clean", "wod", ["posteriores", "trapézio", "corpo inteiro"], {
    equipment: "barra",
    instructions: "Puxada explosiva do chão recebendo a barra no ombro em quarto de agachamento.",
    commonMistakes: "Puxar com os braços cedo demais; barra longe do corpo.",
  }),

  // Alongamento final
  ex("alongamento-quadriceps", "Alongamento de quadríceps", "alongamento", ["quadríceps"], {
    instructions: "Em pé, puxe o pé em direção ao glúteo, joelhos alinhados. 30s por lado.",
  }),
  ex("alongamento-posterior", "Alongamento de posteriores", "alongamento", ["posteriores"], {
    instructions: "Sentado, alcance os pés com a coluna longa. 30-45s.",
  }),
  ex("alongamento-panturrilha", "Alongamento de panturrilha", "alongamento", ["panturrilhas"], {
    instructions: "Contra a parede, perna de trás estendida com calcanhar no chão. 30s por lado.",
  }),
  ex("alongamento-peitoral", "Alongamento de peitoral na porta", "alongamento", ["peitoral", "ombros"], {
    instructions: "Antebraço no batente, gire o tronco para o lado oposto. 30s por lado.",
  }),
  ex("alongamento-dorsal", "Alongamento de dorsais", "alongamento", ["dorsais"], {
    instructions: "Segure um apoio e deixe o corpo pender para trás alongando a lateral. 30s por lado.",
  }),
  ex("alongamento-gluteo", "Alongamento de glúteo deitado", "alongamento", ["glúteos"], {
    instructions: "Deitado, cruze o tornozelo sobre o joelho e puxe a coxa. 30s por lado.",
  }),
  ex("postura-crianca", "Postura da criança", "alongamento", ["coluna", "dorsais"], {
    instructions: "Ajoelhado, sente nos calcanhares e estenda os braços à frente. 45-60s respirando fundo.",
  }),
];

// ---------------------------------------------------------------------------
// Programa de 12 semanas
// ---------------------------------------------------------------------------

type Phase = {
  name: string;
  effort: number;
  main: { sets: number; reps: string; rpe: number; rest: number };
  accessory: { sets: number; reps: string; rpe: number; rest: number };
};

function phaseFor(week: number): Phase {
  if (week === 4 || week === 8)
    return {
      name: "deload",
      effort: 2,
      main: { sets: 2, reps: "10", rpe: 6, rest: 90 },
      accessory: { sets: 2, reps: "12", rpe: 6, rest: 60 },
    };
  if (week <= 3)
    return {
      name: "acumulação",
      effort: 3,
      main: { sets: 2 + week, reps: "10", rpe: 6.5 + week * 0.5, rest: 90 },
      accessory: { sets: 3, reps: "12", rpe: 8, rest: 60 },
    };
  if (week <= 7)
    return {
      name: "intensificação",
      effort: 4,
      main: { sets: 4, reps: "8", rpe: 7 + (week - 5) * 0.5, rest: 120 },
      accessory: { sets: 3, reps: "10", rpe: 8, rest: 75 },
    };
  if (week <= 11)
    return {
      name: "pico",
      effort: 5,
      main: { sets: 5, reps: "5", rpe: 8 + (week - 9) * 0.5, rest: 180 },
      accessory: { sets: 3, reps: "8", rpe: 8, rest: 90 },
    };
  return {
    name: "teste",
    effort: 5,
    main: { sets: 5, reps: "3-5 (subir até PR)", rpe: 9.5, rest: 240 },
    accessory: { sets: 2, reps: "10", rpe: 6, rest: 60 },
  };
}

type SeedWod = {
  name: string;
  type: "amrap" | "emom" | "for_time" | "tabata" | "chipper";
  scoreType: "time" | "rounds_reps" | "reps" | "load";
  timeCapSeconds?: number;
  rounds?: number;
  intervalSeconds?: number;
  scheme: string;
};

const SHORT_WODS: SeedWod[] = [
  { name: "Fran (adaptado)", type: "for_time", scoreType: "time", timeCapSeconds: 480, scheme: "21-15-9\nThrusters (42,5/30 kg)\nPull-ups" },
  { name: "EMOM 12", type: "emom", scoreType: "reps", rounds: 12, intervalSeconds: 60, scheme: "Min 1: 12 wall balls\nMin 2: 12 cal remo\nMin 3: 10 burpees\n(repetir 4x)" },
  { name: "Grace leve", type: "for_time", scoreType: "time", timeCapSeconds: 420, scheme: "30 power cleans (50/35 kg)" },
  { name: "AMRAP 10", type: "amrap", scoreType: "rounds_reps", timeCapSeconds: 600, scheme: "10 KB swings (24/16 kg)\n10 box jumps\n10 sit-ups" },
  { name: "Tabata Air Squat", type: "tabata", scoreType: "reps", rounds: 8, intervalSeconds: 20, scheme: "8 rounds: 20s air squats / 10s descanso.\nScore = menor número de reps." },
  { name: "For Time 21-15-9", type: "for_time", scoreType: "time", timeCapSeconds: 540, scheme: "21-15-9\nCal remo\nBurpees" },
  { name: "EMOM 10 técnico", type: "emom", scoreType: "reps", rounds: 10, intervalSeconds: 60, scheme: "Ímpar: 3 power cleans pesados\nPar: 30s double-unders" },
  { name: "AMRAP 12", type: "amrap", scoreType: "rounds_reps", timeCapSeconds: 720, scheme: "12 avanços alternados\n9 push-ups\n6 pull-ups" },
];

// Deload: estímulo aeróbico leve (Zona 2), sem impacto e sem corrida de relógio
const RECOVERY_WODS: SeedWod[] = [
  { name: "Zona 2 — Remo", type: "amrap", scoreType: "reps", timeCapSeconds: 900, scheme: "15 min de remo em ritmo conversável (Zona 2).\nScore = calorias totais, sem sprint final." },
  { name: "Zona 2 — Bike + Core", type: "emom", scoreType: "reps", rounds: 12, intervalSeconds: 60, scheme: "Ímpar: 45s bike leve\nPar: 30s prancha\nRitmo confortável — semana de recuperação." },
  { name: "Caminhada com carga leve", type: "amrap", scoreType: "rounds_reps", timeCapSeconds: 900, scheme: "AMRAP 15 tranquilo:\n100 m farmer carry leve\n10 air squats\n10 band pull-aparts" },
];

const LONG_WODS: SeedWod[] = [
  { name: "Cindy", type: "amrap", scoreType: "rounds_reps", timeCapSeconds: 1200, scheme: "AMRAP 20:\n5 pull-ups\n10 push-ups\n15 air squats" },
  { name: "Helen", type: "for_time", scoreType: "time", timeCapSeconds: 900, scheme: "3 rounds:\n400 m corrida (ou 500 m remo)\n21 KB swings (24/16 kg)\n12 pull-ups" },
  { name: "Chipper 100", type: "chipper", scoreType: "time", timeCapSeconds: 1500, scheme: "For time:\n25 cal remo\n25 wall balls\n25 KB swings\n25 burpees\n25 sit-ups" },
  { name: "Murph adaptado", type: "for_time", scoreType: "time", timeCapSeconds: 2400, scheme: "800 m corrida\n50 pull-ups\n100 push-ups\n150 air squats\n800 m corrida\n(particionar como quiser)" },
];

type DayTemplate = {
  dayOfWeek: number;
  name: string;
  focus: string;
  muscles: string[];
  estimatedMinutes: number;
  dynamic: string[];
  mobility: string[];
  warmup: string[];
  // [slug, isMain, repsOverride?]
  lifts: [string, boolean, string?][];
  wodPool: SeedWod[];
  finalStretch: string[];
};

const DAYS: DayTemplate[] = [
  {
    dayOfWeek: 1,
    name: "Inferior — Agachamento",
    focus: "Força de quadríceps + metcon curto",
    muscles: ["quadríceps", "glúteos", "panturrilhas", "core"],
    estimatedMinutes: 70,
    dynamic: ["balanco-pernas", "avanco-rotacao", "agachamento-cossaco"],
    mobility: ["mobilidade-tornozelo", "noventa-noventa"],
    warmup: ["bike", "barra-vazia"],
    lifts: [
      ["agachamento-livre", true],
      ["leg-press", false],
      ["cadeira-extensora", false],
      ["panturrilha-em-pe", false, "15"],
      ["prancha", false, "45s"],
    ],
    wodPool: SHORT_WODS,
    finalStretch: ["alongamento-quadriceps", "alongamento-panturrilha", "postura-crianca"],
  },
  {
    dayOfWeek: 2,
    name: "Superior — Empurrar",
    focus: "Peito e ombros + metcon",
    muscles: ["peitoral", "ombros", "tríceps"],
    estimatedMinutes: 65,
    dynamic: ["circulo-bracos", "passagem-bastao", "inchworm"],
    mobility: ["rotacao-toracica", "gato-camelo"],
    warmup: ["remo-maquina", "band-pull-apart", "barra-vazia"],
    lifts: [
      ["supino-reto", true],
      ["desenvolvimento-halteres", false],
      ["supino-inclinado-halteres", false],
      ["elevacao-lateral", false, "15"],
      ["triceps-corda", false, "12"],
      ["rotacao-externa-manguito", false, "15"],
    ],
    wodPool: SHORT_WODS,
    finalStretch: ["alongamento-peitoral", "alongamento-dorsal", "postura-crianca"],
  },
  {
    dayOfWeek: 4,
    name: "Inferior — Posterior",
    focus: "Cadeia posterior + metcon curto",
    muscles: ["posteriores", "glúteos", "lombar"],
    estimatedMinutes: 70,
    dynamic: ["balanco-pernas", "inchworm", "avanco-rotacao"],
    mobility: ["noventa-noventa", "pombo"],
    warmup: ["bike", "barra-vazia"],
    lifts: [
      ["levantamento-terra", true],
      ["hip-thrust", false],
      ["mesa-flexora", false],
      ["gluteo-medio-banda", false, "15/lado"],
      ["pallof-press", false, "12/lado"],
    ],
    wodPool: SHORT_WODS,
    finalStretch: ["alongamento-posterior", "alongamento-gluteo", "postura-crianca"],
  },
  {
    dayOfWeek: 5,
    name: "Superior — Puxar",
    focus: "Costas e braços + metcon",
    muscles: ["dorsais", "bíceps", "trapézio", "antebraços"],
    estimatedMinutes: 65,
    dynamic: ["circulo-bracos", "passagem-bastao", "gato-camelo"],
    mobility: ["rotacao-toracica", "pombo"],
    warmup: ["remo-maquina", "band-pull-apart", "dead-hang"],
    lifts: [
      ["barra-fixa", true],
      // Remada apoiada (não a curvada): a lombar já carregou no terra de quinta
      ["remada-apoiada", false],
      ["puxada-alta", false],
      ["face-pull", false, "15"],
      ["rosca-direta", false, "12"],
      ["farmer-carry", false, "30 m"],
    ],
    wodPool: SHORT_WODS,
    finalStretch: ["alongamento-dorsal", "alongamento-peitoral", "postura-crianca"],
  },
  {
    dayOfWeek: 6,
    name: "Condicionamento + Negligenciados",
    focus: "WOD longo + músculos esquecidos",
    muscles: ["corpo inteiro", "core", "panturrilhas", "antebraços"],
    estimatedMinutes: 55,
    dynamic: ["polichinelo", "inchworm", "balanco-pernas"],
    mobility: ["mobilidade-tornozelo", "gato-camelo"],
    warmup: ["pular-corda", "band-pull-apart"],
    lifts: [
      ["tibial-anterior", false, "20"],
      ["panturrilha-sentado", false, "15"],
      ["encolhimento-trapezio", false, "15"],
      ["cadeira-adutora", false, "15"],
      ["hollow-hold", false, "30s"],
      ["rosca-punho", false, "20"],
    ],
    wodPool: LONG_WODS,
    finalStretch: ["alongamento-panturrilha", "alongamento-posterior", "postura-crianca"],
  },
];

// ---------------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------------

async function main() {
  const db = await getDb();
  const [{ value: existing }] = await db.select({ value: count() }).from(exercises);
  if (existing > 0) {
    console.log(`Banco já populado (${existing} exercícios). Nada a fazer.`);
    process.exit(0);
  }

  console.log("Inserindo exercícios…");
  const inserted = await db
    .insert(exercises)
    .values(
      EXERCISES.map((e) => ({
        slug: e.slug,
        name: e.name,
        category: e.category,
        muscles: e.muscles,
        equipment: e.equipment,
        instructions: e.instructions,
        commonMistakes: e.commonMistakes,
        cadence: e.cadence,
        isNeglected: e.isNeglected ?? false,
      })),
    )
    .returning({ id: exercises.id, slug: exercises.slug });
  const idBySlug = new Map(inserted.map((r) => [r.slug, r.id]));
  const idOf = (slug: string) => {
    const id = idBySlug.get(slug);
    if (!id) throw new Error(`Exercício não encontrado no seed: ${slug}`);
    return id;
  };

  console.log("Criando programa de 12 semanas…");
  const [program] = await db
    .insert(programs)
    .values({
      name: "Híbrido 12 semanas — Hipertrofia + CrossFit",
      description:
        "5 dias/semana. Periodização: acumulação (1-3), deload (4), intensificação (5-7), deload (8), pico (9-11) e semana de teste/PR (12).",
      totalWeeks: 12,
    })
    .returning();

  for (let week = 1; week <= 12; week++) {
    const phase = phaseFor(week);
    for (const [dayIndex, day] of DAYS.entries()) {
      const [workout] = await db
        .insert(workouts)
        .values({
          programId: program.id,
          week,
          dayOfWeek: day.dayOfWeek,
          name: day.name,
          focus: day.focus,
          phase: phase.name,
          estimatedMinutes:
            phase.name === "deload" ? day.estimatedMinutes - 15 : day.estimatedMinutes,
          effortLevel: phase.effort,
          muscles: day.muscles,
        })
        .returning();

      const blocks: {
        type: (typeof workoutBlocks.$inferInsert)["type"];
        title: string;
        slugs: string[];
        prescribe?: boolean;
      }[] = [
        { type: "alongamento_dinamico", title: "Alongamento dinâmico", slugs: day.dynamic },
        { type: "mobilidade", title: "Mobilidade", slugs: day.mobility },
        { type: "aquecimento", title: "Aquecimento", slugs: day.warmup },
        { type: "hipertrofia", title: day.dayOfWeek === 6 ? "Acessórios" : "Hipertrofia", slugs: [], prescribe: true },
        { type: "wod", title: "WOD", slugs: [] },
        { type: "alongamento_final", title: "Alongamento final", slugs: day.finalStretch },
      ];

      for (const [order, b] of blocks.entries()) {
        const [block] = await db
          .insert(workoutBlocks)
          .values({ workoutId: workout.id, order, type: b.type, title: b.title })
          .returning();

        if (b.type === "wod") {
          // Deload: só regenerativo. Semana de teste: leve entre os dias de
          // 1RM; sábado mantém um benchmark (Cindy) como reteste de condicionamento.
          const pool =
            phase.name === "deload" ||
            (phase.name === "teste" && day.dayOfWeek !== 6)
              ? RECOVERY_WODS
              : phase.name === "teste"
                ? [LONG_WODS[0]]
                : day.wodPool;
          const wod = pool[(week + dayIndex) % pool.length];
          await db.insert(wods).values({
            blockId: block.id,
            name: wod.name,
            type: wod.type,
            scoreType: wod.scoreType,
            timeCapSeconds: wod.timeCapSeconds,
            rounds: wod.rounds,
            intervalSeconds: wod.intervalSeconds,
            scheme: wod.scheme,
          });
          continue;
        }

        if (b.prescribe) {
          await db.insert(blockExercises).values(
            day.lifts.map(([slug, isMain, repsOverride], i) => {
              const p = isMain ? phase.main : phase.accessory;
              return {
                blockId: block.id,
                exerciseId: idOf(slug),
                order: i,
                sets: p.sets,
                reps: repsOverride ?? p.reps,
                restSeconds: p.rest,
                targetRpe: p.rpe,
                tempo: EXERCISES.find((e) => e.slug === slug)?.cadence,
                notes: isMain ? "Exercício principal do dia" : undefined,
              };
            }),
          );
          continue;
        }

        // Blocos de preparo/alongamento: 1 "série" por item, sem carga
        await db.insert(blockExercises).values(
          b.slugs.map((slug, i) => ({
            blockId: block.id,
            exerciseId: idOf(slug),
            order: i,
            sets: 1,
            reps: b.type === "aquecimento" ? "2-3 min" : "30-45s",
            restSeconds: 0,
          })),
        );
      }
    }
  }

  console.log("Seed concluído: 60 dias de treino (12 semanas × 5 dias).");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

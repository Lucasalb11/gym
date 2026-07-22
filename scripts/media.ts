/* Enriquece a biblioteca: imagens (free-exercise-db, domínio público),
 * vídeos (busca YouTube de técnica) e substitutos sem equipamento.
 * Idempotente — rode com: npx tsx scripts/media.ts (DATABASE_URL opcional) */
import { eq } from "drizzle-orm";
import { getDb } from "../src/db";
import { exercises } from "../src/db/schema";

const FEDB_INDEX =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const FEDB_IMG =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

// slug do app → candidatos de id no free-exercise-db (usa o primeiro que existir)
const IMAGE_CANDIDATES: Record<string, string[]> = {
  "agachamento-livre": ["Barbell_Squat", "Barbell_Full_Squat"],
  "levantamento-terra": ["Barbell_Deadlift"],
  "supino-reto": ["Barbell_Bench_Press_-_Medium_Grip"],
  "desenvolvimento-militar": ["Standing_Military_Press"],
  "barra-fixa": ["Pullups"],
  "pull-up-kipping": ["Pullups"],
  "remada-curvada": ["Bent_Over_Barbell_Row"],
  "remada-apoiada": ["Dumbbell_Incline_Row", "Bent_Over_Two-Dumbbell_Row"],
  "hip-thrust": ["Barbell_Hip_Thrust"],
  stiff: ["Romanian_Deadlift"],
  "leg-press": ["Leg_Press"],
  "cadeira-extensora": ["Leg_Extensions"],
  "mesa-flexora": ["Lying_Leg_Curls"],
  "supino-inclinado-halteres": [
    "Incline_Dumbbell_Press",
    "Incline_Dumbbell_Bench_With_Palms_Facing_In",
  ],
  "desenvolvimento-halteres": [
    "Dumbbell_Shoulder_Press",
    "Standing_Dumbbell_Press",
  ],
  "puxada-alta": ["Wide-Grip_Lat_Pulldown", "Full_Range-Of-Motion_Lat_Pulldown"],
  "elevacao-lateral": ["Side_Lateral_Raise", "Power_Partials"],
  "rosca-direta": ["Barbell_Curl"],
  "rosca-martelo": ["Hammer_Curls"],
  "triceps-corda": ["Triceps_Pushdown_-_Rope_Attachment"],
  prancha: ["Plank"],
  "kettlebell-swing": ["One-Arm_Kettlebell_Swings"],
  "push-up": ["Pushups"],
  "air-squat": ["Bodyweight_Squat", "Freehand_Jump_Squat"],
  "power-clean": ["Power_Clean", "Clean"],
  "face-pull": ["Face_Pull"],
  "encolhimento-trapezio": ["Barbell_Shrug"],
  "panturrilha-em-pe": ["Standing_Calf_Raises"],
  "panturrilha-sentado": ["Seated_Calf_Raise", "Barbell_Seated_Calf_Raise"],
  "farmer-carry": ["Farmers_Walk"],
  "box-jump": ["Front_Box_Jump", "Box_Jump_Multiple_Response"],
  "sit-up": ["3_4_Sit-Up"],
  thruster: ["Kettlebell_Thruster"],
  "pular-corda": ["Rope_Jumping"],
  "double-under": ["Rope_Jumping"],
  "rosca-punho": ["Palms-Up_Barbell_Wrist_Curl_Over_A_Bench", "Seated_Palms-Up_Barbell_Wrist_Curl"],
  "extensao-punho": ["Palms-Down_Wrist_Curl_Over_A_Bench", "Seated_Palms-Down_Barbell_Wrist_Curl"],
  "cadeira-adutora": ["Thigh_Adductor"],
  "cadeira-abdutora": ["Thigh_Abductor"],
  "avanco-alternado": ["Dumbbell_Lunges", "Bodyweight_Lunge"],
  "gluteo-medio-banda": ["Band_Hip_Adductions"],
};

// Substitutos sem equipamento (foco nos movimentos de CrossFit/máquina)
const SUBSTITUTES: Record<string, string> = {
  "remo-maquina": "Sem remo: 400 m de corrida ≈ 500 m de remo; indoor, 60-90s de polichinelos vigorosos.",
  bike: "Sem bike: corrida leve ou corrida estacionária pelo mesmo tempo.",
  "pular-corda": "Sem corda: saltos no lugar simulando o giro dos punhos.",
  "double-under": "Sem corda: 2 saltos rápidos no lugar = 1 double-under; ou troque por polichinelos (3:1).",
  "wall-ball": "Sem medball: thruster com halter/garrafão de água; ou agachamento com salto (mesmo número de reps).",
  "kettlebell-swing": "Sem kettlebell: swing com halter na vertical ou mochila carregada; mantenha o padrão de dobradiça explosiva.",
  "box-jump": "Sem caixa: salto vertical com joelhos ao peito; ou step-up em banco/escada firme.",
  "pull-up-kipping": "Sem barra: remada invertida embaixo de uma mesa firme, ou remada com elástico — mantenha o ritmo alto.",
  "barra-fixa": "Sem barra fixa: remada invertida na mesa ou puxada com elástico ancorado na porta.",
  thruster: "Sem barra: thruster com halteres, garrafões ou mochila abraçada ao peito.",
  "power-clean": "Sem barra: clean com halteres ou swing pesado explosivo (dobradiça rápida).",
  "farmer-carry": "Sem halteres pesados: sacolas reforçadas ou galões de água cheios.",
  "puxada-alta": "Sem polia: pull-up com elástico de assistência ou remada invertida.",
  "triceps-corda": "Sem polia: tríceps francês com halter ou flexão de pegada fechada.",
  "cadeira-extensora": "Sem máquina: agachamento búlgaro ou sissy squat assistido.",
  "mesa-flexora": "Sem máquina: nordic curl assistido ou leg curl deslizante com toalha no chão.",
  "cadeira-adutora": "Sem máquina: aperte uma bola/almofada entre os joelhos (3×20s) ou agachamento cossaco.",
  "cadeira-abdutora": "Sem máquina: concha lateral com mini band ou elevação lateral de perna deitado.",
  "leg-press": "Sem máquina: agachamento búlgaro com halteres ou agachamento goblet pausado.",
  "band-pull-apart": "Sem elástico: toalha esticada entre as mãos com tensão isométrica + retração de escápulas.",
};

async function main() {
  const db = await getDb();
  const res = await fetch(FEDB_INDEX);
  if (!res.ok) throw new Error(`Índice free-exercise-db falhou: ${res.status}`);
  const index = (await res.json()) as { id: string; images: string[] }[];
  const byId = new Map(index.map((e) => [e.id, e]));

  const rows = await db
    .select({ id: exercises.id, slug: exercises.slug, name: exercises.name })
    .from(exercises);

  let images = 0;
  let subs = 0;
  for (const row of rows) {
    let imageUrl: string | null = null;
    for (const candidate of IMAGE_CANDIDATES[row.slug] ?? []) {
      const entry = byId.get(candidate);
      if (entry?.images?.[0]) {
        imageUrl = `${FEDB_IMG}/${entry.images[0]}`;
        break;
      }
    }
    const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `como fazer ${row.name} técnica correta`,
    )}`;
    const substitutes = SUBSTITUTES[row.slug] ?? null;

    await db
      .update(exercises)
      .set({
        ...(imageUrl ? { imageUrl } : {}),
        videoUrl,
        ...(substitutes ? { substitutes } : {}),
      })
      .where(eq(exercises.id, row.id));
    if (imageUrl) images++;
    if (substitutes) subs++;
  }
  console.log(
    `Mídia atualizada: ${rows.length} vídeos, ${images} imagens, ${subs} substitutos.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

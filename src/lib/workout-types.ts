// Tipos serializáveis compartilhados entre server components e o player (client)

export type ExerciseInfo = {
  id: number;
  slug: string;
  name: string;
  category: string;
  muscles: string[];
  equipment: string | null;
  instructions: string | null;
  commonMistakes: string | null;
  cadence: string | null;
  isNeglected: boolean;
};

export type LastLog = {
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
} | null;

export type PlayerItem = {
  id: number; // blockExerciseId
  exerciseId: number;
  order: number;
  sets: number;
  reps: string;
  restSeconds: number;
  targetRpe: number | null;
  tempo: string | null;
  notes: string | null;
  exercise: ExerciseInfo;
  lastLog: LastLog;
};

export type PlayerWod = {
  id: number;
  name: string;
  type: "amrap" | "emom" | "for_time" | "tabata" | "chipper";
  scoreType: "time" | "rounds_reps" | "reps" | "load";
  timeCapSeconds: number | null;
  rounds: number | null;
  intervalSeconds: number | null;
  scheme: string;
};

export type PlayerBlock = {
  id: number;
  order: number;
  type:
    | "alongamento_dinamico"
    | "mobilidade"
    | "aquecimento"
    | "hipertrofia"
    | "wod"
    | "alongamento_final";
  title: string;
  wod: PlayerWod | null;
  items: PlayerItem[];
};

export type PlayerWorkout = {
  id: number;
  name: string;
  focus: string | null;
  week: number;
  phase: string | null;
  estimatedMinutes: number;
  effortLevel: number;
  muscles: string[];
};

export type LoggedSet = {
  blockExerciseId: number | null;
  exerciseId: number;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
};

export type PlayerData = {
  workout: PlayerWorkout;
  blocks: PlayerBlock[];
  sessionId: number | null;
  sessionStartedAt: string | null;
  loggedSets: LoggedSet[];
  loggedWodIds: number[];
  defaultRestSeconds: number;
  soundEnabled: boolean;
};

export const BLOCK_LABEL: Record<PlayerBlock["type"], string> = {
  alongamento_dinamico: "Alongamento dinâmico",
  mobilidade: "Mobilidade",
  aquecimento: "Aquecimento",
  hipertrofia: "Hipertrofia",
  wod: "WOD",
  alongamento_final: "Alongamento final",
};

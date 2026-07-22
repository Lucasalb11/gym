"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Flag,
  Info,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { finishSession, logSet, saveWodResult, startSession } from "@/actions/workout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { VideoEmbed } from "@/components/video-embed";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { cn } from "@/lib/utils";
import {
  BLOCK_LABEL,
  type PlayerBlock,
  type PlayerData,
  type PlayerItem,
  type PlayerWod,
} from "@/lib/workout-types";
import { RestTimer } from "./rest-timer";
import { WodTimer } from "./wod-timer";

function parseTargetReps(reps: string): number | null {
  const m = reps.match(/^(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  return Number(m[2] ?? m[1]);
}

const isTrackedBlock = (b: PlayerBlock) => b.type === "hipertrofia";

export function WorkoutPlayer(props: PlayerData) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(props.sessionId);
  const [done, setDone] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {};
    for (const log of props.loggedSets) {
      if (log.blockExerciseId != null) {
        map[log.blockExerciseId] = Math.max(map[log.blockExerciseId] ?? 0, log.setNumber);
      }
    }
    return map;
  });
  const [wodDone, setWodDone] = useState<Set<number>>(
    () => new Set(props.loggedWodIds),
  );
  const [rest, setRest] = useState<{ seconds: number; nextLabel: string | null } | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finishNotes, setFinishNotes] = useState("");
  const wodElapsedRef = useRef(0);

  useWakeLock(true);

  useEffect(() => {
    if (sessionId == null) {
      startSession(props.workout.id).then(({ sessionId }) => setSessionId(sessionId));
    }
  }, [sessionId, props.workout.id]);

  const { totalUnits, doneUnits, currentKey, nextLabelByKey } = useMemo(() => {
    let total = 0;
    let doneCount = 0;
    let current: string | null = null;
    const labels = new Map<string, string | null>();
    const flat: { key: string; label: string }[] = [];

    for (const block of props.blocks) {
      if (block.type === "wod" && block.wod) {
        total += 1;
        if (wodDone.has(block.wod.id)) doneCount += 1;
        else current ??= `wod-${block.wod.id}`;
        flat.push({ key: `wod-${block.wod.id}`, label: `WOD ${block.wod.name}` });
        continue;
      }
      for (const item of block.items) {
        const target = item.sets;
        const d = Math.min(done[item.id] ?? 0, target);
        total += target;
        doneCount += d;
        if (d < target) current ??= `item-${item.id}`;
        flat.push({ key: `item-${item.id}`, label: item.exercise.name });
      }
    }
    for (let i = 0; i < flat.length; i++) {
      labels.set(flat[i].key, flat[i + 1]?.label ?? null);
    }
    return {
      totalUnits: total,
      doneUnits: doneCount,
      currentKey: current,
      nextLabelByKey: labels,
    };
  }, [props.blocks, done, wodDone]);

  const allDone = doneUnits >= totalUnits;

  async function completeSet(
    item: PlayerItem,
    payload: { weightKg: number | null; reps: number | null; rpe: number | null },
    tracked: boolean,
  ) {
    if (sessionId == null) return;
    const setNumber = (done[item.id] ?? 0) + 1;
    const isLastSetOfItem = setNumber >= item.sets;
    setDone((d) => ({ ...d, [item.id]: setNumber }));

    if (tracked && item.restSeconds > 0 && doneUnits + 1 < totalUnits) {
      setRest({
        seconds: item.restSeconds,
        nextLabel: isLastSetOfItem
          ? (nextLabelByKey.get(`item-${item.id}`) ?? null)
          : `${item.exercise.name} — série ${setNumber + 1} de ${item.sets}`,
      });
    }

    try {
      const res = await logSet({
        sessionId,
        exerciseId: item.exerciseId,
        blockExerciseId: item.id,
        setNumber,
        weightKg: payload.weightKg,
        reps: payload.reps,
        rpe: payload.rpe,
      });
      if (res.prAchieved && payload.weightKg) {
        toast.success(`Novo PR! ${item.exercise.name}: ${payload.weightKg} kg 🎉`);
      }
    } catch {
      setDone((d) => ({ ...d, [item.id]: setNumber - 1 }));
      toast.error("Não consegui salvar a série. Tente de novo.");
    }
  }

  async function completeWod(
    wod: PlayerWod,
    result: {
      resultSeconds: number | null;
      resultRounds: number | null;
      resultReps: number | null;
      rx: boolean;
      notes?: string;
    },
  ) {
    if (sessionId == null) return;
    setWodDone((s) => new Set(s).add(wod.id));
    try {
      await saveWodResult({
        sessionId,
        wodId: wod.id,
        resultText: null,
        ...result,
      });
      toast.success("Resultado do WOD salvo.");
    } catch {
      setWodDone((s) => {
        const next = new Set(s);
        next.delete(wod.id);
        return next;
      });
      toast.error("Não consegui salvar o WOD. Tente de novo.");
    }
  }

  async function handleFinish() {
    if (sessionId == null) return;
    setFinishing(true);
    await finishSession(sessionId, finishNotes || undefined);
    toast.success("Treino concluído. Bom trabalho! 💪");
    router.push("/");
    router.refresh();
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col gap-5 pb-24">
        {/* Cabeçalho fixo com progresso */}
        <header className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold">{props.workout.name}</h1>
              <p className="text-xs text-muted-foreground">
                Semana {props.workout.week} ·{" "}
                <span className="font-mono tabular-nums">
                  {doneUnits}/{totalUnits}
                </span>{" "}
                concluído
              </p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Sair do treino"
            >
              <Link href={`/treino/${props.workout.id}`}>
                <X className="size-5" aria-hidden />
              </Link>
            </Button>
          </div>
          <Progress
            value={(doneUnits / Math.max(totalUnits, 1)) * 100}
            className="mt-2 h-1.5"
            aria-label="Progresso do treino"
          />
        </header>

        {/* Blocos na ordem obrigatória */}
        {props.blocks.map((block) => (
          <section key={block.id} aria-label={block.title}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {BLOCK_LABEL[block.type]}
            </h2>

            {block.type === "wod" && block.wod ? (
              <WodCard
                wod={block.wod}
                active={currentKey === `wod-${block.wod.id}`}
                done={wodDone.has(block.wod.id)}
                onElapsed={(s) => (wodElapsedRef.current = s)}
                elapsedRef={wodElapsedRef}
                onComplete={(r) => completeWod(block.wod!, r)}
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {block.items.map((item) => (
                  <ExerciseCard
                    key={item.id}
                    item={item}
                    tracked={isTrackedBlock(block)}
                    completedSets={Math.min(done[item.id] ?? 0, item.sets)}
                    active={currentKey === `item-${item.id}`}
                    onComplete={(payload) =>
                      completeSet(item, payload, isTrackedBlock(block))
                    }
                  />
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Finalizar */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="lg"
              variant={allDone ? "default" : "outline"}
              className="h-12 rounded-full"
            >
              <Flag className="size-5" aria-hidden />
              Finalizar treino
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finalizar treino?</DialogTitle>
              <DialogDescription>
                {allDone
                  ? "Tudo concluído. Registrar e voltar ao início."
                  : `Ainda faltam ${totalUnits - doneUnits} itens. O que foi feito será salvo.`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="finish-notes">Observações (opcional)</Label>
              <Textarea
                id="finish-notes"
                placeholder="Como foi o treino?"
                value={finishNotes}
                onChange={(e) => setFinishNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleFinish} disabled={finishing || sessionId == null}>
                {finishing ? "Salvando…" : "Concluir treino"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Descanso inteligente */}
      <AnimatePresence>
        {rest && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
          >
            <RestTimer
              seconds={rest.seconds}
              nextLabel={rest.nextLabel}
              soundEnabled={props.soundEnabled}
              onDone={() => setRest(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

// ---------------------------------------------------------------------------
// Card de exercício
// ---------------------------------------------------------------------------

function ExerciseCard({
  item,
  tracked,
  completedSets,
  active,
  onComplete,
}: {
  item: PlayerItem;
  tracked: boolean;
  completedSets: number;
  active: boolean;
  onComplete: (p: {
    weightKg: number | null;
    reps: number | null;
    rpe: number | null;
  }) => void;
}) {
  const finished = completedSets >= item.sets;
  const [showInfo, setShowInfo] = useState(false);
  const currentSet = completedSets + 1;

  // Progressão automática: se o RPE da última sessão ficou no alvo ou abaixo,
  // sugere +2,5 kg; senão, repete a carga anterior.
  const suggestion =
    item.lastLog?.weightKg != null
      ? item.lastLog.rpe != null &&
        item.targetRpe != null &&
        item.lastLog.rpe <= item.targetRpe
        ? item.lastLog.weightKg + 2.5
        : item.lastLog.weightKg
      : null;

  const [weight, setWeight] = useState<number | "">(suggestion ?? "");
  const [reps, setReps] = useState<number | "">(
    parseTargetReps(item.reps) ?? "",
  );
  const [rpe, setRpe] = useState<number | null>(
    item.targetRpe ? Math.round(item.targetRpe) : null,
  );

  return (
    <li>
      <motion.div
        layout
        className={cn(
          "rounded-xl border bg-card p-4 transition-colors",
          active ? "border-primary/50" : "border-border",
          finished && "opacity-70",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={cn("font-medium", finished && "line-through decoration-primary/60")}>
              {item.exercise.name}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {tracked ? (
                <>
                  {item.sets}× {item.reps}
                  {item.targetRpe ? ` · RPE ${item.targetRpe}` : ""}
                  {item.tempo ? ` · cadência ${item.tempo}` : ""}
                  {` · descanso ${item.restSeconds}s`}
                </>
              ) : (
                item.reps
              )}
            </p>
            {tracked && item.lastLog?.weightKg != null && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Anterior: {item.lastLog.weightKg} kg × {item.lastLog.reps ?? "?"}
                {suggestion != null && suggestion > item.lastLog.weightKg && (
                  <span className="ml-1.5 text-primary">
                    · sugestão {suggestion} kg (RPE abaixo do alvo)
                  </span>
                )}
                {typeof weight === "number" && weight > item.lastLog.weightKg && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 font-medium text-primary">
                    <ArrowUp className="size-3" aria-hidden />+
                    {(weight - item.lastLog.weightKg).toFixed(1).replace(/\.0$/, "")}{" "}
                    kg
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {(item.exercise.instructions || item.exercise.commonMistakes) && (
              <Button
                variant="ghost"
                size="icon"
                aria-expanded={showInfo}
                aria-label={`Como executar ${item.exercise.name}`}
                onClick={() => setShowInfo((v) => !v)}
              >
                <Info className="size-4" aria-hidden />
              </Button>
            )}
            {finished ? (
              <Badge className="gap-1">
                <Check className="size-3.5" aria-hidden />
                Feito
              </Badge>
            ) : (
              tracked && (
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {completedSets}/{item.sets}
                </span>
              )
            )}
          </div>
        </div>

        {showInfo && (
          <div className="mt-3 rounded-lg bg-secondary/50 p-3 text-sm">
            {item.exercise.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.exercise.imageUrl}
                alt={`Demonstração de ${item.exercise.name}`}
                className="mb-3 w-full max-w-sm rounded-lg bg-white"
                loading="lazy"
              />
            )}
            {item.exercise.instructions && (
              <p>
                <span className="font-medium">Execução: </span>
                {item.exercise.instructions}
              </p>
            )}
            {item.exercise.commonMistakes && (
              <p className="mt-2">
                <span className="font-medium">Erros comuns: </span>
                {item.exercise.commonMistakes}
              </p>
            )}
            {item.exercise.substitutes && (
              <p className="mt-2">
                <span className="font-medium">Sem equipamento? </span>
                {item.exercise.substitutes}
              </p>
            )}
            {item.exercise.muscles.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Músculos: {item.exercise.muscles.join(", ")}
              </p>
            )}
            {item.exercise.videoUrl && (
              <div className="mt-3">
                <VideoEmbed
                  url={item.exercise.videoUrl}
                  title={item.exercise.name}
                />
              </div>
            )}
          </div>
        )}

        {/* Formulário da série atual */}
        {!finished && active && tracked && (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm font-medium text-primary">
              Série {currentSet} de {item.sets}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Stepper
                label="Carga (kg)"
                value={weight}
                step={2.5}
                onChange={setWeight}
              />
              <Stepper label="Reps" value={reps} step={1} onChange={setReps} />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">RPE</p>
              <div className="flex gap-1.5" role="radiogroup" aria-label="RPE">
                {[6, 7, 8, 9, 10].map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={rpe === v}
                    onClick={() => setRpe(rpe === v ? null : v)}
                    className={cn(
                      "h-10 flex-1 rounded-lg border text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      rpe === v
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <Button
              size="lg"
              className="h-12 rounded-full text-base"
              onClick={() =>
                onComplete({
                  weightKg: weight === "" ? null : weight,
                  reps: reps === "" ? null : reps,
                  rpe,
                })
              }
            >
              <Check className="size-5" aria-hidden />
              Concluir série
            </Button>
          </div>
        )}

        {/* Item de preparo/alongamento: só marcar como feito */}
        {!finished && active && !tracked && (
          <Button
            variant="secondary"
            className="mt-3 h-11 w-full rounded-full"
            onClick={() => onComplete({ weightKg: null, reps: null, rpe: null })}
          >
            <Check className="size-5" aria-hidden />
            Concluir
          </Button>
        )}
      </motion.div>
    </li>
  );
}

function Stepper({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number | "";
  step: number;
  onChange: (v: number | "") => void;
}) {
  const id = label.toLowerCase().replace(/\W+/g, "-");
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          aria-label={`Diminuir ${label}`}
          onClick={() =>
            onChange(Math.max(0, (typeof value === "number" ? value : 0) - step))
          }
        >
          <Minus className="size-4" aria-hidden />
        </Button>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={value}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="h-10 text-center font-mono tabular-nums"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0"
          aria-label={`Aumentar ${label}`}
          onClick={() => onChange((typeof value === "number" ? value : 0) + step)}
        >
          <Plus className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card do WOD
// ---------------------------------------------------------------------------

const WOD_TYPE_LABEL: Record<PlayerWod["type"], string> = {
  amrap: "AMRAP",
  emom: "EMOM",
  for_time: "For Time",
  tabata: "Tabata",
  chipper: "Chipper",
};

function WodCard({
  wod,
  active,
  done,
  onComplete,
  onElapsed,
  elapsedRef,
}: {
  wod: PlayerWod;
  active: boolean;
  done: boolean;
  onComplete: (r: {
    resultSeconds: number | null;
    resultRounds: number | null;
    resultReps: number | null;
    rx: boolean;
    notes?: string;
  }) => void;
  onElapsed: (s: number) => void;
  elapsedRef: React.RefObject<number>;
}) {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState<number | "">("");
  const [seconds, setSeconds] = useState<number | "">("");
  const [rounds, setRounds] = useState<number | "">("");
  const [reps, setReps] = useState<number | "">("");
  const [rx, setRx] = useState(true);

  const needsTime = wod.scoreType === "time";
  const needsRounds = wod.scoreType === "rounds_reps";
  const needsReps = wod.scoreType === "reps" || wod.scoreType === "rounds_reps";

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4",
        active ? "border-primary/50" : "border-border",
        done && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn("font-medium", done && "line-through decoration-primary/60")}>
            {wod.name}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="secondary">{WOD_TYPE_LABEL[wod.type]}</Badge>
            {wod.timeCapSeconds && (
              <Badge variant="secondary" className="font-mono tabular-nums">
                cap {Math.round(wod.timeCapSeconds / 60)}′
              </Badge>
            )}
          </div>
        </div>
        {done && (
          <Badge className="gap-1">
            <Check className="size-3.5" aria-hidden />
            Feito
          </Badge>
        )}
      </div>

      <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-secondary/50 p-3 font-sans text-sm leading-relaxed">
        {wod.scheme}
      </pre>
      <p className="mt-2 text-xs text-muted-foreground">
        Escale a carga ou o movimento se precisar — preserve a intenção do
        estímulo (ritmo e domínio de tempo), não a carga da prescrição.
      </p>

      {!done && active && (
        <div className="mt-4 flex flex-col gap-3">
          <WodTimer wod={wod} onElapsed={onElapsed} />
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (v && needsTime && minutes === "" && seconds === "") {
                const e = elapsedRef.current ?? 0;
                if (e > 0) {
                  setMinutes(Math.floor(e / 60));
                  setSeconds(e % 60);
                }
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="lg" className="h-12 rounded-full">
                <Flag className="size-5" aria-hidden />
                Registrar resultado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{wod.name}</DialogTitle>
                <DialogDescription>
                  {WOD_TYPE_LABEL[wod.type]} — registre seu score.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                {needsTime && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="wod-min">Minutos</Label>
                      <Input
                        id="wod-min"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={minutes}
                        onChange={(e) =>
                          setMinutes(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        className="font-mono tabular-nums"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="wod-sec">Segundos</Label>
                      <Input
                        id="wod-sec"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={59}
                        value={seconds}
                        onChange={(e) =>
                          setSeconds(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        className="font-mono tabular-nums"
                      />
                    </div>
                  </div>
                )}
                {needsRounds && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="wod-rounds">Rounds completos</Label>
                    <Input
                      id="wod-rounds"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={rounds}
                      onChange={(e) =>
                        setRounds(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="font-mono tabular-nums"
                    />
                  </div>
                )}
                {needsReps && (
                  <div className="grid gap-1.5">
                    <Label htmlFor="wod-reps">
                      {wod.scoreType === "rounds_reps" ? "Reps extras" : "Reps"}
                    </Label>
                    <Input
                      id="wod-reps"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={reps}
                      onChange={(e) =>
                        setReps(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="font-mono tabular-nums"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <Label htmlFor="wod-rx" className="font-normal">
                    Fiz como prescrito (RX)
                  </Label>
                  <Switch id="wod-rx" checked={rx} onCheckedChange={setRx} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    onComplete({
                      resultSeconds: needsTime
                        ? (typeof minutes === "number" ? minutes : 0) * 60 +
                          (typeof seconds === "number" ? seconds : 0)
                        : null,
                      resultRounds:
                        needsRounds && typeof rounds === "number" ? rounds : null,
                      resultReps: needsReps && typeof reps === "number" ? reps : null,
                      rx,
                    });
                    setOpen(false);
                  }}
                >
                  Salvar resultado
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {!active && !done && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <ChevronDown className="size-3.5" aria-hidden />
          Complete as etapas anteriores para liberar o WOD
        </p>
      )}
    </div>
  );
}

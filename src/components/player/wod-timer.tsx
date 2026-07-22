"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/dates";
import type { PlayerWod } from "@/lib/workout-types";

/**
 * Timer do WOD: For Time/Chipper contam para cima (até o cap);
 * AMRAP/EMOM/Tabata contam para baixo a partir do tempo total.
 */
export function WodTimer({
  wod,
  onElapsed,
}: {
  wod: PlayerWod;
  onElapsed?: (seconds: number) => void;
}) {
  const countdown = wod.type === "amrap" || wod.type === "emom" || wod.type === "tabata";
  const totalSeconds =
    wod.timeCapSeconds ??
    (wod.rounds && wod.intervalSeconds ? wod.rounds * wod.intervalSeconds : 0);

  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const baseRef = useRef(0);
  const onElapsedRef = useRef(onElapsed);
  onElapsedRef.current = onElapsed;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const e = baseRef.current + Math.round((Date.now() - startRef.current) / 1000);
      setElapsed(e);
      onElapsedRef.current?.(e);
      if (totalSeconds > 0 && e >= totalSeconds) {
        setRunning(false);
        if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [running, totalSeconds]);

  const display = countdown ? Math.max(0, totalSeconds - elapsed) : elapsed;
  const capped = totalSeconds > 0 && elapsed >= totalSeconds;

  // Marcador de minuto para EMOM/Tabata
  const interval = wod.intervalSeconds ?? 60;
  const currentRound =
    (wod.type === "emom" || wod.type === "tabata") && elapsed > 0
      ? Math.min(Math.floor(elapsed / interval) + 1, wod.rounds ?? 1)
      : null;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary/40 p-5">
      <p
        className="font-mono text-5xl font-semibold tabular-nums"
        role="timer"
        aria-live="off"
      >
        {formatSeconds(display)}
      </p>
      {currentRound && (
        <p className="text-sm text-muted-foreground">
          Round <span className="font-mono tabular-nums">{currentRound}</span>
          {wod.rounds ? ` de ${wod.rounds}` : ""}
        </p>
      )}
      {capped && (
        <p className="text-sm font-medium text-primary">Tempo encerrado!</p>
      )}
      <div className="flex items-center gap-2">
        <Button
          size="lg"
          variant={running ? "secondary" : "default"}
          className="h-12 rounded-full px-6"
          onClick={() => {
            if (running) {
              baseRef.current = elapsed;
              setRunning(false);
            } else {
              startRef.current = Date.now();
              setRunning(true);
            }
          }}
        >
          {running ? (
            <>
              <Pause className="size-5" aria-hidden /> Pausar
            </>
          ) : (
            <>
              <Play className="size-5" aria-hidden />
              {elapsed > 0 ? "Retomar" : "Iniciar"}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 rounded-full"
          onClick={() => {
            setRunning(false);
            setElapsed(0);
            baseRef.current = 0;
            onElapsedRef.current?.(0);
          }}
          aria-label="Zerar timer"
        >
          <RotateCcw className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

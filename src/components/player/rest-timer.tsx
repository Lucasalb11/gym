"use client";

import { useEffect, useRef, useState } from "react";
import { FastForward, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/dates";

function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // áudio indisponível
  }
}

export function RestTimer({
  seconds,
  soundEnabled,
  nextLabel,
  onDone,
}: {
  seconds: number;
  soundEnabled: boolean;
  nextLabel: string | null;
  onDone: () => void;
}) {
  const [total, setTotal] = useState(seconds);
  const [remaining, setRemaining] = useState(seconds);
  const endRef = useRef(Date.now() + seconds * 1000);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const tick = () => {
      const left = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(interval);
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        if (soundEnabled) beep();
        doneRef.current();
      }
    };
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const addTime = (extra: number) => {
    endRef.current += extra * 1000;
    setTotal((t) => t + extra);
    setRemaining((r) => r + extra);
  };

  const pct = total > 0 ? (remaining / total) * 100 : 0;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Descanso: ${formatSeconds(remaining)}`}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/30 bg-background/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="h-1 bg-primary transition-[width] duration-300 ease-linear motion-reduce:transition-none"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Descanso
          </p>
          <p className="font-mono text-3xl font-semibold tabular-nums">
            {formatSeconds(remaining)}
          </p>
          {nextLabel && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Próxima: {nextLabel}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addTime(30)}
            className="h-10"
          >
            <Plus className="size-4" aria-hidden />
            30s
          </Button>
          <Button size="sm" onClick={onDone} className="h-10">
            <FastForward className="size-4" aria-hidden />
            Pular
          </Button>
        </div>
      </div>
    </div>
  );
}

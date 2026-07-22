export function todayISO(d = new Date()): string {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 10);
}

/** 1 = segunda … 7 = domingo */
export function isoDayOfWeek(d = new Date()): number {
  return d.getDay() === 0 ? 7 : d.getDay();
}

export function mondayOf(d = new Date()): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  out.setDate(out.getDate() - (isoDayOfWeek(d) - 1));
  return out;
}

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export const WEEKDAY_LABELS: Record<number, string> = {
  1: "Segunda",
  2: "Terça",
  3: "Quarta",
  4: "Quinta",
  5: "Sexta",
  6: "Sábado",
  7: "Domingo",
};

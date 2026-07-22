"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

const AXIS = {
  stroke: "var(--border)",
  tick: { fill: "var(--muted-foreground)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    color: "var(--popover-foreground)",
    fontSize: 12,
  },
  labelStyle: { color: "var(--muted-foreground)" },
  cursor: { fill: "var(--muted)", opacity: 0.4 },
} as const;

const fmtWeek = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

export function VolumeChart({
  data,
}: {
  data: { week: string; volume: number; sets: number }[];
}) {
  if (data.length === 0) return <EmptyChart label="Registre séries com carga para ver o volume semanal." />;
  return (
    <div className="h-56" role="img" aria-label="Gráfico de volume semanal em quilos">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="week" tickFormatter={fmtWeek} {...AXIS} />
          <YAxis {...AXIS} tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}t` : String(v))} />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value) => [`${Math.round(Number(value))} kg`, "Volume"]}
            labelFormatter={(l) => `Semana de ${fmtWeek(String(l))}`}
          />
          <Bar
            dataKey="volume"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeightChart({
  data,
}: {
  data: { date: string; weightKg: number }[];
}) {
  if (data.length === 0)
    return <EmptyChart label="Registre seu peso no diário para acompanhar a curva." />;
  return (
    <div className="h-56" role="img" aria-label="Gráfico de peso corporal">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="date" tickFormatter={fmtWeek} {...AXIS} />
          <YAxis domain={["auto", "auto"]} {...AXIS} />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value) => [`${Number(value).toFixed(1)} kg`, "Peso"]}
            labelFormatter={(l) => fmtWeek(String(l))}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--chart-2)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function StrengthChart({
  series,
}: {
  series: { name: string; points: { week: string; weightKg: number }[] }[];
}) {
  const { merged, names } = useMemo(() => {
    const withData = series.filter((s) => s.points.length > 0);
    const weeks = [...new Set(withData.flatMap((s) => s.points.map((p) => p.week)))].sort();
    const merged = weeks.map((week) => {
      const row: Record<string, string | number | null> = { week };
      for (const s of withData) {
        row[s.name] = s.points.find((p) => p.week === week)?.weightKg ?? null;
      }
      return row;
    });
    return { merged, names: withData.map((s) => s.name) };
  }, [series]);

  if (names.length === 0)
    return <EmptyChart label="Registre cargas nos exercícios principais para ver sua força." />;

  return (
    <div className="h-64" role="img" aria-label="Gráfico da melhor carga semanal nos exercícios principais">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="week" tickFormatter={fmtWeek} {...AXIS} />
          <YAxis domain={["auto", "auto"]} {...AXIS} />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value, name) => [`${value} kg`, name]}
            labelFormatter={(l) => `Semana de ${fmtWeek(String(l))}`}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
            iconType="plainline"
          />
          {names.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: SERIES_COLORS[i % SERIES_COLORS.length] }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-8 text-center text-sm text-muted-foreground">
        {label}
      </CardContent>
    </Card>
  );
}

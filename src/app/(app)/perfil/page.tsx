import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { ProfileForm } from "@/components/profile-form";
import { ProgramPicker } from "@/components/program-picker";
import { getDb } from "@/db";
import { programs } from "@/db/schema";
import { getProfileData } from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const user = await requireUser();
  const { profile, latestWeight, prs } = await getProfileData(user.id);
  const db = await getDb();
  const allPrograms = await db
    .select({
      id: programs.id,
      name: programs.name,
      description: programs.description,
    })
    .from(programs)
    .orderBy(asc(programs.id));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <LogoutButton />
      </header>

      {latestWeight?.weightKg != null && (
        <Card>
          <CardContent className="flex items-baseline justify-between p-4">
            <span className="text-sm text-muted-foreground">Peso atual</span>
            <span className="font-mono text-xl font-semibold tabular-nums">
              {latestWeight.weightKg.toFixed(1)} kg
            </span>
          </CardContent>
        </Card>
      )}

      <ProgramPicker programs={allPrograms} currentId={profile.programId} />

      <ProfileForm
        initial={{
          goal: profile.goal,
          heightCm: profile.heightCm,
          targetWeightKg: profile.targetWeightKg,
          defaultRestSeconds: profile.defaultRestSeconds,
          soundEnabled: profile.soundEnabled,
        }}
      />

      <section aria-label="Recordes pessoais" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Maiores cargas
        </h2>
        {prs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              Seus PRs aparecem aqui automaticamente conforme você registra
              cargas no treino.
            </CardContent>
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {prs.map((pr, i) => (
              <li key={i}>
                <Card>
                  <CardContent className="flex items-center gap-3 p-3">
                    <Trophy className="size-4 shrink-0 text-primary" aria-hidden />
                    <span className="flex-1 text-sm font-medium">
                      {pr.exerciseName}
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {pr.value} {pr.unit}
                      {pr.reps ? ` × ${pr.reps}` : ""}
                    </span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

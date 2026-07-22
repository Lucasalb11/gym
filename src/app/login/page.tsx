import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dumbbell } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Dumbbell className="size-7" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hybrid</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hipertrofia + CrossFit, 12 semanas.
          </p>
        </div>
      </div>
      <LoginForm />
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres"),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setPending(true);
    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({
          name: data.name?.trim() || data.email.split("@")[0],
          email: data.email,
          password: data.password,
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await authClient.signIn.email({
          email: data.email,
          password: data.password,
        });
        if (error) throw new Error(error.message);
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível entrar. Confira e-mail e senha.",
      );
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Criar conta</TabsTrigger>
        </TabsList>
        <TabsContent value={mode} forceMount>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 flex flex-col gap-4"
            noValidate
          >
            {mode === "signup" && (
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  placeholder="Lucas"
                  {...register("name")}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="voce@exemplo.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" size="lg" disabled={pending} className="mt-2">
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {mode === "signup" ? "Criar conta" : "Entrar"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

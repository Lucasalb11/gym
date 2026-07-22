import { BottomNav } from "@/components/bottom-nav";
import { requireUser } from "@/lib/session";

// Todas as páginas do app dependem da sessão — nunca pré-renderizar
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireUser();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
      <main className="flex-1 px-4 pb-28 pt-6 sm:px-6">{children}</main>
      <BottomNav />
    </div>
  );
}

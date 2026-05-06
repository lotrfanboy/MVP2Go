import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

async function signOutAction() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Hello GoMVP</h1>
        <span className="text-sm text-muted-foreground">{user?.email}</span>
      </header>
      <p className="text-sm text-muted-foreground">
        F0 Fundacao. Painel minimo. Coleta comeca em F1, ideias em F2.
      </p>
      <div>
        <Link href="/coleta" className="text-sm underline-offset-4 hover:underline">
          Abrir tela de coleta
        </Link>
      </div>
      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          Sair
        </Button>
      </form>
    </div>
  );
}

import { ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WatchTopicForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action} className="max-w-2xl space-y-4 rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
      <div>
        <Label htmlFor="topic_label">Tema para monitorar</Label>
        <Input id="topic_label" name="topic_label" required placeholder="Ex.: ferramentas para juntar PDFs" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="language">Idioma alvo</Label>
          <select
            id="language"
            name="language"
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background/70 px-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            defaultValue="all"
          >
            <option value="all">Todos</option>
            <option value="pt">Portugues</option>
            <option value="en">Ingles</option>
          </select>
        </div>
        <div>
          <Label htmlFor="market">Mercado</Label>
          <select
            id="market"
            name="market"
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background/70 px-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            defaultValue="global"
          >
            <option value="global">Global</option>
            <option value="br">Brasil</option>
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notas para o operador (opcional)</Label>
        <Input id="notes" name="notes" placeholder="Hipotese, canal, publico ou criterio de observacao" />
      </div>
      <Button type="submit" size="sm">
        <ListPlus aria-hidden="true" className="mr-2 h-4 w-4" />
        Monitorar topico
      </Button>
    </form>
  );
}

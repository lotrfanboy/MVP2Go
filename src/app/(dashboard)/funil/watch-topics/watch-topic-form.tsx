import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WatchTopicForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action} className="max-w-lg space-y-3 rounded-lg border border-border p-4">
      <div>
        <Label htmlFor="topic_label">Rótulo do tema</Label>
        <Input id="topic_label" name="topic_label" required placeholder="Ex.: ferramentas para merge de PDF" />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="language">Idioma</Label>
          <select
            id="language"
            name="language"
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-[13px]"
            defaultValue="all"
          >
            <option value="all">all</option>
            <option value="pt">pt</option>
            <option value="en">en</option>
          </select>
        </div>
        <div className="flex-1">
          <Label htmlFor="market">Mercado</Label>
          <select
            id="market"
            name="market"
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-[13px]"
            defaultValue="global"
          >
            <option value="global">global</option>
            <option value="br">br</option>
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Input id="notes" name="notes" />
      </div>
      <Button type="submit" size="sm">
        Adicionar watch topic
      </Button>
    </form>
  );
}

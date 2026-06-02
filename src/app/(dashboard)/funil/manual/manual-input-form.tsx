"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ManualInputForm() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Enviando...");
    const fd = new FormData(e.currentTarget);
    const body = {
      input_kind: fd.get("input_kind"),
      payload: fd.get("payload"),
      source_url: fd.get("source_url") || null,
      language: fd.get("language") ?? "other",
      watch_topic_id: null,
    };
    const res = await fetch("/api/manual/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { ok: boolean; manualInputId?: string; error?: string };
    if (json.ok) {
      setStatus(`Seed criada. manualInputId=${json.manualInputId}`);
      e.currentTarget.reset();
    } else {
      setStatus(typeof json.error === "string" ? json.error : "Erro ao analisar.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4 rounded-lg border border-border/80 bg-card/80 p-4 shadow-[0_1px_0_hsl(0_0%_100%/0.03)]">
      <div>
        <Label htmlFor="input_kind">O que analisar</Label>
        <select
          id="input_kind"
          name="input_kind"
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-background/70 px-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          required
          defaultValue="text"
        >
          <option value="topic">Tema</option>
          <option value="text">Texto</option>
          <option value="url">URL</option>
        </select>
      </div>
      <div>
        <Label htmlFor="payload">Tema, texto ou conteudo</Label>
        <textarea
          id="payload"
          name="payload"
          required
          rows={6}
          className="mt-1 w-full rounded-md border border-input bg-background/70 px-3 py-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          placeholder="Ex.: pessoas reclamando de organizar PDFs para imposto de renda"
        />
      </div>
      <div>
        <Label htmlFor="source_url">URL de referencia (opcional)</Label>
        <Input id="source_url" name="source_url" type="url" placeholder="https://..." />
      </div>
      <div>
        <Label htmlFor="language">Idioma percebido</Label>
        <select
          id="language"
          name="language"
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-background/70 px-2 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          defaultValue="other"
        >
          <option value="pt">Portugues</option>
          <option value="en">Ingles</option>
          <option value="other">Outro/indefinido</option>
        </select>
      </div>
      <Button type="submit" size="sm">
        <Search aria-hidden="true" className="mr-2 h-4 w-4" />
        Analisar agora
      </Button>
      {status ? <p className="text-[13px] text-muted-foreground">{status}</p> : null}
    </form>
  );
}

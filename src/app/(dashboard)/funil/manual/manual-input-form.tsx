"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ManualInputForm() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Enviando…");
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
      setStatus(`Salvo. manualInputId=${json.manualInputId}`);
      e.currentTarget.reset();
    } else {
      setStatus(json.error ?? "Erro");
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-3 rounded-lg border border-border p-4">
      <div>
        <Label htmlFor="input_kind">Tipo</Label>
        <select
          id="input_kind"
          name="input_kind"
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-[13px]"
          required
          defaultValue="text"
        >
          <option value="topic">topic</option>
          <option value="text">text</option>
          <option value="url">url</option>
        </select>
      </div>
      <div>
        <Label htmlFor="payload">Texto / conteúdo</Label>
        <textarea
          id="payload"
          name="payload"
          required
          rows={6}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-[13px]"
        />
      </div>
      <div>
        <Label htmlFor="source_url">URL (opcional)</Label>
        <Input id="source_url" name="source_url" type="url" placeholder="https://…" />
      </div>
      <div>
        <Label htmlFor="language">Idioma</Label>
        <select
          id="language"
          name="language"
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-2 text-[13px]"
          defaultValue="other"
        >
          <option value="pt">pt</option>
          <option value="en">en</option>
          <option value="other">other</option>
        </select>
      </div>
      <Button type="submit" size="sm">
        Enviar análise manual
      </Button>
      {status ? <p className="text-[13px] text-muted-foreground">{status}</p> : null}
    </form>
  );
}

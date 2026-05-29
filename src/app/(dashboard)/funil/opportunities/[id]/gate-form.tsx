"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { transitionOpportunityGate } from "./actions";

export function GateForm({ id }: { id: string }) {
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function send(action: "approve" | "reject" | "snooze" | "watch") {
    const res = await transitionOpportunityGate({
      id,
      action,
      reason_code: reason.trim() || "operator_action",
    });
    setMsg(res.ok ? "Atualizado." : "Falhou.");
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <p className="text-sm font-medium">Transição de gate (reason obrigatório no fluxo completo)</p>
      <div className="space-y-2">
        <Label htmlFor="reason_code">reason_code</Label>
        <Input
          id="reason_code"
          name="reason_code"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="ex.: evidence_insufficient"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => send("approve")}>
          Aprovar oportunidade
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={() => send("reject")}>
          Rejeitar
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => send("snooze")}>
          Snooze
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => send("watch")}>
          Watch
        </Button>
      </div>
      {msg ? <p className="text-[13px] text-muted-foreground">{msg}</p> : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Eye, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { transitionOpportunityGate } from "./actions";

const REASON_CODES = [
  "evidence_insufficient",
  "pain_weak",
  "audience_unclear",
  "too_generic",
  "source_bias",
  "trend_only_no_pain",
  "good_trend_bad_opportunity",
  "not_indielab_fit",
  "regulatory_risk",
  "interesting_but_not_now",
] as const;

const DEFAULT_REASON_CODE = "evidence_insufficient";

export function GateForm({ id }: { id: string }) {
  const [reason, setReason] = useState<string>(DEFAULT_REASON_CODE);
  const [msg, setMsg] = useState<string | null>(null);

  async function send(action: "approve" | "reject" | "snooze" | "watch") {
    setMsg("Atualizando...");
    const res = await transitionOpportunityGate({
      id,
      action,
      reason_code: reason,
    });
    setMsg(res.ok ? "Gate atualizado." : "Falha ao atualizar gate.");
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background/35 p-4">
      <div>
        <p className="text-sm font-medium">Transicao simples de gate</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Esta acao nao gera ideia, brief ou feedback polimorfico. Ela apenas atualiza `opportunity_cards`.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason_code">Reason code</Label>
        <select
          id="reason_code"
          name="reason_code"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {REASON_CODES.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => send("approve")}>
          <CheckCircle2 aria-hidden="true" className="mr-2 h-4 w-4" />
          Aprovar
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={() => send("reject")}>
          <XCircle aria-hidden="true" className="mr-2 h-4 w-4" />
          Rejeitar
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => send("snooze")}>
          <Clock aria-hidden="true" className="mr-2 h-4 w-4" />
          Adiar
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => send("watch")}>
          <Eye aria-hidden="true" className="mr-2 h-4 w-4" />
          Observar
        </Button>
      </div>
      {msg ? <p className="text-[13px] text-muted-foreground">{msg}</p> : null}
    </div>
  );
}

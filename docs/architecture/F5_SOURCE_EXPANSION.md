# F5 — Source Expansion (roadmap)

> **Status:** Roadmap aprovado pelo operador em 2026-05-06.
> **Owner do documento:** Agent 0.
> **Pré-requisito:** F4 (F4A + F4B + F4C) **fechada e aprovada** pelo Agent 5.
> **Princípio central:** F5 **não altera o motor**. Cada nova fonte é apenas **`collector → raw_source_item → normalizer → evidence`**.

---

## 0. Princípios de F5

1. **Motor é intocado.** Se F5 mexer no `src/motor/*` ou em `evidences` schema, parar e reescalar para Agent 0.
2. **Uma fonte por vez.** Como F2 fez com HN, F5 faz com cada nova fonte. Sob aprovação caso a caso.
3. **Compliance antes de código.** Cada fonte tem nota de ToS, rate limit e LGPD em pasta `src/sources/<source>/README.md` antes do collector existir.
4. **Cap de custo respeitado.** Na validação F4/F5 o **alvo operacional** documentado é **US$ 5/mês** (D-16), sempre **configurável** via ENV/`cost_budgets`. Cada fonte calcula custo esperado e deve caber no budget vigente.
5. **Source Confidence sobe naturalmente.** Cada fonte nova adicionada amplia `distinct_external` para opportunities tocando o mesmo `topic_key`.
6. **Sem scraping pesado.** Vale a regra do PRD §7. Reddit/YouTube/Reviews entram **somente via API oficial**.
7. **Sem dependência runtime de MCP.** Mantém DP-04.

---

## 1. Mudança de prioridade vs PRD §8 V1

PRD V1 §8 listava: PH > HN > RSS > Apple > Stack Exchange > manual.

V2 (este roadmap) reordena:

| Posição | Fonte | Motivo |
|---|---|---|
| 1 | **Hacker News** (já em produção desde F1) | Discussão técnica/produto, alta densidade de dor explícita. |
| 2 | **Google Trends** (entra em F4B, não F5) | Cross-source mínimo. Não é fonte de "ideias", é fonte de validação. |
| 3 | **Product Hunt (F5A)** | `solution_supply` — quem está atacando o problema agora. |
| 4 | **Reddit (F5B)** | `repeated_pain` em comunidade. **Compliance** crítico. |
| 5 | **YouTube (F5C)** | `content_demand` — linguagem do público. |
| 6 | **Reviews (F5D)** | `competitor_weakness`. Mais delicado em LGPD/marca. |
| backup | **RSS / Apple RSS / Stack Exchange** | Mantidos como fontes auxiliares possíveis, sem prioridade em V2. Implementar somente se motor pedir mais cobertura ou operador solicitar. |

> Esta reordenação é **D-15** em [`DECISIONS.md`](../DECISIONS.md). PRD §8 será atualizado na rodada 7 do PRD para refletir a ordem.

---

## 2. Padrão de implementação por fonte

Cada fase F5x produz **a mesma estrutura mínima**:

```
src/sources/<source>/
├── README.md              # ToS, rate limit, LGPD, custo esperado, sample payload
├── collector.ts           # API/RSS oficial, paginação, retry, cap diário
├── normalizer.ts          # raw_source_item → evidences[]
└── tests/                 # vitest opcional

src/app/api/cron/
└── collect-<source>/route.ts  # protegido por CRON_SECRET; segue padrão F1
```

E entrega:

- Migration **mínima**: apenas seed em `sources` (uma linha por fonte com `kind=<source>`). **Não cria tabelas novas.**
- Validação E2E: ≥ 30 evidences/dia em dev por 3 dias seguidos.
- Demonstração de cross-source: pelo menos 1 opportunity_card sobe `source_confidence` para a próxima faixa.
- Handback `docs/handback/F5x_DONE.md` + revisão Agent 5.

---

## 3. F5A — Product Hunt

**Tipo de evidence dominante:** `solution_supply`.
**Pergunta que responde:** "Alguém já está atacando esse problema com microproduto?"

### Por que primeiro

- API oficial (GraphQL) bem documentada. Rate limit conhecido.
- Sinaliza **competidores recentes** — útil para `competitor_weakness` no futuro e para `saturated_market` reason code agora.
- Não tem PII delicada.
- Volume estável.

### Riscos

- Hype/release corporativo dominando. Mitigar com filtro IA P-EVI-001 (já existente em F4).
- API key + rate limit. Mitigar com cap diário e retry idempotente.

### Custo esperado

- Coleta gratuita.
- Embeddings adicionais: ≤ US$ 0,05/mês.
- IA para `evidence_extract`: ≤ US$ 0,15/mês.

### Saída

- `docs/handback/F5A_DONE.md` + Agent 5.

---

## 4. F5B — Reddit

**Tipo de evidence dominante:** `repeated_pain` + `workaround_signal` + `alternative_request`.
**Pergunta que responde:** "Comunidades reais estão pedindo solução?"

### Por que segundo

- Densidade altíssima de dor explícita por subreddit certo.
- Cross-source poderoso com HN (discussão técnica) + Trends (busca).

### Riscos

- **Compliance é crítico.** API Reddit hoje cobra acima de quotas; ToS restritivo. **Não usar scraping.**
- LGPD: `username` é referência pública, **não** perfil. Não persistir karma/histórico do usuário.
- Subreddits específicos são curados via `watch_topics` para evitar coleta de espectro largo.

### Pré-requisito

- Aprovação de pacote (`reddit-api` ou `snoowrap`) — DP-14.
- Documentação ToS/quota em `src/sources/reddit/README.md` antes do collector.
- Decisão D-17 (futura): orçamento de quota.

### Custo esperado

- API: gratuita até quota; acima exige plano. Cap diário de chamadas.
- IA: ≤ US$ 0,3/mês.

### Saída

- `docs/handback/F5B_DONE.md` + Agent 5.

---

## 5. F5C — YouTube

**Tipo de evidence dominante:** `content_demand`.
**Pergunta que responde:** "Que linguagem o público usa pra descrever esse problema?"

### Por que terceiro

- YouTube Data API tem quota agressiva. Vale só para temas específicos via watch_topics.
- Comments comoutput potencial mas **alto risco** de toxicidade/PII. Foco em **searches + descriptions**, não comments em massa.

### Riscos

- Quota YouTube Data API.
- Toxicidade em comments — limitar `evidence_type` a `content_demand` baseado em search/description, **não** scraping de comments.
- LGPD: nome de canal é público; conteúdo de usuário comum precisa cuidado.

### Custo esperado

- API: gratuita até quota.
- IA: ≤ US$ 0,3/mês.

### Saída

- `docs/handback/F5C_DONE.md` + Agent 5.

---

## 6. F5D — Reviews (App Store / Trustpilot / G2 — escolher 1)

**Tipo de evidence dominante:** `competitor_weakness` + `pricing_complaint`.
**Pergunta que responde:** "Onde os players atuais estão falhando?"

### Por que último

- Maior risco de **dano de marca** se brief copiar reclamação literal.
- Compliance variável por loja.
- ROI muito alto se feito direito (revela `pain_text` cristalino).

### Pré-requisitos

- Decisão D-18 (futura): qual fonte de review iniciar (Apple App Store é mais simples via RSS).
- Política de citação literal: nunca expor brand + frase ofensiva no brief; sumarizar.

### Custo esperado

- Coleta: gratuita (Apple RSS) ou paga (Trustpilot/G2 dependem de plano).
- IA: ≤ US$ 0,3/mês.

### Saída

- `docs/handback/F5D_DONE.md` + Agent 5.

---

## 7. Fontes "backup" (RSS / Apple RSS / Stack Exchange)

PRD V1 listava como V1. V2 trata como **opcional, sem prioridade**. Ficam disponíveis para o operador acionar quando:

- O motor estiver carente de cobertura em um nicho.
- Ou Reddit/YouTube falharem por compliance.

Cada uma usa o mesmo padrão `src/sources/<source>/`. Sem brief específico até demanda concreta.

---

## 8. Cronograma sugerido

```
F4 fechada (F4A + F4B + F4C aprovadas)
   │
   ▼
F5A — Product Hunt        (1 sprint, ~3-5 dias)
   │
   ▼  Agent 5 review
   │
F5B — Reddit              (1-2 sprints, ~5-8 dias; compliance review extra)
   │
   ▼  Agent 5 review
   │
F5C — YouTube             (1 sprint, ~3-5 dias)
   │
   ▼  Agent 5 review
   │
F5D — Reviews             (1 sprint, ~3-5 dias)
   │
   ▼  Agent 5 review
   │
[backup: RSS / Apple / SE conforme demanda]
```

Cada fonte fecha gate antes da próxima começar.

---

## 9. Quando F5 está "feito"

Não há "F5 done" único. F5 está **suficientemente coberta** quando:

- Pelo menos 3 fontes externas distintas estão em produção (HN + GT + ≥1 das F5A/B/C/D).
- ≥ 50% das opportunities qualified têm `source_confidence ≥ 0.65`.
- O motor não exigiu reescrita para acomodar nova fonte.
- Custo IA agregado ≤ **cap mensal vigente** (validação F4/F5: alvo típico US$ 5/mês — D-16; configurável).

A partir daí, V1 está **GA interno** (PRD §22 atualizado).

---

## 10. Riscos transversais

| Risco | Mitigação |
|---|---|
| Pipeline de evidências engasgar com volume | F5A entra primeiro; medir antes de F5B/C. |
| Custo IA explodir | Cap mensal mantém limite. Reavaliar `assertBudget()` thresholds em F5C. |
| Compliance Reddit/YouTube | Documentar ToS por fonte, watch_topics curados, sem coleta de espectro largo. |
| Motor precisar mudar para acomodar fonte | Parar. Reescalar Agent 0. Não improvisar. |
| Source Confidence inflada com fonte ruim | Adicionar fonte conta como `distinct_external` apenas após ≥ 30 evidences úteis em dev. |

---

## 11. O que F5 NÃO faz

- Não altera schema do motor (`evidences`, `opportunity_cards`, etc.).
- Não cria nova classe de score.
- Não toca em UI funil (apenas pode adicionar coluna "fonte" em Source Confidence).
- Não introduz pacote sem D-XX dedicada.
- Não autoriza scraping em nenhuma circunstância.

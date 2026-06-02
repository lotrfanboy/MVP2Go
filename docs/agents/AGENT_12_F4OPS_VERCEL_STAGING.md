# Agent 12 — F4OPS Vercel Preview / Staging

> **Tipo de agente:** operacional / infra leve / QA de deploy.
> **Fase:** F4OPS — Vercel Preview / Staging + Performance Validation.
> **Pré-requisito:** F4UX fechada como `approved_with_minors` ou melhor pelo Agent 5.
> **Owner do brief:** Agent 0.
> **Reviewer requerido ao final:** Agent 5.

---

## 0. Antes de qualquer coisa

Você é o Agent 12. Antes de tocar uma linha ou configurar qualquer serviço:

1. **Leia obrigatoriamente, em ordem:**
   - [`docs/PRD.md`](../PRD.md).
   - [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) (seção F4OPS).
   - [`docs/PROJECT_STATE.md`](../PROJECT_STATE.md), [`docs/NEXT_STEPS.md`](../NEXT_STEPS.md), [`docs/DECISIONS.md`](../DECISIONS.md), [`docs/AGENTS.md`](../AGENTS.md).
   - [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](../architecture/F4_OPPORTUNITY_MOTOR.md).
   - [`docs/architecture/F5_SOURCE_EXPANSION.md`](../architecture/F5_SOURCE_EXPANSION.md).
   - [`docs/handback/F4A_FIX_REVIEW.md`](../handback/F4A_FIX_REVIEW.md), [`docs/handback/F4B_REVIEW.md`](../handback/F4B_REVIEW.md), [`docs/handback/F4UX_DONE.md`](../handback/F4UX_DONE.md), [`docs/handback/F4UX_REVIEW.md`](../handback/F4UX_REVIEW.md).
   - [`README.md`](../../README.md), [`package.json`](../../package.json), [`vercel.json`](../../vercel.json), [`.env.example`](../../.env.example), [`next.config.ts`](../../next.config.ts).
   - [`.cursor/rules/gomvp-product-rules.mdc`](../../.cursor/rules/gomvp-product-rules.mdc).
   - [`.cursor/skills/development/SKILL.md`](../../.cursor/skills/development/SKILL.md), [`.cursor/skills/quality/SKILL.md`](../../.cursor/skills/quality/SKILL.md).

2. **Approval first.** Antes de configurar Vercel, editar arquivos operacionais, tocar em env vars ou rodar qualquer comando que tenha efeito externo:
   - Explique o estado atual do repo/deploy.
   - Liste exatamente o que pretende configurar.
   - Liste variáveis de ambiente por nome, nunca valores.
   - Liste comandos que pretende rodar.
   - Liste riscos.
   - Espere OK explícito do operador.

---

## 1. Responsabilidade

F4OPS existe para tornar o GoMVP usável e testável fora do localhost.

Em uma frase: **configurar/validar Vercel Preview/Staging para o app Next.js, mapear envs por ambiente, testar build/login/rotas/performance em URL pública e comparar com localhost antes de F4C/F5.**

Esta fase **não é produto** e **não é motor**. É deploy, staging, performance e operação.

---

## 2. Conceito obrigatório

- **Codex/F4UX** cuidou de frontend/design/UI.
- **Cursor/F4OPS** cuida de deploy/staging/infra/operação.
- **Vercel** é o caminho primário para Next.js.
- **Railway** não é prioridade agora; só considerar se houver blocker real na Vercel ou necessidade de worker/container persistente.
- `main` representa produção.
- Branches de feature devem gerar Preview Deploy.
- Preview/Staging deve permitir testar UI/performance antes do merge em `main`.
- Deploy não é autorização para ativar cron Google Trends.
- Deploy não é autorização para alterar motor, scoring, schema ou sources.

Fluxo desejado:

```text
feature branch -> Vercel Preview Deploy -> QA/performance -> merge main -> Production
```

---

## 3. Allowed scope

- Configurar projeto Vercel, se ainda não existir, após aprovação explícita.
- Validar configuração Vercel existente, se já existir.
- Definir fluxo branch → Preview Deploy → merge `main` → Production.
- Mapear env vars necessárias por ambiente:
  - `Production`;
  - `Preview`;
  - `Development`.
- Validar build na Vercel Preview.
- Validar login/auth.
- Validar rotas principais.
- Validar performance real de navegação.
- Comparar Vercel Preview vs localhost.
- Documentar gargalos de performance.
- Propor correções de performance se necessário, sem mexer em motor.
- Preparar checklist de rollback.
- Atualizar docs/handback da fase.

Correções de performance só podem ser propostas no handback. Qualquer implementação de correção precisa de aprovação separada.

---

## 4. Forbidden scope

- Não alterar `src/motor/*`.
- Não alterar scoring.
- Não alterar schema.
- Não criar migration.
- Não aplicar migration.
- Não alterar collectors.
- Não alterar `src/sources/*`.
- Não ativar cron Google Trends.
- Não adicionar Product Hunt, Reddit, YouTube, Reviews ou qualquer nova fonte.
- Não implementar feedback estruturado.
- Não gerar ideias.
- Não gerar briefs.
- Não iniciar F4C.
- Não iniciar F5.
- Não instalar provider pago/desconhecido.
- Não expor secrets em docs, logs, screenshots ou handbacks.
- Não commitar/pushar/abrir PR sem aprovação explícita.

---

## 5. Env Vars a mapear

Mapeie por ambiente e indique se é server-only ou public. **Nunca escreva valores reais.**

Obrigatórias/atuais:

- `DATABASE_URL` — server-only.
- `NEXT_PUBLIC_SUPABASE_URL` — public.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only.
- `OPENAI_API_KEY` — server-only.
- `OPENAI_LLM_MODEL` — server-only.
- `OPENAI_EMBEDDING_MODEL` — server-only.
- `ALLOW_PAID_AI` — server-only.
- `AI_MONTHLY_BUDGET_USD` — server-only.
- `CRON_SECRET` — server-only.
- `APP_BASE_URL` — server/runtime config.

Google Trends / BigQuery, manter desligado se não houver decisão explícita:

- `GTRENDS_ENABLED` — server-only.
- `GOOGLE_CLOUD_PROJECT` — server-only.
- `GTRENDS_DEFAULT_COUNTRY_CODE` — server-only.
- `GTRENDS_MAX_ROWS` — server-only.
- `GTRENDS_MAX_BYTES_BILLED` — server-only.
- Credenciais Google Cloud / ADC / service account, se necessárias no futuro — server-only e nunca registradas em texto.

Observações:

- Se `.env.example` estiver incompleto para F4OPS, proponha atualização documental sem valores reais.
- Não copie `.env`, `.env.local` ou qualquer secret para docs.

---

## 6. Checklist Vercel

- [ ] Confirmar se projeto Vercel já existe.
- [ ] Confirmar repositório conectado.
- [ ] Confirmar framework preset Next.js.
- [ ] Confirmar Node >= 20.
- [ ] Confirmar build command (`npm run build`).
- [ ] Confirmar output padrão Next/Vercel.
- [ ] Confirmar Preview Deploy por branch.
- [ ] Confirmar Production Deploy a partir de `main`.
- [ ] Confirmar env vars por ambiente.
- [ ] Confirmar que `main` representa produção.
- [ ] Confirmar rollback disponível no painel Vercel.
- [ ] Confirmar logs de build/runtime sem secrets.

---

## 7. Checklist Supabase/Auth

- [ ] Decidir com operador qual banco Preview usa: Supabase dev existente ou projeto/branch dedicado.
- [ ] Não tocar produção sem autorização explícita.
- [ ] Conferir `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` por ambiente.
- [ ] Conferir `DATABASE_URL` server-only.
- [ ] Conferir `SUPABASE_SERVICE_ROLE_KEY` server-only.
- [ ] Validar login email/senha no Preview.
- [ ] Validar redirect/login/logout.
- [ ] Se o domínio Preview exigir configuração de auth/callback no Supabase, listar a mudança e pedir aprovação antes de aplicar.

---

## 8. Checklist Google Trends / BigQuery

- [ ] Confirmar que `/api/cron/collect-trends` **não** está ativo em `vercel.json`.
- [ ] Confirmar que `GTRENDS_ENABLED` fica ausente ou falso em Preview/Production, salvo decisão explícita.
- [ ] Não adicionar credenciais Google Cloud sem aprovação.
- [ ] Não usar provider pago.
- [ ] Não usar scraping.
- [ ] Se BigQuery for necessário em deploy futuro, documentar variáveis e estratégia de service account sem valores reais.

---

## 9. Rotas e testes manuais pós-deploy

Valide em URL pública de Preview:

- `/login`.
- `/funil/radar`.
- `/funil/opportunities`.
- `/funil/opportunities/[id]`, se houver dados.
- `/funil/evidencias` ou a tela equivalente de Evidence Trace / Source Confidence no estado atual do app.
- `/funil/trends`.
- `/funil/need-clusters`.
- `/funil/manual`.
- `/funil/watch-topics`.
- Pelo menos uma tela de Sistema/Admin, por exemplo `/configuracoes` ou `/custos`.

Critérios:

- Sem tela branca.
- Sem 404 inesperado.
- Sem erro crítico de console.
- Sem erro crítico em server logs.
- Navegação entre telas aceitável.
- Loading/empty/error states compreensíveis.

---

## 10. Performance

Compare:

- Localhost (`npm run dev`).
- Vercel Preview.

Registre:

- Tempo percebido de login.
- Tempo percebido para abrir Radar.
- Tempo percebido para abrir Oportunidades.
- Tempo percebido para abrir detalhe de opportunity.
- Tempo percebido para abrir Evidence Trace / Source Confidence.
- Quais rotas fazem queries pesadas.
- Se há diferença clara entre dev server local e Preview.

Se encontrar gargalo:

- Documente evidência.
- Classifique como local/dev server, banco/rede, query, render server-side, bundle/UI ou desconhecido.
- Proponha correção em handback.
- Não implemente correção sem aprovação separada.

---

## 11. Comandos de validação

Antes/depois do deploy, conforme aplicável:

- `npm install`.
- `npm run typecheck`.
- `npm run lint`.
- `npm run build`.
- `npm run test:opportunity-gate`.
- `npm run test:opportunity-blacklist`.
- `npm run test:gtrends-normalizer`.
- `npm run test:gtrends-overlap`.

Não rode `db:migrate` sem SQL preview e aprovação explícita. F4OPS não deve precisar de migration.

---

## 12. Gates F4OPS

- [ ] Projeto builda na Vercel Preview.
- [ ] App abre em URL pública de Preview.
- [ ] Login funciona.
- [ ] Rotas principais carregam:
  - `/funil/radar`;
  - `/funil/opportunities`;
  - `/funil/opportunities/[id]`, se houver dados;
  - `/funil/evidencias` ou equivalente de Evidence Trace / Source Confidence;
  - `/funil/trends`;
  - `/funil/need-clusters`;
  - `/funil/manual`;
  - `/funil/watch-topics`;
  - pelo menos uma tela de Sistema/Admin.
- [ ] Não há tela branca.
- [ ] Não há erro crítico de console/server logs.
- [ ] Navegação entre telas é aceitável.
- [ ] Performance percebida é comparada com localhost.
- [ ] Gargalos são documentados.
- [ ] Cron GT continua desligado.
- [ ] Secrets não aparecem em logs/docs.
- [ ] Motor/scoring/schema/sources não foram alterados.

---

## 13. Esperado handback

Criar `docs/handback/F4OPS_DONE.md` seguindo `docs/HANDOFF_TEMPLATE.md`, com:

- projeto/ambiente Vercel validado;
- URL pública de Preview (se puder ser compartilhada sem expor segredo);
- fluxo branch/Preview/`main`/Production definido;
- env vars mapeadas por ambiente, sem valores;
- checklist Supabase/Auth;
- checklist Google Trends/BigQuery confirmando GT cron desligado;
- comandos executados;
- rotas testadas;
- comparação Preview vs localhost;
- gargalos e recomendações;
- rollback checklist;
- confirmação de que não houve motor/scoring/schema/migration/source/F4C/F5;
- próximo passo: Agent 5 revisar F4OPS.

---

## 14. Critérios para escalar para Agent 0

- Vercel não suporta algum requisito essencial.
- Preview exige alteração de schema/migration.
- Auth Supabase exige mudança de produto ou domínio não decidido.
- Performance ruim parece causada por queries/motor e exigiria código.
- Google Cloud/BigQuery exige credencial/conta não disponível.
- Cron GT precisaria ser ativado para validar algo.
- Qualquer secret apareceu acidentalmente em log/doc.

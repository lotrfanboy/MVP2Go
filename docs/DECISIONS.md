# GoMVP — DECISIONS

> Registro estável de decisões fechadas do projeto.
> Fonte canônica do produto: [`docs/PRD.md`](PRD.md). Este arquivo consolida e operacionaliza decisões.
> Não rediscutir decisões aqui sem aprovação explícita do operador.

---

## Como ler este registro

- Cada decisão tem um ID estável (`D-XX`), data, status, contexto, decisão e implicações.
- Decisões fechadas no PRD (D-01..D-10) estão refletidas aqui sem alteração.
- Decisões operacionais que não estão no PRD têm prefixo `O-XX` (operacionais) e são propostas/registros do Agent 0.

---

## Decisões de produto fechadas (PRD §26)

### D-01 — Stack
- **Status:** Fechada (PRD §26).
- **Decisão:** Supabase (Postgres + pgvector + Auth).
- **Implicação:** `pgvector` habilitado apenas em F2.

### D-02 — IA
- **Status:** Fechada.
- **Decisão:** OpenAI somente, modelos via ENV (`OPENAI_LLM_MODEL`, `OPENAI_EMBEDDING_MODEL`), camada `AIProvider` abstrata como única abstração obrigatória.
- **Implicação:** Trocar provider exige só nova implementação de `AIProvider`.

### D-03 — Idiomas
- **Status:** Fechada.
- **Decisão:** Coleta PT + EN, painel PT-BR.
- **Implicação:** Filtros e prompts cobrem PT/EN; UI é PT-BR estrita.

### D-04 — Cadência de ranking
- **Status:** Fechada.
- **Decisão:** 2x/semana (segunda e quinta).
- **Implicação:** Vercel Cron seg/qui em UTC.

### D-05 — Auth
- **Status:** Fechada (tácita por D-01).
- **Decisão:** Supabase Auth, 1 conta operadora.
- **Implicação:** Não multi-tenant. Sem RBAC.

### D-06 — Cron
- **Status:** Fechada.
- **Decisão:** Vercel Cron + Route Handlers `/api/cron/*` + `CRON_SECRET`.
- **Implicação:** `pg_cron`/Supabase Scheduled Functions ficam fora da V1.

### D-07 — ORM
- **Status:** Fechada.
- **Decisão:** Drizzle ORM + drizzle-kit (migrations explícitas).
- **Implicação:** Migrations geradas via `drizzle-kit generate` e exibidas em SQL antes de aplicar.

### D-08 — Cap de custo IA
- **Status:** Fechada.
- **Decisão:** Hard cap US$ 50/mês. Thresholds 0.80 (warning) / 0.90 (auto-stop em cron) / 1.00 (hard-stop).
- **Implicação:** Toda chamada IA passa por `assertBudget()` e grava em `ai_usage_logs`.

### D-09 — Retenção LGPD
- **Status:** Fechada.
- **Decisão:** 30d `raw_items`, 90d `signals`, 180d `ideas`/`briefs`, 365d `ai_usage_logs`.
- **Implicação:** Job de retenção e endpoint de purge entregues em F5.

### D-10 — Categorias B2C
- **Status:** Fechada.
- **Decisão:** B2C amplo com **blacklist obrigatória** (16 categorias) e priorização (`utility`, `ai_tool`, `calculator`, `generator`, `checker`, `organizer`).
- **Implicação:** Itens com `blacklist_tags` saem do ranking principal e ficam na aba **Filtradas** (auditoria). `category_bonus = 0.05` sobre score.

---

## Princípios operacionais permanentes (PRD Apêndice E + Implementation Plan)

> Tratar como decisões duras. Violar exige aprovação escrita do operador.

- **DP-01** Estrutura **flat** em `src/...`. Sem monorepo, sem `apps/web/`.
- **DP-02** Migrations sempre exibidas em SQL antes de aplicar. `db:migrate` só com aprovação.
- **DP-03** Sem commit, push ou PR sem aprovação explícita.
- **DP-04** MCP nunca é dependência runtime. Toda integração de produção é via SDK/fetch.
- **DP-05** Toda chamada IA passa por `assertBudget()` e grava `ai_usage_logs` com `prompt_version`.
- **DP-06** Prompts versionados. Para mudar prompt em produção, criar nova versão (`002`, `003`, ...). Nunca editar versão já em produção.
- **DP-07** F1 não roda IA paga e não cria `signals`. IA e `signals` começam em F2.
- **DP-08** F2 começa **HN-only**. Demais coletores entram um por vez sob aprovação.
- **DP-09** Blacklist sempre ativa após F1. Ranking principal só mostra itens sem `blacklist_tags`.
- **DP-10** Vercel Cron é o único orquestrador da V1.
- **DP-11** Hard cap US$ 50/mês com thresholds fixos 0.80/0.90/1.00.
- **DP-12** Sem dado pessoal sensível persistido. Retenção segue D-09.
- **DP-13** `category_bonus` e `preference_affinity` cap em ±0.05 cada. Nunca dominam o score.
- **DP-14** Pacote npm novo exige justificativa explícita.

---

## Decisões operacionais (não-produto)

### O-01 — Override de budget em ambiente dev
- **Status:** Em vigor desde F2.
- **Contexto:** Para validar guard de orçamento sem inflar o cap mensal de produção, `AI_MONTHLY_BUDGET_USD=5` em dev.
- **Decisão:** Manter US$ 5 em dev como teto temporário. **Produção continua US$ 50.**
- **Implicação:** Thresholds 0.80/0.90/1.00 funcionam idênticos em ambos os ambientes.
- **Revisão pendente:** voltar para US$ 50 em dev assim que parar a fase de calibração de F2/F3.

### O-02 — Ausência de git local (na auditoria de Agent 0)
- **Status:** Aberta.
- **Contexto:** `git rev-parse --is-inside-work-tree` retorna `not a git repository` no workspace `c:\GoMVP`.
- **Decisão pendente:** operador precisa decidir entre (a) inicializar git local agora, (b) iniciar git só ao começar F3, ou (c) seguir sem git local e versionar somente em produção.
- **Implicação:** sem git local, Agent 5 não consegue rodar `git diff` real durante reviews.

### O-03 — Camada de controle documental
- **Status:** Aberta — ativada nesta rodada do Agent 0.
- **Decisão:** Manter `docs/PROJECT_STATE.md`, `docs/DECISIONS.md`, `docs/AGENTS.md`, `docs/HANDOFF_TEMPLATE.md`, `docs/NEXT_STEPS.md` como documentos vivos atualizados pelo Agent 0 a cada gate.
- **Implicação:** Implementation Plan e PRD não duplicam estado. Estado vai para `PROJECT_STATE.md`.

### O-04 — Convenções de doc
- **Status:** Em vigor.
- **Decisão:** Reportes em PT-BR; nomes de código/entidade/arquivo em EN; checklists e tabelas curtas; nada de prosa longa em handbacks.

### O-05 — Figma como source of truth visual da F3
- **Status:** Em vigor desde 2026-05-06.
- **Contexto:** F3 entrega painel SaaS interno completo com 15 frames cobrindo as 14 telas do PRD §18 + Configurações.
- **Decisão:** Adotar **Figma** (autorado pelo operador, possivelmente via Figma Make) como referência visual única para o Agent 6.
  - Brief de design canônico: [`docs/design/FIGMA_DESIGN_BRIEF.md`](design/FIGMA_DESIGN_BRIEF.md).
  - Agent 6 lê o Figma via **Figma MCP**, mapeia frames para rotas Next.js e implementa em Tailwind + shadcn/ui.
  - Conflito Figma vs brief textual: **Figma vence** com registro do desvio no handback.
  - Conflito Figma vs PRD: **PRD vence**.
- **Implicação:**
  - `mcp.json` precisa receber `figma` antes do Agent 6 ser ativado.
  - Tokens (cores, tipografia, radii, sombras) só viram código via `globals.css` / `tailwind.config.ts`. Sem nova arquitetura.
  - Sem Figma, Agent 6 fica bloqueado.

### O-06 — Navegação agrupada da sidebar
- **Status:** Em vigor desde 2026-05-06.
- **Contexto:** As 14 telas do PRD §18 + Configurações precisam de uma sidebar legível e agrupada.
- **Decisão:** Sidebar com 4 grupos fixos:
  1. **Operação:** Dashboard, Ranking, Filtradas, Brief MVP.
  2. **Pipeline:** Sinais, Clusters, Execuções (Runs).
  3. **Configuração:** Fontes, Pesos, Blacklist, Prompts.
  4. **Sistema:** Custos, Configurações.
- **Implicação:**
  - Agente futuro não pode reordenar grupos sem aprovação escrita do operador.
  - Configuração ativa em `src/components/dashboard/nav-config.ts`.

### O-07 — Porta fixa do dev server (3000, sem fallback)
- **Status:** Em vigor desde 2026-05-06 (encerramento da F3).
- **Contexto:** Durante a F3, ciclos de restart e múltiplas instâncias geraram inconsistência de chunks Next e dificultaram o debug.
- **Decisão:**
  - `npm run dev` roda em porta **fixa 3000** (`next dev -p 3000`).
  - `npm run start` idem (`next start -p 3000`).
  - Se a porta estiver ocupada, o Next deve **falhar explicitamente**, sem fallback automático para 3001/3002.
  - `predev` script limpa `.next` antes de subir o dev server, eliminando cache stale.
- **Implicação:**
  - Evita rotas de dev convivendo em portas diferentes.
  - Operador precisa matar processos antigos antes de subir um novo dev. Esse é o comportamento desejado.
  - Vale para todos os agentes futuros.

### O-08 — Singleton de cliente Postgres em `globalThis`
- **Status:** Em vigor desde 2026-05-06.
- **Contexto:** Sob hot reload do dev, novas conexões Postgres se acumulavam até atingir `EMAXCONNSESSION` na conta Supabase.
- **Decisão:** `src/db/index.ts` mantém o cliente em `globalThis._gomvpClient` / `_gomvpDb`, com `prepare:false` e `max:1`. Acesso via `getDb()` lazy.
- **Implicação:**
  - Em produção (sem hot reload) o efeito é idêntico ao anterior (uma única conexão por instância serverless).
  - Em dev, evita explosão de conexões.
  - Não altera produção. Não altera schema. Não é exposto a coletores (continuam usando `getDb()`).
  - Eventual evolução para `max>1` exigirá decisão dedicada.

### O-09 — `/coleta` mantida como rota legada (fora da nav)
- **Status:** Em vigor desde 2026-05-06.
- **Contexto:** A tela `(dashboard)/coleta` foi entregue na F1 como leitor read-only de `raw_items`. Em F3 a sidebar foi reorganizada conforme O-06 e `Sinais` virou a leitura principal do pipeline.
- **Decisão:**
  - `/coleta` permanece **funcional** e acessível por URL direta.
  - **Não** aparece na sidebar.
  - Não é absorvida visualmente em `Sinais` em F3 — pode ser revisitado em fase posterior.
- **Implicação:**
  - Histórico operacional preservado.
  - Sem trabalho extra de migração visual nesta fase.

### O-10 — Reversão de filtrada via `feedback.action='unfilter_override'`
- **Status:** Em vigor desde 2026-05-06.
- **Contexto:** `ideas.is_filtered_out` é coluna **gerada** a partir de `blacklist_tags`. Reverter sem alterar `blacklist_tags` (e sem migration) exige overlay de UI.
- **Decisão:**
  - Reversão de uma ideia filtrada é registrada em `feedback` com `action='unfilter_override'` e `note` obrigatória (3..2000 chars).
  - O Ranking principal (`/ranking`) considera `is_filtered_out=false` **OR** existência de `feedback.unfilter_override` para a ideia.
  - `blacklist_tags` continua intacto. A ideia permanece também visível em `/filtradas` com marca de override.
- **Implicação:**
  - Sem migration. Sem alteração de pipeline.
  - É override de **exibição**, não de classificação. Quem audita filtradas vê o histórico real.
  - Caso futuro queira reclassificação real, abrir nova decisão (provavelmente migration em F5 ou F4).

---

## Como abrir nova decisão

1. Verifique se conflita com PRD ou com decisão existente. Se conflitar: pare e escale ao operador.
2. Crie próximo `D-XX` (decisão de produto que altera PRD) ou `O-XX` (operacional).
3. Preencha contexto, decisão, implicação, status.
4. Mude status só com aprovação escrita do operador.

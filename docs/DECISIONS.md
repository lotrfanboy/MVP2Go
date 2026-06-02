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

### D-08 — Cap de custo IA (substituída por D-16 em 2026-05-06)
- **Status:** ~~Fechada (rodada 4 do PRD).~~ **Substituída por D-16** na rodada 7.
- **Decisão original:** Hard cap US$ 50/mês.
- **Por que mudou:** operador decidiu reduzir cap para **US$ 5/mês** dado o uso real e a opção por baixa intensidade. Ver D-16.
- **Implicação:** thresholds 0.80/0.90/1.00 mantidos sobre o novo cap. `assertBudget()` continua intocado.

### D-09 — Retenção LGPD
- **Status:** Fechada.
- **Decisão:** 30d `raw_items`, 90d `signals`, 180d `ideas`/`briefs`, 365d `ai_usage_logs`.
- **Implicação:** Job de retenção e endpoint de purge entregues em **F6** (hardening).

### D-10 — Categorias B2C
- **Status:** Fechada. Mantida intacta na rodada 7.
- **Decisão:** B2C amplo com **blacklist obrigatória** (16 categorias) e priorização (`utility`, `ai_tool`, `calculator`, `generator`, `checker`, `organizer`).
- **Implicação:** Itens com `blacklist_tags` saem do ranking principal e ficam na aba **Filtradas** (auditoria). `category_bonus = 0.05` sobre score legado. Em F4A, categoria bloqueada **zera `launchability_score`** automaticamente.

### D-11 — Mudança de visão: idea → opportunity
- **Status:** Fechada (rodada 7, 2026-05-06).
- **Contexto:** GoMVP era radar de ideias. Operador identificou que a unidade certa é **oportunidade** (dor + público + cross-source confidence + launchability).
- **Decisão:** A unidade central do produto passa a ser `opportunity`. `idea` só pode ser gerada a partir de `opportunity_card.gate_state='approved_opportunity'` (regra de domínio). `brief` só pode ser gerado a partir de `idea.gate_state='idea_allowed'`.
- **Implicação:** PRD §1, §6, §9, §22 reescritos. Fluxo legado (F2 `runIdeaGeneration`) **continua existindo** para dataset histórico, sem desligar em F4A.

### D-12 — Evidence layer source-agnostic
- **Status:** Fechada (rodada 7, 2026-05-06).
- **Contexto:** Pipeline atual é HN-acoplado (extract.ts lê payload HN direto). Para suportar Trends/PH/Reddit/YouTube/Reviews sem reescrever o motor, é necessário um vocabulário comum de evidência tipada.
- **Decisão:** Criar nova tabela `evidences` source-agnostic. **`signals` permanece intacto** e vira **uma das fontes** de evidência via adapter `signals → evidences` em F4A. **Não renomear, não substituir.**
- **Implicação:** F4A introduz `src/sources/<source>/{collector,normalizer}` e `src/motor/*` source-agnostic. O motor nunca lê `signals`, sempre `evidences`. Detalhes em [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md).

### D-13 — Scoring multi-axis
- **Status:** Fechada (rodada 7, 2026-05-06).
- **Contexto:** `total_score` único colapsa dor, tendência, público e launchability em um número, escondendo trade-offs.
- **Decisão:** Em `opportunity_cards`, scores ficam separados em 6 axes: `trend_score`, `pain_score`, `audience_score`, `source_confidence`, `launchability_score`, `opportunity_score` (composto). Pesos default por axis com prefixo `f4_*` em `weights`. **Pain pesa mais que trend** no composto.
- **Implicação:** UI Funil mostra os 6 axes por opportunity. Pesos legados intactos para `ideas` legacy. Detalhes em [`docs/architecture/F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md) §7.

### D-14 — Cross-source obrigatório como gate de qualidade
- **Status:** Fechada (rodada 7, 2026-05-06).
- **Contexto:** HN-only valida arquitetura do motor mas **não** valida mercado amplo. Source Confidence inflada vira certeza falsa.
- **Decisão:** F4A é validação **estrutural** (HN-only): por construção, `source_confidence ≤ 0.40` em 100% das opportunities. F4B (Google Trends) é parte mínima da F4 para começar a validar cross-source. Após decisões posteriores, F4 fecha apenas após F4A + F4B + F4UX + F4OPS + F4C.
- **Implicação:** Manual e watch **não** elevam `source_confidence` externa. Cap automático aplicado em `opportunity-score`.

### D-15 — Gates explícitos + reason codes
- **Status:** Fechada (rodada 7, 2026-05-06).
- **Decisão:** State machine em `opportunity_cards.gate_state` com 9 estados nomeados (`trend_only | watch | weak_signal | pain_candidate | opportunity_candidate | qualified_opportunity | approved_opportunity | rejected | snoozed`). Toda transição registra em `feedback`. Aprovação e rejeição exigem `reason_code` (vocabulário fechado de 19 valores em [`F4_OPPORTUNITY_MOTOR.md`](architecture/F4_OPPORTUNITY_MOTOR.md) §10.2).
- **Implicação:** F4C migra `feedback` para polimórfico (`target_kind`, `target_id`, `reason_code`, `gate_after`) com backfill seguro. UI obriga `reason_code` em toda transição.

### D-16 — Cap operacional de IA na validação F4/F5 (substitui D-08 como alvo vigente)
- **Status:** Fechada (rodada 7, 2026-05-06). **Ajustada** em 2026-05-09 (operador).
- **Contexto:** Uso real até F3 ficou baixo. Para **validação interna do motor de oportunidades (F4/F5)**, o operador quer um teto operacional conservador — **sem tratar esse valor como regra eterna hardcoded do produto**.
- **Decisão:** Durante a validação do motor (F4/F5), o **alvo operacional** do cap mensal de IA é **US$ 5/mês**. O valor efetivo **sempre** vem de **configuração**: variável de ambiente (ex.: `AI_MONTHLY_BUDGET_USD`) e/ou coluna `cost_budgets.monthly_budget_usd` — **nunca literal** fixo em código. Thresholds **0.80 / 0.90 / 1.00** permanecem fixos sobre o budget vigente.
- **Implicação:**
  - Seed e docs podem usar US$ 5,00 como **default** na fase atual; o operador pode subir ou descer pelo **ENV** ou editando a linha do mês em `cost_budgets`.
  - Estimativas F4A/B/C em PRD §14 usam US$ 5 como cenário de referência, não como limite imutável.
  - F6+ ou pós-validação: revisar cap e defaults sem reabrir D-11..D-15.
  - Antes de subir fontes pesadas em F5C/F5D, reavaliar custo agregado e ajustar `cost_budgets`/ENV.

### D-17 — Nova ordem de fontes em F5
- **Status:** Fechada (rodada 7, 2026-05-06).
- **Contexto:** PRD V1 §8 listava PH/HN/RSS/Apple/Stack Exchange. Visão V2 prioriza fontes com maior densidade de dor explícita e cross-source confidence.
- **Decisão:** Ordem F5: **PH > Reddit > YouTube > Reviews**. RSS/Apple/Stack Exchange ficam como **backup** sem prioridade, implementados só sob demanda concreta. Ver [`docs/architecture/F5_SOURCE_EXPANSION.md`](architecture/F5_SOURCE_EXPANSION.md).
- **Implicação:** PRD §8 atualizado. Cada fonte F5x entra como sprint dedicado sob aprovação caso a caso (mantém DP-08 spirit).

### D-18 — Gate oficial F4A é estrutural, não `qualified_opportunity`
- **Status:** Fechada (2026-05-28, decisão operador após F4A review).
- **Contexto:** F4A é HN-only e, por D-14, `source_confidence` fica limitada a `0.40`. A review rejeitou F4A por não haver `qualified_opportunity` e por haver menos de 10 evidences HN novas, mas isso mistura validação estrutural com validação cross-source.
- **Decisão:** F4A **não exige** `qualified_opportunity` nem volume real mínimo absoluto de 10 evidences pós-cutoff. F4A valida: adapter sem backfill; evidence válida; `need_cluster`; `opportunity_card`; cap HN-only; UI de baixa confiança; rejeição de categoria bloqueada/alto risco; testes encerrando corretamente; F3 legado intacto.
- **Implicação:** `qualified_opportunity` forte e volume externo consistente passam a ser evidências de F4B/F5, não condição para aprovar F4A. Se houver menos de 10 sinais novos elegíveis, o handback deve registrar **dados insuficientes** e validar lote por fixture/dev seed controlado. Opportunity com `blacklist_tags`, categoria bloqueada, alto risco ou `not_indielab_fit` deve ser `rejected` com `reason_codes`, nunca `opportunity_candidate`; saúde/médico/regulatório/desinformação sensível é apenas exemplo.

### D-19 — F4UX antes de F4C
- **Status:** Fechada (2026-06-01, decisão operador após F4B review).
- **Contexto:** F4A entregou o motor HN-only e F4B adicionou Google Trends como source adapter, mas o operador ainda sente dificuldade para entender e navegar o produto. Adicionar feedback estruturado, geração de ideias e briefs sobre uma UI confusa prejudicaria o aprendizado do produto.
- **Decisão:** Inserir uma fase intermediária curta **F4UX — Funil UX / Operator Clarity** entre F4B e F4C. F4UX organiza a experiência pelo fluxo do MOTOR: Radar → Evidências → Tendências → Dores agrupadas → Oportunidades → Ideias → Briefs. Sources são infraestrutura de evidence, não menus/produtos.
- **Implicação:** F4C fica pausada até F4UX ser revisada. F4UX não altera motor, scoring, schema, collectors, cron, feedback, geração de ideias/briefs ou F5. Google Trends/Product Hunt/Reddit/YouTube/Reviews não viram menus principais; no máximo aparecem em áreas genéricas de Fontes/Saúde das Fontes/Source Confidence.

### D-20 — F4OPS antes de F4C/F5
- **Status:** Fechada (2026-06-02, decisão operador após F4UX review).
- **Contexto:** F4UX melhorou o frontend/funil e foi aprovada com minors, mas o operador relatou lentidão/travamentos no localhost/Next dev. Antes de alterar motor, feedback, geração de ideias ou novas fontes, o app precisa rodar em ambiente hospedado para separar problema de dev local de gargalo real do produto.
- **Decisão:** Inserir **F4OPS — Vercel Preview / Staging + Performance Validation** entre F4UX e F4C. Vercel é o caminho primário para Preview/Staging de Next.js. Railway fica como alternativa futura apenas se houver blocker real na Vercel ou necessidade de worker/container persistente.
- **Implicação:** F4C e F5 ficam pausadas até F4OPS ser aprovada, salvo skip explícito do operador. F4OPS não altera motor, scoring, schema, migrations, collectors, sources, prompts ou cron. F4OPS mapeia env vars por ambiente sem valores reais, valida build/login/rotas/performance em Preview Deploy e mantém o cron Google Trends desligado até decisão operacional explícita.

---

## Princípios operacionais permanentes (PRD Apêndice E + Implementation Plan)

> Tratar como decisões duras. Violar exige aprovação escrita do operador.

- **DP-01** Estrutura **flat** em `src/...`. Sem monorepo, sem `apps/web/`.
- **DP-02** Migrations sempre exibidas em SQL antes de aplicar. **Não há autorização genérica** para aplicar migration: cada SQL precisa de **aprovação explícita e específica** do operador antes de `db:migrate` ou equivalente.
- **DP-03** Sem commit, push ou PR sem aprovação explícita.
- **DP-04** MCP nunca é dependência runtime. Toda integração de produção é via SDK/fetch.
- **DP-05** Toda chamada IA passa por `assertBudget()` e grava `ai_usage_logs` com `prompt_version`.
- **DP-06** Prompts versionados. Para mudar prompt em produção, criar nova versão (`002`, `003`, ...). Nunca editar versão já em produção.
- **DP-07** F1 não roda IA paga e não cria `signals`. IA e `signals` começam em F2.
- **DP-08** F2 começa **HN-only**. Demais coletores entram um por vez sob aprovação.
- **DP-09** Blacklist sempre ativa após F1. Ranking principal só mostra itens sem `blacklist_tags`.
- **DP-10** Vercel Cron é o único orquestrador da V1.
- **DP-11** Cap mensal de IA **configurável** via ENV + `cost_budgets`; na validação F4/F5 o **alvo operacional** é **US$ 5/mês** (D-16). Thresholds fixos 0.80/0.90/1.00 sobre o budget vigente **não** são configuráveis em V1.
- **DP-12** Sem dado pessoal sensível persistido. Retenção segue D-09. `manual_inputs` e `watch_topics` seguem mesma janela que `signals` (90d).
- **DP-13** `category_bonus` e `preference_affinity` cap em ±0.05 cada. Nunca dominam o score.
- **DP-14** Pacote npm novo exige justificativa explícita.
- **DP-15** **Motor source-agnostic** (`src/motor/*`): nunca importa nada específico de fonte. Trabalha apenas sobre `evidences` (D-12).
- **DP-16** **`signals` e `evidences` são camadas distintas.** Nunca renomear, nunca substituir. `signals` permanece intacto; `evidences` é nova camada source-agnostic (D-12).
- **DP-17** **Manual e watch nunca elevam Source Confidence externa** (D-14). São sementes, não prova de mercado.
- **DP-18** **Idea só de `approved_opportunity`. Brief só de `idea_allowed`** (D-11/D-15). Aplicado em rotas novas (`/api/funil/*`); legado mantido sem desligar.
- **DP-19** **Sistema deve poder dizer "não há oportunidade aqui"** (`gate_state='trend_only'` é resposta válida, não falha).
- **DP-20** **Reason code obrigatório** em transições de `gate_state` em opportunities/ideas (D-15).
- **DP-21** **F4A é gate estrutural HN-only** (D-18): não exigir `qualified_opportunity`; não falsear volume; bloquear/rejeitar categorias incompatíveis com IndieLab antes de promover `opportunity_candidate`.
- **DP-22** **Source adapter ≠ trigger.** Cada fonte externa deve gerar `evidences` reutilizáveis pelo motor e não ficar acoplada a um único disparador. Cron geral, `watch_topics` e `manual_inputs` podem acionar a mesma fonte quando fizer sentido. Manual/watch são seeds internas e nunca contam como fonte externa; `source_confidence` só sobe quando um adapter externo (`hn`, `gtrends`, `ph`, `reddit`, `youtube`, `reviews`) grava evidence real no mesmo `topic_key`. Não criar abstração global de sources antes de 2-3 fontes repetirem o padrão.
- **DP-23** **Navegação orientada pelo MOTOR, não por source** (D-19): o produto organiza o operador pelo fluxo Radar → Evidências → Tendências → Dores agrupadas → Oportunidades → Ideias → Briefs. Fontes externas são infraestrutura/auditabilidade; não criar menus principais por Google Trends/Product Hunt/Reddit/YouTube/Reviews.
- **DP-24** **Preview/Staging antes de novas mudanças profundas** (D-20): `main` representa produção; branches de feature devem gerar Preview Deploy para validar UI/performance antes do merge. Deploy/staging não autoriza ativar cron GT, expor secrets, aplicar migrations, alterar motor/scoring/schema ou iniciar F4C/F5. Variáveis de ambiente devem ser separadas por Production/Preview/Development e documentadas por nome, nunca por valor.

---

## Decisões operacionais (não-produto)

### O-01 — Budget por ambiente (DEV vs PROD)
- **Status:** Atualizada em 2026-05-09.
- **Contexto histórico:** Em F2/F3 havia prática de US$ 5 em dev e US$ 50 em PRD legado.
- **Resolução (com D-16 ajustada):** O valor do cap é **100% configurável** por ENV (`AI_MONTHLY_BUDGET_USD` ou nome vigente no código) e por `cost_budgets.monthly_budget_usd`. Dev e produção **podem** divergir se o operador configurar assim — não é regra do produto impor um único número eterno. Para a fase de validação F4/F5, o **default documentado** é US$ 5/mês.

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

### O-11 — Vercel Preview/Staging como caminho operacional primário
- **Status:** Em vigor desde 2026-06-02 (F4OPS).
- **Contexto:** O operador precisa usar o app fora do localhost para validar se a lentidão vem do ambiente local/dev server ou do app.
- **Decisão:** F4OPS deve priorizar Vercel para Preview/Staging, com fluxo branch → Preview Deploy → merge em `main` → Production. Railway fica fora da prioridade atual, salvo blocker real na Vercel ou necessidade futura de worker/container persistente.
- **Implicação:**
  - F4OPS pode mapear e configurar envs por ambiente somente após aprovação operacional.
  - Secrets reais nunca entram em docs, handbacks ou logs.
  - `GTRENDS_ENABLED`/BigQuery e `/api/cron/collect-trends` permanecem desligados até aprovação explícita.
  - Performance deve ser comparada entre Vercel Preview e localhost antes de propor correções.

---

## Como abrir nova decisão

1. Verifique se conflita com PRD ou com decisão existente. Se conflitar: pare e escale ao operador.
2. Crie próximo `D-XX` (decisão de produto que altera PRD) ou `O-XX` (operacional).
3. Preencha contexto, decisão, implicação, status.
4. Mude status só com aprovação escrita do operador.

# Agent 6 — F3 UI/UX (Painel + Ações)

> **Use este arquivo como a primeira mensagem do chat do Agent 6.**

## Quem você é

Você é o **Agent 6** do GoMVP. Sua única responsabilidade é a **Fase F3 — Painel + Ações** descrita em [docs/PRD.md](../PRD.md) §6, §17, §18, §19, §24 e em [docs/IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md). Você implementa o **front** do painel SaaS interno em PT-BR, cobrindo todas as telas previstas, com base no design do Figma.

Você **não** trabalha em coleta, IA, schema, cron, scoring, budget ou prompts. F0/F1/F2 já estão entregues e revisadas. Você apenas constrói o front.

---

## Pré-condições obrigatórias

Antes de começar, valide que:

- [ ] [docs/handback/F2_DONE.md](../handback/F2_DONE.md) e [docs/handback/F2_REVIEW.md](../handback/F2_REVIEW.md) aprovados.
- [ ] [docs/PROJECT_STATE.md](../PROJECT_STATE.md) marca F2 como DONE e F3 como current phase.
- [ ] [docs/design/FIGMA_DESIGN_BRIEF.md](../design/FIGMA_DESIGN_BRIEF.md) lido inteiro.
- [ ] **Arquivo Figma existe e está acessível**, com:
  - Cover frame.
  - Style guide (cores, tipografia, espaçamento, sombras, ícones).
  - Components page com componentes da seção 7 do brief.
  - Screens page com 15 frames (todas as telas).
  - States page com 4 estados das 5 telas-chave.
  - Tokens publicados em "Local Variables" do Figma.
- [ ] **Figma MCP configurado** em `mcp.json` do operador. Se não estiver, **pare** e peça ao operador para configurar antes de prosseguir.
- [ ] Tabelas F2 populadas em dev: `signals`, `clusters`, `signal_cluster`, `ideas`, `idea_signals`, `briefs`, `weights`, `prompts`, `feedback`.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` rodam sem erro novo no commit base.

Se algum item estiver pendente, **pare** e peça ao operador para resolver antes.

---

## Leituras obrigatórias

Na ordem:

1. [docs/PRD.md](../PRD.md), com atenção especial a:
   - §6 e §6.1 (escopo V1 + blacklist).
   - §17 (modelo de dados).
   - §18 (telas necessárias).
   - §19 (lógica de scoring).
   - §24 (gates F3).
   - Apêndice E (princípios operacionais).
2. [docs/IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md), seção F3 e Guardrails permanentes.
3. [docs/PROJECT_STATE.md](../PROJECT_STATE.md).
4. [docs/DECISIONS.md](../DECISIONS.md), incluindo D-01..D-10 e decisões operacionais O-05/O-06.
5. [docs/AGENTS.md](../AGENTS.md).
6. [docs/design/FIGMA_DESIGN_BRIEF.md](../design/FIGMA_DESIGN_BRIEF.md).
7. [.cursor/rules/gomvp-product-rules.mdc](../../.cursor/rules/gomvp-product-rules.mdc).
8. **Arquivo Figma** via Figma MCP (link fornecido pelo operador no momento da ativação).
9. Handbacks anteriores: F0/F1/F2 done + reviews.
10. `src/db/schema.ts` (não editar) para entender exatamente os campos disponíveis.
11. `src/app/(dashboard)/coleta/page.tsx` como referência do padrão atual de páginas server-rendered com Drizzle.

---

## Decisões fechadas relevantes

- **D-01..D-10** intocáveis.
- **O-05 (Figma como source of truth visual):** o Figma é a referência. Se o Figma divergir do brief textual, o **Figma vence**, mas registre o desvio no handback. Se o Figma divergir do PRD, **o PRD vence**.
- **O-06 (Navegação agrupada):** sidebar com 4 grupos (Operação, Pipeline, Configuração, Sistema), conforme `FIGMA_DESIGN_BRIEF.md` §6.2.
- **Stack imutável:** Next.js 15 App Router, TS estrito, Tailwind, shadcn/ui, Supabase Auth + Drizzle, Lucide.
- **Idioma:** UI em PT-BR. Nomes de código em EN.

---

## Escopo F3 (única entrega)

### 1. Shell de aplicação

- Criar/atualizar layout `src/app/(dashboard)/layout.tsx` para incluir:
  - Sidebar fixa com 4 grupos e itens conforme brief §6.2.
  - Topbar com breadcrumbs, **budget pill** lendo `cost_budgets` do mês corrente, avatar do operador.
  - Auth gate já presente (manter).
- Componentes da shell: `app-sidebar.tsx`, `app-topbar.tsx`, `budget-pill.tsx`, `nav-item.tsx`, `nav-group.tsx`.

### 2. Telas implementadas (15 frames)

Todas as telas listadas no brief §11 e detalhadas em §12 devem existir como rota Next.js com layout `(dashboard)/...`, exceto Login (`/login` já existe).

Rotas:

| Tela | Rota |
|---|---|
| Login | `/login` (revisar visual) |
| Dashboard | `/dashboard` |
| Ranking | `/ranking` |
| Detalhe da Ideia | `/ideias/[id]` |
| Filtradas | `/filtradas` |
| Sinais | `/sinais` |
| Clusters | `/clusters` (lista) e `/clusters/[id]` opcional |
| Runs | `/runs` |
| Custos | `/custos` |
| Fontes | `/fontes` |
| Pesos | `/pesos` |
| Blacklist | `/blacklist` |
| Prompts | `/prompts` |
| Brief MVP | `/brief/[ideaId]` |
| Configurações | `/configuracoes` |

> **A página `coleta` atual em `(dashboard)/coleta` deve continuar funcionando.** Ela pode ser absorvida como sub-rota de **Sinais** ou ficar como rota legada acessível via Configurações. Decidir e justificar no handback.

### 3. Padrões obrigatórios

- **Server Components por padrão.** Use `client components` apenas onde houver interação real (filtros, sliders, drawers, toggles).
- **Drizzle queries em Server Components / Server Actions.** Não criar API routes novas para dados de leitura.
- **Server Actions para mutations** (CRUD em `sources`, `weights`, `blacklist_terms`, ações em `ideas`, registros em `feedback`).
- **Validação Zod** em toda Server Action.
- **Empty / loading / error states** em todas telas com dado dinâmico, conforme brief §8.
- **Sem chamadas IA novas.** Recalcular scores **é permitido** porque é determinístico em código, mas use o `score.ts` existente sem alterar lógica.
- **Sem novos arquivos em `src/pipeline`, `src/ai`, `src/collectors`, `src/prompts`.**
- **Sem novas migrations** (ver "Forbidden" abaixo).

### 4. Componentes shadcn/ui adicionais permitidos

Você pode adicionar via shadcn CLI apenas se necessário e listar no handback:

- `card`, `tabs`, `table`, `badge`, `avatar`, `dropdown-menu`, `sheet`, `dialog`, `alert-dialog`, `tooltip`, `skeleton`, `slider`, `select`, `popover`, `command`, `breadcrumb`, `progress`, `toast` (ou `sonner`), `separator`, `scroll-area`.

> Pacotes externos novos exigem justificativa explícita no handback (DP-14).

### 5. Mapeamento Figma → código

- Para cada `screen/<area>/<name>` no Figma, criar a rota equivalente em `src/app/(dashboard)/...`.
- Para tokens em "Local Variables" do Figma, atualizar **somente** `src/app/globals.css` (CSS vars HSL) e/ou `tailwind.config.ts` se necessário. Não inventar tokens fora do brief.
- Para componentes em `comp/<group>/<name>`, criar arquivo correspondente em `src/components/ui/` (shadcn) ou `src/components/<group>/`.

### 6. Validação ao final com Playwright MCP

Antes de fechar a fase, rodar checks com Playwright MCP em `npm run dev` local:

- [ ] Todas as 15 rotas carregam sem erro 500.
- [ ] Auth gate redireciona `/dashboard` → `/login` quando deslogado.
- [ ] Login com conta de dev → entra no Dashboard.
- [ ] Sidebar lista todos os grupos e itens; click navega corretamente.
- [ ] Topbar mostra budget pill com valor real de `cost_budgets` do mês.
- [ ] Ranking mostra ideias reais ordenadas por `total_score DESC`.
- [ ] Detalhe da ideia mostra evidência clicável; link abre fonte em nova aba.
- [ ] Filtradas mostra ideias com `blacklist_tags`.
- [ ] Sinais carrega lista paginada.
- [ ] Clusters lista clusters com signals e ideas associadas.
- [ ] Runs carrega tabela e drawer de log com `ai_usage_logs`.
- [ ] Custos mostra threshold visual e tabela de chamadas.
- [ ] Fontes/Blacklist CRUD criam/editam/desativam registros.
- [ ] Pesos editáveis com soma visível, recálculo dispara sem custo IA.
- [ ] Prompts em read-only com 5 entradas v001.
- [ ] Brief MVP mostra brief existente OU empty state honesto.
- [ ] Configurações mostra ENV read-only e botão Sair.
- [ ] Console do navegador sem erros vermelhos novos.
- [ ] Responsivo verificado em viewports 1440 / 1280 / 1024 / 768.

---

## Fora de escopo (recusar com firmeza)

- **Migrations.** Sem novas migrations. Se algo precisar de coluna nova (ex.: `snoozed_until`), pare, registre como gap, e peça aprovação humana antes de prosseguir.
- **Schema changes.**
- **Mexer em pipeline IA**: `src/pipeline/extract.ts`, `embed.ts`, `filter_ai.ts`, `cluster.ts`, `ideaGen.ts`, `score.ts` (a única exceção é importar `score.ts` para o botão "Recalcular scores" — sem mudar a lógica).
- **Mexer em coletores**: `src/collectors/*`.
- **Mexer em cron**: `src/app/api/cron/*` e `vercel.json`.
- **Mexer em IA**: `src/ai/*`. Se a UI precisar exibir custo, lê de `ai_usage_logs` e `cost_budgets`. Sem chamada nova.
- **Mexer em prompts versionados**: `src/prompts/*`. Read-only na UI.
- **Editar `.env*`** (apenas `.env.example` se documentar nova var pública opcional, com justificativa).
- **Adicionar coletores novos** (PH/RSS/Apple/StackExchange/manual).
- **Geração real de Brief MVP via IA on-demand.** Fica para F4. Em F3 a tela só lê `briefs` existentes.
- **Treinar/alterar embeddings.**
- **Mudanças em `cost_budgets` thresholds.**
- **Multi-tenant / RBAC / multi-usuário.**
- **Mobile native ou ofertas públicas.**
- **Branding pesado, marketing copy, landing.**
- **Commit, push ou PR sem aprovação explícita do operador.**

---

## Gaps conhecidos do schema (registrar e respeitar)

São limites que o brief do Figma já antecipa. Em código, **não tente contornar com migration**:

1. **Snooze sem `snoozed_until`.** Implemente snooze como:
   - `ideas.status='snoozed'`.
   - `feedback.action='snooze' + note`.
   - UI mostra "Em snooze" sem data de fim.
2. **Reversão de filtrada.** `is_filtered_out` é coluna gerada. Implemente reversão como:
   - `feedback.action='unfilter_override' + note`.
   - UI passa a tratar override como **filtro de exibição**: ideia aparece no ranking principal mesmo com `blacklist_tags`.
   - Sem alterar `blacklist_tags`.
3. **Brief MVP sob demanda** fica em F4.
4. **Filtro IA leve dinâmico** sem UI ajustável agora.
5. **Login social / signup público** fora.
6. **Multi-usuário** fora.

Tudo o que é gap entra em `Known issues` no handback.

---

## Convenções de código

- TS estrito; `as` proibido fora de casos justificados.
- Server Actions: `"use server"` no topo do arquivo.
- Forms com `useFormState` / `useFormStatus` para feedback.
- Inputs com `react-hook-form` + Zod **só se** já estiver no projeto. Se não, usar Server Actions diretas com Zod (sem dependência nova).
- Ícones Lucide importados individualmente.
- Estilização **somente Tailwind**. Sem CSS-in-JS novo.
- Não usar `any`. Não usar `// @ts-ignore` salvo justificativa no handback.

---

## Gates F3 (PRD §24 + Implementation Plan)

Confirme **todos**:

- [ ] 30 ideias revisadas em ≤ 30 min em fluxo manual.
- [ ] Aba Filtradas mostra motivo de blacklist por ideia.
- [ ] Tela Custos mostra gasto vs. budget e últimas 50 `ai_usage_logs`.
- [ ] Reversão manual de item filtrado exige nota e funciona como override de UI.
- [ ] `npm run typecheck` / `npm run lint` / `npm run build` passam.
- [ ] Console sem erros vermelhos novos.
- [ ] Auth gate funciona em todas rotas autenticadas.
- [ ] Nenhuma migration nova aplicada.
- [ ] Nenhum coletor adicional fora HN.
- [ ] Nenhuma chamada IA nova introduzida.
- [ ] Nenhum prompt `001` editado.

---

## Saída de F3 — handback

Criar `docs/handback/F3_DONE.md` usando [docs/HANDOFF_TEMPLATE.md](../HANDOFF_TEMPLATE.md). Conteúdo mínimo:

- Resumo da entrega.
- Lista de arquivos criados/alterados.
- Lista de pacotes shadcn adicionados.
- Mapeamento `screen/Figma → rota Next.js` em tabela.
- Evidência Playwright (rotas que carregaram, ações testadas).
- Métricas: contagem de telas implementadas (deve ser 15/15).
- `Known issues` com **todos** os gaps que ficaram (snooze, reversão, brief, etc.).
- `Open questions` (decisões que precisam vir do operador para F4).
- `AI cost in this phase`: deve ser US$ 0 (sem chamadas novas) — confirmar via `ai_usage_logs` antes/depois.
- `Reviewer requested`: Agent 5.

---

## Workflow recomendado (sequência segura)

1. **Ler tudo (PRD, brief, Figma).** Confirmar pré-condições. Se algo falta, parar.
2. **Construir shell** (sidebar, topbar, layout, budget pill) e validar com 1 rota dummy.
3. **Implementar Dashboard** (mais leve em interação, dá feedback rápido sobre tokens).
4. **Implementar Ranking + Detalhe da Ideia + Filtradas** (núcleo de operação).
5. **Implementar Sinais + Clusters + Runs** (pipeline visibility).
6. **Implementar Custos + Fontes + Pesos + Blacklist + Prompts** (configuração).
7. **Implementar Brief MVP + Configurações + Login refinado**.
8. **Validar com Playwright MCP** todas as 15 rotas e checagens da seção 6.
9. **Atualizar `docs/PROJECT_STATE.md`** com as 15 rotas marcadas e gaps.
10. **Escrever `docs/handback/F3_DONE.md`** e parar.

---

## Como iniciar

Quando ativado pelo operador:

1. Confirmar fase e leituras concluídas.
2. Listar comandos que vai rodar (instalações de shadcn, etc.) **antes de rodar**.
3. Pedir aprovação explícita para:
   - Cada `npx shadcn add ...`.
   - Cada Server Action que mutaciona dados (sources/weights/blacklist).
   - Recalcular scores (mesmo sem custo IA, é operação sobre dados reais).
4. Trabalhar em blocos (shell → telas) com pontos de checkpoint visuais.
5. Não fazer commit/push/PR.
6. No final, entregar `F3_DONE.md` e acionar Agent 5.

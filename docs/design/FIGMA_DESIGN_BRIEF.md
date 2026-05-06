# GoMVP — Figma Design Brief (F3 Painel + Ações)

> **Para colar no Figma / Figma Make.** Este documento descreve produto, princípios, design system completo e especificação de todas as 14 telas da F3.
> Leitura complementar (não recomendado colar): [`docs/PRD.md`](../PRD.md), [`docs/IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md), [`docs/DECISIONS.md`](../DECISIONS.md).
> Idioma da UI: **PT-BR.** Names de componentes/layers no Figma: **EN** (snake-case ou kebab-case).

---

## 1. Contexto do produto (1 parágrafo)

GoMVP é um painel SaaS interno da Built2Go usado por **um único operador**. Ele captura sinais de fontes públicas (Hacker News via API, e em fases futuras Product Hunt, RSS, Apple RSS, Stack Exchange), aplica blacklist obrigatória e regras determinísticas, extrai dores com IA, agrupa sinais por similaridade vetorial e gera **até 30 ideias B2C ranqueadas 2x/semana**. O operador aprova, rejeita, marca como promissora ou faz snooze. Apenas ideias aprovadas geram brief de MVP. Custo de IA tem hard cap em US$ 50/mês com kill switch. **Não é produto público, não é multi-tenant, não é mobile-native.**

## 2. Princípios de design

1. **SaaS profissional, não marketing site.** Sem hero, sem gradientes vibrantes, sem ilustrações.
2. **Densidade controlada.** O operador olha tabelas e métricas, não páginas com muito espaço vazio. Densidade comparável a Linear, não Notion home.
3. **Honestidade de estado.** Empty state explícito quando não há dado. Skeletons em loading. Erros com ação de retry. Nunca esconder ausência de dado com mock.
4. **Decisão acima de exploração.** O fluxo principal é: olhar Dashboard → ler Ranking → abrir Detalhe da Ideia → tomar ação (aprovar/rejeitar/promissora/snooze/nota).
5. **Evidência primeiro.** Toda ideia mostra link clicável para a fonte original. Nada é “opinião do sistema”, tudo é rastreável.
6. **Custo visível.** Em qualquer tela com pipeline, mostrar barra/pill de orçamento mensal de IA.
7. **Acessibilidade base.** Contraste mínimo AA, foco visível, navegação por teclado, leitores de tela compatíveis.
8. **Sem decoração inventada.** Se algo não existe no schema atual, mostre `empty state` ou `placeholder honesto`. Não criar campos visuais sem dado real correspondente.

## 3. Referências visuais

**Inspiração direta** (em ordem de prioridade):

1. **Linear** — sidebar fixa estreita, monochrome com 1 accent, transições suaves, command palette mental, badges minimalistas.
2. **Vercel Dashboard** — cards de métricas, log feeds, status pills, breadcrumbs, deploy timelines (analogia para `runs`).
3. **Notion / Notion Calendar** — quietude visual, tipografia limpa, microinterações sutis.
4. **PostHog / Plausible** — densidade de tabelas com filtros, gráficos pequenos sem estética “BI corporativo”.
5. **Resend** — tabelas com badges de status e copy preciso.

**O que não é referência:** Stripe (muito polido para nosso caso), Salesforce (denso demais e enterprise-y), Airtable (cores fortes), Discord (chat-vibe), produtos com gamificação.

## 4. Tom e voz (microcopy PT-BR)

- **Curto, direto, sem floreio.** Verbos no infinitivo para botões.
- **Sem adjetivos vazios.** Nada de “poderoso”, “mágico”, “inteligente”.
- **Sem exclamação.** Mensagem é informação, não animação.
- **Termos técnicos podem aparecer**: “embedding”, “cluster”, “raw item”. Audiência é técnica.
- **Nomes de entidades em PT** quando há equivalente claro: “Ideia”, “Sinal”, “Cluster”, “Fonte”, “Execução”, “Custo”, “Pesos”, “Blacklist”, “Prompts”, “Brief”, “Filtradas”.
- **Datas em PT-BR**: formato `dd MMM yyyy, HH:mm` (ex.: `06 mai 2026, 10:14`).
- **Números monetários**: `US$ 0,055` com vírgula PT-BR.

Exemplos:
- Botão primário: **Aprovar**, **Rejeitar**, **Marcar como promissora**, **Adiar 30 dias**, **Recalcular scores**.
- Empty state Dashboard: **Sem execuções recentes. As próximas coletas rodam segunda e quinta.**
- Erro: **Não foi possível carregar ideias.** + botão **Tentar novamente**.

---

## 5. Design System

### 5.1 Cores (modo claro padrão; dark mode é nice-to-have v2)

Base **slate/zinc neutra** com **1 accent** funcional. Tokens em HSL para encaixar com o `globals.css` atual da stack (shadcn).

**Neutros (light):**
- `bg.app`: `hsl(0 0% 100%)`
- `bg.subtle`: `hsl(210 40% 98%)`
- `bg.muted`: `hsl(210 40% 96%)`
- `bg.elevated`: `hsl(0 0% 100%)` com sombra `shadow.sm`
- `border`: `hsl(214 32% 91%)`
- `border.strong`: `hsl(215 20% 80%)`
- `text.primary`: `hsl(222 84% 5%)`
- `text.secondary`: `hsl(215 16% 47%)`
- `text.disabled`: `hsl(215 16% 65%)`

**Accent (uso parcimonioso):**
- `accent.primary`: `hsl(222 47% 11%)` (igual a `--primary` do shadcn — preto-tinted) → para botão primário e emphasis.
- `accent.brand`: `hsl(221 83% 53%)` (azul Vercel-like) → opcional para link/realce de seleção.

**Status semântico:**
- `status.success`: `hsl(142 71% 45%)` (verde escuro, baixo brilho).
- `status.warning`: `hsl(38 92% 50%)` (âmbar).
- `status.danger`: `hsl(0 72% 51%)` (vermelho controlado).
- `status.info`: `hsl(199 89% 48%)`.
- `status.neutral`: `hsl(215 16% 47%)`.

**Score chips (gradiente discreto por faixa):**
- 0.00–0.39: `status.neutral`
- 0.40–0.59: `status.info`
- 0.60–0.79: `status.success`
- 0.80–1.00: `accent.primary`

**Blacklist tag chip:** background `hsl(0 70% 95%)`, texto `hsl(0 72% 35%)`, borda `hsl(0 60% 85%)`.

**Dark mode (preview, não bloqueante para F3):** seguir mapeamento do `globals.css` já presente (shadcn `dark:` variant).

### 5.2 Tipografia

- **Sans:** Inter Variable (fallback `system-ui`).
- **Mono:** JetBrains Mono (para IDs UUID curtos, quantias, contagens, timestamps técnicos).

Escala (px / line-height):

| Token | Tamanho | LH | Uso |
|---|---|---|---|
| `text.xs` | 12 / 16 | meta, badges |
| `text.sm` | 13 / 20 | tabelas, body secundário |
| `text.base` | 14 / 22 | body padrão |
| `text.lg` | 16 / 24 | títulos de cards |
| `text.xl` | 18 / 26 | títulos de página |
| `text.2xl` | 22 / 30 | título de tela hero |
| `text.3xl` | 28 / 36 | só dashboard hero metric |

Pesos: `400` regular, `500` medium, `600` semibold para títulos. **Não usar 700+.**

### 5.3 Grid, espaçamento e densidade

- Grid base de **8 px**. Espaçamentos válidos: 4, 8, 12, 16, 20, 24, 32, 48.
- **Container max** do conteúdo: 1440 px com padding lateral 24 px.
- **Sidebar:** 240 px fixa em desktop ≥1280; 64 px ícone-only em ≥1024 e <1280; off-canvas hambúrguer em <1024.
- **Topbar:** 56 px de altura.
- **Tabelas:** linha de 44 px (densa) ou 56 px (confortável). Default 48 px.
- **Cards:** padding interno 16 px (compacto) ou 20 px (default). Border radius 12 px.

### 5.4 Border radius e sombras

- `radius.sm` 6px (chips, inputs).
- `radius.md` 8px (botões, cards pequenos).
- `radius.lg` 12px (cards principais, modais).
- `radius.xl` 16px (drawers).

Sombras (subtle):
- `shadow.sm`: `0 1px 2px hsl(220 10% 10% / 0.05)`
- `shadow.md`: `0 4px 12px hsl(220 10% 10% / 0.08)`
- `shadow.lg`: `0 12px 32px hsl(220 10% 10% / 0.12)` (modais/drawers).

### 5.5 Iconografia

- **Lucide** (já configurada via `components.json`).
- Tamanhos: 16, 18, 20.
- Stroke 1.75 default. **Sem mistura de pacotes de ícones.**

### 5.6 Estados de elemento

Todo botão/input/chip precisa ter os estados:

- `default`, `hover`, `focus-visible` (anel `accent.primary` 2px), `active`, `disabled`, `loading`.

Foco visível obrigatório para navegação por teclado.

---

## 6. Layout estrutural

### 6.1 Shell de aplicação (todas as telas autenticadas)

```
┌─────────────┬──────────────────────────────────────────┐
│             │  TOPBAR  (56px)                          │
│  SIDEBAR    ├──────────────────────────────────────────┤
│  (240px)    │                                          │
│             │  PAGE HEADER  (título + ações)           │
│             │                                          │
│             │  CONTENT                                 │
│             │                                          │
│             │                                          │
└─────────────┴──────────────────────────────────────────┘
```

### 6.2 Sidebar — agrupamento de navegação

Grupos (com label small em uppercase letter-spacing 0.06em):

1. **Operação**
   - Dashboard
   - Ranking
   - Filtradas
   - Brief MVP
2. **Pipeline**
   - Sinais
   - Clusters
   - Execuções (Runs)
3. **Configuração**
   - Fontes
   - Pesos
   - Blacklist
   - Prompts
4. **Sistema**
   - Custos
   - Configurações

Cada item:
- Ícone Lucide à esquerda.
- Label PT-BR.
- Badge opcional à direita (ex.: contagem de pendentes em **Ranking**, alerta em **Custos**).
- Estado ativo: background `bg.muted`, borda esquerda 2 px `accent.primary`.

Rodapé da sidebar:
- E-mail do operador truncado, dropdown com **Sair**.
- Indicador de ambiente (`dev` / `prod`) como pill discreta.

### 6.3 Topbar

- Esquerda: breadcrumbs (`Operação / Ranking`).
- Centro: vazio em F3 (placeholder para command palette futuro).
- Direita:
  - **Pill de orçamento IA do mês** com cor por threshold:
    - <80%: neutro (`status.neutral`).
    - 80–89%: `status.warning`.
    - 90–99%: `status.danger` discreto.
    - 100%: `status.danger` cheio + ícone de bloqueio.
    - Texto: `US$ 0,06 / US$ 50,00 (0,1%)`.
    - Click abre tela **Custos**.
  - Avatar do operador + dropdown (Configurações, Sair).

### 6.4 Page header

- Título h1 + subtítulo opcional + ações primárias à direita.
- Algumas telas têm tabs sob o header (ex.: Ranking → `Top 30 | Promissoras | Aprovadas | Rejeitadas | Snooze`).

### 6.5 Right rail (quando aplicável)

Algumas telas usam **sheet/drawer lateral direito** em vez de modal cheio (Detalhe da Ideia em variante drawer, JSON viewer, log de uma run).

---

## 7. Componentes obrigatórios

Cada um precisa ter pelo menos:
- variantes mínimas listadas;
- estados `default`, `hover`, `focus-visible`, `disabled`, `loading` quando faz sentido.

### 7.1 Buttons
- `primary`, `secondary`, `ghost`, `outline`, `destructive`, `link`.
- Sizes: `sm` (32 px altura), `md` (36 px), `lg` (40 px).

### 7.2 Inputs
- `text`, `search` (com ícone esquerda), `select`, `combobox`, `textarea`, `number`, `toggle`, `checkbox`, `radio`, `slider` (para weights).

### 7.3 Badge / Pill
- Cores semânticas + neutra.
- Variantes: `subtle` (background com tint), `solid` (rare), `outline`.

### 7.4 Status pill (especializado)
- `pendente`, `aprovada`, `rejeitada`, `promissora`, `snooze`, `filtrada`, `gerada`, `noise`.
- Mapeamento direto para `ideas.status` + `is_filtered_out`.

### 7.5 Score chip
- Mostra `0.83` em mono + barra fina embaixo (4 px) com fill proporcional.
- Tooltip on hover com breakdown: `pain_clarity 0.85 · b2c_fit 0.78 · evidence_volume 0.91 · ...`.

### 7.6 Card
- Variantes: `stat-card`, `list-card`, `detail-card`, `empty-card`.

### 7.7 Stat card
- Label small uppercase + número grande mono + delta opcional (▲▼ com cor) + sparkline opcional 80×24.

### 7.8 Table
- Cabeçalho fixo (sticky) ao rolar.
- Colunas com sort visual (▲▼ ao hover).
- Linha hover: `bg.muted`.
- Click linha → abre detalhe (drawer ou rota).
- Densidades: `compact` / `default`.
- Empty row e skeleton row.

### 7.9 Filter bar
- Search input à esquerda + chips de filtros + ações à direita (`Limpar`, `Salvar visão` (futuro, deixar slot vazio)).
- Chips removíveis com X.

### 7.10 Pagination
- 30 por página, com `← Anterior · Página X de Y · Próxima →`.

### 7.11 Toast / Snackbar
- Variantes: `success`, `error`, `info`. Duração 4s. Sem stacking grande.

### 7.12 Modal / Sheet / Drawer
- Modal centrado para confirmações.
- Sheet/Drawer lateral direito 480 px para detalhe da ideia.

### 7.13 JSON / Code viewer
- Mono, syntax highlight neutro, botão **Copiar**.
- Usado em Detalhe da Ideia (`subscores`, `evidence_json`), Brief MVP (preview), Prompts (read-only).

### 7.14 Empty state
- Ícone Lucide grande 48 px, título 1 linha, descrição 1–2 linhas, CTA opcional.
- Tom honesto: explica por que está vazio.

### 7.15 Loading
- Skeleton com background `bg.muted` e shimmer sutil.
- **Sem** spinners gigantes em página inteira. Só inline em botões.

### 7.16 Error state
- Ícone alerta + título + mensagem técnica curta + botão **Tentar novamente**.
- Para erro de DB, link para Configurações ou logs.

### 7.17 Budget pill (já descrita em 6.3)

### 7.18 Tag (categoria/idiomas/blacklist)
- `language`: `PT`, `EN`, `OUTRO` (chips outline).
- `product_type`: `Utility`, `AI Tool`, `Calculator`, `Generator`, `Checker`, `Organizer`, `Outro`.
- `monetization`: `Free`, `Doação`, `One-time`, `Assinatura`, `Uso`, `Outro`.

---

## 8. Padrões de estado por tela

Toda tela com dado dinâmico tem 4 estados desenhados:

- `loading` — skeleton estrutural.
- `empty` — sem dado real. Copy explica e sugere próximo passo.
- `error` — falha técnica com retry.
- `loaded` — happy path.

E mais estados específicos quando aplicável:
- `partial` (parte do dado disponível, ex.: `ideas` existem mas `briefs` ainda não).
- `over-budget` (banner topo quando IA está em hard-stop).

## 9. Padrão de tabela

Todas as tabelas grandes (Ranking, Filtradas, Sinais, Runs, Sources, Blacklist) seguem o mesmo padrão:

- Filter bar acima.
- Tabela com sticky header.
- Pagination embaixo (30/página).
- Click na linha abre **drawer** (preferencial) ou **rota** (Ranking → Detalhe é rota dedicada).
- Coluna de ações ao final quando faz sentido (kebab menu `⋯`).

## 10. Padrão de filtros

Filtros visíveis = chips abertos. Filtros avançados = popover.

Filtros mínimos por tela:
- **Ranking:** status, fonte, score mínimo (slider 0–1), idioma, product_type.
- **Filtradas:** motivo (blacklist_tag), fonte, idioma.
- **Sinais:** status (pending/processed/noise), idioma, blacklist on/off, fonte.
- **Clusters:** coherence mínimo, tem ideias / sem ideias.
- **Runs:** kind, status, intervalo de data, triggered_by.
- **Custos:** mês corrente / 3 meses / 6 meses, operação.
- **Sources:** ativa / inativa, kind.
- **Blacklist:** categoria, escopo, idioma, ativa / inativa.

---

## 11. Mapa das 14 telas

| # | Tela | Rota proposta | Tipo | Drawer/Modal? |
|---|---|---|---|---|
| 1 | Login | `/login` | Form | — |
| 2 | Dashboard | `/dashboard` | Painel de métricas + atividade | — |
| 3 | Ranking | `/ranking` | Tabela top 30 | Detalhe = rota |
| 4 | Detalhe da Ideia | `/ideias/[id]` | Página detalhe | drawer no Ranking opcional |
| 5 | Filtradas | `/filtradas` | Tabela auditoria | drawer detalhe |
| 6 | Sinais | `/sinais` | Explorer | drawer detalhe |
| 7 | Clusters | `/clusters` | Lista + tabs | drawer detalhe |
| 8 | Execuções (Runs) | `/runs` | Tabela + timeline | drawer log |
| 9 | Custos IA | `/custos` | Painel + log | — |
| 10 | Fontes | `/fontes` | Tabela + form CRUD | sheet form |
| 11 | Pesos | `/pesos` | Form + recálculo | confirm modal |
| 12 | Blacklist | `/blacklist` | Tabela + form CRUD | sheet form |
| 13 | Prompts | `/prompts` | Lista + viewer | drawer viewer |
| 14 | Brief MVP | `/brief/[ideaId]` | Página de brief | — |
| 15 | Configurações | `/configuracoes` | Página de conta + ambiente | — |

> Observação: a soma é 15 itens contando Login + Configurações. PRD §18 lista 14 telas funcionais; aqui Login e Configurações são considerados "telas de sistema" que coexistem. **No Figma, criar todas as 15 frames.**

---

## 12. Especificação por tela

> Para cada tela: objetivo, dado mostrado (com referência ao schema real), ações, layout, estados.

### 12.1 Login (`/login`)

- **Objetivo:** entrar no painel com Supabase Auth.
- **Layout:** centralizado, card 360 px com logo GoMVP simples (texto + dot), inputs `email` e `senha`, botão primário **Entrar**, link discreto **Esqueci a senha** (apenas placeholder visual em F3).
- **Estados:** default, loading no submit, erro com mensagem genérica `Credenciais inválidas`.
- **Sem registro público.** Removido qualquer link de signup.

### 12.2 Dashboard (`/dashboard`)

- **Objetivo:** estado geral em 1 olhar.
- **Linha 1 — Stat cards (4 cards):**
  - **Ideias geradas (mês)** — conta `ideas` do mês, com delta vs mês anterior.
  - **Ideias aprovadas (mês)** — conta `ideas where status='approved'`.
  - **Ideias filtradas (mês)** — conta `ideas where is_filtered_out=true`.
  - **Custo IA (mês)** — `cost_budgets.current_spend_usd` + barra com threshold (80/90/100).
- **Linha 2 — Grid 2 colunas:**
  - **Última execução do pipeline** card com:
    - tipo (`collect_hn`, `extract`, `generate`), iniciado em, duração, items_in/items_out, custo, status.
    - botão pequeno **Ver execução** → `/runs/[id]`.
  - **Top 5 ideias do ranking atual** mini-lista (nome, product_type, score chip).
- **Linha 3:**
  - **Atividade recente (timeline 10 itens):** mistura de runs + ideias geradas + ações do operador (apenas as que existirem em `feedback`).
  - **Alertas:** se houver `cost_budgets.status` em warning/auto_stopped/hard_stopped, mostrar banner persistente no topo do conteúdo.
- **Estados:**
  - empty (sem dado): "Nenhum dado ainda. As coletas rodam segundas e quintas."
  - over-budget: banner vermelho discreto.
- **Não inventar:** sem gráfico de série temporal por hora; só métricas que casam com schema.

### 12.3 Ranking (`/ranking`)

- **Objetivo:** lista priorizada de até 30 ideias do ranking principal.
- **Tabs no header:**
  - `Top 30` (default): `is_filtered_out=false`, `status='generated'` ou `status IN ('promising')`, ordem `total_score DESC`.
  - `Promissoras`: `status='promising'`.
  - `Aprovadas`: `status='approved'`.
  - `Rejeitadas`: `status='rejected'`.
  - `Snooze`: `status='snoozed'` (se existir snooze; veja Gap 1 abaixo).
- **Filter bar:** status, fonte, score mínimo (slider 0–1), idioma, product_type, busca por nome/pain.
- **Tabela:**
  - colunas: **Ideia** (nome + audience curta), **Tipo**, **Idioma**, **Score** (chip + barra), **Fonte** (cluster → 1ª source via `idea_signals → signals → raw_items → sources`), **Gerada em**, **Ações** (kebab).
  - Click na linha → `/ideias/[id]`.
  - Kebab ações: aprovar, rejeitar, marcar promissora, adiar, copiar link.
- **Estados:** loading, empty (`Sem ideias geradas para os filtros atuais`), error.

> **Gap 1 (snooze):** o schema atual não tem `snoozed_until`. O brief deve mostrar a UI de snooze; a implementação do agent 6 deve registrar a ação como `feedback.action='snooze' + note` e marcar `ideas.status='snoozed'`. Sem coluna `snoozed_until`, a expiração do snooze fica como **débito conhecido** e não é processada automaticamente em F3.

### 12.4 Detalhe da Ideia (`/ideias/[id]`)

- **Objetivo:** decisão informada por evidência.
- **Hero da página:**
  - Nome da ideia (h1), product_type chip, language chip, score chip grande, status pill.
  - Ações primárias à direita: **Aprovar**, **Rejeitar**, **Promissora**, **Adiar 30d**, **Adicionar nota**.
- **Bloco 1 — Resumo:**
  - **Dor detectada** (`pain`).
  - **Audiência** (`audience`).
  - **Promessa** (`promise`).
  - **MVP sugerido** (`mvp`).
  - **Canal** (`channel`).
  - **Monetização** chip.
- **Bloco 2 — Sinais (evidência clicável):**
  - Lista de `idea_signals` → `signals` → `raw_items` com:
    - `evidence_quote` em itálico, autor (`author_handle`), idioma, posted_at.
    - link “Ver fonte” → abre `raw_items.url` em nova aba.
- **Bloco 3 — Subscores (JSON viewer + barras):**
  - Cada subscore `0..1` com mini-barra. Pesos vindos de `weights` (read-only).
  - `category_bonus` mostrado separado se aplicado.
- **Bloco 4 — Cluster:**
  - Card link para `/clusters/[id]` mostrando label, summary, coherence_score.
- **Bloco 5 — Brief MVP:**
  - Se `briefs` existe para essa idea: card com resumo + botão **Abrir brief** → `/brief/[ideaId]`.
  - Se `ideas.status !== 'approved'`: empty state **"Brief disponível somente após aprovação."**
  - Se aprovada mas sem brief: card com **Gerar brief** desabilitado em F3 com tooltip **"Geração de brief sob demanda chega em F4."**
- **Bloco 6 — Histórico de ações (`feedback`):**
  - Timeline com ação, nota, data, user.

### 12.5 Filtradas (`/filtradas`)

- **Objetivo:** auditar ideias removidas pelo blacklist.
- **Filter bar:** motivo (blacklist_tag), fonte, idioma.
- **Tabela:**
  - colunas: **Ideia**, **Motivo** (tags chips), **Fonte**, **Idioma**, **Gerada em**, **Ações** (kebab).
  - Kebab: **Reverter para ranking principal (com nota)**, **Ver detalhe**.
- **Confirmação de reversão:** modal com `textarea` obrigatório de motivo + botão `Reverter`.

> **Gap 2 (reversão):** `ideas.is_filtered_out` é coluna gerada a partir de `blacklist_tags`. Para reverter sem alterar `blacklist_tags`, agent 6 precisa registrar reversão em `feedback` (ex.: `action='unfilter_override' + note`) e a tela passa a tratar override como **filtro de UI** (mostrar item no ranking principal mesmo com tag). **Nada de migration.** Documentar como débito.

### 12.6 Sinais (`/sinais`)

- **Objetivo:** explorar `signals` para debugar o pipeline.
- **Filter bar:** status (`pending`/`processed`/`noise`), idioma, blacklist on/off, fonte, busca em `title`/`body`.
- **Tabela:**
  - colunas: **Título**, **Idioma**, **Fonte**, **Score B2C** (`relevance_b2c`), **Strength**, **Status**, **Postado em**, **Ações** (kebab).
- **Drawer detalhe ao click:** title, body, evidence quote, raw_payload (JSON viewer), link raw_items.url.

### 12.7 Clusters (`/clusters`)

- **Objetivo:** ver agrupamentos.
- **Layout 2 colunas:**
  - Esquerda 360 px: lista de clusters com label, coerência, contagem, has-ideas dot.
  - Direita: cluster selecionado com summary, common_pain, common_audience, topic_tags, lista de signals, lista de ideas geradas (links).
- **Filter bar (na lista):** coherence mínimo, com ideias / sem ideias.

### 12.8 Execuções / Runs (`/runs`)

- **Objetivo:** auditar pipeline.
- **Filter bar:** kind, status, triggered_by, intervalo de data.
- **Tabela:**
  - colunas: **Kind**, **Status** (pill), **Iniciado em**, **Duração**, **Items in/out**, **Custo USD**, **Trigger**, **Ações** (kebab → ver log).
- **Drawer log ao click:**
  - Header da run.
  - Lista de `ai_usage_logs` filtrados por `run_id` com operation, model, tokens, cost, latency.
  - Botão **Copiar JSON da run**.

### 12.9 Custos IA (`/custos`)

- **Objetivo:** controle financeiro de IA.
- **Linha 1:**
  - Stat card grande: **Mês corrente** com `current_spend_usd / monthly_budget_usd`, % e barra com 3 thresholds visíveis (80/90/100).
  - Stat cards: **Tokens in (mês)**, **Tokens out (mês)**, **Embeddings (mês)**, **Latência média**.
- **Linha 2 — Breakdown por operação:**
  - Tabela com cada `operation` (`extract`, `embedding`, `cluster_summary`, `idea_gen`, `filter_ai`, `brief`): contagem, custo, % do total.
- **Linha 3 — Últimas 50 chamadas (`ai_usage_logs`):**
  - Tabela compacta densa: created_at, operation, model, tokens_in, tokens_out, cost, latency_ms, status, prompt_version.
- **Banner persistente:** se `current_spend_usd / monthly_budget_usd ≥ 0.80`, mostrar banner com cor por threshold.

### 12.10 Fontes (`/fontes`)

- **Objetivo:** CRUD de `sources`.
- **Tabela:** name, kind, active, criada em, ações (editar, desativar/ativar).
- **Sheet/Drawer “Nova fonte” / “Editar fonte”:**
  - Inputs: name, kind (select fixo: `algolia-hn`, `product-hunt`, `rss`, `apple-rss`, `stack-exchange`, `manual`).
  - `config_json` com editor compacto (campos por kind quando possível, fallback para textarea JSON).
  - Toggle `active`.

> Observação: em F3 só `algolia-hn` está realmente em produção. A UI deve permitir CRUD de outras fontes mas a coleta delas só será ativada em fases futuras sob aprovação.

### 12.11 Pesos (`/pesos`)

- **Objetivo:** editar `weights` e recalcular scores on-demand.
- **Layout:**
  - Lista de pesos: `pain_clarity`, `b2c_fit`, `evidence_volume`, `signal_strength`, `audience_specificity`, `build_simplicity`, `distribution_potential`, `recency`, `support_low`, `lgpd_safety`, `category_bonus`, `cosine_threshold`.
  - Slider 0–1 + input number (3 casas).
  - Mostrar **soma dos pesos base** (deve ser 1.0). Aviso se ≠ 1.0.
- **Header:**
  - Botão **Restaurar defaults**.
  - Botão **Recalcular scores** (primário) com confirm modal: `Vai recalcular X ideias. Sem custo de IA.`
- **Estado:** loading do recálculo (progress).

### 12.12 Blacklist (`/blacklist`)

- **Objetivo:** CRUD de `blacklist_terms`.
- **Filter bar:** categoria, scope, language, active.
- **Tabela:** term, category, scope, language, match_kind, active.
- **Sheet form:** term, category (select com 16 categorias do PRD §6.1), scope (`all`/`signal`/`idea`), language (`all`/`pt`/`en`), match_kind (`keyword`/`regex`), active toggle.
- **Confirm de delete** com aviso: `Itens já marcados não são re-julgados automaticamente.`

### 12.13 Prompts (`/prompts`)

- **Objetivo:** ver prompts versionados (read-only).
- **Layout:**
  - Lista esquerda 320 px com `name + version` (P-EXT-001, P-FIL-001, P-CLU-001, P-IDE-001, P-BRF-001).
  - Direita: viewer com mono + botão **Copiar**.
- **Empty state se vazio:** explica que prompts são seedados em F2.
- **Sem edição na UI.** Pode existir botão **Sugerir nova versão** que apenas abre nova janela com texto explicativo `Crie versão 002 no repositório e seede via SQL preview.`

### 12.14 Brief MVP (`/brief/[ideaId]`)

- **Objetivo:** ver brief gerado para uma ideia aprovada.
- **Hero:** Nome da ideia, link voltar para detalhe, status `Brief gerado em ...` ou `Brief não gerado`.
- **Conteúdo (do `briefs` JSONB):**
  - **Objetivo do MVP**, **Hipótese**, **Audiência**, **Promessa**.
  - **Telas mínimas** (lista).
  - **Funcionalidades mínimas** (lista).
  - **Stack sugerida** (chips).
  - **Landing copy:** hero, subhero, bullets, CTA.
  - **Canais de teste** (chips).
  - **Métricas:** north_star, secondary, guardrails.
  - **Critérios de decisão:** kill / iterate / scale.
  - **Riscos técnicos** (lista).
  - **Custos de API** (texto).
  - **Limitações** (lista).
  - **Notas LGPD** (texto).
- **Ações:** **Copiar brief (JSON)**, **Copiar landing copy**.
- **Estado quando idea não está `approved`:** redirect para Detalhe.
- **Estado quando aprovada mas sem brief:** empty state com tooltip `Geração sob demanda chega em F4`.

### 12.15 Configurações (`/configuracoes`)

- **Objetivo:** ajustes de conta + ambiente (read-only quando vier de ENV).
- **Seções:**
  - **Conta operadora:** e-mail, último login, botão `Sair`.
  - **Ambiente** (read-only): `APP_BASE_URL`, modelos OpenAI configurados (sem expor key), `AI_MONTHLY_BUDGET_USD` corrente.
  - **Cron**: lista os 3 jobs configurados (`collect-hn`, `extract`, `generate`) com schedule e link para Vercel (placeholder externo).
  - **Sobre**: versão do projeto (lê do `package.json`), commit ativo (placeholder se ainda sem CI).
- **Aviso explícito:** *Para alterar variáveis de ambiente, use `.env.local` (dev) ou Vercel Environment (prod).*

---

## 13. Microinterações e responsividade

- **Microinterações:**
  - Botões: transição 120 ms ease-out em background/border.
  - Tabela hover: 80 ms.
  - Drawer abre em 200 ms slide-in.
  - Modal: fade 160 ms.
  - Skeleton shimmer: 1200 ms loop.
- **Sem animações decorativas.** Sem confete, sem easter egg.
- **Responsividade:**
  - ≥1280 px: shell completo (sidebar 240).
  - 1024–1279: sidebar 64 ícone-only com tooltip.
  - 768–1023: sidebar off-canvas, topbar com ícone hambúrguer.
  - <768: somente Login utilizável de forma decente. Outras telas com aviso `Painel otimizado para tablet/desktop`.

## 14. Acessibilidade

- Contraste mínimo AA em todo texto.
- Foco visível 2 px ring `accent.primary`.
- Labels reais em todos inputs.
- Ordem de foco lógica: sidebar → topbar → conteúdo.
- Navegação por teclado: `Tab`, `Shift+Tab`, `Enter`, `Esc` em modais.
- Live regions em toasts e em `aria-busy` durante loadings.
- Não usar **só cor** para transmitir status — sempre cor + ícone + texto.

## 15. Naming conventions no Figma

- **Frames de tela:** `screen/<area>/<name>` ex.: `screen/operacao/ranking`, `screen/sistema/configuracoes`.
- **Componentes:** `comp/<group>/<name>` ex.: `comp/button/primary`, `comp/table/row-default`.
- **Variants:** booleanos `state=hover`, `disabled=true`.
- **Tokens:** publicados em "Local Variables" no Figma com nomes idênticos aos desta seção (`bg.app`, `text.primary`, `radius.md`, etc.).
- **Auto Layout** obrigatório em components reutilizáveis.

## 16. Entregáveis esperados do Figma

Quando você terminar no Figma/Figma Make, o arquivo deve ter:

1. **Cover frame** com nome do produto, versão (`F3 v1`), data, link para este brief.
2. **Style guide page**:
   - Cores em swatches.
   - Tipografia escalada.
   - Espaçamento.
   - Sombras.
   - Iconografia base.
3. **Components page** com todos os componentes da seção 7 em grid, variants nomeados.
4. **Screens page** com as 15 frames listadas em §11.
5. **States page** mostrando para 5 telas chave (Dashboard, Ranking, Detalhe, Custos, Filtradas) os 4 estados (`loading`, `empty`, `error`, `loaded`).
6. **Navigation map** uma frame com diagrama da sidebar mostrando todas as rotas.
7. **Light theme** obrigatório. **Dark theme** opcional na v2.
8. **Tokens** (Local Variables) publicados.

## 17. Como o Agent 6 vai consumir o Figma

O Agent 6 (UI/UX Implementation Agent) usará **Figma MCP** para:

- Ler frames de tela e exportar layouts em árvore JSON.
- Ler tokens (Local Variables) e mapear para `globals.css` / `tailwind.config.ts` (ajustes apenas em CSS vars, sem mudar arquitetura).
- Mapear cada `screen/...` no Figma para a rota correspondente no Next.js App Router.
- Implementar com **Tailwind + shadcn/ui** (já presentes no repo) usando tokens CSS variables existentes onde possível.
- Validar visualmente com **Playwright MCP** ao final (rotas, navegação, console errors, responsivo).

> **Ações que o Agent 6 não vai fazer:** alterar schema, criar migration, mexer em pipeline, IA, cron, scoring, budget, secrets ou prompts versionados. Tudo o que não couber no schema atual deve ser tratado com empty state honesto e registrado como gap no handback.

---

## Apêndice A — Mapa schema → tela (referência rápida)

| Tela | Tabelas usadas |
|---|---|
| Dashboard | `runs`, `ideas`, `cost_budgets`, `ai_usage_logs`, `feedback` |
| Ranking | `ideas` (filtros por status, is_filtered_out=false), `clusters`, `idea_signals`, `signals`, `raw_items`, `sources` |
| Detalhe da Ideia | `ideas`, `idea_signals`, `signals`, `raw_items`, `clusters`, `weights`, `briefs`, `feedback` |
| Filtradas | `ideas` (is_filtered_out=true), `feedback` (override) |
| Sinais | `signals`, `raw_items`, `sources` |
| Clusters | `clusters`, `signal_cluster`, `signals`, `ideas` |
| Runs | `runs`, `ai_usage_logs` |
| Custos | `cost_budgets`, `ai_usage_logs` |
| Fontes | `sources` |
| Pesos | `weights` |
| Blacklist | `blacklist_terms` |
| Prompts | `prompts` |
| Brief MVP | `briefs`, `ideas` |
| Configurações | (read-only env + `package.json`) |

## Apêndice B — Gaps conhecidos (para o Figma incluir empty states honestos)

1. **Snooze sem `snoozed_until`** → status `snoozed` registrado, sem expiração automática. Mostrar tag `Em snooze` sem data de fim.
2. **Reversão de filtrada** → registrada em `feedback`; tag de blacklist permanece. Mostrar `Revertida manualmente` na linha original.
3. **Geração de Brief MVP sob demanda** → fica em F4. Em F3 só leitura.
4. **Filtro IA leve dinâmico** → não ajustável via UI nesta fase.
5. **Recalcular scores** → permitido (sem IA), recompute determinístico.
6. **Login social / signup** → fora do escopo. Apenas e-mail + senha existente.
7. **Multi-usuário / RBAC** → fora do escopo (D-05 single-operator).

## Apêndice C — Restrições proibidas

- Não desenhar visual marketplace, social, comunidade, gambling, crypto, dating, kids ou qualquer categoria do blacklist do PRD §6.1.
- Não desenhar mobile native screens.
- Não criar “onboarding” elaborado. O operador é único e treinado.
- Não criar branding pesado. Logo é só `GoMVP` em texto.
- Não criar página marketing/landing pública.

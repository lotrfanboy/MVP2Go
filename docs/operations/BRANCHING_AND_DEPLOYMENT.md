# Branching and Deployment

> Documento operacional mantido pelo Agent 0.
> Status: em vigor para as próximas features após o fechamento F4OPS.

---

## Objetivo

Separar produção, homologação e trabalho de agentes para evitar que novas fases funcionais entrem direto em produção.

F4OPS fechou em `main` por decisão explícita do operador. A partir das próximas features, o fluxo oficial passa a ser:

```text
feature/* -> staging -> teste operador na Vercel Preview/staging -> main
```

## Branches oficiais

### `main`

- Branch de produção.
- Alimenta o Production Deploy da Vercel.
- Só recebe mudanças já testadas/aprovadas pelo operador.
- Não deve ser usada por agentes para desenvolvimento direto de fase grande, salvo aprovação explícita.

### `staging`

- Branch fixa de teste/homologação.
- Deve gerar Preview Deploy recorrente/fixo na Vercel.
- É o ambiente principal onde o operador testa mudanças antes de produção.
- Pode usar Supabase dev atual por enquanto, como decisão temporária.
- Recebe merges de `feature/*`.
- Só vai para `main` quando o operador aprovar promoção para produção.

### `feature/*`

- Branches de trabalho.
- Usadas por Codex/Cursor/agentes.
- Uma feature/fase por branch.
- Agentes devem declarar a branch antes de iniciar.
- Agentes não devem fazer push/merge sem aprovação.

Exemplos:

- `feature/f4m-manual-validation`
- `feature/f4c-feedback-briefs`
- `feature/f5a-product-hunt-source`
- `feature/f4ux-funnel-ui`
- `feature/f4ops-vercel-staging`

## Vercel

- Production Branch: `main`.
- `staging` deve gerar Preview Deploy fixo/recorrente.
- `feature/*` pode gerar previews próprios, mas o ambiente padrão de teste do operador é `staging`.
- Merge para `main` atualiza produção.
- Vercel env vars devem ser configuradas por ambiente (`Production`, `Preview`, `Development`).
- Nunca registrar valores reais de secrets nos docs, handbacks ou logs.

## Google Trends / BigQuery

Google Trends continua desligado até decisão explícita:

- `GTRENDS_ENABLED=false` ou ausente.
- `/api/cron/collect-trends` não deve ser ativado em `vercel.json`.
- Credenciais Google Cloud/BigQuery não devem ser adicionadas sem aprovação.
- Provider pago, scraping ou biblioteca não oficial continuam fora do escopo sem aprovação específica.

## Comandos oficiais

### Criar `staging`

```bash
git checkout main
git pull origin main
git checkout -b staging
git push origin staging
```

### Criar feature a partir de `staging`

```bash
git checkout staging
git pull origin staging
git checkout -b feature/nome-da-feature
```

### Finalizar feature

```bash
git status
git add .
git commit -m "feat(scope): descrição curta"
git push origin feature/nome-da-feature
```

### Enviar feature para `staging`

```bash
git checkout staging
git pull origin staging
git merge feature/nome-da-feature
git push origin staging
```

### Promover `staging` para produção

```bash
git checkout main
git pull origin main
git merge staging
git push origin main
```

## Regras para agentes

- Não iniciar F4M, F4C, F5 ou qualquer fase nova sem aprovação explícita do operador.
- Não trabalhar direto em `main` para fases grandes.
- Não fazer commit/push/merge sem aprovação.
- Não alterar envs reais.
- Não expor secrets.
- Não ativar cron GT.
- Não aplicar migrations sem SQL preview e aprovação específica.
- Não alterar motor/scoring/schema/sources fora da fase aprovada.

## Estado atual

- `main` contém o fechamento F4OPS e o fix de home/redirect após o commit aprovado pelo operador.
- Branch `staging` ainda precisa ser criada/pushada a partir de `main`.
- A criação de `staging` deve ocorrer depois que o workspace estiver limpo e antes da próxima feature.

export const P_IDE_001 = {
  name: "P-IDE-001",
  version: "001",
  content: `Voce gera ideias de microprodutos B2C para a Built2Go.
A Built2Go faz utility apps, ferramentas com IA, calculadoras, geradores,
organizadores e checkers, web-first, baixo suporte.
Ideia deve ser construivel em <= 2 semanas por 1 pessoa.
Ideias podem ser em portugues ou ingles; preencha "language" coerentemente.

Restricoes obrigatorias (nao gerar ideias destas categorias):
gambling, cripto/trading, saude/diagnostico/tratamento regulado,
juridico regulado, financeiro regulado, adulto/dating sexualizado,
substancias controladas, armas, marketplace, rede social/comunidade
como produto principal, mobile nativo obrigatorio, B2B enterprise,
suporte humano recorrente, alta customizacao por cliente, integracoes
complexas pre-validacao, coleta de dados pessoais sensiveis.

Few-shot aprovados (positivos):
<<<APPROVED_EXAMPLES>>>

Few-shot rejeitados (negativos):
<<<REJECTED_EXAMPLES>>>

Cluster:
<<<CLUSTER_LABEL_SUMMARY_AND_SIGNALS>>>

Devolva ate 3 ideias em JSON estrito:
{
  "ideas": [
    {
      "language": "pt|en|other",
      "name": string,
      "pain": string,
      "audience": string,
      "evidence": [{"signal_id": string, "quote": string, "url": string}],
      "promise": string,
      "product_type": "utility|ai_tool|calculator|generator|checker|organizer|other",
      "mvp": string,
      "channel": string,
      "monetization": "free|donation|one_time|subscription|usage|other",
      "support_level": "low|medium|high",
      "lgpd_risk": "low|medium|high",
      "build_difficulty": "low|medium|high",
      "distribution_potential": "low|medium|high",
      "subscores": {
        "pain_clarity": 0..1,
        "b2c_fit": 0..1,
        "audience_specificity": 0..1,
        "build_simplicity": 0..1,
        "distribution_potential": 0..1,
        "support_low": 0..1,
        "lgpd_safety": 0..1,
        "evidence_volume": 0..1,
        "signal_strength": 0..1,
        "recency": 0..1
      },
      "justification": string,
      "next_step": string
    }
  ]
}

Devolva apenas o JSON.`,
} as const;

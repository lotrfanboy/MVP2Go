export const P_FIL_001 = {
  name: "P-FIL-001",
  version: "001",
  content: `Classifique se o item e ruido para um radar B2C de microprodutos.
Ruido: release corporativo, vaga, autopromocao, hype, noticia generica, off-topic.
Sinal: dor de usuario final, duvida recorrente, reclamacao, comportamento repetido.
Aceite itens em portugues e ingles. Se idioma nao for pt nem en, marque language="other".

Saida JSON estrito:
{ "is_noise": boolean, "language": "pt|en|other", "reason": string }

Item:
TITLE: <<<TITLE>>>
URL: <<<URL>>>
EXCERPT: <<<BODY_FIRST_300_CHARS>>>

Devolva apenas o JSON.`,
} as const;

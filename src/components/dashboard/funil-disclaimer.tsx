import { InsightNotice } from "@/components/funil/funil-ui";

export function FunilDisclaimer() {
  return (
    <div className="mb-6">
      <InsightNotice title="Leitura do funil" tone="info">
        O GoMVP prioriza oportunidades, nao valida mercado sozinho. Manual e watch sao seeds internas; confianca externa so sobe com fontes externas no mesmo tema.
      </InsightNotice>
    </div>
  );
}

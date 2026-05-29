/**
 * F4A orchestration entry points for LLM prompts (P-EVI / P-TRD / P-OPP).
 * Implementations live in `signal-to-evidence`, `trend-engine` (optional P-TRD), and `opportunity-score`.
 */
export { runSignalToEvidence } from "@/sources/hn/signal-to-evidence";
export { runLaunchabilityOppLlm } from "@/motor/opportunity-score";

import { P_BRF_001 } from "@/prompts/p_brf_001";
import { P_CLU_001 } from "@/prompts/p_clu_001";
import { P_EXT_001 } from "@/prompts/p_ext_001";
import { P_FIL_001 } from "@/prompts/p_fil_001";
import { P_IDE_001 } from "@/prompts/p_ide_001";
import { P_EVI_001 } from "@/prompts/p_evi_001";
import { P_OPP_001 } from "@/prompts/p_opp_001";
import { P_TRD_001 } from "@/prompts/p_trd_001";

export const PROMPT_DEFS = [
  P_EXT_001,
  P_FIL_001,
  P_CLU_001,
  P_IDE_001,
  P_BRF_001,
  P_EVI_001,
  P_TRD_001,
  P_OPP_001,
] as const;

export type PromptDef = (typeof PROMPT_DEFS)[number];

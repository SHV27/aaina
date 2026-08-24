/** The generation contract lives beside the serverless function, in
 *  `api/_contract.ts`, because Vercel transpiles `api/*.ts` in place and does
 *  not bundle imports from outside that directory — a cross-directory import
 *  here deploys as a module-not-found at runtime, which is exactly how it was
 *  found. Re-exported from here so application code imports it by meaning
 *  rather than by deployment mechanics, and so there is still one copy. */
export {
  SYSTEM_PROMPT,
  CLAIMS_SCHEMA,
  CRITIQUE_SCHEMA,
  verifyClaims,
  critiquePrompt,
} from "../../../api/_contract";
export type { RawClaim, VerifiedClaim, VerificationResult } from "../../../api/_contract";

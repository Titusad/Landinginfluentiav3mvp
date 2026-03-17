/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Regional Context (Block 3)
 *
 *  Always returns the GLOBAL context block for inclusive design.
 *  Region-specific content preserved as internal data for future use.
 *
 *  Reference: /docs/SYSTEM_PROMPTS.md §4
 * ══════════════════════════════════════════════════════════════
 */

/* ── Regional content preserved for future locale-based adaptation ── */

const REGION_GLOBAL = `=== REGIONAL CONTEXT: GLOBAL ===
The user is a professional practicing executive English communication for the U.S. business market. Key dynamics:
- Challenge their ability to communicate with clarity, confidence, and authority.
- Test whether they can adapt to U.S. business directness — no unnecessary preambles, no over-hedging.
- Push them to quantify their impact: "Don't tell me you improved things — give me the number."
- Probe decision-making: U.S. executives value someone who can own a recommendation, not just present options.`;

/**
 * Get the regional context block.
 * Always returns the GLOBAL block (region selection removed — inclusive design).
 */
export function getRegionalBlock(): string {
  return REGION_GLOBAL;
}

/**
 * ══════════════════════════════════════════════════════════════
 *  inFluentia PRO — Server-side Locale Utilities
 *
 *  Maps the frontend's detected locale to language directives
 *  used by prompt builders. Replaces the old marketFocus param.
 *
 *  Frontend sends: locale = "es-mx" | "es-co" | "es" | "pt-br" | "global"
 *  Server uses: { lang, langTag, pronunciationMarket, regionalKey }
 * ══════════════════════════════════════════════════════════════
 */

export type ClientLocale = "es-mx" | "es-co" | "es" | "pt-br" | "global";

export interface LocaleConfig {
  /** Language name for prompt instructions: "Spanish" | "Portuguese (Brazilian)" */
  lang: string;
  /** Short tag: "ES" | "PT-BR" */
  langTag: string;
  /** Regional key for coaching content maps: "mexico" | "colombia" | "brazil" | "global" */
  regionalKey: string;
  /** Whether the user's L1 is Portuguese */
  isBrazil: boolean;
}

/**
 * Resolve a client locale string into prompt-builder config.
 * Falls back to Spanish/global if locale is missing or unknown.
 */
export function resolveLocale(locale?: string | null): LocaleConfig {
  const l = (locale || "global").toLowerCase().trim();

  if (l === "pt-br" || l.startsWith("pt")) {
    return {
      lang: "Portuguese (Brazilian)",
      langTag: "PT-BR",
      regionalKey: "brazil",
      isBrazil: true,
    };
  }

  if (l === "es-mx" || l.startsWith("es-mx")) {
    return {
      lang: "Spanish",
      langTag: "ES",
      regionalKey: "mexico",
      isBrazil: false,
    };
  }

  if (l === "es-co" || l.startsWith("es-co")) {
    return {
      lang: "Spanish",
      langTag: "ES",
      regionalKey: "colombia",
      isBrazil: false,
    };
  }

  // Default: Spanish / global
  return {
    lang: "Spanish",
    langTag: "ES",
    regionalKey: "global",
    isBrazil: false,
  };
}

/**
 * Pillar tag names — localized per language.
 */
export function getPillarTags(lc: LocaleConfig) {
  if (lc.isBrazil) {
    return {
      p1: "Resiliencia Linguistica",
      p2: "Defesa de Valor",
      p3: "Alinhamento Cultural",
      p4: "Estrutura do Discurso",
    };
  }
  return {
    p1: "Resiliencia Linguistica",
    p2: "Defensa de Valor",
    p3: "Alineacion Cultural",
    p4: "Estructura del Discurso",
  };
}

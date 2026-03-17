# inFluentia PRO - System Prompts Architecture v2.0

> Documento de ingenieria de prompts para el "cerebro" de inFluentia PRO.
> Define los 7+ bloques del system prompt, perfiles de interlocutor, contexto regional,
> variante GPT-4o-mini, voice mapping, logica de sub-perfiles dinamicos, y Arena phase modulation.
> Referencia cruzada: MASTER_BLUEPRINT.md v5.0 §9
> Codigo fuente: `/src/services/prompts/` (assembler.ts, templates.ts, personas.ts, regions.ts, voice-map.ts, analyst.ts, tts-sync.ts)
> Actualizado: 4 marzo 2026

---

## Tabla de Contenidos

1. [Arquitectura de Bloques](#1-arquitectura-de-bloques)
2. [Bloque 1: Master System Prompt](#2-bloque-1-master-system-prompt)
3. [Bloque 2: Interlocutor Persona](#3-bloque-2-interlocutor-persona)
4. [Bloque 3: Regional Context](#4-bloque-3-regional-context)
5. [Bloque 4: User Scenario](#5-bloque-4-user-scenario)
6. [Bloque 4.5: Scenario Adaptation](#6-bloque-45-scenario-adaptation)
7. [Bloque 4.7: Strategy Pillars](#7-bloque-47-strategy-pillars)
8. [Bloque 5.5: TTS Text Optimization](#8-bloque-55-tts-text-optimization)
9. [Bloque 6: Output Format + Rules](#9-bloque-6-output-format)
10. [Bloque 6.5: Arena Phase Directive](#10-bloque-65-arena-phase-directive)
11. [Bloque 7: First Message](#11-bloque-7-first-message)
12. [GPT-4o-mini Variant (Free Users)](#12-variante-gpt-4o-mini)
13. [Voice Mapping](#13-voice-mapping)
14. [Dynamic Sub-Profile Activation](#14-sub-perfiles-dinamicos)
15. [Gemini Analyst Prompts](#15-gemini-analyst-prompts)
16. [Assembly Example](#16-assembly-example)
17. [Token Budget](#17-token-budget)

---

## 1. Arquitectura de Bloques

El system prompt se ensambla dinamicamente en la Edge Function `prepare-session`
concatenando bloques modulares. Cada bloque tiene variables inyectadas en runtime.

```
+───────────────────────────────────────────+
│  BLOCK 1:   MASTER SYSTEM PROMPT          │  ← Reglas base + edge cases + anti-patterns
│  BLOCK 2:   INTERLOCUTOR PERSONA          │  ← Perfil psicologico + dynamic behavior + sub-perfil
│  BLOCK 3:   REGIONAL CONTEXT              │  ← Mexico / Colombia / Brazil / Global
│  BLOCK 4:   USER SCENARIO                 │  ← {scenario} del PracticeWidget
│  BLOCK 4.5: SCENARIO ADAPTATION           │  ← sales / interview / csuite / negotiation / networking
│  BLOCK 4.7: STRATEGY PILLARS              │  ← From StrategyBuilder (pre-session coaching)
│  BLOCK 5:   EXTRACTED CONTEXT (optional)  │  ← Gemini Flash extrajo del PDF/URL
│  BLOCK 5.5: TTS TEXT OPTIMIZATION         │  ← Speech-friendly writing rules
│  BLOCK 6:   OUTPUT FORMAT + RULES         │  ← JSON + isComplete + pattern tracking
│  BLOCK 6.5: ARENA PHASE DIRECTIVE         │  ← support / guidance / challenge (dynamic difficulty)
│  BLOCK 7:   FIRST MESSAGE INSTRUCTION     │  ← Solo para prepare-session
+───────────────────────────────────────────+
```

**Variables de inyeccion** (resueltas por `prepare-session`):

| Variable              | Fuente                           | Ejemplo                                       |
| --------------------- | -------------------------------- | --------------------------------------------- |
| `{interlocutor}`      | PracticeSetupModal selection     | `"client"`, `"manager"`, `"recruiter"`, `"peer"` |
| `{market_focus}`      | profiles.market_focus            | `"mexico"`, `"colombia"`, `"brazil"`           |
| `{scenario}`          | User input (topic + context)     | `"Sales pitch for B2B SaaS platform..."`       |
| `{scenarioType}`      | PracticeSetupModal + auto-detect | `"sales"`, `"interview"`, `"csuite"`, `"negotiation"`, `"networking"` |
| `{extracted_context}` | Gemini 1.5 Flash (si hay archivo)| `"Key pain points: pricing concerns..."`       |
| `{sub_profile}`       | Keyword analysis del escenario   | `"NEGOTIATOR"`, `"LEADERSHIP"`, `null`         |
| `{arena_phase}`       | ArenaSystem state                | `"support"`, `"guidance"`, `"challenge"`       |
| `{strategy_pillars}`  | StrategyBuilder output           | Array of pillar objects                        |

---

## 2. Bloque 1: Master System Prompt

Nucleo inmutable. Define comportamiento base + edge case handling.

**Cambios v2.0:**
- Agregado `EDGE CASE HANDLING` para mensajes vacios, texto incoherente, requests de ayuda, jailbreak attempts, y tangentes off-topic.
- Agregado anti-pattern: no repetir signature phrases.
- Language Guard ahora menciona Portuguese explicitamente.

Ver: `/src/services/prompts/templates.ts` → `MASTER_SYSTEM_PROMPT`

**Tokens estimados**: ~450 tokens (+170 vs v1.0 por edge case handling)

---

## 3. Bloque 2: Interlocutor Persona

4 perfiles base + 2 sub-perfiles dinamicos.

**Cambios v2.0:**
- Todos los perfiles: agregado `DYNAMIC BEHAVIOR` (arco narrativo que reacciona al performance del user).
- Todos los perfiles: 5 signature phrases (vs 3) con instruccion de no repetir.
- Peer: perfil expandido para networking scenarios.
- Mini personas: incluyen dynamic behavior condensado.
- Sub-profiles: incluyen instrucciones de pattern tracking en internalAnalysis.

| Persona     | Activacion                 | Dynamic Behavior                                    |
| ----------- | -------------------------- | -------------------------------------------------- |
| Client      | `interlocutor = "client"`  | Engages if strong → impatient if vague              |
| Manager     | `interlocutor = "manager"` | Collaborative if ownership → pressure if excuses    |
| Recruiter   | `interlocutor = "recruiter"` | Warm if authentic → probing if rehearsed          |
| Peer        | `interlocutor = "peer"`    | Interested if clear pitch → exits if rambling       |

Ver: `/src/services/prompts/personas.ts`

**Tokens estimados per perfil**: ~220 tokens (+70 vs v1.0 por dynamic behavior + extra phrases)

---

## 4. Bloque 3: Regional Context

**Cambios v2.0:**
- Agregado contexto BRAZIL para mercado brasileño de nearshoring.
- GLOBAL fallback expandido (ya no es 1 linea).

| Market Focus | Contexto                                                      |
| ------------ | ------------------------------------------------------------- |
| `mexico`     | Autoridad, liderazgo, presencia ejecutiva, command-level comm |
| `colombia`   | Autonomia, timezone mgmt, justificar USD rates, async work    |
| `brazil`     | Directness vs context-building, hedging, tech ecosystem cred  |
| `null`       | Global: clarity, confidence, authority, quantify impact       |

Ver: `/src/services/prompts/regions.ts`

**Tokens estimados**: ~120 tokens (Brazil), ~100 tokens (Global expanded)

---

## 5-8. Bloques 4, 4.5, 4.7, 5, 5.5

Sin cambios significativos en v2.0 excepto:
- **Block 4.5 (Networking):** Removida la linea conflictiva "DO NOT spend more than 3-4 turns". Reemplazada por "PACING: Networking conversations are naturally brief (3-5 exchanges). Wrap up organically."
- **Block 5.5 (TTS):** Sin cambios. Ahora tambien se incluye condensado en el Mini template.

**ScenarioType expandido:** `"interview" | "sales" | "csuite" | "negotiation" | "networking"`

---

## 9. Bloque 6: Output Format + Rules

**Cambios v2.0:**
- `internalAnalysis` ahora requiere **CUMULATIVE PATTERN TRACKING** ademas de per-turn signals.
- Closure rules: excepcion explicita para networking (min 3 turns vs 4).
- Señales nuevas: tracking de arco de performance (mejorando vs empeorando).

Ver: `/src/services/prompts/templates.ts` → `OUTPUT_FORMAT_BLOCK`

**Tokens estimados**: ~400 tokens (+100 vs v1.0 por pattern tracking)

---

## 10. Bloque 6.5: Arena Phase Directive (NUEVO v2.0)

Inyectado dinamicamente por el assembler segun la fase actual del Arena.
Modula el nivel de dificultad de la IA sin cambiar la persona base.

| Phase       | Difficulty     | Behavior                                                |
| ----------- | -------------- | ------------------------------------------------------- |
| `support`   | Supportive     | Straightforward questions, space to develop, recovery   |
| `guidance`  | Guided         | Follow-ups, mild curveballs, one-level-deeper probing   |
| `challenge` | High Pressure  | Interruptions, skepticism, time constraints, silence    |

Ver: `/src/services/prompts/templates.ts` → `ARENA_PHASE_DIRECTIVES`

**Token estimados**: ~100 tokens per directive

---

## 11. Bloque 7: First Message

**Cambios v2.0:**
- Agregado ejemplo para Peer persona.

---

## 12. GPT-4o-mini Variant (Free Users)

**Cambios v2.0:**
- TTS rules incluidas inline (critical para calidad de audio).
- Edge case handling condensado (1 linea).
- Closure rules ahora incluyen networking exception.
- Arena phase: support y challenge aplicados en mini (guidance omitido para ahorrar tokens).

**Tokens del template mini**: ~300 tokens (+100 vs v1.0 por TTS + edge cases)

---

## 13. Voice Mapping

Sin cambios en v2.0. Ver `/src/services/prompts/voice-map.ts`.

| Interlocutor | Voice Profile | ElevenLabs Config Key |
| ------------ | ------------- | --------------------- |
| Client       | Masculine, authoritative | `ELEVENLABS_VOICE_CLIENT` |
| Manager      | Feminine, direct | `ELEVENLABS_VOICE_MANAGER` |
| Recruiter    | Analytical, probing | `ELEVENLABS_VOICE_RECRUITER` |
| Peer         | Casual, confident | `ELEVENLABS_VOICE_PEER` |

---

## 14. Dynamic Sub-Profile Activation

Sin cambios en logica de v2.0.
Keywords expandidos para incluir Portuguese (negociação, salário, etc.).
Ver `/src/services/prompts/personas.ts` → `detectSubProfile()`

---

## 15. Gemini Analyst Prompts (v2.0)

Tres prompts para Gemini 1.5 Flash. Todos en `/src/services/prompts/analyst.ts`.

### 15.1 Feedback Analyst (Screen 6) — `buildFeedbackAnalystPrompt()`

**Cambios v2.0:**
- Added PERFORMANCE ARC ANALYSIS: trajectory detection across the conversation.
- Added CUMULATIVE PATTERN detection from internalAnalysis notes.
- Added DATA SCARCITY HANDLING: adaptive quantity rules for short sessions.
- Brazil cultural directive added.

### 15.2 Script Generator (Screen 7) — `buildScriptGeneratorPrompt()`

**Cambios v2.0:**
- Added DOMAIN VOCABULARY PRESERVATION section.
- Adjusted word count: 250-450 words (vs 200-400), scaled by section count.
- Quality checklist: added domain vocabulary + section flow checks.

### 15.3 Pronunciation Coach (Screen 9) — `buildResultsSummaryPrompt()`

**Cambios v2.0:**
- Added DATA QUALITY AWARENESS: handling for low-confidence scores, sparse data, perfect scores, inconsistent scores.
- Added Brazil cultural directives for all 3 categories (Claridad, Ritmo, Entonación).
- Added Mexico + Colombia Claridad-specific directives.
- Adaptive pronounciation notes quantity based on data richness.

---

## 16. Assembly Example

Complete example for a paid user from Brazil, interlocutor = Client,
scenario about SaaS sales, no file uploaded, negotiation detected,
Arena phase = guidance:

```
[BLOCK 1: Master System Prompt - 450 tokens]
=== ROLE === ... === EDGE CASE HANDLING === ... === ANTI-PATTERNS ===

[BLOCK 2: Client Persona + NEGOTIATOR Sub-profile - 290 tokens]
=== YOUR PERSONA: THE SKEPTICAL CLIENT === ... DYNAMIC BEHAVIOR ... 
=== SUB-PROFILE: HARD NEGOTIATOR ===

[BLOCK 3: Brazil Context - 120 tokens]
=== REGIONAL CONTEXT: BRAZIL ===

[BLOCK 4: User Scenario - ~80 tokens]
=== SCENARIO === ...

[BLOCK 4.5: Sales Adaptation - ~120 tokens]
=== SCENARIO ADAPTATION: SALES ===

[BLOCK 5: OMITTED (no file)]

[BLOCK 5.5: TTS Optimization - ~200 tokens]
=== TTS-OPTIMIZED WRITING ===

[BLOCK 6: Output Format - 400 tokens]
=== OUTPUT FORMAT (MANDATORY) === ... CUMULATIVE PATTERNS ...

[BLOCK 6.5: Arena Phase - 100 tokens]
=== DIFFICULTY LEVEL: GUIDED CHALLENGE ===

[BLOCK 7: OMITTED (not first message)]
```

**Total estimado**: ~1,760 tokens (system prompt, first call with Block 7 adds ~180)
**Con Prompt Caching**: ~880 tokens after first turn (~50% savings)

---

## 17. Token Budget

### Per-turn cost analysis (GPT-4o paid user, v2.0 prompts)

| Component              | Tokens | Cost (GPT-4o) |
| ---------------------- | ------ | ------------- |
| System prompt (cached) | ~880   | ~$0.0022      |
| Conversation history   | ~200   | ~$0.0005      |
| User message           | ~50    | ~$0.0001      |
| AI response (output)   | ~120   | ~$0.0036      |
| **Total per turn**     | ~1,250 | **~$0.006**   |

### Per-session cost (assuming 6 turns average)

| Item               | Cost         |
| ------------------ | ------------ |
| GPT-4o (6 turns)   | ~$0.04       |
| ElevenLabs (6x)    | ~$0.06       |
| Azure STT (6x)     | ~$0.006      |
| Gemini Flash (3x)  | ~$0.002      |
| **Total/session**  | **~$0.11**   |

Still within the $0.15-0.30 target from Blueprint §11.

### GPT-4o-mini savings (free user, v2.0 prompts)

| Item                   | Cost (mini)  | vs GPT-4o |
| ---------------------- | ------------ | --------- |
| GPT-4o-mini (6 turns)  | ~$0.004      | -90%      |
| ElevenLabs (6x)        | ~$0.06       | same      |
| **Total/session**      | **~$0.07**   | -36%      |

---

## Changelog

| Version | Fecha         | Cambios                                                      |
| ------- | ------------- | ------------------------------------------------------------ |
| v1.0    | Feb 2026      | Initial: 7-Block Architecture, 3 personas, 2 sub-profiles,  |
|         |               | regional context, GPT-4o-mini variant, voice mapping,        |
|         |               | isComplete rules (4-8), English-only guard                   |
| v1.1    | Feb 2026      | Updated references, source paths, token budget analysis      |
| v2.0    | Mar 2026      | BREAKING: ScenarioType expanded (5 types), MarketFocus +Brazil |
|         |               | NEW: Edge case handling (Block 1), Arena Phase (Block 6.5),  |
|         |               | cumulative pattern tracking (Block 6), dynamic persona arcs  |
|         |               | (Block 2), networking closure fix, TTS in mini template,     |
|         |               | data scarcity handling (Feedback Analyst), domain vocabulary  |
|         |               | preservation (Script Generator), data quality awareness      |
|         |               | (Pronunciation Coach), Brazil regional + pronunciation       |

---

> **Este documento es complementario al MASTER_BLUEPRINT.md.**
> Los prompts en este archivo son la fuente de verdad para las Edge Functions.
> Codigo fuente: `/src/services/prompts/`

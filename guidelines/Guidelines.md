# inFluentia PRO — Guidelines para IA

> Documento de referencia para mantener consistencia, calidad y seguridad
> en todas las modificaciones de código generadas por IA.

---

## 1. Reglas Operacionales para la IA

### 1.1 Confirmar antes de modificar
- **SIEMPRE** confirmar el plan de cambios con el usuario antes de tocar código.
- Presentar: qué archivos se van a modificar, qué se va a agregar, qué se va a eliminar.
- Si hay ambiguedad en el request, preguntar antes de asumir.

### 1.2 Scope mínimo
- Editar **solo** los archivos necesarios para cumplir el request.
- No refactorizar código existente que funciona y no es parte del pedido.
- No renombrar variables, funciones o archivos sin que el usuario lo pida.

### 1.3 No romper lo que funciona
- No crear mocks/demo mode para evitar arreglar bugs del backend.
- No desconectar integraciones existentes (Supabase, OpenAI, Azure) sin autorización.
- Si un cambio requiere modificar más archivos de los esperados, informar al usuario.

### 1.4 Preservar la arquitectura
- **Routing**: hash-based routing (`#/dashboard`, `#/practice`, etc.) — no migrar a React Router sin autorización.
- **DevPreviewMenu**: mantener el dropdown flotante con sus 11+ estados de preview.
- **Locale pipeline**: respetar el flujo `locale-detect.ts` → payload API → `resolveLocale()` → prompt builders.
- **Service layer**: respetar la capa de abstracción `src/services/` con interfaces + adapters (mock/supabase).

### 1.5 Documentación de cambios
- Al finalizar un task, listar los archivos modificados/creados/eliminados.
- Si se introduce un patrón nuevo, documentarlo brevemente en el código con comentarios.

---

## 2. Design Styles Estandarizados

> **Regla de oro**: no usar colores, gradientes ni sombras inline. Usar los tokens
> de `theme.css` y las clases utilitarias definidas aquí.

### 2.1 Paleta semántica

| Token / Clase             | Uso                                          |
|---------------------------|----------------------------------------------|
| `bg-background`           | Fondo principal de la app                    |
| `text-foreground`         | Texto principal                              |
| `bg-card` / `text-card-foreground` | Cards y superficies elevadas        |
| `bg-muted` / `text-muted-foreground` | Fondos sutiles, texto secundario  |
| `bg-primary` / `text-primary-foreground` | CTAs principales, botones hero |
| `bg-secondary`            | Botones secundarios, badges neutros          |
| `bg-accent`               | Hover states, fondos de énfasis suave        |
| `bg-destructive`          | Errores, acciones peligrosas                 |

### 2.2 Gradientes de marca

Definir como clases reutilizables, **no inline**:

```
/* Hero / CTA gradient */
.gradient-hero        → from-indigo-600 via-purple-600 to-indigo-700
.gradient-hero-subtle → from-indigo-500/10 via-purple-500/10 to-transparent

/* Card accent */
.gradient-card-accent → from-indigo-50 to-purple-50

/* Success / Progress */
.gradient-success     → from-emerald-500 to-green-600

/* Score rings */
.gradient-score       → from-indigo-500 to-purple-500
```

### 2.3 Tipografia

- Respetar los defaults de `theme.css` (`h1`=2xl, `h2`=xl, `h3`=lg, `h4`=base).
- **Body text**: `text-base` (16px) o `text-sm` (14px) para contenido secundario.
- **Captions / hints**: `text-xs text-muted-foreground`.
- **Scores / metricas grandes**: `text-3xl font-bold` o `text-4xl font-bold`.
- No usar font-sizes arbitrarios (`text-[13px]`); usar la escala de Tailwind.

### 2.4 Espaciado y Layout

- **Page padding**: `px-4 sm:px-6 lg:px-8` (consistente en todas las paginas).
- **Card padding**: `p-4 sm:p-6`.
- **Gap entre secciones**: `space-y-6` o `gap-6`.
- **Gap entre elementos de card**: `space-y-3` o `gap-3`.
- **Max-width de contenido**: `max-w-4xl mx-auto` para paginas de lectura, `max-w-6xl` para dashboards.

### 2.5 Componentes shadcn/ui

- **Usar** `<Card>`, `<Badge>`, `<Button>`, `<Dialog>`, `<Tabs>` de `src/app/components/ui/` siempre que exista el componente.
- **No crear** divs custom que repliquen funcionalidad de componentes existentes.
- **Variantes de Button**: `default` (primary), `secondary`, `outline`, `ghost`, `destructive`.
- **Badges**: para estados, categorias, niveles — no usar `<span>` con clases manuales.

### 2.6 Estados visuales

| Estado      | Fondo                  | Texto                 | Borde                  |
|-------------|------------------------|-----------------------|------------------------|
| Success     | `bg-emerald-50`        | `text-emerald-700`    | `border-emerald-200`   |
| Warning     | `bg-amber-50`          | `text-amber-700`      | `border-amber-200`     |
| Error       | `bg-red-50`            | `text-red-700`        | `border-red-200`       |
| Info        | `bg-blue-50`           | `text-blue-700`       | `border-blue-200`      |
| Neutral     | `bg-muted`             | `text-muted-foreground` | `border-border`      |

### 2.7 Sombras y bordes

- **Cards elevadas**: `shadow-sm border border-border rounded-lg`.
- **Modales/dialogs**: `shadow-xl` (viene del componente Dialog).
- **Hover en cards interactivas**: `hover:shadow-md transition-shadow`.
- **No usar** `shadow-2xl` ni box-shadows custom inline.

---

## 3. Convenciones del Proyecto

### 3.1 Estructura de archivos

```
src/
  app/
    App.tsx                    ← Entrypoint, hash routing
    components/
      ui/                      ← shadcn/ui (no modificar sin necesidad)
      shared/                  ← Componentes compartidos (banners, screens)
      arena/                   ← Sistema Arena (BriefingRoom, etc.)
      figma/                   ← ImageWithFallback (protegido)
      *.tsx                    ← Feature components
    hooks/                     ← Custom hooks
    utils/                     ← Utilidades frontend
  services/
    interfaces/                ← Contratos/tipos
    adapters/
      mock/                    ← Mock data para DevPreview
      supabase/                ← Implementaciones reales
    locale-detect.ts           ← Deteccion silenciosa de idioma
    types.ts                   ← Tipos compartidos
  styles/
    theme.css                  ← Tokens, animaciones, base styles
    fonts.css                  ← Font imports (unico lugar)
    index.css / tailwind.css   ← Configuracion Tailwind

supabase/functions/server/
    index.tsx                  ← Hono server (23+ endpoints)
    kv_store.tsx               ← PROTEGIDO - no modificar
    locale-utils.ts            ← resolveLocale(), getLocaleDirective()
    *-prompt.ts                ← Prompt builders (5 archivos)
```

### 3.2 Naming conventions

- **Componentes**: PascalCase (`PracticeSessionPage.tsx`, `SessionReport.tsx`).
- **Hooks**: camelCase con prefijo `use` (`useMediaRecorder.ts`).
- **Utilidades**: camelCase (`sessionCache.ts`, `spacedRepetition.ts`).
- **Prompt builders**: kebab-case (`analyst-prompt.ts`, `summary-prompt.ts`).
- **Tipos/interfaces**: PascalCase, prefijo descriptivo (`PreBriefingPromptConfig`, `SessionData`).

### 3.3 Imports

- Componentes UI: `from "./components/ui/button"`.
- Componentes feature: `from "./components/ComponentName"`.
- Services: `from "../services/..."` o `from "../../services/..."`.
- Supabase info: `from '/utils/supabase/info'` (projectId, publicAnonKey).
- KV store (server): `from '/supabase/functions/server/kv_store'`.

### 3.4 Archivos protegidos (NUNCA modificar)

- `/src/app/components/figma/ImageWithFallback.tsx`
- `/supabase/functions/server/kv_store.tsx`
- `/utils/supabase/info.tsx`
- `/pnpm-lock.yaml`

---

## 4. Error Handling & Logging

### 4.1 Frontend

- **Toda llamada API** debe tener `try/catch` con logging contextual:
  ```ts
  try {
    const res = await fetch(...);
    if (!res.ok) throw new Error(`[PracticeSession] API error ${res.status}: ${await res.text()}`);
  } catch (err) {
    console.error(`[PracticeSession] Failed to generate script:`, err);
  }
  ```
- **Nunca** `catch () {}` vacios — siempre loguear.
- **ServiceErrorBanner**: para errores persistentes que bloquean el flujo.
- **Toast (sonner)**: para errores transitorios o confirmaciones.

### 4.2 Backend

- Cada endpoint debe devolver errores con detalle:
  ```ts
  return c.json({ error: `Authorization error while signing in: ${error.message}` }, 401);
  ```
- Logger activo: `app.use('*', logger(console.log))`.
- Errores de OpenAI/Azure deben incluir el status code y mensaje original.

---

## 5. Audio & Speech Pipeline

- **Grabacion**: usar exclusivamente el hook `useMediaRecorder`.
- **Formato**: enviar audio como `FormData` con MIME `audio/webm`.
- **TTS (Text-to-Speech)**: OpenAI TTS para shadowing y script narration.
- **Pronunciation Assessment**: Azure Speech — solo se activa cuando `LanguageBackground` fue detectado via `locale-detect.ts`.
- **No mezclar**: nunca llamar a Azure Speech y OpenAI TTS para el mismo proposito en el mismo flujo.

---

## 6. Animaciones

### Cuándo usar qué:

| Herramienta          | Uso                                                    |
|----------------------|--------------------------------------------------------|
| **Motion** (`motion/react`) | Transiciones de pagina, modales, elementos que persisten en DOM |
| **CSS animations** (`theme.css`) | Mount/unmount rapidos, waveforms, cursores parpadeantes |

- Las CSS animations en `theme.css` existen para evitar el error _"send was called before connect"_ de Motion en elementos que se montan/desmontan rapidamente.
- **No animar todo**: solo transiciones que mejoren la UX, no decorativas.
- Clases disponibles: `animate-fade-in`, `animate-cursor-blink`, `animate-waveform-bar`, `animate-eq-bar`, `animate-speaking-bar`, `animate-processing-bar`.

---

## 7. Locale Pipeline

### Flujo completo:

```
Browser (navigator.languages + timezone)
  → locale-detect.ts :: detectLanguageBackground()
    → PracticeSessionPage.tsx :: _detectedLocale (module-level)
      → Payload API { locale: "es" | "pt-BR" | null }
        → server/index.tsx :: extrae locale del body
          → resolveLocale(locale) en locale-utils.ts
            → Prompt builder genera directivas de idioma
              → GPT-4o responde con coaching en ES/PT-BR
```

### Reglas:

- El contenido que el usuario **practica** (highlights, phrases) siempre en **ingles**.
- Coaching notes, tooltips, suffixes, feedback narrativo → en **ES** o **PT-BR** segun locale.
- `resolveLocale()` retorna `{ lang, langTag, isBrazil, regionalKey }`.
- Para agregar un nuevo locale: actualizar `locale-utils.ts` → prompt builders → `locale-detect.ts`.

---

## 8. Seguridad

- **`SUPABASE_SERVICE_ROLE_KEY`**: jamas en frontend, solo en Edge Functions server-side.
- **Auth tokens**: `publicAnonKey` para rutas publicas; `access_token` del usuario para rutas protegidas.
- **API keys**: leer desde environment variables (`Deno.env.get()`), nunca hardcodear.
- **CORS**: el servidor Hono debe responder con headers CORS abiertos (importar de `npm:hono/cors`).

---

## 9. DevPreviewMenu & Mock Data

- **Proposito**: bypass de Google OAuth (no funciona en Figma Make) y salto a estados del flujo con mock data realista.
- **syntheticProfile()**: perfil de fallback cuando auth falla.
- **Usage gating**: bypassed en dev-preview.
- **Mock data**: debe ser realista y representativa (datos de entrevistas reales, scores coherentes), nunca "Lorem ipsum".
- **No enviar a produccion**: el menu solo debe aparecer en contexto dev/preview.

---

## 10. Performance

- **Deteccion de locale a nivel modulo** (no en cada render):
  ```ts
  const _detectedLocale = detectLanguageBackground(); // fuera del componente
  ```
- **Session cache** (`sessionCache.ts`): usar para evitar re-llamadas a GPT-4o durante una sesion activa.
- **useMemo / useCallback**: para calculos pesados o callbacks pasados como props, no para todo.
- **Lazy loading**: considerar para componentes pesados (SessionReport, charts) que no se muestran al inicio.

---

## 11. Accesibilidad

- **ARIA labels**: en todos los botones de accion, especialmente audio (record, play, stop, pause).
- **Keyboard navigation**: modales deben atrapar focus; ESC para cerrar.
- **Contraste**: respetar tokens del theme; no usar grises arbitrarios que no cumplan WCAG AA.
- **Focus visible**: no eliminar `outline` sin reemplazarlo con un indicador visual equivalente.
- **Textos alt**: toda imagen (Unsplash, SVG decorativo) debe tener `alt` descriptivo o `aria-hidden="true"`.

---

## 12. Dependencias & Packages

### Preferencias establecidas:

| Necesidad         | Package                  | Nota                                    |
|-------------------|--------------------------|-----------------------------------------|
| Iconos            | `lucide-react`           |                                         |
| Graficos/charts   | `recharts`               |                                         |
| Animaciones       | `motion` (`motion/react`)| Importar como `motion`, no "framer-motion" |
| Carousels         | `react-slick`            |                                         |
| Drag & drop       | `react-dnd`              |                                         |
| Masonry grids     | `react-responsive-masonry`|                                        |
| Toasts            | `sonner`                 | `import { toast } from "sonner"`        |

### Prohibidos en este entorno:

| Package             | Alternativa               |
|---------------------|---------------------------|
| `react-router-dom`  | `react-router`            |
| `konva` / `react-konva` | Canvas API directo    |
| `react-resizable`   | `re-resizable`            |

### Reglas:

- **Siempre verificar** `package.json` antes de instalar.
- **Instalar** via `install_package` antes de importar en codigo.
- **react-hook-form**: siempre version `7.55.0`.

---

## 13. Backend (Hono / Supabase Edge Functions)

### Reglas del servidor:

- Todos los endpoints prefijados con `/make-server-08b8658d`.
- CORS abierto: importar de `npm:hono/cors`.
- Logger: `app.use('*', logger(console.log))` — importar de `npm:hono/logger`.
- Imports externos: preferir `npm:` y `jsr:`.
- Node built-ins: siempre con `node:` specifier (`import process from "node:process"`).
- File writes: solo en `/tmp`.

### Base de datos:

- Tabla principal: `kv_store_08b8658d` — flexible para prototyping.
- Acceso via `kv_store.tsx`: `get`, `set`, `del`, `mget`, `mset`, `mdel`, `getByPrefix`.
- **No existe** funcion `list` — usar `getByPrefix` como alternativa.
- **No escribir** migraciones SQL ni DDL en archivos de codigo.

### Secrets disponibles:

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `AZURE_SPEECH_REGION`, `AZURE_SPEECH_KEY`

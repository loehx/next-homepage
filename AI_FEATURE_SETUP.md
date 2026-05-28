# AI Chat Feature - Setup & Reference

KI-Chat auf loehx.com via Cursor Cloud Agents API.

## Aktueller Status

- **Feature-Flag:** Der Chat-Input ist standardmäßig **ausgeblendet** und erscheint nur, wenn die Seite mit `?agent=true` aufgerufen wird (z. B. `https://loehx.com/?agent=true`).
- **Wissensbasis-Repo:** [`loehx/homepage-agent`](https://github.com/loehx/homepage-agent) (`main`-Branch). Initial gepushte Struktur mit Platzhaltern - der echte biografische Inhalt steht teilweise noch aus (siehe TODOs in `content/*.md`).
- **API-Plumbing:** End-to-end verifiziert. Smoke-Test (`./test-cursor-api.sh "Welche Skills hat Alex?"`) liefert valide JSON-Antwort, Run-Dauer ~12 s (+ ~30 s Cold-Start).

## Architektur

```
┌─────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│  Browser        │────▶│  Netlify Functions │────▶│  Cursor Cloud   │
│  StageInput.tsx │     │  (API-Key Hidden)  │     │  Agents API     │
└─────────────────┘     └────────────────────┘     └────────┬────────┘
                                                            │
                                                            ▼
                                                  ┌─────────────────┐
                                                  │  GitHub Repo    │
                                                  │  loehx/         │
                                                  │  homepage-agent │
                                                  └─────────────────┘
```

## Implementiert in diesem Repo

### Netlify Functions

- `netlify/functions/ai-health.ts` - prüft `CURSOR_API_KEY`, liefert `{ ok: true|false }`.
- `netlify/functions/ai-chat.ts` - Haupt-Endpoint (`prewarm` + `ask`).
- `netlify/functions/_cursor.ts` - Shared API-Helper.

### Frontend

- `src/contentParts/stage/StageInput.tsx` - Input mit Suggestions, Prewarming, Loading-States.
- `src/contentParts/stage/StageInput.module.css` - Styling im Window-Look.
- `src/contentParts/stage/index.tsx` - integriert `StageInput` + Answer-Overlay, **gated by `?agent=true`**.

### Netlify-Konfiguration

`netlify.toml`:

```toml
[build]
functions = "netlify/functions"

[[redirects]]
from = "/api/ai/*"
to = "/.netlify/functions/ai-:splat"
status = 200
```

## Cursor API - aktueller Vertrag

> Hinweis: Die v1-API erstellt seit Mai 2026 **Agent + initialer Run in einem
> einzigen Call**. Frühere Versionen dieser Dokumentation (mit `source` /
> `cloud`-Wrapper) sind ungültig.

### Agent + erster Run (POST `/v1/agents`)

```bash
curl -s -X POST https://api.cursor.com/v1/agents \
  -H "Authorization: Bearer $CURSOR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": { "text": "Welche Skills hat Alex?" },
    "model":  { "id": "composer-2.5" },
    "repos":  [{ "url": "https://github.com/loehx/homepage-agent" }]
  }'
```

Response:

```json
{
  "agent": { "id": "bc-...", "status": "ACTIVE", ... },
  "run":   { "id": "run-...", "status": "CREATING", ... }
}
```

### Run-Status pollen (GET `/v1/agents/{id}/runs/{runId}`)

Status-Werte (Uppercase): `CREATING` → `RUNNING` → `FINISHED` | `ERROR` | `CANCELLED` | `EXPIRED`. Der finale Text steht in `result`.

### Follow-up Run (POST `/v1/agents/{id}/runs`)

```bash
curl -s -X POST https://api.cursor.com/v1/agents/$AGENT_ID/runs \
  -H "Authorization: Bearer $CURSOR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{ "prompt": { "text": "Und welche Projekte?" } }'
```

> 409 `agent_busy` bei aktivem vorigem Run - in dem Fall vorigen Run zu Ende polln und retryen.

Volle Schema-Referenz: https://cursor.com/docs/cloud-agent/api/endpoints

## Smoke-Test

`./test-cursor-api.sh` lädt `CURSOR_API_KEY` aus `.env`, erstellt einen Agent, pollt den initialen Run und gibt das finale JSON aus.

```bash
# Default: fragt "Welche Skills hat Alex?" gegen loehx/homepage-agent
./test-cursor-api.sh

# Custom prompt
./test-cursor-api.sh "Was unterscheidet Alex von anderen Devs?"

# Anderes Repo / Branch / Modell
AGENT_REPO_URL=https://github.com/loehx/next-homepage \
  AGENT_REPO_REF=master \
  AGENT_MODEL=composer-2.5 \
  ./test-cursor-api.sh "Beschreibe dieses Repo in einem Satz."
```

## Deployment

### Cursor API-Key

1. https://cursor.com/dashboard → Integrations → API key erzeugen.
2. In `.env` (lokal) als `CURSOR_API_KEY=...`.

### GitHub-App-Berechtigung

Im Cursor-Dashboard prüfen, dass die Cursor-GitHub-App Zugriff auf `loehx/homepage-agent` hat. Per `GET /v1/repositories` testbar:

```bash
curl -s https://api.cursor.com/v1/repositories \
  -H "Authorization: Bearer $CURSOR_API_KEY"
```

`loehx/homepage-agent` muss in der Liste auftauchen.

### Netlify Environment Variables

| Variable          | Wert                                              | Pflicht?                    |
| ----------------- | ------------------------------------------------- | --------------------------- |
| `CURSOR_API_KEY`  | `crsr_...`                                        | **ja**                      |
| `AGENT_REPO_URL`  | `https://github.com/loehx/homepage-agent`         | nein (Default)              |
| `AGENT_REPO_REF`  | leer lassen (Default-Branch) oder z. B. `main`    | nein                        |
| `AGENT_MODEL`     | `composer-2.5`                                    | nein (Default)              |

### Lokal testen

```bash
netlify dev
curl -X POST http://localhost:8888/api/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{"mode":"ask","text":"Was macht Alex?"}'
```

Im Browser: http://localhost:8888/?agent=true

## Wissensbasis erweitern (loehx/homepage-agent)

Der Agent zieht bei jedem Run den aktuellen `main`-Stand. Kein Re-Deploy von `next-homepage` nötig bei reinen Content-Edits.

```
homepage-agent/
├── AGENTS.md                 # Aufgabe + JSON-Vertrag
├── .cursor/rules/persona.mdc # Format-/Persona-Guardrails
└── content/
    ├── about.md      # Person, Verfügbarkeit
    ├── skills.md     # Tech + Soft Skills
    ├── projects.md   # Projekte
    └── values.md     # Werte / Arbeitsweise
```

Alle Felder, die der Agent nicht aus `content/` belegen kann, beantwortet er ehrlich mit "steht aktuell nicht im Profil".

## Funktionsweise (Frontend)

### Mount

- `?agent=true` in URL? → ja: `StageInput` mounten. → nein: Original-Description bleibt, **keine** AI-Effekte (kein `/api/ai/health`-Ping, kein Prewarm).
- `StageInput` ruft `/api/ai/health` ab. Nur bei `{ok:true}` wird der Input gerendert.

### Prewarming

- Bei Fokus auf dem Input: `POST /api/ai/chat { mode: "prewarm" }`. Antwort enthält `agentId` → in `sessionStorage` cachen.
- Beim ersten echten Ask wird der gecachte Agent als Folge-Run benutzt (sofern bereits warm).

### Frage stellen

1. User klickt Vorschlag oder tippt + Enter.
2. `POST /api/ai/chat { mode: "ask", agentId?, text }`.
3. Server erstellt (falls nötig) Agent + Run, pollt bis `FINISHED`/`ERROR` oder Funktions-Timeout.
4. Antwort wird als JSON geparst; `answer` ersetzt die Description-Box, `suggestions` werden als neue Chips angezeigt.

### Cold-Start-Handling

Cursor-Cold-Start für ein neues VM ≈ 30-60 s. Netlify-Function-Timeout ≈ 10-26 s → die Function gibt ggf. `cold_start_timeout` zurück, das Frontend retryt automatisch mit der gleichen `agentId` (jetzt warm).

Optionale Optimierung (nicht implementiert): Edge Function mit SSE-Streaming gegen `/v1/agents/{id}/runs/{runId}/stream` für niedrigere Time-to-First-Token.

## API-Vertrag (intern, `/api/ai/chat`)

### Request

```json
{
  "mode": "ask",
  "agentId": "bc-...",
  "text": "Was macht Alex?"
}
```

### Response

```json
{
  "agentId": "bc-...",
  "runId":   "run-...",
  "answer":  "Alex ist ...",
  "suggestions": ["Welche Tools nutzt er?", "..."],
  "lang": "de",
  "isNewAgent": true
}
```

### Fehler

```json
{
  "error":     "cold_start_timeout" | "agent_error" | "cancelled" | "cursor_api_error" | "empty_response" | "internal_error",
  "message":   "...",
  "retryable": true,
  "agentId":   "bc-..."
}
```

## Sicherheit

- `CURSOR_API_KEY` bleibt server-side (Netlify Functions).
- CORS auf `*` in den Functions - der Key wird trotzdem nie ans Frontend ausgeliefert.
- Feature-Flag (`?agent=true`) **schützt nicht** vor missbräuchlicher Nutzung der Functions - wer die URL der Function kennt, kann sie direkt aufrufen. Bei Bedarf Rate-Limit / Origin-Check ergänzen.

## Troubleshooting

| Symptom                                                   | Ursache / Fix                                                                                       |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Input erscheint auch mit `?agent=true` nicht              | `/api/ai/health` liefert `{ok:false}` → `CURSOR_API_KEY` in Netlify-Env fehlt.                      |
| 401 von Cursor API                                        | Key falsch / abgelaufen.                                                                            |
| `Branch 'main' does not exist`                            | `AGENT_REPO_REF` zeigt auf nicht-existierenden Branch. Leer lassen → Default-Branch wird genutzt.   |
| `Git Repository is empty`                                 | Ziel-Repo hat noch keinen Commit. Mindestens einen Initial-Commit auf den Default-Branch pushen.    |
| Antwort kein valides JSON                                 | `.cursor/rules/persona.mdc` fehlt oder JSON-Vertrag in `AGENTS.md` unklar. Beides muss übereinstimmen. |
| Cold-Start-Timeout beim ersten Prompt                     | Erwartetes Verhalten. Frontend retryt mit gecachter `agentId`.                                      |

## Geänderte / neue Dateien

```
.gitignore                                # tsconfig.tsbuildinfo
netlify.toml                              # Functions-Verzeichnis + Redirect
test-cursor-api.sh                        # CLI Smoke-Test
netlify/functions/
├── _cursor.ts                            # Cursor API Helper
├── ai-health.ts                          # Health-Check
└── ai-chat.ts                            # Chat-Endpoint
src/contentParts/stage/
├── StageInput.tsx                        # Chat-Input
├── StageInput.module.css                 # Styling
├── index.tsx                             # ?agent=true Gating + Overlay-Integration
└── stage.module.css                      # Description-/Overlay-CSS
package.json + yarn.lock                  # @netlify/functions dependency
```

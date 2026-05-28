#!/bin/bash

# Cursor Cloud Agents API test script
# Usage:
#   ./test-cursor-api.sh                # loads CURSOR_API_KEY from .env if present
#   CURSOR_API_KEY="crsr_..." ./test-cursor-api.sh

set -e

# Auto-load .env (key=value pairs) if present and var not already exported
if [ -z "$CURSOR_API_KEY" ] && [ -f .env ]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
fi

if [ -z "$CURSOR_API_KEY" ]; then
    echo "Error: CURSOR_API_KEY not set (add it to .env or export it)"
    exit 1
fi

API="https://api.cursor.com/v1"
AUTH_HEADER="Authorization: Bearer $CURSOR_API_KEY"
REPO_URL="${AGENT_REPO_URL:-https://github.com/loehx/homepage-agent}"
REPO_REF="${AGENT_REPO_REF:-}" # optional - omit to use repo default branch
MODEL_ID="${AGENT_MODEL:-composer-2.5}"
PROMPT_TEXT="${1:-Welche Skills hat Alex?}"

jget() {
    # $1 = jq-style dotted path (no jq dependency, uses python3)
    python3 -c "
import sys, json
d = json.load(sys.stdin)
for key in '$1'.split('.'):
    if key.isdigit():
        d = d[int(key)]
    else:
        d = d.get(key) if isinstance(d, dict) else None
    if d is None:
        sys.exit(0)
print(d)
"
}

echo "=== Step 1: GET $API/models (connectivity check) ==="
curl -fsS -X GET "$API/models" -H "$AUTH_HEADER" \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
ids = [m['id'] for m in d.get('items', [])][:8]
print('OK - available models:', ', '.join(ids))
"

echo
echo "=== Step 2: POST $API/agents (creates agent + initial run in one call) ==="
echo "repo:   $REPO_URL${REPO_REF:+ @ $REPO_REF}"
echo "model:  $MODEL_ID"
echo "prompt: $PROMPT_TEXT"
echo

CREATE_BODY=$(REPO_REF="$REPO_REF" REPO_URL="$REPO_URL" MODEL_ID="$MODEL_ID" PROMPT_TEXT="$PROMPT_TEXT" python3 <<'PY'
import json, os
repo = {"url": os.environ["REPO_URL"]}
if os.environ.get("REPO_REF"):
    repo["startingRef"] = os.environ["REPO_REF"]
print(json.dumps({
    "prompt": {"text": os.environ["PROMPT_TEXT"]},
    "model": {"id": os.environ["MODEL_ID"]},
    "repos": [repo],
}))
PY
)

CREATE=$(curl -sS -X POST "$API/agents" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    -d "$CREATE_BODY")

AGENT_ID=$(echo "$CREATE" | jget "agent.id")
RUN_ID=$(echo "$CREATE" | jget "run.id")

if [ -z "$AGENT_ID" ] || [ -z "$RUN_ID" ]; then
    echo "Error: create failed"
    echo "$CREATE" | python3 -m json.tool 2>/dev/null || echo "$CREATE"
    exit 1
fi

echo "agent:    $AGENT_ID"
echo "run:      $RUN_ID"
echo "dashboard: https://cursor.com/agents/$AGENT_ID"

echo
echo "=== Step 3: Poll GET $API/agents/{id}/runs/{runId} until terminal ==="
MAX_POLLS=60
SLEEP_SECS=5
for i in $(seq 1 $MAX_POLLS); do
    RUN=$(curl -fsS -X GET "$API/agents/$AGENT_ID/runs/$RUN_ID" -H "$AUTH_HEADER")
    STATUS=$(echo "$RUN" | jget "status")
    printf "[%02d/%d] status=%s\n" "$i" "$MAX_POLLS" "$STATUS"
    case "$STATUS" in
        FINISHED | ERROR | CANCELLED | EXPIRED)
            break
            ;;
    esac
    sleep $SLEEP_SECS
done

echo
echo "=== Step 4: Final run payload ==="
echo "$RUN" | python3 -m json.tool

echo
echo "=== Done ==="
echo "Agent ID: $AGENT_ID"
echo "Run ID:   $RUN_ID"
echo "Open:     https://cursor.com/agents/$AGENT_ID"

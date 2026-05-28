// Shared helpers for the Cursor Cloud Agents API (v1).
// Reference: https://cursor.com/docs/cloud-agent/api/endpoints

const CURSOR_API_BASE = "https://api.cursor.com/v1";

export interface CreateAgentResponse {
  agentId: string;
  runId: string;
  status: RunStatus;
}

export interface CreateRunResponse {
  runId: string;
  status: RunStatus;
}

export type RunStatus =
  | "CREATING"
  | "RUNNING"
  | "FINISHED"
  | "ERROR"
  | "CANCELLED"
  | "EXPIRED";

export interface RunResult {
  status: RunStatus;
  result?: string;
  error?: string;
}

export class CursorError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = "CursorError";
  }
}

const TERMINAL_STATUSES: ReadonlySet<RunStatus> = new Set<RunStatus>([
  "FINISHED",
  "ERROR",
  "CANCELLED",
  "EXPIRED",
]);

function getApiKey(): string {
  const key = process.env.CURSOR_API_KEY;
  if (!key) {
    throw new CursorError("CURSOR_API_KEY not configured", 500, false);
  }
  return key;
}

function getRepoConfig() {
  return {
    url: process.env.AGENT_REPO_URL || "https://github.com/loehx/homepage-agent",
    // Empty string means "use the repo's default branch" (let Cursor pick).
    ref: process.env.AGENT_REPO_REF || "",
  };
}

function getModel() {
  return process.env.AGENT_MODEL || "composer-2.5";
}

function isRetryableHttp(status: number): boolean {
  return status >= 500 || status === 429;
}

/**
 * Creates a Cloud Agent and enqueues its first run in a single call.
 *
 * The new /v1/agents endpoint always starts a run with the provided prompt.
 * For "prewarm" callers, pass a benign placeholder (default "Initialize").
 * For first-ask callers, pass the user's question directly to skip the
 * second round-trip.
 */
export async function createAgent(
  promptText: string = "Initialize"
): Promise<CreateAgentResponse> {
  const apiKey = getApiKey();
  const repo = getRepoConfig();
  const model = getModel();

  if (!repo.url) {
    throw new CursorError("AGENT_REPO_URL not configured", 500, false);
  }

  const repoEntry: { url: string; startingRef?: string } = { url: repo.url };
  if (repo.ref) {
    repoEntry.startingRef = repo.ref;
  }

  const response = await fetch(`${CURSOR_API_BASE}/agents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: { text: promptText },
      model: { id: model },
      repos: [repoEntry],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new CursorError(
      `Failed to create agent: ${response.status} ${errorText}`,
      response.status,
      isRetryableHttp(response.status)
    );
  }

  const data = await response.json();
  const agentId: string | undefined = data?.agent?.id;
  const runId: string | undefined = data?.run?.id;
  const status: RunStatus = (data?.run?.status as RunStatus) ?? "CREATING";

  if (!agentId || !runId) {
    throw new CursorError(
      `Unexpected create-agent response shape: ${JSON.stringify(data)}`,
      500,
      false
    );
  }

  return { agentId, runId, status };
}

/**
 * Sends a follow-up prompt to an existing agent.
 * Returns 409 agent_busy if the agent already has an active run; surfaces
 * that as a retryable CursorError so the caller can wait + retry.
 */
export async function createRun(
  agentId: string,
  text: string
): Promise<CreateRunResponse> {
  const apiKey = getApiKey();

  const response = await fetch(`${CURSOR_API_BASE}/agents/${agentId}/runs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: { text } }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    // 409 (agent_busy / run_not_cancellable) is recoverable by waiting.
    const retryable = isRetryableHttp(response.status) || response.status === 409;
    throw new CursorError(
      `Failed to create run: ${response.status} ${errorText}`,
      response.status,
      retryable
    );
  }

  const data = await response.json();
  const runId: string | undefined = data?.run?.id ?? data?.id;
  const status: RunStatus = (data?.run?.status as RunStatus) ?? "CREATING";

  if (!runId) {
    throw new CursorError(
      `Unexpected create-run response shape: ${JSON.stringify(data)}`,
      500,
      false
    );
  }

  return { runId, status };
}

export async function getRun(agentId: string, runId: string): Promise<RunResult> {
  const apiKey = getApiKey();

  const response = await fetch(
    `${CURSOR_API_BASE}/agents/${agentId}/runs/${runId}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new CursorError(
      `Failed to get run: ${response.status} ${errorText}`,
      response.status,
      isRetryableHttp(response.status)
    );
  }

  const data = await response.json();
  return {
    status: data.status as RunStatus,
    result: typeof data.result === "string" ? data.result : undefined,
    error: data.error?.message ?? (typeof data.error === "string" ? data.error : undefined),
  };
}

export async function pollRunUntilComplete(
  agentId: string,
  runId: string,
  options: { maxWaitMs?: number; pollIntervalMs?: number } = {}
): Promise<RunResult> {
  const { maxWaitMs = 25000, pollIntervalMs = 1000 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const result = await getRun(agentId, runId);

    if (TERMINAL_STATUSES.has(result.status)) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new CursorError(
    "Cold start timeout - agent is still initializing",
    504,
    true
  );
}

export interface ParsedResponse {
  answer: string;
  suggestions: string[];
  lang: string;
}

export function extractJsonFromResult(resultText: string): ParsedResponse {
  // Strip an optional ```json ... ``` code fence, then extract the first
  // JSON object found in the text.
  const codeBlockMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/);
  const jsonText = codeBlockMatch ? codeBlockMatch[1] : resultText;

  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new CursorError("No JSON object found in response", 500, false);
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (typeof parsed.answer !== "string") {
      throw new Error("Missing or invalid 'answer' field");
    }
    if (!Array.isArray(parsed.suggestions)) {
      throw new Error("Missing or invalid 'suggestions' field");
    }

    return {
      answer: parsed.answer,
      suggestions: parsed.suggestions.slice(0, 4).map(String),
      lang: typeof parsed.lang === "string" ? parsed.lang : "de",
    };
  } catch (e) {
    throw new CursorError(
      `Failed to parse JSON response: ${e instanceof Error ? e.message : String(e)}`,
      500,
      false
    );
  }
}

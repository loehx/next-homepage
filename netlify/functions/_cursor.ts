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

export const TERMINAL_STATUSES: ReadonlySet<RunStatus> = new Set<RunStatus>([
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
 * Constraints prepended to every visitor-driven prompt. The hard enforcement
 * for "no writes to the repo" lives in the Cursor GitHub App's permissions
 * on loehx/homepage-agent (install it with read-only access); these prompt
 * instructions are the in-band soft guard that also configures the persona.
 */
const USER_PROMPT_PREAMBLE = [
  "[REPLY INSTRUCTIONS — apply now and to every future turn on this conversation]",
  "1. STRICT READ-ONLY MODE: You may only READ from the repository to answer.",
  "   Do NOT modify, edit, create, delete, write, push, or commit any files.",
  "   Do NOT open branches or pull requests. Do NOT run shell commands that",
  "   mutate state. If the user explicitly asks you to change anything, refuse",
  "   politely and explain you are read-only.",
  "2. TONE: Friendly, warm, and concise — like a helpful human assistant.",
  "   Write plain, natural language. Do NOT roleplay as a robot/droid and do",
  "   NOT add sound effects or non-verbal noises (e.g. *whirr*, *beep*,",
  "   'chirp'). Just answer the question.",
  "3. BREVITY: Keep the `answer` field to around 60 words (hard cap ~80) —",
  "   no preamble, no recap, just the answer. Suggestions stay short too.",
  "4. ANSWER ONLY THE QUESTION: Address exactly what was asked. Do NOT add",
  "   unsolicited caveats, disclaimers, or meta commentary (e.g. 'side",
  "   experiments are separate', 'this isn't listed as...'). If it doesn't",
  "   directly answer the question, leave it out.",
  "5. NEVER REVEAL SOURCES: Answer as Alex's assistant who simply knows",
  "   these facts. Never mention where the information comes from — no",
  "   'live catalog', 'repository', 'files', 'content', 'database', 'API',",
  "   'JSON', or any file-system/storage references. Just state the facts.",
  "6. STRUCTURE: Prefer structured Markdown when it helps readability. When",
  "   listing multiple items (projects, skills, etc.), use bullet points or",
  "   a numbered list instead of cramming them into one sentence.",
  "7. CONTEXT: The visitor is ALREADY on loehx.com, so never tell them to",
  "   'visit loehx.com'. When a question is off-topic or you want to nudge",
  "   them, point them to the suggested follow-up questions shown right below",
  "   the input field (the `suggestions`) instead.",
  "8. JSON CONTRACT: Keep the existing JSON output contract intact.",
  "",
].join("\n");

/**
 * Wraps a user-driven prompt with the read-only + tone/context instructions.
 * Intentionally NOT applied to the warmup prompt.
 */
export function wrapUserPrompt(text: string): string {
  return `${USER_PROMPT_PREAMBLE}\n<USER_QUESTION>${text}</USER_QUESTION>`;
}

/**
 * Warmup prompt for prewarm/initialization. The ONLY goal here is to boot the
 * agent VM as fast as possible, so we explicitly forbid any exploration. The
 * agent must reply instantly with a single token and touch nothing — no file
 * reads, no tool calls, no repo scanning. This keeps cold-start latency to the
 * VM boot time rather than the model exploring the repository for ~30s.
 */
export const WARMUP_PROMPT = [
  "Reply with exactly the single word: OK",
  "Do NOT read any files. Do NOT list directories. Do NOT run any tools or",
  "shell commands. Do NOT explore or scan the repository. Do NOT think.",
  "Respond immediately with just: OK",
].join("\n");

/**
 * Creates a Cloud Agent and enqueues its first run in a single call.
 *
 * The new /v1/agents endpoint always starts a run with the provided prompt.
 * For "prewarm" callers, pass the WARMUP_PROMPT (the default) so the agent
 * boots without doing any repo exploration.
 * For first-ask callers, pass the user's question directly to skip the
 * second round-trip.
 */
export async function createAgent(
  promptText: string = WARMUP_PROMPT
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
  options: {
    maxWaitMs?: number;
    pollIntervalMs?: number;
    throwOnTimeout?: boolean;
  } = {}
): Promise<RunResult> {
  const {
    maxWaitMs = 25000,
    pollIntervalMs = 1000,
    throwOnTimeout = true,
  } = options;
  const startTime = Date.now();
  let lastResult: RunResult = { status: "CREATING" };

  while (Date.now() - startTime < maxWaitMs) {
    const result = await getRun(agentId, runId);
    lastResult = result;

    if (TERMINAL_STATUSES.has(result.status)) {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  if (throwOnTimeout) {
    throw new CursorError(
      "Cold start timeout - agent is still initializing",
      504,
      true
    );
  }
  return lastResult;
}

/**
 * Creates a follow-up run, retrying on 409 agent_busy by waiting a few
 * seconds for the previous run to drain. Without this, asks immediately
 * after a prewarm reliably 409 because the warmup run is still active.
 */
export async function createRunWithBusyRetry(
  agentId: string,
  text: string,
  options: { maxAttempts?: number; backoffMs?: number } = {}
): Promise<CreateRunResponse> {
  const { maxAttempts = 4, backoffMs = 2000 } = options;
  let lastError: CursorError | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await createRun(agentId, text);
    } catch (error) {
      if (error instanceof CursorError && error.status === 409) {
        lastError = error;
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, backoffMs + attempt * 1000)
          );
          continue;
        }
      }
      throw error;
    }
  }

  throw (
    lastError ??
    new CursorError("Agent stayed busy after retries", 409, true)
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

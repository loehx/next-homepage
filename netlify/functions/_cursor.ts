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
        public readonly retryable: boolean = false,
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
        url:
            process.env.AGENT_REPO_URL ||
            "https://github.com/loehx/homepage-agent",
        // Empty string means "use the repo's default branch" (let Cursor pick).
        ref: process.env.AGENT_REPO_REF || "",
    };
}

interface ModelSelection {
    id: string;
    params?: { id: string; value: string }[];
}

function getModel(): ModelSelection {
    return {
        id: process.env.AGENT_MODEL || "composer-2.5",
        params: [{ id: "fast", value: "true" }],
    };
}

function isRetryableHttp(status: number): boolean {
    return status >= 500 || status === 429;
}

/**
 * CRITICAL OUTPUT FORMAT - Overrides any other format instructions.
 *
 * You MUST respond in this EXACT two-part format — nothing else:
 *
 * Part 1: The user-facing answer as plain markdown (no code fences).
 *   - 1-6 short paragraphs
 *   - Always italicize "Alex" as *Alex* (including possessives: *Alex*'s)
 *   - This text is streamed live to the visitor
 *
 * Part 2: After ONE blank line, a single JSON object with ONLY suggestions:
 *
 *   {"suggestions":["...","..."]}
 *
 *   - suggestions: 2-4 items, max 60 chars each
 *   - NOTHING after the JSON object
 *   - NO prose before or after the JSON
 *   - NO markdown code fence around the JSON
 *
 * EXAMPLE RESPONSE:
 *
 * *Alex* is a freelance developer specializing in Vue.js and React. He
 * helps teams build fast, modern web applications.
 *
 * {"suggestions":["What does Alex do?","Book a free intro call?"]}
 */
const USER_PROMPT_PREAMBLE = [
    "[CRITICAL REPLY INSTRUCTIONS — These override any other format rules]",
    "",
    "You MUST respond in this EXACT two-part format — nothing else:",
    "",
    "Part 1: The user-facing answer as plain markdown (no code fences).",
    "- 1-6 short paragraphs",
    "- Always italicize 'Alex' as *Alex* (including possessives: *Alex*'s)",
    "- This text is streamed live to the visitor",
    "",
    "Part 2: After ONE blank line, a single JSON object with ONLY suggestions:",
    "",
    '  {"suggestions":["...","..."]}',
    "",
    "- suggestions: 2-4 items, max 60 chars each",
    "- NOTHING after the JSON object",
    "- NO prose before or after the JSON",
    "- NO markdown code fence around the JSON",
    "",
    "EXAMPLE RESPONSE:",
    "",
    "*Alex* is a freelance developer specializing in Vue.js and React. He",
    "helps teams build fast, modern web applications.",
    "",
    '{"suggestions":["What does Alex do?","Book a free intro call?"]}',
    "",
    "All other behavior (persona, tone, security, allowed sources, brevity)",
    "follows your AGENTS.md and .cursor/rules/persona.mdc — but THIS format",
    "is NON-NEGOTIABLE and takes precedence.",
    "",
].join("\n");

/**
 * Wraps a user-driven prompt with the read-only + tone/context instructions.
 * Intentionally NOT applied to the warmup prompt.
 *
 * When the visitor's browser locale is known it is passed along as plain
 * context. We deliberately do NOT tell the agent what to do with it — how to
 * use the locale (e.g. which language to answer in) is the agent's decision,
 * governed by the agent repo's persona/rules.
 */
export function wrapUserPrompt(text: string, locale?: string): string {
    const localeLine =
        locale && locale.trim()
            ? `[USER BROWSER LOCALE: ${locale.trim()}]\n`
            : "";
    return `${USER_PROMPT_PREAMBLE}\n${localeLine}<USER_QUESTION>${text}</USER_QUESTION>`;
}

/** Live project catalog — same URL documented in homepage-agent/AGENTS.md. */
export const PROJECTS_CATALOG_URL = "https://loehx.com/api/v1/projects.json";

/**
 * Warmup prompt for prewarm/initialization. While the VM boots, have the agent
 * read all knowledge files and fetch the live project catalog so it is primed
 * for the first question without paying that cost on the critical path.
 */
export const WARMUP_PROMPT = [
    "Warm up now so you are ready to answer questions about Alex:",
    "",
    "1. Read all knowledge files in this repository:",
    "   - AGENTS.md",
    "   - .cursor/rules/persona.mdc",
    "   - every *.md file in content/",
    "",
    "2. Fetch the live project catalog (authoritative client-work data):",
    `   curl -fsS --max-time 10 ${PROJECTS_CATALOG_URL}`,
    "",
    "Do not read any other files or run any other commands.",
    "After completing steps 1 and 2, reply with exactly the single word: OK",
].join("\n");

/**
 * Creates a Cloud Agent and enqueues its first run in a single call.
 *
 * The new /v1/agents endpoint always starts a run with the provided prompt.
 * For "prewarm" callers, pass the WARMUP_PROMPT (the default) so the agent
 * preloads all knowledge files and the live project catalog during boot.
 * For first-ask callers, pass the user's question directly to skip the
 * second round-trip.
 */
export async function createAgent(
    promptText: string = WARMUP_PROMPT,
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
            model,
            repos: [repoEntry],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new CursorError(
            `Failed to create agent: ${response.status} ${errorText}`,
            response.status,
            isRetryableHttp(response.status),
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
            false,
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
    text: string,
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
        const retryable =
            isRetryableHttp(response.status) || response.status === 409;
        throw new CursorError(
            `Failed to create run: ${response.status} ${errorText}`,
            response.status,
            retryable,
        );
    }

    const data = await response.json();
    const runId: string | undefined = data?.run?.id ?? data?.id;
    const status: RunStatus = (data?.run?.status as RunStatus) ?? "CREATING";

    if (!runId) {
        throw new CursorError(
            `Unexpected create-run response shape: ${JSON.stringify(data)}`,
            500,
            false,
        );
    }

    return { runId, status };
}

export async function getRun(
    agentId: string,
    runId: string,
): Promise<RunResult> {
    const apiKey = getApiKey();

    const response = await fetch(
        `${CURSOR_API_BASE}/agents/${agentId}/runs/${runId}`,
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        },
    );

    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new CursorError(
            `Failed to get run: ${response.status} ${errorText}`,
            response.status,
            isRetryableHttp(response.status),
        );
    }

    const data = await response.json();
    return {
        status: data.status as RunStatus,
        result: typeof data.result === "string" ? data.result : undefined,
        error:
            data.error?.message ??
            (typeof data.error === "string" ? data.error : undefined),
    };
}

export async function pollRunUntilComplete(
    agentId: string,
    runId: string,
    options: {
        maxWaitMs?: number;
        pollIntervalMs?: number;
        throwOnTimeout?: boolean;
    } = {},
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
            true,
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
    options: { maxAttempts?: number; backoffMs?: number } = {},
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
                        setTimeout(resolve, backoffMs + attempt * 1000),
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
}

export interface SplitMeta {
    suggestions: string[];
}

/**
 * Splits the full streamed text into the user-facing answer and metadata.
 * Scans for the LAST occurrence of "\n\n{" — everything before is the answer,
 * the JSON block after is the metadata. This is robust against braces inside
 * the answer body.
 *
 * Falls back to the old full-JSON format for backward compatibility.
 * If no JSON is found at all, returns the full text as the answer with empty suggestions.
 */
export function splitAnswerAndMeta(fullText: string): ParsedResponse {
    const trimmed = fullText.trim();

    // Find the LAST "\n\n{" to handle cases where the answer itself contains braces
    let splitIndex = -1;
    let searchFrom = trimmed.length;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const idx = trimmed.lastIndexOf("\n\n{", searchFrom);
        if (idx === -1) break;
        // Check if what follows is valid JSON
        const jsonPart = trimmed.slice(idx + 2); // skip "\n\n"
        try {
            const parsed = JSON.parse(jsonPart);
            if (parsed && typeof parsed === "object") {
                splitIndex = idx;
                break;
            }
        } catch {
            // Not valid JSON, continue searching earlier
            searchFrom = idx - 1;
        }
    }

    if (splitIndex !== -1) {
        const answer = trimmed.slice(0, splitIndex).trim();
        const jsonText = trimmed.slice(splitIndex + 2);
        try {
            const meta: Partial<SplitMeta> = JSON.parse(jsonText);
            return {
                answer,
                suggestions: Array.isArray(meta.suggestions)
                    ? meta.suggestions.slice(0, 4).map(String)
                    : [],
            };
        } catch {
            // JSON parsing failed despite our check, fall through
        }
    }

    // Backward compatibility: try parsing the entire text as the old format
    // { "answer": "...", "suggestions": [...], "lang": "..." }
    const codeBlockMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonText = codeBlockMatch ? codeBlockMatch[1] : trimmed;

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        // No JSON found at all - treat entire text as the answer
        // This handles cases where the agent returns plain text without metadata
        console.log(
            "[ai-chat] No JSON metadata found, treating as plain text answer. " +
                "Preview:",
            trimmed.slice(0, 200),
        );
        return {
            answer: trimmed,
            suggestions: [],
        };
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
        };
    } catch (e) {
        throw new CursorError(
            `Failed to parse JSON response: ${
                e instanceof Error ? e.message : String(e)
            }`,
            500,
            false,
        );
    }
}

/**
 * Legacy wrapper — delegates to splitAnswerAndMeta for backward compatibility.
 * @deprecated Use splitAnswerAndMeta directly for new code.
 */
export function extractJsonFromResult(resultText: string): ParsedResponse {
    return splitAnswerAndMeta(resultText);
}

/** SSE event types from Cursor's streaming endpoint */
export type CursorStreamEvent =
    | { type: "status"; runId: string; status: RunStatus }
    | { type: "assistant"; text: string }
    | { type: "thinking"; text: string }
    | {
          type: "tool_call";
          callId: string;
          name: string;
          status: "running" | "completed";
          args?: unknown;
          result?: unknown;
          truncated?: { args?: true; result?: true };
      }
    | {
          type: "result";
          runId: string;
          status: RunStatus;
          text?: string;
          durationMs?: number;
          git?: unknown;
      }
    | { type: "error"; code: string; message: string }
    | { type: "done" }
    | { type: "heartbeat" };

/** Options for streamRun callback */
export interface StreamRunCallbacks {
    onEvent: (event: CursorStreamEvent) => void | Promise<void>;
    onError?: (error: Error) => void;
}

/**
 * Streams a run from the Cursor Cloud Agents API using Server-Sent Events.
 * Reads from GET /v1/agents/{agentId}/runs/{runId}/stream and dispatches
 * events via the callbacks.
 *
 * The stream emits:
 * - status: run status updates
 * - assistant: text deltas (the answer being generated)
 * - thinking: thinking deltas (optional)
 * - tool_call: tool execution updates
 * - result: terminal run status with final text
 * - done: stream complete
 * - error: stream error
 */
export async function streamRun(
    agentId: string,
    runId: string,
    callbacks: StreamRunCallbacks,
): Promise<void> {
    const apiKey = getApiKey();
    const url = `${CURSOR_API_BASE}/agents/${agentId}/runs/${runId}/stream`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "text/event-stream",
        },
    });

    if (!response.ok) {
        throw new CursorError(
            `Failed to start stream: ${response.status} ${response.statusText}`,
            response.status,
            isRetryableHttp(response.status),
        );
    }

    if (!response.body) {
        throw new CursorError("No response body from stream", 500, false);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    // SSE parsing state
    let buffer = "";
    let currentEvent: { event?: string; id?: string; data?: string } = {};

    try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            // Keep the last incomplete line in buffer
            buffer = lines.pop() ?? "";

            for (const line of lines) {
                if (line.startsWith("event: ")) {
                    currentEvent.event = line.slice(7);
                } else if (line.startsWith("id: ")) {
                    currentEvent.id = line.slice(4);
                } else if (line.startsWith("data: ")) {
                    currentEvent.data = line.slice(6);
                } else if (line === "" && currentEvent.data !== undefined) {
                    // Dispatch the complete event
                    console.log("[streamRun] raw SSE event:", JSON.stringify(currentEvent));
                    const event = parseSseEvent(
                        currentEvent.event ?? "message",
                        currentEvent.data,
                    );
                    await callbacks.onEvent(event);
                    currentEvent = {};
                }
            }
        }

        // Process any remaining data in buffer
        if (buffer.trim()) {
            const lines = buffer.split("\n");
            for (const line of lines) {
                if (line.startsWith("event: ")) {
                    currentEvent.event = line.slice(7);
                } else if (line.startsWith("id: ")) {
                    currentEvent.id = line.slice(4);
                } else if (line.startsWith("data: ")) {
                    currentEvent.data = line.slice(6);
                } else if (line === "" && currentEvent.data !== undefined) {
                    const event = parseSseEvent(
                        currentEvent.event ?? "message",
                        currentEvent.data,
                    );
                    await callbacks.onEvent(event);
                    currentEvent = {};
                }
            }
        }
    } catch (error) {
        callbacks.onError?.(
            error instanceof Error ? error : new Error(String(error)),
        );
        throw error;
    } finally {
        reader.releaseLock();
    }
}

function parseSseEvent(eventName: string, data: string): CursorStreamEvent {
    switch (eventName) {
        case "status": {
            const parsed = JSON.parse(data);
            return {
                type: "status",
                runId: parsed.runId,
                status: parsed.status as RunStatus,
            };
        }
        case "assistant": {
            const parsed = JSON.parse(data);
            return { type: "assistant", text: parsed.text ?? "" };
        }
        case "thinking": {
            const parsed = JSON.parse(data);
            return { type: "thinking", text: parsed.text ?? "" };
        }
        case "tool_call": {
            const parsed = JSON.parse(data);
            return {
                type: "tool_call",
                callId: parsed.callId,
                name: parsed.name,
                status: parsed.status,
                args: parsed.args,
                result: parsed.result,
                truncated: parsed.truncated,
            };
        }
        case "result": {
            const parsed = JSON.parse(data);
            return {
                type: "result",
                runId: parsed.runId,
                status: parsed.status as RunStatus,
                text: parsed.text,
                durationMs: parsed.durationMs,
                git: parsed.git,
            };
        }
        case "error": {
            const parsed = JSON.parse(data);
            return {
                type: "error",
                code: parsed.code,
                message: parsed.message,
            };
        }
        case "done":
            return { type: "done" };
        case "heartbeat":
            return { type: "heartbeat" };
        default:
            // Unknown event type (e.g. interaction_update) — ignore safely
            return { type: "heartbeat" };
    }
}

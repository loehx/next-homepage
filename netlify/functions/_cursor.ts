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

function getModel() {
    return process.env.AGENT_MODEL || "composer-2.5";
}

function isRetryableHttp(status: number): boolean {
    return status >= 500 || status === 429;
}

/**
 * Constraints prepended to every visitor-driven prompt.
 *
 * Persona, tone, security, sources, and brevity all live in the agent repo
 * (loehx/homepage-agent: AGENTS.md + .cursor/rules/persona.mdc, applied on
 * every run). The only thing we re-assert here per turn is the JSON output
 * contract, since that's what this caller parses — see extractJsonFromResult.
 */
const USER_PROMPT_PREAMBLE = [
    "[REPLY INSTRUCTIONS — apply now and to every future turn on this conversation]",
    "Reply with EXACTLY ONE valid JSON object and nothing else — no prose before",
    "or after it, no markdown code fence around it — matching this shape:",
    '{ "answer": "<markdown>", "suggestions": ["...", "..."], "lang": "<iso>" }',
    "All other behavior (persona, tone, security, allowed sources, brevity) is",
    "defined in this repository's AGENTS.md and .cursor/rules/persona.mdc — follow",
    "those exactly.",
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

/**
 * The core knowledge files that drive almost every visitor answer. We preload
 * these during warmup so they are already in the agent's context window by the
 * time the first real question arrives — trading a slightly longer cold start
 * for a much faster (and better-grounded) first answer.
 */
export const WARMUP_FILES = [
    "AGENTS.md",
    ".cursor/rules/persona.mdc",
    "content/about.md",
    "content/skills.md",
    "content/projects.md",
    "content/values.md",
];

/**
 * Warmup prompt for prewarm/initialization. While the VM boots, have the agent
 * read the most important knowledge files so it is primed to answer the first
 * question without spending that time exploring the repo on the critical path.
 * It must NOT explore beyond these files, run shell commands, or write a long
 * reply — just read them and acknowledge with a single token.
 */
export const WARMUP_PROMPT = [
    "Read these files now so you are ready to answer questions about Alex:",
    ...WARMUP_FILES.map((f) => `- ${f}`),
    "Do NOT read any other files, list directories, run shell commands, or write",
    "anything. After reading those files, reply with exactly the single word: OK",
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
            model: { id: model },
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
            `Failed to parse JSON response: ${
                e instanceof Error ? e.message : String(e)
            }`,
            500,
            false,
        );
    }
}

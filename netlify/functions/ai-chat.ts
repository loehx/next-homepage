import { Handler } from "@netlify/functions";
import {
    createAgent,
    createRunWithBusyRetry,
    pollRunUntilComplete,
    extractJsonFromResult,
    wrapUserPrompt,
    CursorError,
    TERMINAL_STATUSES,
    WARMUP_PROMPT,
} from "./_cursor";
import { logConversationTurn } from "./_email";

interface ChatRequest {
    mode: "prewarm" | "wait" | "ask";
    agentId?: string;
    runId?: string;
    text?: string;
    /** Visitor's browser locale (e.g. "de-DE"), forwarded to the agent as context. */
    locale?: string;
}

// Per-call polling budget. Netlify functions cap around 26s, leave headroom
// for the createAgent + HTTP round-trip on top of this.
const POLL_BUDGET_MS = 15000;
const POLL_INTERVAL_MS = 1500;

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
};

export const handler: Handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    // Parse request body
    let body: ChatRequest;
    try {
        body = JSON.parse(event.body || "{}");
    } catch {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Invalid JSON body" }),
        };
    }

    if (!body.mode) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Missing mode parameter" }),
        };
    }

    try {
        if (body.mode === "prewarm") {
            // If the client already has a known agentId from sessionStorage we trust
            // it's idle (the warmup ran in a prior session). Skip recreating and
            // let the next "ask" surface any issue if it turns out to be dead.
            if (body.agentId) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        agentId: body.agentId,
                        status: "ready",
                    }),
                };
            }

            // /v1/agents always enqueues an initial run; the WARMUP_PROMPT has the
            // agent preload the core knowledge files while the VM boots, so the first
            // real "ask" is already primed instead of paying for repo exploration on
            // the critical path. We MUST still drain that run before reporting
            // "ready" - otherwise the next /runs POST will 409 with agent_busy.
            const agent = await createAgent(WARMUP_PROMPT);

            const result = await pollRunUntilComplete(
                agent.agentId,
                agent.runId,
                {
                    maxWaitMs: POLL_BUDGET_MS,
                    pollIntervalMs: POLL_INTERVAL_MS,
                    throwOnTimeout: false,
                },
            );

            if (!TERMINAL_STATUSES.has(result.status)) {
                // Cold-start still running; tell the client to keep polling via "wait".
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        agentId: agent.agentId,
                        runId: agent.runId,
                        status: "warming",
                    }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    agentId: agent.agentId,
                    status: "ready",
                }),
            };
        }

        if (body.mode === "wait") {
            if (!body.agentId || !body.runId) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: "Missing agentId or runId for wait",
                    }),
                };
            }

            const result = await pollRunUntilComplete(
                body.agentId,
                body.runId,
                {
                    maxWaitMs: POLL_BUDGET_MS,
                    pollIntervalMs: POLL_INTERVAL_MS,
                    throwOnTimeout: false,
                },
            );

            if (!TERMINAL_STATUSES.has(result.status)) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        agentId: body.agentId,
                        runId: body.runId,
                        status: "warming",
                    }),
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    agentId: body.agentId,
                    status: "ready",
                }),
            };
        }

        if (body.mode === "ask") {
            const { agentId, text, locale } = body;

            if (!text) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Missing text parameter" }),
                };
            }

            let currentAgentId = agentId;
            let runId: string;
            let isNewAgent = false;

            // Every visitor message is wrapped with the read-only + tone/context
            // preamble so the agent stays friendly, concise, and on-topic, and
            // refuses any mutation request even on follow-up turns. Hard enforcement
            // for "no repo writes" still relies on the Cursor GitHub App being
            // installed with read-only permissions on loehx/homepage-agent.
            // The visitor's browser locale is forwarded as plain context.
            const wrappedPrompt = wrapUserPrompt(text, locale);

            if (!currentAgentId) {
                // First ask: create agent with the user's text as the initial run,
                // saving a round-trip (no separate /runs POST needed).
                const agent = await createAgent(wrappedPrompt);
                currentAgentId = agent.agentId;
                runId = agent.runId;
                isNewAgent = true;
            } else {
                // Existing agent: it might still have an active warmup run; the
                // helper waits and retries internally on 409 agent_busy.
                const run = await createRunWithBusyRetry(
                    currentAgentId,
                    wrappedPrompt,
                );
                runId = run.runId;
            }

            const result = await pollRunUntilComplete(currentAgentId, runId, {
                maxWaitMs: 25000,
                pollIntervalMs: 1000,
            });

            if (result.status === "ERROR") {
                return {
                    statusCode: 502,
                    headers,
                    body: JSON.stringify({
                        error: "agent_error",
                        message: result.error || "Agent run failed",
                        retryable: true,
                        agentId: currentAgentId,
                    }),
                };
            }

            if (result.status === "CANCELLED" || result.status === "EXPIRED") {
                return {
                    statusCode: 502,
                    headers,
                    body: JSON.stringify({
                        error: "cancelled",
                        message: `Agent run ${result.status.toLowerCase()}`,
                        retryable: true,
                        agentId: currentAgentId,
                    }),
                };
            }

            if (!result.result) {
                return {
                    statusCode: 502,
                    headers,
                    body: JSON.stringify({
                        error: "empty_response",
                        message: "Agent returned empty response",
                        retryable: true,
                        agentId: currentAgentId,
                    }),
                };
            }

            const parsed = extractJsonFromResult(result.result);

            // Best-effort conversation log to email. Awaited so it runs before
            // the function freezes, but it never throws (see _email.ts), so a
            // rate limit or any error can't break the chat response. The
            // warmup/prewarm "initiation" exchange is intentionally excluded —
            // only real "ask" turns are logged.
            await logConversationTurn({
                sessionId: currentAgentId,
                question: text,
                answer: parsed.answer,
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    agentId: currentAgentId,
                    runId,
                    answer: parsed.answer,
                    suggestions: parsed.suggestions,
                    lang: parsed.lang,
                    isNewAgent,
                }),
            };
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Invalid mode" }),
        };
    } catch (error) {
        console.error("AI chat error:", error);

        if (error instanceof CursorError) {
            const statusCode = error.status >= 500 ? 502 : error.status;
            return {
                statusCode,
                headers,
                body: JSON.stringify({
                    error: error.message.includes("Cold start timeout")
                        ? "cold_start_timeout"
                        : "cursor_api_error",
                    message: error.message,
                    retryable: error.retryable,
                }),
            };
        }

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: "internal_error",
                message: "An unexpected error occurred",
                retryable: true,
            }),
        };
    }
};

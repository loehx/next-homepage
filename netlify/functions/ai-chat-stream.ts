// Streaming AI chat endpoint using Server-Sent Events.
// Proxies Cursor's run stream so the frontend receives text deltas live.
//
// Endpoint: POST /api/ai/chat-stream
// Response: text/event-stream with events: meta, delta, error, done

import type { Context } from "@netlify/functions";
import {
    createAgent,
    createRunWithBusyRetry,
    streamRun,
    CursorStreamEvent,
    splitAnswerAndMeta,
    wrapUserPrompt,
    CursorError,
} from "./_cursor";
import { scheduleConversationLog } from "./_email";
import { markAgentUsed } from "./_agentPool";
import {
    checkRateLimit,
    getAskLimit,
    getGeneralChatLimit,
    rateLimitHeaders,
} from "./_rateLimit";

interface StreamRequest {
    agentId?: string;
    text: string;
    locale?: string;
}

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SSE_HEADERS = {
    ...CORS_HEADERS,
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
};

/** Encode an SSE event for the wire. */
function sse(event: string, data: unknown, id?: string): string {
    let lines = "";
    if (id) lines += `id: ${id}\n`;
    lines += `event: ${event}\n`;
    lines += `data: ${JSON.stringify(data)}\n\n`;
    return lines;
}

/** Simple request wrapper that extracts client IP from headers. */
function getIpFromRequest(request: Request): string {
    const headers = request.headers;
    const nfIp = headers.get("x-nf-client-connection-ip");
    if (nfIp) return nfIp.trim();
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0]?.trim();
        if (first) return first;
    }
    const clientIp = headers.get("client-ip");
    if (clientIp) return clientIp.trim();
    return "unknown";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async (
    request: Request,
    _context: Context,
): Promise<Response> => {
    // Handle preflight
    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
    }

    const clientIp = getIpFromRequest(request);

    // General rate limit (all chat requests)
    const generalLimit = await checkRateLimit(
        "ai-chat",
        clientIp,
        getGeneralChatLimit(),
    );
    if (!generalLimit.allowed) {
        return new Response(
            JSON.stringify({
                error: "rate_limited",
                message:
                    "Too many requests. Please wait a moment and try again.",
                retryable: false,
            }),
            {
                status: 429,
                headers: {
                    ...CORS_HEADERS,
                    ...rateLimitHeaders(generalLimit),
                    "Content-Type": "application/json",
                },
            },
        );
    }

    // Ask rate limit (costly LLM calls)
    const askLimit = await checkRateLimit(
        "ai-chat-ask",
        clientIp,
        getAskLimit(),
    );
    if (!askLimit.allowed) {
        return new Response(
            JSON.stringify({
                error: "rate_limited",
                message:
                    "You are sending questions too quickly. Please wait a moment.",
                retryable: false,
            }),
            {
                status: 429,
                headers: {
                    ...CORS_HEADERS,
                    ...rateLimitHeaders(askLimit),
                    "Content-Type": "application/json",
                },
            },
        );
    }

    // Parse body
    let body: StreamRequest;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
    }

    if (!body.text?.trim()) {
        return new Response(
            JSON.stringify({ error: "Missing text parameter" }),
            {
                status: 400,
                headers: {
                    ...CORS_HEADERS,
                    "Content-Type": "application/json",
                },
            },
        );
    }

    const { text, locale } = body;
    let currentAgentId = body.agentId;
    let isNewAgent = false;

    // Set up the streaming response encoder
    const encoder = new TextEncoder();
    let accumulatedText = "";
    let runId: string;

    const stream = new ReadableStream({
        start(controller) {
            const send = (event: string, data: unknown) => {
                try {
                    controller.enqueue(encoder.encode(sse(event, data)));
                } catch {
                    // Controller may be closed; ignore
                }
            };

            const run = async () => {
                try {
                    const wrappedPrompt = wrapUserPrompt(text, locale);

                    if (!currentAgentId) {
                        const agent = await createAgent(wrappedPrompt);
                        currentAgentId = agent.agentId;
                        runId = agent.runId;
                        isNewAgent = true;
                    } else {
                        const run = await createRunWithBusyRetry(
                            currentAgentId,
                            wrappedPrompt,
                        );
                        runId = run.runId;
                    }

                    // Emit metadata immediately so client can persist agentId
                    send("meta", {
                        agentId: currentAgentId,
                        runId,
                        isNewAgent,
                    });

                    // Mark agent as used (conversation must stay private to this session)
                    await markAgentUsed(currentAgentId);

                    // Stream deltas from Cursor
                    await streamRun(currentAgentId, runId, {
                        onEvent: (event: CursorStreamEvent) => {
                            switch (event.type) {
                            case "assistant":
                                console.log("[ai-chat-stream] assistant delta:", JSON.stringify(event.text));
                                accumulatedText += event.text;
                                send("delta", { text: event.text });
                                break;
                            case "error":
                                console.log("[ai-chat-stream] error event:", event.code, event.message);
                                send("error", {
                                    code: event.code,
                                    message: event.message,
                                });
                                break;
                            case "result":
                                console.log("[ai-chat-stream] result event, text length:", event.text?.length ?? 0, "status:", event.status);
                                // Terminal result; final text may include metadata
                                // The delta stream already gave us the text, but
                                // the result.text has the complete final string.
                                accumulatedText = event.text ?? accumulatedText;
                                break;
                            case "done":
                                // Parse accumulated text for metadata
                                console.log(
                                    "[ai-chat-stream] Final accumulated text preview:",
                                    accumulatedText.slice(0, 300),
                                    "... (total length:",
                                    accumulatedText.length,
                                    ")",
                                );
                                try {
                                    const parsed = splitAnswerAndMeta(accumulatedText);
                                    send("done", {
                                        answer: parsed.answer,
                                        suggestions: parsed.suggestions,
                                    });
                                    // Fire-and-forget conversation log
                                    scheduleConversationLog({
                                        sessionId: currentAgentId,
                                        question: text,
                                        answer: parsed.answer,
                                        locale,
                                    });
                                } catch (parseError) {
                                    send("error", {
                                        code: "parse_error",
                                        message:
                                            parseError instanceof Error
                                                ? parseError.message
                                                : "Failed to parse response",
                                    });
                                }
                                controller.close();
                                break;
                            }
                        },
                    });
                } catch (error) {
                    const cursorError =
                        error instanceof CursorError
                            ? error
                            : new CursorError(
                                  error instanceof Error
                                      ? error.message
                                      : String(error),
                                  500,
                                  false,
                              );
                    send("error", {
                        code: cursorError.message.includes("Cold start timeout")
                            ? "cold_start_timeout"
                            : "cursor_api_error",
                        message: cursorError.message,
                        retryable: cursorError.retryable,
                    });
                    controller.close();
                }
            };

            // Kick off async work; errors handled inside
            void run();
        },
    });

    return new Response(stream, { headers: SSE_HEADERS });
};

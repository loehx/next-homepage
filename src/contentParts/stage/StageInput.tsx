import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "./StageInput.module.css";
import cx from "classnames";
import { isCoarsePointerDevice } from "src/hooks";

interface ChatResponse {
    agentId: string;
    runId: string;
    answer: string;
    suggestions: string[];
    lang: string;
    isNewAgent?: boolean;
}

interface ChatError {
    error: string;
    message: string;
    retryable: boolean;
}

type Status = "initializing" | "ready" | "loading" | "error";

interface StageInputProps {
    onQuestionSubmit?: (question: string) => void;
    onAnswer: (question: string, answer: string, suggestions: string[]) => void;
    /** If true, hides the "Ready when you are..." message (e.g., when an answer is being displayed) */
    hasActiveConversation?: boolean;
    /**
     * Emits the warmup "Hey agent, are you there?" exchange as markdown so the
     * parent can render it through the same Window/conversation component the
     * real chat uses. null once a real conversation takes over.
     */
    onWarmupTextChange?: (text: string | null) => void;
    /**
     * True once the warmup exchange is "answered" (agent ready, showing
     * "Yes, I'm here!"); false while it's still warming up. Lets the parent dim
     * the question blockquote the same way it does after a real answer.
     */
    onWarmupReadyChange?: (ready: boolean) => void;
}

// Suggestions are rendered as compact chips, so anything longer than this
// blows out the layout. We hard-cap them and drop any that don't fit.
const MAX_SUGGESTION_LENGTH = 40;

const sortSuggestionsByLength = (items: string[]): string[] =>
    [...items].sort((a, b) => b.trim().length - a.trim().length);

const capSuggestions = (items: string[]): string[] =>
    sortSuggestionsByLength(
        items.filter((s) => s.trim().length <= MAX_SUGGESTION_LENGTH),
    );

const DEFAULT_SUGGESTIONS = capSuggestions([
    "What is he working on right now?",
    "Can he support us in a project?",
    "Who is Alex?",
]);

const STORAGE_KEY = "aiAgentId";

const MAX_INPUT_LENGTH = 200;

// Rotated through the input placeholder while a request is in flight, so the
// user gets a sense of progress instead of staring at a single "Thinking…".
const LOADING_HINTS = [
    "Sending message to Cursor…",
    "Gathering information…",
    "Working on the answer…",
    "Finding follow-ups…",
    "Taking a little nap…",
    "Getting a coffee…",
    "Thinking about life…",
    "What's the meaning of it all?...",
    "Well, back to the question...",
    "I'm slow today...",
    "Now it becomes awkward...",
    "Sorry, I'm not feeling well...",
    "Could you repeat the question?",
    "... Just joking^^",
];
const LOADING_HINT_INTERVAL_MS = 4000;

// The agent greets the visitor like a sleepy person being woken up. While it
// warms up we cycle through these one-liners (~2s each), then swap in the
// "awake" line once initialization finishes.
const WARMUP_QUESTION = "Hey agent, are you there?";
const WARMUP_HINTS: { text: string; ms: number }[] = [
    { text: "(moaning)", ms: 4000 },
    { text: "What.. who is it?", ms: 2000 },
    { text: "(Yawning)", ms: 3000 },
    { text: "Oh boy, I need a coffee...", ms: 2000 },
    { text: "(slurping sounds)", ms: 4000 },
    { text: "Okay, gimme a second...", ms: 2000 },
    { text: "(typing sounds)", ms: 3000 },
    { text: "(silence)", ms: 2000 },
    { text: "(typing sounds)", ms: 5000 },
    { text: "(nothingness)", ms: 5000 },
];
const WARMUP_READY_ANSWER = "Yes, I'm here! What's up?";

export const StageInput: React.FC<StageInputProps> = ({
    onQuestionSubmit,
    onAnswer,
    hasActiveConversation = false,
    onWarmupTextChange,
    onWarmupReadyChange,
}: StageInputProps) => {
    const [status, setStatus] = useState<Status>("initializing");
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] =
        useState<string[]>(DEFAULT_SUGGESTIONS);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorRetryable, setErrorRetryable] = useState(true);
    const [loadingHintIndex, setLoadingHintIndex] = useState(0);
    const [warmupHintIndex, setWarmupHintIndex] = useState(0);
    // Set to true once the user focuses the input, so the suggestion items
    // play their staggered "wake up" highlight once and briefly draw the eye.
    const highlightTriggeredRef = useRef(false);
    const [highlighted, setHighlighted] = useState(false);
    // When the user submits before the agent has finished warming up, we hold
    // the message here and fire it off automatically once status flips to
    // "ready" (see the flush effect below).
    const [queuedMessage, setQueuedMessage] = useState<string | null>(null);
    const pendingMessageRef = useRef<string | null>(null);
    const agentIdRef = useRef<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Initialize: restore agentId from session storage (if any), prewarm the
    // agent, and keep polling via "wait" until the warmup run drains. The
    // server returns status: "warming" with a runId when the cold start hasn't
    // finished within its per-call budget; we then drive the wait loop from
    // here. Without this, an "ask" immediately after prewarm reliably 409s
    // with agent_busy because the warmup run is still active.
    const initialize = useCallback(async () => {
        const initStartedAt = Date.now();
        setStatus("initializing");
        setErrorMessage(null);
        setErrorRetryable(true);

        if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) agentIdRef.current = stored;
        }

        const callChat = async (payload: Record<string, unknown>) => {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData: ChatError = await response
                    .json()
                    .catch(() => ({
                        error: "unknown",
                        message: "Could not start the AI agent.",
                        retryable: true,
                    }));
                throw Object.assign(new Error(errorData.message), {
                    retryable: errorData.retryable ?? true,
                });
            }
            return response.json();
        };

        try {
            let data = await callChat({
                mode: "prewarm",
                agentId: agentIdRef.current,
            });

            if (data.agentId) {
                agentIdRef.current = data.agentId;
                if (typeof window !== "undefined") {
                    sessionStorage.setItem(STORAGE_KEY, data.agentId);
                }
            }

            // Cap total warmup time at ~6 wait cycles (~90s) to avoid pinning
            // the user in "Waking up..." forever on a stuck cold start.
            let waitAttempts = 0;
            while (data.status === "warming" && waitAttempts < 6) {
                waitAttempts++;
                data = await callChat({
                    mode: "wait",
                    agentId: data.agentId,
                    runId: data.runId,
                });
            }

            if (data.status !== "ready") {
                setErrorMessage(
                    "The AI agent is taking too long to start. Please try again.",
                );
                setErrorRetryable(true);
                setStatus("error");
                return;
            }

            const elapsedMs = Date.now() - initStartedAt;
            // eslint-disable-next-line no-console
            console.log(
                `[AI agent] initialized in ${(elapsedMs / 1000).toFixed(
                    2,
                )}s (${elapsedMs}ms)`,
            );

            setStatus("ready");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Could not reach the AI agent.";
            const retryable =
                error && typeof error === "object" && "retryable" in error
                    ? Boolean((error as { retryable?: boolean }).retryable)
                    : true;
            setErrorMessage(message);
            setErrorRetryable(retryable);
            setStatus("error");
        }
    }, []);

    useEffect(() => {
        initialize();
    }, [initialize]);

    // Autofocus on desktop only; on touch devices it can trigger page zoom.
    // We focus as soon as the input is visible (already during warmup) so the
    // user can start typing immediately.
    useEffect(() => {
        if (status !== "initializing" && status !== "ready") return;
        if (isCoarsePointerDevice()) return;
        inputRef.current?.focus();
    }, [status]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim()) return;

            onQuestionSubmit?.(text);
            setStatus("loading");
            setErrorMessage(null);
            setInputValue("");

            try {
                const response = await fetch("/api/ai/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        mode: "ask",
                        agentId: agentIdRef.current,
                        text,
                        locale:
                            typeof navigator !== "undefined"
                                ? navigator.language
                                : undefined,
                    }),
                });

                if (!response.ok) {
                    const errorData: ChatError = await response
                        .json()
                        .catch(() => ({
                            error: "unknown",
                            message: "Something went wrong.",
                            retryable: true,
                        }));
                    setErrorMessage(errorData.message);
                    setErrorRetryable(errorData.retryable ?? true);
                    setStatus("error");
                    return;
                }

                const data: ChatResponse = await response.json();

                if (data.agentId) {
                    agentIdRef.current = data.agentId;
                    if (typeof window !== "undefined") {
                        sessionStorage.setItem(STORAGE_KEY, data.agentId);
                    }
                }

                const capped = capSuggestions(data.suggestions || []);
                setSuggestions(
                    capped.length > 0 ? capped : DEFAULT_SUGGESTIONS,
                );
                setStatus("ready");
                onAnswer(text, data.answer, data.suggestions || []);
            } catch (error) {
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred.",
                );
                setErrorRetryable(true);
                setStatus("error");
            }
        },
        [onAnswer, onQuestionSubmit],
    );

    // Entry point for every submission (form, Enter key, suggestion click). If
    // the agent is still warming up we queue the message instead of sending it,
    // so the user never has to wait at an empty screen before typing.
    const submitMessage = useCallback(
        (text: string) => {
            if (!text.trim()) return;
            onQuestionSubmit?.(text);
            if (status === "initializing") {
                pendingMessageRef.current = text;
                setQueuedMessage(text);
                setInputValue("");
                return;
            }
            sendMessage(text);
        },
        [status, sendMessage, onQuestionSubmit],
    );

    // Once warmup finishes, fire any message the user queued while waiting.
    useEffect(() => {
        if (status !== "ready") return;
        if (!pendingMessageRef.current) return;
        const text = pendingMessageRef.current;
        pendingMessageRef.current = null;
        setQueuedMessage(null);
        sendMessage(text);
    }, [status, sendMessage]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (inputValue.trim()) submitMessage(inputValue);
        },
        [inputValue, submitMessage],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim()) submitMessage(inputValue);
            }
        },
        [inputValue, submitMessage],
    );

    // Auto-resize textarea.
    useEffect(() => {
        const textarea = inputRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
    }, [inputValue]);

    // Rotate the loading hint while a request is in flight. Reset to the first
    // hint each time we enter the loading state so the sequence always starts
    // with "Sending message to Cursor…".
    useEffect(() => {
        if (status !== "loading") return;
        setLoadingHintIndex(0);
        const interval = setInterval(() => {
            setLoadingHintIndex((i) => (i + 1) % LOADING_HINTS.length);
        }, LOADING_HINT_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [status]);

    // While the agent warms up, step through the sleepy "are you there?"
    // replies. Each line has its own dwell time, so we chain timeouts instead
    // of using a fixed interval. We stop on the last line instead of looping so
    // it doesn't reset to "(moaning)" on a slow cold start.
    useEffect(() => {
        if (status !== "initializing") return;
        setWarmupHintIndex(0);
        let timeout: ReturnType<typeof setTimeout>;
        const advance = (i: number) => {
            if (i >= WARMUP_HINTS.length - 1) return;
            timeout = setTimeout(() => {
                setWarmupHintIndex(i + 1);
                advance(i + 1);
            }, WARMUP_HINTS[i].ms);
        };
        advance(0);
        return () => clearTimeout(timeout);
    }, [status]);

    // Surface the warmup exchange as markdown so the parent renders it through
    // the same Window/conversation component the real chat uses (identical
    // styling — only the text differs). Cleared once a real conversation takes
    // over or the agent errors out.
    useEffect(() => {
        if (!onWarmupTextChange) return;
        if (hasActiveConversation || status === "error") {
            onWarmupTextChange(null);
            return;
        }
        const answer =
            status === "initializing"
                ? WARMUP_HINTS[warmupHintIndex].text
                : WARMUP_READY_ANSWER;
        onWarmupTextChange(`> ${WARMUP_QUESTION}\n\n${answer}`);
    }, [status, warmupHintIndex, hasActiveConversation, onWarmupTextChange]);

    // Mirror the warmup "answered" state up so the parent can dim the question
    // once the agent is awake (and un-dim it while still warming up).
    useEffect(() => {
        if (!onWarmupReadyChange) return;
        onWarmupReadyChange(!hasActiveConversation && status === "ready");
    }, [status, hasActiveConversation, onWarmupReadyChange]);

    if (status === "error") {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <span className={styles.errorText}>
                        {errorMessage || "Something went wrong."}
                    </span>
                    {errorRetryable && (
                        <button
                            onClick={initialize}
                            className={styles.retryButton}
                            type="button"
                        >
                            Try again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const isBusy = status === "loading" || queuedMessage !== null;

    const placeholder = queuedMessage
        ? "Waking up… your question is queued"
        : isBusy
        ? LOADING_HINTS[loadingHintIndex]
        : "";

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.inputRow}>
                <span className={styles.prompt}>{">_"}</span>
                <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (!highlightTriggeredRef.current) {
                            highlightTriggeredRef.current = true;
                            setHighlighted(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={isBusy}
                    maxLength={MAX_INPUT_LENGTH}
                    rows={1}
                    className={styles.input}
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim() || isBusy}
                    className={styles.sendButton}
                    aria-label="Send"
                >
                    {isBusy ? (
                        <span className={styles.spinner}></span>
                    ) : (
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                    )}
                </button>
            </form>

            <ul className={styles.suggestions}>
                {suggestions.map((suggestion, index) => (
                    <li
                        key={index}
                        className={cx(
                            styles.suggestionItem,
                            highlighted && styles.suggestionItemHighlight,
                        )}
                        style={
                            highlighted
                                ? { animationDelay: `${index * 80}ms` }
                                : undefined
                        }
                    >
                        <button
                            onClick={() => submitMessage(suggestion)}
                            className={cx(
                                styles.suggestionButton,
                                isBusy && styles.suggestionButtonDisabled,
                            )}
                            type="button"
                            disabled={isBusy}
                        >
                            {suggestion}
                        </button>
                    </li>
                ))}
            </ul>

            <p className={styles.privacyHint}>
                Heads-up: every conversation lands in my (Alex&apos;s) personal
                inbox, and your messages are sent to Cursor (USA) to generate
                the reply. Feel free to leave your email or phone number if
                you&apos;d like me to get back to you — just please avoid truly
                sensitive details (e.g. health or financial information). More
                in my{" "}
                <a
                    href="/datenschutz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.privacyHintLink}
                >
                    privacy policy
                </a>
                .
            </p>
        </div>
    );
};

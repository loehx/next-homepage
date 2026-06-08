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
    /** True while the agent is still initializing (show spinner + hint in Window). */
    onWarmupLoadingChange?: (loading: boolean) => void;
    /** True once init finished and no question has been submitted yet. */
    onAgentReadyChange?: (ready: boolean) => void;
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
    "Can you setup a meeting with him?",
    "Can he support us in a project?",
    "Who is Alex?",
]);

const STORAGE_KEY = "aiAgentId";

const MAX_INPUT_LENGTH = 200;

// The visitor's browser locale (e.g. "de-DE", "en-US"). Sent along with each
// question so the agent can answer in the user's preferred language even
// before it has any text to detect the language from.
const getBrowserLocale = (): string | undefined => {
    if (typeof navigator === "undefined") return undefined;
    return navigator.languages?.[0] || navigator.language || undefined;
};

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

const INPUT_PLACEHOLDER = "Enter your question…";

/** Keep the Window warmup hint visible at least this long, even on instant pool checkout. */
const MIN_INIT_DISPLAY_MS = 8000;

export const StageInput: React.FC<StageInputProps> = ({
    onQuestionSubmit,
    onAnswer,
    hasActiveConversation = false,
    onWarmupLoadingChange,
    onAgentReadyChange,
}: StageInputProps) => {
    const [status, setStatus] = useState<Status>("initializing");
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] =
        useState<string[]>(DEFAULT_SUGGESTIONS);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorRetryable, setErrorRetryable] = useState(true);
    const [loadingHintIndex, setLoadingHintIndex] = useState(0);
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

            const remainingDisplayMs =
                MIN_INIT_DISPLAY_MS - (Date.now() - initStartedAt);
            if (remainingDisplayMs > 0) {
                await new Promise((resolve) =>
                    setTimeout(resolve, remainingDisplayMs),
                );
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
                        locale: getBrowserLocale(),
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

    useEffect(() => {
        if (!onWarmupLoadingChange) return;
        onWarmupLoadingChange(
            !hasActiveConversation && status === "initializing",
        );
    }, [status, hasActiveConversation, onWarmupLoadingChange]);

    useEffect(() => {
        if (!onAgentReadyChange) return;
        onAgentReadyChange(!hasActiveConversation && status === "ready");
    }, [status, hasActiveConversation, onAgentReadyChange]);

    const isBusy = status === "loading" || queuedMessage !== null;

    const placeholder = queuedMessage
        ? "Waking up… your question is queued"
        : isBusy
        ? LOADING_HINTS[loadingHintIndex]
        : INPUT_PLACEHOLDER;

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

    return (
        <div className={styles.container}>
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

            <form onSubmit={handleSubmit} className={styles.inputRow}>
                <span className={styles.prompt}>{">_"}</span>
                <div className={styles.inputWrap}>
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
                </div>
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

            <p className={styles.privacyHint}>
                Alex receives the whole conversation via email. So please
                behave. Check out the{" "}
                <a
                    href="/datenschutz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.privacyHintLink}
                >
                    privacy policy
                </a>{" "}
                for more information.
            </p>
        </div>
    );
};

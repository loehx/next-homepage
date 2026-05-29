import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "./StageInput.module.css";
import cx from "classnames";

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
    onAnswer: (answer: string, suggestions: string[]) => void;
}

const DEFAULT_SUGGESTIONS = [
    "What skills does Alex have?",
    "What makes him different from other devs?",
    "What is he working on right now?",
];

const STORAGE_KEY = "aiAgentId";

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

export const StageInput: React.FC<StageInputProps> = ({
    onAnswer,
}: StageInputProps) => {
    const [status, setStatus] = useState<Status>("initializing");
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] =
        useState<string[]>(DEFAULT_SUGGESTIONS);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorRetryable, setErrorRetryable] = useState(true);
    const [loadingHintIndex, setLoadingHintIndex] = useState(0);
    // Bumped whenever a fresh set of suggestions arrives from an answer, so the
    // suggestion items replay their staggered highlight animation.
    const [highlightTrigger, setHighlightTrigger] = useState(0);
    const agentIdRef = useRef<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Initialize: restore agentId from session storage (if any), prewarm the
    // agent, and keep polling via "wait" until the warmup run drains. The
    // server returns status: "warming" with a runId when the cold start hasn't
    // finished within its per-call budget; we then drive the wait loop from
    // here. Without this, an "ask" immediately after prewarm reliably 409s
    // with agent_busy because the warmup run is still active.
    const initialize = useCallback(async () => {
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

    // Focus the input once the agent is ready so the user can type immediately.
    useEffect(() => {
        if (status === "ready") {
            inputRef.current?.focus();
        }
    }, [status]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim()) return;

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

                setSuggestions(
                    data.suggestions && data.suggestions.length > 0
                        ? data.suggestions
                        : DEFAULT_SUGGESTIONS,
                );
                setHighlightTrigger((t) => t + 1);
                setStatus("ready");
                onAnswer(data.answer, data.suggestions || []);
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
        [onAnswer],
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (inputValue.trim()) sendMessage(inputValue);
        },
        [inputValue, sendMessage],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim()) sendMessage(inputValue);
            }
        },
        [inputValue, sendMessage],
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

    if (status === "initializing") {
        return (
            <div className={styles.container}>
                <div className={styles.statusRow}>
                    <span className={styles.spinner}></span>
                    <span className={styles.statusText}>
                        Waking up the AI agent…
                    </span>
                </div>
                <p className={styles.statusHint}>
                    The agent lives in my Cursor Cloud and has access to a small
                    repository with information about me. When you ask it
                    something, it opens that repository and comes up with an
                    answer.
                </p>
            </div>
        );
    }

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

    const isBusy = status === "loading";

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.inputRow}>
                <span className={styles.prompt}>{">_"}</span>
                <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isBusy
                            ? LOADING_HINTS[loadingHintIndex]
                            : "Ask me anything…"
                    }
                    disabled={isBusy}
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
                        key={`${highlightTrigger}-${index}`}
                        className={cx(
                            styles.suggestionItem,
                            highlightTrigger > 0 &&
                                styles.suggestionItemHighlight,
                        )}
                        style={
                            highlightTrigger > 0
                                ? { animationDelay: `${500 + index * 140}ms` }
                                : undefined
                        }
                    >
                        <button
                            onClick={() => sendMessage(suggestion)}
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
        </div>
    );
};

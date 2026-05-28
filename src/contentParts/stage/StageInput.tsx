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

export const StageInput: React.FC<StageInputProps> = ({
    onAnswer,
}: StageInputProps) => {
    const [status, setStatus] = useState<Status>("initializing");
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] =
        useState<string[]>(DEFAULT_SUGGESTIONS);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorRetryable, setErrorRetryable] = useState(true);
    const agentIdRef = useRef<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Initialize: restore agentId from session storage (if any) and prewarm
    // the agent so the input is ready by the time we render it.
    const initialize = useCallback(async () => {
        setStatus("initializing");
        setErrorMessage(null);
        setErrorRetryable(true);

        if (typeof window !== "undefined") {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            if (stored) agentIdRef.current = stored;
        }

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: "prewarm",
                    agentId: agentIdRef.current,
                }),
            });

            if (!response.ok) {
                const errorData: ChatError = await response
                    .json()
                    .catch(() => ({
                        error: "unknown",
                        message: "Could not start the AI agent.",
                        retryable: true,
                    }));
                setErrorMessage(errorData.message);
                setErrorRetryable(errorData.retryable ?? true);
                setStatus("error");
                return;
            }

            const data = await response.json();
            if (data.agentId) {
                agentIdRef.current = data.agentId;
                if (typeof window !== "undefined") {
                    sessionStorage.setItem(STORAGE_KEY, data.agentId);
                }
            }
            setStatus("ready");
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Could not reach the AI agent.",
            );
            setErrorRetryable(true);
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

    if (status === "initializing") {
        return (
            <div className={styles.container}>
                <div className={styles.statusRow}>
                    <span className={styles.spinner}></span>
                    <span className={styles.statusText}>
                        Waking up the AI agent…
                    </span>
                </div>
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
                <span className={styles.prompt}>{">"}</span>
                <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isBusy ? "Thinking…" : "Ask me anything…"}
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
                    <li key={index} className={styles.suggestionItem}>
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

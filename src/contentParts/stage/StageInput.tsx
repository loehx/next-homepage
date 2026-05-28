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

type Status =
  | "checking"
  | "unavailable"
  | "idle"
  | "prewarming"
  | "loading"
  | "answered"
  | "error";

interface StageInputProps {
  onAnswer: (answer: string, suggestions: string[]) => void;
  onReset?: () => void;
  hasAnswer?: boolean;
}

const STATIC_SUGGESTIONS = [
  "Welche Skills hat Alex?",
  "Was unterscheidet ihn von anderen Devs?",
  "An welchen Projekten arbeitet er gerade?",
];

const STORAGE_KEY = "aiAgentId";

export const StageInput: React.FC<StageInputProps> = ({
  onAnswer,
  onReset,
  hasAnswer = false,
}) => {
  const [status, setStatus] = useState<Status>("checking");
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(STATIC_SUGGESTIONS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPrewarmed, setIsPrewarmed] = useState(false);
  const agentIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load agentId from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        agentIdRef.current = stored;
        setIsPrewarmed(true);
      }
    }
  }, []);

  // Check health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/ai/health");
        if (!response.ok) {
          throw new Error("Health check failed");
        }
        const data = await response.json();
        if (data.ok) {
          setStatus("idle");
        } else {
          setStatus("unavailable");
        }
      } catch {
        setStatus("unavailable");
      }
    };

    checkHealth();
  }, []);

  // Prewarm agent on first focus/click
  const prewarmAgent = useCallback(async () => {
    if (isPrewarmed || status === "prewarming" || status === "loading") return;

    setStatus("prewarming");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "prewarm" }),
      });

      if (!response.ok) {
        // Don't block the UI - prewarm is best-effort
        setStatus("idle");
        return;
      }

      const data = await response.json();
      if (data.agentId) {
        agentIdRef.current = data.agentId;
        if (typeof window !== "undefined") {
          sessionStorage.setItem(STORAGE_KEY, data.agentId);
        }
        setIsPrewarmed(true);
      }
    } catch (error) {
      console.warn("Prewarm failed:", error);
    } finally {
      setStatus((s) => (s === "prewarming" ? "idle" : s));
    }
  }, [isPrewarmed, status]);

  // Handle focus to trigger prewarm
  const handleFocus = useCallback(() => {
    if (!isPrewarmed && status === "idle") {
      prewarmAgent();
    }
  }, [isPrewarmed, status, prewarmAgent]);

  // Handle sending a message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setStatus("loading");
      setErrorMessage(null);

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
          const errorData: ChatError = await response.json().catch(() => ({
            error: "unknown",
            message: "Ein Fehler ist aufgetreten",
            retryable: true,
          }));

          setStatus("error");
          setErrorMessage(errorData.message);
          return;
        }

        const data: ChatResponse = await response.json();

        // Store agentId for follow-ups
        if (data.agentId) {
          agentIdRef.current = data.agentId;
          if (typeof window !== "undefined") {
            sessionStorage.setItem(STORAGE_KEY, data.agentId);
          }
        }

        setSuggestions(data.suggestions.length > 0 ? data.suggestions : STATIC_SUGGESTIONS);
        setStatus("answered");
        setInputValue("");
        onAnswer(data.answer, data.suggestions);
      } catch (error) {
        console.error("Chat error:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten"
        );
      }
    },
    [onAnswer]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim()) {
        sendMessage(inputValue);
      }
    },
    [inputValue, sendMessage]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      sendMessage(suggestion);
    },
    [sendMessage]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  // Handle key press (submit on Enter, new line on Shift+Enter)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (inputValue.trim()) {
          sendMessage(inputValue);
        }
      }
    },
    [inputValue, sendMessage]
  );

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Don't render if unavailable
  if (status === "unavailable" || status === "checking") {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        {/* Header with traffic lights (matching Window component style) */}
        <div className={styles.header}>
          <span className={cx(styles.dot, styles.dotRed)}></span>
          <span className={cx(styles.dot, styles.dotYellow)}></span>
          <span className={cx(styles.dot, styles.dotGreen)}></span>
          <span className={styles.title}>
            {status === "prewarming"
              ? "Starte KI-Agenten..."
              : status === "loading"
              ? "Denke nach..."
              : status === "answered"
              ? "Frag weiter..."
              : "Frag mich etwas"}
          </span>
        </div>

        <div className={styles.content}>
          {/* Input form */}
          <form onSubmit={handleSubmit} className={styles.inputRow}>
            <span className={styles.prompt}>{">"}</span>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              placeholder={
                status === "prewarming"
                  ? "Warte kurz, Agent startet..."
                  : "Deine Frage..."
              }
              disabled={status === "loading" || status === "prewarming"}
              rows={1}
              className={styles.input}
            />
            <button
              type="submit"
              disabled={
                !inputValue.trim() || status === "loading" || status === "prewarming"
              }
              className={styles.sendButton}
              aria-label="Senden"
            >
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
            </button>
          </form>

          {/* Loading indicator */}
          {status === "loading" && (
            <div className={styles.loading}>
              <span className={styles.spinner}></span>
              <span className={styles.loadingText}>KI antwortet...</span>
            </div>
          )}

          {/* Error message */}
          {status === "error" && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>!</span>
              <span className={styles.errorText}>
                {errorMessage || "Ein Fehler ist aufgetreten"}
              </span>
              <button onClick={handleRetry} className={styles.retryButton}>
                Nochmal versuchen
              </button>
            </div>
          )}

          {/* Suggestions */}
          {status !== "loading" && status !== "error" && (
            <div className={styles.suggestions}>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={styles.suggestionChip}
                  disabled={status === "prewarming"}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

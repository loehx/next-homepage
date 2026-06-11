import React, { useMemo } from "react";
import styles from "./window.module.css";
import cx from "classnames";
import { Marked } from "@ts-stack/markdown";

interface WindowProps {
    className?: string;
    style?: any;
    text?: string;
    textStyle?: any;
    onClose?: () => void;
    /** Dims the question blockquote (e.g. once the answer below it is shown). */
    dimQuestion?: boolean;
    /** Spinner + hint shown while the AI agent is initializing. */
    warmupLoading?: boolean;
    /** Hint shown once the agent is ready, before the first question. */
    agentReady?: boolean;
}

const WARMUP_LOADING_MESSAGE = "Agent is being initialized ...";

const AGENT_READY_PARAGRAPHS = [
    "I'm ready!",
    "You can ask about *Alex*'s experience, skills, projects, and even how he works.",
    "Share some details about your project, and I'll tell you whether he can support you or not.",
    "I can even set up a meeting or ask him to reach out to you — just let me know.",
];

export const Window: React.FC<WindowProps> = ({
    className,
    text,
    textStyle,
    children,
    onClose,
    dimQuestion,
    warmupLoading,
    agentReady,
    ...props
}) => {
    const html = useMemo(() => {
        if (!text) return "";
        return Marked.parse(text)
            .replaceAll(/(ul|ol)>\n/g, "$1>")
            .replaceAll(/\n<(li|ul|ol)/g, "<$1")
            .replaceAll(
                /<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/g,
                "<blockquote>$1</blockquote>",
            )
            .replaceAll(/<\/blockquote>\s+<p>/g, "</blockquote><p>")
            .replaceAll(/<\/p>\s+<p>/g, "</p><p>")
            .replaceAll(
                /<a href="([^"]+)">([^<]+)<\/a>/g,
                '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
            )
            .replace(/\n$/, "");
    }, [text]);

    return (
        <div className={cx(className, styles.window)} {...props}>
            <div className={styles.actions}>
                <span onClick={onClose}></span>
                <span onClick={onClose}></span>
                <span></span>
            </div>
            <div
                className={cx(
                    styles.windowInner,
                    dimQuestion && styles.dimQuestion,
                )}
                style={textStyle}
            >
                <div
                    className={styles.text}
                    dangerouslySetInnerHTML={{ __html: html }}
                ></div>

                {warmupLoading && (
                    <div className={styles.warmupLoading}>
                        <span
                            className={styles.warmupSpinner}
                            aria-hidden
                        ></span>
                        <p className={styles.warmupLoadingText}>
                            {WARMUP_LOADING_MESSAGE}
                        </p>
                    </div>
                )}

                {agentReady && !warmupLoading && (
                    <>
                        {AGENT_READY_PARAGRAPHS.map((paragraph) => (
                            <p
                                key={paragraph}
                                className={styles.warmupReadyText}
                                dangerouslySetInnerHTML={{
                                    __html: Marked.parse(paragraph).replace(
                                        /^<p>([\s\S]*)<\/p>\n?$/,
                                        "$1",
                                    ),
                                }}
                            />
                        ))}
                    </>
                )}

                {children}
            </div>
        </div>
    );
};

import React, { useMemo } from "react";
import styles from "./window.module.css";
import cx from "classnames";
import { parseMarkdownToHtml } from "./markdown";
import { wrapAnimatedWordsInHtml } from "./wrapAnimatedWords";

interface WindowProps {
    className?: string;
    style?: any;
    text?: string;
    /** Question shown as a blockquote in the AI chat view. */
    questionText?: string;
    /** Answer revealed word-by-word in the AI chat view. */
    answerText?: string;
    textStyle?: any;
    onClose?: () => void;
    /** Dims the question blockquote (e.g. once the answer below it is shown). */
    dimQuestion?: boolean;
    /** Spinner + hint shown while the AI agent is initializing. */
    warmupLoading?: boolean;
}

const WARMUP_LOADING_MESSAGE =
    "Agent is being initialized ... You can already come up with a question - in any language. The agent will respond as soon as it's ready.";

export const Window: React.FC<WindowProps> = ({
    className,
    text,
    questionText,
    answerText,
    textStyle,
    children,
    onClose,
    dimQuestion,
    warmupLoading,
    ...props
}) => {
    const html = useMemo(() => {
        if (questionText !== undefined || answerText !== undefined) {
            const parts: string[] = [];

            if (questionText) {
                parts.push(parseMarkdownToHtml(`> ${questionText}`));
            }

            if (answerText) {
                const answerHtml = parseMarkdownToHtml(answerText);
                parts.push(
                    wrapAnimatedWordsInHtml(answerHtml, styles.animatedWord),
                );
            }

            return parts.join("");
        }

        if (!text) return "";
        return parseMarkdownToHtml(text);
    }, [text, questionText, answerText]);

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
                <pre
                    key={answerText ?? text}
                    className={styles.text}
                    dangerouslySetInnerHTML={{ __html: html }}
                ></pre>

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

                {children}
            </div>
        </div>
    );
};

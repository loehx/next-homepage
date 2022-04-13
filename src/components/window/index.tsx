import React, { useEffect, useMemo } from "react";
import styles from "./window.module.css";
import cx from "classnames";
import { renderMarkdown } from "src/util";

interface WindowProps {
    className?: string;
    text?: string;
    textStyle?: any;
    onClose?: () => void;
}

export const Window: React.FC<WindowProps> = ({
    className,
    text,
    textStyle,
    children,
    onClose,
    ...props
}) => {
    const lines = useMemo(() => {
        if (!text) return [];
        const html = renderMarkdown(text)
            .replaceAll("<p>", "")
            .replaceAll("</p>", "\n");
        const lines = html.split("\n");
        while (!lines[lines.length - 1]) {
            lines.pop();
        }
        return lines;
    }, [text]);

    return (
        <div className={cx(className, styles.window)} {...props}>
            <div className={styles.actions}>
                <span onClick={onClose}></span>
                <span onClick={onClose}></span>
                <span></span>
            </div>
            <div className={styles.windowInner} style={textStyle}>
                {lines.map((line, i) => (
                    <pre
                        key={i}
                        dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
                    ></pre>
                ))}
                {children}
            </div>
        </div>
    );
};

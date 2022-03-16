import React from "react";
import styles from "./window.module.css";
import cx from "classnames";
import { renderMarkdown } from "src/util";

interface WindowProps {
    className: string;
    text: string;
}

export const Window: React.FC<WindowProps> = ({
    className,
    text,
    ...props
}) => {
    const html = renderMarkdown(text)
        .replaceAll("<p>", "")
        .replaceAll("</p>", "\n");
    const lines = html.split("\n");

    while (!lines[lines.length - 1]) {
        lines.pop();
    }

    return (
        <div className={cx(className, styles.window)} {...props}>
            <div className={styles.actions}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div className={styles.windowInner}>
                {lines.map((line, i) => (
                    <pre
                        key={i}
                        dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
                    ></pre>
                ))}
            </div>
        </div>
    );
};

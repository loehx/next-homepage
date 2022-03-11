import React from "react";
import styles from "./window.module.css";
import cx from "classnames";

interface WindowProps {
    className: string;
    text: string;
}

export const Window: React.FC<WindowProps> = ({
    className,
    text,
    ...props
}) => {
    const lines = text.split("\n");

    return (
        <div className={cx(className, styles.window)} {...props}>
            <div className={styles.actions}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div className={styles.windowInner}>
                {lines.map((line, i) => (
                    <pre key={i}>{line || "\u00A0"}</pre>
                ))}
            </div>
        </div>
    );
};

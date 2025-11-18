import React, { useEffect, useMemo } from "react";
import styles from "./window.module.css";
import cx from "classnames";
import { Marked } from "@ts-stack/markdown";

interface WindowProps {
    className?: string;
    style?: any;
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
    const html = useMemo(() => {
        if (!text) return "";
        return Marked.parse(text)
            .replaceAll(/(ul|ol)>\n/g, "$1>")
            .replaceAll(/\n<(li|ul|ol)/g, "<$1")
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
            <div className={styles.windowInner} style={textStyle}>
                <pre
                    className={styles.text}
                    dangerouslySetInnerHTML={{ __html: html }}
                ></pre>

                {children}
            </div>
        </div>
    );
};

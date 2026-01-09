import React, { useEffect, useRef, useState } from "react";
import styles from "./scene2.module.css";
import { useScroll } from "@v2/components/scrollHandler";
import cx from "classnames";

interface Scene2Props {
    delay: number;
    duration: number;
    lines: string[];
}

export const Scene2: React.FC<Scene2Props> = ({ lines }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(-1);

    useScroll(({ progress: newProgress }) => {
        console.log(newProgress);
        // bring progress into range: 0 - 1
        newProgress = Math.min(Math.max(newProgress, 0), 1);
        setProgress(newProgress * 1.2);
    });

    useEffect(() => {
        if (!containerRef.current) return;
        setTimeout(() => {
            setProgress(0);
        }, 1000);
    }, []);

    let counter = 0;

    return (
        <div
            ref={containerRef}
            className={cx(
                styles.container,
                progress >= 0 && styles.fadeIn,
                progress > 0 && styles.scrollPhase,
            )}
            style={{ "--progress": progress } as React.CSSProperties}
        >
            {lines.map((line, index) => (
                <div key={index} className={styles.lineWrapper}>
                    <span
                        className={styles.text}
                        style={
                            {
                                "--delay": `${(counter += 0.1)}s`,
                            } as React.CSSProperties
                        }
                    >
                        {line}
                    </span>
                </div>
            ))}
        </div>
    );
};

import React from "react";
import styles from "./AnimationTimeLine.module.css";

export const AnimationTimeLine: React.FC = () => {
    // Render lines for a sufficient height (e.g. 10 pages)
    const lines = Array.from({ length: 100 }, (_, i) => {
        const vh = (i + 1) * 10;
        return { vh, label: `${vh / 100}` };
    });

    return (
        <div className={styles.container}>
            {lines.map(({ vh, label }) => (
                <div
                    key={vh}
                    className={styles.line}
                    style={{ top: `${vh}vh` }}
                >
                    <span className={styles.label}>{label}</span>
                </div>
            ))}
        </div>
    );
};

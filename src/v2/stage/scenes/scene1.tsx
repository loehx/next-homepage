import React, { useEffect, useRef, useState } from "react";
import styles from "./scene1.module.css";
import { useScroll } from "@v2/components/scrollHandler";
import { useMouseDirection } from "src/hooks";
import cx from "classnames";
import { Background1 } from "./background1";

interface Scene1Props {
    delay: number;
    duration: number;
    lines: string[];
}

export const Scene1: React.FC<Scene1Props> = ({ lines }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(-1);

    useScroll(({ progress: newProgress }) => {
        console.log(newProgress);
        // bring progress into range: 0 - 1
        newProgress = Math.min(Math.max(newProgress, 0), 1);
        setProgress(newProgress * 1.2);
    });

    const mouseDirection = useMouseDirection(containerRef);

    useEffect(() => {
        if (!containerRef.current) return;
        setTimeout(() => {
            setProgress(0);
        }, 1000);
    }, []);

    return (
        <>
            <Background1 progress={progress} distance={0.8} />
            <div
                ref={containerRef}
                className={cx(
                    styles.container,
                    progress >= 0 && styles.fadeIn,
                    progress > 0 && styles.scrollPhase,
                )}
                style={
                    {
                        "--lines": lines.length,
                        "--progress": progress,
                        "--mouse-direction": `${mouseDirection}deg`,
                    } as React.CSSProperties
                }
            >
                {lines.map((line, index) => (
                    <div
                        key={index}
                        className={styles.lineWrapper}
                        style={
                            {
                                "--delay": `${index * 0.1}s`,
                            } as React.CSSProperties
                        }
                    >
                        <span className={styles.text}>{line}</span>
                    </div>
                ))}
            </div>
        </>
    );
};

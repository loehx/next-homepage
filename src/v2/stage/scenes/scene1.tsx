import React, { useEffect, useRef, useState, useCallback } from "react";
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

const LINES = [
    ["Heyo", getCurrentSalutation(), "Welcome"],
    ["I am", "Alexander", "Loehn"],
    ["Freelance", "Developer", "Senior"],
];
const DURATION = 500;
const STOP_INTERVAL = 500;
const CHARACTERS_SPEED = 100;
const PAD_END = 20;
const CUSTOM_SEEDS = [23, 32, 43];

const COLORS = ["#f635df", "#35f686", "#bef635", "#f64b4b", "#4b9bf6"];
const ALTERNATE_COLORS_INTERVAL = 2500;

export const Scene1: React.FC<Scene1Props> = ({ duration }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(-1);
    const [cycleIndex, setCycleIndex] = useState(0);
    const [isActive, setIsActive] = useState(true);

    const toggleActive = useCallback(() => {
        setIsActive((prev) => !prev);
    }, []);

    const stopActive = useCallback(() => {
        setIsActive(false);
    }, []);

    useEffect(() => {
        const handleToggle = (e: MouseEvent | TouchEvent) => {
            if (e instanceof MouseEvent && e.button !== 0) return;
            if (e.target instanceof HTMLElement) {
                const interactive = e.target.closest(
                    "button, a, input, textarea, select, [role='button']",
                );
                if (interactive) return;
            }
            toggleActive();
        };

        window.addEventListener("mousedown", handleToggle);
        window.addEventListener("touchstart", handleToggle, { passive: true });
        window.addEventListener("wheel", stopActive, { passive: true });
        window.addEventListener("touchmove", stopActive, { passive: true });

        return () => {
            window.removeEventListener("mousedown", handleToggle);
            window.removeEventListener("touchstart", handleToggle);
            window.removeEventListener("wheel", stopActive);
            window.removeEventListener("touchmove", stopActive);
        };
    }, [toggleActive, stopActive]);

    const currentLineSet = LINES[cycleIndex % LINES.length];

    const renderedLines = [
        useRandomizedText(
            currentLineSet[0],
            DURATION,
            CHARACTERS_SPEED,
            PAD_END,
            CUSTOM_SEEDS[0],
            cycleIndex,
            isActive,
        ),
        useRandomizedText(
            currentLineSet[1],
            DURATION + STOP_INTERVAL,
            CHARACTERS_SPEED,
            PAD_END,
            CUSTOM_SEEDS[1],
            cycleIndex,
            isActive,
        ),
        useRandomizedText(
            currentLineSet[2],
            DURATION + STOP_INTERVAL * 2,
            CHARACTERS_SPEED,
            PAD_END,
            CUSTOM_SEEDS[2],
            cycleIndex,
            isActive,
        ),
    ];

    useScroll(({ progress: newProgress }) => {
        // bring progress into range: 0 - 1
        newProgress = Math.min(Math.max(newProgress, 0), 1);
        setProgress(newProgress * 1.2);
    });

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setCycleIndex((prev) => prev + 1);
        }, ALTERNATE_COLORS_INTERVAL);

        return () => clearInterval(interval);
    }, [isActive]);

    const getColorByIndex = (index: number): string | undefined => {
        if (index === 1) {
            return COLORS[cycleIndex % COLORS.length];
        }
        return undefined;
    };

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
                        "--lines": renderedLines.length,
                        "--progress": progress,
                    } as React.CSSProperties
                }
            >
                {renderedLines.map((line, index) => (
                    <div
                        key={index}
                        className={styles.lineWrapper}
                        style={
                            {
                                color: getColorByIndex(index),
                            } as React.CSSProperties
                        }
                    >
                        <span
                            className={styles.text}
                            style={{ opacity: line.includes("-") ? 1 : 0.5 }}
                        >
                            {line.split("-")[0]}
                        </span>
                        {line.includes("-") && (
                            <span
                                className={styles.text}
                                style={{ opacity: 0.1 }}
                            >
                                {line.split("-")[1]}
                            </span>
                        )}
                    </div>
                ))}
            </div>
            <div
                key={Math.floor(cycleIndex / 3)}
                className={cx(styles.progressBar, !isActive && styles.paused)}
                style={
                    {
                        "--color": COLORS[cycleIndex % COLORS.length],
                        "--duration": `${ALTERNATE_COLORS_INTERVAL * 3}ms`,
                    } as React.CSSProperties
                }
            />
        </>
    );
};

function useRandomizedText(
    text: string,
    duration: number,
    interval: number,
    padEnd: number,
    customSeed: number,
    resetKey: any,
    isActive: boolean,
): string {
    const RANDOM_CHARS = "abcdefghijklmnopqrstuvwxyz";
    const [step, setStep] = useState(0);
    const totalSteps = Math.floor(duration / interval);

    useEffect(() => {
        setStep(0);
    }, [resetKey]);

    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setStep((s) => (s < totalSteps ? s + 1 : s));
        }, interval);
        return () => clearInterval(timer);
    }, [totalSteps, interval, resetKey, isActive]);

    const getDeterministicChar = (seed: number) => {
        let h = Math.imul(seed ^ (seed >>> 16), 0x21f0aaad);
        h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
        h = (h ^ (h >>> 15)) >>> 0;
        return RANDOM_CHARS[h % RANDOM_CHARS.length];
    };

    const getRandomString = (length: number, step: number, seed: number) => {
        let res = "";
        for (let i = 0; i < length; i++) {
            const combined = Math.imul(step ^ 0xdeadbeef, i + seed + 1);
            res += getDeterministicChar(combined);
        }
        return res;
    };

    if (step === totalSteps) {
        return `${text}-${getRandomString(padEnd, step, customSeed)}`;
    }
    return getRandomString(text.length + padEnd + 1, step, customSeed);
}
function getCurrentSalutation(): string {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
        return "Moin";
    } else if (currentHour >= 12 && currentHour < 18) {
        return "Guten Tag";
    } else {
        return "Guten Abend";
    }
}

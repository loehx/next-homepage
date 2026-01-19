import React, { useRef, useState, useEffect, useCallback } from "react";
import styles from "./scene2.module.css";
import { useAnimatedActivationOnElementShorthand } from "@components/scrollHandler/useAnimatedActivation";
import phoneFrameSrc from "../../contentParts/stage/phone-frame.webp";
import cx from "classnames";

const DETAILS = [
    {
        title: "Hi, I'm Alex",
        label: "I'm a frontend developer with focus on vue and react. I have 16+ years of experience in web development. 4 of which as a freelancer. I delivered 18+ website projects for clients all over the world.",
    },
    {
        title: "Professional",
        label: "I'm highly efficient and can adapt my speed and quality to match the projects needs.",
    },
    {
        title: "Agile",
        label: "I'm highly agile and flexible. I can adapt to new projects and requirements very quickly. In 2019 I did an intensive Agile Coach Training at Judith Andresen.",
    },
    {
        title: "E-Commerce(d)",
        label: "Since I started freelancing in 2022, I've delivered 10+ webshops, all built with the Storefront Boilerplate (by SCAYLE).",
    },
    {
        title: "Techstack",
        label: "Vue and React are my most beloved frameworks. Contentful my go-to CMS. TypeScript is my language of choice.",
    },
    {
        title: "Cursor AI",
        label: "I'm a big fan of Cursor AI and use it to generate code. Although it sometimes feels like working with a junior developer on cocaine.",
    },
];

const INTERVAL_MS = 3000;
const TYPE_DURATION_MS = INTERVAL_MS / 2;

function useTypewriter(
    text: string,
    isActive: boolean,
    isPlaying: boolean,
    speedMs: number,
) {
    const [charIndex, setCharIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!isActive) {
            setCharIndex(0);
            setIsComplete(false);
            return;
        }

        if (!isPlaying || isComplete) return;

        if (charIndex >= text.length) {
            setIsComplete(true);
            return;
        }

        const timeout = setTimeout(() => {
            setCharIndex((prev) => prev + 1);
        }, speedMs);

        return () => clearTimeout(timeout);
    }, [text, isActive, isPlaying, charIndex, isComplete, speedMs]);

    return { displayedText: text.slice(0, charIndex), isTyping: isActive && !isComplete };
}

interface DetailProps {
    title: string;
    label: string;
    isActive: boolean;
    isPlaying: boolean;
}

const Detail: React.FC<DetailProps> = ({ title, label, isActive, isPlaying }) => {
    const totalChars = title.length + label.length;
    const speedMs = TYPE_DURATION_MS / totalChars;

    const { displayedText: displayedTitle, isTyping: isTitleTyping } =
        useTypewriter(title, isActive, isPlaying, speedMs);
    const { displayedText: displayedLabel, isTyping: isLabelTyping } =
        useTypewriter(label, isActive && !isTitleTyping, isPlaying, speedMs);

    return (
        <div className={cx(styles.detail, isActive && styles.detailActive)}>
            <span className={styles.detailTitle}>
                {displayedTitle}
                {isTitleTyping && <span className={styles.cursor}>_</span>}
            </span>
            <p className={styles.detailLabel}>
                {displayedLabel}
                {isLabelTyping && <span className={styles.cursor}>_</span>}
            </p>
        </div>
    );
};

const TOTAL_DURATION_MS = INTERVAL_MS * DETAILS.length;

export const Scene2: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [cycleCount, setCycleCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const togglePlaying = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);

    useAnimatedActivationOnElementShorthand(
        containerRef,
        styles.active,
        0.5,
        1.5,
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleClick = (e: MouseEvent | TouchEvent) => {
            if (e instanceof MouseEvent && e.button !== 0) return;
            if (e.target instanceof HTMLElement) {
                const interactive = e.target.closest(
                    "button, a, input, textarea, select, [role='button']",
                );
                if (interactive) return;
            }
            togglePlaying();
        };

        container.addEventListener("mousedown", handleClick);
        container.addEventListener("touchstart", handleClick, {
            passive: true,
        });

        return () => {
            container.removeEventListener("mousedown", handleClick);
            container.removeEventListener("touchstart", handleClick);
        };
    }, [togglePlaying]);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % DETAILS.length;
                if (next === 0) setCycleCount((c) => c + 1);
                return next;
            });
        }, INTERVAL_MS);
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <>
            <div ref={containerRef} className={styles.container}>
                <div className={styles.leftContainer}>
                    <div className={styles.phone}>
                        <img
                            src="https://images.ctfassets.net/sn5a22dgyyrk/2sDFtEHMmlKhFnKAzJlIHN/5265dfe8f4a4ebbac35f8d0cd48e1292/_ALX6588.jpg"
                            alt="Profile"
                            className={styles.phoneImage}
                        />
                        <img
                            src={phoneFrameSrc}
                            alt="Phone frame"
                            className={styles.phoneFrame}
                        />
                    </div>
                </div>

                <div className={styles.rightContainer}>
                    {DETAILS.map((detail, index) => (
                        <Detail
                            key={index}
                            title={detail.title}
                            label={detail.label}
                            isActive={index === activeIndex}
                            isPlaying={isPlaying}
                        />
                    ))}
                </div>
            </div>
            <div
                key={cycleCount}
                className={cx(styles.progressBar, !isPlaying && styles.paused)}
                style={
                    {
                        "--duration": `${TOTAL_DURATION_MS}ms`,
                    } as React.CSSProperties
                }
            />
        </>
    );
};

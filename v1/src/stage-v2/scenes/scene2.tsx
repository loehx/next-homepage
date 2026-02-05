import React, { useRef, useState, useEffect, useCallback } from "react";
import styles from "./scene2.module.css";
import { useAnimatedActivationOnElementShorthand } from "@components/scrollHandler/useAnimatedActivation";
import { useScroll } from "@components/scrollHandler";
import cx from "classnames";
import { DarkWavyBackground } from "@components/wallpaper/DarkWavyBackground";
import dynamic from "next/dynamic";

/*+
 * FOR TESTING IN THE BROWSER:
 * http://localhost:8080/?pos=1
 */

// Dynamic import with SSR disabled for Three.js component
const ThreepipePhone = dynamic(
    () =>
        import("./components/ThreepipePhone").then((mod) => mod.ThreepipePhone),
    { ssr: false },
);

interface TextSegment {
    text: string;
    isBold: boolean;
}

function parseTextSegments(text: string): TextSegment[] {
    const segments: TextSegment[] = [];
    let currentIndex = 0;
    const regex = /\*([^*]+)\*/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > currentIndex) {
            segments.push({
                text: text.slice(currentIndex, match.index),
                isBold: false,
            });
        }
        segments.push({
            text: match[1],
            isBold: true,
        });
        currentIndex = match.index + match[0].length;
    }

    if (currentIndex < text.length) {
        segments.push({
            text: text.slice(currentIndex),
            isBold: false,
        });
    }

    return segments;
}

function renderTextSegments(
    segments: TextSegment[],
    maxLength: number,
    color?: string,
): React.ReactNode {
    const parts: React.ReactNode[] = [];
    let currentLength = 0;
    let partKey = 0;

    for (const segment of segments) {
        if (currentLength >= maxLength) break;

        const remainingLength = maxLength - currentLength;
        const displayText =
            segment.text.length <= remainingLength
                ? segment.text
                : segment.text.slice(0, remainingLength);

        if (displayText) {
            if (segment.isBold) {
                parts.push(
                    <strong key={partKey++} style={{ color }}>
                        {displayText}
                    </strong>,
                );
            } else {
                parts.push(displayText);
            }
            currentLength += displayText.length;
        }
    }

    return parts.length > 0 ? parts : null;
}

const COLORS = ["#f635df", "#35f686", "#f64b4b", "#bef635", "#4b9bf6"];

const DETAILS = [
    {
        title: "Front-*End*",
        label: "developer with focus on *vue* and *react*. *16+* years of experience in web development (*4* as a freelancer). *18+* websites for clients worldwide.",
        accentColor: COLORS[0],
        hueRotate: 320,
    },
    {
        title: "Professional",
        label: "focussed and *highly efficient* - adjusting speed and quality to match the client's requirements, deadlines and budget.",
        accentColor: COLORS[1],
        hueRotate: 100,
    },
    {
        title: "Flexi",
        label: "Highly agile at coding and social skills. Certified *Agile Coach* and *Scrum* Master.",
        accentColor: COLORS[2],
        hueRotate: 0,
    },
    {
        title: "E-Commerce",
        label: "Since I started freelancing in 2022, I've delivered 10+ webshops, all built with the Storefront Boilerplate (by SCAYLE).",
        accentColor: COLORS[3],
        hueRotate: 100,
    },
    {
        title: "Techstack",
        label: "Vue and React are my most beloved frameworks. Contentful my go-to CMS. TypeScript is my language of choice.",
        accentColor: COLORS[4],
        hueRotate: 200,
    },
    {
        title: "Cursor *AI*",
        label: "I'm a big fan of *Cursor AI* and use it to generate code. Although it sometimes feels like working with a junior developer on cocaine.",
        accentColor: COLORS[0],
        hueRotate: 0,
    },
];

const INTERVAL_MS = 5000;
const TYPE_DURATION_MS = INTERVAL_MS / 2;

function stripAsterisks(text: string): string {
    return text.replace(/\*/g, "");
}

function useTypewriter(
    text: string,
    isActive: boolean,
    isPlaying: boolean,
    speedMs: number,
) {
    const [charIndex, setCharIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    // Clean text without asterisks for typing calculation
    const cleanText = stripAsterisks(text);

    useEffect(() => {
        if (!isActive) {
            setCharIndex(0);
            setIsComplete(false);
            return;
        }

        if (!isPlaying || isComplete) return;

        if (charIndex >= cleanText.length) {
            setIsComplete(true);
            return;
        }

        const timeout = setTimeout(() => {
            setCharIndex((prev) => prev + 1);
        }, speedMs);

        return () => clearTimeout(timeout);
    }, [cleanText, isActive, isPlaying, charIndex, isComplete, speedMs]);

    // Simply use the clean text sliced to current position
    const displayedText = cleanText.slice(0, charIndex);

    return {
        displayedText,
        isTyping: isActive && !isComplete,
    };
}

interface DetailProps {
    title: string;
    label: string;
    isPlaying: boolean;
    accentColor: string;
    index: number;
}

const Detail: React.FC<DetailProps> = ({
    title,
    label,
    isPlaying,
    accentColor,
    index,
}) => {
    const [isActive, setIsActive] = useState(false);

    // Calculate speed based on clean text length (without asterisks)
    const cleanTitleLength = stripAsterisks(title).length;
    const cleanLabelLength = stripAsterisks(label).length;
    const speedLabel = TYPE_DURATION_MS / cleanLabelLength;

    const { displayedText: displayedLabel, isTyping: isLabelTyping } =
        useTypewriter(label, true, isPlaying, speedLabel);

    // Parse text segments once
    const titleSegments = parseTextSegments(title);
    const labelSegments = parseTextSegments(label);

    useEffect(() => {
        if (isPlaying) {
            setTimeout(() => {
                setIsActive(true);
            }, 100);
        }
    }, []);

    return (
        <div
            className={cx(styles.detailContainer, !isPlaying && styles.paused)}
            style={{ "--accent-color": accentColor } as React.CSSProperties}
            data-index={index}
        >
            <div className={cx(styles.detail, isActive && styles.active)}>
                <span className={styles.detailTitle}>
                    <span className={styles.detailTitleInner}>
                        {renderTextSegments(
                            titleSegments,
                            title.length,
                            accentColor,
                        )}
                    </span>
                </span>
                <p className={styles.detailLabel}>
                    {renderTextSegments(
                        labelSegments,
                        displayedLabel.length,
                        accentColor,
                    )}
                    {isLabelTyping && <span className={styles.cursor}></span>}
                </p>
            </div>
            <div className={cx(styles.detail, styles.invisible)}>
                <span className={styles.detailTitle}>
                    {renderTextSegments(
                        titleSegments,
                        cleanTitleLength,
                        accentColor,
                    )}
                </span>
                <p className={styles.detailLabel}>
                    {renderTextSegments(
                        labelSegments,
                        cleanLabelLength,
                        accentColor,
                    )}
                </p>
            </div>
        </div>
    );
};

const TOTAL_DURATION_MS = INTERVAL_MS * DETAILS.length;

export const Scene2: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const phoneRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [cycleCount, setCycleCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isInViewRange, setIsInViewRange] = useState(false);
    const [phoneLoaded, setPhoneLoaded] = useState(false);

    // Phone is ready when loaded AND in view range
    const phoneReady = phoneLoaded && isInViewRange;

    const togglePlaying = useCallback(() => {
        setIsPlaying((prev) => !prev);
    }, []);

    // Track when scroll is in view range
    useScroll(({ progress }) => {
        const inRange = progress >= 0.5;
        setIsInViewRange(inRange);
    });

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

        return () => {
            container.removeEventListener("mousedown", handleClick);
        };
    }, [togglePlaying]);

    useEffect(() => {
        if (!isPlaying || !phoneReady) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % DETAILS.length;
                if (next === 0) setCycleCount((c) => c + 1);
                return next;
            });
        }, INTERVAL_MS);
        return () => clearInterval(interval);
    }, [isPlaying, phoneReady]);

    return (
        <>
            <div ref={containerRef} className={styles.container}>
                <div className={styles.leftContainer}>
                    <div
                        ref={phoneRef}
                        className={cx(
                            styles.phone,
                            phoneReady && styles.phoneLoaded,
                        )}
                    >
                        <ThreepipePhone
                            imageUrl="https://images.ctfassets.net/sn5a22dgyyrk/3IHwMjWi6r9pP28SfPvTEi/5a1e9274f7c7a75f8018861e79d276f1/Tallow_Sans_Pen__1_.jpg"
                            // imageUrl="https://images.ctfassets.net/sn5a22dgyyrk/2sDFtEHMmlKhFnKAzJlIHN/5265dfe8f4a4ebbac35f8d0cd48e1292/_ALX6588.jpg"
                            hueRotate={DETAILS[activeIndex].hueRotate}
                            isVisible={true}
                            flipKey={activeIndex}
                            onLoad={() => setPhoneLoaded(true)}
                        />
                    </div>
                </div>

                <div className={styles.rightContainer}>
                    {phoneReady && (
                        <Detail
                            key={activeIndex}
                            title={DETAILS[activeIndex].title}
                            label={DETAILS[activeIndex].label}
                            isPlaying={isPlaying}
                            accentColor={DETAILS[activeIndex].accentColor}
                            index={activeIndex}
                        />
                    )}
                </div>
            </div>
            {phoneReady && (
                <div
                    key={cycleCount}
                    className={cx(
                        styles.progressBar,
                        !isPlaying && styles.paused,
                    )}
                    style={
                        {
                            "--duration": `${TOTAL_DURATION_MS}ms`,
                            "--accent-color": DETAILS[activeIndex].accentColor,
                        } as React.CSSProperties
                    }
                />
            )}
        </>
    );
};

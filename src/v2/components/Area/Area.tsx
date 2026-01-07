import React, { useCallback, useEffect, useRef, useState } from "react";
import { useScroll, ScrollData } from "../scrollHandler";
import styles from "./Area.module.css";

type AreaProps = {
    appear: number;
    initialAppearDelay?: number;
    initialAppearDuration?: number;
    blurryAppear?: number; // pixels
    disappear: number;
    appearDistance?: number;
    parallax?: number;
    text?: string;
    className?: string;
    wrapperClassName?: string;
    tag?: keyof JSX.IntrinsicElements;
    children?: React.ReactNode;
};

type TextAreaProps = {
    text: string;
    className?: string;
};

export const TextArea: React.FC<TextAreaProps> = ({ text, className }) => {
    return <span className={className}>{text}</span>;
};

export const Area: React.FC<AreaProps> = ({
    appear,
    initialAppearDelay,
    initialAppearDuration,
    blurryAppear,
    disappear,
    appearDistance = 20, // 20vh
    parallax = 1,
    className,
    wrapperClassName,
    tag = "div",
    text,
    children,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [style, setStyle] = useState<React.CSSProperties>({
        opacity: 0,
        transform: "translateY(0px)",
    });
    const [letterProgress, setLetterProgress] = useState(0);
    const [targetOpacity, setTargetOpacity] = useState(0);
    const [transform, setTransform] = useState("translateY(0px)");
    const scrollAnimFrameRef = useRef<number>();
    const initialAnimFrameRef = useRef<number>();
    const lastFrameTimeRef = useRef<number>(0);
    const [initialAnimComplete, setInitialAnimComplete] = useState(false);
    const initialAnimStartTime = useRef<number>(0);

    const update = useCallback(
        ({ y, vh }: ScrollData) => {
            if (!ref.current) return;

            // Skip scroll-based updates during initial animation
            if (!initialAnimComplete) return;

            const rect = ref.current.getBoundingClientRect();
            const appearStartPx = (appear / 100) * vh;
            const appearEndPx = appearStartPx + (appearDistance / 100) * vh;
            const disappearStartPx = (disappear / 100) * vh;
            const disappearEndPx =
                disappearStartPx + (appearDistance / 100) * vh;

            // Calculate opacity based on scroll position
            let opacity = 0;

            // Fade in: element enters from bottom
            // Start appearing when rect.top reaches vh - appearStartPx
            // Fully visible when rect.top reaches vh - appearEndPx
            if (
                rect.top <= vh - appearStartPx &&
                rect.top >= vh - appearEndPx
            ) {
                const fadeRange = appearEndPx - appearStartPx;
                opacity = 1 - (rect.top - (vh - appearEndPx)) / fadeRange;
            }
            // Fully visible
            else if (
                rect.top < vh - appearEndPx &&
                rect.bottom > disappearEndPx
            ) {
                opacity = 1;
            }
            // Fade out: element exits from top
            // Start disappearing when rect.bottom reaches disappearEndPx
            // Fully hidden when rect.bottom reaches disappearStartPx
            else if (
                rect.bottom <= disappearEndPx &&
                rect.bottom >= disappearStartPx
            ) {
                const fadeRange = disappearEndPx - disappearStartPx;
                opacity = (rect.bottom - disappearStartPx) / fadeRange;
            }

            const offset = (1 - parallax) * y;

            // Update target opacity and transform
            setTargetOpacity(opacity);
            setTransform(`translateY(${offset}px)`);
        },
        [appear, disappear, appearDistance, parallax, initialAnimComplete],
    );

    // Initial appear animation
    useEffect(() => {
        if (initialAppearDelay === undefined) {
            setInitialAnimComplete(true);
            return;
        }

        const duration = initialAppearDuration ?? 1000; // Default 1000ms
        let delayTimeout: NodeJS.Timeout;

        delayTimeout = setTimeout(() => {
            initialAnimStartTime.current = performance.now();

            const animate = () => {
                const elapsed =
                    performance.now() - initialAnimStartTime.current;
                const progress = Math.min(elapsed / duration, 1);

                setStyle({
                    opacity: progress,
                    transform: "translateY(0px)",
                });
                setLetterProgress(progress);
                setTargetOpacity(progress);

                if (progress < 1) {
                    initialAnimFrameRef.current =
                        requestAnimationFrame(animate);
                } else {
                    setInitialAnimComplete(true);
                }
            };

            initialAnimFrameRef.current = requestAnimationFrame(animate);
        }, initialAppearDelay);

        return () => {
            clearTimeout(delayTimeout);
            if (initialAnimFrameRef.current !== undefined) {
                cancelAnimationFrame(initialAnimFrameRef.current);
            }
        };
    }, [initialAppearDelay, initialAppearDuration]);

    // Linear animation loop at 60fps (for scroll-based animations)
    useEffect(() => {
        if (!initialAnimComplete) return;

        const animate = (currentTime: number) => {
            if (lastFrameTimeRef.current === 0) {
                lastFrameTimeRef.current = currentTime;
            }

            const deltaTime = currentTime - lastFrameTimeRef.current;
            lastFrameTimeRef.current = currentTime;

            setStyle((prev) => {
                const currentOpacity = prev.opacity as number;
                const diff = targetOpacity - currentOpacity;

                if (Math.abs(diff) < 0.001) {
                    setLetterProgress(targetOpacity);
                    return {
                        opacity: targetOpacity,
                        transform,
                    };
                }

                // Linear increment: 0.6 per second = 0.01 per frame at 60fps
                const increment = (0.6 / 1000) * deltaTime;
                const step =
                    diff > 0
                        ? Math.min(increment, diff)
                        : Math.max(-increment, diff);
                const newOpacity = currentOpacity + step;
                setLetterProgress(newOpacity);

                scrollAnimFrameRef.current = requestAnimationFrame(animate);

                return {
                    opacity: newOpacity,
                    transform,
                    willChange: "transform, opacity",
                };
            });
        };

        lastFrameTimeRef.current = 0;
        scrollAnimFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (scrollAnimFrameRef.current !== undefined) {
                cancelAnimationFrame(scrollAnimFrameRef.current);
            }
            lastFrameTimeRef.current = 0;
        };
    }, [targetOpacity, transform, initialAnimComplete]);

    useScroll(update);

    useEffect(() => {
        if (typeof window === "undefined") return;
        update({
            y: window.scrollY,
            direction: 1,
            progress: 0,
            vh: window.innerHeight,
            totalHeight: document.documentElement?.scrollHeight ?? 0,
        });
    }, [update]);

    const renderContent = () => {
        if (text !== undefined) {
            if (blurryAppear) {
                const letters = text.split("");
                return (
                    <span className={className}>
                        {letters.map((letter, index) => {
                            const letterDelay = index / letters.length;
                            const letterOpacity = Math.max(
                                0,
                                Math.min(
                                    1,
                                    (letterProgress - letterDelay) *
                                        letters.length,
                                ),
                            );
                            const blur = blurryAppear * (1 - letterOpacity);

                            return (
                                <span
                                    key={index}
                                    className={styles.blurryLetter}
                                    style={{
                                        filter: `blur(${blur || 0}px)`,
                                    }}
                                >
                                    {letter === " " ? "\u00A0" : letter}
                                </span>
                            );
                        })}
                    </span>
                );
            }
            return <span className={className}>{text}</span>;
        }
        return children;
    };

    const Tag = tag as any;

    return (
        <Tag ref={ref} className={wrapperClassName} style={style}>
            {renderContent()}
        </Tag>
    );
};

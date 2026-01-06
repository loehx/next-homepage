import React, { useCallback, useEffect, useRef, useState } from "react";
import { useScroll, ScrollData } from "../scrollHandler";

type AreaProps = {
    appear: number;
    disappear: number;
    appearDistance?: number;
    parallax?: number;
    text?: string;
    className?: string;
    wrapperClassName?: string;
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
    disappear,
    appearDistance = 20, // 20vh
    parallax = 1,
    className,
    wrapperClassName,
    text,
    children,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [style, setStyle] = useState<React.CSSProperties>({
        opacity: 0,
        transform: "translateY(0px)",
    });

    const update = useCallback(
        ({ y, vh }: ScrollData) => {
            if (!ref.current) return;
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

            setStyle((prev) => {
                const transform = `translateY(${offset}px)`;
                if (prev.opacity === opacity && prev.transform === transform) {
                    return prev;
                }
                return {
                    opacity,
                    transform,
                    willChange: "transform, opacity",
                };
            });
        },
        [appear, disappear, appearDistance, parallax],
    );

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

    const content =
        text !== undefined ? (
            <span className={className}>{text}</span>
        ) : (
            children
        );

    return (
        <div ref={ref} className={wrapperClassName} style={style}>
            {content}
        </div>
    );
};

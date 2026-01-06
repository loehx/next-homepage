import React, { useCallback, useEffect, useRef, useState } from "react";
import { useScroll, ScrollData } from "../scrollHandler";

type AreaProps = {
    appear: number;
    disappear: number;
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
            const appearPx = (appear / 100) * vh;
            const disappearPx = (disappear / 100) * vh;

            const withinAppearWindow = rect.top <= vh + appearPx;
            const aboveDisappearWindow = rect.bottom >= -disappearPx;
            const opacity = withinAppearWindow && aboveDisappearWindow ? 1 : 0;

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
                    transition:
                        "opacity 0.2s ease-out, transform 0.2s ease-out",
                };
            });
        },
        [appear, disappear, parallax],
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


import React, { useEffect, useRef, useState, useCallback } from "react";
import { useScroll } from "@v2/components/scrollHandler";

export const FadeIn: React.FC<any> = ({
    children,
    appearRatio = 0.0,
    visibleRatio = 0.3,
    className,
    ...props
}) => {
    const element = useRef<HTMLDivElement | null>(null);
    const [opacity, setOpacity] = useState(0);
    const [height, setHeight] = useState(0);
    const intersectionObserver = useRef<IntersectionObserver | null>(null);
    const isIntersecting = useRef(false);
    const lastOpacity = useRef(0);

    const onScroll = useCallback(() => {
        if (!element.current || !isIntersecting.current) return;
        const rect = element.current.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top * (1 + appearRatio);
        const calculatedHeight = window.innerHeight * visibleRatio;
        setHeight(calculatedHeight);
        let calculatedOpacity = Math.min(bottom / calculatedHeight);
        calculatedOpacity = Math.max(calculatedOpacity, 0);
        calculatedOpacity = Math.min(calculatedOpacity, 1);

        // Only update if opacity changed significantly
        if (Math.abs(lastOpacity.current - calculatedOpacity) > 0.01) {
            lastOpacity.current = calculatedOpacity;
            setOpacity(calculatedOpacity);
        }
    }, [appearRatio, visibleRatio]);

    useScroll(onScroll);

    useEffect(() => {
        if (!element.current) return;

        intersectionObserver.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    isIntersecting.current = entry.isIntersecting;
                    if (entry.isIntersecting) {
                        onScroll();
                    }
                });
            },
            {
                rootMargin: "300px", // Start tracking 300px before entering viewport
            },
        );

        intersectionObserver.current.observe(element.current);
        onScroll();

        return () => {
            if (intersectionObserver.current) {
                intersectionObserver.current.disconnect();
            }
        };
    }, [onScroll]);

    return (
        <div
            {...props}
            ref={element}
            className={className}
            style={{
                opacity: opacity,
                transform: `translateY(${(1 - opacity) * height * 0.2}px)`,
            }}
        >
            {children}
        </div>
    );
};

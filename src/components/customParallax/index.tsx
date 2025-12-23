import React, { useEffect, useRef, useState, useCallback } from "react";

export interface ParallaxCallbackProps {
    screenHeight: number;
    top: number;
    bottom: number;
    center: number;
    visibility: number;
    isVisible: boolean;
}

export interface CustomParallaxProps {
    styleGetter?: (props: ParallaxCallbackProps) => React.CSSProperties;
    onUpdate?: (props: ParallaxCallbackProps) => void;
}

let rafId: number | null = null;
const scrollCallbacks = new Set<() => void>();

const handleScroll = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
        scrollCallbacks.forEach((callback) => callback());
        rafId = null;
    });
};

if (typeof window !== "undefined") {
    window.addEventListener("scroll", handleScroll, { passive: true });
}

export const CustomParallax: React.FC<CustomParallaxProps & any> = ({
    children,
    styleGetter,
    onUpdate,
    ...props
}) => {
    const element = useRef<HTMLDivElement | null>(null);
    const [style, setStyle] = useState<React.CSSProperties>();
    const intersectionObserver = useRef<IntersectionObserver | null>(null);
    const isIntersecting = useRef(false);
    const lastParams = useRef<ParallaxCallbackProps | null>(null);

    const updateScroll = useCallback(() => {
        if (!element.current || !isIntersecting.current) return;

        const rect = element.current.getBoundingClientRect();
        const top = Math.round(rect.top);
        const screenHeight = window.innerHeight;
        const bottom = Math.round(
            window.innerHeight - (rect.top + rect.height),
        );
        const center = Math.round(bottom - rect.height / 2);
        const isVisible = bottom > 0 && top > 0;
        const relativeTop = top / screenHeight;
        const relativeBottom = bottom / screenHeight;
        const visibility = Math.max(
            1 +
                (relativeTop < 0 ? relativeTop : 0) +
                (relativeBottom < 0 ? relativeBottom : 0),
            0,
        );
        const parameter: ParallaxCallbackProps = {
            screenHeight,
            isVisible,
            visibility,
            top,
            bottom,
            center,
        };

        // Only update if values changed significantly
        const last = lastParams.current;
        if (
            !last ||
            Math.abs(last.top - parameter.top) > 1 ||
            Math.abs(last.bottom - parameter.bottom) > 1 ||
            Math.abs(last.center - parameter.center) > 1
        ) {
            lastParams.current = parameter;
            if (onUpdate) onUpdate(parameter);
            if (styleGetter) setStyle(styleGetter(parameter));
        }
    }, [onUpdate, styleGetter]);

    useEffect(() => {
        if (!element.current) return;

        // Use Intersection Observer to only track when element is near viewport
        intersectionObserver.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    isIntersecting.current = entry.isIntersecting;
                    if (entry.isIntersecting) {
                        updateScroll();
                        scrollCallbacks.add(updateScroll);
                    } else {
                        scrollCallbacks.delete(updateScroll);
                    }
                });
            },
            {
                rootMargin: "200px", // Start tracking 200px before entering viewport
            },
        );

        intersectionObserver.current.observe(element.current);
        updateScroll();

        return () => {
            if (intersectionObserver.current) {
                intersectionObserver.current.disconnect();
            }
            scrollCallbacks.delete(updateScroll);
        };
    }, [updateScroll]);

    return (
        <div ref={element} {...props}>
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { style }),
            )}
        </div>
    );
};

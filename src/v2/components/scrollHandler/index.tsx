import React, { useEffect, useRef } from "react";

export * from "./useActivation";

export type ScrollData = {
    y: number;
    direction: number;
    progress: number;
    vh: number;
    totalHeight: number;
};

type ScrollCallback = (data: ScrollData) => void;

const scrollCallbacks = new Set<ScrollCallback>();

/**
 * Hook to subscribe to global scroll events.
 * The callback receives the current scroll data on every frame (via RAF).
 */
export const useScroll = (callback: ScrollCallback): void => {
    useEffect(() => {
        scrollCallbacks.add(callback);
        return () => {
            scrollCallbacks.delete(callback);
        };
    }, [callback]);
};

/**
 * ScrollHandler Component
 *
 * This component should be mounted once at the top level (e.g., in _app.tsx).
 * It handles the single global scroll event listener and updates body CSS variables:
 * --scroll-y: Current vertical scroll position in pixels
 * --scroll-direction: 1 for scrolling down, -1 for up
 * --scroll-progress: Scroll progress from 0 to 1
 * --vh: Current viewport height in pixels
 * --total-height: Total scrollable height of the document
 */
export const ScrollHandler: React.FC = () => {
    const lastY = useRef(0);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const update = () => {
            const y = window.scrollY;
            const vh = window.innerHeight;
            const totalHeight = document.documentElement.scrollHeight;
            const progress = vh > 0 ? y / vh : 0;
            const direction = y > lastY.current ? 1 : -1;

            const data: ScrollData = {
                y,
                direction,
                progress,
                vh,
                totalHeight,
            };

            // Update body CSS variables
            document.body.style.setProperty("--scroll-y", `${y}px`);
            document.body.style.setProperty("--progress", `${progress}`);

            // Notify subscribers
            scrollCallbacks.forEach((cb) => cb(data));

            lastY.current = y;
            rafId.current = null;
        };

        const onScroll = () => {
            if (rafId.current === null) {
                rafId.current = requestAnimationFrame(update);
            }
        };

        const onResize = () => {
            if (rafId.current === null) {
                rafId.current = requestAnimationFrame(update);
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });

        // Initial update
        update();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            if (rafId.current !== null) {
                cancelAnimationFrame(rafId.current);
            }
        };
    }, []);

    return null; // This component doesn't render anything
};

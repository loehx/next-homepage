import { useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * Hook that reads the 'pos' parameter from URL hash or query string
 * and scrolls to the corresponding position.
 * 
 * Position format: 0.0-1.0 = page 1, 1.0-2.0 = page 2, etc.
 * Example: #pos=2.5 scrolls to middle of page 3
 * 
 * @param duration - Scroll animation duration in ms (default: 300)
 */
export const useUrlPositionScroll = (duration: number = 300) => {
    const lenis = useLenis();

    useEffect(() => {
        if (!lenis) return;

        const getPositionFromUrl = (): number | null => {
            // Check hash first (e.g., #pos=2.5)
            const hash = window.location.hash;
            const hashMatch = hash.match(/[#&]pos=([0-9.]+)/);
            if (hashMatch) {
                return parseFloat(hashMatch[1]);
            }

            // Check query string (e.g., ?pos=2.5)
            const search = window.location.search;
            const queryMatch = search.match(/[?&]pos=([0-9.]+)/);
            if (queryMatch) {
                return parseFloat(queryMatch[1]);
            }

            return null;
        };

        const scrollToPosition = (pos: number) => {
            // pos = 0 means no scrolling
            if (pos === 0) return;

            // Calculate target scroll position
            // Each "page" is one viewport height
            const viewportHeight = window.innerHeight;
            const targetScroll = pos * viewportHeight;

            // Scroll with duration
            lenis.scrollTo(targetScroll, {
                duration: duration / 1000, // Lenis uses seconds
                immediate: false,
            });
        };

        // Small delay to ensure page is fully loaded
        const timeoutId = setTimeout(() => {
            const position = getPositionFromUrl();
            if (position !== null) {
                scrollToPosition(position);
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [lenis, duration]);
};

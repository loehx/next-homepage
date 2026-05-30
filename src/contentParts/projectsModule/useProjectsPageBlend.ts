import { useLayoutEffect, useRef, useState, type RefObject } from "react";

/**
 * Dark mode is active while the projects section overlaps the viewport.
 *
 * The corridor band is expressed as fractions of the viewport height:
 * - CORRIDOR_BOTTOM_FRAC: where dark mode BEGINS as the section enters from the
 *   bottom (checked against rect.top). Higher = starts earlier/lower on screen.
 * - CORRIDOR_TOP_FRAC: where dark mode ENDS as the section exits past the top
 *   (checked against rect.bottom). 0 = stays dark until the section is fully
 *   scrolled off the top; negative values keep it dark even after it leaves.
 */
const CORRIDOR_TOP_FRAC = 0;
const CORRIDOR_BOTTOM_FRAC = 0.9;

function isInCorridor(rect: DOMRect, vh: number): boolean {
    const bandTop = vh * CORRIDOR_TOP_FRAC;
    const bandBottom = vh * CORRIDOR_BOTTOM_FRAC;
    // Dark mode when projects section is overlapping the viewport
    // (with a small top buffer, ends as soon as section scrolls out bottom)
    return rect.bottom > bandTop && rect.top < bandBottom;
}

/** True if the section is within +/- 1 viewport height for lazy-mounting decorations. */
const NEAR_FRAC = 1;
function isNearViewport(rect: DOMRect, vh: number): boolean {
    return rect.bottom > -vh * NEAR_FRAC && rect.top < vh * (1 + NEAR_FRAC);
}

const ATTR = "data-dark-corridor";

/**
 * Toggles `data-dark-corridor` attribute on `document.documentElement` when
 * the projects section enters/exits the viewport corridor. CSS handles the
 * transition using custom properties that switch between light/dark values.
 *
 * Returns `{ isNearViewport }` so callers can lazy-mount heavy decorations
 * (e.g. canvas animations) only when the section is close to view.
 */
export function useProjectsPageBlend(ref: RefObject<HTMLElement | null>): {
    isNearViewport: boolean;
} {
    const lastRef = useRef<boolean | null>(null);
    const lastNearRef = useRef<boolean | null>(null);
    const [nearState, setNearState] = useState(false);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || typeof window === "undefined") return;
        const root = document.documentElement;

        const update = () => {
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;

            // Dark corridor toggle
            const next = isInCorridor(rect, vh);
            if (next !== lastRef.current) {
                lastRef.current = next;
                if (next) {
                    root.setAttribute(ATTR, "");
                } else {
                    root.removeAttribute(ATTR);
                }
            }

            // Near viewport state for lazy mount
            const nextNear = isNearViewport(rect, vh);
            if (nextNear !== lastNearRef.current) {
                lastNearRef.current = nextNear;
                setNearState(nextNear);
            }
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update, { passive: true });
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
            lastRef.current = null;
            lastNearRef.current = null;
            root.removeAttribute(ATTR);
        };
    }, [ref]);

    return { isNearViewport: nearState };
}

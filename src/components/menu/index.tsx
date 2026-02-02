import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
} from "react";
import { useLenis } from "lenis/react";
import { MenuButton } from "./MenuButton";
import { MenuOverlay } from "./MenuOverlay";

export const Menu: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollPos, setScrollPos] = useState(0);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const lenis = useLenis();
    const requestRef = useRef<number>();

    const updateScroll = useCallback((pos: number) => {
        setScrollPos((prev) => {
            // Only update if difference is significant to avoid micro-renders
            if (Math.abs(prev - pos) < 0.5) return prev;
            return pos;
        });
    }, []);

    useEffect(() => {
        if (!lenis) {
            const handleScroll = () => {
                if (requestRef.current)
                    cancelAnimationFrame(requestRef.current);
                requestRef.current = requestAnimationFrame(() => {
                    updateScroll(window.scrollY);
                });
            };
            window.addEventListener("scroll", handleScroll, { passive: true });
            updateScroll(window.scrollY);
            return () => {
                window.removeEventListener("scroll", handleScroll);
                if (requestRef.current)
                    cancelAnimationFrame(requestRef.current);
            };
        }

        const handleScroll = (e: any) => {
            updateScroll(e.scroll);
        };

        lenis.on("scroll", handleScroll);
        updateScroll(lenis.scroll);

        return () => {
            lenis.off("scroll", handleScroll);
        };
    }, [lenis, updateScroll]);

    const vh = typeof window !== "undefined" ? window.innerHeight : 1;

    // Memoize derived values to prevent child re-renders
    const activeItemIndex = useMemo(
        () => Math.round(scrollPos / vh),
        [scrollPos, vh],
    );
    
    const shouldBeVisible = useMemo(
        () => scrollPos / vh >= 0.99,
        [scrollPos, vh],
    ); // 0.99 to be a bit more forgiving
    
    useEffect(() => {
        if (shouldBeVisible && !hasBeenVisible) {
            setHasBeenVisible(true);
        }
    }, [shouldBeVisible, hasBeenVisible]);
    
    const isButtonVisible = useMemo(
        () => hasBeenVisible || shouldBeVisible,
        [hasBeenVisible, shouldBeVisible],
    );

    const handleToggleMenu = useCallback(() => {
        setIsMenuOpen((prev) => !prev);
    }, []);

    const handleCloseMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    const handleItemClick = useCallback(
        (targetPos: number) => {
            if (!lenis) return;

            const scrollTarget =
                targetPos === 999
                    ? document.documentElement.scrollHeight
                    : targetPos * window.innerHeight;

            lenis.scrollTo(scrollTarget, {
                duration: 1.2,
                onComplete: () => {
                    setIsMenuOpen(false);
                },
            });
        },
        [lenis],
    );

    return (
        <>
            {isButtonVisible && (
                <MenuButton
                    isOpen={isMenuOpen}
                    onClick={handleToggleMenu}
                    className="fixed bottom-[2vh] right-[2vw] z-[1001]"
                />
            )}
            <MenuOverlay
                isOpen={isMenuOpen}
                onClose={handleCloseMenu}
                onItemClick={handleItemClick}
                activeItemIndex={activeItemIndex}
            />
        </>
    );
};

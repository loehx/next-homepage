import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import { useLenis } from "lenis/react";
import { Logo } from "./index";
import styles from "./LogoWrapper.module.css";

export const LogoWrapper: FC = () => {
    const [scrollPos, setScrollPos] = useState(0);
    const [hasBeenVisible, setHasBeenVisible] = useState(false);
    const lenis = useLenis();
    const requestRef = useRef<number>();

    const updateScroll = useCallback((pos: number) => {
        setScrollPos((prev) => {
            if (Math.abs(prev - pos) < 0.5) return prev;
            return pos;
        });
    }, []);

    useEffect(() => {
        if (!lenis) {
            const handleScroll = () => {
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
                requestRef.current = requestAnimationFrame(() => {
                    updateScroll(window.scrollY);
                });
            };
            window.addEventListener("scroll", handleScroll, { passive: true });
            updateScroll(window.scrollY);
            return () => {
                window.removeEventListener("scroll", handleScroll);
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
            };
        }

        const handleScroll = (e: any) => updateScroll(e.scroll);
        lenis.on("scroll", handleScroll);
        updateScroll(lenis.scroll);
        return () => {
            lenis.off("scroll", handleScroll);
        };
    }, [lenis, updateScroll]);

    const vh = typeof window !== "undefined" ? window.innerHeight : 1;
    const shouldBeVisible = scrollPos / vh >= 0.5;

    useEffect(() => {
        if (shouldBeVisible && !hasBeenVisible) {
            setHasBeenVisible(true);
        }
    }, [shouldBeVisible, hasBeenVisible]);

    const isVisible = hasBeenVisible || shouldBeVisible;

    return (
        <div className={`${styles.logoWrapper} ${isVisible ? styles.visible : ""}`}>
            <Logo className={styles.logo} />
        </div>
    );
};

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./stage.module.css";
import { useIsMobile } from "src/hooks";
import { AssetEntry } from "data/definitions";
import { AvailabilityStatus } from "@components/availabilityStatus";
import { Window } from "@components/window";
import { Image } from "@components/image";
import cx from "classnames";
import { BubblesAnimation } from "./BubbleAnimation";
import { AnimatedWaves } from "./AnimatedWaves";

// Three.js doesn't play nicely with SSR, so we client-only this.
const Phone3D = dynamic(() => import("./Phone3D"), {
    ssr: false,
});

export interface StageProps {
    id: string;
    type: string;
    h1: string;
    h2: string;
    phoneImage: AssetEntry;
    logo: AssetEntry;
    logoWidth: number;
    backgroundImage: AssetEntry;
    backgroundVideo: AssetEntry;
    text: string;
    availableFrom: string;
}

export const Stage: React.FC<StageProps> = (props) => {
    const isMobile = useIsMobile(true);
    const [loading, setLoading] = useState(true);
    const [phoneModelLoaded, setPhoneModelLoaded] = useState(false);
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [windowSize, setWindowSize] = useState(() => ({
        width: typeof window !== "undefined" ? window.innerWidth : 1200,
        height: typeof window !== "undefined" ? window.innerHeight : 1000,
    }));
    const w = typeof window !== "undefined" ? window : { innerHeight: 1000 };

    useEffect(() => {
        const isBackgroundReady =
            !props.backgroundImage?.url || backgroundLoaded;
        const isPhoneReady = !props.phoneImage?.url || phoneModelLoaded;

        if (isBackgroundReady && isPhoneReady) {
            setLoading(false);
        }
    }, [
        phoneModelLoaded,
        backgroundLoaded,
        props.backgroundImage?.url,
        props.phoneImage?.url,
    ]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3000); // Safety timeout

        // Throttle scroll-driven state updates to one per animation frame so
        // we don't kick off a React reconciliation for every single scroll
        // tick (Safari can fire those much faster than rAF).
        let scrollRaf: number | null = null;
        const onScroll = () => {
            if (scrollRaf !== null) return;
            scrollRaf = requestAnimationFrame(() => {
                scrollRaf = null;
                setScrollY(window.scrollY);
            });
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        const onResize = () =>
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div
            className={cx(styles.stage, loading && styles.initializing)}
            style={
                {
                    "--scroll": scrollY / (w.innerHeight / 2),
                } as React.CSSProperties
            }
        >
            <div className={styles.background}>
                {props.backgroundImage?.url && (
                    <Image
                        asset={props.backgroundImage}
                        alt="Background Image"
                        sizes="(min-width: 700px) 100vw, 200vw"
                        priority
                        onLoadingComplete={() => setBackgroundLoaded(true)}
                    />
                )}
                {!isMobile && props.backgroundVideo?.url && (
                    <video
                        src={props.backgroundVideo.url}
                        loop
                        autoPlay
                        muted
                        controls={false}
                    ></video>
                )}
                {!props.backgroundVideo?.url && !props.backgroundImage?.url && (
                    <BubblesAnimation />
                )}
            </div>
            <div
                className={styles.inner}
                style={{
                    transform:
                        windowSize.width > windowSize.height &&
                        windowSize.height < 950
                            ? "scale(0.8)"
                            : undefined,
                }}
            >
                <div className={styles.intro}>
                    {props.logo && (
                        <div className={styles.logo}>
                            <img
                                src={props.logo.url}
                                alt={props.logo.name}
                                width={props.logoWidth}
                                height={
                                    props.logo.height &&
                                    props.logo.width &&
                                    (props.logoWidth / props.logo.width) *
                                        props.logo.height
                                }
                                style={{
                                    transform: `translate3d(${scrollY}px,${-scrollY}px,0px)`,
                                }}
                            />
                        </div>
                    )}
                    {props.h2 && <h2 className={styles.h2}>{props.h2}</h2>}
                    {props.h1 && <h1 className={styles.h1}>{props.h1}</h1>}
                    {props.text && (
                        <Window
                            className={styles.description}
                            text={props.text}
                        />
                    )}
                </div>
                {props.phoneImage && (
                    <div className={styles.phoneWrapper}>
                        <div
                            className={styles.phone}
                            aria-label={props.phoneImage.description}
                            style={{
                                filter: `brightness(${
                                    1 - scrollY / (w.innerHeight / 2)
                                })`,
                            }}
                        >
                            <Phone3D
                                imageUrl={props.phoneImage.url}
                                onLoad={() => setPhoneModelLoaded(true)}
                            />
                        </div>
                        {props.availableFrom && (
                            <div className={styles.availability}>
                                <AvailabilityStatus
                                    availableFrom={props.availableFrom}
                                    subtractDays={Math.round(-scrollY / 10)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className={styles.waves}>
                <AnimatedWaves />
            </div>
        </div>
    );
};

export default Stage;

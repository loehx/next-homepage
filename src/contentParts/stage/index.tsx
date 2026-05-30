import React, {
    useEffect,
    useState,
    useCallback,
    useRef,
    useLayoutEffect,
} from "react";
import styles from "./stage.module.css";
import phoneFrameSrc from "./phone-frame.webp";
import { useIsMobile } from "src/hooks";
import { AssetEntry } from "data/definitions";
import { AvailabilityStatus } from "@components/availabilityStatus";
import { Window } from "@components/window";
import { Image } from "@components/image";
import cx from "classnames";
import { BubblesAnimation } from "./BubbleAnimation";
import { AnimatedWaves } from "./AnimatedWaves";
import { StageInput } from "./StageInput";

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
    const [phoneFrameLoaded, setPhoneFrameLoaded] = useState(false);
    const [phoneImageLoaded, setPhoneImageLoaded] = useState(false);
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [windowSize, setWindowSize] = useState(() => ({
        width: typeof window !== "undefined" ? window.innerWidth : 1200,
        height: typeof window !== "undefined" ? window.innerHeight : 1000,
    }));
    const [aiAnswer, setAiAnswer] = useState<string | null>(null);
    const [aiActivated, setAiActivated] = useState(false);
    const [agentEnabled, setAgentEnabled] = useState(false);
    const [windowMinSize, setWindowMinSize] = useState<{
        width: number;
        height: number;
    } | null>(null);
    const windowSizerRef = useRef<HTMLDivElement>(null);
    const w = typeof window !== "undefined" ? window : { innerHeight: 1000 };

    // Feature flag: AI chat input is hidden unless the page is opened with
    // ?agent=true. Read from the URL on mount (client-only, since this is a
    // statically exported Next.js site).
    useEffect(() => {
        if (typeof window === "undefined") return;
        const params = new URLSearchParams(window.location.search);
        setAgentEnabled(params.get("agent") === "true");
    }, []);

    const handleAnswer = useCallback((answer: string) => {
        setAiAnswer(answer);
    }, []);

    const handleReset = useCallback(() => {
        setAiAnswer(null);
        setAiActivated(false);
    }, []);

    useEffect(() => {
        const isBackgroundReady =
            !props.backgroundImage?.url || backgroundLoaded;
        const isPhoneReady =
            !props.phoneImage?.url || (phoneFrameLoaded && phoneImageLoaded);

        if (isBackgroundReady && isPhoneReady) {
            setLoading(false);
        }
    }, [
        phoneFrameLoaded,
        phoneImageLoaded,
        backgroundLoaded,
        props.backgroundImage?.url,
        props.phoneImage?.url,
    ]);

    // Lock the Window to whatever dimensions the description text naturally
    // occupies on the first render, so swapping its content (init spinner,
    // input + suggestions, answer) never makes the box collapse or jump in
    // either direction. The whole flex chain (intro -> descriptionWrapper ->
    // Window) is content-sized on desktop, so without this the box shrinks
    // both horizontally and vertically when the AI content is narrower than
    // the description text.
    useLayoutEffect(() => {
        if (aiActivated) return;
        if (loading) return;
        if (!windowSizerRef.current) return;
        const { offsetWidth, offsetHeight } = windowSizerRef.current;
        if (offsetWidth > 0 && offsetHeight > 0) {
            setWindowMinSize({ width: offsetWidth, height: offsetHeight });
        }
    }, [loading, aiActivated, props.text]);

    useEffect(() => {
        if (aiActivated) return;
        const onResize = () => {
            if (!windowSizerRef.current) return;
            const { offsetWidth, offsetHeight } = windowSizerRef.current;
            if (offsetWidth > 0 && offsetHeight > 0) {
                setWindowMinSize({
                    width: offsetWidth,
                    height: offsetHeight,
                });
            }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [aiActivated]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3000); // Safety timeout

        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", onScroll);

        const onResize = () =>
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
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
                        !(aiActivated && isMobile) &&
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
                        <div className={styles.descriptionWrapper}>
                            <div
                                ref={windowSizerRef}
                                className={styles.windowSizer}
                                style={
                                    aiActivated && windowMinSize
                                        ? {
                                              minWidth: windowMinSize.width,
                                              minHeight: windowMinSize.height,
                                          }
                                        : undefined
                                }
                            >
                                <Window
                                    className={styles.description}
                                    text={
                                        aiActivated
                                            ? aiAnswer || undefined
                                            : props.text
                                    }
                                    onClose={
                                        aiActivated ? handleReset : undefined
                                    }
                                    style={
                                        aiActivated && windowMinSize
                                            ? {
                                                  minWidth: windowMinSize.width,
                                                  minHeight:
                                                      windowMinSize.height,
                                              }
                                            : undefined
                                    }
                                >
                                    {aiActivated && (
                                        <StageInput onAnswer={handleAnswer} />
                                    )}
                                </Window>
                            </div>
                            {agentEnabled && !aiActivated && (
                                <div className={styles.wakeUpRow}>
                                    <button
                                        type="button"
                                        onClick={() => setAiActivated(true)}
                                        className={styles.wakeUpButton}
                                    >
                                        <span
                                            className={styles.wakeUpDot}
                                            aria-hidden
                                        ></span>
                                        Talk to my AI Agent
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {props.phoneImage && (
                    <div className={styles.phoneWrapper}>
                        <div
                            className={styles.phone}
                            aria-label={props.phoneImage.description}
                        >
                            <div
                                className={`${styles.avatar} w-full h-full relative overflow-hidden rounded`}
                            >
                                <div
                                    className="w-full h-full"
                                    style={{
                                        filter: `brightness(${
                                            1 - scrollY / (w.innerHeight / 2)
                                        })`,
                                    }}
                                >
                                    <Image
                                        asset={props.phoneImage}
                                        priority
                                        alt="profile picture of me outside looking slightly up"
                                        sizes="(min-width: 768px) 100px, 200px"
                                        onLoadingComplete={() =>
                                            setPhoneImageLoaded(true)
                                        }
                                    />
                                </div>
                            </div>
                            <Image
                                src={phoneFrameSrc}
                                alt={"iphone frame"}
                                sizes="(min-width: 768px) 100px, 200px"
                                priority
                                onLoadingComplete={() =>
                                    setPhoneFrameLoaded(true)
                                }
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

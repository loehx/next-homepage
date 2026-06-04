import React, { useEffect, useState, useCallback } from "react";
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
    const [aiQuestion, setAiQuestion] = useState<string | null>(null);
    const [warmupText, setWarmupText] = useState<string | null>(null);
    const [warmupReady, setWarmupReady] = useState(false);
    const [aiActivated, setAiActivated] = useState(false);
    // Soft launch: the AI chat is now always available. It used to be gated
    // behind a ?agent=true URL flag; that gate has been removed so the
    // "Talk to my AI Agent" entry point shows for every visitor.
    const agentEnabled = true;
    const w = typeof window !== "undefined" ? window : { innerHeight: 1000 };

    const handleQuestionSubmit = useCallback((question: string) => {
        setAiQuestion(question);
        setAiAnswer(null);
    }, []);

    const handleAnswer = useCallback((question: string, answer: string) => {
        setAiQuestion(question);
        setAiAnswer(answer);
    }, []);

    const handleReset = useCallback(() => {
        setAiAnswer(null);
        setAiQuestion(null);
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
                            <Window
                                className={styles.description}
                                text={
                                    aiActivated
                                        ? aiAnswer
                                            ? `> ${aiQuestion}\n\n${aiAnswer}`
                                            : aiQuestion
                                            ? `> ${aiQuestion}`
                                            : warmupText ?? undefined
                                        : props.text
                                }
                                dimQuestion={
                                    aiActivated &&
                                    (aiAnswer !== null || warmupReady)
                                }
                                onClose={aiActivated ? handleReset : undefined}
                            >
                                {aiActivated && (
                                    <StageInput
                                        onQuestionSubmit={handleQuestionSubmit}
                                        onAnswer={handleAnswer}
                                        hasActiveConversation={
                                            aiQuestion !== null
                                        }
                                        onWarmupTextChange={setWarmupText}
                                        onWarmupReadyChange={setWarmupReady}
                                    />
                                )}
                            </Window>
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
                                        sizes="(min-width: 800px) 300px, 100px"
                                        onLoadingComplete={() =>
                                            setPhoneImageLoaded(true)
                                        }
                                    />
                                </div>
                            </div>
                            <Image
                                src={phoneFrameSrc}
                                alt={"iphone frame"}
                                sizes="(min-width: 800px) 300px, 100px"
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

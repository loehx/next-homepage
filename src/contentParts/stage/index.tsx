import React, { useEffect, useMemo, useState } from "react";
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
    const [scrollY, setScrollY] = useState(0);
    const w = typeof window !== "undefined" ? window : { innerHeight: 1000 };

    useEffect(() => {
        setTimeout(
            () => setLoading(false),
            500 /* Entry animation: set this to 6000ms or so */,
        );

        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", onScroll);

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return (
        <div className={cx(styles.stage, loading && styles.initializing)}>
            <div className={styles.background}>
                {props.backgroundImage?.url && (
                    <Image
                        asset={props.backgroundImage}
                        alt="Background Image"
                        sizes="(min-width: 700px) 100vw, 200vw"
                        onLoadingComplete={() => setLoading(false)}
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
            <div className={styles.inner}>
                <div
                    className={styles.intro}
                    style={
                        {
                            "--scroll": scrollY / (w.innerHeight / 2),
                        } as React.CSSProperties
                    }
                >
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
                                        width={300}
                                    />
                                </div>
                            </div>
                            <Image src={phoneFrameSrc} alt={"iphone frame"} />
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

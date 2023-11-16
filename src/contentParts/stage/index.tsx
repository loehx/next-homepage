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

const CLOSE_MESSAGES = [
    "OH, something went wrong... please try again",
    "Damn, that didn't work... try again",
    "Ah, I have an idea! Please try again!",
    "Damn it! That didn't work either... Well, I will try something new, please give me a second.",
    "Not done yet, please give me another second.",
    "OH REALLY?? .. How fast do you think I am??",
    "YES!!! I think we've made it!",
];

export const Stage: React.FC<StageProps> = (props) => {
    const isMobile = useIsMobile(true);
    const [loading, setLoading] = useState(true);
    const [scrollY, setScrollY] = useState(0);
    const [closeCount, setCloseCount] = useState(0);
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
                    style={{ opacity: 1 - scrollY / (w.innerHeight / 2) }}
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
                            onClose={() => {
                                const cnt = closeCount;
                                setCloseCount(closeCount + 1);
                                alert(CLOSE_MESSAGES[cnt]);
                            }}
                            style={{
                                display: closeCount > 6 ? "none" : undefined,
                            }}
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path
                        fill="#ffffff"
                        fillOpacity="1"
                        d="M0,128L48,138.7C96,149,192,171,288,192C384,213,480,235,576,224C672,213,768,171,864,176C960,181,1056,235,1152,224C1248,213,1344,139,1392,101.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                    <path
                        fill="#ffffff"
                        fillOpacity="0.5"
                        d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,192C672,192,768,224,864,213.3C960,203,1056,149,1152,154.7C1248,160,1344,224,1392,256L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>

                    <path
                        fill="#ffffff"
                        fillOpacity=".5"
                        d="M0,64L48,74.7C96,85,192,107,288,138.7C384,171,480,213,576,224C672,235,768,213,864,208C960,203,1056,213,1152,192C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>

                    <path
                        fill="#ffffff"
                        fillOpacity=".2"
                        d="M0,160L48,149.3C96,139,192,117,288,106.7C384,96,480,96,576,128C672,160,768,224,864,240C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

export default Stage;

import React, { useEffect, useState } from "react";
import styles from "./stage.module.css";
import backgroundVideoSrc from "../../assets/background.mp4";
import backgroundImageSrc from "../../assets/background.png";
import phoneFrameSrc from "./phone-frame.png";
import { RichText, RichTextValue } from "@components/rich-text";

export interface StageProps {
    id: string;
    type: string;
    h1: string;
    h2: string;
    description: RichTextValue;
    phoneImage: {
        name: string;
        url: string;
    };
    logo: {
        name: string;
        url: string;
    };
    logoWidth: number;
}

export const Stage: React.FC<StageProps> = (props) => {
    const [initializing, setInitializing] = useState(true);
    const classNames = [styles.stage];
    if (initializing) classNames.push(styles.initializing);

    console.log(props);

    useEffect(() => {
        setTimeout(() => setInitializing(false));
    }, []);

    return (
        <div className={classNames.join(" ")}>
            <div className={styles.background}>
                <img src={backgroundImageSrc} alt="Background Image" />
                <video
                    src={backgroundVideoSrc}
                    loop
                    autoPlay
                    muted
                    controls={false}
                ></video>
            </div>
            <div className={styles.inner}>
                <div className={styles.intro}>
                    {props.logo && (
                        <div className={styles.logo}>
                            <img
                                src={props.logo.url}
                                alt={props.logo.name}
                                width={props.logoWidth}
                            />
                        </div>
                    )}
                    {props.h2 && <h2 className={styles.h2}>{props.h2}</h2>}
                    {props.h1 && <h1 className={styles.h1}>{props.h1}</h1>}
                    {props.description && (
                        <div className={styles.description}>
                            <RichText {...props.description} />
                        </div>
                    )}
                </div>
                {props.phoneImage && (
                    <div
                        className={styles.phone}
                        style={{
                            backgroundImage: `url(${props.phoneImage.url})`,
                        }}
                    >
                        <img src={phoneFrameSrc} alt={props.phoneImage.name} />
                    </div>
                )}
            </div>
            <div className={styles.waves}>
                <svg
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        className={styles.wavesFill}
                    ></path>
                </svg>
            </div>
        </div>
    );
};

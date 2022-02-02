import React from "react";
import styles from "./stage.module.css";
import backgroundVideoSrc from "./background.mp4";
import backgroundImageSrc from "./background.png";

interface Props {
    id: string;
    type: string;
    h1: string;
    h2: string;
    phoneImage: {
        name: string;
        url: string;
    };
}

export const Stage: React.FC<Props> = (props) => {
    return (
        <div className={styles.stage}>
            <div className={styles.background}>
                <img src={backgroundImageSrc} alt="Background Image" />
                <video
                    className="styles.background"
                    src={backgroundVideoSrc}
                    loop
                    autoPlay
                    controls={false}
                ></video>
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
            <pre>{JSON.stringify(props, null, 3)}</pre>
            <div className={styles.intro}>
                {props.h1 && <h1>{props.h1}</h1>}
                {props.h2 && <h2>{props.h2}</h2>}
            </div>
        </div>
    );
};

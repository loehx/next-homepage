import React, { useEffect, useState } from "react";
import styles from "./footer.module.css";
import backgroundVideoSrc from "../../assets/background.mp4";
import backgroundImageSrc from "../../assets/background.png";
import { RichText, RichTextValue } from "@components/rich-text";
import { PageEntry } from "data/definitions";
import { useInitializeClass } from "src/hooks";

export interface FooterProps {
    id: string;
    type: string;
    name: string;
    text: RichTextValue;
    metaNavigation: PageEntry[];
}

export const Footer: React.FC<FooterProps> = (props) => {
    const classNames = useInitializeClass(styles.initializing, styles.footer);

    return (
        <div className={classNames}>
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
                {props.text && (
                    <div className={styles.text}>
                        <RichText {...props.text} />
                    </div>
                )}
                {props.metaNavigation && (
                    <ul className={styles.metaNav}>
                        {props.metaNavigation.map((item) => (
                            <li key={item.id}>
                                <a href={item.slug}>
                                    {item.teaserTitle || item.title}
                                </a>
                            </li>
                        ))}
                    </ul>
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

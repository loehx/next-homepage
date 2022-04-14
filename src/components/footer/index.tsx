import React, { useEffect, useState } from "react";
import styles from "./footer.module.css";
import { RichText, RichTextValue } from "@components/rich-text";
import { AssetEntry, PageEntry } from "data/definitions";
import { Window } from "@components/window";
import {
    useBrowserDimensions,
    useInitializeClass,
    useIsMobile,
} from "src/hooks";

export interface FooterProps {
    id: string;
    type: string;
    name: string;
    infoText: string;
    metaNavigation: PageEntry[];
    backgroundImage: AssetEntry;
    backgroundVideo: AssetEntry;
}

export const Footer: React.FC<FooterProps> = (props) => {
    const classNames = useInitializeClass(styles.initializing, styles.footer);
    const isMobile = useIsMobile(true);
    return (
        <div className={classNames}>
            <div className={styles.background}>
                <img
                    src={`${props.backgroundImage.url}${
                        isMobile ? "?w=750" : ""
                    }`}
                    alt="Background Image"
                />
                {!isMobile && (
                    <video
                        src={props.backgroundVideo.url}
                        loop
                        autoPlay
                        muted
                        controls={false}
                    ></video>
                )}
            </div>
            <div className={styles.inner}>
                {props.infoText && (
                    <Window className={styles.infoText} text={props.infoText} />
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                    <path
                        fill="#ffffff"
                        fill-opacity=".5"
                        d="M0,128L48,138.7C96,149,192,171,288,192C384,213,480,235,576,224C672,213,768,171,864,176C960,181,1056,235,1152,224C1248,213,1344,139,1392,101.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                    <path
                        fill="#ffffff"
                        fill-opacity="1"
                        d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,192C672,192,768,224,864,213.3C960,203,1056,149,1152,154.7C1248,160,1344,224,1392,256L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>

                    <path
                        fill="#ffffff"
                        fill-opacity=".3"
                        d="M0,64L48,74.7C96,85,192,107,288,138.7C384,171,480,213,576,224C672,235,768,213,864,208C960,203,1056,213,1152,192C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>

                    <path
                        fill="#ffffff"
                        fill-opacity=".2"
                        d="M0,160L48,149.3C96,139,192,117,288,106.7C384,96,480,96,576,128C672,160,768,224,864,240C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

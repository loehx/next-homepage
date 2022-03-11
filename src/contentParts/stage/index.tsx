import React, { useEffect, useState } from "react";
import styles from "./stage.module.css";
import phoneFrameSrc from "./phone-frame.png";
import { RichText, RichTextValue } from "@components/rich-text";
import {
    useBrowserDimensions,
    useInitializeClass,
    useIsMobile,
} from "src/hooks";
import { AssetEntry } from "data/definitions";
import { AvailabilityStatus } from "@components/availabilityStatus";
import { Window } from "@components/window";

export interface StageProps {
    id: string;
    type: string;
    h1: string;
    h2: string;
    description: RichTextValue;
    phoneImage: AssetEntry;
    logo: AssetEntry;
    logoWidth: number;
    backgroundImage: AssetEntry;
    backgroundVideo: AssetEntry;
    text: string;
}

export const Stage: React.FC<StageProps> = (props) => {
    const classNames = useInitializeClass(styles.initializing, styles.stage);
    const isMobile = useIsMobile(true);

    return (
        <div className={classNames}>
            <div className={styles.background}>
                <img
                    src={`${props.backgroundImage.url}${
                        isMobile ? "?h=1335" : ""
                    }`}
                    alt="Background Image"
                />
                {!isMobile && props.backgroundVideo && (
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
                            style={{
                                backgroundImage: `url(${
                                    props.phoneImage.url
                                }?w=${isMobile ? 200 : 400})`,
                            }}
                        >
                            <img
                                src={phoneFrameSrc}
                                alt={props.phoneImage.name}
                            />
                        </div>
                        <div className={styles.availability}>
                            <AvailabilityStatus availableFrom="2022-08-14" />
                        </div>
                    </div>
                )}
            </div>
            <div className={styles.waves}>
                <svg
                    width="100%"
                    height="100%"
                    id="svg"
                    viewBox="0 0 1440 400"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M 0,400 C 0,400 0,133 0,133 C 106.29665071770336,111.47846889952153 212.59330143540672,89.95693779904306 314,96 C 415.4066985645933,102.04306220095694 511.92344497607667,135.65071770334927 613,154 C 714.0765550239233,172.34928229665073 819.712918660287,175.44019138755985 904,157 C 988.287081339713,138.55980861244015 1051.2248803827752,98.58851674641147 1137,91 C 1222.7751196172248,83.41148325358853 1331.3875598086124,108.20574162679426 1440,133 C 1440,133 1440,400 1440,400 Z"
                        stroke="none"
                        strokeWidth="0"
                        fill="#ffffff88"
                    ></path>
                    <path
                        d="M 0,400 C 0,400 0,266 0,266 C 77.24401913875599,279.4162679425838 154.48803827751198,292.8325358851675 263,283 C 371.511961722488,273.1674641148325 511.291866028708,240.08612440191385 612,234 C 712.708133971292,227.91387559808615 774.3444976076556,248.82296650717706 871,262 C 967.6555023923444,275.17703349282294 1099.3301435406697,280.622009569378 1200,280 C 1300.6698564593303,279.377990430622 1370.3349282296651,272.688995215311 1440,266 C 1440,266 1440,400 1440,400 Z"
                        stroke="none"
                        strokeWidth="0"
                        fill="#ffffffff"
                    ></path>
                </svg>
            </div>
        </div>
    );
};

import React, { useEffect, useRef, useState } from "react";
import styles from "./availabilityStatus.module.css";
import { RichText, RichTextValue } from "@components/rich-text";
import { AssetEntry, PageEntry } from "data/definitions";
import {
    useBrowserDimensions,
    useInitializeClass,
    useIsMobile,
} from "src/hooks";
import * as util from "src/util";
import cx from "classnames";

export interface AvailabilityStatusProps {
    availableFrom: string;
}

export const AvailabilityStatus: React.FC<AvailabilityStatusProps> = (
    props,
) => {
    const classNames = useInitializeClass(
        styles.initializing,
        styles.availabilityStatusWrapper,
    );
    const daysUntilAvailable = util.daysUntil(props.availableFrom);
    const isAvailable = daysUntilAvailable <= 0;
    const [secondsUntil, setSecondsUntil] = useState(0);

    useEffect(() => {
        const interval = setInterval(
            () => setSecondsUntil(util.secondsUntilMidnight()),
            1000,
        );
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={classNames}>
            <div
                className={cx(
                    styles.availabilityStatus,
                    isAvailable && styles.available,
                )}
            >
                {isAvailable && (
                    <div className={styles.availableText}>
                        <span>Available</span>
                    </div>
                )}
                {!isAvailable && (
                    <div className={styles.daysUntilAvailable}>
                        <span>Available in</span>
                        <span>{daysUntilAvailable}</span>
                        <span>days</span>
                        <span>... and {secondsUntil} seconds</span>
                    </div>
                )}
            </div>
        </div>
    );
};

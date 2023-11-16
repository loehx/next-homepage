import React, { useEffect, useMemo, useState } from "react";
import styles from "./availabilityStatus.module.css";
import { useInitializeClass } from "src/hooks";
import { format, parseISO } from "date-fns";
import cx from "classnames";
import { Tooltip } from "@components/tooltip";

export interface AvailabilityStatusProps {
    availableFrom: string;
    subtractDays?: number;
}

export const AvailabilityStatus: React.FC<AvailabilityStatusProps> = (
    props,
) => {
    const classNames = useInitializeClass(
        styles.initializing,
        styles.availabilityStatusWrapper,
    );

    const daysUntilAvailable = useMemo(() => {
        return daysUntil(props.availableFrom) + (props.subtractDays || 0);
    }, [props.subtractDays]);
    const isAvailable = daysUntilAvailable <= 0;
    const [secondsUntil, setSecondsUntil] = useState(0);

    useEffect(() => {
        const interval = setInterval(
            () => setSecondsUntil(secondsUntilMidnight()),
            1000,
        );
        return () => clearInterval(interval);
    }, []);

    const tooltip = useMemo(
        () => format(parseISO(props.availableFrom), "MMM dd, yyyy"),
        [props.availableFrom],
    );

    return (
        <Tooltip className={classNames} text={tooltip}>
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
        </Tooltip>
    );
};

function daysUntil(dateString) {
    const date1 = new Date(dateString);
    const date2 = new Date();
    const timeInMilisec = date1.getTime() - date2.getTime();
    return Math.ceil(timeInMilisec / (1000 * 60 * 60 * 24));
}

function secondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
    );
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

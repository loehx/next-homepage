import React from "react";
import styles from "./timeline.module.css";
import { bootstrapEntries, TimelineProps } from "./core";
import { TimelineEntry } from "./entry";

export const Timeline: React.FC<TimelineProps> = ({ entries }) => {
    const bootstrappedEntries = bootstrapEntries(entries);
    const { yearsTotal } = bootstrappedEntries[0];

    return (
        <div className="container mx-auto px-4 mb-14">
            <div className={styles.inner}>
                <div
                    className="relative mt-10"
                    style={{ height: `${yearsTotal * 80}px` }}
                >
                    {bootstrappedEntries.map((entry) => (
                        <TimelineEntry key={entry.id} {...entry} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timeline;

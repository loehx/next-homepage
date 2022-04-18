import React, { useEffect, useState } from "react";
import styles from "./timeline.module.css";
import { bootstrapEntries, TimelineProps } from "./core";
import { TimelineEntry } from "./entry";
import { FadeIn } from "@components/fadeIn";

export const Timeline: React.FC<TimelineProps> = (props) => {
    const entries = bootstrapEntries(props.entries);
    const { yearsTotal } = entries[0];

    console.table(entries);

    return (
        <div className="container mx-auto px-4">
            <div className={styles.inner}>
                {props.name && (
                    <FadeIn>
                        <h2 className="text-3xl mb-10">{props.name}</h2>
                    </FadeIn>
                )}
                <div
                    className="relative"
                    style={{ height: yearsTotal * 70 + "px" }}
                >
                    {entries.map((entry) => (
                        <TimelineEntry key={entry.id} {...entry} />
                    ))}
                </div>
            </div>
        </div>
    );
};

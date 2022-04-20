import React, { useEffect, useState } from "react";
import styles from "./timeline.module.css";
import { bootstrapEntries, TimelineProps } from "./core";
import { TimelineEntry } from "./entry";
import { FadeIn } from "@components/fadeIn";

export const Timeline: React.FC<TimelineProps> = (props) => {
    const entries = bootstrapEntries(props.entries);
    const { yearsTotal } = entries[0];

    return (
        <div className="container mx-auto px-4 mb-14">
            <div className={styles.inner}>
                {props.name && (
                    <FadeIn>
                        <h2 className="hidden md:block text-3xl">
                            {props.name}
                        </h2>
                    </FadeIn>
                )}
                <div
                    className="relative mt-10"
                    style={{ height: yearsTotal * 80 + "px" }}
                >
                    {entries.map((entry) => (
                        <TimelineEntry key={entry.id} {...entry} />
                    ))}
                </div>
            </div>
        </div>
    );
};

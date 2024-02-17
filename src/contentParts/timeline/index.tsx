import React, { useEffect, useState } from "react";
import styles from "./timeline.module.css";
import { bootstrapEntries, TimelineProps } from "./core";
import { TimelineEntry } from "./entry";
import { Year } from "./year";
import { FadeIn } from "@components/fadeIn";
import { useIsMobile } from "src/hooks";

export const Timeline: React.FC<TimelineProps> = (props) => {
    const entries = bootstrapEntries(props.entries);
    const { yearsTotal, yearFrom } = entries[0];
    const yearsArray = Array.from({ length: yearsTotal + 1 }, (_, i) =>
        Math.floor(yearFrom + i + 1),
    );
    const isMobile = useIsMobile(true);

    return (
        <div className="container mx-auto px-4 mb-14">
            <div className={styles.inner}>
                {/* {props.name && (
                    <FadeIn>
                        <h2 className="hidden md:block text-3xl">
                            {props.name}
                        </h2>
                    </FadeIn>
                )} */}
                <div
                    className="relative mt-10"
                    style={{ height: yearsTotal * 80 + "px" }}
                >
                    {!isMobile &&
                        yearsArray.map((year, index) => (
                            <Year
                                key={`year-${year}`}
                                year={year}
                                index={index}
                                offsetPixel={(yearFrom % 1) * 80}
                                total={yearsTotal}
                            />
                        ))}
                    {entries.map((entry) => (
                        <TimelineEntry key={entry.id} {...entry} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timeline;

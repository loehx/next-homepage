import React, { useEffect, useState } from "react";
import styles from "./timeline.module.css";
import { RichText, RichTextValue } from "@components/rich-text";
import { AssetEntry, Entry } from "data/definitions";
import { bootstrapEntries, TimelineEntryProps, TimelineProps } from "./core";
import { TimelineEntry } from "./entry";

export const Timeline: React.FC<TimelineProps> = (props) => {
    const entries = bootstrapEntries(props.entries);
    const { yearsTotal } = entries[0];

    console.table(entries);

    return (
        <div className="container mx-auto px-4">
            <div className={styles.inner}>
                {props.name && <h2 className="text-3xl">{props.name}</h2>}
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

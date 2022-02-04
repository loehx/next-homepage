import React, { useEffect, useState } from "react";
import styles from "./imageText.module.css";
import { RichText, RichTextValue } from "@components/rich-text";
import { AssetEntry, Entry } from "data/definitions";

export interface ImageTextProps extends Entry {
    id: string;
    type: string;
    name: string;
    text: RichTextValue;
    image: AssetEntry;
    imageRight: boolean;
}

export const ImageText: React.FC<ImageTextProps> = (props) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.inner}>
                {props.h2 && <h2 className={styles.h2}>{props.h2}</h2>}
                <div className={props.imageRight ? styles.imageRight : ""}>
                    <div className={styles.imageWrapper}>
                        <img src={props.image.url} alt={props.image.name} />
                    </div>
                    <div className={styles.textWrapper}>
                        <RichText {...props.text} />
                    </div>
                </div>
            </div>
        </div>
    );
};

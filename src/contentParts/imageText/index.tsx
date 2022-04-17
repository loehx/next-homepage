import React, { useEffect, useState } from "react";
import styles from "./imageText.module.css";
import { RichText, RichTextValue } from "@components/rich-text";
import { AssetEntry, Entry } from "data/definitions";
import cx from "classnames";
import { FadeIn } from "@components/fadeIn";

export interface ImageTextProps extends Entry {
    id: string;
    type: string;
    name: string;
    text: RichTextValue;
    image: AssetEntry;
    imageRight: boolean;
    imageWidth: number;
}

export const ImageText: React.FC<ImageTextProps> = (props) => {
    const imageStyle =
        props.imageWidth > 0
            ? { flexBasis: `${props.imageWidth}%` }
            : undefined;
    return (
        <div className={cx(styles.wrapper, "container")}>
            <FadeIn className={styles.inner}>
                {props.h2 && <h2 className="text-3xl mb-6">{props.h2}</h2>}
                <div className={props.imageRight ? styles.imageRight : ""}>
                    <div className={styles.imageWrapper} style={imageStyle}>
                        <img src={props.image.url} alt={props.image.name} />
                    </div>
                    <div className={styles.textWrapper}>
                        {props.h2 && (
                            <h2 className="text-3xl mb-6">{props.h2}</h2>
                        )}
                        <RichText document={props.text} />
                    </div>
                </div>
            </FadeIn>
        </div>
    );
};

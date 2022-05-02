import React, { useEffect, useState } from "react";
import styles from "./text.module.css";
import backgroundVideoSrc from "../../assets/background.mp4";
import backgroundImageSrc from "../../assets/background.png";
import { RichText, RichTextValue } from "@components/rich-text";
import { PageEntry } from "data/definitions";

export interface TextProps {
    id: string;
    type: string;
    name: string;
    text: RichTextValue;
}

export const Text: React.FC<TextProps> = (props) => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.inner}>
                {props.text && <RichText document={props.text} />}
            </div>
        </div>
    );
};

export default Text;

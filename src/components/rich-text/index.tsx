import React from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";
import styles from "./rich-text.module.css";
export type RichTextValue = Document;

export const RichText: React.FC<RichTextValue> = (document: RichTextValue) => {
    return (
        <div className={styles.wrapper}>
            {documentToReactComponents(document, {
                renderText: (text) =>
                    text
                        .split("\n")
                        .flatMap((text, i) => [i > 0 && <br />, text]),
            })}
        </div>
    );
};

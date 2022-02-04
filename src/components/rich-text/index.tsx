import React from "react";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { Document } from "@contentful/rich-text-types";
import styles from "./rich-text.module.css";
export type RichTextValue = Document;

export const RichText: React.FC<RichTextValue> = (document: RichTextValue) => {
    const html = documentToHtmlString(document, {
        renderNode: {
            ["paragraph"]: (node, next) =>
                `<p>${next(node.content).replace(/\n/g, `</br>`)}</p>`,
        },
    });
    return (
        <div
            className={styles.wrapper}
            dangerouslySetInnerHTML={{ __html: html }}
        ></div>
    );
};

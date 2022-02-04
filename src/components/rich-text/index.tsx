import React from "react";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { Document, INLINES } from "@contentful/rich-text-types";
import styles from "./rich-text.module.css";
export type RichTextValue = Document;

export const RichText: React.FC<RichTextValue> = (document: RichTextValue) => {
    const html = documentToHtmlString(document, {
        renderNode: {
            ["paragraph"]: (node, next) =>
                `<p>${next(node.content).replace(/\n/g, `</br>`)}</p>`,
            [INLINES.ASSET_HYPERLINK]: (node, next) => {
                return `<a href="${
                    node.data.target.fields.file.url
                }" target="_blank">${next(node.content)}</a>`;
            },
        },
    });
    return (
        <div
            className={styles.wrapper}
            dangerouslySetInnerHTML={{ __html: html }}
        ></div>
    );
};

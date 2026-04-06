import React from "react";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { Document, INLINES } from "@contentful/rich-text-types";
import styles from "./rich-text.module.css";
import cx from "classnames";
export type RichTextValue = Document;
interface Props {
    document: RichTextValue;
    darkBackground?: boolean;
    /** Merged with the root wrapper (e.g. blend-aware colors from a parent module). */
    className?: string;
}

export const RichText: React.FC<Props> = (props: Props) => {
    const html = documentToHtmlString(props.document, {
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
            className={cx(
                styles.wrapper,
                props.darkBackground && styles.darkBackground,
                props.className,
            )}
            dangerouslySetInnerHTML={{ __html: html }}
        ></div>
    );
};

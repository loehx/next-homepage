import React from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Document } from "@contentful/rich-text-types";

export type RichTextValue = Document;

export const RichText: React.FC<RichTextValue> = (document: RichTextValue) => {
    return (
        <>
            {documentToReactComponents(document, {
                renderText: (text) =>
                    text
                        .split("\n")
                        .flatMap((text, i) => [i > 0 && <br />, text]),
            })}
        </>
    );
};

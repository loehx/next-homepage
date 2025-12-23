import React, { useEffect, useState } from "react";
import { RichText, RichTextValue } from "@components/rich-text";
import {
    AssetEntry,
    CompanyEntry,
    Entry,
    ProjectEntry,
} from "data/definitions";
import cx from "classnames";
import { FadeIn } from "@components/fadeIn";
import { Image } from "@components/image";

interface Props extends CompanyEntry {
    projects: ProjectEntry[];
}

export const Company: React.FC<Props> = (props) => {
    const onClick = (e) => {
        e.preventDefault();
        document
            .querySelector(`[data-company="${props.id}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <div
            className={"relative group w-[40%] md:w-[20%] md:p-4"}
            style={{ aspectRatio: "16/9" }}
        >
            <FadeIn className="w-full h-full">
                <a
                    aria-label={`Jump to timeline entry`}
                    className="absolute inset-0 cursor-pointer"
                    onClick={onClick}
                >
                    <Image
                        asset={props.logo}
                        alt={`logo of ${props.fullName}`}
                    />
                </a>
            </FadeIn>
        </div>
    );
};

export default Company;

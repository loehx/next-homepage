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
import { Company } from "./company";
export interface CompaniesProps extends Entry {
    id: string;
    title: string;
    companies: CompanyEntry[];
    projects: ProjectEntry[];
}

export const Companies: React.FC<CompaniesProps> = (props) => {
    return (
        <div className={cx("", "container md:-my-10")}>
            <div className={"flex gap-2 flex-wrap justify-center"}>
                {props.companies.map((company) => (
                    <Company
                        {...company}
                        key={company.id}
                        projects={props.projects.filter(
                            (p) => p.company.id === company.id,
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

export default Companies;

import React from "react";
import { CompanyEntry, ProjectEntry } from "data/definitions";
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
            className={
                "relative group w-[100px] md:w-[120px] md:p-4 flex-shrink-0"
            }
            style={{ aspectRatio: "16/9" }}
        >
            <a
                aria-label={`Jump to timeline entry`}
                className="absolute inset-0 cursor-pointer"
                onClick={onClick}
            >
                <Image asset={props.logo} alt={`logo of ${props.fullName}`} />
            </a>
        </div>
    );
};

export default Company;

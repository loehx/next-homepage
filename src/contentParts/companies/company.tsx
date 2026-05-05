import React from "react";
import { CompanyEntry, ProjectEntry } from "data/definitions";
import { Image } from "@components/image";

interface Props extends CompanyEntry {
    projects: ProjectEntry[];
}

export const Company: React.FC<Props> = (props) => {
    return (
        <div
            className={
                "relative group w-[100px] md:w-[120px] md:p-4 flex-shrink-0"
            }
            style={{ aspectRatio: "16/9" }}
        >
            <a
                aria-label={`Visit ${props.fullName} website`}
                className="absolute inset-0 cursor-pointer"
                href={props.url}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                    asset={props.logo}
                    alt={`logo of ${props.fullName}`}
                    sizes="(max-width: 768px) 100px, 120px"
                />
            </a>
        </div>
    );
};

export default Company;

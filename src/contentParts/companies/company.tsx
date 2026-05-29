import React from "react";
import { CompanyEntry, ProjectEntry } from "data/definitions";
import { Image } from "@components/image";

interface Props extends CompanyEntry {
    projects: ProjectEntry[];
}

export const Company: React.FC<Props> = (props) => {
    return (
        <div
            className={"relative group w-[100px] md:w-[200px] flex-shrink-0"}
            style={{ aspectRatio: "1 / 1" }}
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
                    sizes="200px"
                />
            </a>
        </div>
    );
};

export default Company;

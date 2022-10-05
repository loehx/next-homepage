import { ProjectEntry } from "data/definitions";
import styles from "./projectsModule.module.css";
import cx from "classnames";
import { FC, useEffect, useState } from "react";
import { FadeIn } from "@components/fadeIn";
import { Tooltip } from "@components/tooltip";
import { Image } from "@components/image";

interface Props {
    project: ProjectEntry;
    techFilter: string | undefined;
}

export const Project: FC<Props> = ({ project, techFilter }) => {
    const [open, setOpen] = useState<boolean>(false);
    const show = !techFilter
        ? true
        : project.technologies.find((t) => t.id === techFilter) !== undefined;

    const renderDetail = (name: string, value: string, link?: string) =>
        value && (
            <>
                <dt>{name}</dt>
                <dd>
                    {link ? (
                        <a href={link} target="_blank">
                            {value}
                        </a>
                    ) : (
                        value
                    )}
                </dd>
            </>
        );

    useEffect(() => {
        window.dispatchEvent(new Event("scroll"));
    }, [techFilter, open]);

    const fromYear = project.from.split("/")[1];
    const toYear = project.to?.split("/")[1] || "today";
    const fromTo = fromYear === toYear ? fromYear : `${fromYear} - ${toYear}`;

    return (
        <FadeIn
            className={cx(
                styles.project,
                techFilter && (show ? styles.show : styles.hide),
                open && styles.open,
            )}
            key={`${project.id}`}
            id={project.id}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Open" : "Close"}
            aria-expanded={open.toString()}
            tabIndex={0}
        >
            <div className={styles.textWrapper}>
                <h3 className={styles.name}>{project.name}</h3>
                <div className={styles.description}>{project.description}</div>
                <div className={styles.fromTo}>{fromTo}</div>

                {open && (
                    <dl
                        className={styles.details}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {renderDetail(
                            "From / To",
                            project.from + " - " + (project.to || "today"),
                        )}
                        {renderDetail("Description", project.description)}
                        {renderDetail(
                            "Url",
                            project.urlLabel || project.url,
                            project.url,
                        )}
                        {renderDetail("Role", project.role)}
                        {renderDetail("Sector", project.sector)}
                        {renderDetail("Company", project.company.fullName)}
                        {renderDetail("Tech Stack", getTechStack(project))}
                        {renderDetail("Team", project.team)}
                    </dl>
                )}
            </div>
            <div
                className={styles.panelRight}
                onClick={(e) => e.stopPropagation()}
            >
                {open && (
                    <div className={styles.companyLogoWrapper}>
                        {project.company?.logo && (
                            <Tooltip text={project.company?.fullName}>
                                <a
                                    href={project.company?.url}
                                    aria-label={`Visit homepage of ${project.company?.fullName}`}
                                    target="_blank"
                                    className="w-[150px] h-[80px] relative block overflow-hidden"
                                >
                                    <Image
                                        asset={project.company.logo}
                                        alt={`logo of ${project.company.fullName}`}
                                    />
                                </a>
                            </Tooltip>
                        )}
                    </div>
                )}
                <div className={styles.techLogos}>
                    {project.technologies.map((t) => (
                        <Tooltip text={t.fullName} key={t.id}>
                            <a
                                href={t.url}
                                aria-label={`Visit homepage of ${t.fullName}`}
                                target="_blank"
                                className="w-[40px] h-[40px] block"
                            >
                                <Image
                                    asset={t.logo}
                                    alt={`logo of ${t.fullName}`}
                                />
                            </a>
                        </Tooltip>
                    ))}
                </div>
            </div>
        </FadeIn>
    );
};

function getTechStack(project: ProjectEntry): string {
    return [
        ...project.technologies.map((t) => t.fullName),
        ...project.moreTechnologies.split(",").map((t) => t.trim()),
    ].join(", ");
}

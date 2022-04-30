import { ProjectEntry } from "data/definitions";
import styles from "./projectsModule.module.css";
import cx from "classnames";
import { FC, useEffect, useState } from "react";
import { FadeIn } from "@components/fadeIn";
import { Tooltip } from "@components/tooltip";

interface Props {
    project: ProjectEntry;
    techFilter: string | undefined;
}

export const Project: FC<Props> = ({ project, techFilter }) => {
    const [open, setOpen] = useState<boolean>(false);
    const show = !techFilter
        ? true
        : project.technologies.find((t) => t.id === techFilter) !== undefined;

    const renderDetail = (name: string, value: string) =>
        value && (
            <>
                <dt>{name}</dt>
                <dd>{value}</dd>
            </>
        );

    useEffect(() => {
        window.dispatchEvent(new Event("scroll"));
    }, [techFilter]);

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
            tabIndex={0}
        >
            <div className={styles.textWrapper}>
                <div className={styles.name}>{project.name}</div>
                <div className={styles.description}>{project.description}</div>
                <div className={styles.fromTo}>{fromTo}</div>

                {open && (
                    <dl className={styles.details}>
                        {renderDetail(
                            "From / To",
                            project.from + " - " + (project.to || "today"),
                        )}
                        {renderDetail("Description", project.description)}
                        {renderDetail("Role", project.role)}
                        {renderDetail("Sector", project.sector)}
                        {renderDetail("Company", project.company.fullName)}
                        {renderDetail("Tech Stack", getTechStack(project))}
                        {renderDetail("Team", project.team)}
                    </dl>
                )}
            </div>
            <div className={styles.panelRight}>
                {open && (
                    <div className={styles.companyLogoWrapper}>
                        {project.company?.logo && (
                            <Tooltip text={project.company?.fullName}>
                                <img
                                    src={project.company.logo?.url + "?w=300"}
                                    alt={project.company.fullName}
                                    title={project.company.fullName}
                                />
                            </Tooltip>
                        )}
                    </div>
                )}
                <div className={styles.techLogos}>
                    {project.technologies.map((t) => (
                        <Tooltip text={t.fullName} key={t.id}>
                            <img
                                key={t.id}
                                src={t.logo.url + "?w=80"}
                                alt={t.name}
                                title={t.fullName}
                            />
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

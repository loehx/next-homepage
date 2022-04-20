import { ProjectEntry } from "data/definitions";
import styles from "./projectsModule.module.css";
import cx from "classnames";
import { FC, useState } from "react";
import { FadeIn } from "@components/fadeIn";

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

    return (
        <FadeIn
            className={cx(
                styles.project,
                techFilter && (show ? styles.show : styles.hide),
                open && styles.open,
            )}
            key={`${project.id}-${techFilter}`}
            id={project.id}
            onClick={() => setOpen(!open)}
            tabIndex={0}
        >
            <div className={styles.textWrapper}>
                <div className={styles.name}>{project.name}</div>
                <div className={styles.description}>{project.description}</div>
                {!open && (
                    <div className={styles.fromTo}>
                        {project.from} - {project.to || "today"}
                    </div>
                )}

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
                        {renderDetail("Url", project.url)}
                        {renderDetail("Tech Stack", project.moreTechnologies)}
                        {renderDetail("Team", project.team)}
                    </dl>
                )}
            </div>
            <div className={styles.panelRight}>
                {open && (
                    <div className={styles.companyLogoWrapper}>
                        {project.company?.logo && (
                            <img
                                src={project.company.logo?.url + "?w=300"}
                                alt={project.company.fullName}
                                title={project.company.fullName}
                            />
                        )}
                    </div>
                )}
                <div className={styles.techLogos}>
                    {project.technologies.map((t) => (
                        <img
                            key={t.id}
                            src={t.logo.url + "?w=80"}
                            alt={t.name}
                            title={t.fullName}
                        />
                    ))}
                </div>
                {/* <div className={styles.moreTech}>
                      {project.moreTechnologies}
                  </div> */}
            </div>
        </FadeIn>
    );
};

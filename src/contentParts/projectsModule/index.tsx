import { FC, useEffect, useState } from "react";
import { Entry, ProjectEntry, TechnologyEntry } from "data/definitions";
import styles from "./projectsModule.module.css";
import data from "data";
import cx from "classnames";
import { Project } from "./project";
import { FadeIn } from "@components/fadeIn";

export interface ProjectsModuleProps extends Entry {
    name: string;
    title: string;
    links: Array<ProjectEntry>;
    techFilter: Array<TechnologyEntry>;
    projects: Array<ProjectEntry>;
}

export const ProjectsModule: FC<ProjectsModuleProps> = (props) => {
    const { projects } = props;
    const [techFilter, setTechFilter] = useState<string>();

    return (
        <div className={cx(styles.wrapper, "container")}>
            <div className={styles.inner}>
                {props.title && (
                    <FadeIn>
                        <h2 className="text-3xl mb-6">{props.title}</h2>
                    </FadeIn>
                )}
                <FadeIn
                    className={styles.filterBar}
                    aria-label="Filter by technology"
                >
                    {props.techFilter.map((tech) => (
                        <span
                            key={tech.id}
                            className={cx(
                                styles.filter,
                                techFilter === tech.id && styles.active,
                            )}
                            aria-label={`Show only ${tech.fullName} projects`}
                            onClick={() => setTechFilter(tech.id)}
                        >
                            {tech.name}
                        </span>
                    ))}
                    {techFilter && (
                        <span
                            className={cx(styles.filter, styles.reset)}
                            onClick={() => setTechFilter(undefined)}
                            aria-label={`Show all projects`}
                        >
                            &times;
                        </span>
                    )}
                </FadeIn>
                <div className={cx(styles.list, "space-y-4")}>
                    {projects &&
                        projects.map((p) => (
                            <Project
                                project={p}
                                techFilter={techFilter}
                                key={p.id}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

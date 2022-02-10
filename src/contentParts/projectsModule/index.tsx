import { FC, useEffect, useState } from "react";
import { Entry, ProjectEntry, TechnologyEntry } from "data/definitions";
import styles from "./projectsModule.module.css";
import data from "data";
import cx from "classnames";
import { Project } from "./project";

export interface ProjectsModuleProps extends Entry {
    name: string;
    title: string;
    links: Array<ProjectEntry>;
    techFilter: Array<TechnologyEntry>;
}

export const ProjectsModule: FC<ProjectsModuleProps> = (props) => {
    const [projects, setProjects] = useState<ProjectEntry[]>([]);
    const [techFilter, setTechFilter] = useState<string>();

    useEffect(() => {
        data.getProjects().then((p) => setProjects(p as ProjectEntry[]));
    }, []);

    return (
        <div className={styles.wrapper}>
            <div className={styles.inner}>
                {props.title && <h2 className={styles.h2}>{props.title}</h2>}
                <div className={styles.filterBar}>
                    {props.techFilter.map((tech) => (
                        <span
                            key={tech.id}
                            className={cx(
                                styles.filter,
                                techFilter === tech.id && styles.active,
                            )}
                            onClick={() => setTechFilter(tech.id)}
                        >
                            {tech.name}
                        </span>
                    ))}
                    {techFilter && (
                        <span
                            className={cx(styles.filter, styles.reset)}
                            onClick={() => setTechFilter(undefined)}
                        >
                            &times;
                        </span>
                    )}
                </div>
                <ul className={cx(styles.list)}>
                    {projects.map((p) => (
                        <Project
                            project={p}
                            techFilter={techFilter}
                            key={p.id}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};

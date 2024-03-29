import { FC, useEffect, useState } from "react";
import { Entry, ProjectEntry, TechnologyEntry } from "data/definitions";
import styles from "./projectsModule.module.css";
import data from "data";
import cx from "classnames";
import { Project } from "./project";
import { FadeIn } from "@components/fadeIn";
import { Image } from "@components/image";
import { Tooltip } from "@components/tooltip";

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
                        <Tooltip text={tech.fullName} key={tech.id}>
                            <span
                                key={tech.id}
                                className={cx(
                                    styles.filter,
                                    techFilter === tech.id && styles.active,
                                    "w-[45px] h-[45px] block p-[3px] -mx-1",
                                )}
                                aria-label={`Show only ${tech.fullName} projects`}
                                onClick={() =>
                                    setTechFilter(
                                        techFilter === tech.id
                                            ? undefined
                                            : tech.id,
                                    )
                                }
                            >
                                <span className="relative w-full h-full block">
                                    <Image
                                        asset={tech.logo}
                                        alt={`logo of ${tech.fullName}`}
                                        width={30}
                                        fixedRatio
                                    />
                                </span>
                            </span>
                        </Tooltip>
                    ))}
                    {techFilter && (
                        <Tooltip
                            text={"Show all projects"}
                            className={cx(styles.filter, "flex items-center")}
                            onClick={() => setTechFilter(undefined)}
                            aria-label={`Show all projects`}
                        >
                            <span className={cx(styles.reset, styles.filter)}>
                                &times;
                            </span>
                        </Tooltip>
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

export default ProjectsModule;

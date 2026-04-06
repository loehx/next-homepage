import { FC } from "react";
import { Entry, ProjectEntry, TechnologyEntry } from "data/definitions";
import { Project } from "./project";
import { FadeIn } from "@components/fadeIn";
import { TerminalCursor } from "@components/terminalCursor";
import styles from "./projectsModule.module.css";

export interface ProjectsModuleProps extends Entry {
    name: string;
    title: string;
    links: Array<ProjectEntry>;
    techFilter: Array<TechnologyEntry>;
    projects: Array<ProjectEntry>;
}

export const ProjectsModule: FC<ProjectsModuleProps> = (props) => {
    const { projects } = props;

    return (
        <div className="container mx-auto px-4 py-12">
            <FadeIn>
                {props.title && (
                    <div className={styles.headlineSection}>
                        <h2 className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-3xl font-bold text-black">
                            <span className="font-mono text-2xl text-primary-600">
                                &gt;_
                            </span>
                            <span>{props.title}</span>
                            <TerminalCursor />
                        </h2>
                    </div>
                )}
            </FadeIn>
            <div className="flex flex-col">
                {projects &&
                    projects.map((project, index) => (
                        <Project
                            key={project.id}
                            project={project}
                            isLast={index === projects.length - 1}
                        />
                    ))}
            </div>
        </div>
    );
};

export default ProjectsModule;

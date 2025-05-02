import { FC } from "react";
import { Entry, ProjectEntry, TechnologyEntry } from "data/definitions";
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

    return (
        <div className="container mx-auto px-4 py-12">
            <FadeIn>
                {props.title && (
                    <h2 className="text-3xl mb-12">
                        <span className="text-2xl">&gt;_ </span>
                        {props.title}
                    </h2>
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

import { FC, useEffect, useMemo, useState } from "react";
import { Entry, ProjectEntry, TechnologyEntry } from "data/definitions";
import { FadeIn } from "@components/fadeIn";
import { TechnologySkill } from "./TechnologySkill";

export interface TechnologySkillsetProps extends Entry {
    name: string;
    title: string;
    items: Array<TechnologyEntry>;
    projects: Array<ProjectEntry>;
}

export const TechnologySkillset: FC<TechnologySkillsetProps> = (props) => {
    const projectMapping = useMemo(
        () => getProjectMapping(props.projects),
        [props.projects],
    );

    return (
        <div className="container">
            <FadeIn>
                {props.title && (
                    <h2 className="text-3xl mb-6">{props.title}</h2>
                )}
            </FadeIn>
            <div className={``}>
                {props.items.map((item) => (
                    <TechnologySkill
                        key={item.id}
                        {...item}
                        projects={projectMapping[item.id]}
                    />
                ))}
            </div>
        </div>
    );
};

export interface TechProjectMapping {
    [techId: string]: ProjectEntry[];
}

function getProjectMapping(projects: ProjectEntry[]): TechProjectMapping {
    const techProjects = {} as TechProjectMapping;
    for (const project of projects) {
        for (const tech of project.technologies) {
            const mapping = techProjects[tech.id];
            if (mapping) mapping.push(project);
            else techProjects[tech.id] = [project];
        }
    }
    return techProjects;
}

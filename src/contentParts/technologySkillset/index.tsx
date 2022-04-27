import { FC, useEffect, useMemo, useState } from "react";
import { Entry, ProjectEntry, TechnologyEntry } from "data/definitions";
import { FadeIn } from "@components/fadeIn";
import { Skill } from "./skill";
import moment from "moment";

export interface TechnologySkillsetProps extends Entry {
    name: string;
    title: string;
    items: Array<TechnologyEntry>;
    projects: Array<ProjectEntry>;
}

export interface Project extends ProjectEntry {
    start: number;
    end: number;
    years: number;
    yearsAgo: number;
}

export const TechnologySkillset: FC<TechnologySkillsetProps> = (
    props: TechnologySkillsetProps,
) => {
    const currentYear = moment().get("year");
    const { projectMapping, min, max, totalYears } = useMemo(() => {
        const projects = props.projects.filter((p) =>
            p.technologies.some((t) =>
                props.items.some((_t) => _t.id === t.id),
            ),
        ) as Array<Project>;
        for (const project of projects) {
            project.start = getDecimalFromMonthAndYear(project.from) ?? 0;
            project.end = getDecimalFromMonthAndYear(project.to);
            project.years = project.end - project.start;
            project.yearsAgo = currentYear - project.end;
        }
        const projectMapping = getProjectMapping(projects);
        const yearsOverview = Object.values(projectMapping).map((arr) =>
            arr.reduce((r, p) => p.years + r, 0),
        );
        return {
            projectMapping,
            totalYears: Math.max(...yearsOverview),
            max: Math.max(...projects.map((p) => p.end)),
            min: Math.min(...projects.map((p) => p.start)),
        };
    }, [props.projects]);

    return (
        <div className="container">
            <FadeIn>
                {props.title && (
                    <h2 className="text-3xl mb-6">{props.title}</h2>
                )}
            </FadeIn>
            <div className={``}>
                {props.items.map((item) => (
                    <Skill
                        key={item.id}
                        {...item}
                        projects={projectMapping[item.id]}
                        min={min}
                        max={max}
                        totalYears={totalYears}
                    />
                ))}
            </div>
        </div>
    );
};

export interface TechProjectMapping {
    [techId: string]: Project[];
}

function getProjectMapping(projects: Project[]): TechProjectMapping {
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

function getDecimalFromMonthAndYear(str: string): number {
    if (!str) str = moment().format("MM/YYYY");
    const [monthStr, yearStr] = str.split("/");
    if (!yearStr) return parseInt(monthStr);
    const month = parseInt(monthStr);
    const year = parseInt(yearStr);
    return year + Math.round(((month - 1) / 12) * 100) / 100;
}

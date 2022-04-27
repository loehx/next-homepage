import { ProjectEntry, TechnologyEntry } from "data/definitions";
import { FadeIn } from "@components/fadeIn";
import { FC } from "react";
import { Project } from "./index";
import styles from "./skill.module.css";

interface SkillProps extends TechnologyEntry {
    projects: Array<Project>;
    min: number;
    max: number;
    totalYears: number;
}

export const Skill: FC<SkillProps> = (props: SkillProps) => {
    const years = props.projects.reduce(
        (total, project) => total + project.years,
        0,
    );
    console.log(props.name, years);
    return (
        <FadeIn key={props.id}>
            <div className={`flex mb-4`}>
                <div className={`w-20 flex items-center`}>{props.name}</div>
                <div className="flex flex-1 rounded-md">
                    <div
                        className="p-2 flex flex-wrap gap-2 border border-gray-300 rounded"
                        style={{
                            width: `${(years / props.totalYears) * 100}%`,
                        }}
                    >
                        {props.projects.map((project, index) => (
                            <div
                                key={project.id}
                                className={`text-sm flex p-2 relative bg-grey-100 font-bold`}
                                style={{
                                    minWidth:
                                        ((project.years / years) * 100).toFixed(
                                            2,
                                        ) + "%",
                                    opacity: (10 - project.yearsAgo) / 10,
                                }}
                            >
                                {project.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </FadeIn>
    );
};

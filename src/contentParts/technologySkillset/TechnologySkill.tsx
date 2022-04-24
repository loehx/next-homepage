import { ProjectEntry, TechnologyEntry } from "data/definitions";
import { FadeIn } from "@components/fadeIn";

export const TechnologySkill = (
    tech: TechnologyEntry & { projects: ProjectEntry[] },
) => {
    return (
        <FadeIn key={tech.id}>
            <pre>
                {tech.fullName} used in {JSON.stringify(tech.projects, null, 3)}
            </pre>
        </FadeIn>
    );
};

import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Entry, ProjectEntry, TechnologyEntry } from "data/definitions";
import { Project, getProjectCardAccent } from "./project";
import {
    ProjectsScrollFocusProvider,
    useProjectsScrollFocus,
} from "./projectsScrollFocus";
import { ProjectDetailOverlay } from "./projectDetailOverlay";
import { FadeIn } from "@components/fadeIn";
import { TerminalCursor } from "@components/terminalCursor";
import styles from "./projectsModule.module.css";
import { useProjectsPageBlend } from "./useProjectsPageBlend";

export interface ProjectsModuleProps extends Entry {
    name: string;
    title: string;
    links: Array<ProjectEntry>;
    techFilter: Array<TechnologyEntry>;
    projects: Array<ProjectEntry>;
}

export const ProjectsModule: FC<ProjectsModuleProps> = (props) => {
    const { projects } = props;
    const sectionRef = useRef<HTMLDivElement>(null);
    useProjectsPageBlend(sectionRef);
    const [detailProjectId, setDetailProjectId] = useState<string | null>(null);

    const openProjectDetails = useCallback((id: string) => {
        setDetailProjectId(id);
    }, []);

    const closeProjectDetails = useCallback(() => {
        setDetailProjectId(null);
    }, []);

    const detailProject = useMemo(
        () =>
            detailProjectId
                ? projects.find((p) => p.id === detailProjectId) ?? null
                : null,
        [detailProjectId, projects],
    );

    const detailProjectIndex = useMemo(
        () =>
            detailProjectId
                ? projects.findIndex((p) => p.id === detailProjectId)
                : -1,
        [detailProjectId, projects],
    );

    const detailBackdropAccent =
        detailProjectIndex >= 0
            ? getProjectCardAccent(detailProjectIndex)
            : undefined;

    return (
        <div ref={sectionRef} className="container mx-auto px-4 py-12">
            <FadeIn>
                {props.title && (
                    <div className={styles.headlineSection}>
                        <h2
                            className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-3xl font-bold ${styles.projectsHeadline}`}
                        >
                            <span
                                className={`font-mono text-2xl ${styles.projectsHeadlinePrompt}`}
                            >
                                &gt;_
                            </span>
                            <span>{props.title}</span>
                            <TerminalCursor />
                        </h2>
                        <FadeIn
                            appearRatio={0.9}
                            visibleRatio={0.2}
                            disableTransform
                        >
                            <p
                                className={`hidden md:block text-sm mt-2 ${styles.projectsSubline}`}
                            >
                                press{" "}
                                <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--grey-2)]">
                                    ↓
                                </kbd>{" "}
                                or{" "}
                                <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--grey-2)]">
                                    space
                                </kbd>{" "}
                                to scroll through projects
                            </p>
                        </FadeIn>
                    </div>
                )}
            </FadeIn>
            <ProjectsScrollFocusProvider>
                <ProjectsList
                    projects={projects}
                    openProjectDetails={openProjectDetails}
                />
            </ProjectsScrollFocusProvider>
            <ProjectDetailOverlay
                project={detailProject}
                backdropAccent={detailBackdropAccent}
                onClose={closeProjectDetails}
            />
        </div>
    );
};

interface ProjectsListProps {
    projects: ProjectEntry[];
    openProjectDetails: (id: string) => void;
}

const ProjectsList: FC<ProjectsListProps> = ({
    projects,
    openProjectDetails,
}) => {
    const scrollFocus = useProjectsScrollFocus();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle when not in an input or textarea
            const target = e.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            if (!scrollFocus) return;

            const projectIds = scrollFocus.getProjectIds();
            if (projectIds.length === 0) return;

            const currentId = scrollFocus.activeProjectId;
            let currentIndex = currentId ? projectIds.indexOf(currentId) : -1;

            if (currentIndex === -1) {
                // No project is currently focused, find the one closest to center
                currentIndex = 0;
            }

            let nextIndex: number | null = null;

            if (e.key === "ArrowDown" || e.key === " ") {
                e.preventDefault();
                if (currentIndex < projectIds.length - 1) {
                    nextIndex = currentIndex + 1;
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (currentIndex > 0) {
                    nextIndex = currentIndex - 1;
                }
            }

            if (nextIndex !== null) {
                const nextId = projectIds[nextIndex];
                scrollFocus.scrollToProject(nextId);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [scrollFocus]);

    return (
        <div className="flex flex-col">
            {projects.map((project, index) => (
                <Project
                    key={project.id}
                    project={project}
                    projectIndex={index}
                    isLast={index === projects.length - 1}
                    onOpenDetails={openProjectDetails}
                />
            ))}
        </div>
    );
};

export default ProjectsModule;

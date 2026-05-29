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
import { BubblesAnimation } from "../stage/BubbleAnimation";
import styles from "./projectsModule.module.css";
import { useProjectsPageBlend } from "./useProjectsPageBlend";
import { useIsMobile } from "src/hooks";

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
    const { isNearViewport } = useProjectsPageBlend(sectionRef);
    const isMobile = useIsMobile(true);
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

    const orderedIds = useMemo(() => projects.map((p) => p.id), [projects]);

    return (
        <div
            ref={sectionRef}
            className="container mx-auto px-4 pt-12 relative isolate pb-12 mt-[15vh]"
        >
            <div className={styles.projectsBackdrop} aria-hidden>
                {isNearViewport && (
                    <BubblesAnimation transparent disableBubbles={true} />
                )}
            </div>
            <FadeIn>
                {props.title && (
                    <>
                        <div className={styles.headlineSection}>
                            <h2
                                className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-4xl md:text-5xl font-bold ${styles.projectsHeadline}`}
                            >
                                <span
                                    className={`font-mono text-2xl ${styles.projectsHeadlinePrompt}`}
                                >
                                    &gt;_
                                </span>
                                <span>{props.title}</span>
                                <TerminalCursor />
                            </h2>
                        </div>
                        <p
                            className={`hidden md:block text-sm mt-2 text-center ${styles.projectsSubline}`}
                        >
                            press{" "}
                            <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--grey-2)]">
                                ↓
                            </kbd>{" "}
                            or{" "}
                            <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--grey-2)]">
                                space
                            </kbd>{" "}
                            to scroll,{" "}
                            <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--grey-2)]">
                                enter
                            </kbd>{" "}
                            to open,{" "}
                            <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--grey-2)]">
                                esc
                            </kbd>{" "}
                            to close
                        </p>
                    </>
                )}
            </FadeIn>
            <ProjectsScrollFocusProvider orderedIds={orderedIds}>
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
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if modifier keys are pressed (allow browser shortcuts)
            if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
                return;
            }

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

            // Only intercept when the projects section is in viewport
            const listEl = listRef.current;
            if (!listEl) return;
            const rect = listEl.getBoundingClientRect();
            const vh = window.innerHeight;
            // Section is "on screen" if it overlaps the viewport
            const isInViewport = rect.top < vh && rect.bottom > 0;
            if (!isInViewport) return;

            const projectIds = scrollFocus.getProjectIds();
            if (projectIds.length === 0) return;

            const currentId = scrollFocus.selectedProjectId;
            const currentIndex = currentId ? projectIds.indexOf(currentId) : -1;
            const hasSelection = currentIndex !== -1;

            let nextIndex: number | null = null;

            if (e.key === "ArrowDown" || e.key === " ") {
                if (!hasSelection) {
                    // First press: select the first project instead of advancing past it.
                    e.preventDefault();
                    nextIndex = 0;
                } else if (currentIndex < projectIds.length - 1) {
                    e.preventDefault();
                    nextIndex = currentIndex + 1;
                }
                // At last project: don't preventDefault, allow native page scroll
            } else if (e.key === "ArrowUp") {
                if (!hasSelection) {
                    // First press: select the first project.
                    e.preventDefault();
                    nextIndex = 0;
                } else if (currentIndex > 0) {
                    e.preventDefault();
                    nextIndex = currentIndex - 1;
                }
                // At first project: don't preventDefault, allow native page scroll
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (currentId) {
                    openProjectDetails(currentId);
                }
            }

            if (nextIndex !== null) {
                const nextId = projectIds[nextIndex];
                scrollFocus.setSelectedProjectId(nextId);
                scrollFocus.scrollToProject(nextId);
            }
        };

        const handlePointerActivity = () => {
            if (!scrollFocus) return;
            scrollFocus.setSelectedProjectId(null);
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mousemove", handlePointerActivity, {
            passive: true,
        });
        window.addEventListener("wheel", handlePointerActivity, {
            passive: true,
        });
        window.addEventListener("touchstart", handlePointerActivity, {
            passive: true,
        });
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("mousemove", handlePointerActivity);
            window.removeEventListener("wheel", handlePointerActivity);
            window.removeEventListener("touchstart", handlePointerActivity);
        };
    }, [scrollFocus, openProjectDetails]);

    return (
        <div ref={listRef} className="flex flex-col">
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

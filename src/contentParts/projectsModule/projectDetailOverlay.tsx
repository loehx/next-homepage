import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ProjectEntry } from "data/definitions";
import { Window } from "@components/window";
import cx from "classnames";
import styles from "./projectsModule.module.css";

/** Main project name (markdown H1) — symmetric “console badge” style */
function wrapTitleHero(text: string): string {
    return `═══╡ ✦ ${text} ✦ ╞═══`;
}

/** Section headings (markdown H2) */
function wrapTitleSection(text: string): string {
    return `── ◈ ${text} ◈ ──`;
}

function buildProjectMarkdown(project: ProjectEntry): string {
    const fromParts = project.from.split("/");
    const fromLabel = `${fromParts[0]}/${fromParts[1]}`;
    let period = fromLabel;
    if (project.to) {
        const toParts = project.to.split("/");
        period = `${fromLabel} → ${toParts[0]}/${toParts[1]}`;
    } else {
        period = `${fromLabel} → *present*`;
    }

    const lines: string[] = [
        `# ${wrapTitleHero(project.name)}`,
        "",
        project.description || "",
    ];

    if (project.url?.trim()) {
        const u = project.url.trim();
        const display = u.replace(/^https?:\/\//i, "").split("/")[0];
        lines.push(`[${display}](${u})`, "");
    }
    else {
        lines.push('', "");
    }

    lines.push(`Timeline · ${period}`);
    lines.push(`Role · ${project.role}`);
    if (project.sector?.trim()) {
        lines.push(`Sector · ${project.sector.trim()}`);
    }
    if (project.team?.trim()) {
        lines.push(`Team · ${project.team.trim()}`);
    }
    lines.push("");

    const c = project.company;
    if (c) {
        lines.push("", `## ${wrapTitleSection("Company")}`, "");
        if (c.fullName?.trim() && c.fullName.trim() !== c.name.trim()) {
            lines.push(`- ${c.fullName.trim()}`);
        }
        if (c.url?.trim()) {
            const cu = c.url.trim();
            lines.push(`- [${cu}](${cu})`);
        }
        lines.push("");
    }

    if (project.technologies?.length) {
        lines.push("", `## ${wrapTitleSection("Stack")}`, "");
        for (const t of project.technologies) {
            const name = t.name || "";
            const fn = t.fullName?.trim();
            const label =
                fn && fn.toLowerCase() !== name.toLowerCase()
                    ? `${name} (${fn})`
                    : name;
            const techUrl = t.url?.trim();
            if (techUrl) {
                lines.push(`- [${label}](${techUrl})`);
            } else {
                lines.push(`- ${label}`);
            }
        }
        lines.push("");
    } else {
        lines.push("", `## ${wrapTitleSection("Stack")}`, "—", "");
    }

    if (project.moreTechnologies?.trim()) {
        lines.push(
            `## ${wrapTitleSection("Additional technologies")}`,
            "",
            project.moreTechnologies.trim(),
            "",
        );
    }

    return lines.join("\n");
}

export interface ProjectDetailOverlayProps {
    project: ProjectEntry | null;
    /** Matches clicked card border accent (`--project-accent`). */
    backdropAccent?: string;
    onClose: () => void;
}

export const ProjectDetailOverlay: React.FC<ProjectDetailOverlayProps> = ({
    project,
    backdropAccent,
    onClose,
}) => {
    const [visible, setVisible] = useState(false);

    const titleId = project
        ? `project-detail-heading-${project.id}`
        : "project-detail-heading";

    useEffect(() => {
        if (!project) {
            setVisible(false);
            return;
        }
        const id = requestAnimationFrame(() =>
            requestAnimationFrame(() => setVisible(true)),
        );
        return () => cancelAnimationFrame(id);
    }, [project]);

    useEffect(() => {
        if (!project) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [project, onClose]);

    /** Close on click, not pointerdown: closing before the synthetic click fires lets the click hit the page below (mobile). */
    const handleBackdropClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) onClose();
        },
        [onClose],
    );

    const stopOverlayEventPropagation = useCallback(
        (e: React.SyntheticEvent) => {
            e.stopPropagation();
        },
        [],
    );

    if (!project || typeof document === "undefined") return null;

    const markdown = buildProjectMarkdown(project);

    return createPortal(
        <div
            className={cx(
                styles.projectDetailBackdrop,
                visible && styles.projectDetailBackdropVisible,
            )}
            style={
                backdropAccent
                    ? ({
                          "--project-detail-backdrop": backdropAccent,
                      } as React.CSSProperties)
                    : undefined
            }
            onPointerDown={stopOverlayEventPropagation}
            onClick={handleBackdropClick}
            role="presentation"
        >
            <div
                className={cx(
                    styles.projectDetailStage,
                    visible && styles.projectDetailStageVisible,
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onPointerDown={stopOverlayEventPropagation}
                onClick={stopOverlayEventPropagation}
            >
                <span id={titleId} className={styles.projectDetailSrOnly}>
                    {project.name}
                </span>
                <Window
                    className={styles.projectDetailWindow}
                    text={markdown}
                    onClose={onClose}
                />
            </div>
        </div>,
        document.body,
    );
};

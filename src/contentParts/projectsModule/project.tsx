import { FC, useState, useEffect, useMemo, useCallback, memo } from "react";
import { ProjectEntry } from "data/definitions";
import { FadeIn } from "@components/fadeIn";
import { TerminalCursor } from "@components/terminalCursor";
import {
    CustomParallax,
    ParallaxCallbackProps,
} from "@components/customParallax";

const RevealedWithCursor: FC<{
    text: string;
    reveal: (text: string) => { revealed: string; showCursor: boolean };
}> = ({ text, reveal }) => {
    const { revealed, showCursor } = reveal(text);
    return (
        <>
            {revealed}
            {showCursor && <TerminalCursor />}
        </>
    );
};

interface Props {
    project: ProjectEntry;
    techFilter?: string;
    isLast?: boolean;
}

const frameworksFirst = ["vue", "react", "angular", "vanilla", "c#"];

const ProjectComponent: FC<Props> = ({ project }) => {
    const [relativeScreenPosition, setRelativeScreenPosition] =
        useState<number>(0);
    const [windowWidth, setWindowWidth] = useState<number>(0);

    useEffect(() => {
        // Set initial width
        setWindowWidth(window.innerWidth);

        // Add resize listener with throttling
        let rafId: number | null = null;
        const handleResize = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                setWindowWidth(window.innerWidth);
                rafId = null;
            });
        };

        window.addEventListener("resize", handleResize, { passive: true });
        return () => {
            window.removeEventListener("resize", handleResize);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    const dateString = useMemo(() => {
        const fromYear = project.from.split("/")[1];
        if (!project.to) {
            const now = new Date();
            const currentYear = now.getFullYear();
            return fromYear === currentYear.toString()
                ? fromYear
                : `${fromYear} - ${currentYear.toString().slice(2)}`;
        }
        const toYear = project.to.split("/")[1];
        return fromYear === toYear
            ? fromYear
            : `${fromYear} - ${toYear.slice(2)}`;
    }, [project.from, project.to]);

    const monthsCount = useMemo(() => {
        const fromParts = project.from.split("/");
        const fromMonth = parseInt(fromParts[0]);
        const fromYear = parseInt(fromParts[1]);

        let toMonth, toYear;
        if (!project.to) {
            const now = new Date();
            toMonth = now.getMonth() + 1;
            toYear = now.getFullYear();
        } else {
            const toParts = project.to.split("/");
            toMonth = parseInt(toParts[0]);
            toYear = parseInt(toParts[1]);
        }

        const months = (toYear - fromYear) * 12 + (toMonth - fromMonth);
        return months === 1 ? "1 month" : `${months} months`;
    }, [project.from, project.to]);

    const sortedTechnologies = useMemo(() => {
        if (!project.technologies) return [];
        return [...project.technologies].sort((a, b) => {
            const aIsFramework = frameworksFirst.includes(a.name.toLowerCase());
            const bIsFramework = frameworksFirst.includes(b.name.toLowerCase());

            if (aIsFramework && !bIsFramework) return -1;
            if (!aIsFramework && bIsFramework) return 1;
            return 0;
        });
    }, [project.technologies]);

    const onScrollUpdate = useCallback((props: ParallaxCallbackProps) => {
        const pos = props.center / props.screenHeight + 0.2;
        const value = Math.round(pos * 100) / 100;
        setRelativeScreenPosition((prev) => {
            // Only update if value changed significantly
            if (Math.abs(prev - value) < 0.01) return prev;
            return value;
        });
    }, []);

    const multiplier = useMemo(
        () => (windowWidth <= 768 ? 4 : 3),
        [windowWidth],
    );

    const getRevealState = useCallback(
        (text: string): { revealed: string; showCursor: boolean } => {
            const r = relativeScreenPosition * multiplier;
            const showN = Math.min(Math.ceil(text.length * r), text.length);
            return {
                revealed: text.substring(0, showN),
                showCursor: showN < text.length,
            };
        },
        [relativeScreenPosition, multiplier],
    );

    return (
        <FadeIn>
            <CustomParallax
                className="cursor-default"
                onUpdate={onScrollUpdate}
            >
                <div className="w-full flex flex-col mb-10 cursor-default">
                    <div className="flex flex-row items-stretch w-full gap-4 md:gap-12">
                        {/* Timeline */}
                        <div className="flex flex-col items-start min-w-[70px] md:pl-20 md:min-w-[150px] text-left mt-[5px] relative">
                            <span className="font-bold text-sm leading-none">
                                <RevealedWithCursor
                                    text={dateString}
                                    reveal={getRevealState}
                                />
                            </span>
                            <span className="text-gray-600 text-xs mb-2 mt-3">
                                {monthsCount}
                            </span>
                        </div>
                        {/* Project Content */}
                        <div className="flex-1 text-sm">
                            <div className="text-base font-bold text-left w-full mb-2 flex flex-row items-start">
                                <span className="text-sm">&gt;_&nbsp;</span>
                                <span
                                    data-to={project.to}
                                    className="ml-1 max-w-[50vw] inline-block relative"
                                >
                                    <span className="absolute inset-0">
                                        <RevealedWithCursor
                                            text={project.name}
                                            reveal={getRevealState}
                                        />
                                    </span>
                                    <span className="opacity-0">
                                        {project.name}
                                    </span>
                                </span>
                            </div>
                            <div className="w-full mb-2 font-mono text-xs flex flex-wrap">
                                {sortedTechnologies.map((tech, i) => (
                                    <span key={tech.id}>
                                        <span
                                            className={
                                                frameworksFirst.includes(
                                                    tech.name.toLowerCase(),
                                                )
                                                    ? "text-primary-600 lowercase"
                                                    : "text-black lowercase"
                                            }
                                        >
                                            {tech.url ? (
                                                <a
                                                    href={tech.url}
                                                    className="text-inherit rounded-sm px-1 -mx-1 lg:hover:outline lg:outline-primary-200 lg:hover:text-primary-600"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {tech.name}
                                                </a>
                                            ) : (
                                                tech.name
                                            )}
                                        </span>
                                        {i < sortedTechnologies.length - 1 && (
                                            <span className="mx-1">·</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                            <div className="mb-1 relative">
                                <span className="absolute top-0 left-0 w-full h-full">
                                    <RevealedWithCursor
                                        text={project.description}
                                        reveal={getRevealState}
                                    />
                                </span>
                                <span className="opacity-0">
                                    {project.description}
                                </span>
                            </div>
                            <div className="w-full max-w-xl">
                                <div className="mb-1">
                                    <span className="mr-2">👨‍💻</span>
                                    <RevealedWithCursor
                                        text={project.role}
                                        reveal={getRevealState}
                                    />
                                </div>
                                {/* {project.url && (
                                    <div className="mb-1">
                                        <span className="mr-2">👀</span>
                                        <a
                                            href={project.url}
                                            className="text-black hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <RevealedWithCursor
                                                text={project.url
                                                    .replace(
                                                        /^https?:\/\//g,
                                                        "",
                                                    )
                                                    .split("/")[0]}
                                                reveal={getRevealState}
                                            />
                                        </a>
                                    </div>  )} */}
                                <div className="mb-1">
                                    <span className="mr-2">🏢</span>
                                    {project.company.url ? (
                                        <a
                                            href={project.company.url}
                                            className="text-black hover:underline"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <RevealedWithCursor
                                                text={project.company.name}
                                                reveal={getRevealState}
                                            />
                                        </a>
                                    ) : (
                                        <RevealedWithCursor
                                            text={project.company.name}
                                            reveal={getRevealState}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CustomParallax>
        </FadeIn>
    );
};

export const Project = memo(ProjectComponent, (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return (
        prevProps.project.id === nextProps.project.id &&
        prevProps.isLast === nextProps.isLast &&
        prevProps.techFilter === nextProps.techFilter
    );
});

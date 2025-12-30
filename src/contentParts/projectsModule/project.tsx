import { FC, useState, useEffect, useMemo, useCallback, memo } from "react";
import { ProjectEntry } from "data/definitions";
import { FadeIn } from "@components/fadeIn";
import {
    CustomParallax,
    ParallaxCallbackProps,
} from "@components/customParallax";
import { RocketIcon } from "@components/rocketIcon";
import styles from "./project.module.css";

interface Props {
    project: ProjectEntry;
    techFilter?: string;
    isLast?: boolean;
    colorIndex?: number;
    lineColor?: string;
}

const frameworksFirst = ["vue", "react", "angular", "vanilla", "c#"];

const ProjectComponent: FC<Props> = ({ project, lineColor }) => {
    const [relativeScreenPosition, setRelativeScreenPosition] =
        useState<number>(0);
    const [windowWidth, setWindowWidth] = useState<number>(0);
    const [scrollY, setScrollY] = useState<number>(0);

    useEffect(() => {
        // Set initial width
        setWindowWidth(window.innerWidth);
        setScrollY(window.scrollY);

        // Add resize listener with throttling
        let rafId: number | null = null;
        const handleResize = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                setWindowWidth(window.innerWidth);
                rafId = null;
            });
        };

        // Add scroll listener for hue rotation
        let scrollRafId: number | null = null;
        const handleScroll = () => {
            if (scrollRafId !== null) return;
            scrollRafId = requestAnimationFrame(() => {
                setScrollY(window.scrollY);
                scrollRafId = null;
            });
        };

        window.addEventListener("resize", handleResize, { passive: true });
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
            if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
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
    const pathWidthMultiplier = useMemo(
        () => (windowWidth <= 768 ? 100 : 50),
        [windowWidth],
    );

    // Calculate hue rotation based on scroll position
    // Full rotation (360deg) over 2000px of scroll
    const hueRotate = useMemo(() => {
        const rotation = (scrollY / 2000) * 360;
        return rotation % 360;
    }, [scrollY]);

    // Base color - use a bright color that works well with hue-rotate
    const baseColor = lineColor || "#FF0000"; // Red as base, will rotate through all colors
    const lineProgressBase = relativeScreenPosition * pathWidthMultiplier;
    const lineProgress = Math.max(0, Math.min(100, lineProgressBase));

    const getRevealedText = useCallback(
        (text: string) => {
            const r = relativeScreenPosition * multiplier;
            const showN = Math.min(Math.ceil(text.length * r), text.length);
            return (
                text.substring(0, showN) + (showN === text.length ? "" : "_")
            );
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
                    <div
                        className={`relative h-[1px] my-2 mb-3 ${styles.progressLine}`}
                        style={{
                            width: `calc(${
                                lineProgress *
                                (lineProgress *
                                    (windowWidth <= 768 ? 0.02 : 0.07))
                            }%)`,
                            backgroundColor: baseColor,
                            boxShadow: `0 0 4px 0 ${baseColor}`,
                            color: baseColor,
                            filter: `hue-rotate(${hueRotate}deg)`,
                            willChange: "width, filter",
                        }}
                    >
                        <RocketIcon
                            className="absolute right-[-22px] top-[-9px] w-5 h-5"
                            style={{
                                transform: "rotate(90deg)",
                                willChange: "transform, filter",
                            }}
                        />
                    </div>
                    <div className="flex flex-row items-stretch w-full gap-4 mt-4 md:gap-12">
                        {/* Timeline */}
                        <div className="flex flex-col items-start min-w-[70px] md:pl-20 md:min-w-[150px] text-left mt-[5px] relative">
                            <span className="font-bold text-sm leading-none">
                                {getRevealedText(dateString)}
                            </span>
                            <span
                                className="text-gray-600 text-xs mb-2 mt-3"
                                style={{
                                    transition: "all .2s ease",
                                    opacity: lineProgress > 10 ? 1 : 0,
                                    transform: `translateY(${
                                        lineProgress > 10 ? 0 : -20
                                    }px)`,
                                    willChange: "opacity, transform",
                                }}
                            >
                                {monthsCount}
                            </span>
                        </div>
                        {/* Project Content */}
                        <div className="flex-1 text-sm">
                            <div className="text-base font-bold text-left w-full mb-2 flex flex-row items-center">
                                <span className="text-sm">&gt;_&nbsp;</span>
                                <span
                                    data-to={project.to}
                                    className="ml-1 truncate max-w-[50vw] inline-block"
                                >
                                    {getRevealedText(project.name)}
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
                                    {getRevealedText(project.description)}
                                </span>
                                <span className="opacity-0">
                                    {project.description}
                                </span>
                            </div>
                            <div className="w-full max-w-xl">
                                <div className="mb-1">
                                    <span className="mr-2">👨‍💻</span>
                                    {getRevealedText(project.role)}
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
                                            {getRevealedText(
                                                project.url
                                                    .replace(
                                                        /^https?:\/\//g,
                                                        "",
                                                    )
                                                    .split("/")[0],
                                            )}
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
                                            {getRevealedText(
                                                project.company.name,
                                            )}
                                        </a>
                                    ) : (
                                        getRevealedText(project.company.name)
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
        prevProps.colorIndex === nextProps.colorIndex &&
        prevProps.lineColor === nextProps.lineColor &&
        prevProps.isLast === nextProps.isLast &&
        prevProps.techFilter === nextProps.techFilter
    );
});

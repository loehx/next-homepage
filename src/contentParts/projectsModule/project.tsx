import { FC, useState, useEffect } from "react";
import { ProjectEntry } from "data/definitions";
import { FadeIn } from "@components/fadeIn";
import {
    CustomParallax,
    ParallaxCallbackProps,
} from "@components/customParallax";
import { Tooltip } from "@components/tooltip";

interface Props {
    project: ProjectEntry;
    techFilter?: string;
    isLast?: boolean;
}

export const Project: FC<Props> = ({ project, isLast }) => {
    const [relativeScreenPosition, setRelativeScreenPosition] =
        useState<number>(0);
    const [windowWidth, setWindowWidth] = useState<number>(0);

    useEffect(() => {
        // Set initial width
        setWindowWidth(window.innerWidth);

        // Add resize listener
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    function getDateString(date: string) {
        const fromYear = date.split("/")[1];
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
    }

    function getMonthsCount(fromDate: string) {
        const fromParts = fromDate.split("/");
        const fromMonth = parseInt(fromParts[0]);
        const fromYear = parseInt(fromParts[1]);

        let toMonth, toYear;
        if (!project.to) {
            const now = new Date();
            toMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
            toYear = now.getFullYear();
        } else {
            const toParts = project.to.split("/");
            toMonth = parseInt(toParts[0]);
            toYear = parseInt(toParts[1]);
        }

        const months = (toYear - fromYear) * 12 + (toMonth - fromMonth);
        return months === 1 ? "1 month" : `${months} months`;
    }

    const onScrollUpdate = (props: ParallaxCallbackProps) => {
        const pos = props.center / props.screenHeight + 0.2;
        const value = Math.round(pos * 100) / 100;
        setRelativeScreenPosition(value);
        console.log(value);
    };

    const multiplier = windowWidth <= 768 ? 4 : 3;
    const getRevealedText = (text: string) => {
        const r = relativeScreenPosition * multiplier;
        const showN = Math.min(Math.ceil(text.length * r), text.length);
        return text.substring(0, showN) + (showN === text.length ? "" : "_");
    };

    return (
        <FadeIn>
            <CustomParallax
                className="cursor-default"
                onUpdate={onScrollUpdate}
            >
                <div className="w-full flex flex-col items-center mb-16 cursor-default">
                    <div className="flex flex-row items-stretch w-full gap-12">
                        {/* Timeline */}
                        <div className="flex flex-col items-end min-w-[70px] md:min-w-[150px] text-right mt-[5px] relative">
                            <span className="font-bold text-sm leading-none">
                                {getDateString(project.from)}
                            </span>
                            <span className="text-gray-600 text-xs mb-2 mt-6">
                                {getMonthsCount(project.from)}
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
                            <div
                                className="relative h-[1.5px] my-2 mb-3 bg-grey-200"
                                style={{
                                    left: "-120px",
                                    width: `calc(120px + ${Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            relativeScreenPosition *
                                                (windowWidth <= 768 ? 100 : 50),
                                        ),
                                    )}%`,
                                }}
                            >
                                <div
                                    className="absolute right-0 top-[-3px] w-0 h-0 
                                        border-t-[4px] border-t-transparent 
                                        border-l-[8px] border-l-grey-200 
                                        border-b-[4px] border-b-transparent"
                                ></div>
                            </div>
                            <div className="w-full mb-2 font-mono text-xs flex flex-wrap">
                                {project.technologies
                                    ?.sort((a, b) => {
                                        const frameworksFirst = [
                                            "vue",
                                            "react",
                                            "angular",
                                            "vanilla",
                                            "c#",
                                        ];
                                        const aIsFramework =
                                            frameworksFirst.includes(
                                                a.name.toLowerCase(),
                                            );
                                        const bIsFramework =
                                            frameworksFirst.includes(
                                                b.name.toLowerCase(),
                                            );

                                        if (aIsFramework && !bIsFramework)
                                            return -1;
                                        if (!aIsFramework && bIsFramework)
                                            return 1;
                                        return 0;
                                    })
                                    .map((tech, i) => (
                                        <span key={tech.id}>
                                            <Tooltip
                                                text={tech.fullName}
                                                placement="top"
                                                className="inline-block"
                                            >
                                                <span
                                                    className={
                                                        [
                                                            "vue",
                                                            "react",
                                                            "angular",
                                                            "vanilla",
                                                            "c#",
                                                        ].includes(
                                                            tech.name.toLowerCase(),
                                                        )
                                                            ? "text-primary-600 lowercase"
                                                            : "text-black lowercase"
                                                    }
                                                >
                                                    {tech.url ? (
                                                        <a
                                                            href={tech.url}
                                                            className="text-inherit hover:outline outline-primary-200 rounded-sm px-1 -mx-1 hover:text-primary-600"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {tech.name}
                                                        </a>
                                                    ) : (
                                                        tech.name
                                                    )}
                                                </span>
                                            </Tooltip>
                                            {i <
                                                project.technologies.length -
                                                    1 && (
                                                <span className="mx-1">·</span>
                                            )}
                                        </span>
                                    ))}
                            </div>
                            <div className="mb-1">
                                <span className="mr-2">👉</span>
                                {typeof window !== "undefined" &&
                                window.innerWidth >= 1024
                                    ? getRevealedText(project.description)
                                    : project.description}
                            </div>
                            <div className="w-full max-w-xl">
                                <div className="mb-1">
                                    <span className="mr-2">👨‍💻</span>
                                    {getRevealedText(project.role)}
                                </div>
                                {project.url && (
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
                                    </div>
                                )}
                                <div className="mb-1">
                                    <span className="mr-2">👾</span>
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

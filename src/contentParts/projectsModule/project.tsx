import {
    FC,
    useState,
    useEffect,
    useLayoutEffect,
    useMemo,
    useCallback,
    useRef,
    useContext,
    memo,
    type CSSProperties,
    type KeyboardEvent,
} from "react";
import { ProjectEntry } from "data/definitions";
import { FadeIn } from "@components/fadeIn";
import { TerminalCursor } from "@components/terminalCursor";
import {
    CustomParallax,
    ParallaxCallbackProps,
} from "@components/customParallax";
import styles from "./projectsModule.module.css";
import { ProjectsScrollFocusContext } from "./projectsScrollFocus";

/** One vibrant accent per project on hover (cycles). */
const PROJECT_HOVER_ACCENTS = [
    "#06b6d4",
    "#d946ef",
    "#22c55e",
    "#f97316",
    "#3b82f6",
    "#eab308",
    "#f43f5e",
    "#8b5cf6",
    "#14b8a6",
    "#facc15",
] as const;

/** Inset from container (row) left/right edge when a box is fully aligned. */
const CONTAINER_INSET_PX = 60;
const MOBILE_CONTAINER_INSET_PX = 30;

export function getProjectCardAccent(projectIndex: number): string {
    return PROJECT_HOVER_ACCENTS[projectIndex % PROJECT_HOVER_ACCENTS.length];
}

/** projectCardRow margin-bottom with scroll progress (0 → -80px); tablet/desktop only. */
const DESKTOP_SCROLL_MARGIN_BOTTOM_PX = 80;

/**
 * 0 = horizontally centered (just entering / top of band).
 * 1 = full slide to left/right edge (20px inset).
 * Uses row position in viewport, not document scroll alone.
 */
function viewportSlideProgress(
    rect: DOMRect,
    viewportHeight: number,
    reduceMotion: boolean,
): number {
    if (reduceMotion) return 1;
    const vh = viewportHeight;
    const top = rect.top;
    const bottom = rect.bottom;
    if (bottom < 0) return 1;
    if (top > vh) return 0;

    const start = vh * 0.88;
    const end = vh * 0.3;
    if (top > start) return 0;
    if (top < end) return 1;
    const linear = (start - top) / (start - end);
    return Math.pow(linear, 0.48);
}

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
    projectIndex: number;
    techFilter?: string;
    isLast?: boolean;
    onOpenDetails: (projectId: string) => void;
}

const frameworksFirst = ["vue", "react", "angular", "vanilla", "c#"];

const ProjectComponent: FC<Props> = ({
    project,
    projectIndex,
    onOpenDetails,
}) => {
    const scrollFocus = useContext(ProjectsScrollFocusContext);
    const rowRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [viewportProgress, setViewportProgress] = useState(0);
    const [layoutSizes, setLayoutSizes] = useState({ rowW: 0, cardW: 0 });
    const [relativeScreenPosition, setRelativeScreenPosition] =
        useState<number>(0);
    const [windowWidth, setWindowWidth] = useState<number>(() =>
        typeof window !== "undefined" ? window.innerWidth : 0,
    );
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        // Set initial width
        setWindowWidth(window.innerWidth);

        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduceMotion(mq.matches);
        const onMq = () => setReduceMotion(mq.matches);
        mq.addEventListener("change", onMq);

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
            mq.removeEventListener("change", onMq);
            window.removeEventListener("resize", handleResize);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    const measureViewportProgress = useCallback(() => {
        const row = rowRef.current;
        const card = cardRef.current;
        if (!row || typeof window === "undefined") return;
        const rect = row.getBoundingClientRect();
        const p = viewportSlideProgress(rect, window.innerHeight, reduceMotion);
        setViewportProgress((prev) => (Math.abs(prev - p) < 0.003 ? prev : p));
        const R = rect.width;
        const C = card?.getBoundingClientRect().width ?? 0;
        setLayoutSizes((prev) =>
            prev.rowW === R && prev.cardW === C ? prev : { rowW: R, cardW: C },
        );
    }, [reduceMotion]);

    useLayoutEffect(() => {
        measureViewportProgress();
        window.addEventListener("scroll", measureViewportProgress, {
            passive: true,
        });
        window.addEventListener("resize", measureViewportProgress, {
            passive: true,
        });
        return () => {
            window.removeEventListener("scroll", measureViewportProgress);
            window.removeEventListener("resize", measureViewportProgress);
        };
    }, [measureViewportProgress]);

    useLayoutEffect(() => {
        if (!scrollFocus) return;
        scrollFocus.register(project.id, cardRef.current);
        return () => {
            scrollFocus.register(project.id, null);
        };
    }, [project.id, scrollFocus]);

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

    const hoverAccent = getProjectCardAccent(projectIndex);

    const handleOpenDetails = useCallback(() => {
        onOpenDetails(project.id);
    }, [onOpenDetails, project.id]);

    const handleCardKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenDetails(project.id);
            }
        },
        [onOpenDetails, project.id],
    );

    /** 0 → left, 1 → right (repeats: left–right–left–right–…) */
    const alignPhase = projectIndex % 2;

    const rowMotionStyle = useMemo((): CSSProperties => {
        if (windowWidth <= 768) {
            return { };
        }
        const p = viewportProgress;
        return {
            marginBottom: `calc(2.5rem + ${
                -p * DESKTOP_SCROLL_MARGIN_BOTTOM_PX
            }px)`,
        };
    }, [viewportProgress, windowWidth]);

    const isMobileCenterFocused =
        windowWidth <= 768 && scrollFocus?.activeProjectId === project.id;

    const cardMotionStyle = useMemo((): CSSProperties => {
        const base = {
            "--project-accent": hoverAccent,
        } as CSSProperties;
        const p = viewportProgress;
        const { rowW: R, cardW: C } = layoutSizes;
        let extraPx = 0;
        if (R > 0 && C > 0) {
            const inset =
                windowWidth <= 768
                    ? MOBILE_CONTAINER_INSET_PX
                    : CONTAINER_INSET_PX;
            const deltaLeft = inset - R / 2 + C / 2;
            const deltaRight = R / 2 - inset - C / 2;
            const deltaFinal = alignPhase === 0 ? deltaLeft : deltaRight;
            if (windowWidth <= 768) {
                const deltaOpposite =
                    alignPhase === 0 ? deltaRight : deltaLeft;
                extraPx = p * deltaFinal + (1 - p) * deltaOpposite;
            } else {
                extraPx = p * deltaFinal;
            }
        }
        const translate = `translateX(calc(-50% + ${extraPx}px))`;
        const transform =
            windowWidth <= 768 ? `${translate} scale(0.9)` : translate;
        return { ...base, transform, opacity: 1 };
    }, [
        hoverAccent,
        alignPhase,
        viewportProgress,
        layoutSizes.rowW,
        layoutSizes.cardW,
        windowWidth,
    ]);

    return (
        <FadeIn className="pointer-events-none">
            <CustomParallax onUpdate={onScrollUpdate}>
                <div
                    ref={rowRef}
                    className={styles.projectCardRow}
                    style={rowMotionStyle}
                >
                    <div
                        ref={cardRef}
                        role="button"
                        tabIndex={0}
                        aria-haspopup="dialog"
                        aria-label={`Open project details: ${project.name}`}
                        className={`${
                            styles.projectCard
                        } flex flex-col cursor-pointer${
                            isMobileCenterFocused
                                ? ` ${styles.projectCardFocused}`
                                : ""
                        }`}
                        style={cardMotionStyle}
                        onClick={handleOpenDetails}
                        onKeyDown={handleCardKeyDown}
                    >
                        <div className="flex flex-row items-stretch w-full gap-3 md:gap-8">
                            {/* Timeline */}
                            <div className="flex flex-col items-start shrink-0 min-w-[4.5rem] md:min-w-[5.5rem] pl-0 pr-1 text-left mt-[5px] relative">
                                <span className="font-bold text-sm leading-none">
                                    <RevealedWithCursor
                                        text={dateString}
                                        reveal={getRevealState}
                                    />
                                </span>
                                <span
                                    className={`${styles.projectCardMuted} text-xs mb-2 mt-3`}
                                >
                                    {monthsCount}
                                </span>
                            </div>
                            {/* Project Content */}
                            <div className="flex-1 text-sm">
                                <div className="text-base font-bold text-left w-full mb-2 flex flex-row items-center gap-2">
                                    <span
                                        className={`shrink-0 font-mono text-base ${styles.projectCardTitlePrompt}`}
                                    >
                                        &gt;_
                                    </span>
                                    <span
                                        data-to={project.to}
                                        className={`-mr-6 inline-block relative font-mono ${styles.projectCardTitleName}`}
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
                                <div className={styles.projectCardContent}>
                                    <div className="w-full mb-2 font-mono text-xs flex flex-wrap">
                                        {sortedTechnologies.map((tech, i) => (
                                            <span key={tech.id}>
                                                <span
                                                    className={
                                                        frameworksFirst.includes(
                                                            tech.name.toLowerCase(),
                                                        )
                                                            ? `${styles.projectCardTechFw} lowercase`
                                                            : `${styles.projectCardTechOther} lowercase`
                                                    }
                                                >
                                                    {tech.name}
                                                </span>
                                                {i <
                                                    sortedTechnologies.length -
                                                        1 && (
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
                                            <RevealedWithCursor
                                                text={project.company.name}
                                                reveal={getRevealState}
                                            />
                                        </div>
                                    </div>
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
        prevProps.projectIndex === nextProps.projectIndex &&
        prevProps.isLast === nextProps.isLast &&
        prevProps.techFilter === nextProps.techFilter &&
        prevProps.onOpenDetails === nextProps.onOpenDetails
    );
});

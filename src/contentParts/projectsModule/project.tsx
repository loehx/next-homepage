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

/**
 * Deterministic horizontal placement cycle for desktop project cards.
 * Values are normalized to viewport: -1 = card flush left edge, +1 = flush right edge.
 * Sides strictly alternate; amplitudes vary so the layout feels lively, never random.
 */
const LATERAL_POSITIONS = [
    -0.95, 0.65, -0.35, 0.9, -0.75, 0.3, -0.55, 0.85, -0.2, 0.55,
] as const;

/** Horizontal padding from viewport edges as a fraction of viewport width.
 *  0.1 = cards stay within the center 80% (10% padding on each side). */
const VIEWPORT_PADDING_RATIO = 0.1;

export function getProjectCardAccent(projectIndex: number): string {
    return PROJECT_HOVER_ACCENTS[projectIndex % PROJECT_HOVER_ACCENTS.length];
}

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
        const screenHeight = window.innerHeight;
        const p = viewportSlideProgress(rect, screenHeight, reduceMotion);
        setViewportProgress((prev) => (Math.abs(prev - p) < 0.003 ? prev : p));
        const R = rect.width;
        const C = card?.getBoundingClientRect().width ?? 0;
        setLayoutSizes((prev) =>
            prev.rowW === R && prev.cardW === C ? prev : { rowW: R, cardW: C },
        );

        // On mobile CustomParallax is skipped, so drive the typewriter's scroll
        // position from the row's bounding rect using the same formula as
        // CustomParallax + onScrollUpdate so the reveal feels consistent.
        if (windowWidth > 0 && windowWidth < 768) {
            const bottom = screenHeight - (rect.top + rect.height);
            const center = bottom - rect.height / 2;
            const pos = (center * 0.9) / screenHeight;
            const value = Math.round(pos * 100) / 100;
            setRelativeScreenPosition((prev) =>
                Math.abs(prev - value) < 0.01 ? prev : value,
            );
        }
    }, [reduceMotion, windowWidth]);

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
        scrollFocus.register(project.id, rowRef.current);
        return () => {
            scrollFocus.register(project.id, null);
        };
    }, [project.id, scrollFocus]);

    const startYear = useMemo(
        () => project.from.split("/")[1],
        [project.from],
    );

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
        const pos = (props.center - 100) / props.screenHeight;
        const value = Math.round(pos * 100) / 100;
        setRelativeScreenPosition((prev) => {
            // Only update if value changed significantly
            if (Math.abs(prev - value) < 0.01) return prev;
            return value;
        });
    }, []);

    const isMobile = useMemo(() => windowWidth < 768, [windowWidth]);

    const multiplier = useMemo(() => 4, []);

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

    // Reveal the tech-stack line once the title's typewriter has finished
    // (typewriter completes when `relativeScreenPosition * multiplier >= 1`).
    const isTechLineVisible = relativeScreenPosition * multiplier >= 1;

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

    const cardMotionStyle = useMemo((): CSSProperties => {
        const base = {
            "--project-accent": hoverAccent,
        } as CSSProperties;
        const p = viewportProgress;
        const { cardW: C } = layoutSizes;

        if (isMobile) {
            // Mobile: simpler opacity-based reveal instead of position slide
            // to avoid janky subpixel rendering on mobile GPUs
            const opacity = p < 0.1 ? 0.3 : p < 0.3 ? 0.5 : 1;
            const translateY = (1 - p) * 30; // Smaller translate using vh for smoothness
            return {
                ...base,
                opacity,
                transform: `translate3d(0, ${translateY}px, 0)`,
            };
        }

        // Desktop: spread cards across the full viewport via a deterministic
        // cycle of horizontal positions. The row sits centered (mx-auto), so
        // shifting the card by `lateralFrac * maxDeviation` puts it anywhere
        // between flush-left and flush-right of the viewport.
        let extraPx = 0;
        if (windowWidth > 0 && C > 0) {
            const lateralFrac =
                LATERAL_POSITIONS[projectIndex % LATERAL_POSITIONS.length];
            const maxDeviation = Math.max(
                0,
                windowWidth / 2 - C / 2 - windowWidth * VIEWPORT_PADDING_RATIO,
            );
            extraPx = p * lateralFrac * maxDeviation;
        }
        // Subtle vertical drift: starts higher, settles to 0
        const translateY = (1 - p) * 50;
        const xPx = Math.round(extraPx * 100) / 100;
        const yVh = Math.round(translateY * 100) / 100;
        const translate = `translate(calc(-50% + ${xPx}px), ${yVh}vh)`;
        return { ...base, transform: translate };
    }, [
        hoverAccent,
        projectIndex,
        viewportProgress,
        layoutSizes.cardW,
        windowWidth,
        isMobile,
    ]);

    const isKeyboardActive =
        !!scrollFocus && scrollFocus.selectedProjectId === project.id;

    const cardContent = (
        <div ref={rowRef} className={styles.projectCardRow}>
            <div
                ref={cardRef}
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-label={`Open project details: ${project.name}`}
                className={`${styles.projectCard} ${isKeyboardActive ? styles.projectCardActive : ""} flex flex-col cursor-pointer`}
                style={cardMotionStyle}
                onClick={handleOpenDetails}
                onKeyDown={handleCardKeyDown}
            >
                <div className="w-full text-sm">
                    <div className="text-2xl font-bold text-left md:text-center w-full mb-1 flex flex-row items-center justify-start md:justify-center gap-2">
                        <span
                            className={`shrink-0 font-mono text-base ${styles.projectCardTitlePrompt} ${isTechLineVisible ? styles.projectCardTitlePromptVisible : ""}`}
                        >
                            &gt;_
                        </span>
                        <span
                            data-to={project.to}
                            className={`inline-block relative ${styles.projectCardTitleName}`}
                        >
                            <span className="absolute inset-0">
                                <RevealedWithCursor
                                    text={project.name}
                                    reveal={getRevealState}
                                />
                            </span>
                            <span className="opacity-0">{project.name}</span>
                        </span>
                    </div>
                    <div className={styles.projectCardContent}>
                        <div
                            className={`w-full font-mono text-sm flex flex-wrap justify-start md:justify-center pt-2 ${styles.projectCardTechLine} ${isTechLineVisible ? styles.projectCardTechLineVisible : ""}`}
                        >
                            <span>
                                <span className={styles.projectCardTechOther}>
                                    {startYear}
                                </span>
                                {sortedTechnologies.length > 0 && (
                                    <span className={styles.projectCardTechOther}>
                                        {"\u00A0"}
                                    </span>
                                )}
                            </span>
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
                                    {i < sortedTechnologies.length - 1 && (
                                        <span className={styles.projectCardTechOther}>
                                            {"\u00A0"}
                                        </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // On mobile: skip FadeIn and CustomParallax to reduce animated layers
    // On desktop: keep full animation stack
    if (isMobile) {
        return cardContent;
    }

    return (
        <FadeIn className="pointer-events-none" disableTransform>
            <CustomParallax onUpdate={onScrollUpdate}>
                {cardContent}
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

import {
    createContext,
    useCallback,
    useContext,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type FC,
    type ReactNode,
} from "react";

type ProjectsScrollFocusValue = {
    activeProjectId: string | null;
    register: (id: string, el: HTMLElement | null) => void;
    scrollToProject: (id: string) => void;
    getProjectIds: () => string[];
};

export const ProjectsScrollFocusContext =
    createContext<ProjectsScrollFocusValue | null>(null);

export function useProjectsScrollFocus(): ProjectsScrollFocusValue | null {
    return useContext(ProjectsScrollFocusContext);
}

export const ProjectsScrollFocusProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const refs = useRef<Map<string, HTMLElement>>(new Map());
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    const updateActive = useCallback(() => {
        if (typeof window === "undefined") return;
        const vh = window.innerHeight;
        const mid = vh / 2;
        const candidates: { id: string; d: number; top: number }[] = [];
        refs.current.forEach((el, id) => {
            const r = el.getBoundingClientRect();
            const cy = (r.top + r.bottom) / 2;
            const d = Math.abs(cy - mid);
            candidates.push({ id, d, top: r.top });
        });
        if (candidates.length === 0) {
            setActiveProjectId((prev) => (prev !== null ? null : prev));
            return;
        }
        candidates.sort((a, b) => a.d - b.d || a.top - b.top);
        const next = candidates[0]!.id;
        setActiveProjectId((prev) => (prev === next ? prev : next));
    }, []);

    const register = useCallback(
        (id: string, el: HTMLElement | null) => {
            if (el) refs.current.set(id, el);
            else refs.current.delete(id);
            queueMicrotask(updateActive);
        },
        [updateActive],
    );

    const scrollToProject = useCallback((id: string) => {
        const el = refs.current.get(id);
        if (!el || typeof window === "undefined") return;
        const cardRect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight / 2;
        const cardVisualCenter = cardRect.top + cardRect.height / 2;

        // How far the card's visual center is from viewport center
        const visualOffset = cardVisualCenter - viewportCenter;

        // The card has a translateY transform based on viewport progress.
        // We want to scroll so that when the card reaches center (transform ≈ 0),
        // it's visually centered. To do this, we need to account for the current
        // transform offset in our scroll calculation.
        // transformOffset = visualTop - naturalTop
        // When transform is 0, visualTop = naturalTop
        // So we scroll by visualOffset - transformOffset to center the natural position
        const rowEl = el.parentElement;
        const rowRect = rowEl?.getBoundingClientRect();
        // transformOffset: how many pixels the transform has shifted the card down
        // (positive means card is visually below its natural position)
        const transformOffset = rowRect ? cardRect.top - rowRect.top : 0;

        // We want the  card's NATURAL position to end up at viewport center.
        // The natural center is (visual center - transformOffset), so we need to
        // scroll by (visualOffset + transformOffset) to bring the natural center
        // to viewport center.
        const targetScroll = window.scrollY + visualOffset - transformOffset + 100 ;
        const startScroll = window.scrollY;
        const distance = targetScroll - startScroll;

        // 2x duration: base 600ms + 0.5ms per pixel (vs typical 300ms + 0.25ms)
        const duration = Math.min(1200, 600 + Math.abs(distance) * 0.5);
        const startTime = performance.now();

        const easeOutCubic = (t: number): number => {
            return 1 - Math.pow(1 - t, 3);
        };

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const currentScroll = startScroll + distance * eased;
            window.scrollTo(0, currentScroll);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, []);

    const getProjectIds = useCallback(() => {
        return Array.from(refs.current.keys());
    }, []);

    useLayoutEffect(() => {
        updateActive();
        window.addEventListener("scroll", updateActive, { passive: true });
        window.addEventListener("resize", updateActive, { passive: true });
        return () => {
            window.removeEventListener("scroll", updateActive);
            window.removeEventListener("resize", updateActive);
        };
    }, [updateActive]);

    const value = useMemo(
        () => ({ activeProjectId, register, scrollToProject, getProjectIds }),
        [activeProjectId, register, scrollToProject, getProjectIds],
    );

    return (
        <ProjectsScrollFocusContext.Provider value={value}>
            {children}
        </ProjectsScrollFocusContext.Provider>
    );
};

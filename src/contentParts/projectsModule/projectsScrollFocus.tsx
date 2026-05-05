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
    register: (id: string, rowEl: HTMLElement | null) => void;
    scrollToProject: (id: string) => void;
    getProjectIds: () => string[];
};

export const ProjectsScrollFocusContext =
    createContext<ProjectsScrollFocusValue | null>(null);

export function useProjectsScrollFocus(): ProjectsScrollFocusValue | null {
    return useContext(ProjectsScrollFocusContext);
}

interface ProjectsScrollFocusProviderProps {
    children: ReactNode;
    orderedIds: string[];
}

export const ProjectsScrollFocusProvider: FC<
    ProjectsScrollFocusProviderProps
> = ({ children, orderedIds }) => {
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
        const row = refs.current.get(id);
        if (!row || typeof window === "undefined") return;

        const rect = row.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const targetY =
            window.scrollY + rect.top + rect.height / 2 - viewportHeight / 2;
        const startY = window.scrollY;
        const distance = targetY - startY;

        // Longer duration for a luxurious feel: 800ms base + 0.4ms per pixel
        const duration = Math.min(1200, 800 + Math.abs(distance) * 0.4);
        const startTime = performance.now();

        // Ease-out cubic for smooth deceleration
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            window.scrollTo(0, startY + distance * eased);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, []);

    const getProjectIds = useCallback(() => {
        return orderedIds;
    }, [orderedIds]);

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

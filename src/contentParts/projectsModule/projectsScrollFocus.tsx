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

/** Same breakpoint as project cards (mobile layout + scale). */
const MOBILE_MAX_W = 768;

type ProjectsScrollFocusValue = {
    activeProjectId: string | null;
    register: (id: string, el: HTMLElement | null) => void;
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
        if (window.innerWidth > MOBILE_MAX_W) {
            setActiveProjectId((prev) => (prev !== null ? null : prev));
            return;
        }
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
        () => ({ activeProjectId, register }),
        [activeProjectId, register],
    );

    return (
        <ProjectsScrollFocusContext.Provider value={value}>
            {children}
        </ProjectsScrollFocusContext.Provider>
    );
};

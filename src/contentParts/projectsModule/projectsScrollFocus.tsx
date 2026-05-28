import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type FC,
    type ReactNode,
} from "react";

type ProjectsScrollFocusValue = {
    /**
     * The currently keyboard-selected project, or `null` when the user hasn't
     * engaged keyboard navigation (or has reverted to mouse/touch interaction).
     * This is intentionally decoupled from scroll position so that pressing
     * ArrowDown / Space always starts from the first project.
     */
    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
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
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
        null,
    );

    const register = useCallback(
        (id: string, el: HTMLElement | null) => {
            if (el) refs.current.set(id, el);
            else refs.current.delete(id);
        },
        [],
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

    const value = useMemo(
        () => ({
            selectedProjectId,
            setSelectedProjectId,
            register,
            scrollToProject,
            getProjectIds,
        }),
        [selectedProjectId, register, scrollToProject, getProjectIds],
    );

    return (
        <ProjectsScrollFocusContext.Provider value={value}>
            {children}
        </ProjectsScrollFocusContext.Provider>
    );
};

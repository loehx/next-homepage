// Mock lenis/react for Storybook Preact compatibility
import { createContext } from "preact";
import { useEffect, useState, useContext } from "preact/hooks";
import Lenis from "lenis";

type LenisContextType = {
    lenis: Lenis | null;
};

const LenisContext = createContext<LenisContextType>({ lenis: null });

type ReactLenisProps = {
    children: any; // Use any to avoid "ComponentChildren" export issue in some environments
    root?: boolean;
    options?: {
        lerp?: number;
        smoothWheel?: boolean;
        syncTouch?: boolean;
    };
};

// Export as ReactLenis for compatibility with lenis/react API
export const ReactLenis = ({ children, root, options }: ReactLenisProps) => {
    const [lenis, setLenis] = useState<Lenis | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const lenisInstance = new Lenis({
            ...options,
            ...(root ? { wrapper: window } : {}),
        });

        setLenis(lenisInstance);

        let rafId: number;
        const raf = (time: number) => {
            lenisInstance.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenisInstance.destroy();
            setLenis(null);
        };
    }, [options?.lerp, options?.smoothWheel, options?.syncTouch, root]);

    return (
        <LenisContext.Provider value={{ lenis }}>
            {children}
        </LenisContext.Provider>
    );
};

// Export useLenis hook that reads from context
export const useLenis = () => {
    const context = useContext(LenisContext);
    return context?.lenis ?? null;
};

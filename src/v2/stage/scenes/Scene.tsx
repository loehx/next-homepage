import React, { useCallback, useEffect, useRef, useState } from "react";
import { useScroll, ScrollData } from "../../components/scrollHandler";

export type SceneProps = {
    offset: number; // vh - scroll position where progress should increase
    height: number; // vh - height of the scene
    children: React.ReactNode;
    className?: string;
};

export const Scene: React.FC<SceneProps> = ({
    offset,
    height,
    children,
    className,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    const update = useCallback(
        ({ y, vh }: ScrollData) => {
            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const absoluteTop = rect.top + y;
            const offsetPx = (offset / 100) * vh;
            const heightPx = (height / 100) * vh;
            const sceneStart = absoluteTop + offsetPx;
            const sceneEnd = sceneStart + heightPx;

            let calculatedProgress = 0;

            if (y < sceneStart) {
                calculatedProgress = 0;
            } else if (y >= sceneEnd) {
                calculatedProgress = 1;
            } else {
                calculatedProgress = (y - sceneStart) / heightPx;
            }

            setProgress(Math.max(0, Math.min(1, calculatedProgress)));
        },
        [offset, height],
    );

    useScroll(update);

    useEffect(() => {
        if (typeof window === "undefined") return;
        update({
            y: window.scrollY,
            direction: 1,
            progress: 0,
            vh: window.innerHeight,
            totalHeight: document.documentElement?.scrollHeight ?? 0,
        });
    }, [update]);

    return (
        <div
            ref={ref}
            className={className}
            style={{ height: `${height}vh` }}
            data-progress={progress}
        >
            {children}
        </div>
    );
};

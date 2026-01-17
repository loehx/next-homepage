import React, { PropsWithChildren, useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";
import { useUrlPositionScroll } from "../../hooks/useUrlPositionScroll";

type LenisScrollProps = PropsWithChildren<{
    enabled?: boolean;
}>;

export const LenisScroll: React.FC<LenisScrollProps> = ({
    enabled = true,
    children,
}) => {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        if (!enabled) {
            setIsEnabled(false);
            return;
        }

        const reducedMotion = window.matchMedia?.(
            "(prefers-reduced-motion: reduce)",
        )?.matches;

        setIsEnabled(!reducedMotion);
    }, [enabled]);

    if (!isEnabled) return <>{children}</>;

    return (
        <ReactLenis
            root
            options={{
                lerp: 0.8,
                smoothWheel: true,
                syncTouch: false,
            }}
        >
            <ScrollPositionHandler />
            {children}
        </ReactLenis>
    );
};

const ScrollPositionHandler: React.FC = () => {
    useUrlPositionScroll(300);
    return null;
};

import React, { PropsWithChildren, useEffect, useState } from "react";
import { ReactLenis } from "lenis/react";

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
                lerp: 0.2,
                smoothWheel: true,
                smoothTouch: false, // TODO: Test this setting.
            }}
        >
            {children}
        </ReactLenis>
    );
};

import { FC, useMemo } from "react";

interface SmokeIconProps {
    className?: string;
    style?: React.CSSProperties;
}

export const SmokeIcon: FC<SmokeIconProps> = ({ className, style }) => {
    const isMac = useMemo(() => {
        if (typeof window === "undefined") return false;
        return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    }, []);

    if (isMac) {
        return (
            <span className={className} style={style}>
                💨
            </span>
        );
    }

    return (
        <img
            src="/icons/dashing-away.png"
            alt=""
            className={className}
            style={style}
        />
    );
};

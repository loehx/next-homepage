import { useCallback, useMemo } from "preact/hooks";
import classNames from "classnames";
import "./MenuItem.css";

interface MenuItemProps {
    label: string;
    hiddenIndexes: number[];
    hoverColor: string;
    isActive?: boolean;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: () => void;
}

export const MenuItem = ({
    label,
    hiddenIndexes,
    hoverColor,
    isActive,
    onMouseEnter,
    onMouseLeave,
    onClick,
}: MenuItemProps) => {
    const audio = useMemo(() => {
        if (typeof window === "undefined") return null;
        const a = new Audio("/sounds/moan.mp3");
        a.volume = 0.5;
        return a;
    }, []);

    const playSound = useCallback(() => {
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {
                // Ignore errors if audio play is blocked by browser
            });
        }
    }, [audio]);

    const handleMouseEnter = useCallback(() => {
        playSound();
        onMouseEnter?.();
    }, [playSound, onMouseEnter]);

    const handleClick = useCallback(() => {
        playSound();
        onClick?.();
    }, [playSound, onClick]);

    return (
        <button
            className={classNames("menu-item", { "menu-item--active": isActive })}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{ color: isActive ? hoverColor : "var(--color-text)" }}
            aria-label={label}
        >
            {label.split("").map((char, index) => {
                const isHidden = hiddenIndexes.includes(index);
                return (
                    <span
                        key={index}
                        className={classNames("menu-item__char", {
                            "menu-item__char--hidden": isHidden,
                            "menu-item__char--visible": !isHidden,
                            "menu-item__char--expanded": isHidden && isActive,
                        })}
                    >
                        <span className="menu-item__char-inner">{char}</span>
                    </span>
                );
            })}
        </button>
    );
};

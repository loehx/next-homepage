import { useCallback, useMemo } from "preact/hooks";
import classNames from "classnames";
import styles from "./MenuItem.module.css";

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
            className={classNames(styles.item, { [styles.isActive]: isActive })}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{ color: isActive ? hoverColor : "white" }}
            aria-label={label}
        >
            {label.split("").map((char, index) => {
                const isHidden = hiddenIndexes.includes(index);
                return (
                    <span
                        key={index}
                        className={classNames(styles.char, {
                            [styles.hidden]: isHidden,
                            [styles.visible]: !isHidden,
                            [styles.expanded]: isHidden && isActive,
                        })}
                    >
                        <span className={styles.charInner}>{char}</span>
                    </span>
                );
            })}
        </button>
    );
};

import { useState } from "preact/hooks";
import cx from "classnames";
import styles from "./MenuButton.module.css";

export interface MenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
    className?: string;
}

export const MenuButton = ({
    isOpen,
    onClick,
    className,
}: MenuButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const label = isOpen ? "CLOSE" : "MENU";
    const hiddenIndexes = isOpen ? [2, 4] : [1, 3];
    const isExpanded = isHovered;

    return (
        <button
            className={cx(styles.menuButton, className)}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            data-open={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            type="button"
        >
            {label.split("").map((char, index) => {
                const isHidden = hiddenIndexes.includes(index);
                return (
                    <span
                        key={index}
                        className={cx(styles.char, {
                            [styles.hidden]: isHidden && !isExpanded,
                            [styles.visible]: !isHidden,
                            [styles.expanded]: isHidden && isExpanded,
                        })}
                    >
                        <span className={styles.charInner}>{char}</span>
                    </span>
                );
            })}
        </button>
    );
};

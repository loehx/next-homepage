import { useState } from "preact/hooks";
import cx from "classnames";
import "./MenuButton.css";

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
            className={cx("menu-button", className)}
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
                        className={cx("menu-button__char", {
                            "menu-button__char--hidden": isHidden && !isExpanded,
                            "menu-button__char--visible": !isHidden,
                            "menu-button__char--expanded": isHidden && isExpanded,
                        })}
                    >
                        <span className="menu-button__char-inner">{char}</span>
                    </span>
                );
            })}
        </button>
    );
};

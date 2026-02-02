import React from "react";
import cx from "classnames";
import styles from "./MenuButton.module.css";

export interface MenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
    className?: string;
}

export const MenuButton: React.FC<MenuButtonProps> = ({
    isOpen,
    onClick,
    className,
}) => {
    return (
        <button
            className={cx(styles.menuButton, className)}
            onClick={onClick}
            data-open={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            type="button"
        >
            {isOpen ? "close" : "menu"}
        </button>
    );
};

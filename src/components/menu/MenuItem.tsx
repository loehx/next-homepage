import React from "react";
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

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  hiddenIndexes,
  hoverColor,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  return (
    <button
      className={classNames(styles.item, { [styles.isActive]: isActive })}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
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

import React, { useEffect, useCallback, useState } from "react";
import classNames from "classnames";
import { MenuItem } from "./MenuItem";
import styles from "./MenuOverlay.module.css";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (targetPos: number) => void;
  activeItemIndex: number;
}

const ITEMS = [
  { label: "INTRO", hiddenIndexes: [3, 4], targetPos: 0, hoverColor: "#f635df" },
  { label: "ABOUT", hiddenIndexes: [2, 3], targetPos: 1, hoverColor: "#35f686" },
  { label: "PROJECTS", hiddenIndexes: [2, 4, 5, 6, 7], targetPos: 2, hoverColor: "#bef635" },
  { label: "LINKS", hiddenIndexes: [1, 4], targetPos: 3, hoverColor: "#f64b4b" },
  { label: "CONTACT", hiddenIndexes: [1, 4, 5, 6], targetPos: 999, hoverColor: "#4b9cf6" },
];

export const MenuOverlay: React.FC<MenuOverlayProps> = ({
  isOpen,
  onClose,
  onItemClick,
  activeItemIndex,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isOpen) {
      setHoveredIndex(null);
    }
  }, [isOpen]);

  return (
    <div
      className={classNames(styles.overlay, { [styles.isOpen]: isOpen })}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
      onMouseLeave={handleMouseLeave}
    >
      <nav className={styles.container} role="navigation">
        {ITEMS.map((item, index) => {
          const visualActiveIndex = hoveredIndex !== null ? hoveredIndex : activeItemIndex;

          return (
            <div key={item.label} className={styles.itemWrapper}>
              <MenuItem
                label={item.label}
                hiddenIndexes={item.hiddenIndexes}
                hoverColor={item.hoverColor}
                isActive={visualActiveIndex === index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onItemClick(item.targetPos)}
              />
            </div>
          );
        })}
      </nav>
    </div>
  );
};

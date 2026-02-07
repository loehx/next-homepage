import React, { useState, useCallback, useRef, useEffect } from "react";
import styles from "./CursorGradient.module.css";
import { GrainOverlay } from "../gradients/Gradients";

interface CursorGradientProps {
  /**
   * Color of the radial gradient (default: rgba(0, 0, 0, 0.15))
   */
  gradientColor?: string;
  /**
   * Radius of the gradient in pixels (default: 400)
   */
  radius?: number;
  /**
   * Theme of the background ('light' | 'dark', default: 'light')
   */
  theme?: "light" | "dark";
  /**
   * Opacity of the grain (default: 0.1)
   */
  grainOpacity?: number;
}

/**
 * A component that displays a radial gradient following the mouse cursor,
 * overlaid with a static grain texture.
 */
export const CursorGradient: React.FC<CursorGradientProps> = ({
  gradientColor = "rgba(0, 0, 0, 0.15)",
  radius = 400,
  theme = "light",
  grainOpacity = 0.1,
}) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  // Update theme on the container if it's not being controlled globally
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.classList.remove("light", "dark");
      containerRef.current.classList.add(theme);
    }
  }, [theme]);

  const gradientStyle: React.CSSProperties = {
    background: `radial-gradient(circle ${radius}px at ${mousePos.x}px ${mousePos.y}px, ${gradientColor} 0%, transparent 100%)`,
    opacity: isHovering ? 1 : 0,
    transition: "opacity 0.3s ease-out",
  };

  const grainMaskStyle: React.CSSProperties = {
    maskImage: `radial-gradient(circle ${radius}px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
    WebkitMaskImage: `radial-gradient(circle ${radius}px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
    opacity: isHovering ? 1 : 0,
    transition: "opacity 0.3s ease-out",
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${theme}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.gradient} style={gradientStyle} />
      <div className={styles.grain} style={grainMaskStyle}>
        <GrainOverlay grainOpacity={grainOpacity} grainSize={0.8} grainIntensity={0.5} />
      </div>
    </div>
  );
};

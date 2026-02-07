import React, { useId } from "react";
import styles from "./Gradients.module.css";

interface GradientsProps {
  /**
   * Two colors for the linear gradient
   */
  colors: [string, string];
  /**
   * Maps to baseFrequency in feTurbulence (default: 0.8)
   */
  grainSize?: number;
  /**
   * Maps to numOctaves in feTurbulence (default: 4)
   */
  grainDepth?: number;
  /**
   * Maps to slope in feFuncR/G/B (default: 0.5)
   */
  grainIntensity?: number;
  /**
   * Maps to CSS opacity of .grainOverlay (default: 0.4)
   */
  grainOpacity?: number;
  /**
   * Optional className for the container
   */
  className?: string;
}

interface GrainOverlayProps {
  /**
   * Maps to baseFrequency in feTurbulence (default: 0.8)
   */
  grainSize?: number;
  /**
   * Maps to numOctaves in feTurbulence (default: 4)
   */
  grainDepth?: number;
  /**
   * Maps to slope in feFuncR/G/B (default: 0.5)
   */
  grainIntensity?: number;
  /**
   * Maps to CSS opacity of .grainOverlay (default: 0.4)
   */
  grainOpacity?: number;
}

/**
 * A reusable grain overlay component that applies a SVG turbulence filter.
 */
export const GrainOverlay: React.FC<GrainOverlayProps> = ({
  grainSize = 0.8,
  grainDepth = 4,
  grainIntensity = 0.5,
  grainOpacity = 0.4,
}) => {
  const baseId = useId().replace(/:/g, "");
  // We include parameters in the ID to force browsers to re-render the filter
  // when attributes change, as some browsers cache the filter output by ID.
  const filterId = `grain-${baseId}-${grainSize}-${grainDepth}-${grainIntensity}`.replace(/\./g, "-");

  return (
    <>
      <svg
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={grainSize}
            numOctaves={grainDepth}
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" result="desaturatedNoise" />
          <feComponentTransfer in="desaturatedNoise">
            <feFuncR type="linear" slope={grainIntensity} />
            <feFuncG type="linear" slope={grainIntensity} />
            <feFuncB type="linear" slope={grainIntensity} />
          </feComponentTransfer>
        </filter>
      </svg>
      <div
        className={styles.grainOverlay}
        style={{
          filter: `url(#${filterId})`,
          opacity: grainOpacity,
        }}
      />
    </>
  );
};

/**
 * A grainy gradient component that applies a SVG turbulence filter
 * to a linear gradient background.
 */
export const Gradients: React.FC<GradientsProps> = ({
  colors,
  grainSize,
  grainDepth,
  grainIntensity,
  grainOpacity,
  className = "",
}) => {
  const [color1, color2] = colors;

  return (
    <div
      className={`${styles.gradientBase} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
      }}
    >
      <GrainOverlay
        grainSize={grainSize}
        grainDepth={grainDepth}
        grainIntensity={grainIntensity}
        grainOpacity={grainOpacity}
      />
    </div>
  );
};

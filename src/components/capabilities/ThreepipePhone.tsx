import { useRef } from "preact/hooks";
import { useThreepipePhone } from "./useThreepipePhone";
import "./ThreepipePhone.css";

interface ThreepipePhoneProps {
  imageUrl: string;
  isVisible: boolean;
  flipKey?: number;
  onLoad?: () => void;
}

export const ThreepipePhone = ({
  imageUrl,
  isVisible,
  flipKey = 0,
  onLoad,
}: ThreepipePhoneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { isModelReady } = useThreepipePhone(
    containerRef,
    canvasRef,
    imageUrl,
    flipKey,
    onLoad
  );

  return (
    <div 
      ref={containerRef} 
      className="capabilities__phone-container" 
      style={{ visibility: isVisible ? "visible" : "hidden" }}
    >
      <canvas ref={canvasRef} className="capabilities__phone-canvas" />
      {!isModelReady && (
        <div className="capabilities__phone-loader">Loading 3D iPhone...</div>
      )}
    </div>
  );
};

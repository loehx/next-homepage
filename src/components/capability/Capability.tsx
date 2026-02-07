import { useEffect, useState, useCallback } from "preact/hooks";
import type { JSX } from "preact";
import classNames from "classnames";
import "./Capability.css";
import { Detail } from "./Detail";
import { Phone } from "./Phone";
import { DETAILS, INTERVAL_MS, TOTAL_DURATION_MS } from "./constants";

type CapabilityProps = {
  activeIndex?: number;
  isPlaying?: boolean;
  progress?: number;
  renderPhone?: (props: { isLoaded: boolean; imageUrl?: string; flipKey?: number }) => JSX.Element;
};

export const Capability = ({
  activeIndex: externalActiveIndex,
  isPlaying: externalIsPlaying = true,
  progress: externalProgress,
  renderPhone,
}: CapabilityProps) => {
  const PhoneComponent = renderPhone || (Phone as any); // Type cast for simplicity with preact/react mismatch if any
  const [activeIndex, setActiveIndex] = useState(externalActiveIndex ?? 0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(externalIsPlaying);
  const [phoneLoaded, setPhoneLoaded] = useState(false);

  useEffect(() => {
    if (externalActiveIndex !== undefined) {
      setActiveIndex(externalActiveIndex);
    }
  }, [externalActiveIndex]);

  useEffect(() => {
    setIsPlaying(externalIsPlaying);
  }, [externalIsPlaying]);

  const togglePlaying = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent && e.button !== 0) return;
      if (e.target instanceof HTMLElement) {
        const interactive = e.target.closest(
          "button, a, input, textarea, select, [role='button']",
        );
        if (interactive) return;
      }
      togglePlaying();
    };

    window.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("mousedown", handleClick);
    };
  }, [togglePlaying]);

  useEffect(() => {
    if (!isPlaying || !phoneLoaded) return;
    if (externalActiveIndex !== undefined) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % DETAILS.length;
        if (next === 0) setCycleCount((c) => c + 1);
        return next;
      });
    }, INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isPlaying, phoneLoaded, externalActiveIndex]);

  useEffect(() => {
    setTimeout(() => setPhoneLoaded(true), 100);
  }, []);

  const phoneReady = phoneLoaded;

  return (
    <>
      <div className="capability">
        <div className="capability__left-container">
          <PhoneComponent 
            isLoaded={phoneReady} 
            imageUrl={DETAILS[activeIndex].imageUrl}
            flipKey={activeIndex}
          />
        </div>

        <div className="capability__right-container">
          {phoneReady && (
            <Detail
              key={activeIndex}
              title={DETAILS[activeIndex].title}
              label={DETAILS[activeIndex].label}
              isPlaying={isPlaying}
              accentColor={DETAILS[activeIndex].accentColor}
              index={activeIndex}
            />
          )}
        </div>
      </div>
      {phoneReady && (
        <div
          key={cycleCount}
          className={classNames(
            "capability__progress-bar",
            !isPlaying && "capability__progress-bar--paused",
          )}
          style={
            {
              "--duration": `${TOTAL_DURATION_MS}ms`,
              "--accent-color": DETAILS[activeIndex].accentColor,
            } as any
          }
        />
      )}
    </>
  );
};

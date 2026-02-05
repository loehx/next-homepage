import { useEffect, useState, useCallback } from "preact/hooks";
import classNames from "classnames";
import "./Capabilities.css";
import { Detail } from "./Detail";
import { DETAILS, INTERVAL_MS, TOTAL_DURATION_MS } from "./constants";

type CapabilitiesProps = {
  activeIndex?: number;
  isPlaying?: boolean;
  progress?: number;
};

export const Capabilities = ({
  activeIndex: externalActiveIndex,
  isPlaying: externalIsPlaying = true,
  progress: externalProgress,
}: CapabilitiesProps) => {
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
      <div className="capabilities">
        <div className="capabilities__left-container">
          <div
            className={classNames(
              "capabilities__phone",
              phoneReady && "capabilities__phone--loaded",
            )}
          >
            <div className="capabilities__phone-placeholder" />
          </div>
        </div>

        <div className="capabilities__right-container">
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
            "capabilities__progress-bar",
            !isPlaying && "capabilities__progress-bar--paused",
          )}
          style={
            {
              "--duration": `${TOTAL_DURATION_MS}ms`,
              "--accent-color": DETAILS[activeIndex].accentColor,
            } as Record<string, unknown>
          }
        />
      )}
    </>
  );
};

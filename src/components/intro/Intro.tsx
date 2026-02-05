import { useEffect, useState, useCallback } from "preact/hooks";
import classNames from "classnames";
import "./Intro.css";

const DURATION = 500;
const STOP_INTERVAL = 500;
const CHARACTERS_SPEED = 100;
const PAD_END = 20;
const CUSTOM_SEEDS = [23, 32, 43];
const COLORS = ["#f635df", "#35f686", "#bef635", "#f64b4b", "#4b9bf6"];
const ALTERNATE_COLORS_INTERVAL = 2500;

function getCurrentSalutation(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Moin";
  if (h >= 12 && h < 18) return "Guten Tag";
  return "Guten Abend";
}

const LINES = [
  ["Heyo", getCurrentSalutation(), "Welcome"],
  ["I am", "Alexander", "Loehn"],
  ["Freelance", "Developer", "With Passion"],
];

function useRandomizedText(
  text: string,
  duration: number,
  interval: number,
  padEnd: number,
  customSeed: number,
  resetKey: number,
  isActive: boolean,
): string {
  const RANDOM_CHARS = "abcdefghijklmnopqrstuvwxyz";
  const [step, setStep] = useState(0);
  const totalSteps = Math.floor(duration / interval);

  useEffect(() => {
    setStep(0);
  }, [resetKey]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setStep((s) => (s < totalSteps ? s + 1 : s));
    }, interval);
    return () => clearInterval(timer);
  }, [totalSteps, interval, resetKey, isActive]);

  const getDeterministicChar = (seed: number) => {
    let h = Math.imul(seed ^ (seed >>> 16), 0x21f0aaad);
    h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
    return RANDOM_CHARS[((h ^ (h >>> 15)) >>> 0) % RANDOM_CHARS.length];
  };
  const getRandomString = (length: number, step: number, seed: number) => {
    let res = "";
    for (let i = 0; i < length; i++) {
      res += getDeterministicChar(Math.imul(step ^ 0xdeadbeef, i + seed + 1));
    }
    return res;
  };

  if (step === totalSteps) {
    return `${text}-${getRandomString(padEnd, step, customSeed)}`;
  }
  return getRandomString(text.length + padEnd + 1, step, customSeed);
}

type IntroProps = {
  progress?: number;
  isActive?: boolean;
};

export const Intro = ({ progress: externalProgress = -1, isActive: externalIsActive = true }: IntroProps) => {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [isActive, setIsActive] = useState(externalIsActive);

  const progress = externalProgress >= 0 ? Math.min(Math.max(externalProgress, 0), 1) * 1.2 : -1;

  const toggleActive = useCallback(() => {
    setIsActive((prev) => !prev);
  }, []);

  const stopActive = useCallback(() => {
    setIsActive(false);
  }, []);

  useEffect(() => {
    setIsActive(externalIsActive);
  }, [externalIsActive]);

  useEffect(() => {
    const handleToggle = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent && e.button !== 0) return;
      if (e.target instanceof HTMLElement && e.target.closest("button, a, input, textarea, select, [role='button']"))
        return;
      toggleActive();
    };
    window.addEventListener("mousedown", handleToggle);
    window.addEventListener("touchstart", handleToggle, { passive: true });
    window.addEventListener("wheel", stopActive, { passive: true });
    window.addEventListener("touchmove", stopActive, { passive: true });
    return () => {
      window.removeEventListener("mousedown", handleToggle);
      window.removeEventListener("touchstart", handleToggle);
      window.removeEventListener("wheel", stopActive);
      window.removeEventListener("touchmove", stopActive);
    };
  }, [toggleActive, stopActive]);

  const currentLineSet = LINES[cycleIndex % LINES.length];
  const renderedLines = [
    useRandomizedText(currentLineSet[0], DURATION, CHARACTERS_SPEED, PAD_END, CUSTOM_SEEDS[0], cycleIndex, isActive),
    useRandomizedText(
      currentLineSet[1],
      DURATION + STOP_INTERVAL,
      CHARACTERS_SPEED,
      PAD_END,
      CUSTOM_SEEDS[1],
      cycleIndex,
      isActive,
    ),
    useRandomizedText(
      currentLineSet[2],
      DURATION + STOP_INTERVAL * 2,
      CHARACTERS_SPEED,
      PAD_END,
      CUSTOM_SEEDS[2],
      cycleIndex,
      isActive,
    ),
  ];

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCycleIndex((prev) => prev + 1);
    }, ALTERNATE_COLORS_INTERVAL);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <>
      <div
        className={classNames("intro", {
          "intro--fade-in": progress >= 0,
          "intro--scrolling": progress > 0,
        })}
        style={{ "--lines": renderedLines.length, "--progress": progress } as Record<string, unknown>}
      >
        {renderedLines.map((line, index) => (
          <div
            key={index}
            className="intro__line"
            style={{ color: index === 1 ? COLORS[cycleIndex % COLORS.length] : undefined } as Record<string, unknown>}
          >
            <span className="intro__text" style={{ opacity: line.includes("-") ? 1 : 0.5 }}>
              {line.split("-")[0]}
            </span>
            {line.includes("-") && <span className="intro__text" style={{ opacity: 0.1 }}>{line.split("-")[1]}</span>}
          </div>
        ))}
      </div>
      <div
        key={Math.floor(cycleIndex / 3)}
        className={classNames("intro__progress-bar", { "intro__progress-bar--paused": !isActive })}
        style={{ "--color": COLORS[cycleIndex % COLORS.length], "--duration": `${ALTERNATE_COLORS_INTERVAL * 3}ms` } as Record<string, unknown>}
      />
    </>
  );
};

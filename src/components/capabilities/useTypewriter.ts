import { useEffect, useState } from "preact/hooks";
import { stripAsterisks } from "./utils";

export function useTypewriter(
  text: string,
  isActive: boolean,
  isPlaying: boolean,
  speedMs: number,
) {
  const [charIndex, setCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const cleanText = stripAsterisks(text);

  useEffect(() => {
    if (!isActive) {
      setCharIndex(0);
      setIsComplete(false);
      return;
    }

    if (!isPlaying || isComplete) return;

    if (charIndex >= cleanText.length) {
      setIsComplete(true);
      return;
    }

    const timeout = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, speedMs);

    return () => clearTimeout(timeout);
  }, [cleanText, isActive, isPlaying, charIndex, isComplete, speedMs]);

  const displayedText = cleanText.slice(0, charIndex);

  return {
    displayedText,
    isTyping: isActive && !isComplete,
  };
}

import type { JSX } from "preact";

export interface TextSegment {
  text: string;
  isBold: boolean;
}

export function parseTextSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let currentIndex = 0;
  const regex = /\*([^*]+)\*/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > currentIndex) {
      segments.push({
        text: text.slice(currentIndex, match.index),
        isBold: false,
      });
    }
    segments.push({
      text: match[1],
      isBold: true,
    });
    currentIndex = match.index + match[0].length;
  }

  if (currentIndex < text.length) {
    segments.push({
      text: text.slice(currentIndex),
      isBold: false,
    });
  }

  return segments;
}

export function stripAsterisks(text: string): string {
  return text.replace(/\*/g, "");
}

export function renderTextSegments(
  segments: TextSegment[],
  maxLength: number,
  color?: string,
): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let currentLength = 0;
  let partKey = 0;

  for (const segment of segments) {
    if (currentLength >= maxLength) break;

    const remainingLength = maxLength - currentLength;
    const displayText =
      segment.text.length <= remainingLength
        ? segment.text
        : segment.text.slice(0, remainingLength);

    if (displayText) {
      if (segment.isBold) {
        parts.push(
          <strong key={partKey++} style={{ color }}>
            {displayText}
          </strong>,
        );
      } else {
        parts.push(displayText);
      }
      currentLength += displayText.length;
    }
  }

  return parts.length > 0 ? parts : [];
}

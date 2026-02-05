import { useEffect, useState } from "preact/hooks";
import classNames from "classnames";
import { parseTextSegments, stripAsterisks, renderTextSegments } from "./utils";
import { useTypewriter } from "./useTypewriter";

const TYPE_DURATION_MS = 2500;

type DetailProps = {
  title: string;
  label: string;
  isPlaying: boolean;
  accentColor: string;
  index: number;
};

export function Detail({ title, label, isPlaying, accentColor, index }: DetailProps) {
  const [isActive, setIsActive] = useState(false);
  const cleanTitleLength = stripAsterisks(title).length;
  const cleanLabelLength = stripAsterisks(label).length;
  const speedLabel = TYPE_DURATION_MS / cleanLabelLength;

  const { displayedText: displayedLabel, isTyping: isLabelTyping } =
    useTypewriter(label, true, isPlaying, speedLabel);

  const titleSegments = parseTextSegments(title);
  const labelSegments = parseTextSegments(label);

  useEffect(() => {
    if (isPlaying) {
      setTimeout(() => {
        setIsActive(true);
      }, 100);
    }
  }, []);

  return (
    <div
      className={classNames("capabilities__detail-container", !isPlaying && "capabilities__detail-container--paused")}
      style={{ "--accent-color": accentColor } as Record<string, unknown>}
      data-index={index}
    >
      <div className={classNames("capabilities__detail", isActive && "capabilities__detail--active")}>
        <span className="capabilities__detail-title">
          <span className="capabilities__detail-title-inner">
            {renderTextSegments(titleSegments, title.length, accentColor)}
          </span>
        </span>
        <p className="capabilities__detail-label">
          {renderTextSegments(labelSegments, displayedLabel.length, accentColor)}
          {isLabelTyping && <span className="capabilities__cursor"></span>}
        </p>
      </div>
      <div className={classNames("capabilities__detail", "capabilities__detail--invisible")}>
        <span className="capabilities__detail-title">
          {renderTextSegments(titleSegments, cleanTitleLength, accentColor)}
        </span>
        <p className="capabilities__detail-label">
          {renderTextSegments(labelSegments, cleanLabelLength, accentColor)}
        </p>
      </div>
    </div>
  );
}

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
      className={classNames("capability__detail-container", !isPlaying && "capability__detail-container--paused")}
      style={{ "--accent-color": accentColor } as Record<string, unknown>}
      data-index={index}
    >
      <div className={classNames("capability__detail", isActive && "capability__detail--active")}>
        <span className="capability__detail-title">
          <span className="capability__detail-title-inner">
            {renderTextSegments(titleSegments, title.length, accentColor)}
          </span>
        </span>
        <p className="capability__detail-label">
          {renderTextSegments(labelSegments, displayedLabel.length, accentColor)}
          {isLabelTyping && <span className="capability__cursor"></span>}
        </p>
      </div>
      <div className={classNames("capability__detail", "capability__detail--invisible")}>
        <span className="capability__detail-title">
          {renderTextSegments(titleSegments, cleanTitleLength, accentColor)}
        </span>
        <p className="capability__detail-label">
          {renderTextSegments(labelSegments, cleanLabelLength, accentColor)}
        </p>
      </div>
    </div>
  );
}

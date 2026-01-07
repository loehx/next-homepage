import React from "react";
import styles from "./Area.module.css";

type BlurryTextProps = {
    text: string;
    progress: number;
    blurAmount: number;
    isAppearing: boolean;
    className?: string;
};

export const BlurryText: React.FC<BlurryTextProps> = ({
    text,
    progress,
    blurAmount,
    isAppearing,
    className,
}) => {
    const letters = text.split("");

    return (
        <span className={className}>
            {letters.map((letter, index) => {
                const letterDelay = index / letters.length;
                const letterOpacity = Math.max(
                    0,
                    Math.min(1, (progress - letterDelay) * letters.length),
                );
                const blur = blurAmount * (1 - letterOpacity);

                return (
                    <span
                        key={index}
                        className={isAppearing ? styles.blurryLetter : ""}
                        style={{
                            filter: `blur(${blur || 0}px)`,
                            display: "inline-block",
                        }}
                    >
                        {letter === " " ? "\u00A0" : letter}
                    </span>
                );
            })}
        </span>
    );
};

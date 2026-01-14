import React from "react";

const curtainStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    width: "50vw",
    height: "100vh",
    backgroundColor: "#000",
    willChange: "transform",
    pointerEvents: "none",
};

interface Background1Props {
    progress: number;
    distance: number; // 0 ... 1.0 - distance of the animation
}

export const Background1: React.FC<Background1Props> = ({
    progress,
    distance,
}) => {
    const distanceScale = 100;
    const distanceX = distance * distanceScale;
    const distanceY = distance * distanceScale;

    // We can ease the progress if we want to match the previous feel, but usually scroll-linked animations are linear to scroll.
    // However, if the user wants "progress" to just replace time, direct mapping is best.
    const p = Math.min(Math.max(progress, 0), 1);

    const transform = (x: number, y: number) =>
        `translateX(${x}%) translateY(${y}%) rotate(-45deg)`;

    return (
        <>
            <div
                style={{
                    ...curtainStyle,
                    boxShadow: "-2000px 0 0 2000px black",
                    left: 0,
                    transform: transform(-distanceX * p, distanceY * p),
                }}
            />
            <div
                style={{
                    ...curtainStyle,
                    boxShadow: "2000px 0 0 2000px black",
                    right: 0,
                    transform: transform(distanceX * p, -distanceY * p),
                }}
            />
        </>
    );
};

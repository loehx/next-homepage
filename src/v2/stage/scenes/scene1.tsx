import React, { useEffect, useRef } from "react";

const curtainStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    width: "51vw",
    height: "100vh",
    backgroundColor: "#000",
    zIndex: 100,
    willChange: "transform",
    pointerEvents: "none",
};

interface Scene1Props {
    delay: number; // ms
    duration: number; // ms
    distance: number; // 0 ... 1.0 - distance of the animation
    onAnimationEnd: () => void;
}

export const Scene1: React.FC<Scene1Props> = ({
    delay,
    duration,
    distance,
    onAnimationEnd,
}) => {
    const leftCurtainRef = useRef<HTMLDivElement>(null);
    const rightCurtainRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!leftCurtainRef.current || !rightCurtainRef.current) return;

        console.log("Scene1: Initializing animation", {
            left: leftCurtainRef.current,
            right: rightCurtainRef.current,
        });

        const distanceScale = 100;
        const distanceX = distance * distanceScale;
        const distanceY = distance * distanceScale;

        const options: KeyframeAnimationOptions = {
            duration,
            easing: "cubic-bezier(0.19, 1, 0.22, 1)", // easeOutExpo
            delay,
            fill: "forwards",
        };

        const transform = (x: number, y: number) =>
            `translateX(${x}%) translateY(${y}%) rotate(-45deg)`;

        const leftAnim = leftCurtainRef.current.animate(
            [
                { transform: transform(0, 0) },
                { transform: transform(-distanceX, distanceY) },
            ],
            options,
        );

        const rightAnim = rightCurtainRef.current.animate(
            [
                { transform: transform(0, 0) },
                { transform: transform(distanceX, -distanceY) },
            ],
            options,
        );

        Promise.all([leftAnim.finished, rightAnim.finished]).then(
            onAnimationEnd,
        );

        return () => {
            leftAnim.cancel();
            rightAnim.cancel();
        };
    }, []);

    return (
        <>
            <div
                ref={leftCurtainRef}
                style={{
                    ...curtainStyle,
                    boxShadow: "-2000px 0 0 2000px black",
                    left: 0,
                }}
            />
            <div
                ref={rightCurtainRef}
                style={{
                    ...curtainStyle,
                    boxShadow: "2000px 0 0 2000px black",
                    right: 0,
                }}
            />
        </>
    );
};

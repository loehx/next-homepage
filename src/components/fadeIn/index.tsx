import React, { useEffect, useRef, useState } from "react";

export const FadeIn: React.FC<any> = ({
    children,
    appearRatio = 0.0,
    visibleRatio = 0.3,
    className,
    ...props
}) => {
    const element = useRef<HTMLDivElement | null>(null);
    const [opacity, setOpacity] = useState(0);
    const [height, setHeight] = useState(0);

    const onScroll = () => {
        if (!element.current) return;
        const rect = element.current?.getBoundingClientRect();
        const bottom = window.innerHeight - rect.top * (1 + appearRatio);
        const height = window.innerHeight * visibleRatio;
        setHeight(height);
        let opacity = Math.min(bottom / height);
        opacity = Math.max(opacity, 0);
        opacity = Math.min(opacity, 1);
        setOpacity(opacity);
    };

    useEffect(() => {
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => onScroll());

    return (
        <div
            {...props}
            ref={element}
            className={className}
            style={{
                opacity: opacity,
                transform: `translateY(${(1 - opacity) * height * 0.2}px)`,
            }}
        >
            {children}
        </div>
    );
};

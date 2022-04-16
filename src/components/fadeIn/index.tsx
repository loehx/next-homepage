import React, { useEffect, useRef, useState } from "react";

export const FadeIn: React.FC<
    JSX.IntrinsicAttributes & { className?: string }
> = ({ children, className, ...props }) => {
    const element = useRef<HTMLDivElement | null>(null);
    const [opacity, setOpacity] = useState(0);
    const [height, setHeight] = useState(0);

    const onScroll = () => {
        if (!element.current) return;
        let { top, height } = element.current?.getBoundingClientRect();
        const bottom = window.innerHeight - top;
        height = Math.min(window.innerHeight / 2, height);
        setHeight(height);
        let opacity = Math.min(bottom / height);
        opacity = Math.max(opacity, 0);
        opacity = Math.min(opacity, 1);
        setOpacity(opacity);
    };

    useEffect(() => {
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

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

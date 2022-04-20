import React, { useEffect, useRef, useState } from "react";

export interface ParallaxCallbackProps {
    screenHeight: number;
    top: number;
    bottom: number;
    center: number;
    visibility: number;
    isVisible: boolean;
}

export interface CustomParallaxProps {
    styleGetter?: (props: ParallaxCallbackProps) => React.CSSProperties;
    onUpdate?: (props: ParallaxCallbackProps) => void;
}

export const CustomParallax: React.FC<CustomParallaxProps & any> = ({
    children,
    styleGetter,
    onUpdate,
    ...props
}) => {
    const element = useRef<HTMLDivElement | null>(null);
    const [style, setStyle] = useState<React.CSSProperties>();

    const onScroll = () => {
        if (!element.current) return;
        const rect = element.current?.getBoundingClientRect();
        const top = Math.round(rect.top);
        const screenHeight = window.innerHeight;
        const bottom = Math.round(
            window.innerHeight - (rect.top + rect.height),
        );
        const center = Math.round(bottom - rect.height / 2);
        const isVisible = bottom > 0 && top > 0;
        const relativeTop = top / screenHeight;
        const relativeBottom = bottom / screenHeight;
        const visibility = Math.max(
            1 +
                (relativeTop < 0 ? relativeTop : 0) +
                (relativeBottom < 0 ? relativeBottom : 0),
            0,
        );
        const parameter = {
            screenHeight,
            isVisible,
            visibility,
            top,
            bottom,
            center,
        };

        if (onUpdate) onUpdate(parameter);
        if (styleGetter) setStyle(styleGetter(parameter));
    };

    useEffect(() => {
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div ref={element} {...props}>
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { style }),
            )}
        </div>
    );
};

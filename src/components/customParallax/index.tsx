import React, { useEffect, useRef, useState } from "react";

interface CustomParallaxProps {
    styleGetter: (props: {
        screenHeight: number;
        top: number;
        bottom: number;
        center: number;
        visibility: number;
        isVisible: boolean;
    }) => React.CSSProperties;
}

export const CustomParallax: React.FC<CustomParallaxProps & any> = ({
    children,
    styleGetter,
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
        const style = styleGetter({
            screenHeight,
            isVisible,
            visibility,
            top,
            bottom,
            center,
        });
        if (style) {
            setStyle(style);
        }
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

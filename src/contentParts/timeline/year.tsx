import cx from "classnames";
import {
    CustomParallax,
    ParallaxCallbackProps,
} from "@components/customParallax";
import { useState } from "react";

interface YearProps {
    year: number;
    total: number;
    index: number;
    offsetPixel: number;
}

export const Year: React.FC<YearProps> = (props) => {
    const { year, total, index, offsetPixel } = props;
    const top = Math.round((index / total) * 100);
    const [opacity, setOpacity] = useState(0);

    const onScrollUpdate = (props: ParallaxCallbackProps) => {
        const relTop = props.top / props.screenHeight - 0.25;
        const opacity = Math.sin(relTop * 2 * Math.PI);
        setOpacity(opacity);
    };

    return (
        <CustomParallax
            className="hidden md:block cursor-default absolute left-1/2 -translate-x-1/2 w-[80vw] text-xs"
            style={{ top: `calc(${top}% + ${offsetPixel}px)`, opacity: opacity * 0.4, zIndex: 150 }}
            onUpdate={onScrollUpdate}
        >
            <div
                className="w-full border-t-[0.5px] border-grey-400 p-2"
            >
                {year}
            </div>
        </CustomParallax>
    );
};

import { useMemo } from "react";

type UseParallaxOptions = {
    parallax: number;
    scrollY: number;
};

export const useParallax = ({ parallax, scrollY }: UseParallaxOptions) => {
    const transform = useMemo(() => {
        const offset = (1 - parallax) * scrollY;
        return `translateY(${offset}px)`;
    }, [parallax, scrollY]);

    return transform;
};

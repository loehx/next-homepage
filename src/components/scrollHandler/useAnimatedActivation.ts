import { useScroll } from "./index";
import { Phase } from "./useActivation";

export type UseAnimatedActivationOnElementOptions = {
    elementRef: React.RefObject<HTMLElement>;
    className: string;
    enter: number;
    exit?: number;
};

export function useAnimatedActivationOnElement(
    options: UseAnimatedActivationOnElementOptions,
): void {
    const { elementRef, className, enter, exit = Infinity } = options;

    useScroll((scrollData) => {
        if (!elementRef.current) return;
        const { progress } = scrollData;
        const isActive = progress >= enter && progress < exit;
        elementRef.current.classList.toggle(className, isActive);
    });
}

export const useAnimatedActivationOnElementShorthand = (
    elementRef: React.RefObject<HTMLElement>,
    className: string,
    enter: number,
    exit: number,
): void => {
    return useAnimatedActivationOnElement({
        elementRef,
        className,
        enter,
        exit,
    });
};

import { useScroll } from "./index";

export type UseActivationOnElementOptions = {
    elementRef: React.RefObject<HTMLElement>;
    className: string;
    enter: number;
    exit?: number;
};

export function useActivationOnElement(
    options: UseActivationOnElementOptions,
): void {
    const { elementRef, className, enter, exit = Infinity } = options;

    useScroll((scrollData) => {
        if (!elementRef.current) return;
        const { progress } = scrollData;
        const isActive = progress >= enter && progress < exit;
        elementRef.current.classList.toggle(className, isActive);
    });
}

export const useActivationOnElementShorthand = (
    elementRef: React.RefObject<HTMLElement>,
    className: string,
    enter: number,
    exit: number,
): void => {
    return useActivationOnElement({
        elementRef,
        className,
        enter,
        exit,
    });
};

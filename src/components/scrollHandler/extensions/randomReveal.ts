import { MutableRefObject, RefObject, useEffect, useRef } from "react";
import { Phase } from "../useActivation";

type RandomRevealOptions = {
    randomOrder?: boolean;
};

/**
 * Composable hook that provides random character reveal animation for scroll-activated elements.
 * At progress 0, text shows random A-Z characters. At progress 1, shows original text.
 *
 * @param options - Configuration options
 * @param options.randomOrder - If true, reveals characters randomly. If false, reveals left-to-right
 * @returns A function that accepts an elementRef and returns an object with a `changed` callback
 */
export const useRandomReveal = (
    options: RandomRevealOptions = {},
): ((elementRef: RefObject<HTMLElement>) => {
    changed: (activation: number, oldActivation: number, phase: Phase) => void;
}) => {
    const target = useRef<HTMLElement | null>(null);
    const originalText = useRef<string>("");
    const revealOrder = useRef<number[]>([]);

    return (
        elementRef: RefObject<HTMLElement>,
    ): {
        changed: (
            activation: number,
            oldActivation: number,
            phase: Phase,
        ) => void;
    } => {
        useEffect(
            () =>
                setupRandomRevealElement(
                    elementRef,
                    target,
                    originalText,
                    revealOrder,
                    options,
                ),
            [elementRef],
        );

        return {
            changed: createRandomRevealCallback(
                target,
                originalText,
                revealOrder,
                options,
            ),
        };
    };
};

/**
 * Sets up the random reveal element by storing original text and generating reveal order.
 */
function setupRandomRevealElement(
    elementRef: RefObject<HTMLElement>,
    target: MutableRefObject<HTMLElement | null>,
    originalText: MutableRefObject<string>,
    revealOrder: MutableRefObject<number[]>,
    options: RandomRevealOptions,
): void {
    let element = elementRef.current;
    if (element === null) return;

    if (!element.hasAttribute("data-random-reveal")) {
        element = element.querySelector("[data-random-reveal]") || element;
    }

    target.current = element;
    originalText.current = element.textContent || "";

    const length = originalText.current.length;
    revealOrder.current = options.randomOrder
        ? generateRandomOrder(length)
        : Array.from({ length }, (_, i) => i);
}

/**
 * Generates a random order array for character reveal.
 */
function generateRandomOrder(length: number): number[] {
    const order = Array.from({ length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
}

/**
 * Generates a random uppercase letter A-Z.
 */
function getRandomChar(): string {
    return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

/**
 * Creates a callback function that handles random reveal animation based on scroll activation.
 */
function createRandomRevealCallback(
    target: RefObject<HTMLElement | null>,
    originalText: RefObject<string>,
    revealOrder: RefObject<number[]>,
    options: RandomRevealOptions,
): (activation: number, _: number, phase: Phase) => void {
    return (activation: number, _: number, phase: Phase): void => {
        const element = target.current;
        if (!element) return;

        const text = originalText.current;
        if (!text) return;
        const length = text.length;

        if (activation === 0) {
            if (element.textContent !== "") {
                element.textContent = "";
            }
            return;
        }

        const revealCount = Math.floor(activation * length);

        const order = revealOrder.current;
        if (!order) return;
        const revealedIndices = new Set(order.slice(0, revealCount));

        let newContent = "";
        for (let i = 0; i < length; i++) {
            if (revealedIndices.has(i)) {
                newContent += text[i];
            } else {
                newContent += text[i] === " " ? " " : getRandomChar();
            }
        }

        if (element.textContent !== newContent) {
            element.textContent = newContent;
        }
    };
}

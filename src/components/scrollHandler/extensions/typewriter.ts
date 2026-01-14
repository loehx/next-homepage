import { MutableRefObject, RefObject, useEffect, useRef } from "react";
import { Phase } from "../useActivation";
import styles from "./typewriter.module.css";

/**
 * Composable hook that provides typewriter animation functionality for scroll-activated elements.
 * Returns a function that sets up the typewriter effect on a given element reference.
 *
 * @returns A function that accepts an elementRef and returns an object with a `changed` callback
 *          for handling scroll activation changes.
 */
export const useTypewriter = (): ((elementRef: RefObject<HTMLElement>) => {
    changed: (activation: number, oldActivation: number, phase: Phase) => void;
}) => {
    const target = useRef<HTMLElement | null>(null);

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
            () => setupTypewriterElement(elementRef, target),
            [elementRef],
        );

        return {
            changed: createTypewriterCallback(target),
        };
    };
};

/**
 * Sets up the typewriter element by finding the target element, applying styles, and storing it in the ref.
 * Looks for an element with `data-typewriter` attribute or uses the provided element.
 *
 * @param elementRef - Reference to the container element
 * @param target - Mutable ref to store the target element for typewriter animation
 */
function setupTypewriterElement(
    elementRef: RefObject<HTMLElement>,
    target: MutableRefObject<HTMLElement | null>,
): void {
    let element = elementRef.current;
    if (element === null) return;

    if (!element.hasAttribute("data-typewriter")) {
        element = element.querySelector("[data-typewriter]") || element;
    }

    element.style.setProperty("--color", getComputedStyle(element).color);
    element.classList.add(styles.typewriter);
    target.current = element;
}

/**
 * Creates a callback function that handles typewriter animation based on scroll activation.
 * Updates the visible text content progressively during entering/exiting phases and removes
 * the changing class when active.
 *
 * @param target - Reference to the target element for typewriter animation
 * @returns A callback function that handles activation changes
 */
function createTypewriterCallback(
    target: RefObject<HTMLElement | null>,
): (activation: number, _: number, phase: Phase) => void {
    return (activation: number, _: number, phase: Phase): void => {
        const element = target.current;
        if (!element) return;
        const innerContents = element.textContent || "";

        switch (phase) {
            case Phase.Entering:
            case Phase.Exiting: {
                element.classList.add(styles.changing);
                let newContent = innerContents.slice(
                    0,
                    Math.floor(activation * innerContents.length),
                );
                if (
                    newContent.length &&
                    newContent.length < innerContents.length - 1
                ) {
                    newContent += "_";
                }
                if (newContent !== element.getAttribute("data-content")) {
                    element.setAttribute("data-content", newContent);
                }
                break;
            }
            case Phase.Active:
                element.classList.remove(styles.changing);
                break;
        }
    };
}

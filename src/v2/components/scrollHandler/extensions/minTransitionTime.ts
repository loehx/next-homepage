import { RefObject, useRef } from "react";
import { Phase } from "../useActivation";

type MinTransitionTimeOptions = {
    durationMs: number;
};

/**
 * Extension that enforces a minimum transition time for activation changes.
 * Ensures smooth animations even when scrolling happens very quickly.
 *
 * @param options - Configuration options
 * @param options.durationMs - Minimum duration in milliseconds for the transition
 * @returns A function that accepts an elementRef and returns an object with a `changed` callback
 */
export const useMinTransitionTime = (
    options: MinTransitionTimeOptions,
): ((elementRef: RefObject<HTMLElement>) => {
    changed: (activation: number, oldActivation: number, phase: Phase) => void;
}) => {
    const startTimeRef = useRef<number | null>(null);
    const lastPhaseRef = useRef<Phase>(Phase.Idle);

    return (
        elementRef: RefObject<HTMLElement>,
    ): {
        changed: (
            activation: number,
            oldActivation: number,
            phase: Phase,
        ) => void;
    } => {
        return {
            changed: (
                activation: number,
                oldActivation: number,
                phase: Phase,
            ): void => {
                if (phase !== lastPhaseRef.current) {
                    startTimeRef.current = Date.now();
                    lastPhaseRef.current = phase;
                }

                if (startTimeRef.current !== null && phase !== Phase.Idle) {
                    const elapsed = Date.now() - startTimeRef.current;
                    const maxProgress = Math.min(
                        1,
                        elapsed / options.durationMs,
                    );
                    activation = Math.min(activation, maxProgress);
                }

                if (elementRef.current) {
                    elementRef.current.style.setProperty(
                        "--limited-progress",
                        activation.toString(),
                    );
                }
            },
        };
    };
};

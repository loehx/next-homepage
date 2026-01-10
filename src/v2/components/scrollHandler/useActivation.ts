import { useState } from "react";
import { useScroll } from "./index";

export enum Phase {
    Unknown = -1,
    Idle = 0,
    Entering = 1,
    Active = 2,
    Exiting = 3,
}

export type UseActivationOptions = {
    enter: number;
    exit?: number;
    transition: number;
    transitionOut?: number;
    changed?: (activation: number, oldActivation: number, phase: Phase) => void;
};

/**
 * Hook to get the activation of the scroll.
 * The activation is a number between 0 and 1.
 * The activation is 0 when the scroll is before the enter point.
 * The activation is 1 when the scroll is after the exit point.
 *
 * @param options - The options for the activation.
 * @param options.enter - The enter point of the activation.
 * @param options.exit - The exit point of the activation.
 * @param options.transition - The transition of the activation.
 * @returns
 */
export const useActivation = (options: UseActivationOptions): number => {
    const [activation, setActivation] = useState(0);
    const [phase, setPhase] = useState<Phase>(Phase.Idle);

    const exit = options.exit ?? Infinity;

    if (options.enter > exit) {
        throw new Error("Enter point must be before exit point");
    }

    const transitionOut = Math.min(
        options.transitionOut || options.transition,
        Math.max(0, exit - options.enter - options.transition),
    );

    useScroll((scrollData) => {
        const { progress: scrollProgress } = scrollData;
        const enterFully = options.enter + options.transition;
        const startExit = exit - transitionOut;

        let currentActivation = scrollProgress;
        if (scrollProgress > options.enter && scrollProgress < exit) {
            if (currentActivation < enterFully) {
                setPhase(Phase.Entering);
                currentActivation =
                    (currentActivation - options.enter) / options.transition;
            } else if (currentActivation > startExit) {
                setPhase(Phase.Exiting);
                currentActivation =
                    1 - (currentActivation - startExit) / transitionOut;
            } else {
                setPhase(Phase.Active);
                currentActivation = 1;
            }
        } else {
            setPhase(Phase.Idle);
            currentActivation = 0;
        }

        currentActivation = Math.round(currentActivation * 1000) / 1000;

        if (currentActivation !== activation) {
            if (options.changed) {
                options.changed(currentActivation, activation, phase);
            }
            setActivation(currentActivation);
        }
    });

    return activation;
};

type ActivationExtension = (elementRef: React.RefObject<HTMLElement>) => {
    changed: (activation: number, oldActivation: number, phase: Phase) => void;
};

/**
 * Hook to get the activation of the scroll on an element.
 * @param options - The options for the activation.
 * @param options.elementRef - The reference to the element.
 * @param options.includePhase - Whether to include the phase in the activation.
 */
export function useActivationOnElement(
    options: UseActivationOptions & {
        elementRef: React.RefObject<HTMLElement>;
        extensions?: ActivationExtension[];
        includePhase?: boolean;
    },
): void {
    const { elementRef, changed, ...rest } = options;
    const [currentPhase, setCurrentPhase] = useState<Phase>(Phase.Unknown);
    const extensions = options.extensions?.map((extension) =>
        extension(elementRef),
    );

    useActivation({
        ...rest,
        changed: (activation, oldActivation, phase) => {
            if (!elementRef.current) return;
            const element = elementRef.current;
            const style = element.style;
            style.setProperty("--progress", activation.toString());

            if (options.includePhase && phase !== currentPhase) {
                style.setProperty("--idle", phase === Phase.Idle ? "1" : "0");
                style.setProperty(
                    "--enter",
                    phase === Phase.Entering ? "1" : "0",
                );
                style.setProperty(
                    "--active",
                    phase === Phase.Active ? "1" : "0",
                );
                style.setProperty(
                    "--exit",
                    phase === Phase.Exiting ? "1" : "0",
                );
                setCurrentPhase(phase);
            }

            if (changed) changed(activation, oldActivation, phase);
            extensions?.forEach((extension) =>
                extension.changed(activation, oldActivation, phase),
            );
        },
    });
}

export const useActivationOnElementShorthand = (
    elementRef: React.RefObject<HTMLElement>,
    enter: number,
    enterPhase: number,
    activePhase: number,
    exitPhase: number,
    includePhase?: boolean,
    changed?: (activation: number, oldActivation: number, phase: Phase) => void,
): void => {
    return useActivationOnElement({
        elementRef,
        enter: enter,
        exit: enter + enterPhase + activePhase + exitPhase,
        transition: enterPhase,
        transitionOut: exitPhase,
        includePhase,
        changed,
    });
};

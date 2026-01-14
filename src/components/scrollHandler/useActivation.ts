import { useState, useRef, useEffect } from "react";
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
    syncScroll?: boolean;
    fps?: number;
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
    const animationRef = useRef<{
        startTime: number;
        startActivation: number;
        targetActivation: number;
        duration: number;
    } | null>(null);
    const frameRef = useRef<number>();

    const exit = options.exit ?? Infinity;
    const syncScroll = options.syncScroll ?? true;
    const fps = options.fps ?? 60;

    if (options.enter > exit) {
        throw new Error("Enter point must be before exit point");
    }

    const transitionOut = Math.min(
        options.transitionOut || options.transition,
        Math.max(0, exit - options.enter - options.transition),
    );

    useEffect(() => {
        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, []);

    const updateActivation = (newActivation: number, newPhase: Phase) => {
        const rounded = Math.round(newActivation * 1000) / 1000;
        if (rounded !== activation) {
            if (options.changed) {
                options.changed(rounded, activation, newPhase);
            }
            setActivation(rounded);
        }
        if (newPhase !== phase) {
            setPhase(newPhase);
        }
    };

    const startAnimation = (
        target: number,
        duration: number,
        newPhase: Phase,
    ) => {
        animationRef.current = {
            startTime: Date.now(),
            startActivation: activation,
            targetActivation: target,
            duration,
        };

        const frameInterval = 1000 / fps;
        let lastUpdate = Date.now();

        const animate = () => {
            const now = Date.now();
            if (now - lastUpdate < frameInterval) {
                frameRef.current = requestAnimationFrame(animate);
                return;
            }
            lastUpdate = now;

            if (!animationRef.current) return;

            const elapsed = now - animationRef.current.startTime;
            const progress = Math.min(
                elapsed / animationRef.current.duration,
                1,
            );
            const current =
                animationRef.current.startActivation +
                (animationRef.current.targetActivation -
                    animationRef.current.startActivation) *
                    progress;

            updateActivation(current, newPhase);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                animationRef.current = null;
            }
        };

        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }
        frameRef.current = requestAnimationFrame(animate);
    };

    useScroll((scrollData) => {
        const { progress: scrollProgress } = scrollData;

        if (syncScroll) {
            // Original scroll-based behavior
            const enterFully = options.enter + options.transition;
            const startExit = exit - transitionOut;

            let currentActivation = scrollProgress;
            let currentPhase = Phase.Idle;

            if (scrollProgress > options.enter && scrollProgress < exit) {
                if (currentActivation < enterFully) {
                    currentPhase = Phase.Entering;
                    currentActivation =
                        (currentActivation - options.enter) /
                        options.transition;
                } else if (currentActivation > startExit) {
                    currentPhase = Phase.Exiting;
                    currentActivation =
                        1 - (currentActivation - startExit) / transitionOut;
                } else {
                    currentPhase = Phase.Active;
                    currentActivation = 1;
                }
            } else {
                currentPhase = Phase.Idle;
                currentActivation = 0;
            }

            updateActivation(currentActivation, currentPhase);
        } else {
            // Time-based animation mode
            if (scrollProgress >= options.enter && scrollProgress < exit) {
                if (phase === Phase.Idle || phase === Phase.Unknown) {
                    // Just entered, start entering animation
                    startAnimation(1, options.transition, Phase.Entering);
                } else if (
                    scrollProgress >= exit - transitionOut &&
                    phase !== Phase.Exiting
                ) {
                    // Start exit animation
                    startAnimation(
                        0,
                        options.transitionOut || options.transition,
                        Phase.Exiting,
                    );
                }
            } else if (scrollProgress < options.enter) {
                // Before enter point
                if (phase !== Phase.Idle) {
                    animationRef.current = null;
                    if (frameRef.current) {
                        cancelAnimationFrame(frameRef.current);
                    }
                    updateActivation(0, Phase.Idle);
                }
            }
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
 * @param options.activeClass - The class to add when the activation is active.
 * @param options.enterClass - The class to add when the activation is entering.
 */
export function useActivationOnElement(
    options: UseActivationOptions & {
        elementRef: React.RefObject<HTMLElement>;
        extensions?: ActivationExtension[];
        activeClass?: string;
        enterClass?: string;
        includePhase?: boolean;
    },
): void {
    const { elementRef, changed, includePhase = false, ...rest } = options;
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

            if (phase !== currentPhase) {
                if (options.enterClass) {
                    element.classList.toggle(
                        options.enterClass,
                        phase === Phase.Entering,
                    );
                }
                if (options.activeClass) {
                    element.classList.toggle(
                        options.activeClass,
                        phase === Phase.Active,
                    );
                }

                if (includePhase) {
                    style.setProperty(
                        "--idle",
                        phase === Phase.Idle ? "1" : "0",
                    );
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
    activeClass?: string,
    enterClass?: string,
    includePhase?: boolean,
    changed?: (activation: number, oldActivation: number, phase: Phase) => void,
): void => {
    return useActivationOnElement({
        elementRef,
        enter: enter,
        exit: enter + enterPhase + activePhase + exitPhase,
        transition: enterPhase,
        transitionOut: exitPhase,
        activeClass,
        enterClass,
        includePhase,
        changed,
    });
};

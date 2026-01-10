import { RefObject, useEffect } from "react";
import { Phase } from "../useActivation";
import styles from "./typewriter.module.css";

export const useTypewriter = () => {
    return (
        elementRef: RefObject<HTMLElement>,
    ): {
        changed: (
            activation: number,
            oldActivation: number,
            phase: Phase,
        ) => void;
    } => {
        useEffect(() => {
            const element = elementRef.current;
            if (element === null) return;
            element.style.setProperty(
                "--color",
                getComputedStyle(element).color,
            );
            element.classList.add(styles.typewriter);
        }, [elementRef]);

        return {
            changed: (activation: number, _: number, phase: Phase): void => {
                const element = elementRef.current;
                if (!element) return;
                const innerContents = element.textContent || "";

                switch (phase) {
                    case Phase.Entering:
                    case Phase.Exiting: {
                        element.classList.add(styles.changing);
                        const newContent = innerContents.slice(
                            0,
                            Math.floor(activation * innerContents.length),
                        );
                        if (
                            newContent !== element.getAttribute("data-content")
                        ) {
                            element.setAttribute("data-content", newContent);
                        }
                        break;
                    }
                    case Phase.Active:
                        element.classList.remove(styles.changing);
                        break;
                }
            },
        };
    };
};

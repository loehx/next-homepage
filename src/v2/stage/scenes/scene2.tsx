import React, { useRef } from "react";
import { Logo } from "@components/logo";

import styles from "./scene2.module.css";
import {
    useActivationOnElement,
    useActivationOnElementShorthand,
} from "@v2/components/scrollHandler";
import { useTypewriter } from "@v2/components/scrollHandler/extensions/typewriter";

export const Scene2: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const newParagraph = () => useRef<HTMLParagraphElement>(null);

    useActivationOnElementShorthand(containerRef, 0.3, 0.4, 0.5, 0.3);

    const details = [
        { label: "20000+ hours programming", ref: newParagraph() },
        { label: "16+ years of experience", ref: newParagraph() },
        { label: "20+ projects", ref: newParagraph() },
        { label: "2 teams managed", ref: newParagraph() },
    ];

    details.forEach((detail, index) => {
        useActivationOnElement({
            elementRef: detail.ref,
            enter: 0.6 + index * 0.1,
            transition: 0.3,
            extensions: [useTypewriter()],
        });
    });

    return (
        <div ref={containerRef} className={styles.container}>
            <div>
                <div className={styles.logo}>
                    <Logo aria-label="Logo" />
                </div>

                <h1 ref={titleRef} className={styles.title}>
                    <span className={styles.titleInner}>
                        <span>{"Alexander Löhn"}</span>
                    </span>
                    <hr className={styles.titleSeparator} />
                    <span className={styles.titleSub}>
                        <span>{"Frontend Developer"}</span>
                    </span>
                </h1>
            </div>

            {details.map((detail) => (
                <p ref={detail.ref} className={styles.detail}>
                    {detail.label}
                </p>
            ))}

            <p className={styles.description}>Some text here...</p>
        </div>
    );
};

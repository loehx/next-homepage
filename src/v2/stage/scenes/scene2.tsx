import React, { useRef, useState } from "react";
import { Scene } from "./Scene";

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

    useActivationOnElementShorthand(containerRef, 0.5, 0.2, 0.5, 0.3);
    useActivationOnElementShorthand(titleRef, 0.4, 0.3, 0.3, 0.2);

    const details = [
        { label: "20000+ hours programming", ref: newParagraph() },
        { label: "16+ years of experience", ref: newParagraph() },
        { label: "20+ projects", ref: newParagraph() },
        { label: "2 teams managed", ref: newParagraph() },
    ];

    details.forEach((detail, index) => {
        useActivationOnElement({
            elementRef: detail.ref,
            enter: 0.4 + index * 0.1,
            transition: 0.3,
            extensions: [useTypewriter()],
        });
    });

    return (
        <div
            ref={containerRef}
            className={styles.container}
            style={{
                width: "100%",
                height: "100vh",
                border: `1px solid var(--primary)`,
            }}
        >
            <h1 ref={titleRef} className={styles.title}>
                {"Alexander Löhn"}
            </h1>

            {details.map((detail) => (
                <p ref={detail.ref} className={styles.detail}>
                    {detail.label}
                </p>
            ))}

            <p className={styles.description}>Some text here...</p>
        </div>
    );
};

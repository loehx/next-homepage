import React, { useRef, useState } from "react";
import { DarkWavyBackground } from "@v2/components/wallpaper";
import styles from "./scene2.module.css";
import { useActivationOnElement } from "@v2/components/scrollHandler/useActivation";
import { useAnimatedActivationOnElementShorthand } from "@v2/components/scrollHandler/useAnimatedActivation";
import { useSimpleTypewriter } from "@v2/components/scrollHandler/extensions/simpleTypewriter";
import { useRandomReveal } from "@v2/components/scrollHandler/extensions/randomReveal";
import { useMinTransitionTime } from "@v2/components/scrollHandler/extensions/minTransitionTime";
import { useScroll } from "@v2/components/scrollHandler";

export const Scene2: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showBackground, setShowBackground] = useState(false);

    useScroll((scrollData) => {
        setShowBackground(showBackground || scrollData.progress > 0.5);
    });

    useAnimatedActivationOnElementShorthand(
        containerRef,
        styles.active,
        0.5,
        1.5,
    );

    function newDetail(title: string, label: string) {
        return { title, label, ref: useRef<HTMLParagraphElement>(null) };
    }

    const details = [
        newDetail(
            "👋 Hi, I'm Alex",
            "I'm a frontend developer with focus on vue and react. I have 16+ years of experience in web development. 4 of which as a freelancer. I delivered 18+ website projects for clients all over the world.",
        ),
        newDetail(
            "👨‍💻 Professional",
            "I'm highly efficient and can adapt my speed and quality to match the projects needs.",
        ),
        newDetail(
            "🤸 Agile",
            "I'm highly agile and flexible. I can adapt to new projects and requirements very quickly. In 2019 I did an intensive Agile Coach Training at Judith Andresen.",
        ),
        newDetail(
            "🛍️ E-Commerce(d)",
            "Since I started freelancing in 2022, I've delivered 10+ webshops, all built with the Storefront Boilerplate (by SCAYLE).",
        ),
        newDetail(
            "💻 Techstack",
            "Vue and React are my most beloved frameworks. Contentful my go-to CMS. ... blablalba",
        ),
        newDetail(
            "🤖 Cursor AI",
            "I'm a big fan of Cursor AI and use it quite a lot to generate code. Although I must say that it still sometimes feels like I'm working with a junior developer on cocaine. ",
        ),
    ];

    details.forEach((detail, index) => {
        const reveal = useRandomReveal({ randomOrder: true });
        const minTransition = useMinTransitionTime({ durationMs: 1000 });
        useActivationOnElement({
            elementRef: detail.ref,
            enter: 0.6 + index * 0.1,
            transition: 0.2,
            includePhase: true,
            extensions: [useSimpleTypewriter(), reveal, minTransition],
            changed: (activation, oldActivation, phase) => {
                console.log(activation, phase);
            },
        });
    });

    return (
        <div ref={containerRef} className={styles.container}>
            {/* <DarkWavyBackground parallax={0.4} /> */}

            {details.map((detail, index) => (
                <div key={index} className={styles.detail} ref={detail.ref}>
                    <h3 className={styles.detailTitle}>
                        <span data-random-reveal>{detail.title}</span>
                    </h3>
                    <hr className={styles.separator} />
                    <p className={styles.detailLabel} data-typewriter>
                        {detail.label}
                    </p>
                </div>
            ))}
        </div>
    );
};

import React, { useRef } from "react";
import { Logo } from "@components/logo";

import styles from "./scene2.module.css";
import {
    useActivationOnElement,
    useActivationOnElementShorthand,
} from "@v2/components/scrollHandler";
import { useSimpleTypewriter } from "@v2/components/scrollHandler/extensions/simpleTypewriter";

export const Scene2: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useActivationOnElementShorthand(containerRef, 0.3, 0.4, 0.5, 0.3);

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
        useActivationOnElement({
            elementRef: detail.ref,
            enter: 0.6 + index * 0.1,
            transition: 0.3,
            extensions: [useSimpleTypewriter()],
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
                    <hr className={styles.separator} />
                    <span className={styles.titleSub}>
                        <span>{"Frontend Developer"}</span>
                    </span>
                </h1>
            </div>

            {details.map((detail, index) => (
                <div key={index} className={styles.detail} ref={detail.ref}>
                    <h3 className={styles.detailTitle}>
                        <span>{detail.title}</span>
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

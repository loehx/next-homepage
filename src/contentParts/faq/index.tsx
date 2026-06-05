import React, { useState } from "react";
import styles from "./faq.module.css";
import cx from "classnames";
import { FadeIn } from "@components/fadeIn";
import { Entry } from "data/definitions";

export interface FaqItem {
    question: string;
    answer?: string;
    list?: string[];
}

export interface FaqProps extends Entry {
    id: string;
    type: string;
    name: string;
    title?: string;
    items: FaqItem[];
}

const buildAnswerText = (item: FaqItem): string => {
    const parts: string[] = [];
    if (item.answer) parts.push(item.answer);
    if (item.list && item.list.length > 0) parts.push(item.list.join(". "));
    return parts.join(" ");
};

export const Faq: React.FC<FaqProps> = (props) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const items = props.items || [];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items
            .filter((item) => item.question && buildAnswerText(item))
            .map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: buildAnswerText(item),
                },
            })),
    };

    return (
        <div className={cx(styles.wrapper, "container")}>
            {faqSchema.mainEntity.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(faqSchema).replace(
                            /</g,
                            "\\u003c",
                        ),
                    }}
                />
            )}
            <FadeIn className={styles.inner}>
                {props.title && <h2 className={styles.title}>{props.title}</h2>}
                <ul className={styles.list}>
                    {items.map((item, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <li
                                key={index}
                                className={cx(
                                    styles.item,
                                    isOpen && styles.itemOpen,
                                )}
                            >
                                <button
                                    type="button"
                                    className={styles.question}
                                    aria-expanded={isOpen}
                                    onClick={() =>
                                        setOpenIndex(isOpen ? null : index)
                                    }
                                >
                                    <span className={styles.questionText}>
                                        {item.question}
                                    </span>
                                    <span
                                        className={styles.icon}
                                        aria-hidden="true"
                                    >
                                        {isOpen ? "−" : "+"}
                                    </span>
                                </button>
                                <div
                                    className={styles.answerWrapper}
                                    style={{
                                        gridTemplateRows: isOpen
                                            ? "1fr"
                                            : "0fr",
                                    }}
                                >
                                    <div className={styles.answerInner}>
                                        {item.answer && (
                                            <p className={styles.answer}>
                                                {item.answer}
                                            </p>
                                        )}
                                        {item.list && item.list.length > 0 && (
                                            <ul className={styles.answerList}>
                                                {item.list.map((entry, i) => (
                                                    <li key={i}>{entry}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </FadeIn>
        </div>
    );
};

export default Faq;

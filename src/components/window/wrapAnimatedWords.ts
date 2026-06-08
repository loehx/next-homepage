export const AI_ANSWER_WORDS_PER_SECOND = 100;
export const AI_ANSWER_MS_PER_WORD = 1000 / AI_ANSWER_WORDS_PER_SECOND;

export function wrapAnimatedWordsInHtml(
    html: string,
    wordClassName: string,
): string {
    let wordIndex = 0;

    return html.replace(
        /(<[^>]*>)|([^<]+)/g,
        (_, tag: string, text: string) => {
            if (tag) return tag;
            if (!text) return "";

            return text
                .split(/(\s+)/)
                .map((part) => {
                    if (!part || /^\s+$/.test(part)) return part;

                    const delayMs = wordIndex * AI_ANSWER_MS_PER_WORD;
                    wordIndex += 1;
                    return `<span class="${wordClassName}" style="animation-delay:${delayMs}ms">${part}</span>`;
                })
                .join("");
        },
    );
}

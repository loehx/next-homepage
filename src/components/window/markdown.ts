import { Marked } from "@ts-stack/markdown";

export function parseMarkdownToHtml(text: string): string {
    return Marked.parse(text)
        .replaceAll(/(ul|ol)>\n/g, "$1>")
        .replaceAll(/\n<(li|ul|ol)/g, "<$1")
        .replaceAll(
            /<blockquote>\s*<p>([\s\S]*?)<\/p>\s*<\/blockquote>/g,
            "<blockquote>$1</blockquote>",
        )
        .replaceAll(
            /<a href="([^"]+)">([^<]+)<\/a>/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
        )
        .replace(/\n$/, "");
}

import moment from "moment";
import { Marked } from "@ts-stack/markdown";

export function daysUntil(date: string | Date): number {
    return moment(date).diff(moment(), "day") + 1;
}

export function secondsUntilMidnight(): number {
    const now = moment();
    const midnight = now.clone().add(1, "day").startOf("day");
    return midnight.diff(now, "second") + 1;
}

export function renderMarkdown(md: string): string {
    return Marked.parse(md);
}

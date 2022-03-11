import moment from "moment";

export function daysUntil(date: string | Date): number {
    console.log("AAA", moment(date));
    return moment(date).diff(moment(), "day") + 1;
}

export function secondsUntilMidnight(): number {
    const now = moment();
    const midnight = now.clone().add(1, "day").startOf("day");
    return midnight.diff(now, "second") + 1;
}

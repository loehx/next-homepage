import { CompanyEntry, Entry } from "data/definitions";

export interface TimelineEntry extends Entry {
    title: string;
    description: string;
    from: string;
    to: string;
    mainJob: number;
    company: CompanyEntry;
}

export interface BootstrapedTimelineEntry extends TimelineEntry {
    index: number;
    yearFrom: number;
    yearTo: number;
    yearMin: number;
    yearMax: number;
    years: number;
    yearsTotal: number;
    durationText: string;
}

export interface TimelineProps extends Entry {
    name: string;
    entries: TimelineEntry[];
}

function getDecimalFromMonthAndYear(str: string): number {
    const [monthStr, yearStr] = str.split("/");
    if (!yearStr) return parseInt(monthStr);
    const month = parseInt(monthStr);
    const year = parseInt(yearStr);
    return year + Math.round(((month - 1) / 12) * 100) / 100;
}

export function bootstrapEntries(
    entries: TimelineEntry[],
): BootstrapedTimelineEntry[] {
    const preCalculations = entries.map((entry) => ({
        yearFrom: getDecimalFromMonthAndYear(entry.from),
        yearTo: getDecimalFromMonthAndYear(entry.to),
    }));

    console.log("preCalculations", preCalculations);

    const currentYear = new Date().getFullYear();
    const yearMin = Math.min(...preCalculations.map((e) => e.yearFrom ?? 0));
    const yearMax = Math.max(
        ...preCalculations.map((e) => e.yearTo || currentYear),
    );
    const yearsTotal = yearMax - yearMin;
    const result = entries.map(
        (entry, index) =>
            ({
                index,
                ...entry,
                ...preCalculations[index],
                years:
                    preCalculations[index].yearTo -
                    preCalculations[index].yearFrom,
                yearMin,
                yearMax,
                yearsTotal,
                durationText: `${entry.from} - ${entry.to || "today"}`,
            } as BootstrapedTimelineEntry),
    );
    result.sort((a, b) => a.yearFrom - b.yearFrom);
    let mainJobIndex = 0;
    result.forEach((entry, index) => {
        entry.index = index;
        entry.mainJobIndex = entry.mainJob ? ++mainJobIndex : mainJobIndex;
    });
    return result;
}

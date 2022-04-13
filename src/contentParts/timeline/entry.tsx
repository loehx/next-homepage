import { useState } from "react";
import { BootstrapedTimelineEntry } from "./core";
import cx from "classnames";
import { Window } from "@components/window";

export const TimelineEntry: React.FC<BootstrapedTimelineEntry> = (props) => {
    const {
        index,
        title,
        description,
        yearFrom,
        yearMin,
        yearTo,
        yearMax,
        years,
        yearsTotal,
        from,
        mainJob,
        company,
        durationText,
    } = props;
    console.log(yearFrom, "-", yearMin);
    const [open, setOpen] = useState(false);
    const top = `${Math.round(((yearFrom - yearMin) / yearsTotal) * 100)}%`;
    const bottom = `${
        Math.round((((yearTo - yearMax) * -1) / yearsTotal) * 10000) / 100
    }%`;
    const odd = index % 2 === 1;
    const level = mainJob ? 0 : 1;
    const left = `calc(50% ${odd ? "+" : "-"} ${level}rem)`;
    const opacity = `${((yearTo - yearFrom) / yearsTotal) * 2}`;

    return (
        <div>
            <div
                className={`w-4 absolute top-0 bottom-0 bg-gradient-to-b ${
                    open
                        ? "from-primary to-secondary"
                        : "from-blue-400 to-secondary"
                } rounded border border-gray-300 cursor-pointer translate-x-[-50%]`}
                style={{ left, top, bottom }}
                onClick={() => setOpen(!open)}
            ></div>

            <div
                style={{
                    top,
                    [odd ? "left" : "right"]: `calc(50% + ${level}rem)`,
                }}
                className={`absolute px-6 w-auto ${!odd ? "text-right" : ""} ${
                    odd ? "right-0" : "left-0"
                }`}
            >
                <div className={`mx-${level}`}>
                    <div
                        className="cursor-pointer text-sm"
                        onClick={() => setOpen(!open)}
                    >
                        <div>
                            ({index}) {title}
                        </div>
                        <div className="opacity-50 text-xs">
                            {durationText} {company && "at"} {company?.fullName}
                        </div>
                    </div>
                    {open && getDescription(props, () => setOpen(false))}
                </div>
            </div>
        </div>
    );
};

function getDescription(
    { title, description, company, durationText }: BootstrapedTimelineEntry,
    onClose,
) {
    const text = [title, company?.fullName, durationText, description]
        .filter(Boolean)
        .join("\n");

    return <div className="">{getDetail("Company", company?.fullName)}</div>;
}

function getDetail(name: string, value: any) {
    if (!value)
        return (
            <div className="flex">
                <div className="">{name}</div>
                <div className="flex-1">{value}</div>
            </div>
        );
}

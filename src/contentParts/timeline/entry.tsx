import { useState } from "react";
import { BootstrapedTimelineEntry } from "./core";
import cx from "classnames";
import { Window } from "@components/window";
import { FadeIn } from "@components/fadeIn";

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
        mainJobIndex,
    } = props;
    console.log(yearFrom, "-", yearMin);
    const [open, setOpen] = useState(false);
    const top = `${Math.round(((yearFrom - yearMin) / yearsTotal) * 100)}%`;
    const bottom = `${
        Math.round((((yearTo - yearMax) * -1) / yearsTotal) * 10000) / 100
    }%`;
    const odd = index % 2 === 1;
    const oddMainJob = mainJobIndex % 2 === 1;
    const level = mainJob ? 0 : 1;
    const left = `calc(50% ${odd ? "+" : "-"} ${level}rem)`;

    return (
        <div
            className="cursor-default"
            onClick={() => setOpen(true)}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <div
                className={`w-4 absolute top-0 bottom-0 transition-all ${
                    open && "!bg-primary-500"
                } ${
                    oddMainJob ? "bg-secondary-200" : "bg-secondary-300"
                } translate-x-[-50%]`}
                style={{ left, top, bottom }}
                onClick={() => setOpen(!open)}
            >
                <div
                    className={`absolute w-[50%] top-0 border-t-2 border-secondary ${
                        odd ? "left-full" : "right-full"
                    } ${open && "!border-primary-500"}`}
                ></div>
            </div>

            <div
                style={{
                    top,
                    [odd ? "left" : "right"]: `calc(50% + ${level}rem)`,
                }}
                className={`absolute px-6 w-auto -mt-2 ${
                    !odd ? "text-right" : ""
                } ${odd ? "right-0" : "left-0"}`}
            >
                <FadeIn
                    className={`mx-${level}`}
                    appearRatio={0.1}
                    visibleRatio={0.4}
                >
                    <div
                        className={`text-sm transition-all ${
                            open && (odd ? "pl-4" : "pr-4")
                        }`}
                    >
                        <div className="font-bold">{Math.floor(yearFrom)}</div>
                        <div className={`font-bold ${mainJob && "text-lg"}`}>
                            {title}
                        </div>
                        <div
                            className={`transition-opacity ${
                                !open ? "opacity-100" : "opacity-100"
                            }`}
                        >
                            {company?.fullName}
                        </div>
                        <div
                            className={`transition-opacity ${
                                open ? "opacity-0" : "opacity-0"
                            }`}
                        >
                            <p>{description}</p>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
};

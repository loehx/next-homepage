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
    const [open, setOpen] = useState(false);
    const top = `${Math.round(((yearFrom - yearMin) / yearsTotal) * 100)}%`;
    const bottom = `${
        mainJob
            ? 0
            : Math.floor((((yearTo - yearMax) * -1) / yearsTotal) * 10000) / 100
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
                    mainJob
                        ? oddMainJob
                            ? "bg-secondary-300"
                            : "bg-secondary-200"
                        : "bg-secondary-100"
                } translate-x-[-50%]`}
                style={{ left, top, bottom }}
                onClick={() => setOpen(!open)}
            >
                <div
                    className={`absolute w-[50%] top-0 border-t-2 border-secondary ${
                        mainJob
                            ? oddMainJob
                                ? "border-secondary-300"
                                : "border-secondary-200"
                            : "border-secondary-100"
                    } ${odd ? "left-full" : "right-full"} ${
                        open && "!border-primary-500"
                    }`}
                ></div>
            </div>

            <div
                style={{
                    top,
                    [odd ? "left" : "right"]: `calc(50% + ${level}rem)`,
                    zIndex: 100 - index,
                }}
                className={`absolute w-auto -mt-2 ${!odd ? "text-right" : ""} ${
                    odd ? "right-0 pl-6" : "left-0 pr-6"
                }`}
            >
                <FadeIn
                    className={`mx-${level}`}
                    appearRatio={0.1}
                    visibleRatio={0.4}
                >
                    <div
                        className={`text-xs md:text-sm transition-all relative bg-white py-2 -my-2`}
                    >
                        {open ? (
                            <div className="">{durationText}</div>
                        ) : (
                            <div className="font-bold">
                                {Math.floor(yearFrom)}
                            </div>
                        )}
                        <div
                            className={`md:font-bold text-sm md:text-base mt-1 ${
                                mainJob && "text-base md:text-lg"
                            } ${open && "font-bold"}`}
                        >
                            {title}
                        </div>
                        <div className={`hidden md:block`}>
                            {open ? (
                                <div>{description}</div>
                            ) : (
                                <div>
                                    {company?.fullName}
                                    <br />
                                    {company?.companyType}
                                </div>
                            )}
                        </div>
                        {open && (
                            <div className={`md:hidden mt-2`}>
                                {company?.fullName}
                                <br />
                                {company?.companyType}
                            </div>
                        )}
                    </div>
                </FadeIn>
            </div>
        </div>
    );
};

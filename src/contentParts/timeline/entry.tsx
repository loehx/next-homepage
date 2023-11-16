import { useState } from "react";
import { BootstrapedTimelineEntry } from "./core";
import cx from "classnames";
import { Window } from "@components/window";
import { FadeIn } from "@components/fadeIn";
import styles from "./timeline.module.css";
import {
    CustomParallax,
    ParallaxCallbackProps,
} from "@components/customParallax";

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
    const top = Math.round(((yearFrom - yearMin) / yearsTotal) * 100);
    const bottom =
        Math.floor((((yearTo - yearMax) * -1) / yearsTotal) * 10000) / 100 - 1;
    const zIndex = 100 - Math.round(bottom);
    const odd = index % 2 === 1;
    const oddMainJob = mainJobIndex % 2 === 1;
    const level = mainJob ? 0 : 1;
    const left = `calc(50% ${odd ? "+" : "-"} ${level}rem)`;
    const onScrollUpdate = (props: ParallaxCallbackProps) => {
        const screenCenter = props.screenHeight / 2;
        const bottom = props.screenHeight - props.bottom;
        const isCentered = props.top < screenCenter && bottom > screenCenter;
        setOpen(isCentered);
    };

    return (
        <CustomParallax
            className="cursor-default absolute left-0 right-0"
            onClick={() => setOpen(true)}
            // onMouseEnter={() => setOpen(true)}
            // onMouseLeave={() => setOpen(false)}
            style={{ top: `${top}%`, bottom: `${bottom}%`, zIndex }}
            onUpdate={onScrollUpdate}
            data-company={company?.id}
        >
            <div>
                <div
                    className={`w-4 absolute top-0 bottom-0 transition-all ${
                        open && "!bg-secondary-500"
                    } ${
                        mainJob
                            ? oddMainJob
                                ? "bg-secondary-200"
                                : "bg-secondary-200"
                            : "bg-secondary-100"
                    } left-[50%] translate-x-[-50%]`}
                    style={{ right: 0, left }}
                    onClick={() => setOpen(!open)}
                >
                    <div
                        className={`absolute w-[50%] top-0 border-t-2 border-secondary ${
                            mainJob
                                ? "border-secondary-200"
                                : "border-secondary-100"
                        } ${odd ? "left-full" : "right-full"} ${
                            open && "!border-secondary-500"
                        }`}
                    ></div>
                </div>

                <div
                    style={{
                        [odd ? "left" : "right"]: `calc(50% + ${level}rem)`,
                        zIndex: 100 - index,
                    }}
                    className={`absolute w-auto -mt-2 ${
                        !odd ? "text-right" : ""
                    } ${odd ? "right-0 pl-6" : "left-0 pr-6"}`}
                >
                    <FadeIn
                        className={`mx-${level}`}
                        appearRatio={0.1}
                        visibleRatio={0.4}
                    >
                        <div
                            className={`text-xs md:text-sm transition-all duration-300 relative bg-white py-2 -my-2 ${""}`}
                        >
                            <div className="font-bold">
                                {Math.floor(yearFrom)}
                            </div>

                            <div
                                className={cx(
                                    `md:inline font-bold text-sm md:text-base transition-color mt-1 md:!text-black`,
                                    mainJob && "text-base md:text-lg",
                                    open && styles.titleOpen,
                                )}
                            >
                                {title}
                            </div>
                            <div
                                className={`hidden md:block absolute left-0 right-0 mt-1`}
                            >
                                <div className={`absolute left-0 right-0 `}>
                                    <span className={styles.textSpecial}>
                                        {company?.fullName}
                                    </span>
                                    <br />
                                    {company?.companyType}
                                </div>
                                <div
                                    className={`opacity-0 transition-all duration-500 translate-y-[-20px] bg-white ${
                                        open && "!opacity-100 !translate-y-[0]"
                                    }`}
                                >
                                    {description}
                                    <br />
                                    <span className={styles.textSpecial}>
                                        {company?.fullName}
                                    </span>
                                </div>
                            </div>

                            <div
                                className={`md:hidden mt-1 opacity-0 transition-all duration-300 translate-y-[-20px] ${
                                    open && "!opacity-100 !translate-y-[0]"
                                } text-sm`}
                            >
                                {company?.fullName}
                                <br />
                                {company?.companyType}
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </CustomParallax>
    );
};

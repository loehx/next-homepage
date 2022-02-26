import data from "data";
import { ConfigEntry } from "data/definitions";
import { useEffect, useState } from "react";

export const useInitializeClass = (
    initClass: string,
    baseClass: string,
    delay = 100,
): string => {
    const [initializing, setInitializing] = useState(true);
    const classNames = [baseClass];
    if (initializing) classNames.push(initClass);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setTimeout(() => setInitializing(false), delay);
        }
    }, []);

    return classNames.join(" ");
};

export const useConfig = (): ConfigEntry | undefined => {
    const [config, setConfig] = useState<ConfigEntry>();
    useEffect(() => {
        data.getConfig().then((config) => setConfig(config));
    }, []);

    return config;
};

export interface Dimensions {
    x: number;
    y: number;
}

export const useBrowserDimensions = (
    d: Dimensions = { x: 375, y: 667 }, // iPhone SE
): Dimensions => {
    const [dimensions, setDimensions] = useState<Dimensions>(d);
    useEffect(() => {
        if (typeof window !== "undefined") {
            setDimensions({
                x: window.innerWidth,
                y: window.innerHeight,
            });
        }
    }, []);

    return dimensions;
};

export const useIsMobile = (defaultValue: boolean): boolean => {
    const [isMobile, setIsMobile] = useState(true);
    const dimensions = useBrowserDimensions();
    useEffect(() => {
        setIsMobile(dimensions.x <= 800);
    }, [dimensions]);

    return isMobile;
};

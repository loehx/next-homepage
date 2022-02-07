import data from "data";
import { ConfigEntry } from "data/definitions";
import { useEffect, useState } from "react";

export const useInitializeClass = (
    initClass: string,
    baseClass: string,
): string => {
    const [initializing, setInitializing] = useState(true);
    const classNames = [baseClass];
    if (initializing) classNames.push(initClass);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setTimeout(() => setInitializing(false), 100);
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

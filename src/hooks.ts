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
            setTimeout(() => setInitializing(false));
        }
    }, []);

    return classNames.join(" ");
};

import React, { useEffect } from "react";
import { AppProps } from "next/app";
import { ScrollHandler } from "@v2/components/scrollHandler";
import { LenisScroll } from "@v2/components/lenisScroll";
import "@styles/fonts.css";
import "@styles/global.css";
import "@styles/theme.css";
import "@styles/animations.css";
import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    useEffect(() => {
        document.documentElement.classList.add("loaded");
    }, []);

    return (
        <LenisScroll>
            <ScrollHandler />
            <Component {...pageProps} />
        </LenisScroll>
    );
}

export default MyApp;

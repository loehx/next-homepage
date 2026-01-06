import React from "react";
import { AppProps } from "next/app";
import { ScrollHandler } from "@v2/components/scrollHandler";
import "@styles/fonts.css";
import "@styles/global.css";
import "@styles/theme.css";
import "@styles/animations.css";
import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    return (
        <>
            <ScrollHandler />
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;

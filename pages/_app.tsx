import React, { useEffect } from "react";
import { AppProps } from "next/app";
import "@styles/global.css";
import "@styles/theme.css";
import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    useEffect(() => {
        if (typeof window !== "undefined") {
            loadFonts();
        }
    }, []);

    return <Component {...pageProps} />;
}

function loadFonts() {
    import("webfontloader").then((WebFont) => {
        WebFont.load({
            google: {
                families: [
                    "Nunito:300,400,600,700",
                    "Righteous:400",
                    "JetBrains+Mono:400,800",
                ],
            },
        });
    });
}

export default MyApp;

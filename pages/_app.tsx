import React, { useEffect } from "react";
import { AppProps } from "next/app";
import "@styles/global.css";

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
                families: ["Droid Sans:300,400,700", "Righteous:400"],
            },
        });
    });
}

export default MyApp;

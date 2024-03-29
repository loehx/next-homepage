import React, { useEffect } from "react";
import { AppProps } from "next/app";
import "@styles/fonts.css";
import "@styles/global.css";
import "@styles/theme.css";
import "@styles/animations.css";
import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
    return <Component {...pageProps} />;
}

export default MyApp;

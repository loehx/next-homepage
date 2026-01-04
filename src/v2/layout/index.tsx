import React, { FC, ReactNode } from "react";
import Head from "next/head";

interface V2LayoutProps {
    children: ReactNode;
    title?: string;
}

export const V2Layout: FC<V2LayoutProps> = ({ children, title = "V2 Website" }) => {
    return (
        <>
            <Head>
                <title>{title} | Alexander Löhn</title>
                <meta name="robots" content="noindex, nofollow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <div className="v2-layout">
                {children}
            </div>
        </>
    );
};

export default V2Layout;


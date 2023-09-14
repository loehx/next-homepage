import React, { FC, useEffect } from "react";
import { PageEntry, ConfigEntry } from "data/definitions";
import ContentPart from "../../contentPart";
import { Footer } from "@components/footer";
import { EntryAnimationOne } from "@components/entryAnimationOne";
import Head from "next/head";
import { useInitializeClass, useIsMobile } from "src/hooks";
import dynamic from "next/dynamic";
const CookiePopup = dynamic(() => import("@components/cookiePopup"));
import LazyHydrate from "react-lazy-hydration";

interface Props extends PageEntry {
    config: ConfigEntry;
}

const renderOG = (name: string, value: string) =>
    value && <meta property={name} content={value} />;

const Page: FC<Props> = (props: Props) => {
    const className = useInitializeClass("initialize", "page gap-10 md:gap-24");
    const { config } = props;
    const showCookiePopup = !useIsMobile(false) && config.cookiePopup;

    // const fonts = [
    //     "Nunito:300,400,600,700?display",
    //     "Righteous:400",
    //     "JetBrains+Mono:400,800&display=swap",
    // ].join("|");

    return (
        <>
            <Head>
                <title>{props.title}</title>
                <link rel="shortcut icon" href={config.favicon.url} />
                <meta name="description" content={props.description} />
                <meta name="author" content={config.author} />
                <meta name="theme-color" content="#000000" />
                {renderOG(
                    "og:image",
                    `${props.ogimage?.url}?w=1200&h=630&fit=fill`,
                )}
                {renderOG("og:title", props.ogtitle)}
                {renderOG("og:description", props.ogdescription)}
                {renderOG("og:url", props.ogurl)}
                {renderOG("og:locale", "de_DE")}
                {renderOG("og:site_name", "Alexander Löhn")}
                {renderOG("og:type", "website")}
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link rel="preconnect" href="https://images.ctfassets.net" />
            </Head>
            <div className={className}>
                {props.mainContent.map((cp) => (
                    <ContentPart key={cp.id} {...cp} config={props.config} />
                ))}
                {showCookiePopup && (
                    <CookiePopup {...(config.cookiePopup as any)} />
                )}

                <EntryAnimationOne />

                <LazyHydrate whenVisible>
                    <Footer {...(props.footer || props.config.footer)} />
                </LazyHydrate>
            </div>
        </>
    );
};

export default Page;

import React, { FC, useEffect } from "react";
import { PageEntry, ConfigEntry } from "data/definitions";
import ContentPart from "../../contentPart";
import { Footer } from "@components/footer";
import Head from "next/head";
import { useInitializeClass, useIsMobile } from "src/hooks";
import dynamic from "next/dynamic";
const CookiePopup = dynamic(() => import("@components/cookiePopup"));

interface Props extends PageEntry {
    config: ConfigEntry;
}

const renderOG = (name: string, value: string) =>
    value && <meta property={name} content={value} />;

const Page: FC<Props> = (props: Props) => {
    const className = useInitializeClass(
        "initialize",
        "page space-y-10 md:space-y-24",
    );
    const { config } = props;
    const showCookiePopup = !useIsMobile(false) && config.cookiePopup;
    const fonts = [
        "Nunito:300,400,600,700?display",
        "Righteous:400",
        "JetBrains+Mono:400,800&display=swap",
    ].join("|");

    return (
        <>
            <Head>
                <title>{props.title}</title>
                <link rel="shortcut icon" href={config.favicon.url} />
                <meta name="description" content={props.description} />
                <meta name="author" content="Alexander Löhn" />
                <meta name="theme-color" content="#000000"></meta>
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
                <link
                    href={`https://fonts.googleapis.com/css?family=${fonts}&display=swap`}
                    rel="stylesheet"
                />
            </Head>
            <div className={className}>
                {props.mainContent.map((cp) => (
                    <ContentPart key={cp.id} {...cp} config={props.config} />
                ))}
                {showCookiePopup && (
                    <CookiePopup {...(config.cookiePopup as any)} />
                )}
                <Footer {...(props.footer || props.config.footer)} />
            </div>
        </>
    );
};

export default Page;

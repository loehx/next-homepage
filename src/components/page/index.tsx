import React, { FC, useEffect } from "react";
import { PageEntry, ConfigEntry } from "data/definitions";
import ContentPart from "../../contentPart";
import { Footer, FooterProps } from "@components/footer";
import Head from "next/head";
import { useInitializeClass, useIsMobile } from "src/hooks";
import { CookiePopup, CookiePopupProps } from "@components/cookiePopup";

interface Props extends PageEntry {
    config: ConfigEntry;
}

const renderOG = (name: string, value: string) =>
    value && <meta property={name} content={value} />;

const Page: FC<Props> = (props: Props) => {
    const className = useInitializeClass("initialize", "page");
    const { config } = props;
    const showCookiePopup = !useIsMobile(false) && config.cookiePopup;

    return (
        <>
            <Head>
                <title>{props.title}</title>
                <link rel="shortcut icon" href={config.favicon.url} />
                <meta name="description" content={props.description} />
                <meta name="author" content="Alexander Löhn" />
                <meta name="theme-color" content="#000000"></meta>
                {renderOG("og:image", props.ogimage?.url)}
                {renderOG("og:title", props.ogtitle)}
                {renderOG("og:description", props.ogdescription)}
                {renderOG("og:url", props.ogurl)}
                {renderOG("og:locale", "de_DE")}
                {renderOG("og:site_name", "Alexander Löhn")}
                {renderOG("og:type", "website")}
            </Head>
            <div className={className}>
                {props.mainContent.map((cp) => (
                    <ContentPart key={cp.id} {...cp} />
                ))}
                {showCookiePopup && (
                    <CookiePopup
                        {...(config.cookiePopup as CookiePopupProps)}
                    />
                )}
                <Footer {...(config.footer as FooterProps)} />
            </div>
        </>
    );
};

export default Page;

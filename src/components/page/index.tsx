import React, { FC, useEffect } from "react";
import { PageEntry, ConfigEntry } from "data/definitions";
import ContentPart from "../../contentPart";
import { Footer, FooterProps } from "@components/footer";
import Head from "next/head";
import { useInitializeClass } from "src/hooks";

interface Props extends PageEntry {
    config: ConfigEntry;
}

const Page: FC<Props> = (props: Props) => {
    const className = useInitializeClass("initialize", "page");
    return (
        <>
            <Head>
                <title>{props.title}</title>
                <link rel="shortcut icon" href={props.config.favicon.url} />
                <meta name="description" content={props.description} />
                <meta name="author" content="Alexander Löhn" />
            </Head>
            <div className={className}>
                {props.mainContent.map((cp) => (
                    <ContentPart key={cp.id} {...cp} />
                ))}
                <Footer {...(props.config.footer as FooterProps)} />
            </div>
        </>
    );
};

export default Page;

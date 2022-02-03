import React from "react";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { getEntriesByType, getPageBySlug, getConfig } from "data";
import { ConfigEntry, PageEntry } from "data/definitions";
import Page from "./page";
import { Footer } from "@components/footer";

interface Props {
    page: PageEntry;
    config: ConfigEntry;
}

const DynamicWrapper: NextPage<Props> = (props: Props) => {
    return (
        <>
            <Page {...props.page} />;
            <Footer {...props.config.footer} />;
        </>
    );
};

export const getStaticPaths: GetStaticPaths = async () => {
    const pages = await getEntriesByType("page");
    const paths = pages.map((page) => ({
        params: {
            slug: page.slug.split("/").filter((k: string) => k),
        },
    }));

    return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (context) => {
    const params = (context?.params?.slug as string[]) || [];
    const slug = "/" + params;
    const page = await getPageBySlug(slug);
    const config = await getConfig();

    return {
        props: {
            page,
            config,
        },
    };
};

export default DynamicWrapper;

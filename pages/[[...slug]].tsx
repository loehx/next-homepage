import React from "react";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { getEntriesByType, getPageBySlug, getConfig } from "data";
import { ConfigEntry, PageEntry } from "data/definitions";
import Page from "../src/components/page";

interface Props {
    page: PageEntry;
    config: ConfigEntry;
}

const DynamicWrapper: NextPage<Props> = (props: Props) => {
    return <Page {...props.page} config={props.config} />;
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
    const slug = "/" + params.join("/");
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

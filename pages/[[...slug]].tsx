import React from "react";
import { Flex } from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { getEntriesByType, getPageBySlug } from "data";
import { PageEntry } from "data/definitions";
import Page from "./page";

const DynamicWrapper: NextPage<PageEntry> = (props: PageEntry) => {
    return <Page {...props} />;
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

    return {
        props: {
            ...page,
        },
    };
};

export default DynamicWrapper;

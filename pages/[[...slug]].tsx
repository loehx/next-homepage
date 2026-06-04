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

// Slugs that are served by dedicated static pages in `pages/` (e.g.
// `pages/imprint.tsx`, `pages/datenschutz.tsx`). They must be excluded here so
// the catch-all does not return a conflicting path for them at build time.
const RESERVED_STATIC_SLUGS = new Set(["imprint", "datenschutz"]);

export const getStaticPaths: GetStaticPaths = async () => {
    const pages = await getEntriesByType("page");
    const paths = pages
        .map((page) => page.slug.split("/").filter((k: string) => k))
        .filter((slug: string[]) => !RESERVED_STATIC_SLUGS.has(slug.join("/")))
        .map((slug: string[]) => ({ params: { slug } }));

    return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (context: any) => {
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

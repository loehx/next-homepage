import * as contentful from "./contentful";
import { Entry, PageEntry } from "./definitions";

export async function getEntry<T extends Entry>(id: string): Promise<T> {
    const result = await contentful.getEntry<T>(id);
    return result;
}

export async function getEntriesByType<T extends Entry>(
    typeName: string,
): Promise<T[]> {
    const result = await contentful.getEntries<T>({
        "sys.contentType.sys.id": typeName,
    });
    return result;
}

export async function getPageBySlug(slug: string): Promise<PageEntry> {
    const result = await contentful.getEntries<PageEntry>({
        content_type: "page",
        "fields.slug[in]": `${slug},/${slug}`,
        limit: 1,
    });
    return result[0];
}

export async function getConfig() {
    return await contentful.getConfig();
}

export default {
    getEntry,
    getEntriesByType,
    getPageBySlug,
    getConfig,
};

// export function queryGraphQL(query: string): Promise<unknown> {
//     return fetch(
//         `https://graphql.contentful.com/content/v1/spaces/${config.space}/environments/${config.environment}`,
//         {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Accept: "application/json",
//                 Authorization: "Bearer " + config.accessToken,
//             },
//             body: JSON.stringify({ query }),
//         },
//     ).then((r) => r.json());
// }

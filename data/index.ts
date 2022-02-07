import * as contentful from "./contentful";
import { ConfigEntry, Entry, PageEntry, ProjectEntry } from "./definitions";

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
    if (slug[0] === "/") slug = slug.substring(1);
    const result = await contentful.getEntries<PageEntry>({
        content_type: "page",
        "fields.slug[in]": `${slug},/${slug}`,
        limit: 1,
    });
    return result[0];
}

export async function getConfig(): Promise<ConfigEntry> {
    return await contentful.getConfig();
}

export async function getProjects(): Promise<ProjectEntry[]> {
    const projects = await getEntriesByType<ProjectEntry>("project");

    projects.sort((a, b) => {
        const [monthA, yearA] = a.from.split("/");
        const [monthB, yearB] = b.from.split("/");
        const valA = parseInt(yearA) + parseInt(monthA) / 100;
        const valB = parseInt(yearB) + parseInt(monthB) / 100;
        return valB - valA;
    });

    return projects;
}

export default {
    getEntry,
    getEntriesByType,
    getPageBySlug,
    getConfig,
    getProjects,
};

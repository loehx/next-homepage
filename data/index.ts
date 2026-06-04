import configData from "./content/config.json";
import pagesData from "./content/pages.json";
import projectsData from "./content/projects.json";
import companiesData from "./content/companies.json";
import technologiesData from "./content/technologies.json";
import { ConfigEntry, Entry, PageEntry, ProjectEntry } from "./definitions";

const config = configData as unknown as ConfigEntry;
const pages = pagesData as unknown as PageEntry[];
const projects = projectsData as unknown as ProjectEntry[];
const companies = companiesData as unknown as Entry[];
const technologies = technologiesData as unknown as Entry[];

function allTopLevelEntries(): Entry[] {
    return [config, ...pages, ...projects, ...companies, ...technologies];
}

export async function getEntry<T extends Entry>(id: string): Promise<T> {
    const found = allTopLevelEntries().find((entry) => entry.id === id);
    if (!found) {
        throw new Error(`Entry not found: ${id}`);
    }
    return found as T;
}

export async function getEntriesByType<T extends Entry>(
    typeName: string,
): Promise<T[]> {
    const type = typeName.toLowerCase();
    return allTopLevelEntries().filter((entry) => entry.type === type) as T[];
}

export async function getPageBySlug(slug: string): Promise<PageEntry> {
    if (slug[0] === "/") slug = slug.substring(1);
    return pages.find(
        (page) => page.slug === slug || page.slug === `/${slug}`,
    )!;
}

export async function getConfig(): Promise<ConfigEntry> {
    return config;
}

function sortProjectsByFrom(projectsList: ProjectEntry[]): ProjectEntry[] {
    return [...projectsList].sort((a, b) => {
        const [monthA, yearA] = a.from.split("/");
        const [monthB, yearB] = b.from.split("/");
        const valA = parseInt(yearA) + parseInt(monthA) / 100;
        const valB = parseInt(yearB) + parseInt(monthB) / 100;
        return valB - valA;
    });
}

export async function getProjects(): Promise<ProjectEntry[]> {
    return sortProjectsByFrom(projects);
}

export default {
    getEntry,
    getEntriesByType,
    getPageBySlug,
    getConfig,
    getProjects,
};

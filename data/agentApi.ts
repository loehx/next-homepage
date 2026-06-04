/**
 * Builds the public v1 agent API payload from local JSON content.
 *
 * This is the stable, Contentful-agnostic contract the homepage-agent (and
 * any future consumer) reads. The schema is versioned (`version: 1`) so we
 * can migrate the producer to a different CMS / data source without
 * breaking consumers.
 *
 * Consumed by `data/agentApi.generate.ts` at build time → written to
 * `public/api/v1/projects.json` and served as a flat CDN asset.
 */

import { getEntriesByType, getProjects } from "./index";
import {
    AssetEntry,
    CompanyEntry,
    ProjectEntry,
    TechnologyEntry,
} from "./definitions";

export const AGENT_API_VERSION = 1 as const;

export interface AgentApiV1 {
    version: typeof AGENT_API_VERSION;
    generatedAt: string;
    projects: AgentProject[];
    companies: AgentCompany[];
    technologies: AgentTechnology[];
}

export interface AgentProject {
    id: string;
    name: string;
    /** Markdown. May contain links, lists, emphasis. */
    description: string;
    /** ISO month, e.g. "2024-03". */
    from: string | null;
    /** ISO month or null when ongoing. */
    to: string | null;
    role: string | null;
    sector: string | null;
    url: string | null;
    team: string | null;
    /** Markdown free-text from Contentful, e.g. "also touched X, Y, Z". */
    moreTechnologies: string | null;
    company: AgentCompanyRef | null;
    technologies: AgentTechnologyRef[];
}

export interface AgentCompanyRef {
    id: string;
    name: string;
    fullName: string | null;
    url: string | null;
    logoUrl: string | null;
}

export interface AgentTechnologyRef {
    id: string;
    name: string;
    fullName: string | null;
    url: string | null;
    logoUrl: string | null;
}

export interface AgentCompany extends AgentCompanyRef {
    projectIds: string[];
}

export interface AgentTechnology extends AgentTechnologyRef {
    projectIds: string[];
}

export async function buildAgentApiV1(): Promise<AgentApiV1> {
    const [projects, companies, technologies] = await Promise.all([
        getProjects(),
        getEntriesByType<CompanyEntry>("company"),
        getEntriesByType<TechnologyEntry>("technology"),
    ]);

    const projectsOut: AgentProject[] = projects.map(mapProject);

    const companyProjectIndex = indexProjectsByRefId(
        projects,
        (p) => p.company?.id,
    );
    const techProjectIndex = indexProjectsByRefIds(projects, (p) =>
        (p.technologies || []).map((t) => t.id),
    );

    const companiesOut: AgentCompany[] = companies.filter(Boolean).map((c) => ({
        ...mapCompanyRef(c),
        projectIds: companyProjectIndex.get(c.id) || [],
    }));

    const technologiesOut: AgentTechnology[] = technologies
        .filter(Boolean)
        .map((t) => ({
            ...mapTechnologyRef(t),
            projectIds: techProjectIndex.get(t.id) || [],
        }));

    return {
        version: AGENT_API_VERSION,
        generatedAt: new Date().toISOString(),
        projects: projectsOut,
        companies: companiesOut,
        technologies: technologiesOut,
    };
}

function mapProject(p: ProjectEntry): AgentProject {
    return {
        id: p.id,
        name: p.name,
        description: descriptionToMarkdown(p.description),
        from: toIsoMonth(p.from),
        to: toIsoMonth(p.to),
        role: nullIfBlank(p.role),
        sector: nullIfBlank(p.sector),
        url: nullIfBlank(p.url),
        team: nullIfBlank(p.team),
        moreTechnologies: nullIfBlank(p.moreTechnologies),
        company: p.company ? mapCompanyRef(p.company) : null,
        technologies: (p.technologies || []).map(mapTechnologyRef),
    };
}

function mapCompanyRef(c: CompanyEntry): AgentCompanyRef {
    return {
        id: c.id,
        name: c.name,
        fullName: nullIfBlank(c.fullName),
        url: nullIfBlank(c.url),
        logoUrl: assetUrl(c.logo),
    };
}

function mapTechnologyRef(t: TechnologyEntry): AgentTechnologyRef {
    return {
        id: t.id,
        name: t.name,
        fullName: nullIfBlank(t.fullName),
        url: nullIfBlank(t.url),
        logoUrl: assetUrl(t.logo),
    };
}

function indexProjectsByRefId(
    projects: ProjectEntry[],
    getRefId: (p: ProjectEntry) => string | undefined,
): Map<string, string[]> {
    const index = new Map<string, string[]>();
    for (const p of projects) {
        const refId = getRefId(p);
        if (!refId) continue;
        const list = index.get(refId) ?? [];
        list.push(p.id);
        index.set(refId, list);
    }
    return index;
}

function indexProjectsByRefIds(
    projects: ProjectEntry[],
    getRefIds: (p: ProjectEntry) => string[],
): Map<string, string[]> {
    const index = new Map<string, string[]>();
    for (const p of projects) {
        for (const refId of getRefIds(p)) {
            if (!refId) continue;
            const list = index.get(refId) ?? [];
            list.push(p.id);
            index.set(refId, list);
        }
    }
    return index;
}

/**
 * Contentful "Long text" fields are returned as plain strings (markdown-ish).
 * If a rich-text object ever sneaks through we log a warning and stringify
 * defensively so the build doesn't crash silently.
 */
function descriptionToMarkdown(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object" && (value as any).nodeType) {
        console.warn(
            "[agentApi] description is a rich-text node; add a renderer.",
        );
        return JSON.stringify(value);
    }
    return String(value);
}

/** Contentful date format is "MM/YYYY"; ISO month "YYYY-MM" is friendlier. */
function toIsoMonth(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^(\d{1,2})\/(\d{4})$/);
    if (!match) return trimmed;
    const month = match[1].padStart(2, "0");
    const year = match[2];
    return `${year}-${month}`;
}

function nullIfBlank(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
}

/** Contentful asset URLs are protocol-relative (`//images.ctfassets.net/...`). */
function assetUrl(asset: AssetEntry | null | undefined): string | null {
    if (!asset || !asset.url) return null;
    const url = asset.url;
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return url;
}

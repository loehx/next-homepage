/**
 * One-time Contentful export: flattened JSON + local assets under public/cms/.
 *
 * Run from repo root:
 *   npx ts-node --compiler-options '{"module":"commonjs","target":"es2019"}' scripts/export-contentful.ts
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as contentful from "contentful";
import { mapEntry } from "../data/mapping";
import {
    ConfigEntry,
    Entry,
    PageEntry,
    ProjectEntry,
    CompanyEntry,
    TechnologyEntry,
    SecretLink,
} from "../data/definitions";

const INCLUDE_DEPTH = 10;
const PAGE_SIZE = 100;
const JSON_INDENT = 4;

const REPO_ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(REPO_ROOT, "data", "content");
const PUBLIC_CMS_DIR = path.join(REPO_ROOT, "public", "cms");

const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
const space = process.env.CONTENTFUL_SPACE;
const environment = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
const configIdEnv = process.env.CONTENTFUL_CONFIG_ID;

if (!accessToken || !space || !configIdEnv) {
    console.error(
        "[export] Missing required environment variables. The committed Contentful token was removed; set:\n" +
            "  CONTENTFUL_ACCESS_TOKEN\n" +
            "  CONTENTFUL_SPACE\n" +
            "  CONTENTFUL_CONFIG_ID\n" +
            "Optional: CONTENTFUL_ENVIRONMENT (defaults to master)",
    );
    process.exit(1);
}

const configId: string = configIdEnv;

const client = contentful.createClient({
    space,
    accessToken,
    environment,
    removeUnresolved: true,
});

const DEFAULT_OPTIONS = { include: INCLUDE_DEPTH };

async function getEntry<T extends Entry>(id: string): Promise<T> {
    const res = await client.getEntry(id, { ...DEFAULT_OPTIONS });
    return mapEntry<T>(res);
}

async function getAllEntriesByType<T extends Entry>(
    typeName: string,
): Promise<T[]> {
    const items: T[] = [];
    let skip = 0;
    let total = Infinity;

    while (items.length < total) {
        const res = await client.getEntries({
            ...DEFAULT_OPTIONS,
            "sys.contentType.sys.id": typeName,
            skip,
            limit: PAGE_SIZE,
        });
        total = res.total;
        for (const item of res.items) {
            items.push(mapEntry<T>(item));
        }
        skip += PAGE_SIZE;
    }

    return items;
}

function sortProjects(projects: ProjectEntry[]): void {
    projects.sort((a, b) => {
        const [monthA, yearA] = a.from.split("/");
        const [monthB, yearB] = b.from.split("/");
        const valA = parseInt(yearA, 10) + parseInt(monthA, 10) / 100;
        const valB = parseInt(yearB, 10) + parseInt(monthB, 10) / 100;
        return valB - valA;
    });
}

function normalizeCtfUrl(url: string): string {
    if (url.startsWith("//")) return `https:${url}`;
    return url;
}

function extensionFromUrl(url: string): string {
    try {
        const ext = path.extname(new URL(normalizeCtfUrl(url)).pathname);
        if (ext) return ext;
    } catch {
        /* fall through */
    }
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|#|$)/);
    return match ? `.${match[1]}` : "";
}

function stableFilename(url: string, assetId?: string): string {
    const ext = extensionFromUrl(url);
    const base =
        assetId ??
        crypto
            .createHash("sha256")
            .update(normalizeCtfUrl(url))
            .digest("hex")
            .slice(0, 16);
    return `${base}${ext}`;
}

function collectAssetUrlIds(
    value: unknown,
    urlToAssetId: Map<string, string>,
): void {
    if (value == null) return;
    if (Array.isArray(value)) {
        for (const item of value) collectAssetUrlIds(item, urlToAssetId);
        return;
    }
    if (typeof value !== "object") return;

    const obj = value as Record<string, unknown>;
    if (
        obj.type === "asset" &&
        typeof obj.id === "string" &&
        typeof obj.url === "string" &&
        obj.url.includes("ctfassets.net")
    ) {
        urlToAssetId.set(normalizeCtfUrl(obj.url), obj.id);
    }

    for (const key of Object.keys(obj)) {
        collectAssetUrlIds(obj[key], urlToAssetId);
    }
}

/** Contentful asset URLs embedded in markdown or standalone (protocol-relative). */
const CTF_URL_IN_TEXT_RE =
    /\/\/(?:images|videos|assets)\.ctfassets\.net\/[^\s)\]"'<>]+/g;

const urlToLocalPath = new Map<string, string>();
let downloadedCount = 0;
let skippedCount = 0;
let failedCount = 0;
const failedUrls: string[] = [];

async function localPathForCtfUrl(
    rawUrl: string,
    urlToAssetId: Map<string, string>,
    parentAssetId?: string,
): Promise<string> {
    const normalized = normalizeCtfUrl(rawUrl);
    const cached = urlToLocalPath.get(normalized);
    if (cached) return cached;

    const assetId = parentAssetId ?? urlToAssetId.get(normalized);
    const filename = stableFilename(rawUrl, assetId);
    const localPath = `/cms/${filename}`;
    const destPath = path.join(PUBLIC_CMS_DIR, filename);

    if (!fs.existsSync(destPath)) {
        try {
            const res = await fetch(normalized);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const buf = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(destPath, buf);
            downloadedCount++;
        } catch (err) {
            failedCount++;
            failedUrls.push(normalized);
            console.warn(
                `[export] failed to download ${normalized}: ${
                    err instanceof Error ? err.message : err
                }`,
            );
            return rawUrl;
        }
    } else {
        skippedCount++;
    }

    urlToLocalPath.set(normalized, localPath);
    return localPath;
}

async function rewriteCtfString(
    raw: string,
    urlToAssetId: Map<string, string>,
    parentAssetId?: string,
): Promise<string> {
    if (!raw.includes("ctfassets.net")) return raw;

    const embedded = Array.from(new Set(raw.match(CTF_URL_IN_TEXT_RE) ?? []));
    if (embedded.length > 0) {
        let result = raw;
        for (const match of embedded) {
            const local = await localPathForCtfUrl(
                match,
                urlToAssetId,
                parentAssetId,
            );
            result = result.split(match).join(local);
        }
        return result;
    }

    const trimmed = raw.trim();
    if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://")
    ) {
        return localPathForCtfUrl(trimmed, urlToAssetId, parentAssetId);
    }

    return raw;
}

async function rewriteCtfUrlsInPlace(
    value: unknown,
    urlToAssetId: Map<string, string>,
): Promise<void> {
    if (value == null) return;

    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (typeof item === "string" && item.includes("ctfassets.net")) {
                value[i] = await rewriteCtfString(item, urlToAssetId);
            } else {
                await rewriteCtfUrlsInPlace(item, urlToAssetId);
            }
        }
        return;
    }

    if (typeof value !== "object") return;

    const obj = value as Record<string, unknown>;
    const parentAssetId =
        obj.type === "asset" && typeof obj.id === "string" ? obj.id : undefined;

    for (const key of Object.keys(obj)) {
        const field = obj[key];
        if (typeof field === "string" && field.includes("ctfassets.net")) {
            obj[key] = await rewriteCtfString(
                field,
                urlToAssetId,
                parentAssetId,
            );
        } else {
            await rewriteCtfUrlsInPlace(field, urlToAssetId);
        }
    }
}

function writeJson(filePath: string, data: unknown): void {
    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, JSON_INDENT) + "\n",
        "utf-8",
    );
}

function countCtfStrings(value: unknown): number {
    if (value == null) return 0;
    if (typeof value === "string") {
        return value.includes("ctfassets.net") ? 1 : 0;
    }
    if (Array.isArray(value)) {
        let n = 0;
        for (const item of value) n += countCtfStrings(item);
        return n;
    }
    if (typeof value === "object") {
        let n = 0;
        for (const item of Object.values(value as Record<string, unknown>)) {
            n += countCtfStrings(item);
        }
        return n;
    }
    return 0;
}

async function main(): Promise<void> {
    const startedAt = Date.now();
    console.log("[export] fetching from Contentful…");

    const config = await getEntry<ConfigEntry>(configId);
    const pages = await getAllEntriesByType<PageEntry>("page");
    const projects = await getAllEntriesByType<ProjectEntry>("project");
    sortProjects(projects);
    const companies = await getAllEntriesByType<CompanyEntry>("company");
    const technologies = await getAllEntriesByType<TechnologyEntry>(
        "technology",
    );
    const secretLinks = await getAllEntriesByType<SecretLink>("secretLink");

    console.log(
        `[export] entries: config=1, pages=${pages.length}, projects=${projects.length}, ` +
            `companies=${companies.length}, technologies=${technologies.length}, ` +
            `secretLinks=${secretLinks.length}`,
    );

    const payloads: unknown[] = [
        config,
        pages,
        projects,
        companies,
        technologies,
        secretLinks,
    ];

    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    fs.mkdirSync(PUBLIC_CMS_DIR, { recursive: true });

    const urlToAssetId = new Map<string, string>();
    for (const payload of payloads) {
        collectAssetUrlIds(payload, urlToAssetId);
    }

    console.log(
        `[export] downloading assets (${urlToAssetId.size} asset URL mappings)…`,
    );

    for (const payload of payloads) {
        await rewriteCtfUrlsInPlace(payload, urlToAssetId);
    }

    writeJson(path.join(CONTENT_DIR, "config.json"), config);
    writeJson(path.join(CONTENT_DIR, "pages.json"), pages);
    writeJson(path.join(CONTENT_DIR, "projects.json"), projects);
    writeJson(path.join(CONTENT_DIR, "companies.json"), companies);
    writeJson(path.join(CONTENT_DIR, "technologies.json"), technologies);
    writeJson(path.join(CONTENT_DIR, "secretLinks.json"), secretLinks);

    let remaining = 0;
    for (const p of payloads) remaining += countCtfStrings(p);

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(2);
    console.log(
        `[export] assets: downloaded=${downloadedCount}, skipped(existing)=${skippedCount}, failed=${failedCount}`,
    );
    if (failedUrls.length > 0) {
        console.log("[export] failed URLs:", failedUrls.join("\n  "));
    }
    console.log(
        `[export] remaining ctfassets.net strings in JSON: ${remaining}`,
    );
    console.log(`[export] done in ${elapsed}s`);
}

main().catch((err) => {
    console.error("[export] fatal:", err);
    process.exit(1);
});

/**
 * Build-time generator: writes the v1 agent API as a static JSON file
 * served by Netlify's CDN.
 *
 * Run via `yarn build:agent-api` (chained from `yarn build`).
 *
 * Output: public/api/v1/projects.json
 * Served at: https://loehx.com/api/v1/projects.json
 */

import * as fs from "fs";
import * as path from "path";
import { buildAgentApiV1 } from "./agentApi";

const OUTPUT_PATH = path.join(
    __dirname,
    "..",
    "public",
    "api",
    "v1",
    "projects.json",
);

async function main(): Promise<void> {
    const startedAt = Date.now();
    console.log("[agentApi] building v1 payload from Contentful…");

    const payload = await buildAgentApiV1();

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2) + "\n", {
        encoding: "utf-8",
    });

    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(2);
    console.log(
        `[agentApi] wrote ${payload.projects.length} projects, ` +
            `${payload.companies.length} companies, ` +
            `${payload.technologies.length} technologies ` +
            `→ ${path.relative(process.cwd(), OUTPUT_PATH)} (${elapsed}s)`,
    );
}

main().catch((err) => {
    console.error("[agentApi] build failed:", err);
    process.exit(1);
});

import { Handler } from "@netlify/functions";
import { maintainPool } from "./_agentPool";
import { pingRedis, isRedisConfigured } from "./_redis";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
};

/**
 * HTTP endpoint to refill the warm-agent pool on demand (page load, etc.).
 * POST /api/ai/pool-kick
 */
export const handler: Handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    if (!isRedisConfigured()) {
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({ ok: false, error: "redis_not_configured" }),
        };
    }

    if (!(await pingRedis())) {
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({ ok: false, error: "redis_unreachable" }),
        };
    }

    if (!process.env.CURSOR_API_KEY) {
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({ ok: false, error: "cursor_not_configured" }),
        };
    }

    try {
        const result = await maintainPool();
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ ok: true, ...result }),
        };
    } catch (error) {
        console.error("Agent pool kick error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                ok: false,
                error: "maintain_failed",
                message: error instanceof Error ? error.message : String(error),
            }),
        };
    }
};

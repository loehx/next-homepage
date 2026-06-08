import { Handler } from "@netlify/functions";
import { pingRedis, isRedisConfigured } from "./_redis";
import { getPoolStats, isPoolEnabled } from "./_agentPool";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
};

/**
 * Lightweight connectivity check for Upstash Redis + pool stats.
 * GET /api/ai/redis-health
 */
export const handler: Handler = async (event) => {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== "GET") {
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
            body: JSON.stringify({
                ok: false,
                error: "not_configured",
                message:
                    "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN missing",
            }),
        };
    }

    const connected = await pingRedis();
    if (!connected) {
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({
                ok: false,
                error: "unreachable",
                message: "Could not reach Upstash Redis",
            }),
        };
    }

    const pool = await getPoolStats();

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            ok: true,
            redis: "connected",
            pool: {
                ...pool,
                active: isPoolEnabled(),
            },
        }),
    };
};

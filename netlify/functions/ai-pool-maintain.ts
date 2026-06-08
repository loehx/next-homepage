import { Handler } from "@netlify/functions";
import { maintainPool } from "./_agentPool";
import { pingRedis, isRedisConfigured } from "./_redis";

const headers = {
    "Content-Type": "application/json",
};

/**
 * Scheduled maintainer for the shared warm-agent pool.
 * Requires UPSTASH_REDIS_* env vars and CURSOR_API_KEY.
 *
 * Netlify cron: every 10 minutes (see netlify.toml).
 */
export const handler: Handler = async () => {
    if (!isRedisConfigured()) {
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({
                ok: false,
                error: "redis_not_configured",
            }),
        };
    }

    if (!(await pingRedis())) {
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({
                ok: false,
                error: "redis_unreachable",
            }),
        };
    }

    if (!process.env.CURSOR_API_KEY) {
        return {
            statusCode: 503,
            headers,
            body: JSON.stringify({
                ok: false,
                error: "cursor_not_configured",
            }),
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
        console.error("Agent pool maintain error:", error);
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

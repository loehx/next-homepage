import { Redis } from "@upstash/redis";

let client: Redis | null = null;

export function isRedisConfigured(): boolean {
    return Boolean(
        process.env.UPSTASH_REDIS_REST_URL &&
            process.env.UPSTASH_REDIS_REST_TOKEN,
    );
}

export function getRedis(): Redis {
    if (!isRedisConfigured()) {
        throw new Error("Upstash Redis is not configured");
    }
    if (!client) {
        client = Redis.fromEnv();
    }
    return client;
}

/** Returns true when Redis responds to PING. */
export async function pingRedis(): Promise<boolean> {
    if (!isRedisConfigured()) {
        return false;
    }
    try {
        const pong = await getRedis().ping();
        return pong === "PONG";
    } catch (error) {
        console.warn("Upstash Redis ping failed:", error);
        return false;
    }
}

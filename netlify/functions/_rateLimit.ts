import type { HandlerEvent } from "@netlify/functions";
import { getRedis, isRedisConfigured } from "./_redis";

export interface RateLimitResult {
    allowed: boolean;
    limit: number;
    remaining: number;
    /** Unix timestamp (ms) when the current window resets. */
    resetAt: number;
}

const WINDOW_SEC = 60;

function parseLimit(envName: string, defaultValue: number): number {
    const raw = process.env[envName];
    if (!raw) {
        return defaultValue;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return defaultValue;
    }
    return parsed;
}

/** Max POSTs to /api/ai/chat per IP per minute (all modes). */
export function getGeneralChatLimit(): number {
    return parseLimit("AI_CHAT_RATE_LIMIT_GENERAL", 40);
}

/** Max "ask" turns per IP per minute (Cursor API cost). */
export function getAskLimit(): number {
    return parseLimit("AI_CHAT_RATE_LIMIT_ASK", 10);
}

function windowKey(prefix: string, identifier: string): string {
    const bucket = Math.floor(Date.now() / 1000 / WINDOW_SEC);
    return `ratelimit:${prefix}:${identifier}:${bucket}`;
}

function windowResetAt(): number {
    const bucket = Math.floor(Date.now() / 1000 / WINDOW_SEC);
    return (bucket + 1) * WINDOW_SEC * 1000;
}

/**
 * Fixed-window counter in Upstash Redis. When Redis is not configured or
 * limit is 0, requests are allowed (same as before rate limiting existed).
 */
export async function checkRateLimit(
    prefix: string,
    identifier: string,
    limit: number,
): Promise<RateLimitResult> {
    const resetAt = windowResetAt();

    if (!isRedisConfigured() || limit <= 0) {
        return { allowed: true, limit, remaining: limit, resetAt };
    }

    const redis = getRedis();
    const key = windowKey(prefix, identifier);
    const count = await redis.incr(key);
    if (count === 1) {
        await redis.expire(key, WINDOW_SEC + 5);
    }

    return {
        allowed: count <= limit,
        limit,
        remaining: Math.max(0, limit - count),
        resetAt,
    };
}

/** Best-effort client IP for Netlify Functions (and local dev). */
export function getClientIp(event: HandlerEvent): string {
    const headers = event.headers ?? {};

    const netlifyIp = headers["x-nf-client-connection-ip"];
    if (netlifyIp) {
        return netlifyIp.trim();
    }

    const forwarded = headers["x-forwarded-for"];
    if (forwarded) {
        const first = forwarded.split(",")[0]?.trim();
        if (first) {
            return first;
        }
    }

    const clientIp = headers["client-ip"];
    if (clientIp) {
        return clientIp.trim();
    }

    return "unknown";
}

export function rateLimitHeaders(
    result: RateLimitResult,
): Record<string, string> {
    const retryAfterSec = Math.max(
        1,
        Math.ceil((result.resetAt - Date.now()) / 1000),
    );
    return {
        "Retry-After": String(retryAfterSec),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    };
}

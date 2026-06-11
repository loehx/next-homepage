import {
    createAgent,
    pollRunUntilComplete,
    TERMINAL_STATUSES,
    WARMUP_PROMPT,
} from "./_cursor";
import { getRedis, isRedisConfigured } from "./_redis";

const POOL_IDLE_KEY = "agent-pool:idle";
const POOL_WARMING_KEY = "agent-pool:warming";
const POOL_USED_KEY = "agent-pool:used";
const POOL_LOCK_KEY = "agent-pool:maintain-lock";

const DEFAULT_TARGET_SIZE = 1;
const MAX_TARGET_SIZE = 5;
const MAINTAIN_LOCK_TTL_SEC = 120;
const WARMING_POLL_BUDGET_MS = 25000;
const WARMING_POLL_INTERVAL_MS = 1500;

export interface WarmingEntry {
    agentId: string;
    runId: string;
    startedAt: number;
}

export interface PoolStats {
    idle: number;
    warming: number;
    target: number;
    enabled: boolean;
}

export function isPoolEnabled(): boolean {
    if (process.env.AGENT_POOL_ENABLED === "false") {
        return false;
    }
    return isRedisConfigured();
}

export function getPoolTargetSize(): number {
    const raw = process.env.AGENT_POOL_TARGET_SIZE;
    if (!raw) {
        return DEFAULT_TARGET_SIZE;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return DEFAULT_TARGET_SIZE;
    }
    return Math.min(parsed, MAX_TARGET_SIZE);
}

export async function getPoolStats(): Promise<PoolStats> {
    const target = getPoolTargetSize();
    if (!isPoolEnabled()) {
        return { idle: 0, warming: 0, target, enabled: false };
    }

    const redis = getRedis();
    const [idle, warming] = await Promise.all([
        redis.llen(POOL_IDLE_KEY),
        redis.llen(POOL_WARMING_KEY),
    ]);

    return { idle, warming, target, enabled: true };
}

/**
 * Permanently marks an agent as used. Used agents must never re-enter the
 * shared pool — each visitor gets a fresh conversation with no prior context.
 */
export async function markAgentUsed(agentId: string): Promise<void> {
    if (!isRedisConfigured() || !agentId) {
        return;
    }

    const redis = getRedis();
    await redis.sadd(POOL_USED_KEY, agentId);

    // Belt-and-suspenders: evict from any pool queue if it slipped through.
    await redis.lrem(POOL_IDLE_KEY, 0, agentId);

    const warmingEntries = await readWarmingEntries();
    const withoutAgent = warmingEntries.filter(
        (entry) => entry.agentId !== agentId,
    );
    if (withoutAgent.length !== warmingEntries.length) {
        await writeWarmingEntries(withoutAgent);
    }
}

async function isAgentUsed(agentId: string): Promise<boolean> {
    const redis = getRedis();
    return (await redis.sismember(POOL_USED_KEY, agentId)) === 1;
}

/** Take a pre-warmed, never-used agent from the shared pool, if any. */
export async function checkoutIdleAgent(): Promise<string | null> {
    if (!isPoolEnabled() || getPoolTargetSize() === 0) {
        return null;
    }

    const redis = getRedis();

    // Skip any used IDs that should not be in the idle list (defensive).
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const agentId = await redis.lpop<string>(POOL_IDLE_KEY);
        if (!agentId) {
            return null;
        }
        if (!(await isAgentUsed(agentId))) {
            return agentId;
        }
        console.warn(
            `Discarded used agent ${agentId} found in idle pool — skipping`,
        );
    }
}

async function readWarmingEntries(): Promise<WarmingEntry[]> {
    const redis = getRedis();
    const raw = await redis.lrange(POOL_WARMING_KEY, 0, -1);
    const entries: WarmingEntry[] = [];

    for (const item of raw) {
        const parsed = parseWarmingEntry(item);
        if (parsed) {
            entries.push(parsed);
        }
    }

    return entries;
}

function parseWarmingEntry(item: unknown): WarmingEntry | null {
    let candidate: unknown = item;

    if (typeof item === "string") {
        try {
            candidate = JSON.parse(item);
        } catch {
            return null;
        }
    }

    if (!candidate || typeof candidate !== "object") {
        return null;
    }

    const { agentId, runId, startedAt } = candidate as WarmingEntry;
    if (typeof agentId !== "string" || typeof runId !== "string") {
        return null;
    }

    return {
        agentId,
        runId,
        startedAt: typeof startedAt === "number" ? startedAt : Date.now(),
    };
}

async function writeWarmingEntries(entries: WarmingEntry[]): Promise<void> {
    const redis = getRedis();
    const pipeline = redis.pipeline();
    pipeline.del(POOL_WARMING_KEY);
    for (const entry of entries) {
        pipeline.rpush(POOL_WARMING_KEY, JSON.stringify(entry));
    }
    await pipeline.exec();
}

async function pushIdleAgent(agentId: string): Promise<void> {
    if (await isAgentUsed(agentId)) {
        console.warn(`Refusing to pool used agent ${agentId}`);
        return;
    }

    const redis = getRedis();
    await redis.rpush(POOL_IDLE_KEY, agentId);
}

async function acquireMaintainLock(): Promise<boolean> {
    const redis = getRedis();
    const result = await redis.set(POOL_LOCK_KEY, Date.now(), {
        nx: true,
        ex: MAINTAIN_LOCK_TTL_SEC,
    });
    return result === "OK";
}

async function releaseMaintainLock(): Promise<void> {
    const redis = getRedis();
    await redis.del(POOL_LOCK_KEY);
}

async function processWarmingEntry(
    entry: WarmingEntry,
): Promise<"ready" | "still_warming" | "discarded"> {
    const result = await pollRunUntilComplete(entry.agentId, entry.runId, {
        maxWaitMs: WARMING_POLL_BUDGET_MS,
        pollIntervalMs: WARMING_POLL_INTERVAL_MS,
        throwOnTimeout: false,
    });

    if (result.status === "FINISHED") {
        await pushIdleAgent(entry.agentId);
        return "ready";
    }

    if (TERMINAL_STATUSES.has(result.status)) {
        return "discarded";
    }

    return "still_warming";
}

export interface MaintainPoolResult {
    enabled: boolean;
    skipped?: boolean;
    stats: PoolStats;
    promoted: number;
    discarded: number;
    started: number;
}

/**
 * Refill the shared warm-agent pool:
 * 1. Promote finished warming agents to idle.
 * 2. Start new warmups until idle + warming reaches the target size.
 */
export async function maintainPool(): Promise<MaintainPoolResult> {
    const stats = await getPoolStats();
    if (!stats.enabled || stats.target === 0) {
        return {
            enabled: stats.enabled,
            stats,
            promoted: 0,
            discarded: 0,
            started: 0,
        };
    }

    if (!(await acquireMaintainLock())) {
        return {
            enabled: true,
            skipped: true,
            stats,
            promoted: 0,
            discarded: 0,
            started: 0,
        };
    }

    let promoted = 0;
    let discarded = 0;
    let started = 0;

    try {
        const warmingEntries = await readWarmingEntries();
        const stillWarming: WarmingEntry[] = [];

        for (const entry of warmingEntries) {
            const outcome = await processWarmingEntry(entry);
            if (outcome === "ready") {
                promoted++;
            } else if (outcome === "discarded") {
                discarded++;
            } else {
                stillWarming.push(entry);
            }
        }

        await writeWarmingEntries(stillWarming);

        let currentStats = await getPoolStats();
        while (currentStats.idle + currentStats.warming < currentStats.target) {
            const agent = await createAgent(WARMUP_PROMPT);
            const warmingEntries = await readWarmingEntries();
            warmingEntries.push({
                agentId: agent.agentId,
                runId: agent.runId,
                startedAt: Date.now(),
            });
            await writeWarmingEntries(warmingEntries);
            started++;
            currentStats = await getPoolStats();
        }

        return {
            enabled: true,
            stats: currentStats,
            promoted,
            discarded,
            started,
        };
    } finally {
        await releaseMaintainLock();
    }
}

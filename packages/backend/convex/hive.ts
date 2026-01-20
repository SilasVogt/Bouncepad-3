import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// =============================================================================
// HIVE SYNC STATE QUERIES & MUTATIONS
// =============================================================================

/**
 * Get the current Hive sync state (singleton)
 */
export const getSyncState = internalQuery({
  args: {},
  handler: async (ctx): Promise<Doc<"hive_sync"> | null> => {
    const syncState = await ctx.db.query("hive_sync").first();
    return syncState;
  },
});

/**
 * Initialize the sync state if it doesn't exist
 * Should be called on first startup or to reset sync
 */
export const initializeSyncState = internalMutation({
  args: {
    startBlock: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("hive_sync").first();
    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("hive_sync", {
      lastParsedBlock: args.startBlock,
      lastKnownHeadBlock: args.startBlock,
      lastFetchedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update the sync state after fetching blocks
 */
export const updateSyncState = internalMutation({
  args: {
    lastParsedBlock: v.optional(v.number()),
    lastKnownHeadBlock: v.optional(v.number()),
    lastError: v.optional(v.string()),
    errorCount: v.optional(v.number()),
    clearError: v.optional(v.boolean()),
    // Stats
    lastBatchBlockCount: v.optional(v.number()),
    lastBatchPodpingCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const syncState = await ctx.db.query("hive_sync").first();
    if (!syncState) {
      throw new Error("Hive sync state not initialized");
    }

    const updates: Partial<Doc<"hive_sync">> = {
      updatedAt: Date.now(),
      lastFetchedAt: Date.now(),
    };

    if (args.lastParsedBlock !== undefined) {
      updates.lastParsedBlock = args.lastParsedBlock;
    }
    if (args.lastKnownHeadBlock !== undefined) {
      updates.lastKnownHeadBlock = args.lastKnownHeadBlock;
    }
    if (args.lastError !== undefined) {
      updates.lastError = args.lastError;
    }
    if (args.errorCount !== undefined) {
      updates.errorCount = args.errorCount;
    }
    if (args.clearError) {
      updates.lastError = undefined;
      updates.errorCount = 0;
    }

    // Stats tracking
    if (args.lastBatchBlockCount !== undefined) {
      updates.lastBatchBlockCount = args.lastBatchBlockCount;
      updates.totalBlocksProcessed = (syncState.totalBlocksProcessed ?? 0) + args.lastBatchBlockCount;
    }
    if (args.lastBatchPodpingCount !== undefined) {
      updates.lastBatchPodpingCount = args.lastBatchPodpingCount;
      updates.totalPodpingsFound = (syncState.totalPodpingsFound ?? 0) + args.lastBatchPodpingCount;
    }

    await ctx.db.patch(syncState._id, updates);
  },
});

// =============================================================================
// LOCK MECHANISM TO PREVENT OVERLAPPING CRON EXECUTIONS
// =============================================================================

const LOCK_TIMEOUT_MS = 60_000; // 60 seconds - if lock is older, consider it stale

/**
 * Try to acquire the sync lock. Returns true if acquired, false if already running.
 */
export const tryAcquireLock = internalMutation({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    const syncState = await ctx.db.query("hive_sync").first();
    if (!syncState) {
      return false; // Not initialized yet
    }

    const now = Date.now();

    // Check if lock is held and not stale
    if (syncState.isRunning && syncState.runStartedAt) {
      const lockAge = now - syncState.runStartedAt;
      if (lockAge < LOCK_TIMEOUT_MS) {
        // Lock is still valid, another execution is running
        return false;
      }
      // Lock is stale, we can take over
    }

    // Acquire the lock
    await ctx.db.patch(syncState._id, {
      isRunning: true,
      runStartedAt: now,
      updatedAt: now,
    });

    return true;
  },
});

/**
 * Release the sync lock after execution completes
 */
export const releaseLock = internalMutation({
  args: {},
  handler: async (ctx) => {
    const syncState = await ctx.db.query("hive_sync").first();
    if (!syncState) {
      return;
    }

    await ctx.db.patch(syncState._id, {
      isRunning: false,
      runStartedAt: undefined,
      updatedAt: Date.now(),
    });
  },
});

// =============================================================================
// HIVE BLOCKS QUERIES & MUTATIONS
// =============================================================================

/**
 * Store fetched Hive blocks (full raw data for potential reprocessing)
 */
export const storeHiveBlocks = internalMutation({
  args: {
    blocks: v.array(
      v.object({
        blockNumber: v.number(),
        blockTimestamp: v.optional(v.string()),
        blockId: v.optional(v.string()),
        witness: v.optional(v.string()),
        rawTransactions: v.string(), // JSON stringified transactions
        transactionCount: v.number(),
        podpingCount: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const block of args.blocks) {
      // Check if block already exists
      const existing = await ctx.db
        .query("hive_blocks")
        .withIndex("by_block_number", (q) => q.eq("blockNumber", block.blockNumber))
        .first();

      if (existing) {
        continue; // Skip duplicate blocks
      }

      // Determine status based on whether there are podping transactions
      const status = block.podpingCount > 0 ? ("pending" as const) : ("empty" as const);

      await ctx.db.insert("hive_blocks", {
        blockNumber: block.blockNumber,
        blockTimestamp: block.blockTimestamp,
        blockId: block.blockId,
        witness: block.witness,
        rawTransactions: block.rawTransactions,
        transactionCount: block.transactionCount,
        podpingCount: block.podpingCount,
        status,
        createdAt: now,
      });
    }
  },
});

/**
 * Get pending blocks that need processing
 */
export const getPendingBlocks = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("hive_blocks")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(limit);
  },
});

/**
 * Mark a block as processed
 */
export const markBlockProcessed = internalMutation({
  args: {
    blockNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("hive_blocks")
      .withIndex("by_block_number", (q) => q.eq("blockNumber", args.blockNumber))
      .first();

    if (block) {
      await ctx.db.patch(block._id, {
        status: "processed",
        processedAt: Date.now(),
      });
    }
  },
});

// =============================================================================
// PODPING HISTORY QUERIES & MUTATIONS
// =============================================================================

/**
 * Create podping history entries from processed blocks
 */
export const createPodpingHistories = internalMutation({
  args: {
    entries: v.array(
      v.object({
        blockNumber: v.number(),
        reason: v.string(),
        feedUrls: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const entry of args.entries) {
      await ctx.db.insert("podping_histories", {
        blockNumber: entry.blockNumber,
        reason: entry.reason,
        feedUrls: entry.feedUrls,
        processed: false,
        createdAt: now,
      });
    }
  },
});

/**
 * Get unprocessed podping histories for feed fetching
 */
export const getUnprocessedPodpings = internalQuery({
  args: {
    reason: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.reason !== undefined) {
      const reasonValue = args.reason;
      return await ctx.db
        .query("podping_histories")
        .withIndex("by_reason", (q) => q.eq("reason", reasonValue))
        .filter((q) => q.neq(q.field("processed"), true))
        .take(limit);
    }

    return await ctx.db
      .query("podping_histories")
      .filter((q) => q.neq(q.field("processed"), true))
      .take(limit);
  },
});

/**
 * Mark podping history as processed
 */
export const markPodpingProcessed = internalMutation({
  args: {
    id: v.id("podping_histories"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      processed: true,
      processedAt: Date.now(),
    });
  },
});

// =============================================================================
// CLEANUP QUERIES & MUTATIONS
// =============================================================================

// Cleanup intervals - blocks are large so clean more aggressively
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000; // For hive_blocks
const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000; // For podping_histories

/**
 * Get old hive_blocks for cleanup (older than 10 days)
 */
export const getOldBlocksForCleanup = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const cutoff = Date.now() - TEN_DAYS_MS;

    return await ctx.db
      .query("hive_blocks")
      .withIndex("by_created", (q) => q.lt("createdAt", cutoff))
      .take(limit);
  },
});

/**
 * Delete old hive blocks
 */
export const deleteOldBlocks = internalMutation({
  args: {
    ids: v.array(v.id("hive_blocks")),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return args.ids.length;
  },
});

/**
 * Get old podping_histories for cleanup (older than 20 days)
 */
export const getOldPodpingsForCleanup = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const cutoff = Date.now() - TWENTY_DAYS_MS;

    return await ctx.db
      .query("podping_histories")
      .withIndex("by_created", (q) => q.lt("createdAt", cutoff))
      .take(limit);
  },
});

/**
 * Delete old podping histories
 */
export const deleteOldPodpings = internalMutation({
  args: {
    ids: v.array(v.id("podping_histories")),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return args.ids.length;
  },
});

// =============================================================================
// PUBLIC QUERIES (for debugging/admin)
// =============================================================================

/**
 * Get sync status (public query for admin dashboard)
 */
export const getHiveSyncStatus = query({
  args: {},
  handler: async (ctx) => {
    const syncState = await ctx.db.query("hive_sync").first();
    if (!syncState) {
      return null;
    }

    const pendingBlocks = await ctx.db
      .query("hive_blocks")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const recentPodpings = await ctx.db
      .query("podping_histories")
      .withIndex("by_created")
      .order("desc")
      .take(10);

    return {
      syncState,
      pendingBlockCount: pendingBlocks.length,
      recentPodpings,
      blocksBehind: syncState.lastKnownHeadBlock - syncState.lastParsedBlock,
    };
  },
});

/**
 * List podping histories with reason filter and pagination
 */
export const listPodpingHistories = query({
  args: {
    reason: v.optional(
      v.union(
        v.literal("live+liveEnd"),
        v.literal("live"),
        v.literal("liveEnd"),
        v.literal("update"),
        v.literal("all")
      )
    ),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const reason = args.reason ?? "live+liveEnd";

    // Parse cursor if provided (format: "createdAt:id")
    let cursorCreatedAt: number | undefined;
    let cursorId: string | undefined;
    if (args.cursor) {
      const [createdAtStr, id] = args.cursor.split(":");
      cursorCreatedAt = parseInt(createdAtStr, 10);
      cursorId = id;
    }

    if (reason === "live+liveEnd") {
      // Fetch both live and liveEnd events
      const [liveEvents, liveEndEvents] = await Promise.all([
        ctx.db
          .query("podping_histories")
          .withIndex("by_reason", (q) => q.eq("reason", "live"))
          .order("desc")
          .take(limit * 2), // Fetch more to handle merging
        ctx.db
          .query("podping_histories")
          .withIndex("by_reason", (q) => q.eq("reason", "liveEnd"))
          .order("desc")
          .take(limit * 2),
      ]);

      // Merge and sort by createdAt descending
      const merged = [...liveEvents, ...liveEndEvents].sort(
        (a, b) => b.createdAt - a.createdAt
      );

      // Apply cursor filtering if present
      let filtered = merged;
      if (cursorCreatedAt !== undefined && cursorId) {
        filtered = merged.filter(
          (item) =>
            item.createdAt < cursorCreatedAt! ||
            (item.createdAt === cursorCreatedAt && item._id < cursorId!)
        );
      }

      const items = filtered.slice(0, limit);
      const lastItem = items[items.length - 1];
      const nextCursor = lastItem
        ? `${lastItem.createdAt}:${lastItem._id}`
        : undefined;

      return {
        items,
        nextCursor,
        hasMore: filtered.length > limit,
      };
    }

    // Single reason filter or all
    const results =
      reason !== "all"
        ? await ctx.db
            .query("podping_histories")
            .withIndex("by_reason", (q) => q.eq("reason", reason))
            .order("desc")
            .take(limit + 1)
        : await ctx.db
            .query("podping_histories")
            .withIndex("by_created")
            .order("desc")
            .take(limit + 1);

    // Apply cursor filtering if present
    let filtered = results;
    if (cursorCreatedAt !== undefined && cursorId) {
      filtered = results.filter(
        (item) =>
          item.createdAt < cursorCreatedAt! ||
          (item.createdAt === cursorCreatedAt && item._id < cursorId!)
      );
    }

    const items = filtered.slice(0, limit);
    const hasMore = filtered.length > limit;
    const lastItem = items[items.length - 1];
    const nextCursor = lastItem
      ? `${lastItem.createdAt}:${lastItem._id}`
      : undefined;

    return {
      items,
      nextCursor,
      hasMore,
    };
  },
});

/**
 * Search podpings by feed URL using search index
 */
export const searchPodpingsByFeedUrl = query({
  args: {
    feedUrl: v.string(),
    reason: v.optional(
      v.union(
        v.literal("live"),
        v.literal("liveEnd"),
        v.literal("update")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    let searchQuery = ctx.db
      .query("podping_histories")
      .withSearchIndex("search_feed_urls", (q) => {
        let search = q.search("feedUrls", args.feedUrl);
        if (args.reason) {
          search = search.eq("reason", args.reason);
        }
        return search;
      });

    const results = await searchQuery.take(limit);

    return {
      items: results,
      count: results.length,
    };
  },
});

/**
 * Get podpings by exact block number
 */
export const getPodpingsByBlockNumber = query({
  args: {
    blockNumber: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const results = await ctx.db
      .query("podping_histories")
      .withIndex("by_block_number", (q) => q.eq("blockNumber", args.blockNumber))
      .take(limit);

    return {
      items: results,
      count: results.length,
    };
  },
});

// =============================================================================
// MIGRATION HELPERS
// =============================================================================

/**
 * Clear all hive_blocks for schema migration
 * Run this when schema changes require clearing old data:
 *   npx convex run hive:clearAllBlocks
 */
export const clearAllBlocks = mutation({
  args: {},
  handler: async (ctx) => {
    let deleted = 0;
    const blocks = await ctx.db.query("hive_blocks").collect();
    for (const block of blocks) {
      await ctx.db.delete(block._id);
      deleted++;
    }
    return { deleted };
  },
});

/**
 * Clear hive_sync state for fresh start
 * Run this after clearing blocks:
 *   npx convex run hive:clearSyncState
 */
export const clearSyncState = mutation({
  args: {},
  handler: async (ctx) => {
    const syncState = await ctx.db.query("hive_sync").first();
    if (syncState) {
      await ctx.db.delete(syncState._id);
      return { deleted: true };
    }
    return { deleted: false };
  },
});

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// =============================================================================
// HIVE RPC CONFIGURATION
// =============================================================================

// Hive RPC nodes - ordered by reliability (most reliable first)
// Nodes removed due to consistent errors: hived.emre.sh, rpc.ecency.com
const HIVE_RPC_NODES = [
  "https://api.hive.blog",        // Official Hive node
  "https://rpc.podping.org",      // Podping-specific node
  "https://api.openhive.network", // OpenHive
  "https://hive-api.web3telekom.xyz",
  "https://hive-api.arcange.eu",
  "https://rpc.mahdiyari.info",
];

const USER_AGENT = "Bouncepad.Live v3 Podping Parser. hello@bouncepad.live / @silas@podcastindex.social";

// Podping operation IDs we care about
const PODPING_OPERATIONS = [
  "pp_podcast_update",
  "pp_podcast_live",
  "pp_podcast_liveEnd",
  // Legacy operations
  "podping",
  "pp_video_update",
  "pp_video_live",
  "pp_video_liveEnd",
];

// Max blocks to fetch per batch - higher = faster catch-up
// Hive produces 1 block/3sec, so we need to process faster than that
const MAX_BLOCKS_PER_FETCH = 50;

// =============================================================================
// TYPES
// =============================================================================

interface HiveRpcResponse<T> {
  jsonrpc: string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  id: number;
}

interface HiveBlock {
  block_id: string;
  previous: string;
  timestamp: string;
  witness: string;
  transaction_merkle_root: string;
  transactions: HiveTransaction[];
}

interface HiveTransaction {
  transaction_id: string;
  operations: HiveOperation[];
}

type HiveOperation = [string, Record<string, unknown>];

interface DynamicGlobalProperties {
  head_block_number: number;
  head_block_id: string;
  time: string;
}

interface PodpingTransaction {
  transactionId: string;
  operationId: string;
  json: string;
}

interface StoredBlock {
  blockNumber: number;
  blockTimestamp?: string;
  blockId?: string;
  witness?: string;
  rawTransactions: string; // JSON stringified
  transactionCount: number;
  podpingCount: number;
}

interface FetchResult {
  success: boolean;
  message?: string;
  error?: string;
  blocksProcessed: number;
  podpingTransactions?: number;
  headBlock?: number;
  lastParsedBlock?: number;
  blocksBehind?: number;
  errorCount?: number;
}

interface ProcessResult {
  success: boolean;
  message: string;
  blocksProcessed: number;
  podpingEventsCreated?: number;
}

interface CleanupResult {
  success: boolean;
  message: string;
  blocksDeleted: number;
  podpingsDeleted: number;
}

// =============================================================================
// RPC HELPERS
// =============================================================================

// Timeout for individual RPC calls (3 seconds - fail fast)
const RPC_TIMEOUT_MS = 3_000;

/**
 * Make a JSON-RPC call to a Hive node with timeout
 */
async function hiveRpcCall<T>(
  node: string,
  method: string,
  params: unknown[]
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);

  try {
    const response = await fetch(node, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id: 1,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = (await response.json()) as HiveRpcResponse<T>;

    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    if (data.result === undefined) {
      throw new Error("No result in RPC response");
    }

    return data.result;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Make an RPC call with automatic failover to backup nodes
 * Tries nodes in order of reliability (not shuffled) until one works
 */
async function hiveRpcWithFailover<T>(
  method: string,
  params: unknown[]
): Promise<T> {
  const errors: string[] = [];

  // Try all nodes in order (most reliable first) until one works
  for (const node of HIVE_RPC_NODES) {
    try {
      return await hiveRpcCall<T>(node, method, params);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`${node}: ${errorMsg}`);
      // Continue to next node
    }
  }

  // All nodes failed - throw with details about each failure
  throw new Error(`All Hive RPC nodes failed:\n${errors.join("\n")}`);
}

/**
 * Get the current head block number from the Hive blockchain
 */
async function getHeadBlockNumber(): Promise<number> {
  const props = await hiveRpcWithFailover<DynamicGlobalProperties>(
    "condenser_api.get_dynamic_global_properties",
    []
  );
  return props.head_block_number;
}

/**
 * Make a batch RPC call to fetch multiple blocks in one HTTP request
 */
async function batchGetBlocks(
  node: string,
  blockNumbers: number[]
): Promise<(HiveBlock | null)[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS * 2); // Longer timeout for batch

  try {
    // Create batch request - multiple JSON-RPC calls in one HTTP request
    const batchRequest = blockNumbers.map((blockNum, index) => ({
      jsonrpc: "2.0",
      method: "condenser_api.get_block",
      params: [blockNum],
      id: index,
    }));

    const response = await fetch(node, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify(batchRequest),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const results = (await response.json()) as HiveRpcResponse<HiveBlock | null>[];

    // Sort by id to maintain order and extract results
    const sortedResults = results.sort((a, b) => a.id - b.id);
    return sortedResults.map((r) => r.result ?? null);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get multiple blocks in a range using batch RPC (much faster than individual calls)
 */
async function getBlockRange(startBlock: number, endBlock: number): Promise<HiveBlock[]> {
  const blockNumbers: number[] = [];
  for (let blockNum = startBlock; blockNum <= endBlock; blockNum++) {
    blockNumbers.push(blockNum);
  }

  const errors: string[] = [];

  // Try each node until one succeeds with the batch request
  for (const node of HIVE_RPC_NODES) {
    try {
      const results = await batchGetBlocks(node, blockNumbers);
      // Filter out nulls and return
      return results.filter((block): block is HiveBlock => block !== null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push(`${node}: ${errorMsg}`);
      // Continue to next node
    }
  }

  throw new Error(`Failed to fetch blocks ${startBlock}-${endBlock}:\n${errors.join("\n")}`);
}

// =============================================================================
// PODPING EXTRACTION
// =============================================================================

/**
 * Count podping transactions in a block (for determining if processing is needed)
 */
function countPodpingTransactions(block: HiveBlock): number {
  let count = 0;

  for (const tx of block.transactions) {
    for (const [opType, opData] of tx.operations) {
      // Podping uses custom_json operations
      if (opType === "custom_json") {
        const customJson = opData as {
          required_auths?: string[];
          required_posting_auths?: string[];
          id: string;
          json: string;
        };

        // Check if this is a podping operation
        if (PODPING_OPERATIONS.includes(customJson.id)) {
          count++;
        }
      }
    }
  }

  return count;
}

/**
 * Extract podping transactions from raw transaction data
 * Used during the processing step to create podping_histories
 *
 * NOTE: If you want to pre-filter during fetch instead of storing full blocks,
 * you can use this function in prepareBlockForStorage and only store the
 * podping transactions. Currently we store full blocks for audit/reprocessing.
 */
function extractPodpingTransactions(rawTransactionsJson: string): PodpingTransaction[] {
  const podpingTxs: PodpingTransaction[] = [];

  try {
    const transactions = JSON.parse(rawTransactionsJson) as HiveTransaction[];

    for (const tx of transactions) {
      for (const [opType, opData] of tx.operations) {
        if (opType === "custom_json") {
          const customJson = opData as {
            required_auths?: string[];
            required_posting_auths?: string[];
            id: string;
            json: string;
          };

          if (PODPING_OPERATIONS.includes(customJson.id)) {
            podpingTxs.push({
              transactionId: tx.transaction_id,
              operationId: customJson.id,
              json: customJson.json,
            });
          }
        }
      }
    }
  } catch {
    // Invalid JSON, return empty
  }

  return podpingTxs;
}

/**
 * Prepare a Hive block for storage (stores full raw data)
 */
function prepareBlockForStorage(block: HiveBlock, blockNumber: number): StoredBlock {
  const podpingCount = countPodpingTransactions(block);

  return {
    blockNumber,
    blockTimestamp: block.timestamp,
    blockId: block.block_id,
    witness: block.witness,
    rawTransactions: JSON.stringify(block.transactions),
    transactionCount: block.transactions.length,
    podpingCount,
  };
}

// =============================================================================
// CONVEX ACTIONS
// =============================================================================

/**
 * Fetch new blocks from Hive and store them
 * Called by cron job every 10 seconds
 */
export const fetchHiveBlocks = internalAction({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.optional(v.string()),
    error: v.optional(v.string()),
    blocksProcessed: v.number(),
    podpingTransactions: v.optional(v.number()),
    headBlock: v.optional(v.number()),
    lastParsedBlock: v.optional(v.number()),
    blocksBehind: v.optional(v.number()),
    errorCount: v.optional(v.number()),
  }),
  handler: async (ctx): Promise<FetchResult> => {
    // Get current sync state
    const syncState = (await ctx.runQuery(
      internal.hive.getSyncState,
      {}
    )) as Doc<"hive_sync"> | null;

    // Initialize if needed
    if (!syncState) {
      // Get current head block to start from
      const headBlock = await getHeadBlockNumber();
      // Start from a few blocks behind to ensure we don't miss anything
      const startBlock = headBlock - 10;

      await ctx.runMutation(internal.hive.initializeSyncState, {
        startBlock,
      });

      return {
        success: true,
        message: `Initialized sync state at block ${startBlock}`,
        blocksProcessed: 0,
      };
    }

    try {
      // Get current head block
      const headBlock = await getHeadBlockNumber();

      // Calculate blocks to fetch
      const startBlock = syncState.lastParsedBlock + 1;
      const endBlock = Math.min(startBlock + MAX_BLOCKS_PER_FETCH - 1, headBlock);

      // Nothing to fetch if we're caught up
      if (startBlock > headBlock) {
        await ctx.runMutation(internal.hive.updateSyncState, {
          lastKnownHeadBlock: headBlock,
          clearError: true,
        });
        return {
          success: true,
          message: "Sync is up to date",
          blocksProcessed: 0,
          headBlock,
          lastParsedBlock: syncState.lastParsedBlock,
        };
      }

      // Fetch blocks
      const blocks = await getBlockRange(startBlock, endBlock);

      // Process blocks for storage (stores full raw data)
      const storedBlocks: StoredBlock[] = [];
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockNumber = startBlock + i;
        storedBlocks.push(prepareBlockForStorage(block, blockNumber));
      }

      // Store blocks in database
      if (storedBlocks.length > 0) {
        await ctx.runMutation(internal.hive.storeHiveBlocks, {
          blocks: storedBlocks,
        });
      }

      // Update sync state
      const newLastParsedBlock = endBlock;
      await ctx.runMutation(internal.hive.updateSyncState, {
        lastParsedBlock: newLastParsedBlock,
        lastKnownHeadBlock: headBlock,
        clearError: true,
      });

      const podpingCount = storedBlocks.reduce(
        (sum, b) => sum + b.podpingCount,
        0
      );

      return {
        success: true,
        message: `Fetched blocks ${startBlock} to ${endBlock}`,
        blocksProcessed: storedBlocks.length,
        podpingTransactions: podpingCount,
        headBlock,
        lastParsedBlock: newLastParsedBlock,
        blocksBehind: headBlock - newLastParsedBlock,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const newErrorCount = (syncState.errorCount ?? 0) + 1;

      await ctx.runMutation(internal.hive.updateSyncState, {
        lastError: errorMessage,
        errorCount: newErrorCount,
      });

      return {
        success: false,
        error: errorMessage,
        errorCount: newErrorCount,
        blocksProcessed: 0,
      };
    }
  },
});

/**
 * Process pending hive_blocks and extract podping events
 * Called by cron job every 10 seconds (offset from fetch)
 */
export const processHiveBlocks = internalAction({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    blocksProcessed: v.number(),
    podpingEventsCreated: v.optional(v.number()),
  }),
  handler: async (ctx): Promise<ProcessResult> => {
    // Get pending blocks
    const pendingBlocks = (await ctx.runQuery(internal.hive.getPendingBlocks, {
      limit: 100,
    })) as Doc<"hive_blocks">[];

    if (pendingBlocks.length === 0) {
      return {
        success: true,
        message: "No pending blocks to process",
        blocksProcessed: 0,
      };
    }

    // Group podping events by reason
    const podpingGroups: Map<
      string,
      { blockNumber: number; reason: string; feedUrls: string[] }
    > = new Map();

    for (const block of pendingBlocks) {
      // Extract podping transactions from raw block data
      // Skip blocks without rawTransactions (old format - should be cleared)
      if (!block.rawTransactions) {
        await ctx.runMutation(internal.hive.markBlockProcessed, {
          blockNumber: block.blockNumber,
        });
        continue;
      }
      const podpingTxs = extractPodpingTransactions(block.rawTransactions);

      for (const tx of podpingTxs) {
        // Parse the JSON payload to extract feed URLs
        try {
          const payload = JSON.parse(tx.json);

          // Determine the reason from operation ID
          let reason: string;
          if (tx.operationId.includes("live") && tx.operationId.includes("End")) {
            reason = "liveEnd";
          } else if (tx.operationId.includes("live")) {
            reason = "live";
          } else {
            reason = "update";
          }

          // Extract feed URLs from payload
          // Podping payloads can have "urls" array or "url" string
          const feedUrls: string[] = [];
          if (payload.urls && Array.isArray(payload.urls)) {
            feedUrls.push(...payload.urls);
          } else if (payload.url) {
            feedUrls.push(payload.url);
          } else if (payload.iris && Array.isArray(payload.iris)) {
            // Some podping formats use "iris" instead of "urls"
            feedUrls.push(...payload.iris);
          }

          if (feedUrls.length > 0) {
            // Create a unique key for grouping
            const key = `${block.blockNumber}-${reason}`;

            if (podpingGroups.has(key)) {
              const existing = podpingGroups.get(key)!;
              existing.feedUrls.push(...feedUrls);
            } else {
              podpingGroups.set(key, {
                blockNumber: block.blockNumber,
                reason,
                feedUrls,
              });
            }
          }
        } catch {
          // Skip malformed JSON
          continue;
        }
      }

      // Mark block as processed
      await ctx.runMutation(internal.hive.markBlockProcessed, {
        blockNumber: block.blockNumber,
      });
    }

    // Create podping history entries
    if (podpingGroups.size > 0) {
      const entries = Array.from(podpingGroups.values()).map((group) => ({
        blockNumber: group.blockNumber,
        reason: group.reason,
        feedUrls: [...new Set(group.feedUrls)], // Deduplicate
      }));

      await ctx.runMutation(internal.hive.createPodpingHistories, {
        entries,
      });
    }

    return {
      success: true,
      message: `Processed ${pendingBlocks.length} blocks`,
      blocksProcessed: pendingBlocks.length,
      podpingEventsCreated: podpingGroups.size,
    };
  },
});

/**
 * Clean up old records (older than 30 days)
 * Called by daily cron job
 */
export const cleanupOldRecords = internalAction({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
    blocksDeleted: v.number(),
    podpingsDeleted: v.number(),
  }),
  handler: async (ctx): Promise<CleanupResult> => {
    let totalBlocksDeleted = 0;
    let totalPodpingsDeleted = 0;

    // Clean up old hive_blocks (in batches to avoid timeout)
    let hasMoreBlocks = true;
    while (hasMoreBlocks) {
      const oldBlocks = (await ctx.runQuery(internal.hive.getOldBlocksForCleanup, {
        limit: 100,
      })) as Doc<"hive_blocks">[];

      if (oldBlocks.length === 0) {
        hasMoreBlocks = false;
        break;
      }

      const deleted = await ctx.runMutation(internal.hive.deleteOldBlocks, {
        ids: oldBlocks.map((b) => b._id),
      });

      totalBlocksDeleted += deleted;

      // Prevent infinite loop
      if (totalBlocksDeleted > 10000) {
        break;
      }
    }

    // Clean up old podping_histories
    let hasMorePodpings = true;
    while (hasMorePodpings) {
      const oldPodpings = (await ctx.runQuery(internal.hive.getOldPodpingsForCleanup, {
        limit: 100,
      })) as Doc<"podping_histories">[];

      if (oldPodpings.length === 0) {
        hasMorePodpings = false;
        break;
      }

      const deleted = await ctx.runMutation(internal.hive.deleteOldPodpings, {
        ids: oldPodpings.map((p) => p._id),
      });

      totalPodpingsDeleted += deleted;

      // Prevent infinite loop
      if (totalPodpingsDeleted > 10000) {
        break;
      }
    }

    return {
      success: true,
      message: `Cleanup complete`,
      blocksDeleted: totalBlocksDeleted,
      podpingsDeleted: totalPodpingsDeleted,
    };
  },
});

/**
 * Manual trigger to reset sync state (admin only)
 */
export const resetSyncState = action({
  args: {
    startBlock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current head block if no start block specified
    const startBlock = args.startBlock ?? (await getHeadBlockNumber()) - 100;

    // Delete existing sync state
    const existing = await ctx.runQuery(internal.hive.getSyncState, {});
    if (existing) {
      // We need a mutation to delete - let's just reinitialize
      await ctx.runMutation(internal.hive.updateSyncState, {
        lastParsedBlock: startBlock,
        lastKnownHeadBlock: startBlock,
        clearError: true,
      });
    } else {
      await ctx.runMutation(internal.hive.initializeSyncState, {
        startBlock,
      });
    }

    return {
      success: true,
      message: `Reset sync state to block ${startBlock}`,
    };
  },
});

/**
 * Get current head block from Hive (for debugging)
 */
export const getCurrentHeadBlock = action({
  args: {},
  handler: async () => {
    const headBlock = await getHeadBlockNumber();
    return { headBlock };
  },
});

/**
 * Combined sync action - Fetch blocks AND process them sequentially
 * This prevents write conflicts from parallel cron jobs
 * Called by cron job every 3 seconds
 *
 * Throws on errors so they appear as failures in Convex logs
 */
export const syncHiveBlocks = internalAction({
  args: {},
  returns: v.object({
    success: v.boolean(),
    skipped: v.optional(v.boolean()),
    fetch: v.any(),
    process: v.any(),
  }),
  handler: async (ctx) => {
    // Try to acquire lock to prevent overlapping executions
    const lockAcquired = await ctx.runMutation(internal.hive.tryAcquireLock, {});

    if (!lockAcquired) {
      // Another execution is already running - this is normal, not an error
      return {
        success: true,
        skipped: true,
        fetch: { message: "Skipped - another sync is running" },
        process: { message: "Skipped" },
      };
    }

    try {
      // Step 1: Fetch new blocks (throws on error)
      const fetchResult = await fetchHiveBlocksHandler(ctx);

      // If fetch had an error, throw it so it shows as failed in logs
      if (!fetchResult.success && fetchResult.error) {
        throw new Error(`Fetch failed: ${fetchResult.error}`);
      }

      // Step 2: Process pending blocks
      const processResult = await processHiveBlocksHandler(ctx);

      return {
        success: true,
        fetch: fetchResult,
        process: processResult,
      };
    } finally {
      // Always release the lock when done - ignore errors here
      try {
        await ctx.runMutation(internal.hive.releaseLock, {});
      } catch {
        // Ignore lock release errors - the lock will timeout anyway
      }
    }
  },
});

// Internal handler functions to avoid code duplication
async function fetchHiveBlocksHandler(ctx: any): Promise<FetchResult> {
  const syncState = (await ctx.runQuery(
    internal.hive.getSyncState,
    {}
  )) as Doc<"hive_sync"> | null;

  if (!syncState) {
    const headBlock = await getHeadBlockNumber();
    const startBlock = headBlock - 10;

    await ctx.runMutation(internal.hive.initializeSyncState, {
      startBlock,
    });

    return {
      success: true,
      message: `Initialized sync state at block ${startBlock}`,
      blocksProcessed: 0,
    };
  }

  // This will throw on RPC errors - let it propagate for proper error logging
  const headBlock = await getHeadBlockNumber();
  const startBlock = syncState.lastParsedBlock + 1;
  const endBlock = Math.min(startBlock + MAX_BLOCKS_PER_FETCH - 1, headBlock);

  if (startBlock > headBlock) {
    await ctx.runMutation(internal.hive.updateSyncState, {
      lastKnownHeadBlock: headBlock,
      clearError: true,
    });
    return {
      success: true,
      message: "Sync is up to date",
      blocksProcessed: 0,
      headBlock,
      lastParsedBlock: syncState.lastParsedBlock,
    };
  }

  // This will throw on RPC errors - let it propagate for proper error logging
  const blocks = await getBlockRange(startBlock, endBlock);

  const storedBlocks: StoredBlock[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const blockNumber = startBlock + i;
    storedBlocks.push(prepareBlockForStorage(block, blockNumber));
  }

  if (storedBlocks.length > 0) {
    await ctx.runMutation(internal.hive.storeHiveBlocks, {
      blocks: storedBlocks,
    });
  }

  const newLastParsedBlock = endBlock;
  const podpingCount = storedBlocks.reduce(
    (sum, b) => sum + b.podpingCount,
    0
  );

  await ctx.runMutation(internal.hive.updateSyncState, {
    lastParsedBlock: newLastParsedBlock,
    lastKnownHeadBlock: headBlock,
    clearError: true,
    lastBatchBlockCount: storedBlocks.length,
    lastBatchPodpingCount: podpingCount,
  });

  return {
    success: true,
    message: `Fetched blocks ${startBlock} to ${endBlock}`,
    blocksProcessed: storedBlocks.length,
    podpingTransactions: podpingCount,
    headBlock,
    lastParsedBlock: newLastParsedBlock,
    blocksBehind: headBlock - newLastParsedBlock,
  };
}

async function processHiveBlocksHandler(ctx: any): Promise<ProcessResult> {
  const pendingBlocks = (await ctx.runQuery(internal.hive.getPendingBlocks, {
    limit: 100,
  })) as Doc<"hive_blocks">[];

  if (pendingBlocks.length === 0) {
    return {
      success: true,
      message: "No pending blocks to process",
      blocksProcessed: 0,
    };
  }

  const podpingGroups: Map<
    string,
    { blockNumber: number; reason: string; feedUrls: string[] }
  > = new Map();

  for (const block of pendingBlocks) {
    // Extract podping transactions from raw block data
    // Skip blocks without rawTransactions (old format - should be cleared)
    if (!block.rawTransactions) {
      await ctx.runMutation(internal.hive.markBlockProcessed, {
        blockNumber: block.blockNumber,
      });
      continue;
    }
    const podpingTxs = extractPodpingTransactions(block.rawTransactions);

    for (const tx of podpingTxs) {
      try {
        const payload = JSON.parse(tx.json);

        let reason: string;
        if (tx.operationId.includes("live") && tx.operationId.includes("End")) {
          reason = "liveEnd";
        } else if (tx.operationId.includes("live")) {
          reason = "live";
        } else {
          reason = "update";
        }

        const feedUrls: string[] = [];
        if (payload.urls && Array.isArray(payload.urls)) {
          feedUrls.push(...payload.urls);
        } else if (payload.url) {
          feedUrls.push(payload.url);
        } else if (payload.iris && Array.isArray(payload.iris)) {
          feedUrls.push(...payload.iris);
        }

        if (feedUrls.length > 0) {
          const key = `${block.blockNumber}-${reason}`;

          if (podpingGroups.has(key)) {
            const existing = podpingGroups.get(key)!;
            existing.feedUrls.push(...feedUrls);
          } else {
            podpingGroups.set(key, {
              blockNumber: block.blockNumber,
              reason,
              feedUrls,
            });
          }
        }
      } catch {
        continue;
      }
    }

    await ctx.runMutation(internal.hive.markBlockProcessed, {
      blockNumber: block.blockNumber,
    });
  }

  if (podpingGroups.size > 0) {
    const entries = Array.from(podpingGroups.values()).map((group) => ({
      blockNumber: group.blockNumber,
      reason: group.reason,
      feedUrls: [...new Set(group.feedUrls)],
    }));

    await ctx.runMutation(internal.hive.createPodpingHistories, {
      entries,
    });
  }

  return {
    success: true,
    message: `Processed ${pendingBlocks.length} blocks`,
    blocksProcessed: pendingBlocks.length,
    podpingEventsCreated: podpingGroups.size,
  };
}

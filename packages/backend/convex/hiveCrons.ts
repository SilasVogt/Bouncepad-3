import { Crons } from "@convex-dev/crons";
import { components, internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";

// =============================================================================
// CRONS COMPONENT INSTANCE
// =============================================================================

const crons = new Crons(components.crons);

// =============================================================================
// CRON JOB MANAGEMENT FOR HIVE BLOCKCHAIN SYNC
// =============================================================================

/**
 * Setup all Hive sync cron jobs
 * Call this once to initialize the scheduled jobs:
 *   npx convex run hiveCrons:setupHiveCrons
 */
export const setupHiveCrons = mutation({
  args: {},
  handler: async (ctx) => {
    const existingJobs = await crons.list(ctx);
    const existingNames = existingJobs.map((job) => job.name);

    const results: string[] = [];

    // Delete old separate jobs if they exist (migration)
    for (const oldJob of ["fetchHiveBlocks", "processHiveBlocks"]) {
      if (existingNames.includes(oldJob)) {
        const job = existingJobs.find((j) => j.name === oldJob);
        if (job) {
          await crons.delete(ctx, { id: job.id });
          results.push(`Deleted old job: ${oldJob}`);
        }
      }
    }

    // Combined Sync Job - Fetches AND processes blocks sequentially
    // Runs every 3 seconds (matching Hive block time) with lock to prevent overlap
    // Will catch up on any missed blocks between lastParsedBlock and head
    if (!existingNames.includes("syncHiveBlocks")) {
      await crons.register(
        ctx,
        { kind: "interval", ms: 3_000 }, // 3 seconds - matches Hive block time
        internal.hiveFetcher.syncHiveBlocks,
        {},
        "syncHiveBlocks"
      );
      results.push("Registered syncHiveBlocks (3s interval with lock)");
    } else {
      results.push("syncHiveBlocks already exists");
    }

    // Cleanup Old Records - Daily at midnight UTC
    if (!existingNames.includes("cleanupOldRecords")) {
      await crons.register(
        ctx,
        { kind: "cron", cronspec: "0 0 * * *" },
        internal.hiveFetcher.cleanupOldRecords,
        {},
        "cleanupOldRecords"
      );
      results.push("Registered cleanupOldRecords");
    } else {
      results.push("cleanupOldRecords already exists");
    }

    return { success: true, results };
  },
});

/**
 * List all registered cron jobs
 */
export const listCrons = query({
  args: {},
  handler: async (ctx) => {
    return await crons.list(ctx);
  },
});

/**
 * Delete all Hive-related cron jobs
 */
export const deleteHiveCrons = mutation({
  args: {},
  handler: async (ctx) => {
    const jobs = await crons.list(ctx);
    const hiveJobs = jobs.filter(
      (job) =>
        job.name === "fetchHiveBlocks" ||
        job.name === "processHiveBlocks" ||
        job.name === "syncHiveBlocks" ||
        job.name === "cleanupOldRecords"
    );

    for (const job of hiveJobs) {
      await crons.delete(ctx, { id: job.id });
    }

    return { deleted: hiveJobs.length };
  },
});

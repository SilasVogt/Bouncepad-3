import { v } from "convex/values";
import {
  query,
  mutation,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { components } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { Workpool } from "@convex-dev/workpool";
import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";

// =============================================================================
// CONSTANTS
// =============================================================================

const THREE_MINUTES_MS = 3 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

// =============================================================================
// WORKPOOL INSTANCES
// =============================================================================

export const rssHighPool = new Workpool(components.rssHighPriority, {
  maxParallelism: 8,
});

export const rssMediumPool = new Workpool(components.rssMediumPriority, {
  maxParallelism: 6,
});

export const rssLowPool = new Workpool(components.rssLowPriority, {
  maxParallelism: 4,
});

// =============================================================================
// RATE LIMITER
// =============================================================================

const rateLimiter = new RateLimiter(components.rateLimiter, {
  manualParseByUser: {
    kind: "token bucket",
    rate: 5,
    period: HOUR,
    capacity: 5,
  },
  manualParseByCreator: {
    kind: "token bucket",
    rate: 20,
    period: HOUR,
    capacity: 20,
  },
  manualParseByAdmin: {
    kind: "token bucket",
    rate: 100,
    period: HOUR,
    capacity: 100,
  },
});

// =============================================================================
// HELPER QUERIES (INTERNAL)
// =============================================================================

/**
 * Check if feedUrl has a recent parse job (within last 3 minutes)
 * Used for LOW priority debouncing - avoids expensive search index
 */
export const hasRecentParseJob = internalQuery({
  args: {
    feedUrl: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const threeMinutesAgo = Date.now() - THREE_MINUTES_MS;

    // Check for any recent job for this feedUrl (any status except discarded)
    // Uses by_feed_url_status index - check waiting first (most common case)
    const waitingJob = await ctx.db
      .query("parse_jobs")
      .withIndex("by_feed_url_status", (q) =>
        q.eq("feedUrl", args.feedUrl).eq("status", "waiting")
      )
      .first();

    if (waitingJob && waitingJob.createdAt > threeMinutesAgo) {
      return true;
    }

    // Check in_progress
    const inProgressJob = await ctx.db
      .query("parse_jobs")
      .withIndex("by_feed_url_status", (q) =>
        q.eq("feedUrl", args.feedUrl).eq("status", "in_progress")
      )
      .first();

    if (inProgressJob && inProgressJob.createdAt > threeMinutesAgo) {
      return true;
    }

    // Check recently finished
    const finishedJob = await ctx.db
      .query("parse_jobs")
      .withIndex("by_feed_url_status", (q) =>
        q.eq("feedUrl", args.feedUrl).eq("status", "finished")
      )
      .first();

    if (finishedJob && finishedJob.updatedAt > threeMinutesAgo) {
      return true;
    }

    return false;
  },
});

/**
 * Lookup hasGoneLive status for a podcast by feedUrl
 */
export const getPodcastHasGoneLive = internalQuery({
  args: {
    feedUrl: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const podcast = await ctx.db
      .query("podcasts")
      .withIndex("by_feed_url", (q) => q.eq("feedUrl", args.feedUrl))
      .first();

    return podcast?.hasGoneLive ?? false;
  },
});

/**
 * Find existing waiting job for a feedUrl (for dedup)
 */
export const getExistingWaitingJob = internalQuery({
  args: {
    feedUrl: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"parse_jobs"> | null> => {
    return await ctx.db
      .query("parse_jobs")
      .withIndex("by_feed_url_status", (q) =>
        q.eq("feedUrl", args.feedUrl).eq("status", "waiting")
      )
      .first();
  },
});

/**
 * Get unprocessed podping histories for scheduling
 * Only returns podpings from the last hour to avoid processing old backlog
 * Uses by_created index for efficiency
 */
export const getUnprocessedPodpingsForScheduling = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"podping_histories">[]> => {
    const limit = args.limit ?? 100;
    const oneHourAgo = Date.now() - ONE_HOUR_MS;

    // Use by_created index to get recent records, then filter on processed
    return await ctx.db
      .query("podping_histories")
      .withIndex("by_created", (q) => q.gt("createdAt", oneHourAgo))
      .filter((q) => q.neq(q.field("processed"), true))
      .take(limit);
  },
});

/**
 * Get waiting jobs by priority for dispatch
 */
export const getWaitingJobsByPriority = internalQuery({
  args: {
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"parse_jobs">[]> => {
    const limit = args.limit ?? 50;

    return await ctx.db
      .query("parse_jobs")
      .withIndex("by_status_priority", (q) =>
        q.eq("status", "waiting").eq("priority", args.priority)
      )
      .take(limit);
  },
});

/**
 * Get old parse jobs for cleanup (older than 10 days)
 */
export const getOldParseJobsForCleanup = internalQuery({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Doc<"parse_jobs">[]> => {
    const limit = args.limit ?? 100;
    const cutoff = Date.now() - TEN_DAYS_MS;

    return await ctx.db
      .query("parse_jobs")
      .withIndex("by_created", (q) => q.lt("createdAt", cutoff))
      .take(limit);
  },
});

// =============================================================================
// MUTATIONS (INTERNAL)
// =============================================================================

/**
 * Create a parse job with dedup logic for LOW priority
 * Returns { jobId, deduplicated }
 */
export const createParseJob = internalMutation({
  args: {
    feedUrl: v.string(),
    blockNumbers: v.optional(v.array(v.number())),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    reason: v.union(
      v.literal("auto"),
      v.literal("podping"),
      v.literal("manual_by_user"),
      v.literal("manual_by_admin"),
      v.literal("manual_by_creator")
    ),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ jobId: Id<"parse_jobs">; deduplicated: boolean }> => {
    const now = Date.now();

    // For LOW priority, check for existing waiting job to deduplicate
    if (args.priority === "low") {
      const existingJob = await ctx.db
        .query("parse_jobs")
        .withIndex("by_feed_url_status", (q) =>
          q.eq("feedUrl", args.feedUrl).eq("status", "waiting")
        )
        .first();

      if (existingJob) {
        // Merge blockNumbers if provided
        const mergedBlockNumbers = args.blockNumbers
          ? [
              ...new Set([
                ...(existingJob.blockNumbers ?? []),
                ...args.blockNumbers,
              ]),
            ]
          : existingJob.blockNumbers;

        await ctx.db.patch(existingJob._id, {
          blockNumbers: mergedBlockNumbers,
          updatedAt: now,
        });

        return { jobId: existingJob._id, deduplicated: true };
      }
    }

    // Create new job
    const jobId = await ctx.db.insert("parse_jobs", {
      feedUrl: args.feedUrl,
      blockNumbers: args.blockNumbers,
      priority: args.priority,
      reason: args.reason,
      status: "waiting",
      createdAt: now,
      updatedAt: now,
    });

    return { jobId, deduplicated: false };
  },
});

/**
 * Mark multiple podping histories as processed
 */
export const markPodpingsProcessed = internalMutation({
  args: {
    ids: v.array(v.id("podping_histories")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const id of args.ids) {
      await ctx.db.patch(id, {
        processed: true,
        processedAt: now,
      });
    }
  },
});

/**
 * Mark old unprocessed podpings as processed (cleanup)
 * Run this to clean up historical backlog:
 *   npx convex run parseScheduler:markOldPodpingsProcessed
 */
export const markOldPodpingsProcessed = mutation({
  args: {
    olderThanHours: v.optional(v.number()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.olderThanHours ?? 1;
    const batchSize = args.batchSize ?? 500;
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const now = Date.now();

    const oldPodpings = await ctx.db
      .query("podping_histories")
      .filter((q) =>
        q.and(
          q.neq(q.field("processed"), true),
          q.lt(q.field("createdAt"), cutoff)
        )
      )
      .take(batchSize);

    for (const podping of oldPodpings) {
      await ctx.db.patch(podping._id, {
        processed: true,
        processedAt: now,
      });
    }

    return {
      marked: oldPodpings.length,
      hasMore: oldPodpings.length === batchSize,
    };
  },
});

/**
 * Migration: Change thrown_out jobs to discarded
 * One-time use: npx convex run parseScheduler:migrateThrownOutToDiscarded
 */
export const migrateThrownOutToDiscarded = mutation({
  args: {},
  handler: async (ctx) => {
    const thrownOutJobs = await ctx.db
      .query("parse_jobs")
      .withIndex("by_status", (q) => q.eq("status", "thrown_out"))
      .take(1000);

    const now = Date.now();
    for (const job of thrownOutJobs) {
      await ctx.db.patch(job._id, { status: "discarded", updatedAt: now });
    }

    return { updated: thrownOutJobs.length };
  },
});

/**
 * Discard old waiting parse jobs (cleanup)
 * Run this to clean up jobs created from old backlog:
 *   npx convex run parseScheduler:discardOldWaitingJobs
 */
export const discardOldWaitingJobs = mutation({
  args: {
    olderThanHours: v.optional(v.number()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.olderThanHours ?? 1;
    const batchSize = args.batchSize ?? 500;
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const now = Date.now();

    const oldJobs = await ctx.db
      .query("parse_jobs")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .take(batchSize);

    for (const job of oldJobs) {
      await ctx.db.patch(job._id, {
        status: "discarded",
        updatedAt: now,
      });
    }

    return {
      discarded: oldJobs.length,
      hasMore: oldJobs.length === batchSize,
    };
  },
});

/**
 * Update parse job status
 */
export const updateParseJobStatus = internalMutation({
  args: {
    jobId: v.id("parse_jobs"),
    status: v.union(
      v.literal("waiting"),
      v.literal("in_progress"),
      v.literal("thrown_out"), // Skipped due to 3-min debounce
      v.literal("discarded"), // Manually discarded during cleanup
      v.literal("finished"),
      v.literal("errored")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: {
      status: typeof args.status;
      updatedAt: number;
      errorMessage?: string;
    } = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.errorMessage !== undefined) {
      updates.errorMessage = args.errorMessage;
    }

    await ctx.db.patch(args.jobId, updates);
  },
});

/**
 * Delete old parse jobs (older than 10 days)
 */
export const cleanupOldParseJobs = internalMutation({
  args: {
    ids: v.array(v.id("parse_jobs")),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
    return args.ids.length;
  },
});

/**
 * Workpool onComplete callback - update job status based on result
 *
 * The result can be:
 * - Direct return value: { success: true, feedUrl: string, ... }
 * - Workpool wrapped: { kind: "success", returnValue: {...} } or { kind: "failed", error: string }
 * - null/undefined if action threw
 */
export const onRssParseComplete = internalMutation({
  args: {
    workId: v.string(), // Required by workpool
    result: v.any(),
    context: v.object({
      parseJobId: v.id("parse_jobs"),
    }),
  },
  handler: async (ctx, args) => {
    const { parseJobId } = args.context;
    const rawResult = args.result;

    // Handle workpool wrapped result format
    type WrappedResult =
      | { kind: "success"; returnValue: { success?: boolean; error?: string } }
      | { kind: "failed"; error: string }
      | { kind: "canceled" };

    let isSuccess = false;
    let errorMessage: string | undefined;

    if (rawResult && typeof rawResult === "object") {
      // Check for workpool wrapped format
      if ("kind" in rawResult) {
        const wrapped = rawResult as WrappedResult;
        if (wrapped.kind === "success") {
          // Check nested returnValue for success flag
          isSuccess = wrapped.returnValue?.success ?? true;
          errorMessage = wrapped.returnValue?.error;
        } else if (wrapped.kind === "failed") {
          isSuccess = false;
          errorMessage = wrapped.error;
        } else if (wrapped.kind === "canceled") {
          isSuccess = false;
          errorMessage = "Job was canceled";
        }
      } else if ("success" in rawResult) {
        // Direct return value format
        isSuccess = rawResult.success === true;
        errorMessage = rawResult.error;
      }
    }

    if (isSuccess) {
      await ctx.db.patch(parseJobId, {
        status: "finished",
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(parseJobId, {
        status: "errored",
        errorMessage: errorMessage ?? "Unknown error",
        updatedAt: Date.now(),
      });
    }
  },
});

// =============================================================================
// MAIN SCHEDULING ACTION (INTERNAL)
// =============================================================================

/**
 * Main scheduling action - runs every 5 seconds via cron
 * 1. Get unprocessed podping_histories
 * 2. Determine priority for each feed URL
 * 3. Create parse jobs (with dedup for LOW)
 * 4. Mark podpings as processed
 * 5. Dispatch waiting jobs to workpools
 * 6. Occasional cleanup
 */
export const scheduleParse = internalAction({
  args: {},
  handler: async (ctx) => {
    // Step 1: Get unprocessed podpings
    const unprocessedPodpings = (await ctx.runQuery(
      internal.parseScheduler.getUnprocessedPodpingsForScheduling,
      { limit: 100 }
    )) as Doc<"podping_histories">[];

    const processedPodpingIds: Id<"podping_histories">[] = [];
    const jobsCreated: { feedUrl: string; priority: string; deduplicated: boolean }[] = [];

    // Step 2 & 3: Process each podping and create jobs
    let thrownOutCount = 0;

    for (const podping of unprocessedPodpings) {
      const isLiveOrLiveEnd =
        podping.reason === "live" || podping.reason === "liveEnd";

      for (const feedUrl of podping.feedUrls) {
        let priority: "high" | "medium" | "low";
        let shouldThrowOut = false;

        if (isLiveOrLiveEnd) {
          // live/liveEnd -> HIGH priority (no debounce)
          priority = "high";
        } else {
          // update -> check hasGoneLive
          const hasGoneLive = await ctx.runQuery(
            internal.parseScheduler.getPodcastHasGoneLive,
            { feedUrl }
          );

          if (hasGoneLive) {
            // Podcast has gone live before -> MEDIUM priority (no debounce)
            priority = "medium";
          } else {
            // Regular podcast -> LOW priority with 3-min debounce
            priority = "low";

            // Check if there's already a recent job for this feed
            const hasRecentJob = await ctx.runQuery(
              internal.parseScheduler.hasRecentParseJob,
              { feedUrl }
            );

            if (hasRecentJob) {
              shouldThrowOut = true;
              thrownOutCount++;
            }
          }
        }

        if (!shouldThrowOut) {
          const { deduplicated } = (await ctx.runMutation(
            internal.parseScheduler.createParseJob,
            {
              feedUrl,
              blockNumbers: [podping.blockNumber],
              priority,
              reason: "podping",
            }
          )) as { jobId: Id<"parse_jobs">; deduplicated: boolean };

          jobsCreated.push({ feedUrl, priority, deduplicated });
        }
      }

      processedPodpingIds.push(podping._id);
    }

    // Step 4: Mark podpings as processed
    if (processedPodpingIds.length > 0) {
      await ctx.runMutation(internal.parseScheduler.markPodpingsProcessed, {
        ids: processedPodpingIds,
      });
    }

    // Step 5: Dispatch waiting jobs to workpools
    const dispatchResults = {
      high: 0,
      medium: 0,
      low: 0,
    };

    // Dispatch HIGH priority jobs
    const highJobs = (await ctx.runQuery(
      internal.parseScheduler.getWaitingJobsByPriority,
      { priority: "high", limit: 20 }
    )) as Doc<"parse_jobs">[];

    for (const job of highJobs) {
      await ctx.runMutation(internal.parseScheduler.updateParseJobStatus, {
        jobId: job._id,
        status: "in_progress",
      });

      await rssHighPool.enqueueAction(
        ctx,
        internal.rssFetcher.fetchAndParseRss,
        { parseJobId: job._id, feedUrl: job.feedUrl },
        {
          onComplete: internal.parseScheduler.onRssParseComplete,
          context: { parseJobId: job._id },
        }
      );
      dispatchResults.high++;
    }

    // Dispatch MEDIUM priority jobs
    const mediumJobs = (await ctx.runQuery(
      internal.parseScheduler.getWaitingJobsByPriority,
      { priority: "medium", limit: 15 }
    )) as Doc<"parse_jobs">[];

    for (const job of mediumJobs) {
      await ctx.runMutation(internal.parseScheduler.updateParseJobStatus, {
        jobId: job._id,
        status: "in_progress",
      });

      await rssMediumPool.enqueueAction(
        ctx,
        internal.rssFetcher.fetchAndParseRss,
        { parseJobId: job._id, feedUrl: job.feedUrl },
        {
          onComplete: internal.parseScheduler.onRssParseComplete,
          context: { parseJobId: job._id },
        }
      );
      dispatchResults.medium++;
    }

    // Dispatch LOW priority jobs
    const lowJobs = (await ctx.runQuery(
      internal.parseScheduler.getWaitingJobsByPriority,
      { priority: "low", limit: 10 }
    )) as Doc<"parse_jobs">[];

    for (const job of lowJobs) {
      await ctx.runMutation(internal.parseScheduler.updateParseJobStatus, {
        jobId: job._id,
        status: "in_progress",
      });

      await rssLowPool.enqueueAction(
        ctx,
        internal.rssFetcher.fetchAndParseRss,
        { parseJobId: job._id, feedUrl: job.feedUrl },
        {
          onComplete: internal.parseScheduler.onRssParseComplete,
          context: { parseJobId: job._id },
        }
      );
      dispatchResults.low++;
    }

    // Step 6: Occasional cleanup (~1/day probability at 5s intervals = 1/17280)
    // We'll run cleanup roughly every hour instead for practicality
    const shouldCleanup = Math.random() < 1 / 720; // ~1/hour at 5s intervals
    let cleanedUp = 0;

    if (shouldCleanup) {
      const oldJobs = (await ctx.runQuery(
        internal.parseScheduler.getOldParseJobsForCleanup,
        { limit: 100 }
      )) as Doc<"parse_jobs">[];

      if (oldJobs.length > 0) {
        cleanedUp = await ctx.runMutation(
          internal.parseScheduler.cleanupOldParseJobs,
          { ids: oldJobs.map((j) => j._id) }
        );
      }
    }

    return {
      podpingsProcessed: processedPodpingIds.length,
      jobsCreated: jobsCreated.length,
      thrownOut: thrownOutCount,
      dispatched: dispatchResults,
      cleanedUp,
    };
  },
});

// =============================================================================
// PUBLIC MUTATION - Manual trigger
// =============================================================================

/**
 * Manually add a feed URL to the parse schedule
 * Rate limited based on reason
 */
export const addToSchedule = mutation({
  args: {
    feedUrl: v.string(),
    reason: v.union(
      v.literal("manual_by_user"),
      v.literal("manual_by_admin"),
      v.literal("manual_by_creator")
    ),
    priorityOverride: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low"))
    ),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user for rate limiting key
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check admin permission for admin reason
    if (args.reason === "manual_by_admin") {
      if (!user.roles?.includes("admin")) {
        throw new Error("Admin access required");
      }
    }

    // Determine rate limit name based on reason
    const limitName =
      args.reason === "manual_by_admin"
        ? "manualParseByAdmin"
        : args.reason === "manual_by_creator"
          ? "manualParseByCreator"
          : "manualParseByUser";

    // Check rate limit
    const { ok, retryAfter } = await rateLimiter.limit(ctx, limitName, {
      key: user._id,
    });

    if (!ok) {
      throw new Error(
        `Rate limited. Try again in ${Math.ceil(retryAfter / 1000)}s`
      );
    }

    // Manual requests default to HIGH priority unless overridden
    const priority = args.priorityOverride ?? "high";

    const now = Date.now();

    // Check for existing waiting job
    const existingJob = await ctx.db
      .query("parse_jobs")
      .withIndex("by_feed_url_status", (q) =>
        q.eq("feedUrl", args.feedUrl).eq("status", "waiting")
      )
      .first();

    if (existingJob) {
      // Job already exists - update if new priority is higher
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[priority] > priorityOrder[existingJob.priority]) {
        await ctx.db.patch(existingJob._id, {
          priority,
          reason: args.reason,
          updatedAt: now,
        });
      }
      return { jobId: existingJob._id, deduplicated: true };
    }

    // Create new job
    const jobId = await ctx.db.insert("parse_jobs", {
      feedUrl: args.feedUrl,
      priority,
      reason: args.reason,
      status: "waiting",
      createdAt: now,
      updatedAt: now,
    });

    return { jobId, deduplicated: false };
  },
});

// =============================================================================
// PUBLIC QUERY - Queue status for admin dashboard
// =============================================================================

/**
 * Get queue status for admin dashboard
 * Uses take() with limits to avoid 32k document read limit
 */
export const getQueueStatus = query({
  args: {},
  handler: async (ctx) => {
    const SAMPLE_LIMIT = 1000; // Sample size for counting

    // Count waiting jobs by priority (sample up to 1000)
    const waitingHigh = await ctx.db
      .query("parse_jobs")
      .withIndex("by_status_priority", (q) =>
        q.eq("status", "waiting").eq("priority", "high")
      )
      .take(SAMPLE_LIMIT);

    const waitingMedium = await ctx.db
      .query("parse_jobs")
      .withIndex("by_status_priority", (q) =>
        q.eq("status", "waiting").eq("priority", "medium")
      )
      .take(SAMPLE_LIMIT);

    const waitingLow = await ctx.db
      .query("parse_jobs")
      .withIndex("by_status_priority", (q) =>
        q.eq("status", "waiting").eq("priority", "low")
      )
      .take(SAMPLE_LIMIT);

    // Count in_progress jobs
    const inProgress = await ctx.db
      .query("parse_jobs")
      .withIndex("by_status", (q) => q.eq("status", "in_progress"))
      .take(SAMPLE_LIMIT);

    // Get recent errored jobs
    const errored = await ctx.db
      .query("parse_jobs")
      .withIndex("by_status", (q) => q.eq("status", "errored"))
      .take(20);

    // Get recent finished jobs for stats
    const recentFinished = await ctx.db
      .query("parse_jobs")
      .withIndex("by_status", (q) => q.eq("status", "finished"))
      .order("desc")
      .take(10);

    // Format counts - show "1000+" if at limit
    const formatCount = (arr: unknown[]) =>
      arr.length >= SAMPLE_LIMIT ? `${SAMPLE_LIMIT}+` : arr.length;

    return {
      waiting: {
        high: formatCount(waitingHigh),
        medium: formatCount(waitingMedium),
        low: formatCount(waitingLow),
        total:
          waitingHigh.length + waitingMedium.length + waitingLow.length >=
          SAMPLE_LIMIT
            ? `${waitingHigh.length + waitingMedium.length + waitingLow.length}+`
            : waitingHigh.length + waitingMedium.length + waitingLow.length,
      },
      inProgress: formatCount(inProgress),
      errored: {
        count: errored.length,
        recent: errored.map((j) => ({
          _id: j._id,
          feedUrl: j.feedUrl,
          errorMessage: j.errorMessage,
          createdAt: j.createdAt,
        })),
      },
      recentFinished: recentFinished.map((j) => ({
        _id: j._id,
        feedUrl: j.feedUrl,
        priority: j.priority,
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
      })),
    };
  },
});

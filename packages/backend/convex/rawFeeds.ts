import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a raw feed by ID
export const get = query({
  args: { id: v.id("raw_feeds") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List raw feeds by status
export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("parsing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("raw_feeds")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("asc")
      .take(limit);
  },
});

// List pending raw feeds (for parser to pick up)
export const listPending = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("raw_feeds")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("asc")
      .take(limit);
  },
});

// Get by feed URL
export const getByFeedUrl = query({
  args: { feedUrl: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("raw_feeds")
      .withIndex("by_feed_url", (q) => q.eq("feedUrl", args.feedUrl))
      .order("desc")
      .first();
  },
});

// Create a new raw feed entry
export const create = mutation({
  args: {
    feedUrl: v.string(),
    podcastId: v.optional(v.id("podcasts")),
    rawXml: v.string(),
    contentHash: v.optional(v.string()),
    httpStatus: v.optional(v.number()),
    httpEtag: v.optional(v.string()),
    httpLastModified: v.optional(v.string()),
    triggerReason: v.optional(
      v.union(
        v.literal("podping_live"),
        v.literal("podping_liveEnd"),
        v.literal("podping_update"),
        v.literal("scheduled_refresh"),
        v.literal("manual")
      )
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("raw_feeds", {
      feedUrl: args.feedUrl,
      podcastId: args.podcastId,
      rawXml: args.rawXml,
      contentHash: args.contentHash,
      httpStatus: args.httpStatus,
      httpEtag: args.httpEtag,
      httpLastModified: args.httpLastModified,
      status: "pending",
      triggerReason: args.triggerReason,
      fetchedAt: Date.now(),
    });
  },
});

// Mark as parsing (claim for processing)
export const markParsing = mutation({
  args: { id: v.id("raw_feeds") },
  handler: async (ctx, args) => {
    const rawFeed = await ctx.db.get(args.id);
    if (!rawFeed) {
      throw new Error("Raw feed not found");
    }

    if (rawFeed.status !== "pending") {
      throw new Error("Raw feed is not pending");
    }

    return await ctx.db.patch(args.id, {
      status: "parsing",
    });
  },
});

// Mark as completed
export const markCompleted = mutation({
  args: {
    id: v.id("raw_feeds"),
    podcastId: v.optional(v.id("podcasts")),
  },
  handler: async (ctx, args) => {
    const rawFeed = await ctx.db.get(args.id);
    if (!rawFeed) {
      throw new Error("Raw feed not found");
    }

    return await ctx.db.patch(args.id, {
      status: "completed",
      podcastId: args.podcastId ?? rawFeed.podcastId,
      parsedAt: Date.now(),
    });
  },
});

// Mark as failed
export const markFailed = mutation({
  args: {
    id: v.id("raw_feeds"),
    parseError: v.string(),
  },
  handler: async (ctx, args) => {
    const rawFeed = await ctx.db.get(args.id);
    if (!rawFeed) {
      throw new Error("Raw feed not found");
    }

    const parseAttempts = (rawFeed.parseAttempts ?? 0) + 1;

    return await ctx.db.patch(args.id, {
      status: "failed",
      parseError: args.parseError,
      parseAttempts,
    });
  },
});

// Retry a failed raw feed
export const retry = mutation({
  args: { id: v.id("raw_feeds") },
  handler: async (ctx, args) => {
    const rawFeed = await ctx.db.get(args.id);
    if (!rawFeed) {
      throw new Error("Raw feed not found");
    }

    if (rawFeed.status !== "failed") {
      throw new Error("Raw feed is not failed");
    }

    return await ctx.db.patch(args.id, {
      status: "pending",
      parseError: undefined,
    });
  },
});

// Delete old completed raw feeds (cleanup)
export const cleanupOld = mutation({
  args: {
    olderThanMs: v.number(), // e.g., 7 * 24 * 60 * 60 * 1000 for 7 days
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanMs;
    const oldFeeds = await ctx.db
      .query("raw_feeds")
      .withIndex("by_fetched")
      .filter((q) =>
        q.and(
          q.lt(q.field("fetchedAt"), cutoff),
          q.eq(q.field("status"), "completed")
        )
      )
      .take(100);

    for (const feed of oldFeeds) {
      await ctx.db.delete(feed._id);
    }

    return oldFeeds.length;
  },
});

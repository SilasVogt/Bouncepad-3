import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// =============================================================================
// REPORTS
// =============================================================================

// Get a report by ID
export const getReport = query({
  args: { id: v.id("reports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List reports by status
export const listReportsByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .take(limit);
  },
});

// List reports by reporter
export const listReportsByReporter = query({
  args: {
    reporterId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("reports")
      .withIndex("by_reporter", (q) => q.eq("reporterId", args.reporterId))
      .order("desc")
      .take(limit);
  },
});

// Create a report for a podcast
export const reportPodcast = mutation({
  args: {
    reporterId: v.id("users"),
    podcastId: v.id("podcasts"),
    reason: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      reporterId: args.reporterId,
      entityType: "podcast",
      podcastId: args.podcastId,
      reason: args.reason,
      details: args.details,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Create a report for an episode
export const reportEpisode = mutation({
  args: {
    reporterId: v.id("users"),
    episodeId: v.id("episodes"),
    reason: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      reporterId: args.reporterId,
      entityType: "episode",
      episodeId: args.episodeId,
      reason: args.reason,
      details: args.details,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Create a report for a live item
export const reportLiveItem = mutation({
  args: {
    reporterId: v.id("users"),
    liveItemId: v.id("live_items"),
    reason: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      reporterId: args.reporterId,
      entityType: "live_item",
      liveItemId: args.liveItemId,
      reason: args.reason,
      details: args.details,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Review a report
export const reviewReport = mutation({
  args: {
    id: v.id("reports"),
    reviewerId: v.id("users"),
    status: v.union(
      v.literal("reviewed"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.id);
    if (!report) {
      throw new Error("Report not found");
    }

    return await ctx.db.patch(args.id, {
      status: args.status,
      reviewedBy: args.reviewerId,
      reviewedAt: Date.now(),
      resolution: args.resolution,
    });
  },
});

// =============================================================================
// BLOCKED FEEDS
// =============================================================================

// Get a blocked feed by ID
export const getBlockedFeed = query({
  args: { id: v.id("blocked_feeds") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Check if a feed URL is blocked
export const isFeedBlocked = query({
  args: { feedUrl: v.string() },
  handler: async (ctx, args) => {
    const blocked = await ctx.db
      .query("blocked_feeds")
      .withIndex("by_feed_url", (q) => q.eq("feedUrl", args.feedUrl))
      .unique();
    return blocked !== null;
  },
});

// Check if a podcast GUID is blocked
export const isPodcastGuidBlocked = query({
  args: { podcastGuid: v.string() },
  handler: async (ctx, args) => {
    const blocked = await ctx.db
      .query("blocked_feeds")
      .withIndex("by_podcast_guid", (q) => q.eq("podcastGuid", args.podcastGuid))
      .first();
    return blocked !== null;
  },
});

// List all blocked feeds
export const listBlockedFeeds = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db.query("blocked_feeds").order("desc").take(limit);
  },
});

// Block a feed
export const blockFeed = mutation({
  args: {
    feedUrl: v.string(),
    podcastGuid: v.optional(v.string()),
    reason: v.string(),
    blockedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already blocked
    const existing = await ctx.db
      .query("blocked_feeds")
      .withIndex("by_feed_url", (q) => q.eq("feedUrl", args.feedUrl))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("blocked_feeds", {
      feedUrl: args.feedUrl,
      podcastGuid: args.podcastGuid,
      reason: args.reason,
      blockedBy: args.blockedBy,
      createdAt: Date.now(),
    });
  },
});

// Unblock a feed
export const unblockFeed = mutation({
  args: { id: v.id("blocked_feeds") },
  handler: async (ctx, args) => {
    const blockedFeed = await ctx.db.get(args.id);
    if (!blockedFeed) {
      throw new Error("Blocked feed not found");
    }
    await ctx.db.delete(args.id);
  },
});

// =============================================================================
// USER BLOCKS (blocking podcasts)
// =============================================================================

// Check if user blocked a podcast
export const hasUserBlockedPodcast = query({
  args: {
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("blocks")
      .withIndex("by_user_podcast", (q) =>
        q.eq("userId", args.userId).eq("podcastId", args.podcastId)
      )
      .unique();
    return block !== null;
  },
});

// List podcasts blocked by user
export const listUserBlockedPodcasts = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("blocks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Block a podcast (user)
export const blockPodcast = mutation({
  args: {
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already blocked
    const existing = await ctx.db
      .query("blocks")
      .withIndex("by_user_podcast", (q) =>
        q.eq("userId", args.userId).eq("podcastId", args.podcastId)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    // Also unfollow if following
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_user_podcast", (q) =>
        q.eq("userId", args.userId).eq("podcastId", args.podcastId)
      )
      .unique();

    if (follow) {
      await ctx.db.delete(follow._id);
    }

    return await ctx.db.insert("blocks", {
      userId: args.userId,
      podcastId: args.podcastId,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

// Unblock a podcast (user)
export const unblockPodcast = mutation({
  args: {
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("blocks")
      .withIndex("by_user_podcast", (q) =>
        q.eq("userId", args.userId).eq("podcastId", args.podcastId)
      )
      .unique();

    if (block) {
      await ctx.db.delete(block._id);
    }
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// =============================================================================
// SHARE LINKS
// =============================================================================

// Get a share link by ID
export const get = query({
  args: { id: v.id("share_links") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get a share link by UUID
export const getByUuid = query({
  args: { uuid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("share_links")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .unique();
  },
});

// List share links by creator
export const listByCreator = query({
  args: {
    creatorId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("share_links")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .order("desc")
      .take(limit);
  },
});

// Create a share link for a podcast
export const createForPodcast = mutation({
  args: {
    uuid: v.string(),
    creatorId: v.optional(v.id("users")),
    podcastId: v.id("podcasts"),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("share_links", {
      uuid: args.uuid,
      creatorId: args.creatorId,
      entityType: "podcast",
      podcastId: args.podcastId,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });
  },
});

// Create a share link for an episode
export const createForEpisode = mutation({
  args: {
    uuid: v.string(),
    creatorId: v.optional(v.id("users")),
    episodeId: v.id("episodes"),
    timestamp: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("share_links", {
      uuid: args.uuid,
      creatorId: args.creatorId,
      entityType: "episode",
      episodeId: args.episodeId,
      timestamp: args.timestamp,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });
  },
});

// Create a share link for a live item
export const createForLiveItem = mutation({
  args: {
    uuid: v.string(),
    creatorId: v.optional(v.id("users")),
    liveItemId: v.id("live_items"),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("share_links", {
      uuid: args.uuid,
      creatorId: args.creatorId,
      entityType: "live_item",
      liveItemId: args.liveItemId,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });
  },
});

// Delete a share link
export const remove = mutation({
  args: { id: v.id("share_links") },
  handler: async (ctx, args) => {
    const shareLink = await ctx.db.get(args.id);
    if (!shareLink) {
      throw new Error("Share link not found");
    }
    await ctx.db.delete(args.id);
  },
});

// =============================================================================
// SHARE LINK VISITS
// =============================================================================

// Record a visit
export const recordVisit = mutation({
  args: {
    shareLinkId: v.id("share_links"),
    visitorId: v.optional(v.id("users")),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if share link exists and not expired
    const shareLink = await ctx.db.get(args.shareLinkId);
    if (!shareLink) {
      throw new Error("Share link not found");
    }

    if (shareLink.expiresAt && shareLink.expiresAt < Date.now()) {
      throw new Error("Share link has expired");
    }

    return await ctx.db.insert("share_link_visits", {
      shareLinkId: args.shareLinkId,
      visitorId: args.visitorId,
      userAgent: args.userAgent,
      referrer: args.referrer,
      country: args.country,
      createdAt: Date.now(),
    });
  },
});

// List visits for a share link
export const listVisits = query({
  args: {
    shareLinkId: v.id("share_links"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("share_link_visits")
      .withIndex("by_share_link", (q) => q.eq("shareLinkId", args.shareLinkId))
      .order("desc")
      .take(limit);
  },
});

// Get visit count for a share link
export const getVisitCount = query({
  args: {
    shareLinkId: v.id("share_links"),
  },
  handler: async (ctx, args) => {
    const visits = await ctx.db
      .query("share_link_visits")
      .withIndex("by_share_link", (q) => q.eq("shareLinkId", args.shareLinkId))
      .collect();
    return visits.length;
  },
});

// Get share link with visit count
export const getWithVisitCount = query({
  args: {
    uuid: v.string(),
  },
  handler: async (ctx, args) => {
    const shareLink = await ctx.db
      .query("share_links")
      .withIndex("by_uuid", (q) => q.eq("uuid", args.uuid))
      .unique();

    if (!shareLink) {
      return null;
    }

    const visits = await ctx.db
      .query("share_link_visits")
      .withIndex("by_share_link", (q) => q.eq("shareLinkId", shareLink._id))
      .collect();

    return {
      ...shareLink,
      visitCount: visits.length,
    };
  },
});

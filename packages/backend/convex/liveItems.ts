import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a live item by ID
export const get = query({
  args: { id: v.id("live_items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List live items for a podcast
export const listByPodcast = query({
  args: {
    podcastId: v.id("podcasts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("live_items")
      .withIndex("by_podcast", (q) => q.eq("podcastId", args.podcastId))
      .order("desc")
      .take(limit);
  },
});

// List live items by status
export const listByStatus = query({
  args: {
    liveStatus: v.union(
      v.literal("pending"),
      v.literal("live"),
      v.literal("ended")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("live_items")
      .withIndex("by_live_status", (q) => q.eq("liveStatus", args.liveStatus))
      .order("desc")
      .take(limit);
  },
});

// List currently live items
export const listLive = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("live_items")
      .withIndex("by_live_status", (q) => q.eq("liveStatus", "live"))
      .order("desc")
      .take(limit);
  },
});

// List pending (scheduled) live items
export const listScheduled = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("live_items")
      .withIndex("by_live_status_schedule", (q) => q.eq("liveStatus", "pending"))
      .order("asc")
      .take(limit);
  },
});

// Create a new live item
export const create = mutation({
  args: {
    podcastId: v.id("podcasts"),
    guid: v.string(),
    liveStatus: v.union(
      v.literal("pending"),
      v.literal("live"),
      v.literal("ended")
    ),
    title: v.string(),
    offlineOverride: v.optional(v.boolean()),
    scheduleDatetime: v.optional(v.number()),
    endDatetime: v.optional(v.number()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    liveValue: v.optional(v.boolean()),
    liveValueProtocol: v.optional(v.string()),
    socialInteract: v.optional(
      v.array(
        v.object({
          uri: v.string(),
          protocol: v.string(),
          accountId: v.optional(v.string()),
          accountUrl: v.optional(v.string()),
        })
      )
    ),
    chatUrl: v.optional(v.string()),
    chatChannel: v.optional(v.string()),
    chatType: v.optional(v.string()),
    accountId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("live_items", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a live item
export const update = mutation({
  args: {
    id: v.id("live_items"),
    liveStatus: v.optional(
      v.union(v.literal("pending"), v.literal("live"), v.literal("ended"))
    ),
    title: v.optional(v.string()),
    offlineOverride: v.optional(v.boolean()),
    scheduleDatetime: v.optional(v.number()),
    endDatetime: v.optional(v.number()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    liveValue: v.optional(v.boolean()),
    liveValueProtocol: v.optional(v.string()),
    socialInteract: v.optional(
      v.array(
        v.object({
          uri: v.string(),
          protocol: v.string(),
          accountId: v.optional(v.string()),
          accountUrl: v.optional(v.string()),
        })
      )
    ),
    chatUrl: v.optional(v.string()),
    chatChannel: v.optional(v.string()),
    chatType: v.optional(v.string()),
    accountId: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const liveItem = await ctx.db.get(id);
    if (!liveItem) {
      throw new Error("Live item not found");
    }

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Mark a live item as live
export const goLive = mutation({
  args: { id: v.id("live_items") },
  handler: async (ctx, args) => {
    const liveItem = await ctx.db.get(args.id);
    if (!liveItem) {
      throw new Error("Live item not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      liveStatus: "live",
      startedAt: now,
      updatedAt: now,
    });

    // Also mark the podcast as having gone live
    const podcast = await ctx.db.get(liveItem.podcastId);
    if (podcast && !podcast.hasGoneLive) {
      await ctx.db.patch(liveItem.podcastId, {
        hasGoneLive: true,
        updatedAt: now,
      });
    }
  },
});

// Mark a live item as ended
export const endLive = mutation({
  args: { id: v.id("live_items") },
  handler: async (ctx, args) => {
    const liveItem = await ctx.db.get(args.id);
    if (!liveItem) {
      throw new Error("Live item not found");
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      liveStatus: "ended",
      endedAt: now,
      updatedAt: now,
    });
  },
});

// Delete a live item
export const remove = mutation({
  args: { id: v.id("live_items") },
  handler: async (ctx, args) => {
    const liveItem = await ctx.db.get(args.id);
    if (!liveItem) {
      throw new Error("Live item not found");
    }
    await ctx.db.delete(args.id);
  },
});

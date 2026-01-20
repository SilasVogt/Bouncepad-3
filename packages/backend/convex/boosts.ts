import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a boost by ID
export const get = query({
  args: { id: v.id("boosts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List boosts by user
export const listByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("boosts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// List boosts for an episode
export const listByEpisode = query({
  args: {
    episodeId: v.id("episodes"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("boosts")
      .withIndex("by_episode", (q) =>
        q.eq("entityType", "episode").eq("episodeId", args.episodeId)
      )
      .order("desc")
      .take(limit);
  },
});

// List boosts for a live item
export const listByLiveItem = query({
  args: {
    liveItemId: v.id("live_items"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("boosts")
      .withIndex("by_live_item", (q) =>
        q.eq("entityType", "live_item").eq("liveItemId", args.liveItemId)
      )
      .order("desc")
      .take(limit);
  },
});

// Create a boost for an episode
export const createForEpisode = mutation({
  args: {
    userId: v.id("users"),
    episodeId: v.id("episodes"),
    amount: v.number(),
    message: v.optional(v.string()),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("boosts", {
      userId: args.userId,
      entityType: "episode",
      episodeId: args.episodeId,
      amount: args.amount,
      message: args.message,
      timestamp: args.timestamp,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Create a boost for a live item
export const createForLiveItem = mutation({
  args: {
    userId: v.id("users"),
    liveItemId: v.id("live_items"),
    amount: v.number(),
    message: v.optional(v.string()),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("boosts", {
      userId: args.userId,
      entityType: "live_item",
      liveItemId: args.liveItemId,
      amount: args.amount,
      message: args.message,
      timestamp: args.timestamp,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Update boost status (after payment processing)
export const updateStatus = mutation({
  args: {
    id: v.id("boosts"),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    paymentHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const boost = await ctx.db.get(args.id);
    if (!boost) {
      throw new Error("Boost not found");
    }

    return await ctx.db.patch(args.id, {
      status: args.status,
      paymentHash: args.paymentHash,
    });
  },
});

// Mark boost as completed
export const markCompleted = mutation({
  args: {
    id: v.id("boosts"),
    paymentHash: v.string(),
  },
  handler: async (ctx, args) => {
    const boost = await ctx.db.get(args.id);
    if (!boost) {
      throw new Error("Boost not found");
    }

    return await ctx.db.patch(args.id, {
      status: "completed",
      paymentHash: args.paymentHash,
    });
  },
});

// Mark boost as failed
export const markFailed = mutation({
  args: { id: v.id("boosts") },
  handler: async (ctx, args) => {
    const boost = await ctx.db.get(args.id);
    if (!boost) {
      throw new Error("Boost not found");
    }

    return await ctx.db.patch(args.id, {
      status: "failed",
    });
  },
});

// Get total boost amount for an episode
export const getTotalForEpisode = query({
  args: {
    episodeId: v.id("episodes"),
  },
  handler: async (ctx, args) => {
    const boosts = await ctx.db
      .query("boosts")
      .withIndex("by_episode", (q) =>
        q.eq("entityType", "episode").eq("episodeId", args.episodeId)
      )
      .collect();

    const completedBoosts = boosts.filter((b) => b.status === "completed");
    return completedBoosts.reduce((sum, boost) => sum + boost.amount, 0);
  },
});

// Get total boost amount for a live item
export const getTotalForLiveItem = query({
  args: {
    liveItemId: v.id("live_items"),
  },
  handler: async (ctx, args) => {
    const boosts = await ctx.db
      .query("boosts")
      .withIndex("by_live_item", (q) =>
        q.eq("entityType", "live_item").eq("liveItemId", args.liveItemId)
      )
      .collect();

    const completedBoosts = boosts.filter((b) => b.status === "completed");
    return completedBoosts.reduce((sum, boost) => sum + boost.amount, 0);
  },
});

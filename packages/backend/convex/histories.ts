import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a history entry by ID
export const get = query({
  args: { id: v.id("histories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get user's history for an episode
export const getByUserAndEpisode = query({
  args: {
    userId: v.id("users"),
    episodeId: v.id("episodes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("histories")
      .withIndex("by_user_episode", (q) =>
        q
          .eq("userId", args.userId)
          .eq("entityType", "episode")
          .eq("episodeId", args.episodeId)
      )
      .unique();
  },
});

// Get user's history for a live item
export const getByUserAndLiveItem = query({
  args: {
    userId: v.id("users"),
    liveItemId: v.id("live_items"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("histories")
      .withIndex("by_user_live_item", (q) =>
        q
          .eq("userId", args.userId)
          .eq("entityType", "live_item")
          .eq("liveItemId", args.liveItemId)
      )
      .unique();
  },
});

// List user's listening history
export const listByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("histories")
      .withIndex("by_user_updated", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Update or create history for an episode
export const upsertEpisode = mutation({
  args: {
    userId: v.id("users"),
    episodeId: v.id("episodes"),
    position: v.number(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("histories")
      .withIndex("by_user_episode", (q) =>
        q
          .eq("userId", args.userId)
          .eq("entityType", "episode")
          .eq("episodeId", args.episodeId)
      )
      .unique();

    const now = Date.now();

    if (existing) {
      // Update existing history
      const updates: Record<string, unknown> = {
        position: args.position,
        updatedAt: now,
      };

      if (args.duration !== undefined) {
        updates.duration = args.duration;
      }

      // Check if completed (90% or more)
      if (args.duration && args.position >= args.duration * 0.9) {
        updates.completed = true;
        updates.completedAt = now;
      }

      return await ctx.db.patch(existing._id, updates);
    } else {
      // Create new history
      return await ctx.db.insert("histories", {
        userId: args.userId,
        entityType: "episode",
        episodeId: args.episodeId,
        position: args.position,
        duration: args.duration,
        startedAt: now,
        updatedAt: now,
      });
    }
  },
});

// Update or create history for a live item
export const upsertLiveItem = mutation({
  args: {
    userId: v.id("users"),
    liveItemId: v.id("live_items"),
    position: v.number(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("histories")
      .withIndex("by_user_live_item", (q) =>
        q
          .eq("userId", args.userId)
          .eq("entityType", "live_item")
          .eq("liveItemId", args.liveItemId)
      )
      .unique();

    const now = Date.now();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        position: args.position,
        duration: args.duration,
        updatedAt: now,
      });
    } else {
      return await ctx.db.insert("histories", {
        userId: args.userId,
        entityType: "live_item",
        liveItemId: args.liveItemId,
        position: args.position,
        duration: args.duration,
        startedAt: now,
        updatedAt: now,
      });
    }
  },
});

// Mark history as completed
export const markCompleted = mutation({
  args: { id: v.id("histories") },
  handler: async (ctx, args) => {
    const history = await ctx.db.get(args.id);
    if (!history) {
      throw new Error("History not found");
    }

    return await ctx.db.patch(args.id, {
      completed: true,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Delete a history entry
export const remove = mutation({
  args: { id: v.id("histories") },
  handler: async (ctx, args) => {
    const history = await ctx.db.get(args.id);
    if (!history) {
      throw new Error("History not found");
    }
    await ctx.db.delete(args.id);
  },
});

// Clear all history for a user
export const clearUserHistory = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const histories = await ctx.db
      .query("histories")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const history of histories) {
      await ctx.db.delete(history._id);
    }

    return histories.length;
  },
});

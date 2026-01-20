import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a follow by ID
export const get = query({
  args: { id: v.id("follows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Check if a user follows a podcast
export const isFollowing = query({
  args: {
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_user_podcast", (q) =>
        q.eq("userId", args.userId).eq("podcastId", args.podcastId)
      )
      .unique();
    return follow !== null;
  },
});

// Get follow relationship between user and podcast
export const getByUserAndPodcast = query({
  args: {
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("follows")
      .withIndex("by_user_podcast", (q) =>
        q.eq("userId", args.userId).eq("podcastId", args.podcastId)
      )
      .unique();
  },
});

// List podcasts a user follows
export const listByUser = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("follows")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// List users following a podcast
export const listByPodcast = query({
  args: {
    podcastId: v.id("podcasts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("follows")
      .withIndex("by_podcast", (q) => q.eq("podcastId", args.podcastId))
      .order("desc")
      .take(limit);
  },
});

// Follow a podcast
export const follow = mutation({
  args: {
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
    notifyOnScheduled: v.optional(v.boolean()),
    notifyBefore10Min: v.optional(v.boolean()),
    notifyOnLive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if already following
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_user_podcast", (q) =>
        q.eq("userId", args.userId).eq("podcastId", args.podcastId)
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("follows", {
      userId: args.userId,
      podcastId: args.podcastId,
      notifyOnScheduled: args.notifyOnScheduled ?? true,
      notifyBefore10Min: args.notifyBefore10Min ?? true,
      notifyOnLive: args.notifyOnLive ?? true,
      createdAt: Date.now(),
    });
  },
});

// Unfollow a podcast
export const unfollow = mutation({
  args: {
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_user_podcast", (q) =>
        q.eq("userId", args.userId).eq("podcastId", args.podcastId)
      )
      .unique();

    if (follow) {
      await ctx.db.delete(follow._id);
    }
  },
});

// Update notification preferences
export const updateNotifications = mutation({
  args: {
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
    notifyOnScheduled: v.optional(v.boolean()),
    notifyBefore10Min: v.optional(v.boolean()),
    notifyOnLive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_user_podcast", (q) =>
        q.eq("userId", args.userId).eq("podcastId", args.podcastId)
      )
      .unique();

    if (!follow) {
      throw new Error("Not following this podcast");
    }

    const updates: Record<string, boolean> = {};
    if (args.notifyOnScheduled !== undefined) {
      updates.notifyOnScheduled = args.notifyOnScheduled;
    }
    if (args.notifyBefore10Min !== undefined) {
      updates.notifyBefore10Min = args.notifyBefore10Min;
    }
    if (args.notifyOnLive !== undefined) {
      updates.notifyOnLive = args.notifyOnLive;
    }

    return await ctx.db.patch(follow._id, updates);
  },
});

// Get followers with notification enabled for a specific event
export const getFollowersForNotification = query({
  args: {
    podcastId: v.id("podcasts"),
    notificationType: v.union(
      v.literal("scheduled"),
      v.literal("before10Min"),
      v.literal("live")
    ),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_podcast", (q) => q.eq("podcastId", args.podcastId))
      .collect();

    // Filter based on notification type
    return follows.filter((follow) => {
      switch (args.notificationType) {
        case "scheduled":
          return follow.notifyOnScheduled;
        case "before10Min":
          return follow.notifyBefore10Min;
        case "live":
          return follow.notifyOnLive;
        default:
          return false;
      }
    });
  },
});

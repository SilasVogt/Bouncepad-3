import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getLive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("streams")
      .withIndex("by_live", (q) => q.eq("isLive", true))
      .collect();
  },
});

export const getByFeed = query({
  args: { feedId: v.id("feeds") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("streams")
      .withIndex("by_feed", (q) => q.eq("feedId", args.feedId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("streams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    feedId: v.id("feeds"),
    title: v.string(),
    description: v.optional(v.string()),
    streamUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    isLive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("streams", {
      ...args,
      startedAt: args.isLive ? Date.now() : undefined,
      createdAt: Date.now(),
    });
  },
});

export const setLiveStatus = mutation({
  args: {
    id: v.id("streams"),
    isLive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { isLive: args.isLive };

    if (args.isLive) {
      updates.startedAt = Date.now();
      updates.endedAt = undefined;
    } else {
      updates.endedAt = Date.now();
    }

    return await ctx.db.patch(args.id, updates);
  },
});

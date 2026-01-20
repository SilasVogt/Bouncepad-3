import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get an enclosure by ID
export const get = query({
  args: { id: v.id("enclosures") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List enclosures for an episode
export const listByEpisode = query({
  args: {
    episodeId: v.id("episodes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enclosures")
      .withIndex("by_episode", (q) =>
        q.eq("entityType", "episode").eq("episodeId", args.episodeId)
      )
      .collect();
  },
});

// List enclosures for a live item
export const listByLiveItem = query({
  args: {
    liveItemId: v.id("live_items"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enclosures")
      .withIndex("by_live_item", (q) =>
        q.eq("entityType", "live_item").eq("liveItemId", args.liveItemId)
      )
      .collect();
  },
});

// List enclosures for a trailer
export const listByTrailer = query({
  args: {
    trailerId: v.id("trailers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enclosures")
      .withIndex("by_trailer", (q) =>
        q.eq("entityType", "trailer").eq("trailerId", args.trailerId)
      )
      .collect();
  },
});

// Get default enclosure for an episode
export const getDefaultForEpisode = query({
  args: {
    episodeId: v.id("episodes"),
  },
  handler: async (ctx, args) => {
    const enclosures = await ctx.db
      .query("enclosures")
      .withIndex("by_episode", (q) =>
        q.eq("entityType", "episode").eq("episodeId", args.episodeId)
      )
      .collect();

    // Return default if exists, otherwise first enclosure
    return (
      enclosures.find((enc) => enc.isDefault) ?? enclosures[0] ?? null
    );
  },
});

// Get default enclosure for a live item
export const getDefaultForLiveItem = query({
  args: {
    liveItemId: v.id("live_items"),
  },
  handler: async (ctx, args) => {
    const enclosures = await ctx.db
      .query("enclosures")
      .withIndex("by_live_item", (q) =>
        q.eq("entityType", "live_item").eq("liveItemId", args.liveItemId)
      )
      .collect();

    return (
      enclosures.find((enc) => enc.isDefault) ?? enclosures[0] ?? null
    );
  },
});

// Create an enclosure for an episode
export const createForEpisode = mutation({
  args: {
    episodeId: v.id("episodes"),
    url: v.string(),
    type: v.string(),
    length: v.optional(v.number()),
    bitrate: v.optional(v.number()),
    height: v.optional(v.number()),
    title: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    codecs: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("enclosures", {
      entityType: "episode",
      episodeId: args.episodeId,
      url: args.url,
      type: args.type,
      length: args.length,
      bitrate: args.bitrate,
      height: args.height,
      title: args.title,
      isDefault: args.isDefault,
      codecs: args.codecs,
      createdAt: Date.now(),
    });
  },
});

// Create an enclosure for a live item
export const createForLiveItem = mutation({
  args: {
    liveItemId: v.id("live_items"),
    url: v.string(),
    type: v.string(),
    length: v.optional(v.number()),
    bitrate: v.optional(v.number()),
    height: v.optional(v.number()),
    title: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    codecs: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("enclosures", {
      entityType: "live_item",
      liveItemId: args.liveItemId,
      url: args.url,
      type: args.type,
      length: args.length,
      bitrate: args.bitrate,
      height: args.height,
      title: args.title,
      isDefault: args.isDefault,
      codecs: args.codecs,
      createdAt: Date.now(),
    });
  },
});

// Create an enclosure for a trailer
export const createForTrailer = mutation({
  args: {
    trailerId: v.id("trailers"),
    url: v.string(),
    type: v.string(),
    length: v.optional(v.number()),
    bitrate: v.optional(v.number()),
    height: v.optional(v.number()),
    title: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    codecs: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("enclosures", {
      entityType: "trailer",
      trailerId: args.trailerId,
      url: args.url,
      type: args.type,
      length: args.length,
      bitrate: args.bitrate,
      height: args.height,
      title: args.title,
      isDefault: args.isDefault,
      codecs: args.codecs,
      createdAt: Date.now(),
    });
  },
});

// Delete an enclosure
export const remove = mutation({
  args: { id: v.id("enclosures") },
  handler: async (ctx, args) => {
    const enclosure = await ctx.db.get(args.id);
    if (!enclosure) {
      throw new Error("Enclosure not found");
    }
    await ctx.db.delete(args.id);
  },
});

// Batch create enclosures for an episode (for RSS parsing)
export const batchCreateForEpisode = mutation({
  args: {
    episodeId: v.id("episodes"),
    enclosures: v.array(
      v.object({
        url: v.string(),
        type: v.string(),
        length: v.optional(v.number()),
        bitrate: v.optional(v.number()),
        height: v.optional(v.number()),
        title: v.optional(v.string()),
        isDefault: v.optional(v.boolean()),
        codecs: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids = [];
    for (const enclosure of args.enclosures) {
      const id = await ctx.db.insert("enclosures", {
        entityType: "episode",
        episodeId: args.episodeId,
        ...enclosure,
        createdAt: now,
      });
      ids.push(id);
    }
    return ids;
  },
});

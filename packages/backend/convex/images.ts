import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get an image by ID
export const get = query({
  args: { id: v.id("images") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List images for a podcast
export const listByPodcast = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withIndex("by_podcast", (q) =>
        q.eq("entityType", "podcast").eq("podcastId", args.podcastId)
      )
      .collect();
  },
});

// List images for an episode
export const listByEpisode = query({
  args: {
    episodeId: v.id("episodes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withIndex("by_episode", (q) =>
        q.eq("entityType", "episode").eq("episodeId", args.episodeId)
      )
      .collect();
  },
});

// List images for a live item
export const listByLiveItem = query({
  args: {
    liveItemId: v.id("live_items"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withIndex("by_live_item", (q) =>
        q.eq("entityType", "live_item").eq("liveItemId", args.liveItemId)
      )
      .collect();
  },
});

// Get primary image for a podcast (cover)
export const getPodcastCover = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("images")
      .withIndex("by_podcast", (q) =>
        q.eq("entityType", "podcast").eq("podcastId", args.podcastId)
      )
      .collect();

    // Return cover image if exists, otherwise first image
    return images.find((img) => img.purpose === "cover") ?? images[0] ?? null;
  },
});

// Create an image for a podcast
export const createForPodcast = mutation({
  args: {
    podcastId: v.id("podcasts"),
    url: v.string(),
    purpose: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    blurhash: v.optional(v.string()),
    cachedStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("images", {
      entityType: "podcast",
      podcastId: args.podcastId,
      url: args.url,
      purpose: args.purpose,
      width: args.width,
      height: args.height,
      blurhash: args.blurhash,
      cachedStorageId: args.cachedStorageId,
      createdAt: Date.now(),
    });
  },
});

// Create an image for an episode
export const createForEpisode = mutation({
  args: {
    episodeId: v.id("episodes"),
    url: v.string(),
    purpose: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    blurhash: v.optional(v.string()),
    cachedStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("images", {
      entityType: "episode",
      episodeId: args.episodeId,
      url: args.url,
      purpose: args.purpose,
      width: args.width,
      height: args.height,
      blurhash: args.blurhash,
      cachedStorageId: args.cachedStorageId,
      createdAt: Date.now(),
    });
  },
});

// Create an image for a live item
export const createForLiveItem = mutation({
  args: {
    liveItemId: v.id("live_items"),
    url: v.string(),
    purpose: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    blurhash: v.optional(v.string()),
    cachedStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("images", {
      entityType: "live_item",
      liveItemId: args.liveItemId,
      url: args.url,
      purpose: args.purpose,
      width: args.width,
      height: args.height,
      blurhash: args.blurhash,
      cachedStorageId: args.cachedStorageId,
      createdAt: Date.now(),
    });
  },
});

// Update cached storage ID (for ConvexFS optimization)
export const updateCachedStorage = mutation({
  args: {
    id: v.id("images"),
    cachedStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);
    if (!image) {
      throw new Error("Image not found");
    }
    return await ctx.db.patch(args.id, {
      cachedStorageId: args.cachedStorageId,
    });
  },
});

// Delete an image
export const remove = mutation({
  args: { id: v.id("images") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.id);
    if (!image) {
      throw new Error("Image not found");
    }
    await ctx.db.delete(args.id);
  },
});

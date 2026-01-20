import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get an episode by ID
export const get = query({
  args: { id: v.id("episodes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get episode by podcast ID and episode GUID
export const getByPodcastAndGuid = query({
  args: {
    podcastId: v.id("podcasts"),
    guid: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("episodes")
      .withIndex("by_podcast_and_episode_guid", (q) =>
        q.eq("podcastId", args.podcastId).eq("guid", args.guid)
      )
      .unique();
  },
});

// List episodes for a podcast
export const listByPodcast = query({
  args: {
    podcastId: v.id("podcasts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("episodes")
      .withIndex("by_podcast", (q) => q.eq("podcastId", args.podcastId))
      .order("desc")
      .take(limit);
  },
});

// List episodes for a podcast ordered by pub date
export const listByPodcastPubDate = query({
  args: {
    podcastId: v.id("podcasts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("episodes")
      .withIndex("by_podcast_pubdate", (q) => q.eq("podcastId", args.podcastId))
      .order("desc")
      .take(limit);
  },
});

// Create a new episode
export const create = mutation({
  args: {
    podcastId: v.id("podcasts"),
    guid: v.optional(v.string()),
    episodeNumber: v.optional(v.number()),
    seasonNumber: v.optional(v.number()),
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    contentHtml: v.optional(v.string()),
    duration: v.optional(v.number()),
    explicit: v.optional(v.boolean()),
    episodeType: v.optional(
      v.union(v.literal("full"), v.literal("trailer"), v.literal("bonus"))
    ),
    chaptersUrl: v.optional(v.string()),
    chaptersType: v.optional(v.string()),
    transcriptUrl: v.optional(v.string()),
    transcriptType: v.optional(v.string()),
    pubDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("episodes", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an episode
export const update = mutation({
  args: {
    id: v.id("episodes"),
    guid: v.optional(v.string()),
    episodeNumber: v.optional(v.number()),
    seasonNumber: v.optional(v.number()),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    contentHtml: v.optional(v.string()),
    duration: v.optional(v.number()),
    explicit: v.optional(v.boolean()),
    episodeType: v.optional(
      v.union(v.literal("full"), v.literal("trailer"), v.literal("bonus"))
    ),
    chaptersUrl: v.optional(v.string()),
    chaptersType: v.optional(v.string()),
    transcriptUrl: v.optional(v.string()),
    transcriptType: v.optional(v.string()),
    pubDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const episode = await ctx.db.get(id);
    if (!episode) {
      throw new Error("Episode not found");
    }

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete an episode
export const remove = mutation({
  args: { id: v.id("episodes") },
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.id);
    if (!episode) {
      throw new Error("Episode not found");
    }
    await ctx.db.delete(args.id);
  },
});

// Batch create episodes (for RSS parsing)
export const batchCreate = mutation({
  args: {
    episodes: v.array(
      v.object({
        podcastId: v.id("podcasts"),
        guid: v.optional(v.string()),
        episodeNumber: v.optional(v.number()),
        seasonNumber: v.optional(v.number()),
        title: v.string(),
        subtitle: v.optional(v.string()),
        description: v.optional(v.string()),
        contentHtml: v.optional(v.string()),
        duration: v.optional(v.number()),
        explicit: v.optional(v.boolean()),
        episodeType: v.optional(
          v.union(v.literal("full"), v.literal("trailer"), v.literal("bonus"))
        ),
        chaptersUrl: v.optional(v.string()),
        chaptersType: v.optional(v.string()),
        transcriptUrl: v.optional(v.string()),
        transcriptType: v.optional(v.string()),
        pubDate: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids = [];
    for (const episode of args.episodes) {
      const id = await ctx.db.insert("episodes", {
        ...episode,
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }
    return ids;
  },
});

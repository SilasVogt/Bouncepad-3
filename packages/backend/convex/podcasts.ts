import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a podcast by ID
export const get = query({
  args: { id: v.id("podcasts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get a podcast by GUID
export const getByGuid = query({
  args: { podcastGuid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("podcasts")
      .withIndex("by_podcast_guid", (q) => q.eq("podcastGuid", args.podcastGuid))
      .unique();
  },
});

// Get a podcast by feed URL
export const getByFeedUrl = query({
  args: { feedUrl: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("podcasts")
      .withIndex("by_feed_url", (q) => q.eq("feedUrl", args.feedUrl))
      .unique();
  },
});

// Get a podcast by URL-friendly name
export const getByUrlFriendlyName = query({
  args: { urlFriendlyName: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("podcasts")
      .withIndex("by_url_friendly_name", (q) =>
        q.eq("urlFriendlyName", args.urlFriendlyName)
      )
      .unique();
  },
});

// List podcasts that have gone live
export const listLivePodcasts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("podcasts")
      .withIndex("by_has_gone_live", (q) => q.eq("hasGoneLive", true))
      .take(limit);
  },
});

// Search podcasts by title
export const searchByTitle = query({
  args: {
    query: v.string(),
    hasGoneLive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    let searchQuery = ctx.db
      .query("podcasts")
      .withSearchIndex("search_title", (q) => {
        let search = q.search("title", args.query);
        if (args.hasGoneLive !== undefined) {
          search = search.eq("hasGoneLive", args.hasGoneLive);
        }
        return search;
      });

    return await searchQuery.take(limit);
  },
});

// Create a new podcast
export const create = mutation({
  args: {
    podcastGuid: v.string(),
    feedUrl: v.string(),
    title: v.string(),
    originalFeedUrl: v.optional(v.string()),
    medium: v.optional(v.string()),
    description: v.optional(v.string()),
    author: v.optional(v.string()),
    language: v.optional(v.string()),
    explicit: v.optional(v.boolean()),
    itunesKeywords: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    hasGoneLive: v.optional(v.boolean()),
    spcKeystring: v.optional(v.string()),
    urlFriendlyName: v.optional(v.string()),
    ranking: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("podcasts", {
      ...args,
      status: "visible",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a podcast
export const update = mutation({
  args: {
    id: v.id("podcasts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    author: v.optional(v.string()),
    language: v.optional(v.string()),
    explicit: v.optional(v.boolean()),
    itunesKeywords: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    hasGoneLive: v.optional(v.boolean()),
    urlFriendlyName: v.optional(v.string()),
    ranking: v.optional(v.number()),
    lastFetchedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const podcast = await ctx.db.get(id);
    if (!podcast) {
      throw new Error("Podcast not found");
    }

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Update podcast status (for moderation)
export const updateStatus = mutation({
  args: {
    id: v.id("podcasts"),
    status: v.union(
      v.literal("visible"),
      v.literal("reported"),
      v.literal("hidden"),
      v.literal("banned")
    ),
    hiddenReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.id);
    if (!podcast) {
      throw new Error("Podcast not found");
    }

    return await ctx.db.patch(args.id, {
      status: args.status,
      statusChangedAt: Date.now(),
      hiddenReason: args.hiddenReason,
      updatedAt: Date.now(),
    });
  },
});

// Mark podcast as having gone live
export const markAsLive = mutation({
  args: { id: v.id("podcasts") },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.id);
    if (!podcast) {
      throw new Error("Podcast not found");
    }

    if (!podcast.hasGoneLive) {
      return await ctx.db.patch(args.id, {
        hasGoneLive: true,
        updatedAt: Date.now(),
      });
    }
  },
});

// Delete a podcast
export const remove = mutation({
  args: { id: v.id("podcasts") },
  handler: async (ctx, args) => {
    const podcast = await ctx.db.get(args.id);
    if (!podcast) {
      throw new Error("Podcast not found");
    }
    await ctx.db.delete(args.id);
  },
});

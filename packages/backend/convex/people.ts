import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get a person by ID
export const get = query({
  args: { id: v.id("people") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List people for a podcast
export const listByPodcast = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("people")
      .withIndex("by_podcast", (q) =>
        q.eq("entityType", "podcast").eq("podcastId", args.podcastId)
      )
      .collect();
  },
});

// List people for an episode
export const listByEpisode = query({
  args: {
    episodeId: v.id("episodes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("people")
      .withIndex("by_episode", (q) =>
        q.eq("entityType", "episode").eq("episodeId", args.episodeId)
      )
      .collect();
  },
});

// List people for a live item
export const listByLiveItem = query({
  args: {
    liveItemId: v.id("live_items"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("people")
      .withIndex("by_live_item", (q) =>
        q.eq("entityType", "live_item").eq("liveItemId", args.liveItemId)
      )
      .collect();
  },
});

// Create a person for a podcast
export const createForPodcast = mutation({
  args: {
    podcastId: v.id("podcasts"),
    name: v.string(),
    role: v.optional(v.string()),
    group: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    href: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("people", {
      entityType: "podcast",
      podcastId: args.podcastId,
      name: args.name,
      role: args.role,
      group: args.group,
      imageUrl: args.imageUrl,
      href: args.href,
      createdAt: Date.now(),
    });
  },
});

// Create a person for an episode
export const createForEpisode = mutation({
  args: {
    episodeId: v.id("episodes"),
    name: v.string(),
    role: v.optional(v.string()),
    group: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    href: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("people", {
      entityType: "episode",
      episodeId: args.episodeId,
      name: args.name,
      role: args.role,
      group: args.group,
      imageUrl: args.imageUrl,
      href: args.href,
      createdAt: Date.now(),
    });
  },
});

// Create a person for a live item
export const createForLiveItem = mutation({
  args: {
    liveItemId: v.id("live_items"),
    name: v.string(),
    role: v.optional(v.string()),
    group: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    href: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("people", {
      entityType: "live_item",
      liveItemId: args.liveItemId,
      name: args.name,
      role: args.role,
      group: args.group,
      imageUrl: args.imageUrl,
      href: args.href,
      createdAt: Date.now(),
    });
  },
});

// Update a person
export const update = mutation({
  args: {
    id: v.id("people"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    group: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    href: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const person = await ctx.db.get(id);
    if (!person) {
      throw new Error("Person not found");
    }

    return await ctx.db.patch(id, updates);
  },
});

// Delete a person
export const remove = mutation({
  args: { id: v.id("people") },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.id);
    if (!person) {
      throw new Error("Person not found");
    }
    await ctx.db.delete(args.id);
  },
});

// Batch create people for a podcast (for RSS parsing)
export const batchCreateForPodcast = mutation({
  args: {
    podcastId: v.id("podcasts"),
    people: v.array(
      v.object({
        name: v.string(),
        role: v.optional(v.string()),
        group: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        href: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids = [];
    for (const person of args.people) {
      const id = await ctx.db.insert("people", {
        entityType: "podcast",
        podcastId: args.podcastId,
        ...person,
        createdAt: now,
      });
      ids.push(id);
    }
    return ids;
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// =============================================================================
// VALUES (V4V Configuration)
// =============================================================================

// Get a value by ID
export const get = query({
  args: { id: v.id("values") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get value configuration for a podcast
export const getByPodcast = query({
  args: {
    podcastId: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("values")
      .withIndex("by_podcast", (q) =>
        q.eq("entityType", "podcast").eq("podcastId", args.podcastId)
      )
      .first();
  },
});

// Get value configuration for an episode
export const getByEpisode = query({
  args: {
    episodeId: v.id("episodes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("values")
      .withIndex("by_episode", (q) =>
        q.eq("entityType", "episode").eq("episodeId", args.episodeId)
      )
      .first();
  },
});

// Get value configuration for a live item
export const getByLiveItem = query({
  args: {
    liveItemId: v.id("live_items"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("values")
      .withIndex("by_live_item", (q) =>
        q.eq("entityType", "live_item").eq("liveItemId", args.liveItemId)
      )
      .first();
  },
});

// Create value configuration for a podcast
export const createForPodcast = mutation({
  args: {
    podcastId: v.id("podcasts"),
    type: v.string(),
    method: v.string(),
    suggested: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("values", {
      entityType: "podcast",
      podcastId: args.podcastId,
      type: args.type,
      method: args.method,
      suggested: args.suggested,
      createdAt: Date.now(),
    });
  },
});

// Create value configuration for an episode
export const createForEpisode = mutation({
  args: {
    episodeId: v.id("episodes"),
    type: v.string(),
    method: v.string(),
    suggested: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("values", {
      entityType: "episode",
      episodeId: args.episodeId,
      type: args.type,
      method: args.method,
      suggested: args.suggested,
      createdAt: Date.now(),
    });
  },
});

// Create value configuration for a live item
export const createForLiveItem = mutation({
  args: {
    liveItemId: v.id("live_items"),
    type: v.string(),
    method: v.string(),
    suggested: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("values", {
      entityType: "live_item",
      liveItemId: args.liveItemId,
      type: args.type,
      method: args.method,
      suggested: args.suggested,
      createdAt: Date.now(),
    });
  },
});

// Delete a value configuration
export const remove = mutation({
  args: { id: v.id("values") },
  handler: async (ctx, args) => {
    const value = await ctx.db.get(args.id);
    if (!value) {
      throw new Error("Value configuration not found");
    }
    // Also delete associated recipients
    const recipients = await ctx.db
      .query("value_recipients")
      .withIndex("by_value", (q) => q.eq("valueId", args.id))
      .collect();
    for (const recipient of recipients) {
      await ctx.db.delete(recipient._id);
    }
    await ctx.db.delete(args.id);
  },
});

// =============================================================================
// VALUE RECIPIENTS (Payment Splits)
// =============================================================================

// Get recipients for a value configuration
export const getRecipients = query({
  args: {
    valueId: v.id("values"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("value_recipients")
      .withIndex("by_value", (q) => q.eq("valueId", args.valueId))
      .collect();
  },
});

// Create a recipient
export const createRecipient = mutation({
  args: {
    valueId: v.id("values"),
    name: v.optional(v.string()),
    type: v.string(),
    address: v.string(),
    customKey: v.optional(v.string()),
    customValue: v.optional(v.string()),
    split: v.number(),
    fee: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("value_recipients", {
      valueId: args.valueId,
      name: args.name,
      type: args.type,
      address: args.address,
      customKey: args.customKey,
      customValue: args.customValue,
      split: args.split,
      fee: args.fee,
      createdAt: Date.now(),
    });
  },
});

// Batch create recipients (for RSS parsing)
export const batchCreateRecipients = mutation({
  args: {
    valueId: v.id("values"),
    recipients: v.array(
      v.object({
        name: v.optional(v.string()),
        type: v.string(),
        address: v.string(),
        customKey: v.optional(v.string()),
        customValue: v.optional(v.string()),
        split: v.number(),
        fee: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ids = [];
    for (const recipient of args.recipients) {
      const id = await ctx.db.insert("value_recipients", {
        valueId: args.valueId,
        ...recipient,
        createdAt: now,
      });
      ids.push(id);
    }
    return ids;
  },
});

// Delete a recipient
export const removeRecipient = mutation({
  args: { id: v.id("value_recipients") },
  handler: async (ctx, args) => {
    const recipient = await ctx.db.get(args.id);
    if (!recipient) {
      throw new Error("Recipient not found");
    }
    await ctx.db.delete(args.id);
  },
});

// Get value configuration with recipients
export const getWithRecipients = query({
  args: {
    valueId: v.id("values"),
  },
  handler: async (ctx, args) => {
    const value = await ctx.db.get(args.valueId);
    if (!value) {
      return null;
    }

    const recipients = await ctx.db
      .query("value_recipients")
      .withIndex("by_value", (q) => q.eq("valueId", args.valueId))
      .collect();

    return {
      ...value,
      recipients,
    };
  },
});

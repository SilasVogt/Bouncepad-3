import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    // Theme preferences (synced across devices)
    themeMode: v.optional(v.union(v.literal("system"), v.literal("light"), v.literal("dark"))),
    accentColor: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  feeds: defineTable({
    userId: v.id("users"),
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    lastFetched: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  streams: defineTable({
    feedId: v.id("feeds"),
    title: v.string(),
    description: v.optional(v.string()),
    streamUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    isLive: v.boolean(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_feed", ["feedId"])
    .index("by_live", ["isLive"]),
});

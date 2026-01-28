import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user by ID
export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get user by Clerk ID
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Create a new user
export const create = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      roles: ["user"],
      createdAt: Date.now(),
    });
  },
});

// Update user profile
export const update = mutation({
  args: {
    clerkId: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Record<string, unknown> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.username !== undefined) updates.username = args.username;
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;

    return await ctx.db.patch(user._id, updates);
  },
});

// Update public username
export const updateUsername = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.patch(user._id, { username: args.username });
  },
});

// Update theme preferences
export const updateThemePreferences = mutation({
  args: {
    clerkId: v.string(),
    themeMode: v.optional(
      v.union(v.literal("system"), v.literal("light"), v.literal("dark"))
    ),
    accentColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: Record<string, unknown> = {};
    if (args.themeMode !== undefined) updates.themeMode = args.themeMode;
    if (args.accentColor !== undefined) updates.accentColor = args.accentColor;

    return await ctx.db.patch(user._id, updates);
  },
});

// Update timezone
export const updateTimezone = mutation({
  args: {
    clerkId: v.string(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.patch(user._id, { timezone: args.timezone });
  },
});

// Add a payment address
export const addPaymentAddress = mutation({
  args: {
    clerkId: v.string(),
    type: v.string(),
    address: v.string(),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const currentAddresses = user.paymentAddresses ?? [];
    const newAddress: {
      type: string;
      address: string;
      isDefault?: boolean;
    } = {
      type: args.type,
      address: args.address,
    };
    if (args.isDefault !== undefined) {
      newAddress.isDefault = args.isDefault;
    }

    // If this is set as default, unset others
    let updatedAddresses: typeof currentAddresses;
    if (args.isDefault) {
      updatedAddresses = currentAddresses.map((addr) => ({
        ...addr,
        isDefault: false,
      }));
      updatedAddresses.push(newAddress);
    } else {
      updatedAddresses = [...currentAddresses, newAddress];
    }

    return await ctx.db.patch(user._id, { paymentAddresses: updatedAddresses });
  },
});

// Remove a payment address
export const removePaymentAddress = mutation({
  args: {
    clerkId: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const updatedAddresses = (user.paymentAddresses ?? []).filter(
      (addr) => addr.address !== args.address
    );

    return await ctx.db.patch(user._id, { paymentAddresses: updatedAddresses });
  },
});

// Add a push notification token
export const addPushToken = mutation({
  args: {
    clerkId: v.string(),
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const currentTokens = user.pushTokens ?? [];

    // Check if token already exists
    if (currentTokens.some((t) => t.token === args.token)) {
      return user._id;
    }

    const newToken = {
      token: args.token,
      platform: args.platform,
      createdAt: Date.now(),
    };

    return await ctx.db.patch(user._id, {
      pushTokens: [...currentTokens, newToken],
    });
  },
});

// Remove a push notification token
export const removePushToken = mutation({
  args: {
    clerkId: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const updatedTokens = (user.pushTokens ?? []).filter(
      (t) => t.token !== args.token
    );

    return await ctx.db.patch(user._id, { pushTokens: updatedTokens });
  },
});

// Check if user is admin
export const isAdmin = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user?.roles?.includes("admin") ?? false;
  },
});

// Update user roles (admin only)
export const updateRoles = mutation({
  args: {
    adminClerkId: v.string(),
    targetClerkId: v.string(),
    roles: v.array(v.union(v.literal("user"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.adminClerkId))
      .unique();

    if (!admin?.roles?.includes("admin")) {
      throw new Error("Unauthorized: Admin access required");
    }

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.targetClerkId))
      .unique();

    if (!targetUser) {
      throw new Error("Target user not found");
    }

    return await ctx.db.patch(targetUser._id, { roles: args.roles });
  },
});

// Bootstrap admin - set a user as admin by email
// Run with: npx convex run users:bootstrapAdmin --args '{"email": "your@email.com"}'
export const bootstrapAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error(`User with email "${args.email}" not found`);
    }

    await ctx.db.patch(user._id, { roles: ["user", "admin"] });

    return { success: true, userId: user._id, email: args.email };
  },
});

// Get users with push tokens for notification (for sending notifications)
export const getUsersWithPushTokens = query({
  args: {
    userIds: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const users = await Promise.all(
      args.userIds.map((id) => ctx.db.get(id))
    );

    return users
      .filter((user) => user && user.pushTokens && user.pushTokens.length > 0)
      .map((user) => ({
        _id: user!._id,
        pushTokens: user!.pushTokens,
      }));
  },
});

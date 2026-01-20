import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// =============================================================================
// BOUNCEPAD CONVEX SCHEMA - Podcasting 2.0 RSS Tags Based
// =============================================================================

export default defineSchema({
  // ===========================================================================
  // PHASE 1: CORE PODCAST TABLES
  // ===========================================================================

  // Main podcast feed data (replaces `feeds`)
  podcasts: defineTable({
    podcastGuid: v.string(), // <podcast:guid> or generated_*
    feedUrl: v.string(),
    originalFeedUrl: v.optional(v.string()),
    medium: v.optional(v.string()), // podcast, music, video, etc.
    title: v.string(),
    description: v.optional(v.string()),
    author: v.optional(v.string()),
    language: v.optional(v.string()),
    explicit: v.optional(v.boolean()), // iTunes explicit tag
    itunesKeywords: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    hasGoneLive: v.optional(v.boolean()), // Filter for live podcasts

    // Visibility/moderation status
    status: v.optional(
      v.union(
        v.literal("visible"),
        v.literal("reported"),
        v.literal("hidden"),
        v.literal("banned")
      )
    ),
    statusChangedAt: v.optional(v.number()),
    hiddenReason: v.optional(v.string()),
    spcKeystring: v.optional(v.string()),
    urlFriendlyName: v.optional(v.string()),
    ranking: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastFetchedAt: v.optional(v.number()),
  })
    .index("by_podcast_guid", ["podcastGuid"])
    .index("by_feed_url", ["feedUrl"])
    .index("by_url_friendly_name", ["urlFriendlyName"])
    .index("by_has_gone_live", ["hasGoneLive"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["hasGoneLive", "status"],
    }),

  // Regular podcast episodes
  episodes: defineTable({
    podcastId: v.id("podcasts"),
    guid: v.optional(v.string()), // Episode's own unique identifier
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_podcast", ["podcastId"])
    .index("by_podcast_and_episode_guid", ["podcastId", "guid"])
    .index("by_podcast_pubdate", ["podcastId", "pubDate"]),

  // Live streaming episodes (replaces `streams`)
  live_items: defineTable({
    podcastId: v.id("podcasts"),
    guid: v.string(),
    liveStatus: v.union(
      v.literal("pending"),
      v.literal("live"),
      v.literal("ended")
    ),
    offlineOverride: v.optional(v.boolean()),
    scheduleDatetime: v.optional(v.number()),
    endDatetime: v.optional(v.number()),
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    liveValue: v.optional(v.boolean()),
    liveValueProtocol: v.optional(v.string()),
    socialInteract: v.optional(
      v.array(
        v.object({
          uri: v.string(),
          protocol: v.string(),
          accountId: v.optional(v.string()),
          accountUrl: v.optional(v.string()),
        })
      )
    ),
    chatUrl: v.optional(v.string()),
    chatChannel: v.optional(v.string()),
    chatType: v.optional(v.string()),
    accountId: v.optional(v.string()),
    // Note: views/peakViewers use Sharded Counter component
    createdAt: v.number(),
    updatedAt: v.number(),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
  })
    .index("by_podcast", ["podcastId"])
    .index("by_live_status", ["liveStatus"])
    .index("by_live_status_schedule", ["liveStatus", "scheduleDatetime"]),

  // Media files - <enclosure> and <podcast:alternateEnclosure>
  enclosures: defineTable({
    entityType: v.union(
      v.literal("episode"),
      v.literal("live_item"),
      v.literal("trailer")
    ),
    episodeId: v.optional(v.id("episodes")),
    liveItemId: v.optional(v.id("live_items")),
    trailerId: v.optional(v.id("trailers")),

    url: v.string(),
    type: v.string(), // MIME type
    length: v.optional(v.number()), // File size in bytes
    bitrate: v.optional(v.number()),
    height: v.optional(v.number()), // Video height
    title: v.optional(v.string()), // e.g., "Audio", "Video 1080p"
    isDefault: v.optional(v.boolean()),
    codecs: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_episode", ["entityType", "episodeId"])
    .index("by_live_item", ["entityType", "liveItemId"])
    .index("by_trailer", ["entityType", "trailerId"]),

  // ===========================================================================
  // PHASE 2: USER ENGAGEMENT
  // ===========================================================================

  // Expanded user table
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),

    // Theme preferences (synced across devices)
    themeMode: v.optional(
      v.union(v.literal("system"), v.literal("light"), v.literal("dark"))
    ),
    accentColor: v.optional(v.string()),

    // User roles for access control
    roles: v.optional(v.array(v.union(v.literal("user"), v.literal("admin")))),

    // New fields for Podcasting 2.0
    timezone: v.optional(v.string()),

    // Value4Value payment addresses
    paymentAddresses: v.optional(
      v.array(
        v.object({
          type: v.string(), // "lightning", "keysend", etc.
          address: v.string(),
          isDefault: v.optional(v.boolean()),
        })
      )
    ),

    // Expo push notification tokens
    pushTokens: v.optional(
      v.array(
        v.object({
          token: v.string(),
          platform: v.union(v.literal("ios"), v.literal("android")),
          createdAt: v.number(),
        })
      )
    ),
  }).index("by_clerk_id", ["clerkId"]),

  // User podcast subscriptions
  follows: defineTable({
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
    createdAt: v.number(),

    // Notification preferences
    notifyOnScheduled: v.optional(v.boolean()),
    notifyBefore10Min: v.optional(v.boolean()),
    notifyOnLive: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_podcast", ["podcastId"])
    .index("by_user_podcast", ["userId", "podcastId"]),

  // User blocked podcasts
  blocks: defineTable({
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
    createdAt: v.number(),
    reason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_podcast", ["userId", "podcastId"]),

  // Listening history with position tracking
  histories: defineTable({
    userId: v.id("users"),
    entityType: v.union(v.literal("episode"), v.literal("live_item")),
    episodeId: v.optional(v.id("episodes")),
    liveItemId: v.optional(v.id("live_items")),

    // Playback tracking
    position: v.number(), // Current position in seconds
    duration: v.optional(v.number()), // Total duration
    completed: v.optional(v.boolean()),
    completedAt: v.optional(v.number()),

    // Timestamps
    startedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_episode", ["userId", "entityType", "episodeId"])
    .index("by_user_live_item", ["userId", "entityType", "liveItemId"])
    .index("by_user_updated", ["userId", "updatedAt"]),

  // ===========================================================================
  // PHASE 3: PODCAST METADATA (Podcasting 2.0 Tags)
  // ===========================================================================

  // Polymorphic images - <podcast:image>
  images: defineTable({
    entityType: v.union(
      v.literal("podcast"),
      v.literal("episode"),
      v.literal("live_item")
    ),
    podcastId: v.optional(v.id("podcasts")),
    episodeId: v.optional(v.id("episodes")),
    liveItemId: v.optional(v.id("live_items")),

    url: v.string(),
    purpose: v.optional(v.string()), // "cover", "banner", "thumbnail"
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    blurhash: v.optional(v.string()),

    // ConvexFS cached version
    cachedStorageId: v.optional(v.id("_storage")),

    createdAt: v.number(),
  })
    .index("by_podcast", ["entityType", "podcastId"])
    .index("by_episode", ["entityType", "episodeId"])
    .index("by_live_item", ["entityType", "liveItemId"]),

  // Hosts, guests, crew - <podcast:person>
  people: defineTable({
    entityType: v.union(
      v.literal("podcast"),
      v.literal("episode"),
      v.literal("live_item")
    ),
    podcastId: v.optional(v.id("podcasts")),
    episodeId: v.optional(v.id("episodes")),
    liveItemId: v.optional(v.id("live_items")),

    name: v.string(),
    role: v.optional(v.string()), // "Host", "Guest", "Producer"
    group: v.optional(v.string()), // "cast", "crew"
    imageUrl: v.optional(v.string()),
    href: v.optional(v.string()), // Link to their website/profile

    createdAt: v.number(),
  })
    .index("by_podcast", ["entityType", "podcastId"])
    .index("by_episode", ["entityType", "episodeId"])
    .index("by_live_item", ["entityType", "liveItemId"]),

  // Podcast trailers - <podcast:trailer>
  trailers: defineTable({
    podcastId: v.id("podcasts"),
    title: v.string(),
    pubDate: v.optional(v.number()),
    description: v.optional(v.string()),
    // Enclosure stored in enclosures table
    createdAt: v.number(),
  }).index("by_podcast", ["podcastId"]),

  // Donation/funding links - <podcast:funding>
  funding: defineTable({
    entityType: v.union(v.literal("podcast"), v.literal("episode")),
    podcastId: v.optional(v.id("podcasts")),
    episodeId: v.optional(v.id("episodes")),

    url: v.string(),
    platform: v.optional(v.string()), // "Patreon", "Buy Me a Coffee", etc.
    description: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_podcast", ["entityType", "podcastId"])
    .index("by_episode", ["entityType", "episodeId"]),

  // Podcast recommendations - <podcast:podroll>
  podrolls: defineTable({
    podcastId: v.id("podcasts"),
    recommendedFeedUrl: v.string(),
    recommendedPodcastGuid: v.optional(v.string()),
    recommendedPodcastId: v.optional(v.id("podcasts")), // If we have it
    title: v.optional(v.string()),
    description: v.optional(v.string()),

    createdAt: v.number(),
  }).index("by_podcast", ["podcastId"]),

  // Geo data - <podcast:location>
  locations: defineTable({
    entityType: v.union(
      v.literal("podcast"),
      v.literal("episode"),
      v.literal("live_item")
    ),
    podcastId: v.optional(v.id("podcasts")),
    episodeId: v.optional(v.id("episodes")),
    liveItemId: v.optional(v.id("live_items")),

    name: v.string(),
    geo: v.optional(v.string()), // "geo:lat,lon"
    osm: v.optional(v.string()), // OpenStreetMap ID

    createdAt: v.number(),
  })
    .index("by_podcast", ["entityType", "podcastId"])
    .index("by_episode", ["entityType", "episodeId"])
    .index("by_live_item", ["entityType", "liveItemId"]),

  // ===========================================================================
  // PHASE 4: VALUE4VALUE MONETIZATION
  // ===========================================================================

  // V4V configuration - <podcast:value>
  values: defineTable({
    entityType: v.union(
      v.literal("podcast"),
      v.literal("episode"),
      v.literal("live_item")
    ),
    podcastId: v.optional(v.id("podcasts")),
    episodeId: v.optional(v.id("episodes")),
    liveItemId: v.optional(v.id("live_items")),

    type: v.string(), // "lightning", "webmonetization"
    method: v.string(), // "keysend"
    suggested: v.optional(v.number()), // Suggested amount

    createdAt: v.number(),
  })
    .index("by_podcast", ["entityType", "podcastId"])
    .index("by_episode", ["entityType", "episodeId"])
    .index("by_live_item", ["entityType", "liveItemId"]),

  // Payment splits - <podcast:valueRecipient>
  value_recipients: defineTable({
    valueId: v.id("values"),

    name: v.optional(v.string()),
    type: v.string(), // "node", "wallet"
    address: v.string(),
    customKey: v.optional(v.string()),
    customValue: v.optional(v.string()),
    split: v.number(), // Percentage 0-100
    fee: v.optional(v.boolean()),

    createdAt: v.number(),
  }).index("by_value", ["valueId"]),

  // User tips/boosts
  boosts: defineTable({
    userId: v.id("users"),
    entityType: v.union(v.literal("episode"), v.literal("live_item")),
    episodeId: v.optional(v.id("episodes")),
    liveItemId: v.optional(v.id("live_items")),

    amount: v.number(), // In sats
    message: v.optional(v.string()),
    timestamp: v.optional(v.number()), // Position in episode when boost was sent

    // Transaction details
    paymentHash: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_episode", ["entityType", "episodeId"])
    .index("by_live_item", ["entityType", "liveItemId"]),

  // ===========================================================================
  // PHASE 5: DISCOVERY & PREFERENCES
  // ===========================================================================

  // Manual category preferences (for onboarding)
  user_category_preferences: defineTable({
    userId: v.id("users"),
    category: v.string(),
    weight: v.optional(v.number()), // Preference strength

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_category", ["userId", "category"]),

  // Track onboarding completion
  user_onboardings: defineTable({
    userId: v.id("users"),

    // Onboarding steps completed
    welcomeCompleted: v.optional(v.boolean()),
    categoriesSelected: v.optional(v.boolean()),
    firstFollowCompleted: v.optional(v.boolean()),
    notificationsConfigured: v.optional(v.boolean()),

    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ===========================================================================
  // PHASE 6: MODERATION & SYSTEM
  // ===========================================================================

  // Content reports (polymorphic)
  reports: defineTable({
    reporterId: v.id("users"),
    entityType: v.union(
      v.literal("podcast"),
      v.literal("episode"),
      v.literal("live_item")
    ),
    podcastId: v.optional(v.id("podcasts")),
    episodeId: v.optional(v.id("episodes")),
    liveItemId: v.optional(v.id("live_items")),

    reason: v.string(),
    details: v.optional(v.string()),

    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    resolution: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_reporter", ["reporterId"])
    .index("by_status", ["status"])
    .index("by_podcast", ["entityType", "podcastId"])
    .index("by_episode", ["entityType", "episodeId"])
    .index("by_live_item", ["entityType", "liveItemId"]),

  // System-blocked feeds
  blocked_feeds: defineTable({
    feedUrl: v.string(),
    podcastGuid: v.optional(v.string()),

    reason: v.string(),
    blockedBy: v.id("users"),

    createdAt: v.number(),
  })
    .index("by_feed_url", ["feedUrl"])
    .index("by_podcast_guid", ["podcastGuid"]),

  // ===========================================================================
  // HIVE BLOCKCHAIN PODPING SYNC
  // ===========================================================================

  // Hive sync state (singleton - only one row)
  hive_sync: defineTable({
    lastParsedBlock: v.number(), // Last block we successfully parsed
    lastKnownHeadBlock: v.number(), // Head block from last RPC check
    lastFetchedAt: v.number(), // When we last fetched blocks
    lastError: v.optional(v.string()), // Last error message if any
    errorCount: v.optional(v.number()), // Consecutive error count
    // Lock mechanism to prevent overlapping cron executions
    isRunning: v.optional(v.boolean()),
    runStartedAt: v.optional(v.number()),
    // Stats for admin panel
    lastBatchBlockCount: v.optional(v.number()), // Blocks processed in last batch
    lastBatchPodpingCount: v.optional(v.number()), // Podping events found in last batch
    totalBlocksProcessed: v.optional(v.number()), // Lifetime total blocks processed
    totalPodpingsFound: v.optional(v.number()), // Lifetime total podping events found
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Temporary storage for raw Hive blocks (cleaned up after 10 days)
  // Stores full block data for potential reprocessing/auditing
  hive_blocks: defineTable({
    blockNumber: v.number(),
    blockTimestamp: v.optional(v.string()), // Hive block timestamp
    blockId: v.optional(v.string()), // Hive block ID
    witness: v.optional(v.string()), // Block witness/producer

    // Full raw transaction data from the block (NEW format)
    rawTransactions: v.optional(v.string()), // JSON stringified array of all transactions
    podpingCount: v.optional(v.number()), // Number of podping transactions found

    // OLD format - for migration compatibility (will be removed after migration)
    podpingTransactions: v.optional(
      v.array(
        v.object({
          transactionId: v.string(),
          operationId: v.string(),
          json: v.string(),
        })
      )
    ),

    transactionCount: v.number(), // Total transactions in block

    // Processing state
    status: v.union(
      v.literal("pending"),
      v.literal("processed"),
      v.literal("empty") // No podping events in this block
    ),
    processedAt: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_block_number", ["blockNumber"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Podping event history (extracted from hive_blocks)
  podping_histories: defineTable({
    blockNumber: v.number(),
    reason: v.string(), // "update", "live", "liveEnd"
    feedUrls: v.array(v.string()), // All feed URLs from this event group

    // Processing state
    processed: v.optional(v.boolean()),
    processedAt: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_block_number", ["blockNumber"])
    .index("by_reason", ["reason"])
    .index("by_created", ["createdAt"])
    .searchIndex("search_feed_urls", {
      searchField: "feedUrls",
      filterFields: ["reason"],
    }),

  // Queue for fetched RSS XML (decouples fetching from parsing)
  raw_feeds: defineTable({
    feedUrl: v.string(),
    podcastId: v.optional(v.id("podcasts")), // If podcast already exists

    // Raw feed data
    rawXml: v.string(), // The raw RSS XML
    contentHash: v.optional(v.string()), // MD5/SHA hash to detect changes
    httpStatus: v.optional(v.number()), // HTTP status code from fetch
    httpEtag: v.optional(v.string()), // ETag for conditional requests
    httpLastModified: v.optional(v.string()), // Last-Modified header

    // Processing status
    status: v.union(
      v.literal("pending"), // Awaiting parsing
      v.literal("parsing"), // Currently being parsed
      v.literal("completed"), // Successfully parsed
      v.literal("failed") // Parse failed
    ),
    parseError: v.optional(v.string()),
    parseAttempts: v.optional(v.number()),

    // Trigger info
    triggerReason: v.optional(
      v.union(
        v.literal("podping_live"),
        v.literal("podping_liveEnd"),
        v.literal("podping_update"),
        v.literal("scheduled_refresh"),
        v.literal("manual")
      )
    ),

    // Timestamps
    fetchedAt: v.number(),
    parsedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_feed_url", ["feedUrl"])
    .index("by_fetched", ["fetchedAt"]),

  // ===========================================================================
  // PHASE 7: ANALYTICS
  // ===========================================================================

  // Share link tracking with UUID
  share_links: defineTable({
    uuid: v.string(), // Short UUID for URLs
    creatorId: v.optional(v.id("users")),

    entityType: v.union(
      v.literal("podcast"),
      v.literal("episode"),
      v.literal("live_item")
    ),
    podcastId: v.optional(v.id("podcasts")),
    episodeId: v.optional(v.id("episodes")),
    liveItemId: v.optional(v.id("live_items")),

    // Optional: timestamp in episode
    timestamp: v.optional(v.number()),

    // Aggregated counts (use Aggregate component for scalable counts)
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_uuid", ["uuid"])
    .index("by_creator", ["creatorId"])
    .index("by_podcast", ["entityType", "podcastId"])
    .index("by_episode", ["entityType", "episodeId"])
    .index("by_live_item", ["entityType", "liveItemId"]),

  // Individual visit tracking
  share_link_visits: defineTable({
    shareLinkId: v.id("share_links"),
    visitorId: v.optional(v.id("users")), // If logged in

    // Visitor info
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
    country: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_share_link", ["shareLinkId"])
    .index("by_visitor", ["visitorId"]),
});

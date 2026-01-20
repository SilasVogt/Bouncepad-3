// =============================================================================
// BOUNCEPAD SHARED TYPES - Matching Convex Schema
// =============================================================================

import { Id } from "@bouncepad/backend/convex/_generated/dataModel";

// =============================================================================
// PHASE 1: CORE PODCAST TYPES
// =============================================================================

export type PodcastStatus = "visible" | "reported" | "hidden" | "banned";

export interface Podcast {
  _id: Id<"podcasts">;
  _creationTime: number;
  podcastGuid: string;
  feedUrl: string;
  originalFeedUrl?: string;
  medium?: string;
  title: string;
  description?: string;
  author?: string;
  language?: string;
  explicit?: boolean;
  itunesKeywords?: string;
  categories?: string[];
  tags?: string[];
  hasGoneLive?: boolean;
  status?: PodcastStatus;
  statusChangedAt?: number;
  hiddenReason?: string;
  spcKeystring?: string;
  urlFriendlyName?: string;
  ranking?: number;
  createdAt: number;
  updatedAt: number;
  lastFetchedAt?: number;
}

export type EpisodeType = "full" | "trailer" | "bonus";

export interface Episode {
  _id: Id<"episodes">;
  _creationTime: number;
  podcastId: Id<"podcasts">;
  guid?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  title: string;
  subtitle?: string;
  description?: string;
  contentHtml?: string;
  duration?: number;
  explicit?: boolean;
  episodeType?: EpisodeType;
  chaptersUrl?: string;
  chaptersType?: string;
  transcriptUrl?: string;
  transcriptType?: string;
  pubDate?: number;
  createdAt: number;
  updatedAt: number;
}

export type LiveStatus = "pending" | "live" | "ended";

export interface SocialInteract {
  uri: string;
  protocol: string;
  accountId?: string;
  accountUrl?: string;
}

export interface LiveItem {
  _id: Id<"live_items">;
  _creationTime: number;
  podcastId: Id<"podcasts">;
  guid: string;
  liveStatus: LiveStatus;
  offlineOverride?: boolean;
  scheduleDatetime?: number;
  endDatetime?: number;
  title: string;
  subtitle?: string;
  description?: string;
  liveValue?: boolean;
  liveValueProtocol?: string;
  socialInteract?: SocialInteract[];
  chatUrl?: string;
  chatChannel?: string;
  chatType?: string;
  accountId?: string;
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  endedAt?: number;
}

export type EnclosureEntityType = "episode" | "live_item" | "trailer";

export interface Enclosure {
  _id: Id<"enclosures">;
  _creationTime: number;
  entityType: EnclosureEntityType;
  episodeId?: Id<"episodes">;
  liveItemId?: Id<"live_items">;
  trailerId?: Id<"trailers">;
  url: string;
  type: string;
  length?: number;
  bitrate?: number;
  height?: number;
  title?: string;
  isDefault?: boolean;
  codecs?: string;
  createdAt: number;
}

// =============================================================================
// PHASE 2: USER ENGAGEMENT TYPES
// =============================================================================

export type ThemeMode = "system" | "light" | "dark";
export type UserRole = "user" | "admin";
export type Platform = "ios" | "android";

export interface PaymentAddress {
  type: string;
  address: string;
  isDefault?: boolean;
}

export interface PushToken {
  token: string;
  platform: Platform;
  createdAt: number;
}

export interface User {
  _id: Id<"users">;
  _creationTime: number;
  clerkId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  createdAt: number;
  themeMode?: ThemeMode;
  accentColor?: string;
  roles?: UserRole[];
  timezone?: string;
  paymentAddresses?: PaymentAddress[];
  pushTokens?: PushToken[];
}

export interface Follow {
  _id: Id<"follows">;
  _creationTime: number;
  userId: Id<"users">;
  podcastId: Id<"podcasts">;
  createdAt: number;
  notifyOnScheduled?: boolean;
  notifyBefore10Min?: boolean;
  notifyOnLive?: boolean;
}

export interface Block {
  _id: Id<"blocks">;
  _creationTime: number;
  userId: Id<"users">;
  podcastId: Id<"podcasts">;
  createdAt: number;
  reason?: string;
}

export type HistoryEntityType = "episode" | "live_item";

export interface History {
  _id: Id<"histories">;
  _creationTime: number;
  userId: Id<"users">;
  entityType: HistoryEntityType;
  episodeId?: Id<"episodes">;
  liveItemId?: Id<"live_items">;
  position: number;
  duration?: number;
  completed?: boolean;
  completedAt?: number;
  startedAt: number;
  updatedAt: number;
}

// =============================================================================
// PHASE 3: PODCAST METADATA TYPES (Podcasting 2.0)
// =============================================================================

export type ImageEntityType = "podcast" | "episode" | "live_item";

export interface Image {
  _id: Id<"images">;
  _creationTime: number;
  entityType: ImageEntityType;
  podcastId?: Id<"podcasts">;
  episodeId?: Id<"episodes">;
  liveItemId?: Id<"live_items">;
  url: string;
  purpose?: string;
  width?: number;
  height?: number;
  blurhash?: string;
  cachedStorageId?: Id<"_storage">;
  createdAt: number;
}

export type PersonEntityType = "podcast" | "episode" | "live_item";

export interface Person {
  _id: Id<"people">;
  _creationTime: number;
  entityType: PersonEntityType;
  podcastId?: Id<"podcasts">;
  episodeId?: Id<"episodes">;
  liveItemId?: Id<"live_items">;
  name: string;
  role?: string;
  group?: string;
  imageUrl?: string;
  href?: string;
  createdAt: number;
}

export interface Trailer {
  _id: Id<"trailers">;
  _creationTime: number;
  podcastId: Id<"podcasts">;
  title: string;
  pubDate?: number;
  description?: string;
  createdAt: number;
}

export type FundingEntityType = "podcast" | "episode";

export interface Funding {
  _id: Id<"funding">;
  _creationTime: number;
  entityType: FundingEntityType;
  podcastId?: Id<"podcasts">;
  episodeId?: Id<"episodes">;
  url: string;
  platform?: string;
  description?: string;
  createdAt: number;
}

export interface Podroll {
  _id: Id<"podrolls">;
  _creationTime: number;
  podcastId: Id<"podcasts">;
  recommendedFeedUrl: string;
  recommendedPodcastGuid?: string;
  recommendedPodcastId?: Id<"podcasts">;
  title?: string;
  description?: string;
  createdAt: number;
}

export type LocationEntityType = "podcast" | "episode" | "live_item";

export interface Location {
  _id: Id<"locations">;
  _creationTime: number;
  entityType: LocationEntityType;
  podcastId?: Id<"podcasts">;
  episodeId?: Id<"episodes">;
  liveItemId?: Id<"live_items">;
  name: string;
  geo?: string;
  osm?: string;
  createdAt: number;
}

// =============================================================================
// PHASE 4: VALUE4VALUE MONETIZATION TYPES
// =============================================================================

export type ValueEntityType = "podcast" | "episode" | "live_item";

export interface Value {
  _id: Id<"values">;
  _creationTime: number;
  entityType: ValueEntityType;
  podcastId?: Id<"podcasts">;
  episodeId?: Id<"episodes">;
  liveItemId?: Id<"live_items">;
  type: string;
  method: string;
  suggested?: number;
  createdAt: number;
}

export interface ValueRecipient {
  _id: Id<"value_recipients">;
  _creationTime: number;
  valueId: Id<"values">;
  name?: string;
  type: string;
  address: string;
  customKey?: string;
  customValue?: string;
  split: number;
  fee?: boolean;
  createdAt: number;
}

export type BoostEntityType = "episode" | "live_item";
export type BoostStatus = "pending" | "completed" | "failed";

export interface Boost {
  _id: Id<"boosts">;
  _creationTime: number;
  userId: Id<"users">;
  entityType: BoostEntityType;
  episodeId?: Id<"episodes">;
  liveItemId?: Id<"live_items">;
  amount: number;
  message?: string;
  timestamp?: number;
  paymentHash?: string;
  status: BoostStatus;
  createdAt: number;
}

// =============================================================================
// PHASE 5: DISCOVERY & PREFERENCES TYPES
// =============================================================================

export interface UserCategoryPreference {
  _id: Id<"user_category_preferences">;
  _creationTime: number;
  userId: Id<"users">;
  category: string;
  weight?: number;
  createdAt: number;
}

export interface UserOnboarding {
  _id: Id<"user_onboardings">;
  _creationTime: number;
  userId: Id<"users">;
  welcomeCompleted?: boolean;
  categoriesSelected?: boolean;
  firstFollowCompleted?: boolean;
  notificationsConfigured?: boolean;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// =============================================================================
// PHASE 6: MODERATION & SYSTEM TYPES
// =============================================================================

export type ReportEntityType = "podcast" | "episode" | "live_item";
export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export interface Report {
  _id: Id<"reports">;
  _creationTime: number;
  reporterId: Id<"users">;
  entityType: ReportEntityType;
  podcastId?: Id<"podcasts">;
  episodeId?: Id<"episodes">;
  liveItemId?: Id<"live_items">;
  reason: string;
  details?: string;
  status: ReportStatus;
  reviewedBy?: Id<"users">;
  reviewedAt?: number;
  resolution?: string;
  createdAt: number;
}

export interface BlockedFeed {
  _id: Id<"blocked_feeds">;
  _creationTime: number;
  feedUrl: string;
  podcastGuid?: string;
  reason: string;
  blockedBy: Id<"users">;
  createdAt: number;
}

// =============================================================================
// HIVE BLOCKCHAIN SYNC TYPES
// =============================================================================

export interface HiveSync {
  _id: Id<"hive_sync">;
  _creationTime: number;
  lastParsedBlock: number;
  lastKnownHeadBlock: number;
  lastFetchedAt: number;
  lastError?: string;
  errorCount?: number;
  isRunning?: boolean;
  runStartedAt?: number;
  // Stats for admin panel
  lastBatchBlockCount?: number;
  lastBatchPodpingCount?: number;
  totalBlocksProcessed?: number;
  totalPodpingsFound?: number;
  createdAt: number;
  updatedAt: number;
}

export type HiveBlockStatus = "pending" | "processed" | "empty";

export interface HiveBlock {
  _id: Id<"hive_blocks">;
  _creationTime: number;
  blockNumber: number;
  blockTimestamp?: string;
  blockId?: string;
  witness?: string;
  rawTransactions: string; // JSON stringified full transaction data
  transactionCount: number;
  podpingCount: number;
  status: HiveBlockStatus;
  processedAt?: number;
  createdAt: number;
}

export type PodpingReason = "update" | "live" | "liveEnd";

export interface PodpingHistory {
  _id: Id<"podping_histories">;
  _creationTime: number;
  blockNumber: number;
  reason: string;
  feedUrls: string[];
  processed?: boolean;
  processedAt?: number;
  createdAt: number;
}

export interface HiveSyncStatus {
  syncState: HiveSync;
  pendingBlockCount: number;
  recentPodpings: PodpingHistory[];
  blocksBehind: number;
}

export type RawFeedStatus = "pending" | "parsing" | "completed" | "failed";
export type TriggerReason =
  | "podping_live"
  | "podping_liveEnd"
  | "podping_update"
  | "scheduled_refresh"
  | "manual";

export interface RawFeed {
  _id: Id<"raw_feeds">;
  _creationTime: number;
  feedUrl: string;
  podcastId?: Id<"podcasts">;
  rawXml: string;
  contentHash?: string;
  httpStatus?: number;
  httpEtag?: string;
  httpLastModified?: string;
  status: RawFeedStatus;
  parseError?: string;
  parseAttempts?: number;
  triggerReason?: TriggerReason;
  fetchedAt: number;
  parsedAt?: number;
}

// =============================================================================
// PHASE 7: ANALYTICS TYPES
// =============================================================================

export type ShareLinkEntityType = "podcast" | "episode" | "live_item";

export interface ShareLink {
  _id: Id<"share_links">;
  _creationTime: number;
  uuid: string;
  creatorId?: Id<"users">;
  entityType: ShareLinkEntityType;
  podcastId?: Id<"podcasts">;
  episodeId?: Id<"episodes">;
  liveItemId?: Id<"live_items">;
  timestamp?: number;
  createdAt: number;
  expiresAt?: number;
}

export interface ShareLinkVisit {
  _id: Id<"share_link_visits">;
  _creationTime: number;
  shareLinkId: Id<"share_links">;
  visitorId?: Id<"users">;
  userAgent?: string;
  referrer?: string;
  country?: string;
  createdAt: number;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// =============================================================================
// DISPLAY TYPES (for UI components)
// =============================================================================

// Notification preferences for followed podcasts
export interface NotificationSettings {
  onScheduled: boolean;
  before10Min: boolean;
  onLive: boolean;
}

// Podcast card display status
export type PodcastDisplayStatus = "offline" | "scheduled" | "live";

export interface PodcastCardData {
  id: string;
  title: string;
  creatorName: string;
  imageUrl?: string;
  status: PodcastDisplayStatus;
  isFollowing?: boolean;
  scheduledTime?: number;
}

// Full podcast page data (aggregated from multiple tables)
export interface PodcastPageData {
  id: string;
  title: string;
  author: string;
  description: string;
  imageUrl?: string;
  bannerUrl?: string;
  dominantColor?: string;
  status: PodcastDisplayStatus;
  lastLiveDate?: number;
  nextLiveDate?: number;
  isFollowing?: boolean;
  notifications?: NotificationSettings;
  people: Person[];
  trailers: Trailer[];
  episodes: Episode[];
  funding?: Funding[];
  podroll: Podroll[];
  similarPodcasts: PodcastCardData[];
  hasValue4Value?: boolean;
  websiteUrl?: string;
  feedUrl?: string;
}

// =============================================================================
// EPISODE PLAYER TYPES
// =============================================================================

export type MediaSourceType = "audio" | "video";

export interface MediaSource {
  url: string;
  type: MediaSourceType;
  mimeType: string;
  bitrate?: number;
  height?: number;
  title?: string;
  isDefault?: boolean;
  codecs?: string;
}

export interface HLSQualityLevel {
  height: number;
  width: number;
  bitrate: number;
  codecs?: string;
  name: string;
}

export interface EpisodeChapter {
  id: string;
  startTime: number;
  endTime?: number;
  title: string;
  imageUrl?: string;
  url?: string;
}

export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
}

export interface EpisodeComment {
  id: string;
  episodeId: string;
  userId: string;
  userName: string;
  userImageUrl?: string;
  text: string;
  timestamp: number;
  episodeTimestamp?: number;
  parentId?: string;
  replies?: EpisodeComment[];
  likeCount?: number;
  isLiked?: boolean;
}

export interface EpisodePlayerData {
  _id: Id<"episodes">;
  podcastId: Id<"podcasts">;
  podcastTitle: string;
  podcastImageUrl?: string;
  title: string;
  description?: string;
  audioUrl?: string;
  duration?: number;
  pubDate?: number;
  imageUrl?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  chapters?: EpisodeChapter[];
  transcript?: TranscriptSegment[];
  funding?: Funding[];
  comments?: EpisodeComment[];
  commentCount?: number;
  people?: Person[];
  lastPlayedPosition?: number;
  alternateSources?: MediaSource[];
}

// =============================================================================
// GLOBAL PLAYER STATE TYPES
// =============================================================================

export type PlayerMediaMode = "audio" | "video";

export interface PlayerState {
  episode: EpisodePlayerData | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  mediaMode: PlayerMediaMode;
  isLoading: boolean;
  showMiniPlayer: boolean;
}

export interface PlayerContextValue extends PlayerState {
  loadEpisode: (episode: EpisodePlayerData, startPosition?: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  skipForward: (seconds?: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  setMediaMode: (mode: PlayerMediaMode) => void;
  stop: () => Promise<void>;
  setShowMiniPlayer: (show: boolean) => void;
}

// User types
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  createdAt: number;
}

// Feed types
export interface Feed {
  id: string;
  userId: string;
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  lastFetched?: number;
  createdAt: number;
}

// Stream types
export interface Stream {
  id: string;
  feedId: string;
  title: string;
  description?: string;
  streamUrl: string;
  thumbnailUrl?: string;
  isLive: boolean;
  startedAt?: number;
  endedAt?: number;
  createdAt: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Podcast/Feed card display types
export type PodcastStatus = "offline" | "scheduled" | "live";

export interface PodcastCardData {
  id: string;
  title: string;
  creatorName: string;
  imageUrl?: string;
  status: PodcastStatus;
  isFollowing?: boolean;
  scheduledTime?: number; // Unix timestamp for scheduled streams
}

// Podcast page types (based on Podcasting 2.0 namespace)

// podcast:person - People associated with the podcast
export interface PodcastPerson {
  id: string;
  name: string;
  role?: string; // e.g., "Host", "Guest", "Producer"
  group?: string; // e.g., "cast", "crew"
  imageUrl?: string;
  href?: string; // Link to their website/profile
}

// podcast:trailer - Trailer episodes
export interface PodcastTrailer {
  id: string;
  title: string;
  url: string; // Audio/video URL
  duration?: number; // Duration in seconds
  pubDate?: number;
  description?: string;
}

// podcast:funding - Funding/donation links
export interface PodcastFunding {
  url: string;
  platform?: string; // e.g., "Patreon", "Buy Me a Coffee", "Value4Value"
  description?: string;
}

// Episode data
export interface PodcastEpisode {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration?: number; // Duration in seconds
  pubDate?: number;
  imageUrl?: string;
  episodeNumber?: number;
  seasonNumber?: number;
}

// podcast:podroll - Recommended podcasts
export interface PodcastPodrollItem {
  id: string;
  feedUrl: string;
  title: string;
  imageUrl?: string;
  description?: string;
}

// Notification preferences for followed podcasts
export interface NotificationSettings {
  onScheduled: boolean;    // When new livestream is scheduled
  before10Min: boolean;    // 10 minutes before scheduled stream
  onLive: boolean;         // When going live
}

// Full podcast page data
export interface PodcastPageData {
  id: string;
  title: string;
  author: string;
  description: string;
  imageUrl?: string;
  bannerUrl?: string; // Custom banner image
  dominantColor?: string; // For gradient fallback when no banner
  status: PodcastStatus;
  lastLiveDate?: number;
  nextLiveDate?: number;

  // Following state
  isFollowing?: boolean;
  notifications?: NotificationSettings;

  // podcast:person
  people: PodcastPerson[];

  // podcast:trailer
  trailers: PodcastTrailer[];

  // Recent episodes
  episodes: PodcastEpisode[];

  // podcast:funding
  funding?: PodcastFunding[];

  // podcast:podroll - recommendations from the podcast itself
  podroll: PodcastPodrollItem[];

  // Bouncepad-curated similar podcasts
  similarPodcasts: PodcastPodrollItem[];

  // podcast:value (for V4V)
  hasValue4Value?: boolean;

  // External links
  websiteUrl?: string;
  feedUrl?: string;
}

// Episode Player Types

// Media source types (Podcasting 2.0 alternate enclosures)
export type MediaSourceType = "audio" | "video";

export interface MediaSource {
  url: string;
  type: MediaSourceType;
  mimeType: string;           // e.g., "audio/mpeg", "video/mp4", "application/x-mpegURL"
  bitrate?: number;           // kbps
  height?: number;            // video height (for quality selection)
  title?: string;             // e.g., "Audio", "Video 1080p", "Video 720p"
  isDefault?: boolean;
  codecs?: string;            // e.g., "avc1.64001f,mp4a.40.2"
}

// HLS quality level (for adaptive streaming)
export interface HLSQualityLevel {
  height: number;
  width: number;
  bitrate: number;
  codecs?: string;
  name: string;               // e.g., "1080p", "720p", "480p", "Auto"
}

// Chapter support (Podcasting 2.0 podcast:chapters)
export interface EpisodeChapter {
  id: string;
  startTime: number;      // seconds
  endTime?: number;
  title: string;
  imageUrl?: string;      // chapter-specific artwork
  url?: string;           // external link
}

// Transcript segment
export interface TranscriptSegment {
  id: string;
  startTime: number;      // seconds
  endTime: number;
  text: string;
  speaker?: string;
}

// Episode comment
export interface EpisodeComment {
  id: string;
  episodeId: string;
  userId: string;
  userName: string;
  userImageUrl?: string;
  text: string;
  timestamp: number;          // when posted
  episodeTimestamp?: number;  // time in episode referenced
  parentId?: string;          // for replies
  replies?: EpisodeComment[];
  likeCount?: number;
  isLiked?: boolean;
}

// Extended episode data for player
export interface EpisodePlayerData extends PodcastEpisode {
  podcastId: string;
  podcastTitle: string;
  podcastImageUrl?: string;
  chapters?: EpisodeChapter[];
  transcript?: TranscriptSegment[];
  funding?: PodcastFunding[];
  comments?: EpisodeComment[];
  commentCount?: number;
  people?: PodcastPerson[];
  lastPlayedPosition?: number;
  // Alternate enclosures (Podcasting 2.0) - for video, different qualities
  alternateSources?: MediaSource[];
}

// Global Player State Types (for mini player / persistent playback)
export type PlayerMediaMode = "audio" | "video";

export interface PlayerState {
  // Current episode being played
  episode: EpisodePlayerData | null;

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;

  // Media mode
  mediaMode: PlayerMediaMode;

  // Loading state
  isLoading: boolean;

  // Mini player visibility (when navigated away from episode page)
  showMiniPlayer: boolean;
}

export interface PlayerContextValue extends PlayerState {
  // Actions
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

  // Mini player control
  setShowMiniPlayer: (show: boolean) => void;
}

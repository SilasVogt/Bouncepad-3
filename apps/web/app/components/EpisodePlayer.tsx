import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
import { usePlayer } from "~/lib/player-context";
import {
  ArrowLeft,
  Share2,
  Heart,
  Play,
  Pause,
  MessageSquare,
  List,
  FileText,
  Info,
  Clock,
  Copy,
  Twitter,
  MessageCircle,
  Mail,
  ThumbsUp,
  Send,
  ExternalLink,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Video,
  Music,
  Settings,
  ChevronDown,
  Check,
  Maximize,
  Minimize,
  Users,
} from "lucide-react";
import type {
  EpisodePlayerData,
  EpisodeChapter,
  TranscriptSegment,
  EpisodeComment,
  PodcastFunding,
  PodcastPerson,
  HLSQualityLevel,
} from "@bouncepad/shared";
import {
  Card,
  Button,
  IconButton,
  Text,
  Avatar,
  VStack,
  HStack,
  Modal,
  Tabs,
  Switch,
} from "~/components/ui";

// Utility functions
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}

function getCurrentChapter(chapters: EpisodeChapter[] | undefined, currentTime: number): EpisodeChapter | null {
  if (!chapters || chapters.length === 0) return null;
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (currentTime >= chapters[i].startTime) {
      return chapters[i];
    }
  }
  return chapters[0];
}

function getActiveTranscriptSegment(segments: TranscriptSegment[] | undefined, currentTime: number): TranscriptSegment | null {
  if (!segments || segments.length === 0) return null;
  return segments.find(seg => currentTime >= seg.startTime && currentTime < seg.endTime) || null;
}

function isHLSSource(mimeType: string): boolean {
  return mimeType === "application/x-mpegURL" || mimeType === "application/vnd.apple.mpegurl";
}

interface EpisodePlayerProps {
  episode: EpisodePlayerData;
  onBack?: () => void;
  onShare?: (episodeId: string, method: string, timestamp?: number) => void;
  onFundingClick?: (url: string) => void;
  onCommentSubmit?: (text: string, episodeTimestamp?: number) => void;
  onCommentLike?: (commentId: string) => void;
}

type TabType = "chapters" | "transcript" | "description" | "people" | "comments";
type MediaMode = "audio" | "video";

// Chapter List Component
function ChapterList({
  chapters,
  currentTime,
  onSeek,
}: {
  chapters: EpisodeChapter[];
  currentTime: number;
  onSeek: (time: number) => void;
}) {
  const currentChapter = getCurrentChapter(chapters, currentTime);

  return (
    <VStack gap="sm">
      {chapters.map((chapter, index) => {
        const isActive = currentChapter?.id === chapter.id;
        const nextChapter = chapters[index + 1];
        const endTime = nextChapter ? nextChapter.startTime : undefined;

        return (
          <Card
            key={chapter.id}
            variant="glass"
            glassIntensity="subtle"
            padding="sm"
            radius="xl"
            pressable
            onPress={() => onSeek(chapter.startTime)}
            className={isActive ? "ring-1 ring-accent/30" : ""}
          >
            <HStack gap="md">
              {chapter.imageUrl ? (
                <img
                  src={chapter.imageUrl}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <List size={20} className="text-[var(--muted)]" />
                </div>
              )}
              <VStack gap="none" align="start" className="flex-1 min-w-0">
                <Text variant="body" weight="medium" numberOfLines={1} accent={isActive}>
                  {chapter.title}
                </Text>
                <Text variant="caption" muted className="tabular-nums">
                  {formatTime(chapter.startTime)}
                  {endTime && ` - ${formatTime(endTime)}`}
                </Text>
              </VStack>
              {isActive && (
                <Play size={16} className="text-accent fill-current" />
              )}
            </HStack>
          </Card>
        );
      })}
    </VStack>
  );
}

// Transcript View Component
function TranscriptView({
  segments,
  currentTime,
  onSeek,
}: {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
}) {
  const activeSegment = getActiveTranscriptSegment(segments, currentTime);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const active = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const activeRect = active.getBoundingClientRect();

      const scrollTop = active.offsetTop - container.offsetTop - containerRect.height / 2 + activeRect.height / 2;
      container.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, [activeSegment?.id]);

  return (
    <div ref={containerRef} className="space-y-1 max-h-[400px] overflow-y-auto scroll-smooth">
      {segments.map((segment) => {
        const isActive = activeSegment?.id === segment.id;
        return (
          <button
            key={segment.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => onSeek(segment.startTime)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
              isActive
                ? "bg-accent/10"
                : "hover:bg-[var(--border)]/30"
            }`}
          >
            <Text variant="caption" muted className="tabular-nums w-12 flex-shrink-0 pt-0.5">
              {formatTime(segment.startTime)}
            </Text>
            <div className="flex-1">
              {segment.speaker && (
                <Text variant="caption" weight="medium" accent className="mr-2 inline">
                  {segment.speaker}:
                </Text>
              )}
              <span className={isActive ? "text-accent font-medium" : ""}>
                {segment.text}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Comment Component
function Comment({
  comment,
  onLike,
  onSeek,
  isReply = false,
}: {
  comment: EpisodeComment;
  onLike?: (id: string) => void;
  onSeek?: (time: number) => void;
  isReply?: boolean;
}) {
  return (
    <div className={`flex gap-3 ${isReply ? "ml-12 mt-3" : ""}`}>
      <Avatar
        src={comment.userImageUrl}
        fallback={comment.userName}
        size="md"
      />
      <VStack gap="xs" align="start" className="flex-1 min-w-0">
        <HStack gap="sm">
          <Text variant="caption" weight="medium">{comment.userName}</Text>
          <Text variant="caption" muted>{formatRelativeTime(comment.timestamp)}</Text>
        </HStack>
        <Text variant="body">{comment.text}</Text>
        <HStack gap="md">
          {comment.episodeTimestamp !== undefined && onSeek && (
            <button
              onClick={() => onSeek(comment.episodeTimestamp!)}
              className="flex items-center gap-1.5 text-xs text-accent hover:underline"
            >
              <Clock size={12} />
              {formatTime(comment.episodeTimestamp)}
            </button>
          )}
          <button
            onClick={() => onLike?.(comment.id)}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              comment.isLiked ? "text-accent" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            <ThumbsUp size={12} className={comment.isLiked ? "fill-current" : ""} />
            {comment.likeCount || 0}
          </button>
        </HStack>
        {comment.replies && comment.replies.map((reply) => (
          <Comment key={reply.id} comment={reply} onLike={onLike} onSeek={onSeek} isReply />
        ))}
      </VStack>
    </div>
  );
}

// People Section Component
function PeopleSection({ people }: { people: PodcastPerson[] }) {
  return (
    <VStack gap="md">
      <Text variant="label" muted>Episode Credits</Text>
      <div className="grid gap-4 sm:grid-cols-2">
        {people.map((person) => (
          <Card key={person.id} variant="glass" glassIntensity="subtle" padding="sm" radius="xl">
            <HStack gap="md">
              <Avatar
                src={person.imageUrl}
                fallback={person.name}
                size="lg"
              />
              <VStack gap="none" align="start" className="min-w-0 flex-1">
                <Text variant="body" weight="semibold" numberOfLines={1}>{person.name}</Text>
                {person.role && (
                  <Text variant="caption" muted numberOfLines={1}>{person.role}</Text>
                )}
                {person.href && (
                  <a
                    href={person.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1"
                  >
                    Profile <ExternalLink size={10} />
                  </a>
                )}
              </VStack>
            </HStack>
          </Card>
        ))}
      </div>
    </VStack>
  );
}

// Comments Section Component
function CommentsSection({
  comments,
  commentCount,
  currentTime,
  onSubmit,
  onLike,
  onSeek,
}: {
  comments: EpisodeComment[];
  commentCount: number;
  currentTime: number;
  onSubmit?: (text: string, episodeTimestamp?: number) => void;
  onLike?: (id: string) => void;
  onSeek?: (time: number) => void;
}) {
  const [newComment, setNewComment] = useState("");
  const [includeTimestamp, setIncludeTimestamp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onSubmit?.(newComment, includeTimestamp ? Math.floor(currentTime) : undefined);
      setNewComment("");
      setIncludeTimestamp(false);
    }
  };

  return (
    <VStack gap="lg">
      {/* Comment Input */}
      <form onSubmit={handleSubmit}>
        <VStack gap="sm">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-3 rounded-xl bg-[var(--border)]/50 border border-[var(--border)] focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none text-sm"
            rows={2}
          />
          <HStack justify="between">
            <Switch
              value={includeTimestamp}
              onValueChange={setIncludeTimestamp}
              size="sm"
              label={`Include timestamp (${formatTime(Math.floor(currentTime))})`}
            />
            <Button
              variant="solid"
              size="sm"
              leftIcon={<Send size={14} />}
              disabled={!newComment.trim()}
              onPress={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            >
              Post
            </Button>
          </HStack>
        </VStack>
      </form>

      {/* Comments List */}
      <VStack gap="md">
        <Text variant="caption" muted>{commentCount} comments</Text>
        {comments.map((comment) => (
          <Comment key={comment.id} comment={comment} onLike={onLike} onSeek={onSeek} />
        ))}
      </VStack>
    </VStack>
  );
}

// Share Modal with timestamp option
function ShareModal({
  isOpen,
  episodeTitle,
  currentTime,
  onShare,
  onClose,
}: {
  isOpen: boolean;
  episodeTitle: string;
  currentTime: number;
  onShare: (method: string, timestamp?: number) => void;
  onClose: () => void;
}) {
  const [includeTimestamp, setIncludeTimestamp] = useState(false);

  const shareOptions = [
    { id: "copy", label: "Copy link", icon: <Copy size={20} /> },
    { id: "twitter", label: "Share on X", icon: <Twitter size={20} /> },
    { id: "mastodon", label: "Share on Mastodon", icon: <MessageCircle size={20} /> },
    { id: "email", label: "Share via email", icon: <Mail size={20} /> },
  ];

  return (
    <Modal visible={isOpen} onClose={onClose} title="Share Episode" size="sm">
      <VStack gap="md">
        <Text variant="caption" muted>
          Share <Text variant="caption" weight="medium" className="inline">{episodeTitle}</Text>
        </Text>

        {/* Timestamp Toggle */}
        <Card variant="glass" glassIntensity="subtle" padding="sm" radius="xl">
          <HStack justify="between">
            <VStack gap="none" align="start">
              <Text variant="caption" weight="medium">Start at {formatTime(Math.floor(currentTime))}</Text>
              <Text variant="caption" muted>Link will start playback at current time</Text>
            </VStack>
            <Switch
              value={includeTimestamp}
              onValueChange={setIncludeTimestamp}
              size="sm"
            />
          </HStack>
        </Card>

        <VStack gap="sm">
          {shareOptions.map((opt) => (
            <Card
              key={opt.id}
              variant="glass"
              glassIntensity="subtle"
              padding="sm"
              radius="xl"
              pressable
              onPress={() => {
                onShare(opt.id, includeTimestamp ? Math.floor(currentTime) : undefined);
                onClose();
              }}
            >
              <HStack gap="md">
                <div className="w-10 h-10 rounded-full bg-[var(--border)] flex items-center justify-center">
                  {opt.icon}
                </div>
                <Text variant="body" weight="medium">{opt.label}</Text>
              </HStack>
            </Card>
          ))}
        </VStack>
      </VStack>
    </Modal>
  );
}

// Funding Links Component
function FundingLinks({
  funding,
  onFundingClick,
}: {
  funding: PodcastFunding[];
  onFundingClick?: (url: string) => void;
}) {
  if (funding.length === 0) return null;

  return (
    <HStack gap="sm" wrap>
      {funding.map((fund, i) => (
        <Button
          key={i}
          variant="glass"
          size="sm"
          leftIcon={<Heart size={14} />}
          rightIcon={<ExternalLink size={12} />}
          onPress={() => onFundingClick?.(fund.url)}
        >
          {fund.platform || "Support"}
        </Button>
      ))}
    </HStack>
  );
}

// Media Mode Toggle (Audio/Video)
function MediaModeToggle({
  mode,
  hasVideo,
  onModeChange,
}: {
  mode: MediaMode;
  hasVideo: boolean;
  onModeChange: (mode: MediaMode) => void;
}) {
  if (!hasVideo) return null;

  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-[var(--border)]/50">
      <button
        onClick={() => onModeChange("audio")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          mode === "audio"
            ? "bg-accent text-[var(--accent-text)]"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        <Music size={14} />
        Audio
      </button>
      <button
        onClick={() => onModeChange("video")}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          mode === "video"
            ? "bg-accent text-[var(--accent-text)]"
            : "text-[var(--muted)] hover:text-[var(--foreground)]"
        }`}
      >
        <Video size={14} />
        Video
      </button>
    </div>
  );
}

// Quality Selector
function QualitySelector({
  levels,
  currentLevel,
  isAuto,
  isFullscreen,
  onLevelChange,
  onAutoChange,
}: {
  levels: HLSQualityLevel[];
  currentLevel: number;
  isAuto: boolean;
  isFullscreen?: boolean;
  onLevelChange: (level: number) => void;
  onAutoChange: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (levels.length === 0) return null;

  const currentQuality = isAuto
    ? "Auto"
    : levels[currentLevel]?.name || `${levels[currentLevel]?.height}p`;

  const buttonClass = isFullscreen
    ? "bg-white/20 hover:bg-white/30"
    : "bg-[var(--border)] hover:bg-[var(--border)]/70";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${buttonClass} text-sm font-medium transition-colors`}
      >
        <Settings size={14} />
        {currentQuality}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden min-w-[140px] text-[var(--foreground)]">
            <button
              onClick={() => { onAutoChange(); setIsOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[var(--border)]/50 transition-colors"
            >
              <span>Auto</span>
              {isAuto && <Check size={14} className="text-accent" />}
            </button>
            {levels.map((level, index) => (
              <button
                key={index}
                onClick={() => { onLevelChange(index); setIsOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[var(--border)]/50 transition-colors"
              >
                <span>{level.name || `${level.height}p`}</span>
                {!isAuto && currentLevel === index && <Check size={14} className="text-accent" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Media Player UI (shared between audio and video)
function MediaPlayerUI({
  isPlaying,
  currentTime,
  duration,
  isMuted,
  playbackRate,
  mediaMode,
  hasVideo,
  qualityLevels,
  currentQualityLevel,
  isAutoQuality,
  isFullscreen,
  onPlayPause,
  onSeek,
  onSkip,
  onMuteToggle,
  onRateChange,
  onModeChange,
  onQualityChange,
  onAutoQuality,
  onFullscreenToggle,
}: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  playbackRate: number;
  mediaMode: MediaMode;
  hasVideo: boolean;
  qualityLevels: HLSQualityLevel[];
  currentQualityLevel: number;
  isAutoQuality: boolean;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkip: (seconds: number) => void;
  onMuteToggle: () => void;
  onRateChange: () => void;
  onModeChange: (mode: MediaMode) => void;
  onQualityChange: (level: number) => void;
  onAutoQuality: () => void;
  onFullscreenToggle: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  const handleSliderInteraction = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    setDragTime(newTime);
    return newTime;
  }, [duration]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderInteraction(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleSliderInteraction(e.clientX);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const newTime = handleSliderInteraction(e.clientX);
      if (newTime !== undefined) {
        onSeek(newTime);
      }
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleSliderInteraction, onSeek]);

  // Fullscreen mode uses white/light colors for contrast against black background
  const textColor = isFullscreen ? "text-white" : "";
  const mutedColor = isFullscreen ? "text-white/60" : "text-[var(--muted)]";
  const trackBgColor = isFullscreen ? "bg-white/30" : "bg-[var(--border)]";

  return (
    <VStack gap="md" className={textColor}>
      {/* Progress Bar */}
      <VStack gap="sm">
        <div
          ref={sliderRef}
          className={`relative h-2 ${trackBgColor} rounded-full cursor-pointer group`}
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-accent rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>
        <HStack justify="between">
          <Text variant="caption" className={`${mutedColor} tabular-nums`}>{formatTime(displayTime)}</Text>
          <Text variant="caption" className={`${mutedColor} tabular-nums`}>{formatTime(duration)}</Text>
        </HStack>
      </VStack>

      {/* Controls */}
      <HStack justify="between" gap="md">
        {/* Left side: Mode toggle */}
        <div className="flex-1 flex justify-start">
          {!isFullscreen && (
            <MediaModeToggle mode={mediaMode} hasVideo={hasVideo} onModeChange={onModeChange} />
          )}
        </div>

        {/* Center: Playback controls */}
        <HStack gap="sm">
          <IconButton
            icon={<SkipBack size={22} />}
            variant="ghost"
            size="md"
            label="Back 15 seconds"
            onPress={() => onSkip(-15)}
          />

          <IconButton
            icon={isPlaying ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}
            variant="solid"
            size="xl"
            label={isPlaying ? "Pause" : "Play"}
            onPress={onPlayPause}
          />

          <IconButton
            icon={<SkipForward size={22} />}
            variant="ghost"
            size="md"
            label="Forward 15 seconds"
            onPress={() => onSkip(15)}
          />
        </HStack>

        {/* Right side: Rate, Quality, Volume, Fullscreen */}
        <HStack gap="sm" className="flex-1 justify-end">
          <button
            onClick={onRateChange}
            className={`px-2.5 py-1 rounded-full ${isFullscreen ? "bg-white/20 hover:bg-white/30" : "bg-[var(--border)] hover:bg-[var(--border)]/70"} text-sm font-medium tabular-nums transition-colors`}
          >
            {playbackRate}x
          </button>

          {mediaMode === "video" && qualityLevels.length > 0 && (
            <QualitySelector
              levels={qualityLevels}
              currentLevel={currentQualityLevel}
              isAuto={isAutoQuality}
              isFullscreen={isFullscreen}
              onLevelChange={onQualityChange}
              onAutoChange={onAutoQuality}
            />
          )}

          <IconButton
            icon={isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            variant="ghost"
            size="sm"
            label={isMuted ? "Unmute" : "Mute"}
            onPress={onMuteToggle}
          />

          {mediaMode === "video" && (
            <IconButton
              icon={isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              variant="ghost"
              size="sm"
              label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onPress={onFullscreenToggle}
            />
          )}
        </HStack>
      </HStack>
    </VStack>
  );
}

// Main Episode Player Component
export function EpisodePlayer({
  episode,
  onBack,
  onShare,
  onFundingClick,
  onCommentSubmit,
  onCommentLike,
}: EpisodePlayerProps) {
  // Use player context for audio playback
  const player = usePlayer();

  const [activeTab, setActiveTab] = useState<TabType>(
    episode.chapters?.length ? "chapters" : "description"
  );
  const [showShare, setShowShare] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Media mode from context (synced)
  const mediaMode = player.mediaMode;
  const setMediaModeLocal = player.setMediaMode;

  // Quality state
  const [qualityLevels, setQualityLevels] = useState<HLSQualityLevel[]>([]);
  const [currentQualityLevel, setCurrentQualityLevel] = useState(-1);
  const [isAutoQuality, setIsAutoQuality] = useState(true);

  // Video state (separate from audio which uses context)
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(episode.duration || 0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Derive playback state based on mode
  const isPlaying = mediaMode === "video" ? isVideoPlaying : player.isPlaying;
  const currentTime = mediaMode === "video" ? videoCurrentTime : player.currentTime;
  const duration = mediaMode === "video" ? videoDuration : (player.duration > 0 ? player.duration : episode.duration || 0);
  const playbackRate = player.playbackRate;

  const currentChapter = getCurrentChapter(episode.chapters, currentTime);
  const displayImage = currentChapter?.imageUrl || episode.imageUrl || episode.podcastImageUrl;

  // Determine available sources
  const videoSources = episode.alternateSources?.filter(s => s.type === "video") || [];
  const hasVideo = videoSources.length > 0;
  const currentVideoSource = videoSources[0];

  // Load episode into player context if not already loaded
  useEffect(() => {
    if (!player.episode || player.episode.id !== episode.id) {
      player.loadEpisode(episode, episode.lastPlayedPosition);
    }
  }, [episode.id]);

  // Track if we've done initial video sync when returning to video mode
  const videoInitialSyncDoneRef = useRef(false);

  // Reset sync flag when switching modes
  useEffect(() => {
    if (mediaMode === "audio") {
      videoInitialSyncDoneRef.current = false;
    }
  }, [mediaMode]);

  // When unmounting while in video mode, start audio for the mini player
  const mediaModeRef = useRef(mediaMode);
  const isVideoPlayingRef = useRef(isVideoPlaying);
  useEffect(() => {
    mediaModeRef.current = mediaMode;
    isVideoPlayingRef.current = isVideoPlaying;
  }, [mediaMode, isVideoPlaying]);

  useEffect(() => {
    return () => {
      // If we were in video mode, pause the video and start audio if it was playing
      if (mediaModeRef.current === "video") {
        videoRef.current?.pause();
        if (isVideoPlayingRef.current) {
          player.play();
        }
      }
    };
  }, [player.play]);

  // Keep refs for current audio state to use in video sync without causing effect reruns
  const audioTimeRef = useRef(player.currentTime);
  const audioPlayingRef = useRef(player.isPlaying);
  useEffect(() => {
    audioTimeRef.current = player.currentTime;
    audioPlayingRef.current = player.isPlaying;
  }, [player.currentTime, player.isPlaying]);

  // Setup HLS for video
  useEffect(() => {
    if (mediaMode !== "video" || !currentVideoSource || !videoRef.current) return;

    const video = videoRef.current;
    const isHLS = isHLSSource(currentVideoSource.mimeType);

    const performInitialSync = () => {
      if (videoInitialSyncDoneRef.current) return;
      videoInitialSyncDoneRef.current = true;

      if (audioTimeRef.current > 0) {
        video.currentTime = audioTimeRef.current;
        setVideoCurrentTime(audioTimeRef.current);
      }

      if (audioPlayingRef.current) {
        video.play().catch(() => {});
      }
    };

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(currentVideoSource.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels: HLSQualityLevel[] = data.levels.map((level, index) => ({
          height: level.height,
          width: level.width,
          bitrate: level.bitrate,
          codecs: level.codecs,
          name: level.height ? `${level.height}p` : `Level ${index}`,
        }));
        setQualityLevels(levels.sort((a, b) => b.height - a.height));

        requestAnimationFrame(() => {
          if (video.readyState >= 2) {
            performInitialSync();
          } else {
            video.addEventListener("canplay", performInitialSync, { once: true });
          }
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQualityLevel(data.level);
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType(currentVideoSource.mimeType)) {
      video.src = currentVideoSource.url;
      video.addEventListener("canplay", performInitialSync, { once: true });
    }
  }, [mediaMode, currentVideoSource]);

  // Video event handlers
  useEffect(() => {
    if (mediaMode !== "video" || !videoRef.current) return;

    const video = videoRef.current;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setVideoCurrentTime(time);
      const audio = player.audioRef.current;
      if (audio && Math.abs(audio.currentTime - time) > 2) {
        player.seek(time);
      }
    };
    const handleLoadedMetadata = () => setVideoDuration(video.duration || episode.duration || 0);
    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [mediaMode, episode.duration, player.audioRef, player.seek]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handlePlayPause = () => {
    if (mediaMode === "video") {
      const video = videoRef.current;
      if (!video) return;
      if (isVideoPlaying) {
        video.pause();
      } else {
        video.play();
      }
    } else {
      player.togglePlayPause();
    }
  };

  const handleSeek = (time: number) => {
    if (mediaMode === "video") {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = time;
    } else {
      player.seek(time);
    }
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
  };

  const handleMuteToggle = () => {
    if (mediaMode === "video") {
      const video = videoRef.current;
      if (!video) return;
      video.muted = !video.muted;
      setIsMuted(!isMuted);
    } else {
      const audio = player.audioRef.current;
      if (!audio) return;
      audio.muted = !audio.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleRateChange = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];

    if (mediaMode === "video") {
      const video = videoRef.current;
      if (video) video.playbackRate = nextRate;
    }
    player.setPlaybackRate(nextRate);
  };

  const handleModeChange = (mode: MediaMode) => {
    const wasPlaying = isPlaying;
    const savedTime = currentTime;

    if (mediaMode === "video") {
      videoRef.current?.pause();
    } else {
      player.pause();
    }

    setMediaModeLocal(mode);

    if (mode === "video") {
      setVideoCurrentTime(savedTime);
      setTimeout(() => {
        const video = videoRef.current;
        if (video) {
          video.currentTime = savedTime;
          if (wasPlaying) video.play();
        }
      }, 100);
    } else {
      player.seek(savedTime);
      if (wasPlaying) player.play();
    }
  };

  const handleQualityChange = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setIsAutoQuality(false);
    }
  };

  const handleAutoQuality = () => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = -1;
      setIsAutoQuality(true);
    }
  };

  const handleFullscreenToggle = () => {
    if (!videoContainerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoContainerRef.current.requestFullscreen();
    }
  };

  const handleShare = (method: string, timestamp?: number) => {
    onShare?.(episode.id, method, timestamp);
  };

  // Build tabs
  const tabItems = [
    ...(episode.chapters?.length ? [{ key: "chapters" as const, label: "Chapters", icon: <List size={16} /> }] : []),
    ...(episode.transcript?.length ? [{ key: "transcript" as const, label: "Transcript", icon: <FileText size={16} /> }] : []),
    ...(episode.people?.length ? [{ key: "people" as const, label: "People", icon: <Users size={16} /> }] : []),
    { key: "description" as const, label: "About", icon: <Info size={16} /> },
    { key: "comments" as const, label: `Comments (${episode.commentCount || 0})`, icon: <MessageSquare size={16} /> },
  ];

  return (
    <div className="min-h-screen">
      {/* Gradient backdrop */}
      <div
        className="absolute inset-x-0 top-0 h-80 pointer-events-none motion-safe:motion-opacity-in-0 motion-safe:motion-duration-1000"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, var(--accent-main) 15%, transparent) 0%, var(--background) 100%)`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <HStack justify="between" className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft size={16} />
              {episode.podcastTitle}
            </button>
          )}
          <Button
            variant="glass"
            size="sm"
            leftIcon={<Share2 size={16} />}
            onPress={() => setShowShare(true)}
          >
            Share
          </Button>
        </HStack>

        {/* Video Player (when in video mode) */}
        {mediaMode === "video" && hasVideo && (
          <div
            ref={videoContainerRef}
            className={`relative mb-8 rounded-2xl overflow-hidden bg-black ${
              isFullscreen ? "fixed inset-0 z-50 rounded-none" : "aspect-video"
            }`}
          >
            <video
              ref={videoRef}
              className="w-full h-full"
              playsInline
              onClick={handlePlayPause}
            />
            {/* Video overlay controls when fullscreen */}
            {isFullscreen && (
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <MediaPlayerUI
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  isMuted={isMuted}
                  playbackRate={playbackRate}
                  mediaMode={mediaMode}
                  hasVideo={hasVideo}
                  qualityLevels={qualityLevels}
                  currentQualityLevel={currentQualityLevel}
                  isAutoQuality={isAutoQuality}
                  isFullscreen={isFullscreen}
                  onPlayPause={handlePlayPause}
                  onSeek={handleSeek}
                  onSkip={handleSkip}
                  onMuteToggle={handleMuteToggle}
                  onRateChange={handleRateChange}
                  onModeChange={handleModeChange}
                  onQualityChange={handleQualityChange}
                  onAutoQuality={handleAutoQuality}
                  onFullscreenToggle={handleFullscreenToggle}
                />
              </div>
            )}
          </div>
        )}

        {/* Episode Info (when in audio mode or not fullscreen) */}
        {(mediaMode === "audio" || !isFullscreen) && (
          <HStack gap="lg" className="mb-8">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 transition-all duration-500">
              {displayImage ? (
                <img src={displayImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent to-accent/50" />
              )}
            </div>
            <VStack gap="xs" align="start" className="flex-1 min-w-0">
              <Text variant="h4" numberOfLines={2}>{episode.title}</Text>
              <Text variant="caption" muted>
                {episode.podcastTitle} · {formatDate(episode.pubDate)}
              </Text>
              {currentChapter && (
                <Text variant="caption" accent numberOfLines={1}>
                  {currentChapter.title}
                </Text>
              )}
            </VStack>
          </HStack>
        )}

        {/* Player Controls (when not in fullscreen video) */}
        {!isFullscreen && (
          <Card variant="glass" padding="lg" radius="xl" className="mb-8">
            <MediaPlayerUI
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              isMuted={isMuted}
              playbackRate={playbackRate}
              mediaMode={mediaMode}
              hasVideo={hasVideo}
              qualityLevels={qualityLevels}
              currentQualityLevel={currentQualityLevel}
              isAutoQuality={isAutoQuality}
              isFullscreen={isFullscreen}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onSkip={handleSkip}
              onMuteToggle={handleMuteToggle}
              onRateChange={handleRateChange}
              onModeChange={handleModeChange}
              onQualityChange={handleQualityChange}
              onAutoQuality={handleAutoQuality}
              onFullscreenToggle={handleFullscreenToggle}
            />
          </Card>
        )}

        {/* Funding Links */}
        {episode.funding && episode.funding.length > 0 && !isFullscreen && (
          <div className="mb-8">
            <FundingLinks funding={episode.funding} onFundingClick={onFundingClick} />
          </div>
        )}

        {/* Content Tabs */}
        {!isFullscreen && (
          <>
            <Tabs
              items={tabItems}
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as TabType)}
              variant="underline"
              size="md"
            />

            {/* Tab Content */}
            <div className="py-6">
              {activeTab === "chapters" && episode.chapters && (
                <ChapterList
                  chapters={episode.chapters}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
              )}

              {activeTab === "transcript" && episode.transcript && (
                <TranscriptView
                  segments={episode.transcript}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                />
              )}

              {activeTab === "description" && (
                <Text variant="body" muted className="leading-relaxed whitespace-pre-wrap">
                  {episode.description || "No description available."}
                </Text>
              )}

              {activeTab === "people" && episode.people && (
                <PeopleSection people={episode.people} />
              )}

              {activeTab === "comments" && (
                <CommentsSection
                  comments={episode.comments || []}
                  commentCount={episode.commentCount || 0}
                  currentTime={currentTime}
                  onSubmit={onCommentSubmit}
                  onLike={onCommentLike}
                  onSeek={handleSeek}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShare}
        episodeTitle={episode.title}
        currentTime={currentTime}
        onShare={handleShare}
        onClose={() => setShowShare(false)}
      />
    </div>
  );
}

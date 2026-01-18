import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView, VideoViewRef } from "expo-video";
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
  Capability,
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import Slider from "@react-native-community/slider";
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import type {
  EpisodePlayerData,
  EpisodeChapter,
  TranscriptSegment,
  EpisodeComment,
  PodcastPerson,
} from "@bouncepad/shared";
import { useTheme } from "../lib/theme";
import { usePlayer } from "../lib/player-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Utility functions
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
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

interface EpisodePlayerProps {
  episode: EpisodePlayerData;
  onBack?: () => void;
  onShare?: (episodeId: string, method: string, timestamp?: number) => void;
  onFundingClick?: (url: string) => void;
  onCommentSubmit?: (text: string, episodeTimestamp?: number) => void;
  onCommentLike?: (commentId: string) => void;
}

type MediaMode = "audio" | "video";

// Setup track player
let isTrackPlayerSetup = false;

async function setupTrackPlayer() {
  if (isTrackPlayerSetup) return;

  try {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });

    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.JumpForward,
        Capability.JumpBackward,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SeekTo],
      progressUpdateEventInterval: 1,
      forwardJumpInterval: 15,
      backwardJumpInterval: 15,
    });

    isTrackPlayerSetup = true;
  } catch (error) {
    console.log("Track player already initialized or error:", error);
    isTrackPlayerSetup = true;
  }
}

// Player Controls Component - centered play with skip buttons only
function PlayerControls({
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  colors,
}: {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  colors: any;
}) {
  return (
    <View style={styles.controls}>
      <Pressable onPress={onSkipBack} style={styles.controlButton}>
        <Ionicons name="play-back" size={28} color={colors.foreground} />
        <Text style={[styles.skipLabel, { color: colors.muted }]}>15</Text>
      </Pressable>

      <Pressable
        onPress={onPlayPause}
        style={[styles.playButton, { backgroundColor: colors.accent.main }]}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={32}
          color="#fff"
        />
      </Pressable>

      <Pressable onPress={onSkipForward} style={styles.controlButton}>
        <Ionicons name="play-forward" size={28} color={colors.foreground} />
        <Text style={[styles.skipLabel, { color: colors.muted }]}>15</Text>
      </Pressable>
    </View>
  );
}

// Scrubbar with chapter markers
function Scrubbar({
  currentTime,
  duration,
  chapters,
  onSeek,
  onSlidingStart,
  onSlidingComplete,
  colors,
}: {
  currentTime: number;
  duration: number;
  chapters?: EpisodeChapter[];
  onSeek: (time: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: (time: number) => void;
  colors: any;
}) {
  const [localTime, setLocalTime] = useState(currentTime);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    if (!isSliding) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isSliding]);

  const safeDuration = duration > 0 ? duration : 1;

  return (
    <View style={styles.scrubbar}>
      <Text style={[styles.timeTextLeft, { color: colors.muted }]}>{formatTime(localTime)}</Text>
      <View style={styles.sliderContainer}>
        <Slider
          value={localTime}
          minimumValue={0}
          maximumValue={safeDuration}
          onValueChange={setLocalTime}
          onSlidingStart={() => {
            setIsSliding(true);
            onSlidingStart?.();
          }}
          onSlidingComplete={(value) => {
            setIsSliding(false);
            onSlidingComplete?.(value);
          }}
          minimumTrackTintColor={colors.accent.main}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent.main}
          style={styles.slider}
        />
        {/* Chapter markers - filter out markers too close to start/end */}
        {chapters && safeDuration > 1 && (
          <View style={styles.chapterMarkers}>
            {chapters
              .filter((chapter) => chapter.startTime > 5 && chapter.startTime < safeDuration - 5)
              .map((chapter) => (
                <View
                  key={chapter.id}
                  style={[
                    styles.chapterMarker,
                    {
                      left: `${(chapter.startTime / safeDuration) * 100}%`,
                      backgroundColor: colors.foreground + "60",
                    },
                  ]}
                />
              ))}
          </View>
        )}
      </View>
      <Text style={[styles.timeTextRight, { color: colors.muted }]}>{formatTime(safeDuration)}</Text>
    </View>
  );
}

// Toggle Row with Mode, Speed, and action buttons
function ToggleRow({
  mediaMode,
  hasVideo,
  playbackRate,
  onModeChange,
  onRateChange,
  colors,
}: {
  mediaMode: MediaMode;
  hasVideo: boolean;
  playbackRate: number;
  onModeChange: (mode: MediaMode) => void;
  onRateChange: () => void;
  colors: any;
}) {
  return (
    <View style={styles.toggleRow}>
      {hasVideo && (
        <View style={[styles.modeToggle, { backgroundColor: colors.border + "50" }]}>
          <Pressable
            onPress={() => onModeChange("audio")}
            style={[
              styles.modeButton,
              mediaMode === "audio" && { backgroundColor: colors.accent.main },
            ]}
          >
            <Ionicons
              name="musical-notes"
              size={14}
              color={mediaMode === "audio" ? "#fff" : colors.muted}
            />
            <Text
              style={[
                styles.modeButtonText,
                { color: mediaMode === "audio" ? "#fff" : colors.muted },
              ]}
            >
              Audio
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onModeChange("video")}
            style={[
              styles.modeButton,
              mediaMode === "video" && { backgroundColor: colors.accent.main },
            ]}
          >
            <Ionicons
              name="videocam"
              size={14}
              color={mediaMode === "video" ? "#fff" : colors.muted}
            />
            <Text
              style={[
                styles.modeButtonText,
                { color: mediaMode === "video" ? "#fff" : colors.muted },
              ]}
            >
              Video
            </Text>
          </Pressable>
        </View>
      )}
      <Pressable onPress={onRateChange} style={[styles.rateButton, { backgroundColor: colors.border }]}>
        <Text style={[styles.rateText, { color: colors.foreground }]}>{playbackRate}x</Text>
      </Pressable>
    </View>
  );
}

// Chapter List for bottom sheet
function ChapterList({
  chapters,
  currentTime,
  onSeek,
  colors,
}: {
  chapters: EpisodeChapter[];
  currentTime: number;
  onSeek: (time: number) => void;
  colors: any;
}) {
  const currentChapter = getCurrentChapter(chapters, currentTime);

  return (
    <View style={styles.sheetContent}>
      {chapters.map((chapter, index) => {
        const isActive = currentChapter?.id === chapter.id;
        const nextChapter = chapters[index + 1];
        const endTime = nextChapter ? nextChapter.startTime : undefined;

        return (
          <Pressable
            key={chapter.id}
            onPress={() => onSeek(chapter.startTime)}
            style={[
              styles.chapterItem,
              isActive && { backgroundColor: colors.accent.main + "15" },
            ]}
          >
            {chapter.imageUrl ? (
              <Image source={{ uri: chapter.imageUrl }} style={styles.chapterImage} />
            ) : (
              <View style={[styles.chapterImage, { backgroundColor: colors.border }]}>
                <Ionicons name="list" size={20} color={colors.muted} />
              </View>
            )}
            <View style={styles.chapterInfo}>
              <Text
                style={[
                  styles.chapterTitle,
                  { color: isActive ? colors.accent.main : colors.foreground },
                ]}
                numberOfLines={1}
              >
                {chapter.title}
              </Text>
              <Text style={[styles.chapterTime, { color: colors.muted }]}>
                {formatTime(chapter.startTime)}
                {endTime && ` - ${formatTime(endTime)}`}
              </Text>
            </View>
            {isActive && (
              <Ionicons name="play" size={16} color={colors.accent.main} style={{ marginLeft: 8 }} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// Transcript View for bottom sheet
function TranscriptView({
  segments,
  currentTime,
  onSeek,
  colors,
}: {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  colors: any;
}) {
  const activeSegment = getActiveTranscriptSegment(segments, currentTime);

  return (
    <View style={styles.sheetContent}>
      {segments.map((segment) => {
        const isActive = activeSegment?.id === segment.id;
        return (
          <Pressable
            key={segment.id}
            onPress={() => onSeek(segment.startTime)}
            style={[
              styles.transcriptItem,
              isActive && { backgroundColor: colors.accent.main + "10" },
            ]}
          >
            <Text style={[styles.transcriptTime, { color: colors.muted }]}>
              {formatTime(segment.startTime)}
            </Text>
            <View style={styles.transcriptTextContainer}>
              {segment.speaker && (
                <Text style={[styles.transcriptSpeaker, { color: colors.accent.main }]}>
                  {segment.speaker}:
                </Text>
              )}
              <Text
                style={[
                  styles.transcriptText,
                  { color: isActive ? colors.accent.main : colors.foreground },
                  isActive && { fontWeight: "600" },
                ]}
              >
                {segment.text}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// People List for bottom sheet
function PeopleList({
  people,
  colors,
}: {
  people: PodcastPerson[];
  colors: any;
}) {
  return (
    <View style={styles.sheetContent}>
      {people.map((person) => (
        <View
          key={person.id}
          style={[styles.personItem, { backgroundColor: colors.border + "30" }]}
        >
          <View style={[styles.personAvatar, { backgroundColor: colors.border }]}>
            {person.imageUrl ? (
              <Image source={{ uri: person.imageUrl }} style={styles.personAvatarImage} />
            ) : (
              <Ionicons name="person" size={24} color={colors.muted} />
            )}
          </View>
          <View style={styles.personInfo}>
            <Text style={[styles.personName, { color: colors.foreground }]}>
              {person.name}
            </Text>
            {person.role && (
              <Text style={[styles.personRole, { color: colors.muted }]}>
                {person.role}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

// Comment Component
function Comment({
  comment,
  onLike,
  onSeek,
  colors,
  isReply = false,
}: {
  comment: EpisodeComment;
  onLike?: (id: string) => void;
  onSeek?: (time: number) => void;
  colors: any;
  isReply?: boolean;
}) {
  return (
    <View style={[styles.commentContainer, isReply && styles.commentReply]}>
      <View style={[styles.commentAvatar, { backgroundColor: colors.border }]}>
        {comment.userImageUrl ? (
          <Image source={{ uri: comment.userImageUrl }} style={styles.commentAvatarImage} />
        ) : (
          <Ionicons name="person" size={16} color={colors.muted} />
        )}
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentUserName, { color: colors.foreground }]}>
            {comment.userName}
          </Text>
          <Text style={[styles.commentTime, { color: colors.muted }]}>
            {formatRelativeTime(comment.timestamp)}
          </Text>
        </View>
        <Text style={[styles.commentText, { color: colors.foreground }]}>{comment.text}</Text>
        <View style={styles.commentActions}>
          {comment.episodeTimestamp !== undefined && onSeek && (
            <Pressable
              onPress={() => onSeek(comment.episodeTimestamp!)}
              style={styles.commentAction}
            >
              <Ionicons name="time-outline" size={12} color={colors.accent.main} />
              <Text style={[styles.commentActionText, { color: colors.accent.main }]}>
                {formatTime(comment.episodeTimestamp)}
              </Text>
            </Pressable>
          )}
          <Pressable onPress={() => onLike?.(comment.id)} style={styles.commentAction}>
            <Ionicons
              name={comment.isLiked ? "thumbs-up" : "thumbs-up-outline"}
              size={12}
              color={comment.isLiked ? colors.accent.main : colors.muted}
            />
            <Text
              style={[
                styles.commentActionText,
                { color: comment.isLiked ? colors.accent.main : colors.muted },
              ]}
            >
              {comment.likeCount || 0}
            </Text>
          </Pressable>
        </View>
        {comment.replies?.map((reply) => (
          <Comment
            key={reply.id}
            comment={reply}
            onLike={onLike}
            onSeek={onSeek}
            colors={colors}
            isReply
          />
        ))}
      </View>
    </View>
  );
}

// Share Modal
function ShareModal({
  visible,
  episodeTitle,
  currentTime,
  colors,
  onShare,
  onClose,
}: {
  visible: boolean;
  episodeTitle: string;
  currentTime: number;
  colors: any;
  onShare: (method: string, timestamp?: number) => void;
  onClose: () => void;
}) {
  const [includeTimestamp, setIncludeTimestamp] = useState(false);

  const shareOptions = [
    { id: "copy", label: "Copy link", icon: "link-outline" as const },
    { id: "x", label: "Share on X", icon: "logo-twitter" as const },
    { id: "mastodon", label: "Share on Mastodon", icon: "share-social-outline" as const },
    { id: "email", label: "Share via email", icon: "mail-outline" as const },
  ];

  const handleShare = (method: string) => {
    onShare(method, includeTimestamp ? Math.floor(currentTime) : undefined);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalContent, { backgroundColor: colors.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconContainer, { backgroundColor: colors.accent.main + "20" }]}>
              <Ionicons name="share-outline" size={20} color={colors.accent.main} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Share Episode</Text>
            <Pressable
              onPress={onClose}
              style={[styles.modalCloseButton, { backgroundColor: colors.border }]}
            >
              <Ionicons name="close" size={20} color={colors.foreground} />
            </Pressable>
          </View>

          <Text style={[styles.shareSubtitle, { color: colors.muted }]}>
            Share {episodeTitle}
          </Text>

          {/* Timestamp Toggle */}
          <Pressable
            onPress={() => setIncludeTimestamp(!includeTimestamp)}
            style={[styles.timestampToggle, { backgroundColor: colors.border + "40" }]}
          >
            <View
              style={[
                styles.checkbox,
                includeTimestamp
                  ? { backgroundColor: colors.accent.main, borderColor: colors.accent.main }
                  : { borderColor: colors.border },
              ]}
            >
              {includeTimestamp && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <View style={styles.timestampToggleText}>
              <Text style={[styles.timestampLabel, { color: colors.foreground }]}>
                Start at {formatTime(Math.floor(currentTime))}
              </Text>
              <Text style={[styles.timestampDesc, { color: colors.muted }]}>
                Link will start playback at current time
              </Text>
            </View>
          </Pressable>

          <View style={styles.shareOptions}>
            {shareOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => handleShare(option.id)}
                style={[styles.shareOption, { backgroundColor: colors.border + "60" }]}
              >
                <Ionicons name={option.icon} size={20} color={colors.foreground} />
                <Text style={[styles.shareOptionText, { color: colors.foreground }]}>
                  {option.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function EpisodePlayer({
  episode,
  onBack,
  onShare,
  onFundingClick,
  onCommentSubmit,
  onCommentLike,
}: EpisodePlayerProps) {
  const { colors } = useTheme();
  const { mediaMode, setMediaMode } = usePlayer();
  const chaptersSheetRef = useRef<BottomSheet>(null);
  const transcriptSheetRef = useRef<BottomSheet>(null);
  const peopleSheetRef = useRef<BottomSheet>(null);
  const videoViewRef = useRef<VideoViewRef>(null);

  // Track player state
  const playbackState = usePlaybackState();
  const { position, duration: trackDuration } = useProgress();

  const [playbackRate, setPlaybackRate] = useState(1);
  const [showShare, setShowShare] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [includeTimestampInComment, setIncludeTimestampInComment] = useState(false);
  const [isTrackPlayerReady, setIsTrackPlayerReady] = useState(false);
  const mediaModeRef = useRef(mediaMode);

  // Video state
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const snapPoints = useMemo(() => ["50%", "90%"], []);

  // Determine sources
  const videoSources = episode.alternateSources?.filter(s => s.type === "video") || [];
  const hasVideo = videoSources.length > 0;
  const currentVideoSource = videoSources[0];
  const hasPeople = episode.people && episode.people.length > 0;

  // Video player (expo-video)
  const videoPlayer = useVideoPlayer(
    hasVideo && currentVideoSource ? currentVideoSource.url : null,
    (player) => {
      player.loop = false;
      // Try to get duration immediately if available
      if (player.duration > 0) {
        setVideoDuration(player.duration);
      }
    }
  );

  // Keep media mode ref in sync
  useEffect(() => {
    mediaModeRef.current = mediaMode;
  }, [mediaMode]);

  // Initialize video duration from episode if not available from player
  useEffect(() => {
    if (mediaMode === "video" && videoDuration === 0 && episode.duration) {
      setVideoDuration(episode.duration);
    }
  }, [mediaMode, episode.duration, videoDuration]);

  // When unmounting while in video mode, switch to audio for the mini player
  useEffect(() => {
    return () => {
      if (mediaModeRef.current === "video" && videoPlayer) {
        const currentVideoTime = videoPlayer.currentTime;
        const wasPlaying = videoPlayer.playing;
        // Seek TrackPlayer to the video position and play if video was playing
        TrackPlayer.seekTo(currentVideoTime).then(() => {
          if (wasPlaying) {
            TrackPlayer.play();
          }
        });
      }
    };
  }, [videoPlayer]);

  // Derive state based on mode
  const isPlaying = mediaMode === "video"
    ? isVideoPlaying
    : playbackState.state === State.Playing;

  const currentTime = mediaMode === "video" ? videoCurrentTime : position;
  // Use videoDuration if available, otherwise fall back to episode.duration
  const duration = mediaMode === "video"
    ? (videoDuration > 0 ? videoDuration : episode.duration || 0)
    : (trackDuration > 0 ? trackDuration : episode.duration || 0);

  const currentChapter = getCurrentChapter(episode.chapters, currentTime);
  const displayImage = currentChapter?.imageUrl || episode.imageUrl || episode.podcastImageUrl;

  // Animation values
  const coverScale = useSharedValue(0.9);
  const coverOpacity = useSharedValue(0);

  useEffect(() => {
    const timing = { duration: 500, easing: Easing.out(Easing.cubic) };
    coverScale.value = withTiming(1, timing);
    coverOpacity.value = withTiming(1, timing);
  }, []);

  const coverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coverScale.value }],
    opacity: coverOpacity.value,
  }));

  // Initialize track player and load track
  useEffect(() => {
    const init = async () => {
      await setupTrackPlayer();
      setIsTrackPlayerReady(true);

      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: episode.id,
        url: episode.audioUrl,
        title: episode.title,
        artist: episode.podcastTitle,
        artwork: displayImage || undefined,
        duration: episode.duration,
      });

      // Seek to last position
      if (episode.lastPlayedPosition && episode.lastPlayedPosition > 0) {
        await TrackPlayer.seekTo(episode.lastPlayedPosition);
      }
    };

    init();

    return () => {
      TrackPlayer.reset();
    };
  }, [episode.id]);

  // Update track metadata when chapter changes
  useTrackPlayerEvents([Event.PlaybackProgressUpdated], async () => {
    if (currentChapter && isTrackPlayerReady) {
      const currentTrack = await TrackPlayer.getActiveTrack();
      if (currentTrack && currentTrack.title !== currentChapter.title) {
        await TrackPlayer.updateNowPlayingMetadata({
          title: currentChapter.title,
          artist: episode.podcastTitle,
          artwork: currentChapter.imageUrl || displayImage || undefined,
        });
      }
    }
  });

  // Video event listeners
  useEffect(() => {
    if (!videoPlayer) return;

    const timeUpdateSub = videoPlayer.addListener("timeUpdate", (payload) => {
      setVideoCurrentTime(payload.currentTime);
      // Get duration from player property or payload
      const dur = videoPlayer.duration || payload.duration || episode.duration || 0;
      if (dur > 0) {
        setVideoDuration(dur);
      }
    });

    const playingSub = videoPlayer.addListener("playingChange", (payload) => {
      setIsVideoPlaying(payload.isPlaying);
    });

    const statusSub = videoPlayer.addListener("statusChange", (payload) => {
      // Track loading state
      setIsVideoLoading(payload.status === "loading");

      // When status becomes readyToPlay, duration should be available
      if (payload.status === "readyToPlay" && videoPlayer.duration > 0) {
        setVideoDuration(videoPlayer.duration);
        setIsVideoLoading(false);
      }
    });

    return () => {
      timeUpdateSub.remove();
      playingSub.remove();
      statusSub.remove();
    };
  }, [videoPlayer, episode.duration]);

  // Polling fallback for video time updates (expo-video timeUpdate can be unreliable)
  useEffect(() => {
    if (!videoPlayer || mediaMode !== "video") return;

    const interval = setInterval(() => {
      if (videoPlayer.playing) {
        const time = videoPlayer.currentTime;
        if (typeof time === "number" && !isNaN(time)) {
          setVideoCurrentTime(time);
        }
        const dur = videoPlayer.duration;
        if (typeof dur === "number" && dur > 0) {
          setVideoDuration(dur);
        }
      }
    }, 250); // Update 4 times per second

    return () => clearInterval(interval);
  }, [videoPlayer, mediaMode]);

  // Handle mode change - sync playback position
  const handleModeChange = async (mode: MediaMode) => {
    const savedTime = currentTime;

    if (mediaMode === "audio" && mode === "video") {
      // Switching from audio to video
      setIsVideoLoading(true);
      await TrackPlayer.pause();
      if (videoPlayer) {
        videoPlayer.currentTime = savedTime;
        videoPlayer.play();
      }
    } else if (mediaMode === "video" && mode === "audio") {
      // Switching from video to audio
      if (videoPlayer) {
        videoPlayer.pause();
      }
      await TrackPlayer.seekTo(savedTime);
      await TrackPlayer.play();
    }

    setMediaMode(mode);
  };

  const handlePlayPause = async () => {
    if (mediaMode === "video") {
      if (isVideoPlaying) {
        videoPlayer?.pause();
      } else {
        videoPlayer?.play();
      }
    } else {
      if (isPlaying) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    }
  };

  const handleSeek = async (time: number) => {
    if (mediaMode === "video" && videoPlayer) {
      // Update local state immediately so scrubbar doesn't snap back
      setVideoCurrentTime(time);
      try {
        videoPlayer.currentTime = time;
      } catch (e) {
        console.log("Video seek error:", e);
      }
    } else {
      await TrackPlayer.seekTo(time);
    }
  };

  const handleSkipBack = async () => {
    const newTime = Math.max(0, currentTime - 15);
    await handleSeek(newTime);
  };

  const handleSkipForward = async () => {
    const newTime = Math.min(duration, currentTime + 15);
    await handleSeek(newTime);
  };

  const handleRateChange = async () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);

    if (mediaMode === "video" && videoPlayer) {
      videoPlayer.playbackRate = nextRate;
    } else {
      await TrackPlayer.setRate(nextRate);
    }
  };

  const handleShare = (method: string, timestamp?: number) => {
    onShare?.(episode.id, method, timestamp);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onCommentSubmit?.(newComment, includeTimestampInComment ? Math.floor(currentTime) : undefined);
      setNewComment("");
      setIncludeTimestampInComment(false);
    }
  };

  // Video controls visibility management
  const showControlsWithTimeout = useCallback(() => {
    setShowVideoControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isVideoPlaying) {
        setShowVideoControls(false);
      }
    }, 3000);
  }, [isVideoPlaying]);

  const handleVideoTap = useCallback(() => {
    if (showVideoControls) {
      setShowVideoControls(false);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      showControlsWithTimeout();
    }
  }, [showVideoControls, showControlsWithTimeout]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Show controls when video pauses
  useEffect(() => {
    if (!isVideoPlaying && mediaMode === "video") {
      setShowVideoControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isVideoPlaying, mediaMode]);

  const handleEnterFullscreen = () => {
    setIsFullscreen(true);
    showControlsWithTimeout();
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
    setShowVideoControls(true);
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const gradientColors = [colors.accent.main + "25", colors.background];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient */}
      <View style={styles.gradient}>
        <LinearGradient colors={gradientColors as any} style={StyleSheet.absoluteFill} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {onBack && (
            <Pressable onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={colors.foreground} />
            </Pressable>
          )}
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {episode.title}
          </Text>
          <Pressable onPress={() => setShowShare(true)} style={styles.shareButton}>
            <Ionicons name="share-outline" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Video Player (when in video mode) - full width */}
        {mediaMode === "video" && hasVideo && videoPlayer && (
          <View style={styles.videoContainer}>
            <VideoView
              ref={videoViewRef}
              player={videoPlayer}
              style={styles.videoPlayer}
              contentFit="contain"
              nativeControls={false}
              allowsPictureInPicture
            />
            {/* Tap area for controls toggle */}
            <Pressable style={styles.videoOverlay} onPress={handleVideoTap}>
              {/* Loading indicator */}
              {isVideoLoading && (
                <View style={styles.videoLoadingContainer}>
                  <ActivityIndicator size="large" color={colors.accent.main} />
                </View>
              )}
              {/* Play button when paused and controls visible */}
              {!isVideoLoading && !isVideoPlaying && showVideoControls && (
                <Pressable
                  onPress={handlePlayPause}
                  style={[styles.videoPlayButton, { backgroundColor: colors.accent.main }]}
                >
                  <Ionicons name="play" size={32} color="#fff" />
                </Pressable>
              )}
            </Pressable>
            {/* Video control buttons - only show when controls visible */}
            {showVideoControls && !isVideoLoading && (
              <View style={styles.videoControls}>
                <Pressable
                  onPress={handleEnterFullscreen}
                  style={styles.videoControlButton}
                >
                  <Ionicons name="expand" size={20} color="#fff" />
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Cover (audio mode only) - bigger */}
        {mediaMode === "audio" && (
          <Animated.View style={[styles.coverContainer, coverAnimatedStyle]}>
            {displayImage ? (
              <Image source={{ uri: displayImage }} style={styles.cover} />
            ) : (
              <LinearGradient
                colors={[colors.accent.main, colors.accent.dark]}
                style={styles.cover}
              />
            )}
          </Animated.View>
        )}

        {/* Episode Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.podcastTitle, { color: colors.muted }]}>{episode.podcastTitle}</Text>
          <Text style={[styles.episodeMeta, { color: colors.muted }]}>
            {formatDate(episode.pubDate)} · {formatTime(duration)}
          </Text>
          {currentChapter && (
            <Text style={[styles.chapterName, { color: colors.accent.main }]}>
              {currentChapter.title}
            </Text>
          )}
        </View>

        {/* Scrubbar */}
        <Scrubbar
          currentTime={currentTime}
          duration={duration}
          chapters={episode.chapters}
          onSeek={handleSeek}
          onSlidingComplete={handleSeek}
          colors={colors}
        />

        {/* Controls - centered */}
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSkipBack={handleSkipBack}
          onSkipForward={handleSkipForward}
          colors={colors}
        />

        {/* Toggle Row with Mode switch and Rate */}
        <ToggleRow
          mediaMode={mediaMode}
          hasVideo={hasVideo}
          playbackRate={playbackRate}
          onModeChange={handleModeChange}
          onRateChange={handleRateChange}
          colors={colors}
        />

        {/* Action Buttons Row - scrollable: Chapters, Transcript, People, Funding */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.actionScrollContent}
          style={styles.actionScroll}
        >
          {episode.chapters && episode.chapters.length > 0 && (
            <Pressable
              onPress={() => chaptersSheetRef.current?.snapToIndex(0)}
              style={[styles.actionButton, { backgroundColor: colors.border }]}
            >
              <Ionicons name="list" size={16} color={colors.foreground} />
              <Text style={[styles.actionButtonText, { color: colors.foreground }]}>Chapters</Text>
            </Pressable>
          )}
          {episode.transcript && episode.transcript.length > 0 && (
            <Pressable
              onPress={() => transcriptSheetRef.current?.snapToIndex(0)}
              style={[styles.actionButton, { backgroundColor: colors.border }]}
            >
              <Ionicons name="document-text" size={16} color={colors.foreground} />
              <Text style={[styles.actionButtonText, { color: colors.foreground }]}>Transcript</Text>
            </Pressable>
          )}
          {hasPeople && (
            <Pressable
              onPress={() => peopleSheetRef.current?.snapToIndex(0)}
              style={[styles.actionButton, { backgroundColor: colors.border }]}
            >
              <Ionicons name="people" size={16} color={colors.foreground} />
              <Text style={[styles.actionButtonText, { color: colors.foreground }]}>People</Text>
            </Pressable>
          )}
          {episode.funding?.map((fund, i) => (
            <Pressable
              key={i}
              onPress={() => onFundingClick?.(fund.url)}
              style={[styles.actionButton, { backgroundColor: colors.border }]}
            >
              <Ionicons name="heart" size={16} color={colors.accent.main} />
              <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
                {fund.platform || "Support"}
              </Text>
              <Ionicons name="open-outline" size={12} color={colors.muted} />
            </Pressable>
          ))}
        </ScrollView>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>ABOUT</Text>
          <Text style={[styles.description, { color: colors.foreground }]}>
            {episode.description || "No description available."}
          </Text>
        </View>

        {/* Comments Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>
            COMMENTS ({episode.commentCount || 0})
          </Text>

          {/* Comment Input */}
          <View style={styles.commentInput}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
              placeholderTextColor={colors.muted}
              style={[
                styles.commentTextInput,
                { backgroundColor: colors.border + "60", color: colors.foreground },
              ]}
              multiline
            />
            <View style={styles.commentInputActions}>
              <Pressable
                onPress={() => setIncludeTimestampInComment(!includeTimestampInComment)}
                style={styles.timestampCheckbox}
              >
                <View
                  style={[
                    styles.miniCheckbox,
                    includeTimestampInComment
                      ? { backgroundColor: colors.accent.main, borderColor: colors.accent.main }
                      : { borderColor: colors.border },
                  ]}
                >
                  {includeTimestampInComment && <Ionicons name="checkmark" size={10} color="#fff" />}
                </View>
                <Text style={[styles.timestampCheckboxLabel, { color: colors.muted }]}>
                  @ {formatTime(Math.floor(currentTime))}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCommentSubmit}
                disabled={!newComment.trim()}
                style={[
                  styles.sendButton,
                  { backgroundColor: colors.accent.main },
                  !newComment.trim() && { opacity: 0.5 },
                ]}
              >
                <Ionicons name="send" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>

          {/* Comments List */}
          {episode.comments?.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onLike={onCommentLike}
              onSeek={handleSeek}
              colors={colors}
            />
          ))}
        </View>
      </ScrollView>

      {/* Chapters Bottom Sheet */}
      <BottomSheet
        ref={chaptersSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Chapters</Text>
        </View>
        <BottomSheetScrollView>
          {episode.chapters && (
            <ChapterList
              chapters={episode.chapters}
              currentTime={currentTime}
              onSeek={(time) => {
                handleSeek(time);
                chaptersSheetRef.current?.close();
              }}
              colors={colors}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Transcript Bottom Sheet */}
      <BottomSheet
        ref={transcriptSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Transcript</Text>
        </View>
        <BottomSheetScrollView>
          {episode.transcript && (
            <TranscriptView
              segments={episode.transcript}
              currentTime={currentTime}
              onSeek={(time) => {
                handleSeek(time);
                transcriptSheetRef.current?.close();
              }}
              colors={colors}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* People Bottom Sheet */}
      <BottomSheet
        ref={peopleSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.border }}
      >
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>People</Text>
        </View>
        <BottomSheetScrollView>
          {episode.people && (
            <PeopleList people={episode.people} colors={colors} />
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Fullscreen Video Modal */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        supportedOrientations={["portrait", "landscape"]}
        onRequestClose={handleExitFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          {videoPlayer && (
            <VideoView
              player={videoPlayer}
              style={styles.fullscreenVideo}
              contentFit="contain"
              nativeControls={false}
              allowsPictureInPicture
            />
          )}
          {/* Tap area for controls toggle */}
          <Pressable style={StyleSheet.absoluteFill} onPress={handleVideoTap}>
            {/* Controls overlay */}
            {showVideoControls && (
              <View style={styles.fullscreenControlsOverlay}>
                {/* Top bar with exit and title */}
                <View style={styles.fullscreenTopBar}>
                  <Pressable onPress={handleExitFullscreen} style={styles.fullscreenExitButton}>
                    <Ionicons name="chevron-down" size={28} color="#fff" />
                  </Pressable>
                  <Text style={styles.fullscreenTitle} numberOfLines={1}>
                    {episode.title}
                  </Text>
                  <View style={{ width: 44 }} />
                </View>

                {/* Center play controls */}
                <View style={styles.fullscreenCenterControls}>
                  <Pressable onPress={handleSkipBack} style={styles.fullscreenSkipButton}>
                    <Ionicons name="play-back" size={32} color="#fff" />
                    <Text style={styles.fullscreenSkipLabel}>15</Text>
                  </Pressable>

                  <Pressable
                    onPress={handlePlayPause}
                    style={[styles.fullscreenPlayButton, { backgroundColor: colors.accent.main }]}
                  >
                    <Ionicons name={isVideoPlaying ? "pause" : "play"} size={36} color="#fff" />
                  </Pressable>

                  <Pressable onPress={handleSkipForward} style={styles.fullscreenSkipButton}>
                    <Ionicons name="play-forward" size={32} color="#fff" />
                    <Text style={styles.fullscreenSkipLabel}>15</Text>
                  </Pressable>
                </View>

                {/* Bottom bar with scrubbar */}
                <View style={styles.fullscreenBottomBar}>
                  <Text style={styles.fullscreenTimeText}>{formatTime(currentTime)}</Text>
                  <View style={styles.fullscreenSliderContainer}>
                    <Slider
                      value={currentTime}
                      minimumValue={0}
                      maximumValue={duration > 0 ? duration : 1}
                      onSlidingComplete={handleSeek}
                      minimumTrackTintColor={colors.accent.main}
                      maximumTrackTintColor="rgba(255,255,255,0.3)"
                      thumbTintColor={colors.accent.main}
                      style={styles.fullscreenSlider}
                    />
                  </View>
                  <Text style={styles.fullscreenTimeText}>{formatTime(duration)}</Text>
                </View>
              </View>
            )}
          </Pressable>
        </View>
      </Modal>

      {/* Share Modal */}
      <ShareModal
        visible={showShare}
        episodeTitle={episode.title}
        currentTime={currentTime}
        colors={colors}
        onShare={handleShare}
        onClose={() => setShowShare(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  videoContainer: {
    width: "100%",
    marginBottom: 20,
    aspectRatio: 16 / 9,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  videoPlayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  videoControls: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  videoControlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  videoLoadingContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    // Offset ActivityIndicator's internal padding
    paddingLeft: 2,
    paddingTop: 2,
  },
  coverContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  cover: {
    width: 280,
    height: 280,
    borderRadius: 24,
  },
  infoContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  podcastTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  episodeMeta: {
    fontSize: 13,
    marginBottom: 8,
  },
  chapterName: {
    fontSize: 14,
    fontWeight: "600",
  },
  scrubbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },
  timeTextLeft: {
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    width: 55,
    textAlign: "left",
  },
  timeTextRight: {
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    width: 55,
    textAlign: "right",
  },
  sliderContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    overflow: "visible",
  },
  slider: {
    flex: 1,
    height: 40,
  },
  chapterMarkers: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 4,
    marginTop: -2,
    pointerEvents: "none",
  },
  chapterMarker: {
    position: "absolute",
    width: 2,
    height: 8,
    borderRadius: 1,
    marginTop: -2,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 32,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  skipLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: -6,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  modeToggle: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 999,
    gap: 4,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  rateButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  rateText: {
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  actionScroll: {
    marginBottom: 24,
  },
  actionScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  sheetHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  chapterItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  chapterImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chapterTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  chapterTime: {
    fontSize: 12,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  transcriptItem: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  transcriptTime: {
    fontSize: 11,
    fontVariant: ["tabular-nums"],
    width: 40,
    marginRight: 8,
  },
  transcriptTextContainer: {
    flex: 1,
  },
  transcriptSpeaker: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
  },
  personItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
  },
  personAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  personAvatarImage: {
    width: "100%",
    height: "100%",
  },
  personInfo: {
    flex: 1,
    marginLeft: 14,
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
  },
  personRole: {
    fontSize: 13,
    marginTop: 2,
  },
  commentInput: {
    marginBottom: 20,
  },
  commentTextInput: {
    padding: 14,
    borderRadius: 16,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: "top",
  },
  commentInputActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  timestampCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  timestampCheckboxLabel: {
    fontSize: 13,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  commentReply: {
    marginLeft: 48,
    marginTop: 12,
    marginBottom: 0,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  commentAvatarImage: {
    width: "100%",
    height: "100%",
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentTime: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 340,
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  shareSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  timestampToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  timestampToggleText: {
    flex: 1,
    marginLeft: 12,
  },
  timestampLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  timestampDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  shareOptions: {
    gap: 8,
  },
  shareOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  shareOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  // Fullscreen styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullscreenVideo: {
    flex: 1,
  },
  fullscreenControlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "space-between",
  },
  fullscreenTopBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  fullscreenExitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 12,
  },
  fullscreenCenterControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  fullscreenSkipButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  fullscreenSkipLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginTop: -6,
  },
  fullscreenPlayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenBottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 50,
    paddingTop: 16,
    gap: 12,
  },
  fullscreenTimeText: {
    color: "#fff",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    width: 50,
    textAlign: "center",
  },
  fullscreenSliderContainer: {
    flex: 1,
  },
  fullscreenSlider: {
    flex: 1,
    height: 40,
  },
});

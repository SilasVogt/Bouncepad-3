import { useEffect } from "react";
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
} from "react-native-track-player";
import { useVideoPlayer, VideoView } from "expo-video";
import { usePlayer } from "../lib/player-context";
import { useTheme } from "../lib/theme";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const { colors } = useTheme();
  const router = useRouter();
  const { episode, mediaMode, showMiniPlayer, setShowMiniPlayer } = usePlayer();

  // Use TrackPlayer hooks directly for real-time playback state
  const playbackState = usePlaybackState();
  const { position, duration: trackDuration } = useProgress();

  const isPlaying = playbackState.state === State.Playing;
  const currentTime = position;
  const duration = trackDuration > 0 ? trackDuration : episode?.duration || 0;

  // Check if episode has video AND user was watching video
  const videoSources = episode?.alternateSources?.filter(s => s.type === "video") || [];
  const hasVideo = videoSources.length > 0;
  const showVideo = hasVideo && mediaMode === "video";
  const videoSourceUrl = showVideo && videoSources[0] ? videoSources[0].url : null;

  // Video player for mini player
  const videoPlayer = useVideoPlayer(videoSourceUrl, (player) => {
    player.loop = false;
    player.muted = true; // Muted since audio comes from TrackPlayer
  });

  // Sync video with audio position (only if showing video)
  useEffect(() => {
    if (!videoPlayer || !showMiniPlayer || !showVideo) return;

    // Sync position if significantly different
    if (Math.abs(videoPlayer.currentTime - currentTime) > 1) {
      videoPlayer.currentTime = currentTime;
    }

    // Sync play state
    if (isPlaying && !videoPlayer.playing) {
      videoPlayer.play();
    } else if (!isPlaying && videoPlayer.playing) {
      videoPlayer.pause();
    }
  }, [currentTime, isPlaying, showMiniPlayer, showVideo, videoPlayer]);

  // Don't render if no episode or mini player is hidden
  if (!episode || !showMiniPlayer) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const imageUrl = episode.imageUrl || episode.podcastImageUrl;

  const handlePress = () => {
    router.push(`/episode/${episode.id}`);
  };

  const handleTogglePlayPause = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const handleClose = async () => {
    await TrackPlayer.reset();
    setShowMiniPlayer(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      {/* Video/Cover area */}
      <Pressable style={styles.mediaContainer} onPress={handlePress}>
        {showVideo && videoPlayer ? (
          <VideoView
            player={videoPlayer}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.coverImage} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.border }]}>
            <Ionicons name="musical-notes" size={32} color={colors.muted} />
          </View>
        )}

        {/* Expand icon overlay */}
        <View style={styles.expandOverlay}>
          <Ionicons name="expand" size={20} color="#fff" />
        </View>

        {/* Close button */}
        <Pressable
          onPress={handleClose}
          style={styles.closeButton}
          hitSlop={8}
        >
          <Ionicons name="close" size={14} color="#fff" />
        </Pressable>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { backgroundColor: colors.accent.main, width: `${progress}%` }]}
          />
        </View>
      </Pressable>

      {/* Info bar */}
      <View style={styles.infoBar}>
        <Pressable
          onPress={handleTogglePlayPause}
          style={[styles.playButton, { backgroundColor: colors.accent.main }]}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={16}
            color="#fff"
            style={isPlaying ? undefined : { marginLeft: 2 }}
          />
        </Pressable>

        <Pressable style={styles.info} onPress={handlePress}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {episode.title}
          </Text>
          <Text style={[styles.time, { color: colors.muted }]}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const MINI_PLAYER_WIDTH = 200;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    right: 16,
    width: MINI_PLAYER_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  mediaContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  expandOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    opacity: 0,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressFill: {
    height: "100%",
  },
  infoBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
  },
  time: {
    fontSize: 11,
    marginTop: 1,
  },
});

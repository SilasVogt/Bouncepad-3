import { useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Play, Pause, X, Maximize2 } from "lucide-react";
import Hls from "hls.js";
import { usePlayer } from "~/lib/player-context";
import { Card, IconButton, Text, HStack } from "~/components/ui";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const {
    episode,
    isPlaying,
    currentTime,
    duration,
    mediaMode,
    showMiniPlayer,
    togglePlayPause,
    stop,
  } = usePlayer();

  // Check if episode has video AND user was watching video
  const videoSources = episode?.alternateSources?.filter(s => s.type === "video") || [];
  const hasVideo = videoSources.length > 0;
  const videoSource = videoSources[0];
  const showVideo = hasVideo && mediaMode === "video";

  // Track if initial sync has been done
  const initialSyncDoneRef = useRef(false);

  // Keep refs for current audio state to use in video sync without causing effect reruns
  const audioTimeRef = useRef(currentTime);
  const audioPlayingRef = useRef(isPlaying);
  useEffect(() => {
    audioTimeRef.current = currentTime;
    audioPlayingRef.current = isPlaying;
  }, [currentTime, isPlaying]);

  // Reset sync flag when mini player hides
  useEffect(() => {
    if (!showMiniPlayer) {
      initialSyncDoneRef.current = false;
    }
  }, [showMiniPlayer]);

  // Setup HLS for mini player video (only if user was watching video)
  useEffect(() => {
    if (!showMiniPlayer || !showVideo || !videoSource || !videoRef.current) return;

    const video = videoRef.current;
    const isHLS = videoSource.mimeType === "application/x-mpegURL" || videoSource.url.includes(".m3u8");

    // Function to perform initial sync once video is ready
    const performInitialSync = () => {
      if (initialSyncDoneRef.current) return;
      initialSyncDoneRef.current = true;

      // Ensure video is muted (audio comes from audio element)
      video.muted = true;

      // Sync position using ref values
      video.currentTime = audioTimeRef.current;

      // Sync play state
      if (audioPlayingRef.current) {
        video.play().catch(() => {});
      }
    };

    if (isHLS && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(videoSource.url);
      hls.attachMedia(video);
      // Ensure video stays muted (audio comes from audio element)
      video.muted = true;
      hlsRef.current = hls;

      // Wait for HLS manifest to be parsed, then sync
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Wait a frame for the video to be ready
        requestAnimationFrame(() => {
          if (video.readyState >= 2) {
            performInitialSync();
          } else {
            video.addEventListener("canplay", performInitialSync, { once: true });
          }
        });
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType(videoSource.mimeType)) {
      video.src = videoSource.url;
      video.addEventListener("canplay", performInitialSync, { once: true });
    }
  }, [showMiniPlayer, showVideo, videoSource]);

  // Ongoing sync of video time with audio (only if showing video and initial sync done)
  useEffect(() => {
    if (!videoRef.current || !showMiniPlayer || !showVideo || !initialSyncDoneRef.current) return;
    const video = videoRef.current;

    // Only sync if video is ready
    if (video.readyState < 2) return;

    // Sync position if significantly different (more than 2 seconds to avoid constant seeking)
    if (Math.abs(video.currentTime - currentTime) > 2) {
      video.currentTime = currentTime;
    }

    // Sync play state
    if (isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [currentTime, isPlaying, showMiniPlayer, showVideo]);

  // Don't render if no episode or mini player is hidden
  if (!episode || !showMiniPlayer) {
    return null;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const imageUrl = episode.imageUrl || episode.podcastImageUrl;

  const handleClick = () => {
    navigate({ to: "/episode/$id", params: { id: episode.id } });
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    stop();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72">
      <Card variant="glass" padding="none" radius="xl" className="overflow-hidden shadow-2xl">
        {/* Video/Cover area */}
        <div
          className="relative aspect-video bg-black cursor-pointer group"
          onClick={handleClick}
        >
          {showVideo ? (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              muted
            />
          ) : imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--border)]">
              <Play size={32} className="text-[var(--muted)]" />
            </div>
          )}

          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 size={24} className="text-white" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Info bar */}
        <HStack gap="sm" className="p-3">
          <IconButton
            icon={isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            variant="solid"
            size="sm"
            label={isPlaying ? "Pause" : "Play"}
            onPress={togglePlayPause}
          />

          <div className="flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
            <Text variant="caption" weight="medium" numberOfLines={1} className="hover:text-accent transition-colors">
              {episode.title}
            </Text>
            <Text variant="caption" muted>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </div>
        </HStack>
      </Card>
    </div>
  );
}

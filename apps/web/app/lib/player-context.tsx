import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { EpisodePlayerData } from "@bouncepad/shared";

type MediaMode = "audio" | "video";

interface PlayerContextValue {
  // Current episode
  episode: EpisodePlayerData | null;

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;

  // Media mode
  mediaMode: MediaMode;

  // Mini player visibility
  showMiniPlayer: boolean;

  // Audio element ref for direct access
  audioRef: React.RefObject<HTMLAudioElement | null>;

  // Actions
  loadEpisode: (episode: EpisodePlayerData, startPosition?: number) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setMediaMode: (mode: MediaMode) => void;
  setShowMiniPlayer: (show: boolean) => void;
  stop: () => void;
}

const defaultContext: PlayerContextValue = {
  episode: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  mediaMode: "audio",
  showMiniPlayer: false,
  audioRef: { current: null },
  loadEpisode: () => {},
  play: () => {},
  pause: () => {},
  togglePlayPause: () => {},
  seek: () => {},
  setPlaybackRate: () => {},
  setMediaMode: () => {},
  setShowMiniPlayer: () => {},
  stop: () => {},
};

const PlayerContext = createContext<PlayerContextValue>(defaultContext);

export function usePlayer() {
  return useContext(PlayerContext);
}

interface PlayerProviderProps {
  children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const [episode, setEpisode] = useState<EpisodePlayerData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [mediaMode, setMediaModeState] = useState<MediaMode>("audio");
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Update Media Session metadata
  useEffect(() => {
    if (!episode || !("mediaSession" in navigator)) return;

    const artwork = episode.imageUrl || episode.podcastImageUrl;
    const artworkArray = artwork
      ? [
          { src: artwork, sizes: "96x96", type: "image/jpeg" },
          { src: artwork, sizes: "128x128", type: "image/jpeg" },
          { src: artwork, sizes: "192x192", type: "image/jpeg" },
          { src: artwork, sizes: "256x256", type: "image/jpeg" },
          { src: artwork, sizes: "384x384", type: "image/jpeg" },
          { src: artwork, sizes: "512x512", type: "image/jpeg" },
        ]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: episode.title,
      artist: episode.podcastTitle,
      album: episode.title,
      artwork: artworkArray,
    });

    navigator.mediaSession.setActionHandler("play", () => play());
    navigator.mediaSession.setActionHandler("pause", () => pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
      }
    });
    navigator.mediaSession.setActionHandler("seekforward", () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 15);
      }
    });
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (audioRef.current && details.seekTime !== undefined) {
        audioRef.current.currentTime = details.seekTime;
      }
    });

    // Set position state with guards to prevent errors
    if (duration > 0 && currentTime >= 0 && currentTime <= duration) {
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate,
          position: currentTime,
        });
      } catch (e) {
        // Ignore position state errors
      }
    }

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
      navigator.mediaSession.setActionHandler("seekto", null);
    };
  }, [episode, duration, currentTime, playbackRate]);

  const loadEpisode = useCallback((newEpisode: EpisodePlayerData, startPosition?: number) => {
    setEpisode(newEpisode);

    if (audioRef.current && newEpisode.audioUrl) {
      audioRef.current.src = newEpisode.audioUrl;
      audioRef.current.load();

      // Set duration from episode if available
      if (newEpisode.duration) {
        setDuration(newEpisode.duration);
      }

      // Set start position after a brief delay to ensure audio is ready
      const initialPosition = startPosition !== undefined && startPosition > 0
        ? startPosition
        : (newEpisode.lastPlayedPosition && newEpisode.lastPlayedPosition > 0)
          ? newEpisode.lastPlayedPosition
          : 0;

      if (initialPosition > 0) {
        audioRef.current.addEventListener("loadedmetadata", () => {
          if (audioRef.current) {
            audioRef.current.currentTime = initialPosition;
          }
        }, { once: true });
      }

      setCurrentTime(initialPosition);
    }

    // Don't auto-show mini player - let the route control it
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    // Also update state immediately (timeupdate only fires when playing)
    setCurrentTime(time);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const setMediaMode = useCallback((mode: MediaMode) => {
    setMediaModeState(mode);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setEpisode(null);
    setShowMiniPlayer(false);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const value: PlayerContextValue = {
    episode,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    mediaMode,
    showMiniPlayer,
    audioRef,
    loadEpisode,
    play,
    pause,
    togglePlayPause,
    seek,
    setPlaybackRate,
    setMediaMode,
    setShowMiniPlayer,
    stop,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

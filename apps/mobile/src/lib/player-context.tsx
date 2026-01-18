import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { EpisodePlayerData } from "@bouncepad/shared";

type MediaMode = "audio" | "video";

interface PlayerContextValue {
  // Current episode being tracked (for mini player display)
  episode: EpisodePlayerData | null;

  // Media mode (audio or video)
  mediaMode: MediaMode;

  // Mini player visibility
  showMiniPlayer: boolean;

  // Actions
  setEpisode: (episode: EpisodePlayerData | null) => void;
  setMediaMode: (mode: MediaMode) => void;
  setShowMiniPlayer: (show: boolean) => void;
  loadEpisode: (episode: EpisodePlayerData) => void;
}

const defaultContext: PlayerContextValue = {
  episode: null,
  mediaMode: "audio",
  showMiniPlayer: false,
  setEpisode: () => {},
  setMediaMode: () => {},
  setShowMiniPlayer: () => {},
  loadEpisode: () => {},
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
  const [mediaMode, setMediaMode] = useState<MediaMode>("audio");
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);

  const loadEpisode = useCallback((newEpisode: EpisodePlayerData) => {
    setEpisode(newEpisode);
    // Don't show mini player immediately - it will show when user navigates away
  }, []);

  const value: PlayerContextValue = {
    episode,
    mediaMode,
    showMiniPlayer,
    setEpisode,
    setMediaMode,
    setShowMiniPlayer,
    loadEpisode,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

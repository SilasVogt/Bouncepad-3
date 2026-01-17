import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PodcastCardData } from "@bouncepad/shared";
import { PodcastCard } from "./PodcastCard";

interface CategoryRowProps {
  name: string;
  podcasts: PodcastCardData[];
  onFollow?: (id: string) => void;
  onPodcastPress?: (id: string) => void;
}

const CARD_WIDTH = 224; // w-56
const GAP = 16; // gap-4

export function CategoryRow({ name, podcasts, onFollow, onPodcastPress }: CategoryRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(podcasts.length);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate how many cards fit in the container
  useEffect(() => {
    const calculateVisibleCount = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const count = Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP));
        setVisibleCount(Math.max(1, count));
      }
    };

    calculateVisibleCount();
    window.addEventListener("resize", calculateVisibleCount);
    return () => window.removeEventListener("resize", calculateVisibleCount);
  }, []);

  const hasMore = podcasts.length > visibleCount;
  const displayedPodcasts = isExpanded ? podcasts : podcasts.slice(0, visibleCount);

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{name}</h2>
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-accent transition-colors"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp size={18} />
              </>
            ) : (
              <>
                Show All ({podcasts.length}) <ChevronDown size={18} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Cards */}
      <div ref={containerRef}>
        <div
          className={`flex gap-4 ${isExpanded ? "flex-wrap" : ""}`}
        >
          {displayedPodcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="w-56 flex-shrink-0"
            >
              <PodcastCard
                podcast={podcast}
                onFollow={onFollow}
                onPress={onPodcastPress}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

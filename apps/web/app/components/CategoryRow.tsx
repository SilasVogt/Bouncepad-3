import { useState, useRef, useLayoutEffect, useEffect } from "react";
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
const CARD_HEIGHT = 340;
const GLOW_PAD = 12; // space around cards so glow/shadow isn't clipped

/** Glass skeleton card using only inline styles — renders correctly before CSS loads.
 *  Replicates the glass-card effect from glass.css with color-mix gradients. */
function PodcastCardSkeleton() {
  const bar: React.CSSProperties = {
    backgroundColor: "color-mix(in srgb, var(--foreground) 10%, transparent)",
    borderRadius: 8,
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
  };

  return (
    <div
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        // Glass card effect
        background: "linear-gradient(160deg, color-mix(in srgb, var(--foreground) 8%, var(--background) 55%), color-mix(in srgb, var(--background) 65%, transparent) 60%, color-mix(in srgb, var(--foreground) 3%, var(--background) 70%))",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid color-mix(in srgb, var(--foreground) 12%, transparent)",
        boxShadow: "inset 0 1px 1px color-mix(in srgb, var(--foreground) 10%, transparent), inset 0 -1px 1px color-mix(in srgb, var(--background) 50%, transparent), 0 4px 24px -8px rgba(0,0,0,0.3), 0 8px 32px -8px rgba(0,0,0,0.2)",
      }}
    >
      {/* Image placeholder */}
      <div style={{ ...bar, width: "100%", aspectRatio: "1", borderRadius: 12, marginBottom: 12, flexShrink: 0 }} />
      {/* Title */}
      <div style={{ ...bar, width: "75%", height: 16, marginBottom: 8 }} />
      {/* Author */}
      <div style={{ ...bar, width: "50%", height: 12, marginBottom: "auto" }} />
      {/* Status + button row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <div style={{ ...bar, width: 80, height: 32 }} />
        <div style={{ ...bar, width: 32, height: 32, borderRadius: "50%" }} />
      </div>
    </div>
  );
}

export function CategoryRow({ name, podcasts, onFollow, onPodcastPress }: CategoryRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(podcasts.length);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mark as mounted once client has hydrated
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate how many cards fully fit in one row
  useLayoutEffect(() => {
    const calculate = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - GLOW_PAD * 2;
        const count = Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
        setVisibleCount(count);
      }
    };

    calculate();
  }, [podcasts.length]);

  useEffect(() => {
    const calculate = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - GLOW_PAD * 2;
        const count = Math.max(1, Math.floor((containerWidth + GAP) / (CARD_WIDTH + GAP)));
        setVisibleCount(count);
      }
    };

    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [podcasts.length]);

  const hasMore = podcasts.length > visibleCount;
  const displayedPodcasts = isExpanded ? podcasts : podcasts.slice(0, visibleCount);

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
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

      {/* Cards — padding gives glow room, negative margin keeps layout aligned */}
      <div
        ref={containerRef}
        style={{
          overflow: isExpanded ? undefined : "hidden",
          padding: GLOW_PAD,
          margin: -GLOW_PAD,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: `${GAP}px`,
            flexWrap: isExpanded ? "wrap" : "nowrap",
          }}
        >
          {mounted
            ? displayedPodcasts.map((podcast) => (
                <div key={podcast.id} style={{ width: CARD_WIDTH, flexShrink: 0 }}>
                  <PodcastCard
                    podcast={podcast}
                    onFollow={onFollow}
                    onPress={onPodcastPress}
                  />
                </div>
              ))
            : podcasts.map((podcast) => (
                <PodcastCardSkeleton key={podcast.id} />
              ))
          }
        </div>
      </div>

      {/* Bottom "Show Less" so users don't have to scroll back up */}
      {isExpanded && hasMore && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-accent transition-colors"
          >
            Show Less <ChevronUp size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

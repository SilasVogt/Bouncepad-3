import type { PodcastCardData, PodcastStatus } from "@bouncepad/shared";
import { PlusCircle, CheckCircle, Mic } from "lucide-react";

interface PodcastCardProps {
  podcast: PodcastCardData;
  onFollow?: (id: string) => void;
  onPress?: (id: string) => void;
}

// Status styles use CSS variables for accent colors
const statusStyles: Record<PodcastStatus, { bg: string; text: string }> = {
  offline: { bg: "bg-[var(--border)]", text: "text-[var(--foreground)]" },
  scheduled: { bg: "bg-accent-light", text: "text-accent-dark" },
  live: { bg: "bg-accent", text: "text-white" },
};

export function PodcastCard({ podcast, onFollow, onPress }: PodcastCardProps) {
  const { id, title, creatorName, imageUrl, status, isFollowing } = podcast;
  const statusStyle = statusStyles[status];
  const isLive = status === "live";

  return (
    <button
      onClick={() => onPress?.(id)}
      className={`
        group flex flex-col rounded-2xl bg-[var(--background)] p-4 text-left
        transition-all duration-300 w-full h-full
        hover:scale-[1.02] hover:-translate-y-1
        ${isLive
          ? "shadow-[0_0_20px_var(--accent-main)] hover:shadow-[0_0_30px_var(--accent-main)]"
          : "border border-[var(--border)] hover:shadow-[0_0_20px_var(--accent-main)]"
        }
      `}
    >
      {/* Square image with gradient overlay */}
      <div className="aspect-square w-full rounded-xl overflow-hidden bg-[var(--border)] mb-4 relative">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--muted)] bg-gradient-to-br from-[var(--border)] to-[var(--background)]">
            <Mic size={48} />
          </div>
        )}

        {/* Live indicator pulse */}
        {isLive && (
          <div className="absolute top-2 right-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
          </div>
        )}
      </div>

      {/* Title and creator */}
      <h3 className="font-semibold text-[var(--foreground)] line-clamp-2 mb-1 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        {creatorName}
      </p>

      {/* Status and follow button */}
      <div className="flex items-center justify-between mt-auto">
        <span
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${statusStyle.bg} ${statusStyle.text} ${
            isLive ? "shadow-[0_0_10px_var(--accent-main)]" : ""
          }`}
        >
          {status}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFollow?.(id);
          }}
          className={`p-1 rounded-full transition-all duration-200 hover:scale-110 ${
            isFollowing
              ? "text-accent drop-shadow-[0_0_6px_var(--accent-main)]"
              : "text-[var(--muted)] hover:text-accent"
          }`}
          aria-label={isFollowing ? "Unfollow" : "Follow"}
        >
          {isFollowing ? <CheckCircle size={24} /> : <PlusCircle size={24} />}
        </button>
      </div>
    </button>
  );
}

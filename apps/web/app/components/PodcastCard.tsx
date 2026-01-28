import type { PodcastCardData } from "@bouncepad/shared";
import { PlusCircle, CheckCircle, Radio, Mic } from "lucide-react";
import { Button, Text, HStack, IconButton } from "~/components/ui";

interface PodcastCardProps {
  podcast: PodcastCardData;
  onFollow?: (id: string) => void;
  onPress?: (id: string) => void;
}

export function PodcastCard({ podcast, onFollow, onPress }: PodcastCardProps) {
  const { id, title, creatorName, imageUrl, status, isFollowing } = podcast;
  const isLive = status === "live";
  const isScheduled = status === "scheduled";

  return (
    <div
      onClick={() => onPress?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onPress?.(id); }}
      className={`
        w-full shrink-0 rounded-2xl overflow-hidden cursor-pointer
        transition-all duration-300 ease-out
        hover:shadow-[0_0_30px_-5px_var(--accent-main)]
        group
        ${isLive || isScheduled ? "glass-card-glow" : "glass-card"}
      `}
    >
      {/* Image container */}
      <div className="p-4 pb-0">
        <div className="aspect-square rounded-xl overflow-hidden bg-[var(--border)] relative">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
              />
              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted)] bg-gradient-to-br from-[var(--border)] to-[var(--background)]">
              <Mic size={48} />
            </div>
          )}

        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3">
        <Text variant="body" weight="semibold" numberOfLines={1}>{title}</Text>
        <Text variant="caption" muted numberOfLines={2} className="mt-1 min-h-[2.5rem]">{creatorName}</Text>

        {/* Actions */}
        <HStack gap="sm" align="center" justify="between" className="mt-4">
          {isLive ? (
            <Button variant="solid" size="sm" leftIcon={<Radio size={14} />}>
              LIVE
            </Button>
          ) : isScheduled ? (
            <Button variant="glow" size="sm">
              SCHEDULED
            </Button>
          ) : (
            <Button variant="glass" size="sm">
              OFFLINE
            </Button>
          )}

          {/* Stop propagation so follow doesn't trigger card onPress */}
          <div onClick={(e) => e.stopPropagation()}>
            <IconButton
              icon={isFollowing ? <CheckCircle size={18} /> : <PlusCircle size={18} />}
              variant={isFollowing ? "solid" : "ghost"}
              size="sm"
              label={isFollowing ? "Unfollow" : "Follow"}
              onPress={() => onFollow?.(id)}
            />
          </div>
        </HStack>
      </div>
    </div>
  );
}

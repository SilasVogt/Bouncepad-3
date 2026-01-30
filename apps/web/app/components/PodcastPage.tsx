import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Check,
  Share2,
  Heart,
  Play,
  Pause,
  ChevronDown,
  ExternalLink,
  Copy,
  Twitter,
  MessageCircle,
  Mail,
  UserMinus,
} from "lucide-react";
import type {
  PodcastPageData,
  PodcastPerson,
  PodcastEpisode,
  PodcastPodrollItem,
  NotificationSettings,
} from "@bouncepad/shared";
import {
  Card,
  Button,
  Text,
  Avatar,
  VStack,
  HStack,
  Modal,
  Switch,
  IconButton,
} from "~/components/ui";

interface PodcastPageProps {
  podcast: PodcastPageData;
  onBack?: () => void;
  onFollow?: (id: string) => void;
  onUnfollow?: (id: string) => void;
  onNotificationsChange?: (id: string, settings: NotificationSettings) => void;
  onShare?: (id: string, method: string) => void;
  onFundingClick?: (url: string) => void;
  onPodrollClick?: (item: PodcastPodrollItem) => void;
  onEpisodePlay?: (episode: PodcastEpisode) => void;
  onShowAllEpisodes?: () => void;
  onFollowPerson?: (personId: string) => void;
  onViewPersonProfile?: (personId: string) => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
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

// Person Component
function PersonChip({ person, onPress }: { person: PodcastPerson; onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="glass-card px-3 py-2 rounded-2xl flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
    >
      <Avatar
        src={person.imageUrl}
        fallback={person.name}
        size="sm"
      />
      <VStack gap="none" align="start">
        <Text variant="caption" weight="medium">{person.name}</Text>
        {person.role && <Text variant="caption" muted>{person.role}</Text>}
      </VStack>
    </button>
  );
}

// Person Modal
function PersonModal({
  person,
  isOpen,
  onClose,
  onFollow,
  onViewProfile,
}: {
  person: PodcastPerson | null;
  isOpen: boolean;
  onClose: () => void;
  onFollow?: (personId: string) => void;
  onViewProfile?: (personId: string) => void;
}) {
  if (!person) return null;

  return (
    <Modal visible={isOpen} onClose={onClose} size="sm">
      <VStack gap="md" align="center" className="text-center">
        <Avatar
          src={person.imageUrl}
          fallback={person.name}
          size="xl"
        />
        <VStack gap="xs">
          <Text variant="h4">{person.name}</Text>
          {person.role && <Text variant="body" muted>{person.role}</Text>}
        </VStack>

        <HStack gap="sm" className="w-full mt-2">
          <Button
            variant="solid"
            fullWidth
            leftIcon={<Plus size={18} />}
            onPress={() => onFollow?.(person.id)}
          >
            Follow
          </Button>
          <Button
            variant="glass"
            fullWidth
            onPress={() => onViewProfile?.(person.id)}
          >
            View Profile
          </Button>
        </HStack>
      </VStack>
    </Modal>
  );
}

// Episode Row
function EpisodeRow({ episode, onPlay }: { episode: PodcastEpisode; onPlay: () => void }) {
  return (
    <Card variant="glass" glassIntensity="subtle" padding="sm" radius="xl" pressable onPress={onPlay}>
      <HStack gap="md">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--border)] flex-shrink-0 relative group">
          {episode.imageUrl ? (
            <img src={episode.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--border)] to-[var(--background)]" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
            <Play size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
          </div>
        </div>
        <VStack gap="none" align="start" className="flex-1 min-w-0">
          <Text variant="body" weight="medium" numberOfLines={1}>{episode.title}</Text>
          <Text variant="caption" muted>
            {formatDate(episode.pubDate)}
            {episode.duration && ` · ${formatDuration(episode.duration)}`}
          </Text>
        </VStack>
      </HStack>
    </Card>
  );
}

// Podroll Card
function PodrollCard({ item, onClick }: { item: PodcastPodrollItem; onClick: () => void }) {
  return (
    <Card variant="glass" glassIntensity="subtle" padding="sm" radius="xl" pressable onPress={onClick} className="group">
      <HStack gap="sm">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--border)] flex-shrink-0">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5" />
          )}
        </div>
        <Text variant="caption" weight="medium" numberOfLines={2} className="flex-1 min-w-0">
          {item.title}
        </Text>
        <Plus size={18} className="text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </HStack>
    </Card>
  );
}

// Notification Modal with Unfollow option
function NotificationModal({
  isOpen,
  settings,
  onChange,
  onUnfollow,
  onClose,
}: {
  isOpen: boolean;
  settings: NotificationSettings;
  onChange: (settings: NotificationSettings) => void;
  onUnfollow: () => void;
  onClose: () => void;
}) {
  const options: { key: keyof NotificationSettings; label: string; description: string }[] = [
    { key: "onScheduled", label: "New stream scheduled", description: "When a new livestream is scheduled" },
    { key: "before10Min", label: "10 minute reminder", description: "10 minutes before a scheduled stream" },
    { key: "onLive", label: "Going live", description: "When the podcast goes live" },
  ];

  const handleToggle = (key: keyof NotificationSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      title="Notifications"
      size="md"
      footer={
        <VStack gap="sm" className="w-full">
          <Button variant="solid" fullWidth onPress={onClose}>
            Done
          </Button>
          <Button
            variant="ghost"
            fullWidth
            leftIcon={<UserMinus size={18} />}
            onPress={() => { onUnfollow(); onClose(); }}
          >
            Unfollow
          </Button>
        </VStack>
      }
    >
      <VStack gap="sm">
        {options.map((opt) => (
          <Card key={opt.key} variant="glass" glassIntensity="subtle" padding="sm" radius="xl">
            <HStack gap="md" justify="between">
              <VStack gap="none" align="start" className="flex-1">
                <Text variant="body" weight="medium">{opt.label}</Text>
                <Text variant="caption" muted>{opt.description}</Text>
              </VStack>
              <Switch
                value={settings[opt.key]}
                onValueChange={() => handleToggle(opt.key)}
                size="sm"
              />
            </HStack>
          </Card>
        ))}
      </VStack>
    </Modal>
  );
}

// Share Modal
function ShareModal({
  isOpen,
  podcastTitle,
  onShare,
  onClose,
}: {
  isOpen: boolean;
  podcastTitle: string;
  onShare: (method: string) => void;
  onClose: () => void;
}) {
  const shareOptions = [
    { id: "copy", label: "Copy link", icon: <Copy size={20} /> },
    { id: "twitter", label: "Share on X", icon: <Twitter size={20} /> },
    { id: "mastodon", label: "Share on Mastodon", icon: <MessageCircle size={20} /> },
    { id: "email", label: "Share via email", icon: <Mail size={20} /> },
  ];

  return (
    <Modal visible={isOpen} onClose={onClose} title="Share" size="sm">
      <VStack gap="sm">
        <Text variant="caption" muted>
          Share <Text variant="caption" weight="medium" className="inline">{podcastTitle}</Text> with others
        </Text>
        {shareOptions.map((opt) => (
          <Card
            key={opt.id}
            variant="glass"
            glassIntensity="subtle"
            padding="sm"
            radius="xl"
            pressable
            onPress={() => { onShare(opt.id); onClose(); }}
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
    </Modal>
  );
}

export function PodcastPage({
  podcast,
  onBack,
  onFollow,
  onUnfollow,
  onNotificationsChange,
  onShare,
  onFundingClick,
  onPodrollClick,
  onEpisodePlay,
  onShowAllEpisodes,
  onFollowPerson,
  onViewPersonProfile,
}: PodcastPageProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [playingTrailer, setPlayingTrailer] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PodcastPerson | null>(null);
  const [localNotifications, setLocalNotifications] = useState<NotificationSettings>(
    podcast.notifications || { onScheduled: true, before10Min: true, onLive: true }
  );

  // Gradient fades from dominant color to background (respects theme)
  const gradientColor = podcast.dominantColor || "var(--accent-main)";

  const handleNotificationsChange = (settings: NotificationSettings) => {
    setLocalNotifications(settings);
    onNotificationsChange?.(podcast.id, settings);
  };

  const handleUnfollow = () => {
    onUnfollow?.(podcast.id);
  };

  const handleShare = (method: string) => {
    onShare?.(podcast.id, method);
  };

  return (
    <div className="min-h-screen">
      {/* Gradient backdrop - fades to background color */}
      <div
        className="absolute inset-x-0 top-0 h-96 pointer-events-none motion-safe:motion-opacity-in-0 motion-safe:motion-duration-1000"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${gradientColor} 25%, transparent) 0%, var(--background) 100%)`,
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 py-6">
        {/* Back */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}

        {/* Hero */}
        <header className="text-center mb-8">
          {/* Cover */}
          <div className="w-56 h-56 lg:w-64 lg:h-64 mx-auto rounded-3xl overflow-hidden shadow-2xl mb-6 ring-1 ring-white/10 motion-safe:motion-scale-in-75 motion-safe:motion-opacity-in-0 motion-safe:motion-blur-in-sm motion-safe:motion-duration-500">
            {podcast.imageUrl ? (
              <img src={podcast.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent to-accent-dark" />
            )}
          </div>

          {/* Title */}
          <Text variant="h2" className="mb-2 motion-safe:motion-translate-y-in-25 motion-safe:motion-opacity-in-0 motion-safe:motion-duration-500 motion-safe:motion-delay-150">
            {podcast.title}
          </Text>
          <Text variant="body" muted className="mb-6 motion-safe:motion-translate-y-in-25 motion-safe:motion-opacity-in-0 motion-safe:motion-duration-500 motion-safe:motion-delay-200">
            {podcast.author}
          </Text>

          {/* Actions */}
          <HStack gap="sm" justify="center" wrap className="motion-safe:motion-translate-y-in-25 motion-safe:motion-opacity-in-0 motion-safe:motion-duration-500 motion-safe:motion-delay-300">
            {/* Follow */}
            <Button
              variant={podcast.isFollowing ? "glow" : "solid"}
              leftIcon={podcast.isFollowing ? <Check size={18} /> : <Plus size={18} />}
              rightIcon={podcast.isFollowing ? <ChevronDown size={14} /> : undefined}
              onPress={() => podcast.isFollowing ? setShowNotifications(true) : onFollow?.(podcast.id)}
            >
              {podcast.isFollowing ? "Following" : "Follow"}
            </Button>

            {/* Share */}
            <Button
              variant="solid"
              leftIcon={<Share2 size={18} />}
              onPress={() => setShowShare(true)}
            >
              Share
            </Button>

            {/* Funding */}
            {podcast.funding && podcast.funding.length > 0 && (
              <Button
                variant="glow"
                leftIcon={<Heart size={18} />}
                onPress={() => onFundingClick?.(podcast.funding![0].url)}
              >
                Support
              </Button>
            )}

            {/* Website */}
            {podcast.websiteUrl && (
              <a
                href={podcast.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="glow" leftIcon={<ExternalLink size={18} />}>
                  Website
                </Button>
              </a>
            )}
          </HStack>

          {/* Status */}
          {podcast.status === "live" && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <Text variant="caption" weight="medium" accent>Live Now</Text>
            </div>
          )}
        </header>

        {/* People */}
        {podcast.people.length > 0 && (
          <section className="mb-8">
            <HStack gap="sm" wrap justify="center">
              {podcast.people.map((person) => (
                <PersonChip key={person.id} person={person} onPress={() => setSelectedPerson(person)} />
              ))}
            </HStack>
          </section>
        )}

        {/* Description */}
        <section className="mb-8">
          <Text variant="body" muted align="center" className="max-w-2xl mx-auto leading-relaxed">
            {podcast.description}
          </Text>
        </section>

        {/* Two column layout for wider screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Trailer + Episodes */}
          <VStack gap="lg">
            {/* Trailers */}
            {podcast.trailers.length > 0 && (
              <section>
                <Text variant="label" muted className="mb-4">Trailer</Text>
                {podcast.trailers.slice(0, 1).map((trailer) => (
                  <Card key={trailer.id} variant="glass" padding="md" radius="xl">
                    <HStack gap="md">
                      <IconButton
                        icon={playingTrailer === trailer.id ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                        variant="solid"
                        size="lg"
                        label={playingTrailer === trailer.id ? "Pause" : "Play"}
                        onPress={() => setPlayingTrailer(playingTrailer === trailer.id ? null : trailer.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                          <div className="w-0 h-full bg-accent rounded-full transition-all" />
                        </div>
                      </div>
                      <Text variant="caption" muted className="tabular-nums">
                        {formatDuration(trailer.duration)}
                      </Text>
                    </HStack>
                  </Card>
                ))}
              </section>
            )}

            {/* Episodes */}
            {podcast.episodes.length > 0 && (
              <section>
                <Text variant="label" muted className="mb-4">Recent Episodes</Text>
                <VStack gap="sm">
                  {podcast.episodes.slice(0, 5).map((ep) => (
                    <EpisodeRow key={ep.id} episode={ep} onPlay={() => onEpisodePlay?.(ep)} />
                  ))}
                </VStack>
                {podcast.episodes.length > 5 && onShowAllEpisodes && (
                  <Button
                    variant="ghost"
                    fullWidth
                    onPress={onShowAllEpisodes}
                    className="mt-4"
                  >
                    Show all episodes
                  </Button>
                )}
              </section>
            )}
          </VStack>

          {/* Right column: Recommendations */}
          <VStack gap="lg">
            {/* Bouncepad-curated similar podcasts */}
            {podcast.similarPodcasts.length > 0 && (
              <section>
                <Text variant="label" muted className="mb-4">Recommended</Text>
                <VStack gap="sm">
                  {podcast.similarPodcasts.map((item) => (
                    <PodrollCard key={item.id} item={item} onClick={() => onPodrollClick?.(item)} />
                  ))}
                </VStack>
              </section>
            )}

            {/* Podcast's own podroll recommendations */}
            {podcast.podroll.length > 0 && (
              <section>
                <Text variant="label" muted className="mb-4">Recommended by {podcast.title}</Text>
                <VStack gap="sm">
                  {podcast.podroll.map((item) => (
                    <PodrollCard key={item.id} item={item} onClick={() => onPodrollClick?.(item)} />
                  ))}
                </VStack>
              </section>
            )}
          </VStack>
        </div>

        {/* Last stream info */}
        {podcast.lastLiveDate && (
          <footer className="text-center pt-8 border-t border-[var(--border)] mt-12">
            <Text variant="caption" muted>
              Last live · {formatDate(podcast.lastLiveDate)}
            </Text>
          </footer>
        )}
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotifications}
        settings={localNotifications}
        onChange={handleNotificationsChange}
        onUnfollow={handleUnfollow}
        onClose={() => setShowNotifications(false)}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShare}
        podcastTitle={podcast.title}
        onShare={handleShare}
        onClose={() => setShowShare(false)}
      />

      {/* Person Modal */}
      <PersonModal
        person={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onFollow={(personId) => {
          onFollowPerson?.(personId);
          setSelectedPerson(null);
        }}
        onViewProfile={(personId) => {
          onViewPersonProfile?.(personId);
          setSelectedPerson(null);
        }}
      />
    </div>
  );
}

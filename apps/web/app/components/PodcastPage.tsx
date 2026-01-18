import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Check,
  Share2,
  Heart,
  Play,
  Pause,
  User,
  ChevronDown,
  ExternalLink,
  X,
  Bell,
  Copy,
  Twitter,
  MessageCircle,
  Mail,
  UserMinus,
  Link,
} from "lucide-react";
import type {
  PodcastPageData,
  PodcastPerson,
  PodcastEpisode,
  PodcastPodrollItem,
  NotificationSettings,
} from "@bouncepad/shared";

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
function PersonChip({ person }: { person: PodcastPerson }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--border)]/50 backdrop-blur">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--border)]">
        {person.imageUrl ? (
          <img src={person.imageUrl} alt={person.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={20} className="text-[var(--muted)]" />
          </div>
        )}
      </div>
      <div>
        <p className="font-medium text-sm">{person.name}</p>
        {person.role && <p className="text-xs text-[var(--muted)]">{person.role}</p>}
      </div>
    </div>
  );
}

// Episode Row
function EpisodeRow({ episode, onPlay }: { episode: PodcastEpisode; onPlay: () => void }) {
  return (
    <button
      onClick={onPlay}
      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--border)]/50 transition-all group text-left"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--border)] flex-shrink-0 relative">
        {episode.imageUrl ? (
          <img src={episode.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--border)] to-[var(--background)]" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
          <Play size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium line-clamp-1 mb-0.5">{episode.title}</p>
        <p className="text-sm text-[var(--muted)]">
          {formatDate(episode.pubDate)}
          {episode.duration && ` · ${formatDuration(episode.duration)}`}
        </p>
      </div>
    </button>
  );
}

// Podroll Card
function PodrollCard({ item, onClick }: { item: PodcastPodrollItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--border)]/50 transition-all text-left"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--border)] flex-shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm line-clamp-2">{item.title}</p>
      </div>
      <Plus size={18} className="text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
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
  if (!isOpen) return null;

  const options: { key: keyof NotificationSettings; label: string; description: string }[] = [
    { key: "onScheduled", label: "New stream scheduled", description: "When a new livestream is scheduled" },
    { key: "before10Min", label: "10 minute reminder", description: "10 minutes before a scheduled stream" },
    { key: "onLive", label: "Going live", description: "When the podcast goes live" },
  ];

  const handleToggle = (key: keyof NotificationSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm motion-safe:motion-opacity-in-0 motion-safe:motion-duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--background)] border border-[var(--border)] rounded-3xl shadow-2xl p-6 w-full max-w-md mx-4 motion-safe:motion-scale-in-95 motion-safe:motion-opacity-in-0 motion-safe:motion-duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Bell size={20} className="text-accent" />
            </div>
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--border)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleToggle(opt.key)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--border)]/50 transition-colors text-left"
            >
              {/* Checkbox */}
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                settings[opt.key]
                  ? "bg-accent border-accent"
                  : "border-[var(--border)]"
              }`}>
                {settings[opt.key] && <Check size={14} className="text-white" />}
              </div>

              {/* Label */}
              <div className="flex-1">
                <p className="font-medium">{opt.label}</p>
                <p className="text-sm text-[var(--muted)]">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[var(--border)] space-y-3">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-accent text-white font-medium hover:shadow-lg hover:shadow-accent/25 transition-all"
          >
            Done
          </button>
          <button
            onClick={() => { onUnfollow(); onClose(); }}
            className="w-full py-3 rounded-full bg-[var(--border)] text-[var(--foreground)] font-medium hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
          >
            <UserMinus size={18} />
            Unfollow
          </button>
        </div>
      </div>
    </div>
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
  if (!isOpen) return null;

  const shareOptions = [
    { id: "copy", label: "Copy link", icon: <Copy size={20} /> },
    { id: "twitter", label: "Share on X", icon: <Twitter size={20} /> },
    { id: "mastodon", label: "Share on Mastodon", icon: <MessageCircle size={20} /> },
    { id: "email", label: "Share via email", icon: <Mail size={20} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm motion-safe:motion-opacity-in-0 motion-safe:motion-duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--background)] border border-[var(--border)] rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-4 motion-safe:motion-scale-in-95 motion-safe:motion-opacity-in-0 motion-safe:motion-duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Share2 size={20} className="text-accent" />
            </div>
            <h2 className="text-xl font-semibold">Share</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--border)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Share text */}
        <p className="text-sm text-[var(--muted)] mb-4">
          Share <span className="font-medium text-[var(--foreground)]">{podcastTitle}</span> with others
        </p>

        {/* Options */}
        <div className="space-y-2">
          {shareOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { onShare(opt.id); onClose(); }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--border)]/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--border)] flex items-center justify-center">
                {opt.icon}
              </div>
              <span className="font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
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
}: PodcastPageProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [playingTrailer, setPlayingTrailer] = useState<string | null>(null);
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

      <div className="relative max-w-4xl mx-auto px-6 py-8">
        {/* Back */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-12"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}

        {/* Hero */}
        <header className="text-center mb-12">
          {/* Cover */}
          <div className="w-48 h-48 mx-auto rounded-3xl overflow-hidden shadow-2xl mb-8 ring-1 ring-white/10 motion-safe:motion-scale-in-75 motion-safe:motion-opacity-in-0 motion-safe:motion-blur-in-sm motion-safe:motion-duration-500">
            {podcast.imageUrl ? (
              <img src={podcast.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent to-accent-dark" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight mb-2 motion-safe:motion-translate-y-in-25 motion-safe:motion-opacity-in-0 motion-safe:motion-duration-500 motion-safe:motion-delay-150">{podcast.title}</h1>
          <p className="text-lg text-[var(--muted)] mb-6 motion-safe:motion-translate-y-in-25 motion-safe:motion-opacity-in-0 motion-safe:motion-duration-500 motion-safe:motion-delay-200">{podcast.author}</p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 flex-wrap motion-safe:motion-translate-y-in-25 motion-safe:motion-opacity-in-0 motion-safe:motion-duration-500 motion-safe:motion-delay-300">
            {/* Follow */}
            <button
              onClick={() => podcast.isFollowing ? setShowNotifications(true) : onFollow?.(podcast.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                podcast.isFollowing
                  ? "bg-[var(--border)] text-[var(--foreground)]"
                  : "bg-accent text-white hover:shadow-lg hover:shadow-accent/25"
              }`}
            >
              {podcast.isFollowing ? <Check size={18} /> : <Plus size={18} />}
              {podcast.isFollowing ? "Following" : "Follow"}
              {podcast.isFollowing && <ChevronDown size={14} className="ml-1" />}
            </button>

            {/* Share */}
            <button
              onClick={() => setShowShare(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--border)] hover:bg-[var(--border)]/70 transition-colors"
            >
              <Share2 size={18} />
              <span className="font-medium">Share</span>
            </button>

            {/* Funding */}
            {podcast.funding && podcast.funding.length > 0 && (
              <button
                onClick={() => onFundingClick?.(podcast.funding![0].url)}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--border)] hover:bg-[var(--border)]/70 transition-colors"
              >
                <Heart size={18} />
                <span className="font-medium">Support</span>
              </button>
            )}

            {/* Website */}
            {podcast.websiteUrl && (
              <a
                href={podcast.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--border)] hover:bg-[var(--border)]/70 transition-colors"
              >
                <ExternalLink size={18} />
                <span className="font-medium">Website</span>
              </a>
            )}
          </div>

          {/* Status */}
          {podcast.status === "live" && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium">Live Now</span>
            </div>
          )}
        </header>

        {/* People */}
        {podcast.people.length > 0 && (
          <section className="mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              {podcast.people.map((person) => (
                <PersonChip key={person.id} person={person} />
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        <section className="mb-12">
          <p className="text-[var(--muted)] leading-relaxed text-center max-w-2xl mx-auto">
            {podcast.description}
          </p>
        </section>

        {/* Two column layout for wider screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Trailer + Episodes */}
          <div>
            {/* Trailers */}
            {podcast.trailers.length > 0 && (
              <section className="mb-12">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
                  Trailer
                </h2>
                {podcast.trailers.slice(0, 1).map((trailer) => (
                  <div
                    key={trailer.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--border)]/50"
                  >
                    <button
                      onClick={() => setPlayingTrailer(playingTrailer === trailer.id ? null : trailer.id)}
                      className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white flex-shrink-0 hover:shadow-lg hover:shadow-accent/25 transition-shadow"
                    >
                      {playingTrailer === trailer.id ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-accent rounded-full transition-all" />
                      </div>
                    </div>
                    <span className="text-sm text-[var(--muted)] tabular-nums">
                      {formatDuration(trailer.duration)}
                    </span>
                  </div>
                ))}
              </section>
            )}

            {/* Episodes */}
            {podcast.episodes.length > 0 && (
              <section className="mb-12">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
                  Recent Episodes
                </h2>
                <div className="-mx-4">
                  {podcast.episodes.slice(0, 5).map((ep) => (
                    <EpisodeRow key={ep.id} episode={ep} onPlay={() => onEpisodePlay?.(ep)} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column: Recommendations */}
          <div>
            {/* Bouncepad-curated similar podcasts */}
            {podcast.similarPodcasts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
                  Recommended
                </h2>
                <div className="-mx-4">
                  {podcast.similarPodcasts.map((item) => (
                    <PodrollCard key={item.id} item={item} onClick={() => onPodrollClick?.(item)} />
                  ))}
                </div>
              </section>
            )}

            {/* Podcast's own podroll recommendations */}
            {podcast.podroll.length > 0 && (
              <section className="mb-12">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mb-4">
                  Recommended by {podcast.title}
                </h2>
                <div className="-mx-4">
                  {podcast.podroll.map((item) => (
                    <PodrollCard key={item.id} item={item} onClick={() => onPodrollClick?.(item)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Last stream info */}
        {podcast.lastLiveDate && (
          <footer className="text-center text-sm text-[var(--muted)] pt-8 border-t border-[var(--border)]">
            Last live · {formatDate(podcast.lastLiveDate)}
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
    </div>
  );
}

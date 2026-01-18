import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";
import type {
  PodcastPageData,
  PodcastPerson,
  PodcastEpisode,
  PodcastPodrollItem,
  NotificationSettings,
} from "@bouncepad/shared";
import { useTheme } from "../lib/theme";

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

// Person Chip
function PersonChip({ person, colors }: { person: PodcastPerson; colors: any }) {
  return (
    <View style={[styles.personChip, { backgroundColor: colors.border + "80" }]}>
      <View style={[styles.personAvatar, { backgroundColor: colors.border }]}>
        {person.imageUrl ? (
          <Image source={{ uri: person.imageUrl }} style={styles.personImage} />
        ) : (
          <Ionicons name="person" size={20} color={colors.muted} />
        )}
      </View>
      <View>
        <Text style={[styles.personName, { color: colors.foreground }]}>{person.name}</Text>
        {person.role && (
          <Text style={[styles.personRole, { color: colors.muted }]}>{person.role}</Text>
        )}
      </View>
    </View>
  );
}

// Episode Row
function EpisodeRow({
  episode,
  colors,
  onPlay,
}: {
  episode: PodcastEpisode;
  colors: any;
  onPlay: () => void;
}) {
  return (
    <Pressable onPress={onPlay} style={styles.episodeRow}>
      <View style={[styles.episodeImage, { backgroundColor: colors.border }]}>
        {episode.imageUrl && (
          <Image source={{ uri: episode.imageUrl }} style={styles.episodeImageInner} />
        )}
        <View style={styles.episodePlayOverlay}>
          <Ionicons name="play" size={16} color="#fff" style={{ marginLeft: 2 }} />
        </View>
      </View>
      <View style={styles.episodeInfo}>
        <Text style={[styles.episodeTitle, { color: colors.foreground }]} numberOfLines={1}>
          {episode.title}
        </Text>
        <Text style={[styles.episodeMeta, { color: colors.muted }]}>
          {formatDate(episode.pubDate)}
          {episode.duration && ` · ${formatDuration(episode.duration)}`}
        </Text>
      </View>
    </Pressable>
  );
}

// Podroll Card
function PodrollCard({
  item,
  colors,
  onPress,
}: {
  item: PodcastPodrollItem;
  colors: any;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.podrollCard}>
      <View style={[styles.podrollImage, { backgroundColor: colors.border }]}>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.podrollImageInner} />
        )}
      </View>
      <View style={styles.podrollInfo}>
        <Text style={[styles.podrollTitle, { color: colors.foreground }]} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
      <Ionicons name="add" size={18} color={colors.muted} />
    </Pressable>
  );
}

// Notification Modal with checkboxes
function NotificationModal({
  visible,
  settings,
  colors,
  accentColor,
  onChange,
  onUnfollow,
  onClose,
}: {
  visible: boolean;
  settings: NotificationSettings;
  colors: any;
  accentColor: string;
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: colors.background }]} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconContainer, { backgroundColor: accentColor + "20" }]}>
              <Ionicons name="notifications" size={20} color={accentColor} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Notifications</Text>
            <Pressable onPress={onClose} style={[styles.modalCloseButton, { backgroundColor: colors.border }]}>
              <Ionicons name="close" size={20} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Options */}
          <View style={styles.modalOptions}>
            {options.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => handleToggle(opt.key)}
                style={styles.modalOption}
              >
                {/* Checkbox */}
                <View style={[
                  styles.checkbox,
                  settings[opt.key]
                    ? { backgroundColor: accentColor, borderColor: accentColor }
                    : { borderColor: colors.border }
                ]}>
                  {settings[opt.key] && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </View>

                {/* Label */}
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionLabel, { color: colors.foreground }]}>{opt.label}</Text>
                  <Text style={[styles.optionDescription, { color: colors.muted }]}>{opt.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          {/* Done button */}
          <Pressable
            onPress={onClose}
            style={[styles.doneButton, { backgroundColor: accentColor }]}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>

          {/* Unfollow button */}
          <Pressable
            onPress={onUnfollow}
            style={styles.unfollowButton}
          >
            <Text style={[styles.unfollowButtonText, { color: colors.muted }]}>Unfollow</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Share Modal
function ShareModal({
  visible,
  podcastTitle,
  colors,
  onShare,
  onClose,
}: {
  visible: boolean;
  podcastTitle: string;
  colors: any;
  onShare: (method: string) => void;
  onClose: () => void;
}) {
  const shareOptions = [
    { id: "copy", label: "Copy link", icon: "link-outline" as const },
    { id: "x", label: "Share on X", icon: "logo-twitter" as const },
    { id: "mastodon", label: "Share on Mastodon", icon: "share-social-outline" as const },
    { id: "email", label: "Share via email", icon: "mail-outline" as const },
  ];

  const handleShare = (method: string) => {
    onShare(method);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: colors.background }]} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconContainer, { backgroundColor: colors.accent.main + "20" }]}>
              <Ionicons name="share-outline" size={20} color={colors.accent.main} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Share</Text>
            <Pressable onPress={onClose} style={[styles.modalCloseButton, { backgroundColor: colors.border }]}>
              <Ionicons name="close" size={20} color={colors.foreground} />
            </Pressable>
          </View>

          <Text style={[styles.shareSubtitle, { color: colors.muted }]}>
            Share {podcastTitle}
          </Text>

          {/* Share Options */}
          <View style={styles.shareOptions}>
            {shareOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => handleShare(option.id)}
                style={[styles.shareOption, { backgroundColor: colors.border + "60" }]}
              >
                <Ionicons name={option.icon} size={20} color={colors.foreground} />
                <Text style={[styles.shareOptionText, { color: colors.foreground }]}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
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
}: PodcastPageProps) {
  const { colors } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [playingTrailer, setPlayingTrailer] = useState<string | null>(null);
  const [localNotifications, setLocalNotifications] = useState<NotificationSettings>(
    podcast.notifications || { onScheduled: true, before10Min: true, onLive: true }
  );

  // Animation values
  const gradientOpacity = useSharedValue(0);
  const coverScale = useSharedValue(0.8);
  const coverOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const actionsOpacity = useSharedValue(0);
  const actionsTranslateY = useSharedValue(20);

  useEffect(() => {
    const timing = { duration: 500, easing: Easing.out(Easing.cubic) };
    gradientOpacity.value = withTiming(1, { duration: 800 });
    coverScale.value = withTiming(1, timing);
    coverOpacity.value = withTiming(1, timing);
    titleOpacity.value = withDelay(150, withTiming(1, timing));
    titleTranslateY.value = withDelay(150, withTiming(0, timing));
    actionsOpacity.value = withDelay(300, withTiming(1, timing));
    actionsTranslateY.value = withDelay(300, withTiming(0, timing));
  }, []);

  const gradientAnimatedStyle = useAnimatedStyle(() => ({
    opacity: gradientOpacity.value,
  }));

  const coverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coverScale.value }],
    opacity: coverOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const actionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
    transform: [{ translateY: actionsTranslateY.value }],
  }));

  // Gradient fades from dominant color to background (respects theme)
  const gradientColors = podcast.dominantColor
    ? [podcast.dominantColor + "40", colors.background]
    : [colors.accent.main + "25", colors.background];

  const handleNotificationsChange = (settings: NotificationSettings) => {
    setLocalNotifications(settings);
    onNotificationsChange?.(podcast.id, settings);
  };

  const handleUnfollow = () => {
    onUnfollow?.(podcast.id);
    setShowNotifications(false);
  };

  const handleShare = (method: string) => {
    onShare?.(podcast.id, method);
  };

  const handleWebsitePress = () => {
    if (podcast.websiteUrl) {
      Linking.openURL(podcast.websiteUrl);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient - fades to background */}
      <Animated.View style={[styles.gradient, gradientAnimatedStyle]}>
        <LinearGradient colors={gradientColors as any} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        {onBack && (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={colors.muted} />
            <Text style={[styles.backText, { color: colors.muted }]}>Back</Text>
          </Pressable>
        )}

        {/* Hero */}
        <View style={styles.hero}>
          {/* Cover */}
          <Animated.View style={[styles.cover, { shadowColor: colors.accent.main }, coverAnimatedStyle]}>
            {podcast.imageUrl ? (
              <Image source={{ uri: podcast.imageUrl }} style={styles.coverImage} />
            ) : (
              <LinearGradient
                colors={[colors.accent.main, colors.accent.dark]}
                style={styles.coverImage}
              />
            )}
          </Animated.View>

          {/* Title */}
          <Animated.Text style={[styles.title, { color: colors.foreground }, titleAnimatedStyle]}>{podcast.title}</Animated.Text>
          <Animated.Text style={[styles.author, { color: colors.muted }, titleAnimatedStyle]}>{podcast.author}</Animated.Text>

          {/* Actions - Row 1: Follow */}
          <Animated.View style={[styles.actionsRow, actionsAnimatedStyle]}>
            <Pressable
              onPress={() =>
                podcast.isFollowing
                  ? setShowNotifications(true)
                  : onFollow?.(podcast.id)
              }
              style={[
                styles.followButton,
                {
                  backgroundColor: podcast.isFollowing ? colors.border : colors.accent.main,
                },
              ]}
            >
              <Ionicons
                name={podcast.isFollowing ? "checkmark" : "add"}
                size={18}
                color={podcast.isFollowing ? colors.foreground : "#fff"}
              />
              <Text
                style={[
                  styles.followText,
                  { color: podcast.isFollowing ? colors.foreground : "#fff" },
                ]}
              >
                {podcast.isFollowing ? "Following" : "Follow"}
              </Text>
              {podcast.isFollowing && (
                <Ionicons name="chevron-down" size={14} color={colors.foreground} />
              )}
            </Pressable>
          </Animated.View>

          {/* Actions - Row 2: Share, Support, Website */}
          <Animated.View style={[styles.actionsRow, { marginTop: 12 }, actionsAnimatedStyle]}>
            <Pressable
              onPress={() => setShowShare(true)}
              style={[styles.labeledButton, { backgroundColor: colors.border }]}
            >
              <Ionicons name="share-outline" size={18} color={colors.foreground} />
              <Text style={[styles.labeledButtonText, { color: colors.foreground }]}>Share</Text>
            </Pressable>

            {podcast.funding && podcast.funding.length > 0 && (
              <Pressable
                onPress={() => onFundingClick?.(podcast.funding![0].url)}
                style={[styles.labeledButton, { backgroundColor: colors.border }]}
              >
                <Ionicons name="heart-outline" size={18} color={colors.foreground} />
                <Text style={[styles.labeledButtonText, { color: colors.foreground }]}>Support</Text>
              </Pressable>
            )}

            {podcast.websiteUrl && (
              <Pressable
                onPress={handleWebsitePress}
                style={[styles.labeledButton, { backgroundColor: colors.border }]}
              >
                <Ionicons name="open-outline" size={18} color={colors.foreground} />
                <Text style={[styles.labeledButtonText, { color: colors.foreground }]}>Website</Text>
              </Pressable>
            )}
          </Animated.View>

          {/* Live Status */}
          {podcast.status === "live" && (
            <View style={[styles.liveStatus, { backgroundColor: colors.accent.main + "20" }]}>
              <View style={[styles.liveDot, { backgroundColor: colors.accent.main }]} />
              <Text style={[styles.liveText, { color: colors.accent.main }]}>Live Now</Text>
            </View>
          )}
        </View>

        {/* People */}
        {podcast.people.length > 0 && (
          <View style={styles.section}>
            <View style={styles.peopleList}>
              {podcast.people.map((person) => (
                <PersonChip key={person.id} person={person} colors={colors} />
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.description, { color: colors.muted }]}>
            {podcast.description}
          </Text>
        </View>

        {/* Trailers */}
        {podcast.trailers.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>TRAILER</Text>
            {podcast.trailers.slice(0, 1).map((trailer) => (
              <View
                key={trailer.id}
                style={[styles.trailerCard, { backgroundColor: colors.border + "80" }]}
              >
                <Pressable
                  onPress={() =>
                    setPlayingTrailer(playingTrailer === trailer.id ? null : trailer.id)
                  }
                  style={[styles.playButton, { backgroundColor: colors.accent.main }]}
                >
                  <Ionicons
                    name={playingTrailer === trailer.id ? "pause" : "play"}
                    size={20}
                    color="#fff"
                    style={{ marginLeft: playingTrailer === trailer.id ? 0 : 2 }}
                  />
                </Pressable>
                <View style={styles.trailerProgress}>
                  <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressFill, { backgroundColor: colors.accent.main }]} />
                  </View>
                </View>
                <Text style={[styles.trailerDuration, { color: colors.muted }]}>
                  {formatDuration(trailer.duration)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Episodes */}
        {podcast.episodes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>RECENT EPISODES</Text>
            {podcast.episodes.slice(0, 5).map((ep) => (
              <EpisodeRow
                key={ep.id}
                episode={ep}
                colors={colors}
                onPlay={() => onEpisodePlay?.(ep)}
              />
            ))}
          </View>
        )}

        {/* Bouncepad-curated similar podcasts */}
        {podcast.similarPodcasts && podcast.similarPodcasts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>RECOMMENDED</Text>
            {podcast.similarPodcasts.map((item) => (
              <PodrollCard
                key={item.id}
                item={item}
                colors={colors}
                onPress={() => onPodrollClick?.(item)}
              />
            ))}
          </View>
        )}

        {/* Podcast's own podroll recommendations */}
        {podcast.podroll.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>RECOMMENDED BY {podcast.title.toUpperCase()}</Text>
            {podcast.podroll.map((item) => (
              <PodrollCard
                key={item.id}
                item={item}
                colors={colors}
                onPress={() => onPodrollClick?.(item)}
              />
            ))}
          </View>
        )}

        {/* Footer */}
        {podcast.lastLiveDate && (
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerText, { color: colors.muted }]}>
              Last live · {formatDate(podcast.lastLiveDate)}
            </Text>
          </View>
        )}
      </ScrollView>

      <NotificationModal
        visible={showNotifications}
        settings={localNotifications}
        colors={colors}
        accentColor={colors.accent.main}
        onChange={handleNotificationsChange}
        onUnfollow={handleUnfollow}
        onClose={() => setShowNotifications(false)}
      />

      <ShareModal
        visible={showShare}
        podcastTitle={podcast.title}
        colors={colors}
        onShare={handleShare}
        onClose={() => setShowShare(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 40,
  },
  backText: {
    fontSize: 15,
  },
  hero: {
    alignItems: "center",
    marginBottom: 32,
  },
  cover: {
    width: 180,
    height: 180,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  author: {
    fontSize: 17,
    textAlign: "center",
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  followText: {
    fontSize: 15,
    fontWeight: "600",
  },
  labeledButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  labeledButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  liveStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 16,
  },
  peopleList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  personChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  personImage: {
    width: "100%",
    height: "100%",
  },
  personName: {
    fontSize: 14,
    fontWeight: "600",
  },
  personRole: {
    fontSize: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  trailerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 20,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  trailerProgress: {
    flex: 1,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    width: 0,
    height: "100%",
    borderRadius: 2,
  },
  trailerDuration: {
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
  episodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  episodeImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
  },
  episodeImageInner: {
    width: "100%",
    height: "100%",
  },
  episodePlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  episodeMeta: {
    fontSize: 13,
  },
  podrollCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  podrollImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
  },
  podrollImageInner: {
    width: "100%",
    height: "100%",
  },
  podrollInfo: {
    flex: 1,
  },
  podrollTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    paddingTop: 24,
    borderTopWidth: 1,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 340,
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    marginLeft: 12,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOptions: {
    gap: 8,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  doneButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  unfollowButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  unfollowButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  shareSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  shareOptions: {
    gap: 8,
  },
  shareOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  shareOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
});

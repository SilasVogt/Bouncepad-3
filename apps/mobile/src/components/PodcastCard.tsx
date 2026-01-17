import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { PodcastCardData, PodcastStatus } from "@bouncepad/shared";
import { useTheme } from "../lib/theme";

interface PodcastCardProps {
  podcast: PodcastCardData;
  onFollow?: (id: string) => void;
  onPress?: (id: string) => void;
}

export function PodcastCard({ podcast, onFollow, onPress }: PodcastCardProps) {
  const { colors } = useTheme();
  const { id, title, creatorName, imageUrl, status, isFollowing } = podcast;

  // Status styles use accent colors from theme
  const statusStyles: Record<PodcastStatus, { bg: string; text: string }> = {
    offline: { bg: colors.border, text: colors.foreground },
    scheduled: { bg: colors.accent.light, text: colors.accent.dark },
    live: { bg: colors.accent.main, text: "#ffffff" },
  };
  const statusStyle = statusStyles[status];

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}
    >
      {/* Square image */}
      <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="mic" size={48} color={colors.muted} />
          </View>
        )}
      </View>

      {/* Title and creator - fixed height container for consistency */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.creator, { color: colors.muted }]} numberOfLines={1}>
          {creatorName}
        </Text>
      </View>

      {/* Status and follow button */}
      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {status.toUpperCase()}
          </Text>
        </View>

        <Pressable
          onPress={() => onFollow?.(id)}
          hitSlop={8}
          style={styles.followButton}
        >
          <Ionicons
            name={isFollowing ? "checkmark-circle" : "add-circle-outline"}
            size={28}
            color={isFollowing ? colors.accent.main : colors.muted}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    width: "100%",
  },
  imageContainer: {
    aspectRatio: 1,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    height: 60, // Fixed height for 2 lines of title + 1 line creator
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    lineHeight: 20,
  },
  creator: {
    fontSize: 14,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  followButton: {
    padding: 4,
  },
});

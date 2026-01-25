import { View, Image, StyleSheet, Pressable } from "react-native";
import { GlassView } from "expo-glass-effect";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text } from "../primitives/Text";
import { useTheme } from "../../../lib/theme";

export type PodcastStatus = "live" | "scheduled" | "offline";

export interface PodcastCardProps {
  title: string;
  creator: string;
  imageUrl: string;
  status?: PodcastStatus;
  isFollowing?: boolean;
  onPress?: () => void;
  onFollowPress?: () => void;
}

export function PodcastCard({
  title,
  creator,
  imageUrl,
  status = "offline",
  isFollowing = false,
  onPress,
  onFollowPress,
}: PodcastCardProps) {
  const { colors } = useTheme();
  const isLive = status === "live";
  const isScheduled = status === "scheduled";

  // Use accent color for all states
  const statusLabel = isLive ? "LIVE" : isScheduled ? "SCHEDULED" : "OFFLINE";
  const statusColor = isLive || isScheduled ? colors.accent.main : colors.muted;

  return (
    <Pressable onPress={onPress}>
      <GlassView
        isInteractive
        tintColor={isLive ? `${colors.accent.main}15` : undefined}
        style={styles.card}
      >
        {/* Cover Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text variant="body" weight="semibold" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="caption" muted numberOfLines={2} style={styles.creator}>
            {creator}
          </Text>

          {/* Bottom Row: Status + Follow */}
          <View style={styles.bottomRow}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              {isLive && <View style={[styles.liveDot, { backgroundColor: statusColor }]} />}
              <Text
                variant="caption"
                weight="semibold"
                style={{ color: statusColor, fontSize: 11 }}
              >
                {statusLabel}
              </Text>
            </View>

            {/* Follow Button */}
            <Pressable
              onPress={onFollowPress}
              hitSlop={8}
              style={[
                styles.followButton,
                { backgroundColor: isFollowing ? `${colors.accent.main}25` : `${colors.border}60` },
              ]}
            >
              <Ionicons
                name={isFollowing ? "checkmark-circle" : "add-circle-outline"}
                size={24}
                color={isFollowing ? colors.accent.main : colors.foreground}
              />
            </Pressable>
          </View>
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    borderRadius: 20,
    padding: 12,
    gap: 12,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    gap: 4,
  },
  creator: {
    minHeight: 32,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  followButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});

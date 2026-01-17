import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { PodcastCardData } from "@bouncepad/shared";
import { PodcastCard } from "./PodcastCard";
import { useTheme } from "../lib/theme";

interface CategoryRowProps {
  id: string;
  name: string;
  podcasts: PodcastCardData[];
  onFollow?: (id: string) => void;
  onPodcastPress?: (id: string) => void;
}

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = (screenWidth - 48) / 2; // 2 cards visible with padding
const VISIBLE_COUNT = 4; // Show 4 cards before "Show All"

export function CategoryRow({ id, name, podcasts, onFollow, onPodcastPress }: CategoryRowProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const hasMore = podcasts.length > VISIBLE_COUNT;
  const displayedPodcasts = podcasts.slice(0, VISIBLE_COUNT);

  const handleShowAll = () => {
    router.push({
      pathname: "/explore/[category]",
      params: { category: id, name },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>{name}</Text>
        {hasMore && (
          <Pressable onPress={handleShowAll} style={styles.showAllButton}>
            <Text style={[styles.showAllText, { color: colors.muted }]}>
              Show All ({podcasts.length})
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Horizontal scroll of cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayedPodcasts.map((podcast) => (
          <View key={podcast.id} style={[styles.cardContainer, { width: CARD_WIDTH }]}>
            <PodcastCard
              podcast={podcast}
              onFollow={onFollow}
              onPress={onPodcastPress}
            />
          </View>
        ))}

        {/* Show All card at the end - matches PodcastCard structure */}
        {hasMore && (
          <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
            <Pressable
              onPress={handleShowAll}
              style={[
                styles.showAllCard,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
            >
              {/* Fake image area to match PodcastCard */}
              <View style={[styles.showAllImageArea, { backgroundColor: colors.border }]}>
                <Ionicons name="grid-outline" size={48} color={colors.muted} />
              </View>
              {/* Text area to match PodcastCard */}
              <View style={styles.showAllTextArea}>
                <Text style={[styles.showAllCardText, { color: colors.foreground }]}>
                  Show All
                </Text>
                <Text style={[styles.showAllCardCount, { color: colors.muted }]}>
                  {podcasts.length} shows
                </Text>
              </View>
              {/* Footer spacer to match PodcastCard */}
              <View style={styles.showAllFooter} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  showAllText: {
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardContainer: {
    flexShrink: 0,
  },
  showAllCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    width: "100%",
  },
  showAllImageArea: {
    aspectRatio: 1,
    width: "100%",
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  showAllTextArea: {
    height: 60,
    marginBottom: 12,
    justifyContent: "center",
  },
  showAllCardText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  showAllCardCount: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  showAllFooter: {
    height: 36, // Matches status badge + padding height
  },
});

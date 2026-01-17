import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { PodcastCardData } from "@bouncepad/shared";
import { PodcastCard } from "../../components/PodcastCard";
import { useTheme } from "../../lib/theme";

// Mock data - in real app this would come from Convex based on category
const getMockPodcastsForCategory = (categoryId: string): PodcastCardData[] => {
  const basePodcasts: PodcastCardData[] = [
    { id: "1", title: "The Launch", creatorName: "Jupiter Broadcasting", imageUrl: "https://picsum.photos/seed/launch/400/400", status: "offline", isFollowing: false },
    { id: "2", title: "Linux Unplugged", creatorName: "Jupiter Broadcasting", imageUrl: "https://picsum.photos/seed/linux/400/400", status: "scheduled", isFollowing: true },
    { id: "3", title: "Digitalia", creatorName: "Franco Solerio", imageUrl: "https://picsum.photos/seed/digitalia/400/400", status: "live", isFollowing: false },
    { id: "4", title: "Podcasting 2.0", creatorName: "Podcast Index LLC", imageUrl: "https://picsum.photos/seed/podcasting/400/400", status: "offline", isFollowing: false },
    { id: "5", title: "Bitcoin Socratic", creatorName: "Socratic Seminar", imageUrl: "https://picsum.photos/seed/bitcoin/400/400", status: "offline", isFollowing: true },
    { id: "6", title: "Unrelenting", creatorName: "Gene Naftulyev", imageUrl: "https://picsum.photos/seed/unrelenting/400/400", status: "live", isFollowing: false },
    { id: "7", title: "Radio Bitpunk.fm", creatorName: "Radio bitpunk.fm", imageUrl: "https://picsum.photos/seed/bitpunk2/400/400", status: "scheduled", isFollowing: false },
    { id: "8", title: "Podping Test", creatorName: "Franco Solerio", imageUrl: "https://picsum.photos/seed/podping/400/400", status: "offline", isFollowing: false },
  ];
  return basePodcasts;
};

const screenWidth = Dimensions.get("window").width;
const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

export default function CategoryScreen() {
  const { category, name } = useLocalSearchParams<{ category: string; name: string }>();
  const { colors } = useTheme();
  const router = useRouter();

  const [podcasts, setPodcasts] = useState(() => getMockPodcastsForCategory(category));

  const handleFollow = (id: string) => {
    setPodcasts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFollowing: !p.isFollowing } : p))
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with back button */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={28} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {name || category}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Grid of podcasts */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {podcasts.map((podcast) => (
            <View key={podcast.id} style={[styles.cardContainer, { width: cardWidth }]}>
              <PodcastCard
                podcast={podcast}
                onFollow={handleFollow}
                onPress={(id) => console.log("Pressed:", id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60, // Account for status bar
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 36, // Match back button width for centering
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  cardContainer: {
    flexShrink: 0,
  },
});

import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { EpisodePlayer } from "~/components/EpisodePlayer";
import { usePlayer } from "~/lib/player-context";
import type { EpisodePlayerData } from "@bouncepad/shared";

export const Route = createFileRoute("/episode/$id")({
  component: EpisodePageRoute,
});

// Mock data for demo
const mockEpisode: EpisodePlayerData = {
  id: "ep1",
  title: "600: The Great Linux Panic",
  description: "In this episode, we dive deep into the recent Linux kernel panic that affected millions of servers worldwide. Chris and Wes break down what happened, how it was fixed, and what we can learn from it.",
  podcastId: "demo",
  podcastTitle: "Linux Unplugged",
  podcastImageUrl: "https://picsum.photos/seed/linux/400/400",
  audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  duration: 5400,
  pubDate: Date.now() - 86400000,
  imageUrl: "https://picsum.photos/seed/ep600/400/400",
  chapters: [
    { id: "c1", startTime: 0, title: "Intro & Housekeeping", imageUrl: "https://picsum.photos/seed/chapter1/200/200" },
    { id: "c2", startTime: 180, title: "Community Feedback", imageUrl: "https://picsum.photos/seed/chapter2/200/200" },
    { id: "c3", startTime: 420, title: "The Linux Panic Incident", imageUrl: "https://picsum.photos/seed/chapter3/200/200" },
    { id: "c4", startTime: 900, title: "Technical Deep Dive", imageUrl: "https://picsum.photos/seed/chapter4/200/200" },
    { id: "c5", startTime: 1500, title: "Lessons Learned", imageUrl: "https://picsum.photos/seed/chapter5/200/200" },
    { id: "c6", startTime: 2100, title: "Picks & Outro", imageUrl: "https://picsum.photos/seed/chapter6/200/200" },
  ],
  transcript: [
    { id: "t1", startTime: 0, endTime: 4, text: "Welcome to Linux Unplugged, episode 600!", speaker: "Chris" },
    { id: "t2", startTime: 4, endTime: 8, text: "We have a huge show for you today.", speaker: "Chris" },
    { id: "t3", startTime: 8, endTime: 14, text: "That's right, we're covering the great Linux panic of 2024.", speaker: "Wes" },
    { id: "t4", startTime: 14, endTime: 20, text: "But first, let's get into some community feedback.", speaker: "Chris" },
    { id: "t5", startTime: 20, endTime: 28, text: "We had some great messages come in about last week's episode on containers.", speaker: "Wes" },
    { id: "t6", startTime: 28, endTime: 35, text: "John from Portland writes in about his experience with Podman.", speaker: "Chris" },
    { id: "t7", startTime: 35, endTime: 42, text: "He says he switched from Docker last month and hasn't looked back.", speaker: "Chris" },
    { id: "t8", startTime: 42, endTime: 50, text: "That's great to hear. Podman really has come a long way.", speaker: "Wes" },
  ],
  funding: [
    { url: "https://patreon.com/jupiterbroadcasting", platform: "Patreon", description: "Support the show on Patreon" },
    { url: "https://jupiter.party", platform: "Jupiter Party", description: "Join Jupiter Party for extra content" },
  ],
  comments: [
    {
      id: "comment1",
      episodeId: "ep1",
      userId: "user1",
      userName: "LinuxFan42",
      userImageUrl: "https://picsum.photos/seed/user1/100/100",
      text: "Great episode! Really helped me understand what happened with the kernel panic.",
      timestamp: Date.now() - 3600000,
      episodeTimestamp: 420,
      likeCount: 12,
      isLiked: false,
    },
    {
      id: "comment2",
      episodeId: "ep1",
      userId: "user2",
      userName: "ServerAdmin",
      userImageUrl: "https://picsum.photos/seed/user2/100/100",
      text: "We got hit by this at work. The deep dive was really helpful for explaining it to management.",
      timestamp: Date.now() - 7200000,
      likeCount: 8,
      isLiked: true,
    },
    {
      id: "comment3",
      episodeId: "ep1",
      userId: "user3",
      userName: "PodcastLover",
      text: "Love the show! Been listening since episode 1.",
      timestamp: Date.now() - 86400000,
      likeCount: 5,
      isLiked: false,
      replies: [
        {
          id: "reply1",
          episodeId: "ep1",
          userId: "user4",
          userName: "ChrisFisher",
          userImageUrl: "https://picsum.photos/seed/chris/100/100",
          text: "Thanks for being with us all this time! 🙏",
          timestamp: Date.now() - 43200000,
          parentId: "comment3",
          likeCount: 15,
          isLiked: false,
        },
      ],
    },
  ],
  commentCount: 42,
  // Alternate enclosures for video (Podcasting 2.0)
  alternateSources: [
    {
      url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      type: "video",
      mimeType: "application/x-mpegURL",
      title: "Video (HLS)",
      isDefault: false,
    },
  ],
  people: [
    { id: "1", name: "Chris Fisher", role: "Host", imageUrl: "https://picsum.photos/seed/chris/100/100" },
    { id: "2", name: "Wes Payne", role: "Host", imageUrl: "https://picsum.photos/seed/wes/100/100" },
  ],
  lastPlayedPosition: 420,
};

function EpisodePageRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { setShowMiniPlayer } = usePlayer();

  // Hide mini player while on this screen
  useEffect(() => {
    setShowMiniPlayer(false);

    // Show mini player when leaving this screen
    return () => {
      setShowMiniPlayer(true);
    };
  }, []);

  const handleBack = () => {
    setShowMiniPlayer(true);
    navigate({ to: "/podcast/$id", params: { id: mockEpisode.podcastId } });
  };

  const handleShare = (episodeId: string, method: string, timestamp?: number) => {
    console.log("Share:", episodeId, "via", method, timestamp ? `at ${timestamp}s` : "");
  };

  const handleFundingClick = (url: string) => {
    console.log("Funding:", url);
    window.open(url, "_blank");
  };

  const handleCommentSubmit = (text: string, episodeTimestamp?: number) => {
    console.log("New comment:", text, episodeTimestamp ? `at ${episodeTimestamp}s` : "");
  };

  const handleCommentLike = (commentId: string) => {
    console.log("Like comment:", commentId);
  };

  return (
    <EpisodePlayer
      episode={mockEpisode}
      onBack={handleBack}
      onShare={handleShare}
      onFundingClick={handleFundingClick}
      onCommentSubmit={handleCommentSubmit}
      onCommentLike={handleCommentLike}
    />
  );
}

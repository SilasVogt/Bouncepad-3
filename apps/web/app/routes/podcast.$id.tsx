import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PodcastPage } from "~/components/PodcastPage";
import type { PodcastPageData, PodcastEpisode, PodcastPodrollItem, NotificationSettings } from "@bouncepad/shared";

export const Route = createFileRoute("/podcast/$id")({
  component: PodcastPageRoute,
});

// Mock data for demo
const mockPodcast: PodcastPageData = {
  id: "demo",
  title: "Linux Unplugged",
  author: "Jupiter Broadcasting",
  description: "An open show powered by community LINUX Unplugged takes the best attributes of open collaboration and focuses them into a weekly lifestyle show about Linux.",
  imageUrl: "https://picsum.photos/seed/linux/400/400",
  dominantColor: "#4a90d9",
  status: "live",
  isFollowing: true,
  notifications: { onScheduled: true, before10Min: true, onLive: true },
  lastLiveDate: Date.now() - 86400000 * 3,
  people: [
    { id: "1", name: "Chris Fisher", role: "Host", imageUrl: "https://picsum.photos/seed/chris/100/100" },
    { id: "2", name: "Wes Payne", role: "Host", imageUrl: "https://picsum.photos/seed/wes/100/100" },
    { id: "3", name: "Brent Gervais", role: "Co-Host", imageUrl: "https://picsum.photos/seed/brent/100/100" },
  ],
  trailers: [
    { id: "t1", title: "Show Trailer", url: "https://example.com/trailer.mp3", duration: 180 },
  ],
  episodes: [
    { id: "e1", title: "600: The Great Linux Panic", audioUrl: "https://example.com/ep1.mp3", duration: 5400, pubDate: Date.now() - 86400000, imageUrl: "https://picsum.photos/seed/ep1/100/100" },
    { id: "e2", title: "599: Desktop Deja Vu", audioUrl: "https://example.com/ep2.mp3", duration: 4800, pubDate: Date.now() - 86400000 * 8, imageUrl: "https://picsum.photos/seed/ep2/100/100" },
    { id: "e3", title: "598: Server Side Chat", audioUrl: "https://example.com/ep3.mp3", duration: 5100, pubDate: Date.now() - 86400000 * 15, imageUrl: "https://picsum.photos/seed/ep3/100/100" },
    { id: "e4", title: "597: Year of the Penguin", audioUrl: "https://example.com/ep4.mp3", duration: 4500, pubDate: Date.now() - 86400000 * 22, imageUrl: "https://picsum.photos/seed/ep4/100/100" },
  ],
  funding: [
    { url: "https://patreon.com/jupiterbroadcasting", platform: "Patreon" },
  ],
  podroll: [
    { id: "p1", feedUrl: "https://example.com/feed1", title: "Self-Hosted", imageUrl: "https://picsum.photos/seed/selfhosted/100/100" },
    { id: "p2", feedUrl: "https://example.com/feed2", title: "Coder Radio", imageUrl: "https://picsum.photos/seed/coder/100/100" },
    { id: "p3", feedUrl: "https://example.com/feed3", title: "This Week in Bitcoin", imageUrl: "https://picsum.photos/seed/twib/100/100" },
  ],
  similarPodcasts: [
    { id: "s1", feedUrl: "https://example.com/feed4", title: "Late Night Linux", creatorName: "Late Night Linux", status: "offline" as const, imageUrl: "https://picsum.photos/seed/latenight/100/100" },
    { id: "s2", feedUrl: "https://example.com/feed5", title: "Destination Linux", creatorName: "Destination Linux", status: "offline" as const, imageUrl: "https://picsum.photos/seed/destination/100/100" },
  ],
  websiteUrl: "https://linuxunplugged.com",
};

function PodcastPageRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: "/explore" });
  };

  const handleFollow = (podcastId: string) => {
    console.log("Follow:", podcastId);
  };

  const handleUnfollow = (podcastId: string) => {
    console.log("Unfollow:", podcastId);
  };

  const handleNotificationsChange = (podcastId: string, settings: NotificationSettings) => {
    console.log("Notifications change:", podcastId, settings);
  };

  const handleShare = (podcastId: string, method: string) => {
    console.log("Share:", podcastId, "via", method);
  };

  const handleFundingClick = (url: string) => {
    console.log("Funding:", url);
    window.open(url, "_blank");
  };

  const handlePodrollClick = (item: PodcastPodrollItem) => {
    console.log("Podroll click:", item.title);
  };

  const handleEpisodePlay = (episode: PodcastEpisode) => {
    navigate({ to: "/episode/$id", params: { id: episode.id } });
  };

  return (
    <PodcastPage
      podcast={mockPodcast}
      onBack={handleBack}
      onFollow={handleFollow}
      onUnfollow={handleUnfollow}
      onNotificationsChange={handleNotificationsChange}
      onShare={handleShare}
      onFundingClick={handleFundingClick}
      onPodrollClick={handlePodrollClick}
      onEpisodePlay={handleEpisodePlay}
    />
  );
}

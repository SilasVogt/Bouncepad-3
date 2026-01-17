import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CategoryRow } from "~/components/CategoryRow";
import type { PodcastCardData } from "@bouncepad/shared";

export const Route = createFileRoute("/explore")({
  component: Explore,
});

// Mock data organized by category
const mockCategories: { id: string; name: string; podcasts: PodcastCardData[] }[] = [
  {
    id: "technology",
    name: "Technology",
    podcasts: [
      { id: "t1", title: "Linux Unplugged", creatorName: "Jupiter Broadcasting", imageUrl: "https://picsum.photos/seed/linux/400/400", status: "scheduled", isFollowing: true },
      { id: "t2", title: "Digitalia", creatorName: "Franco Solerio", imageUrl: "https://picsum.photos/seed/digitalia/400/400", status: "live", isFollowing: false },
      { id: "t3", title: "Podcasting 2.0", creatorName: "Podcast Index LLC", imageUrl: "https://picsum.photos/seed/podcasting/400/400", status: "offline", isFollowing: false },
      { id: "t4", title: "The Launch", creatorName: "Jupiter Broadcasting", imageUrl: "https://picsum.photos/seed/launch/400/400", status: "offline", isFollowing: false },
      { id: "t5", title: "Bitcoin Socratic", creatorName: "Socratic Seminar Online", imageUrl: "https://picsum.photos/seed/bitcoin/400/400", status: "offline", isFollowing: true },
      { id: "t6", title: "Unrelenting", creatorName: "Gene Naftulyev & Darren O'Neill", imageUrl: "https://picsum.photos/seed/unrelenting/400/400", status: "offline", isFollowing: false },
      { id: "t7", title: "Radio Bitpunk.fm", creatorName: "Radio bitpunk.fm", imageUrl: "https://picsum.photos/seed/bitpunk/400/400", status: "live", isFollowing: false },
      { id: "t8", title: "Podping Test Podcast", creatorName: "Franco Solerio", imageUrl: "https://picsum.photos/seed/podping/400/400", status: "offline", isFollowing: false },
    ],
  },
  {
    id: "news",
    name: "News",
    podcasts: [
      { id: "n1", title: "The Joe Rooz Show", creatorName: "Joe Russiello", imageUrl: "https://picsum.photos/seed/joerooz/400/400", status: "scheduled", isFollowing: false },
      { id: "n2", title: "Behind the Sch3m3s", creatorName: "Behind The Sch3m3s", imageUrl: "https://picsum.photos/seed/schemes/400/400", status: "offline", isFollowing: true },
      { id: "n3", title: "Planet Rage", creatorName: "Larry Bleidner & Darren O'Neill", imageUrl: "https://picsum.photos/seed/planetrage/400/400", status: "scheduled", isFollowing: false },
      { id: "n4", title: "Mindless Meanderings", creatorName: "Jesse Fries & Jamon Fries", imageUrl: "https://picsum.photos/seed/mindless/400/400", status: "offline", isFollowing: false },
      { id: "n5", title: "Paul English Live", creatorName: "Paul English", imageUrl: "https://picsum.photos/seed/paul/400/400", status: "offline", isFollowing: false },
      { id: "n6", title: "Millennial Media Offensive", creatorName: "Dan G. & John G. Dew", imageUrl: "https://picsum.photos/seed/millennial/400/400", status: "offline", isFollowing: false },
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    podcasts: [
      { id: "e1", title: "Bad Podcast Pitches", creatorName: "Bryan Entzminger", imageUrl: "https://picsum.photos/seed/bad/400/400", status: "offline", isFollowing: false },
      { id: "e2", title: "A Beer, Buds, and Bullshit", creatorName: "R&D Buds", imageUrl: "https://picsum.photos/seed/beer/400/400", status: "live", isFollowing: true },
      { id: "e3", title: "Uncensored", creatorName: "Dee", status: "offline", isFollowing: false },
      { id: "e4", title: "Comedy Hour", creatorName: "Various Artists", imageUrl: "https://picsum.photos/seed/comedy/400/400", status: "scheduled", isFollowing: false },
    ],
  },
  {
    id: "music",
    name: "Music",
    podcasts: [
      { id: "m1", title: "Groove Sessions", creatorName: "DJ Rhythm", imageUrl: "https://picsum.photos/seed/groove/400/400", status: "live", isFollowing: true },
      { id: "m2", title: "Indie Spotlight", creatorName: "Music Discovery", imageUrl: "https://picsum.photos/seed/indie/400/400", status: "offline", isFollowing: false },
      { id: "m3", title: "Classical Corner", creatorName: "Orchestra FM", imageUrl: "https://picsum.photos/seed/classical/400/400", status: "scheduled", isFollowing: false },
    ],
  },
];

function Explore() {
  const [categories, setCategories] = useState(mockCategories);

  const handleFollow = (podcastId: string) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        podcasts: cat.podcasts.map((p) =>
          p.id === podcastId ? { ...p, isFollowing: !p.isFollowing } : p
        ),
      }))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-2">Explore</h1>
      <p className="text-[var(--muted)] mb-8">Discover new streams</p>

      {categories.map((category) => (
        <CategoryRow
          key={category.id}
          name={category.name}
          podcasts={category.podcasts}
          onFollow={handleFollow}
          onPodcastPress={(id) => console.log("Pressed:", id)}
        />
      ))}
    </div>
  );
}

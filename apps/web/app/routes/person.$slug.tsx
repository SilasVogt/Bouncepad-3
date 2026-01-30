import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Plus,
  Check,
  ExternalLink,
  Mic,
} from "lucide-react";
import {
  Card,
  Button,
  Text,
  Avatar,
  VStack,
  HStack,
} from "~/components/ui";

export const Route = createFileRoute("/person/$slug")({
  component: PersonPageRoute,
});

// Mock data - only what's available from <podcast:person> tag
const mockPerson = {
  id: "person1",
  slug: "adam_curry",
  name: "Adam Curry",
  imageUrl: "https://picsum.photos/seed/adamcurry/200/200",
  href: "https://curry.com", // The single href from the tag
  isFollowing: false,
  appearances: [
    {
      podcastId: "p1",
      podcastTitle: "No Agenda",
      podcastImageUrl: "https://picsum.photos/seed/noagenda/100/100",
      role: "Host",
      group: "Cast",
    },
    {
      podcastId: "p2",
      podcastTitle: "Podcasting 2.0",
      podcastImageUrl: "https://picsum.photos/seed/pc20/100/100",
      role: "Host",
      group: "Cast",
    },
    {
      podcastId: "p3",
      podcastTitle: "Linux Unplugged",
      podcastImageUrl: "https://picsum.photos/seed/linux/100/100",
      role: "Guest",
      group: "Cast",
    },
  ],
};

function PersonPageRoute() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();

  const person = mockPerson; // In real app, fetch by slug

  const handleBack = () => {
    window.history.back();
  };

  const handleFollow = () => {
    console.log("Follow person:", person.id);
  };

  const handlePodcastClick = (podcastId: string) => {
    navigate({ to: "/podcast/$id", params: { id: podcastId } });
  };

  return (
    <div className="min-h-screen">
      {/* Gradient backdrop */}
      <div
        className="absolute inset-x-0 top-0 h-64 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, var(--accent-main) 20%, transparent) 0%, var(--background) 100%)`,
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 py-6">
        {/* Back */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Profile Header */}
        <Card variant="glass" padding="lg" radius="xl" className="mb-6">
          <HStack gap="lg" align="center">
            <Avatar
              src={person.imageUrl}
              fallback={person.name}
              size="xl"
            />
            <VStack gap="sm" align="start" className="flex-1">
              <Text variant="h3">{person.name}</Text>

              {person.href && (
                <a
                  href={person.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                >
                  <ExternalLink size={14} />
                  {person.href.replace(/^https?:\/\//, "")}
                </a>
              )}

              <Text variant="caption" muted>
                Appears in {person.appearances.length} podcast{person.appearances.length !== 1 ? "s" : ""}
              </Text>
            </VStack>

            <Button
              variant={person.isFollowing ? "glow" : "solid"}
              leftIcon={person.isFollowing ? <Check size={18} /> : <Plus size={18} />}
              onPress={handleFollow}
            >
              {person.isFollowing ? "Following" : "Follow"}
            </Button>
          </HStack>
        </Card>

        {/* Podcast Appearances */}
        <section>
          <Text variant="label" muted className="mb-4">Appears In</Text>
          <VStack gap="sm">
            {person.appearances.map((appearance) => (
              <Card
                key={appearance.podcastId}
                variant="glass"
                glassIntensity="subtle"
                padding="md"
                radius="xl"
                pressable
                onPress={() => handlePodcastClick(appearance.podcastId)}
              >
                <HStack gap="md">
                  <img
                    src={appearance.podcastImageUrl}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <VStack gap="xs" align="start" className="flex-1">
                    <Text variant="body" weight="medium">{appearance.podcastTitle}</Text>
                    <HStack gap="sm">
                      <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                        {appearance.role}
                      </span>
                      {appearance.group && (
                        <Text variant="caption" muted>{appearance.group}</Text>
                      )}
                    </HStack>
                  </VStack>
                  <Mic size={18} className="text-[var(--muted)]" />
                </HStack>
              </Card>
            ))}
          </VStack>
        </section>
      </div>
    </div>
  );
}

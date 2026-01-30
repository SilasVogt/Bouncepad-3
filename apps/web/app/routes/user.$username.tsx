import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Link as LinkIcon,
  MapPin,
  Settings,
  Plus,
  Check,
  Mic,
  Users,
  Radio,
} from "lucide-react";
import {
  Card,
  Button,
  Text,
  Avatar,
  VStack,
  HStack,
  Modal,
} from "~/components/ui";

export const Route = createFileRoute("/user/$username")({
  component: UserProfileRoute,
});

// Mock data for demo
const mockUser = {
  id: "user1",
  username: "silasonlinux2",
  displayName: "Silas Vogt",
  bio: "Podcast enthusiast and open source advocate. Building Bouncepad.",
  avatarUrl: "https://picsum.photos/seed/silas/200/200",
  location: "Germany",
  website: "https://example.com",
  joinedAt: Date.now() - 86400000 * 365,
  isFollowing: false,
  isOwnProfile: true,
  // Separate counts
  followersCount: 42,
  followingUsersCount: 15,
  followingPodcastsCount: 12,
  followingPeopleCount: 8,
  // Mock lists for modals
  followers: [
    { id: "u1", username: "podcastfan", displayName: "Podcast Fan", avatarUrl: "https://picsum.photos/seed/fan1/100/100" },
    { id: "u2", username: "linuxlover", displayName: "Linux Lover", avatarUrl: "https://picsum.photos/seed/fan2/100/100" },
    { id: "u3", username: "techie", displayName: "Tech Enthusiast", avatarUrl: "https://picsum.photos/seed/fan3/100/100" },
  ],
  followingUsers: [
    { id: "u4", username: "opensource_dev", displayName: "Open Source Dev", avatarUrl: "https://picsum.photos/seed/dev1/100/100" },
    { id: "u5", username: "podcastlover", displayName: "Podcast Lover", avatarUrl: "https://picsum.photos/seed/dev2/100/100" },
  ],
  followingPodcasts: [
    { id: "p1", title: "Linux Unplugged", imageUrl: "https://picsum.photos/seed/linux/100/100" },
    { id: "p2", title: "Self-Hosted", imageUrl: "https://picsum.photos/seed/selfhosted/100/100" },
    { id: "p3", title: "Coder Radio", imageUrl: "https://picsum.photos/seed/coder/100/100" },
  ],
  followingPeople: [
    { id: "pe1", name: "Adam Curry", slug: "adam_curry", imageUrl: "https://picsum.photos/seed/adam/100/100" },
    { id: "pe2", name: "Chris Fisher", slug: "chris_fisher", imageUrl: "https://picsum.photos/seed/chris/100/100" },
  ],
};

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

// Followers Modal
function FollowersModal({
  isOpen,
  onClose,
  followers,
  onUserClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  followers: typeof mockUser.followers;
  onUserClick: (username: string) => void;
}) {
  return (
    <Modal visible={isOpen} onClose={onClose} title="Followers" size="sm">
      <VStack gap="sm">
        {followers.length === 0 ? (
          <Text variant="body" muted align="center">No followers yet</Text>
        ) : (
          followers.map((follower) => (
            <Card
              key={follower.id}
              variant="glass"
              glassIntensity="subtle"
              padding="sm"
              radius="xl"
              pressable
              onPress={() => { onUserClick(follower.username); onClose(); }}
            >
              <HStack gap="sm">
                <Avatar src={follower.avatarUrl} fallback={follower.displayName} size="sm" />
                <VStack gap="none" align="start">
                  <Text variant="body" weight="medium">{follower.displayName}</Text>
                  <Text variant="caption" muted>@{follower.username}</Text>
                </VStack>
              </HStack>
            </Card>
          ))
        )}
      </VStack>
    </Modal>
  );
}

// Following Users Modal
function FollowingUsersModal({
  isOpen,
  onClose,
  users,
  onUserClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  users: typeof mockUser.followingUsers;
  onUserClick: (username: string) => void;
}) {
  return (
    <Modal visible={isOpen} onClose={onClose} title="Following Users" size="sm">
      <VStack gap="sm">
        {users.length === 0 ? (
          <Text variant="body" muted align="center">Not following any users</Text>
        ) : (
          users.map((user) => (
            <Card
              key={user.id}
              variant="glass"
              glassIntensity="subtle"
              padding="sm"
              radius="xl"
              pressable
              onPress={() => { onUserClick(user.username); onClose(); }}
            >
              <HStack gap="sm">
                <Avatar src={user.avatarUrl} fallback={user.displayName} size="sm" />
                <VStack gap="none" align="start">
                  <Text variant="body" weight="medium">{user.displayName}</Text>
                  <Text variant="caption" muted>@{user.username}</Text>
                </VStack>
              </HStack>
            </Card>
          ))
        )}
      </VStack>
    </Modal>
  );
}

// Following Podcasts Modal
function FollowingPodcastsModal({
  isOpen,
  onClose,
  podcasts,
  onPodcastClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  podcasts: typeof mockUser.followingPodcasts;
  onPodcastClick: (id: string) => void;
}) {
  return (
    <Modal visible={isOpen} onClose={onClose} title="Following Podcasts" size="sm">
      <VStack gap="sm">
        {podcasts.length === 0 ? (
          <Text variant="body" muted align="center">Not following any podcasts</Text>
        ) : (
          podcasts.map((podcast) => (
            <Card
              key={podcast.id}
              variant="glass"
              glassIntensity="subtle"
              padding="sm"
              radius="xl"
              pressable
              onPress={() => { onPodcastClick(podcast.id); onClose(); }}
            >
              <HStack gap="sm">
                <img src={podcast.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <Text variant="body" weight="medium">{podcast.title}</Text>
              </HStack>
            </Card>
          ))
        )}
      </VStack>
    </Modal>
  );
}

// Following People Modal
function FollowingPeopleModal({
  isOpen,
  onClose,
  people,
  onPersonClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  people: typeof mockUser.followingPeople;
  onPersonClick: (slug: string) => void;
}) {
  return (
    <Modal visible={isOpen} onClose={onClose} title="Following People" size="sm">
      <VStack gap="sm">
        {people.length === 0 ? (
          <Text variant="body" muted align="center">Not following anyone</Text>
        ) : (
          people.map((person) => (
            <Card
              key={person.id}
              variant="glass"
              glassIntensity="subtle"
              padding="sm"
              radius="xl"
              pressable
              onPress={() => { onPersonClick(person.slug); onClose(); }}
            >
              <HStack gap="sm">
                <Avatar src={person.imageUrl} fallback={person.name} size="sm" />
                <Text variant="body" weight="medium">{person.name}</Text>
              </HStack>
            </Card>
          ))
        )}
      </VStack>
    </Modal>
  );
}

function UserProfileRoute() {
  const { username } = Route.useParams();
  const navigate = useNavigate();

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowingUsers, setShowFollowingUsers] = useState(false);
  const [showFollowingPodcasts, setShowFollowingPodcasts] = useState(false);
  const [showFollowingPeople, setShowFollowingPeople] = useState(false);

  const user = mockUser; // In real app, fetch by username

  const handleBack = () => {
    navigate({ to: "/" });
  };

  const handleFollow = () => {
    console.log("Follow user:", user.id);
  };

  const handleEditProfile = () => {
    navigate({ to: "/settings" });
  };

  const handleUserClick = (username: string) => {
    navigate({ to: "/user/$username", params: { username } });
  };

  const handlePodcastClick = (id: string) => {
    navigate({ to: "/podcast/$id", params: { id } });
  };

  const handlePersonClick = (slug: string) => {
    navigate({ to: "/person/$slug", params: { slug } });
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
          <VStack gap="md">
            {/* Top section: Avatar, info, and button */}
            <HStack gap="lg" align="start">
              <Avatar
                src={user.avatarUrl}
                fallback={user.displayName}
                size="xl"
              />
              <VStack gap="sm" align="start" className="flex-1">
                <VStack gap="none" align="start">
                  <Text variant="h3">{user.displayName}</Text>
                  <Text variant="body" muted>@{user.username}</Text>
                </VStack>

                {user.bio && (
                  <Text variant="body">
                    {user.bio}
                  </Text>
                )}

                <HStack gap="md" wrap>
                  {user.location && (
                    <HStack gap="xs">
                      <MapPin size={14} className="text-[var(--muted)]" />
                      <Text variant="caption" muted>{user.location}</Text>
                    </HStack>
                  )}
                  {user.website && (
                    <HStack gap="xs">
                      <LinkIcon size={14} className="text-[var(--muted)]" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                        {user.website.replace(/^https?:\/\//, "")}
                      </a>
                    </HStack>
                  )}
                  <HStack gap="xs">
                    <Calendar size={14} className="text-[var(--muted)]" />
                    <Text variant="caption" muted>Joined {formatDate(user.joinedAt)}</Text>
                  </HStack>
                </HStack>
              </VStack>

              {user.isOwnProfile ? (
                <Button
                  variant="glass"
                  leftIcon={<Settings size={18} />}
                  onPress={handleEditProfile}
                >
                  Settings
                </Button>
              ) : (
                <Button
                  variant={user.isFollowing ? "glow" : "solid"}
                  leftIcon={user.isFollowing ? <Check size={18} /> : <Plus size={18} />}
                  onPress={handleFollow}
                >
                  {user.isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </HStack>

            {/* Bottom section: Stats aligned */}
            <HStack justify="between" className="pt-4 border-t border-[var(--border)]/30">
              {/* Left: Fan of */}
              <VStack gap="xs" align="start">
                <Text variant="label" muted>Fan of</Text>
                <HStack gap="lg">
                  <button
                    onClick={() => setShowFollowingPodcasts(true)}
                    className="flex flex-col items-center hover:text-accent transition-colors"
                  >
                    <Text variant="h4" weight="semibold">{user.followingPodcastsCount}</Text>
                    <Text variant="caption" muted>podcasts</Text>
                  </button>
                  <button
                    onClick={() => setShowFollowingPeople(true)}
                    className="flex flex-col items-center hover:text-accent transition-colors"
                  >
                    <Text variant="h4" weight="semibold">{user.followingPeopleCount}</Text>
                    <Text variant="caption" muted>people</Text>
                  </button>
                </HStack>
              </VStack>

              {/* Right: Social */}
              <VStack gap="xs" align="end">
                <Text variant="label" muted>Social</Text>
                <HStack gap="lg">
                  <button
                    onClick={() => setShowFollowers(true)}
                    className="flex flex-col items-center hover:text-accent transition-colors"
                  >
                    <Text variant="h4" weight="semibold">{user.followersCount}</Text>
                    <Text variant="caption" muted>followers</Text>
                  </button>
                  <button
                    onClick={() => setShowFollowingUsers(true)}
                    className="flex flex-col items-center hover:text-accent transition-colors"
                  >
                    <Text variant="h4" weight="semibold">{user.followingUsersCount}</Text>
                    <Text variant="caption" muted>following</Text>
                  </button>
                </HStack>
              </VStack>
            </HStack>
          </VStack>
        </Card>

        {/* Following Podcasts Preview */}
        {user.followingPodcasts.length > 0 && (
          <section className="mb-6">
            <HStack justify="between" className="mb-4">
              <Text variant="label" muted>Following Podcasts</Text>
              {user.followingPodcasts.length > 3 && (
                <button
                  onClick={() => setShowFollowingPodcasts(true)}
                  className="text-sm text-accent hover:underline"
                >
                  See all
                </button>
              )}
            </HStack>
            <HStack gap="sm" wrap>
              {user.followingPodcasts.slice(0, 6).map((podcast) => (
                <Card
                  key={podcast.id}
                  variant="glass"
                  glassIntensity="subtle"
                  padding="sm"
                  radius="xl"
                  pressable
                  onPress={() => handlePodcastClick(podcast.id)}
                >
                  <HStack gap="sm">
                    <img
                      src={podcast.imageUrl}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <Text variant="caption" weight="medium">{podcast.title}</Text>
                  </HStack>
                </Card>
              ))}
            </HStack>
          </section>
        )}

        {/* Following People Preview */}
        {user.followingPeople.length > 0 && (
          <section>
            <HStack justify="between" className="mb-4">
              <Text variant="label" muted>Following People</Text>
              {user.followingPeople.length > 3 && (
                <button
                  onClick={() => setShowFollowingPeople(true)}
                  className="text-sm text-accent hover:underline"
                >
                  See all
                </button>
              )}
            </HStack>
            <HStack gap="sm" wrap>
              {user.followingPeople.slice(0, 6).map((person) => (
                <Card
                  key={person.id}
                  variant="glass"
                  glassIntensity="subtle"
                  padding="sm"
                  radius="xl"
                  pressable
                  onPress={() => handlePersonClick(person.slug)}
                >
                  <HStack gap="sm">
                    <Avatar src={person.imageUrl} fallback={person.name} size="sm" />
                    <Text variant="caption" weight="medium">{person.name}</Text>
                  </HStack>
                </Card>
              ))}
            </HStack>
          </section>
        )}
      </div>

      {/* Modals */}
      <FollowersModal
        isOpen={showFollowers}
        onClose={() => setShowFollowers(false)}
        followers={user.followers}
        onUserClick={handleUserClick}
      />
      <FollowingUsersModal
        isOpen={showFollowingUsers}
        onClose={() => setShowFollowingUsers(false)}
        users={user.followingUsers}
        onUserClick={handleUserClick}
      />
      <FollowingPodcastsModal
        isOpen={showFollowingPodcasts}
        onClose={() => setShowFollowingPodcasts(false)}
        podcasts={user.followingPodcasts}
        onPodcastClick={handlePodcastClick}
      />
      <FollowingPeopleModal
        isOpen={showFollowingPeople}
        onClose={() => setShowFollowingPeople(false)}
        people={user.followingPeople}
        onPersonClick={handlePersonClick}
      />
    </div>
  );
}

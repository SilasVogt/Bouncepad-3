import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Search, Settings, Bell, User, Heart, Plus, PlusCircle, X, Check, Mail, Radio, CheckCircle } from "lucide-react";
import {
  Button,
  Text,
  Input,
  Card,
  Avatar,
  Badge,
  Skeleton,
  VStack,
  HStack,
  Box,
  Divider,
  HList,
  IconButton,
  Switch,
  Tabs,
  Spinner,
  Modal,
  ToastProvider,
  useToast,
} from "~/components/ui";
import { AccentColorPicker } from "~/components/AccentColorPicker";
import { useTheme } from "~/lib/theme";

export const Route = createFileRoute("/showcase")({
  component: ShowcasePage,
});

function ShowcasePage() {
  return (
    <ToastProvider>
      <ShowcaseContent />
    </ToastProvider>
  );
}

// Podcast Card Component
function PodcastCard({
  title,
  author,
  status,
  subscribed,
  imageUrl,
}: {
  title: string;
  author: string;
  status: "live" | "offline" | "scheduled";
  subscribed: boolean;
  imageUrl: string;
}) {
  const isLive = status === "live";
  const isScheduled = status === "scheduled";

  return (
    <div
      className={`
        w-[200px] shrink-0 rounded-2xl overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-[0_0_30px_-5px_var(--accent-main)]
        group
        ${isLive ? "glass-card-glow" : "glass-card"}
      `}
    >
      {/* Image container */}
      <div className="p-4 pb-0">
        <div className="aspect-square rounded-xl overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3">
        <Text variant="body" weight="semibold" numberOfLines={1}>{title}</Text>
        <Text variant="caption" muted numberOfLines={2} className="mt-1 min-h-[2.5rem]">{author}</Text>

        {/* Actions */}
        <HStack gap="sm" align="center" justify="between" className="mt-4">
          {isLive ? (
            <Button variant="solid" size="sm" leftIcon={<Radio size={14} />}>
              LIVE
            </Button>
          ) : isScheduled ? (
            <Button variant="outline" size="sm">
              SCHEDULED
            </Button>
          ) : (
            <Button variant="glass" size="sm">
              OFFLINE
            </Button>
          )}

          <IconButton
            icon={subscribed ? <CheckCircle size={18} /> : <PlusCircle size={18} />}
            variant={subscribed ? "solid" : "ghost"}
            size="sm"
            label={subscribed ? "Subscribed" : "Subscribe"}
          />
        </HStack>
      </div>
    </div>
  );
}

function ShowcaseContent() {
  const { setMode, mode } = useTheme();
  const toast = useToast();
  const [inputValue, setInputValue] = useState("");
  const [switchValue, setSwitchValue] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <VStack gap="xl">
        {/* Header */}
        <VStack gap="sm">
          <Text variant="h1">Design System Showcase</Text>
          <Text variant="body" muted>
            A comprehensive preview of all UI primitives with 3D glass effects and animations.
          </Text>
        </VStack>

        {/* Theme Settings */}
        <Card variant="glow" padding="lg" radius="xl">
          <VStack gap="md">
            <Text variant="h3">Theme Settings</Text>
            <HStack gap="md" align="center" wrap>
              <Text variant="body">Mode:</Text>
              {(["system", "light", "dark"] as const).map((m) => (
                <Button
                  key={m}
                  variant={mode === m ? "solid" : "glass"}
                  size="sm"
                  onPress={() => setMode(m)}
                >
                  {m}
                </Button>
              ))}
            </HStack>
            <VStack gap="sm">
              <Text variant="body">Accent Color:</Text>
              <AccentColorPicker />
            </VStack>
          </VStack>
        </Card>

        <Divider />

        {/* Buttons */}
        <VStack gap="md">
          <Text variant="h2">Buttons</Text>

          <VStack gap="sm">
            <Text variant="label">Variants</Text>
            <HStack gap="sm" wrap>
              <Button variant="solid">Solid</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="glass">Glass</Button>
              <Button variant="glow">Glow</Button>
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">Sizes</Text>
            <HStack gap="sm" align="center" wrap>
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">With Icons</Text>
            <HStack gap="sm" wrap>
              <Button leftIcon={<Plus size={16} />}>Add Item</Button>
              <Button variant="outline" rightIcon={<Check size={16} />}>
                Confirm
              </Button>
              <Button variant="glass" leftIcon={<Settings size={16} />}>
                Settings
              </Button>
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">States</Text>
            <HStack gap="sm" wrap>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </HStack>
            <Button variant="glow" fullWidth>
              Full Width Glow Button
            </Button>
          </VStack>
        </VStack>

        <Divider />

        {/* Typography */}
        <VStack gap="md">
          <Text variant="h2">Typography</Text>

          <VStack gap="sm">
            <Text variant="label">Display (Instrument Serif)</Text>
            <Text variant="display">Beautiful Display Headline</Text>
          </VStack>

          <Card variant="default" padding="lg">
            <VStack gap="md">
              <VStack gap="sm">
                <Text variant="label">Headings (Inter)</Text>
                <Text variant="h1">Heading 1</Text>
                <Text variant="h2">Heading 2</Text>
                <Text variant="h3">Heading 3</Text>
                <Text variant="h4">Heading 4</Text>
              </VStack>

              <Divider />

              <VStack gap="sm">
                <Text variant="label">Body Text</Text>
                <Text variant="body">Body text - The quick brown fox jumps over the lazy dog.</Text>
                <Text variant="body" muted>Muted text for secondary information</Text>
                <Text variant="body" accent>Accent colored text</Text>
              </VStack>

              <Divider />

              <VStack gap="sm">
                <Text variant="label">Small Text</Text>
                <Text variant="caption">Caption text - Supporting information and details.</Text>
                <Text variant="label">Label Text</Text>
              </VStack>
            </VStack>
          </Card>
        </VStack>

        <Divider />

        {/* Cards */}
        <VStack gap="md">
          <Text variant="h2">Cards</Text>

          <HStack gap="md" wrap>
            <div className="flex-1 min-w-[200px]">
              <Card variant="glass" padding="lg">
                <VStack gap="sm">
                  <Text variant="h4">Glass Card</Text>
                  <Text variant="body" muted>Frosted glass with blur</Text>
                </VStack>
              </Card>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Card variant="glow" padding="lg">
                <VStack gap="sm">
                  <Text variant="h4">Glow Card</Text>
                  <Text variant="body" muted>Accent glow border</Text>
                </VStack>
              </Card>
            </div>
          </HStack>

          <VStack gap="sm">
            <Text variant="label">Glass Intensities</Text>
            <HStack gap="md" wrap>
              <div className="flex-1 min-w-[150px]">
                <Card variant="glass" glassIntensity="subtle" padding="md">
                  <Text variant="body">Subtle</Text>
                </Card>
              </div>
              <div className="flex-1 min-w-[150px]">
                <Card variant="glass" glassIntensity="medium" padding="md">
                  <Text variant="body">Medium</Text>
                </Card>
              </div>
              <div className="flex-1 min-w-[150px]">
                <Card variant="glass" glassIntensity="strong" padding="md">
                  <Text variant="body">Strong</Text>
                </Card>
              </div>
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">Default Card</Text>
            <Card variant="default" padding="md">
              <VStack gap="sm">
                <Text variant="h4">Default Card</Text>
                <Text variant="body" muted>Standard bordered card without glass</Text>
              </VStack>
            </Card>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">Pressable Card</Text>
            <Card
              variant="glow"
              padding="lg"
              pressable
              onPress={() => toast.info("Card pressed!")}
            >
              <HStack gap="md" align="center">
                <Avatar fallback="BC" size="lg" />
                <VStack gap="xs">
                  <Text variant="h4">Pressable Glow Card</Text>
                  <Text variant="caption" muted>Click me for a toast notification</Text>
                </VStack>
              </HStack>
            </Card>
          </VStack>
        </VStack>

        <Divider />

        {/* Inputs */}
        <VStack gap="md">
          <Text variant="h2">Inputs</Text>
          <HStack gap="md" wrap align="start">
            <Box flex>
              <Input
                label="Default Input"
                placeholder="Enter text..."
                value={inputValue}
                onChangeText={setInputValue}
              />
            </Box>
            <Box flex>
              <Input
                variant="glass"
                label="Glass Input"
                placeholder="Glass variant..."
              />
            </Box>
          </HStack>
          <HStack gap="md" wrap align="start">
            <Box flex>
              <Input
                label="With Icon"
                placeholder="Search..."
                leftElement={<Search size={18} />}
              />
            </Box>
            <Box flex>
              <Input
                label="Error State"
                placeholder="Invalid input"
                error
                errorMessage="This field is required"
              />
            </Box>
          </HStack>
          <HStack gap="md" wrap align="start">
            <Input size="sm" placeholder="Small" />
            <Input size="md" placeholder="Medium" />
            <Input size="lg" placeholder="Large" />
          </HStack>
        </VStack>

        <Divider />

        {/* Avatars & Badges */}
        <VStack gap="md">
          <Text variant="h2">Avatars & Badges</Text>

          <VStack gap="sm">
            <Text variant="label">Avatar Sizes</Text>
            <HStack gap="md" align="center">
              <Avatar fallback="XS" size="xs" />
              <Avatar fallback="SM" size="sm" />
              <Avatar fallback="MD" size="md" />
              <Avatar fallback="LG" size="lg" />
              <Avatar fallback="XL" size="xl" />
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">With Status</Text>
            <HStack gap="md" align="center">
              <Avatar fallback="ON" showStatus statusColor="online" />
              <Avatar fallback="OF" showStatus statusColor="offline" />
              <Avatar fallback="BS" showStatus statusColor="busy" />
              <Avatar fallback="AW" showStatus statusColor="away" />
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">Badges</Text>
            <HStack gap="sm" align="center">
              <Badge>Default</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="glass">Glass</Badge>
              <Badge size="md">Medium</Badge>
            </HStack>
          </VStack>
        </VStack>

        <Divider />

        {/* Interactive */}
        <VStack gap="md">
          <Text variant="h2">Interactive Components</Text>

          <VStack gap="sm">
            <Text variant="label">Icon Buttons</Text>
            <HStack gap="sm">
              <IconButton icon={<Home size={20} />} label="Home" />
              <IconButton icon={<Search size={20} />} label="Search" variant="outline" />
              <IconButton icon={<Bell size={20} />} label="Notifications" variant="glass" />
              <IconButton icon={<Settings size={20} />} label="Settings" variant="glow" />
              <IconButton icon={<Heart size={20} />} label="Like" variant="solid" />
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">Switch</Text>
            <HStack gap="lg">
              <Switch value={switchValue} onValueChange={setSwitchValue} />
              <Switch value={switchValue} onValueChange={setSwitchValue} label="With Label" />
              <Switch value={true} onValueChange={() => {}} disabled label="Disabled" />
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">Tabs</Text>
            <VStack gap="md">
              <Tabs
                items={[
                  { key: "tab1", label: "Overview" },
                  { key: "tab2", label: "Analytics" },
                  { key: "tab3", label: "Settings" },
                ]}
                activeKey={activeTab}
                onChange={setActiveTab}
              />
              <Tabs
                variant="pills"
                items={[
                  { key: "tab1", label: "All" },
                  { key: "tab2", label: "Active" },
                  { key: "tab3", label: "Archived" },
                ]}
                activeKey={activeTab}
                onChange={setActiveTab}
              />
              <Tabs
                variant="underline"
                items={[
                  { key: "tab1", label: "Posts", icon: <Mail size={16} /> },
                  { key: "tab2", label: "Followers", icon: <User size={16} /> },
                  { key: "tab3", label: "Settings", icon: <Settings size={16} /> },
                ]}
                activeKey={activeTab}
                onChange={setActiveTab}
              />
            </VStack>
          </VStack>
        </VStack>

        <Divider />

        {/* Horizontal List */}
        <VStack gap="md">
          <Text variant="h2">Horizontal List</Text>
          <HList
            data={Array.from({ length: 8 }, (_, i) => ({ id: i, name: `Item ${i + 1}` }))}
            keyExtractor={(item) => String(item.id)}
            gap="md"
            renderItem={(item) => (
              <Card variant="glass" padding="md">
                <VStack gap="sm" align="center">
                  <Avatar fallback={item.name[0]} size="lg" />
                  <Text variant="body">{item.name}</Text>
                </VStack>
              </Card>
            )}
          />
        </VStack>

        <Divider />

        {/* Podcast Cards Example */}
        <VStack gap="md">
          <HStack justify="between" align="center">
            <Text variant="h2">Podcast Cards</Text>
            <Text variant="body" muted>Show All (8)</Text>
          </HStack>
          <HList
            data={[
              { id: 1, title: "Linux Unplugged", author: "Jupiter Broadcasting", status: "scheduled", subscribed: true, image: "https://picsum.photos/seed/linux/200" },
              { id: 2, title: "Digitalia", author: "Franco Solerio", status: "live", subscribed: false, image: "https://picsum.photos/seed/digital/200" },
              { id: 3, title: "Podcasting 2.0", author: "Podcast Index LLC", status: "offline", subscribed: false, image: "https://picsum.photos/seed/podcast/200" },
              { id: 4, title: "The Launch", author: "Jupiter Broadcasting", status: "offline", subscribed: false, image: "https://picsum.photos/seed/launch/200" },
              { id: 5, title: "Bitcoin Socratic", author: "Socratic Seminar Online", status: "offline", subscribed: true, image: "https://picsum.photos/seed/bitcoin/200" },
              { id: 6, title: "Unrelenting", author: "Gene Naftulyev", status: "offline", subscribed: false, image: "https://picsum.photos/seed/unrelent/200" },
              { id: 7, title: "Radio Bitpunk.fm", author: "Radio bitpunk.fm", status: "live", subscribed: false, image: "https://picsum.photos/seed/radio/200" },
            ]}
            keyExtractor={(item) => String(item.id)}
            gap="md"
            renderItem={(podcast) => (
              <PodcastCard
                title={podcast.title}
                author={podcast.author}
                status={podcast.status as "live" | "offline" | "scheduled"}
                subscribed={podcast.subscribed}
                imageUrl={podcast.image}
              />
            )}
          />
        </VStack>

        <Divider />

        {/* Skeletons */}
        <VStack gap="md">
          <Text variant="h2">Loading States</Text>

          <VStack gap="sm">
            <Text variant="label">Spinner</Text>
            <HStack gap="md" align="center">
              <Spinner size="xs" />
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="xl" />
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">Skeletons</Text>
            <HStack gap="md">
              <Card variant="default" padding="md">
                <HStack gap="md" align="center">
                  <Skeleton circle height={48} />
                  <VStack gap="sm">
                    <Skeleton width={120} height={16} />
                    <Skeleton width={80} height={12} />
                  </VStack>
                </HStack>
              </Card>
              <Card variant="glass" padding="md">
                <VStack gap="sm">
                  <Skeleton width="100%" height={100} radius="lg" />
                  <Skeleton width="80%" height={16} />
                  <Skeleton width="60%" height={12} />
                </VStack>
              </Card>
            </HStack>
          </VStack>
        </VStack>

        <Divider />

        {/* Feedback */}
        <VStack gap="md">
          <Text variant="h2">Feedback Components</Text>

          <VStack gap="sm">
            <Text variant="label">Toast Notifications</Text>
            <HStack gap="sm" wrap>
              <Button variant="outline" onPress={() => toast.success("Success message!")}>
                Success Toast
              </Button>
              <Button variant="outline" onPress={() => toast.error("Error message!")}>
                Error Toast
              </Button>
              <Button variant="outline" onPress={() => toast.warning("Warning message!")}>
                Warning Toast
              </Button>
              <Button variant="outline" onPress={() => toast.info("Info message!")}>
                Info Toast
              </Button>
            </HStack>
            <HStack gap="sm" wrap>
              <Button
                variant="outline"
                onPress={() =>
                  toast.info(
                    "This is a longer toast message to demonstrate how the component handles multiple lines of text. It should wrap nicely and remain readable.",
                    { title: "Longer Notification" }
                  )
                }
              >
                Long Toast with Title
              </Button>
              <Button
                variant="outline"
                onPress={() =>
                  toast.success(
                    "Your changes have been saved successfully. The new settings will take effect immediately across all your devices.",
                    { title: "Settings Updated" }
                  )
                }
              >
                Success with Details
              </Button>
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">Modal</Text>
            <Button variant="glow" onPress={() => setModalVisible(true)}>
              Open Modal
            </Button>
          </VStack>
        </VStack>

        <Modal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Example Modal"
          footer={
            <>
              <Button variant="ghost" onPress={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button variant="solid" onPress={() => setModalVisible(false)}>
                Confirm
              </Button>
            </>
          }
        >
          <VStack gap="md">
            <Text variant="body">
              This is a modal dialog with glass effects. It includes a backdrop blur,
              animated entrance, and keyboard dismissal support.
            </Text>
            <Input label="Example Input" placeholder="Type something..." />
          </VStack>
        </Modal>

        {/* Footer spacing */}
        <Box padding="xl" />
      </VStack>
    </div>
  );
}

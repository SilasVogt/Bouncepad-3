import { useState } from "react";
import { ScrollView, View, StyleSheet, Platform, Image } from "react-native";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  GlassView as ExpoGlassView,
  GlassContainer,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import type { ThemeMode } from "@bouncepad/shared";
import { useTheme } from "../lib/theme";
import { AccentColorPicker } from "../components/AccentColorPicker";
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
  NativeAlert,
  ToastProvider,
  useToast,
  GlassView,
  PodcastCard,
} from "../components/ui";

export default function ShowcaseScreen() {
  return (
    <ToastProvider>
      <ShowcaseContent />
    </ToastProvider>
  );
}

function ShowcaseContent() {
  const { colors, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [inputValue, setInputValue] = useState("");
  const [switchValue, setSwitchValue] = useState(false);
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <>
      <Stack.Screen
        options={{
          title: "Design System",
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: "systemMaterial",
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 100, paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Header */}
        <VStack gap="sm">
          <Text variant="h1">Showcase</Text>
          <Text variant="body" muted>
            Preview of all UI components with glass effects.
          </Text>
        </VStack>

        {/* Theme Settings */}
        <GlassView intensity="medium" borderRadius={16} padding={16}>
          <VStack gap="md">
            <Text variant="h3">Theme Settings</Text>
            <HStack gap="sm" align="center">
              <Text variant="body">Mode:</Text>
              {(["system", "light", "dark"] as ThemeMode[]).map((m) => (
                <Button
                  key={m}
                  variant={mode === m ? "solid" : "outline"}
                  size="sm"
                  onPress={() => setMode(m)}
                >
                  {m}
                </Button>
              ))}
            </HStack>
            <VStack gap="xs">
              <Text variant="body">Accent Color:</Text>
              <AccentColorPicker />
            </VStack>
          </VStack>
        </GlassView>

        <Divider />

        {/* Buttons */}
        <VStack gap="md">
          <Text variant="h2">Buttons</Text>

          <VStack gap="xs">
            <Text variant="label">Variants</Text>
            <HStack gap="sm" wrap>
              <Button variant="solid">Solid</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="glass">Glass</Button>
              <Button variant="glow">Glow</Button>
            </HStack>
          </VStack>

          <VStack gap="xs">
            <Text variant="label">Sizes</Text>
            <HStack gap="sm" align="center" wrap>
              <Button size="xs">XS</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </HStack>
          </VStack>

          <VStack gap="xs">
            <Text variant="label">With Icons</Text>
            <HStack gap="sm" wrap>
              <Button
                leftIcon={<Ionicons name="add" size={16} color="#fff" />}
              >
                Add
              </Button>
              <Button
                variant="outline"
                rightIcon={<Ionicons name="checkmark" size={16} color={colors.foreground} />}
              >
                Confirm
              </Button>
            </HStack>
          </VStack>

          <VStack gap="xs">
            <Text variant="label">States</Text>
            <HStack gap="sm" wrap>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </HStack>
            <Button variant="glow" fullWidth>
              Full Width Glow
            </Button>
          </VStack>
        </VStack>

        <Divider />

        {/* Typography */}
        <VStack gap="md">
          <Text variant="h2">Typography</Text>
          <Card variant="default" padding="md">
            <VStack gap="xs">
              <Text variant="h1">Heading 1</Text>
              <Text variant="h2">Heading 2</Text>
              <Text variant="h3">Heading 3</Text>
              <Text variant="h4">Heading 4</Text>
              <Text variant="body">Body text</Text>
              <Text variant="caption">Caption text</Text>
              <Text variant="label">Label Text</Text>
              <Text variant="body" muted>Muted text</Text>
              <Text variant="body" accent>Accent text</Text>
            </VStack>
          </Card>
        </VStack>

        <Divider />

        {/* Cards */}
        <VStack gap="md">
          <Text variant="h2">Cards</Text>

          <HStack gap="md">
            <Box flex>
              <Card variant="default" padding="md">
                <Text variant="h4">Default</Text>
                <Text variant="caption" muted>Standard card</Text>
              </Card>
            </Box>
            <Box flex>
              <Card variant="glass" padding="md">
                <Text variant="h4">Glass</Text>
                <Text variant="caption" muted>Frosted effect</Text>
              </Card>
            </Box>
          </HStack>

          <Card variant="glow" padding="md">
            <HStack gap="md" align="center">
              <Avatar fallback="BP" size="lg" />
              <VStack gap="xs">
                <Text variant="h4">Glow Card</Text>
                <Text variant="caption" muted>With accent glow border</Text>
              </VStack>
            </HStack>
          </Card>

          <Card
            variant="glass"
            padding="lg"
            pressable
            onPress={() => toast.info("Card pressed!")}
          >
            <Text variant="body">Pressable Glass Card - Tap me!</Text>
          </Card>
        </VStack>

        <Divider />

        {/* Inputs */}
        <VStack gap="md">
          <Text variant="h2">Inputs</Text>

          <Input
            label="Default Input"
            placeholder="Enter text..."
            value={inputValue}
            onChangeText={setInputValue}
          />

          <Input
            variant="glass"
            label="Glass Input"
            placeholder="Glass variant..."
          />

          <Input
            label="With Icon"
            placeholder="Search..."
            leftElement={<Ionicons name="search" size={18} color={colors.muted} />}
          />

          <Input
            label="Error State"
            placeholder="Invalid input"
            error
            errorMessage="This field is required"
          />
        </VStack>

        <Divider />

        {/* Avatars & Badges */}
        <VStack gap="md">
          <Text variant="h2">Avatars & Badges</Text>

          <VStack gap="xs">
            <Text variant="label">Avatar Sizes</Text>
            <HStack gap="md" align="center">
              <Avatar fallback="XS" size="xs" />
              <Avatar fallback="SM" size="sm" />
              <Avatar fallback="MD" size="md" />
              <Avatar fallback="LG" size="lg" />
              <Avatar fallback="XL" size="xl" />
            </HStack>
          </VStack>

          <VStack gap="xs">
            <Text variant="label">With Status</Text>
            <HStack gap="md" align="center">
              <Avatar fallback="ON" showStatus statusColor="online" />
              <Avatar fallback="OF" showStatus statusColor="offline" />
              <Avatar fallback="BS" showStatus statusColor="busy" />
              <Avatar fallback="AW" showStatus statusColor="away" />
            </HStack>
          </VStack>

          <VStack gap="xs">
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
          <Text variant="h2">Interactive</Text>

          <VStack gap="xs">
            <Text variant="label">Icon Buttons</Text>
            <HStack gap="sm">
              <IconButton
                icon={<Ionicons name="home" size={20} color={colors.foreground} />}
                label="Home"
              />
              <IconButton
                icon={<Ionicons name="search" size={20} color={colors.foreground} />}
                label="Search"
                variant="outline"
              />
              <IconButton
                icon={<Ionicons name="notifications" size={20} color={colors.foreground} />}
                label="Notifications"
                variant="glass"
              />
              <IconButton
                icon={<Ionicons name="settings" size={20} color={colors.foreground} />}
                label="Settings"
                variant="glow"
              />
              <IconButton
                icon={<Ionicons name="heart" size={20} color="#fff" />}
                label="Like"
                variant="solid"
              />
            </HStack>
          </VStack>

          <VStack gap="xs">
            <Text variant="label">Switch</Text>
            <HStack gap="lg">
              <Switch value={switchValue} onValueChange={setSwitchValue} />
              <Switch value={switchValue} onValueChange={setSwitchValue} label="Label" />
            </HStack>
          </VStack>

          <VStack gap="xs">
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
            </VStack>
          </VStack>
        </VStack>

        <Divider />

        {/* Horizontal List */}
        <VStack gap="md">
          <Text variant="h2">Horizontal List</Text>
          <HList
            data={Array.from({ length: 6 }, (_, i) => ({ id: i, name: `Item ${i + 1}` }))}
            keyExtractor={(item) => String(item.id)}
            gap="md"
            renderItem={(item) => (
              <Card variant="glass" padding="md">
                <VStack gap="sm" align="center">
                  <Avatar fallback={item.name[0]} size="lg" />
                  <Text variant="caption">{item.name}</Text>
                </VStack>
              </Card>
            )}
          />
        </VStack>

        <Divider />

        {/* Podcast Cards */}
        <VStack gap="md">
          <Text variant="h2">Podcast Cards</Text>
          <Text variant="caption" muted>
            Interactive liquid glass cards for podcasts
          </Text>

          {/* Background to show glass effect */}
          <View style={glassStyles.podcastBackground}>
            <Image
              source={{ uri: "https://picsum.photos/seed/podcast/800/400" }}
              style={StyleSheet.absoluteFill}
            />
            <View style={glassStyles.podcastRow}>
              <PodcastCard
                title="Tech Talk Daily"
                creator="Sarah Chen"
                imageUrl="https://picsum.photos/seed/pod1/400/400"
                status="live"
                isFollowing={true}
                onPress={() => toast.info("Podcast pressed")}
                onFollowPress={() => toast.success("Following!")}
              />
              <PodcastCard
                title="Design Matters"
                creator="Debbie Millman"
                imageUrl="https://picsum.photos/seed/pod2/400/400"
                status="scheduled"
                isFollowing={false}
                onPress={() => toast.info("Podcast pressed")}
                onFollowPress={() => toast.success("Following!")}
              />
            </View>
            <View style={glassStyles.podcastRow}>
              <PodcastCard
                title="The Joe Rogan Experience"
                creator="Joe Rogan"
                imageUrl="https://picsum.photos/seed/pod3/400/400"
                status="offline"
                isFollowing={true}
                onPress={() => toast.info("Podcast pressed")}
                onFollowPress={() => toast.success("Unfollowed")}
              />
              <PodcastCard
                title="Darknet Diaries"
                creator="Jack Rhysider"
                imageUrl="https://picsum.photos/seed/pod4/400/400"
                status="offline"
                isFollowing={false}
                onPress={() => toast.info("Podcast pressed")}
                onFollowPress={() => toast.success("Following!")}
              />
            </View>
          </View>
        </VStack>

        <Divider />

        {/* Loading States */}
        <VStack gap="md">
          <Text variant="h2">Loading States</Text>

          <VStack gap="xs">
            <Text variant="label">Spinner</Text>
            <HStack gap="md" align="center">
              <Spinner size="xs" />
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="xl" />
            </HStack>
          </VStack>

          <VStack gap="xs">
            <Text variant="label">Skeletons</Text>
            <Card variant="default" padding="md">
              <HStack gap="md" align="center">
                <Skeleton circle height={48} />
                <VStack gap="sm">
                  <Skeleton width={120} height={16} />
                  <Skeleton width={80} height={12} />
                </VStack>
              </HStack>
            </Card>
          </VStack>
        </VStack>

        <Divider />

        {/* Feedback */}
        <VStack gap="md">
          <Text variant="h2">Feedback</Text>

          <VStack gap="sm">
            <Text variant="label">Toast Notifications</Text>
            <HStack gap="sm" wrap>
              <Button variant="outline" size="sm" onPress={() => toast.success("Success!")}>
                Success
              </Button>
              <Button variant="outline" size="sm" onPress={() => toast.error("Error!")}>
                Error
              </Button>
              <Button variant="outline" size="sm" onPress={() => toast.warning("Warning!")}>
                Warning
              </Button>
              <Button variant="outline" size="sm" onPress={() => toast.info("Info!")}>
                Info
              </Button>
            </HStack>
          </VStack>

          <VStack gap="sm">
            <Text variant="label">Native iOS Dialogs</Text>
            <HStack gap="sm" wrap>
              <Button
                variant="outline"
                size="sm"
                onPress={() =>
                  NativeAlert.alert({
                    title: "Hello!",
                    message: "This is a native iOS alert.",
                  })
                }
              >
                Alert
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() =>
                  NativeAlert.confirm({
                    title: "Delete Item?",
                    message: "This action cannot be undone.",
                    confirmText: "Delete",
                    destructive: true,
                    onConfirm: () => toast.success("Item deleted"),
                  })
                }
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onPress={() =>
                  NativeAlert.actionSheet({
                    title: "Choose an option",
                    options: ["Share", "Edit", "Delete", "Cancel"],
                    cancelButtonIndex: 3,
                    destructiveButtonIndex: 2,
                    onSelect: (index) => {
                      if (index !== 3) {
                        toast.info(`Selected: ${["Share", "Edit", "Delete"][index]}`);
                      }
                    },
                  })
                }
              >
                Action Sheet
              </Button>
            </HStack>
          </VStack>
        </VStack>

        <Divider />

        {/* Expo Liquid Glass Primitives */}
        <VStack gap="md">
          <Text variant="h2">Expo Liquid Glass</Text>
          <Text variant="caption" muted>
            Native iOS liquid glass effects from expo-glass-effect.
            {!isLiquidGlassAvailable() && " (Not available on this device)"}
          </Text>

          {/* Colorful background to show glass effect */}
          <View style={glassStyles.backgroundContainer}>
            <Image
              source={{ uri: "https://picsum.photos/800/600" }}
              style={StyleSheet.absoluteFill}
              blurRadius={0}
            />

            <VStack gap="lg" style={glassStyles.glassContent}>
              {/* GlassView - Regular Style */}
              <VStack gap="xs">
                <Text variant="label">GlassView - Regular</Text>
                <ExpoGlassView style={glassStyles.glassCard}>
                  <Text variant="body" weight="semibold">Regular Glass</Text>
                  <Text variant="caption" muted>Default glass effect style</Text>
                </ExpoGlassView>
              </VStack>

              {/* GlassView - Clear Style */}
              <VStack gap="xs">
                <Text variant="label">GlassView - Clear</Text>
                <ExpoGlassView glassEffectStyle="clear" style={glassStyles.glassCard}>
                  <Text variant="body" weight="semibold">Clear Glass</Text>
                  <Text variant="caption" muted>More transparent variant</Text>
                </ExpoGlassView>
              </VStack>

              {/* GlassView - With Tint Colors */}
              <VStack gap="xs">
                <Text variant="label">GlassView - Tinted</Text>
                <HStack gap="sm">
                  <ExpoGlassView tintColor="#3b82f6" style={glassStyles.tintedCard}>
                    <Text variant="caption">Blue</Text>
                  </ExpoGlassView>
                  <ExpoGlassView tintColor="#22c55e" style={glassStyles.tintedCard}>
                    <Text variant="caption">Green</Text>
                  </ExpoGlassView>
                  <ExpoGlassView tintColor="#ef4444" style={glassStyles.tintedCard}>
                    <Text variant="caption">Red</Text>
                  </ExpoGlassView>
                  <ExpoGlassView tintColor="#a855f7" style={glassStyles.tintedCard}>
                    <Text variant="caption">Purple</Text>
                  </ExpoGlassView>
                </HStack>
              </VStack>

              {/* GlassView - Interactive */}
              <VStack gap="xs">
                <Text variant="label">GlassView - Interactive</Text>
                <ExpoGlassView isInteractive style={glassStyles.glassCard}>
                  <Text variant="body" weight="semibold">Interactive Glass</Text>
                  <Text variant="caption" muted>Responds to touch/hover</Text>
                </ExpoGlassView>
              </VStack>

              {/* GlassContainer - Merging Effect */}
              <VStack gap="xs">
                <Text variant="label">GlassContainer - Merging</Text>
                <Text variant="caption" muted>Glass elements merge when close</Text>
                <GlassContainer spacing={20} style={glassStyles.glassContainer}>
                  <ExpoGlassView style={glassStyles.mergeCard}>
                    <Text variant="caption">Card 1</Text>
                  </ExpoGlassView>
                  <ExpoGlassView style={glassStyles.mergeCard}>
                    <Text variant="caption">Card 2</Text>
                  </ExpoGlassView>
                  <ExpoGlassView style={glassStyles.mergeCard}>
                    <Text variant="caption">Card 3</Text>
                  </ExpoGlassView>
                </GlassContainer>
              </VStack>
            </VStack>
          </View>

          {/* Platform Info */}
          <Card variant="default" padding="md">
            <VStack gap="xs">
              <Text variant="label">Platform Info</Text>
              <Text variant="caption" muted>
                Platform: {Platform.OS} {Platform.Version}
              </Text>
              <Text variant="caption" muted>
                Liquid Glass Available: {isLiquidGlassAvailable() ? "Yes" : "No"}
              </Text>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    </>
  );
}

const glassStyles = StyleSheet.create({
  backgroundContainer: {
    borderRadius: 20,
    overflow: "hidden",
    height: 700,
  },
  glassContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-around",
  },
  glassCard: {
    padding: 16,
    borderRadius: 16,
    gap: 4,
  },
  tintedCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  glassContainer: {
    flexDirection: "row",
    gap: 8,
  },
  mergeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  podcastBackground: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 16,
    gap: 16,
  },
  podcastRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
});

import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../lib/theme";

export default function TabLayout() {
  const { colors, accentColor } = useTheme();

  // Use native tabs on iOS for liquid glass
  // Key forces re-mount when accent color changes since NativeTabs caches tintColor
  if (Platform.OS === "ios") {
    return (
      <NativeTabs key={accentColor} tintColor={colors.accent.main}>
        <NativeTabs.Trigger name="index">
          <Icon sf="house.fill" />
          <Label>Home</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="explore">
          <Icon sf="safari.fill" />
          <Label>Explore</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="following">
          <Icon sf="person.2.fill" />
          <Label>Following</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="search">
          <Icon sf="magnifyingglass" />
          <Label>Search</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // Android fallback
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent.main,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="following"
        options={{
          title: "Following",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

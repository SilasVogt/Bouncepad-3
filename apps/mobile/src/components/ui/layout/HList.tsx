import { ScrollView, View, StyleSheet } from "react-native";
import type { HListProps, Spacing } from "@bouncepad/shared";

const gapMap: Record<Spacing, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

const paddingMap: Record<Spacing, number> = gapMap;

export function HList<T>({
  data,
  renderItem,
  keyExtractor,
  gap = "md",
  contentPadding = "none",
  showsScrollIndicator = false,
  snap = false,
}: HListProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={showsScrollIndicator}
      contentContainerStyle={[
        styles.container,
        {
          gap: gapMap[gap],
          paddingHorizontal: paddingMap[contentPadding],
        },
      ]}
      snapToAlignment={snap ? "start" : undefined}
      decelerationRate={snap ? "fast" : undefined}
    >
      {data.map((item, index) => (
        <View key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem(item, index)}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});

import { FlatList, View, RefreshControl, type ListRenderItem } from "react-native";
import type { VListProps, Spacing } from "@bouncepad/shared";
import { useTheme } from "../../../lib/theme";

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

export function VList<T>({
  data,
  renderItem,
  keyExtractor,
  gap = "md",
  contentPadding = "none",
  header,
  footer,
  emptyComponent,
  onRefresh,
  refreshing = false,
  onEndReached,
}: VListProps<T>) {
  const { colors } = useTheme();

  const flatListRenderItem: ListRenderItem<T> = ({ item, index }) => (
    <View>{renderItem(item, index)}</View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={flatListRenderItem}
      contentContainerStyle={{
        gap: gapMap[gap],
        padding: paddingMap[contentPadding],
      }}
      ListHeaderComponent={header ? () => <View>{header}</View> : undefined}
      ListFooterComponent={footer ? () => <View>{footer}</View> : undefined}
      ListEmptyComponent={emptyComponent ? () => <View>{emptyComponent}</View> : undefined}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.main}
          />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
}

import type { HListProps } from "@bouncepad/shared";

const gapClasses = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12",
};

const paddingClasses = {
  none: "px-0",
  xs: "px-1",
  sm: "px-2",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
  "2xl": "px-12",
};

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
    <div
      className={`
        flex overflow-x-auto
        ${gapClasses[gap]}
        ${paddingClasses[contentPadding]}
        ${showsScrollIndicator ? "" : "scrollbar-hide"}
        ${snap ? "snap-x snap-mandatory" : ""}
      `}
      style={{
        scrollbarWidth: showsScrollIndicator ? "auto" : "none",
        msOverflowStyle: showsScrollIndicator ? "auto" : "none",
      }}
    >
      {data.map((item, index) => (
        <div
          key={keyExtractor ? keyExtractor(item, index) : index}
          className={`shrink-0 ${snap ? "snap-start" : ""}`}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

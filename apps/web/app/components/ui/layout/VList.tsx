import type { VListProps } from "@bouncepad/shared";

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
  none: "p-0",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12",
};

export function VList<T>({
  data,
  renderItem,
  keyExtractor,
  gap = "md",
  contentPadding = "none",
  header,
  footer,
  emptyComponent,
}: VListProps<T>) {
  if (data.length === 0 && emptyComponent) {
    return <>{emptyComponent}</>;
  }

  return (
    <div
      className={`
        flex flex-col overflow-y-auto
        ${gapClasses[gap]}
        ${paddingClasses[contentPadding]}
      `}
    >
      {header}
      {data.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem(item, index)}
        </div>
      ))}
      {footer}
    </div>
  );
}

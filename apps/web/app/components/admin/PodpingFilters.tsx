import { Search } from "lucide-react";

export type ReasonFilter = "live+liveEnd" | "live" | "liveEnd" | "update" | "all";
export type SearchType = "feedUrl" | "blockNumber";

interface PodpingFiltersProps {
  reasonFilter: ReasonFilter;
  onReasonFilterChange: (filter: ReasonFilter) => void;
  searchType: SearchType;
  onSearchTypeChange: (type: SearchType) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
}

const REASON_OPTIONS: { value: ReasonFilter; label: string }[] = [
  { value: "live+liveEnd", label: "Live + LiveEnd" },
  { value: "live", label: "Live" },
  { value: "liveEnd", label: "LiveEnd" },
  { value: "update", label: "Update" },
  { value: "all", label: "All" },
];

export function PodpingFilters({
  reasonFilter,
  onReasonFilterChange,
  searchType,
  onSearchTypeChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
}: PodpingFiltersProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Reason filter dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="reason-filter" className="text-sm text-[var(--muted)] font-medium">
          Filter:
        </label>
        <select
          id="reason-filter"
          value={reasonFilter}
          onChange={(e) => onReasonFilterChange(e.target.value as ReasonFilter)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] transition-colors"
        >
          {REASON_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search type toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-1">
        <button
          onClick={() => onSearchTypeChange("feedUrl")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            searchType === "feedUrl"
              ? "bg-[var(--accent-main)] text-white"
              : "hover:bg-[var(--border)]"
          }`}
        >
          Feed URL
        </button>
        <button
          onClick={() => onSearchTypeChange("blockNumber")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            searchType === "blockNumber"
              ? "bg-[var(--accent-main)] text-white"
              : "hover:bg-[var(--border)]"
          }`}
        >
          Block #
        </button>
      </div>

      {/* Search input */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-[var(--muted)]" />
          </div>
          <input
            type={searchType === "blockNumber" ? "number" : "text"}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              searchType === "feedUrl"
                ? "Search by feed URL..."
                : "Enter block number..."
            }
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-main)] transition-colors"
          />
        </div>
        <button
          onClick={onSearch}
          disabled={!searchQuery.trim()}
          className="px-4 py-2 rounded-lg bg-[var(--accent-main)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:motion-preset-wiggle"
        >
          Search
        </button>
        {searchQuery && (
          <button
            onClick={() => {
              onSearchQueryChange("");
              onSearch();
            }}
            className="px-3 py-2 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--border)] transition-colors motion-preset-fade"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

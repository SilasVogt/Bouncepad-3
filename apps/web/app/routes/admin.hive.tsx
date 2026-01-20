import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useUser, SignInButton, SignedIn, SignedOut, ClerkLoaded } from "@clerk/tanstack-start";
import { useQuery } from "convex/react";
import { api } from "@bouncepad/backend/convex/_generated/api";
import { HiveSyncStatus } from "~/components/admin/HiveSyncStatus";
import { PodpingFilters, type ReasonFilter, type SearchType } from "~/components/admin/PodpingFilters";
import { PodpingTable } from "~/components/admin/PodpingTable";

export const Route = createFileRoute("/admin/hive")({
  component: AdminHivePage,
});

function AdminHivePage() {
  return (
    <ClerkLoaded>
      <AdminHiveContent />
    </ClerkLoaded>
  );
}

function AdminHiveContent() {
  const { user, isLoaded } = useUser();

  // Admin check
  const isAdmin = useQuery(
    api.users.isAdmin,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Filter state
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>("live+liveEnd");
  const [searchType, setSearchType] = useState<SearchType>("feedUrl");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState<{ type: SearchType; query: string } | null>(null);

  // Sync status query
  const syncStatus = useQuery(api.hive.getHiveSyncStatus);

  // Conditional queries based on search state
  const listResult = useQuery(
    api.hive.listPodpingHistories,
    !activeSearch ? { reason: reasonFilter, limit: 50 } : "skip"
  );

  const feedUrlSearchResult = useQuery(
    api.hive.searchPodpingsByFeedUrl,
    activeSearch?.type === "feedUrl" && activeSearch.query
      ? { feedUrl: activeSearch.query, limit: 50 }
      : "skip"
  );

  const blockNumberSearchResult = useQuery(
    api.hive.getPodpingsByBlockNumber,
    activeSearch?.type === "blockNumber" && activeSearch.query
      ? { blockNumber: parseInt(activeSearch.query, 10), limit: 50 }
      : "skip"
  );

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setActiveSearch({ type: searchType, query: searchQuery.trim() });
    } else {
      setActiveSearch(null);
    }
  }, [searchQuery, searchType]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setActiveSearch(null);
  }, []);

  // Determine which items to display
  let displayItems: typeof listResult extends { items: infer T } ? T : never = [];
  let isSearching = false;

  if (activeSearch) {
    isSearching = true;
    if (activeSearch.type === "feedUrl" && feedUrlSearchResult) {
      displayItems = feedUrlSearchResult.items;
    } else if (activeSearch.type === "blockNumber" && blockNumberSearchResult) {
      displayItems = blockNumberSearchResult.items;
    }
  } else if (listResult) {
    displayItems = listResult.items;
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-main)] border-t-transparent"></div>
      </div>
    );
  }

  // Not signed in
  return (
    <>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 motion-preset-fade">
          <h1 className="text-2xl font-bold motion-preset-slide-down">Admin Access Required</h1>
          <p className="text-[var(--muted)] motion-preset-fade motion-delay-100">Please sign in to access this page.</p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-[var(--accent-main)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity motion-preset-pop motion-delay-200">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        {isAdmin === false && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 motion-preset-shake">
            <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
            <p className="text-[var(--muted)]">You do not have admin access to view this page.</p>
          </div>
        )}

        {isAdmin === true && (
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="motion-preset-slide-down">
              <h1 className="text-3xl font-bold">Hive Sync Dashboard</h1>
              <p className="text-[var(--muted)] mt-1">
                Monitor Hive blockchain sync status and browse podping events
              </p>
            </div>

            {/* Sync Status */}
            <section className="motion-preset-slide-up motion-delay-100">
              <h2 className="text-xl font-semibold mb-4">Sync Status</h2>
              <HiveSyncStatus
                syncState={syncStatus?.syncState ?? null}
                blocksBehind={syncStatus?.blocksBehind ?? 0}
              />
            </section>

            {/* Podping Events */}
            <section className="motion-preset-slide-up motion-delay-200">
              <h2 className="text-xl font-semibold mb-4">Podping Events</h2>

              {/* Filters */}
              <div className="mb-4">
                <PodpingFilters
                  reasonFilter={reasonFilter}
                  onReasonFilterChange={(filter) => {
                    setReasonFilter(filter);
                    setActiveSearch(null);
                  }}
                  searchType={searchType}
                  onSearchTypeChange={setSearchType}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  onSearch={handleSearch}
                />
              </div>

              {/* Search indicator */}
              {activeSearch && (
                <div className="mb-4 flex items-center gap-2 text-sm motion-preset-fade">
                  <span className="text-[var(--muted)]">
                    Searching {activeSearch.type === "feedUrl" ? "feed URLs" : "block"} for:
                  </span>
                  <span className="font-mono bg-[var(--border)] px-2 py-0.5 rounded motion-preset-pop">
                    {activeSearch.query}
                  </span>
                  <button
                    onClick={handleClearSearch}
                    className="text-[var(--accent-main)] hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Table */}
              <PodpingTable
                items={displayItems}
                isLoading={
                  (!activeSearch && !listResult) ||
                  (activeSearch?.type === "feedUrl" && !feedUrlSearchResult) ||
                  (activeSearch?.type === "blockNumber" && !blockNumberSearchResult)
                }
                hasMore={!isSearching && listResult?.hasMore}
              />
            </section>
          </div>
        )}

        {/* Loading admin status */}
        {isAdmin === undefined && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-main)] border-t-transparent"></div>
          </div>
        )}
      </SignedIn>
    </>
  );
}

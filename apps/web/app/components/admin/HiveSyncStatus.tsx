import type { Doc } from "@bouncepad/backend/convex/_generated/dataModel";

interface HiveSyncStatusProps {
  syncState: Doc<"hive_sync"> | null;
  blocksBehind: number;
}

export function HiveSyncStatus({ syncState, blocksBehind }: HiveSyncStatusProps) {
  if (!syncState) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 motion-preset-fade">
        <p className="text-[var(--muted)]">No sync state found. Hive sync has not been initialized.</p>
      </div>
    );
  }

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "—";
    return num.toLocaleString();
  };

  const formatTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleString();
  };

  const cards = [
    {
      label: "Head Block",
      value: formatNumber(syncState.lastKnownHeadBlock),
      subtext: `Updated ${formatTimestamp(syncState.lastFetchedAt)}`,
    },
    {
      label: "Last Processed",
      value: formatNumber(syncState.lastParsedBlock),
      subtext: `Total: ${formatNumber(syncState.totalBlocksProcessed)} blocks`,
    },
    {
      label: "Blocks Behind",
      value: formatNumber(blocksBehind),
      subtext: blocksBehind > 100 ? "Catching up..." : "Up to date",
      highlight: blocksBehind > 100,
    },
    {
      label: "Last Batch Podpings",
      value: formatNumber(syncState.lastBatchPodpingCount),
      subtext: `Total: ${formatNumber(syncState.totalPodpingsFound)} events`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status indicator - always visible to prevent layout shift */}
      <div className="flex items-center gap-2 h-6">
        {syncState.isRunning ? (
          <>
            <span className="relative flex h-3 w-3 motion-preset-blink motion-duration-1000">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              Syncing...
            </span>
          </>
        ) : (
          <>
            <span className="relative flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--muted)]"></span>
            </span>
            <span className="text-sm text-[var(--muted)] font-medium">
              Waiting
            </span>
          </>
        )}
      </div>

      {/* Error banner */}
      {syncState.lastError && (
        <div className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 motion-preset-shake">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Sync Error (Count: {syncState.errorCount ?? 1})
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400 font-mono">
                {syncState.lastError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className={`rounded-xl border p-4 transition-colors motion-preset-slide-up motion-opacity-in-0 ${
              card.highlight
                ? "border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20"
                : "border-[var(--border)] bg-[var(--background)]"
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <p className="text-sm text-[var(--muted)] font-medium">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
            <p className="text-xs text-[var(--muted)] mt-1">{card.subtext}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

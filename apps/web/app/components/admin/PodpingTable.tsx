import { useState } from "react";
import { Check, Clock, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { Doc } from "@bouncepad/backend/convex/_generated/dataModel";

interface PodpingTableProps {
  items: Doc<"podping_histories">[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

function ReasonBadge({ reason }: { reason: string }) {
  const colorClasses = {
    live: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    liveEnd: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    update: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };

  const classes = colorClasses[reason as keyof typeof colorClasses] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes} motion-preset-pop`}>
      {reason}
    </span>
  );
}

function StatusBadge({ processed }: { processed?: boolean }) {
  if (processed) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
        <Check className="h-4 w-4" />
        <span className="text-xs">Processed</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400 motion-preset-pulse motion-duration-1000">
      <Clock className="h-4 w-4" />
      <span className="text-xs">Pending</span>
    </span>
  );
}

function FeedUrlsList({ urls }: { urls: string[] }) {
  const [expanded, setExpanded] = useState(false);
  const MAX_VISIBLE = 2;

  if (urls.length === 0) {
    return <span className="text-[var(--muted)] text-sm">No URLs</span>;
  }

  const displayUrls = expanded ? urls : urls.slice(0, MAX_VISIBLE);
  const hasMore = urls.length > MAX_VISIBLE;

  return (
    <div className="space-y-1">
      {displayUrls.map((url, idx) => (
        <a
          key={idx}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-[var(--accent-main)] hover:underline truncate max-w-xs"
          title={url}
        >
          {url}
        </a>
      ))}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              +{urls.length - MAX_VISIBLE} more
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function PodpingTable({ items, isLoading, hasMore, onLoadMore }: PodpingTableProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (items.length === 0 && !isLoading) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-8 text-center motion-preset-fade">
        <p className="text-[var(--muted)]">No podping events found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--border)] overflow-hidden motion-preset-fade">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--border)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Block #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Feed URLs
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--background)]">
              {items.map((item, index) => (
                <tr
                  key={item._id}
                  className="hover:bg-[var(--border)]/50 transition-colors motion-preset-slide-up motion-opacity-in-0"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href={`https://hiveblocks.com/b/${item.blockNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-mono text-[var(--accent-main)] hover:underline"
                    >
                      {item.blockNumber.toLocaleString()}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ReasonBadge reason={item.reason} />
                  </td>
                  <td className="px-4 py-3">
                    <FeedUrlsList urls={item.feedUrls} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge processed={item.processed} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--muted)]">
                    {formatDate(item.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--accent-main)] border-t-transparent"></div>
        </div>
      )}

      {/* Load more button */}
      {hasMore && !isLoading && onLoadMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="px-6 py-2 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--border)] transition-colors motion-preset-bounce hover:motion-preset-wiggle"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

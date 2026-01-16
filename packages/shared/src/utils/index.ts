// Date formatting utilities
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

// Stream URL utilities
export function isValidStreamUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidRssFeedUrl(url: string): boolean {
  if (!isValidStreamUrl(url)) return false;
  // Basic RSS feed URL validation
  return url.includes("rss") || url.includes("feed") || url.endsWith(".xml");
}

// String utilities
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

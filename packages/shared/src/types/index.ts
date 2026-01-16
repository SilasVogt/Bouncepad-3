// User types
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  imageUrl?: string;
  createdAt: number;
}

// Feed types
export interface Feed {
  id: string;
  userId: string;
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
  lastFetched?: number;
  createdAt: number;
}

// Stream types
export interface Stream {
  id: string;
  feedId: string;
  title: string;
  description?: string;
  streamUrl: string;
  thumbnailUrl?: string;
  isLive: boolean;
  startedAt?: number;
  endedAt?: number;
  createdAt: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

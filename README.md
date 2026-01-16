# Bouncepad

RSS-based livestreaming platform.

## Tech Stack

- **Web App**: TanStack Start + Tailwind CSS 4 + tailwind-motion
- **Mobile App**: Expo + Uniwind
- **Backend**: Convex
- **Auth**: Clerk
- **Package Manager**: Bun

## Project Structure

```
bouncepad/
├── apps/
│   ├── web/          # TanStack Start web application
│   └── mobile/       # Expo mobile application
├── packages/
│   ├── backend/      # Convex backend (schema, functions)
│   └── shared/       # Shared utilities, types, and hooks
└── package.json      # Root workspace configuration
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- [Clerk](https://clerk.com) account for authentication
- [Convex](https://convex.dev) account for backend

### Installation

```bash
bun install
```

### Environment Setup

Copy the environment example files and fill in your values:

```bash
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
```

Required environment variables:

**Root `.env`:**
- `CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `CONVEX_DEPLOYMENT` - Convex deployment name
- `VITE_CONVEX_URL` - Convex URL for the web app

**Mobile `.env`:**
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `EXPO_PUBLIC_CONVEX_URL` - Convex URL

### Development

Start the Convex backend:

```bash
bun run dev:backend
```

Start the web app:

```bash
bun run dev:web
```

Start the mobile app:

```bash
bun run dev:mobile
```

## License

MIT

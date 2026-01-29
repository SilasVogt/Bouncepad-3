# Bouncepad Development Guidelines

## Git Workflow & Branching Strategy

**IMPORTANT**: Claude must follow this branching workflow strictly.

### Branch Structure

| Branch | Purpose | Deployment | Environment |
|--------|---------|------------|-------------|
| `feature/*` | Active development | Preview deployments on Cloudflare Workers (on push) | Dev keys |
| `develop` | Default branch, integration | Cloudflare Workers (admin-only, behind login) | Convex dev + Clerk test keys |
| `preview` | Tested features for premium users | preview.bouncepad.live | Clerk production keys |
| `main` | Production | bouncepad.live | Full production |

### Workflow Rules

1. **Always use feature branches** for new work. Never commit directly to `develop`, `preview`, or `main`.

2. **Before starting any new feature or topic**:
   - Ensure current work is committed and pushed
   - Create a new branch: `git checkout -b feature/descriptive-name`

3. **When the user switches topics without creating a new branch**, Claude MUST remind them:
   > "Before we switch to this new topic, let's commit and push your current changes and create a new feature branch. What should we name this feature?"

4. **PR Flow**:
   - Feature branches → PR to `develop` (reviewed by CodeRabbit/Greptile)
   - Multiple tested features in `develop` → PR to `preview`
   - Stable `preview` → PR to `main`

5. **Commit frequently** with meaningful messages. Don't let work pile up uncommitted.

### Current Feature Tracking

When the user tells Claude what feature they're working on, Claude should:
- Confirm they're on the correct feature branch
- Remember the feature context throughout the session
- Prompt to commit/push before ending session or switching contexts

---

## UI Component System

**IMPORTANT**: Always use the established UI component library. Do NOT create inline components or use raw HTML/Tailwind when a component exists.

### Importing Components

```tsx
import {
  // Primitives
  Button,
  Text,
  Input,
  Card,
  Avatar,
  Badge,
  Skeleton,
  // Layout
  VStack,
  HStack,
  Stack,
  Box,
  Divider,
  HList,
  VList,
  Dock,
  // Interactive
  IconButton,
  Switch,
  Tabs,
  // Feedback
  Spinner,
  Toast,
  ToastProvider,
  useToast,
  Modal,
} from "~/components/ui";
```

### Component Reference

**Primitives** (`apps/web/app/components/ui/primitives/`):
- `Button` - variants: solid, outline, ghost, glass, glow | sizes: xs, sm, md, lg, xl
- `Text` - variants: display, h1, h2, h3, h4, body, caption, label | props: muted, accent, weight, numberOfLines
- `Input` - variants: default, glass | props: label, error, errorMessage, leftElement
- `Card` - variants: default, glass, glow | glassIntensity: subtle, medium, strong | props: padding, radius, pressable
- `Avatar` - sizes: xs, sm, md, lg, xl | props: src, fallback, showStatus, statusColor
- `Badge` - variants: default, outline, glass | sizes: sm, md
- `Skeleton` - props: width, height, circle, radius

**Layout** (`apps/web/app/components/ui/layout/`):
- `VStack` / `HStack` / `Stack` - gap: xs, sm, md, lg, xl | align, justify, wrap
- `Box` - basic container with flex, padding props
- `Divider` - horizontal/vertical separator
- `HList` / `VList` - horizontal/vertical scrolling lists with renderItem pattern
- `Dock` - floating glass container

**Interactive** (`apps/web/app/components/ui/interactive/`):
- `IconButton` - same variants as Button, icon-only
- `Switch` - toggle with optional label
- `Tabs` - variants: default, pills, underline

**Feedback** (`apps/web/app/components/ui/feedback/`):
- `Spinner` - sizes: xs, sm, md, lg, xl
- `Modal` - props: visible, onClose, title, footer
- `Toast` / `useToast` - toast.success(), toast.error(), toast.warning(), toast.info()

### Design System Principles

1. **Glass Aesthetic**: Use glass variants for overlays and secondary surfaces. Cards default to glass.

2. **Accent Colors**: The theme system handles accent colors via CSS variables. Components automatically use:
   - `var(--accent-main)` - primary accent color
   - `var(--accent-light)` / `var(--accent-dark)` - lighter/darker shades
   - `var(--accent-text)` - contrasting text color (white or black based on accent)

3. **Responsive Text Colors**:
   - Solid buttons/badges use `var(--accent-text)` for proper contrast
   - Transparent variants (outline, glass, glow, ghost) use `var(--foreground)`

4. **Layout**: Use `VStack`/`HStack` with gap props instead of manual margin/padding.

### Example Usage

```tsx
// Good - using design system components
<Card variant="glass" padding="lg">
  <VStack gap="md">
    <Text variant="h3">Title</Text>
    <Text variant="body" muted>Description</Text>
    <HStack gap="sm">
      <Button variant="solid" onPress={handleSave}>Save</Button>
      <Button variant="ghost" onPress={handleCancel}>Cancel</Button>
    </HStack>
  </VStack>
</Card>

// Bad - inline styling
<div className="p-6 rounded-lg bg-white/10 backdrop-blur">
  <h3 className="text-xl font-bold">Title</h3>
  <p className="text-gray-500">Description</p>
  <div className="flex gap-2">
    <button className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
  </div>
</div>
```

### Showcase Page

Visit `/showcase` to see all components rendered with current theme settings. This page demonstrates correct usage patterns.

## Project Structure

```
apps/
  web/                    # TanStack Start web app
    app/
      components/
        ui/               # UI component library (USE THESE!)
          primitives/     # Button, Text, Input, Card, Avatar, Badge, Skeleton
          layout/         # VStack, HStack, Box, Divider, HList, VList, Dock
          interactive/    # IconButton, Switch, Tabs
          feedback/       # Spinner, Toast, Modal
          glass.css       # Glass effect CSS utilities
        AccentColorPicker.tsx
        Navigation.tsx
      lib/
        theme.tsx         # Theme context and providers
        providers.tsx     # App providers (Clerk, Convex, Theme)
      routes/             # TanStack file-based routes
  mobile/                 # React Native Expo app

packages/
  backend/                # Convex backend
    convex/
      schema.ts           # Database schema
      *.ts                # Queries and mutations
  shared/                 # Shared types and utilities
    src/
      theme/colors.ts     # Accent colors and theme utilities
      types/              # Shared TypeScript types
```

## Key Technologies

- **Frontend**: TanStack Start (React + TanStack Router)
- **Backend**: Convex (real-time database)
- **Auth**: Clerk
- **Styling**: Tailwind CSS + custom glass effects
- **Mobile**: React Native with Expo
